'use strict';

angular.module( 'myApp' )

    .controller( 'PayManagementCtrl', function( $scope, $rootScope, $routeParams, $location, _http, payTools, $uibModal, $helper, $company) {

		$company.getCompanyInfo().then(function(data) {
			$scope.companyData = data;

            getStatus(function() {
                $scope.getTable();
            });

			// 检查菜单白名单
			checkMenu();
		
		});

        $scope.pageSize = 20;
        $scope.query = {};
		$scope.wageList  = [];
		$scope.goToDetail = payTools.goToDetail;

		$scope.type2text = {
			"1": "工资",
			"2": "工资优化",
			"3": "工资优化",
			"4": "劳务报酬"
		};
		
		$scope.status2text = {
			"1": "等待操作员确认",
			"2": "等待管理员确认",
			"3": "已完成",
			"4": "已失效",
			"5": "已删除",
			"6": "等待提交表格",
			"7": "等待确认优化结果"
		};

        $scope.limitExport = function() {
            $uibModal.open( {
                animation: false,
                templateUrl: 'limitExport.html',
                controller: 'limitExport',
                size: 'modify-info-size',
                resolve: {
                  modifyData: function () {
                    return {
                        data: $scope.data,
                    };
                  }
                }
            } );
        };

		// 检查是否有逾期
		function checkIsOverdue(payUrl) {
			_http( {
				url: '/public/isoverdue',   // 查询企业还款日及逾期后限制企业出款   0表示没有逾期 可以正常进行操作
				method: 'POST',
				dataType: 'json'
			} ).then( function( res ) {
				if ( res.data.error.returnCode == '0' ) {
				  $location.url( payUrl );
				} else {
				  $scope.limitExport();
				}
			}, function() {
				$rootScope.globalError( '异常错误' );
			} );
		}

		$scope.goToPay = function(payUrl) {

			// 判断企业是否认证
			if ($scope.companyData.ext.company_status.is_ident != 1) {
				$helper.openIdentModal('发放工资');
				return;
			}

			// 检查是否有逾期
			checkIsOverdue(payUrl);
        };

        $scope.getTable = function( index, status ) {

            if ( !index ) {
                index = 1;
            }

			$scope.wagePageNo = index;
            $scope.wagePageDisabled = true;

            _http( {
                url: '/wage/batch-list',
                method: 'POST',
                data: {
                    month: $scope.query.month,
                    status: typeof status != 'undefined' ? status : $scope.query.status,
                    size: $scope.pageSize,
                    pageNo: index
                }
            } ).
            then( function( res ) {
                if ( res.data.error.returnCode == '0' ) {
                    $scope.wageList = res.data.data.list;
                    $scope.stats = res.data.data.stats;
                    $scope.wagePageDisabled = false;
                    $scope.wageListTotal =  $scope.stats.number;
                } else {
                    $rootScope.globalError( res.data.error.returnMessage );
                    $scope.wagePageDisabled = false;
                }
            }, function() {
                $rootScope.globalError( '异常错误！' );
                $scope.wagePageDisabled = false;
            });
        };

        function getStatus( success ) {
            _http( {
                url: '/wage/batch-status',
                method: 'POST'
            } ).
            then( function( res ) {
                if ( res.data.error.returnCode == '0' ) {
                    $scope.status = res.data.data.status;
                    $scope.months = res.data.data.months;
                    //$scope.isFaild = res.data.data.is_failed;
                    $scope.query.month = $scope.months[0];
                    $scope.query.status = 0;
                    success && success();
                } else {
                    $rootScope.globalError( res.data.error.returnMessage );
                }
            }, function() {
                $rootScope.globalError( '异常错误！' );
            } );
        }

		// 检查菜单白名单
		function checkMenu() {
            _http( {
                url: '/wage/check',
                method: 'POST'
            } ).
            then( function( res ) {
                if ( res.data.error.returnCode == '0' ) {
					$scope.menuPermissions = res.data.data;
                } else {
                    $rootScope.globalError( res.data.error.returnMessage );
                }
            }, function() {
                $rootScope.globalError( '异常错误！' );
            } );
		};

        /**
         * 筛选条件 月份 0000-00 过滤器
         */
        $scope.selectMonth = function( date ){
            if ( date == '0000-00' ) {
                date = '全部月份';
            }
            return date;
        };
    })
    
    .controller('limitExport', function($scope, $rootScope, $uibModalInstance, $location, _http,  $interval, modifyData) {
        $scope.modifyData = modifyData;
        $scope.go = function() {
            $uibModalInstance.close();
        }
    });

