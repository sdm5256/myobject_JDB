'use strict';

myApp.factory('amountTools', ['_http',  '$location', '$rootScope', function(_http,  $location, $rootScope) {
    var amountTools = {};
	amountTools.formaterAmount = function(num) {
		if (num === 0) {
			num = '0';
		}

        if( !num ){
            return ;
        }

		var zeroPrefixRegex = /^\s*0([^.])/;
		if (zeroPrefixRegex.test(num)) {
			num = num.replace(zeroPrefixRegex, '$1');
		}

        var decimalPart = '';
        var exp = '';
        var  cross = '';
        if(!angular.isString(num)){
            num = new String(num);
        }
        if(num.indexOf('-')!= -1){
            num = num.split('-')[1]
            exp = '-';
        }
        if(num.indexOf('+')!= -1){
            num = num.split('+')[1]
            cross = '+';
        }
        if (num.indexOf('.') != -1) {
            decimalPart = '.' + num.split('.')[1];
            if (num.split('.')[1].length === 1) {
                decimalPart = '.' + num.split('.')[1] + '0';
            }
            num = parseInt(num.split('.')[0]);
        }
        var array = num.toString().split('');
        var index = -3;
        while (array.length + index > 0) {
            // 从单词的最后每隔三个数字添加逗号
            array.splice(index, 0, ',');
            index -= 4;
        }
        var ipt = array.join('') + decimalPart;
        if(!/\./.test(ipt)){
           ipt = ipt + '.00'
        }
        if(exp){
            ipt = exp + ipt;
        };
        if(cross){
            ipt = cross + ipt;
        };
        return ipt;
	};
    return amountTools;
}]);
