'use strict';

angular.module( 'myApp' )
    .controller( 'ReimbursementListCtrl', function( $scope, $rootScope, $routeParams, $location, $q, _http, $uibModal, $helper ) {
        $scope.pageSize = 20;                   // 每页数据条数 默认20
        $scope.query = {};                      // 筛选条件
        $scope.reimbursePageDisabled = false;   // 状态标识 => 请求列表时不可更改筛选条件  设为disable
        $scope.reimburseListLen = 0;            // 全部数据数目, 用于区分全部列表数据和经过筛选后的数据
        $scope.showOperateState = [];           // true: 操作列显示 编辑+删除 操作; false: 操作栏显示 查看 操作
        $scope.reimburseList = [];

		$scope.payToEmployee = $helper.payToEmployee;

        var QUERY_STATUS = 0;
        var QUERY_MONTH = '0000-00';

        var locationUrl = $location.url().split('/')[1].trim();
        $scope.isReimbursementInvalid = false;   //因报销列表页面和实效记录页面为同一个controller,用此变量区分,默认为列表页面
        if(locationUrl == 'reimbursement-invalid'){
            $helper.resetScrollTop();
            $scope.isReimbursementInvalid = true;
            QUERY_STATUS = 3;
            $scope.query.status = QUERY_STATUS;
            $scope.query.month = QUERY_MONTH;
        }

		if($scope.isReimbursementInvalid) {  //失效页面status为3,直接请求列表,不请求batch-status
			$scope.getTable();
		} else {
			getStatus().then( function () { //报销管理页面请求batch-status成功后请求列表接口
				$scope.getTable();
			} );
		}

        /**
         * 获取列表
         * @param index : 页数
         */
        $scope.getTable = function( index ) {

            if ( !index ) {
                index = 1;
            }

            $scope.reimbursePageDisabled = true;
            $scope.wagePageNo = index;

            _http( {
                url: '/reimburse/batch-list',
                method: 'POST',
                data: {
                    month: $scope.query.month,
                    status: $scope.query.status,
                    size: $scope.pageSize,
                    pageNo: index
                }
            } ).
            then( function( res ) {
                if ( res.data.error.returnCode == '0' ) {
                    $scope.reimburseList = res.data.data.list;      // 列表数据
                    $scope.stats = res.data.data.stats;             // 列表属性: 包括number等
                    $scope.reimbursePageDisabled = false;
                    $scope.reimburseListTotal =  $scope.stats.number;
                    // $scope.reimburseListTotal =  $scope.reimburseList.length;

                    if ( $scope.query.month == QUERY_MONTH && $scope.query.status == QUERY_STATUS ) {
                        $scope.reimburseListLen = res.data.data.list.length;
                    }
                } else {
                    $rootScope.globalError( res.data.error.returnMessage );
                    $scope.reimbursePageDisabled = false;
                }
            }, function() {
                $rootScope.globalError( '异常错误！' );
                $scope.reimbursePageDisabled = false;
            } );
        };

        /**
         * 获取筛选条件 和 现金金额
         * @returns { promise }
         */
        function getStatus() {
            var defer = $q.defer();
            _http( {
                url: '/reimburse/batch-status',
                method: 'POST'
            } ).
            then( function( res ) {
                if ( res.data.error.returnCode == '0' ) {
                    $scope.status = res.data.data.status;
                    $scope.months = res.data.data.months;
                    $scope.query.month = $scope.months[ 0 ];
                    $scope.query.status = 0;
                    $scope.cashBalance = res.data.data.cashBalance;  //现金余额
                    defer.resolve( res );
                } else {
                    $rootScope.globalError( res.data.error.returnMessage );
                    defer.reject( res.data.error.returnMessage );
                }
            }, function() {
                $rootScope.globalError( '异常错误！' );
                defer.reject( res.data.error.returnMessage );
            } );
            return defer.promise;
        }

        /**
         * 删除
         * @param obj
         */
        $scope.delThisBatch = function(obj, index){
            var modalInstance = $uibModal.open({
                animation: false,
                templateUrl: 'modules/reimbursement/list/listDelete.html',
                controller: 'delBatchCtrl',
                size: 'modify-info-size',
                resolve: {
                    modifyData: function () {
                        return obj;
                    }
                }
            });
            modalInstance.result.then(function () {
                $scope.reimburseList.splice(index,1);
            }, function () {

            });
        };

        $scope.getInvalid = function () {
            $scope.query.month = $scope.months[0];
            $scope.query.status = 3;
            $scope.getTable();
        };

        /**
         * 筛选条件 月份 0000-00
         */
        $scope.selectMonth = function( date ) {
            if ( date == '0000-00' ) {
                date = '全部月份';
            }
            return date;
        };

        // 监听删除弹窗的事件,请求列表
        $rootScope.$on('getReimTable', function () {
            $scope.getTable( $scope.wagePageNo );
        });

    } )
    .controller('delBatchCtrl', function ($rootScope, $scope, $uibModalInstance, _http,  modifyData) {
        $scope.item = modifyData;

        $scope.confirm = function () {
            _http({
                url: '/reimburse/del-batch',
                method: 'POST',
                data: {
                    order: $scope.item.order
                }
            }).then(function(res) {
                if (res.data.error.returnCode == '0') {
                    $rootScope.$broadcast('getReimTable');  //删除成功,请求一遍列表
                    $uibModalInstance.close();
                } else {
                    $rootScope.globalError(res.data.error.returnMessage);
                }
            }, function() {
                $rootScope.globalError('异常错误！');
            });
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        }
    });
