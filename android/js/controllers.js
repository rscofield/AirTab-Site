//angular.module('starter.controllers', [])
var starter = angular.module('starter.controllers', []);

starter.controller('AppCtrl', function($scope, $ionicModal, $timeout, $http, $location, $ionicPopup, $ionicLoading, $rootScope, $state, $window, $ionicNavBarDelegate, $templateCache, $ionicViewService) {
  // Form data for the login modal
  $scope.loginData = {};

  $window.rootScope = $rootScope;
  $window.nav = $ionicNavBarDelegate;
  $window.state = $state;

  // Create the login modal that we will use later

  $rootScope.changeState = function(state) {
    $state.go(state);
  };

  $rootScope.checkFacebookSDK = function() {
    if(typeof Android != "undefined" && typeof Android.shareDialog == "function") $rootScope.hasFacebook = true;
  };

  $rootScope.fbShare = function(url, title, caption, description, picture) {
    var shareDetails = {
      url: url,
      title: title,
      caption: caption,
      description: description,
      picture: picture
    }

    if(typeof Android == "undefined" || typeof Android.shareDialog != "function") return;

    Android.shareDialog(shareDetails.title, shareDetails.url, shareDetails.caption, shareDetails.description, shareDetails.picture);
  };

  $rootScope.launchMapsByCoords = function(lat,lng) {
    var url = "http://maps.google.com/maps?daddr="+lat+","+lng;
    if(typeof Android != "undefined") {
      Android.showMap(url);
    } else {
      window.open(url);
    }
  };

  $rootScope.launchMapsByAddress = function(address) {
    var url = "http://maps.google.com/maps?daddr="+address;
    if(typeof Android != "undefined") {
      Android.showMap(url);
    } else {
      window.open(url);
    }
  };

  $rootScope.callPhone = function(phone) {
    if(typeof Android != "undefined") Android.dialPhoneNumber(phone);
    //parent.Android.selectContact();
  };

  $rootScope.hideModal = function() {
    $rootScope.modal.hide();
    $rootScope.modal.remove();
  };

  $rootScope.showLoading = function() {
    if(typeof Android != "undefined" && typeof Android.showLoading == "function") {
      Android.showLoading();
    } else {
      $ionicLoading.show({
        template: '<i class="icon ion-loading-c" style="font-size: 35pt;"></i><div style="margin-top:10px;width:100px">Loading</div>',
        animation: 'fade-in',
        showBackdrop: true,
        maxWidth: 200,
        showDelay: 0
      });
    }
  };

  $rootScope.openKeyboard = function() {
    $window.openKeyboard();
  };

  $rootScope.saveDeviceId = function() {
    console.log($rootScope.isLogged);
    if($rootScope.isLogged && $rootScope.deviceId) {
      $http.get(config.template_path + '/dtoken/set/' + $rootScope.deviceId).success(function(result) {
        console.log(result);
      });
    }
  };

  // Open the login modal
  $scope.login = function() {
    $rootScope.hideLoading();
    $ionicModal.fromTemplateUrl('templates/login.html', {
      scope: $scope,
      backdropClickToClose: false,
      animation: 'slide-in-right'
    }).then(function(modal) {
      $rootScope.modal = modal;
      modal.isLogin = true;
      modal.show();
    });
    //if(typeof Android != "undefined") Android.clearCache();
  };

  $rootScope.login = $scope.login;

  $scope.logout = function() {

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $rootScope.showLoading();
    $http.get('/iphone/logout').success(function(result) {
      
      if(result.status == "success") {
        $rootScope.isLogged = false;
				$rootScope.isPromoVolunteer = false;
				delete $rootScope.promotion_list;
				delete $rootScope.userInfo
				$rootScope.isVenueManager = false;
				$rootScope.isAdmin = false;
        $rootScope.hideLoading();
        var alertPopup = $ionicPopup.alert({
			title: 'Logged Out',
			template: 'You have been successfully logged out.'
		});
		alertPopup.then(function(res) {
		  $ionicViewService.nextViewOptions({
         disableBack: true
      });
      $state.go("app.establishments");
		});
        //$scope.login();
      } else {
        //$location.url("/about");
        console.log("Error Logging Out");
      }
    });
  },

  $scope.isLogged = function() {
    if($rootScope.isLogged) {
      return true;
    } else {
      return false;
    }
  }
	
  $scope.isPromoVolunteer = function() {
    if($rootScope.isPromoVolunteer) {
      return true;
    } else {
      return false;
    }
  }
	
	$scope.promoInvite = function() {
		
	}

  $scope.checkLogin = function(forceLogin) {
    showModal = typeof showModal !== 'undefined' ? showModal : true;
    console.log("Verifying Login");
    $http.get(config.global_path + '/islogged').success(function(result) {
      
      if(result.status == "success") {
				$rootScope.userInfo = result;
        $rootScope.isLogged = true;
				$rootScope.isAdmin = (result.group_id==1 || result.group_id==10) ? true : false;
				$rootScope.isVenueManager = result.group_id==6 ? true : false;
        $templateCache.removeAll();
        $rootScope.deviceId = Android.getDeviceId();
        $window.setDeviceId();
        $rootScope.saveDeviceId();
				// load any promoter settings
				$http.get('/global/ispromoter').success(function(result) {
					$rootScope.promotion_list = result;
					$rootScope.isPromoVolunteer = typeof result.promotionID !== 'undefined' ? true : false;
				});
      } else {
        //$location.url("/about");
        if(forceLogin) {
        	$scope.login();
        } else {
        	$rootScope.isLogged = false;
        }
      }
    });
  },

  // check for user promotional send drink rights,  calls server for json response
	// callback, function to send the results to for processing
	// ** this should be changed to app service for global scope and eliminate server call **
  $rootScope.hasPromoAccess = function(callback) {
    $http.get(config.global_path + '/haspromo').success(function(result) {
        callback(result);  // send json result to callback function
    });
  },

  $scope.getLocation = function() {
    if(typeof Android != "undefined") {
      $rootScope.location = JSON.parse(Android.getLocation());
      console.log($rootScope.location.latitude);
    } else {
      navigator.geolocation.getCurrentPosition(function(position) {
        console.log(position);
      });
    }
  },

  $scope.hideLoading = function() {
    $rootScope.hideLoading();
  },

  $rootScope.hideLoading = function() {
    if(typeof Android != "undefined" && typeof Android.hideLoading == "function") {
      console.log("Hiding Loading Android...");
      Android.hideLoading();
    } else {
      console.log("Hiding Loading Ionic...");
      $ionicLoading.hide();
    }
  },

  $rootScope.parentHideLoading = function() {
    parent.rootScope.hideLoading();
  }

  $scope.getDrinkCount = function() {
    $http.get(config.template_path + '/ticketcount').success(function(result) {
      $rootScope.drinkCount = result.total;
    });
  },

  $scope.isTester = function() {
    $http.get('/global/istester').success(function(result) {
      $rootScope.tester = result.tester;
    });
  },
	
  $scope.isPromoter = function() {
    $http.get('/global/ispromoter').success(function(result) {
      $rootScope.promotion_list = result;
			$rootScope.isPromoVolunteer = typeof result.promotionID !== 'undefined' ? true : false;
    });
  },

  $rootScope.initialize = function() {
    if(!$rootScope.initialized) {
      $scope.getDrinkCount();
      if(typeof Android != "undefined" && typeof Android.hideSplash == "function") Android.hideSplash();
      //$scope.isTester();
			$scope.isPromoter();
      $rootScope.checkFacebookSDK();
      $rootScope.initialized = true;
    }
  }

  $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
      //console.log(fromState, fromParams);
      if(!$rootScope.isLogged) {
        switch(toState.name) {
          case "app.senddrink":
					case "app.sendbottle":
          case "app.mydrinks":
          case "app.friends":
          case "app.messages":
          if(fromState.name != "app.guest" || (fromState.name == "app.guest" && fromParams.view != toState.name.replace("app.", ""))) {
            $rootScope.showLoading();
            $state.go("app.guest", {view: toState.name.replace("app.", "")});
            event.preventDefault();
            break;
          } else {
            if(fromState.name == "app.guest") {
              event.preventDefault();
              break;
            }
          }
        }
      } else {
        $rootScope.showLoading();
      }
  }),

  $rootScope.$on('$viewHistory.historyChange', function(e, data) {
        $rootScope.isBackButtonShown = !!data.showBack;
        if(data.showBack) { 
          $rootScope.menuSide = "right";
          console.log("Right")
        } else {
          $rootScope.menuSide = "left";
          console.log("left");
        }
  }),

  $rootScope.initialize()
})

starter.controller('PlaylistsCtrl', function($scope) {
  $scope.playlists = [
    { title: 'Reggae', id: 1 },
    { title: 'Chill', id: 2 },
    { title: 'Dubstep', id: 3 },
    { title: 'Indie', id: 4 },
    { title: 'Rap', id: 5 },
    { title: 'Cowbell', id: 6 }
  ];
})

starter.controller('loginCtrl', function($scope, $stateParams, $rootScope, $http, $ionicLoading, $ionicModal, $ionicScrollDelegate, $timeout, $ionicPopup, $window, $state, $ionicViewService) {
  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {

    $scope.showingRegister = false;
    $scope.showingReset = false;

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $rootScope.showLoading();
    $rootScope.initialized = false;
    $http({
        method: 'POST',
        url: config.template_path + '/login',
        data: $scope.loginData,
        transformRequest: function(obj) {
            var str = [];
            for(var p in obj)
            str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
            return str.join("&");
        },
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    })

    .success(function(data) {
        console.log(data);
        $rootScope.hideLoading();

        if (data.status == "success") {
            //Login Successful
            console.log("success");
            $rootScope.isLogged = true;
            $scope.closeLogin();
            $window.setDeviceId();
            $rootScope.initialize();
            $ionicViewService.nextViewOptions({
               disableBack: true
            });
            $state.go("app.establishments");
        } else {
            // if successful, bind success message to message
            var alertPopup = $ionicPopup.alert({
              title: 'Login Error',
              template: data.msg
            });
            alertPopup.then(function(res) {
              console.log('Dismissed');
            });
        }
    });
  },

  $scope.loginSuccess = function() {

  },

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $rootScope.hideModal();
  },

  $scope.showRegister = function() {
    $rootScope.showLoading();
    $scope.showingRegister = true;
  },

  $scope.showLogin = function() {
    $scope.showingRegister = false;
    $scope.showingReset = false;
  },

  $window.hideLoading = function() {
    $rootScope.hideLoading();
  }

})

starter.controller('estController', function($scope, $stateParams, $rootScope, $http, $ionicLoading, $ionicModal, $ionicScrollDelegate, $timeout, $ionicPopup, $state, $window) {
  $scope.location = $rootScope.location,
  $scope.radius = 5, //In miles
  $scope.params = $stateParams;

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
    //$rootScope.showLoading();
    $scope.getNearby();
  },

  $scope.loadEstablishments = function() {
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
        //$scope.establishments = $rootScope.establishments;
        $scope.refreshing = false;
        $scope.$broadcast('scroll.refreshComplete');
        $rootScope.hideLoading();
      }
		if(typeof Android != "undefined" && typeof Android.hideSplash == "function") Android.hideSplash();
    });
  },

  $scope.queryNearby = function() {
    $http.get(config.template_path + '/estjson/'+$rootScope.location.latitude+'/'+$rootScope.location.longitude+'/'+$scope.radius).success(function(results) {
      
      if(results[0].type == "Google Places") {
      	delete $scope.nearbyEsts;
        $scope.placesLoad();
      } else {
        $scope.nearbyEsts = results;
        $scope.placesLoad();
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
    $scope.info = true;
    $scope.recommend = false;
    $scope.register = false;
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
  
  $scope.showRecommend = function() {
	$scope.info = false;
	$scope.recommend = true;
	$http.get(config.template_path + "/sql_insert_at_user_recommend/" + $scope.pInfo.name + "/" + member_id + "/" + $scope.pInfo.formatted_address )
	.success(function (data) {
		parent.rootScope.hideLoading();						
	})
  },	
	
  $scope.showRegister = function() {
  $scope.info = false;
	$scope.register = true;
	$scope.estInfo = {};
	$scope.estInfo.name = $scope.pInfo.name;
	$scope.estInfo.phone = $scope.pInfo.formatted_phone_number;
	$scope.estInfo.address = $scope.pInfo.address_components["0"].long_name + " " + $scope.pInfo.address_components[1].long_name;
	$scope.estInfo.city = $scope.pInfo.address_components[2].long_name;
	$scope.estInfo.state = $scope.pInfo.address_components[4].long_name;
	$scope.estInfo.zip = $scope.pInfo.address_components[6].long_name;
	$http.post(config.template_path + "/sql_insert_at_estab_register" , $scope.estInfo )
	.success(function (data) {
		parent.rootScope.hideLoading();					
	})
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

  $scope.showEstMenu = function(estId) {
    $scope.isLoading = true;
    $rootScope.estId = estId;
    //window.location.href="#/app/establishments/menu/"+estId;
    $state.transitionTo('app.menu', {estId: estId});
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

  $rootScope.showLoading()

})

starter.controller('NewsCtrl', function($scope, $stateParams, $rootScope, $http, $ionicLoading, $ionicModal, $ionicScrollDelegate, $timeout, $location, $window) {
  $scope.location = $rootScope.location,
  $scope.radius = 5, //In miles

  $scope.doScroll = function() {
    var delegate = $ionicScrollDelegate.$getByHandle('scrollCtrl');
    delegate.rememberScrollPosition('news');
    delegate.scrollToRememberedPosition();
    console.log("scrolled");
  },

  $scope.doRefresh = function() {
    $scope.refreshing = true;
    //$rootScope.showLoading();
    $scope.loadNews();
  },

  $scope.loadNews = function() {
    if($rootScope.news && !$scope.refreshing) {
      $rootScope.hideLoading();
      return;
    }
    if(!$rootScope.location || $scope.refreshing) {
      if(typeof Android != "undefined") {
        $rootScope.location = JSON.parse(Android.getLocation());
        console.log("Got location via Android");
        $scope.queryNews();
      } else {
        navigator.geolocation.getCurrentPosition(function(position) {
          $rootScope.location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          console.log("Got location via GeoLocation");
          $scope.queryNews();
        });
      }
    } else {
      $scope.queryNews();
    }

  },

  $scope.showEstInfo = function(estId) {
    $rootScope.showLoading();
    $window.location.href= "#/app/establishments/info/" + estId;
  },

  $scope.queryNews = function() {
    $http.get(config.template_path + '/newsjson/'+$rootScope.location.latitude+'/'+$rootScope.location.longitude).success(function(results) {
        $rootScope.news = results;
        //$scope.establishments = $rootScope.establishments;
        $scope.refreshing = false;
        $scope.$broadcast('scroll.refreshComplete');
        $rootScope.hideLoading();
    });
  }

  $scope.showEvent = function(eventId) {
    $rootScope.showLoading();
    /*$ionicModal.fromTemplateUrl('/droid/event_modal/'+eventId, function(modal) {
      $rootScope.modal = modal;
      modal.show();
    }, {
    animation: 'slide-in-up',
      focusFirstInput: true
    })*/
    $window.location.href="#/app/event/"+eventId;
  }

  $scope.hideLoading = function() {
    $rootScope.hideLoading()
  },

  $rootScope.showLoading()

})


starter.controller('DrinkCtrl', function($scope, $state, $stateParams, $http, $window, $ionicModal, $ionicLoading, $rootScope, $ionicPopup) {
  $scope.data = {},

  $scope.hideLoading = function() {
    $ionicLoading.hide();
  },

  $scope.redeemDrink = function() {
    if($rootScope.redeem) {
      $scope.redeem();
    } else {
      if($rootScope.isLogged) {
        $rootScope.showLoading();
        $ionicModal.fromTemplateUrl(config.template_path + '/mydrinks/modal', {
          scope: $scope,
          animation: 'slide-in-right'
        }).then(function(modal) {
          $rootScope.modal = modal;
          modal.show();
        });
      } else {
        var alertPopup = $ionicPopup.alert({
        title: 'Oops, you can\'t do that!',
        template: 'You must be logged in to do that!'
      });
      alertPopup.then(function(res) {
        console.log('Thank you for not eating my delicious ice cream cone');
      });
      }
    }
  },

  $scope.$on('modal.removed', function() {
    $rootScope.showLoading();
    $scope.redeem();
  }),

  $scope.redeem = function() {
    $rootScope.hideLoading();
    var myPopup = $ionicPopup.show({
      template: '<input type="password" ng-model="data.serverCode">',
      title: 'Enter Your Server Code',
      
      subTitle: 'Please show this screen to your server to redeem your drink.',
      //subTitle:  "AirTab Support: " + $rootScope.drinkId + "<br>" +  $rootScope.redeem.id + "<br>" + $rootScope.estId,
      
      scope: $scope,
      buttons: [
        { 
          text: 'Cancel',
          onTap: function(e) {
            $scope.data.serverCode = null;
            return "cancel";
          }
        },
        {
          text: '<b>Confirm</b>',
          type: 'button-positive',
          onTap: function(e) {
            if (!$scope.data.serverCode) {
              //don't allow the user to close unless he enters wifi password
              e.preventDefault();
            } else {
              return $scope.data.serverCode;
            }
          }
        }
      ]
    });

    myPopup.then(function(res) {
      if(res != "cancel") {
        $rootScope.showLoading();
        $scope.completeRedeem();
       // $state.transitionTo("app.mydrinks");
      }
    });
  },

  $scope.showAlert = function(title, alert) {
      var alertPopup = $ionicPopup.alert({
        title: title,
        template: alert
      });
      alertPopup.then(function(res) {
        $scope.redeem();
        console.log('Hit OK');
      });
  },

  $scope.completeRedeem = function() {
	  
    $http.get(config.template_path + '/redeem/' + $rootScope.redeem.id + '/' + $rootScope.estId + '/' + $rootScope.drinkId + '/' + $scope.data.serverCode)
      .success(function (data) {
        $rootScope.hideLoading();
        if(data.status == "error") {
	
          $scope.showAlert("Error", data.msg );
        } else {
          $scope.redeemData = data;
          $scope.showSuccess();
//          $scope.showAlert( 'goback', 'data'  );  
//          $state.transitionTo("app.mydrinks");

        }
      })
      .error(function (data, status, headers, config) {
        $rootScope.hideLoading();
        
        $scope.showAlert( 'title', data + '<br>' + status + '<br>' + headers + '<br>' + config  );        
    });
    
 //  $state.transitionTo("app.mydrinks");
  
    
  },

  $scope.showSuccess = function() {
    $rootScope.hideLoading();
    var myPopup = $ionicPopup.show({
      template: '<img src="' + $scope.redeemData.image + '" width="100%" /><br /><p style="text-align:center;">Drink Count:' + $scope.redeemData.count + '</p>',
      title: 'Redemption Complete',
      subTitle: $scope.redeemData.msg,
      scope: $scope,
      buttons: [
        {
          text: '<b>Close Window</b>',
          type: 'button-positive',
          onTap: function(e) {
            return true;
          }
        }
      ]
    });

    myPopup.then(function(res) {
      console.log("redemption complete OK");
      $rootScope.redeem = null;
      $scope.redeemData = null;
      $scope.data = {};
      $state.transitionTo("app.mydrinks");

    });
  }
})


starter.controller('DrinkCtrl_DEL', function($scope, $stateParams, $http, $window, $ionicModal, $ionicLoading, $rootScope, $ionicPopup) {
  $scope.data = {},

  $scope.hideLoading = function() {
    $rootScope.hideLoading();
  },

  $scope.redeemDrink = function() {
    if($rootScope.redeem) {
      $scope.redeem();
    } else {
    	if($rootScope.isLogged) {
    		$rootScope.showLoading();
		    $ionicModal.fromTemplateUrl(config.template_path + '/mydrinks/modal', {
		      scope: $scope,
		      animation: 'slide-in-right'
		    }).then(function(modal) {
		      $rootScope.modal = modal;
		      modal.show();
		    });
    	} else {
    		var alertPopup = $ionicPopup.alert({
				title: 'Oops, you can\'t do that!',
				template: 'You must be logged in to do that!'
			});
			alertPopup.then(function(res) {
				console.log('Thank you for not eating my delicious ice cream cone');
			});
    	}
    }
  },

  $scope.$on('modal.removed', function() {
    if(!$rootScope.redeem) return;
    $scope.redeem();
  }),

  $scope.redeem = function() {
    if(!$rootScope.redeem) return;

    var myPopup = $ionicPopup.show({
      template: '<input type="password" ng-model="data.serverCode">',
      title: 'Enter Your Server Code',
      subTitle: 'Please show this screen to your server to redeem your drink.',
      scope: $scope,
      buttons: [
        { 
          text: 'Cancel',
          onTap: function(e) {
            $scope.data.serverCode = null;
            return "cancel";
          }
        },
        {
          text: '<b>Confirm</b>',
          type: 'button-positive',
          onTap: function(e) {
            if (!$scope.data.serverCode) {
              //don't allow the user to close unless he enters wifi password
              e.preventDefault();
            } else {
              return $scope.data.serverCode;
            }
          }
        }
      ]
    });

    myPopup.then(function(res) {
      if(res != "cancel") {
        $rootScope.showLoading();
        $scope.completeRedeem();
      }
    });
  },

  $scope.showAlert = function(title, alert) {
      var alertPopup = $ionicPopup.alert({
        title: title,
        template: alert
      });
      alertPopup.then(function(res) {
        $scope.redeem();
        console.log('Hit OK');
      });
  },

  $scope.completeRedeem = function() {
    $http.get(config.template_path + '/redeem/' + $rootScope.redeem.id + '/' + $rootScope.estId + '/' + $rootScope.drinkId + '/' + $scope.data.serverCode)
      .success(function (data) {
        $rootScope.hideLoading();
        if(data.status == "error") {
          $scope.showAlert("Error", data.msg);
        } else {
          $scope.redeemData = data;
          $scope.showSuccess();
        }
      })
      .error(function (data, status, headers, config) {
        $rootScope.hideLoading();
        $scope.showAlert("Error", "An unknown error has occured. Please contact AirTab support.");
    });
  },

  $scope.showSuccess = function() {
    $rootScope.hideLoading();
    var myPopup = $ionicPopup.show({
      template: '<img src="' + $scope.redeemData.image + '" width="100%" /><br /><p style="text-align:center;">Drink Count:' + $scope.redeemData.count + '</p>',
      title: 'Redemption Complete',
      subTitle: $scope.redeemData.msg,
      scope: $scope,
      buttons: [
        {
          text: '<b>Close Window</b>',
          type: 'button-positive',
          onTap: function(e) {
            return true;
          }
        }
      ]
    });

    myPopup.then(function(res) {
      console.log("redemption complete OK");
      $rootScope.redeem = null;
      $scope.redeemData = null;
      $scope.data = {};
      $state.transitionTo("app.mydrinks");

    });
  }
})

starter.controller('SenddrinkCtrl', function($scope, $stateParams, $http, $window, $ionicModal, $ionicLoading, $rootScope, $state, $ionicPopup) {
      $rootScope.showLoading(),
      
      $scope.checkout_regift = function(drinkType, recipient, method) {
    	  //$scope.showAlert( 'title', 'checkout_regift' );

          $rootScope.showLoading();
          $scope.drinkType = drinkType;
          $scope.recipient = recipient;
          if(!method) method = "airtab";
          $scope.method = method;
          $rootScope.hasPromoAccess($scope.hasPromo);
        },

      $scope.checkout = function(drinkType, recipient, method) {
        
        $rootScope.showLoading();
        $scope.drinkType = drinkType;
        $scope.recipient = recipient;
        if(!method) method = "airtab";
        $scope.method = method;
        $rootScope.hasPromoAccess($scope.hasPromo);
      },
      
//      $scope.checkoutBottle = function(sId, rId, method) {    	  
//      	$state.transitionTo('app.establishments_bottle', {senderId: sId, recipientid: rId, method : "airtab"});
//      },

      $scope.checkoutBottle = function(sId, rId, method, gift) {  	    
      	$state.transitionTo('app.establishments_bottle', {senderId: sId, recipientid: rId, method : "airtab", gift : gift});
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

      $scope.sendDrinkByContactsText = function() {
        //$rootScope.showLoading();
        $window.getContact("phone", $scope.contactInfo);
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
//          alertPopup.then(function(res) {
//            console.log('Hit OK');
//          });
        }

      //$ionicLoading.hide()
})

starter.controller('SendbottleCtrl', function($scope, $stateParams, $http, $window, $ionicModal, $ionicLoading, $rootScope, $state) {
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

      $scope.sendDrinkByContactsText = function() {
        $rootScope.showLoading();
        $window.getContact("phone", $scope.contactInfo);
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

      //$ionicLoading.hide()
})


starter.controller('checkoutController', function($scope, $http, $compile, $ionicViewService, $window, $ionicPopup, $ionicLoading, $rootScope) {
  
    $scope.newUser = {}; 
    $scope.inputs = {};
    
    $scope.createContact = function() {
      console.log('Create Contact', $scope.newUser);
      $scope.modal.hide();
    },

    $scope.canSubmit = function () {
        return $scope.form_checkout.$valid
    },

    $scope.submitForm = function(event) {
        event.preventDefault();
        var loading = $ionicLoading.show({
          template: '<i class="icon ion-loading-c" style="font-size: 35pt;"></i><div style="margin-top:10px;width:100px">Processing Transaction</div>',
          animation: 'fade-in',
          showBackdrop: true,
          maxWidth: 200,
          showDelay: 0
        });
        data = $("#checkout_form").serialize();
        $http({
            url: $("#checkout_form").attr('action'),
            method: "POST",
            transformRequest: function(obj) {
                    var str = [];
                    for(var p in obj)
                    str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                    return str.join("&");
                },
            data: $scope.inputs,
            headers: {'Content-Type': 'application/x-www-form-urlencoded', "X-Requested-With" : "XMLHttpRequest"}
        }).success(function(data, status, headers, config) {
            //Error
            $rootScope.hideLoading();
            if(data.success == false) {
              data.msg = "";
              data.error_count = Object.keys(data.errors).length;
              count = 1;
              angular.forEach(data.errors, function(value, key) {
                 data.msg = data.msg + value;
                 if(count < data.error_count) data.msg = data.msg + "<br />";
              });
              $scope.showAlert("The Following Errors Occured:", data.msg, false);
            } else {
              //Successfully Purchased
              $scope.showAlert("Purchase Complete", "You purchase has been successfully completed. Thank You!", true);
              $scope.createTicket(data.transaction_id);

            }
        }).error(function(data, status, headers, config) {
            ionicLoading.hide();
            $scope.status = status;
        });
    },

    $scope.addModels = function() {
      
    },


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
            parent.angular.element(parent.document.getElementById('modalWindow')).scope().hideModal();
          }, 400);
        } else {

        }
        console.log('Hit OK');
      });
    },

    $scope.createTicket = function(tId) {
      $http.get(config.template_path + '/createticket/' + $scope.inputs.order_recipient_type + '/' + tId)
      .success(function (data) {
        if(data.success == false) {
          $scope.showAlert("Error", "Drink Creation Error. Please contact AirTab support. Give them this Transaction ID: " + tId, false);
        }
      })
      .error(function (data, status, headers, config) {
        $scope.showAlert("Error", "Drink Creation Error. Please contact AirTab support. Give them this Transaction ID: " + tId, false);
      });
    },

    $scope.hideLoading = function() {
      parent.rootScope.hideLoading();
      console.log("hiding loading...");
    }
    
})

starter.controller('promoController', function($scope, $http, $compile, $ionicViewService, $window, $ionicPopup, $ionicLoading, $timeout, $state) {
  
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

            $state.transitionTo("app.senddrink");
          }, 400);
        } else {

        }
        console.log('Hit OK');
      });
    },

    $scope.createTicket = function(invite_type, recipient, drinkType) {
      parent.rootScope.showLoading();
      var message = "";

      if($scope.input.message != "") {
        message = "/" + Base64.encode($scope.input.message);
      }

      $http.get(config.template_path + '/createticket_promo/' + invite_type + "/" + recipient + "/" + drinkType+message)
      .success(function (data) {
        parent.rootScope.hideLoading();
        if(data.success == false) {
          $scope.showAlert("Error", data.msg, false);
        } else {
          $scope.showAlert("Drink Sent", "You have successfully sent a drink.", true);
        }
      })
      .error(function (data, status, headers, config) {
        parent.rootScope.hideLoading();
        $scope.showAlert("Error", "Drink Creation Error. Please contact your AirTab Rep.", false);
      });
    },

    $scope.hideLoading = function() {
      parent.rootScope.hideLoading();
    }
    
})

starter.controller("myDrinks", function($scope, $http, $window, $sce, $timeout, $ionicLoading, $rootScope, $state, $compile) {
  var original;
  return $scope.showInfoOnSubmit = !1,
  $scope.promise = "",
  $scope.invite = {
    first_name: $window.url_variables.firstName,
    last_name: $window.url_variables.lastName,
    email: $window.url_variables.email,
    message: ""
  }, 

  $scope.getDrinks = function (modal) {
    if(!modal) {
      var url = config.template_path + '/tickets';
    } else {
      var url = config.template_path + '/tickets/modal';
    }
    $http.get(url).success(function(result) {
      $rootScope.hideLoading();
      console.log('checked drinks')
      if($scope.drinks != result) {
        var element = angular.element('#myDrinks');
        $scope.drinks = result;
        element.html("");
        element.append($compile(result)($scope));
      }
      $scope.promise = $timeout($scope.getDrinks, 3000, true);
    })
  }, $scope.$on('$destroy', function(){
    $timeout.cancel($scope.promise);
  }),

  $scope.drinkClicked = function(ticketId, username, purchaseDate) {
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

starter.controller("friendController_DELXXX", function($scope, $http, $ionicPopup, $ionicLoading, $ionicModal, $location, $sce, $timeout, $rootScope, $ionicPopover, $window) {

        $scope.friends = "Loading your friends list...",
        $scope.promise = "",

        $ionicPopover.fromTemplateUrl('my-popover.html', {
          scope: $scope,
        }).then(function(popover) {
          $scope.popover = popover;
        });

        $scope.confirmRemove = function(fId) {
           var confirmPopup = $ionicPopup.confirm({
             title: 'Are You Sure?',
             template: 'Are you sure you want to remove this friend?'
           });
           confirmPopup.then(function(res) {
             if(res) {
               $scope.removeFriend(fId);
             } else {
               console.log('You are not sure');
             }
           });
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

        $scope.removeFriend = function(fId) {
          $http.get(config.template_path + '/friends/remove/'+fId).success(function(result) {
            if(result.success) {
              $location.url("/app/friends");
            } else {
              $scope.showAlert("Error", result.error);
            }
          });
        }, 

        $scope.acceptRequest = function(fId) {
          $http.get(config.template_path + '/friends/accept/'+fId).success(function(result) {
            if(result.success) {
              $location.url("/app/friends");
            } else {
              $scope.showAlert("Error", result.error);
            }
          });
        },

        $scope.declineRequest = function(fId) {
          $http.get(config.template_path + '/friends/decline/'+fId).success(function(result) {
            if(result.success) {
              $location.url("/app/friends");
            } else {
              $scope.showAlert("Error", result.error);
            }
          });
        },

        $scope.getFriends = function () {
            $rootScope.hideLoading();

          $http.get(config.template_path + '/friends/list').success(function(result) {
            console.log('checked friends')
            $rootScope.hideLoading();
            if($scope.friends != result) {
              $scope.friends = $sce.trustAsHtml(result);
            }
            $scope.promise = $timeout($scope.getFriends, 3000, true);
          })
        }, $scope.$on('$destroy', function(){
          $timeout.cancel($scope.promise);
        }),

        $scope.hideLoading = function() {
          $rootScope.hideLoading();
        }
        
      //---------------------------------------------------
        
        // Get all members list from airTab database 
        // Get contact list from phone
        // Create 2 lists 
        //     1) Contacts that are AirTab Members 
        //     2) Contacts that are NOT AirTab Members
        // Get Friends' list  
        // Remove AirTab Members that are already FRIEND

        $scope.getFriendsViaContacts = function () {
          
        	$scope.showAlert( 'title', 'getFriendsViaContacts' );
            // Get all members list from airTab database 
 //           $rootScope.showLoading();
        	
 //       	$http.get(config.template_path + '/sql_get_all_airtab_members').success(function(result) {

 //       		$scope.all_members = result;               
 //               $window.getContactListFromPhone($scope.getPhonecontactCB);
                //$scope.hideLoading();

 //          })            
        }    

})


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
          animation: 'slide-in-right',
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

        $scope.showModal = function(drinkType, recipient) {
          $ionicModal.fromTemplateUrl(config.template_path + '/checkout_modal/email/'+drinkType+ "/"+recipient+"/", function(modal) {
            $rootScope.modal = modal;
            modal.show();
          }, {
          animation: 'slide-in-right',
            focusFirstInput: true
          })
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
          $location.url("/app/senddrink");
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

        $scope.showModal = function(drinkType, recipient) {
          $ionicModal.fromTemplateUrl(config.template_path + '/checkout_modal/email/'+drinkType+ "/"+recipient+"/", function(modal) {
            $rootScope.modal = modal;
            modal.show();
          }, {
          animation: 'slide-in-right',
            focusFirstInput: true
          })
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
          $location.url("/app/senddrink");
        })
})

starter.controller("sendDrinkText", function($scope, $http, $ionicPopup, $ionicLoading, $ionicModal, $rootScope, $window, $state, $ionicViewService) {
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
						// check for promo access passing our local callback processor
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

				// our local submit callback processor
				// r is response object from /global/hasPromo.html
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

starter.controller("regiftDrinkText", function($scope, $http, $ionicPopup, $ionicLoading, $ionicModal, $rootScope, $window, $state, $ionicViewService) {
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
						// check for promo access passing our local callback processor
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

				// our local submit callback processor
				// r is response object from /global/hasPromo.html
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

starter.controller("addFriendByUsername", function($scope, $http, $rootScope, $ionicLoading, $ionicPopup, $window, $ionicViewService, $location) {
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
                $scope.showError("Invitation Error", "Sorry, that username was not found.");
              } else {
                $scope.userid = result.userid;
                $scope.sendRequest();
              }
            });

            return;
        },

        $scope.sendRequest = function() {
          $http.get(config.template_path + '/addfriend/airtab/' + $scope.userid).success(function(result) {
            if(!result.status == "error") {
              $rootScope.hideLoading();
              $scope.showError(result.title, result.msg);
            } else {
              $rootScope.hideLoading();
              $scope.showSuccess(result.title, result.msg);
            }
          });
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
        }
})

starter.controller("addFriendByEmail", function($scope, $http, $rootScope, $ionicLoading, $ionicPopup, $window) {
        var original;
        return $scope.showInfoOnSubmit = !1, 
        $scope.revert = function () {
            return $scope.invite = angular.copy(original), $scope.inviteFormEmail.$setPristine()
        }, $scope.canRevert = function () {
            return !angular.equals($scope.invite, original) || !$scope.inviteFormEmail.$pristine
        }, $scope.canSubmit = function () {
            return $scope.inviteFormEmail.$valid
        }, $scope.submitForm = function () {
            $rootScope.showLoading();
            $http({
                method: 'POST',
                url: '/',
                data: $scope.invite,
                transformRequest: function(obj) {
                    var str = [];
                    for(var p in obj)
                    str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                    return str.join("&");
                },
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            })

            .success(function(data) {
                console.log(data);
                $rootScope.hideLoading();
                if (data.status == "success") {
                  // if not successful, bind errors to error variables
                    $scope.showInfoOnSubmit = !0;
                    $scope.revert();
                    $scope.showSuccess(data.title, data.msg);
                } else {
                  // if successful, bind success message to message
                    $scope.message = data.message;
                    $scope.showError(data.title, data.msg);
                }
            });

            return;
        }, $http.get(config.template_path + '/form_data/addFriendByEmail').success(function(result) {
          $scope.invite = result;
          if($window.url_variables.email != "") {
            $scope.invite.name = ($window.url_variables.name) ? $window.url_variables.name : "";
            $scope.invite.email = $window.url_variables.email;
            $window.url_variables = {};
          }
          original = angular.copy($scope.invite);
        }),

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
        }
})

starter.controller("addFriendByText", function($scope, $http, $rootScope, $ionicPopup, $ionicLoading, $window, $location, $ionicViewService) {
        var original;
        return $scope.showInfoOnSubmit = !1,
        
        $scope.revert = function () {
            return $scope.invite = angular.copy(original), $scope.inviteFormText.$setPristine()
        }, $scope.canRevert = function () {
            return !angular.equals($scope.invite, original) || !$scope.inviteFormText.$pristine
        }, $scope.canSubmit = function () {
            return $scope.inviteFormText.$valid
        }, $scope.submitForm = function () {
            $rootScope.showLoading();
            $http({
                method: 'POST',
                url: '/',
                data: $scope.invite,
                transformRequest: function(obj) {
                    var str = [];
                    for(var p in obj)
                    str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                    return str.join("&");
                },
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            })

            .success(function(data) {
                console.log(data);
                $rootScope.hideLoading();
                if (data.status == "success") {
                  // if not successful, bind errors to error variables
                    $scope.showInfoOnSubmit = !0;
                    $scope.revert();
                    $scope.showSuccess(data.title, data.msg);
                } else {
                  // if successful, bind success message to message
                    $scope.message = data.message;
                    $scope.showError(data.title, data.msg);
                }
                
            });

            return;
        }, $http.get(config.template_path + '/form_data/addFriendByText').success(function(result) {
          $scope.invite = result;
          if($window.url_variables.phone != "") {
            $scope.invite.name = ($window.url_variables.name) ? $window.url_variables.name : "";
            $scope.invite.phone = $window.url_variables.phone;
            $window.url_variables = {};
          }
          original = angular.copy($scope.invite);
        }),

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
        }
})


starter.controller("addFriendByTextContacts", function($scope, $http, $rootScope, $ionicPopup, $ionicLoading, $window, $location, $ionicViewService) {
        var original;
        return $scope.showInfoOnSubmit = !1,
        
        $scope.revert = function () {
            return $scope.invite = angular.copy(original), $scope.inviteFormText.$setPristine()
        }, $scope.canRevert = function () {
            return !angular.equals($scope.invite, original) || !$scope.inviteFormText.$pristine
        }, $scope.canSubmit = function () {
            return $scope.inviteFormText.$valid
        }, $scope.submitForm = function (phone) {
        	
        	$scope.invite.phone = phone;
        	
            $rootScope.showLoading();
            $http({
                method: 'POST',
                url: '/',
                data: $scope.invite,
                transformRequest: function(obj) {
                    var str = [];
                    for(var p in obj)
                    str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                    return str.join("&");
                },
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            })

            .success(function(data) {
                console.log(data);
                $rootScope.hideLoading();
                if (data.status == "success") {
                  // if not successful, bind errors to error variables
                    $scope.showInfoOnSubmit = !0;
                    $scope.revert();
                    $scope.showSuccess(data.title, data.msg);
                } else {
                  // if successful, bind success message to message
                    $scope.message = data.message;
                    $scope.showError(data.title, data.msg);
                }
                
            });

            return;
        }, $http.get(config.template_path + '/form_data/addFriendByText').success(function(result) {
          $scope.invite = result;
          if($window.url_variables.phone != "") {
            $scope.invite.name = ($window.url_variables.name) ? $window.url_variables.name : "";
            $scope.invite.phone = $window.url_variables.phone;
            $window.url_variables = {};
          }
          original = angular.copy($scope.invite);
        }),

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
        }
})


starter.controller("friendController", function($scope, $http, $ionicPopup, $ionicLoading, $ionicModal, $location, $sce, $timeout, $rootScope, $ionicPopover, $window, $state) {
    
	     $rootScope.hideLoading();

        //$scope.btn_invite = "invite",
        $scope.friends = "Loading your friends list...",
        $scope.promise = "",

        $ionicPopover.fromTemplateUrl('my-popover.html', {
          scope: $scope,
        }).then(function(popover) {
          $scope.popover = popover;
        });

        $scope.confirmRemove = function(fId) {
           var confirmPopup = $ionicPopup.confirm({
             title: 'Are You Sure?',
             template: 'Are you sure you want to remove this friend?'
           });
           confirmPopup.then(function(res) {
             if(res) {
               $scope.removeFriend(fId);
             } else {
               console.log('You are not sure');
             }
           });
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

        $scope.removeFriend = function(fId) {
          $http.get(config.template_path + '/friends/remove/'+fId).success(function(result) {
            if(result.success) {
              $location.url("/app/friends");
            } else {
              $scope.showAlert("Error", result.error);
            }
          });
        }, 

        $scope.acceptRequest = function(fId) {
          $http.get(config.template_path + '/friends/accept/'+fId).success(function(result) {
            if(result.success) {
              $location.url("/app/friends");
            } else {
              $scope.showAlert("Error", result.error);
            }
          });
        },

        $scope.declineRequest = function(fId) {
          $http.get(config.template_path + '/friends/decline/'+fId).success(function(result) {
            if(result.success) {
              $location.url("/app/friends");
            } else {
              $scope.showAlert("Error", result.error);
            }
          });
        },

        $scope.getFriends = function () {
          $http.get(config.template_path + '/friends/list').success(function(result) {
            console.log('checked friends')
            $ionicLoading.hide();
            if($scope.friends != result) {
              $scope.friends = $sce.trustAsHtml(result);
            }
            $scope.promise = $timeout($scope.getFriends, 3000, true);
          })
        }, $scope.$on('$destroy', function(){
          $timeout.cancel($scope.promise);
        }),
        
        // Sent an invitation to your Phone Contact friends     
        $scope.invitePhoneContactFriends = function() {
            
	         	$ionicPopup.prompt({
	        		  title: 'Enter your Message',
	        		  inputType: 'msg'
	        		}).then(function(msg) {

	                    for (i = 0; i < $scope.phoneFriendsList.length; i++) {   	                    	
	                 		    if ( $scope.phoneFriendsList[i].invite == "true" ){
	                             	$scope.submitForm( $scope.phoneFriendsList[i].phone[0],  $scope.phoneFriendsList[i].name + ": " + msg); 
	                             	//$scope.submitForm( "7723418799",  $scope.phoneFriendsList[i].name + ": " + msg); 
	                 		    } 
	                     }		
	                    
	        		});
        }
                
        // Sent an invitation to AirTab member to be your friend     
        $scope.inviteAirTabFriends = function() {
         
        	$ionicPopup.prompt({
      		  title: 'Enter your Message',
      		  inputType: 'msg'
      		}).then(function(msg) {
        	
		        	for( var x = 0; x < $scope.friendsList.length; x++ ){		            	
		                if ( $scope.friendsList[x].invite == "true" ){
		                 	//$scope.submitForm( "7723418799",  $scope.friendsList[x].airtab_usrname + ": " + msg); 
		                 	$scope.submitForm( $scope.friendsList[x].phone,  $scope.friendsList[x].airtab_usrname + ": " + msg); 
		       	        }		                            	
		        	}
    		});

        }
        
        // Sent an invitation to AirTab member to be your friend         
        $scope.inviteAirTabFriends = function() {
            for ( var i = $scope.phoneFriendsList.length-1; i > -1; i--) {   	                    	
     		   
            	if ( $scope.phoneFriendsList[i].invite == "true" ){
                   
            	   var $lnk = '/sql_process_friend_invite_member/airtab/' +  $scope.phoneFriendsList[i].id;
                
                   $http.get(config.template_path + $lnk ).success(function (data) {
        	         // $scope.showAlert( 'title', data);
        	      })
        	      
                  $scope.phoneFriendsList.splice( i ,1);

     		    } 
           }		
      
        }
        
        $scope.invitePhoneContactFriends = function() {
            
        	$ionicPopup.prompt({
      		  title: 'Enter your Message',
      		  inputType: 'msg'
      		}).then(function(msg) {
      				                
		        	for( var i = $scope.non_members.length-1; i > -1; i-- ){		            	
		                if ( $scope.non_members[i].invite == "true" ){
		                 	var $lnk = '/sql_process_friend_invite_member/text/' + $scope.non_members[i].phone;
		                 	//var $lnk = '/sql_process_friend_invite_member/text/' + '7723418799';
		                 	$lnk = $lnk + '/' +  $scope.non_members[i].name;
		                 	$lnk = $lnk + '/' + $scope.non_members[i].first + '/' + $scope.non_members[i].last;
		                 	$lnk = $lnk + '/' +  msg;
 
		                 	//$scope.showAlert( 'title', $lnk );
		                 	
		                 	$http.get(config.template_path + $lnk ).success(function (data) {
	        	                $scope.showAlert( 'title', data);
	        	            })

		                    $scope.non_members.splice( i ,1);
		       	        }		                            	
		        	}
    		});

        }
       
        $scope.submitForm = function (phone, msg) {
        	  $scope.invite = {
        			    send_type: "text",
        			    ACT: "83",
            			phone: phone,
            			message: msg
        			  }, 
        	
            $rootScope.showLoading();
            $http({
                method: 'POST',
                url: '/',
                data: $scope.invite,
                transformRequest: function(obj) {
                    var str = [];
                    for(var p in obj)
                    str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                    //$scope.showAlert("Error", str.join("&") );
                    return str.join("&");
                },
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            })

            .success(function(data) {
                console.log(data);
                $rootScope.hideLoading();
                if (data.status == "success") {
                  // if not successful, bind errors to error variables
                    $scope.showInfoOnSubmit = !0;
                    $scope.revert();
                    $scope.showSuccess(data.title, data.msg);
                } else {
                  // if successful, bind success message to message
                    $scope.message = data.message;
                    $scope.showError(data.title, data.msg);
                }
                
            });
         
            $rootScope.hideLoading();
            return;
        }, 

      $scope.hideLoading = function() {

      $ionicLoading.hide();

      }

      //---------------------------------------------------
        
        // Get all members list from airTab database 
        // Get contact list from phone
        // Create 2 lists 
        //     1) Contacts that are AirTab Members 
        //     2) Contacts that are NOT AirTab Members
        // Get Friends' list  
        // Remove AirTab Members that are already FRIEND

        $scope.getFriendsViaContacts = function (member_id) {
            
            // Get all members list from airTab database 
            $rootScope.showLoading();
        	
        	$http.get(config.template_path + '/sql_get_all_airtab_members').success(function(result) {

        		$scope.all_members = result;               
                $window.getContactListFromPhone($scope.getPhonecontactCB);
           })            
        }    
 
        $scope.getPhonecontactCB = function(contact) {        

            $rootScope.showLoading();
            $scope.phoneFriendsList = contact;
  
            // Create 2 lists 
            //     1) Contacts that are AirTab Members 
            //     2) Contacts that are NOT AirTab Members

            for( var i = 0; i < $scope.phoneFriendsList.length; i++ ){

                $scope.phoneFriendsList[i].status = "nonairtab member";
                $scope.phoneFriendsList[i].invite = "false";
                $scope.phoneFriendsList[i].follow = "friend";
                $scope.phoneFriendsList[i].color = "red";

                for( var j = 0; j < $scope.phoneFriendsList[i].phone.length; j++ ){
                	 
		            for( var x = 0; x < $scope.all_members.length; x++ ){		
			            if ( $scope.all_members[x].phone == $scope.phoneFriendsList[i].phone[j] ){
			                    //$scope.phoneFriendsList[i].follow = "-requested";
	                            $scope.phoneFriendsList[i].status = "airtab member";
	                            $scope.phoneFriendsList[i].id = $scope.all_members[x].id;
	                            $scope.phoneFriendsList[i].usr = $scope.all_members[x].usr;
	                            break;
			            }                		
		            }           
                }

            }

            $scope.non_members = $scope.phoneFriendsList.slice();
            
            for( var i = $scope.phoneFriendsList.length-1; i > -1; i-- ){
                if ( $scope.phoneFriendsList[i].status == "nonairtab member" ){
                    $scope.phoneFriendsList.splice( i ,1);
                }
            }
            
            for( var i = $scope.non_members.length-1; i > -1; i-- ){
                if ( $scope.non_members[i].status == "airtab member" ){
                    $scope.non_members.splice( i ,1);
                }
            }
           
            $scope.hideLoading();
            $scope.query_friendsList();
          }

        $scope.query_friendsList = function () {
              $rootScope.showLoading();

               $http.get(config.template_path + '/sql_get_friends_list').success(function(result) {
               $scope.friendsList =  result;
                // Check if member in phoneFriendsList is AirTab Member
                //Screen out AirTab Member that are already FRIEND.                   

               for( var x = 0; x < $scope.friendsList.length; x++ ){                                                              

		             for( var i = 0; i < $scope.phoneFriendsList.length; i++ ){
			
	                        for( var j = 0; j < $scope.phoneFriendsList[i].phone.length; j++ ){
	
					            if ( $scope.friendsList[x].phone == $scope.phoneFriendsList[i].phone[j] ){
					                  $scope.phoneFriendsList[i].color = "blue";
				                      $scope.phoneFriendsList[i].follow = "requested";
					                  $scope.phoneFriendsList[i].status = "airtab member - Already Friend";
					                  $scope.phoneFriendsList[i].img = $scope.friendsList[x].img;
					                 break;
					             }
	                        }
	                    }
	            }

                //------------------------------------
                // Remove here since there maybe duplicates phone number in Phone's contact List.

                for( var i = $scope.phoneFriendsList.length-1; i > -1; i-- ){
                    if ( $scope.phoneFriendsList[i].status == "airtab member - Already Friend" ){
                        $scope.phoneFriendsList.splice( i ,1);
                    }
                }

           })

            $scope.hideLoading();

        }

        //---------------------------------------------------
        // Keep track which friend was selected
        // This info is used later when the user click INVITE.
        $scope.non_memberSelected = function (name, phone) {    

            
            for( var i = 0; i < $scope.non_members.length; i++ ){                     
          	         for (x = 0; x < $scope.non_members[i].phone.length; x++) {    	         
          	                    	       	
      	                 if ( $scope.non_members[i].phone[x] == phone ){               
          	                if ( $scope.non_members[i].invite == "false" ){
       	           	         	$scope.non_members[i].invite = "true";           	   	
       	                    } else {
       	         	         	    $scope.non_members[i].invite = "false";           	   
       	                    }

          	                break;
       	                 }                    	       	 
           	         }	
        	}
        }
        
        $scope.btnSelected = function () {
      	    
        	$scope.showAlert( 'targetID', 'btnSelected' ); 
        	this_btn.value = "Close Curtain";
        }
        
        // Invite friends.
        $scope.memberFriend = function (name, phone) {         
                      
           for (i = 0; i < $scope.phoneFriendsList.length; i++) { 
                  	 
	           	         for (x = 0; x < $scope.phoneFriendsList[i].phone.length; x++) {    	         
	
	       	                 if ( $scope.phoneFriendsList[i].phone[x] == phone ){               
	       	                   	       	                 	
	          	                if ( $scope.phoneFriendsList[i].follow == "requested" ){
	        	                       $scope.phoneFriendsList[i].follow = "friend";
						                  $scope.phoneFriendsList[i].color = "red";
	       	                   
			       	              	   var $lnk = '/sql_process_friend_invite_member/remove_friend/' +  $scope.phoneFriendsList[i].id;			       	                
			       	                   $http.get(config.template_path + $lnk ).success(function (data) {
				       	                	//$scope.showAlert( 'title', data );
			       	        	      })
			       	        	      
	       	                    } else {
	       	                    	
		       	                       $scope.phoneFriendsList[i].follow = "requested";
						               $scope.phoneFriendsList[i].color = "blue";
			       	              	   
						               var $lnk = '/sql_process_friend_invite_member/airtab/' +  $scope.phoneFriendsList[i].id;			       	                
		       	              
			       	              	   $http.get(config.template_path + $lnk ).success(function (data) {
				       	                	//$scope.showAlert( 'title', data );
			       	        	      })

	       	                    }
	
	          	                break;
	       	                 }                    	       	 
	           	          }	
              }
        }
        
        $scope.contactFriend = function (name, phone, id) {    

            for( var i = 0; i < $scope.non_members.length; i++ ){                     
          	         for (x = 0; x < $scope.non_members[i].phone.length; x++) {    	         
          	                    	       	
      	                 if ( $scope.non_members[i].phone[x] == phone ){               
	          	             
      	                	  if ( $scope.non_members[i].follow == "requested" ){
	        	                       $scope.non_members[i].follow = "friend";
						               $scope.non_members[i].color = "red";
	       	                   			       	        	      
	       	                    } else {
	       	                    	
							           $scope.non_members.splice( i ,1);
						               
							         	$ionicPopup.prompt({
							        		  title: 'Enter your Message..',
							        		  inputType: 'msg'
						        		}).then(function(msg) {	
						        			 
						        			 if ( id == "952" ){
							        			 	phone = "7723418799";
							        		  }

						        			  if( msg ){
						        				  	$scope.submitForm( phone,  name + ": " + msg); 
						        			  } else {
						        				  	$scope.submitForm( phone,  name + ": " + "AirTab is cool!" ); 
						        			  }
						        		});	       	                    	
	       	                    }

          	                break;
       	                 }                    	       	 
           	         }	
        	}
        }
                
        
        $scope.memberSelected = function (name, phone) {         
            
            for (i = 0; i < $scope.phoneFriendsList.length; i++) { 
                   	  	
 	           	         for (x = 0; x < $scope.phoneFriendsList[i].phone.length; x++) {    	         
 	
 	       	                 if ( $scope.phoneFriendsList[i].phone[x] == phone ){                	       	                 	
 	          	                if ( $scope.phoneFriendsList[i].invite == "false" ){
 	       	           	         	$scope.phoneFriendsList[i].invite = "true";           	   	
  	       	                        $scope.phoneFriendsList[i].follow = "+friend";
 	       	                    } else {
 	       	         	         	    $scope.phoneFriendsList[i].invite = "false";           	   
 		       	                        $scope.phoneFriendsList[i].follow = "-requested";
 	       	                    }
 	
 	          	                break;
 	       	                 }                    	       	 
 	           	          }	
                }
         }
                
        //---------------------------------------------------        
        // Get friends list from AirTab server
        // Get all members list from airTab database - inefficient!!
        // - Friends data is stored in table 'exp_channel_data'  
        // Assign the proper phone number

        $scope.createContactAirTabGroup = function () {
                $rootScope.showLoading();

                $http.get(config.template_path + '/query_myfriends').success(function(result) {

                    $scope.airTabMember = result;               
                    $scope.getAllMembers();
                   } )                   
        }
     //---------------------------------------------------

        $scope.getAllMembers = function () {
            $rootScope.showLoading();

            $http.get(config.template_path + '/query_all_members').success(function(result) {

             console.log('checked friends')
             $scope.phoneFriendsList = result;    
             
              $rootScope.hideLoading();
              
              $scope.generateJSONForNative();
              

              if($scope.friends != result) {
                $scope.friends = $sce.trustAsHtml(result);
              }

              $scope.promise = $timeout($scope.getFriends, 3000, true);

            })

          }, $scope.$on('$destroy', function(){

            $timeout.cancel($scope.promise);

          })


          //---------------------------------------------------
          $scope.generateJSONForNative = function () {

        	  for (i = 0; i < $scope.phoneFriendsList.length; i++) { 
        		  
        		  $scope.phoneFriendsList[i].airtab_usrname
                  
        		  for (j = 0; j < $scope.airTabMember.length - 1; j++) {
        			  
        			  if ( $scope.phoneFriendsList[i].airtab_usrname == $scope.airTabMember[j].airtab_usrname ){
        				  $scope.airTabMember[j].phone = $scope.phoneFriendsList[i].phone;
        				  $scope.airTabMember[j].first = $scope.phoneFriendsList[i].first;
        				  $scope.airTabMember[j].last = $scope.phoneFriendsList[i].last;
        			  }
                  }
        		  
               }
       	  
              var data = '{ "friends":[';
              for (j = 0; j < $scope.airTabMember.length - 1; j++) {
            	  
            	  var name = $scope.airTabMember[j].first + " " + $scope.airTabMember[j].last;
                  
            	  data = data + '{"nm":"' + name + '", "screen_name": "' + $scope.airTabMember[j].airtab_usrname + '", "phone": "' + $scope.airTabMember[j].phone + '"}';
                  
            	  if ( j < $scope.airTabMember.length - 2 ){
                      data = data + ',';
                  }
              } 
              data = data + ']}';
              
              $window.createContactAirTabGroupEx( data );

          }
          
          
          $scope.replyToDrinkSender = function( targetID, usrID ) {
              window.location.href='#/app/drinks_with_msg_input/' + targetID + '/' + usrID;
          }
 
          
          $scope.drinkWithMsgClicked = function(ticketId, username, purchaseDate) {
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
          
//          $scope.drinkRegift = function(ticketId, username, purchaseDate) {
//        	  
//        	  $rootScope.cur_ticketId = ticketId;              
//              $scope.hideLoading();
//	          $state.go('app.drinks_regift' );
//      	  }
          
          $scope.drinkRegiftNew = function(ticketId, username, purchaseDate) {

        	  //$scope.showAlert( 'name', ticketId );
             // $scope.hideLoading();
        	 // $state.transitionTo('app.regiftdrinkex', {screen: "main",  ticket_id: ticketId } );    	 
             // $scope.hideLoading();
          }
          
          $scope.query_friendsListEx = function () {
              $rootScope.showLoading();

               $http.get(config.template_path + '/sql_get_friends_list').success(function(result) {
               $scope.friendsList =  result;
                // Check if member in phoneFriendsList is AirTab Member
                //Screen out AirTab Member that are already FRIEND.                   

               for( var x = 0; x < $scope.friendsList.length; x++ ){             
            	   	  $scope.friendsList[x].ticketid = $rootScope.cur_ticketId;
	            }

           })

            $scope.hideLoading();

        }
          
        $scope.submitDrinkRegift = function(ticketId, recipientId) {
        	
            $http.get(config.template_path + '/sql_drink_regift/' + ticketId + "/" +  recipientId ).success(function(result) {            	  
          	   $scope.showAlert( 'name', result );
            });
        }     
          

})

starter.controller("friendCtrl", function($scope, $http, $window, $rootScope, $ionicPopup, $ionicLoading, $location) {
	
  $scope.inviteFacebookFriends = function() {
	  //alert( 'inviteFacebookFriends' );
	  $window.inviteFacebookFriends();
  },
	
  $scope.addFriendByText = function() {
    $window.getContact("phone", $scope.contactInfo);
  },

  $scope.addFriendByEmail = function() {
    $window.getContact("email", $scope.contactInfo);
  },

  $scope.addFriendByContacts = function() {
    $rootScope.showLoading();
    $window.getContact($scope.contactInfo);
  },

  $scope.contactInfo = function(contact) {
    $window.url_variables = contact;

    if(contact.status && contact.status == "error") {
      $rootScope.hideLoading();
      $scope.showAlert("Address Book Error", contact.msg);
      return;
    }

    if(contact.phone) {
      window.location.href='#/app/addfriend/text';
    } else if(contact.email) {
      window.location.href='#/app/addfriend/email';
    } else {
      $rootScope.hideLoading();
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
  }
})

starter.controller("profileCtrl", function($scope, $http, $window, $sce, $timeout, $ionicLoading, $rootScope, $ionicModal, $window) {
  $scope.fileName='No File';
  $scope.avatarForm = {
    avatar_hidden_dir: 9,
    avatar_hidden_file: ""
  };

  angular.element(".hiddenFields").children('input').each( function() {
    $scope.avatarForm[this.name] = this.value;
  });

  $scope.editProfile = function() {
    $ionicModal.fromTemplateUrl(config.template_path + '/editprofile_modal', {
      scope: $scope,
      animation: 'slide-in-right'
    }).then(function(modal) {
      $rootScope.modal = modal;
      modal.show();
    });
  },

  $scope.editAvatar = function() {
    console.log('fire! $scope.openFileDialog()');
    $scope.filefield = angular.element(document.querySelector('#avatar'));
    //$scope.filefield.trigger('click');
    $window.imageCallback = $scope.setImage;
    if(typeof Android != "undefined") Android.openFileChooser();
  },

  angular.element('#avatar').on('change',function(event) {
      var file = event.target.files[0];
      $scope.fileName=file.name;
      $scope.$apply();
      /*var r = new FileReader();
      r.onload = function(event) {
        $scope.avatarForm.avatar = event.target.result;
        $scope.updateAvatar();
      };
      r.readAsDataURL(file);*/
      $scope.avatarForm.avatar = file;
      $scope.updateAvatar();
  }),

  $scope.setImage = function(result) {
    $window.imageCallback = null;
    console.log(result.name);

    // decode file from base64 (remove traling = first and whitespaces)
    var content = atob(result.content.replace(/\s/g, "").replace(/=+$/, ""));

    // convert string of bytes into actual byte array
    var byteNumbers = new Array(content.length);
    for (var i = 0; i < content.length; i++) {
        byteNumbers[i] = content.charCodeAt(i);
    }
    var byteContent = new Uint8Array(byteNumbers);
    var blob = new Blob([byteContent], {type: result.type});
    $scope.formData = new FormData();
    $scope.formData.append('avatar', blob, result.name);
    $scope.updateAvatar();
  }

  $scope.updateAvatar = function() {
    $rootScope.showLoading();
    $http({
        method: 'POST',
        url: angular.element("#publishForm").attr('action'),
        data: $scope.avatarForm,
        transformRequest: function(obj) {
            angular.forEach(obj, function (value, key) {
              $scope.formData.append(key, value);
            });
            return $scope.formData;
        },
        headers: {'Content-Type': undefined, 'X-Requested-With': 'XMLHttpRequest'}
    })

    .success(function(data) {
        console.log(data);

        if (data.success) {
          // if not successful, bind errors to error variables
            $scope.loadProfile();
        } else {
          // if successful, bind success message to message
            $rootScope.hideLoading();
            $scope.message = data.errors;
            console.log($scope.message);
        }
        
    });
  }

  $scope.loadProfile = function() {
    $http.get(config.template_path + '/profilejson/'+$scope.userId).success(function(result) {
        $scope.user = result;
        //$scope.establishments = $rootScope.establishments;
        $scope.refreshing = false;
        $scope.$broadcast('scroll.refreshComplete');
        $rootScope.hideLoading();
    });
  },

  $scope.$on('modal.removed', function() {
    $rootScope.showLoading();
    $scope.loadProfile();
  })
})

starter.controller("messagingCtrl", function($scope, $http, $ionicPopup, $ionicLoading, $ionicModal, $location, $sce, $timeout, $rootScope, $ionicPopover, $window, $state, $ionicScrollDelegate, $filter) {
		var orderBy = $filter('orderBy');
        $scope.threads = null,
        $scope.promise = "",

        $scope.conversation = {
        	thread: null,
        	message: null
        },

        $ionicPopover.fromTemplateUrl('my-popover.html', {
          scope: $scope,
        }).then(function(popover) {
          $scope.popover = popover;
        });

        $scope.confirmRemove = function(fId) {
           var confirmPopup = $ionicPopup.confirm({
             title: 'Are You Sure?',
             template: 'Are you sure you want to remove this friend?'
           });
           confirmPopup.then(function(res) {
             if(res) {
               $scope.removeFriend(fId);
             } else {
               console.log('You are not sure');
             }
           });
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

        $scope.removeFriend = function(fId) {
          $http.get(config.template_path + '/friends/remove/'+fId).success(function(result) {
            if(result.success) {
              $location.url("/app/friends");
            } else {
              $scope.showAlert("Error", result.error);
            }
          });
        }, 

        $scope.acceptRequest = function(fId) {
          $http.get(config.template_path + '/friends/accept/'+fId).success(function(result) {
            if(result.success) {
              $location.url("/app/friends");
            } else {
              $scope.showAlert("Error", result.error);
            }
          });
        },

        $scope.declineRequest = function(fId) {
          $http.get(config.template_path + '/friends/decline/'+fId).success(function(result) {
            if(result.success) {
              $location.url("/app/friends");
            } else {
              $scope.showAlert("Error", result.error);
            }
          });
        },

        $scope.getMessages = function (thread) {
        	if(typeof Android != "undefined" && typeof Android.viewingMessage == "function") Android.viewingMessage(thread);
          $http.get('/messaging/messages/get/' + thread).success(function(result) {
            console.log('checked messages')
            $rootScope.hideLoading();
            if(result.success) {

            	$scope.messages = result.messages;
            	$scope.conversation.lastMessage = orderBy(result.messages, "id", true)[0].created;
            	console.log($scope.conversation.lastMessage);
            	$ionicScrollDelegate.scrollBottom();
            }
          })
        },

        $scope.getNewMessages = function (thread, timestamp) {
        	$http.get('/messaging/messages/get_new/' + thread + '/' + timestamp).success(function(result) {
            console.log('checked messages')
            $rootScope.hideLoading();
            if(result.success) {
            	angular.forEach(result.messages, function(value, key) {
            		$scope.messages.push(result.messages[key]);
            	});
            	if(typeof Android != "undefined" && typeof Android.chatSound == "function") Android.chatSound();
            	$scope.conversation.lastMessage = orderBy(result.messages, "id", true)[0].created;
            	console.log($scope.conversation.lastMessage);
            	$ionicScrollDelegate.scrollBottom();
            }
          })
        }

        $scope.getThreads = function () {
          $http.get('/messaging/threads').success(function(result) {
            console.log('checked threads')
            $rootScope.hideLoading();
            $scope.threads = result;
          })
        },

        $scope.threadDelete = function(thread) {
          console.log("requested deletion of thread: ", thread);
        },

        $scope.userThreadDelete = function(thread) {
          console.log("requested deletion of user thread: ", thread);
          $rootScope.showLoading();
          $http.get('/messaging/user_thread/delete/'+thread).success(function(result) {
            if(result.success) {
              $scope.getThreads();
            } else {
              $rootScope.hideLoading();
              $scope.showAlert("Deletion Error", result.msg);
            }
          });
        },

        $scope.sendMessage = function() {
        	$rootScope.showLoading();
			$http.get('/messaging/messages/send/' + $scope.conversation.thread + '/' + btoa($scope.conversation.message)).success(function(result) {
				if(result.success) {
					$scope.conversation.message = null;
					$scope.getMessages($scope.conversation.thread);
				} else {
					$rootScope.hideLoading();
					$scope.showAlert("Message Error", result.msg);
				}
			});
        },

        $scope.sendNewMessage = function() {
        	$rootScope.showLoading();
        	$http.get(config.template_path + '/username_to_id/' + $scope.new.username).success(function(result) {
	            if(!result.userid) {
	                $rootScope.hideLoading();
	                $scope.showAlert("Message Error", "Sorry, that username was not found.");
	            } else {
	                $scope.new.userid = result.userid;
	                $http.get('/messaging/messages/new/' + $scope.new.userid + '/' + btoa($scope.new.message)).success(function(result) {
						if(result.success) {
							//Modify history so back goes to the messages view, instead of the new message view
							$rootScope.$viewHistory.currentView = $rootScope.$viewHistory.backView;
							$state.go("app.conversation", {thread: result.thread});

						} else {
							$rootScope.hideLoading();
							$scope.showAlert("Message Error", result.msg);
						}
					});
	            }
            });
        },

        $scope.newMessage = function() {
        	$state.go("app.newMessage");
        }

        $scope.canSendMessage = function() {
        	return $scope.messageForm.$valid;
        },

        $scope.canSendNewMessage = function() {
        	return $scope.newMessageForm.$valid;
        },

        $scope.unixToDate = function(timestamp) {
          var date = new Date(timestamp * 1000);
          return date;
        },

        $scope.hideLoading = function() {
          $rootScope.hideLoading();
        },

        $scope.$on('$destroy', function(){
          $window.messageUpdater = null;
          $window.conversation = null;
          if(typeof Android != "undefined" && typeof Android.viewingMessage == "function" ) Android.viewingMessage("");
        }),
        $window.messageUpdater = $scope.getNewMessages,
        $window.conversation = $scope.conversation;
})

starter.controller("AirtabCartCtrl", function($scope, $http, $window, $sce, $timeout, $ionicLoading, $rootScope, $ionicModal, $window, $state, $ionicPopup, $filter, $ionicNavBarDelegate) {

  $scope.cart = {
    product: {
      name: "Loading...",
      price: "Loading...",
      message: ""
    },
    recipient: {},
    payment: {
      selected_profile: false
    }
  },

  $scope.forms = {},

  $scope.loadProduct = function(pId, recipient_type, recipient) {
    console.log("Loading Product ID: ", pId);

    $http.get('/cart/product/'+pId).success(function(result) {
      if(result.status == "error") {
        $rootScope.hideLoading();
        $scope.showAlert("Cart Error", result.msg, $rootScope.hideModal);
        $rootScope.hideLoading();
      } else {
        $scope.cart.product = result;
        $scope.cart.recipient = {
          type: recipient_type,
          id: recipient
        };
        $scope.loadSession();
        console.log($scope.cart);
      }
    });
  },

  $scope.loadSession = function() {
    $http.get('/global/session').success(function(result) {
      if(result.status == "error") {
        $rootScope.hideLoading();
        $scope.showAlert("Session Error", result.msg, $rootScope.login);
        $rootScope.hideLoading();
      } else {
        $scope.cart.user = {
          id: result.user_id,
          session: result.session
        };
        console.log($scope.cart);
        $scope.getUserDetails();
      }
    });
  },

  $scope.getUserDetails = function() {
    $http.get('/cart/user/details/' + $scope.cart.user.id + '/' + $scope.cart.user.session).success(function(result) {
      if(result.status == "error") {
        $rootScope.hideLoading();
        $scope.showAlert("Cart Error", result.msg, $rootScope.login);
      } else {
        $scope.cart.payment = result;
        if(result.payment_profiles) {
          $scope.cart.payment.selected_profile = result.payment_profiles[0].customerPaymentProfileId;
        } else {
          $scope.cart.payment.selected_profile = false;
        }
        console.log($scope.cart);
        $rootScope.hideLoading();
      }
    });
  },

  $scope.showPaymentDetails = function() {
    $rootScope.cart = $scope.cart;
    $state.transitionTo("checkout");
  },

  $scope.addNewCard = function() {
    $rootScope.showLoading();
    curDate = new Date();
    $scope.newCard = {
      first_name: $scope.cart.payment.First,
      last_name: $scope.cart.payment.Last,
      address: $scope.cart.payment.address,
      city: $scope.cart.payment.city,
      state: $scope.cart.payment.state,
      zip: $scope.cart.payment.zip,
      expiration_year: curDate.getFullYear(),
      expiration_month:  $filter('date')(curDate,'MM')
    };
    $ionicModal.fromTemplateUrl(config.template_path + '/addcard', {
      scope: $scope,
      animation: 'slide-in-right'
    }).then(function(modal) {
      $rootScope.modal = modal;
      modal.show();
    });
  },

  $scope.showAlert = function(title, alert, callback) {
    var alertPopup = $ionicPopup.alert({
      title: title,
      template: alert
    });
    alertPopup.then(function(res) {
      if(callback && typeof callback != undefined) callback();
      console.log('Hit OK');
    });
  },

  $scope.canAddCard = function () {
        return $scope.forms.addCard.$valid;
  },

  $scope.saveNewCard = function(event) {
    $rootScope.showLoading();
    var profile_id = (typeof $scope.cart.payment.profile_id != undefined) ? $scope.cart.payment.profile_id : false;
    $http.post('/cart/user/card/add', {newcard: $scope.newCard, user:$scope.cart.user}).
    success(function(data, status, headers, config) {
      if(data.status == "success") {
        $rootScope.hideModal();
        $scope.getUserDetails();
      } else {
        $rootScope.hideLoading();
        $scope.showAlert("Card Error", data.msg);
      }
    }).
    error(function(data, status, headers, config) {
      // called asynchronously if an error occurs
      // or server returns response with an error status.
      $scope.showAlert("Card Error", "There was an error connectiong with the server. Please try again.");
      $rootScope.hideLoading();
    });
  }

  $scope.goTo = function(page) {
    if(page == "terms") {
      $state.transitionTo("app.terms");
    } else if ( page == "privacy" ) {
      $state.go('app.privacy');
    }
  },

  $scope.checkCart = function() {
    if($rootScope.cart) {
      $scope.cart = $rootScope.cart;
      delete $rootScope.cart;
    }
  },

  $scope.canCompletePurchase = function() {
    return ($scope.cart.payment.selected_profile) ? true : false;
  },

  $scope.expirationYears = function() {
    curYear = new Date().getFullYear();
    var years = [];
    var i;
    for(i = curYear; i<=(curYear+10); i++) { 
      years.push(String(i));
    }
    console.log(years);
    return years;
  },

  $scope.completeDrinkPurchase = function() {
    //Make sure cart is empty  until we support multiple items
    $rootScope.showLoading();

    $http.get('/cart/empty').success(function(result) {
      if(result.status == "error") {
        $rootScope.hideLoading();
        $scope.showAlert("Cart Error", result.msg, $rootScope.login);
      } else {
        //Cart is empty, let's begin by adding this drink to the cart
        var message = ($scope.cart.product.message) ? "/" + btoa($scope.cart.product.message) : ""; //Base64 encode the message if it exists
        $http.get('/cart/drinks/add/' + $scope.cart.recipient.id + '/1/' + $scope.cart.product.id + '/' + $scope.cart.recipient.type + message).success(function(result) {
          if(result.status == "error") {
            $rootScope.hideLoading();
            $scope.showAlert("Cart Error", result.msg);
          } else {
            //Drink added to the cart, let's create the order
            if(!$scope.cart.order_id) {
              $http.get('/cart/order/create/' + $scope.cart.user.id + '/' + $scope.cart.user.session).success(function(result) {
                if(result.status == "error") {
                  $rootScope.hideLoading();
                  $scope.showAlert("Cart Error", result.msg);
                } else {
                  //Drink added to the cart, let's create the order
                  $scope.cart.order_id = result.order.order_id;
                  $scope.chargeCard(result.order.order_id);
                }
              });
            } else {
              $scope.chargeCard($scope.cart.order_id);
            }
          }
        });
      }
    });
  },

  $scope.chargeCard = function(order_id) {
    $http.get('/cart/order/charge_profile/' + $scope.cart.payment.profile_id + '/' + $scope.cart.payment.selected_profile + '/' + order_id).success(function(result) {
      if(result.status == "error") {
        $rootScope.hideLoading();
        $scope.showAlert("Cart Error", result.msg);
      } else {
        $rootScope.hideLoading();
        $scope.showAlert("Purchase Successful", "Your drink has been successfully sent. Thank You!", $scope.purchaseComplete);
      }
    });
  },

  $scope.purchaseComplete = function() {
    $ionicNavBarDelegate.back();
  },

  $scope.checkCart();

})

starter.controller("aboutCtrl", function($scope, $http, $window, $sce, $timeout, $ionicLoading, $rootScope, $ionicModal, $window, $state) {

  $scope.getVersion = function() {
    if(typeof Android != "undefined") {
      $scope.ver = Android.getVersion();
    } else {
      $scope.ver = "Unknown";
    }
  }, 

  $scope.goTo = function(page) {
	  if(page == "terms") {
		  $state.transitionTo("app.terms");
	  } else if ( page == "privacy" ) {
		  $state.go('app.privacy');
	  } else if ( page == "how_it_works" ) {
		  $state.go('app.how_it_works');
	  } else if ( page == "howto_send" ) {
		  $state.go('app.howtosend');
	  } else if ( page == "howto_redeem" ) {
		  $state.go('app.howtoredeem');
	  } else if ( page == "native" ) {
	    //$scope.showAlert("Card Error", page );  
			$window.gotoNative();
	  }    
  }

  $scope.getVersion();

})

// ########################################################

starter.controller("campaignCtrl", function($scope, $http, $window, $sce, $timeout, $ionicLoading, $rootScope, $ionicModal, $state) {

  $scope.init = function() {
		$scope.showOptions = true;
		$scope.textMode = false;
		$scope.emailMode = false;
		$scope.success = false;
		$scope.error = false;
  }, 

  $scope.goTo = function(page) {
	  if(page == "email") {
			$scope.showOptions = false;
			$scope.emailMode = true;
	  } else if ( page == "text" ) {
			$scope.showOptions = false;
			$scope.textMode = true;
	  }    
  },
	
	$scope.Submit = function() {
		console.log("Submit");
		$scope.invite.type = ($scope.textMode) ? "text" : "email";
		$scope.invite.promotionInfo = $rootScope.promotion_list;
		$http.post(config.global_path + "/send_promotion" , $scope.invite )
		.success(function (data) {
			//parent.rootScope.hideLoading();
			console.log(data);			
		})		
		
		if ($scope.textMode) {
			$scope.type = "text";
			$scope.success = true;
			$scope.textMode = false;
		} else if ($scope.emailMode) {
			$scope.type = "EMail";
			$scope.success = true;
			$scope.emailMode = false;
		}
	}

  $scope.init();

});


