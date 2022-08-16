const Crypter = require('../includes/Crypter.js');

module.exports = function(mongoose, connection, db) {
    var modelName = 'Purchase';
    var schema = mongoose.Schema({
        video: { type : mongoose.Schema.Types.ObjectId, ref: 'Video' },
        by: String,

        userEncryptionEncodedKey: String,

        chainType: String,
        price: Number,

        expectedTransactionInstructions: {
            type: Object,
            default: null,
        },

        fulfilledByTransaction: String,
        isFulfillled: {type: Boolean, default: false},
    },
    { collection: 'purchases', timestamps: true });


    // schema.virtual('APIValues').get(function () {    });  //// - item.APIValues
    // schema.statics.getActive = function() {   };         ///// - db.Size.getActive()
    // schema.methods.updateSomething = function() {   };   ///// - item.updateSomething()
    //                                                      ///// more: http://mongoosejs.com/docs/guide.html

    schema.methods.encodeKeyForBuyer = async function(userEncryptionPublicKey) {
        await this.populate('video');

        if (!this.isFulfillled) {
            return false;
        }

        if (this.userEncryptionEncodedKey) {
            return this.userEncryptionEncodedKey;
        }

        // const crypter = new Crypter();
        const encoded = await Crypter.encodeKeyForUser(this.video.key, this.by, userEncryptionPublicKey);

        if (encoded) {
            this.userEncryptionEncodedKey = encoded;

            await this.save();

            return encoded;
        }

        return null;
    };

    schema.methods.checkTransaction = async function(signature) {
        await this.populate('video');

        if (this.isFulfillled) {
            return true;
        }

        // check if transaction was used for fulfiling other purchases
        const alreadyUsed = await db.Purchase.findOne({fulfilledByTransaction: signature});
        if (alreadyUsed) {
            return false;
        }

        try {
            const solana = db.Setting.getSolana(this.chainType);

            const expectedTransactionInstructions = await this.getExpectedTransactionInstructions();

            if (!expectedTransactionInstructions || !expectedTransactionInstructions.length) {
                return false;
            }

            const maxRetries = 20;
            let curRetry = 0;
            let waitFor = 1000;

            let tx = null;
            do {
                tx = await solana.getTransaction(signature);
                if (!tx) {
                    console.log('tx not found, pause...');
                    await new Promise((res)=>{ setTimeout(res, waitFor); });

                    if (curRetry > 3) {
                        waitFor = 3000;
                    }
                    if (curRetry > 7) {
                        waitFor = 5000;
                    }
                    if (curRetry > 12) {
                        waitFor = 15000;
                    }
                }
            } while(!tx && curRetry++ < maxRetries);

            for (let expectedInstruction of expectedTransactionInstructions) {
                let instructionIsThere = false;

                for (let txInstruction of tx.transaction.message.instructions) {
                    if (txInstruction.parsed && txInstruction.parsed.info) {
                        const parsedInfo = txInstruction.parsed.info;

                        if (parsedInfo.source == this.by) {
                            // sent by buyer
                            if (parsedInfo.destination == expectedInstruction.address && parsedInfo.lamports == expectedInstruction.value) {
                                instructionIsThere = true;
                            }
                        }
                    }
                }

                if (!instructionIsThere) {
                    return false;
                }
            }
        } catch(e) {
            console.error(e);

            return false;
        }

        this.fulfilledByTransaction = signature;
        this.isFulfillled = true;

        await this.save();

        return true;
    };

    schema.methods.getExpectedTransactionInstructions = async function() {
        if (this.expectedTransactionInstructions) {
            return this.expectedTransactionInstructions;
        }

        if (!this.price) {
            return null;
        }

        await this.populate('video');
        const mintedAddress = this.video.mintedAddress;

        if (!mintedAddress) {
            return null;
        }

        const solana = db.Setting.getSolana(this.chainType);

        const priceInLamports = solana.toLamports(this.price);
        const expectedTransactionInstructions = await solana.getExpectedTransactionInstructionsFor(mintedAddress);

        console.log(expectedTransactionInstructions);

        if (expectedTransactionInstructions && expectedTransactionInstructions.length) {
            expectedTransactionInstructions.forEach((transaction)=>{
                transaction.value = Math.floor(priceInLamports * (0.01 * transaction.share));
            });
            // console.log(expectedTransactionInstructions);

            // check integrity
            let sum = 0;
            for (let transaction of expectedTransactionInstructions) {
                sum += transaction.value;
            }

            if (sum == priceInLamports) {
                this.expectedTransactionInstructions = expectedTransactionInstructions;
                await this.save();

                return this.expectedTransactionInstructions;
            }
        } else {
            return null;
        }
    };

    schema.methods.apiValues = function() {
        const response = this.toObject();
        response._id = undefined;
        response.__v = undefined;
        response.key = undefined;
        response.video = undefined;

        return response;
    }

    schema.statics.onListQuery = async function(query, request) {
        if (!request.user.hasLevelOf('superadmin')) {
            throw new Error('You dont have rights to list for this path');
        }
    }
    schema.statics.apiPost = async function(data, request) {
        if (!request.user.hasLevelOf('superadmin')) {
            throw new Error('You dont have rights for this path');
        }
    }
    schema.methods.apiPut = async function(data, request) {
        if (!request.user.hasLevelOf('superadmin')) {
            throw new Error('You dont have rights for this path');
        }
    }
    schema.methods.apiDelete = async function() {
        throw new Error('You dont have rights for this path');
    }

    var model = connection.model(modelName, schema);
    return {
        'modelName': modelName,
        'model': model
    };
};