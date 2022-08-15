const BaseExtraRoute = require('../../includes/BaseExtraRoute.js');

class Handler extends BaseExtraRoute {
    constructor(params = {}) {
        super(params);
        this._path = '/api/settings/persist';
    }

    async handle(req, reply) {
        req.requireAuth();

        const settings = req.body.settings;
        let levelToWrite = req.body.levelToWrite;
        let levelToRead = req.body.levelToRead;

        const toSaveItems = [];

        for (let key in settings) {
            let found = await this._db.Setting.findOne({name: key});

            if (found) {
                const levelToWrite = found.levelToWrite;
                if (!req.user.hasLevelOf(levelToWrite)) {
                    throw new Error('You do not have rights to save '+key+' setting');
                }
            }

            if (!found) {
                found = new this._db.Setting;
                found.name = key;

                // levels can be assigned to new settings only

                if (!levelToWrite || !levelToRead) {
                    const userLevels = req.user.getAvailableAccessLevels();
                    const highestLevel = userLevels[0];

                    if (!levelToRead) {
                        levelToRead = highestLevel;
                    }
                    if (!levelToWrite) {
                        levelToWrite = highestLevel;
                    }
                }

                found.levelToWrite = levelToWrite;
                found.levelToRead = levelToRead;
            }

            found.value = settings[key];
            toSaveItems.push(found);
        }

        for (let item of toSaveItems) {
            await item.save();
        }

        this._db.Setting.flushCache(); // flush cached classes

        reply.send({
            success: true,
        });
    }
}

module.exports = Handler;