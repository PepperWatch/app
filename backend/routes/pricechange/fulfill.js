const BaseExtraRoute = require('../../includes/BaseExtraRoute.js');

class Handler extends BaseExtraRoute {
	constructor(params = {}) {
        super(params);
        this._path = '/api/pricechange/fulfill';
	}

    async handle(req, reply) {
        const data = {
            hash: (req.body['hash'] || null),
            ownerAddress: (req.body['ownerAddress'] || null),
            signature: (req.body['signature'] || null),
        };

        if (!data.ownerAddress) {
            return reply.send({success: false, message: 'Invalid owner address'});
        }
        if (!data.signature) {
            return reply.send({success: false, message: 'Invalid signature'});
        }

        let foundByHashes = await this.db.Video.byHash(data.hash);

        if (foundByHashes) {
            const success = await foundByHashes.fulfillPriceChange(data.signature);
            if (success) {
                return  reply.send({
                            success: true,
                            price: foundByHashes.price,
                        });
            }

        }

        return reply.send({success: false});
    }
}

module.exports = Handler;