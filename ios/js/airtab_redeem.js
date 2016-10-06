
		
		
starter.controller('RedeemCtrl', function($scope, $stateParams, $http, $window, $ionicModal, $ionicLoading, $rootScope, $ionicPopup, $state) {

	$scope.location = $rootScope.location;
  $scope.radius = 25; //In miles
  $scope.noVenuesFound = false;
  $scope.fewVenuesFound = false;
  $scope.params = $stateParams;
	$scope.globalPlaces = null;
	$scope.globalSearch = {text: ""};
	$scope.nearbyEsts = {}; 
  $scope.data = {},

  $scope.hideLoading = function() {
    $ionicLoading.hide();
  },
  
  $scope.redeemItemAtEst = function(entryID, estId, usrId, drinkID) {	
	    $scope.redeem(entryID, estId, usrId, drinkID);  
  }

  $scope.redeem = function(entryID, estId, usrId, drinkID) {
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
        $scope.completeRedeem(entryID, estId, usrId, drinkID);
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

  $scope.completeRedeem = function(entryID, estId, usrId, drinkID) {
	  
	$http.get(config.template_path + '/redeem/' + entryID + '/' + estId + '/' + usrId + '/' + $scope.data.serverCode)
      .success(function (data) {
        $rootScope.hideLoading();
        if(data.status == "error") {
	
          $scope.showAlert("Error", data.msg );
        } else {
          $scope.redeemData = data;
          $scope.showSuccess();
        }
      })
      .error(function (data, status, headers, config) {
        $rootScope.hideLoading();
        
        $scope.showAlert( 'title', data + '<br>' + status + '<br>' + headers + '<br>' + config  );        
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
      
      $state.transitionTo('app.mydrinks');
    });
  },
  
  $scope.redeemAtEstab = function(estab_id, drink_id)  {
	  $rootScope.redeem.estab_id = estab_id;
		$rootScope.redeem.drink_id = drink_id;  
		$state.transitionTo('app.drinkInfoRedeem', {entryId: $rootScope.redeem.id, estId: estab_id, usrID: $rootScope.userInfo.member_id, drinkID: drink_id } );
  },
  
  $scope.refreshNearby = function() {
    $scope.refreshing = true;
    //$rootScope.showLoading();
    $scope.getNearby();
  },
  
  $scope.getNearby = function() {

 	  $http.get(config.template_path + '/sql_get_establishments_with_bottle/Meal/'+$rootScope.redeem.level ).success(function(results) {
	       
		    $scope.est_with_bottle = results;
         	
         	x = 0;
         	for ( var j = 0; j <  $rootScope.establishments.length; j++) { 	
         		
    	        for ( var i = 0; i <  $scope.est_with_bottle.length; i++) { 
    	        	if ( ( $scope.est_with_bottle[i].name == $rootScope.establishments[j].title ) && 
    	        	//     ( $scope.est_with_bottle[i].type == "Bottle" ) ){
      	        	    ( $scope.est_with_bottle[i].type == $rootScope.redeem.type ) ){
		        		$scope.nearbyEsts[x] = new Array();
		        		$scope.nearbyEsts[x].bg = $rootScope.establishments[j].bg;
		        		$scope.nearbyEsts[x].id = $rootScope.establishments[j].id;
		        		$scope.nearbyEsts[x].title = $rootScope.establishments[j].title;
		        		$scope.nearbyEsts[x].distance = $rootScope.establishments[j].distance;
		        		$scope.nearbyEsts[x].drink_id = $scope.est_with_bottle[i].drink_id;
		        		x = x + 1;
		        		break;
    	        	}
    	        }
        	}
          $scope.noVenuesFound = false;
          $scope.fewVenuesFound = false;
          if(x < 4) {
            $scope.placesLoad();
            if(x<1){
              $scope.noVenuesFound = true;
            } else {
              $scope.fewVenuesFound = true;
            }
          }
					$rootScope.hideLoading();
  	  });
	  
  },

  $scope.gotNearbyLocation = function() {
    console.log("Got location via iOS");
    if($rootScope.location.status == "error") {
      $ionicLoading.hide();
      $scope.$broadcast('scroll.refreshComplete');
    } else if ($rootScope.location.status == "disabled") {
      $ionicLoading.hide();
      $scope.$broadcast('scroll.refreshComplete');
    } else {
      $scope.queryNearby();
    }
  },
	
  $scope.queryNearby = function() {
    $http.get(config.template_path + '/estjson/'+$rootScope.location.latitude+'/'+$rootScope.location.longitude+'/'+$scope.radius).success(function(results) {
		//$http.get(config.template_path + '/estjson/'+26.775039+'/'+-80.136109+'/'+$scope.radius).success(function(results) {
      if(results[0].type == "Google Places") {
      	delete $scope.nearbyEsts;
        $scope.placesLoad();
      } else {
        $scope.nearbyEsts = results;
        $scope.placesLoad();
        $ionicLoading.hide();
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
				radius:16000,
        types: ['bar', 'night_club', 'restaurant', 'cafe'],
        //rankBy: google.maps.places.RankBy.DISTANCE
      };

      var service = new google.maps.places.PlacesService(attrib);
      service.nearbySearch(request, function(results,status) {
        $scope.places = results;
        $ionicLoading.hide();
        $scope.$broadcast('scroll.refreshComplete');
				//Hide startup Splash screen
				if(bridge) {
						bridge.callHandler("hideSplash", null, function(r) {
							console.log("Splash Hidden");
						});
				}
      });
    } else {
      console.log("No Google API");
    }
  },
	
	$scope.refreshSearch = function() {
		delete $scope.globalPlaces;
    $scope.noVenuesFound = true;
    $scope.fewVenuesFound = false;
    if(typeof google != "undefined") {
      var attrib = document.getElementById("placesAttribs");
      //var location = new google.maps.LatLng($rootScope.location.latitude,$rootScope.location.longitude);
			var location = new google.maps.LatLng(27.63007,-80.420380);

      var request = {
 				query: $scope.globalSearch.text,
				//query: "Applebees",
				types: ['bar', 'night_club', 'restaurant', 'cafe']
      };
      var service = new google.maps.places.PlacesService(attrib);
      service.textSearch(request, function(results,status) {
        $scope.globalPlaces = results;
        // get location from first place found and do search on airtab establishments
        
        
        //
        $ionicLoading.hide();
        $scope.$broadcast('scroll.refreshComplete');
      });
    } else {
      console.log("No Google API");
    }
	}
  
})
