'use strict';

angular.module('myApp')
    .controller('optimizeFthCtrl', function($scope, payTools, $rootScope, $routeParams, $location, _http, $uibModal) {
        $scope.orderId = $routeParams.orderId || '';
        $scope.pageSize = 20;
        $scope.commonMsg = payTools.getCache(); //payTools.queryStatus()
        $scope.sedText = true; // 第二步文字
        $scope.workSalaryDetail = true; //第一步工资表
        $scope.shaoMajianQuan = true;
        $scope.threeCol = false; //有优化，第一步完成，多显示三列
        $scope.stepStatus = true;
        $scope.isOptimize = payTools.getCache('calculateRst').calculateRst; //是否有优化
        $scope.optimizeInit = function() {
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
                    $scope.returnMsg = res.data.data;
                    $scope.struct_type = $scope.returnMsg.ext.struct_type; 
                    $scope.step = $scope.returnMsg.step;
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
                $scope.onceBonusAll = false;
                if (res.step == '410') {
                    $scope.workOptimize = false;
                    $scope.workOptimizeNo = true;
                    $scope.slaryListFst(); //第一步
                } else {
                    $scope.workOptimize = true;
                    $scope.workOptimizeNo = false;
                    $scope.slaryListFst(); //第一步
                    $scope.slaryListScd(); //第二步
                }
            } else {
                $scope.workOptimize = false;
                $scope.workOptimizeNo = false;
                $scope.onceBonusAll = true;
                $scope.bonusList();
            }
        }

        //鉴权状态监听
        $scope.$on('scanAuthSuccessEvent', function(event, authData) {
            if ($scope.struct_type == 0) { //0工资+劳务报酬,1工资+年终奖金               
                if ($scope.step =='410') {  
                    $scope.stepStatus = false;               
                }else{
                    $scope.shaoMajianQuan = false; //扫码隐藏
                    $scope.workSucessFst = true; //显示成功提示文案
                    $scope.workSalaryDetail = false; //第一步工资表隐藏
                    $scope.sedText = false; //第二部文字隐藏
                    $scope.laowubaochou = true; //第二部劳务报酬  
                }
            }else{
                $scope.stepStatus = false;
            }
        });
        $scope.slaryListFst = function(index) { //工资+劳务报酬（发放页第1步）
            if (!index) {
                index = 1;
            }

            $scope.wagePageDisabled = true;
			$scope.wagePageNo = index;

            _http({
                url: '/wage/work-wage-list',
                method: 'POST',
                data: {
                    order: $routeParams.orderId,
                    size: $scope.pageSize,
                    pageNo: index
                }
            }).
            then(function(res) {
                if (res.data.error.returnCode != '0') {
                    $rootScope.globalError(res.data.error.returnMessage);
                    $scope.wagePageDisabled = false; 
                    return;                  
                } else {
                    $scope.wageList = res.data.data.list;
                    $scope.total = res.data.data.total;
                    $scope.wagePageDisabled = false;
                    $scope.wageListTotal = $scope.total.number;
                }
            }, function() {
                $rootScope.globalError('异常错误！');
                $scope.wagePageDisabled = false;
            });
        };

        // 展开第一步工资信息表
        $scope.slidDown = function() {
            $scope.slaryListFst();
            $scope.threeCol = true;
            $scope.workSalaryDetail = true;
            $scope.shaoMajianQuan = true;
            $scope.workSucessFst = false;
            $scope.showExtraColumns = true;
        }
        //工资+劳务报酬（发放页第二步）
        $scope.slaryListScd = function(index) { 
            if (!index) {
                index = 1;
            }

            $scope.wagePageDisabled = true;
			$scope.pageNo = index;

            _http({
                url: '/wage/fix-work-wage-list',
                method: 'POST',
                data: {
                    order: $routeParams.orderId,
                    size: $scope.pageSize,
                    pageNo: index
                }
            }).
            then(function(res) {
                if (res.data.error.returnCode != '0') {
                    $rootScope.globalError(res.data.error.returnMessage);
                    $scope.wagePageDisabled = false;
                    return;
                } else {
                    $scope.wagePageDisabled = false;
                    $scope.wageListScd = res.data.data.list;
                    $scope.totalScd = res.data.data.total;                   
                    $scope.wageListTotalScd = $scope.totalScd.number;                   
                }
            }, function() {
                $rootScope.globalError('异常错误！');
                $scope.wagePageDisabled = false;
            });
        };

        // 工资+年终奖发放页面接口
        $scope.bonusList = function(index) {
            if (!index) {
                index = 1;
            }

            $scope.bonusPageDisabled = true;
			$scope.pageNo = index;

            _http({
                url: '/wage/bonus-wage-list',
                method: 'POST',
                data: {
                    order: $routeParams.orderId,
                    size: $scope.pageSize,
                    pageNo: index
                }
            }).
            then(function(res) {
                if (res.data.error.returnCode != '0') {
                    $rootScope.globalError(res.data.error.returnMessage);
                    $scope.bonusPageDisabled = false;
                    return;
                } else {
                    $scope.bonusPageDisabled = false;
                    $scope.bonusList = res.data.data.list;
                    $scope.bonusTotal = res.data.data.total;
                    $scope.bonusListTotal = $scope.bonusTotal.number;                   
                }
            }, function() {
                $rootScope.globalError('异常错误！');
                $scope.bonusPageDisabled = false;
            });
        };
        //完成
        $scope.worklaborFinish = function() {
                _http({
                    url: '/wage/step-save',
                    method: 'POST',
                    dataType: 'json',
                    data: {
                        order: $scope.orderId,
                        action: '90',
                        sel_type: '2',
                        struct_type: '-1',
                        fix_type: '-1'
                    }
                }).then(function(res) {
                    if (res.data.error.returnCode != '0') {
                        $rootScope.globalError(res.data.error.returnMessage);
                        return;
                    } else {
                        var orderurl = '/wageDetail/' + $scope.orderId + '?from=finishbtn';
                        $location.url(orderurl);
                    }
                }, function() {
                    $rootScope.globalError('异常错误');
                });
            }
            //下载劳务报酬表
        $scope.larboDload = function() {
			location.href = '/wage/fix-work-wage-export' +
				'?&order=' + $routeParams.orderId +
				'&token=' + localStorage.getItem( 'loginToken' ) +
				'&companyID=' + localStorage.getItem( 'loginCompanyID' );
		}

        // 操作
        $scope.modify = function(item) {
            var modalInstance = $uibModal.open({
                animation: false,
                templateUrl: 'modifyWageItemModal.html',
                controller: 'modifyWageItemModalCtrl1',
                size: 'modify-info-size',
                resolve: {
                    modifyData: function() {
                        return {
                            item: item
                        };
                    }
                }
            });

            modalInstance.result.then(function() {
                $scope.slaryListFst();
            }, function() {

            });
        };


    })
    .controller('modifyWageItemModalCtrl1', ['$rootScope', '$scope', '$uibModalInstance', '_http', 'modifyData',  function($rootScope, $scope, $uibModalInstance, _http, modifyData) {
        
        $scope.item = modifyData.item;
       
        $scope.submitForm = {};
        $scope.submitForm.id = $scope.item.id;
        $scope.submitForm.cusName = $scope.item.name;
        $scope.submitForm.cusPhone = $scope.item.phone;
        $scope.submitForm.cusIdNo = $scope.item.idcard;
        $scope.phoneError=false;
        var submitUrl = '';

        if ($scope.item.oper_type == '4') { // item.oper_type == '4' => 不可以修改姓名身份证
            $scope.operType4 = true;
            submitUrl = '/wage/update-phone';
        } else {
            $scope.operType4 = false;
            submitUrl = '/wage/updateperson';
        }
        $scope.phoneMacth = function(){
            var reg=/^1\d{10}/;
            if(reg.test($scope.submitForm.cusPhone)){       
                $scope.phoneError=false;
            }else{
                $scope.phoneError=true;
            }
       }
        $scope.submit = function(isValid) {

            $scope.submitted = true;

            var submitData = {};
            if ($scope.operType4) { // 只可以修改手机号 ,入参 id and cusPhone
                submitData = {
                    id: $scope.submitForm.id,
                    cusPhone: $scope.submitForm.cusPhone
                }
            } else {
                submitData = $scope.submitForm;
            }

            if (isValid) {

                _http({
                        url: submitUrl,
                        method: 'POST',
                        data: submitData
                    })
                    .then(function(res) {
                        if (res.data.error.returnCode == '0') {
                            modifyData.item.cusName = $scope.submitForm.cusName;
                            modifyData.item.cusPhone = $scope.submitForm.cusPhone;
                            modifyData.item.cusIdNo = $scope.submitForm.cusIdNo;
                            $uibModalInstance.close();
                        } else {
                            $rootScope.globalError(res.data.error.returnMessage);
                        }
                    }, function() {
                        $rootScope.globalError('异常错误！');
                    });
            }
        };

        $scope.cancel = function() {
            $uibModalInstance.dismiss('cancel');
        };

    }]);
