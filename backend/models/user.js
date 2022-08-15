const crypto = require('crypto');

const RESET_PASSWORD_CODE_LENGTH = 128; // should be divided by 2
const RESET_PASSWORD_CODE_EXPIRE_IN = 60*60*1000; // 1 hour
const PASSWORD_MIN_LENGTH = 6;
const PASSWORD_PBKDF2_STEPS = 1000;

module.exports = function(mongoose, connection, db) {
    var modelName = 'User';
    var schema = mongoose.Schema({
        username: {
            type: String,
            unique: true,
            required: true,
            minLength: 2,
        },
        email: {
            type: String,
            unique: true,
            required: true,
            validate: {
                validator: function(v) {
                    return /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(v);
                },
                message: props => `${props.value} is not a valid email!`
            },
        },
        confirmEmailCode: {type: String, default: null},
        level: {type: String, default: 'user'},
        password: String,
        isActive: {type: Boolean, default: false},

        resetPasswordCode: String,
        resetPasswordAt: Date,
    },
    { collection: 'users' });

    schema.index({'$**': 'text'});

    // schema.virtual('test').get(function () {  resturn 'test';  });  //// - item.test (available both on backend and on UI side)
    // schema.statics.getActive = function() {   };         ///// - db.Size.getActive()
    // schema.methods.updateSomething = function() {   };   ///// - item.updateSomething()
    //                                                      ///// more: http://mongoosejs.com/docs/guide.html

    schema.virtual('domain').get(function() {
        return this.email.slice(this.email.indexOf('@') + 1);
    }).set(function(value) {
        this.email = '@'+value;
    });

    schema.statics.getPossibleLevels = function() {
        return ['superadmin', 'admin', 'user', 'guest'];
    }

    schema.methods.hashPassword = async function(password) {
        const salt = ''+this._id;
        const hashed = await new Promise((res,rej)=>{
            crypto.pbkdf2(password, salt, PASSWORD_PBKDF2_STEPS, 64, 'sha512', (err, derivedKey) => {
                if (err) {
                    return rej(err);
                }
                res(derivedKey.toString('hex'));
            });
        });

        return hashed;
    }

    schema.methods.resetPassword = async function() {
        const code = await new Promise((res, rej)=>{
            crypto.randomBytes(RESET_PASSWORD_CODE_LENGTH / 2, function(err, buffer) {
                if (err) {
                    return rej(err);
                }

                res(buffer.toString('hex'));
            });
        });

        this.resetPasswordCode = code;
        this.resetPasswordAt = new Date();

        await this.save();

        return code;
    };

    schema.methods.setPassword = async function(resetPasswordCode, password) {
        if (!this.resetPasswordCode || this.resetPasswordCode.length != RESET_PASSWORD_CODE_LENGTH) {
            return false;
        }
        if (this.resetPasswordCode != resetPasswordCode) {
            return false;
        }
        if (!this.resetPasswordAt || Math.abs(this.resetPasswordAt.getTime() - (new Date()).getTime()) > RESET_PASSWORD_CODE_EXPIRE_IN) {
            return false;
        }
        if (!password || password.length < PASSWORD_MIN_LENGTH) {
            return false;
        }

        try {
            const hashed = await this.hashPassword(password);
            this.password = hashed;
            this.resetPasswordCode = null;

            await this.save();

            return true;
        } catch(e) {
            return false;
        }
    };

    schema.methods.isValidPassword = async function(password) {
        try {
            const hashed = await this.hashPassword(password);
            if (hashed == this.password) {
                return true;
            }
            return false;
        } catch(e) {
            return false;
        }
    }

    schema.statics.byId = async function(id) {
        return await db.User.findOne({_id: id}).exec();
    }

    schema.statics.byUsername = async function(username) {
        return await db.User.findOne({username: username}).exec();
    }

    schema.statics.byAuthCode = async function(authCode) {
        let userAuth = await db.UserAuth.findOne({authCode: authCode}).populate('user').exec();
        if (userAuth && userAuth.user) {
            return userAuth.user;
        } else {
            return null;
        }
    }

    schema.methods.storeAuthCode = async function(authCode) {
        const userAuth = new db.UserAuth;
        userAuth.authCode = authCode;
        userAuth.user = this;

        await userAuth.save();
    }


    /**
     * Get list of levels current user has access to (lower than this user's level)
     * @return {Array} array of strings with level ids
     */
    schema.methods.getAvailableAccessLevels = function() {
        const possibleLevels = db.User.getPossibleLevels();
        return possibleLevels.filter((level)=>(this.hasLevelOf(level)));
    };

    schema.methods.isLevelGreaterThan = function(level) {
        if (!this.level) {
            return false;
        }
        const possibleLevels = db.User.getPossibleLevels();
        const levelIndex = possibleLevels.indexOf(level);
        const userLevelIndex = possibleLevels.indexOf(this.level);
        if (levelIndex === -1 || userLevelIndex === -1) {
            return false;
        } else if (levelIndex > userLevelIndex) {
            return true;
        }
        return false;
    };

    schema.methods.hasLevelOf = function(level) {
        if (!this.level) {
            return false;
        }
        const possibleLevels = db.User.getPossibleLevels();
        const levelIndex = possibleLevels.indexOf(level);
        const userLevelIndex = possibleLevels.indexOf(this.level);
        if (levelIndex === -1 || userLevelIndex === -1) {
            return false;
        } else if (levelIndex >= userLevelIndex) {
            return true;
        }
        return false;
    };

    schema.statics.onListQuery = async function(query, request) {
        if (!request.user.hasLevelOf('admin')) {
            throw new Error('You dont have rights to list for this path');
        }
    }

    schema.methods.apiValues = function(request) {
        const response = this.toObject();
        response.password = undefined;
        response.resetPasswordCode = undefined;
        response.resetPasswordAt = undefined;
        response.confirmEmailCode = undefined;

        response.__modelName = 'User';

        if (request?.user && request.user._id.equals(this.id)) {
            response.isMe = true;
        } else if (!request?.user?.hasLevelOf('admin')) {
            // hide other users data from all users who are not admins
            response.email = undefined;
            response.level = undefined;
        }

        return response;
    }

    schema.statics.apiPost = async function(data, request) {
        /// this points to model (schema.statics.)
        if (data.level && !request.user.isLevelGreaterThan(data.level)) {
            throw new Error('You dont have rights to assign such a high access level');
        }

        // not editable fields
        delete data.password;
        delete data.resetPasswordCode;
        delete data.resetPasswordAt;

        /// generate password
        const randomPassword = await new Promise((res, rej)=>{
            crypto.randomBytes(RESET_PASSWORD_CODE_LENGTH / 2, function(err, buffer) {
                if (err) {
                    return rej(err);
                }

                res(buffer.toString('hex'));
            });
        });

        let doc = new this;

        this.schema.eachPath((pathname) => {
            if (data[pathname] !== undefined) {
                doc[pathname] = data[pathname];
            }
        });

        try {
            await doc.save();

            const hashed = await doc.hashPassword(randomPassword);
            doc.password = hashed;
            await doc.save();
        } catch(e) {
            try {
                doc.remove();
            } catch(e2) {
                console.log(e2);
            }

            throw e;
        }


        return doc;
    }

    /**
     * [apiPut description]
     * @param  Object data [description]
     * @return Document      [description]
     */
    schema.methods.apiPut = async function(data, request) {
        //// this points to document (schema.methods.)
        ///
        if (data.level && !request.user.isLevelGreaterThan(data.level)) {
            throw new Error('You dont have rights to assign such a high access level');
        }
        if (!request.user.isLevelGreaterThan(this.level)) {
            throw new Error('You dont have rights to edit user with such a high access level');
        }
        if (request.user._id.equals(this._id)) {
            delete data.level; // can not edit your own level
        }

        // not editable fields
        delete data.password;
        delete data.resetPasswordCode;
        delete data.resetPasswordAt;

        ///
        this.schema.eachPath((pathname) => {
            if (data[pathname] !== undefined) {
                this[pathname] = data[pathname];
            } else if (data[pathname] === null) {
                this[pathname] = undefined;
            }
        });

        await this.save();
    }

    /**
     * [apiDelete description]
     * @return Boolean  success
     */
    schema.methods.apiDelete = async function() {
        throw new Error('Default REST Delete is not available for this route');
    }

    var model = connection.model(modelName, schema);
    return {
        'modelName': modelName,
        'model': model
    };
};