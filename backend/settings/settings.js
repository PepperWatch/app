if (typeof __webpack_require__ === 'function') {
	throw new Error("You'd better not include this little piece for frontend scripts, honey");
}

const path = require('path');
const pjson = require(path.join(__dirname, '../package.json'));

// let isHeroku = false;
// if ( (process.env._ && process.env._.indexOf("heroku")  != -1) || (process.env.NODE && ~process.env.NODE.indexOf("heroku") != -1) ) {
// 	isHeroku = true;
// }



module.exports = {
	"name": pjson.description || pjson.name,
	"version": pjson.version,
	"debug": true,
	"paths": {
		"commands": path.join(__dirname, "../commands"),
		"models": path.join(__dirname, "../models"),
	},
	server: {
		port: process.env.PORT || 9090
	},
	database: {
		"database": process.env.MONGODB_URI || "mongodb://localhost:27017/pepper",
		"dialect": "mongodb"
	},
	terra: {
		walleyMnemonicKey: (process.env.TERRA_WALLET_MK || 'notice oak worry limit wrap speak medal online prefer cluster roof addict wrist behave treat actual wasp year salad speed social layer crew genius'),
	},
};