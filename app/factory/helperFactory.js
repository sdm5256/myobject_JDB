/**
 * helper工具类
 */
myApp.factory("$helper",function($uibModal, $location, _http) {

	/**
	 * 公共服务
	 */
	var helper = {
		/**
		 * 重置滚动条
		 * @param options
		 */
		resetScrollTop: function(){
			var pageContainer = document.querySelector('.page-container');
			document.body.scrollTop = 0;
			document.documentElement.scrollTop = 0;
			if (pageContainer) {
				pageContainer.scrollTop = 0;
			}
		},
		scrollBottom: function () {

			// if(scrollTop>70){
			//     return true;
			// }else{
			//     return false;
			// } ;
		},
		openIdentModal: function (identText) {
			$uibModal.open( {
				animation: false,
				templateUrl: 'modules/public/identModal/identModal.html',
				controller: 'IdentModalCtrl',
				size: 'normal-modal',
				backdrop: 'static',
				resolve: {
					modalParams: function() {
						return {
							identText: identText
						};
					}
				}
			});
		},
		payToEmployee: function() {
			_http({
			  url: '/company/get-ident-status',
			  method: 'POST'
			}).then(function(res) {
			  if (res.data.error.returnCode == '0') {
				if( res.data.data.identStatus == 1 ) {
					$location.url('/reimbursement-main/pay/0');
				} else {
					helper.openIdentModal('向员工付款');
				}
			  } else {
				$rootScope.globalError(res.data.error.returnUserMessage);
			  }
			}, function() {
			  $rootScope.globalError('异常错误！');
			});
		}
	};

	return helper;

});

