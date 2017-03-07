'use strict';

angular.module( 'myApp' )

    .controller( 'WageDetailCtrl', function( $scope, $rootScope, $routeParams, $location, _http, $uibModal, $timeout ){

		$scope.pageSize = 20;
		//重发请求loading
		$scope.repayLoading = false;
		$scope.orderId = $routeParams.orderId || '';
		// 筛选状态
		$scope.queryStatus = {};

		// 是否从工资＋劳务报酬“我已完成”落地而来
		$scope.isFromFinishBtn = $location.search().from == 'finishbtn';

		// 工资类型和工资类型显示对应关系
		$scope.type2text = {
			"0": "工资",
			"1": "工资和劳务报酬",
			"2": "工资和全年一次性奖金",
			"3": "劳务报酬"
		};

		$scope.cancelStatus2Text = {
			"0": "未操作",
			"1": "操作员取消发放",
			"2": "管理员取消发放",
			"3": "已取消发放",
			"4": "操作员72小时未确认",
			"5": "管理员72小时未确认"
		};

		// 工资类型和title显示对应关系
		$scope.type2titleText = {
			"0": "发放工资详情",
			"1": "优化并发放工资详情",
			"2": "优化并发放工资详情",
			"3": "发放劳务报酬详情"
		};

		// 增加导出Excel
		$scope.excelExport = function() {
		  location.href = '/wage/export-excel' +
			  '?order=' + $scope.orderId +
			  '&status=' + ($scope.queryStatus.status || 0) +
			  '&token=' + localStorage.getItem( 'loginToken' ) +
			  '&companyID=' + localStorage.getItem( 'loginCompanyID' );
		};

		// 下载劳务报酬明细
		$scope.fixWorkWageExport = function() {
		  location.href = '/wage/fix-work-wage-export' +
			  '?order=' + $scope.orderId +
			  '&token=' + localStorage.getItem( 'loginToken' ) +
			  '&companyID=' + localStorage.getItem( 'loginCompanyID' );
		};

		$scope.getTable = function ( index ) {
		  if ( !index ) {
			index = 1;
		  }

		  $scope.wagePageDisabled = true;
		  $scope.wagePageNo = index;

			_http( {
			  url: '/wage/query',
			  method: 'POST',
			  data: {
				order: $scope.orderId,
				status: $scope.queryStatus.status || 0,
				size: $scope.pageSize,
				pageNo: index
			  }
			} ).
			then( function( res ) {
			  if ( res.data.error.returnCode == '0' ) {
				$scope.hasExcelResult = true;
				$scope.wageList = res.data.data.list;
				$scope.wagePageDisabled = false;
				$scope.total = res.data.data.total;
				$scope.optimizeNum = Number($scope.total.optimized_number);
			  } else {
				$scope.hasExcelResult = false;
				$rootScope.globalError( res.data.error.returnMessage );
				$scope.wagePageDisabled = false;
			  }
			}, function() {
			  $scope.hasExcelResult = false;
			  $rootScope.globalError( '异常错误！' );
			  $scope.wagePageDisabled = false;
			} );
		}

		$scope.modify = function( item ) {

		  var modalInstance = $uibModal.open( {
			animation: false,
			templateUrl: 'modifyWageItemModal.html',
			controller: 'modifyWageItemModalCtrl',
			size: 'modify-info-size',
			resolve: {
			  modifyData: function() {
				return {
				  item: item
				};
			  }
			}
		  } );

		  modalInstance.result.then( function() {
			$scope.getTable();
		  }, function() {

		  } );
		};

		/**
		 * 重发工资
		 * @param id: 当前人员id
		 */
		$scope.rePay = function (id) {
		  $scope.repayLoading = true;
		  _http({
			url: '/wage/replay',
			method: "POST",
			data: {
			  id: id
			}
		  }).then(function (res) {
			$scope.repayLoading = false;
			if(res.data.error.returnCode == '0'){
			  //请求成功,重新刷新列表状态
			  $scope.getTable();
			}else{
			  $rootScope.globalError( res.data.error.returnMessage );
			}
		  }, function() {
			$scope.repayLoading = false;
			$rootScope.globalError( '异常错误！' );
		  } )
		};


		// 取消冻结 START====================================================================================================================

		$rootScope.isCancelFreezeQRFinish = false;   // 轮询鉴权状态过程中,改变二维码弹窗展现: 二维码 => 完成态
		var status = 'init',
			authId = '';

		var checkAuthStatusTimer = null;
		var handleStatus = function() {

			// 刚发起鉴权(初始状态): status=='init'
			// 鉴权成功: status=='success'
			if (status=='init') {
				$rootScope.isCancelFreezeQRFinish = false;
				checkAuthStatusTimer = $timeout( initAuth, 3e3 );
			} else if (status=='success') {
				// 触发鉴权成功事件
				$timeout.cancel( checkAuthStatusTimer );
				$rootScope.isCancelFreezeQRFinish = true;

			}
		};

		var initAuth = function() {
			_http({
				url: '/auth/get-auth-status',
				method: 'POST',
				dataType: 'json',
				data:{
					authID: authId
				}
			}).then(function(res) {
				if ( res.data.error.returnCode == '0' ) {
					status = res.data.data.status;
					handleStatus();
				} else {
					$rootScope.globalError( res.data.error.returnMessage );
				}
			}, function() {
				$rootScope.globalError( '异常错误！' );
			});
		};

		/**
		 * 取消冻结
		 * @param itemId : id
		 */
		$scope.cancelFreeze = function ( itemId ) {
			getAuthThaw( itemId );
		};

		// 不需要鉴权弹窗配置
		var notNeedAuth = angular.extend({},{
			templateUrl: 'modules/payManagement/wageDetail/cancelFreeze-modal/cancelFreeze-modal.html',
			controller: 'CancelFreezeModalCtrl',
			size: 'modify-info-size',
			returns: {
				id: '',
				orderId: $scope.orderId,
				getAuthThaw: getAuthThaw
			},
			success: $scope.getTable
		});
		// 需要鉴权弹窗配置
		var needAuth = angular.extend({},{
			templateUrl: 'modules/payManagement/wageDetail/cancelFreezeQR-modal/cancelFreezeQR-modal.html',
			controller: 'CancelFreezeQRModalCtrl',
			size: 'modify-cfQR-size',
			returns: {
				qrSrc: ''
			},
			success: $scope.getTable,
			fail: function () {
				$timeout.cancel(checkAuthStatusTimer);
			}
		});

		// 获取详情页状态筛选列表
		function getDetailStatus() {
			_http( {
				url: '/wage/status',
				method: 'POST'
			} ).
			then( function( res ) {
				if ( res.data.error.returnCode == '0' ) {
					$scope.detailStatus = res.data.data;
					$scope.queryStatus.status = $scope.detailStatus[0].id;
				} else {
					$rootScope.globalError( res.data.error.returnMessage );
				}
			}, function() {
				$rootScope.globalError( '异常错误！' );
			} );
		};

		/**
		 * 鉴权检测接口
		 * @param itemId : id
		 */
		function getAuthThaw( itemId ) {
			_http({
				url: '/wage/auth-thaw',
				method: 'POST',
				data: {
					id: itemId,
					order: $scope.orderId || $routeParams.orderId
				}
			}).then( function ( res ) {
				res = res.data;
				if( +res.error.returnCode === 0 ){
					authId = res.data.auth_id;
					status = res.data.status;

					notNeedAuth = angular.extend(notNeedAuth, {
						returns: {
							id: itemId,
							orderId: $scope.orderId || $routeParams.orderId
						}
					});

					needAuth = angular.extend(needAuth, {
						returns: {
							qrSrc: res.data.auth_qrcode
						}
					});

					if(status === 'success'){               // 不需要鉴权,直接弹窗确认
						openCancelFreezeModal( notNeedAuth );
					}else if(res.data.status === 'init'){   // 需要鉴权,弹出二维码扫码鉴权,并轮询鉴权状态
						$timeout.cancel( checkAuthStatusTimer );
						initAuth();
						openCancelFreezeModal( needAuth );
					}else{
						$rootScope.globalError( res.error.returnMessage );
					}
				}else{
					$rootScope.globalError( res.error.returnMessage );
				}
			}, function () {
				$rootScope.globalError( '异常错误！' );
			})
		}

		/**
		 * 取消冻结根据是否鉴权弹出不同弹窗,
		 * @param config: 不同弹窗的配置
		 */
		function openCancelFreezeModal( config ) {
			var modalInstance = $uibModal.open( {
				animation: false,
				templateUrl: config.templateUrl,
				controller: config.controller,
				size: config.size || 'modify-info-size',
				resolve: {
					modifyData: function() {
						return config.returns;
					}
				}
			} );
			modalInstance.result.then( function() {
				config.success && config.success();
			}, function() {
				config.fail && config.fail();
			} );
		}

		$scope.$on('$destroy',function(){
			$timeout.cancel(checkAuthStatusTimer);
		});


		//  初始化状态筛选
		getDetailStatus();

		// 初始化表格数据
		$scope.getTable();

		// 取消冻结 END====================================================================================================================

}).controller( 'modifyWageItemModalCtrl', [ '$rootScope', '$scope', '$uibModalInstance', '_http', 'modifyData',  function ( $rootScope, $scope, $uibModalInstance, _http, modifyData ) {

  $scope.item = modifyData.item;
  $scope.submitForm  = {};
  $scope.submitForm.id = $scope.item.id;
  $scope.submitForm.cusName = $scope.item.name;
  $scope.submitForm.cusPhone = $scope.item.phone;
  $scope.submitForm.cusIdNo = $scope.item.id_card;
  $scope.phoneError=false;
  var submitUrl = '';
  if($scope.item.oper_type == '4'){ // item.oper_type == '4' => 不可以修改姓名身份证
    $scope.operType4 = true;
    submitUrl = '/wage/update-phone';
  }else{
    $scope.operType4 = false;
    submitUrl = '/wage/updateperson';
  }
  
  $scope.phoneMacth = function(){
  	var reg=/^1\d{10}/;
  	if(reg.test($scope.submitForm.cusPhone)){  		
  		$scope.phoneError=false;
  	}else{
		$scope.phoneError=true;
  	}
  }

  $scope.submit = function( isValid ) {

    $scope.submitted = true;

    var submitData = {};
    if($scope.operType4){ // 只可以修改手机号 ,入参 id and cusPhone
      submitData = {
        id: $scope.submitForm.id,
        cusPhone: $scope.submitForm.cusPhone
      }
    }else{
      submitData = $scope.submitForm;
    }

    if ( isValid ) {

      _http( {
        url: submitUrl,
        method: 'POST',
        data: submitData
      } )
          .then( function( res ) {
            if ( res.data.error.returnCode == '0' ) {
              modifyData.item.cusName = $scope.submitForm.cusName;
              modifyData.item.cusPhone = $scope.submitForm.cusPhone;
              modifyData.item.cusIdNo = $scope.submitForm.cusIdNo;
              $uibModalInstance.close();
            } else {
              $rootScope.globalError( res.data.error.returnMessage );
            }
          }, function() {
            $rootScope.globalError( '异常错误！' );
          } );
    }
  };

  $scope.cancel = function() {
    $uibModalInstance.dismiss( 'cancel' );
  };

} ] );
    
