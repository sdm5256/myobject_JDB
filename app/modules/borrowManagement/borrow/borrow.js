'use strict';

angular.module( 'myApp' )

    .controller( 'BorrowCtrl', function( $scope, $rootScope, _http, $location, $uibModal,  Upload, $interval, $timeout, $q ) {


      var tip;//发新标提示对象
      $scope.data = {};
      $scope.data.tags = '生产经营';
      $scope.submitted = false;
      $scope.currentStep = 0;
      $scope.resultStep = 0;
      $scope.minDate = +new Date() + 1 * 24 * 60 * 60 * 1000;
      $scope.maxDate = +new Date() + 5 * 365 * 24 * 60 * 60 * 1000;
      $scope.date = new Date();
      $scope.data.friendIdListArr = [];
      $scope.data.ifCheck = [];
      $scope.data.countArr = [];
      $scope.data.tagArr = [];
      $scope.data.tagId = [];
      $scope.data.choseZero = '';
      $scope.data.allChecked = true;

      // 是否自动续标
      $scope.data.is_auto_renewal = true;
	  // 是否第一次取消自动续标
	  $scope.isFirstUncheck = true;

      $scope.amountError = false;
      $scope.imgsLimit = 0;
      $scope.checkStyle = false;
      $scope.errText = '';
      $scope.errStyle = false;
      $scope.maxLenth = '';
      $scope.checkInterestError = false;

      // 是否显示自动续标tips
      $scope.showAutoRenewalTips = false;
	  $scope.token = localStorage.getItem('loginToken');
	  $scope.companyID = localStorage.getItem('loginCompanyID');

      _http( {
        url: '/friends/getnum',
        method: 'POST'
      } ).then( function( res ) {
        if ( res.data.error.returnCode == '0' ) {
          $scope.allNum = res.data.data.num;
          $scope.friendNames = '全部员工(' + $scope.allNum + '人)';
        } else {
          $rootScope.globalError( res.data.error.returnMessage );
        }
      }, function() {
        $rootScope.globalError( '异常错误！' );
      } );

      /* 获取默认额度 */
      _http( {
        url: '/borrow/get-borrow-data',
        method: 'POST'
      } ).then( function( res ) {
        if ( res.data.error.returnCode == '0' ) {
          $scope.amountNum = res.data.data.amount;
        } else {
          $rootScope.globalError( res.data.error.returnMessage );
        }
      }, function() {
        $rootScope.globalError( '异常错误！' );
      } );

      /*获取当前企业是否选择查找交易服务费的提示信息*/
      var getremember = function() {
        _http( {
          url: '/borrow/get-borrow-total-amount',
          method: 'POST'
        } ).then( function( res ) {
          if ( res.data.error.returnCode == '0' ) {
            tip = res.data.data;
          } else {
            $rootScope.globalError( res.data.error.returnMessage );
          }
        }, function() {
          $rootScope.globalError( '异常错误！' );
        } );
      };

      getremember();

      /**
       *  发标提示框
       */
      var showTip = function() {
        var defer = $q.defer();

        if ( tip.is_check != '0' && tip.total + Number( $scope.data.amount ) > 1000000 ) {

          // if(!false){
          var modalInstance = $uibModal.open( {
            animation: false,
            templateUrl: 'tip.html',
            controller: 'TipCtrl',
            size: 'tip',
            resolve: {
              params: function() {
                return tip;
              }
            }
          } );
          return modalInstance.result;
        }
        defer.resolve();
        return defer.promise;
      };
      $scope.cancelRz = function() {
        $scope.currentStep = 1;
      };

      /* 融资额度校验 */
      var amountCnt;
      $scope.amountCheck = function() {
        $timeout.cancel( amountCnt );
        amountCnt = $timeout( function() {

          if ( !$scope.data.amount ) {
            $scope.checkAmount = true;
          } else {
            $scope.checkAmount = false;
          };

		  var amount = Number($scope.data.amount);
		  var amountNum = Number($scope.amountNum);

		  if ( amount  <= 0 || amount > amountNum ||
			amount % 100 != 0 || isNaN( amount ) ) {
			$scope.amountError = true;
		  } else {
			$scope.amountError = false;
		  }

        }, 300 );
      }

      $scope.open = function( size ) {
        var modalInstance = $uibModal.open( {
          animation: false,
          templateUrl: 'messageModal.html',
          controller: 'MessageModalCtrl',
          size: size,
          resolve: {
            phoneNum: function() {
              return {
                phone_num: $scope.phone_num,
                cashSuccess: $scope.cashSuccess
              };
            }
          }
        } );

        modalInstance.result.then( function( selectedItem ) {
          $scope.selected = selectedItem;
        }, function() {

        } );
      };

      $scope.termCalender = {
        opened: false
      };

      $scope.data.imagesDatas = [];

      $scope.openCalender = function() {
        $scope.termCalender.opened = true;
      };

      //word count
      $scope.wordCount = function() {
        if ($scope.data.remark.length > 255) {
          $scope.data.remark = $scope.data.remark.substr(0, 255);
        }
      }

      $scope.dateChanged = function() {
        $scope.errText = '';
        $scope.errStyle = false;
        $scope.deadLine = Date.parse( $scope.termCalender.date );

		var calenderTime = $scope.termCalender.date.getTime();
		var now = Date.now();
		// 天数差值
		var diffDays = Math.ceil((calenderTime - now) / 1000 / 60 / 60 / 24);

		$scope.data.effectiveTime =  diffDays >= 20 ? 20 : diffDays;
        $scope.deadDate = $scope.data.effectiveTime;
      };


      // 控制当输入域没有变化的时候 不可改变输入域错误边框
      $scope.checkChange = function() {
        $scope.checkStyle = true;
      };


	  // 年利率输入校验拦截
      $scope.verifyInterestInput = function(e) {
		var rateRegex = /^\s*\d{1,2}\.\d{1}\s*$/;
		// 已经有一位小数后，再输入数字就阻止
		if (rateRegex.test($scope.data.rate) 
			&& (
				(e.keyCode >= 48 && e.keyCode <= 57) // 键盘顶部数字区
				||
				(e.keyCode >= 96 && e.keyCode <= 105) // 键盘右侧数字区
			   )) {
			e.preventDefault();
		}
      };

      // 检查年利率输入是否合法
      $scope.checkInterest = function() {

		if (!$scope.data.rate) {
		    $scope.checkInterestError = false;
			return;	
		}

		var rate = Number($scope.data.rate);
	    if (isNaN(rate) || rate < 0 || rate > 24) {
		  $scope.checkInterestError = true;
		} else {
		  $scope.checkInterestError = false;
		}

      };

      // 判断发布期的各种输入情况
      $scope.checkEffectDate = function() {

        $scope.errStyle = false;
        $scope.errText = '';

        if ( $scope.data.effectiveTime > 20 && isNaN( $scope.data.effectiveTime ) == false ) {
          $scope.errText = '发布期不能超过20天'; // 发布期不能超过20天
          $scope.errStyle = true;
          return;

        }

        if ( $scope.deadDate < $scope.data.effectiveTime && isNaN( $scope.data.effectiveTime ) == false ) {
          $scope.errText = '发布期不能长于还款日期'; // 发布期不能长于还款日期
          $scope.errStyle = true;
          return;

        }

        if ( isNaN( $scope.data.effectiveTime ) == true && $scope.data.effectiveTime ) {
          $scope.errText = '请输入正确的数字'; // 输入所有非数字的情况
          $scope.errStyle = true;
          return;
        }

        if ( $scope.data.effectiveTime <= 0 && isNaN( $scope.data.effectiveTime ) == false ) {
          $scope.errText = '发布期必须大于0'; // 发布期必须大于0
          $scope.errStyle = true;
          return;
        }

      };

      function getFriendNames() {
        if ( $scope.data.choseZero ) {
          $scope.friendNames = '';
          $scope.data.friendIdList = -1;
        } else {
          var arr = [];
          var idArr = [];

          angular.forEach( $scope.data.friendIdListArr, function( obj ) {
            arr.push( obj.name );
            idArr.push( obj.id );
          } );

          $scope.data.friendIdList = idArr.join( ',' );

          if ( arr.length > 3 ) {
            $scope.friendNames  = arr[ 0 ] + ',' + arr[ 1 ]  + '...' + '(' + $rootScope.num + '人' + ')';
          } else if ( arr.length == 0 ) {
            $scope.friendNames = '全部员工(' + $scope.allNum + '人)';
          } else {
            $scope.friendNames  = arr.join( ',' );
          }
        }
      }

      var timeoutcnt;

      $scope.getPersonsLayer = function( getOld ) {
        if ( !getOld ) {
          $scope.data.mobile = '';
        }
        if ( !$scope.data.guarantee ) {
          return;
        }
        $timeout.cancel( timeoutcnt );
        timeoutcnt = $timeout( function() {
          _http( {
            url: '/friends/byname',
            method: 'POST',
            data: {
              name: $scope.data.guarantee
            }
          } ).
          then( function( res ) {
            if ( res.data.error.returnCode == '0' ) {
              if ( res.data.data.length > 0 ) {
                $scope.showPersonsLayer = true;
                $scope.personsList = res.data.data;
              }
            } else {
              $scope.showPersonsLayer = false;
              $scope.data.guaranteeID = '';
              $scope.personsList = [];
              $rootScope.globalError( res.data.error.returnMessage );
            }
          }, function() {
            $scope.showPersonsLayer = false;
            $rootScope.globalError( '异常错误！' );
          } );
        }, 500 );
      };

      $scope.autoStuff = function() {
        if ( $scope.personsList ) {
          if ( $scope.personsList.length == 1 ) {
            _http( {
              url: '/friends/get-is-overdue',
              method: 'POST',
              data: {
                memberID: $scope.personsList[ 0 ].uuid + ''
              }
            } ).then( function( res ) {
              if ( res.data.error.returnCode == 0 ) {
                $scope.data.guarantee = $scope.personsList[ 0 ].memberName;
                $scope.data.mobile = $scope.personsList[ 0 ].mobile;
                $scope.data.guaranteeID = $scope.personsList[ 0 ].uuid + '';
                $scope.showPersonsLayer = false;
              } else {
                $rootScope.globalError( res.data.error.returnUserMessage );
              }
            } );
          }
        }
      };

      $scope.selectPerson = function( person ) {
        $scope.data.guaranteeID = person.uuid + '';
        _http( {
          url: '/friends/get-is-overdue',
          method: 'POST',
          data: {
            memberID: $scope.data.guaranteeID
          }
        } ).then( function( res ) {
          if ( res.data.error.returnCode == 0 ) {
            $scope.data.guarantee = person.memberName;
            $scope.data.mobile = person.mobile;
            $scope.showPersonsLayer = false;
          } else {
            $rootScope.globalError( res.data.error.returnUserMessage );
          }
        } );

      };

      $scope.submitForm = function( isValid ) {
        showTip().then( function() {

          if ( !$scope.data.amount ) {
            $scope.amountError = true;
            $scope.amountCheck();
          }
          $scope.submitted = true;

          if ( isValid && $scope.personsList.length > 0 ) {

            var imagesArr = [];

            angular.forEach( $scope.data.imagesDatas, function( obj ) {
              imagesArr.push( obj.file );
            } );

            $scope.data.images = imagesArr.join( ',' );
            $scope.data.term = getDateStr( $scope.termCalender.date );

            var submitData = angular.extend( {}, $scope.data );

			// 有自动续标资格，传是否选中自动续标字段
			if ($scope.isAutoRenewal) {
				submitData.is_auto_renewal = Number($scope.data.is_auto_renewal);
			} else {
				delete submitData.is_auto_renewal;
			}

            delete submitData.friendIdListArr;

            _http( {
              url: '/borrow/set',
              data: submitData,
              method: 'POST'
            } ).
            then( function( res ) {

              if ( res.data.error.returnCode == '0' ) {
                $scope.qrImg = res.data.data.img;
                $scope.checkId = res.data.data.id;
                $scope.currentStep = 2;
                $scope.resultStep = 1;

                checkStatus();
              } else {
                $rootScope.globalError( res.data.error.returnMessage );
              }

            }, function() {
              $rootScope.globalError( '异常错误！' );
            } );
          }
        } );
      };

      function getDateStr( date ) {
        var month = date.getMonth() + 1;
        var day = date.getDate();
        return date.getFullYear() + '-' + ( month >= 10 ? month : '0' + month ) + '-' + ( day >= 10 ? day : '0' + day );
      }

      // $scope.guaranteeRequirement = function() {

      //   $uibModal.open( {
      //     animation: false,
      //     templateUrl: 'guarantee-requirement.html',
      //     controller: 'GuaranteeRequirementCtrl',
      //     size: 'normal-modal'
      //   } );
      // };

      $scope.getFriendsList = function() {

        var modalInstance = $uibModal.open( {
          animation: false,
          templateUrl: 'friendsListModal.html',
          controller: 'FriendsListModalCtrl',
          size: 'friends-list',
          resolve: {
            params: function() {
              return {
                data: $scope.data
              };
            }
          }
        } );

        modalInstance.result.then( function() {
          getFriendNames();
        }, function() {

        } );

      };

      $scope.upload = function( file ) {

        if ( !file ) {
          return;
        }

        var imageType = /image.*png|image.*jpeg$/;

        $scope.uploadError = '';

        if ( !file.type.match( imageType ) ) {
          $scope.uploadError = '图片格式必须为：jpeg、png';
          return;
        }

        if ( file.size > 2 * 1024 * 1024 ) {
          $scope.uploadError = '图片不大于2M';
          return;
        }

        Upload.upload( {
          url: '/upload/post',
          data: {
            file: file,
            token: localStorage.getItem( 'loginToken' ),
            companyID: localStorage.getItem( 'loginCompanyID' )
          }
        } ).
        then( function( resp ) {
          var res = resp.data;

          if ( res.error.returnCode == '0' ) {
            $scope.data.imagesDatas.push( res.data );
            $scope.imgsLimit++;
          } else {
            $rootScope.globalError( res.error.returnMessage );
          }

        }, function() {
          $rootScope.globalError( '异常错误！' );
        } );
      };

      function checkBorrowPending() {
        _http( {
          url: '/borrow/pending',
          method: 'POST'
        } ).then( function( res ) {
          if ( res.data.error.returnCode == '0' ) {
            if ( res.data.data.status == 1 ) {
              $scope.currentStep = 2;

              $scope.qrImg = res.data.data.img;
              $scope.checkId = res.data.data.id;
              $scope.data.amount = res.data.data.amount;
              $scope.data.rate = res.data.data.rate;
              $scope.data.effectiveTime = res.data.data.effectiveTime;
              $scope.data.remark = res.data.data.tags;
              $scope.data.guarantee = res.data.data.guarantee;
              $scope.data.term = res.data.data.term;

              $scope.resultStep = 1;
              checkStatus();
            } else {
              $scope.currentStep = 1;
            }
          } else {
            $rootScope.globalError( res.data.error.returnMessage );
          }
        }, function() {
          $rootScope.globalError( '异常错误！' );
        } );
      }

      function checkStatus() {
        _http( {
          url: '/auth/status',
          method: 'POST',
          data: {
            id: $scope.checkId
          }
        } ).
        then( function( res ) {
          if ( res.data.error.returnCode == '0' ) {
            var data = res.data.data;
            $scope.statusResult = data;
            $scope.statusError = res.data.error;

            if ( data.iconv ) {
              $scope.qrImg = $scope.statusResult.iconv;
            }

            if ( data.status == 1 ) {
              $rootScope.gTimeoutCnt = $timeout( checkStatus, 3000 );
            } else if ( data.status == 2 ) {
              $scope.statusResultSuccess = true;
            } else if ( data.status == 3 ) {
              $scope.statusResultError = true;
            } else if ( data.status == 5 ) {
              return;
            } else {
              $rootScope.globalError( '收到异常请求状态！' );
            }

          } else {
            $rootScope.globalError( res.data.error.returnMessage );
          }
        }, function() {
          $rootScope.globalError( '异常错误！' );
        } );
      }

      $scope.toggleRenewalTips = function () {
        $scope.showAutoRenewalTips = !$scope.showAutoRenewalTips;
      }

	  // 判断是否有自动续标的资格
	  $scope.isAutoRenewal = function() {
        _http( {
          url: '/borrow/is-auto-renewal',
          method: 'POST'
        } ).then( function( res ) {
          if ( res.data.error.returnCode == 0 ) {
			  $scope.isAutoRenewal = res.data.data.is_auto_renewal;
          } else {
            $rootScope.globalError( res.data.error.returnUserMessage );
          }
        } );
	  }

	  // 取消自动续标给出提示
	  $scope.cancelAutoRenewal = function() {
		if ($scope.isFirstUncheck && !$scope.data.is_auto_renewal) {

			// 置为true，阻止取消
			$scope.data.is_auto_renewal = true;

			var comfirmModalInstance = $uibModal.open( {
			  animation: false,
			  templateUrl: 'modules/public/comfirmModal/comfirmModal.html',
			  controller: 'ComfirmModalCtrl',
			  size: 'normal-modal',
			  backdrop: 'static',
			  resolve: {
				modalParams: function() {
				  return {
					tipsTitle: '温馨提示',
					tipsText: '关闭自动续借后，融资筹满的可能性会降低，确认关闭吗？',
					OkText: '确定',
					cancelText: '取消'
				  };
				}
			  }
			} );

		    comfirmModalInstance.ok = function() {
				$scope.data.is_auto_renewal = false;
			};

		    comfirmModalInstance.cancel = function() {
				$scope.data.is_auto_renewal = true;
			};

		    $scope.isFirstUncheck = false;
		} 
	  };

	  checkBorrowPending();
	  $scope.isAutoRenewal();
      getFriendNames();

    } );

/**
 * tip 控制器
 */
angular.module( 'myApp' ).controller( 'TipCtrl', [
  '$scope',
  '$uibModalInstance',
  '_http',
  
  'params',
  function( $scope, $uibModalInstance, _http,  params ) {

    // $scope.is_check = params.is_check;
    //$scope.is_check = true;
    $scope.ok = function() {
      
      if ( !!$scope.is_checks ) {

        _http( {
          url: '/borrow/not-show-fee-tip',
          method: 'POST',
          data: {
          }
        } ).then( function( res ) {
          if ( res.data.error.returnCode == '0' ) {
            $uibModalInstance.close();
          } else {
            $rootScope.globalError( res.data.error.returnMessage );
            $uibModalInstance.close();
          }
        }, function() {
          $rootScope.globalError( '异常错误！' );
          $uibModalInstance.close();
        } );
      }else {
        $uibModalInstance.close();
      }
    };
    $scope.cancel = function() {
      $uibModalInstance.dismiss( 'cancel' );
    };
  } ]
);

angular.module( 'myApp' ).controller( 'FriendsListModalCtrl', function( $scope, $rootScope, $uibModalInstance, _http,  params, $timeout ) {
  $scope.tagId = [];
  var friendsArr = angular.copy( params.data.friendIdListArr );
  var tagArr = [ { 'tagId': '' } ];
  var countArr = [];
  $scope.allChecked = false;
  $rootScope.num = '';
  $scope.ifCheck = [];

  $scope.list = [];
  $scope.list.all = false;

  if ( friendsArr.length > 0 || !params.data.allChecked ) {
    _http( {
      url: '/staff/get-staff-type',
      method: 'POST'
    } ).then( function( res ) {
      if ( res.data.error.returnCode == '0' ) {
        $scope.kinds = res.data.data;
      } else {
        $rootScope.globalError( res.data.error.returnMessage );
      }
    }, function() {
      $rootScope.globalError( '异常错误！' );
    } );

    _http( {
      url: '/friends/get-borrow-staff-list',
      method: 'POST'
    } ).
    then( function( resp ) {
      if ( resp.data.error.returnCode == '0' ) {
        $scope.friendsList = resp.data.data.idlist;
      } else {
        $rootScope.globalError( resp.data.error.returnMessage );
      }
    }, function() {
      $rootScope.globalError( '异常错误！' );
    } );

    $rootScope.num = friendsArr.length;
    $scope.tagId = angular.copy( params.data.tagId );
    tagArr = angular.copy( params.data.tagArr );
    countArr = angular.copy( params.data.countArr );
    $scope.ifCheck = angular.copy( params.data.ifCheck );
  } else {
    _http( {
      url: '/staff/get-staff-type',
      method: 'POST'
    } ).then( function( res ) {
      if ( res.data.error.returnCode == '0' ) {
        $scope.kinds = res.data.data;
        angular.forEach( $scope.kinds, function( obj, key ) {
          countArr.push( {
            tagId: obj.tagId,
            count: 0,
            num: 0
          } );
          $scope.ifCheck[ key ] = true;
        } );
      } else {
        $rootScope.globalError( res.data.error.returnMessage );
      }
    }, function() {
      $rootScope.globalError( '异常错误！' );
    } );

    _http( {
      url: '/friends/get-borrow-staff-list',
      method: 'POST'
    } ).
    then( function( resp ) {
      if ( resp.data.error.returnCode == '0' ) {
        $scope.friendsList = resp.data.data.idlist;

        $scope.collectList();

        if ( !friendsArr.length ) {

          $scope.allChecked = true;
          $scope.list.all = true;

          angular.forEach( $scope.friendsList, function( obj ) {
            friendsArr.push( {
              id: obj.uuid,
              name: obj.memberName,
              tagId: obj.tagId
            } );
          } );

          angular.forEach( countArr, function( obj ) {
            obj.count = obj.num;
          } );

          $rootScope.num = friendsArr.length;
        }

      } else {
        $rootScope.globalError( resp.data.error.returnMessage );
      }
    }, function() {
      $rootScope.globalError( '异常错误！' );
    } );
  }

  //将列表分类
  $scope.collectList = function() {
    angular.forEach( countArr, function( count, index1 ) {
      $scope.tagId[ index1 ] = count.tagId;
      angular.forEach( $scope.friendsList, function( friend, index2 ) {
        if ( friend.tagId == count.tagId ) {
          count.num++;
        }
      } );
    } );
  };

  $scope.choseKind = function( kind, index ) {
    changeArr( kind, index );
    tagArr = friendsArr;
    if ( $scope.friendsList.length == friendsArr.length ) {
      $scope.allChecked = true;
      $scope.list.all = true;
    }
  };

  function changeArr( kind, index ) {
    if ( $scope.ifCheck[ index ] == true ) {
      countArr[ index ].count = countArr[ index ].num;
      $scope.tagId[ index ] = kind;
      angular.forEach( $scope.friendsList, function( obj, key ) {
        if ( inFriendsArray( friendsArr, obj.uuid ) == -1 && obj.tagId == kind ) {
          $scope.list[ key ] = true;
          friendsArr.push( {
            id: obj.uuid,
            name: obj.memberName,
            tagId: obj.tagId
          } );
        }
      } );
    } else {
      countArr[ index ].count = 0;
      $scope.allChecked = false;
      $scope.list.all = false;
      $scope.tagId[ index ] = '';

      angular.forEach( $scope.friendsList, function( obj, key ) {
        var flag = inFriendsArray( friendsArr, obj.uuid );
        if ( flag > -1 && obj.tagId == kind ) {
          $scope.list[ key ] = false;
          friendsArr.splice( flag, 1 );
        }
      } );
    }
    $rootScope.num = friendsArr.length;
    if ( $scope.friendsList.length == friendsArr.length ) {
      $scope.allChecked = true;
      $scope.list.all = true;
    }
  }

  $scope.checkAll = function() {
    if ( $scope.list.all ) {

      //非全选则填满选中列表
      angular.forEach( countArr, function( obj ) {
        obj.count = obj.num;
      } );
      angular.forEach( $scope.ifCheck, function( obj, key ) {
        $scope.ifCheck[ key ] = true;
      } );
      angular.forEach( $scope.friendsList, function( obj, index ) {
        if ( inFriendsArray( friendsArr, obj.uuid ) === -1 ) {
          $scope.list[ index ] = true;
          friendsArr.push( {
            id: obj.uuid,
            name: obj.memberName,
            tagId: obj.tagId
          } );
        }
      } );
    } else {

      //全选则置空选中列表
      friendsArr = [];
      angular.forEach( $scope.tagId, function( obj, key ) {
        $scope.tagId[ key ] = '';
      } );
      angular.forEach( countArr, function( obj ) {
        obj.count = 0;
      } );
      angular.forEach( $scope.ifCheck, function( obj, key ) {
        $scope.ifCheck[ key ] = false;
      } );
      angular.forEach( $scope.friendsList, function( obj, index ) {
        $scope.list[ index ] = false;
      } );
    }
    $rootScope.num = friendsArr.length;
  };

  $scope.change = function( friend, index ) {
    var flag = inFriendsArray( friendsArr, friend.uuid );

    if ( flag === -1 ) {
      $scope.list[ index ] = true;
      friendsArr.push( {
        id: friend.uuid,
        name: friend.memberName,
        tagId: friend.tagId
      } );

      angular.forEach( countArr, function( obj, key ) {
        if ( obj.tagId == friend.tagId ) {
          obj.count++;
          if ( obj.count == obj.num ) {
            $scope.ifCheck[ key ] = true;
          }

        }
      } );

      if ( $scope.friendsList.length == friendsArr.length ) {
        $scope.allChecked = true;
        $scope.list.all = true;
      }
    } else {
      friendsArr.splice( flag, 1 );
      $scope.list[ index ] = false;
      $scope.allChecked = false;
      $scope.list.all = false;
      angular.forEach( countArr, function( obj, key ) {
        if ( obj.tagId == friend.tagId ) {
          obj.count--;
          $scope.ifCheck[ key ] = false;
        }
      } );

    }
    $rootScope.num = friendsArr.length;
  };

  $scope.isChecked = function( friendId ) {
    if ( $scope.list.all ) {
      return true;
    }

    var flag = false;

    if ( inFriendsArray( friendsArr, friendId.uuid ) > -1 ) {
      flag = true;
    }

    /*angular.forEach( $scope.tagId, function( val ) {
     if ( friendId.tagId == val ) {
     flag = true;
     }
     } );*/

    if ( friendsArr.length == $scope.friendsList.length ) {
      $scope.allChecked = true;
      $scope.list.all = true;
    }

    return flag;

  };

  function inFriendsArray( arr, _str ) {
    var flag = -1;

    angular.forEach( arr, function( obj, index ) {

      if ( _str == obj.id ) {
        flag = index;
        return;
      }
    } );

    return flag;
  }

  $scope.ok = function() {
    params.data.friendIdListArr  = friendsArr;
    params.data.ifCheck = $scope.ifCheck;
    params.data.countArr = countArr;
    params.data.tagArr = tagArr;
    params.data.tagId = $scope.tagId;

    // params.data.allChecked = $scope.allChecked;
    params.data.allChecked = $scope.list.all;

    // if ( $scope.allChecked ) {
    if ( $scope.list.all ) {
      params.data.friendIdListArr  = [];
    }

    // if ( !$scope.allChecked && friendsArr.length == 0 ) {
    if ( !$scope.list.all && friendsArr.length == 0 ) {
      params.data.choseZero = '(0)人';
    } else {
      params.data.choseZero = '';
    }
    $uibModalInstance.close();
  };

} );
