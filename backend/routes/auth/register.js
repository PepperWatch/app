const BaseExtraRoute = require('../../includes/BaseExtraRoute.js');
const crypto = require('crypto');

class Handler extends BaseExtraRoute {
	constructor(params = {}) {
        super(params);
        this._path = '/auth/register';
	}

    async handle(req, reply) {
        const captcha = req.body.captcha;
        const username = ''+req.body.username;
        const email = ''+req.body.email;
        const password = ''+req.body.password;

        let captchaIsGood = false;

        const reCaptcha = this.db.Setting.getReCaptcha(); // cached by Settings
        captchaIsGood = await reCaptcha.check(captcha);
        if (!captchaIsGood) {
            reply.status(422);
            return reply.send({success: false});
        }

        const fieldsErrors = {
            username: '',
            email: '',
            password: '',
        };

        let found = null;
        if (username.length < 2) {
            fieldsErrors.username = 'Username is too short';
        } else {
            found = await this._db.User.findOne({username: username});
            if (found) {
                fieldsErrors.username = 'Username is taken';
            }
        }

        if (email.length < 2 || !(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email))) {
            fieldsErrors.email = 'Invalid email';
        } else {
            found = await this._db.User.findOne({email: email});
            if (found) {
                fieldsErrors.email = 'Email already registered in our system';
            }
        }

        if (password.length < 6) {
            fieldsErrors.password = 'Password is too short';
        }

        let user = null;
        let confirmEmailCode = null;

        if (fieldsErrors.username || fieldsErrors.email || fieldsErrors.password) {
            reply.status(400);
            return reply.send({
                success: false,
                fields: fieldsErrors,
            });
        } else {
            user = new this.db.User;
            user.email = email;
            user.username = username;

            try {
                await user.save();

                const hashed = await user.hashPassword(password);
                user.password = hashed;

                confirmEmailCode = crypto.randomInt(0, 1000000).toString().padStart(6, "0");
                user.confirmEmailCode = confirmEmailCode;

                await user.save();
            } catch(e) {
                try {
                    user.remove();
                } catch(e2) {
                    console.log(e2);
                }

                throw e;
            }
        }


        if (user) {

            await this._db.Notification.notify({
                user: user,
                templateName: 'welcome',
                doNotSave: true,
                // silent: true, // do not throw error ( like if no template defined )
                tags: {
                    username: user.username,
                    confirmEmailCode: confirmEmailCode,
                },
                // doNotSave: true, // skip saving into database
            });

            await this._db.Notification.notify({
                // level: 'admin',  send to default settings (can set from NotificationTemplate -> Edit)
                templateName: 'signed_up',
                tags: {
                    username: user.username,
                },
                silent: true, // do not throw error ( like if no template defined )
            });

            return reply.send({
                success: true,
            });
        }
    }
}

module.exports = Handler;