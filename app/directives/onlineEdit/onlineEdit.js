angular.module('myApp')
    .directive('onlineEdit', function() {
        return {
            restrict: 'EA',
            scope: {
                orderId: "@orderId"
            },
            templateUrl: 'directives/onlineEdit/onlineEdit.html',
            //link: directiveLink,
            controller: function($scope, _http, $routeParams, $attrs, $compile, $rootScope, $location, $timeout, $window, amountTools) {
                // 验证金额规则
                // $window.history.back(); 
                var LOAD_MORE_SIEZE = 20;
                //$scope.orderId = $attrs.typeId;
                $scope.Type = $attrs.pageType;
                $scope.hasMore = false;
                $scope.itemList = [];
                $scope.tableHead = true;

                //$scope.orderId=$attrs.orderId;
                //  0直接发放工资  3发放劳务报酬 1优化工资+劳务报酬 2工资+年终奖
                $scope.tableInit = {
                    '0': {
                        thead: ['姓名', '手机号', '身份证号', '实发工资', '备注'],
                        tbody: ['id', 'name', 'phone', 'idcard', 'actual_amount', 'remark'],
                        length: ['', '30', '11', '18', '10', '20'],
                        url: '/wage/edit-list'
                    },
                    '1': {
                        thead: ['姓名', '手机号', '身份证号', '应发工资', '社保公积金个人部分', '备注'],
                        tbody: ['id', 'name', 'phone', 'idcard', 'should_amount', 'fund_amount', 'remark'],
                        length: ['', '30', '11', '18', '10', '10', '20'],
                        url: '/wage/edit-work-wage-list'
                    },
                    '2': {
                        thead: ['姓名', '手机号', '身份证号', '应发工资', '社保公积金个人部分', '应发全年一次性奖金', '备注'],
                        tbody: ['id', 'name', 'phone', 'idcard', 'should_amount', 'fund_amount', 'bonus_amount', 'remark'],
                        length: ['', '30', '11', '18', '10', '10', '10', '20'],
                        url: '/wage/edit-bonus-wage-list'
                    },
                    '3': {
                        thead: ['姓名', '手机号', '身份证号', '实发劳务报酬', '备注'],
                        tbody: ['id', 'name', 'phone', 'idcard', 'actual_amount', 'remark'],
                        length: ['', '30', '11', '18', '10', '20'],
                        url: '/wage/edit-work-list'
                    }
                };

                $scope.headList = $scope.tableInit[$scope.Type].thead;
                $scope.bodyList = $scope.tableInit[$scope.Type].tbody;
                var keyList = {
                    '0': {
                        key: ['name', 'phone', 'idcard', 'actual_amount'],
                        text: ['姓名', '手机号', '身份证号', '实发工资']
                    },
                    '1': {
                        key: ['name', 'phone', 'idcard', 'should_amount'],
                        text: ['姓名', '手机号', '身份证号', '应发工资']
                    },
                    '2': {
                        key: ['name', 'phone', 'idcard', 'should_amount', 'bonus_amount'],
                        text: ['姓名', '手机号', '身份证号', '应发工资', '应发全年一次性奖金']
                    },
                    '3': {
                        key: ['name', 'phone', 'idcard', 'actual_amount'],
                        text: ['姓名', '手机号', '身份证号', '实发工资']
                    }
                };

                // 失去焦点的时候  数据实时保存

                $scope.bindBlurEvent = function(event) {
                        var eventTarget = $(event.target);
                        var contentInput = eventTarget.val(); // input输入域的值
                        var indexs = eventTarget.attr('index'); // td 序号

                        // 判断是否是金额 ( 最后处理 ) 
                        var fieldName = $scope.tableInit[$scope.Type].tbody[indexs];
                        if (fieldName == 'actual_amount' || fieldName == 'should_amount' || fieldName == 'fund_amount' || fieldName == 'bonus_amount') {
                            contentInput = amountTools.formaterAmount(contentInput
                                .replace(/,|，/g, '')
                                .replace(/^(.+\..{2}).*$/, '$1')
                            );
                        };

                        if (contentInput == eventTarget.attr('data')) {

                            eventTarget.parent().html(contentInput);
                            eventTarget.remove();
                            return;
                        }

                        var ids = eventTarget.attr('id'); // id 值
                        var trIndexs = eventTarget.attr('trIndex'); // tr 行序号
                        eventTarget.parent().html(contentInput);
                        eventTarget.remove();

                        var data = {};
                        data[$scope.tableInit[$scope.Type].tbody[indexs]] = (contentInput || '').replace(/,|\.00/g, '');

                        data['order'] = $scope.orderId;
                        data['mode_type'] = $scope.Type;
                        if ($scope.itemList[trIndexs]) {
                            data['id'] = $scope.itemList[trIndexs].id || 0;
                        } else {
                            data['id'] = 0;
                        }
                        var typeName = $scope.tableInit[$scope.Type].tbody[indexs];
                        _http({
                            url: '/wage/update-single',
                            method: 'POST',
                            data: data
                        }).then(function(res) {
                            $rootScope.btnSwitch = false;
                            if (res.data.error.returnCode == 0) {

                                // 更新错误信息
                                $scope.itemList[trIndexs] = angular.extend({}, {
                                    id: '',
                                    warn_ext: {}
                                }, $scope.itemList[trIndexs]);

                                setTimeout(function() {
                                    $scope.total = res.data.data.total;
                                    $scope.itemList[trIndexs].id = res.data.data.id;
                                    $scope.itemList[trIndexs][typeName] = contentInput;
                                    $scope.itemList[trIndexs].warn_ext = res.data.data.warn_ext;
                                    $scope.$apply();

                                }, 0);

                            } else {
                                $rootScope.globalError(res.data.error.returnMessage);
                            }
                        }, function() {
                            $rootScope.globalError('异常错误');
                        });

                    }
                    //  绑定点击动作
                $scope.handleSpanClick = function(e) {

                        if (!$(e.target).find('input').length > 0) {
                            $scope.content = $(e.target).html();
                            $scope.index = $(e.target).parent().parent().index();
                            $scope.id = $(e.target).parent().parent().parent().attr('iddata');
                            $scope.trIndex = $(e.target).parent().parent().parent().index(); // tr 索引值
                            $scope.maxLength = $scope.tableInit[$scope.Type].length[$scope.index];
                            $(e.target).html('');
                            var container = $compile('<input ng-blur="bindBlurEvent($event)" trIndex="' + $scope.trIndex + '" maxLength="' + $scope.maxLength + '" id="' + $scope.id + '" index="' + $scope.index + '"   type="text" data="' + $scope.content + '"  value="' + $scope.content + '" autocomplete="off">')($scope);
                            angular.element($(e.target)).append(container).find('input').focus().val($scope.content);
                        } else {
                            return
                        }
                    }
                    // 默认表格第一个单元格获取焦点
                $scope.getFocus = function() {

                        var name = '';
                        if ($scope.itemList[0]) {
                            if ($scope.itemList[0].id > 0) {
                                name = $scope.itemList[0].name;
                            }
                        }

                        setTimeout(function() {
                            var firstTd = $(" #tableTody tr").eq(0).find('td').eq(1).find('span');
                            firstTd.html('');
                            var container = $compile('<input ng-blur="bindBlurEvent($event)" trIndex="0" maxLength="' + $scope.maxLength + '" index="1"   type="text" data="' + name + '"  value="' + name + '" autocomplete="off">')($scope);
                            firstTd.append(container).find('input').focus();
                        }, 0)
                    }
                    //  下拉加载
                $scope.throttle = function(fn, delay) {
                    var timer = null;
                    return function() {
                        var context = this,
                            args = arguments;
                        clearTimeout(timer);
                        timer = setTimeout(function() {
                            fn.apply(context, args);
                        }, delay);
                    };
                };

                $('.js-table-wrap')
                    .on('scroll', $scope.throttle(scrollHandler, 100))

                function scrollHandler(e) {

                    var $this = $(this);
                    if ($this.height() + $this.scrollTop() + 10 >= $this[0].scrollHeight) {
                        if (!$scope.hasMore) { //没有更多补空
                            setTimeout(function() {
                                $scope.itemList.length += LOAD_MORE_SIEZE;
                                $scope.$apply();
                            }, 0);
                            return
                        }
                        $scope.$apply(function() {
                            var lastItem = $scope.itemList[$scope.itemList.length - 1]
                            var id = lastItem.id;
                            var isAppend = true;
                            $scope.getWageList(id, isAppend);

                        });
                    }
                }
                // 监听上传表格成功后 跟新table数据
                $scope.$on('uploadSuccessEvent', function(event, data) {
                    $scope.getWageList('0', false);
                });
                // 点击下一步时判断表格 是否为空
                $scope.$on('notEmptyEvent', function(event, data) {

                    var notEmpty = false; // 整个表单是否为空
                    var tag = -1; // 错误行标
                    var num = 0; // 行序号
                    var isEmpty = false; // 内容是否为空
                    angular.forEach($scope.itemList, function(data, index, array) {
                        var item = data;
                        num = index;
                        if (data.id > 0) {
                            notEmpty = true;
                            angular.forEach(keyList[$scope.Type].key, function(key, index, array) {
                                if (item[key]) {
                                    if (item.warn_ext[key].notice == 1) {
                                        isEmpty = true;
                                        if (tag == -1) {
                                            tag = num;
                                        }
                                    }
                                } else {
                                    isEmpty = true;
                                    $scope.itemList[num].warn_ext[key] = {
                                        notice: 1,
                                        text: keyList[$scope.Type].text[index] + '不能为空'
                                    }
                                    if (tag == -1) {
                                            tag = num;
                                        }
                                }
                            });
                        }
                    });
                    if (!notEmpty) {
                        // $rootScope.globalError('表格不能为空');
                        scrolTable(0);
                        $scope.getFocus();
                        return;
                    } else {
                        if (isEmpty) {
                            scrolTable(tag);
                        } else {
                            $scope.$emit('nextStepEvent', 'true');
                        }
                    }
                });

                function scrolTable(index) {

                    var pageContainer = document.querySelector('.js-table-wrap');
                    document.body.scrollTop = 0;
                    document.documentElement.scrollTop = 0;
                    if (pageContainer) {
                        pageContainer.scrollTop = 37 * index;
                    }

                }
                var isloading = false;

                $scope.getWageList = function(id, isAppend) {

                    if (isloading) {
                        return
                    }
                    isloading = true;
                    if (!id) {
                        id = 0;
                    }
                    _http({
                        url: $scope.tableInit[$scope.Type].url,
                        method: 'POST',
                        data: {
                            order: $scope.orderId,
                            size: LOAD_MORE_SIEZE,
                            id: id
                        }
                    }).
                    then(function(res) {
                        isloading = false;

                        if (res.data.error.returnCode != '0') {
                            $scope.hasMore = false;
                            $rootScope.globalError(res.data.error.returnMessage);
                            return;
                        }

                        if (isAppend) {
                            Array.prototype.push.apply($scope.itemList, res.data.data.list);
                        } else {

                            $scope.itemList = [];
                            setTimeout(function() {
                                $scope.itemList = res.data.data.list;
                                if ($scope.itemList == 0 && $scope.itemList) {
                                    $rootScope.btnSwitch = true;
                                } else {
                                    $rootScope.btnSwitch = false;
                                }
                                if (res.data.data.list.length < LOAD_MORE_SIEZE) {
                                    $scope.itemList.length = LOAD_MORE_SIEZE;
                                }
                                $scope.$apply();
                                $scope.getFocus();;
                            }, 0);

                        }
                        $scope.total = res.data.data.total;
                        $scope.hasMore = res.data.data.hasMore; //是否还有更多                            

                    }, function() {
                        $scope.hasMore = false;
                        $rootScope.globalError('异常错误！');
                    });

                }

                $scope.getWageList();

            }
        }
    });
