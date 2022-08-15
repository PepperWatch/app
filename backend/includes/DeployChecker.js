// const crypto = require('crypto');
// const fs = require('fs');

class DeployChecker {
    constructor(params = {}) {
        this._logger = params.logger || null;
        this.db = params.db || null;

        this._settings = {};
	}

    async notifyOfBuildStart() {
        await this.initialize();


        // https://devcenter.heroku.com/articles/dyno-metadata
        // enable it by running heroku labs:enable runtime-dyno-metadata -a <app name>
        const commitHash = process.env.HEROKU_SLUG_COMMIT;
        if (commitHash) {
            console.log('Current commit hash: '+commitHash);
            // we are on heroku
            await this.db.Notification.notify({
                // level: 'admin',  send to default settings (can set from NotificationTemplate -> Edit)
                templateName: 'build',
                tags: {
                    // this is the previous (already deployed) commit tags, actually.
                    HEROKU_SLUG_COMMIT: process.env.HEROKU_SLUG_COMMIT,
                    HEROKU_APP_ID: process.env.HEROKU_APP_ID,
                    HEROKU_APP_NAME: process.env.HEROKU_APP_NAME,
                    HEROKU_RELEASE_CREATED_AT: process.env.HEROKU_RELEASE_CREATED_AT,
                    HEROKU_RELEASE_VERSION: process.env.HEROKU_RELEASE_VERSION,
                    HEROKU_SLUG_DESCRIPTION: process.env.HEROKU_SLUG_DESCRIPTION,
                },
                silent: true, // do not throw error ( like if no template defined )
            });
        }
    }

    /**
     * Check for the last deployed commit on heroku and create notification if commit is different then on
     * the previous run.
     *
     * runtime-dyno-metadata should be enabled on the app
     * do it by running:
     * heroku labs:enable runtime-dyno-metadata -a <app name>
     *
     * @return {[type]} [description]
     */
    async checkCurrentDeploy() {
        await this.initialize();

        // https://devcenter.heroku.com/articles/dyno-metadata
        // enable it by running heroku labs:enable runtime-dyno-metadata -a <app name>
        const commitHash = process.env.HEROKU_SLUG_COMMIT;
        if (commitHash) {
            // enabled
            //
            const mostRecentDeployHash = this._settings.mostRecentDeployHash;
            if (commitHash != mostRecentDeployHash) {
                console.log('Current deploy hash updated. New one: '+commitHash);

                // new hash deployed
                await this.db.Notification.notify({
                    // level: 'admin',  send to default settings (can set from NotificationTemplate -> Edit)
                    templateName: 'deploy',
                    tags: {
                        HEROKU_SLUG_COMMIT: process.env.HEROKU_SLUG_COMMIT,
                        HEROKU_APP_ID: process.env.HEROKU_APP_ID,
                        HEROKU_APP_NAME: process.env.HEROKU_APP_NAME,
                        HEROKU_RELEASE_CREATED_AT: process.env.HEROKU_RELEASE_CREATED_AT,
                        HEROKU_RELEASE_VERSION: process.env.HEROKU_RELEASE_VERSION,
                        HEROKU_SLUG_DESCRIPTION: process.env.HEROKU_SLUG_DESCRIPTION,
                    },
                    silent: true, // do not throw error ( like if no template defined )
                });

                await this.db.Setting.updateOne({name: 'mostRecentDeployHash'}, { value: commitHash });
            }
        }
    }

    async initialize() {
        if (this._initialized) {
            return true;
        }

        // load settings
        const needed             = ['mostRecentDeployHash',];
        const neededLevelToRead  = ['superadmin'];
        const neededLevelToWrite = ['superadmin'];

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

module.exports = DeployChecker;