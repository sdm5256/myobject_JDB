angular.module('myApp')
    .directive('friendList', dirFriendList);

function dirFriendList() {
    'use strict';
    return {
        restrict: 'EA',
        templateUrl: 'directives/friendList/dirFriendList.html',
        scope: {
            list: '=',
            activecurrent: '=',
            needpage: '='
        },
        link: function(scope, element, attr) {

        },
        controller: function($scope, $rootScope, $q, _http, $uibModal) {
            $scope.parentScope = $scope.$parent;

            var COMPANY_ID = localStorage.getItem('loginCompanyID');

            // 加关注入参
            var addAttiObj = {
                companyID: COMPANY_ID,
                followID: ''
            };

            //关注状态，0 没有关注关系，1 当前企业已关注对方，2 对方已关注当前企业，3 互相关注

            $scope.addAttitude = function(item, index) {
                addAttiObj.followID = item.memberID || item.member_id;
                //var isFromRecommend = item.isFromRecommend;

                var companyName = item.companyName || item.name || item.userName;

                if (item.btnLoadStatus) {
                    return;
                }
                item.btnLoadStatus = true;

                _http({
                    url: "/friends/follow",
                    method: 'POST',
                    data: addAttiObj
                }).then(function(res) {
                    item.btnLoadStatus = false;
                    res = res.data;

                    var relationOrFollow = getRelationOrFollow(item);

                    if (+res.error.returnCode === 0) {
                        
                        updateAddedList(item, index);

                    } else {
                        var errCode = +res.error.returnCode;
                        if ( errCode === 30150 || errCode === 30151 || errCode === 30152) { // 当前企业或被关注企业关注的企业数已达上限,或企业被风控评级为2,弹窗提示
                            limitAttention(res.error.returnMessage);
                        } else{
                            $rootScope.globalError(res.error.returnMessage); 
                        }                       
                    }
                }, function() {
                    item.btnLoadStatus = false;
                    $rootScope.globalError('异常错误');
                })
            };

            // 加关注后跟新列表数据
            function updateAddedList(item,index) {
                var isFromRecommend = item.isFromRecommend;
                var relationOrFollow = getRelationOrFollow(item);

                if (isFromRecommend) { // 推荐的  加关注则更新推荐列表recommendList
                    if (+item.relation === 0) {
                        $scope.parentScope.recommendList[index].relation = 1;
                    }
                    if (+item.relation === 2) {
                        $scope.parentScope.recommendList[index].relation = 3;
                    }
                } else {
                    if (+item[relationOrFollow] === 0) {
                        $scope.parentScope.friendList[index][relationOrFollow] = 1;
                    }
                    if (+item[relationOrFollow] === 2) {
                        $scope.parentScope.friendList[index][relationOrFollow] = 3;
                    }
                }
            }

            // 取消关注\移除宝粉弹窗
            $scope.cancelAttion = function(item, type, index) {
                if (type) {
                    // 取消关注
                    var curentUrl = '/friends/unfollow';
                } else {
                    // 移除宝粉
                    var curentUrl = '/friends/remove-fan';
                }

                var uibModal = $uibModal.open({
                    animation: false,
                    templateUrl: 'modules/friendManagement/friendPop/cancelAttent.html',
                    controller: 'cancelAttentCtrl',
                    size: 'zerofriend-size',
                    resolve: {
                        $parent: function() {
                            return {
                                comepanyName: item.companyName || item.name || item.userName,
                                currentType: type
                            };
                        }
                    }
                });

                uibModal.result.then(function() {

                    _http({
                        url: curentUrl,
                        method: 'POST',
                        data: {
                            companyID: COMPANY_ID,
                            followID: item.memberID || item.member_id
                        }
                    }).then(function(res) {
                        var res = res.data;

                        var relationOrFollow = getRelationOrFollow(item);

                        if (+res.error.returnCode === 0) {
                            if (item.isFromRecommend) {
                                $scope.parentScope.getRecommendList($scope.parentScope.recomendPageNo);
                            } else {
                                updateCanceledList( item, type, index );
                            }
                        } else {
                            $rootScope.globalError(res.error.returnMessage);
                        }
                    }, function() {
                        $rootScope.globalError('异常错误');
                    })

                }, function() {});
            };

            // 取消关注\移除宝粉后跟新列表数据
            function updateCanceledList(item, type, index) {

                var relationOrFollow = getRelationOrFollow(item);
                var relationNum = +item[relationOrFollow];

                if (type) { // 取消关注
                    if ( relationNum === 1) {
                        $scope.parentScope.friendList[index][relationOrFollow] = 0;
                    }
                    if ( relationNum === 3) {
                        $scope.parentScope.friendList[index][relationOrFollow] = 2;
                    }
                } else { // 移除宝粉
                    if ( relationNum === 2) {
                        $scope.parentScope.friendList[index][relationOrFollow] = 0;
                    }
                    if ( relationNum === 3 ) {
                        $scope.parentScope.friendList[index][relationOrFollow] = 1;
                    }
                }
                if ($scope.needpage) { // 列表页面  需要拉取列表，翻页
                    var pageArr = $scope.parentScope.prevIndexArr;
                    var obj = {
                        startIndex: pageArr[pageArr.length - 2]
                    };

                    // 如果当前页只有一条数据并且当前不是第一页,则请求前一页
                    if ($scope.list.length <= 1 && $scope.parentScope.currentPage > 1) {
                        $scope.parentScope.turnToPage(-1);
                    } else {
                        $scope.parentScope.getFriendList(obj).then(function() {
                            pageArr.length -= 1;
                            pageArr.push($scope.parentScope.lastIndex);
                        });
                    }
                }
            }

            /**
             * 因两个接口返回字段不同(relation/followStatus), 在此做下处理, 统一用relationOrFollow字段
             * @param item
             * @returns {string}
             */
            function getRelationOrFollow(item) {
                var relationOrFollow = '';
                if (item.hasOwnProperty('relation')) {
                    relationOrFollow = 'relation';
                } else if (item.hasOwnProperty('followStatus')) {
                    relationOrFollow = 'followStatus';
                } else {
                    relationOrFollow = '';
                }
                return relationOrFollow;
            }

            // 详情信息弹窗
            $scope.viewDetails = function(item, type) {
                var paramet = {};
                var memberId = item.memberID || item.member_id;
                paramet.companyID = COMPANY_ID;
                if (type) {
                    var detailUrl = '/friends/get-company-info';
                    paramet.chooseCompanyId = memberId;
                } else {
                    var detailUrl = '/friends/get-person-info';
                    paramet.chooseUid = memberId;
                }

                _http({
                    url: detailUrl,
                    method: 'POST',
                    data: paramet
                }).then(function(res) {
                    var res = res.data;
                    if (+res.error.returnCode === 0) {
                        extentKey(res.data, type);
                    } else {
                        $rootScope.globalError(res.error.returnMessage);
                    }
                }, function() {
                    $rootScope.globalError('异常错误');
                })
            };

            function extentKey(data, type) {
                $scope.companyData = data;
                if (type) {
                    // 企业详情
                    $scope.companyData.avatarUrl = data.logo;
                    $scope.companyData.companyName = data.company_name;
                } else {
                    // 个人详情
                    $scope.companyData.avatarUrl = data.avatar_url;
                    $scope.companyData.userName = data.name;
                    $scope.companyData.sex = data.sex;
                    $scope.companyData.realName = data.ident;
                    $scope.companyData.face = data.face;
                    $scope.companyData.bankCard = data.bank_card;

                }
                openModal($scope.companyData, type)
            }

            function openModal(data, type) {
                $uibModal.open({
                    animation: false,
                    templateUrl: 'modules/friendManagement/friendPop/friendDetail.html',
                    controller: 'friendDetailCtrl',
                    size: 'zerofriend-size',
                    resolve: {
                        $parent: function() {
                            return {
                                item: data,
                                curentType: type
                            };
                        }
                    }
                });
            }

            // 超过关注上线弹窗
            function limitAttention(text) {
                $uibModal.open({
                    animation: false,
                    templateUrl: 'modules/friendManagement/friendPop/limitAttention.html',
                    controller: 'limitAttentionCtrl',
                    size: 'zerofriend-size',
                    resolve: {
                        $parent: function() {
                            return {
                                OverNumText: text
                            };
                        }
                    }
                })
            };

        }
    }
}
