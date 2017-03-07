angular.module( 'myApp' )
    .controller( 'ComfirmModalCtrl', [ '$scope', '$uibModalInstance', 'modalParams', function( $scope, $uibModalInstance, modalParams) {

		$scope.modalParams = modalParams;
		
		$scope.ok = function() {
			$uibModalInstance.ok && $uibModalInstance.ok();
			$uibModalInstance.close();
		};

		$scope.cancel = function() {
			$uibModalInstance.dismiss && $uibModalInstance.dismiss();
			$uibModalInstance.close();
		};

    } ] );
