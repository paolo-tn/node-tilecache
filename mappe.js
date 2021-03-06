exports.mappa = function(config, urlArray, seeding) {
	var callback = arguments[arguments.length - 1];
	// if (typeof(callback) !== 'function') callback = function(){};
	var fs = require('fs'), cache = require('./cache'), path = require('path'), mkdir = require('./mkdir.js');
	var er = true;
	var service = config.services[urlArray[0]];
	if (typeof (service) !== 'undefined') {
		var tilemaps = config.services[urlArray[0]].tilemaps[urlArray[1]];
		if (typeof (tilemaps) !== 'undefined') {
			if ((urlArray[2] >= 0) && (urlArray[2] < (tilemaps.tilesets.length))) {
				er = false;
				var buffer;
				var x = urlArray[3];
				var y = urlArray[4];
				var level = urlArray[2];
				var res = tilemaps.tilesets[level];
				var xdim = tilemaps.TileFormat[0];
				var ydim = tilemaps.TileFormat[1];
				var xorig = tilemaps.origin[0];
				var yorig = tilemaps.origin[1];
				var minx = (res * xdim * x) + xorig;
				var maxx = (res * xdim * (parseInt(x) + 1)) + xorig;
				var miny = (res * ydim * y) + yorig;
				var maxy = (res * ydim * (parseInt(y) + 1)) + yorig;
				var bbox = [ minx, miny, maxx, maxy ];
				var ext = tilemaps.TileFormat[3];
				// var numlevelx = Math.ceil((tilemaps.boundingbox[2] -
				// tilemaps.boundingbox[0])/(xdim*res));
				// var numlevely = Math.ceil((tilemaps.boundingbox[3] -
				// tilemaps.boundingbox[1])/(ydim*res));
				var numlevelx = cache.xlevels(tilemaps, level);
				var numlevely = cache.ylevels(tilemaps, level);
				var ynew = cache.yinvert(y, numlevely);
				if (x > (numlevelx - 1) || y > (numlevely - 1)) {
					var body = 'Index out of bounds: Max x level = ' + (numlevelx - 1)
							+ ' - Max y level = ' + (numlevely - 1);
					er = true;
					return callback(er, body);
				}

				// controllo l'esistenza del file
				var cache = require('./cache.js');
				// var path = require('path');
				var dirStruct = cache.dirStruct(level, x, ynew);
				// var percorso = cache.coordConvert(config.cache_dir,
				// tilemaps.cache, urlArray[2], urlArray[3], urlArray[4],
				// numlevely, ext);
				var root = config.baseurl + config.cache_dir + '/' + tilemaps.cache
						+ '/' + dirStruct.join('/') + '.' + ext;
				// fine controllo
				var format;
				if (ext == 'jpg')
					format = 'jpeg';
				else
					format = ext;
				var option = {
					"format" : format
				};
				var stylesheet = config.baseurl + urlArray[1];
				// var stylesheet = config.baseurl + config.service_dir +'/'+
				// tilemaps.dir + '/'+ urlArray[1];
				// var fs = require('fs');
				// var mkdir = require('./mkdir.js');
				fs.exists(root, function(exists) {
					if (!exists) {
						// cache.controlla(percorso,
						// config.baseurl);
						mkdir.makedir(root.slice(0, -8), function(err, buffer) {
							if (err) {
								// er = true;
								return callback(err, buffer);
							} else {
								// fs.mkdir(path.resolve(config.baseurl
								// +
								// percorso.slice(0,
								// -1).join('/')),
								// function
								// (err){
								// if (err)
								// {console.log('errore:
								// ' + err)}
								// });
								var mapnik = require('mapnik');
								var map = new mapnik.Map(xdim, ydim, config.srs[tilemaps.SRS]);
								map.load(stylesheet, function(err, map) {
									if (err) {
										er = true;
										return callback(er, err.message);
									} else {
										map.maximumExtent = tilemaps.boundingbox;
										map.extent = tilemaps.boundingbox;
										map.srs = config.srs[tilemaps.SRS];
										map.zoomToBox(bbox);
										var im = new mapnik.Image(xdim, ydim);
										var path = require('path');
										map.render(im, function(err, im) {
											if (err) {
												er = true;
												return callback(er, err.message);
											} else {
												im.encode(option.format, function(err, buffer) {
													if (err) {
														er = true;
														return callback(er, err.message);
													} else {
														er = false;
														fs.writeFile(root, buffer, function(err) {
															if (err) console.log(err);
														});
														return callback(er, buffer);
													}
												});
											}
										});
									}
								});
							}
						});
					} else {
						if (!seeding) {
							fs.readFile(root, function(err, buffer) {
								if (err) console.log(err);
								er = false;
								buf = buffer;
								return callback(er, buffer);
							});
						} else {
							er = false;
							return callback(er, buffer);
						}
					}
				});
			}
		}
	}
}

exports.mappaSeed = function(config, urlArray) {
	var callback = arguments[arguments.length - 1];
	// if (typeof(callback) !== 'function') callback = function(){};
	var fs = require('fs'), cache = require('./cache');
	var er = true;
	// var EventEmitter = require('events').EventEmitter;
	// var ee = new EventEmitter();
	// ee.addListener('event', process);
	var service = config.services[urlArray[0]];
	if (typeof (service) !== 'undefined') {
		var tilemaps = config.services[urlArray[0]].tilemaps[urlArray[1]];
		if (typeof (tilemaps) !== 'undefined') {
			if ((urlArray[2] >= 0) && (urlArray[2] < (tilemaps.tilesets.length))) {
				er = false;

				var res = tilemaps.tilesets[urlArray[2]];
				var xdim = tilemaps.TileFormat[0];
				var ydim = tilemaps.TileFormat[1];
				var xorig = tilemaps.origin[0];
				var yorig = tilemaps.origin[1];
				var minx = (res * xdim * urlArray[3]) + xorig;
				var maxx = (res * xdim * (parseInt(urlArray[3]) + 1)) + xorig;
				var miny = (res * ydim * urlArray[4]) + yorig;
				var maxy = (res * ydim * (parseInt(urlArray[4]) + 1)) + yorig;
				var bbox = [ minx, miny, maxx, maxy ];
				var numlevelx = Math
						.ceil((tilemaps.boundingbox[2] - tilemaps.boundingbox[0])
								/ (xdim * res));
				var numlevely = Math
						.ceil((tilemaps.boundingbox[3] - tilemaps.boundingbox[1])
								/ (ydim * res));
				if (urlArray[3] > (numlevelx - 1) || urlArray[4] > (numlevely - 1)) {
					var body = 'Index out of bounds: Max x level = ' + (numlevelx - 1)
							+ ' - Max y level = ' + (numlevely - 1);
					er = true;
					return callback(er, body);
				}

				// controllo l'esistenza del file
				var cache = require('./cache.js');
				var path = require('path');
				var percorso = cache.coordConvert(config.cache_dir, tilemaps.cache,
						urlArray[2], urlArray[3], urlArray[4], numlevely,
						tilemaps.TileFormat[3]);
				var root = config.baseurl + percorso.join('/');
				// fine controllo
				var format = '';
				if (tilemaps.TileFormat[3] == 'jpg') {
					format = 'jpeg';
				} else {
					format = tilemaps.TileFormat[3];
				}
				var option = {
					"format" : format
				};
				var stylesheet = config.baseurl + config.service_dir + '/'
						+ tilemaps.dir + '/' + urlArray[1];
				var fs = require('fs');
				var buffer;
				var mkdir = require('./mkdir.js');
				fs.exists(root, function(exists) {
					// fs.readFile(root, function (err, buffer){

					if (!exists) {
						// cache.controlla(percorso,
						// config.baseurl);
						mkdir.makedir(config.baseurl + percorso.slice(0, -1).join('/'),
								function(err) {
									if (err) {
										er = true;
										return callback(err, buffer);
									} else {
										// fs.mkdir(path.resolve(config.baseurl
										// +
										// percorso.slice(0,
										// -1).join('/')),
										// function
										// (err){
										// if (err)
										// {console.log('errore:
										// ' + err)}
										// });

										var mapnik = require('mapnik');
										var map = new mapnik.Map(xdim, ydim,
												config.srs[tilemaps.SRS]);
										map.load(stylesheet, function(err, map) {
											if (err) {
												er = true;
												return callback(er, err.message);
											} else {
												map.maximumExtent = tilemaps.boundingbox;
												map.extent = tilemaps.boundingbox;
												map.srs = config.srs[tilemaps.SRS];
												map.zoomToBox(bbox);
												var im = new mapnik.Image(xdim, ydim);
												var path = require('path');
												// map.renderFileSync(path.resolve(root),
												// option);
												// map.renderFile(path.resolve(root),
												// option,
												// function(err,
												// buffer){
												// if
												// (err)
												// {console.log(err);}});
												// console.log('creo
												// il
												// file
												// ' +
												// path.resolve(root));
												map.render(im, function(err, im) {
													if (err) {
														er = true;
														return callback(er, err.message);
													} else {
														im.encode(option.format, function(err, buffer) {
															if (err) {
																er = true;
																return callback(er, err.message);
															} else {
																er = false;
																fs.writeFile(root, buffer, function(err) {
																	if (err) {
																		console.log('errore is: ' + err);
																	}
																});
																return callback(er, buffer);
															}
														});
													}
												});
											}
										});
									}
								});
					} else {
						er = false;
						buf = buffer;
						return callback(er, buffer);
					}
				});
			}
		}
	}
}
