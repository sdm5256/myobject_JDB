'use strict';

angular.module('myApp')
    .controller('OverviewCtrl', function($scope, $rootScope, $window, _http, $location, $uibModal, $helper, $company) {

        $scope.payToEmployee = $helper.payToEmployee;

        //是否展示冻结金额  大于0 展示
        $scope.isGraterThan0 = false;
        $scope.isJiuxuanhu = false;

		var refreshOverviewListener = $rootScope.$on('refreshOverview',function (event, data) {
			init(data);	
		});

		// scope销毁时，注销事件绑定，避免重复绑定
		$scope.$on('$destroy', function() {
			refreshOverviewListener();
		});

        function init(data) {
			queryMoney();
			isJiuxuanhu(data);
			initCompanyInfo(data);
        };

		function initCompanyInfo(data) {
			$scope.companyinfo = data.companyinfo;

			// 企业是否认证
            if(data.companyinfo.verify_status == 7){
              $scope.verifyStatus = '已认证'
              $scope.identSuccess = true;
            } else {
              $scope.verifyStatus = '未认证'
              $scope.identSuccess = false;
            }
		}

        function queryMoney() {
            _http({
                url: '/company/querydetail',
                method: 'POST'
            }).
            then(function(res) {
                if (res.data.error.returnCode == '0') {
                    $scope.data = res.data.data;
                    $scope.data.canPayedBalance = ($scope.data.totalBalance - $scope.data.frozen).toFixed(2);

                    if ($scope.data.frozen > 0) { //冻结金额大于0,则显示
                        $scope.isGraterThan0 = true;
                    }

                    if ($scope.data.canPayedBalance < 0) {
                        $scope.data.canPayedBalance = 0;
                    }

                    if (isNaN($scope.data.canPayedBalance)) {
                        $scope.data.canPayedBalance = null;
                    }

                } else {
                    $scope.showPersonsLayer = false;
                    $rootScope.globalError(res.data.error.returnMessage);
                }
            }, function() {
                $rootScope.globalError('异常错误！');
            });
        }

        // 检查企业是否已认证
        $scope.checkIdentStatus = function() {
            if ($scope.isJiuxuanhu) {
                openIsJiuxuanhu();
            } else {
				$company.getIdentStatus().then(function(identStatus) {
					if (identStatus == 1) {
						$location.url('/get-cash')
					} else {
						$helper.openIdentModal('提现');
					}
				});
            }
        };

        $scope.goToRecharge = function() {
            if ($scope.isJiuxuanhu) {
                openIsJiuxuanhu();
            } else {
                $location.url('/how2-recharge');
            }
        };

        $scope.modifyLogo = function() {
            $uibModal.open({
                animation: false,
                templateUrl: 'modifyLogoModal.html',
                controller: 'modifyLogoModalCtrl',
                size: 'modify-logo-size',
                resolve: {
                    modifyData: function() {
                        return {
                            data: $scope.companyinfo
                        };
                    }
                }
            });
        };

        /**
         * 是否为久悬户
         */
        function isJiuxuanhu(data) {
			if (data.ext.company_status.is_jiuxuanhu === 1) {
				$scope.isJiuxuanhu = true;
			} else {
				$scope.isJiuxuanhu = false;
			}
        }

        function openIsJiuxuanhu() {
            $uibModal.open({
                animation: false,
                templateUrl: 'isJiuxuanhu.html',
                controller: 'isJiuxuanhuCtrl',
                size: 'modify-info-size',
                resolve: {
                    modifyData: function() {
                        return false;
                    }
                }
            });
        }
    })

.controller('modifyLogoModalCtrl', function($rootScope, $scope, $uibModalInstance, Upload, modifyData, _http, $location) {

    $scope.upload = function(file) {

        if (!$scope.avatorUrl) {
            $scope.hasUploaded = false;
        }

        if (!file) {
            return;
        }

        var imageType = /image.*png|image.*jpeg|image.*jpg$/;

        $scope.uploadError = '';

        if (!file.type.match(imageType)) {
            $scope.uploadError = '图片格式必须为：jpeg、png、jpg';
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            $scope.uploadError = '图片不大于2M';
            return;
        }

        Upload.upload({
            url: '/upload/post',
            data: {
                file: file,
                token: localStorage.getItem('loginToken'),
                companyID: localStorage.getItem('loginCompanyID')
            }
        }).
        then(function(resp) {
            var res = resp.data;

            if (res.error.returnCode == '0') {
                $scope.headBaseUrl = res.data.basePath;
                $scope.avatorUrl = res.data.file;
                $scope.hasUploaded = true;
                $scope.companyLogo = res.data.basePath + '/' + res.data.file;

            } else {
                $scope.hasUploaded = false;
                $rootScope.globalError(res.error.returnMessage);
            }

        }, function() {
            $scope.hasUploaded = false;
            $rootScope.globalError('异常错误！');
        });
    };

    $scope.modalClose = function() {
        $uibModalInstance.close();
    };

    $scope.ok = function() {
        if ($scope.hasUploaded) {
            _http({
                    url: '/user/updateuserinfo',
                    method: 'POST',
                    data: {
                        account_status: 2,
                        entry_img: $scope.avatorUrl
                    }
                })
                .then(function(res) {

                    if (res.data.error.returnCode == '0') {
						modifyData.data.avatar_url = $scope.headBaseUrl + $scope.avatorUrl;
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
})

.controller('isJiuxuanhuCtrl', function($scope, $rootScope, $uibModalInstance, modifyData) {
    $scope.companyName = localStorage.getItem('companyName');
    $scope.close = function() {
        $uibModalInstance.close();
    }
});
