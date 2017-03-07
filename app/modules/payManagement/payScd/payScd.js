'use strict';

angular.module( 'myApp' )

    .controller( 'PayScdCtrl', function( $scope, $rootScope, $routeParams, $location, _http, $uibModal, payTools){


		$scope.loadStatus = false;
		$scope.pageSize = 20;
		$scope.wageList = [];
		$scope.orderId = $routeParams.orderId || '';

		$scope.init = function() {
			if (!$scope.orderId) {
				$location.url('/payFst');
			} else {
				payTools.queryStatus({
					order: $scope.orderId,
					sel_type: 1
				}).then(function(res) {
					if ( res.data.error.returnCode == '0' ) {
						$scope.data = res.data.data;
					} else {
						$rootScope.globalError( res.data.error.returnMessage );
					}
				}, function() {
					$rootScope.globalError( '异常错误！' );
				});

				$scope.getWageList();
			}
		};

		$scope.getWageList = function ( index ) {
			if ( !index ) {
				index = 1;
			}

			$scope.wagePageNo = index;

			_http( {
				url: '/wage/edit-list',
				method: 'POST',
				data: {
					order: $scope.orderId,
					size: $scope.pageSize,
					pageNo: index
				}
			} ).
			then( function( res ) {
				if ( res.data.error.returnCode == '0' ) {
					$scope.wageList = res.data.data.list;
					$scope.wageTotal = res.data.data.total;
				} else {
					$rootScope.globalError( res.data.error.returnMessage );
				}
			}, function() {
				$rootScope.globalError( '异常错误！' );
			} );
		}


    })
    

