'use strict';

angular.module( 'myApp')

    .controller( 'employeeListCtrl', function( $scope, $timeout, $rootScope, $location, _http,  Upload, $uibModal, $company) {
        $scope.pageSize = 20;
        $scope.excelResult = {};
        $scope.excelResult.res = false;
        $scope.getTable = getTable;
        $scope.loading = false;
        $rootScope.showStaffTip = false
        $scope.employeeType = ['普通员工','中层','高管'];
        $scope.staffMsg = {};
        $scope.staffType = '普通员工';
        $scope.batchAdd = true;
        $scope.btnDisable = false;
        $scope.addLoading = false;
        $scope.timeClose = null;

        $scope.goToRecharge = function() {
			$location.url( '/how2-recharge' );
        };

        $scope.uploadConfirm = function() {
            $uibModal.open( {
                animation: false,
                templateUrl: 'uploadEmployeelist.html',
                controller: 'UploadEmployeelistCtrl',
                size: 'modify-info-size',
                resolve: {
                    modifyData: function() {
                        return {
                            upload: $scope.upload
                        };
                    }
                }
            } );
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
                url: '/staff/upload-staff-excel',
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
                    getTable();
                    $scope.excelResult.excelError = false;
                    $scope.showExcel = true;
                    $rootScope.showStaffTip = true;
                } else {
                    $scope.loading = false;
                    $rootScope.showStaffTip = false;
                    $scope.excelResult.excelError = true;
                    $scope.excelResult.excelErrorMessage = res.error.returnMessage;
                }
            }, function() {
                $scope.loading = false;
                $rootScope.showStaffTip = false;
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
                url: '/staff/get-upload-result',
                method: 'POST',
                data: {
                    uploadNo: $scope.dataNo,
                    pageSize: $scope.pageSize,
                    pageNo: index
                }
            } ).
            then( function( res ) {
                if ( res.data.error.returnCode == '0' ) {
                    $scope.hasExcelResult = true;
                    $scope.loading = false;
                    $scope.employeeList = res.data.data.list;
                    $scope.wagePageDisabled = false;
                    $scope.resultCount = res.data.data.total;
                }else if ( res.data.error.returnCode == '400' || res.data.error.returnCode == '503' ) {
                    $rootScope.globalError( res.data.error.returnMessage );
                    $scope.loading = false;
                } else {
                    setTimeout( function() {getTable();}, 5000 );
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
        // 手动添加员工
        $scope.tapChange = function(value){
           $scope.batchAdd = value;
        }
        $scope.nameCheck = function(){
            var nameReg =  /^[\u4e00-\u9fa5]+(·[\u4e00-\u9fa5]+)*$/;  //·  
            var strReg = /^[\u4e00-\u9fa5|·]*$/;     
            $scope.isUseable();         
            if( $scope.staffMsg.name ) {
                $scope.staffMsg.name=$scope.staffMsg.name.replace(/(^\s*)|(\s*$)/g, "");
                if($scope.staffMsg.name.length>0){
                    if(strReg.test($scope.staffMsg.name)){
                        if(($scope.staffMsg.name.length<2||$scope.staffMsg.name.length>15)){
                                $scope.nameErrorMsg = '姓名仅限2-15个汉字';
                        }else if(!nameReg.test($scope.staffMsg.name )){
                                $scope.nameErrorMsg = '姓名仅限输入汉字';
                        }else{
                                $scope.nameErrorMsg = '';
                        }
                    }else{
                        $scope.nameErrorMsg = '姓名仅限输入汉字';
                    }
                }else{
                     $scope.nameErrorMsg = '姓名不能为空';
                }
                
            }else {
                $scope.nameErrorMsg = '姓名不能为空';
            }
        }
        $scope.phoneCheck = function(){
            var nameReg =  /^1\d{10}$/;
            var strReg = /^\d*$/;            
            $scope.isUseable();      
            if( $scope.staffMsg.mobilephone ) {
                $scope.staffMsg.mobilephone=$scope.staffMsg.mobilephone.replace(/(^\s*)|(\s*$)/g, "");
                if($scope.staffMsg.mobilephone.length>0){
                    if(strReg.test( $scope.staffMsg.mobilephone )){
                        if(nameReg.test( $scope.staffMsg.mobilephone )){
                            $scope.phoneErrorMsg = '';
                        }else{
                            $scope.phoneErrorMsg = '手机号格式不正确';
                        }
                    }else{
                        $scope.phoneErrorMsg = '手机号仅限输入数字';
                    }
                }else{
                    $scope.phoneErrorMsg = '手机号不能为空';
                }                  
            }else {
                $scope.phoneErrorMsg = '手机号不能为空';
            }
        }
        $scope.cardCheck = function(){
            var cardReg =  /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
            var numReg = /^[a-zA-Z0-9]*$/;           
            $scope.isUseable();          
            if( $scope.staffMsg.id_no ) {
                $scope.staffMsg.id_no=$scope.staffMsg.id_no.replace(/(^\s*)|(\s*$)/g, "");
                if($scope.staffMsg.id_no.length>0){
                    if(numReg.test( $scope.staffMsg.id_no )){
                        if (cardReg.test( $scope.staffMsg.id_no )) {
                            $scope.cardErrorMsg = '';
                        }else{
                            $scope.cardErrorMsg = '身份证号格式不正确';
                        }
                    }else{
                        $scope.cardErrorMsg = '身份证号仅限输入数字或英文';
                    }
                }else{
                    $scope.cardErrorMsg = '身份证号不能为空';
                }
            }else {
                $scope.cardErrorMsg = '身份证号不能为空';
            }
        }
        $scope.isUseable = function(){
            if( $scope.staffMsg.name && $scope.staffMsg.mobilephone && $scope.staffMsg.id_no){
                $scope.btnDisable = true;
            }else{
                $scope.btnDisable = false;
            }
        }
        $scope.saveMsg = function(type){
            if (!$scope.btnDisable) return;
            for( var i = 0; i < 3; i++){
                if( $scope.staffType == $scope.employeeType[i]){
                    $scope.staffMsg.staff_type = i+1;
                }
            }
            $scope.sendMsg(type);
        }      
        $scope.sendMsg = function(type){
            if(($scope.nameErrorMsg!=''||$scope.phoneErrorMsg!=''||$scope.cardErrorMsg!='')) return;
            $scope.addLoading = true;
            $scope.loading2 = true;
            _http( {
                    url: '/staff/add-one-staff',
                    method: 'POST',
                    data: $scope.staffMsg
                } ).
                then( function( res ) {
                    if ( res.data.error.returnCode == '0' ) {
                        $scope.loading2 = false;
                        $scope.successLoading = true;
                        if( res.data.error.returnUserMessage == '好友添加成功'){
                            $scope.promptMsg = true;
                        }else{
                            $scope.promptMsg = false;
                        }
                        $scope.timeClose = $timeout(function(){
                            $scope.addLoading = false;  
                            $scope.successLoading = false; 
                            if ( type == 1 ){
                                $location.url('/employee-management');
                            }else {
                               $scope.staffMsg = {};
                               $scope.staffType = '普通员工';
                            } 
                            $scope.isUseable();                         
                            $timeout.cancel($scope.timeClose);
                        },2000);
                    }else {
                        $scope.addLoading = false;
                        $scope.loading2 = false;
                        $rootScope.globalError(res.data.error.returnUserMessage);
                    }                   
                }, function() {
                        $scope.addLoading = false;
                        $scope.loading2 = false;
                        $rootScope.globalError( '异常错误！' );
                } );
         }
    }  );

/* 自定义controller */
angular.module( 'myApp' ).controller( 'UploadEmployeelistCtrl', [ '$scope', '$rootScope', '$uibModalInstance', '$location', '_http',  '$interval', 'modifyData', function( $scope, $rootScope, $uibModalInstance, $location, _http,  $interval, modifyData ) {
    $scope.upload = function( file ) {
        modifyData.upload( file );
        $uibModalInstance.close();
    };

    $scope.modalClose = function() {
        $uibModalInstance.close();
    };

} ] );

