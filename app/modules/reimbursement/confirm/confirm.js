'use strict';

angular.module('myApp')
    .directive('reimbConfirm', function () {
        return {
            restrict: 'EA',
            scope: true, templateUrl: 'modules/reimbursement/confirm/confirm.html', controller: 
				function($scope, $rootScope, $routeParams, $location, _http,  $timeout, $uibModal) {
                    var LOAD_INIT_SIZE = 100;
                    var LOAD_MORE_SIEZE = 10;

                    var STATUS_NO_START = 0; // 未开始
                    var STATUS_MOVING = 1  // 迁移中
                    var STATUS_PROCESSING = 2; // 处理中
                    var STATUS_FINISH = 3; //已完成 
                    var STATUS_FAILURE = 4; //失败


                    // 报销支付状态 支付状态 0未支付,1已发送,2支付成功,3支付失败,4进行中,5余额不足,6已失效,7已删除
                    var QUEURY_WARN_STATUS = [3, 4, 5, 6, 7];

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
                    var params = {
                        token: localStorage.getItem('loginToken'),
                        companyID: localStorage.getItem('loginCompanyID'),
                        order: $routeParams.order,
                        status: $scope.pendingData.status
                    }
                    $scope.Url = {
                        exportExcel: '/reimburse/export-excel?' + $.param(params)
                    }

                    if (STATUS_MOVING === +$scope.pendingData.status
                        || STATUS_PROCESSING === +$scope.pendingData.status
                        || STATUS_FINISH === +$scope.pendingData.status) {

                            $scope.showStatusCol = true;
                        }

                    if (STATUS_FINISH === +$scope.pendingData.status) {
                        $scope.tplInfoUrl = 'modules/reimbursement/confirm/include/statusFinish.html';
                    }
                    if (STATUS_MOVING === +$scope.pendingData.status || STATUS_PROCESSING === +$scope.pendingData.status) {
                        $scope.tplInfoUrl = 'modules/reimbursement/confirm/include/statusProcessing.html';
                    }
                    function updateDownloadExcel() {
                        if (STATUS_MOVING === +$scope.pendingData.status ||
                            STATUS_PROCESSING === +$scope.pendingData.status) {
                                $scope.showDownloadExcel = false;
                                return;
                            }
                        else {
                            $scope.showDownloadExcel = true;
                        }

                        if ($scope.authInfo) {
                            if ($scope.authInfo.step === 'admin' &&
                                ($scope.authInfo.status === 'cancel' ||
                                    $scope.authInfo.status === 'outtime')) {
                                        $scope.showDownloadExcel = true;
                                        return;
                                    }

                            $scope.showDownloadExcel = false;
                        }
                    }

                    updateDownloadExcel();
                    var handleStatus = function() {
                        setInfoTpl($scope.status);
                        updateDownloadExcel();

                        // 刚发起鉴权(初始状态): status=='init'
                        // 操作人已确认成功，待管理员确认: status=='waiting'
                        // 鉴权成功: status=='success'
                        if ($scope.status ==='init' || $scope.status ==='waiting') {
                            $timeout( initAuth, 3000 );
                        }

                    };

                    var initAuth = function() {
                        var authId = $scope.pendingData.id;
                        _http({
                            url: '/auth/get-auth-status',
                            method: 'POST',
                            dataType: 'json',
                            data:{
                                authID: authId
                            }
                        }).then(function(res) {
                            if ( res.data.error.returnCode == '0' ) {
                                $scope.authInfo = res.data.data;
                                $scope.stepName = $scope.authInfo.step == 'admin' ? '管理员' : '操作员';
                                $scope.status = $scope.authInfo.status;
                                $scope.phone = $scope.authInfo.phone;
                                $scope.name = $scope.authInfo.name;
                                $scope.logo = $scope.authInfo.logo;
                                handleStatus();
                            } else {
                                $rootScope.globalError( res.data.error.returnMessage );
                            }
                        }, function() {
                            $rootScope.globalError( '异常错误！' );
                        });
                    };

                    if (+$scope.pendingData.status === STATUS_NO_START || +$scope.pendingData.status === STATUS_FAILURE) {
                        initAuth();
                    }

                    function setInfoTpl(status) {
                        if ('success' === status) {
                            window.location.reload();
                        }
                        var statuInfoTplMap = {
                            'init': 'init.html',
                            'cancel': 'cancel.html',
                            'outtime': 'outtime.html',
                            'waiting': 'waiting.html'
                        }
                        var url = statuInfoTplMap[status];
                        if(url) {
                            $scope.tplInfoUrl = 'modules/reimbursement/confirm/include/' + url;
                        }
                    }

                    $scope.getWarnStatus = function (status) {
                        return _.includes(QUEURY_WARN_STATUS, +status);
                    }
                    var isLoading = false;
                    $scope.loadListData = function(id, size, isAppend) {
                        if(isLoading) {
                            return;
                        }
                        isLoading = true;
                        var url = '/reimburse/list';
                        var params = {
                            order: $routeParams.order,
                            id: id || 0,
                            size: size || LOAD_INIT_SIZE
                        };
                        if (+$scope.pendingData.status !== STATUS_NO_START) {
                            url = '/reimburse/query';
                            params.status = $scope.pendingData.status;
                        }
                        else {
                            params.all = 0;
                        }
                        _http({
                            url: url,
                            method: 'POST',
                            data: params
                        })
                        .then(function (res) {
                            isLoading = false;
                            if (0 !== _.get(res, 'data.error.returnCode')) {
                                var msg = _.get(res, 'data.error.returnUserMessage') || '服务异常！'
                                $rootScope.globalError(msg);
                                return;
                            }
                            if (isAppend) {
                                Array.prototype.push.apply($scope.listData, res.data.data.list);
                            }
                            else {
                                $scope.listData = res.data.data.list;
                            }
                            $scope.stats = res.data.data.stats;
                            $scope.hasMore = res.data.data.hasMore;
                        }, function (res) {
                            $rootScope.globalError( '服务异常！' );
                            isLoading = false;
                        });
                    }
                    $scope.loadListData();


                    $scope.returnModifyHandler = function () {
                        _http({
                            url: '/reimburse/modify',
                            method: 'POST',
                            data: {
                                order: $routeParams.order
                            }
                        }).then(function(res) {
                            if (0 !== _.get(res, 'data.error.returnCode')) {
                                var msg = _.get(res, 'data.error.returnUserMessage') || '服务异常！'
                                $rootScope.globalError(msg);
                                return;
                            }
                            $location.url("/reimbursement-main/pay/" + $routeParams.order);
                        });
                    }
                    $('.js-table-wrap')
                        .on('scroll', $scope.throttle(scrollHandler, 100))

                    function scrollHandler (e) {
                        if (!$scope.hasMore) {

                            return;
                        }
                        var $this = $(this);
                        if ($this.height() + $this.scrollTop() + 10 >= $this[0].scrollHeight) {
                            $scope.$apply(function(){
                                var lastItem = $scope.listData[$scope.listData.length - 1]
                                var id = lastItem.id;
                                var isAppend = true;
                                $scope.loadListData(id, LOAD_MORE_SIEZE, isAppend);
                            });
                        }
                    }
                }
            
        }
    })

