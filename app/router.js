
'use strict';

angular.module('myApp').config(function($routeProvider) {

	$routeProvider
	.when('/pay-management', {
		templateUrl: 'modules/payManagement/index/index.html',
		controller: 'PayManagementCtrl'
	})
	.when('/add-operator', {
        templateUrl: 'modules/info/addOperator/add.html',
        controller: 'addOperatorCtrl'
    })
	.when('/bindcompany', {
        templateUrl: 'modules/overview/bindcompany/bindcompany.html',
        controller: 'bindcompanyCtrl'
    })
	.when( '/bindmyco', {
		templateUrl: 'modules/overview/bindMyCo/bindMyCo.html',
		controller: 'BindMyCoCtrl'
	})
	.when( '/borrow', {
        templateUrl: 'modules/borrowManagement/borrow/borrow.html',
        controller: 'BorrowCtrl'
    })
	.when('/borrowing-management', {
		templateUrl: 'modules/borrowManagement/borrowList/borrowList.html',
		controller: 'BorrowingManagementCtrl'
    })
	.when('/deal-search', {
		templateUrl: 'modules/dealQuery/index.html',
		controller: 'DealSearchCtrl'
	})
	.when('/details/:order', {
		templateUrl: 'modules/dealQuery/details.html',
		controller: 'viewDetails'
	})
	.when('/employee-delete', {
		templateUrl: 'modules/employeeManagement/employeeDelete/delete.html',
		controller: 'employeeDeleteCtrl'
	})
	.when( '/employee-list', {
		templateUrl: 'modules/employeeManagement/employeeList/list.html',
		controller: 'employeeListCtrl'
	})
	.when('/employee-management', {
		templateUrl: 'modules/employeeManagement/index/index.html',
		controller: 'EmployeeManagementCtrl'
	})
	.when('/audit', {
		templateUrl: 'modules/info/audit/audit.html',
		controller: 'AuditCtrl'
	})
	.when( '/change-request', {
		templateUrl: 'modules/info/changeRequest/changeRequest.html',
		controller: 'changeRequestCtrl'
	})
	.when( '/info', {
		templateUrl: 'modules/info/index/index.html',
		controller: 'InfoCtrl'
	})
	.when('/login', {
		templateUrl: 'modules/login/login.html',
		controller: 'loginRevisionCtrl'
	})
	.when('/operator-list', {
		templateUrl: 'modules/info/operatorList/list.html',
		controller: 'operatorListCtrl'
	})
	.when( '/get-cash', {
		templateUrl: 'modules/overview/getCash/getCash.html',
		controller: 'CashCtrl'
	})
	.when( '/how2-recharge', {
		templateUrl: 'modules/overview/recharge/recharge.html',
		controller: 'How2rechargeCtrl'
	})
	.when('/overview', {
		templateUrl: 'modules/overview/index/index.html',
		controller: 'OverviewCtrl'
    })
	.when( '/pay-management', {
		templateUrl: 'modules/payManagement/index/index.html',
		controller: 'PayManagementCtrl'
	})
	.when( '/invalidRecords/:orderId?', {
		templateUrl: 'modules/payManagement/invalidRecords/invalidRecords.html',
		controller: 'InvalidRecordsCtrl'
    })
	.when( '/laborFst/:orderId?', {
		templateUrl: 'modules/payManagement/laborFst/laborFst.html',
		controller: 'LaborFstCtrl'
    })
	.when( '/laborScd/:orderId?', {
		templateUrl: 'modules/payManagement/laborScd/laborScd.html',
		controller: 'LaborScdCtrl'
	})
	.when('/optimizeFst/:orderId?', {
		templateUrl: 'modules/payManagement/optimizeFst/optimizeFst.html',
		controller: 'optimizeFstCtrl'
	})
	.when('/optimizeFth/:orderId?', {
		templateUrl: 'modules/payManagement/optimizeFth/optimizeFth.html',
		controller: 'optimizeFthCtrl'
	})
	.when('/optimizeScd/:orderId?', {
		templateUrl: 'modules/payManagement/optimizeScd/optimizeScd.html',
		controller: 'optimizeScdCtrl'
	})
	.when('/ptimizeTable/:fixType', {
        templateUrl: 'modules/payManagement/optimizeThd/optimizeTable.html',
        controller: 'optimizeTable'
    })
	.when('/optimizeThd/:orderId?', {
		templateUrl: 'modules/payManagement/optimizeThd/optimizeThd.html',
		controller: 'optimizeThdCtrl'
	})
	.when( '/payFst/:orderId?', {
		templateUrl: 'modules/payManagement/payFst/payFst.html',
		controller: 'PayFstCtrl'
	})
	.when( '/payScd/:orderId?', {
		templateUrl: 'modules/payManagement/payScd/payScd.html',
		controller: 'PayScdCtrl'
	})
	.when( '/wageDetail/:orderId?', {
		templateUrl: 'modules/payManagement/wageDetail/wageDetail.html',
		controller: 'WageDetailCtrl'
	})
	.when( '/reimbursement-list', {
		templateUrl: 'modules/reimbursement/list/list.html',
		controller: 'ReimbursementListCtrl'
	})
	.when( '/reimbursement-invalid', {
		templateUrl: 'modules/reimbursement/list/invalid.html',
		controller: 'ReimbursementListCtrl'
	})
	.when( '/reimbursement-main/:type/:order', {
		templateUrl: 'modules/reimbursement/main/main.html',
		controller: 'ReimbursementMainCtrl'
	}).when( '/friendList',{
		templateUrl: 'modules/friendManagement/friendList/friendList.html',
		controller: 'friendListCtrl'
	}).when( '/addFriend',{
		templateUrl: 'modules/friendManagement/addFriend/addFriend.html',
		controller: 'addFriendCtrl'
	});


	$routeProvider.otherwise({
		redirectTo: '/login'
	});

});

