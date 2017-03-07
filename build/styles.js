var concat = require('concat-files');
var path = require("path");
var less = require('less');
var fs = require('fs-extra');
var helper = require('./helper');

var cssEntryPath = path.join(__dirname, "../app/entry.css");
var cssOutputPath = path.join(__dirname, "../dist/app.css");

// 合并[压缩]处理样式
function resolveStyles() {
	return helper.concatCompileMinify({
		src: helper.resolveEntry(cssEntryPath),
		dest: cssOutputPath,
		type: 'css'
	})
	.then(function() {
		console.log('Success: App Styles');
	});
}

exports.resolveStyles = resolveStyles;

