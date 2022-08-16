import IndexedDBRecord from './IndexedDBRecord.js';

export default class FileStorage {
	constructor() {
		this._db = null;
		this._cacheName = 'pepper';
		this._urlPrefix = '/localstore/';
	}

	async open() {
		if (!this._db) {
			this._db = await this.initDB();
		}
	}

	idFromURL(url) {
		return ''+this._urlPrefix+url.split(this._urlPrefix)[1];
	}

	async randomURL(extension, uniqValue) {
		if (!uniqValue) {
			uniqValue = (''+Math.random()).split('0.').join('');
		}

		return ''+this._urlPrefix+uniqValue+extension;
	}

	async fileToBlob(file) {
		return new Blob([new Uint8Array(await file.arrayBuffer())], {type: file.type });
	}

	initDB() {
		return new Promise((res, rej)=>{
			let request = indexedDB.open(this._cacheName, 4);
			request.onerror = function(e) {
				console.log('indexedDB onerror', e);

				rej();
			};
			request.onupgradeneeded = ()=>{
				console.log('indexedDB store onupgradeneeded');

				const db = request.result;
				try { db.createObjectStore('files', { keyPath: "url" }); } catch(e){ console.error(e); }
			};
			request.onsuccess = function() {
				console.log('indexedDB store opened');

				const db = request.result;
				res(db);
			};
		});
	}

	store() {
		const tx = this._db.transaction(['files'], 'readwrite');
		return tx.objectStore('files');
	}

	async getAll() {
		await this.open();
		const store = this.store();

		return await new Promise((res)=>{
			const request = store.getAll();
			request.onerror = function() {
				res(undefined);
			};
			request.onsuccess = ()=>{
				const result = request.result.map((record)=>{
					return new IndexedDBRecord({record: record, store: this});
				});

				res(result);
			};
		});
	}

	async matchFromStore(store, url, ra) {
		let murl = this.idFromURL(url);

		return new Promise((res)=>{
			const request = store.get(murl);
			request.onerror = function() {
				res(undefined);
			};
			request.onsuccess = ()=>{
				const record = new IndexedDBRecord({record: request.result, store: this});

				if (!record) {
					res(undefined);
					return;
				}

				// let ret = record.data;
				// let ret = new Response(
				// 	record.data,
				// 	{
				// 		status: 200
				// 	});


				if (ra) {
					res([url, record]);
				} else {
					res(record);
				}
			};
		});
	}

	async matchAll(urls) {
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
		let murl = this.idFromURL(url);
		const store = this.store();

		await new Promise((res)=>{
			const request = store.delete(murl);
			request.onerror = function() {
				console.error(request);

				res(undefined);
			};
			request.onsuccess = function() {
				console.error(request);
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

	async put(url, fields={}, lazy) {
		await this.open();

		let murl = this.idFromURL(url);

		return await new Promise((res)=>{
			// response.blob().then((blob)=>{

			const tx = this._db.transaction(['files'], 'readwrite');
			const store = tx.objectStore('files');

			const item = fields;
			item.url = murl;

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

			// });
		});
	}

	async update(row) {
		await this.open();

		const rowCopy = {};
		for (let key in row) {
			if (row[key] instanceof File) {
				row[key] = await this.fileToBlob(row[key]);
			}

			rowCopy[key] = row[key]; // to clone Proxy ?
		}

		return await new Promise((res)=>{
			const tx = this._db.transaction(['files'], 'readwrite');
			const store = tx.objectStore('files');

			try {
				tx.onerror = function() {
					res(true);
				};
				tx.oncomplete = function() {
					res(true);
				};

				const addRequest = store.put(rowCopy);

				addRequest.onerror = function() {
					res(true);
				};
			} catch(e) {
				console.error(e);
			}
		});
	}
}