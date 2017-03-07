'use strict';

angular.module('myApp')

.controller('addFriendCtrl', function($scope, $timeout, $rootScope, $location, _http) {
    var COMPANY_ID = localStorage.getItem('loginCompanyID');
    $scope.searchCont = '';

    $scope.search = function() {
        if ($scope.searchCont == '') {
            return;
        }
        $scope.activeCurent = true;
        $scope.friendList = [];
        _http({
            url: '/friends/add-friend-search',
            method: 'POST',
            data: {
                name: $scope.searchCont,
                companyID: COMPANY_ID,
                memberID: COMPANY_ID
            }
        }).then(function(res) {
            var res = res.data;
            if (+res.error.returnCode === 0) {
                $scope.friendList = res.data;
            } else {
                $rootScope.globalError(res.error.returnMessage);
            }
        }, function() {
            $rootScope.globalError('异常错误');
        })
    }

});
