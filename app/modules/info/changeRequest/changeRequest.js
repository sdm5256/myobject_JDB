'use strict';

angular.module( 'myApp' )
   .controller( 'changeRequestCtrl', function( $scope, $rootScope, _http, $location, $uibModal, Upload, $helper, $q ) {
        //上传状态
        $scope.loadStatus = false;
        //上传成功
        $scope.successUploaded = false;

        //点击下载excel
        $scope.downloadExcel = function () {
            location.href = '/certificate/get-modify-table' +
                '?token=' + localStorage.getItem('loginToken') +
                '&companyID=' + localStorage.getItem('loginCompanyID');
        };

        /**
         * 上传功能
         * @param file 上传文件
         */
        $scope.upload = function( file ) {
            var modalTipText = '';  //弹窗提示文案

            if ( !file ) {
                return;
            }

            $scope.loadStatus = true;

            // 文件格式匹配  必须为图片
            var imgReg = /\.(gif|jpeg|png|jpg|bmp)/i;
            if( !imgReg.test( file.name ) ){
                modalTipText = '照片格式错误，请您打印填写表格，并盖章后，拍照后上传申请表照片。';
                uploadTip( modalTipText );
                return;
            }

            //文件大小判断, 不得大于5M
            if( file.size > 5 * 1024 * 1024 ){
                modalTipText = '企业信息变更申请表上传失败，照片大小需控制在5M以内，请确认后重新尝试。';
                uploadTip( modalTipText );
                return;
            }

            $scope.uploadError = '';

            Upload.upload( {
                url: '/certificate/upload-modify',
                data: {
                    file: file,
                    type: 3,
                    token:localStorage.getItem('loginToken') ,
                    companyID:localStorage.getItem('loginCompanyID')
                }
            } ).
            then( function( resp ) {

                var res = resp.data;

                if ( res.error.returnCode == '0' ) {
                    $scope.loadStatus = false;
                    $scope.successUploaded = true;
                } else {
                    $scope.successUploaded = false;
                    // uploadFailModal();
                    // $rootScope.globalError( res.error.returnMessage);
                    // modalTipText = '企业信息变更申请表上传失败，照片大小需控制在5M以内，请确认后重新尝试。';
                    modalTipText = res.error.returnUserMessage;
                    uploadTip( modalTipText );
                }

            }, function() {
                $scope.loadStatus = false;
                $scope.successUploaded = false;
                $rootScope.globalError( '异常错误！' );
            } );
        };

        /**
         * 上传文件类型、大小、失败等的处理方法
         * 弹窗提示  并取消按钮loading菊花
         * @param tip: 提示文案
         */
        function uploadTip( tip ) {
            uploadFailModal( tip );
            $scope.loadStatus = false;
        }

        //上传弹窗
        function uploadFailModal( tipText ) {
            $uibModal.open( {
                animation: false,
                templateUrl: 'uploadChangeRequest.html',
                controller: 'uploadChangeRequestCtrl',
                size: 'modify-info-size',
                resolve: {
                    modifyData: function () {
                        return tipText;
                    }
                }
            } );
        }

        /**
         * 取消修改,  跳转到/audit
         * goAudit 跳转到/audit
         */
        $scope.cancelModify = function () {
            _http({
                url: '/certificate/cancel-modify',
                method: 'POST'
            }).then(function (res) {
                if(res.data.error.returnCode == '0'){
                    $scope.goAudit();
                }else{
                    $rootScope.globalError( res.data.error.returnUserMessage);
                }
            },function (err) {
                $rootScope.globalError('异常错误');
            })
        };

        $scope.goAudit = function () {
            $location.url('/audit');
        };

    }  )
    //弹出层controller
    .controller( 'uploadChangeRequestCtrl', [ '$scope', '$rootScope', '$uibModalInstance', '$location', '_http',  '$interval', 'modifyData', function( $scope, $rootScope, $uibModalInstance, $location, _http,  $interval, modifyData ) {
        $scope.tipText = modifyData;  //提示文案
        $scope.modalClose = function() {
            $uibModalInstance.close();
        };
    } ] );
