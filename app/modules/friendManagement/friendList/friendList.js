'use strict';

angular.module('myApp')
    .controller('friendListCtrl', function($scope, $q, $rootScope, _http, $uibModal,$company) {

        $scope.activeCurent = true;
        var GET_LIST_URL = '/friends/list-company-friends'; // 默认请求企业的好友列表
        var PAGE_SIZE = 9; // 每页容量
        var COMPANY_ID = localStorage.getItem('loginCompanyID') || '';

        // 请求list列表入参
        var GET_FRIEND_OBJ = {
            companyID: COMPANY_ID,
            startIndex: '',
            size: PAGE_SIZE,
            isOnlyTwoWay: '',
            query: ''
        };
        // 请求推荐企业列表入参
        var getRecommendListObj = {
            companyID: COMPANY_ID,
            pageNo: 0
        };

        // 下拉筛选配置
        var FILTER_DOWN_CONF = {
            '全部': 0,
            '关注': 1,
            '宝粉': 2
        };

        // 翻页
        $scope.PAGE_SIZE = PAGE_SIZE;
        $scope.currentPage = 1;

        $scope.prevIndexArr = ['']; // 翻页轨迹数组,第一页传空，所以赋值 ''

        $scope.friendList = []; // 企业或个人列表
        $scope.recommendList = []; // 推荐企业列表

        $scope.filterRadio = '全部';

        // 获取企业简称
        $company.getCompanyInfo().then(function(data){
            $scope.shortName = data.company_abbr_name;
        });
        
        // tab切换
        $scope.tabSwitch = function(type) {
            initFilter();
            if (type == 1) {
                // 企业
                GET_LIST_URL = '/friends/list-company-friends';
                $scope.activeCurent = true;
                $scope.isFromSearch = false;
            } else {
                // 个人
                GET_LIST_URL = '/friends/list-individual-friends';
                $scope.activeCurent = false;
            }

            $scope.getFriendList().then(getFriendListResolveCb);
        };

        // 搜索
        $scope.search = function() {
            $scope.isFromSearch = true;  // 是search请求来的数据,  现在用于显示隐藏下拉筛选,true时隐藏;
            var query = $scope.queryText;
            if(query == ''){
                return;
            }
            var obj = {
                query: query,
                isOnlyTwoWay: '',
                startIndex: ''
            };
            $scope.getFriendList(obj).then( getFriendListResolveCb );
        };

        // 下拉筛选
        $scope.$watchCollection('filterRadio', function(newValue, oldValue) {

            var isOnlyTwoWay = FILTER_DOWN_CONF[$scope.filterRadio] || '';
            var obj = {
                isOnlyTwoWay: isOnlyTwoWay,
                startIndex: ''
            };
            // 企业才有下拉筛选
            if (newValue != oldValue && $scope.activeCurent) {
                $scope.getFriendList(obj).then(getFriendListResolveCb);
            }
        });

        /**
         * 翻页
         * direction: -1 => 前一页; 1=>后一页
         * 后一页： 则翻页数组中push(lastIndex);前一页： 翻页数组中删除后两条，并且请求列表并push(lastIndex)
         */
        $scope.turnToPage = function(direction) {
            direction = +direction;
            if ($scope.currentPage + direction > $scope.totalPage || $scope.currentPage + direction < 1) {
                return;
            }
            var startIndex = '';
            $scope.currentPage += direction;

            if (direction > 0) {
                startIndex = $scope.prevIndexArr[$scope.prevIndexArr.length - 1];
            }
            if (direction < 0) {
                startIndex = $scope.prevIndexArr[$scope.currentPage - 1] || '';
                $scope.prevIndexArr.length -= 2;
            }

            var obj = {
                startIndex: startIndex
            };

            $scope.getFriendList(obj).then(function(){
                $scope.prevIndexArr.push($scope.lastIndex);
            });
        };

        /**
         * 拉取好友列表（企业或个人，根据url不同）；
         * obj：根据各个操作（eg: tab切换、search、下拉筛选分类等）传入不同obj 入参不同；
         * isPagination：区分翻页操作，因为翻页有翻页数组的处理； true: 是翻页操作；false：不是翻页操作
         */
        $scope.getFriendList = function (obj, isPagination) {
            var defer = $q.defer();
            var getFriendObj = {};
            getFriendObj = angular.extend(GET_FRIEND_OBJ, obj);

            // 空字段不传
            for (var key in getFriendObj) {
                if (getFriendObj.hasOwnProperty(key)) {
                    if (getFriendObj[key] == '' || getFriendObj[key] == undefined) {
                        delete getFriendObj[key];
                    }
                }
            }

            _http({
                url: GET_LIST_URL,
                method: 'POST',
                data: getFriendObj
            }).then(function(res) {
                res = res.data;
                if (+res.error.returnCode === 0) {

                    if($scope.activeCurent){
                        $scope.companyNum = res.data.count;
                    }else{
                        $scope.personNum = res.data.count;
                    }

                    $scope.friendList = res.data.list || [];

                    angular.forEach($scope.friendList, function(item, index){
                        item.btnLoadStatus = false;
                    });

                    $scope.totalItems = res.data.count;
                    $scope.totalPage = Math.ceil($scope.totalItems / PAGE_SIZE);

                    $scope.lastIndex = res.data.lastIndex;

                    // 不是翻页操作，则初始化页数为第一页，翻页记录数组为初始状态;
                    // 无论什么操作，都要把新请求来的lastIndex塞进数组作为翻页的下一页入参;
                    // if (!isPagination) {
                    //     $scope.currentPage = 1;
                    //     prevIndexArr = [''];
                    // }
                    // prevIndexArr.push($scope.lastIndex);
                    checkPageNum($scope.currentPage, $scope.totalPage);  // 上下翻页按钮样式控制;

                    defer.resolve(res);
                } else {
                    $rootScope.globalError(res.error.returnMessage);
                    defer.reject(res);
                }
            }, function() {
                $rootScope.globalError('异常错误');
                defer.reject();
            })
            return defer.promise;
        }

        $scope.recomendPageNo = 0;
        var recommendHasMore = 1;  // 推荐列表是否到了最后一页，1 => 是； 0 => 否；

        // 拉取推荐列表， 入参为pageNo;
        $scope.getRecommendList = function( recomendPageNo ){

            if(recommendHasMore){
                getRecommendListObj.pageNo = recomendPageNo;
            }else{
                getRecommendListObj.pageNo = 0;
            }
            _http({
                url: '/friends/recommend-company',
                method: 'POST',
                data: getRecommendListObj
            }).then(function(res) {
                res = res.data;
                if (+res.error.returnCode === 0) {
                    $scope.recommendList = res.data.list || [];
                    $scope.recomendPageNo = res.data.pageNo;
                    recommendHasMore = res.data.hasMore;
                    
                    // isFromRecommend用于区分添加关注操作，
                    // true => 更新$scope.recommendList； false => 更新$scope.friendList
                    angular.forEach($scope.recommendList, function(item, index){
                        item.isFromRecommend = true;
                        item.btnLoadStatus = false;
                        // item.followStatus = item.relation;
                    });

                } else {
                    $rootScope.globalError(res.error.returnMessage);
                }
            }, function() {
                $rootScope.globalError('异常错误');
            })
        }

        pageInit();

        function pageInit() {
            $scope.getFriendList().then(function(){
                $scope.prevIndexArr.push($scope.lastIndex);
            });
            $scope.getRecommendList();
            //  获取好友人数
            getPersonNum();
        }

        // 初始化请求条件
        function initFilter() {
            $scope.queryText = '';
            $scope.filterRadio = '全部';
            $scope.currentPage = 1;
            delete GET_FRIEND_OBJ['isOnlyTwoWay'];
            delete GET_FRIEND_OBJ['query'];
            delete GET_FRIEND_OBJ[ 'startIndex' ];
        }

        function checkPageNum(curPage, totalPage) {
            $scope.prevDisable = curPage <= 1;
            $scope.nextDisable = curPage >= totalPage;
        }

        function getFriendListResolveCb(){
            $scope.currentPage = 1;
            $scope.prevIndexArr = [''];
            $scope.prevIndexArr.push($scope.lastIndex);
        }

        function getPersonNum() {
            _http({
                url: '/friends/list-individual-friends',
                method: 'POST',
                data: {
                    companyID: COMPANY_ID,
                    startIndex: '',
                    size: PAGE_SIZE,
                    isOnlyTwoWay: '',
                    query: ''
                }
            }).then(function(res) {
                var res = res.data;
                if (+res.error.returnCode === 0) {
                    $scope.personNum = res.data.count;
                } else {
                    $rootScope.globalError(res.error.returnMessage);
                }
            }, function() {
                $rootScope.globalError('异常错误');
            })
        }
    });
