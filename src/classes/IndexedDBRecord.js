

export default class IndexedDBRecord {
	constructor({record={}, store=null} = {}) {
		console.error('IndexedDBRecord', record);

		Object.assign(this, {record, store});
	}

	get(propertyName, defaultValue = null) {
		if (this.record[propertyName] !== undefined) {
			return this.record[propertyName];
		}

		return defaultValue;
	}

	set(propertyName, value) {
		this.record[propertyName] = value;
	}

	async save() {
		if (!this.store) {
			throw new Error('IndexedDB store is not defined for this record');
		}

		console.error(this.record);

		return await this.store.update(this.record);
	}

	async remove() {
		if (!this.store) {
			throw new Error('IndexedDB store is not defined for this record');
		}

		return await this.store.deleteUrl(this.get('url'));

	}
}