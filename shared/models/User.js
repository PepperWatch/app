const AbstractModel = require('shared/classes/AbstractModel.js');

module.exports = class User extends AbstractModel {
	constructor(params = {}) {
		super(params);
	}

	get notificationsCount() {
		return this._notificationsCount || null;
	}

	async getNotificationsCount() {
		const collection = this._api.collection('notifications');
		const list = await collection.list({filter: 'user='+this._id});
		this._notificationsCount = list.total;
	}
}