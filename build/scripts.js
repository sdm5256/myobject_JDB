var concat = require('concat-files');
var path = require("path");
var uglifyjs = require("uglify-js");
var fs = require('fs-extra');
var helper = require('./helper');
var templateCache = require('./templateCache');

var jsEntryPath = path.join(__dirname, "../app/entry.js");
var baseOutputPath = path.join(__dirname, "../dist/app-base.js");
var moduleOutputPath = path.join(__dirname, "../dist/app-module.js");
var templateEntryPath = path.join(__dirname, "../dist/templatecache.js");

var env = global.env;

// 合并[压缩]基础模块
function resolveBaseScripts() {
	return helper.concatCompileMinify({
		src: helper.resolveEntry(jsEntryPath)[0],
		dest: baseOutputPath,
		type: 'js'
	})
	.then(function() {
		console.log('Success: Base Scripts');
	});
}

// 合并[压缩]业务模块
function resolveModuleScripts() {
	return helper.concatCompileMinify({
		src: helper.resolveEntry(jsEntryPath)[1],
		dest: moduleOutputPath,
		type: 'js'
	})
	.then(function() {
		console.log('Success: Modules Scripts');
	});
}

// 合并[压缩]业务模块和View
function resolveModuleScriptsAndView() {

	return new Promise(function(resolve, reject) {
		Promise.all([
			resolveModuleScripts(),
			templateCache.createTemplateCache()
		])
		.then(function() {

			helper.concatCompileMinify({
				src: [moduleOutputPath, templateEntryPath],
				dest: moduleOutputPath,
				type: 'js'
			})
			.then(function() {
				// 删除templatecache文件
				console.log('Success: Merge Modules Scripts And Views');
				resolve();
			});
		});
	});
}


exports.resolveBaseScripts = resolveBaseScripts;
exports.resolveModuleScripts = resolveModuleScripts;
exports.resolveModuleScriptsAndView = resolveModuleScriptsAndView;

