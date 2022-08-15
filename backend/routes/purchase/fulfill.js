const BaseExtraRoute = require('../../includes/BaseExtraRoute.js');

class Handler extends BaseExtraRoute {
	constructor(params = {}) {
        super(params);
        this._path = '/api/purchase/fulfill';
	}

    async handle(req, reply) {
        const data = {
            mintIpfsHash: (req.body['mintIpfsHash'] || null),
            connectedAddress: (req.body['connectedAddress'] || null),
            chainType: (req.body['chainType'] || null),

            signature: (req.body['signature'] || null),
            userEncryptionPublicKey: (req.body['userEncryptionPublicKey'] || null),
        };

        let foundVideo = await this.db.Video.findOne({mintIpfsHash: data.mintIpfsHash});

        if (foundVideo.chainType != data.chainType) {
            reply.send({success: false, message: 'Invalid chainType'});
        }

        if (foundVideo) {
            // 1st - check if there's already purchase for this connectedAddress
            let foundPurchase = await this.db.Purchase.findOne({by: data.connectedAddress, chainType: data.chainType, video: foundVideo});
            if (foundPurchase) {
                const success = await foundPurchase.checkTransaction(data.signature);
                if (success) {
                    await foundPurchase.encodeKeyForBuyer(data.userEncryptionPublicKey);

                    return reply.send(foundPurchase.apiValues());
                }
            } else {
                return reply.send({success: false});
            }
        }

        return reply.send({success: false});
    }
}

module.exports = Handler;