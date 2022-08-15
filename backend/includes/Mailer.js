const nodemailer = require("nodemailer");

class Mailer {
    constructor(params = {}) {
        this._logger = params.logger || null;
        this.db = params.db || null;

        this._settings = {

        };
        this.defaultTemplate = '';
        this.commonTags = {

        };

        this._transporter = null;
        this._initialized = false;

        this._lastError = null;
	}

    async initialize() {
        if (this._initialized) {
            return true;
        }

        // load settings
        const needed             = ['smtpHost', 'smtpPort', 'smtpUsername', 'smtpPassword', 'smtpDefaultFrom', 'smtpSecure', 'mailDefaultTemplate'];
        const neededLevelToRead  = ['superadmin', 'superadmin', 'superadmin', 'superadmin', 'superadmin', 'superadmin', 'superadmin'];
        const neededLevelToWrite = ['superadmin', 'superadmin', 'superadmin', 'superadmin', 'superadmin', 'superadmin', 'superadmin'];

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

        this.defaultTemplate = ''+this._settings.mailDefaultTemplate;
        if (this.defaultTemplate.indexOf('%content%') == -1) {
            this.defaultTemplate += '%content%';
        }

        this.commonTags = await this.db.Setting.getMessageCommonTags();

        this._transporter = nodemailer.createTransport({
            // pool: true,
            host: this._settings.smtpHost,
            port: this._settings.smtpPort,
            secure: this._settings.smtpSecure, // use TLS
            auth: {
                user: this._settings.smtpUsername,
                pass: this._settings.smtpPassword,
            },
        });

        this._initialized = true;
    }

    async send(params = {}) {
        await this.initialize();

        if (!params.from) {
            params.from = this._settings.smtpDefaultFrom;
        }

        if (params.template) {
            const template = await this.db.NotificationTemplate.get(params.template);

            let tags = params.tags || {};

            let subject = template.subject;
            let message = this.defaultTemplate.split('%content%').join(template.message);

            const mergedTags = {...this.commonTags, ...tags}; // merge common tags with message specific

            console.log(mergedTags);

            for (let key in mergedTags) {
                subject = subject.split('%'+key+'%').join(mergedTags[key]);
                message = message.split('%'+key+'%').join(mergedTags[key]);
            }

            params.subject = subject;
            params.html = message;
        }

        try {
            const info = await new Promise((res,rej)=>{
                this._transporter.sendMail(params, (err,info)=>{
                    if (!err) {
                        res(info);
                    } else {
                        rej(err);
                    }
                });
            });

            return info;
        } catch(e) {
            this._lastError = e;
            return e;
        }
    }

}

module.exports = Mailer;