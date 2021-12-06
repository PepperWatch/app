

module.exports = function(mongoose, connection, db) {
    var modelName = 'User';
    var schema = mongoose.Schema({
        username: String,
        password: String,
        isActive: {type: Boolean, default: false}
    },
    { collection: 'users' });


    // schema.virtual('APIValues').get(function () {    });  //// - item.APIValues
    // schema.statics.getActive = function() {   };         ///// - db.Size.getActive()
    // schema.methods.updateSomething = function() {   };   ///// - item.updateSomething()
    //                                                      ///// more: http://mongoosejs.com/docs/guide.html

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

    schema.methods.apiValues = function() {
        const response = this.toObject();
        response.password = undefined;

        return response;
    }

    schema.methods.storeAuthCode = async function(authCode) {
        const userAuth = new db.UserAuth;
        userAuth.authCode = authCode;
        userAuth.user = this;

        await userAuth.save();
    }

    var model = connection.model(modelName, schema);
    return {
        'modelName': modelName,
        'model': model
    };
};