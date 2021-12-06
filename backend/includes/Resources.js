const fs = require('fs');

let walk = function(dir, done) {
	let results = [];
	fs.readdir(dir, function(err, list) {
		if (err) {
			return done(err);
		}
		let i = 0;
		(function next() {
			let file = list[i++];
			if (!file) {
				return done(null, results);
			}
			file = dir + '/' + file;
			fs.stat(file, function(err, stat) {
				if (stat && stat.isDirectory()) {
					walk(file, function(err, res) {
						results = results.concat(res);
						next();
					});
				} else {
					if (file.slice(-3) === '.js') {
						results.push(file);
					}
					next();
				}
			});
		})();
	});
};

let loadPaths = function(dirname) {
	return new Promise(function(resolve, reject) {
		walk(dirname, function(err, results) {
			if (err) {
				return reject(err);
			}

			resolve(results);
		});
	});
};
exports.loadModelsPaths = loadPaths;

exports.loadModels = function(dirname) {
	return new Promise(function(resolve) {
		loadPaths(dirname).then(function(paths){
			let models = [];
			paths.forEach(function(file){
				let inc = require(file);

				if (inc && typeof inc == 'function') {
					models.push(inc);
				} else {
					console.error('Error: resources: Bad code in '+file+' model');
				}
			});

			resolve(models);
		});
	});
};


// exports.loadPaths = loadPaths;

// exports.loadCommands = function(dirname) {
// 	return new Promise(function(resolve, reject) {

// 		walk(dirname, function(err, results) {
// 			if (err) {
// 				return reject(err);
// 			}

// 			let commands = [];
// 			results.forEach(function(file){
// 				let name = file.substr(file.lastIndexOf('/'), file.indexOf('.'));
// 				let inc = require(file);

// 				commands.push(inc);
// 			});

// 			resolve(commands);
// 		});
// 	});
// };