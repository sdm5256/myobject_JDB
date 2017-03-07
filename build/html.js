var path = require('path');
var fs = require('fs-extra');
var cheerio = require('cheerio');
var filepaths = require('filepaths');
var helper = require('./helper');

var appEntryHtml = path.join(__dirname, '../app/app.html');
var appDistHtml = path.join(__dirname, '../dist/app.html');
var distRoot = path.join(__dirname, '../dist');
var pagesEntry = path.join(__dirname, '../app/pages');

var cssEntryPath = path.join(__dirname, "../app/entry.css");
var jsEntryPath = path.join(__dirname, "../app/entry.js");

var $appHtml = cheerio.load(fs.readFileSync(appEntryHtml, 'utf8'), {
	decodeEntities: false
});

function resolveLinks(pageUrl, $) {
	var hrefArr = [];
	$('link[rel="stylesheet"]').each(function(index, item) {
		hrefArr.push(path.resolve(pageUrl, '..', $(item).attr('href')));
	});
	return hrefArr;
}

function resolveScripts(pageUrl, $) {
	var scriptArr = [];
	$('script[src]').each(function(index, item) {
		scriptArr.push(path.resolve(pageUrl, '..', $(item).attr('src')));
	});
	return scriptArr;
}

function resolveHtml(htmlDestPath, htmlPageName, $) {
	$('link[rel="stylesheet"]').remove();
	$('script[src]').remove();
	$('head').append('<link rel="stylesheet" href="' + htmlPageName.replace('.html', '.css') + '"/>');
	$('body').append('<script src="' + htmlPageName.replace('.html', '.js') + '"></script>');
	fs.writeFileSync(htmlDestPath, $.html());
}

function resolveAppHtml() {
	return new Promise(function(resolve, reject) {
		fs.copy(appEntryHtml, appDistHtml, function (err) {
			if (err) {
				throw new Error(err);
			}

			var stylesLinkArr = [];
			var scriptsSrcArr = [];

			// 本地环境动态读取资源装进html页面
			if (global.env == 'serve') {
				helper.resolveEntry(cssEntryPath).forEach(function(item) {
					stylesLinkArr.push('<link rel="stylesheet" href="' + path.relative(path.join(__dirname, '..'), item) + '"/>');
				});

				var scriptsArr = helper.resolveEntry(jsEntryPath);
				scriptsArr[0].concat(scriptsArr[1]).forEach(function(item) {
					scriptsSrcArr.push('<script src="' + path.relative(path.join(__dirname, '..'), item) + '"></script>');
				});

			} else {
			// 运行环境资源链接
				stylesLinkArr.push('<link rel="stylesheet" href="app.css">');
				scriptsSrcArr.push([
					'<script src="app-base.js"></script>',
					'<script src="app-module.js"></script>'
				].join(''));
			}

			$appHtml('head').append(stylesLinkArr.concat(scriptsSrcArr).join(''));
			fs.writeFileSync(appDistHtml, $appHtml.html());

			console.log('Success: Deploy app.html');
			resolve();
		});
	});
}

function resolvePages() {

	var pagesList = filepaths.getSync(pagesEntry, {ext: '.html'});
	var pagesNum = pagesList.length;

	return new Promise(function(resolve, reject) {
		pagesList.forEach(function(pageUrl, index) {
			var $ = cheerio.load(fs.readFileSync(pageUrl, 'utf8'), {
				decodeEntities: false
			});
			var htmlPageName = path.basename(pageUrl);
			var htmlDestPath = path.join(distRoot, htmlPageName );
			var cssDestPath = htmlDestPath.replace('.html', '.css');
			var jsDestPath = htmlDestPath.replace('.html', '.js');

			helper.concatCompileMinify({
				src: resolveLinks(pageUrl, $),
				dest: cssDestPath,
				type: 'css'
			});

			helper.concatCompileMinify({
				src: resolveScripts(pageUrl, $),
				dest: jsDestPath,
				type: 'js'
			});

			resolveHtml(htmlDestPath, htmlPageName, $);

			if (index == pagesNum - 1) {
				console.log('Success: Pages Deploy');	
				resolve();
			}

		});
	});
}

exports.resolvePages = resolvePages;
exports.resolveAppHtml = resolveAppHtml;

