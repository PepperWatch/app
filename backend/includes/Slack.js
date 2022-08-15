const { WebClient } = require('@slack/web-api');

class Slack {
    constructor(params = {}) {
        this._logger = params.logger || null;
        this.db = params.db || null;

        this._settings = {

        };
        this.commonTags = {

        };
        this._clients = {};

        this._initialized = false;

        this._lastError = null;
	}

    async initialize() {
        if (this._initialized) {
            return true;
        }

        // load settings
        const needed             = ['slackChannels',];
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

        this.commonTags = await this.db.Setting.getMessageCommonTags();

        for (let channel of this._settings.slackChannels) {
            this._clients[channel.id] = new WebClient(channel.token);
            this._clients[channel.id].slackChannelId = channel.slackId;
        }

        this._initialized = true;
    }

    async send(params = {}) {
        await this.initialize();

        let template = null;
        if (params.template) {
            template = await this.db.NotificationTemplate.get(params.template);

            let tags = params.tags || {};

            let subject = template.subject;

            const mergedTags = {...this.commonTags, ...tags}; // merge common tags with message specific

            console.log(mergedTags);

            for (let key in mergedTags) {
                subject = subject.split('%'+key+'%').join(mergedTags[key]);
            }

            params.subject = subject;
        }

        const channel = params.channel;

        console.log(this._clients[channel].slackChannelId)

        if (!this._clients[channel]) {
            throw new Error('Invalid channel '+channel);
        }

        const attachment = {
            title: '',
            pretext: '',
            text: params.subject,
        };

        if (template && template.color) {
            attachment.color = template.color;
        }

        const result = await this._clients[channel].chat.postMessage({
            attachments: [attachment],
            channel: this._clients[channel].slackChannelId,
        });

        if (result) {
            return result;
        }

        return false;
    }

}

module.exports = Slack;