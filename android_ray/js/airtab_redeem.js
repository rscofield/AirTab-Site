
		
		
starter.controller('RedeemCtrl', function($scope, $stateParams, $http, $window, $ionicModal, $ionicLoading, $rootScope, $ionicPopup, $state) {
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
  }
})
