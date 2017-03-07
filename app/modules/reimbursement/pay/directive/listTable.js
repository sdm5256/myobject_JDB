'use strict';

angular.module('myApp')
    .directive('reimbPayListTable', function () {
        return {
            restrict: 'EA',
            scope: false,
            templateUrl: 'modules/reimbursement/pay/directive/listTable.html',
            controller: [
                '$scope',
                '$rootScope',
                '$routeParams',
                '$location',
                '_http',
                
                function($scope, $rootScope, $routeParams, $location, _http) {
                    var LOAD_MORE_SIEZE = 10;
                    var LOAD_INIT_SIZE = 100;
                    $scope.isShowTip = true;

                    $scope.listMap = {}; // list to map with id as key

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
                    function updateCheckList(checked) {

                        angular.forEach($scope.listData, function (item)  {
                            item.selected = checked;
                        });
                    }
                    $scope.checkAllHandler = function () {
                        var all = $scope.isCheckedAll ? 1 : 0;
                        var data = {
                            all: all,
                            order: $scope.pendingData.orderId
                        }

                        _http({
                            url: '/reimburse/select-all',
                            method: 'POST',
                            data: data
                        })
                        .then(function (res) {
                            if (0 !== _.get(res, 'data.error.returnCode')) {
                                var msg = _.get(res, 'data.error.returnUserMessage') || '服务异常！'
                                $rootScope.globalError(msg);
                                return;
                            }
                            if (all) {
                                updateCheckList(true);
                            }
                            else {
                                updateCheckList(false);
                            }
                            $scope.updateUI();
                        }, function () {
                            $rootScope.globalError('服务异常！');
                            $scope.updateUI();
                        });
                    }
                    $scope.checkHandler = function (e, id) {
                        var sourceItemData = $scope.listMap[id];
                        var itemData = angular.copy(sourceItemData);

                        _http({
                            url: '/reimburse/update-single',
                            method: 'POST',
                            data: {
                                selected: itemData.selected ? 1 : 0,
                                id: itemData.id,
                                phone: itemData.phone,
                                amount: itemData.amount,
                                name: itemData.name,
                                remk: itemData.remk
                            }
                        })
                        .then(function (res) {
                            if (0 !== _.get(res, 'data.error.returnCode')) {
                                var msg = _.get(res, 'data.error.returnUserMessage') || '服务异常！'
                                $rootScope.globalError(msg);
                                return;
                            }
                            $scope.updateUI();
                        }, function (){
                            $rootScope.globalError( '服务异常！' );
                            $scope.updateUI();
                        });
                    }
                    $scope.updateUI = function() {
                        _http({
                            url: '/reimburse/summary',
                            method: 'POST',
                            data: {
                                order: $scope.pendingData.orderId 
                            }
                        }).then(function(res) {
                            if (0 !== _.get(res, 'data.error.returnCode')) {
                                var msg = _.get(res, 'data.error.returnUserMessage') || '服务异常！'
                                $rootScope.globalError(msg);
                                return;
                            }
                            $scope.isCheckedAll = +res.data.data.selectAll ? true : false;
                            $scope.total = res.data.data.total;
                            $scope.number = res.data.data.number;

                            if (+$scope.number > 0) {
                                $scope.canNext = true;
                            }
                            else {
                                $scope.canNext = false;
                            }
                        }, function (){
                            $rootScope.globalError( '服务异常！' );
                        });

                    }

                    $scope.updateListData = function (listData, key, val) {
                        angular.forEach(listData, function (item) {
                            if (item.selected) {
                                item[key] = val;
                            }
                        });
                    }
                    $scope.backupListData = function (listData,keys) {
                        var keys = keys || [];

                        angular.forEach(listData, function (item) {
                            angular.forEach(keys, function (key) {
                                item['__backup__'+key] = item[key];
                            });
                        })
                    }
                    $scope.restoreListData = function (listData, keys) {
                        var keys = keys || [];

                        angular.forEach(listData, function (item) {
                            angular.forEach(keys, function (key) {
                                if ('__backup__'+key in item) {
                                    item[key] = item['__backup__'+key];
                                    delete item['__backup__'+key];
                                }
                            });
                        })
                    }
                    $scope.clearBackupListData = function (listData, keys) {
                        var keys = keys || [];

                        angular.forEach(listData, function (item) {
                            angular.forEach(keys, function (key) {
                                if ('__backup__'+key in item) {
                                    delete item['__backup__'+key];
                                }
                            });
                        })
                    }
                    function updateListMap (listData) {
                        var listData = listData || [];
                        angular.forEach(listData, function (item) {
                            $scope.listMap[item.id] = item;
                        })
                    }

                    function decroterListData(listData) {
                        var listData = listData || [];
                        listData.map(function (item) {
                            if(+item.selected === 1) {
                                item.selected = true;
                            }
                            else if (+item.selected === 0) {
                                item.selected = false;
                            }
                            return item;
                        })

                        if (!_.isNil($scope.inputMoney) && $scope.inputMoney !== '') {
                            $scope.backupListData(listData, ['amount']);
                            $scope.updateListData(listData, 'amount', $scope.inputMoney * 100);
                        }

                        if (!_.isNil($scope.inputMoney) && $scope.inputRemark !== '') {
                            $scope.backupListData(listData, ['remk']);
                            $scope.updateListData(listData,'remk', $scope.inputRemark);
                        }
                    }
                    var isLoading = false;
                    $scope.loadListData = function(id, size, isAppend) {
                        if(isLoading) {
                            return;
                        }
                        isLoading = true;
                        _http({
                            url: '/reimburse/list',
                            method: 'POST',
                            data: {
                                all: 1,
                                order: $scope.pendingData.orderId,
                                id: id || 0,
                                size: size || LOAD_INIT_SIZE
                            }
                        })
                        .then(function (res) {
                            isLoading = false;
                            if (0 !== _.get(res, 'data.error.returnCode')) {
                                var msg = _.get(res, 'data.error.returnUserMessage') || '服务异常！'
                                $rootScope.globalError(msg);
                                return;
                            }
                            if (isAppend) {
                                decroterListData(res.data.data.list);
                                Array.prototype.push.apply($scope.listData, res.data.data.list);
                            }
                            else {
                                $scope.listData = res.data.data.list;
                                decroterListData($scope.listData);
                            }
                            updateListMap($scope.listData);
                            $scope.stats = res.data.data.stats;
                            $scope.hasMore = res.data.data.hasMore;
                        }, function (res) {
                            $rootScope.globalError( '服务异常！' );
                            isLoading = false;
                        });
                    }
                    $scope.loadListData();
                    $scope.updateUI();

                }
            ]
        }
    })
