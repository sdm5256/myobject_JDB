'use strict';
angular.module('myApp')
    .controller('friendDetailCtrl', function($scope, $uibModalInstance, $parent, $location,_http) {
        
        var COMPANY_ID = localStorage.getItem('loginCompanyID');
        $scope.item = $parent.item;
        $scope.curentType = $parent.curentType;
        $scope.overdue = ['无逾期', '逾期'];
        $scope.ident = ['未认证', '已认证'];

        $scope.cancel = function() {
            $uibModalInstance.dismiss('cancel');
        };

        $scope.confirm = function() {
            $uibModalInstance.close();
        };

        $scope.$on('$locationChangeStart', function(event, newUrl, oldUrl){
            // TODO What you want on the event.
            $scope.cancel();
        });
    });
