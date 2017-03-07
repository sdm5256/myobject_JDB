'use strict';

myApp.service('_http', function ($rootScope, $http, $q, $location, $httpParamSerializerJQLike) {

  return function(config) {
    var deferred = $q.defer();
    var _handler = null;
    if (!config || !angular.isObject(config)) {
      new Error('_http 模块参数必须是object!');
      return;
    }

  	if (!config.data) {
  		config.data = {};
  	}

    if(!config.data._just){
        config.data.token = localStorage.getItem('loginToken');
        config.data.companyID = localStorage.getItem('loginCompanyID');
    }

    delete config.data._just;

    if(!config.data.header){
      _handler = false;
    }else {
     _handler = true;
      delete config.data.header;
      delete config.data.companyID;
    }

    config.method = (config.method || 'POST').toUpperCase();
	if (config.method == 'GET') {
		config.params = config.data;
	} else if (typeof config.data === 'object') {
		config.data = $httpParamSerializerJQLike(config.data);
	}

    $http(config)
      .then(function(res){

        if (res.data.error.returnCode == 5001) {
          if(_handler){
            $rootScope.globalError('您需要重新登录！');

            localStorage.clear();

            $location.url('/login');
          }
          localStorage.clear();
          $location.url('/login');
          return;
        }

        deferred.resolve(res);
      }, function (res) {
        deferred.reject(res);
      });

    return deferred.promise;
  }
});
