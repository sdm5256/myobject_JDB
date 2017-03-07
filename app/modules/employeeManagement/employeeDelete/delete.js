'use strict';

angular.module( 'myApp' )

    .controller( 'employeeDeleteCtrl', function( $scope, $rootScope, $location, _http,  Upload, $uibModal, $company) {
        $scope.pageSize = 20;
        $scope.excelResult = {};
        $scope.excelResult.res = false;
        $scope.getTable = getTable;
        $scope.loading = false;

        //路由change时清除轮询请求列表接口
        $scope.getTableTimer = null;

        //状态映射数组
        $scope.delStatus = ['删除失败','删除成功'];

        $scope.goToRecharge = function() {
			$location.url( '/how2-recharge' );
        };

        // getTable();
        $scope.upload = function( file ) {
            $scope.hasUploaded = false;

            if ( !file ) {
                return;
            }

            $scope.uploadError = '';
            $scope.loading = true;

            Upload.upload( {
                url: '/staff/del-excel',
                data: {
                    excel: file,
                    token: localStorage.getItem( 'loginToken' ),
                    companyID: localStorage.getItem( 'loginCompanyID' )
                }
            } ).then( function( resp ) {
                var res = resp.data;
                $scope.excelResult.res = true;
                $scope.dataNo = resp.data.data;

				$company.getCompanyInfo().then(function(data) {
                    $scope.ident = data.ext.company_status.is_ident;
				});

                if ( res.error.returnCode == '0' ) {
                    $scope.excelResult.excelError = false;
                    $scope.showExcel = true;
                    getTable();

                } else {
                    $scope.loading = false;
                    $scope.excelResult.excelError = true;
                    $scope.excelResult.excelErrorMessage = res.error.returnMessage;
                }
            }, function() {
                $scope.loading = false;
                $scope.excelResult.res = false;
                $scope.excelResult.excelError = false;
                $rootScope.globalError( '异常错误！' );
            } );
        };

        function getTable( index ) {
            if ( !index ) {
                index = 1;
            }

            $scope.wagePageDisabled = true;

            _http( {
                url: '/staff/del-excel-result',
                method: 'POST',
                data: {
                    uploadNo: $scope.dataNo,
                    pageSize: $scope.pageSize,
                    pageNo: index
                }
            } ).
            then( function( res ) {
                if ( res.data.error.returnCode == '0' ) {
                    $scope.excelResult.excelError = false;
                    $scope.hasExcelResult = true;
                    $scope.loading = false;
                    $scope.employeeDelList = res.data.data.list;
                    $scope.wagePageDisabled = false;
                    $scope.resultCount = res.data.data.total;
                    $scope.failNum = res.data.data.failNum;
                    $scope.sucessNum = res.data.data.sucessNum;
                    $scope.filterNum = res.data.data.filterNum;
                }else if ( res.data.error.returnCode == '400' || res.data.error.returnCode == '503' ) {
                    $scope.excelResult.excelError = true;
                    $rootScope.globalError( res.data.error.returnMessage );
                    $scope.loading = false;
                } else {
                    $scope.getTableTimer = setTimeout( function() {getTable();}, 5000 );
                    $scope.hasExcelResult = false;

                    //$rootScope.globalError(res.data.error.returnMessage);
                    $scope.wagePageDisabled = false;
                }
            }, function() {
                $scope.hasExcelResult = false;
                $rootScope.globalError( '异常错误！' );
                $scope.wagePageDisabled = false;
            } );
        }

        // 监听路由的change事件
        $rootScope.$on( "$routeChangeStart", function(event, next, current) {
            var nextPath = next.$$route ? next.$$route.originalPath : '/';
            if (nextPath != '/employee-delete') {
                clearTimeout( $scope.getTableTimer );
            }
        });
    }  );


