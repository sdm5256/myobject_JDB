/**
 * 小i提示组件
 */

'use strict';

angular
    .module('myApp')
    .directive('iTips', iTips);

function iTips() {
	return {
		restrict: 'EA',
		template: '<span class="icon-i-tips">' +
			'<i class="icon-i-tips-icon" ng-mouseenter="toggle()" ng-mouseleave="toggle()"></i>' +
			'<div class="i-tips-container " ng-class="{\'short\':short}" ng-show="isShowTip">{{tip}}</div>' +
		'</span>',
		scope: {
			tip: '@'
		},
		replace: true,
		link: function (scope, element, attrs) {
			scope.isShowTip = false;
			scope.tip = '';
			scope.short = false;  //用于控制tip样式
			scope.toggle = function () {
				scope.tip = attrs.tip;
				scope.isShowTip = !scope.isShowTip;
				if(scope.tip.length <= 20){
					scope.short = true;
				}
			};
		}
	}
}

