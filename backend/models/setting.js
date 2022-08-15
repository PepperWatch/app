const Mailer = require('../includes/Mailer.js');
const Slack = require('../includes/Slack.js');
const ReCaptcha = require('../includes/ReCaptcha.js');
const SignInWithGoogle = require('../includes/SignInWithGoogle.js');
const Storage = require('../includes/Storage.js');
const DeployChecker = require('../includes/DeployChecker.js');
const Solana = require('../includes/Solana.js');

module.exports = function(mongoose, connection, db) {
    var modelName = 'Setting';
    var schema = mongoose.Schema({
        name: String,
        value: Object,
        levelToRead: {
            type: String,
            default: 'superadmin',
        },
        levelToWrite: {
            type: String,
            default: 'superadmin',
        },
    },
    { collection: 'settings' });


    // schema.virtual('test').get(function () {  resturn 'test';  });  //// - item.test (available both on backend and on UI side)
    // schema.statics.getActive = function() {   };         ///// - db.Size.getActive()
    // schema.methods.updateSomething = function() {   };   ///// - item.updateSomething()

    schema.statics.onListQuery = async function(query, request) {
        // limit list response to levelToRead user has access to

        const availableLevels = request.user.getAvailableAccessLevels();

        console.log(availableLevels);
        query = query.and({levelToRead: {$in: availableLevels}});
    }

    schema.statics.apiPost = async function() {
        /// this points to model (schema.statics.)
        throw new Error('Default REST Post is not available for this route');
    }

    schema.methods.apiPut = async function() {
        /// this points to model (schema.methods.)
        throw new Error('Default REST Put is not available for this route');
    }

    schema.methods.apiDelete = async function() {
        throw new Error('You dont have rights for this path');
    }

    /**
     * Initialize all child classes setting default values in settings if needed.
     * Good idea to run it on app startup
     * @return {[type]} [description]
     */
    schema.statics.initialize = async function() {
        const methods = ['getStorage', 'getSlack', 'getMailer', 'getReCaptcha', 'getSignInWithGoogle', 'getDeployChecker'];
        for (let method of methods) {
            const instance = await this[method]();
            if (instance.initialize) {
                await instance.initialize();
            }
        }

        return true;
    }

    schema.statics.getDeployChecker = function() {
        if (this.__deployChecker) {
            return this.__deployChecker;
        }

        this.__deployChecker = new DeployChecker({
            db: db,
        });

        return this.__deployChecker;

    }

    schema.statics.getStorage = function() {
        if (this.__storage) {
            return this.__storage;
        }

        this.__storage = new Storage({
            db: db,
        });

        return this.__storage;
    };

    schema.statics.getSlack = function() {
        if (this.__slack) {
            return this.__slack;
        }

        this.__slack = new Slack({
            db: db,
        });

        return this.__slack;
    };

    schema.statics.getMailer = function() {
        if (this.__mailer) {
            return this.__mailer;
        }

        this.__mailer = new Mailer({
            db: db,
        });

        return this.__mailer;
    };

    schema.statics.getReCaptcha = function() {
        if (this.__reCaptcha) {
            return this.__reCaptcha;
        }

        this.__reCaptcha = new ReCaptcha({
            db: db,
        });

        return this.__reCaptcha;
    };

    schema.statics.getSolana = function(chainType = 'devnet') {
        if (!this.__solana) {
            this.__solana = {};
        }

        if (this.__solana[chainType]) {
            return this.__solana[chainType];
        }

        this.__solana[chainType] = new Solana({
            db: db,
            chainType: chainType,
        });

        return this.__solana[chainType];
    };

    schema.statics.getSignInWithGoogle = function() {
        if (this.__signInWithGoogle) {
            return this.__signInWithGoogle;
        }

        this.__signInWithGoogle = new SignInWithGoogle({
            db: db,
        });

        return this.__signInWithGoogle;
    };

    schema.statics.getMessageCommonTags = async function() {
        if (this.__messageCommonTags) {
            return this.__messageCommonTags;
        }

        const setting = await db.Setting.findOne({name: 'messageCommonTags'});
        if (setting) {
            this.__messageCommonTags = setting.value;
        } else {
            this.__messageCommonTags = {};
        }

        return this.__messageCommonTags;
    };

    schema.statics.get = async function(name) {
        if (this.__settings) {
            return this.__settings[name];
        }

        let settings = await db.Setting.find({});
        this.__settings = {};

        for (let setting of settings) {
            this.__settings[setting.name] = setting.value;
        }

        return this.__settings[name];
    };

    schema.statics.flushCache = function() {
        this.__slack = null;
        this.__mailer = null;
        this.__storage = null;
        this.__reCaptcha = null;
        this.__signInWithGoogle = null;
        this.__messageCommonTags = null;
        this.__deployChecker = null;
        this.__settings = null;
        this.__solana = null;
    }

    var model = connection.model(modelName, schema);
    return {
        'modelName': modelName,
        'model': model
    };
};