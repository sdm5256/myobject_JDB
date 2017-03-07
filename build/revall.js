var filepaths = require('filepaths');
var revFile = require('rev-file');
var path = require("path");
var fs = require('fs-extra');
var execall = require('execall');
var cjson = require('cjson');


var distRoot = path.join(__dirname, '../dist/');
var moduleOutputPath = path.join(__dirname, "../dist/app-module.js");
var thirdApiJson = path.join(__dirname, "../assets/apis/third.json");
var distManifestPath = path.join(distRoot , 'rev-manifest.json'); 


var revFileRegexConfig = {
	html: /(src|href)=\s*(["']?)\s*([^>]+?\.(png|jpg|js|css|mp4))\s*\2/g,
	css: /url\(\s*[\"\']?\s*(.+?)\s*[\"\']?\s*\)/g,
	js: /(['"])(\.\.\/)*images\/.+?\.(png|jpg)\1|(=)(\.\.\/)*images\/.+?\.(png|jpg)/g
}
// var jsPathsRegex = /(\.\.\/)*images\/.+?\.(png|jpg)/g;


// 资源前缀配置
var urlPrefixConfig = {
	dev: {
		font: '/static/',
		other: '/static/'
	},
	test: {
		font: '/static/',
		other: '/static/'
	},
	beta: {
		font: '/static/',
		other: '/static/'
	},
	huidu: {
		font: '/static/',
		other: '/static/'
	},
	prod: {
		font: 'https://qiye.jiedaibao.com/static/',
		other: 'https://static-qiye.jiedaibao.com.cn/static/'
	}
};

var env = global.env;
var revManifest = {};

function fixPath(pathUrl) {
	return pathUrl.replace(/'|"|=|\.\.\/|\.\//g, '');
}

function revDistFiles() {
	var imagePathArr = filepaths.getSync(path.join(distRoot, 'images'));
	var jsCssPathArr = filepaths.getSync(distRoot, {ext: ['.css', '.js']});

	jsCssPathArr.concat(imagePathArr).forEach(function(item) {
		var key = path.relative(distRoot, item);
		var filePath = revFile.sync(item);
		revManifest[key] = path.relative(distRoot, filePath);
	});
	fs.writeFileSync(distManifestPath, JSON.stringify(revManifest, null, 4));
}

function resolveFileRev(filePath, fileType) {
	var fileContent = fs.readFileSync(filePath, 'utf8');
	var revRegex = revFileRegexConfig[fileType];
	var pathMathArr = execall(revRegex, fileContent);

	pathMathArr.forEach(function(matchItem) {

		if (fileType == 'js') {
			var fixedPath = fixPath(matchItem.match);
			var matchText = matchItem.match.replace(/'|"|=/g, '');
		} else if (fileType == 'css') {
			var fixedPath = fixPath(matchItem.sub[0]);
			var matchText = matchItem.sub[0].replace(/'|"/g, '');
		} else {
			var fixedPath = fixPath(matchItem.sub[2]);
			var matchText = matchItem.sub[2].replace(/'|"/g, '');
		}

		var prefixType = fixedPath.indexOf('fonts') > -1 ? 'font' : 'other';

		if (!/^\s*http/.test(fixedPath)) {
			if (prefixType == 'font') {
				var replaceText = urlPrefixConfig[env][prefixType] + fixedPath;
			} else {
				var replaceText = urlPrefixConfig[env][prefixType] + revManifest[fixedPath];
			}
			fileContent = fileContent.replace(matchText, replaceText);
		}
	});

	if (pathMathArr.length > 0) {
		fs.writeFileSync(filePath, fileContent);
	}
}

function resolveScriptsRev() {
	var jsPathArr = filepaths.getSync(distRoot, {
		ext: '.js',
		ignore: 'app-base.js'
	});

	jsPathArr.forEach(function(item) {
		resolveFileRev(item, 'js');
	});
}

function resolveStylesRev() {
	var cssPathArr = filepaths.getSync(distRoot, {
		ext: '.css'
	});

	cssPathArr.forEach(function(item) {
		resolveFileRev(item, 'css');
	});
}

function resolveHtmlsRev() {
	var htmlPathArr = filepaths.getSync(distRoot, {
		ext: '.html'
	});

	htmlPathArr.forEach(function(item) {
		resolveFileRev(item, 'html');
	});
}

function resolveFileName() {
	for (var key in revManifest) {
		fs.renameSync(path.join(distRoot, key), path.join(distRoot, revManifest[key]));
	}
}

function resolveThirdApis() {
	if (env != 'prod') {
		var fileContent = fs.readFileSync(moduleOutputPath, 'utf8');
		var thirdApiConfig = cjson.load(thirdApiJson);
		for (var key in thirdApiConfig) {
			fileContent = fileContent.replace(new RegExp(key, 'g'), thirdApiConfig[key][env]);
		}
		fs.writeFileSync(moduleOutputPath, fileContent);
	}
}

function revAllResource() {
	revDistFiles();
	resolveScriptsRev()
	resolveStylesRev();
	resolveHtmlsRev();
	resolveThirdApis();
	resolveFileName();
	console.log('Success: Rev All Resource');
	console.log('\nFinished Success!');	
}

exports.fixPath = fixPath;
exports.revAllResource = revAllResource;

