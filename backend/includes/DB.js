const mongoose = require('mongoose');
const Resources = require('./Resources.js');

class DB {
    constructor(params = {}) {
        this._logger = params.logger || null;
        this._config = params.config || params || {};
        this._silent = params.silent || false; // do not connect to database

        this._db = {};
	}

    log(str) {
        if (this._logger) {
            this._logger.debug(str);
        } else {
            console.log(str);
        }
    }

    async close() {
        this._db.connection.close();
    }

    async init() {

        const options = {
            useNewUrlParser: true,
        };

        let connection = null;

        if (!this._silent) {
            this.log('Creating connection to MongoDB...');
            connection = await mongoose.createConnection(this._config.database.database, options);
            this.log('We are connected to MongoDB');
        } else {
            connection = {
                model: function (modelName, schema) {
                    if (!this.models) {
                        this.models = {};
                    }

                    this.models[modelName] = {
                        schema: schema,
                    };

                    return this.models[modelName];
                }
            };
        }

        let modelsCount = 0;
        let modelPaths = await Resources.loadModelsPaths(this._config.paths.models);

        modelPaths.forEach((path)=>{
            let inc = null;
            try {
                let model = require(path);
                inc = model(mongoose, connection, this._db);

                if (inc && inc.modelName && inc.model) {
                    this._db[inc.modelName] = inc.model;
                    modelsCount++;
                } else {
                    throw 'modelName and model missed';
                }
            } catch(e) {
                console.error(e);

                this.log("Invalid mongoose model: "+path+" | ", e);
            }
        });

        this.log('Set up '+modelsCount+' models');

        this._db.mongoose = mongoose;
        this._db.connection = connection;

        return this._db;
    }
}

module.exports = DB;