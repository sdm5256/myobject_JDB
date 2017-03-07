'use strict';

angular.module('myApp')
    .controller('AuditCtrl', function($scope, $rootScope, _http, $location, $uibModal, Upload, $helper,$anchorScroll) {
        // 导航默认active
        $scope.act = 1;
        // 默认ng-required
        $scope.requiredStatus = false;
        $scope.submited = false;
        // 是否显示 左侧导航
        $scope.showstatus = true;
        $scope.com_no = true;
        // 默认编辑状态
        $scope.saveStatus = false;
        // 统一社会信用代码 默认状态 1
        $scope.aiostaus = false;
        // 人员信息 默认状态
        $scope.stfstaus = true;
        //点击图片放大状态
        $scope.bigImgstaus = false;
        //是否显示员工人数字段
        $scope.staff_numstatus = false;
        //营业执照信息
        $scope.operating = {};
        // 法人代表
        $scope.legal = {};
        // 税务登记证
        $scope.tax = {};
        //组织机构代码证
        $scope.organizational = {};
        //开户许可证
        $scope.bank = {};
        $scope.controll = {};
        $scope.stockholder = {};
        $scope.transactor = {};
        //变更股权
        //显示修改按钮状态
        $scope.modifySatus = false;
        $scope.hidebtn = true;
        // 时间字段 长期与否
        $scope.pj = ['operating','legal','stockholder','transactor','controll'];
        //
        $scope.iH = ['operating','legal','tax','bank','organizational'];
        //有效时间
        $scope.minDate = +new Date() + 1 * 24 * 60 * 60 * 1000;

        $scope.changestockholder = {};
        //默认进入营业执照


        // 经营范围字数监听
        $scope.$watch('memberInfo.business',function (n,o) {
            if(!n){
                return ;
            }
           var leg = n.length;
            if(500 - leg < 0 ){
                $scope.memberInfo.business = n.slice(0,500)
            }
        })
        // 控制字段显示状态函数
        $scope.IsHide = function (obj) {
            var status = $scope.certificate_status;
            if(!$scope[obj]){
                return ;
            }
            if(status == 3 && $scope[obj][obj + '_info_status' ]== 4){
                return true;
            } else if (status == 6 && $scope[obj][obj + '_info_status' ]== 4){
                return true;
            }else{
                return false;
            }
        }
        // 状态为<5
        $scope.timehandler = function () {
            if(!$scope.operating){
                return ;
            } else{
                if($scope.operating.operating_effect_time_bak == 1){
                    $scope.operating1.timeStatus = false;
                    return ;
                }  else if($scope.operating.operating_effect_time_bak && $scope.operating.operating_effect_time_bak != 1){
                    $scope.operating1.timeStatus = true;
                    return ;
                }  else if($scope.operating.operating_effect_time == 1){
                    $scope.operating1.timeStatus = false;
                    return ;
                }   else {
                    $scope.operating1.timeStatus = true;
                    return ;
                }
            }
            if(!$scope.legal){
                return ;
            } else{
                if($scope.legal.legal_effect_time_bak == 1){
                    $scope.legal1.timeStatus = false;
                    return ;
                }  else if($scope.legal.legal_effect_time_bak && $scope.operating.legal_effect_time_bak != 1){
                    $scope.legal1.timeStatus = true;
                    return ;
                }  else if($scope.legal.legal_effect_time == 1){
                    $scope.legal1.timeStatus = false;
                    return ;
                }   else {
                    $scope.legal1.timeStatus = true;
                    return ;
                }
            }
            if(!$scope.memberInfo){
                return ;
            } else {
                if($scope.memberInfo){
                    if($scope.memberInfo.transactor_effect_time!= 1){
                        $scope.transactor1.timeStatus = true;
                    } else {
                        $scope.transactor1.timeStatus = false;
                    }
                    if($scope.memberInfo.stockholder_effect_time!= 1){
                        $scope.stockholder1.timeStatus = true;
                    } else {
                        $scope.stockholder1.timeStatus = false;
                    }
                    if($scope.memberInfo.controll_effect_time!= 1){
                        $scope.controll1.timeStatus = true;
                    } else {
                        $scope.controll1.timeStatus = false;
                    }
                }
            }
        }
        //状态大于5
        $scope.timehandler5 = function () {
            if(!$scope.operating){
                return ;
            } else{
                if($scope.operating.operating_effect_time_bak == 1){
                    $scope.operating1.timeStatus = false;
                    return ;
                }  else if($scope.operating.operating_effect_time_bak && $scope.operating.operating_effect_time_bak != 1){
                    $scope.operating1.timeStatus = true;
                    return ;
                }  else if($scope.operating.operating_effect_time == 1){
                    $scope.operating1.timeStatus = false;
                    return ;
                }   else {
                    $scope.operating1.timeStatus = true;
                    return ;
                }
            }
            if(!$scope.legal){
                return ;
            } else{
                if($scope.legal.legal_effect_time_bak == 1){
                    $scope.legal1.timeStatus = false;
                    return ;
                }  else if($scope.legal.legal_effect_time_bak && $scope.operating.legal_effect_time_bak != 1){
                    $scope.legal1.timeStatus = true;
                    return ;
                }  else if($scope.legal.legal_effect_time == 1){
                    $scope.legal1.timeStatus = false;
                    return ;
                }   else {
                    $scope.legal1.timeStatus = true;
                    return ;
                }
            }
            if(!$scope.memberInfo){
                return ;
            } else {
                if($scope.memberInfo){
                    if($scope.memberInfo.transactor_effect_time!= 1){
                        $scope.transactor1.timeStatus = true;
                    } else {
                        $scope.transactor1.timeStatus = false;
                    }
                    if($scope.memberInfo.stockholder_effect_time!= 1){
                        $scope.stockholder1.timeStatus = true;
                    } else {
                        $scope.stockholder1.timeStatus = false;
                    }
                    if($scope.memberInfo.controll_effect_time!= 1){
                        $scope.controll1.timeStatus = true;
                    } else {
                        $scope.controll1.timeStatus = false;
                    }
                }
            }
        }
        // 自然人  法人 控制器
        $scope.typehandler = function () {
            if(!$scope.memberInfo){
                return ;
            } else{
                if($scope.memberInfo.controll_type== 1){
                    $scope.memberInfo.controll_type = 1;
                    $scope.changecontroll.status = false;
                } else if($scope.memberInfo.controll_type == 2) {
                    $scope.memberInfo.controll_type = 2;
                    $scope.changecontroll.status = true;
                }
                if($scope.memberInfo.stockholder_type== 1){
                    $scope.memberInfo.stockholder_type = 1
                    $scope.changestockholder.status = false;
                } else if($scope.memberInfo.stockholder_type = 2) {
                    $scope.memberInfo.stockholder_type = 2
                    $scope.changestockholder.status = true;
                }
            }

        }
        // 状态为0 1
        function totalStatusZero(operating,num) {
            if(num == 0){
                if(operating.operating_effect_time != 1){
                    $scope.operating1.timeStatus = true;
                } else {
                    $scope.operating1.timeStatus = false;
                }
                if(operating.company_id_type == 1){
                    $scope.aiostaus = false;
                    $scope.changeHideStatus = false
                } else if(operating.company_id_type == 2){
                    $scope.changeHideStatus = false;
                    $scope.aiostaus = true;
                } else{
                    $scope.aiostaus = false;
                    $scope.changeHideStatus = false
                }
            } else  {
                if(operating.operating_effect_time != 1){
                    $scope.operating1.timeStatus = true;
                } else {
                    $scope.operating1.timeStatus = false;
                }

                if(operating.company_id_type == 1){
                    $scope.aiostaus = false;
                    $scope.changeHideStatus = false

                } else if(operating.company_id_type == 2){
                    //$scope.changeHideStatus = true;
                    $scope.aiostaus = true;
                } else{
                    $scope.aiostaus = false;
                    $scope.changeHideStatus = false
                }
            }
        };
        // 失败 拟改为失败
        function totalStatusFail(operating) {
            if(operating){
                if(operating.operating_effect_time != 1){
                    $scope.operating1.timeStatus = true;
                } else {
                    $scope.operating1.timeStatus = false;
                }
                if(operating.company_id_type == 2){
                    $scope.changeHideStatus = false;
                    $scope.aiostaus = true;
                } else if(operating.company_id_type == 1) {
                    $scope.aiostaus = false;
                    $scope.changeHideStatus = false
                }
                if(operating.company_id_type_bak == 2){
                    $scope.changeHideStatus = false;
                    $scope.aiostaus = true;
                } else if(operating.company_id_type_bak == 1){
                    $scope.aiostaus = false;
                    $scope.changeHideStatus = false
                }
            }
        }
        // 法人有效期设置
        function legalTimeHander(legal) {
            if(legal){
                if(legal.legal_effect_time){
                    if(legal.legal_effect_time == 1){
                        $scope.legal1.timeStatus = false;
                    } else if(legal.legal_effect_time != 1) {
                        $scope.legal1.timeStatus = true;
                    }
                };
                if(legal.legal_effect_time_bak){
                    if(legal.legal_effect_time_bak == 1){
                        $scope.legal1.timeStatus = false;
                    } else if(legal.legal_effect_time_bak != 1) {
                        $scope.legal1.timeStatus = true;
                    }
                }

            }
        }
        // 营业执照有效期
        function opeatingTimeHander(operating) {
            if(operating){
                if(operating.operating_effect_time){
                    if(operating.operating_effect_time == 1){
                        $scope.operating1.timeStatus = false;
                    } else if(operating.operating_effect_time != 1) {
                        $scope.operating1.timeStatus = true;
                    }
                };
                if(operating.operating_effect_time_bak){
                    if(operating.operating_effect_time_bak == 1){
                        $scope.operating1.timeStatus = false;
                    } else if(operating.operating_effect_time_bak != 1) {
                        $scope.operating1.timeStatus = true;
                    }
                }

            }
        }
        //成功 拟改为
        function totalStatusSuc(operating) {
            if(operating.company_id_type == 1){
                $scope.aiostaus = false;
                $scope.changeHideStatus = false
            } else if(operating.company_id_type == 2){
                $scope.aiostaus = true;
            } else if(operating.company_id_type_bak == 1){
                $scope.aiostaus = false;
                $scope.changeHideStatus = false

            } else if(operating.company_id_type_bak == 2){
                $scope.aiostaus = true;
            }
        }
        //数据处理函数
        $scope.extend = function (res) {
            $scope.operating = res.data.data.operating;
            $scope.legal = res.data.data.legal;
            $scope.tax = res.data.data.tax;
            $scope.bank = res.data.data.bank;
            $scope.organizational = res.data.data.organizational;
            $scope.memberInfo = res.data.data.memberInfo;
            if($scope.memberInfo){
                if($scope.memberInfo.hasOwnProperty('staff_num')){
                    $scope.staff_numstatus = true;
                } else{
                    $scope.staff_numstatus = false;
                }
            }

        }
        // 页面初始化
        $scope.init = function () {
            //获取审核页面的基本信息
            _http({
                url: 'certificate/get-certificate',
                method: 'POST'
            })
                .then(function(res) {
                    var certificate_status = $scope.certificate_status =  res.data.data.certificate_status;
                    // 证件对象
                    $scope.certificateObject = res.data.data;
                    if (res.data.error.returnCode == '0') {
                        if(certificate_status == '0'){
                            $scope.showstatus = true;
                            $scope.saveStatus = false;
                            $scope.extend(res);
                            totalStatusZero($scope.operating,0);
                            legalTimeHander($scope.legal)
                            $scope.timehandler();
                            $scope.typehandler();
                            $scope.ThreeOrFive()
                            //默认进入营业执照
                            $scope.goTo('operating',1)
                        } else if(certificate_status == '1'){
                            $scope.showstatus = false;
                            $scope.extend(res);
                            totalStatusZero($scope.operating,1);
                            legalTimeHander($scope.legal);
                            $scope.timehandler();
                            $scope.typehandler();
                            $scope.ThreeOrFive()
                            //默认进入营业执照
                            $scope.goTo('operating',1)
                        }
                        else if(certificate_status == '3'|| certificate_status == '6') {
                            $scope.showstatus = false;
                            $scope.extend(res);
                            $scope.ThreeOrFive($scope.operating)
                            $scope.timerSet('operating')
                            totalStatusFail($scope.operating);
                            legalTimeHander($scope.legal);
                            opeatingTimeHander($scope.operating)
                            if(certificate_status == '3'){
                                if(!$scope.operating.company_id_no){
                                    $scope.com_no = false
                                } else  {
                                    $scope.com_no = true
                                }
                            } else if( certificate_status == '6'){
                                if(!$scope.operating.company_id_no && !$scope.operating.company_id_no_bak)  {
                                    $scope.com_no = false
                                } else if($scope.operating.company_id_no && !$scope.operating.company_id_no_bak)  {
                                    $scope.com_no = true
                                }  else if($scope.operating.company_id_no&& $scope.operating.company_id_no_bak)  {
                                    $scope.com_no = true
                                }else {
                                    $scope.com_no = true
                                }
                            }

                            $scope.typehandler();
                        } else if(certificate_status == '4'|| certificate_status == '5'){
                            $scope.showstatus = true;
                            $scope.saveStatus = true;
                            $scope.extend(res);
                            totalStatusSuc($scope.operating)
                            legalTimeHander($scope.legal)
                            $scope.timerSet('operating')
                            $scope.timehandler5();
                            // 自然人  法人 控制器
                            $scope.typehandler();
                            $scope.ThreeOrFive()
                            //默认进入营业执照
                            $scope.goTo('operating',1)
                        }
                    } else {
                        $rootScope.globalError(res.data.error.returnMessage);
                    }

                }, function(res) {
                    $rootScope.globalError(res.data.error.returnMessage);
                });
        };

        // 默认初始值函数
        function swDate(swdate,efTimer,params){
            if(!swdate){
                swdate = new Date();
            }
            if(typeof swdate == 'string' || swdate == 1){
                if(swdate === 1){
                    swdate = '1';
                }
                if(swdate.indexOf('-') != -1){
                    if(params == 1){
                        $scope[efTimer][efTimer+'_effect_time'] = swdate;
                    } else {
                        $scope['memberInfo'][efTimer+'_effect_time'] =  swdate;
                    }
                }

            } else{
                var year = swdate.getFullYear();
                var month = swdate.getMonth() + 1;
                var date = swdate.getDate();
                if(date<10){
                    date = '0' + date;
                }else{
                    date =date;
                }
                if(month<10){
                    month = '0' + month;
                }else{
                    month = month;
                }
                if(params == 1){
                    if( $scope[efTimer][efTimer+'_effect_time_bak']){
                        $scope[efTimer][efTimer+'_effect_time_bak'] = year+'-'+(month) + '-' + date;
                    }else{
                        $scope[efTimer][efTimer+'_effect_time'] = year+'-'+(month) + '-' + date;
                    }
                } else {
                    $scope['memberInfo'][efTimer+'_effect_time'] =  year+'-'+(month) + '-' + date;
                }
            }
        }
        $scope.operatingdatechanged = function (efTimer) {
            if(efTimer == 'stockholder'|| efTimer == 'transactor' ||efTimer == 'controll'){
                if($scope['memberInfo'][efTimer+'_effect_time_bak'] && $scope.certificate_status == 6 || $scope['memberInfo'][efTimer+'_effect_time_bak'] && $scope.certificate_status){
                    var swdate =  $scope['memberInfo'][efTimer+'_effect_time_bak'];
                }else {
                    var swdate =  $scope['memberInfo'][efTimer+'_effect_time'];
                }
                swDate(swdate,efTimer,2);
            }else{
                if($scope[efTimer][efTimer+'_effect_time_bak']){
                    var swdate =  $scope[efTimer][efTimer+'_effect_time_bak'];
                }else {
                    var swdate =  $scope[efTimer][efTimer+'_effect_time'];
                }
                swDate(swdate,efTimer,1);
            }
        }

        //展示时间控件
        $scope.legalchecked = function () {
            $scope['legal'].opened = true;
        } //展示时间控件
        $scope.operatingchecked = function () {
            $scope['operating'].opened = true;
        }
        //展示时间控件
        $scope.controllchecked = function () {
            $scope['controll'].opened = true;
        }
        //展示时间控件
        $scope.stockholderchecked = function () {
            $scope['stockholder'].opened = true;
        }
        //展示时间控件
        $scope.transactorchecked = function () {
            $scope['transactor'].opened = true;
        }
        // 处理aiostaus
        $scope.ThreeOrFive = function (operating) {
            if(operating){
                if(operating.company_id_type || operating.company_id_type_bak){
                    if(operating.company_id_type ==1 ){
                        $scope.aiostaus = false;
                    } else if(operating.company_id_type ==2){
                        $scope.aiostaus = true;
                    } else if(operating.company_id_type_bak == 1){
                        $scope.aiostaus = false;
                    } else if(operating.company_id_type_bak == 2){
                        $scope.aiostaus = true;
                    }
                }
            }
        }
        // 统一社会信用代码 控制切换显示 组织机构代码 税务登记证
        $scope.allInOne = function () {
            $scope.aiostaus = !$scope.aiostaus;
            if(!$scope.aiostaus&&!$scope.operating.company_id_type_bak){
                // 证件类型为 组织机构代码
                $scope.operating.company_id_type = 1;
                    $scope.tax = {
                        tax_img :'',
                        tax_id :''
                    };
                    $scope.organizational = {
                        organizational_img:'',
                        organizational_id:''
                    };
            } else if($scope.aiostaus){
                // 证件类型为 统一社会信用代码
                $scope.operating.company_id_type = 2;
            }
            if(!$scope.aiostaus&&$scope.operating.company_id_type_bak){
                // 拟改为证件类型为 组织机构代码
                $scope.operating.company_id_type_bak = 1;
                    $scope.tax = {
                        tax_img :'',
                        tax_id :''
                    };
                    $scope.organizational = {
                        organizational_img:'',
                        organizational_id:''
                    };
            } else if($scope.aiostaus&&$scope.operating.company_id_type_bak){
                // 拟改为证件类型为 统一社会信用代码
                $scope.operating.company_id_type_bak = 2;
            }
        }
        // 錨点导航
        $scope.goTo = function (id,num) {
            $scope.act = num;
            $anchorScroll(id);
        };
        // 三证五证点击放大效果
        $rootScope.openBigImg = function (pra) {
            if(!pra){
                $scope.bigImgstaus = false;
            }
            if($scope.certificate_status!=4 || $scope.certificate_status == 4 && !$scope.saveStatus){
                $scope.bigImgstaus = !$scope.bigImgstaus;
                $scope.bigImgSrc = pra;
            }
        }
        // 关闭 三证五证点击放大效果
        $scope.cancelBigImg = function () {
            if($scope.bigImgstaus){
                $scope.bigImgstaus = false;
            }
        }

        // 时间默认
        function dateDefault(type){
            var tenLater = new Date();
            var year = tenLater.getFullYear();
            var month = tenLater.getMonth() + 1;
            var date = tenLater.getDate();

            date = date+1;
            if(date<10){
                date = '0' + date;
            }else{
                date =date;
            }
            if(month<10){
                month = '0' + month;
            }else{
                month = month;
            }
            return {
                time:year + '-' +month+ '-'+date
            }
        }
        // 时间设置(长期与否) 函数
            $scope.timerSet = function (efTimer) {
                if($scope.certificate_status>=5){
                    if(efTimer =='controll'|| efTimer == 'stockholder'|| efTimer == 'transactor'){
                        $scope[efTimer+"1"] = {
                            timeStatus:true,
                            time:function (type) {
                                var time = $scope['memberInfo'][efTimer+'_effect_time_bak'];
                                time = type || time;
                                if(type) {
                                    dateDefault(type);
                                    if(this.timeStatus){
                                        $scope['memberInfo'][efTimer+'_effect_time_bak'] = dateDefault(type).time
                                    }else {
                                        $scope['memberInfo'][efTimer+'_effect_time_bak']  = 1
                                    }
                                   // }
                                }
                            } ,
                            click:function () {
                                this.timeStatus = !this.timeStatus;
                                this.time(1);
                            }
                        };
                    }else{
                        $scope[efTimer+"1"] = {
                            timeStatus:true,
                            time:function (type) {
                                var time = $scope[efTimer][efTimer+'_effect_time_bak'];
                                 time = type || time;
                                if(type) {
                                    var tenLater = new Date();
                                    var year = tenLater.getFullYear();
                                    var month = tenLater.getMonth() + 1;
                                    var date = tenLater.getDate();
                                    if (!this.timeStatus) {
                                        $scope[efTimer][efTimer+'_effect_time_bak'] =  dateDefault(type).time
                                    }else{
                                        date = date+1;
                                        if(date<10){
                                            date = '0' + date;
                                        }else{
                                            date =date;
                                        }
                                        if(month<10){
                                            month = '0' + month;
                                        }else{
                                            month = month;
                                        }
                                        if(this.timeStatus){
                                            $scope[efTimer][efTimer+'_effect_time_bak'] = dateDefault(type).time
                                        }else {
                                            $scope[efTimer][efTimer+'_effect_time_bak'] = 1
                                        }
                                    }
                                }
                            } ,
                            click:function () {
                                this.timeStatus = !this.timeStatus;
                                this.time(1);
                            }
                        };
                    }
                }else{
                    if(efTimer =='controll'|| efTimer == 'stockholder'|| efTimer == 'transactor'){
                        $scope[efTimer+"1"] = {
                            timeStatus:true,
                            time:function (type) {
                                var time = $scope['memberInfo'][efTimer+'_effect_time'];
                                time = type || time;
                                if(type) {
                                    dateDefault(type);
                                        $scope['memberInfo'][efTimer+'_effect_time'] = dateDefault(type).time
                                    //}
                                    if(this.timeStatus){
                                        $scope['memberInfo'][efTimer+'_effect_time'] = dateDefault(type).time
                                    }else {
                                        $scope['memberInfo'][efTimer+'_effect_time']  = 1
                                    }
                                }
                            } ,
                            click:function () {
                                this.timeStatus = !this.timeStatus;
                                this.time(1);
                            }
                        };
                    }else{
                        $scope[efTimer+"1"] = {
                            timeStatus:true,
                            time:function (type) {
                                var time = $scope[efTimer][efTimer+'_effect_time'];
                                time = type || time;

                                if(type) {
                                    dateDefault(type);
                                    if(this.timeStatus){
                                        $scope[efTimer][efTimer+'_effect_time'] = dateDefault(type).time
                                    }else {
                                        $scope[efTimer][efTimer+'_effect_time'] = 1
                                    }
                                }
                            } ,
                            click:function () {
                                this.timeStatus = !this.timeStatus;
                                this.time(1);
                            }
                        };
                    }
                }
            }
        angular.forEach($scope.pj,function (data,index) {
            $scope.timerSet($scope.pj[index]);
        })
        $scope.changLegalMan = function (man) {
            $scope['change' + man] = {
                status: false,
                click: function () {
                    this.status = !this.status;
                    if(!this.status ){
                        $scope.memberInfo[man + '_type'] = 1
                    } else {
                        $scope.memberInfo[man + '_type'] = 2
                    }
                }
            };

        };
        //切换自然人 与 法人
        $scope.changLegalMan('stockholder');
        $scope.changLegalMan('controll');

        //行业下拉菜单
        $scope.getTradeMsg = function(e){
            e.stopPropagation();
            document.getElementById('catelogList').style.display='block';
            _http({
                url: '/certificate/business-type',
                method: 'POST'
            }).then(function(res) {
                    if (res.data.error.returnCode == '0') {
                        $scope.tradList=res.data.data.businessCatagorys;
                        $scope.hangye = true;
                    } else {

                        $rootScope.globalError(res.data.error.returnMessage);
                    }
                }, function() {
                    $rootScope.globalError('异常错误');
                });
        }
        $scope.selectCatelog = function(value){
            $scope.memberInfo.industry = value;
            $scope.hangye = false;
        }
        document.onclick=function(event){
            if( $scope.hangye){
                document.getElementById('catelogList').style.display = 'none';
            }
        }
       // 编辑  保存 取消
        $scope.operate = function (num) {
            $scope.saveStatus = false;
            if(num == 1){
                $scope.hidebtn = false
            } else if(num == 2 || num == 3) {
                if(num == 3){
                    $scope.init()
                    $scope.hidebtn = true;
                    $scope.saveStatus = true;
                } else {
                    $scope.submit(1,3);
                }
            }
        }
        // 上传图片
        $scope.upload = function (file, attr,img) {
            if($scope.certificate_status>=5){
                img = img + "_bak";
            }
            if (!file) {
                return;
            }
            var imageType = /image.*png|image.*jpeg$/;
            $scope.uploadError = '';
            if (!file.type.match(imageType)) {
                $rootScope.globalError('图片格式必须为：jpeg、png');
                return;
            }
            if (file.size > 2 * 1024 * 1024) {
                $rootScope.globalError('图片不大于2M');
                return;
            }
            Upload.upload({
                url: '/upload/post',
                data: {
                    file: file,
                    token: localStorage.getItem('loginToken'),
                    companyID: localStorage.getItem('loginCompanyID'),
                    type: 2
                }
            }).
            then(function (resp) {
                var res = resp.data;
                if (res.error.returnCode == '0') {
                    var imgSrc = res.data.basePath + res.data.file;
                    $scope[attr][img] = imgSrc;
                    $scope.modifySatus = true;
                } else if(res.error.returnCode == 5001){
                    $rootScope.globalError('登录已失效，请重新登录！');
                    $location.url('/login-version');
                }else {
                    $rootScope.globalError(res.error.returnMessage);
                }
            }, function() {
                $rootScope.globalError('异常错误！');
            });
        };

        $scope.submit = function (num,type,s) {



            var url,dataCi;
            $scope.requiredStatus = false;
            if(num == 1 ){
                //暂存按钮loading
                $scope.loadStatus = true;
                // 保存 暂存功能
                url = '/certificate/update-certificate'
            }else if(num == 2) {
                $scope.submited = true;
                // 字段必填
                $scope.requiredStatus = true;
                //提交按钮loading
                $scope.subloadStatus = true;
                // 提交审核功能
                url = '/certificate/audit-apply'
            };

            if(!type){
                type = 0
            }
            var  tax = {},
                 operating= {},
                 legal = {},
                 organizational = {},
                 bank = {},
                 memberInfo = {};
            if($scope.operating){
                if($scope.certificate_status>=5){
                    if( $scope.operating.operating_img_bak){
                        $scope.operating.operating_img = $scope.operating.operating_img_bak;
                    }
                    if( $scope.operating.operating_effect_time_bak){
                        var time = $scope.operating.operating_effect_time_bak;
                        $scope.operating.operating_effect_time = time;
                    }
                    if( $scope.operating.company_id_type_bak){
                        $scope.operating.company_id_type = $scope.operating.company_id_type_bak;
                    }
                    if( $scope.operating.company_address_bak){
                        $scope.operating.company_address = $scope.operating.company_address_bak;
                    }
                }
                operating = {
                    operating_img:$scope.operating.operating_img,
                    company_id_type:$scope.operating.company_id_type,
                    company_id_no:$scope.operating.company_id_no,
                    company_address:$scope.operating.company_address,
                    operating_effect_time:$scope.operating.operating_effect_time
                };
            }
            if($scope.tax){
                if($scope.certificate_status>=5){
                    if($scope.tax.tax_img_bak){
                        $scope.tax.tax_img = $scope.tax.tax_img_bak;
                    }
                    if($scope.tax.tax_id_bak){
                        $scope.tax.tax_id = $scope.tax.tax_id_bak;
                    }
                }
                tax = {
                    tax_img:$scope.tax.tax_img,
                    tax_id:$scope.tax.tax_id
                };
            }
            if($scope.legal){
                if($scope.certificate_status>=5){
                    if($scope.legal.legal_img_bak){
                        $scope.legal.legal_img = $scope.legal.legal_img_bak ;
                    }
                    if($scope.legal.legal_opposite_img_bak){
                        $scope.legal.legal_opposite_img = $scope.legal.legal_opposite_img_bak ;
                    }
                    if($scope.legal.legal_id_bak){
                        $scope.legal.legal_id = $scope.legal.legal_id_bak ;
                    }
                    if($scope.legal.legal_effect_time_bak){
                        $scope.legal.legal_effect_time = $scope.legal.legal_effect_time_bak ;
                    }
                }
                legal = {
                    legal_img:$scope.legal.legal_img,
                    legal_opposite_img:$scope.legal.legal_opposite_img,
                    legal_name:$scope.legal.legal_name,
                    legal_id:$scope.legal.legal_id,
                    legal_effect_time:$scope.legal.legal_effect_time
                };
            }
            if($scope.organizational){
                if($scope.certificate_status>=5){
                    if($scope.organizational.organizational_img_bak){
                        $scope.organizational.organizational_img = $scope.organizational.organizational_img_bak;
                    }
                    if($scope.organizational.organizational_id_bak){
                        $scope.organizational.organizational_id = $scope.organizational.organizational_id_bak;
                    }
                }
                organizational = {
                    organizational_img:$scope.organizational.organizational_img,
                    organizational_id:$scope.organizational.organizational_id
                };
            }
           if($scope.bank){
               if($scope.certificate_status >=5){
                   if($scope.bank.bank_img_bak){
                       $scope.bank.bank_img = $scope.bank.bank_img_bak;
                   }
                   if($scope.bank.bank_id_bak){
                       $scope.bank.bank_id = $scope.bank.bank_id_bak;
                   }
               }
               bank = {
                   bank_img:$scope.bank.bank_img,
                   bank_id:$scope.bank.bank_id
               };
           }
            if($scope.memberInfo){
                memberInfo = {
                    stockholder_type:$scope.memberInfo.stockholder_type ,
                    stockholder_name:$scope.memberInfo.stockholder_name,
                    stockholder_id:$scope.memberInfo.stockholder_id,
                    stockholder_effect_time:$scope.memberInfo.stockholder_effect_time,
                    controll_type:$scope.memberInfo.controll_type,
                    controll_name:$scope.memberInfo.controll_name,
                    controll_id:$scope.memberInfo.controll_id,
                    controll_effect_time:$scope.memberInfo.controll_effect_time,
                    transactor_name:$scope.memberInfo.transactor_name,
                    transactor_id:$scope.memberInfo.transactor_id,
                    transactor_effect_time:$scope.memberInfo.transactor_effect_time,
                    industry:$scope.memberInfo.industry,
                    business:$scope.memberInfo.business
                };
                if($scope.memberInfo.hasOwnProperty('staff_num')){
                    memberInfo.staff_num =  $scope.memberInfo.staff_num
                }
            }
            var data = {
                "5":{
                    operating:operating,
                    legal:legal,
                    tax:tax,
                    organizational:organizational,
                    bank:bank,
                    memberInfo:memberInfo
                },
                "3":{
                    operating:operating,
                    legal:legal,
                    bank:bank,
                    memberInfo:memberInfo
                }
            }
            if($scope.operating){
                if($scope.operating.company_id_type == 2 || $scope.operating.company_id_type_bak == 2){
                    dataCi = data['3'];
                } else {
                    dataCi = data['5'];
                }
            }else{
                dataCi = data['5'];
            }
            //if(num!=2){
                dataCi.type = type;
            //}
            var totalStatus = $scope.maninfoForm.$valid || $scope.bankForm.$valid || $scope.taxForm.$valid || $scope.legalForm.$valid || $scope.operatingForm.$valid || $scope.organizationalForm.$valid

            // certificate_status 0,1  type 1
            // certificate_status 3 6  type 2
            // certificate_status 4 5  type 3
            if(num !=2 || num == 2 && totalStatus){
                _http({
                    url: url,
                    data:dataCi,
                    method: 'POST'
                }).then(function (res) {
                    $scope.requiredStatus = false;
                    $scope.loadStatus = false;
                    $scope.subloadStatus = false;
                    if (res.data.error.returnCode == '0') {
                        //跳转成功页面
                            if(num == 2 || s == 1 ){
                                if($scope.certificate_status == 6 ){
                                    $location.url('/change-request');
                                } else {
                                    $location.url('/info');
                                }
                            }
                            if(num == 3|| num == 1){
                                 $scope.init()
                             }
                        //切换为编辑状态
                     if($scope.certificate_status == 4 || $scope.certificate_status == 5){
                            $scope.hidebtn = true;
                            $scope.saveStatus = true;
                        }
                    } else {

                        $rootScope.globalError(res.data.error.returnUserMessage);
                        return ;
                    }
                },function (res) {
                    $scope.loadStatus = false;
                    $scope.subloadStatus = false;
                    $rootScope.globalError(res.data.error.returnUserMessage);
                })
            }
        }
    });
