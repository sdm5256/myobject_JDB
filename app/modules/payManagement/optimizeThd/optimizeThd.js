'use strict';

angular.module('myApp')
    .controller('optimizeThdCtrl', function($scope, payTools, $rootScope, $routeParams, $location, _http, $uibModal) {
        $scope.orderId=$routeParams.orderId;
        $scope.fixType = 0;
        $scope.calculateRst = false;
        $scope.optimizeInit = function() {
            _http({
                url: '/wage/step-pending',
                method: 'POST',
                data: {
                    order: $scope.orderId,
                    sel_type: 2
                }
            }).then(function(res) {
                if (res.data.error.returnCode == '0') {
                    $scope.returnMsg=res.data.data;
                    $scope.struct_type= $scope.returnMsg.ext.struct_type;//0工资+劳务报酬,1工资+年终奖金
                    if($scope.struct_type==0){
                        $scope.selectShow=true;
                    }else{
                        $scope.selectShow=false;
                    }
                    if($scope.returnMsg.ext.fix_type){
                        $scope.fixType = $scope.returnMsg.ext.fix_type;
                        
                    }
                    $scope.optimizeCalculate();
                } else {
                    $rootScope.globalError(res.data.error.returnMessage);
                }
            }, function() {
                $rootScope.globalError('异常错误');
            });
        };
        $scope.optimizeInit();

        $scope.optimizeCalculate = function() {
            _http({
                url: '/wage/fix-list',
                method: 'POST',
                data: {
                    order: $routeParams.orderId,
                    fix_type: $scope.fixType
                }
            }).
            then(function(res) {
                if (res.data.error.returnCode == '0') {
                    $scope.fixBefore = res.data.data.fix_be;
                    $scope.fixAfter = res.data.data.fix_af;
                    if (parseInt($scope.fixAfter.fix_amount) != 0) {
                        $scope.calculateRst = true;
                    }else{
                        $scope.calculateRst =false;
                    }
                    payTools.setCache({calculateRst:$scope.calculateRst})
                } else {
                    $rootScope.globalError(res.data.error.returnMessage);
                }
            }, function() {
                $rootScope.globalError('异常错误！');
            });
        };
        

        $scope.nextStep = function() {
            $scope.stepCommon('40','/optimizeFth/');
        };
        
        $scope.preStep = function() {
            $scope.stepCommon('20','/optimizeScd/');
        };

        $scope.stepCommon = function(action,url){
             _http({
                url: '/wage/step-save',
                method: 'POST',
                dataType: 'json',
                data: {
                    order: $routeParams.orderId,
                    action: action,
                    sel_type: '2',
                    struct_type: '-1',
                    fix_type: $scope.fixType
                }
            }).then(function(res) {
                if (res.data.error.returnCode != '0') {
                    $rootScope.globalError(res.data.error.returnMessage);
                } else {
                    var orderurl = url + $scope.orderId;
                    $location.url(orderurl);                    
                }
            }, function() {
                $rootScope.globalError('异常错误');
            });
        }

    })
