/**
 * 表单公共指令
 */
angular.module("myApp")

    /**
     * 银行卡号输入的时候生成放大加空格的预览效果
     * bank-pattern: 正则属性，目前只有一种使用场景就是数字数量的验证
     * 注：两个依赖
     * 1.适用于使用ng-modle指令的场景
     * 2.父容器需要制定相对定位（control-wrap是指定了相对定位的样式）
     *   case：
     *    <div class="control-wrap">
     *       <input bank-num bank-pattern="/.{5,}/" class="form-control" name="bankCard" type="text" ng-model="bankinfo.bank_card_no" ng-pattern=/^(\d|\s)+$/
     *       placeholder="请输入银行账号" required/>
     *       <div ng-messages="bankForm.bankCard.$error">
     *            <div class="error-messages" ng-message="pattern">只能输入数字</div>
     *            <div class="error-messages" ng-show="bankForm.bankCard._invalid">银行账号最多50位/最少5位</div>
     *       </div>
     *   </div>
     */
    .directive("bankNum", function () {
        return{
            restrict: "EA",
            scope: {
                bankPattern: "@"
            },
            replace: true,
            require: '?ngModel',
            link: function($scope,ele,attrs,ngModel){
                //当前元素向上添加兄弟节点
                var $lab = angular.element('<lable class="lable"></lable>');
                ele.parent()[0].insertBefore($lab[0],ele[0]);

                //绑定焦点事件
                ele.on('focus blur',function(event){
                     $lab.toggleClass("show");
                });

                ngModel._valid = false;
                //添加事件函数更新lable
                ngModel.$viewChangeListeners = [function() {
                    var val = ngModel.$viewValue;
                    if(val){
                        $lab.html(val.replace(/\s/g,'').replace(/(\d{4})(?=\d)/g,"$1 "));
                    }else{
                        $lab.html("");
                    }
                    //正则校验
                    if(!$scope.bankPattern){
                        return;
                    }
                    try{
                        ngModel._valid = eval($scope.bankPattern).test(ngModel.$viewValue);
                        ngModel._invalid = !ngModel._valid;
                    }catch(e){
                        console.error('无效的正则：',e);
                    }
                }];
            }
        };
    })
;
