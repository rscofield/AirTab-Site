

starter.controller("mydrinksController", function($scope, $http, $ionicPopup, $ionicLoading, $ionicModal, $location, $sce, $timeout, $rootScope, $ionicPopover, $window, $state) {

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

        $scope.sendPromo = function( promoCode ) {
         	
        	// check pro code
        	// check if the member got one
        	// assign drink
        	
            $http.get(config.template_path + '/sql_promo_drinks/' + $scope.promo.code ).success(function(result) {
            	$scope.showAlert( 'Promotion', result );
              });

            $state.transitionTo('app.mydrinks');

        },
        
        $scope.gotoPromo = function( promoCode ) {         
        	//url: "/mydrinks/:screen",
        	
        	if ( promoCode == "promo" ){
        		$state.transitionTo('app.mydrinksPromo', {screen: "promo" });
			} else {
				//   .state('app.howtoredeem', {
		        $state.transitionTo( 'app.howtoredeem' );

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
		                 	$lnk = $lnk + '/' +  $scope.non_members[i].name;
		                 	$lnk = $lnk + '/' + $scope.non_members[i].first + '/' + $scope.non_members[i].last;
		                 	$lnk = $lnk + '/' +  msg;
 
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
          
          $scope.getDrinksWithMsg = function() {
 
        	  $http.get(config.template_path + '/sql_my_drinks_with_msg' ).success(function(result) {            	  
        	    	
        		    $scope.drinksWithMsg = result;                	   
              });
             
        	  $scope.hideLoading();        	  
        	  //$root.hideLoading();
          }
                    
          $scope.replyToDrinkSender = function( targetID, usrID ) {
              window.location.href='#/app/drinks_with_msg_input/' + targetID + '/' + usrID;
          }
          
          
          $scope.redeemDrink = function(ticketId, username, purchaseDate, level) {
							//$scope.showAlert( 'name', 'redeemDrink:' + ticketId );
        	    $rootScope.redeem = {
        	      id: ticketId,
        	      username: username,
        	      purchased: purchaseDate,
								level: level,
								type: "drink"
        	    }
							if (level != "Premium")  $rootScope.redeem.type = "gift";
        	    if($scope.modal) {   	      
        	      $rootScope.hideModal(); //This is in a modal window, close modal
							}
							$state.transitionTo( ($rootScope.redeem.type == "gift" ? "app.redeemsearch" : "app.establishments") );
        	  }
          
           $scope.redeemDrinkAt = function(entryId, estId, usrID, drinkID) {
          	   //$scope.showAlert( 'name', 'redeemDrinkAt:' + entryId );
          	   
                 $state.transitionTo('app.drinkInfoRedeem', {entryId: entryId, estId: estId, usrID : usrID, drinkID : drinkID });                 
          
                 
                 
                 //  $state.transitionTo('app.establishments_bottle', {senderId: senderId, recipientid: result.userid, method : "airtab"});                 
            //    "redeemDrinkAt( '{{drinkMsg.entry_id}}', '{{drinkMsg.redeemed_at}}' , '{logged_in_member_id}', '{{drinkMsg.redeemed_drink_id}}');"> 		           					
                 
           }
           
//           .state('app.drinkInfoRedeem', {
//               url: "/drinkinfo_redeem/:entryId/:estId/:usrID/:drinkID",
//               templateUrl: function(params){ console.log(params); return config.template_path + '/drinkinfo_redeem/'  + params.entryId + '/' + params.estId + '/' + params.usrID + '/' + params.drinkID;},
//               controller: 'AppCtrl',
//               prefetchTemplate: false
//             })
         
//          $scope.drinkRegift = function(ticketId, username, purchaseDate) {       	  
//        	  $rootScope.cur_ticketId = ticketId;              
//              $scope.hideLoading();
//	          $state.go('app.drinks_regift' );
//      	  }
          

          $scope.drinkRegiftNew = function(ticketId, redeemAt, drinkId) {

         	   //$scope.showAlert( 'name', 'ticketId: ' + ticketId  +  '<br>redeemAt: '  + redeemAt +  '<br>drinkId: ' + drinkId );
         	   $state.transitionTo('app.regiftdrink', {screen: "main",  ticket_id: ticketId,  redeemAt: redeemAt,  drinkId: drinkId } );    	 
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


