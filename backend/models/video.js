

module.exports = function(mongoose, connection, db) {
    var modelName = 'Video';
    var schema = mongoose.Schema({
        uniqId: String, // uniqId of the video. hash of both original and container concatenated
        originalHash: String, // the hash of original video file (the one encoded inside)
        containerHash: String, // the hash of container blob

        encodedIpfsHash: String,
        publicThumbIpfsHash: String,
        mintIpfsHash: String,
        isMinted: {type: Boolean, default: false}
    },
    { collection: 'videos' });


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


        if (splet.length == 2) {
            return await db.Video.findOne({containerHash: splet[1], originalHash: splet[0]}).exec();
        }

        return await db.Video.findOne({mintIpfsHash: hash}).exec();
    }

    schema.methods.apiValues = function() {
        const response = this.toObject();
        response._id = undefined;
        response.__v = undefined;

        return response;
    }

    var model = connection.model(modelName, schema);
    return {
        'modelName': modelName,
        'model': model
    };
};