'use strict';

// Declare app level module which depends on views, and components
var myApp = angular.module('myApp', [
		'ngRoute',
		'ngMessages',
		'ui.bootstrap',
		'ui.bootstrap.carousel',
		'ngFileUpload',
		'ng.shims.placeholder',
		'ngPrint',
		'angucomplete-alt'
	])

    .config(['$httpProvider', function ($httpProvider) {
        $httpProvider.defaults.useXDomain = true;
        // Use x-www-form-urlencoded Content-Type
        $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';

    }])

    .run(function ($window, $rootScope, $location, $timeout) {

		// 历史返回
        $rootScope.historyBack = function () {
            $window.history.back();
        };

        $rootScope.btnSwitch = false;


        $rootScope.overviewReloadNum = true;

		// 监听路由的change事件
		$rootScope.$on( "$routeChangeStart", function(event, next, current) {
			var currentPath = '';
			if (current) {
				currentPath = current.$$route ? current.$$route.originalPath : '/';
			}
			var nextPath = next.$$route ? next.$$route.originalPath : '/';
			var isSafari = navigator.userAgent.indexOf("Safari") > -1 && navigator.userAgent.indexOf("Chrome") == -1;
			var isFirefox = navigator.userAgent.indexOf("Firefox") > -1;

			// 跳到登录页面时刷新页面，解决登陆过期自动跳到login页面时，modal窗口还存在的问题
			// Safari和火狐浏览器对路由判断有问题，会不停地刷新
			if (currentPath && currentPath != '/login' && nextPath == '/login' && !isSafari && !isFirefox) {
				window.location.reload();
			}

			var blackSideBarList = [
				'ptimizeTable', 
				'bindcompany', 
				'login', 
				'audit',
				'bindmyco'
			];
			var blackHeaderList = ['ptimizeTable'];
			var blackFooterList = [
				'ptimizeTable', 
				'audit'
			];

			var curPath = nextPath.split('/')[1];

			$rootScope.blackSideBarList = blackSideBarList;

			$rootScope.curRoutePath = curPath;
			$rootScope.showHeader = blackHeaderList.indexOf(curPath) == -1;
			$rootScope.showFooter = blackFooterList.indexOf(curPath) == -1;
			$rootScope.showSideBar = blackSideBarList.indexOf(curPath) == -1;

			$rootScope.isLoginHeader = curPath == 'login';

			if (nextPath == '/login') {
				document.title = '『借贷宝企业版登录』借贷宝个人借贷软件_借贷宝熟人借贷-借贷宝'
			} else if (nextPath == '/bindmyco') {
				document.title = '『注册借贷宝』借贷宝注册步骤_借贷宝账号-借贷宝'
			} else {
				document.title = '借贷宝企业版 - 企业自助式创新融资服务平台'
			}

            if( (!currentPath.match('/details/')) && nextPath == '/deal-search' ){
                Cookies.remove('postData');
            }
		});

    });
