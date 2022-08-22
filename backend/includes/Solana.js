const solanaWeb3 =  require("@solana/web3.js");
const Metaplex = require("@metaplex-foundation/js");
const nacl = require('tweetnacl');
const bs58 = require('bs58');

class Solana {
    constructor(params = {}) {
        this._logger = params.logger || null;
        this.db = params.db || null;

        this._settings = {};
        this._connection = null;

        this._chainType = params.chainType;

        if (['devnet', 'mainnet-beta'].indexOf(this._chainType) === -1) {
            throw new Error('This chainType: '+this._chainType+' is not supported');
        }

        this._feeDestination = 'G1f6Zcykqkf7AWtgDmgh1SXoWcqov4TrAdzh49JY6bSp';
	}

    toLamports(value) {
        return Math.floor(value * solanaWeb3.LAMPORTS_PER_SOL);
    }

    async getTransaction(signature) {
        await this.initialize();

        const tx = await this._connection.getParsedTransaction(signature);
        return tx;
        // console.error(tx);
        // console.error(tx.transaction.message.instructions[0].parsed);
    }

    hex2u8a(hexString) {
        return new Uint8Array(hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
    }

    async verifySignedString(message, signature, byAddress) {
        try {
            const signatureAsU8A = this.hex2u8a(signature);
            const byAddressAsU8A = bs58.decode(byAddress);

            const verified = nacl
                .sign
                .detached
                .verify(
                new TextEncoder().encode(message),
                signatureAsU8A,
                byAddressAsU8A
                );

            return verified;
        } catch(e) {
            return false;
        }
    }

    async getOwnerAddress(mintedAddress) {
        await this.initialize();
        const mint = new solanaWeb3.PublicKey(mintedAddress);

        const largestAccounts = await this._connection.getTokenLargestAccounts(mint);
        const largestAccountInfo = await this._connection.getParsedAccountInfo(
            largestAccounts.value[0].address
        );
        const owner = ''+largestAccountInfo.value.data.parsed.info.owner;

        return owner;
    }

    async getExpectedTransactionInstructionsFor(mintedAddress) {
        await this.initialize();
        const mint = new solanaWeb3.PublicKey(mintedAddress);

        // const largestAccounts = await this._connection.getTokenLargestAccounts(mint);
        // const largestAccountInfo = await this._connection.getParsedAccountInfo(
        //     largestAccounts.value[0].address
        // );

        const owner = await this.getOwnerAddress(mintedAddress);

        const metaplex = new Metaplex.Metaplex(this._connection);
        const nft = await metaplex.nfts().findByMint({mintAddress: mint}).run();

        const creator = ''+nft.creators[0].address;

        if (!owner || !creator) {
            return null;
        }

        if (owner == creator) {
            return [
                    {address: owner, share: 90},
                    {address: this._feeDestination, share: 10},
                ];
        } else {
            return [
                {address: owner, share: 80},
                {address: creator, share: 10},
                {address: this._feeDestination, share: 10},
            ];
        }
    }

    async test() {
        await this.initialize();

        // console.log(await this.getExpectedTransactionFor("6Jabh4AJoYzLF4Es5PH8XMeBrQA2uhh99npjKbrxWeeK"));
        console.log(await this.getTransaction("5v1bMwJWXhj1oFmRit1gb82wXEtWbaqYrQXkRd6xkytJ45vaqjucPNvkWxVmu9MqPzG42vxKhJG6Uhd7nzLXuUMF"));


        // const recentBlock = await this._connection.getEpochInfo();
        // console.log("~~~~~~~~~~~~~~~~~NEW BLOCK~~~~~~~~~~~~\n", recentBlock);
        // const keyPair = solanaWeb3.Keypair.generate();

        // console.log("Public Key:", keyPair.publicKey.toString());
        // console.log("Secret Key:",keyPair.secretKey);

        // const mintedAddress = "6Jabh4AJoYzLF4Es5PH8XMeBrQA2uhh99npjKbrxWeeK";

        // const largestAccounts = await this._connection.getTokenLargestAccounts(
        //     new solanaWeb3.PublicKey(mintedAddress)
        // );
        // const largestAccountInfo = await this._connection.getParsedAccountInfo(
        //     largestAccounts.value[0].address
        // );
        // console.log(largestAccountInfo.value.data.parsed);
        // console.log(largestAccountInfo.value.data.parsed.info.owner);

        // const metaplex = new Metaplex.Metaplex(this._connection);


        // const nft = await metaplex.nfts().findByMint(new solanaWeb3.PublicKey(mintedAddress)).run();
        // console.log(nft);

        // console.log(''+nft.creators[0].address);
    }

    async initialize() {
        if (this._initialized) {
            return true;
        }

        const network = solanaWeb3.clusterApiUrl(this._chainType);
        const connection = new solanaWeb3.Connection(network);

        this._connection = connection;

        this._initialized = true;
    }

}

module.exports = Solana;