export default class TelegramThreadInvoker {
	constructor(params = {}) {
		this._items = params.items || [];
		this._proceededItems = 0;

		this._callbackFunction = params.callback || null;

		this._timeout = null;

		this._minTimeout = 100;
		this._maxParallel = 8;

		this._active = false;

		this._isRunning = false;

		this._threads = {};
	}

	clear() {
		this._items = [];
		this._proceededItems = 0;
	}

	push(item) {
		this._items.push(item);
	}

	start() {
		if (!this._active) {
			this._active = true;
			this.startInterval();
		}
	}

	stop() {
		this._active = false;
	}

	async doThread(i) {
		if (!this._active) {
			clearTimeout(this._threads[''+i]);
			return;
		}

		const itemToDo = this._items[this._proceededItems];
		if (itemToDo) {
			this._proceededItems++;

			await new Promise((res)=>{
					try {
						this._callbackFunction(itemToDo)
							.finally(()=>{
								res();
							});
					} catch(e) {
						// ok to be here if callback is not async
						res();
					}
				});
		}

		clearTimeout(this._threads[''+i]);
		this._threads[''+i] = setTimeout(()=>{
			this.doThread(i);
		}, this._minTimeout);
	}

	startInterval() {
		for (let i = 0; i < this._maxParallel; i++) {
			this.doThread(i);
		}
		// this._timeout = setTimeout(async ()=>{
		// 	if (this._active) {
		// 		this._isRunning = true;
		// 		await this.doRun();
		// 		this._isRunning = false;
		// 	}
		// 	if (this._active) { // may be changed while (this.doRun)
		// 		this.startInterval();
		// 	}
		// }, this._minTimeout);
	}

	// async doRun() {
	// 	const itemsToDo = this._items.slice(this._proceededItems, this._proceededItems + this._maxParallel);
	// 	this._proceededItems = this._proceededItems + itemsToDo.length;

	// 	const promises = [];
	// 	for (let item of itemsToDo) {
	// 		promises.push(new Promise((res)=>{
	// 			try {
	// 				this._callbackFunction(item)
	// 					.finally(()=>{
	// 						res();
	// 					});
	// 			} catch(e) {
	// 				// ok to be here if callback is not async
	// 				res();
	// 			}
	// 		}));
	// 	}

	// 	await Promise.all(promises);
	// }
}