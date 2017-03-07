/**
 * Created by zenking on 16/8/24.
 */
/**
 * 表单千分号格式化组件
 */
angular.module("myApp")
    .directive("iptFormatter",function () {
        return{
            restrict: "A",
            scope: "&",
            require: 'ngModel',
            link: function($scope,element,attrs,ngModel){
                element.on('blur',function () {
                    var val = ngModel.$viewValue;
                    var reg = /^0(\.\d{1,2})?$|^[1-9]\d*(\.\d{1,2})?$/;
                    if(!val){
                        return ;
                    }else{
                        if(!reg.test(val)){
                            return ;
                        } else{
                            val = blurFormatter(val);
                        }
                    };
                    function blurFormatter(num) {
                        var dotPart = '';
                        if(!angular.isString(num)){
                            num = new String(num);
                        }
                        if (num.indexOf('.') != -1) {
                            var arr = num.split('.');
                            if(arr.length > 2){
                                return num;
                            }
                            dotPart = '.' + arr[1];
                            num = arr[0];
                        }
                        var array = num.split('');
                        var index = -3;
                        while (array.length + index > 0) {
                            // 从单词的最后每隔三个数字添加逗号
                            array.splice(index, 0, ',');
                            index -= 4;
                        }
                        var ipt = array.join('') + dotPart;
                        if(!/\./.test(ipt)){
                            ipt = ipt + '.00'
                        }
                        return ipt;
                    };
                    element[0].value =val;
                });
                element.on('focus',function () {
                    var val = ngModel.$viewValue;
                    var reg = /^0(\.\d{1,2})?$|^[1-9]\d*(\.\d{1,2})?$/;
                    if(!val){
                        return ;
                    }else {
                        if(!reg.test(val)){
                            return ;
                        } else{
                            val = focusFormatter(val);
                        }
                    };
                    function focusFormatter(num) {
                        var dotPart = '';
                        if(!angular.isString(num)){
                            num = new String(num);
                        };
                        if (num.indexOf('.') != -1) {
                            var arr = num.split('.');
                            if(arr.length > 2){
                                return num;
                            }
                            dotPart = '.' + arr[1];
                            num = arr[0];
                        };
                        var array = num.split(',');
                        var ipt = array.join('') + dotPart;
                        return ipt;
                    }

                    element[0].value = val;
                })
            }
        };
    });