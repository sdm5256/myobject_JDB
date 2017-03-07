'use strict';

/**
 * 注册模块
 */
angular.module( 'myApp' )
    .controller( 'BindMyCoCtrl', function( $scope, $rootScope, $location, $timeout, $interval, $uibModal,  _http, $bank, $q, $helper ) {
		$helper.resetScrollTop();
		// $rootScope.pageType = 'register';
		$scope.currentStep = 1;
		$scope.data = {};
		$scope.bankinfo = {};
		$scope.contain = false;
		$scope.data.agree = true;
		$scope.registerValid = true;//用户名验证是否被注册
		$scope.extensionCode = true;
		$scope.extensionCodeStatus = false;
		$scope.staff_numTips = false;// 员工人数显示默认图片
		$scope.checkStatus = true;
		$scope.extensionCodeError = false; //邀请码处是否有错误,有错则阻止提交(register方法)
		$scope.emptyExtensionCode = false; //是否清空邀请码 5002错误才清空
		$scope.loadStatus = false;


		//  第三步:清空数据--统一社会信用代码
		$scope.setEmpty1 = function() {
			$scope.company_id_no_1 = '';
		};
		//   第三步:清空数据--普通营业执照
		$scope.setEmpty2 = function() {
			$scope.company_id_no_2 = '';
		};

		//检索企业简称是否包含在企业名称中
		$scope.checkName = function() {
			var nameArr = new String( $scope.data.company_abbr_name ).split( '' );
			angular.forEach( nameArr, function( val, key ) {
				if ( $scope.data.company_name.indexOf( val ) == -1 ) {
					$scope.contain = true;
					return;
				} else {
					$scope.contain = false;
				}
			} );
		};

		/**
		 * 邀请码验证 可以为空，或者不为空但验证得通过
		 * 注：extensionCode默认为true，只有在验证不正确的时候才是false
		 * @returns {*}
		 */
		function verifyExtensionCode( statusNo ) {
			var verifyDefer = $q.defer();
			return _http( {
				url: '/public/verifyextensioncode',
				data: {
					extension_code: $scope.data.extension_code,
					company_name: $scope.data.company_name,
					header : 'header'
				},
				method: 'POST'
			} ).then( function( res ) {
					if ( res.data.error.returnCode == '0' ) {
						$scope.extensionCode = true;
						$scope.extensionCodeError = false;
						$scope.emptyExtensionCode = false;
						$scope.extensionCodeStatus = res.data.data.isBind; //是否disable邀请码输入框
						if ( res.data.data.code_type == 'recommend' && res.data.data.recommend_code ) {
							$scope.data.extension_code = res.data.data.recommend_code;
							//$scope.extensionCodeStatus = true;
						};
						if(statusNo != '1'&& res.data.data.code_type != '' && (res.data.data.contact_person || res.data.data.recommend_person)){
							$scope.extensionCodeStatus = true;
						}
						verifyDefer.resolve();

					} else {
						$scope.extensionCode = false;
						verifyDefer.reject( res.data.error.returnMessage );
						//请求失败  清空邀请码输入框
						//$scope.data.extension_code = '';

						if(res.data.error.returnCode == '30003') { //邀请码错误
							$scope.extensionCodeError = true;
							$scope.emptyExtensionCode = false;
							$rootScope.globalError( res.data.error.returnMessage );
						}else if(res.data.error.returnCode == '5002') { //系统错误
							$scope.extensionCodeError = false;
							$scope.emptyExtensionCode = true;
							if(statusNo != 2){
								$scope.data.extension_code = '';
								$rootScope.globalError( res.data.error.returnMessage );
							}else{
								return tipModal( res.data );
							}
						}else{
							$rootScope.globalError( res.data.error.returnMessage );
						}

					}
				},
				function( response ) { // optional
					$scope.extensionCode = false;
					$scope.extensionCodeError = true;
					$scope.emptyExtensionCode = false;
					verifyDefer.reject( '异常错误' );
					$rootScope.globalError( '异常错误' );
				} );
			return verifyDefer.promise;
		}

		$scope.registerValid = false;
		$scope.verifyRegister = function() {
			$scope.unStatus = false;
			var usernamereg = /^(\w|-){4,12}$/;
			if ( $scope.data.username ) {
				if ( !usernamereg.test( $scope.data.username ) ) {
					$scope.usernametips = true;
					return ;
				} else {
					$scope.usernametips = false;
				}

				_http( {
					url: '/user/verifyregister',
					method: 'POST',
					data: {
						username: $scope.data.username
					}
				} ).then( function( res ) {
					if ( res.data.error.returnCode == 0 ) {//验证通过——》进入登录请求
						$scope.registerValidMessage = '';
						$scope.registerValid = false;
					} else {
						$scope.registerValid = true;

						$scope.registerValidMessage = res.data.error.returnMessage;
					}
				}, function() {
					$rootScope.globalError( '异常错误' );
				} );
			} else {
				$scope.registerValid = true;
				$scope.registerValidMessage = '';
				$scope.usernametips = true;
				return;
			}
		};
		// 邀请码foucus
		$scope.ecFocus = function() {
			$scope.ecStatus = true;
		};
		// 邀请码foucus
		$scope.ecBlur = function() {
			$scope.ecStatus = false;
		};
		// 企业名称focus
		$scope.cnFocus = function() {
			$scope.cnStatus = true;

		};
		// 企业简称focus
		$scope.comsFocus = function() {
			$scope.comsStatus = true;
		};
		// 公司员工数
		$scope.sfFocus = function() {
			$scope.sfStatus = true;
		};
		//公司员工失焦
		$scope.staffBlur = function() {
			// var sfReg = /^\d+$/;
			var sfReg = /^[1-9]{1}[0-9]*/;
			if ( !$scope.data.staff_num ) {
				$scope.staff_numTips = true;
				$scope.sfStatus = false;
				return ;
			} else {
				if ( $scope.data.staff_num == '0' || Number( $scope.data.staff_num ) === 0 ) {
					$scope.staff_numTips = true;
					$scope.sfStatus = false;
					return ;
				};

				if ( !sfReg.test( $scope.data.staff_num ) ) {
					$scope.staff_numTips = true;
					$scope.sfStatus = false;

				} else {
					var fReg = /^\d+$/;
					if ( !fReg.test( $scope.data.staff_num ) ) {
						$scope.staff_numTips = true;
						$scope.sfStatus = false;
						return ;
					}
					$scope.data.staff_num = Number( $scope.data.staff_num );
					$scope.staff_numTips = false;
					$scope.sfStatus = false;
				}
			}

		};
		// 公司名称失焦检测
		$scope.companyCheck = function() {
			$scope.cnStatus = false;
			var comReg = /^(（?[\u4e00-\u9fa5]+）?){2,}$/;
			var exportReg = /合作社/;
			if ( $scope.data.company_name ) {
				if ( !comReg.test( $scope.data.company_name ) ) {

					$scope.companyNametips = true;
					$scope.extensionCodeStatus = false;
					$scope.company_name_msg = false;
					return;
				} else {
					if ( exportReg.test( $scope.data.company_name ) ) {
						$scope.company_name_msg = true;
						$scope.companyNametips = false;
						return ;
					};
					$scope.company_name_msg = false;
					$scope.companyNametips = false;
					verifyExtensionCode( 1 );
				}
			}else {
				$scope.companyNametips = true;
				$scope.extensionCodeStatus = false;
				$scope.company_name_msg = false;
				return;
			}
		};
		// 公司简称检测
		$scope.companyShortCheck = function() {
			$scope.comsStatus = false;
			var shortReg =  /^[\u4e00-\u9fa5]{2,4}$/;
			if ( $scope.data.company_abbr_name ) {
				if ( !shortReg.test( $scope.data.company_abbr_name ) ) {
					$scope.companyShortTips  = true;
					return;
				} else {
					$scope.checkName();
					$scope.companyShortTips  = false;
				}
			} else {
				$scope.companyShortTips = true;
			}
		};
		// 公司营业执照注册号检测
		$scope.opercheck = function() {
			var operReg = /(^[a-zA-Z0-9]{13}$)|(^[a-zA-Z0-9]{15}$)/g;
			if ( $scope.company_id_no_1 ) {
				if ( !operReg.test( $scope.company_id_no_1 ) ) {
					$scope.operTips  = true;
					return;
				} else {
					$scope.operTips  = false;
				}
			} else {
				$scope.operTips  = true;
				return;
			}
		};
		// 统一社会信用代码检测
		$scope.specialCheck = function() {
			var speReg = /^(\w|-){18}$/;
			if ( $scope.company_id_no_2 ) {
				if ( !speReg.test( $scope.company_id_no_2 ) ) {
					$scope.specialTips  = true;
					return;
				} else {
					$scope.specialTips  = false;
				}
			} else {
				$scope.specialTips  = true;
				return;
			}
		};

		//点击注册提示  邀请码 弹窗
		function tipModal ( data, success ) {
			var modalInstance = $uibModal.open( {
				animation: false,
				templateUrl: 'tipExtensionCodeModal.html',
				controller: 'tipExtensionCodeModalCtrl',
				size: 'confirm-extension-code',
				resolve: {
					_data: function() {
						return data;
					},
					_fun: function() {
						//返回register方法  注入到tipExtensionCodeModalCtrl中
						return register;
					}
				}
			} );
			//返回弹框promise
			return modalInstance.result;
		}

		/**
		 * 表单提交方法
		 * @param form1Valid 用户信息表单验证状态
		 * @param form3Valid 企业账户表单验证状态
		 */
		$scope.submit = function( form1Valid, form3Valid ) {
			if ( !$scope.data.agree ) {
				alert( '请选择同意协议' );
				return;
			}

			$scope.step1Submitted = true;
			var form3Defer = $q.defer();
			if ( form1Valid ) {

				verifyExtensionCode( 2 ).then( function() {//验证账户信息——》弹框点击确定按钮——》验证企业信息
					$scope.step3Submitted = true;
					$scope.staffBlur();

					if ( form3Valid ) {
						if ( $scope.staff_numTips ) {
							return ;
						}
						//证件信息确定
						if ( $scope.data.company_id_type == 1 ) {
							$scope.data.company_id_no = $scope.company_id_no_1;
						} else {
							$scope.data.company_id_no = $scope.company_id_no_2;
						}
						//返回银行服务的promise
//                            return $bank.result;
						return $bank.get();
					}
					form3Defer.reject( '企业验证未通过' );
					return form3Defer.promise;

				} ).then( function( bank ) {//验证银行信息
					if ( bank.isValid ) {//银行验证通过
						bank.checkcard( bank.bankinfo.bank_card_no ).then( function() {
							angular.extend( $scope.data, bank.bankinfo );
							if($scope.emptyExtensionCode){
								$scope.data.extension_code = '';
							}
							!$scope.extensionCodeError && register( $scope.data );
						} );
					}
				} );
			}
		};
		/**
		 * 注册方法
		 * @param data 要注册的数据（账户、企业、银行）
		 */
		function register( data ) {
			$scope.loadStatus = true;
			data.header = 'header'
			var url = '/user/registercompanyinfo';
			_http( {
				url: url,
				method: 'POST',
				data: data
			} ).then( function( res ) {
				if ( res.data.error.returnCode == '0' ) {
				   // 设置企业列表
					$scope.loadStatus = false;
					if(res.data.data.companyList){
						// 更新企业id为新注册的企业
						localStorage.setItem('loginCompanyID', res.data.data.newCompany.companyID);
						// 更新header企业列表
						$rootScope.$broadcast('updateCompanyList');
					}
					$scope.checkStatus = !$scope.checkStatus;
					$scope.companyName = res.data.data.newCompany.companyName;
					$scope.bankName = res.data.data.newCompany.bankName;
					var bankNos = res.data.data.newCompany.bankNo;
					if( bankNos ) {
						$scope.bankNo =bankNos.substr(bankNos.length-4);
					};
				} else if ( res.data.error.returnCode == '19015' ) {
					$scope.loadStatus = false;
					$rootScope.globalRegisterError && $rootScope.globalRegisterError( res.data.error.returnMessage );
				} else {
					$scope.loadStatus = false;
					$rootScope.globalError && $rootScope.globalError( res.data.error.returnMessage );
				}
			}, function() {
				$rootScope.globalError && $rootScope.globalError( '异常错误' );
			} );
		}

	} );


//点击注册提示没有邀请码 弹窗
angular.module( 'myApp' )
	.controller( 'tipExtensionCodeModalCtrl', function( $rootScope, $scope, $uibModalInstance, _data, _fun, $q ) {
        $scope.data = _data;
        $scope.register = _fun;

        //错误信息
        $scope.errorMsg = $scope.data.error.returnMessage;

        $uibModalInstance.deferResult = $q.defer();
        $scope.ok = function() {
            $uibModalInstance.deferResult.resolve( true );
            $uibModalInstance.close();
        };

        $scope.cancel = function() {
            $uibModalInstance.deferResult.reject( false );
            $uibModalInstance.dismiss( 'cancel' );
        };
    }
 );
