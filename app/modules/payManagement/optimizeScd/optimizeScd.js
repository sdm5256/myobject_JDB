'use strict';

angular.module('myApp')
    .controller('optimizeScdCtrl', function($scope, payTools, $rootScope, $routeParams, $location, _http, $uibModal, Upload) {
        $scope.orderId = $routeParams.orderId;
        $scope.pageSize = 20;
        $scope.listShow = true;
        $scope.wagePageDisabled = true;
        $scope.secondTable = false;
        $scope.excelErrorMessage = '';
        $scope.commonMsg = payTools.getCache();
        $scope.optimizeInit = function() {
            _http({
                url: '/wage/step-pending',
                method: 'POST',
                data: {
                    order: $routeParams.orderId,
                    sel_type: 2
                }
            }).then(function(res) {
                if (res.data.error.returnCode != '0') {
                    $rootScope.globalError(res.data.error.returnMessage);
                    return;
                } else {
                    $scope.returnMsg = res.data.data;
                    $scope.struct_type = $scope.returnMsg.ext.struct_type;
                    $scope.updateView($scope.returnMsg);
                }
            }, function() {
                $rootScope.globalError('异常错误');
            });
        };
        $scope.optimizeInit();

        $scope.updateView = function(res) {
            //0工资+劳务报酬,1工资+年终奖金
            if (res.ext.struct_type == 0) {
                $scope.wglstUrl = {
                    listUrl: '/wage/edit-work-wage-list',
                    upldUrl: '/wage/upload-work-wage'
                };
                $scope.listShow = true;
                $scope.downloadUrl = '/qrcode/工资优化-工资+劳务报酬.xls';
            } else {
                $scope.listShow = false;
                $scope.wglstUrl = {
                    listUrl: '/wage/edit-bonus-wage-list',
                    upldUrl: '/wage/upload-bonus-wage'
                };
                $scope.downloadUrl = '/qrcode/工资优化-工资+年终奖.xls';
            }

        }

        var errText = {
            '40002':'员工人数不能超过5000，请修改后上传',
            '40004':'仅支持Excel文件，请重新上传',
            '40005':'文件大小为0，请重新上传',
            '40007':'文件内容有误，请重新上传',
        };
        $scope.upload = function(file) { //uploadBonusWage
           
            if (!file) {
                return;
            }
            $scope.uploadError = '';
            $scope.uploadStatus = true;

            Upload.upload({
                url: $scope.wglstUrl.upldUrl,
                data: {
                    file: file,
                    order: $routeParams.orderId,
                    type: '0',
                    token: localStorage.getItem('loginToken'),
                    companyID: localStorage.getItem('loginCompanyID')
                }
            }).then(function(resp) {
                var res = resp.data.error.returnCode;
                $scope.uploadStatus = false;
                if (res != '0') {
                    //$scope.excelErrorMessage = res.error.returnMessage;
                    if( errText[res] ) {
                        $scope.errorTost(errText[res],false);
                    } else {
                        $rootScope.globalError( res.data.error.returnMessage );
                    }
                    
                } else {
                    $scope.excelErrorMessage = '';                   
                    $scope.secondTable = true;
                    // 更新table数据 
                    $scope.$broadcast('uploadSuccessEvent', $scope.loadStatus);
                    
                }
            }, function() {
                $scope.uploadStatus = false;
                $rootScope.globalError('异常错误！');
            });
        };

        
        $scope.nextStep = function() {
            //  判断表格是否为空
            $scope.$broadcast('notEmptyEvent', 'notEmpty');          
        }

        $scope.preStep = function() {
            $scope.stepCommon('10', '/optimizeFst/');
        }

        $scope.$on('nextStepEvent', function(event, data) {  
            //  表格不为空 
            $scope.stepCommon('30', '/optimizeThd/');
        });
        
        $scope.stepCommon = function(action, url) {
            _http({
                url: '/wage/step-save',
                method: 'POST',
                dataType: 'json',
                data: {
                    order: $routeParams.orderId,
                    action: action,
                    sel_type: '2',
                    struct_type: '-1',
                    fix_type: '-1'
                }
            }).then(function(res) {
                if (res.data.error.returnCode != '0') {
                    if (res.data.error.returnCode == '40001') {
                        $scope.errorTost(res.data.data.amount,true);
                    }else if(res.data.error.returnCode == '40002'){
                        $scope.errorTost('员工人数人数不能超过5000，请修改后重新上传',false);
                    }else{
                        $rootScope.globalError(res.data.error.returnMessage);
                    }
                } else {
                    var orderurl = url + $scope.orderId;
                    $location.url(orderurl);
                }
            }, function() {
                $rootScope.globalError('异常错误');
            });
        }
      
        //弹窗
         $scope.errorTost=function(errorModalText,errorShow) {
            
            $uibModal.open({
                animation: false,
                templateUrl: 'notFunds.html',
                controller: 'notFundsCtrl',
                size: 'zerofriend-size',
                resolve: {
                    $parent: function() {
                        return {
                            funds: errorModalText,
                            isshow: errorShow
                        };
                    }
                }
            })
        }
        

    })
    .controller('notFundsCtrl', ['$scope', '$uibModalInstance', '$parent', '$location', function($scope, $uibModalInstance, $parent, $location) {

        $scope.funds = $parent.funds;
        $scope.isshow = $parent.isshow;
        $scope.cancel = function() {
            $uibModalInstance.close();

        };

        $scope.goRecharge = function() {
            $location.url('/how2-recharge');
            $uibModalInstance.close();
        };
    }])
