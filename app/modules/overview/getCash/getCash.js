'use strict';

angular.module( 'myApp' )

    .controller( 'CashCtrl', function(amountTools, $scope, $rootScope, _http, $timeout, $uibModal, $company) {

        $scope.remind = false;
        $scope.showRemind = false;
        $scope.getCashError = false;
        $scope.getCashIllegal = false;
        $scope.submitError = false;
        $scope.hasError = false;
        $rootScope.cashSuccess = false;

		$company.getCompanyInfo().then(function(data) {
            $scope.companyName = data.ext.company_name;
            $scope.bankName = data.bankinfo.company_bank_name;
            $scope.bankCard = data.bankinfo.company_bank_card;
            $scope.phone_num = data.userinfo.operator_user_phone_num;
            $scope.certificate = data.certificate;
            $scope.companyInfoData = data.companyinfo;
		});

        _http( {
            url: '/draw/get',
            method: 'POST'
        } ).
        then( function( res ) {
            if ( res.data.error.returnCode == '0' ) {
                $scope.trustBalance = res.data.data.trustBalance;
                $scope.frozen = res.data.data.frozen;
                if ( $scope.frozen > 0 ) {
                    $scope.remind = true;
                } else {
                    $scope.remind = false;
                }
                if(+$scope.trustBalance<10){
                   $scope.getCash =amountTools.formaterAmount($scope.trustBalance); 
                }
            } else {
                $rootScope.globalError( res.data.error.returnMessage );
            }
        }, function() {
            $rootScope.globalError( '异常错误！' );
        } );

        $scope.display = function() {
            $scope.showRemind = !$scope.showRemind;
        };

        var timeoutCnt;
        var cashReg = /^0(\.\d{1,2})$|^[1-9]\d*(\.\d{1,2})?$/;
        var secReg = /^(\d|\.)+$/;
        $scope.cashCheck = function() {
            $timeout.cancel( timeoutCnt );
            timeoutCnt = $timeout( function() {
                if ( Number( $scope.getCash ) <= Number( $scope.trustBalance ) && cashReg.test( $scope.getCash ) ) {
                    $scope.submitError = true;
                    if(Number( $scope.getCash ) <10){
                        $scope.submitError = false;
                    }
                } else {
                    $scope.submitError = false;
                };
            }, 500 );
        };

        // 提现 失去焦点后 显示不同的提示文案~
        $scope.blurTips = function( error ) {

            if ( Number( $scope.getCash ) > Number( $scope.trustBalance ) ) {
                $scope.getCashError = true;
            } else {
                $scope.getCashError = false;
            };

            if ( !secReg.test($scope.getCash) && $scope.getCash) {
                $scope.getCashIllegal1 = true;
            } else {
                $scope.getCashIllegal1 = false;
                if(!cashReg.test($scope.getCash)){
                    $scope.getCashIllegal2 = true;
                }else{
                    $scope.getCashIllegal2 = false;
                }

            };
            if( Number( $scope.getCash )<10){
                $scope.getCashIllegal3 = true;
            }else{
                $scope.getCashIllegal3 = false;
            }
        };

        $rootScope.open = function( size ) {
            var modalInstance = $uibModal.open( {
                animation: false,
                templateUrl: 'messageModal.html',
                controller: 'MessageModalCtrl',
                size: size,
                resolve: {
                    phoneNum: function() {
                        return {
                            phone_num: $scope.phone_num,
                            cashSuccess: $scope.cashSuccess,
                            getCash: $scope.getCash
                        };
                    }
                }
            } );

            modalInstance.result.then( function( selectedItem ) {
                $scope.selected = selectedItem;
            }, function() {

            } );
        };

        // 企业逾期限制企业提现  并tip提示
        $scope.limitExport = function() {
            $uibModal.open( {
                animation: false,
                templateUrl: 'limitExport.html',
                controller: 'limitExport',
                size: 'modify-info-size',
                resolve: {
                  modifyData: function() {
                    return {
                        data: $scope.data

                        // dialogType: dialogType,
                        // goToRecharge: $scope.goToRecharge,
                        // init: $scope.init
                    };
                  }
                }
            } );
        };


        // 支付合规二期 如果企业证件没有 或者不全  tip提示
        $scope.payLevelTwo = function(dn,dv) {
            $uibModal.open( {
                animation: false,
                templateUrl: 'payLevelTwo.html',
                controller: 'payLevelTwo',
                size: 'modify-info-size',
                resolve: {
                  modifyData: function() {
                    var ret = {};
                    ret[ dn ] = dv;
                    return ret;
                  }
                }
            } );
        };

        // 第一次提现
        $scope.getCashOne = function() {
                $scope.depositOne = true;
                $scope.payLevelTwo( 'depositOne', $scope.depositOne );
        };

       

        $scope.submit = function( vaild ) {
            if ( !vaild ) {
                return false;
            }
            _http( {
                url: '/draw/check-draw',   // 查询企业还款日及逾期后限制企业出款   0表示没有逾期 可以正常进行操作
                method: 'POST',
                dataType: 'json',
                data:{
                    type: 'draw'
                }
            } ).then( function( res ) {
                  if ( res.data.error.returnCode == '0' ) {
                        // 企业资料未添加或者不完整 弹出提示框 第一次提现
                        if ( res.data.data.firstWithoutCert == true ) {
                            $scope.getCashOne();
                        } else {
                            $rootScope.open( 'message-size' );
                        }
                  } else {
                        // 法人过期
                        if ( res.data.error.returnCode == '30054' ) {
                            $scope.idCardOverdue = true;
                            $scope.payLevelTwo( 'idCardOverdue', $scope.idCardOverdue );
                            return;
                        }
                        // 营业执照过期
                        if ( res.data.error.returnCode == '30055' ) {
                            $scope.licenseOverdue = true;
                            $scope.payLevelTwo( 'licenseOverdue', $scope.licenseOverdue );
                            return;
                        }
                        // 用户有逾期或正在逾期
                        if ( res.data.error.returnCode == '40300' ) {
                            $scope.limitExport();
                        }
                        // 企业证件资料未提交不允许第二次及以后提现
                        if ( res.data.error.returnCode == '30051' ) {
                            $scope.depositTwo = true;
                            $scope.payLevelTwo( 'depositTwo', $scope.depositTwo );
                        }
                        // 企业证件资料正在审核中不能提现
                        if ( res.data.error.returnCode == '30052' ) {
                            $scope.checkStatus = true;
                            $scope.payLevelTwo( 'checkStatus', $scope.checkStatus );
                        }
                        // 企业证件资料审核未通过不能提现
                        if ( res.data.error.returnCode == '30053' ) {
                            $scope.failureStatus = true;
                            $scope.payLevelTwo( 'failureStatus', $scope.failureStatus );
                        }
                  }
              }, function() {
                  $rootScope.globalError( '异常错误' );
              } );

        };

    }  )

    .controller( 'limitExport', [ '$scope', '$rootScope', '$uibModalInstance','$location', '_http',  '$interval', 'modifyData', function( $scope, $rootScope, $uibModalInstance, $location, _http,  $interval, modifyData ) {
      $scope.modifyData = modifyData;
      $scope.go = function() {
          $uibModalInstance.close();
      };
    } ] )

    .controller( 'payLevelTwo', [ '$scope', '$rootScope', '$uibModalInstance','$location', '_http',  '$interval', 'modifyData', function( $scope, $rootScope, $uibModalInstance, $location, _http,  $interval, modifyData ) {
        $scope.modifyData = modifyData;
        for ( var key in $scope.modifyData )
        {
            $scope.objKey = key;
        }
      // 第一次提现
      $scope.go = function() {
          $uibModalInstance.close();
      };

      $scope.goGetCash = function() {
        $uibModalInstance.close();
        $rootScope.open( 'message-size' );
      };
    } ] );

angular.module( 'myApp' ).controller( 'MessageModalCtrl', [ '$rootScope', '$scope', '$location', '$uibModalInstance', '$interval', '_http', 'phoneNum',  function( $rootScope, $scope, $location, $uibModalInstance, $interval, _http, phoneNum ) {

    $scope.count = '获取验证码';
    $scope.counting = false;
    $scope.second = 60;
    $scope.phone_num = phoneNum.phone_num;
    $scope.countDown = countDown;
    $scope.showImg = false;
    $scope.getCash = phoneNum.getCash;

    if ( !phoneNum ) {
        phoneNum = {};
    }

    addEventListener();

    var cnt;

    function countDown() {
        if ( !$scope.counting ) {
            $scope.counting = true;
            _http( {
                url:'/draw/smscode',
                method: 'POST',
                data: {
                    phone_num: $scope.phone_num
                }
            } ).then( function( res ) {
                if ( res.data.error.returnCode == '0' ) {
                    $scope.showImg = false;
                    if ( res.data.data.hasOwnProperty( 'post' ) && res.data.data.hasOwnProperty( 'img' ) ) {
                        $scope.showImg = true;
                        $scope.img = res.data.data.img;
                        $scope.post = res.data.data.post;
                        $scope.counting = false;
                    } else {
                        $scope.count = $scope.second + '秒';
                        cnt = $interval( function() {
                            $scope.second--;
                            $scope.count = $scope.second + '秒';

                            if ( $scope.second <= 0 ) {
                                $scope.counting = false;
                                $scope.count = '获取验证码';
                                $scope.second = 60;
                                $interval.cancel( cnt );
                            }
                        }, 1000 );
                    }

                } else {
                    $scope.counting = false;
                    $rootScope.globalError( res.data.error.returnMessage );
                }
            }, function() {
                $scope.counting = false;
                $rootScope.globalError( '异常错误' );
            } );
        }
    };

    $scope.modalClose = function() {
        $uibModalInstance.close();
    };

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
                countDown();
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


    $scope.ok = function () {
        if ( !$scope.verification ) {
            return;
        }
        _http({
            url: '/draw/verify',
            method: 'POST',
            data: {
                code: $scope.verification,
                phone_num: $scope.phone_num,
                getCash: $scope.getCash,
                uuidCode: $scope.post,
                verifyCode:$scope.checkCtn
            }
        } ).then( function( res ) {
            if ( res.data.error.returnCode == '0' ) {
                // 第一次提现成功     控制显示文案的字段
                if( res.data.data.firstWithoutCert == true ) {
                    $rootScope.firstGetCash = true;
                }  
                $uibModalInstance.close();
                $rootScope.cashSuccess = true;
            } else {
                $rootScope.globalError( res.data.error.returnMessage );
            }
        }, function() {
            $rootScope.globalError( '异常错误' );
        } );
    };

    $scope.cancel = function() {
        $uibModalInstance.dismiss( 'cancel' );
    };

    var leaveTime;
    var leaveSecond;

    function addEventListener() {

        document.addEventListener( 'webkitvisibilitychange', timeListener );
        document.addEventListener( 'mozvisibilitychange', timeListener );
        document.addEventListener( 'visibilitychange', timeListener );

        function timeListener() {
            if ( $scope.counting ) {
                if ( document.webkitVisibilityState == 'hidden' || document.mozVisibilityState == 'hidden' || document.visibilityState == 'hidden' ) {
                    leaveTime = new Date();
                    leaveSecond = $scope.second;
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
} ] )
;
