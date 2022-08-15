

/* eslint-disable-next-line no-unused-vars */
module.exports = function(mongoose, connection, db) {
    var modelName = 'UserAuth';
    var schema = mongoose.Schema({
        authCode: String,
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    },
    { collection: 'users_authes' });

    // schema.virtual('test').get(function () {  resturn 'test';  });  //// - item.test (available both on backend and on UI side)
    // schema.statics.getActive = function() {   };         ///// - db.Size.getActive()
    // schema.methods.updateSomething = function() {   };   ///// - item.updateSomething()
    //                                                      ///// more: http://mongoosejs.com/docs/guide.html


    schema.statics.onListQuery = async function() {
        throw new Error('You dont have rights for this path');
    }
    schema.methods.apiValues = function() {
        throw new Error('You dont have rights for this path');
    }
    schema.statics.apiPost = async function() {
        throw new Error('You dont have rights for this path');
    }
    schema.methods.apiPut = async function() {
        throw new Error('You dont have rights for this path');
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