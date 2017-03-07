/**
 * Created by zenking on 16/8/23.
 */
angular.module("myApp").filter("amountFormater",function(amountTools){
    return function (num) {
		return amountTools.formaterAmount(num);
    };
});
