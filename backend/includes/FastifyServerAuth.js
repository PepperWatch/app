const fp = require('fastify-plugin');

const crypto = require('crypto');

class ServerAuth {
	constructor(params = {}) {
		this._fastify = params.fastify || null;
		this._authRouters = {};

		this._authNonces = [];
		this._maxAuthNoncesToStore = 100;

		const noMethod = () => {
			throw new Error('Method required');
		};

		this._getUserByUsername = params.getUserByUsername || noMethod;
		this._storeAuthCode = params.storeAuthCode || noMethod;
		this._getUserByAuthCode = params.getUserByAuthCode || noMethod;

        this._fastify.post('/auth/nonce', async (request, reply) => await this.authNonce(request, reply));
        this._fastify.post('/auth/auth', async (request, reply) => await this.auth(request, reply));
        this._fastify.post('/auth/logout', async (request, reply) => await this.logout(request, reply));
        this._fastify.get('/auth/me', async (request, reply) => await this.me(request, reply));

        this._fastify.decorateRequest('user', null);
		this._fastify.addHook('preHandler', (req, reply, done) => {
			let authCode = req.cookies.authCode || req.headers.authcode || null;

			this._getUserByAuthCode(authCode)
				.then((user)=>{
					if (user) {
						req.user = user;
					}

					done();
				});
		});
        this._fastify.decorateRequest('requireAuth', function () {
            if (!this.user) {
                throw new Error('Auth required');
            }
		});
	}

    async me(req, reply) {
        await new Promise((res)=>{ setTimeout(res, 500); });

        req.requireAuth();

        reply.send({
            success: true,
            me: req.user ? ( req.user.apiValues ? req.user.apiValues() : req.user ) : null
        });
    }

    async authNonce(req, reply) {
        let randomNonce = crypto.randomBytes(128).toString('hex');
        this._authNonces.push(randomNonce);
        if (this._authNonces.length > this._maxAuthNoncesToStore) {
            /// store up to 100 last nonces. We are targeting simple tool apps here, so no more than 100 parallel
            /// signin are more than enough
            this._authNonces = this._authNonces.slice(-this._maxAuthNoncesToStore);
        }

        reply.send({
            nonce: randomNonce
        });
    }

    async logout(req, reply) {
        let ret = {
            success: true
        };

        /// @todo: remove authCode from server storage

        reply.setCookie('authCode', '', {path: '/'});
        reply.send(ret);
    }

    async auth(req, reply) {
        let ret = {
            success: false,
            authCode: null
        };

        let username = req.body.username;
        let passwordHash = req.body.password;

        let hashIsGood = false;

        let foundUser = await this._getUserByUsername(username);
        if (foundUser) {
            for (let i = 0; i < this._authNonces.length; i++) {
                let nonce = this._authNonces[i];
                let hash = crypto.createHash('md5').update(''+nonce+''+foundUser.password).digest("hex");
                if (hash == passwordHash) {
                    hashIsGood = true;
                    /// remove this nonce from authNonces. To be sure we use it once only
                    this._authNonces.splice(i, 1);
                }
            }
        }

        if (hashIsGood) {
            ret.success = true;
            let authCode = (''+crypto.randomBytes(64).toString('hex'));
            ret.authCode = authCode;

            ret.me = foundUser.apiValues ? foundUser.apiValues() : foundUser;

            await this._storeAuthCode(foundUser, authCode);

            reply.setCookie('authCode', authCode, {path: '/', maxAge: 7*24*60*60, sameSite: 'none'});
        }

        if (!ret.success) {
            reply.status(401);
            reply.send(ret);
        } else {
            reply.send(ret);
        }
    }
}

function initPlugin(fastify, options, next) {
	options = options || {};
	options.fastify = fastify;

	const serverAuth = new ServerAuth(options);
    serverAuth;
	// fastify.decorate('mongooseAPI', api);

	next();
}

const plugin = fp(initPlugin, {
	fastify: '^3.0.0',
	name: 'fastify-server-auth',
	dependencies: ['fastify-formbody', 'fastify-cookie']
});

module.exports = plugin;