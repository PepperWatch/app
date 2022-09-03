const AbstractModel = require('shared/classes/AbstractModel.js');

module.exports = class User extends AbstractModel {
	constructor(params = {}) {
		super(params);
	}

	async setIsVisibleOnHomepage(isVisible) {
		this.isVisibleOnHomepage = isVisible;
		if (!isVisible) {
			this.isPriorityOnHomepage = false;
		}
		await this.save();
	}

	async setIsPriorityOnHomepage(isPrioritized) {
		this.isPriorityOnHomepage = isPrioritized;
		await this.save();
	}

	async markAsVerified() {
		this.isCollectionVerified = true;
		await this.save();
	}
}