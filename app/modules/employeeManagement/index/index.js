'use strict';

/**
 * 员工管理
 */
angular.module('myApp')
    .controller('EmployeeManagementCtrl', function ($scope, $rootScope, _http,  $q, $uibModal, $location, $http, $company) {


			$company.getCompanyInfo().then(function(data) {
                $scope.ra = data.ext.company_status.is_ident;//充值认证
			});

            $scope.showTotalTips = false;
            // 提示搜索结果
            $rootScope.showRes = false;
            // 不现实
            $rootScope.abledStatus = true;
            $scope.graystatus = false
            $scope.token = localStorage.getItem('loginToken');
            $scope.companyID = localStorage.getItem('loginCompanyID');
            // 查询状态
            $scope.searchStatus = true;
            //充值认证跳转
            $scope.goToRecharge = function() {
				$location.url('/how2-recharge');
            };

            $scope.iptChange = function (str) {
               $scope.searchString = str;
                $scope.searchStatus = false;

                if(str === ''){
                    $rootScope.abledStatus =true;
                    $scope.allStaff();
                }
                var str = document.getElementById('members_value').value;
                var reg =/^\d{1,3}$/;
                if(typeof +str ==='number' && reg.test(str)){
                    // $rootScope.globalError('手机号查询至少输入四位');
                    $rootScope.abledStatus =false
                };
               // $rootScope.abledStatus =false
            }
            $rootScope.$watch('showRes',function(newValue,oldValue, scope){
                if(newValue){
                    $scope.showTotalTips = true;
                    $scope.data.employeeList = [];
                    $scope.data.total = 0;
                } else {
                    $scope.showTotalTips = false;
                }
            });
            if($rootScope.showRes){
                $scope.data.employeeList = [];
            }
            //req 格式化
            $scope.remoteUrlRequestFn = function(str) {
                return {
                    value: str,
                    token :localStorage.getItem('loginToken'),
                    companyID:localStorage.getItem('loginCompanyID')
                };
            };
            // 点击搜索查询
            $rootScope.searchHandler = function () {
                if($scope.searchString){
                    var str = document.getElementById('members_value').value;
                    var reg =/^\d{1,3}$/;
                    if(typeof +str ==='number' && reg.test(str)){
                       // $rootScope.globalError('手机号查询至少输入四位');
                        $rootScope.abledStatus =false;
                        return ;
                    };
                     $rootScope.abledStatus =true;
                    _http({
                        url: '/staff/search',
                        method: 'POST',
                        data:{
                            value: document.getElementById('members_value').value
                        }
                    }).then(function (res) {
                        var data = res.data;
                        var list = data.data.list;
                        var idList = '';
                        var idStatus = '';
                        if (data.error.returnCode == '0') {
                            if(list.length == 0){
                                $scope.showTotalTips = true;
                                $scope.data.employeeList = data.data.list;
                                return ;
                            } else {
                                $scope.showTotalTips = false;
                            }
                            angular.forEach(list, function(value, key) {

                                idList+=value.id+'-';
                                idStatus+=value.id;
                            })
                            $scope.idList = idList;
                            $scope.idStatus = idStatus;
                            if(idList&&idStatus){

                                searchList(idList);
                            } else {
                                $rootScope.searchHandler();
                            }
                        } else {
                            $rootScope.globalError(data.error.returnMessage);
                        }
                    }, function () {

                        $rootScope.globalError('异常错误！');
                    });
                } else{
                    $scope.allStaff()
                }

            };
            function searchList(idList) {
                _http({
                    url: '/staff/list',
                    method: 'POST',
                    data: {
                        id:idList
                    }
                }).then(function (res) {
                    var data = res.data;
                    if (data.error.returnCode == '0') {
                        angular.forEach(data.data.list,function(item){
                            setStaffTypeText(item);
                            setStatusText(item);
                        });
                        $scope.data.employeeList = data.data.list;
                        $scope.searchTotal = data.data.list.length;
                        $scope.searchStatus = false;
                        $scope.data.total = data.data.total;
                        $scope.data.totalStaff = data.data.totalStaff;
                        $scope.data.totalFriend = data.data.totalFriend;
                        $scope.query.ttype = 'all';
                        $scope.query.status = 0;
                    } else {
                        $rootScope.globalError(data.error.returnMessage);
                    }
                    $scope.employeePageDisabled = false;
                }, function () {
                    $scope.employeePageDisabled = false;
                    $rootScope.globalError('异常错误！');
                });
            }
            //选中后
            $scope.filterName = function($item) {
                var item = '';
                if (document.getElementById('members_value').value ) {
                    if($scope.idList != '' || !$scope.searchStatus){
                        item = $item.originalObject.id+'-'
                    }
                    if(item){
                        _http({
                            url: '/staff/list',
                            method: 'POST',
                            data: {
                                id:item
                            }
                        }).then(function (res) {
                            var data = res.data;
                            if (data.error.returnCode == '0') {
                                angular.forEach(data.data.list,function(item){
                                    setStaffTypeText(item);
                                    setStatusText(item);
                                });
                                $scope.data.employeeList = data.data.list;
                                $scope.searchTotal = data.data.list.length;
                                $scope.searchStatus = false;
                                $scope.data.total = data.data.total;
                                $scope.data.totalStaff = data.data.totalStaff;
                                $scope.data.totalFriend = data.data.totalFriend;
                                $scope.query.ttype = 'all';
                                $scope.query.status = 0;
                            } else {
                                $rootScope.globalError(data.error.returnMessage);
                            }
                            $scope.employeePageDisabled = false;
                        }, function () {
                            $scope.employeePageDisabled = false;
                            $rootScope.globalError('异常错误！');
                        });
                    }
               }


            };

            //点击全部员工清空搜索框
            $scope.allStaff = function () {
                $scope.$broadcast('angucomplete-alt:clearInput','members');
                document.getElementById('members_value').value = '';
                $scope.searchStatus = true;
                $scope.showTotalTips = false;
                $scope.idList = '';
                $scope.getEmployeeList();
                
                !function() {
                    $scope.query = {};
                    $scope.data = {};
                    $scope.query.ttype = 'all';
                    $scope.query.status = 0;
                    $scope.employeePageSize = 20;
                    $scope.employeePageNo = 1;

                    $q.all([initTags(),initStaffStatusTypes()]).then(function(){
                        $scope.getEmployeeList();
                    });
                }();
            };
            //初始化员工类型
            function initTags() {
                $scope.employeePageDisabled = true;

                return _http({
                    url: '/staff/get-staff-type',
                    method: 'POST'
                }).then(function (res) {
                    var data = res.data;
                    if (data.error.returnCode == '0') {
                        $scope.ttypes = data.data;
                    } else {
                        $rootScope.globalError(data.error.returnMessage);
                    }
                    $scope.employeePageDisabled = false;
                }, function () {
                    $scope.employeePageDisabled = false;
                    $rootScope.globalError('异常错误！');
                });
            }

            /**
             * 获取员工类型的文本
             * @param item
             */
            var setStaffTypeText = function(item){
                  for(var i= 0,_item;_item = $scope.ttypes[i];i++){
                      if(_item.tagId == item.staff_type){
                          item.staffTypeText = _item.tagName;
                          break;
                      }
                  }
            };
            //初始化员工状态类型
            function initStaffStatusTypes(index) {
                $scope.employeePageDisabled = true;

                return _http({
                    url: '/staff/get-status-type',
                    method: 'POST'
                }).then(function (res) {
                    var data = res.data;
                    if (data.error.returnCode == '0') {
                        $scope.staffStatus = data.data;
                    } else {
                        $rootScope.globalError(data.error.returnMessage);
                    }

                    $scope.employeePageDisabled = false;
                }, function () {
                    $scope.employeePageDisabled = false;
                    $rootScope.globalError('异常错误！');
                });
            }

            /**
             * 导出员工列表
             */
            $scope.exportStaff = function() {
                location.href = '/staff/export-list' +
                    '?staffType=' + ($scope.query.ttype == 'all' ? -1 : $scope.query.ttype) +
                    '&status=' + $scope.query.status +
					'&token=' + localStorage.getItem('loginToken') +
					'&companyID=' + localStorage.getItem('loginCompanyID');
            };
         
            /**
             * 获取员工好友状态的文本
             * @param item
             */
            var setStatusText = function(item) {
				for (var i = 0, len = $scope.staffStatus.length; i < len; i++) {
					var _item = $scope.staffStatus[i];
                    if(_item.id == item.status){
                        item.statusText = _item.text;
                        break;
                    }
				}
            };

            //获取员工列表
            $scope.getEmployeeList = function (index) {
                if (!index) {
                    $scope.employeePageNo = index = 1;
                }

                var tags = $scope.query.ttype;
                var status = $scope.query.status;

                if ($scope.query.ttype == 'all') {
                    tags = -1;
                }
                /*if ($scope.query.status == 'all') {
                    status = '';
                }*/
                var idList = ''
                $scope.employeePageDisabled = true;
                if($scope.idList){
                    idList = $scope.idList;
                }else {
                    idList = '';
                }
                _http({
                    url: '/staff/list',
                    method: 'POST',
                    data: {
                        pageNo: index,
                        pageSize: $scope.employeePageSize,
                        staffType: tags,
                        status: status,
                        id:idList
    //                    isWage: 1
                    }
                }).then(function (res) {
                        var data = res.data;
                        if (data.error.returnCode == '0') {
                            angular.forEach(data.data.list,function(item){
                                setStaffTypeText(item);
                                setStatusText(item);
                            });
                            $scope.data.employeeList = data.data.list;
                            $scope.data.total = data.data.total;
                            $scope.searchStatus = true;
                            $scope.data.totalStaff = data.data.totalStaff;
                            $scope.data.totalFriend = data.data.totalFriend;
                        } else {
                            $rootScope.globalError(data.error.returnMessage);
                        }
                        $scope.employeePageDisabled = false;
                    }, function () {
                        $scope.employeePageDisabled = false;
                        $rootScope.globalError('异常错误！');
                    });
            };
            //刷新员工好友状态
            $scope.refresh = function (item) {
                $scope.employeePageDisabled = true;

                _http({
                    url: '/friends/refresh',
                    method: 'POST',
                    data: {}
                }).then(function (res) {

                        var data = res.data;
                        if (data.error.returnCode == '0') {

                            //刷新成功后调用列表接口更新显示信息
                            $scope.getEmployeeList();
                        } else {
                            $rootScope.globalError(data.error.returnMessage);
                        }
                        $scope.employeePageDisabled = false;
                    }, function () {
                        $scope.employeePageDisabled = false;
                        $rootScope.globalError('异常错误！');
                    })
                ;
            };
            //修改员工信息
            $scope.modify = function (item) {

                var modalInstance = $uibModal.open({
                    animation: false,
                    templateUrl: 'modifyStaffModal.html',
                    controller: 'modifyStaffModalCtrl',
                    size: 'modify-info-size',
                    resolve: {
                        modifyData: function () {
                            return {
                                item: item,
                                ttypes: $scope.ttypes
                            };
                        }
                    }
                });

                modalInstance.result.then(function (data) {
                    item.name = data.name;
                    item.id_no = data.id_no;
                    item.mobilephone = data.mobilephone;
                    item.staff_type = data.staff_type;
                    item.status = data.status;
                    setStaffTypeText(item);
                    setStatusText(item);
                }, function () {

                });
            };

            //删除员工
            $scope.remove = function(obj){

				// role: 0 普通员工 1管理员 2操作员
				// 只有普通员工可以删除
                if(obj.role != 0){
					return;
                }

				var modalInstance = $uibModal.open({
					animation: false,
					templateUrl: 'delStaffModal.html',
					controller: 'delStaffModalCtrl',
					size: 'modify-info-size',
					resolve: {
						modifyData: function () {
							return {
								item: {
									id:obj.id,
									name:obj.name
								}
							};
						}
					}
				});
				modalInstance.result.then(function () {
					for(var i = 0,item;item=$scope.data.employeeList[i];i++){
						if(item.uuid == obj.uuid){
							$scope.data.employeeList.splice(i,1);
							break;
						}
					}
				}, function () {

				});
            };

            !function() {
                $scope.query = {};
                $scope.data = {};
                $scope.query.ttype = 'all';
                $scope.query.status = 0;
                $scope.employeePageSize = 20;
                $scope.employeePageNo = 1;

                $q.all([initTags(),initStaffStatusTypes()]).then(function(){
                    $scope.getEmployeeList();
                });
            }();
        }
    
);
//修改员工信息控制器
angular.module('myApp')
    .controller('modifyStaffModalCtrl', [
        '$rootScope',
        '$scope',
        '$uibModalInstance',
        '_http',
        'modifyData',
        
        function ($rootScope, $scope, $uibModalInstance, _http, modifyData) {

            var item = modifyData.item;
            $scope.ttypes = modifyData.ttypes;
            $scope.flag = item.status == 1 ? true: false;//是否是好友状态
            $scope.submitForm  = {};
            $scope.submitForm.id = item.id;
            $scope.submitForm.name = item.name;
            $scope.submitForm.id_no = item.id_no;
            $scope.submitForm.mobilephone = item.mobilephone;
            $scope.submitForm.staff_type = item.staff_type;

            $scope.modalClose = function() {
                $uibModalInstance.close();
            };

            $scope.submit = function (isValid) {
                $scope.submitted = true;
                if (isValid) {
                    _http({
                        url: '/staff/edit',
                        method: 'POST',
                        data: $scope.submitForm
                    }).then(function(res) {
                        if (res.data.error.returnCode == '0') {
                            $uibModalInstance.close(res.data.data);
                        } else {
                            $rootScope.globalError(res.data.error.returnMessage);
                        }
                    }, function() {
                        $rootScope.globalError('异常错误！');
                    });
                }
            };

            $scope.cancel = function () {
                $uibModalInstance.dismiss('cancel');
            };
        }
    ]
);
//删除员工
angular.module('myApp')
    .controller('delStaffModalCtrl', [
        '$rootScope',
        '$scope',
        '$uibModalInstance',
        '_http',
        'modifyData',
        
        function ($rootScope, $scope, $uibModalInstance, _http, modifyData) {
            $scope.name = modifyData.item.name;
            $scope.del = function () {
                _http({
                    url: '/staff/del',
                    method: 'POST',
                    data: modifyData.item
                }).then(function(res) {
                    if (res.data.error.returnCode == '0') {
                        $uibModalInstance.close();
                    } else {
                        $rootScope.globalError(res.data.error.returnMessage);
                    }
                }, function() {
                    $rootScope.globalError('异常错误！');
                });
            };

            $scope.modalClose = function() {
                $uibModalInstance.close();
            };

            $scope.cancel = function () {
                $uibModalInstance.dismiss('cancel');
            };
        }
    ]
);
