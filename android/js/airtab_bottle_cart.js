

starter.controller("AirtabBottleCartCtrl", function($scope, $http, $window, $sce, $timeout, $ionicLoading, $rootScope, $ionicModal, $window, $state, $ionicPopup, $filter, $ionicNavBarDelegate) {
	
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
  
  
  $scope.completeDrinkPurchase = function(loginID, recipients, estID, drinkID) {
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
        $scope.showAlert("Purchase Successful", "Your gift has been successfully sent. Thank You!", $scope.purchaseComplete);
      }
    });
  },
  
  //****************************************************************************
  $scope.completeBottlePurchase = function(loginID, recipients, estID, drinkID, method ) {
	    //Make sure cart is empty  until we support multiple items
		//$scope.showAlert(drinkID , method );

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
	                  $scope.chargeCardBottle(result.order.order_id, loginID, recipients, estID, drinkID, method);
	                }
	              });
	            } else {
	              $scope.chargeCardBottle($scope.cart.order_id, loginID, recipients, estID, drinkID, method );
	            }
	          }
	        });
	      }
	    });
	  },
	  
	  
	  $scope.chargeCardBottle = function(order_id, loginID, recipients, estID, drinkID, method ) {
	   
	    var url = '/' + loginID + '/' + recipients + '/' + estID + '/' + drinkID + '/' + method;
		
	    $http.get('/cart/order/charge_profile_bottle/' + $scope.cart.payment.profile_id + '/' + $scope.cart.payment.selected_profile + '/' + order_id + url).success(function(result) {
		    	      
	    	if(result.status == "error") {
	           $rootScope.hideLoading();
	           $scope.showAlert("Cart Error", "Error!" );
	       } else {
	        $rootScope.hideLoading();
	        $scope.showAlert("Purchase Successful", "Your gift has been successfully sent. Thank You!", $scope.purchaseComplete);
	      }
	    });
	    
	  },

  
  //****************************************************************************

  $scope.purchaseComplete = function() {
    $ionicNavBarDelegate.back();
  },

  $scope.checkCart();

})

