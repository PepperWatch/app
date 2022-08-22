const BaseExtraRoute = require('../../includes/BaseExtraRoute.js');

class Handler extends BaseExtraRoute {
	constructor(params = {}) {
        super(params);
        this._path = '/api/pricechange/initialize';
	}

    async handle(req, reply) {
        const data = {
            hash: (req.body['hash'] || null),
            ownerAddress: (req.body['ownerAddress'] || null),
            price: (req.body['price'] || null),
        };

        if (!data.ownerAddress) {
            return reply.send({success: false, message: 'Invalid owner address'});
        }
        if (!data.price || data.price <= 0 || data.price > 1) {
            return reply.send({success: false, message: 'Invalid price'});
        }

        let foundByHashes = await this.db.Video.byHash(data.hash);

        if (foundByHashes) {
            const ownerAddress = await foundByHashes.getOwnerAddress();
            if (ownerAddress != data.ownerAddress) {
                return reply.send({success: false, message: 'Invalid owner address'});
            }

            await foundByHashes.initializePriceChange(data.price);

            reply.send({
                success: true,
                priceChangeRandomHash: foundByHashes.priceChangeRandomHash,
            });
        }

        return reply.send({success: false});
    }
}

module.exports = Handler;