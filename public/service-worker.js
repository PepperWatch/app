// const window = self;

const version = "0.0.5";
const askByMessagePath = '/askfor/';
const requestTimeout = 10000;


const askPromises = {};
const askPromisesResolvers = {};
const askPromisesTotalSizes = {};
const askPromisesFileNames = {};
const askPromisesMimeTypes = {};

self.addEventListener('install', e => {
	e.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', event => {
	event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', function(event) {
	event.respondWith(fetchObject(event));
});

self.addEventListener('message', event => {
	if (event && event.data) {
		if (event.data.command == 'put') {
			if (event.data.promiseId && askPromisesResolvers[event.data.promiseId]) {
				if (event.data.totalSize) {
					askPromisesTotalSizes[event.data.promiseId] = event.data.totalSize;
				}
				if (event.data.fileName) {
					askPromisesFileNames[event.data.promiseId] = event.data.fileName;
				}
				if (event.data.mimeType) {
					askPromisesMimeTypes[event.data.promiseId] = event.data.mimeType;
				}

				askPromisesResolvers[event.data.promiseId](event.data.binary);
			}
		}
	}
});

const fetchObject = async function(event) {
	if (event.request.url.indexOf(askByMessagePath) != -1) {
		// check if this is Range request
		let pos = 0;
		let till = null;

		try {
			const hBytes = /^bytes=(\d+)-(\d+)?$/g.exec(
				event.request.headers.get('range')
			);
			pos = Number(hBytes[1]);
			till = Number(hBytes[2]) || null;

			if (pos === 0 && till === null) {
				till = 2;
			}
			// pos = Number(/^bytes\=(\d+)\-$/g.exec(event.request.headers.get('range'))[1]);
		} catch(e) {
			pos = 0;
			till = null;

			if (event.request.headers.get('range')) {
				till = 2;
			}
		}

		let id = event.request.url.split(askByMessagePath)[1]; // @todo: check
		if (id.indexOf('.') !== -1) { // remove extension if there is any
			id = id.split('.')[0];
		}

		const promiseId = 'get_'+id+'_'+pos+'_'+till;
		const promise = new Promise((res)=>{
			askPromisesResolvers[promiseId] = res;
		});
		askPromises[promiseId] = promise;

		const message = {
			command: 'askfor',
			id: id,
			promiseId: promiseId,
			pos: pos,
			till: till,
		};

		event.waitUntil(postMessageToClient(event, message));
		const ab = await Promise.race([askPromises[promiseId], new Promise((res)=>{ setTimeout(res, requestTimeout); })]);

		if (!ab) {
			return new Response(
				[],
				{
					status: 500,
					statusText: 'Error',
					headers: [
						]
				});
		}

		const sentBytes = ab.byteLength || ab.size;

		let contentType = 'video/mp4';
		if (askPromisesMimeTypes[promiseId]) {
			contentType = askPromisesMimeTypes[promiseId];
		}

		let fileName = 'data.dat';
		if (askPromisesFileNames[promiseId]) {
			fileName = askPromisesFileNames[promiseId];
		}

		if (pos || till) {
			const totalSize = (askPromisesTotalSizes[promiseId] ? askPromisesTotalSizes[promiseId] : 0);
			const crHeader = 'bytes ' + pos + '-' + (sentBytes + pos - 1) + '/' + totalSize;
			return new Response(
				ab,
				{
					status: 206,
					statusText: 'Partial Content',
					headers: [
							['Content-Type', contentType],
							['Content-Range', crHeader ],
							['Content-Length', sentBytes ],
							['Content-Disposition', 'inline; filename="'+fileName+'"' ],
						]
				});
		} else {
			return new Response(
				ab,
				{
					status: 200,
					statusText: 'Ok',
					headers: [
							['Content-Type', contentType],
							['Content-Length', sentBytes ],
							['Content-Disposition', 'inline; filename="'+fileName+'"' ],
						]
				});
		}
	} else {
		return await fetch(event.request);
	}
};

const postMessageToClient = async function(event, msg) {
	if (!event.clientId) {
		return;
	}
	const client = await self.clients.get(event.clientId);
	if (!client) {
		return;
	}

	msg.version = version;

	client.postMessage(msg);
};