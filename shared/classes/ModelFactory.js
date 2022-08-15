import backendModelsDefinitions from 'val-loader!shared/webpack-val-loader/models.js';
import AbstractModel from './AbstractModel.js';
import models from 'shared/models';

function createFieldDeclaration(modelDefinition, api) {
	const decl = {};
	for (var i = 0; i < modelDefinition.fields.length; i++) {
		(function(fieldSettings) {
			const fieldName = fieldSettings.name;
			const def = fieldSettings.default;

			decl[fieldName] = {
				get: function () {
					if (def !== undefined && this._fields[fieldName] === undefined) {
						return def;
					}

					return this._fields[fieldName];
				},
				set: function (value) {
					this._fields[fieldName] = value;
				}
			}
		})(modelDefinition.fields[i]);
	}

	for (let key in modelDefinition.virtuals) {
		(function(virtualSettings) {
			decl[virtualSettings.name] = {
				get: function () {
					return virtualSettings.getter.call(this);
				},
				set: function (value) {
					return virtualSettings.setter.call(this, value);
				}
			}
		})(modelDefinition.virtuals[key]);
	}

	(function(api, collectionName) {
		const collection = api.collection(collectionName);
		decl._collection = {
			get: function () {
				return collection;
			},
			set: function() {

			},
		};
		decl._api = {
			get: function () {
				return api;
			},
			set: function() {

			},
		};
	})(api, modelDefinition.collectionName);

	return decl;
}

export default class ModelFactory {
	constructor(params = {}) {
		this._collection = params.collection;
		this._fields = params.fields;
	}

	static getModel(name, api) {
		if (this.__modelsCache && this.__modelsCache[name]) {
			return this.__modelsCache[name];
		}

		if (!backendModelsDefinitions[name]) {
			for (const key in backendModelsDefinitions) {
				if (backendModelsDefinitions[key].collectionName == name) {
					return this.getModel(backendModelsDefinitions[key].name);
				}
			}

			throw new Error('Model is not defined on backend');
		}

		function Model(params = {}) {
			this._model = (''+name);
			this._fields = params.fields || {};
			this._collection = params.collection || null;
		}

		let protoToUse = AbstractModel.prototype;
		if (models[name]) {
			protoToUse = models[name].prototype;
		}

		Model.prototype = Object.create(protoToUse, createFieldDeclaration(backendModelsDefinitions[name], api));

		if (!this.__modelsCache) {
			this.__modelsCache = {};
		}
		this.__modelsCache[name] = Model;

		return Model;
	}
}