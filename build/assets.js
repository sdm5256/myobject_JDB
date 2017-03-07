var path = require('path');
var fs = require('fs-extra');
var filepaths = require('filepaths');

var fontsCopy2Dest = [
	['../node_modules/bootstrap/dist/fonts/', '../dist/fonts'],
	['../app/libs/videojs/dist/video-js/fonts/', '../dist/fonts'],
	['../app/libs/flat-ui/dist/fonts/glyphicons/', '../dist/fonts/glyphicons'],
	['../app/libs/font-awesome/fonts/glyphicons/', '../dist/fonts/glyphicons']
];

// process.setMaxListeners(0);
require('events').EventEmitter.prototype._maxListeners = 10000;

var imagemin = require('imagemin');
var imageminOptipng = require('imagemin-optipng');
var imageminJpegtran = require('imagemin-jpegtran');
 
function copyAndMinifyImages() {

	return imagemin([path.join(__dirname ,'../assets/images/*')], path.join(__dirname, '../dist/images/'), {
		plugins: [
			imageminJpegtran(),
			imageminOptipng()
		]
	}).then(function(files) {
		console.log('Success: Minify Images');
	});

}

function copyImagesDir() {

	return new Promise(function(resolve, reject) {
		fs.copy(path.join(__dirname ,'../assets/images/'), path.join(__dirname, '../dist/images/'), function (err) {
			if (err) {
				throw new Error(err);
			}
			console.log('Success: Copy Images');
			resolve();
		});
	});
}

function copyFavicon() {
	return new Promise(function(resolve, reject) {
		fs.copy(path.join(__dirname, '../assets/favicon.ico'), path.join(__dirname, '../dist/favicon.ico'), function (err) {
			if (err) {
				throw new Error(err);
			}
			console.log('Success: Copy Favicon');
			resolve();
		});
	});
}

function copyFonts() {
	return new Promise(function(resolve, reject) {
		var len = fontsCopy2Dest.length;
		fontsCopy2Dest.forEach(function(item, index) {
			var fontsArr = filepaths.getSync(path.join(__dirname, item[0]));
			fontsArr.forEach(function(fontsPath) {
				var basename = path.basename(fontsPath);
				fs.copySync(fontsPath, path.join(__dirname, item[1], basename));
			});
		});
		console.log('Success: Copy Fonts');
		resolve();
	});
}

function copyImage(imageFromPath, imageToPath) {
	return new Promise(function(resolve, reject) {
		fs.copy(imageFromPath, imageToPath, function (err) {
			if (err) {
				throw new Error(err);
			}
			console.log('Success: Copy '+ imageFromPath);
			resolve();
		});
	});
}

exports.copyAndMinifyImages = copyAndMinifyImages;
exports.copyFavicon = copyFavicon;
exports.copyFonts = copyFonts;
exports.copyImage = copyImage;
exports.copyImagesDir = copyImagesDir;

