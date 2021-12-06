const CryptoJS = require("crypto-js");


	/**
	 * https://github.com/brix/crypto-js/issues/274#issuecomment-600039187
	 * @param  {[type]} wordArray [description]
	 * @return {[type]}           [description]
	 */
	const cryptJsWordArrayToUint8Array = function(wordArray) {
		if (!wordArray.sigBytes && wordArray.sigBytes !== 0) {
			throw new Error('Invalid WordArray');
		}

		const l = wordArray.sigBytes;
		const words = wordArray.words;
		const result = new Uint8Array(l);
		var i=0 /*dst*/, j=0 /*src*/;
		while(i <= l) {
			// here i is a multiple of 4
			if (i==l)
				break;
			var w = words[j++];
			result[i++] = (w & 0xff000000) >>> 24;
			if (i==l)
				break;
			result[i++] = (w & 0x00ff0000) >>> 16;
			if (i==l)
				break;
			result[i++] = (w & 0x0000ff00) >>> 8;
			if (i==l)
				break;
			result[i++] = (w & 0x000000ff);
		}

		return result;
	}

const uint8arrayToString = function(uint8array) {

			return uint8array.map(x => x.toString(16).padStart(2, '0'))
			.join('');
}


const test = async()=>{

	// console.log(CryptoJS.algo.AES.keySize); // in bytes?


	const password = 'testффф';
	const kdfSalt = 'testффф';

	const key = CryptoJS.PBKDF2(password, kdfSalt, { hasher: CryptoJS.algo.SHA512, keySize: CryptoJS.algo.AES.keySize, iterations: 1000 });


	console.log(key.toString());
	console.log(uint8arrayToString(cryptJsWordArrayToUint8Array(key)));


	const iv = CryptoJS.lib.WordArray.random(CryptoJS.algo.AES.ivSize);

	const cryptoParams = {
		mode: CryptoJS.mode.CTR,
		padding: CryptoJS.pad.NoPadding,  // CTR + NoPadding = same size of cipher and input
		iv: iv,
	};

	const encryptor = CryptoJS.algo.AES.createEncryptor(key, cryptoParams);

	const wordArray = CryptoJS.enc.Hex.parse('0b0b0b0b0a0a0a0a0a');
	const encrypted = encryptor.finalize(wordArray);

	// console.log(encryptor.finalize(wordArray));

	const hexResult = CryptoJS.enc.Hex.stringify(iv)+CryptoJS.enc.Hex.stringify(encrypted);

	console.log(hexResult);


};

test();