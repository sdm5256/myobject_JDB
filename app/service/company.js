'use strict';

myApp.service('$company', function ($rootScope, $http, $q, $timeout, _http) {

	var companyInfo = {};

	$rootScope.$on('switchCompany',function (event, data, callback) {
		$rootScope.permission = data.userinfo.permission;
		companyInfo = data;
		callback && callback();
	});

	function getCompanyInfo(hard) {
		var deferred = $q.defer();
		if (hard) {
			_http({
				url: '/user/getcompanyinfo',
				method: 'POST'
			}).then(function (res) {
				if (res.data.error.returnCode == '0') {
					var data = res.data.data;
					deferred.resolve(data);
				}
			}, function () {
				$rootScope.globalError(res.data.error.returnMessage);
			});
		} else {
			var fetchInfo = function () {
				if (!$.isEmptyObject(companyInfo)) {
					deferred.resolve(companyInfo);
				} else {
					$timeout( fetchInfo, 50 );
				}
			};
			fetchInfo();
		}
		return deferred.promise;
	}

	function getIdentStatus() {
		var deferred = $q.defer();
		getCompanyInfo().then(function(data) {
			deferred.resolve(_.get(data, 'ext.company_status.is_ident'));
		});
		return deferred.promise;
	}

	return {
		getCompanyInfo: getCompanyInfo,
		getIdentStatus: getIdentStatus
	}
});
