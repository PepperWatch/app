const AbstractModel = require('shared/classes/AbstractModel.js');

module.exports = class User extends AbstractModel {
	constructor(params = {}) {
		super(params);
	}

	async setIsVisibleOnHomepage(isVisible) {
		this.isVisibleOnHomepage = isVisible;
		await this.save();
	}

	async markAsVerified() {
		this.isCollectionVerified = true;
		await this.save();
	}
}