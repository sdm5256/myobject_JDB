var path = require('path');
var fs = require('fs-extra');
var execall = require('execall');
var templatecache = require('templatecache');
var templateRoot = path.join(__dirname, '../app');
var templatesFilePath = path.join(__dirname, '../dist/templatecache.js');
var options = {
    angularRoot: templateRoot,
    moduleName: 'myApp',
    isStandalone: false,
    isNgAnnotate: true,
    isCreateOutput: true,
    templatesFilePath: templatesFilePath,
    progress: function (filePath) {
		var ignoreRegex = /\/app\.html|\/pages\/|\/libs\//;
		if (ignoreRegex.test(filePath)) {
			return false;
		}
        return true;
    }
};
 
function createTemplateCache() {
	return new Promise(function(resolve, reject) {
		templatecache(options).then(function (templatejs) {
			var fileContent = fs.readFileSync(templatesFilePath, 'utf8');
			var pathMathArr = execall(/ng-pattern=\/.*?\//g, fileContent);
			pathMathArr.forEach(function(item) {
				fileContent = fileContent.replace(item.match, item.match.replace(/\\/g, '\\\\'))
			});
			fs.writeFileSync(templatesFilePath, fileContent);
			resolve();
		}).catch(function (err) {
			reject(err);
			throw new Error(err);
		});
	});
}

exports.createTemplateCache = createTemplateCache;

