/**
 * Created by darren on 16/11/30.
 */
'use strict';

angular.module( 'myApp' )
    .controller( 'CancelFreezeModalCtrl', [ '$scope', '_http',  '$uibModalInstance', 'modifyData', function( $scope, _http,  $uibModalInstance, modifyData ){
        $scope.cancel = function() {
            $uibModalInstance.dismiss( 'cancel' );
        };
        $scope.close = function() {
            $uibModalInstance.close();
        };

        $scope.confirm = function () {
            _http({
                url: '/wage/confirm-thaw',
                method: 'POST',
                data: {
                    id: modifyData.id,
                    order: modifyData.orderId
                }
            }).then(function (res) {
                res = res.data;
                if(+res.error.returnCode === 0){  //成功,确认
                    $scope.close();  //close会执行modalInstance.result的success callback
                }else if(+res.error.returnCode === 40003){  // 需要鉴权,弹出二维码
                    $scope.cancel(); //dismiss会执行modalInstance.result的fail callback
                    modifyData.getAuthThaw( modifyData.id );
                }else{
                    $rootScope.globalError( res.error.returnMessage );
                }
            }, function () {
                $rootScope.globalError( '异常错误' );
            })
        }
    } ] );
