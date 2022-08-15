const BaseExtraRoute = require('../../includes/BaseExtraRoute.js');

class Handler extends BaseExtraRoute {
	constructor(params = {}) {
        super(params);
        this._path = '/api/byhash';
	}

    async handle(req, reply) {
        const data = {
            hash: (req.body['hash'] || null),
            connectedAddress: (req.body['connectedAddress'] || null),
        };

        let foundByHashes = null;

        try {
            foundByHashes = await this.db.Video.byHash(data.hash);
        } catch(e) {
            console.error(e);
        }

        if (foundByHashes) {
            const ret = foundByHashes.apiValues();

            if (data.connectedAddress) {
                let foundPurchase = await this.db.Purchase.findOne({by: data.connectedAddress, video: foundByHashes});
                if (foundPurchase && foundPurchase.userEncryptionEncodedKey) {
                    ret.userEncryptionEncodedKey = foundPurchase.userEncryptionEncodedKey;
                    ret.fulfilledByTransaction = foundPurchase.fulfilledByTransaction;
                }
            }

            reply.send(ret);

            return true;
        } else {
            reply.send({success: false});
        }
    }
}

module.exports = Handler;