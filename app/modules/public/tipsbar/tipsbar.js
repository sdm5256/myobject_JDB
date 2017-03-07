'use strict';

angular.module('myApp')

.controller('TipsBarCtrl', function($scope, $rootScope, $timeout) {

	var globalErrorPromise;
	var globalRegisterErrorPromise;
	var companyIdentStatus = '';
	var excludePathArr = [
		'info',
		'audit',
		'bindcompany',
		'login',
		'bindmyco'
	];

	$scope.showIdentTips = false;

	var initIdent = function() {
		if (companyIdentStatus === ''
			|| companyIdentStatus == 1
			|| excludePathArr.indexOf($rootScope.curRoutePath) > -1) {
			$scope.showIdentTips = false;
		} else {
			$scope.showIdentTips = true;
		}
	};

	$rootScope.$on('switchCompany',function (event, data) {
		companyIdentStatus = _.get(data, 'ext.company_status.is_ident');
		initIdent();
	});


	$rootScope.$watch('curRoutePath', function() {
		initIdent();
	});

	$scope.init = function() {
		$rootScope.gError = false;
		$rootScope.globalRegisterError = false;

		$rootScope.globalError = function (msg) {

			$rootScope.gError = msg;

			$timeout.cancel(globalErrorPromise);

			globalErrorPromise = $timeout(function () {
				$rootScope.gError = false;
			}, 3000);
		};

		$rootScope.globalRegisterError = function (msg) {

			$rootScope.registerError = msg;

			$timeout.cancel(globalRegisterErrorPromise);

			globalRegisterErrorPromise = $timeout(function () {
				$rootScope.registerError = false;
			}, 3000);
		};
	}

});
