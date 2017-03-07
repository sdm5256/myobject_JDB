var filepaths = require('filepaths');
var path = require("path");
var fs = require('fs-extra');
var execall = require('execall');
var concat = require('concat-files');
var uglifyjs = require("uglify-js");
var less = require('less');
var env = '';

var entryType = '';
var typeSuffix = {
	css: {
		ext: ['.css', '.less']
	},
	js: {
		ext: '.js'
	}
};
var basePathsArr = [];
var modulePathsArr = [];
var pathsRegex = /require\(\s*[\"\']\s*(.+)\s*[\"\']\s*\)/g;

function initCommonParams(envName, isMin){
	env = envName;
	global.env = envName;
	global.isMin = isMin;
}

function resolvePath(matchPath) {
	var matchArr = [];
	var isBaseScriptsRegex = /\/libs\/|\/node_modules\//;
	if (!fs.existsSync(matchPath)) {
		throw new Error(matchPath + ' Not Found');
	}

	if (!isBaseScriptsRegex.test(matchPath)) {
		matchArr = filepaths.getSync(matchPath, typeSuffix[entryType]);
		if (entryType == 'js') {
			modulePathsArr = modulePathsArr.concat(matchArr);
		} else {
			basePathsArr = basePathsArr.concat(matchArr);
		}
	} else {
		basePathsArr.push(matchPath);
	}

}

function resolveEntry(entryPath) {

	var fileContent = fs.readFileSync(entryPath, 'utf8');	
	var pathMathArr = execall(pathsRegex, fileContent);

	// reset
	basePathsArr = [];
	modulePathsArr = [];

	entryType = entryPath.split('.').pop();
	pathMathArr.forEach(function(item) {
		var subMatch = item.sub[0];
		var subMatchPath = path.resolve(entryPath, '..', subMatch);
		resolvePath(subMatchPath);
	});

	if (entryType == 'css') {
		return basePathsArr;	
	} else {
		return [basePathsArr, modulePathsArr];
	}
}

function compileLess(outputPath, resolve, reject) {
	var lessContent = fs.readFileSync(outputPath, 'utf8');
	less.render(lessContent, {compress: global.isMin}, function (e, output) {
		if (e) {
			reject(e);
			throw new Error(e);	
		}
		fs.writeFileSync(outputPath, output.css);
		resolve();
	});
};

function minifyJs(outputPath, resolve, reject) {
	if (!global.isMin) {
		resolve();
		return;	
	}

	try {
		var result = uglifyjs.minify(outputPath, {mangle: false});
		fs.writeFileSync(outputPath, result.code);
		resolve();
	} catch(e) {
		reject(e);
		throw new Error(e);	
	}
}

function concatCompileMinify(options) {

	return new Promise(function(resolve, reject) {

		if (!options.src || !options.src.length) {
			resolve();
			return;	
		}

		concat(options.src, options.dest, function(e) {

			if (e) {
				reject(e);
				throw new Error(e);	
			}

			if (options.type == 'css') {
				compileLess(options.dest, resolve, reject);
			} else {
				minifyJs(options.dest, resolve, reject);
			}
			resolve();
		});
	});
}

exports.initCommonParams = initCommonParams;
exports.resolveEntry = resolveEntry;
exports.concatCompileMinify = concatCompileMinify;

