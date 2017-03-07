'use strict';
angular.module('myApp')

.controller('PayFstCtrl', function($scope, $compile, $rootScope, $location, _http, $uibModal, payTools, Upload, $routeParams) {


    $scope.loadStatus = false;
    $scope.pageSize = 20;
    $scope.wageList = [];
    $scope.orderId = $routeParams.orderId || '';
    $scope.excelErrorMessage = '';
    $scope.test = {
        id: '78'
    };

    $scope.init = function() {

        // 有orderId则获取初始信息，没有则生成orderId并获取初始信息
        payTools.queryStatus({
            order: $scope.orderId,
            sel_type: 1
        }).then(function(res) {
            if (res.data.error.returnCode == '0') {
                $scope.data = res.data.data;
                $scope.orderId = res.data.data.order;
                $location.url('/payFst/' + $scope.orderId);
            } else {
                $rootScope.globalError(res.data.error.returnMessage);
            }
        }, function() {
            $rootScope.globalError('异常错误！');
        });

    };

    /**
     * 上传功能
     * @param file 上传文件
     * @param type  首次上传还是重新上传  0 : 首次上传; 1 : 重新上传;
     * @param order 重新上传的话  传order;
     */
    var errText = {
        '40002': '员工人数不能超过5000，请修改后上传',
        '40004': '仅支持Excel文件，请重新上传',
        '40005': '文件大小为0，请重新上传',
        '40007': '文件内容有误，请重新上传',
    };
    $scope.upload = function(file, type) {

        if (!file) {
            return;
        };
        $scope.loadStatus = true;
        Upload.upload({
            url: '/wage/wage-upload',
            data: {
                file: file,
                order: $scope.orderId,
                type: type,
                token: localStorage.getItem('loginToken'),
                companyID: localStorage.getItem('loginCompanyID')
            }
        }).
        then(function(res) {
            var returnCode = res.data.error.returnCode;
            $scope.loadStatus = false;
            if (returnCode == '0') {
                //$location.url('/payFst/' + $scope.orderId);
                $scope.$broadcast('uploadSuccessEvent', $scope.loadStatus);
            } else {
                $scope.onlineEdit(errText[returnCode])
            }

        }, function() {
            $scope.loadStatus = false;
            $rootScope.globalError('异常错误！');
        });
    };

    // 通用弹窗模板
    $scope.onlineEdit = function(text) {
        $uibModal.open({
            animation: false,
            templateUrl: 'onlineEdit.html',
            controller: 'onlineEditCtrl',
            size: 'zerofriend-size',
            resolve: {
                $parent: function() {
                    return {
                        text: text
                    };
                }
            }
        })
    };

    $scope.$on('nextStepEvent', function(event, data) {  
        nextStep()
    });
    $scope.stepSave = function() {
        $scope.$broadcast('notEmptyEvent', 'notEmpty');
    };
    function nextStep() {
        if ( $rootScope.btnSwitch ) {
            return;
        }
        _http({
            url: '/wage/step-save',
            method: 'POST',
            dataType: 'json',
            data: {
                order: $scope.orderId,
                struct_type: '-1',
                action: '40',
                sel_type: '1',
                fix_type: '-1'
            }
        }).then(function(res) {
            if (res.data.error.returnCode == '0') {
                $location.url('/payScd/' + $scope.orderId);
            } else if (res.data.error.returnCode == '40001') {
                $uibModal.open({
                    animation: false,
                    templateUrl: 'BalanceTips.html',
                    controller: 'payFstBalanceTipsCtrl',
                    size: 'zerofriend-size',
                    resolve: {
                        $parent: function() {
                            return {
                                banlance: res.data.data.amount
                            };
                        }
                    }
                })
            } else if (res.data.error.returnCode == '40002') {
                $scope.onlineEdit();
            } else {
                $rootScope.globalError(res.data.error.returnMessage);
            }
        }, function() {
            $rootScope.globalError('异常错误');
        });
    };

}).controller('payFstBalanceTipsCtrl', ['$scope', '$uibModalInstance', '$parent', '$location', function($scope, $uibModalInstance, $parent, $location) {
    $scope.balance = $parent.banlance;

    $scope.cancel = function() {
        $uibModalInstance.close();
    };

    $scope.goRecharge = function() {
        $location.url('/how2-recharge');
        $uibModalInstance.close();
    }; 

}])

.controller('onlineEditCtrl', ['$scope', '$uibModalInstance', '$parent', '$location', function($scope, $uibModalInstance, $parent, $location) {

    $scope.errorModalText = $parent.text;
    $scope.cancel = function() {
        $uibModalInstance.close();
    };

}])
