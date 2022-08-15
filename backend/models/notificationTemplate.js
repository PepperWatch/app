// const Mailer = require('../includes/Mailer.js');

module.exports = function(mongoose, connection, db) {
    var modelName = 'NotificationTemplate';
    var schema = mongoose.Schema({
        name:    { type: String, unique: true },
        subject: { type: String, },
        message: { type: String, },
        color: { type: String, default: null, },
        showInUI: { type: Boolean, default: false, }, // display this template's notifications on UI interface ( uses subject only )
        defaultTargetLevel: { type: String, default: null }, // if sending without target and showInUI == true, send to this level
        canSendAsEmail: { type: Boolean, default: false, }, // is this template available for email sending
        canSendToSlack: { type: Boolean, default: false, }, // is this template available for sending to Slack
        defaultTargetChannel: { type: String, default: null }, // if sending without target and canSendToSlack == true, send to this channel
    },
    { collection: 'notification_templates', timestamps: true });

    // schema.virtual('test').get(function () {  resturn 'test';  });  //// - item.test (available both on backend and on UI side)
    // schema.statics.getActive = function() {   };         ///// - db.Size.getActive()
    // schema.methods.updateSomething = function() {   };   ///// - item.updateSomething()
    //


    schema.statics.seed = async function(force = false) {
        if (this.__alreadyCheckedForTheSeed && !force) {
            // run only once for each run
            return true;
        }

        const templatesToBeHere = [
            {
                name: 'build',
                canSendAsEmail: false,
                canSendToSlack: true,
                defaultTargetLevel: 'admin',
                subject: 'Building new version on %HEROKU_APP_NAME% ...',
                message: 'Building new version on %HEROKU_APP_NAME%',
                showInUI: true,
            },
            {
                name: 'deploy',
                canSendAsEmail: false,
                canSendToSlack: true,
                defaultTargetLevel: 'admin',
                subject: '%HEROKU_RELEASE_VERSION% has been deployed to %HEROKU_APP_NAME%',
                message: '"%HEROKU_SLUG_DESCRIPTION%" has been deployed to %HEROKU_APP_NAME%',
                showInUI: true,
            },
            {
                name: 'test',
                canSendAsEmail: true,
                canSendToSlack: true,
                subject: '%username% test message',
                message: '%username% test message',
                showInUI: false,
            },
            {
                name: 'signed_up',
                canSendAsEmail: false,
                canSendToSlack: true,
                subject: '%username% joined %siteName%',
                showInUI: true,
            },
            {
                name: 'welcome',
                canSendAsEmail: true,
                subject: 'Welcome to %siteName%, %username%',
                message: 'Please confirm your email address using <a href="%siteURL%/confirm_email/%confirmEmailCode%">link</a>'
            },
            {
                name: 'signed_in',
                canSendAsEmail: false,
                canSendToSlack: true,
                subject: '%username% signed in into %siteName%',
                showInUI: true,
            },
            {
                name: 'reset_password',
                canSendAsEmail: true,
                subject: 'Reset Your Account Password At %siteName%',
                message: 'Reset your account password using <a href="%siteURL%/reset_password/%code%">link</a>'
            },
        ];

        for (let templateToBeHere of templatesToBeHere) {
            let found = await db.NotificationTemplate.findOne({name: templateToBeHere.name});
            if (!found) {
                found = new db.NotificationTemplate;
                found.name = templateToBeHere.name;
                found.canSendAsEmail = templateToBeHere.canSendAsEmail;
                found.canSendToSlack = templateToBeHere.canSendToSlack;
                found.showInUI = templateToBeHere.showInUI;
                found.subject = templateToBeHere.subject;
                found.message = templateToBeHere.message;
                found.defaultTargetLevel = templateToBeHere.defaultTargetLevel;

                await found.save();
            }

            if (templateToBeHere.canSendAsEmail !== undefined && found.canSendAsEmail != templateToBeHere.canSendAsEmail) {
                found.canSendAsEmail = templateToBeHere.canSendAsEmail;

                await found.save();
            }

        }

        this.__alreadyCheckedForTheSeed = true;
    };

    schema.statics.get = async function(templateName) {
        let template = templateName;
        if (template.prototype instanceof db.NotificationTemplate) {
            return template;
        } else if (mongoose.Types.ObjectId.isValid(templateName)) {
            return await db.NotificationTemplate.findOne({_id: templateName});
        } else if (typeof templateName === 'string' || templateName instanceof String) {
            return await db.NotificationTemplate.findOne({name: templateName});
        }
    };

    schema.statics.getMailer = function() {
        return db.Setting.getMailer();
    };

    schema.methods.send = async function(params = {}) {
        const tags = params.tags;
        const email = params.email || params.to;
        const channel = params.channel || null;

        let sent = false;
        try {
            if (email) {
                const mailer = db.Setting.getMailer();
                const res = await mailer.send({
                    template: this,
                    tags: tags,
                    to: email,
                });

                if (res && res.messageId) {
                    sent = true;
                }
            }
            if (channel) {
                const slack = db.Setting.getSlack();
                const res = await slack.send({
                    template: this,
                    tags: tags,
                    channel: channel,
                });

                if (res && res.ts) {
                    sent = true;
                }
            }
        } catch(e) {
            sent = false;
        }

        return sent;
    }

    var model = connection.model(modelName, schema);
    return {
        'modelName': modelName,
        'model': model
    };
};