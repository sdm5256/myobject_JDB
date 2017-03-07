/**
 * 银行信息模块
 * 注：复用位置：1.企业注册第四部银行信息2.银行信息修改弹框
 * 父作用域属性：pageType == 'updateBank'
 */
angular.module('myApp')
    .factory ("$bank",['$q',function($q){
        return {
            get: function(){

            }
        }
    }])
    .controller('bankCtrl', function ($scope, $rootScope, _http, $q, $uibModal, $bank, $company) {
            $scope.bankinfo = {};
            $scope.isUpdate = $scope.$parent.pageType == "updateBank";
            var $label;
            //格式化银行卡号，每四位加一个空格
//            $scope.bankinfo.bank_card_no = 8888888888;
            $scope.formatBankNo = function($event){
                var val = $scope.bankinfo.bank_card_no;
                if(val){
                    $label.html(val.replace(/\s/g,'').replace(/(\d{4})(?=\d)/g,"$1 "));
                }else{
                    $label.html("");
                }
            };
            $scope.showLabel = function(event) {
                $label = $label || angular.element(event.target.previousElementSibling);
                $label.toggleClass("show");
            };
            $scope.hideLabel = function() {
                $label.toggleClass("show");
            };
            //没有找到银行信息
            $scope.nonBankText = '';
            //获取银行列表
            var getBankCodeList = function (searchText) {
                return _http({
                    url: '/public/getbankcodelist',
                    method: 'POST',
                    data: {
                        key: searchText,
                        header : 'header'
                    }
                })
                    .then(function (res) {
                        if (res.data.error.returnCode == '0') {
                            $scope.banks = res.data.data;
                            $scope.nonBankText = ''
                        } else if(res.data.error.returnCode == '19101') {
                            $scope.banks = {};
                            $scope.nonBankText = res.data.error.returnUserMessage;
                        }
                    }, function () {
                        $rootScope.globalError('异常错误！');
                    });
            };
            // 开户银行失去焦点
            $scope.bankBlur =  function () {
                if($scope.nonBankText){
                    $scope.bankTextBloon = true;
                } else {
                    $scope.bankTextBloon = false;
                }

            };
            $scope.bankinfoBlur =  function () {
                var bankinfoReg = /^(\d|\s){5,}$/;
                $scope.bcStatus = false;
                if ($scope.bankinfo.bank_card_no) {
                    if (!bankinfoReg.test($scope.bankinfo.bank_card_no)) {
                        $scope.bankinfoTips = true;
                        return;
                    } else {
                        var val = $scope.bankinfo.bank_card_no;
                        $scope.bankinfo.bank_card_no = val.replace(/\s/g,'');
                        $scope.bankinfoTips = false;
                    }
                }else {
                    $scope.bankinfoTips = true;
                    return;
                }
            };
            //银行账号change
            $scope.bankInfoChange = function () {
            }
            $scope.bcFocus = function () {
                $scope.bcStatus = true;
            }
            //获取省列表
            var getProvinceList = function () {
                $scope.bankinfo.province = '';
                $scope.bankinfo.city = '';
                $scope.bankinfo.lbnk_no = '';
                $scope.provinces = null;
                $scope.cities = null;
                $scope.cmmtbkins = null;

                return _http({
                    url: '/public/getprovincelist',
                    data:{
                        header : 'header'
                    },
                    method: 'POST'
                })
                    .then(function (res) {
                        if (res.data.error.returnCode == '0') {
                            $scope.provinces = res.data.data;
                        } else {
                            //          $rootScope.globalError(res.data.error.returnMessage);
                        }
                    }, function () {
                        $rootScope.globalError('异常错误！');
                    });
            };
            //获取省下包含的城市列表
            $scope.getCityList = function () {
                $scope.bankinfo.city = '';
                $scope.bankinfo.lbnk_no = '';
                $scope.cities = null;
                $scope.cmmtbkins = null;
                //    if (!$scope.bankinfo.province) {
                //      return;
                //    }
                return _http({
                    url: '/public/getcitylist',
                    method: 'POST',
                    data: {
                        prov_cd: $scope.bankinfo.province,
                        header : 'header'
                    }
                }).
                    then(function (res) {
                        if (res.data.error.returnCode == '0') {
                            $scope.cities = res.data.data;
                        } else {
                            //          $rootScope.globalError(res.data.error.returnMessage);
                        }
                    }, function () {
                        $rootScope.globalError('异常错误！');
                    });
            };
            /**
             * 获取支行列表
             * @param clear boolean 清空支行框
             * @returns {*}
             */
            //支行信息没有找到
            $scope.noFindBranBankText ='';
            $scope.getCmmtbkinList = function (clear) {
                var cmmtbkinDeferred = $q.defer();
                $scope.bankinfo.lbnk_no = '';
                $scope.cmmtbkins = null;

                //    if (!($scope.bankinfo.province && $scope.bankinfo.city && $scope.bankinfo.lbnk_cd)) {
//                if (!($scope.bankinfo.province && $scope.bankinfo.city)) {
                if (!($scope.bankinfo.province)) {
                    cmmtbkinDeferred.reject("省不能为空");
                    return cmmtbkinDeferred.promise;
                }
                clear && ($scope.subbranchWidget.subbranchSearchText = "");
                return _http({
                    url: '/public/getcmmtbkinlist',
                    method: 'POST',
                    data: {
                        prov_cd: $scope.bankinfo.province,
                        city_cd: $scope.bankinfo.city,
                        lbnk_cd: $scope.dropdownWidget.searchBankText ? $scope.bankinfo.lbnk_cd : "",
                        bank_name: $scope.subbranchWidget.subbranchSearchText,
                        header : 'header'
                    }
                }).
                    then(function (res) {
                        if (res.data.error.returnCode == '0') {
                            $scope.cmmtbkins = res.data.data;
                            $scope.noFindBranBankText = '';
                        } else if(res.data.error.returnCode == '19102') {
                            $scope.noFindBranBankText = res.data.error.returnUserMessage;
                        }
                    }, function () {
                        $rootScope.globalError('异常错误！');
                    });
            };
            // 支银行失去焦点
            $scope.brBankBlur =  function () {
                if($scope.noFindBranBankText){
                    $scope.noFindBranBankTextBloon = true;
                } else {
                    $scope.noFindBranBankTextBloon = false;
                }

            };

            //找不到开户行
            $scope.openOhter = function() {
                $uibModal.open({
                    animation: false,
                    templateUrl: 'modules/info/bank/alertOtherBankModal.html',
                    controller: 'AlertOtherBankModalCtrl',
                    size: 'alert-other-bank'
                }).result.then(function(data){
                        $scope.subbranchWidget.subbranchSearchText = data.bank_name || "";
                        $scope.bankinfo.lbnk_no = data.lbnk_no;
                        $scope.bankinfo.bank_name = $scope.subbranchWidget.subbranchSearchText;
                    });
            };

            /**
             * 弹框容器事件
             */
            $scope.$parent.dialogClick = function () {
                if ($scope.dropdownWidget.open) {
                    if ($scope.banks.length == 1) {
                        $scope.dropdownWidget.selectBank($scope.banks[0]);
                        return;
                    }
                    $scope.dropdownWidget.hide();
                }
                if ($scope.subbranchWidget.open) {
                    if ($scope.cmmtbkins && $scope.cmmtbkins.length == 1) {
                        $scope.subbranchWidget.selectBank($scope.cmmtbkins[0]);
                        return;
                    }
                    $scope.subbranchWidget.hide();
                }
            };
            var cancelPropagation = function (event) {
                var event = window.event || event;
                if (document.all) {
                    event.cancelBubble = true;
                } else {
                    event.stopPropagation();
                }
            };
            /**
             * 总行选择插件
             * @type {{open: boolean, searchBankText: string, selectBank: selectBank, show: show, hide: hide, search: search}}
             */
            $scope.dropdownWidget = {
                open: false,
                searchBankText: "",
                selectBank: function (bank) {
                    this.searchBankText = bank.BNK_NM;
                    $scope.bankinfo.lbnk_cd = bank.LBNK_CD;
                    !$scope.provinces && getProvinceList();
                    this.hide();
                },
                show: function ($event) {
                    $scope.subbranchWidget.hide();
                    this.open = true;
                    cancelPropagation($event);
                },
                hide: function () {
                    this.open = false;
                },
                search: function () {
                    if (typeof this.searchBankText != "undefined") {
                        getBankCodeList(this.searchBankText);
                    }
                }
            };
            /**
             * 支行选择插件
             * @type {{open: boolean, subbranchSearchText: string, selectBank: selectBank, show: show, hide: hide, search: search}}
             */
            $scope.subbranchWidget = {
                domNode: null,
                open: false,
                subbranchSearchText: "",
                selectBank: function (cmmtbkin) {
                    this.subbranchSearchText = cmmtbkin.LBNK_NM;
                    $scope.bankinfo.lbnk_no = cmmtbkin.LBNK_NO;
                    !$scope.cmmtbkins && getProvinceList();
                    this.hide();
                },
                show: function ($event) {
                    $scope.dropdownWidget.hide();
                    if(!this.domNode){
                        this.domNode = $event.target;
                    }
//                    if (!($scope.bankinfo.province && $scope.bankinfo.city)) {
                    if (!($scope.bankinfo.province)) {
                        alert("请完善省份信息");
                    } else {
                        if($scope.bankinfo.city){
                            this.search();
                        }
                        this.open = true;
                    }
                    cancelPropagation($event);
                },
                hide: function () {
                    this.open = false;
                },
                search: function () {
                    if (typeof this.subbranchSearchText != "undefined" || this.domNode.value=="") {
                        $scope.getCmmtbkinList();
                    }
                }
            };

            //修改表单提交
            $scope.submitStep = function (isValid) {
                $scope.bankSubmitted = true;
                if (isValid && !$scope.bankinfoTips ) {
                    checkcard($scope.bankinfo.bank_card_no).then(function(){
                        _http({
                            url: '/user/updatebankinfo',
                            method: 'POST',
                            data: $scope.bankinfo
                        }).then(function (res) {
                            if (res.data.error.returnCode == '0') {
                                //银行信息修改用
                                $scope.$parent.$uibModalInstance && $scope.$parent.$uibModalInstance.close();
                            } else {
                                $rootScope.globalError(res.data.error.returnMessage);
                            }
                        }, function () {
                            $rootScope.globalError('异常错误！');
                        });
                    });
                    //注册使用
//                    $location.url('/login');
                }
            };

            //封装提交返回信息到服务的延迟对象
            $bank.get = function(){
                $scope.bankSubmitted = true;
                //去掉格式化的空格
                return {
                    bankinfo: $scope.bankinfo,
                    isValid: angular.element(document.getElementById("isValid")).html()=="true",
                    checkcard: checkcard
                };
            };

            //检查 卡号是否是个人的卡号，如果是，则不允许注册，修改
            var checkcard = function(card) {
                var str,defer = $q.defer();

                _http({
                    url: '/public/checkcard',
                    method: 'POST',
                    data: {
                        card:card,
                        header : 'header'
                    }
                }).then(function (res) {
                    if (res.data.error.returnCode == '0') {
                        if(res.data.data.status){
                            $rootScope.globalError(res.data.error.returnMessage);
                        } else {
                            defer.resolve();
                        }
                    } else {
                        $rootScope.globalError(res.data.error.returnMessage);
                    }
                }, function () {
                    $rootScope.globalError('异常错误！');
                });
                return defer.promise;
            };

            //填充数据：（注：银行信息的初始数据，银行列表、省、市、支行）
            var fillData = function(initData){
                $q.when(getBankCodeList())
                    .then(function(){
                        if(initData){
                            $scope.bankinfo.lbnk_cd = initData.bankinfo.new_lbnk_cd || initData.bankinfo.lbnk_cd;
                            $scope.bankinfo.lbnk_no = initData.bankinfo.new_lbnk_no || initData.bankinfo.lbnk_no;
                            $scope.subbranchWidget.subbranchSearchText = initData.bankinfo.new_bank_name || initData.bankinfo.company_bank_name;
                        }
                        for (var i = 0, item; item = $scope.banks[i]; i++) {
                            if (item.LBNK_CD == $scope.bankinfo.lbnk_cd) {
                                $scope.dropdownWidget.searchBankText = item.BNK_NM;
                                break;
                            }
                        }
                        return $q.when(getProvinceList());
                    })
                    .then(function(){
                        if(initData){
                            $scope.bankinfo.province = initData.bankinfo.new_prov_code || initData.bankinfo.prov_code;
                        }
                        return $q.when($scope.getCityList());
                    })
                    .then(function(){
                        if(initData){
                            $scope.bankinfo.city = initData.bankinfo.new_city_code || initData.bankinfo.city_code;
                        }
                        return $q.when($scope.getCmmtbkinList());
                    })
                    .then(function(res){
                        if(initData){
                            $scope.bankinfo.lbnk_no = initData.bankinfo.new_lbnk_no || initData.bankinfo.lbnk_no;
                        }
                    },function(res){
                        console.log("error:",res);
                    });
            };

            //登录成功后初始化数据
            function loginCallback(initData) {
                $scope.bankinfo.other_bank_name = initData.bankinfo.other_bank_name;
                $scope.data = {company_name: initData.ext.company_name};
                $scope.bankinfo.bank_card_no = initData.bankinfo.new_bank_card_no || initData.bankinfo.company_bank_card;
                fillData(initData);
            }

            //根据父级所在作用域来走不通的分支
            if($scope.$parent.pageType == "updateBank"){
                //修改银行信息    验证登录
				$company.getCompanyInfo(true).then(function(data) {
					loginCallback(data);
				});
            }else{
                //注册企业信息
                fillData();
            }
        }
    )
    //找不到开户行弹框控制器
    .controller('AlertOtherBankModalCtrl', [
        '$scope',
        '$uibModalInstance',
        '_http',
        
        function ($scope, $uibModalInstance, _http) {
        var $page1,$page2;
        $scope.openAdd = function(){
            $page1 = $page1 || angular.element(document.getElementsByClassName('dialog1')[0]);
            $page2 = $page2 || angular.element(document.getElementsByClassName('dialog2')[0]);
            $page1.addClass('hide');
            $page2.addClass('show');
        };

        $scope.modalClose = function() {
            $uibModalInstance.close();
        };

        $scope.ok = function (valid) {
            $scope.submitted = true;
            if(typeof valid == "undefined" || valid){
                $uibModalInstance.close({bank_name: $scope.bank_name,lbnk_no:$scope.lbnk_no});
            }else {
                console.log('请输入完整的信息');
            }
        };
        $scope.focuse = function(){
            $scope.submitted = true;
        };
        $scope.blur = function(valid){

            if(valid){//有效的情况下进行联行号的验证，并将返回的联行名称覆盖已录入信息
                _http({
                    url: '/public/addcmmtbkin',
                    method: 'POST',
                    data: {
                        lbnk_no: $scope.lbnk_no,
                        header : 'header'
                    }
                })
                    .then(function (res) {
                        if (res.data.error.returnCode == '0') {
                            $scope.bank_name = res.data.data.LBNK_NM;
                        } else {
                            $rootScope.globalError(res.data.error.returnMessage);
                        }
                    }, function () {
                        $rootScope.globalError('异常错误！');
                    });
            }
        };
    }])
    .directive("bank", function () {
        return{
            restrict: "EA",
            replace: true,
            template: '<div model template-url="modules/info/bank/bank.html" controller="bankCtrl"></div>'
        }
    })
;
