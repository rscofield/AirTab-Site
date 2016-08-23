

starter.controller("sendBottleByUsername", function($scope, $http, $rootScope, $ionicLoading, $ionicPopup, $window, $ionicViewService, $location, $ionicModal, $state) {

	
	    var original;
        return $scope.showInfoOnSubmit = !1, 
        $scope.revert = function () {
            return $scope.invite = angular.copy(original), $scope.inviteFormUsername.$setPristine()
        }, $scope.canRevert = function () {
            return !angular.equals($scope.invite, original) || !$scope.inviteFormUsername.$pristine
        }, $scope.canSubmit = function () {
            return $scope.inviteFormUsername.$valid
 
        },
        
        $scope.submitPurchaseGift = function ( item_id, estId, senderId, recipientId, method ) {
        	         	
        	$scope.item_id = item_id;
        	$scope.estId = estId;
        	$scope.senderId = senderId;
        	$scope.recipientId = recipientId;
        	$scope.method = method;
       	

            $rootScope.hasPromoAccess($scope.hasPromo);

        }, 
        
        $scope.viewGiftDetails = function ( item_id, estId, senderId, recipientId, method ) {
          	$state.transitionTo('app.giftInfo', {type: method, estId : estId, item_id : item_id, senderId : senderId, recipientid: recipientId });
        },
                
        $scope.hasPromo = function(r) {
            
        	if(r.hasPromoAccess) {

				if( $scope.method == "airtab" ){
				
					$state.transitionTo('app.promobottle', {type: $scope.method, estId : $scope.estId, item_id : $scope.item_id, senderId : $scope.senderId, recipientid: $scope.recipientId });
				
				} else if( $scope.method == "email" ){
					
					$state.transitionTo('app.promobottle', {type: $scope.method, estId : $scope.estId, item_id : $scope.item_id, senderId : $scope.senderId, recipientid: $scope.recipientId });
				
				} else if( $scope.method == "text" ){
					$state.transitionTo('app.promobottle', {type: $scope.method, estId : $scope.estId, item_id : $scope.item_id, senderId : $scope.senderId, recipientid: $scope.recipientId });            
				}

           
            } else {
                                
            	$state.transitionTo('app.paymentbottle', {type: $scope.method, estId: $scope.estId, drinkId: $scope.item_id, recipientId: $scope.recipientId});           	    	   
            }
        }, 

        
        $scope.submitFormBottle = function (senderId,gift) {
//          	$scope.showSuccess( 'submitFormBottle', 'REMOVE IT'  );          
            $http.get(config.template_path + '/username_to_id/' + $scope.invite.username).success(function(result) {
                if(!result.userid) {
                  $rootScope.hideLoading();
                  $scope.showError("Send Drink Error", "Sorry, that username was not found.");
                } else {               	
                  $state.transitionTo('app.establishments_bottle', {senderId: senderId, recipientid: result.userid, method : "airtab", gift : gift});                 
                }
              });
            return;           
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


starter.controller('estBottleController', function($scope, $stateParams, $rootScope, $http, $ionicLoading, $ionicModal, $ionicScrollDelegate, $timeout, $ionicPopup, $state, $window) {
  $scope.location = $rootScope.location,
  $scope.radius = 5, //In miles
  $scope.params = $stateParams;
  $scope.estWithBottle = {}; 

  $scope.doScroll = function() {
    var delegate = $ionicScrollDelegate.$getByHandle('scrollCtrl');
    delegate.rememberScrollPosition('establishments');
    delegate.scrollToRememberedPosition();
    console.log("scrolled");
  },

  $scope.getCollectionHeight = function() {
    var w = $("#widthTest").width();
    return (w*0.728)+20;
  },

  $scope.getImageHeight = function() {
    var w = $("#widthTest").width();
    return (w*0.5);
  },
  $scope.isDrinkView = function() {
    return ($scope.params.estId == null) ? true : false;
  },

  $scope.doRefresh = function() {
    $scope.refreshing = true;
    //$rootScope.showLoading();
    $scope.loadEstablishments();
  },

  $scope.refreshNearby = function() {
    $scope.refreshing = true;
    
    $scope.getNearby();
  },

  $scope.loadEstablishments = function( gift ) {

	  $http.get(config.template_path + '/sql_get_establishments_with_bottle/' ).success(function(results) {
	       
		    $scope.est_with_bottle = results;
         	
         	x = 0;
         	for ( var j = 0; j <  $rootScope.establishments.length; j++) { 	
         		
    	        for ( var i = 0; i <  $scope.est_with_bottle.length; i++) { 
    	        	if ( ( $scope.est_with_bottle[i].name == $rootScope.establishments[j].title ) && 
    	        	//     ( $scope.est_with_bottle[i].type == "Bottle" ) ){
      	        	    ( $scope.est_with_bottle[i].type == gift ) ){
		        		$scope.estWithBottle[x] = new Array();
		        		$scope.estWithBottle[x].bg = $rootScope.establishments[j].bg;
		        		$scope.estWithBottle[x].id = $rootScope.establishments[j].id;
		        		$scope.estWithBottle[x].title = $rootScope.establishments[j].title;
		        		$scope.estWithBottle[x].distance = $rootScope.establishments[j].distance;
		        		x = x + 1;
		        		break;
    	        	}
    	        }
        	}
        	
	  });


    if($rootScope.establishments && ! $scope.refreshing) {
      $rootScope.hideLoading();
      return;
    }
    if(!$rootScope.location || $scope.refreshing) {
      if(typeof Android != "undefined") {
        $rootScope.location = JSON.parse(Android.getLocation());
        console.log("Got location via Android");
        if($rootScope.location.status == "not found") {
          navigator.geolocation.getCurrentPosition(function(position) {
            $rootScope.location = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            };
            $scope.queryEstablishments();
          });
        } else if ($rootScope.location.status == "disabled") {
          $rootScope.hideLoading();
          $scope.$broadcast('scroll.refreshComplete');
        } else {
          $scope.queryEstablishments();
        }
      } else {
        navigator.geolocation.getCurrentPosition(function(position) {
          $rootScope.location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          console.log("Got location via GeoLocation");
          $scope.queryEstablishments();
        });
      }
    } else {
      $scope.queryEstablishments();
    }

  },

  $scope.showLocationPrefs = function() {
    if(typeof Android != "undefined") {
      Android.showLocationSettings();
    }
  },

  $scope.queryEstablishments = function() {
	  

    $http.get(config.template_path + '/estjson/'+$rootScope.location.latitude+'/'+$rootScope.location.longitude).success(function(results) {
      
      if(results[0].type == "Google Places") {
        
      } else {
        $rootScope.establishments = results;
    	          
        $scope.refreshing = false;
        $scope.$broadcast('scroll.refreshComplete');
        $rootScope.hideLoading();
      }
    });
  },

  $scope.queryNearby = function() {
    $http.get(config.template_path + '/estjson/'+$rootScope.location.latitude+'/'+$rootScope.location.longitude+'/'+$scope.radius).success(function(results) {
      
      if(results[0].type == "Google Places") {
        $scope.placesLoad();
      } else {
        $scope.nearbyEsts = results;
        $rootScope.hideLoading();
        $scope.$broadcast('scroll.refreshComplete');
      }
    });
  },

  $scope.placesLoad = function() {
    if(typeof google != "undefined") {
      var attrib = document.getElementById("placesAttribs");
      var location = new google.maps.LatLng($rootScope.location.latitude,$rootScope.location.longitude);

      var request = {
        location: location,
        types: ['bar', 'night_club'],
        rankBy: google.maps.places.RankBy.DISTANCE
      };

      var service = new google.maps.places.PlacesService(attrib);
      service.nearbySearch(request, function(results,status) {
        $scope.places = results;
        $rootScope.hideLoading();
        $scope.$broadcast('scroll.refreshComplete');
      });
    } else {
      console.log("No Google API");
    }
  },

  $scope.getNearby = function() {
    if($scope.isLoading) return;
    if(!$scope.places && !$scope.nearbyEsts && !$scope.refreshing) $rootScope.showLoading();
    if(!$rootScope.location || $scope.refreshing ) {
      if(typeof Android != "undefined") {
        $rootScope.location = JSON.parse(Android.getLocation());
        if($rootScope.location.status == "not found") {
          navigator.geolocation.getCurrentPosition(function(position) {
            $rootScope.location = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            };
            $scope.queryNearby();
          });
        } else if ($rootScope.location.status == "disabled") {
          $rootScope.hideLoading();
          $scope.$broadcast('scroll.refreshComplete');
        } else {
          $scope.queryNearby();
        }
        
      } else {
        navigator.geolocation.getCurrentPosition(function(position) {
          $rootScope.location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          $scope.queryNearby();
        });
      }
    } else {
      $scope.queryNearby();
    }
  },

  $scope.gotNearbyLocation = function() {
    console.log("Got location via iOS");
    if($rootScope.location.status == "error") {
      $rootScope.hideLoading();
      $scope.$broadcast('scroll.refreshComplete');
    } else if ($rootScope.location.status == "disabled") {
      $rootScope.hideLoading();
      $scope.$broadcast('scroll.refreshComplete');
    } else {
      $scope.queryNearby();
    }
  },

  $scope.getPlaceInfo = function(id) {
    var attrib = document.getElementById("placesAttribs");

    var request = {
      placeId: id
    };

    var service = new google.maps.places.PlacesService(attrib);
    service.getDetails(request, $scope.placeInfo);
  },

  $scope.placeInfo = function(results, status) {
    var location = null;
    var map = null;
    var marker = null;
    location = new google.maps.LatLng(results.geometry.location.lat(),results.geometry.location.lng());
    map = new google.maps.Map(document.getElementById('placeMap_'+results.place_id), {
      center: location,
      zoom: 15
    });
    marker = new google.maps.Marker({
        position: location,
        map: map,
        title: results.name
    });
    $scope.pInfo = results;
    $rootScope.hideLoading();
  },

  $scope.showModal = function(estId) {
    $ionicModal.fromTemplateUrl(config.template_path + '/places_modal/'+estId, function(modal) {
      $rootScope.modal = modal;
      modal.show();
    }, {
    animation: 'slide-in-right',
      focusFirstInput: true
    });
  },

  $scope.hideModal = function() {
    $rootScope.modal.hide();
    $rootScope.modal.remove();
  },

  $scope.showEstMenu = function(estId, sender, recipient, method, gift ) {
	
	// weird issue
	sender = "0" + sender; // the system will fail if sender = 30, padding it with "0" fix the problem
	recipient = "0" + recipient; // the system will fail if recipient = 30, padding it with "0" fix the problem
	
    $scope.isLoading = true;
    $rootScope.estId = estId;
    
    $state.transitionTo('app.menuBottle', {estId: estId, sender: sender, recipient : recipient, method : method, gift : gift } );
    
  },

  $scope.hideLoading = function() {
    $rootScope.hideLoading();
  },

  $scope.drinkInfo = function(id) {
    $rootScope.drinkId = id;
    //window.location.href="#/app/drinkinfo/"+id;
    $stateParams.estId = $rootScope.estId;
    $state.transitionTo('app.drinkInfo', {estId: null, drinkId: id});
  },

  $scope.showAlert = function(title, alert) {
      var alertPopup = $ionicPopup.alert({
        title: title,
        template: alert
      });
      alertPopup.then(function(res) {
        console.log('Hit OK');
      });
    }

  $rootScope.showLoading()

})


starter.controller('promoBottleController', function($scope, $http, $compile, $ionicViewService, $window, $ionicPopup, $ionicLoading, $timeout, $state) {
  
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

//            $state.transitionTo("app.senddrink");
            $state.transitionTo("app.sendbottle");
       //     $state.transitionTo( "app.sendbottle", { method: 'bottle'} );
          }, 400);
        } else {

        }
        console.log('Hit OK');
      });
    },
    
    $scope.createTicketForBottle = function( method, estId, itemId, sendId, recipeintId ) {
        
  //      $scope.showAlert("Drink Sent", "method: " + method, true);

        var message = "";

        if($scope.input.message != "") {
          message = btoa( $scope.input.message );
        }


       // $http.get(config.template_path + '/sql_createticket_promo_bottle/' + "airtab" + "/" + recipeintId + "/" + estId + "/" + itemId + "/" + message  )
        $http.get(config.template_path + '/sql_createticket_promo_bottle/' + method + "/" + recipeintId + "/" + estId + "/" + itemId + "/" + message  )
        .success(function (data) {
          parent.rootScope.hideLoading();
          if(data.success == false) {
            $scope.showAlert("Error", data.msg, false);
          } else {
            $scope.showAlert("Gift Sent", "You have successfully sent a gift.", true);
          }
        })
    }
    
    $scope.hideLoading = function() {
      parent.rootScope.hideLoading();
    }
    
})

starter.controller('SendbottleCtrl', function($scope, $stateParams, $ionicPopup, $http, $window, $ionicModal, $ionicLoading, $rootScope, $state) {
      $rootScope.showLoading(),

      $scope.checkout = function(drinkType, recipient, method) {
        $rootScope.showLoading();
        $scope.drinkType = drinkType;
        $scope.recipient = recipient;
        if(!method) method = "airtab";
        $scope.method = method;
        $rootScope.hasPromoAccess($scope.hasPromo);
      },

      $scope.hasPromo = function(r) {
        if(r.hasPromoAccess) {
          console.log("has promo");
          var remaining = (r.limit > 0) ? r.limit - r.sent : "unlimited";
          $state.transitionTo('app.promo', {type: $scope.method, drinkType: $scope.drinkType, fId: $scope.recipient, remaining: remaining});
        } else {
          console.log("not promo");
          $state.transitionTo('app.payment', {type: $scope.method, drinkType: $scope.drinkType, fId: $scope.recipient});
        }
      },

      $scope.hideModal = function() {
        $rootScope.hideModal();
      },

      $scope.hideLoading= function() {
        $rootScope.hideLoading();
      },

      $scope.sendBottleByContactsText = function( memId, gift ) {
        $rootScope.showLoading();
        $scope.senderId = memId;
				$scope.gift = gift;
 
        $window.getContact( $scope.contactInfoPhone);
      },

      $scope.contactInfoPhone = function(r) {
      	
    	$state.transitionTo('app.establishments_bottle', {senderId: $scope.senderId, recipientid: r.phone, method : "text", gift : $scope.gift});
       },
      
      $scope.sendDrinkByContactsEmail = function() {
        $rootScope.showLoading();
        $window.getContact("email", $scope.contactInfo);
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

      $scope.showAlert = function(title, alert) {
          var alertPopup = $ionicPopup.alert({
            title: title,
            template: alert
          });
          alertPopup.then(function(res) {
            console.log('Hit OK');
          });
        },

      $ionicLoading.hide()
})

starter.controller("sendBottleEmail", function($scope, $http, $ionicPopup, $ionicLoading, $ionicModal, $rootScope, $ionicViewService, $window, $state) {
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

		$scope.submitFormBottleEmail = function (senderId, gift) {                 
        	$state.transitionTo('app.establishments_bottle', {senderId: senderId, recipientid: $scope.invite.email, method : "email", gift : gift});
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



starter.controller("sendBottleText", function($scope, $http, $ionicPopup, $ionicLoading, $ionicModal, $rootScope, $window, $state) {
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

		$scope.submitFormBottleText = function (senderId, gift) {                 
        	$state.transitionTo('app.establishments_bottle', {senderId: senderId, recipientid: $scope.invite.phone, method : "text", gift : gift});
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

