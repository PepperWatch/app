const Minio = require('minio');
const StorageBucket = require('./StorageBucket.js');

class Storage {
    constructor(params = {}) {
        this._logger = params.logger || null;
        this.db = params.db || null;

        this._settings = {};
        this._buckets = {};
	}


    async getBuckets() {
        await this.initialize();

        const ret = [];
        if (this._settings.storage && this._settings.storage.length) {
            for (let setting of this._settings.storage) {
                ret.push(await this.getBucket(setting.id));
            }
        }

        return ret;
    }

    async getBucket(bucketId) {
        await this.initialize();
        if (this._buckets[bucketId]) {
            return this._buckets[bucketId];
        }

        const bucketSettings = this._settings.storage.find((item)=>(item.id == bucketId));

        if (!bucketSettings) {
            return null;
        }

        const client =  new Minio.Client({
            endPoint: bucketSettings.endPoint,
            accessKey: bucketSettings.accessKey,
            secretKey: bucketSettings.secretKey,
        });

        this._buckets[bucketId] = new StorageBucket({
            db: this.db,
            logger: this._logger,
            client: client,
            bucketName: bucketSettings.name,
            settings: bucketSettings,
        });

        return this._buckets[bucketId];
    }

    async initialize() {
        if (this._initialized) {
            return true;
        }

        // load settings
        const needed             = ['storage',];
        const neededLevelToRead  = ['superadmin',];
        const neededLevelToWrite = ['superadmin',];

        const loadedSettings = await this.db.Setting.find({name: {$in: needed}});

        for (let i = 0; i < needed.length; i++) {
            let found = loadedSettings.find((item)=>(item.name == needed[i]));

            if (!found) {
                found = new this.db.Setting;
                found.name = needed[i];
                found.value = '';

                await found.save();
            }

            if (found.levelToRead != neededLevelToRead[i] || found.levelToWrite != neededLevelToWrite[i]) {
                found.levelToRead = neededLevelToRead[i];
                found.levelToWrite = neededLevelToWrite[i];

                await found.save();
            }

            // check if has default bucket
            if (!Array.isArray(found.value) || !(found.value.find((item)=>(item.id == 'default')))) {
                if (!Array.isArray(found.value)) {
                    found.value = [];
                }
                if (!(found.value.find((item)=>(item.id == 'default')))) {
                    found.value.push({id: 'default'});
                }

                await found.save();
            }

            this._settings[needed[i]] = found.value;
        }


        this._initialized = true;
    }

}

module.exports = Storage;