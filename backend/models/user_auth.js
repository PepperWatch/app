

/* eslint-disable-next-line no-unused-vars */
module.exports = function(mongoose, connection, db) {
    var modelName = 'UserAuth';
    var schema = mongoose.Schema({
        authCode: String,
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    },
    { collection: 'users_authes' });

    // schema.virtual('APIValues').get(function () {    });  //// - item.APIValues
    // schema.statics.getActive = function() {   };         ///// - db.Size.getActive()
    // schema.methods.updateSomething = function() {   };   ///// - item.updateSomething()
    //                                                      ///// more: http://mongoosejs.com/docs/guide.html

    var model = connection.model(modelName, schema);
    return {
        'modelName': modelName,
        'model': model
    };
};