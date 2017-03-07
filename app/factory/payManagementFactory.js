'use strict';

myApp.factory('payTools', ['_http',  '$location', '$rootScope', function(_http,  $location, $rootScope) {
    var payTools = {};
    var getData = function() {
        try {
            return JSON.parse(localStorage.getItem('payManagementCache')) || {};
        } catch (e) {
            return {};
        }
    };
    var setData = function(data) {
        try {
            localStorage.setItem('payManagementCache', JSON.stringify(data));
        } catch (e) {}
    };

    payTools.setCache = function(data) {
        setData(angular.extend(getData(), data));
    };

    payTools.getCache = function() {
        return getData();
    };

    payTools.queryStatus = function(params) {
        var data = getData() || {};
        params = params || {};
        return _http({
            url: '/wage/step-pending',
            method: 'POST',
            dataType: 'json',
            data: {
                order: params.order || data.order || '',
                sel_type: params.sel_type || data.sel_type
            }
        });
    };

    payTools.goToDetail = function(orderId) {
        payTools.queryStatus({
            order: orderId,
            sel_type: '0'
        }).then(function(res) {
            if (res.data.error.returnCode == '0') {
                var step = res.data.data.step;
                var modeType = res.data.data.mode_type;
                var module2step2router = {
                    "0": {
                        "20": "/payFst",
                        "410": "/payScd"
                    },
                    "1": {
                        "10": "/optimizeFst",
                        "20": "/optimizeScd",
                        "30": "/optimizeThd",
                        "410": "/optimizeFth",
                        "420": "/optimizeFth",
                        "430": "/optimizeFth"
                    },
                    "2": {
                        "10": "/optimizeFst",
                        "20": "/optimizeScd",
                        "30": "/optimizeThd",
                        "440": "/optimizeFth"
                    },
                    "3": {
                        "20": "/laborFst",
                        "450": "/laborScd"
                    }
                };

                // 工资发放完成或已失效, 跳工资发放详情落地页面
                if (step == '90' || step == '50') {
                    $location.url('/wageDetail/' + orderId);
                } else {
                    $location.url(module2step2router[modeType][step] + '/' + orderId);
                }

            } else {
                $rootScope.globalError(res.data.error.returnMessage);
            }
        }, function() {
            $rootScope.globalError('异常错误！');
        });
    };

    payTools.goToStep = function(modeType,step,orderId) {
        var module2step2router = {
            "0": {
                "20": "/payFst",
                "410": "/payScd"
            },
            "1": {
                "10": "/optimizeFst",
                "20": "/optimizeScd",
                "30": "/optimizeThd",
                "410": "/optimizeFth",
                "420": "/optimizeFth",
                "430": "/optimizeFth"
            },
            "2": {
                "10": "/optimizeFst",
                "20": "/optimizeScd",
                "30": "/optimizeThd",
                "440": "/optimizeFth"
            },
            "3": {
                "20": "/laborFst",
                "450": "/laborScd"
            }
        };
        $location.url(module2step2router[modeType][step] + '/' + orderId);
    };

    return payTools;
}]);
