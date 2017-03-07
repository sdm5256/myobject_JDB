'use strict';

angular.module('myApp')

.controller('LaborFstCtrl', function($scope, $rootScope, $routeParams, $location, _http, $uibModal, payTools, Upload) {

    $scope.loadStatus = false;
    $scope.pageSize = 20;
    $scope.wageList = [];
    $scope.orderId = $routeParams.orderId || '';
    $scope.excelErrorMessage = '';

    $scope.init = function() {

        // 有orderId则获取初始信息，没有则生成orderId并获取初始信息
        payTools.queryStatus({
            order: $scope.orderId,
            sel_type: 3
        }).then(function(res) {
            if (res.data.error.returnCode == '0') {
                $scope.data = res.data.data;
                $scope.orderId = res.data.data.order;
                $location.url('/laborFst/' + $scope.orderId);
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
            url: '/wage/upload-work',
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

            if (returnCode == '0' || returnCode == 'WA400078') {
                $scope.$broadcast('uploadSuccessEvent', $scope.loadStatus);
                //$location.url('/laborFst/' + $scope.orderId);
            } else {
                $scope.onlineEdit(errText[returnCode]);
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

    $scope.stepSave = function() {
        //  判断表格是否为空
    	$scope.$broadcast('notEmptyEvent', 'notEmpty');
    };

    $scope.$on('nextStepEvent', function(event, data) {  
        //  表格不为空 
        nextStep();
    });

    function nextStep() {
        _http({
            url: '/wage/step-save',
            method: 'POST',
            dataType: 'json',
            data: {
                order: $scope.orderId,
                struct_type: '-1',
                action: '40',
                sel_type: '3',
                fix_type: '-1'
            }
        }).then(function(res) {
            if (res.data.error.returnCode == '0') {
                $location.url('/laborScd/' + $scope.orderId);
            } else if (res.data.error.returnCode == '40001') {
                $uibModal.open({
                    animation: false,
                    templateUrl: 'BalanceTips.html',
                    controller: 'laborFstBalanceTipsCtrl',
                    size: 'zerofriend-size',
                    resolve: {
                        $parent: function() {
                            return {
                                balance: res.data.data.amount
                            };
                        }
                    }
                })
            } else if (res.data.error.returnCode == '40002') {
                $scope.errorModalText = '员工人数不能超过5000，请修改后上传';
                $scope.onlineEdit($scope.errorModalText);
            } else {
                $rootScope.globalError(res.data.error.returnMessage);
            }
        }, function() {
            $rootScope.globalError('异常错误');
        });
    }

}).controller('laborFstBalanceTipsCtrl', ['$scope', '$uibModalInstance', '$parent', '$location', function($scope, $uibModalInstance, $parent, $location) {

    $scope.balance = $parent.balance;

    $scope.cancel = function() {
        $uibModalInstance.close();
    };

    $scope.goRecharge = function() {
        $location.url('/how2-recharge');
        $uibModalInstance.close();
    };
}]).controller('onlineEditCtrl', ['$scope', '$uibModalInstance', '$parent', '$location', function($scope, $uibModalInstance, $parent, $location) {

    $scope.errorModalText = $parent.text;
    $scope.cancel = function() {
        $uibModalInstance.close();
    };

}]);
