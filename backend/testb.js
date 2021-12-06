

const Blockchainer = require('./classes/Blockchainer.js');


const s = async()=>{
	const b = new Blockchainer({contract: 'terra1rgwywlcvtqahfseu8rys97le5lgwazr3fcv80r'});
	const pw = await b.getMediaPublicKey('QmYcnfDamFpCCUXq8ei6U2bwMJJA7EAZQ9J57FkrPawSPv');

	console.log(pw);

};

s();