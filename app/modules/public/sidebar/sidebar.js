'use strict';

angular.module('myApp')

.controller('SidebarCtrl', function($scope, $rootScope, $location, $helper) {

  $rootScope.$on('switchCompany',function (event, data) {
	$rootScope.permission = data.userinfo.permission;
  });

  $scope.getClass = function (path) {
    for (var i = 0; i < path.length; i++) {
      if ($location.path() === path[i] || $location.path().match(path[i])) {
        return 'active';
      }
    }
    return '';
  };

  $scope.goTo = function(path) {
	$helper.resetScrollTop();
    $location.url(path);
  };

});
