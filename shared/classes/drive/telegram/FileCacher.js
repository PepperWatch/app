class FileCacher {
	constructor() {
		this._db = null;
		this._cacheName = 'tgcache-0.0.1';
	}


	async open() {
		if (!this._db) {
			this._db = await this.initDB();
		}
	}

	initDB() {
		return new Promise((res, rej)=>{
			let request = indexedDB.open(this._cacheName, 4);
			request.onerror = function() {
				rej();
			};
			request.onupgradeneeded = ()=>{
				const db = request.result;
				try { db.createObjectStore('files', { keyPath: "url" }); } catch(e){ console.error(e); }
				// objectStore.createIndex("data", "data", { unique: false });


			};
			request.onsuccess = function() {
				const db = request.result;
				res(db);
			};
		});
	}

	store() {
		const tx = this._db.transaction(['files'], 'readwrite');
		return tx.objectStore('files');
	}

	async matchFromStore(store, url, ra) {
		if (url.indexOf('/tg/') == -1) {
			url = '/tg/'+url;
		}

		let murl = '/tg/'+url.split('/tg/')[1];

		return new Promise((res)=>{
			// console.error((new Date).getTime(), ' store get '+url);

			const request = store.get(murl);
			request.onerror = function() {
				res(undefined);
			};
			request.onsuccess = function() {
				const record = request.result;
				// console.error('matched', "-"+murl+"-", record, event, request);

				if (!record) {
					res(undefined);
					return;
				}
				let ret = new Response(
					record.data,
					{
						status: 200
					});
				if (ra) {
					ret = [url, ret];
				}
				res(ret);
			};
		});
	}

	async matchAll(urls) {
		await this.open();

		// await this.initDB();
		let uurls = Array.from(new Set(urls));

		// await this.test();

		const store = this.store();
		const promises = [];


		// let res = [];
		for (let url of uurls) {
			// res.push(await this.matchFromStore(store, url, true));
			promises.push(this.matchFromStore(store, url, true));
		}
		// return res;

		return Promise.all(promises);
	}

	async match(url) {
		// await this.initDB();
		const store = this.store();
		return await this.matchFromStore(store, url);
	}

	async deleteUrl(url) {
		let murl = '/tg/'+url.split('/tg/')[1];
		const store = this.store();

		await new Promise((res)=>{
			const request = store.delete(murl);
			request.onerror = function() {
				res(undefined);
			};
			request.onsuccess = function() {
				res(true);
			};
		});
	}

	delete() {
		return new Promise((res)=>{
			this.open()
				.then(()=>{
					const tx = this._db.transaction(['files'], 'readwrite');
					const store = tx.objectStore('files');

					const r = store.clear();
					r.onsuccess = function() { res(); };
				});
		});
	}

	async putBlob(url, blob, lazy = true) {
		if (url.indexOf('/tg/') == -1) {
			url = '/tg/'+url;
		}

		await this.open();

		const response = new Response(blob, {status: 200});
		return await this.put(url, response, lazy);
	}

	put(url, response, lazy) {
		let murl = '/tg/'+url.split('/tg/')[1];

		return new Promise((res)=>{
			response.blob().then((blob)=>{

				const tx = this._db.transaction(['files'], 'readwrite');
				const store = tx.objectStore('files');

				const item = {
					url: murl,
					data: blob,
				};

				try {
					tx.onerror = function() {
						// console.error(e);
						// may be because of duplicate
						// console.error(e);
						res(true);
					};
					tx.oncomplete = function() {
						// console.error('cached ok', murl);
					// console.error('putting2 ', item, event);
						res(true);
					};

					// console.error('putting', item);
					const addRequest = store[lazy ? 'put' : 'add'](item);

					addRequest.onerror = function() {
						// console.error(e);
						// may be because of duplicate
						// console.error(e);
						res(true);
					};
					// addRequest.onsuccess = function(e) {
					// 	console.error(e);
					// 	// may be because of duplicate
					// 	// console.error(e);
					// 	res(true);
					// };
				} catch(e) {
					console.error(e);
				}
			});
		});
	}
}

module.exports = new FileCacher();