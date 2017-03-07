angular.module('myApp')
    .controller('How2rechargeCtrl', function($scope, $rootScope, _http, $location, $timeout, $uibModal, $company) {
        'use strict';

        $scope.checkRechargeStatusOne = false;
        $scope.checkRechargeStatusTwo = false;

        $scope.token = localStorage.getItem('loginToken');
        $scope.companyID = localStorage.getItem('loginCompanyID');

        var cashCnt;

        // tab切换
        $scope.tabObj = {};
        $scope.tabSwitch = function(val) {
            for (var key in $scope.tabObj) {
                if ($scope.tabObj.hasOwnProperty(key)) {
                    $scope.tabObj[key] = false;
                }
            }
            $scope.tabObj[val] = true;
        };

        /**
         * 银行卡号  每4位分割
         * @param val
         * @returns {string}
         */
        $scope.separateNumPer4Letters = function(val) {
            val = typeof val == 'number' ? String(val) : val;
            return val.replace(/\s/g, '').replace(/(\d{4})(?=\d)/g, "$1 ");
        };

        /**
         * 校验民生银行客户号
         */
        $scope.checkCustomCod = function(){
            var codeReg=/^[\w]*$/;
            if(!codeReg.test($scope.initData.bankinfo.payerCustNo)){
                $scope.errorCodeCustom=true;
            }else{
                $scope.errorCodeCustom=false;
            }
        };

        $scope.cashCheck = function() {
            $timeout.cancel(cashCnt);
            cashCnt = $timeout(function() {
                if (Number($scope.rechargeCash) > 0 && Number($scope.rechargeCash)<100000000) {
                    $scope.rechargeError = true;
                } else {
                    $scope.rechargeError = false;
                }
            }, 400);
        };

        /**
         * 校验在线充值输入金额
         */
        $scope.checkRecharge = function() {
            var cashReg = /^0(\.\d{1,2})$|^[1-9]\d*(\.\d{1,2})?$/;
            var secReg = /^(\d|\.)+$/;
            if (!secReg.test($scope.rechargeCash) && $scope.rechargeCash) {
                $scope.checkRechargeStatusOne = false;
                $scope.checkRechargeStatusTwo = true;
            } else {
                $scope.checkRechargeStatusTwo = false;
                if (!cashReg.test($scope.rechargeCash)) {
                    $scope.checkRechargeStatusOne = true;
                } else {
                    $scope.checkRechargeStatusOne = false;
                    if (Number($scope.rechargeCash)>100000000) {
                        $scope.checkRechargeStatusOne = true;
                    }
                    
                }

            }
        };

        /**
         * 在线充值提交
         * @param valid
         */
        $scope.submitRecharge = function( valid ) {
            // $scope.submitted = true;
            if ( $scope.rechargeError && valid ) {
                // ie并且版本ie10以下,弹窗提示
                if(isLowerIE10()){
                    openIsLowerIE10();
                }else{
                    submitAndMakeSure();
                }
            }
        };

        function submitAndMakeSure() {
            $scope.submitForm();
            $uibModal.open( {
                animation: false,
                templateUrl: 'makeSureModal.html',
                controller: 'makeSureModalCtrl',
                size: 'recharge-modal',
                resolve: {
                    subData: function() {
                        return {
                            flow_id: $scope.flow_id
                        };
                    }
                }
            } );
        }

        $scope.submitForm = function() {
            $( '#rechargeForm' ).submit();
        };

        $scope.getNewVal = function(a, b, c) {
            if (!a) {
                return b;
            }
            return a;
        };

        $company.getCompanyInfo().then(function(data) {
            loginCallback(data);
            showTwoTabs();
        });

        function loginCallback( initData ) {
            $scope.initData = initData;
            $scope.isIdent = +$scope.initData.ext.company_status.is_ident;  // 是否认证

            // 开户行
            $scope.initData.bankinfo.new_bank_name = $scope.getNewVal( $scope.initData.bankinfo.new_bank_name, $scope.initData.bankinfo.company_bank_name, $scope.initData.bankinfo.bank_abbr );
            // 银行账号
            $scope.initData.bankinfo.new_bank_card_no = $scope.separateNumPer4Letters ( $scope.getNewVal( $scope.initData.bankinfo.new_bank_card_no, $scope.initData.bankinfo.company_bank_card, $scope.initData.bankinfo.bank_abbr ) );

            // 银行码  305 =>民生银行
            $scope.initData.bankinfo.new_lbnk_cd = $scope.getNewVal( $scope.initData.bankinfo.new_lbnk_cd, $scope.initData.bankinfo.lbnk_cd, $scope.initData.bankinfo.bank_abbr );
        }

        /**
         * 判断是否两个tab
         */
        function showTwoTabs() {
            if ($scope.isIdent &&
                ( $scope.initData.bankinfo.allowOnline == 1 ||
                $scope.initData.bankinfo.new_lbnk_cd == 305 )) {  // 已认证 && 用户的开户银行属于民生银行直连渠道或银联B2B渠道范围内银行  显示三个tab, 默认显示在线充值
                $scope.isShowTwoTabs = false;
                $scope.tabObj.online = true;
            } else if (!$scope.isIdent && $scope.initData.bankinfo.new_lbnk_cd == 305) {    // 未认证 && 用户的开户银行是民生银行  显示三个tab, 默认显示在线充值
                $scope.isShowTwoTabs = false;
                $scope.tabObj.online = true;
            } else {    // 显示两个tab ,默认显示网银转账
                $scope.isShowTwoTabs = true;
                $scope.tabObj.netBank = true;
            }
        }

        /**
         * 企业版支持ie9及以上版本,此处只需验证是否ie9
         * @returns {boolean}
         */
        function isLowerIE10 () {
            return navigator.userAgent.indexOf("MSIE")>0 && ( navigator.userAgent.indexOf("MSIE 9.0")>0 );
        }

        function openIsLowerIE10() {
            var uibModal = $uibModal.open({
                animation: false,
                templateUrl: 'modules/public/comfirmModal/comfirmModal.html',
                controller: 'ComfirmModalCtrl',
                size: 'modify-info-size',
                resolve: {
                    modalParams: function() {
                        return {
                            tipsTitle: '提示',
                            tipsText: '系统检测到您的浏览器不是IE10以上版本，使用当前浏览器可能无法充值成功。建议您更换浏览器后再充值。',
                            OkText: '继续充值',
                            cancelText: '取消'
                        };
                    }
                }
            });
            uibModal.result.then( submitAndMakeSure );
        }
    } );

angular.module('myApp').controller('makeSureModalCtrl', ['$rootScope', '$scope', '$uibModalInstance', '_http', '$location', 'subData', function($rootScope, $scope, $uibModalInstance, _http, $location, subData) {
    $scope.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };

    $scope.modalClose = function() {
        $uibModalInstance.close();
    };

    $scope.do = function() {
        _http({
            url: '/charge/checkstatus',
            method: 'POST',
            data: {
                flow_id: subData.flow_id
            }
        }).then(function(res) {
            if (res.data.error.returnCode == '0') {
                if (res.data.data.status == '1') {
                    $uibModalInstance.close();
                    $location.url('/overview');
                } else if (res.data.data.status == '0') {
                    $rootScope.globalError(res.data.data.msg);
                } else {
                    $rootScope.globalError(res.data.data.msg);
                }
            } else {
                $rootScope.globalError(res.data.error.returnMessage);
            }
        }, function() {
            $rootScope.globalError('异常错误！');
        });
    };
}]);
