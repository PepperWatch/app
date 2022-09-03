const crypto = require('crypto');

module.exports = function(mongoose, connection, db) {
    var modelName = 'Video';
    var schema = mongoose.Schema({
        title: String,
        uniqId: String, // uniqId of the video. hash of both original and container concatenated
        originalHash: String, // the hash of original video file (the one encoded inside)
        containerHash: String, // the hash of container blob

        encodedIpfsHash: String,
        publicThumbIpfsHash: String,
        mintIpfsHash: String,

        key: String,

        mintedAddress: String,
        chainType: String,
        price: Number,

        collectionAddress: String,
        isCollectionVerified: {type: Boolean, default: false},

        isMinted: {type: Boolean, default: false},
        isVisibleOnHomepage: {type: Boolean, default: false},
        isPriorityOnHomepage: {type: Boolean, default: false},

        priceChangeRandomHash: {type: String, default: null},
        priceChangeValue: {type: Number, default: null},
    },
    { collection: 'videos', timestamps: true });


    // schema.virtual('APIValues').get(function () {    });  //// - item.APIValues
    // schema.statics.getActive = function() {   };         ///// - db.Size.getActive()
    // schema.methods.updateSomething = function() {   };   ///// - item.updateSomething()
    //                                                      ///// more: http://mongoosejs.com/docs/guide.html

    schema.statics.byId = async function(id) {
        return await db.Video.findOne({_id: id}).exec();
    }

    schema.statics.byHashes = async function(containerHash, originalHash) {
        return await db.Video.findOne({containerHash: containerHash, originalHash: originalHash}).exec();
    }

    schema.statics.byHash = async function(hash) {
        let splet = hash.split('_');

        let found = null;

        if (splet.length == 2) {
            found = await db.Video.findOne({containerHash: splet[1], originalHash: splet[0]});
        }

        if (!found) {
            found = await db.Video.findOne({mintIpfsHash: hash});
        }
        if (!found) {
            found = await db.Video.findOne({mintedAddress: hash});
        }
        if (!found) {
            found = await db.Video.findOne({originalHash: hash, isMinted: true});
        }
        if (!found) {
            found = await db.Video.findOne({originalHash: hash});
        }

        return found;
    }

    schema.methods.getOwnerAddress = async function() {
        if (!this.mintedAddress) {
            return null;
        }

        const solana = db.Setting.getSolana(this.chainType);
        return await solana.getOwnerAddress(this.mintedAddress);
    }

    schema.methods.initializePriceChange = async function(price) {
        const random = await new Promise((res, rej)=>{
            crypto.randomBytes(64, function(err, buffer) {
                if (err) {
                    return rej(err);
                }

                res(buffer.toString('hex'));
            });
        });

        this.priceChangeRandomHash = 'Change price to '+price+' at '+random;
        this.priceChangeValue = price;

        await this.save();
    }

    schema.methods.fulfillPriceChange = async function(signature) {
        if (!this.priceChangeRandomHash || !this.priceChangeValue) {
            return false;
        }

        try {
            const ownerAddress = await this.getOwnerAddress();
            const solana = db.Setting.getSolana(this.chainType);
            const verified = await solana.verifySignedString(this.priceChangeRandomHash, signature, ownerAddress);

            if (verified) {
                this.price = this.priceChangeValue;
            }

            this.priceChangeValue = null;
            this.priceChangeRandomHash = null;

            await this.save();

            return verified;
        } catch(e) {
            return false;
        }
    }

    schema.methods.apiValues = function() {
        const response = this.toObject();
        // response._id = undefined;
        response.__v = undefined;
        response.key = undefined;
        response.priceChangeRandomHash = undefined;
        response.priceChangeValue = undefined;
        response.__modelName = 'Video';

        return response;
    }

    schema.statics.onListQuery = async function(query, request) {
        if (!request.user.hasLevelOf('superadmin')) {
            throw new Error('You dont have rights to list for this path');
        }
    }
    schema.statics.apiPost = async function() {
        throw new Error('You dont have rights for this path');
    }
    schema.methods.apiPut = async function(data, request) {
        if (!request.user.hasLevelOf('superadmin')) {
            throw new Error('You dont have rights for this path');
        }

        // not editable fields
        delete data.uniqId;
        delete data.originalHash;
        delete data.containerHash;
        delete data.encodedIpfsHash;
        delete data.publicThumbIpfsHash;
        delete data.mintIpfsHash;
        delete data.key;

        delete data.mintedAddress;
        delete data.chainType;
        delete data.price;
        delete data.collectionAddress;
        delete data.isMinted;
        delete data.priceChangeRandomHash;
        delete data.priceChangeValue;
        ///
        ///
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
    schema.methods.apiDelete = async function() {
        throw new Error('You dont have rights for this path');
    }


    var model = connection.model(modelName, schema);
    return {
        'modelName': modelName,
        'model': model
    };
};