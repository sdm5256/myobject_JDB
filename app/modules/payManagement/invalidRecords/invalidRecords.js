'use strict';

angular.module( 'myApp' )

    .controller( 'InvalidRecordsCtrl', function( $scope, $rootScope, $location, _http, $routeParams, payTools){

        $scope.pageSize = 20;
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
			"6": "等待确认优化结果",
			"7": "余额不足"
		};

        $scope.initInvalidTable = function( index, status ) {

            if ( !index ) {
                index = 1;
            }

			$scope.wagePageNo = index;
            $scope.wagePageDisabled = true;

            _http( {
                url: '/wage/batch-list',
                method: 'POST',
                data: {
                    month: '0000-00',
                    status: '3',
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


  }  );
    
