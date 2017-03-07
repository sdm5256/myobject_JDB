var path = require('path');
var fs = require('fs-extra');
var connect = require('connect');
var http = require('http');
var less = require('less');
var static = require('serve-static');
// var livereload = require('livereload');
var opn = require('opn');
var filepaths = require('filepaths');
var cjson = require('cjson');
var execall = require('execall');
var watcher = require('./watch');
var revall = require('./revall');
var app = connect();
var bodyParser = require('body-parser');
var rootPath = path.join(__dirname, '../dist');
var apiJsonsPath = path.join(__dirname, '../assets/apis');

String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

app.use(bodyParser.urlencoded({extended: true}));
app.use(static(rootPath));
app.use(function(req, res){

	// 实时取接口配置
	var apiJsonsConfig = cjson.load(filepaths.getSync(apiJsonsPath, {ext: '.json'}), true);

	var url = req.url == '/' ? 'app.html' : req.url;
	// 请求文件路径
	url = url.split('?')[0];
	// 接口mock配置
	var jsonConfig = apiJsonsConfig[url.trim()];

	// 如果是接口请求则返回mock数据
	if (jsonConfig) {
		var jsonUrl = jsonConfig;
		if (typeof jsonConfig == 'object') {
			jsonUrl = jsonConfig.serve;
		}
		url = path.resolve(rootPath, '../assets', jsonUrl);
		res.setHeader("Content-Type", "application/json; charset=utf-8");

	// 图片资源
	} else if (/images\//.test(url)) {
		url = path.resolve(rootPath, 'images/', url.split('images/')[1]);

	// 字体资源
	} else if (/fonts\//.test(url)) {
		url = path.resolve(rootPath, 'fonts/', url.split('fonts/')[1]);

	// 依赖文件处理
	} else if (/app\/|node_modules\//.test(url)) {
		url = path.resolve(rootPath, '..', url.substr(1));

	// 业务模块文件
	} else if (/modules\/|directives\//.test(url)) {
		url = path.resolve(rootPath, '../app', url.substr(1));

	// 其他资源(已在dist目录里)
	} else {
		url = path.join(rootPath, url);
	}

	// 样式文件Content-Type设置，避免Chrome Console Warning
	if (/\.less$|\.css$/.test(url)) {
		res.setHeader("Content-Type", "text/css; charset=utf-8");
	}

	// 避免.map文件在Chrome Console 404 Error
	if (url.endsWith('.map')) {
		res.end();
	} else {
		var resContent = fs.readFileSync(url, 'utf8');

		// 样式文件内引用资源(images和fonts)的路径替换为相对dist目录
		if (/\.less$|\.css$/.test(url)) {
			var pathMathArr = execall(/url\(\s*[\"\']?\s*(.+?)\s*[\"\']?\s*\)/g, resContent);
			var matchTextArr = []; 
			pathMathArr.forEach(function(matchItem) {
				var fixedPath = revall.fixPath(matchItem.sub[0]);
				var matchText = matchItem.sub[0].replace(/'|"/g, '');
				var prefixType = fixedPath.indexOf('fonts') > -1 ? 'font' : 'other';

				if (matchTextArr.indexOf(matchText) > -1) {
					return;
				}

				// 外链路径不做替换
				if (!/^\s*http/.test(fixedPath)) {
					var replaceText = '/' + fixedPath;
					if (prefixType == 'font') {
						resContent = resContent.replace(matchText, replaceText);
					} else {
						resContent = resContent.replace(new RegExp(matchText, 'g'), replaceText);
						matchTextArr.push(matchText)
					}
				}
			});
		}

		// less文件编译后返回给浏览器
		if (/\.less$/.test(url)) {
			less.render(resContent, function (e, output) {
				if (e) {
					reject(e);
					throw new Error(e);	
				}
				res.end(output.css);
			});
		} else {
			res.end(resContent);
		}
	}
});

function startServer() {
	console.log('\nStart Server');
	http.createServer(app).listen(3000);
	watcher.createWatcher();
	// livereload.createServer().watch(rootPath);
	opn('http://localhost:3000/app.html#/overview');
}

exports.startServer = startServer;

