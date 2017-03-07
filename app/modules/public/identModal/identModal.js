angular.module( 'myApp' )
    .controller( 'IdentModalCtrl', function( $scope, modalParams, $location, $uibModalInstance ) {

		$scope.modalParams = modalParams;
		
		$scope.goToIdent = function() {
			$uibModalInstance.close();
			$location.url('/info');
		};

		$scope.modalClose = function() {
			$uibModalInstance.close();
		};

});
