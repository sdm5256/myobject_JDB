'use strict';

angular.module('myApp')
    .directive('reimbPay', function () {
        return {
            restrict: 'EA',
            scope: true,
            templateUrl: 'modules/reimbursement/pay/pay.html',
            controller: function($scope, $rootScope, $routeParams, $location, _http, $uibModal, Upload) {
                    var params = {
                        token: localStorage.getItem('loginToken'),
                        companyID: localStorage.getItem('loginCompanyID')
                    }
                    $scope.Url = {
                        downloadExcel: '/reimburse/download-excel?' + $.param(params)
                    }
                    $scope.throttle = function (fn, delay){
                        var timer = null;
                        return function(){
                            var context = this, args = arguments;
                            clearTimeout(timer);
                            timer = setTimeout(function(){
                                fn.apply(context, args);
                            }, delay);
                        };
                    };
                    $scope.refresh = function() {
                        $location.url('/reimbursement-main/confirm/' + $scope.pendingData.orderId);
                    }


                    $scope.nextStepHandler = function () {
                        $scope.canNext = false;
                        _http({
                            url: '/reimburse/confirm',
                            method: 'POST',
                            data: {
                                order: $scope.pendingData.orderId
                            }
                        })
                        .then(function (res) {
                            $scope.canNext = true;
                            var returnCode = _.get(res, 'data.error.returnCode');

                            if ('RE400071' === returnCode) {
                                $uibModal.open({
                                    onimation: false,
                                    templateUrl: 'BalanceTips.html',
                                    controller: 'BalanceTipsCtrl',
                                    size: 'reimb-info-size',
                                    resolve: {
                                        $parent: function () {
                                            return {
                                                content: _.get(res, 'data.error.returnUserMessage')
                                            };
                                        }
                                    }
                                })

                                return;
                            }
                            if ('RE400070' === returnCode) {
                                $uibModal.open( {
                                    animation: false,
                                    templateUrl: 'commonAlert.html',
                                    controller: 'CommonAlertCtrl',
                                    size: 'reimb-info-size',
                                    resolve: {
                                        data: function() {
                                            return {
                                                title: "提示",
                                                content:  _.get(res, 'data.error.returnUserMessage')
                                            }
                                        }
                                    }
                                });

                                return;
                            }
                            if (0 === +returnCode) {
                                $scope.refresh();

                                return;
                            }

                            $rootScope.globalError( _.get(res, 'data.error.returnUserMessage') || '异常错误！' );
                        }, function (){
                            $scope.canNext = true;
                            $rootScope.globalError( '异常错误！' );
                        });
                    }


                    function updateUploadBtn(isUploading) {
                        $scope.isUploading = isUploading;
                    }

                    $scope.upload = function( file ) {
                        if ( !file ) {
                            return;
                        }
                        updateUploadBtn(true);
                        Upload.upload( {
                            url: '/reimburse/upload',
                            data: {
                                file: file,
                                order: $scope.pendingData.orderId,
                                token: localStorage.getItem('loginToken'),
                                companyID: localStorage.getItem('loginCompanyID')
                            }
                        } ).then(function(res) {
                            updateUploadBtn(false);
                            if (0 !== _.get(res, 'data.error.returnCode')) {
                                var msg = _.get(res, 'data.error.returnUserMessage') || '服务异常！'

                                $uibModal.open( {
                                    animation: false,
                                    templateUrl: 'commonAlert.html',
                                    controller: 'CommonAlertCtrl',
                                    size: 'modify-info-size',
                                    resolve: {
                                        data: function() {
                                            return {
                                                title: "提示",
                                                content: msg
                                            }
                                        }
                                    }
                                });
                                return;
                            }
                            $location.url('/reimbursement-main/pay/' + res.data.data.order );

                        }, function() {
                            updateUploadBtn(false);
                            $rootScope.globalError( '异常错误！' );
                        } );
                    };

                }

            
        }
    })
    .controller('CommonAlertCtrl', [
        '$scope',
        '$rootScope',
        '$uibModalInstance',
        'data',
        function( $scope, $rootScope, $uibModalInstance, data) {
            $scope.title = data.title;
            $scope.content = data.content;
            $scope.modalClose = function() {
                $uibModalInstance.close();
            };

        }
    ])
    .controller('BalanceTipsCtrl', [
        '$scope',
        '$uibModalInstance',
        '$parent',
        '$location',
        function(
            $scope,
            $uibModalInstance,
            $parent,
            $location
        ) {

            $scope.content = $parent.content;

            $scope.cancel = function() {
                $uibModalInstance.close();
            };

            $scope.goRecharge = function() {
                $location.url('/how2-recharge');	
                $uibModalInstance.close();
            };
        }
    ])


