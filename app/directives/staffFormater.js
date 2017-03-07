/**
 * Created by zenking on 16/9/5.
 */
angular.module("myApp")
    .directive("staffFormater",function () {
        return{
            restrict: "A",
            scope: "&",
            require: 'ngModel',
            link: function($scope,element,attrs,ngModel){
                element.on('blur',function () {
                    var val = ngModel.$viewValue;
                    var dotPart = '';
                    if(!val){
                        return ;
                    }
                    else{
                        var sfReg = /^[1-9]{1}[0-9]{0,}$/;
                        if(!sfReg.test(val)){
                            return ;
                        }
                        val = blurFormatter(val);
                    };
                    function blurFormatter(num) {
                        if(!angular.isString(num)){
                            num = new String(num);
                        }
                        if(Number(num) === 0 ) {
                            return num;
                        }

                        if (num.indexOf('.') != -1) {
                            var arr = num.split('.');
                            if(arr.length > 2){
                                return num;
                            }
                            num = arr[0];
                            dotPart = '.' + arr[1];
                        }
                        var array = num.split('');
                        var index = -3;
                        while (array.length + index > 0) {
                            // 从单词的最后每隔三个数字添加逗号
                            array.splice(index, 0, ',');
                            index -= 4;
                        }
                        var ipt = array.join('');
                        if(/\./.test(val)){
                            ipt = num + dotPart;
                        }
                        return ipt;
                    };
                    element[0].value =val;
                });
                element.on('focus',function () {
                    var val = ngModel.$viewValue;
                    var dotPart = '';
                    if(!val){
                        return ;
                    }else {
                        val = focusFormatter(val);
                    };
                    function focusFormatter(num) {
                        if(!angular.isString(num)){
                            num = new String(num);
                        };
                        if(Number(num) === 0) {
                            return num;
                        }
                        if (num.indexOf('.') != -1) {
                            var arr = num.split('.');
                            if(arr.length > 2){
                                return num;
                            }
                            dotPart = '.' + arr[1];
                            num = arr[0];
                        };
                        var array = num.split(',');
                        var ipt = array.join('') ;
                        if(/\./.test(val)){
                            ipt = num + dotPart;
                        }
                        return ipt;
                    }

                    element[0].value = val;
                })
            }
        };
    });