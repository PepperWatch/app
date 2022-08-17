const BaseExtraRoute = require('../../includes/BaseExtraRoute.js');

class Handler extends BaseExtraRoute {
	constructor(params = {}) {
        super(params);
        this._path = '/api/storeipfs';
	}

    async handle(req, reply) {
        const data = {
            hash: (req.body['hash'] || null),
            key: (req.body['key'] || null),

            containerHash: (req.body['containerHash'] || null),
            originalHash: (req.body['originalHash'] || null),

            title: (req.body['title'] || null),

            encodedIpfsHash: (req.body['encodedIpfsHash'] || null),
            publicThumbIpfsHash: (req.body['publicThumbIpfsHash'] || null),
            mintIpfsHash: (req.body['mintIpfsHash'] || null),

            mintedAddress: (req.body['mintedAddress'] || null),
            chainType: (req.body['chainType'] || null),
            price: (req.body['price'] || null),

            collectionAddress: (req.body['collectionAddress'] || null),
        };

        if (data.hash) {
            let splet = data.hash.split('_');
            data.originalHash = splet[0];
            data.containerHash = splet[1];
        }

        let foundByHashes = await this.db.Video.byHashes(data.containerHash, data.originalHash);

        if (!foundByHashes) {
            // @todo: let them do this in one step???

            const video = new this.db.Video;
            video.containerHash = data.containerHash;
            video.originalHash = data.originalHash;

            video.title = data.title;

            video.encodedIpfsHash = data.encodedIpfsHash;
            video.publicThumbIpfsHash = data.publicThumbIpfsHash;
            video.mintIpfsHash = data.mintIpfsHash;

            video.key = data.key;

            await video.save();

            foundByHashes = video;

            return reply.send({success: true});
        }

        if (foundByHashes && foundByHashes.key == data.key) { // if user know the key
            if (!foundByHashes.isMinted) { // and the video is not yet minted

                if (data.mintedAddress) {
                    // minted
                    foundByHashes.mintedAddress = data.mintedAddress;
                    foundByHashes.chainType = data.chainType;
                    foundByHashes.isMinted = true;

                    if (data.collectionAddress) {
                        foundByHashes.collectionAddress = data.collectionAddress;
                    }

                    const price = parseFloat(data.price, 10);
                    if (price && price > 0 && price <= 1) {
                        foundByHashes.price = price;
                    }

                    await foundByHashes.save();

                    return reply.send({success: true});
                }

            }

            if (data.price) {
                const price = parseFloat(data.price, 10);
                if (price && price > 0 && price <= 1) {
                    foundByHashes.price = price;

                    await foundByHashes.save();

                    return reply.send({success: true});
                }
            }
        }

        return reply.send({success: false});
    }
}

module.exports = Handler;