const BaseExtraRoute = require('../../includes/BaseExtraRoute.js');
const crypto = require('crypto');

class Handler extends BaseExtraRoute {
    constructor(params = {}) {
        super(params);
        this._path = '/auth/google';
    }

    async handle(req, reply) {
        const credential = req.body.credential;

        let ret = {
            success: false,
            authCode: null
        };

        const signInWithGoogle = this._db.Setting.getSignInWithGoogle(); // cached by Settings

        let payload = null;

        try {
            payload = await signInWithGoogle.verify(credential);
        } catch(e) {
            console.error(e)
            // jwt not verified
            reply.status(401);
            return reply.send({success: false});
        }

        let email = payload.email;

        let foundUser = await this._db.User.findOne({email: email});

        if (!foundUser) {
            // register if there's no

            foundUser = new this.db.User;
            foundUser.email = email;
            foundUser.username = email;

            try {
                await foundUser.save();

                const randomPassword = (''+crypto.randomBytes(256).toString('hex'));
                const hashed = await foundUser.hashPassword(randomPassword);
                foundUser.password = hashed;

                await foundUser.save();
            } catch(e) {
                try {
                    foundUser.remove();
                } catch(e2) {
                    console.log(e2);
                }

                throw e;
            }
        }

        ret.success = true;
        let authCode = (''+crypto.randomBytes(256).toString('hex'));
        ret.authCode = authCode;

        ret.me = foundUser.apiValues ? foundUser.apiValues() : foundUser;
        ret.me.level = foundUser.level; // force level in api response (as it may be hidden by apiValues)

        await foundUser.storeAuthCode(authCode);

        reply.setCookie('authCode', authCode, {path: '/', maxAge: 7*24*60*60, sameSite: 'none'});

        await this._db.Notification.notify({
            user: foundUser,
            templateName: 'signed_in',
            tags: {
                username: foundUser.username,
            },
            // doNotSave: true, // skip saving into database
        });

        await this._db.Notification.notify({
            // level: 'admin',  send to default settings (can set from NotificationTemplate -> Edit)
            templateName: 'signed_in',
            tags: {
                username: foundUser.username,
            },
            silent: true, // do not throw error ( like if no template defined )
        });

        if (!ret.success) {
            reply.status(401);
            reply.send(ret);
        } else {
            reply.send(ret);
        }
    }
}

module.exports = Handler;