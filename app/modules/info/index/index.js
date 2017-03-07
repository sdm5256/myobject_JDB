'use strict';

angular.module( 'myApp' )

.controller( 'InfoCtrl', function( $scope, $rootScope, _http, $location, $uibModal, Upload, $helper, $company) {
	$helper.resetScrollTop();

	// 初始化
	$scope.init = function() {
		$company.getCompanyInfo(true).then(function( data ) {
			var newData =  angular.copy( data );
			var ext = angular.copy( data.ext );
			var bankinfo = angular.copy( data.bankinfo );
			var companyinfo = angular.copy( data.companyinfo );
			delete newData.ext;
			delete newData.bankinfo;
			angular.extend( newData, ext, bankinfo, companyinfo );
			$scope.data = newData;
			$scope.bankInfoError = false;
            $scope.newVerifyStatus = $scope.data.companyinfo.verify_status;
			/* 重置证件审核认证状态需要的变量 */
			$scope.dataUrl = ''; // 按钮的路由地址
			$scope.titleContent = ''; // 是否认证的文案标题
			$scope.btnHideSwitch = true; // 按钮是否显示的开关
			$scope.btnContent = '';  // 按钮文案
			$scope.verifySuccess = false; // 按钮成功状态
			$scope.btnFailureSwitch = false; // 按钮失败状态
			$scope.btnTriesLimit = false; // 按钮错误上限的禁用态
            $scope.isShowBqpBtn = true; // 控制是否显示认证进度条
            $scope.hideUpdateBtn = false; // 该变量控制审核中或者失败的时候 企业资料修改按钮 是否显示
			$scope.certificateContent = $scope.data.certificate.certificate_content; // 获取serve返回文案
			$scope.data.bank_card_no = $scope.data.plan_company_bank_card;

			$scope.dataFull(); // 判断企业资料完成度到哪个部分
            $scope.isShowBqp(); // 判断是否显示认证进度
            $scope.certificateStatusStyle( $scope.data );
            $scope.getOperNum($scope.data);
			$scope.infoDataInformation( $scope.data ); // 获取认证状态
			// 判断银联号状态  更新文案
			if ( bankinfo.audit_status == false ) {
				$scope.bankInfoError = true;
			} else {
				$scope.bankInfoError = false;
			};
			$scope.infoCertificateStatus = data.companyinfo.certificate_status;
		});
	};

    // 获取操作员数量
    $scope.getOperNum = function(data) {
        var compantData = data.companyinfo;
        if( compantData.operatorNum > 0 ) {
            $scope.showSetBtn = true;
        } else {
            $scope.showSetBtn = false;
        }
    };
    
    // 控制认证流程是否显示
    $scope.isShowBqp = function() {
        if ( $scope.data.company_progress >= 4 ) {
            $scope.isShowBqpBtn = false;
        }
    };

	// 判断企业资料完成度到哪个部分
	$scope.dataFull = function() {
		$scope.levelOne = false;
		$scope.	levelTwo = false;
		$scope.	levelThree = false;
		$scope.	levelFour = false;
		var data = $scope.data.companyinfo;
		if ( data.company_progress == 1 ) {
			$scope. levelOne = true;
		}
		if ( data.company_progress == 2 ) {
			$scope.	levelTwo = true;
		}
		if ( data.company_progress == 3 ) {
			$scope.	levelThree = true;
		}
		if ( data.company_progress == 4 ) {
			$scope.	levelFour = true;
		}
	};

    // 控制认证状态样式
    $scope.certificateStatusStyle = function( data ) {
        var dataStatus = data.certificate.certificate_status;
        if ( dataStatus == 2 || dataStatus == 3 || dataStatus == 5 || dataStatus == 6 ) {
            $scope.addBorder = true;
        } else {
            $scope.deleteBorder = true;
        }
    };

	// 企业认证审核状态
	$scope.infoDataInformation = function( data ) {
		var dataStatus = data.certificate.certificate_status;
    if ( data.certificate.legal ) {
      var dataErrorNum = data.certificate.legal.legal_info_error_num;
    };

		// 未添加
		if ( dataStatus == 0 ) {
			$scope.btnContent = '提交证件';
			$scope.titleContent = '未审核';
            $scope.dataUrl = '#/audit';
		};

		// 待审核
		if ( dataStatus == 1 ) {
			$scope.btnContent = '查看';
			$scope.titleContent = '待审核';
			$scope.dataUrl = '#/audit';
		};

		// 审核中
		if ( dataStatus == 2 ) {
            $scope.hideUpdateBtn = true; 
			$scope.btnContent = '查看';
			$scope.titleContent = '审核中';
			$scope.dataUrl = '#/audit';
			$scope.btnHideSwitch = false;
		};

		// 审核成功
		if ( dataStatus == 4 ) {
			$scope.btnContent = '查看';
			$scope.dataUrl = '#/audit';
			$scope.titleContent = '审核通过';
			$scope.verifySuccess = true;
		};

		// 拟修改
		if ( dataStatus == 5 ) {
			$scope.btnContent = '查看';
			$scope.dataUrl = '#/audit';
			$scope.titleContent = '拟修改';
		};

		// 变更信息申请表错误
		if ( dataStatus == 8 ) {
			$scope.btnContent = '修改';
			$scope.dataUrl = '#/change-request';
			$scope.titleContent = '未通过';
			$scope.btnFailureSwitch = true;
		}

		// 审核失败  和 拟改为审核失败
		if ( dataStatus == 3  || dataStatus == 6 ) {
            $scope.hideUpdateBtn = true;
			$scope.btnContent = '修改';
			$scope.dataUrl = '#/audit';
			$scope.titleContent = '未通过';
			$scope.btnFailureSwitch = true;
			if ( dataErrorNum == 3 ) {
				$scope.btnFailureSwitch = false;
				$scope.btnTriesLimit = true;
				$scope.dataUrl = '';
			}
		}
	};

    $scope.goToRecharge = function() {
        $location.url( '/how2-recharge' );
    };

    $scope.modify = function( label, attr, cantModify, isBankInfo, isBankName ) {
        if ( cantModify ) {
          return;
        }

        var url;

        if ( isBankInfo ) {
          url = '/user/updatebankinfo';
        }

        if ( attr == 'verifyCodes' ) {
          url = '/company/verify';
        }

        var modalInstance = $uibModal.open( {
          animation: false,
          templateUrl: 'modifyModal.html',
          controller: 'modifyModalCtrl',
          size: 'modify-info-size',
          resolve: {
            modifyData: function() {
              return {
                label: label,
                attr: attr,
                data: $scope.data,
                url: url,
                isBankName: isBankName,
				init: $scope.init,
                authStatus: $scope.authStatus
              };
            }
          }
        } );

        modalInstance.result.then( function() {
          if ( $scope.data.plan_company_name == $scope.data.company_name ) {
            $scope.data.plan_company_name = '';
          }

          if ( $scope.data.bank_card_no == $scope.data.company_bank_card ) {
            $scope.data.plan_company_bank_card = '';
          } else {
            $scope.data.plan_company_bank_card = $scope.data.bank_card_no;
          }

          // $scope.userData.company_abbr_name = $scope.data.company_abbr_name;
        }, function() {

        } );
    };

    $scope.modifyLogo = function() {

      $uibModal.open( {
        animation: false,
        templateUrl: 'modifyLogoModal.html',
        controller: 'modifyLogoModalCtrl',
        size: 'modify-logo-size',
        resolve: {
          modifyData: function() {
            return {
              data: $scope.data
            };
          }
        }
      } );
    };

    $scope.authStatus = function( dialogType ) {
        $uibModal.open( {
            animation: false,
            templateUrl: 'AuthStatus.html',
            controller: 'AuthStatusCtrl',
            size: 'modify-info-size',
            resolve: {
              modifyData: function() {
                return {
                  data: $scope.data,
                  dialogType: dialogType,
				          goToRecharge: $scope.goToRecharge,
                  init: $scope.init
                };
              }
            }
        } );
    };

    $scope.modifyBankInfo = function() {
        if ( !$scope.data.plan_company_name ) {
        var modalInstance = $uibModal.open( {
          animation: false,
          template: '<div class="modal-header"><h3 class="modal-title">银行账号信息</h3></div><div class="modal-body" ng-click="dialogClick()"><div model template-url="modules/info/bank/bank.html" controller="bankCtrl"></div></div>',
          controller: 'modifyBankInfoModalCtrlNew',
          size: 'modify-bank-info-size',
          resolve: {
            modifyData: function() {
              return {
                data: $scope.data
              };
            }
          }
        } );

        modalInstance.result.then( function() {
			$company.getCompanyInfo(true).then(function( data ) {
				$rootScope.updateTerSwitch = true;
				var newData =  angular.copy( data );
				var ext = angular.copy( data.ext );
				var bankinfo = angular.copy( data.bankinfo );
				var companyinfo = angular.copy( data.companyinfo );
				delete newData.ext;
				delete newData.bankinfo;
				angular.extend( newData, ext, bankinfo, companyinfo );
				$scope.data = newData;
				$scope.data.bank_card_no = $scope.data.plan_company_bank_card;
          });
        }, function() {

        } );
      }
    };

    $scope.receiveMoney = function() {
      _http( {
        url: '/company/remit',
        method: 'POST'
      } )
      .then( function( res ) {
        if ( res.data.error.returnCode == '0' ) {
			   $scope.init();
        } else {

            $rootScope.globalError( res.data.error.returnMessage );
        }
      }, function() {
        $rootScope.globalError( '异常错误' );
      } );
    };

    $scope.upload = function( file, attr ) {

      if ( !file ) {
        return;
      }

      var imageType = /image.*png|image.*jpeg$/;

      $scope.uploadError = '';

      if ( !file.type.match( imageType ) ) {
        $rootScope.globalError( '图片格式必须为：jpeg、png' );
        return;
      }

      if ( file.size > 2 * 1024 * 1024 ) {
        $rootScope.globalError( '图片不大于2M' );
        return;
      }

      Upload.upload( {
        url: '/upload/post',
        data: {
          file: file,
		  token: localStorage.getItem( 'loginToken' ),
		  companyID: localStorage.getItem( 'loginCompanyID' ),
		  type: 2
        }
      } ).
        then( function( resp ) {
          var res = resp.data;

          if ( res.error.returnCode == '0' ) {

            var imgSrc = res.data.basePath + res.data.file;
            var data = {};

            data.company_id = $scope.data.company_id;
            data[ attr ] = imgSrc;

            _http( {
              url: '/user/updatecompanyinfo',
              data: data,
              method: 'POST'
            } ).then( function( res ) {
              if ( res.data.error.returnCode == '0' ) {
                $scope.data[ attr ] = imgSrc;
              } else {
                $rootScope.globalError( res.data.error.returnMessage );
              }
            }, function() {
              $rootScope.globalError( '异常错误！' );
            } );

          } else {
            $rootScope.globalError( res.error.returnMessage );
          }

        }, function() {
          $rootScope.globalError( '异常错误！' );
        } );
    };

    $scope.removeImg = function( attr ) {
      var data = {};
      data.company_id = $scope.data.company_id;
      data[ attr ] = '';

      _http( {
        url: '/user/updatecompanyinfo',
        data: data,
        method: 'POST'
      } ).then( function( res ) {
        if ( res.data.error.returnCode == '0' ) {
          $scope.data[ attr ] = '';
        } else {
          $rootScope.globalError( res.data.error.returnMessage );
        }
      }, function() {
        $rootScope.globalError( '异常错误！' );
      } );
    };

    $scope.aaa = function() {
        !$rootScope.updateTerSwitch ? $scope.authStatus( 'reVerify' ) : $scope.receiveMoney();
    };
}  )


// 通用模态窗
angular.module( 'myApp' ).controller( 'modifyModalCtrl', [ '$rootScope', '$scope', '$uibModalInstance', '_http', 'modifyData',  '$timeout', function( $rootScope, $scope, $uibModalInstance, _http, modifyData,  $timeout ) {

  var isBankName = modifyData.isBankName;
  var oldValue = modifyData.data[ modifyData.attr ];
  $scope.loadStatus = false;
  var maxLengthMaps = {
    extension_code: 10,
    verifyCodes: 6,
    company_name: 45,
    plan_company_name: 45
  };
  var placeholderMaps = {
    extension_code: '请填写邀请码',
    verifyCodes: '请输入您收到的汇款金额'
  };

  $scope.modifyData = modifyData;

  $scope.modalClose = function() {
      $uibModalInstance.close();
  };

  //如果是营业执照注册号或统一社会信用代码就赋值
  if ( modifyData.attr == 'company_id_no' ) {
    $scope.company_id_type = modifyData.data.company_id_type;
  }
  $scope.modifiedValue = modifyData.data[ modifyData.attr ];
  $scope.maxLength = maxLengthMaps[ modifyData.attr ] || 100;
  $scope.placeholder = placeholderMaps[ modifyData.attr ] || '';


  $scope.extensionCode30003Error = '';
  $scope.extensionCode5002Error = '';
  $scope.submit = function( isValid ) {
    $scope.submitted = true;

    $scope.extensionCode30003Error = '';
    $scope.extensionCode5002Error = '';

    if ( isValid ) {
      var data = {};

      var url = '/user/updateuserinfo';

      if ( isBankName ) {
        if ( !$scope.bankId ) {
          return;
        }

        data[ 'bank_card_no' ] = modifyData.data.company_bank_card;
        data.lbnk_no = $scope.bankId;
      } else if ( modifyData.attr == 'verifyCodes' ) {

//        data.verifyCodes = $scope.modifiedValue;
        data.verifyCodes = $scope.unit + '.' + $scope.unit1 + $scope.unit2;
      } else {
        data[ modifyData.attr ] = $scope.modifiedValue;
        data[ 'lbnk_no' ] = modifyData.data.lbnk_no;
        data[ 'account_status' ] = 2;
        data[ 'company_id_type' ] = $scope.company_id_type || modifyData.data.company_id_type;
      }

      if ( modifyData.url ) {
        url = modifyData.url;
      }
      $scope.loadStatus = true;
      _http( {
        url: url,
        method: 'POST',
        data: data
      } )
        .then( function( res ) {
          if ( res.data.error.returnCode == '0' ) {
            $scope.loadStatus = false;
            if ( modifyData.attr == 'plan_company_name' || modifyData.attr == 'company_name' ) {
                $rootScope.updateTerSwitch = true;
				// 更新header企业列表
				$rootScope.$broadcast('updateCompanyList');
				// 刷新父级页面数据
                modifyData.init();
            }
            if ( modifyData.attr == 'verifyCodes' || modifyData.attr == 'company_id_no' ) {
                modifyData.init();
            }
            modifyData.data[ modifyData.attr ] = $scope.modifiedValue;
            $uibModalInstance.close();
          } else if ( res.data.error.returnCode == '1' ) {
            $scope.loadStatus = false;
            $scope.remitErrorCode = res.data.error.returnMessage;
            modifyData.verifyErrorNum = res.data.data.verifyErrorNum;
            if ( modifyData.verifyErrorNum == 0 ) {

                //输错处理，3次后，提示：您已输错3次汇款金额，已达上限。请通过向借贷宝账户充值认证！
                $uibModalInstance.close();
                modifyData.authStatus( 'verify' );
            }
          }else if(res.data.error.returnCode == '30003'){  //邀请码无效
            $scope.extensionCode30003Error = res.data.error.returnMessage;
          }else if(res.data.error.returnCode == '5002'){  //接口超时
            $scope.loadStatus = false;
            $scope.extensionCode5002Error = res.data.error.returnMessage;
            $scope.modifiedValue = '';
          }else {
            $scope.loadStatus = false;
            $rootScope.globalError( res.data.error.returnMessage );
          }
        }, function() {
          $rootScope.globalError( '异常错误！' );
        } );
    }
  };

  $scope.cancel = function() {
    $uibModalInstance.dismiss( 'cancel' );
  };

  $scope.checkData = ( function() {
    var extensionCodeRegex = /^[0-9a-zA-Z]{7,10}$/;

    // 兼容全、半角数字和全、半角小数点
//    var verifyCodesRegex = /^[\uFF10-\uFF19,\d][\.\．][\uFF10-\uFF19,\d]{2}$/;
    var verifyCodesRegex = /^[\uFF10-\uFF19,\d]$/;
    return {
        test: function( value ) {
            if ( modifyData.attr == 'extension_code' ) {
                return extensionCodeRegex.test( value );
            } else if ( modifyData.attr == 'verifyCodes' ) {
                return verifyCodesRegex.test( value );
            } else {
                return true;
            }
        }
      };
  } )();

  var timeoutcnt;
  $scope.getBanksLayer = function() {
    if ( !isBankName ) {
      return;
    }

    if ( !$scope.modifiedValue ) {
      return;
    }

    $timeout.cancel( timeoutcnt );
    timeoutcnt = $timeout( function() {
      _http( {
        url: '/public/getcmmtbkinlist',
        method: 'POST',
        data: {
          bank_name: $scope.modifiedValue
        }
      } ).
        then( function( res ) {
          if ( res.data.error.returnCode ==  '0' ) {
            $scope.showBanksLayer = true;
            $scope.banksList = res.data.data;
          } else {
            $scope.showBanksLayer = false;
            $rootScope.globalError( res.data.error.returnMessage );
          }
        }, function() {
          $scope.showBanksLayer = false;
          $rootScope.globalError( '异常错误！' );
        } );
    }, 500 );
  };

  $scope.selectBank = function( bank ) {
    if ( !isBankName ) {
      return;
    }

    $scope.modifiedValue = bank.LBNK_NM;
    $scope.bankId = bank.LBNK_NO;
    $scope.showBanksLayer = false;
    oldValue = $scope.modifiedValue;
  };

  $scope.leaveBanksLayer = function() {
    if ( !isBankName ) {
      return;
    }

    $scope.showBanksLayer = false;
    $scope.modifiedValue = oldValue;
  };
} ] );


// 银行信息模态窗
angular.module( 'myApp' ).controller( 'modifyBankInfoModalCtrlNew', [
    '$scope',
    '$uibModalInstance',function( $scope, $uibModalInstance ) {
        $scope.$uibModalInstance = $uibModalInstance;
        $scope.pageType = 'updateBank';
    }
] );

/* 自定义controller */
angular.module( 'myApp' ).controller( 'AuthStatusCtrl', [ '$scope', '$rootScope', '$uibModalInstance','$location', '_http',  '$interval', 'modifyData', function( $scope, $rootScope, $uibModalInstance, $location, _http,  $interval, modifyData ) {
    $scope.modifyData = modifyData;

    // $scope.modifiedValue  = modifyData.data[modifyData.attr];
    $rootScope.updateTerSwitch = false;
    $scope.recharge = function() {
        $uibModalInstance.close();
            modifyData.goToRecharge();
    };
    $scope.init = function() {
        $uibModalInstance.close();
        modifyData.init();
    };
    $scope.hideDialog = function() {
        $uibModalInstance.close();
    };
} ] );

