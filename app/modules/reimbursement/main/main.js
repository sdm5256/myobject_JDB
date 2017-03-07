'use strict';

angular.module('myApp')
    .controller('ReimbursementMainCtrl', function($scope, $rootScope, $routeParams, $location, _http, $uibModal) {

            function renderPage() {

                return $scope.page = $routeParams.type;
            }
            $scope.goToIndex = function () {
                $location.path('/reimbursement-list');
            }
            if ($routeParams.order !== '0' && 'pay' === $routeParams.type) {
                $scope.pendingData = {
                    orderId: $routeParams.order
                }
                renderPage();
                return;
            }

            _http({
                url: '/reimburse/pending',
                method: 'POST',
                data: {
                    order: $routeParams.order === '0' ? '-1' : $routeParams.order // order = 0 新增
                }
            }).then(function(res) {
                if (res && res.data && res.data.error && 0 ===  res.data.error.returnCode) {
                    $scope.pendingData = res.data.data;
                    renderPage();
                    return;
                }
                $rootScope.globalError( res.data.error.returnUserMessage || '异常错误！' );
            }, function (error) {
                $rootScope.globalError( '异常错误！' );
            });
        }
    )
