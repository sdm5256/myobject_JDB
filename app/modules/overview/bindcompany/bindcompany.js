'use strict';

angular.module('myApp')

    .controller('bindcompanyCtrl', function($scope, $rootScope, _http, $location,  $interval, $uibModal, $company) {
    	$scope.companyStatus = true;
        $scope.loadStatus = false;
    	$scope.checkStatus = function() {

            _http( {
                url: '/user/getuserinfo',
                method: 'POST',
                data: {
                    header: "header"
                },
            } ).then( function( res ) {
                if( res.data.error.returnCode == 0 ) {
					var data = res.data.data;
                    $scope.loadStatus = false;
                    if( data.userinfo.vali_status.ident == true ) {
                        $scope.companyStatus = true;
                    } else {
                        $scope.companyStatus = false;
                    }
                } else {
                    $rootScope.globalError( res.data.error.returnUserMessage );
                }
            }, function() {
                $rootScope.globalError( '异常错误' );
            } );
    	};

    	$scope.checkStatus();

        // 检查认证状态
        $scope.checkAuthStatus = function() {
            $scope.loadStatus = true;
            _http( {
                url: '/user/getuserinfo',
                method: 'POST',
                data: {
                    token: $rootScope.token123,
                    header: "header"
                },
            } ).then( function( res ) {
                if( res.data.error.returnCode == 0 ) {
                    $scope.loadStatus = false;
                    if( res.data.data.userinfo.vali_status.ident == true ) {
                        $location.url('/bindmyco');
                    } else {
                        $scope.verifyStatus();
                    }
                } else {
                    $scope.loadStatus = false;
                    $rootScope.globalError( res.data.error.returnUserMessage );
                }
            }, function() {
                $scope.loadStatus = false;
                $rootScope.globalError( '异常错误' );
            } );
        };

        $scope.verifyStatus = function() {
            $uibModal.open( {
                animation: false,
                templateUrl: 'limitExport.html',
                controller: 'limitExport',
                size: 'modify-info-size',
                resolve: {
                  modifyData: function() {
                    return {
                        data: $scope.data
                    };
                  }
                }
            } );
        };
    })

    .controller( 'limitExport', [ '$scope', '$rootScope', '$uibModalInstance','$location', '_http',  '$interval', 'modifyData', function( $scope, $rootScope, $uibModalInstance, $location, _http,  $interval, modifyData ) {
      $scope.modifyData = modifyData;
      $scope.go = function() {
          $uibModalInstance.close();
      };
    } ] )
