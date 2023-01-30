class Row {
	constructor() {
		this.items = [];
		this.widths = [];
		this.idWidth = {};
		this.filledWidth = 0;
		this.isFull = false;
        this.isEnded = false;
	}

    end() {
        this.isEnded = true;
    }

    unshift(itemOrArrayOfItems) {
        const countOfItemsOnStart = this.items.length;

        console.error('There was ', countOfItemsOnStart, 'items when we started');
        this.isFull = false;
        this.widths = [];
        this.idWidth = {};
        this.filledWidth = 0;

        const itemsBack = this.items.slice();
        this.items = [];

        // keep the back item on its place
        for (let item of itemsBack) {
            if (item.isBackButton) {
                this.pushIfHasSpace(item);
            }
        }

        let itemsToUnshift = [];
        if (Array.isArray(itemOrArrayOfItems)) {
            itemsToUnshift = itemOrArrayOfItems;
        } else {
            itemsToUnshift = [itemOrArrayOfItems];
        }

        for (let item of itemsToUnshift) {
            const addedPushedSuccess = this.pushIfHasSpace(item); // push the one we are adding
            console.error('unshifting the one we adding: ', addedPushedSuccess);
        }


        let pushingItem = null;
        do {
            pushingItem = itemsBack.shift(); // get items one by one

            if (pushingItem && !pushingItem.isBackButton) {
                const success = this.pushIfHasSpace(pushingItem); // and push them again

                if (!success && this.isFull) {
                    itemsBack.unshift(pushingItem); // get it back if there's no more place
                }
            }
        } while(!this.isFull && itemsBack.length);

        // on this step itemBack consist of items we have to move to the next row, lets return them
        console.error('There re items', itemsBack, 'to move to the next row');
        return itemsBack;
    }

    pushIfHasSpace(item) {
        if (this.isFull) {
            return false;
        }

        const itemRatio = item.ratio;

        if (!itemRatio) {
            return false;
        }

        const minPercent = 15;
        const maxPercent = 30;
        const minRatioToUse = 0.5;
        const maxRatioToUse = 2;
        let ratioToUse = itemRatio;
        if (ratioToUse < minRatioToUse) {
            ratioToUse = minRatioToUse;
        } else if (ratioToUse > maxRatioToUse) {
            ratioToUse = maxRatioToUse;
        }

        let width = Math.floor((ratioToUse / maxRatioToUse)*maxPercent);
        if (width < minPercent) {
            width = minPercent;
        }

        // console.error('width', width, ratioToUse);

        let success = false;

        if (this.filledWidth + width <= 100) {
            this.filledWidth = this.filledWidth + width;
            this.widths.push(width);
            this.items.push(item);

            success = true;
        } else {
            const expectedWidth = this.filledWidth + width;
            const k = 100 / expectedWidth;

            for (let i = 0; i < this.widths.length; i++) {
                this.widths[i] = this.widths[i] * k;
            }

            this.widths.push(width*k);
            this.items.push(item);
            this.filledWidth = 100;
            this.isFull = true;

            success = true;
        }

        if (this.filledWidth + minPercent > 100) {
            const curWidth = this.filledWidth;
            const k = 100 / curWidth;
            for (let i = 0; i < this.widths.length; i++) {
                this.widths[i] = this.widths[i] * k;
            }
            this.isFull = true;
        }

        return success;
    }
}

class RowBuilder {
	constructor() {
		this._rows = [];
	}

	get rows() {
		return this._rows;
	}

	push(item) {
        // console.log('pushing', item);
		const lastRow = this._rows[this._rows.length - 1];
		let success = false;
		if (lastRow) {
			success = lastRow.pushIfHasSpace(item);
		}

		if (!success) {
			const row = new Row();
            this._rows.push(row);
			success = row.pushIfHasSpace(item);
		}

		return success;
	}

    unshift(item) {
        console.log('unshifting', item);

        let rowIndex = 0;
        let shiftingItems = [item];

        do {
            let row = this._rows[rowIndex];
            if (!row) {
                row = new Row();
                this._rows.push(row);
            }
            shiftingItems = row.unshift(shiftingItems);
            rowIndex++;
        } while (shiftingItems.length);
    }

    end() {
        const lastRow = this._rows[this._rows.length - 1];
        if (lastRow) {
            lastRow.end();
        }
    }
}

module.exports = RowBuilder;