'use strict';

angular.module('myApp')
    .directive('reimbPayBatchInput', function () {
        return {
            restrict: 'EA',
            scope: false,
            templateUrl: 'modules/reimbursement/pay/directive/batchInput.html',
            controller: [
                '$scope',
                '$rootScope',
                '$routeParams',
                '$location',
                '_http',
                
                function($scope, $rootScope, $routeParams, $location, _http) {
                    $scope.inputMoney = '';
                    $scope.inputRemark = '';
                    var REMARK_INPUT_LIMIT = 10;
                    var MAX_INPUT_MONEY = 50000;

                    $scope.checkRemarkFormat = function(val) {
                        if (val === undefined || val === null || '' === val) {
                            $scope.btnRemark = false;

                            return '';
                        }

                        return val.substr(0, REMARK_INPUT_LIMIT);
                    }

                    $scope.checkMoneyFormat = function(val) {
                        var val = String(val);
                        if (isNaN(val) || val === undefined || val === null || '' === val) {
                            $scope.btnMoney = false;

                            return '';
                        }
                        var pointIndex = val.indexOf('.');

                        // 输入是3位小数时，需要格式化位2位小数
                        if (pointIndex > -1 && ((val.length - 1) - pointIndex > 2)) {
                            val = Number(val).toFixed(2);
                        }

                        if (Number(val) > MAX_INPUT_MONEY) {
                            $scope.isShowMoneyTip = true;
                        }

                        return val;
                    }
                    $scope.bgEnterHandler = function (type){
                        if (type === 'money') {
                            $scope.moneyCanCancel = false;
                        }
                        if (type === 'remark') {
                            $scope.remarkCanCancel = false;
                        }
                    }
                    $scope.bgLeaveHandler = function (type){
                        if (type === 'money') {
                            $scope.moneyCanCancel = true;
                        }
                        if (type === 'remark') {
                            $scope.remarkCanCancel = true;
                        }
                    }
                    $scope.inputFoucsHandler = function (type) {
                        if (type === 'money') {
                            $scope.cancelHandler('remark');
                            $scope.inputMoneyBg = true;
                            if ('' === $scope.inputMoney || null === $scope.inputMoney) {
                                $scope.backupListData($scope.listData, ['amount']);
                            }
                        }
                        if (type === 'remark') {
                            $scope.cancelHandler('money');
                            $scope.inputRemarkBg = true;
                            if ('' === $scope.inputRemark || null === $scope.inputRemark) {
                                $scope.backupListData($scope.listData, ['remk']);
                            }
                        }
                    }
                    $scope.inputBlurHandler = function (type) {
                        if ('money' === type && $scope.moneyCanCancel) {
                            $scope.cancelHandler(type);
                        }
                        if ('remark' === type && $scope.remarkCanCancel) {
                            $scope.cancelHandler(type);
                        }
                    }
                    $scope.inputChangeHandler = $scope.throttle(function (type) {
                        $scope.$apply(function(){

                        if(type === 'money') {
                            $scope.isShowMoneyTip = false;
                            if ('' !== $scope.inputMoney && null !== $scope.inputMoney) {
                                $scope.btnMoney = true;
                                $scope.inputMoney = $scope.checkMoneyFormat($scope.inputMoney);
                                var money = ('' === $scope.inputMoney ? '' : $scope.inputMoney * 100);
                                $scope.updateListData($scope.listData, 'amount', money);
                            }
                            else {
                                $scope.btnMoney = false;
                            }

                        }
                        if(type === 'remark') {
                            if ('' !== $scope.inputRemark && null !== $scope.inputRemark) {
                                $scope.btnRemark = true;
                                $scope.inputRemark = $scope.checkRemarkFormat($scope.inputRemark);
                                $scope.updateListData($scope.listData, 'remk', $scope.inputRemark);
                            }
                            else {
                                $scope.btnRemark = false;
                            }
                        }
                        });
                    }, 500);
                    $scope.cancelHandler = function (type) {
                        if (type === 'money') {
                            $scope.isShowMoneyTip = false;
                            $scope.inputMoneyBg = false;
                            $scope.inputMoney = ''; // input 'e' can't reset to '', is angular's bug ?
                            $scope.restoreListData($scope.listData, ['amount']);
                        }
                        if (type === 'remark') {
                            $scope.inputRemarkBg = false;
                            $scope.inputRemark = '';
                            $scope.restoreListData($scope.listData, ['remk']);
                        }
                    }
                    function afterOkHandler (type) {
                        if (type === 'money') {
                            $scope.isShowMoneyTip = false;
                            $scope.inputMoneyBg = false;
                            $scope.inputMoney = '';
                            $scope.clearBackupListData($scope.listData, ['amount'])
                        }
                        if (type === 'remark') {
                            $scope.inputRemarkBg = false;
                            $scope.inputRemark = '';
                            $scope.clearBackupListData($scope.listData, ['remk'])
                        }
                        $scope.updateUI();
                    }
                    $scope.okHandler = function (type) {
                        var data = {
                            order: $scope.pendingData.orderId,
                        };
                        if ('money' === type) {
                            if ($scope.isShowMoneyTip) {
                                return;
                            }
                            data.amount = +$scope.inputMoney * 100;
                            data.remk = '';
                        }
                        if ('remark' === type) {
                            data.remk = $scope.inputRemark;
                            data.amount = '';
                        }

                        _http({
                            url: '/reimburse/update-batch',
                            method: 'POST',
                            data: data
                        })
                        .then(function (res) {
                            if (0 !== _.get(res, 'data.error.returnCode')) {
                                var msg = _.get(res, 'data.error.returnUserMessage') || '服务异常！'
                                $rootScope.globalError(msg);
                                return;
                            }
                            afterOkHandler(type);
                        }, function (){
                            $rootScope.globalError('服务异常！');
                        });
                    }
                }
            ]
        }
    })
