const jose = require('jose');
const remoteJWKs = jose.createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'));

class SignInWithGoogle {
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
        const needed             = ['signInWithGoogleClientId', 'signInWithGoogleClientSecret',];
        const neededLevelToRead  = ['guest'           , 'superadmin'        ,];
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

    async verify(credential) {
        await this.initialize();

        const signInWithGoogleClientId = this._settings.signInWithGoogleClientId;

        const verified = await jose.jwtVerify(
            credential, remoteJWKs,
            {
                issuer: ["https://accounts.google.com", "accounts.google.com"],
                audience: signInWithGoogleClientId,
            }
        );
        const payload = verified.payload;

        if (!payload.email || !payload.email_verified) {
            throw new Error('No email provided');
        }

        return payload;
    }

}

module.exports = SignInWithGoogle;