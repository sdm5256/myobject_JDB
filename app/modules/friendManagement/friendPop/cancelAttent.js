'use strict';
angular.module('myApp')
.controller('cancelAttentCtrl', function($scope, $uibModalInstance, $parent, $location) {
    $scope.componyName = $parent.comepanyName;
	$scope.currentType = $parent.currentType;
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