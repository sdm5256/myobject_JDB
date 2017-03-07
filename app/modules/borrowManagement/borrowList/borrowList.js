'use strict';

angular.module('myApp')

  .controller('BorrowingManagementCtrl', function($scope, $rootScope, _http,  $location, $uibModal) {

    $scope.pageSize = 20;
    $scope.data = {};

    $scope.cleanPageDisabled = false;
    $scope.borrowedPageDisabled = false;
    $scope.borrowingPageDisabled = false;

    $scope.getBorrowClean = function(index) {

      if (!index) {
        index = 1;
      }

      $scope.cleanPageDisabled = true;

      _http({
        url: '/borrow/clean',
        method: 'POST',
        data: {
          pageNo: index,
          pageSize: 20
        }
      }).
        then(function(res) {
          var data = res.data;

          if (data.error.returnCode == '0') {
            $scope.data.borrowCleanList = data.data.products;
            //$scope.cleanListTotal = data.data.productCount;
          } else {
            $rootScope.globalError(data.error.returnMessage);
          }

          $scope.cleanPageDisabled = false;
        }, function() {
          $scope.cleanPageDisabled = false;
          $rootScope.globalError('异常错误！');
        });
    }

    $scope.getBorrowingList = function(index) {

      if (!index) {
        index = 1;
      }

      $scope.borrowingPageDisabled = true;

      _http({
        url: '/borrow/borrowing',
        method: 'POST',
        data: {
          pageNo: index,
          pageSize: 20
        }
      }).
        then(function(res) {
          var data = res.data;

          if (data.error.returnCode == '0') {
            $scope.data.borrowingList = data.data.products;
            //$scope.borrowingListTotal = data.data.productCount;
          } else {
            $rootScope.globalError(data.error.returnMessage);
          }

          $scope.borrowingPageDisabled = false;
        }, function() {
          $scope.borrowingPageDisabled = false;
          $rootScope.globalError('异常错误！');
        });
    }

    $scope.getBorrowClean();
    // $scope.getBorrowedList();
    $scope.getBorrowingList();

    $scope.confirm = function (id) {

      var modalInstance = $uibModal.open({
        animation: false,
        templateUrl: 'confirm-borrow.html',
        controller: 'ConfirmBorrowCtrl',
        size: 'borrow-confirm',
        resolve: {
          data: function () {
            return {
              productId: id
            };
          }
        }
      });

      modalInstance.result.then(function () {
        $scope.getBorrowingList(1);
      }, function () {

      });
    };

    $scope.howPay = function () {

      $uibModal.open({
        animation: false,
        templateUrl: 'how-pay.html',
        controller: 'HowPayCtrl',
        size: 'normal-modal'
      });
    };

    $scope.mouseEnter = function(index) {
      $scope.showWarn = true;
      $scope.currentFocus = index;
    };

    $scope.mouseLeave = function(index) {
      $scope.showWarn = false;
      $scope.currentFocus = index;
    };    
    // $scope.getTotalAmount = function(borrow) {
    //   var principal = Number(borrow.principal);
    //   var interest = Number(borrow.interest);
    //   return (interest ? interest : 0) + (principal ? principal : 0)
    // };

    // $scope.getWaitingAmount = function(borrow) {
    //   var totalAmount = parseInt(borrow.totalAmount, 10);
    //   var currentAmount = parseInt(borrow.currentAmount, 10);
    //   return (totalAmount ? totalAmount : 0) - (currentAmount ? currentAmount : 0)
    // }


  });

angular.module('myApp').controller('ConfirmBorrowCtrl', ['$scope', '$uibModalInstance', 'data', '_http',  '$rootScope', function ($scope, $uibModalInstance, data, _http,  $rootScope) {

  $scope.ok = function () {
    _http({
      url: '/borrow/cancel',
      method: 'POST',
      data: {
        product: data.productId
      }
    }).then(function(res) {
      if (res.data.error.returnCode == '0') {
        $uibModalInstance.close();
      } else {
        $rootScope.globalError(res.data.error.returnMessage);
      }
    }, function() {
      $rootScope.globalError('异常错误！');
    });
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
}]);

angular.module('myApp').controller('HowPayCtrl',['$scope', '$uibModalInstance', function ($scope, $uibModalInstance) {

  $scope.ok = function () {
    $uibModalInstance.close();
  };
}]);
