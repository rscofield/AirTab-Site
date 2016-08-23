


starter.controller('RegiftdrinkCtrl', function($scope, $stateParams, $http, $window, $ionicModal, $ionicLoading, $rootScope, $state, $ionicPopup) {
    $rootScope.showLoading(),
    

    $scope.showAlert = function(title, alert) {
        var alertPopup = $ionicPopup.alert({
          title: title,
          template: alert
        });
        alertPopup.then(function(res) {
          console.log('Hit OK');
        });
      }

    $scope.checkout = function(drinkType, recipient, method, ticketid) {
  	  
      $rootScope.showLoading();
      $scope.drinkType = "Premium";
      $scope.recipient = recipient;
      $scope.ticketid = ticketid;
      $scope.method = "airtab";
      
      var remaining = "unlimited";
      $state.transitionTo('app.promo_regift', {type: $scope.method, drinkType: $scope.drinkType, fId: $scope.recipient, remaining: remaining, ticket_id: $scope.ticketid });    		  

    },

    $scope.hasPromo = function(r) {      
       console.log("has promo");
       var remaining = (r.limit > 0) ? r.limit - r.sent : "unlimited";
       $state.transitionTo('app.promo_regift', {type: $scope.method, drinkType: $scope.drinkType, fId: $scope.recipient, remaining: remaining, ticket_id: $scope.ticketid });    		             
    },

    $scope.hideModal = function() {
      $rootScope.hideModal();
    },
    
    $scope.hideLoading = function() {
  	    $rootScope.hideLoading();
  	  },

    $scope.regiftByContacts = function(drinkCode, estID, drinkId) {  
        $scope.drinkCode = drinkCode;
        $scope.estID = estID;
        $scope.drinkId = drinkId;

        $window.getContact($scope.contactInfoPhone);    
     },
     
     $scope.contactInfoPhone = function(r) {    	 
    	 $state.transitionTo('app.promo_regift', {type: "text", drinkType: "Premium", fId: r.phone, remaining: "unlimited", ticket_id: $scope.drinkCode, redeemAt: $scope.estID, redeemId: $scope.drinkId });    		  
     },

    $scope.contactInfo = function(contact) {
      $window.url_variables = contact;

      if(contact.status && contact.status == "error") {
        $rootScope.hideLoading();
        $scope.showAlert("Address Book Error", contact.msg);
        return;
      }

      if(contact.phone) {
        $scope.checkout("Premium", contact.phone, "text");
      } else if(contact.email) {
        $scope.checkout("Premium", contact.email, "email");
      } else {
        $rootScope.hideLoading();
      }
    }
    
    $scope.getContactList = function() {
        $rootScope.hideLoading();
       //$scope.showAlert( 'title', 'ticketid' ); 
        $window.getContactListFromPhone($scope.getPhonecontactCB);
    }
    
    $scope.getPhonecontactCB = function(contact) {     
        $scope.phoneFriendsList = contact;
        $rootScope.hideLoading();        
    }
    
    $scope.regiftDrinkContactsPhone = function( phone, ticketid, estId, drinkId) {              
    	 $state.transitionTo('app.promo_regift', {type: "text", drinkType: "Premium", fId: phone, remaining: "unlimited", ticket_id: ticketid, redeemAt: estId, redeemId: drinkId });    		  
    }
    
    $scope.query_friendsList = function () {
        $rootScope.showLoading();

         $http.get(config.template_path + '/sql_get_friends_list').success(function(result) {
         $scope.friendsList =  result;
         
     })

      $scope.hideLoading();

  }
    


    $scope.regiftDrinkTo = function (userid, ticketid, redeemAt, redeemId) {   	
    	$state.transitionTo('app.promo_regift', {type: "airtab", drinkType: "Premium", fId: userid, remaining: "unlimited", ticket_id: ticketid, redeemAt: redeemAt, redeemId: redeemId });    		  
    }
    
    
    //$ionicLoading.hide()
})


starter.controller("regiftDrinkByUsername", function($scope, $http, $rootScope, $ionicLoading, $ionicPopup, $window, $ionicViewService, $location, $ionicModal, $state) {
        var original;
        return $scope.showInfoOnSubmit = !1, 
        $scope.revert = function () {
            return $scope.invite = angular.copy(original), $scope.inviteFormUsername.$setPristine()
        }, $scope.canRevert = function () {
            return !angular.equals($scope.invite, original) || !$scope.inviteFormUsername.$pristine
        }, $scope.canSubmit = function () {
            return $scope.inviteFormUsername.$valid
        }, 
        
        
        $scope.submitForm = function (ticketid, redeemAt, redeemId) {

        	$scope.ticketid = ticketid;
            $rootScope.showLoading();

           // $scope.showSuccess( 'title', $scope.invite.username );

            $http.get(config.template_path + '/username_to_id/' + $scope.invite.username).success(function(result) {
              if(!result.userid) {
                $rootScope.hideLoading();
                $scope.showError("Send Drink Error", "Sorry, that username was not found.");
              } else {
                $scope.userid = result.userid;
                
                $state.transitionTo('app.promo_regift', {type: "airtab", drinkType: "Premium", fId: $scope.userid, remaining: "unlimited", ticket_id: $scope.ticketid, redeemAt: redeemAt, redeemId: redeemId });    		  
              }
            });

            return;
        },

        $scope.sendRequest = function() {
          $ionicModal.fromTemplateUrl(config.template_path + '/checkout_modal/airtab/Premium/'+$scope.userid, function(modal) {
            $rootScope.modal = modal;
            modal.show();
          }, {
          animation: 'slide-full',
            focusFirstInput: true
          })
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
          $ionicViewService.nextViewOptions({
               disableBack: true
            });
//          $location.url("/app/senddrink");
          $location.url("/app/regiftdrink");
        })
})



starter.controller("regiftDrinkEmail", function($scope, $http, $ionicPopup, $ionicLoading, $ionicModal, $rootScope, $ionicViewService, $window, $state) {
        var original;
        return $scope.invite = {
            email: ""
        }, $scope.showInfoOnSubmit = !1, original = angular.copy($scope.invite), $scope.revert = function () {
            return $scope.invite = angular.copy(original), $scope.form_sendDrinkEmail.$setPristine()
        }, $scope.canRevert = function () {
            return !angular.equals($scope.invite, original) || !$scope.form_sendDrinkEmail.$pristine
        }, $scope.canSubmit = function () {
            return $scope.form_sendDrinkEmail.$valid && !angular.equals($scope.invite, original)
        }, 
        
        $scope.submitForm = function (ticketid, redeemAt, redeemId) {
        	$scope.ticketid = ticketid;

            $state.transitionTo('app.promo_regift', {type: "email", drinkType: "Premium", fId: $scope.invite.email, remaining: "unlimited", ticket_id: $scope.ticketid, redeemAt: redeemAt, redeemId: redeemId });    		  

        }, $scope.notify = function (type,msg) {
            switch (type) {
            case "info":
                console.log(msg);
                return "info";
            case "success":
                console.log(msg);
                return "success";
            case "warning":
                console.log(msg);
                return "warning";
            case "error":
                console.log(msg);
                return "error";
            }
        },


        $scope.showAlert = function(title, alert) {
          var alertPopup = $ionicPopup.alert({
            title: title,
            template: alert
          });
          alertPopup.then(function(res) {
            console.log('Hit OK');
          });
        },

        $scope.showModal = function(drinkType, recipient) {
        },
        
        
        function() {
          if($window.url_variables.email != "") {
            $scope.invite.name = ($window.url_variables.name) ? $window.url_variables.name : "";
            $scope.invite.email = $window.url_variables.email;
            $window.url_variables = {};
          }
        },

        $scope.$on('modal.removed', function() {
          $ionicViewService.nextViewOptions({
               disableBack: true
            });
          $location.url("/app/regiftdrink");
        })
})




starter.controller("regiftDrinkText", function($scope, $http, $ionicPopup, $ionicLoading, $ionicModal, $rootScope, $window, $state) {
        var original;
        return $scope.invite = {
            phone: ""
        }, $scope.showInfoOnSubmit = !1, original = angular.copy($scope.invite), $scope.revert = function () {
            return $scope.invite = angular.copy(original), $scope.form_sendDrinkText.$setPristine()
        }, $scope.canRevert = function () {
            return !angular.equals($scope.invite, original) || !$scope.form_sendDrinkText.$pristine
        }, $scope.canSubmit = function () {
            return $scope.form_sendDrinkText.$valid && !angular.equals($scope.invite, original)
        }, $scope.submitForm = function (ticketid, redeemAt, redeemId) {
        	$scope.ticketid = ticketid;
            
             $state.transitionTo('app.promo_regift', {type: "text", drinkType: "Premium", fId: $scope.invite.phone, remaining: "unlimited", ticket_id: $scope.ticketid, redeemAt: redeemAt, redeemId: redeemId });    		  
        },

        $scope.showAlert = function(title, alert) {
          var alertPopup = $ionicPopup.alert({
            title: title,
            template: alert
          });
          alertPopup.then(function(res) {
            console.log('Hit OK');
          });
        },

        $scope.$on('modal.removed', function() {
        })
})


starter.controller("RegiftdrinkMainCtrl", function($scope, $http, $ionicPopup, $ionicLoading, $ionicModal, $location, $sce, $timeout, $rootScope, $ionicPopover, $window, $state) {

    $scope.showAlert = function(title, alert) {
        var alertPopup = $ionicPopup.alert({
          title: title,
          template: alert
        });
        alertPopup.then(function(res) {
          console.log('Hit OK');
        });
      },

    $scope.getDrinksWithMsg = function() {
  	    $scope.showAlert( 'error', 'getDrinksWithMsg' );
       }
    
    $scope.replyToDrinkSender = function( targetID, usrID ) {
       window.location.href='#/app/drinks_with_msg_input/' + targetID + '/' + usrID;
   }
    
    $scope.drinkRegiftNew = function(ticketId, username, purchaseDate) {
 	      $state.transitionTo('app.regiftdrink', {screen: "main",  ticket_id: ticketId } );    	 
     }
    
    $scope.drinkWithMsgClicked = function(ticketId, username, purchaseDate) {
	   //$scope.showAlert( 'error', 'drinkWithMsgClicked' );

	   $rootScope.redeem = {
	      id: ticketId,
	      username: username,
	      purchased: purchaseDate
	    }
	    if($scope.modal) {
	      //This is in a modal window, close modal
	      $rootScope.hideModal();
	    } else {
	      $state.transitionTo("app.establishments");
	    }
	  }

})



starter.controller('promoControllerRegift', function($scope, $http, $compile, $ionicViewService, $window, $ionicPopup, $ionicLoading, $timeout, $state) {
  
    $scope.newUser = {}; 
    $scope.inputs = {};
    $scope.input = {
      message: ""
    };

    $scope.showAlert = function(title, alert, success) {
      var alertPopup = $ionicPopup.alert({
        title: title,
        template: alert
      });
      alertPopup.then(function(res) {
        if(success) {
          $timeout(function(){
            // wait to remove this due to a 300ms delay native
            // click which would trigging whatever was underneath this
            //parent.rootScope.hideModal();
            $ionicViewService.nextViewOptions({
               disableBack: true
            });

            $state.transitionTo("app.mydrinks");
          }, 400);
        } else {

        }
        console.log('Hit OK');
      });
    },


    $scope.regiftDrink = function(invite_type, recipient, drinkType, ticketID, estID, drinkID ) {
   	   
      	$http.get(config.template_path + '/redeem_via_regift/' + ticketID + '/' + estID + '/' + drinkID + '/8787' + '/' + recipient  ).success(function(result) {   
        	    
      	       if(result.status == "success") {
       	      	    
	      	      	var link = config.template_path + '/sql_createticket_promo_bottle/' + invite_type + '/' + recipient + '/' + estID + '/' + drinkID + '/' + 'Enjoy';
	      	    	
	      	    	$http.get( link  ).success(function(result){
	      	      	    $scope.showAlert("Drink Sent", "You have successfully regifted your selected drink.", true);
	      	     	 });
     	      	    
       	       } else{
       	    	  $scope.showAlert("error", result.status, true);
       	       }
        	    
      	 });
           	
    }
    
    
    $scope.hideLoading = function() {
      parent.rootScope.hideLoading();
    }
    
})



