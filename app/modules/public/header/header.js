'use strict';
 
angular.module('myApp')
 
.controller('HeaderCtrl', function ($scope, $rootScope, $location, $window, $timeout, _http, $uibModal, $helper) {

	// 绑定企业版的页面列表，这几个页面默认选中"添加我的企业"option
	var bindPathArr = [
		'bindcompany',
		'bindmyco'
	];
	var defaultOption = {
		name: '添加我的企业'
	};
	var isInitStatus = true;
 
	// 是否显示tips提示
    $scope.hideCompanyTips = localStorage.getItem('hideCompanyTips') == '1';
 
    //隐藏tips函数
    $scope.cancelTips = function () {
        $scope.hideCompanyTips = true;
		localStorage.setItem('hideCompanyTips', '1');
    }

	// 如果是从不显示菜单栏的页面跳转而来，则需要重新初始化，更新菜单栏
	// 回到overview页面重新初始化
	// newValue != oldValue 非刷新页面
	$rootScope.$watch('curRoutePath', function(newValue, oldValue) {
		initCurCompany();
		if ((newValue == 'overview' || $rootScope.blackSideBarList.indexOf(oldValue) > -1) && newValue != oldValue) {
			init();	
		}
	});

	// 更新企业列表
	$rootScope.$on('updateCompanyList',function (event) {
		init('update');	
	});

	var initCurCompany = function() {
		if (!$scope.companyList) {
			return;
		}
		if (bindPathArr.indexOf($rootScope.curRoutePath) > -1) {
			$scope.curCompany = defaultOption;	
		} else {
			var loginCompanyID = localStorage.getItem('loginCompanyID');
			if (loginCompanyID) {
				for (var i = 0, len = $scope.companyList.length; i < len; i++) {
					if (loginCompanyID == $scope.companyList[i].company_id) {
						$scope.curCompany = $scope.companyList[i];
						return;
					}
				}
			}
			$scope.curCompany = $scope.companyList[0];
		}
	}

	var init = function(initType) {
		var path = $location.path();

		if (path == '/login') {
			return;	
		}

        _http({
            url: '/user/getuserinfo',
            method: 'POST',
            data: {
				header: 'header',
				token: localStorage.getItem('loginToken')
			}
        }).then(function (res) {
			if (res.data.error.returnCode == '0') {
				initHeader(res.data.data, initType);
			} else {
				$rootScope.globalError(res.data.error.returnMessage);
			}
        }, function (res) {
            $rootScope.globalError(res.data.error.returnMessage);
        })
	}

	// 初始化
	init();

	// 上一次选中的企业
	var preCompany = {};
    //初始化企业、切换企业调用函数
    $scope.initCompany = function (companyItem, isSwitch) {

        if (!companyItem || !companyItem.company_id) {
			preCompany = defaultOption;
            $location.url('/bindcompany')
			return;
		}
		
		if (isSwitch && companyItem.company_id == preCompany.company_id) {
			return;
		}

		localStorage.setItem('loginCompanyID', companyItem.company_id);
		preCompany = companyItem;

		_http({
			url: '/user/getcompanyinfo',
			method: 'POST'
		}).then(function (res) {
			if (res.data.error.returnCode == '0') {
				var data = res.data.data;

				//展示用户信息
				$scope.userName = data.userinfo.name;

				// 用户头像
				$scope.userAvatar = data.userinfo.thumbnail_url;

				// 触发事件
				$rootScope.$broadcast('switchCompany', data, function() {
					var path = $location.path();
					if (path == '/overview') {
						$rootScope.$broadcast('refreshOverview', data);
					}
					if (isSwitch) {
						$location.url('/overview');
					}
				}); 

			}
		}, function () {
			$rootScope.globalError(res.data.error.returnMessage);
		})
    }

    //设置头部信息
    function initHeader(data, initType) {

		// 管理员或者操作员 1管理员 2操作员
		$rootScope.role = data.userinfo.role;
		// 展示用户信息
		$scope.userName = data.userinfo.name;
		// 用户头像
		$scope.userAvatar = data.userinfo.thumbnail_url;
		$scope.companyList = data.companyList.length ? data.companyList : [];
		$scope.companyList.push(defaultOption);

		initCurCompany();
		$scope.company_id = $scope.curCompany.company_id;

		// 只更新header企业列表，不获取企业具体信息
		if (initType == 'update') {
			return;	
		}

		if ($scope.company_id) {
			$scope.initCompany($scope.curCompany);
		} else if (bindPathArr.indexOf($rootScope.curRoutePath) == -1) {
			$location.url('/bindcompany');
		}
    }
 
    $scope.logout = function () {
 
        _http({
            url: '/user/logout',
            method: 'POST',
            data: {
                header: 'header'
            }
        }).
        then(function (res) {
            if (res.data.error.returnCode == '0') {
                localStorage.clear();
                // 清除localStorage
                $window.location.href = '/index.html'
            } else {
                $rootScope.globalError(res.data.error.returnMessage);
            }
 
        }, function () {
            $rootScope.globalError('异常错误！');
        });
    };

    $scope.open = function (temp, ctr, size) {
        var modalInstance = $uibModal.open({
            animation: false,
            templateUrl: temp,
            controller: ctr,
            size: size
        });
    };

    $scope.checkFriends = function () {
        _http({
            url: '/friends/getnum',
            method: 'POST'
        }).then(function (res) {
            if (res.data.error.returnCode == '0') {
                if (res.data.data.num == 0) {
                    $scope.open('ZeroFriendModal.html', 'ZeroFriendModalCtrl', 'zerofriend-size');
                    // $rootScope.globalError('当前好友数为0，不能发起融资。通过借贷宝，给员工发一次工资，即可添加他们为好友，这样就可以向他们融资啦。');
                } else {
                    isQuotaTip($scope.linkToBorrow);
                    checkQuota();
                }
            } else {
                $rootScope.globalError(res.data.error.returnMessage);
            }
        }, function () {
            $rootScope.globalError('异常错误！');
        });
    };
 
    $rootScope.goToBorrow = function () {
        _http({
            url: '/company/get-ident-status',
            method: 'POST'
        }).then(function (res) {
            if (res.data.error.returnCode == '0') {
                if (res.data.data.identStatus == 1) {
                    $scope.checkFriends();
                } else {
                    $helper.openIdentModal('发起融资');
                }
            } else {
                $rootScope.globalError(res.data.error.returnUserMessage);
            }
        }, function () {
            $rootScope.globalError('异常错误！');
        });
    };
 
    $scope.linkToBorrow = function () {
        $location.url('/borrow');
    };
 
    /**
     * 点击发起融资,企业用户发标成功且借款已经达到默认额度借满后   弹窗提示
     * @param cb 回调方法
     */
    function checkQuota(cb) {
        _http({
            url: '/borrow/get-borrow-data',
            method: 'POST',
            data: {
                companyID: localStorage.getItem('loginCompanyID')
            }
        }).then(function (res) {
            var res = res.data;
            if (res.error.returnCode == '0') {
                if (res.data.level == 'D' && res.data.amount <= '0') {
                    $scope.open('CheckQuota.html', 'CheckQuotaCtrl', 'zerofriend-size');
                } else {
                    cb && cb();
                }
            } else {
                $rootScope.globalError(res.data.error.returnMessage);
            }
        }, function () {
            $rootScope.globalError('异常错误！');
        })
    }
 
 
    /**
     * 检查是否弹出额度提醒弹窗请求   只弹一次
     */
    function isQuotaTip(cb) {
        _http({
            url: '/risk/check-notice',
            method: 'POST',
            data: {
                companyID: localStorage.getItem('loginCompanyID')
            }
        }).then(function (res) {
            res = res.data;
            if (res.error.returnCode == '0') {
                if (res.data.is_show == '1') {
                    $scope.openQuotaTip();
                } else {
                    cb && cb();
                }
            } else {
                $rootScope.globalError(res.data.error.returnMessage);
            }
        }, function () {
            $rootScope.globalError('异常错误！');
        });
    }
 
    //打开融资提示弹窗
    $scope.openQuotaTip = function () {
        $scope.open('quotaTip.html', 'QuotaTipCtrl', 'zerofriend-size');
    };
 
    // 跳转到overview页面
    $scope.goToOverView = function () {
		if ($location.path() == '/overview') {
			window.location.reload()
		} else {
			$location.url('/overview');
		}
    }
});
 
angular.module('myApp').controller('ZeroFriendModalCtrl', ['$scope', '$rootScope', '$location', '$window', '$timeout',
        '_http', '$uibModalInstance', function ($scope, $rootScope, $location, $window, $timeout, _http,
        $uibModalInstance) {
        $scope.cancel = function () {
            $uibModalInstance.close();
        };
 
        $scope.go = function () {
            $location.url('/pay-management');
            $uibModalInstance.close();
        };
    }]);
 
//检查额度
angular.module('myApp').controller('CheckQuotaCtrl', ['$scope', '$rootScope', '$location', '_http', '$uibModalInstance', function (
        $scope, $rootScope, $location, _http, $uibModalInstance) {
        $scope.cancel = function () {
            $uibModalInstance.close();
        };
    }]);
 
//额度提醒弹窗
angular.module('myApp').controller('QuotaTipCtrl', ['$scope', '$rootScope', '$location', '_http', '$uibModalInstance', function (
        $scope, $rootScope, $location, _http, $uibModalInstance) {
        $scope.linkToBorrow = function () {
            $uibModalInstance.close();
            $location.url('/borrow');
        };
    }]);
