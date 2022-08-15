const axios = require('axios');
const querystring = require('querystring');

class ReCaptcha {
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
        const needed             = ['recaptchaSiteKey', 'recaptchaSecretKey', 'recaptchaMinimumScore'];
        const neededLevelToRead  = ['guest'           , 'superadmin'        , 'superadmin'];
        const neededLevelToWrite = ['superadmin'      , 'superadmin'        , 'superadmin'];

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

    /**
     * test captcha settings
     * @param  {String} captchaToken token generated on frontend
     * @return {Object}              response from google
     */
    async checkRaw(captchaToken) {
        await this.initialize();

        const recaptchaSecretKey = this._settings.recaptchaSecretKey;
        const recaptchaMinimumScore = parseFloat(this._settings.recaptchaMinimumScore, 10) || 0;

        if (recaptchaSecretKey) {
            try {
                const resp = await axios.post('https://www.google.com/recaptcha/api/siteverify', querystring.stringify({
                    secret: recaptchaSecretKey,
                    response: captchaToken,
                }));

                if (resp.data && resp.data.score) {
                    if (resp.data.score > recaptchaMinimumScore) {
                        resp.data.passed = true;
                    } else {
                        resp.data.passed = false;
                    }
                }

                return resp.data;
            } catch(e) {
                return {error: ''+e};
            }
        } else {
            // no captcha settings, lets pass all data
            return {error: 'no secret key defined'};
        }

    }

    async check(captchaToken) {
        await this.initialize();

        const recaptchaSecretKey = this._settings.recaptchaSecretKey;
        const recaptchaMinimumScore = parseFloat(this._settings.recaptchaMinimumScore, 10) || 0;

        if (recaptchaSecretKey) {
            try {
                const resp = await axios.post('https://www.google.com/recaptcha/api/siteverify', querystring.stringify({
                    secret: recaptchaSecretKey,
                    response: captchaToken,
                }));

                if (resp.data && resp.data.success && resp.data.score > recaptchaMinimumScore) {
                    return true;
                }

            } catch(e) {
                return false;
            }

            return false;
        } else {
            // no captcha settings, lets pass all data
            return true;
        }
    }
}

module.exports = ReCaptcha;