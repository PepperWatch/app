const Blockchainer = require('../classes/Blockchainer.js');
const Crypter = require('../classes/Crypter.js');

module.exports = async function(request, reply) {

	const data = {
		contract: (request.body['contract'] || null),
		media: (request.body['media'] || null),
		userAccount: (request.body['userAccount'] || null),
	};

	if (!data.media || !data.userAccount || !data.contract) {
		reply.send({success: false, message: 'Invalid parameters'});
	}

	let b = null;
	try {
		b = new Blockchainer({contract: data.contract});
	} catch(e) {
		return reply.send({success: false, message: 'Invalid contract'});
	}

	let userPublicKey = null;
	try {
		userPublicKey = await b.getUserEncryptionPublicKey(data.media, data.userAccount);
	} catch(e) {
		userPublicKey = null;
	}

	if (!userPublicKey) {
		return reply.send({success: false, message: 'Can not get user public key. Is purchase already filled?'});
	}

	let decodedKey = null;
	try {
		decodedKey = await b.getMediaPublicKey(data.media);
	} catch(e) {
		return reply.send({success: false, message: 'Can not restore the key :( Contact us if you see this message.'});
	}

	let encodedKeyForUser = null;
	try {
		encodedKeyForUser = await Crypter.encodeKeyForUser(decodedKey, data.userAccount, userPublicKey);
	} catch(e) {
		return reply.send({success: false, message: 'Can not encode the key for user :( Contact us if you see this message.'});
	}

	try {
		const txhash = await b.storeMediaKeyForUser(data.media, data.userAccount, encodedKeyForUser);
		return reply.send({success: true, txhash: txhash});
	} catch(e) {
		reply.send({success: false, message: 'Can not store encoded key on blockchain :('});
	}
};