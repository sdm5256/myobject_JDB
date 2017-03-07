'use strict';

angular.module('myApp')
.controller('loginRevisionCtrl', function($window, $scope, $rootScope, _http, $helper, $location, $timeout, $interval, $uibModal ) {
    $helper.resetScrollTop();
    $rootScope.pageType = 'login';
    $scope.shadowStatus = false;  // 二维码失效遮罩层状态
    $rootScope.currentUser = {};
    $scope.data = {};

    var qrcodes = new QRCode(document.getElementById( "loginImg" ), {
        width: 200,
        height: 200
    });
	
	var getCode = null;
	var init = function() {
		$scope.getLoginCode();
		// 一分钟重新拉取一次二维码
		getCode = $interval($scope.getLoginCode, 2 * 60 * 1000);
        reSetHeight();
        $( window ).resize( function() {
            reSetHeight();
        } );
	};

    var reSetHeight = function() {
		if ($rootScope.curRoutePath != 'login') {
			$( '.main' ).height('auto');
		} else {
			var _height = $( window ).height() - $( '#header' ).height() - $( '#footer' ).height();
			$( '.main' ).height( _height );
		}
    };

	$scope.$on('$destroy', function() {
		$( '.main' ).height('auto');
	});

    // 获取登录token，生成二维码
    $scope.getLoginCode = function( param ) {
        _http( {
            url: '/user/get-qr-code',
            method: 'POST',
            data: {
                appKey: 'fb371c48e9a9b2a1174ed729ae888513',
                _just:1
            }
        } ).then( function( res ) {
            if( res.data.error.returnCode == 0 ) {
                $scope.token = res.data.data.token;
                $scope.shadowStatus = false;
                if( param ) {
                    qrcodes.clear();
                };
				mkCode($scope.token)
            } else {
				$rootScope.globalError( res.data.error.returnMessage );
            }
        }, function() {
            $rootScope.globalError( '异常错误' );
        } );
    };

    $scope.downloadTip = function() {
        $uibModal.open( {
            animation: false,
            templateUrl: 'downloadTip.html',
            controller: 'DownloadCtrl',
            size: 'download-tip',
            backdrop: 'static'
        } );
    }

    function  mkCode(token){
        var tmpObj = {};
        tmpObj.content = token;
        tmpObj.type = 'webLogin';
        $scope.qrcodeString = JSON.stringify( tmpObj );
        qrcodes.makeCode($scope.qrcodeString);
        document.getElementById('loginImg').title = '';
    }
	
    // 轮询查询二维码是否过期
    var checkQrCode = $interval(function () {
        _http( {
            url: '/user/get-qr-status',
            method: 'POST',
            data: {
                appKey: 'fb371c48e9a9b2a1174ed729ae888513',
                token: $scope.token,
                _just:1
            }
        } ).then( function( res ) {
            if ( res.data.error.returnCode == 0 ) {

				// 存储用户token
                localStorage.setItem( 'loginToken', res.data.data.loginToken );

				// 跳到首页
                $location.url( '/overview' );

            } else if( res.data.error.returnCode == 1 ) {
                $location.url( '/login' );
            } else {
                $scope.shadowStatus = true;
                $scope.getLoginCode( 'b' );
            }
        },function() {
            $rootScope.globalError( '异常错误' );
        } );
    }, 3000);

    $scope.$on('$destroy',function(){  
       $interval.cancel(checkQrCode);
       $interval.cancel(getCode);
    });

	// 初始化
	init();

})
.controller( 'DownloadCtrl', function( $scope, $uibModalInstance ) {
        $scope.tipClose = function() {
            $uibModalInstance.close();
        }
  });
