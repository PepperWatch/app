
export default class LocalCachedMethods extends EventTarget {
	constructor() {
		super();

		this._singleThreads = {

		};
	}

	isThereSingleThread(threadId) {
		if (this._singleThreads[threadId]) {
			return true;
		}

		return false;
	}

	async waitForSingleThread(threadId) {
		if (this._singleThreads[threadId]) {
			return await this._singleThreads[threadId].promise;
		}
	}

	createSingleThread(threadId) {
		this._singleThreads[threadId] = {};
		this._singleThreads[threadId].promise = new Promise((res)=>{
			this._singleThreads[threadId].resolver = res;
		});
	}

	resolveSingleThread(threadId, data) {
		if (this._singleThreads[threadId]) {
			this._singleThreads[threadId].resolver(data);
		}
	}

	getCached(cacheId, cacheLifetime) {
		const cachedAt = parseInt(localStorage.getItem(cacheId+'_at'), 10);
		const cached = localStorage.getItem(cacheId);

		if (cached && Math.abs((new Date(cachedAt)).getTime() - (new Date()).getTime()) < cacheLifetime) {
			return cached;
		}

		return null;
	}

	setCache(cacheId, object) {
		localStorage.setItem(cacheId, object);
		localStorage.setItem(cacheId+'_at', (new Date()).getTime());
	}

	clearCache(cacheId) {
		localStorage.removeItem(cacheId);
		localStorage.removeItem(cacheId+'_at');
	}

}