

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

        isMinted: {type: Boolean, default: false},
        isVisibleOnHomepage: {type: Boolean, default: false},
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

        return found;
    }

    schema.methods.apiValues = function() {
        const response = this.toObject();
        // response._id = undefined;
        response.__v = undefined;
        response.key = undefined;
        response.__modelName = 'Video';

        return response;
    }

    schema.statics.onListQuery = async function(query, request) {
        if (!request.user.hasLevelOf('superadmin')) {
            throw new Error('You dont have rights to list for this path');
        }
    }
    schema.statics.apiPost = async function(data, request) {
        if (!request.user.hasLevelOf('superadmin')) {
            throw new Error('You dont have rights for this path');
        }
    }
    schema.methods.apiPut = async function(data, request) {
        if (!request.user.hasLevelOf('superadmin')) {
            throw new Error('You dont have rights for this path');
        }
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