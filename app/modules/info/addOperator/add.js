'use strict';

angular.module('myApp')

    .controller('addOperatorCtrl', ['$scope', '$rootScope', '_http', '$location',  '$interval', function($scope, $rootScope, _http, $location,  $interval) {
    	$scope.btnText = '获取验证码';
        $scope.counting = false;
        $scope.second = 60;
        $scope.showCode = false;
        // $scope.getCodeBtn = false;
        var cnt;
        // 初始化方法
        $scope.init = function(){
            if( $rootScope.role == 2 ) {
                $location.url('/overview');
            };
        }
        $scope.init();

    	// 检查手机号是否注册了借贷宝

        $scope.checkPhone = function() {
            _http( {
                url: '/user/verifymobilenumber',
                method: 'POST',
                data: {
                    phone_num: $scope.phoneText
                }
            } ).then( function( res ) {
                if ( res.data.error.returnCode == '0' ) {
                    $scope.showCode = true;
                } else {
                    $scope.showCode = false;
                    $rootScope.globalError( res.data.error.returnUserMessage );
                }
            }, function() {
                $rootScope.globalError( '异常错误' );
            } );
        }
    	$scope.getCode = function() {
    		if( !$scope.phoneText ) {
    			return;
    		};
            if( !$scope.showCode ){
                return;
            };
            if( $scope.getCodeStatus ) {
                return;
            }
    		_http( {
                url: '/public/sendphonenum',
                method: 'POST',
                data: {
                    phone_num: $scope.phoneText
                }
            } ).then( function( res ) {
                if ( res.data.error.returnCode == '0' ) {
                    $scope.getCodeStatus = true;
                    $scope.btnText = $scope.second + '秒';
                    cnt = $interval( function() {
                        $scope.second--;
                        $scope.btnText = $scope.second + '秒';

                        if ( $scope.second <= 0 ) {
                            $scope.counting = false;
                            // $scope.getCodeBtn = false;
                            $scope.btnText = '获取验证码';
                            $scope.second = 60;
                            $scope.getCodeStatus = false;
                            $interval.cancel( cnt );
                        }
                    }, 1000 );

                } else {
                    // $scope.counting = false;
                    $scope.getCodeStatus = false;
                    $rootScope.globalError( res.data.error.returnMessage );
                }
            }, function() {
                $scope.getCodeStatus = false;
                $rootScope.globalError( '异常错误' );
            } );
    	};

        // 检查图像验证码是否正确
        $scope.imgCheck = function() {
            _http( {
                url: '/img/check',
                method: 'POST',
                data: {
                    check: $scope.checkCtn,
                    code: $scope.post
                }
            } ).then( function( res ) {
                if ( res.data.error.returnCode == '0' ) {
                    $scope.showImg = false;
                    $scope.getCode();
                } else {
                    $rootScope.cashSuccess = false;
                    $scope.img = res.data.data.img;
                    $scope.post = res.data.data.post;
                    $rootScope.globalError( res.data.error.returnUserMessage );
                }
            }, function() {
                $rootScope.globalError( '异常错误' );
            } );
        };

         function addEventListener() {

            document.addEventListener( 'webkitvisibilitychange', timeListener );
            document.addEventListener( 'mozvisibilitychange', timeListener );
            document.addEventListener( 'visibilitychange', timeListener );

            function timeListener() {
                if ( $scope.counting ) {
                    if ( document.webkitVisibilityState == 'hidden' || document.mozVisibilityState == 'hidden' || document.visibilityState == 'hidden' ) {
                        var leaveTime = new Date();
                        var leaveSecond = $scope.second;
                        $scope.count = '--秒';

                    } else {
                        var secondOffset = leaveSecond - parseInt( ( new Date() - leaveTime ) / 1000, 10 );
                        $scope.second = ( secondOffset > 0 ) ? secondOffset : 0;
                        $scope.count = $scope.second + '秒';

                    if ( $scope.second <= 0 ) {
                        $scope.count = '获取验证码';
                        $scope.counting = false;
                    }
                    }
                }
            }
        }
        addEventListener();

        

    	// 添加操作员
    	$scope.addOperator = function() {
    		_http( {
	            url: '/operator/add',
	            method: 'POST',
	            data: {
	                mobilephone: $scope.phoneText,
	                verifyCode: $scope.codeText,
                    xxxxx: $scope.checkCtn
	            }
	        } ).then( function( res ) {
	            if( res.data.error.returnCode == 0 ) {
	                $location.url( '/operator-list' );
	            } else {
                    $rootScope.globalError( res.data.error.returnUserMessage );
                }
	        }, function() {
	            $rootScope.globalError( '异常错误' );
	        } );
    	};
    }])
    
