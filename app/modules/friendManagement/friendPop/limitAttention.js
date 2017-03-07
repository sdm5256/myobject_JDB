'use strict';
angular.module('myApp')
.controller('limitAttentionCtrl', function($scope, $uibModalInstance, $parent, $location) {
    $scope.OverNumText = $parent.OverNumText;

    $scope.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };

    $scope.$on('$locationChangeStart', function(event, newUrl, oldUrl){
        // TODO What you want on the event.
        $scope.cancel();
    });
});