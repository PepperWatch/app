const fs = require('fs');
const path = require('path');

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

let loadRoutes = function() {
	let dirname = path.join(__dirname);

	return new Promise(function(resolve) {
		loadPaths(dirname).then(function(paths){
			let routes = [];
			paths.forEach(function(file){
				let inc = require(file);

				if (inc && typeof inc == 'function') {
					routes.push(inc);
				}
			});

			resolve(routes);
		});
	});
};


exports.loadRoutes = loadRoutes;