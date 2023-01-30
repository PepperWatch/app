

class Telegram {
    constructor(params = {}) {
        this._logger = params.logger || null;
        this.db = params.db || null;

        this._settings = {};
	}

    async initialize() {
        if (this._initialized) {
            return true;
        }

        // load settings
        const needed             = ['telegramApiId', 'telegramApiHash',];
        const neededLevelToRead  = ['guest'           , 'guest'        ,];
        const neededLevelToWrite = ['superadmin'      , 'superadmin'        ,];

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

            this._settings[needed[i]] = found.value;
        }

        this._initialized = true;
    }

}

module.exports = Telegram;