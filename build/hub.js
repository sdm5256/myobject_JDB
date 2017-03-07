// 当前环境
var env = process.argv[2] || 'serve';
// 是否压缩代码
var isMin = env != 'serve' && process.argv[3] != 'false';
var path = require('path');
var fs = require('fs-extra');
var helper = require('./helper').initCommonParams(env, isMin);
var assets = require('./assets');
var html = require('./html');
var scripts = require('./scripts');
var server = require('./server');
var styles = require('./styles');
var revall = require('./revall');
var distRoot = path.join(__dirname, '../dist');

function distribute() {

	// 先清空dist目录
	fs.emptyDirSync(distRoot);

	if (env == 'serve') {
		Promise.all([
			// 处理多页面pages目录
			html.resolvePages(),
			// 部署app.html入口页面
			html.resolveAppHtml(),
			assets.copyImagesDir(),
			assets.copyFavicon(),
			assets.copyFonts(),
		])
		.then(function() {
			server.startServer();
		});
	
	} else {
		Promise.all([

			// 处理多页面pages目录
			html.resolvePages(),

			// 部署app.html入口页面
			html.resolveAppHtml(),

			// 静态资源的处理
			assets.copyAndMinifyImages(),
			assets.copyFavicon(),
			assets.copyFonts(),

			// 基本依赖脚本、业务脚本、业务View的打包
			scripts.resolveBaseScripts(),
			scripts.resolveModuleScriptsAndView(),

			// 样式文件的打包
			styles.resolveStyles()
		])
		.then(function() {
			revall.revAllResource();
		});
	}
}

exports.distribute = distribute;

