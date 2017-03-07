/**
 * Created by darren on 16/11/30.
 */
'use strict';

angular.module( 'myApp' )
    .controller( 'CancelFreezeQRModalCtrl', [ '$scope', '$rootScope', '_http',  '$uibModalInstance', 'modifyData', function( $scope, $rootScope, _http,  $uibModalInstance, modifyData ){
        $scope.imgSrc = modifyData.qrSrc;
        // $scope.isFinishQR = modifyData.isFinishQR;
        $scope.close = function() {
            if($rootScope.isCancelFreezeQRFinish){
                $uibModalInstance.close();
            }else{
                $uibModalInstance.dismiss('close');
            }
        };
    } ] );
