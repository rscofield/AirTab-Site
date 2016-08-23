

starter.controller("friendViaContactsController", function($scope, $http, $ionicPopup, $ionicLoading, $ionicModal, $location, $sce, $timeout, $rootScope, $ionicPopover, $window, $state) {

        //$scope.btn_invite = "invite",
        $scope.friends = "Loading your friends list...",
        $scope.promise = "",

        $ionicPopover.fromTemplateUrl('my-popover.html', {
          scope: $scope,
        }).then(function(popover) {
          $scope.popover = popover;
        });


        $scope.showAlert = function(title, alert) {
          var alertPopup = $ionicPopup.alert({
            title: title,
            template: alert
          });
          alertPopup.then(function(res) {
            console.log('Hit OK');
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

        $scope.getFriendsViaAndroidContacts = function (member_id) {
        	//$scope.hideLoading();
            //$ionicLoading.hide();
            $rootScope.hideLoading();
        	
        	//$scope.showAlert( 'title', 'getFriendsViaContacts' );
            var r = $window.getAndroidContactList();
            $rootScope.hideLoading();
            $scope.phoneFriendsList = JSON.parse(r);
            
        }    
        
        $scope.selectAndroidContacts = function (name, phone) {
           	//$scope.showAlert( 'title', name );
      	    //$state.transitionTo('app.addfriendText', {screen: "main",  ticket_id: ticketId } );    	 
     	   
        	$state.transitionTo( 'app.addfriendContactText', {phone: phone } );    	 
        	//$state.transitionTo( 'app.addfriendText' );    	 
     	    

//            .state('app.addfriendText', {

        }
        
        $scope.getPhonecontactCB = function(contact) {        

            $rootScope.showLoading();
            $scope.phoneFriendsList = contact;

            // screen out duplicates phone number
            for( var i = $scope.phoneFriendsList.length-1; i > -1; i-- ){
                
            	for( var j = i-1; j > -1; j-- ){		            
            		if ( $scope.phoneFriendsList[i].phone[0] == $scope.phoneFriendsList[j].phone[0] ){
                        $scope.phoneFriendsList.splice( i ,1);
                        //$scope.phoneFriendsList[i].friend = "yes-no";
                        break;
		            }
                }                
            }

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
	                            $scope.phoneFriendsList[i].img = $scope.all_members[x].img;
	                            $scope.phoneFriendsList[i].friend = $scope.all_members[x].friend;
	                            //$scope.phoneFriendsList[i].phoneID = $scope.all_members[x].phone;
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
            
            for( var i = $scope.phoneFriendsList.length-1; i > -1; i-- ){
                if ( $scope.phoneFriendsList[i].friend == "yes" ){
                    $scope.phoneFriendsList.splice( i ,1);
                }
            }
           
            for( var i = $scope.non_members.length-1; i > -1; i-- ){
                if ( $scope.non_members[i].status == "airtab member" ){
                    $scope.non_members.splice( i ,1);
                }
            }

            $scope.hideLoading();

        }
        


        //---------------------------------------------------        
        
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
          
          
          $scope.drinkRegiftNew = function(ticketId, username, purchaseDate) {
         	   $state.transitionTo('app.regiftdrink', {screen: "main",  ticket_id: ticketId } );    	 
          }
                    
        $scope.submitDrinkRegift = function(ticketId, recipientId) {
        	
            $http.get(config.template_path + '/sql_drink_regift/' + ticketId + "/" +  recipientId ).success(function(result) {            	  
          	   $scope.showAlert( 'name', result );
            });
        }     
          

})


