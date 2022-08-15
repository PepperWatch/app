

class AbstractModel {
	constructor(params = {}) {
		// this._collection; // set as getter on ModelFactory -> getModel  to avoid memory over consumption
		// this._api; // set as getter on ModelFactory -> getModel  to avoid memory over consumption
		// getters setters for fields, .property , .field set on ModelFactory -> getModel
		// and virtuals from mongoose model too
		//
		this._fields = params.fields || {};
	}

	get fields() {
		return this._fields;
	}

	toJSON() {
		return this._fields;
	}

	/**
	 * Save document on the server
	 * @param  {Object} params Optional params to pass for API methods. populate - is important one
	 * @return {Boolean}        true on success
	 */
	async save(params = {}) {
		if (this._id) {
			const savedOnServer = await this._collection.edit(this, params);
			Object.assign(this._fields, savedOnServer);

			return true;
		} else {
			const savedOnServer = await this._collection.post(this, params);
			Object.assign(this._fields, savedOnServer);

			return true;
		}
	}

	async delete() {
		const success = await this._collection.delete(this);

		return success;
	}
}

module.exports = AbstractModel;