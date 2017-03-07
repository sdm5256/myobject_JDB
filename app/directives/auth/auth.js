/**
 * 扫码鉴权组件
 */

'use strict';

angular
    .module('myApp')
    .directive('scanAuth', scanAuth);

function scanAuth() {
    var directive = {
        restrict: 'EA',
        templateUrl: 'directives/auth/auth.html',
        link: directiveLink,
        controller: ['$scope', 'payTools', '$timeout', '_http',  '$location', '$uibModal', '$rootScope', function($scope, payTools, $timeout, _http,  $location, $uibModal, $rootScope) {

			$scope.status = '';
			$scope.stepName = '';

			var checkAuthStatusTimer = null;

			var getStepPending = function() {
				payTools.queryStatus({
					order: $scope.orderId,
					sel_type: $scope.selType
				}).then(function(res) {
					if ( res.data.error.returnCode == '0' ) {
						$scope.modeType = res.data.data.mode_type;
						$scope.extInfo = res.data.data.ext;
						$scope.totalInfo = res.data.data.total;
						initAuth();
					} else {
						$rootScope.globalError( res.data.error.returnMessage );
					}
				}, function() {
					$rootScope.globalError( '异常错误！' );
				});
			};

			var handleStatus = function() {

				// 刚发起鉴权(初始状态): status=='init'
				// 操作人已确认成功，待管理员确认: status=='waiting'
				// 鉴权成功: status=='success'
				if ($scope.status=='init' || $scope.status=='waiting') {
					checkAuthStatusTimer = $timeout( initAuth, 3000 );
				} else if ($scope.status=='success') {

					// 触发鉴权成功事件	
					$scope.$emit('scanAuthSuccessEvent', $scope.authInfo);
				}
			};

			var initAuth = function() {
				var authId = $scope.extInfo.auth_id;
				_http({
					url: '/auth/get-auth-status',
					method: 'POST',
					dataType: 'json',
					data:{
						authID: authId
					}
				}).then(function(res) {
					if ( res.data.error.returnCode == '0' ) {
						$scope.authInfo = res.data.data;
						$scope.stepName = $scope.authInfo.step == 'admin' ? '管理员' : '操作员';
						$scope.status = $scope.authInfo.status;
						handleStatus();
					} else {
						$rootScope.globalError( res.data.error.returnMessage );
					}
				}, function() {
					$rootScope.globalError( '异常错误！' );
				});
			};

			$scope.modType2config = {
				"0": {
					typeText: "工资",
					backModifyUrl: "/payFst",
					backAction: 20
				},
				"1": {
					typeText: "工资",
					backModifyUrl: "/optimizeScd",
					backAction: 20
				},
				"2": {
					typeText: "工资和全年一次性奖金",
					backModifyUrl: "/optimizeScd",
					backAction: 20
				},
				"3": {
					typeText: "劳务报酬",
					backModifyUrl: "/laborFst",
					backAction: 20
				}
			};

			$scope.init = function() {
				$timeout( getStepPending, 100 );
			};

			$scope.backModify = function() {
				var backAction = $scope.modType2config[$scope.modeType]['backAction'];
				_http({
					url: '/wage/step-save',
					method: 'POST',
					dataType: 'json',
					data: {
						order: $scope.orderId,
						sel_type: $scope.selType,
						struct_type: $scope.extInfo.struct_type,
						fix_type: $scope.extInfo.fix_type,
						action: backAction
					}
				}).then(function(res) {
					if (res.data.error.returnCode == '0') {
						$location.url( $scope.modType2config[$scope.modeType]['backModifyUrl'] + '/' + $scope.orderId);
					} else {
						$rootScope.globalError( res.data.error.returnMessage );
					}
				}, function() {
					$rootScope.globalError('异常错误');
				});
			};

			$scope.cancelPay = function() {
				var modalInstance = $uibModal.open({
					animation: false,
					templateUrl: 'CancelPay.html',
					controller: 'CancelPayCtrl',
					size: 'zerofriend-size',
					resolve: {
					  $parent: function () {
						return {
							parentScope: $scope
						};
					  }
					}
				});
			};

			$scope.$on('$destroy',function(){  
			   $timeout.cancel(checkAuthStatusTimer);
			});

		}]
    };

    return directive;
}

function directiveLink($scope, elem, attr) {
    $scope.orderId = attr.orderId;
    $scope.selType = attr.selType;
}


angular.module('myApp').controller('CancelPayCtrl', ['$scope', '_http',  '$uibModalInstance', '$rootScope', '$parent', function($scope, _http,  $uibModalInstance, $rootScope, $parent) {

	var $parentScope = $parent.parentScope;
	var orderId = $parentScope.orderId;
	$scope.typeText = $parentScope.modType2config[$parentScope.modeType]['typeText'];

	$scope.cancel = function() {
		$uibModalInstance.close();
	};

	$scope.go = function() {
		_http( {
			url: '/wage/confirm',
			method: 'POST',
			data: {
				order: orderId,
				status: 'D',
				type: '1'
			}
		} ).then( function( res ) {
			if ( res.data.error.returnCode == '0' ) {
				$parentScope.status = 'cancel';
			} else {
				$rootScope.globalError( res.data.error.returnMessage );
			}
			$uibModalInstance.close();
		}, function() {
			$rootScope.globalError( '异常错误！' );
			$uibModalInstance.close();
		} );
	};
}]);
