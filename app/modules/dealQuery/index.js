'use strict';

angular.module('myApp')
    .controller('DealSearchCtrl', function($scope, $rootScope, _http, dateFilter) {

        $scope.beginCalender = {};
        $scope.endCalender = {};
        $scope.today = new Date();
        $scope.beginCalender.date = getPastMonth($scope.today, -1);
        $scope.endCalender.date = $scope.today;
        $scope.status = 0;
        $scope.pageSize = 20;
        $scope.query = {};
        $scope.query.status = 0;
        $scope.showDetail = true;
        $scope.getTable = function(index) {

            if (!index) {
                index = 1;
            }

            $scope.wagePageDisabled = true;
            var sTime = handleStime(angular.copy($scope.beginCalender.date));
            var eTime = handleEtime(angular.copy($scope.endCalender.date));
            $scope.postData = {
                // sTime: $scope.beginCalender.date.getTime(),
                // eTime: $scope.endCalender.date.getTime(),
                sTime: sTime.getTime(),
                eTime: eTime.getTime(),
                type: $scope.query.status,
                size: $scope.pageSize,
                pageNo: index
            };

            if (Cookies.get('postData')) {
                $scope.postData = JSON.parse(Cookies.get('postData'));
                $scope.beginCalender.date =$scope.postData.sTime;
                $scope.endCalender.date = $scope.postData.eTime-86400000;
                $scope.smartDate = Cookies.get('smartDate');
                $scope.query.status = Cookies.get('status');
            }
            _http({
                url: '/company/search',
                method: 'POST',
                data: $scope.postData
            }).
            then(function(res) {
                if (res.data.error.returnCode == '0') {
                    $scope.stats = res.data.data.stats;
                    $scope.wageListTotal = res.data.data.stats.rows;
                    $scope.wageList = res.data.data.list;
                    $scope.wagePageDisabled = false;
                    if (Cookies.get('postData')) {
                        $scope.wagePageNo = $scope.postData.pageNo;
                        Cookies.remove('postData');
                    }
                } else {
                    if (Cookies.get('postData')) {
                        $scope.wagePageNo = $scope.postData.pageNo;
                        Cookies.remove('postData');
                    }
                    $rootScope.globalError(res.data.error.returnMessage);
                    $scope.wagePageDisabled = false;
                }
            }, function() {
                if (Cookies.get('postData')) {
                    $scope.wagePageNo = $scope.postData.pageNo;
                    Cookies.remove('postData');
                }
                $rootScope.globalError('异常错误！');
                $scope.wagePageDisabled = false;
            });
        };

        $scope.openDetail = function(item) {
            if (item.status == '成功') {
                return true;
            } else {
                return false;
            }
        }
        $scope.saveCookie = function() {
            Cookies.set('postData', $scope.postData);
        }

        function handleStime(time) {
            time = new Date(time);
            time.setHours(0);
            time.setMinutes(0);
            time.setSeconds(0);
            time.setMilliseconds(0);
            return time;
        }

        function handleEtime(time) {
            time = new Date(time);
            time.setDate(time.getDate() + 1);
            time.setHours(0);
            time.setMinutes(0);
            time.setSeconds(0);
            time.setMilliseconds(0);
            return time;
        }

        $scope.excelExport = function() {
            location.href = '/company/export' +
                '?sTime=' + $scope.beginCalender.date.getTime() +
                '&eTime=' + $scope.endCalender.date.getTime() +
                '&type=' + $scope.query.status +
                '&token=' + localStorage.getItem('loginToken') +
                '&companyID=' + localStorage.getItem('loginCompanyID');
        };


		$scope.getTable();

        $scope.openBeginCalender = function() {
            $scope.beginCalender.opened = true;
        };

        $scope.openEndCalender = function() {
            $scope.endCalender.opened = true;
        };

        $scope.getStatus = function(status) {
            $scope.wagePageNo = 1;
            $scope.query.status = status;
            Cookies.set('status', status);
            $scope.getTable();
        }

        $scope.getSmartDate = function(smartDate, offsetDate, isMonth) {
            $scope.smartDate = smartDate;
            Cookies.set('smartDate', $scope.smartDate);
            if (isMonth) {
                $scope.beginCalender.date = getPastMonth($scope.today, offsetDate);
                $scope.endCalender.date = $scope.today;
            } else {
                $scope.beginCalender.date = getPastDate($scope.today, offsetDate);
                $scope.endCalender.date = $scope.today;
            }

            $scope.getTable();
        }

        $scope.showStatus = function(status) {
            switch (status) {
                case '1':
                    return '充值';
                case '2':
                    return '借入';
                case '3':
                    return '代发工资';
                case '8':
                    return '员工报销';
            }
            return '未知类型';
        }

        function getPastMonth(date, offset) {
            if (offset > 0) {
                return null;
            }
            var year = date.getFullYear();
            var month = date.getMonth();
            var date = date.getDate();

            if (month + offset < 0) {
                year--;
                month = 12 + month + offset;
            } else {
                month = month + offset;
            }

            return new Date(year, month, date, 0, 0, 0, 0);
        }

        function getPastDate(date, offset) {
            return new Date(date.getTime() - offset * 24 * 3600 * 1000);
        }

    })
    .controller('viewDetails', function($scope, $timeout, $routeParams, $rootScope, _http) {
        //请求对应账单图片 
        $scope.detailsBtn = true;
        $scope.loading = true;
        var timer = null;
        $scope.bgcolor = true;
        $scope.type = null;
        //充值> 1   借入>2  代发工资>3  提现>4 交易服务费>5 还款>7  转入>6
        $scope.typelist = ['充值', '借入', '代发工资', '提现', '交易服务费', '转入', '还款', '员工报销','代发报酬','代发年终奖'];
        for (var i = 0; i < 10; i++) {
            if ($routeParams.order.split('&')[1] == $scope.typelist[i]) {
                $scope.type = i + 1;
            }
        }
        Cookies.set('isPostData', true);
        $scope.getdetail = function() {
            _http({
                url: '/company/getdetail',
                method: 'POST',
                data: {
                    type: $scope.type,
                    uuid: $routeParams.order.split('&')[0]
                }
            }).then(function(res) {
                if (res.data.error.returnCode == '0') {
                    $scope.loading = false;
                    $scope.imgUrl = 'data:image/jpg;base64,' + res.data.data.sealBase;
                } else {
                    $scope.detailsBtn = false;
                    $scope.loading = false;
                    $rootScope.globalError(res.data.error.returnUserMessage);
                }
            }, function() {
                $scope.detailsBtn = false;
                $scope.loading = false;
                $rootScope.globalError('异常错误！');
            });
        }
        $scope.getdetail();
        $scope.download = function() {
            $scope.loadStatus = true;
            location.href = '/company/getdetailimg' + '?&uuid=' +
                $routeParams.order.split('&')[0] + '&type=' +
                $scope.type + '&token=' +
                localStorage.getItem('loginToken') + '&companyID=' +
                localStorage.getItem('loginCompanyID');
            timer = $timeout(function() {
                $scope.loadStatus = false;
                $timeout.cancel(timer);
            }, 2000);
        }
    });
