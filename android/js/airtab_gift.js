

starter.controller("SendgiftCtrl", function($scope, $http, $rootScope, $ionicLoading, $ionicPopup, $window, $ionicViewService, $location, $ionicModal, $state) {

	
	    var original;
        return $scope.showInfoOnSubmit = !1, 
        $scope.revert = function () {
            return $scope.invite = angular.copy(original), $scope.inviteFormUsername.$setPristine()
        }, $scope.canRevert = function () {
            return !angular.equals($scope.invite, original) || !$scope.inviteFormUsername.$pristine
        }, $scope.canSubmit = function () {
            return $scope.inviteFormUsername.$valid
 
        },
        
        $scope.submitPurchaseGift = function ( item_id, senderId, recipientId, giftType ) {
        	         	
        	$rootScope.giftInfo.item_id = item_id;
        	$rootScope.giftInfo.estId = 0;
        	$rootScope.giftInfo.senderId = $rootScope.userInfo.member_id;
        	$rootScope.giftInfo.recipientId = recipientId;
        	$rootScope.giftInfo.type = giftType;
       	
					$state.transitionTo("app.sendgiftTo",{method: "to"});
          //$rootScope.hasPromoAccess($scope.hasPromo);
        }, 

				$scope.hideLoading = function() {
					$rootScope.hideLoading();
				},			
				
        $scope.viewGiftDetails = function ( item_id ) {
          	$state.transitionTo('app.giftInfo', {type: "Meal", estId : 0, item_id : item_id, senderId : $rootScope.userInfo.member_id, recipientid: 0 });
        }, 

				// AirTab friend
				$scope.checkoutBottle = function(sId, rId, method, gift) {
    	    $rootScope.giftInfo.method = method;
					$rootScope.giftInfo.recipientId = rId;
					$rootScope.hasPromoAccess($scope.hasPromo);
        	//$state.transitionTo('app.establishments_bottle', {senderId: sId, recipientid: rId, method : "airtab", gift : gift});
        },				
       
				// AirTab UserName
        $scope.submitFormBottle = function (senderId,gift) {
//          	$scope.showSuccess( 'submitFormBottle', 'REMOVE IT'  );          
            $http.get(config.template_path + '/username_to_id/' + $scope.invite.username).success(function(result) {
                if(!result.userid) {
                  $rootScope.hideLoading();
                  $scope.showError("Send Drink Error", "Sorry, that username was not found.");
                } else {  
									$rootScope.giftInfo.method = "airtab";
									$rootScope.giftInfo.recipientId = result.userid;
									$rootScope.hasPromoAccess($scope.hasPromo);
                  //$state.transitionTo('app.establishments_bottle', {senderId: senderId, recipientid: result.userid, method : "airtab", gift : gift});                 
                }
              });
            return;           
        }, 
				
				// by text message
				$scope.submitFormBottleText = function (senderId) { 
							$rootScope.giftInfo.method = "text";
							$rootScope.giftInfo.recipientId = $scope.invite.phone;
							$rootScope.hasPromoAccess($scope.hasPromo);				
							//$state.transitionTo('app.establishments_bottle', {senderId: senderId, recipientid: $scope.invite.phone, method : "text"});
				}, 
				$scope.submitFormBottleEmail = function (senderId) {  
							$rootScope.giftInfo.method = "email";
							$rootScope.giftInfo.recipientId = $scope.invite.email;
							$rootScope.hasPromoAccess($scope.hasPromo);						
							//$state.transitionTo('app.establishments_bottle', {senderId: senderId, recipientid: $scope.invite.email, method : "email"});
				}, 

							
        $scope.hasPromo = function(r) {
            
        	if(r.hasPromoAccess) {
        		if( $rootScope.giftInfo.method == "airtab" ){
        			$state.transitionTo('app.promobottle', {type: $rootScope.giftInfo.method, estId : $rootScope.giftInfo.estId, item_id : $rootScope.giftInfo.item_id, senderId : $rootScope.giftInfo.senderId, recipientid: $rootScope.giftInfo.recipientId });
        		} else if( $rootScope.giftInfo.method == "email" ){
        			$state.transitionTo('app.promobottle', {type: $rootScope.giftInfo.method, estId : $rootScope.giftInfo.estId, item_id : $rootScope.giftInfo.item_id, senderId : $rootScope.giftInfo.senderId, recipientid: $rootScope.giftInfo.recipientId });
        		} else if( $rootScope.giftInfo.method == "text" ){
        			$state.transitionTo('app.promobottle', {type: $rootScope.giftInfo.method, estId : $rootScope.giftInfo.estId, item_id : $rootScope.giftInfo.item_id, senderId : $rootScope.giftInfo.senderId, recipientid: $rootScope.giftInfo.recipientId });            
        		}         
          } else {              
           	$state.transitionTo('app.paymentbottle', {type: $rootScope.giftInfo.method, estId: $rootScope.giftInfo.estId, drinkId: $rootScope.giftInfo.item_id, recipientId: $rootScope.giftInfo.recipientId});           	    	   
          }
        }, 

              
        $scope.showError = function(title, alert) {
          var alertPopup = $ionicPopup.alert({
            title: title,
            template: alert
          });
          alertPopup.then(function(res) {
            console.log('Hit OK');
          });
        },

        $scope.showSuccess = function(title, alert) {
          var alertPopup = $ionicPopup.alert({
            title: title,
            template: alert
          });
          alertPopup.then(function(res) {
            $ionicViewService.nextViewOptions({
               disableBack: true
            });
            $location.url("/app/friends");
          });
        },

        $scope.$on('modal.removed', function() {
        	$scope.showSuccess( 'submitFormBottle', 'REMOVE IT'  );          

        })

})

