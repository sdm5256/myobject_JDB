angular.module('myApp')
  .controller('optimizeTable', function($scope, payTools, $rootScope, $routeParams, $location, _http, $uibModal) {
    $rootScope.tableStatues = true;
    $scope.pageSize = 20;
    $scope.optimizeBe = true;
    $scope.onceBonus = true;
    $scope.labor = true;
    $scope.optimizeTable = false;
    $scope.optimizeInit = function() {
        _http({
            url: '/wage/step-pending',
            method: 'POST',
            data: {
                order: $routeParams.fixType.split('&')[0],
                sel_type: 2
            }
        }).then(function(res) {
            if (res.data.error.returnCode == '0') {
                $scope.extType = res.data.data.ext.struct_type; //0工资+劳务报酬,1工资+年终奖金
                if ($scope.extType == 0) {
                    $scope.opmzHead = true;
                    $scope.workUrl = {
                        beUrl: '/wage/fix-detail-work-be-list',
                        afUrl: '/wage/fix-detail-work-af-list'
                    }
                } else {
                    $scope.opmzHead = false;
                    $scope.workUrl = {
                        beUrl: '/wage/fix-detail-bonus-be-list',
                        afUrl: '/wage/fix-detail-bonus-af-list'
                    }
                }
                if ($routeParams.fixType.split('&')[1] == 0) { //优化前
                    $scope.optimizeBe = true;
                    $scope.labor = true;
                    $scope.onceBonus = true;
                    $scope.tableUrl = $scope.workUrl.beUrl;
                } else {
                    $scope.optimizeBe = false;
                    $scope.labor = false;
                    $scope.onceBonus = false;
                    $scope.tableUrl = $scope.workUrl.afUrl;
                }
                $scope.tableInit();
            } else {

            }
        }, function() {
            $rootScope.globalError('异常错误');
        });
    };
    $scope.optimizeInit();
    $scope.tableInit = function(index) {
        if (!index) {
            index = 1;
        }

		$scope.wagePageNo = index;

        _http({
            url: $scope.tableUrl,
            method: 'POST',
            data: {
                all_batch: $routeParams.fixType.split('&')[0],
                pageNo: index,
                size: $scope.pageSize
            }
        }).then(function(res) {
            if (res.data.error.returnCode == '0') {
                $scope.optimizeTable = true;
                $scope.totall = res.data.data.total;
                $scope.list = res.data.data.list;
                $scope.wageListTotal = $scope.totall.number;
                $scope.wagePageDisabled = false;
            } else {
                $scope.wagePageDisabled = false;
                $rootScope.globalError(res.data.error.returnMessage);
            }
        }, function() {
            $scope.wagePageDisabled = false;
            $rootScope.globalError('异常错误！');
        });
    }

})
