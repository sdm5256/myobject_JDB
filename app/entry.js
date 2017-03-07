// 基础脚本
require('../node_modules/html5-boilerplate/dist/js/vendor/modernizr-2.8.3.min.js');
require('../node_modules/zepto/dist/zepto.min.js');
require('../node_modules/jquery/dist/jquery.min.js');
require('../node_modules/js-cookie/src/js.cookie.js');
require('../node_modules/angular/angular.js');
require('../node_modules/angular-shims-placeholder/dist/angular-shims-placeholder.js');
require('../node_modules/angular-route/angular-route.js');
require('../node_modules/angular-messages/angular-messages.js');
require('libs/angular-bootstrap/ui-bootstrap.js');
require('libs/angular-bootstrap/ui-bootstrap-tpls.js');
require('libs/qrcode.js/qrcode.js');
require('libs/lodash/lodash.min.js');
require('libs/angularjs-ui/angularjs-local_zh-ch.js');
require('libs/ng-file-upload-master/dist/ng-file-upload-all.min.js');
require('libs/ng-file-upload-master/dist/ng-file-upload-shim.min.js');

// 业务脚本
require('app.js');
require('router.js');
require('filters');
require('service');
require('directives');
require('factory');
require('modules');
