var path = require('path');
var watch = require('watch');
var templateCache = require('./templateCache');
var scripts = require('./scripts');
var styles = require('./styles');
var assets = require('./assets');
var html = require('./html');
 
function resolveWatch(filePath, watchType) {

	// 是否是多页应用
	var isPages = /\/pages\//.test(filePath);

	if (isPages) {
		html.resolvePages();
	} else if (watchType != 'changed') {
		html.resolveAppHtml();
	}
}

function resolveImage(imagePath) {
	var fromPath = path.resolve(__dirname, '..', imagePath);
	var toPath = fromPath.replace('/assets/', '/dist/');
	assets.copyImage(fromPath, toPath);
};

function createWatcher() {
	watch.createMonitor('./app', {ignoreDotFiles: true}, function (monitor) {
		monitor.on("created", function (f, stat) {
			resolveWatch(f);
		})
		monitor.on("removed", function (f, stat) {
			resolveWatch(f);
		})
		monitor.on("changed", function (f, stat) {
			resolveWatch(f, 'changed');
		})
	});

	watch.createMonitor('./assets/images', {ignoreDotFiles: true}, function (monitor) {
		monitor.on("created", function (f, stat) {
			resolveImage(f);
		})
		monitor.on("changed", function (f, curr, prev) {
			resolveImage(f);
		})
	});
}

exports.createWatcher = createWatcher;

