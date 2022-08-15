const BaseExtraRoute = require('../../includes/BaseExtraRoute.js');

class Handler extends BaseExtraRoute {
	constructor(params = {}) {
        super(params);
        this._path = '/api/purchase/new';
	}

    async handle(req, reply) {
        const data = {
            mintIpfsHash: (req.body['mintIpfsHash'] || null),
            connectedAddress: (req.body['connectedAddress'] || null),
            chainType: (req.body['chainType'] || null),
        };

        let foundVideo = await this.db.Video.findOne({mintIpfsHash: data.mintIpfsHash});

        if (foundVideo.chainType != data.chainType) {
            reply.send({success: false, message: 'Invalid chainType'});
        }

        if (foundVideo) {
            // 1st - check if there's already purchase for this connectedAddress
            let foundPurchase = await this.db.Purchase.findOne({by: data.connectedAddress, chainType: data.chainType, video: foundVideo});
            if (foundPurchase) {
                await foundPurchase.getExpectedTransactionInstructions();

                return reply.send(foundPurchase.apiValues());
            } else {
                foundPurchase = new this.db.Purchase;
                foundPurchase.by = data.connectedAddress;
                foundPurchase.chainType = data.chainType;
                foundPurchase.video = foundVideo;

                foundPurchase.isFulfillled = false;
                foundPurchase.price = foundVideo.price;

                await foundPurchase.save();

                await foundPurchase.getExpectedTransactionInstructions();

                return reply.send(foundPurchase.apiValues());
            }
        }

        return reply.send({success: false});
    }
}

module.exports = Handler;