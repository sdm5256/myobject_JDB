'use strict';

angular.module('myApp')
    .controller('optimizeFstCtrl', function($scope, payTools, $rootScope, $routeParams, $location, _http, $uibModal) {
        $scope.structType = '';
        $scope.comorder = {};
        $scope.btnable=true;
        $scope.uploadStatus=false;
        $scope.orderId=$routeParams.orderId||'';
        $scope.optimizeInit = function(second) {
            _http({
                url: '/wage/step-pending',
                method: 'POST',
                data: {
                    order: $scope.orderId,
                    sel_type: 2
                }
            }).then(function(res) {
                if (res.data.error.returnCode != '0') {
                    $rootScope.globalError(res.data.error.returnMessage);
                    return;                   
                } else {
                    $scope.orderId = res.data.data.order;                   
                    if($routeParams.orderId){                      
                        $scope.struct_type = res.data.data.ext.struct_type;
                        $scope.selectType($scope.struct_type);
                    }
                    if(second){
                        $scope.nextStep();
                    }
                }
            }, function() {
                $rootScope.globalError('异常错误');
            });
        };
        $scope.optimizeInit();

        $scope.selectType = function(type) {
            if (type == 0) {
                $scope.struct_type= type;  
                $scope.isSelect1 = true;
                $scope.isSelect2 = false;
            } else {
                $scope.struct_type= type;  
                $scope.isSelect1 = false;
                $scope.isSelect2 = true;
            }
            $scope.btnable=false;
        }
        $scope.nextStep = function() {
            $scope.btnable=true;
            $scope.uploadStatus=true;
            if(!$scope.orderId){
                $scope.optimizeInit(true);
                return;
            }
            _http({
                url: '/wage/step-save',
                method: 'POST',
                dataType: 'json',
                data: {
                    order: $scope.orderId,
                    action:'20',
                    sel_type: '2',
                    struct_type: $scope.struct_type,
                    fix_type: '-1'
                }
            }).then(function(res) {
                if (res.data.error.returnCode != '0') {
                    $scope.btnable=false;
                    $scope.uploadStatus=false;
                    $rootScope.globalError(res.data.error.returnMessage);
                    return;
                } else {
                    $scope.btnable=false;
                    $scope.uploadStatus=false;
                    var orderurl='/optimizeScd/'+$scope.orderId;
                    $location.url(orderurl);
                }
            }, function() {
                $scope.btnable=false;
                $scope.uploadStatus=false;
                $rootScope.globalError('异常错误');
            });
        }
    });
