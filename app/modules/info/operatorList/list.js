'use strict';

angular.module('myApp')

    .controller('operatorListCtrl', ['$scope', '$rootScope', '_http', '$location',  '$interval', '$uibModal', function($scope, $rootScope, _http, $location,  $interval, $uibModal) {
    	// 删除操作员

        $scope.init = function(){
            if( $rootScope.role == 2 ) {
                $location.url('/overview');
            };
        }
        $scope.init();

    	

        $scope.checkOperatorNum = function() {
            if( $scope.operatorLength && $scope.operatorLength >= 10 ) {
                $scope.verifyStatus();
            } else {
                $location.url('/add-operator');
            }
        };

        $scope.deleteOperatorTip = function( data ) {
            $scope.data = data;
            $uibModal.open( {
                animation: false,
                templateUrl: 'deleteOperator.html',
                controller: 'deleteOperatorCtrl',
                size: 'modify-info-size',
                resolve: {
                  modifyData: function() {
                    return {
                        data: $scope.data,
                        getOperator: $scope.getOperator
                        // dialogType: dialogType,
                        // goToRecharge: $scope.goToRecharge,
                        // init: $scope.init
                    };
                  }
                }
            } );
        }

        // 判断操作员数量是否大于10

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

                        // dialogType: dialogType,
                        // goToRecharge: $scope.goToRecharge,
                        // init: $scope.init
                    };
                  }
                }
            } );
        };

        // 获取操作员
        $scope.getOperator = function() {
            _http( {
                url: '/operator/view',
                method: 'POST',
            } ).then( function( res ) {
                if( res.data.error.returnCode == 0 ) {
                    $scope.operatorContent = res.data.data.operators;
                    $scope.operatorLength = res.data.data.operators.length;
                } else {
                    $rootScope.globalError( res.data.error.returnUserMessage );
                }
            }, function() {
                $rootScope.globalError( '异常错误' );
            } );
        };
        $scope.getOperator();

    }])

    .controller( 'limitExport', [ '$scope', '$rootScope', '$uibModalInstance','$location', '_http',  '$interval', 'modifyData', function( $scope, $rootScope, $uibModalInstance, $location, _http,  $interval, modifyData ) {
        $scope.modifyData = modifyData;
        $scope.go = function() {
            $uibModalInstance.close();
        };
    } ] )

    .controller( 'deleteOperatorCtrl', [ '$scope', '$rootScope', '$uibModalInstance','$location', '_http',  '$interval', 'modifyData', function( $scope, $rootScope, $uibModalInstance, $location, _http,  $interval, modifyData ) {
        $scope.modifyData = modifyData;
        $scope.cancel = function() {
            $uibModalInstance.close();
        };
        $scope.deleteOperator = function() {
            _http( {
                url: '/operator/delete',
                method: 'POST',
                data: {
                    memberID: $scope.modifyData.data.memberID
                },
            } ).then( function( res ) {
                if( res.data.error.returnCode == 0 ) {
                    modifyData.getOperator();
                    $scope.cancel();
                } else {
                    $rootScope.globalError( res.data.error.returnUserMessage );
                }
            }, function() {
                $rootScope.globalError( '异常错误' );
            } );
        };
    } ] );
