starter.controller("sendDrinkFriend", function($scope, $http, $window, $ionicModal, $ionicLoading, $rootScope, $state) {

      $scope.sendDrink = function(drinkType, recipient) {
        $scope.drinkType = drinkType;
        $scope.recipient = recipient;

        $rootScope.hasPromoAccess($scope.hasPromo);
      },

      $scope.hasPromo = function(r) {
          if(r.hasPromoAccess) {
            console.log("has promo");
            var remaining = (r.limit > 0) ? r.limit - r.sent : "unlimited";
            $state.transitionTo('app.promo', {type: "airtab", drinkType: $scope.drinkType, fId: $scope.recipient, remaining: remaining});
          } else {
            console.log("not promo");
            $state.transitionTo('app.payment', {type: "airtab", drinkType: $scope.drinkType, fId: $scope.recipient});
          }
      },

      $scope.showModal = function() {
        $ionicModal.fromTemplateUrl(config.template_path + '/checkout_modal/airtab/'+$scope.drinkType+ "/"+$scope.recipient, function(modal) {
          $rootScope.modal = modal;
          modal.show();
        }, {
        animation: 'slide-in-right',
          focusFirstInput: true
        })
      }
})



starter.controller("sendDrinkByUsername", function($scope, $http, $rootScope, $ionicLoading, $ionicPopup, $window, $ionicViewService, $location, $ionicModal, $state) {
        var original;
        return $scope.showInfoOnSubmit = !1, 
        $scope.revert = function () {
            return $scope.invite = angular.copy(original), $scope.inviteFormUsername.$setPristine()
        }, $scope.canRevert = function () {
            return !angular.equals($scope.invite, original) || !$scope.inviteFormUsername.$pristine
        }, $scope.canSubmit = function () {
            return $scope.inviteFormUsername.$valid
        }, $scope.submitForm = function () {
            $rootScope.showLoading();

            $http.get(config.template_path + '/username_to_id/' + $scope.invite.username).success(function(result) {
              if(!result.userid) {
                $rootScope.hideLoading();
                $scope.showError("Send Drink Error", "Sorry, that username was not found.");
              } else {
                $scope.userid = result.userid;
                $rootScope.hasPromoAccess($scope.hasPromo);
              }
            });

            return;
        },

        $scope.hasPromo = function(r) {
          if(r.hasPromoAccess) {
            console.log("has promo");
            var remaining = (r.limit > 0) ? r.limit - r.sent : "unlimited";
            $state.transitionTo('app.promo', {type: "airtab", drinkType: "Premium", fId: $scope.userid, remaining: remaining});
          } else {
            console.log("not promo");
            $state.transitionTo('app.payment', {type: "airtab", drinkType: "Premium", fId: $scope.userid});
          }
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
          $location.url("/app/senddrink");
        })
})

starter.controller("sendDrinkEmail", function($scope, $http, $ionicPopup, $ionicLoading, $ionicModal, $rootScope, $ionicViewService, $window, $state) {
        var original;
        return $scope.invite = {
            email: ""
        }, $scope.showInfoOnSubmit = !1, original = angular.copy($scope.invite), $scope.revert = function () {
            return $scope.invite = angular.copy(original), $scope.form_sendDrinkEmail.$setPristine()
        }, $scope.canRevert = function () {
            return !angular.equals($scope.invite, original) || !$scope.form_sendDrinkEmail.$pristine
        }, $scope.canSubmit = function () {
            return $scope.form_sendDrinkEmail.$valid && !angular.equals($scope.invite, original)
        }, $scope.submitForm = function () {
            $rootScope.hasPromoAccess($scope.hasPromo);
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

        $scope.hasPromo = function(r) {
          if(r.hasPromoAccess) {
            console.log("has promo");
            var remaining = (r.limit > 0) ? r.limit - r.sent : "unlimited";
            $state.transitionTo('app.promo', {type: "email", drinkType: "Premium", fId: $scope.invite.email, remaining: remaining});
          } else {
            console.log("not promo");
            $state.transitionTo('app.payment', {type: "email", drinkType: "Premium", fId: $scope.invite.email});
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

        $scope.$on('modal.removed', function() {
          $ionicViewService.nextViewOptions({
               disableBack: true
            });
          $location.url("/app/senddrink");
        })
})


starter.controller("sendDrinkText", function($scope, $http, $ionicPopup, $ionicLoading, $ionicModal, $rootScope, $window, $state) {
        var original;
        return $scope.invite = {
            phone: ""
        }, $scope.showInfoOnSubmit = !1, original = angular.copy($scope.invite), $scope.revert = function () {
            return $scope.invite = angular.copy(original), $scope.form_sendDrinkText.$setPristine()
        }, $scope.canRevert = function () {
            return !angular.equals($scope.invite, original) || !$scope.form_sendDrinkText.$pristine
        }, $scope.canSubmit = function () {
            return $scope.form_sendDrinkText.$valid && !angular.equals($scope.invite, original)
        }, $scope.submitForm = function () {
            $rootScope.hasPromoAccess($scope.hasPromo)
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

        $scope.hasPromo = function(r) {
          if(r.hasPromoAccess) {
            console.log("has promo");
            var remaining = (r.limit > 0) ? r.limit - r.sent : "unlimited";
            $state.transitionTo('app.promo', {type: "text", drinkType: "Premium", fId: $scope.invite.phone, remaining: remaining});
          } else {
            console.log("not promo");
            $state.transitionTo('app.payment', {type: "text", drinkType: "Premium", fId: $scope.invite.phone});
          }
        },

        $scope.$on('modal.removed', function() {
          $ionicViewService.nextViewOptions({
               disableBack: true
            });
          $location.url("/app/senddrink");
        })
        
        
        
})

/**************************************************
 * This controller is similiar to 'sendDrinkText' controller.
 * I created this one becuase I did not want to break 'sendDrinkText' controller.
 * It should merge into 'sendDrinkText' controller.
 **************************************************/


starter.controller('sendDrinkTextViaContacts', function($scope, $stateParams, $http, $window, $ionicModal, $ionicLoading, $rootScope, $state, $ionicPopup) {
        
    $scope.invite = {
            phone: ""
    };
	
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


    $scope.hideModal = function() {
      $rootScope.hideModal();
    },

    
    $scope.hideLoading = function() {
  	    $rootScope.hideLoading();
  	  },

    
    $scope.getContactList = function() {
        $rootScope.hideLoading();
        $window.getContactListFromPhone($scope.getPhonecontactCB);
    }
    
    $scope.getPhonecontactCB = function(contact) {     
        $scope.phoneFriendsList = contact;
        $rootScope.hideLoading();        
    }
    
    $scope.sendDrinkViaContacts = function( phone, mem_id ) {  
        $scope.invite.phone = phone;
        
        $rootScope.hasPromoAccess($scope.hasPromo)
   }
    
    $scope.hasPromo = function(r) {
        if(r.hasPromoAccess) {
          console.log("has promo");
          var remaining = (r.limit > 0) ? r.limit - r.sent : "unlimited";
          $state.transitionTo('app.promo', {type: "text", drinkType: "Premium", fId: $scope.invite.phone, remaining: remaining});
        } else {
          console.log("not promo");
          $state.transitionTo('app.payment', {type: "text", drinkType: "Premium", fId: $scope.invite.phone});
        }
     }


})
