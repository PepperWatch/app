module.exports = async function(request, reply, db) {

	const data = {
		videoHash: (request.body['videoHash'] || null),
		mintIpfsHash: (request.body['mintIpfsHash'] || null),

		containerHash: (request.body['containerHash'] || null),
		originalHash: (request.body['originalHash'] || null),
	};

	let foundByHashes = null;

	try {
		foundByHashes = await db.Video.byHash(data.mintIpfsHash);
		if (!foundByHashes) {
			foundByHashes = await db.Video.byHash(data.videoHash);
		}
	} catch(e) {
		console.error(e);

	}

	if (foundByHashes) {
		reply.send(foundByHashes.apiValues());

		return true;
	} else {
		reply.send({success: false});
	}
};