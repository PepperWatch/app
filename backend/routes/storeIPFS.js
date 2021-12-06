module.exports = async function(request, reply, db) {

	const data = {
		hash: (request.body['hash'] || null),

		containerHash: (request.body['containerHash'] || null),
		originalHash: (request.body['originalHash'] || null),

		encodedIpfsHash: (request.body['encodedIpfsHash'] || null),
		publicThumbIpfsHash: (request.body['publicThumbIpfsHash'] || null),
		mintIpfsHash: (request.body['mintIpfsHash'] || null),
	};

	if (data.hash) {
		let splet = data.hash.split('_');
		data.originalHash = splet[0];
		data.containerHash = splet[1];
	}

	let foundByHashes = await db.Video.byHashes(data.containerHash, data.originalHash);

	if (!foundByHashes) {
		// @todo: let them do this in one step???

		const video = new db.Video;
		video.containerHash = data.containerHash;
		video.originalHash = data.originalHash;

		await video.save();

		foundByHashes = video;
	}

	if (foundByHashes && foundByHashes.key == data.key) { // if user know the key
		if (!foundByHashes.isMinted) { // and the video is not yet minted

			foundByHashes.encodedIpfsHash = data.encodedIpfsHash;
			foundByHashes.publicThumbIpfsHash = data.publicThumbIpfsHash;
			foundByHashes.mintIpfsHash = data.mintIpfsHash;

			await foundByHashes.save();

			return reply.send({success: true});

		}
	}

	return reply.send({success: false});
};