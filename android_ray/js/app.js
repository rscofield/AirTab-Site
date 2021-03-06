// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
if(typeof Android != "undefined") Android.clearCache();

var url_variables = {};
var contactCallback = null;
var rootScope = null;
var nav = null;
var state = null;
var imageCallback = null;

var config = {
  template_path: "/android_ray",
  global_path: "/global",
  version: "1.03",
  platform: "Android"
}

var app = angular.module('starter', ['ionic', 'starter.controllers'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

    .state('checkout', {
      url: '/checkout',
      templateUrl: config.template_path + "/checkout",
      controller: 'AirtabCartCtrl',
      prefetchTemplate: false
    })

    .state('editprofile', {
      url: '/profile/edit',
      templateUrl: config.template_path + "/editprofile",
      controller: 'AppCtrl',
      prefetchTemplate: false
    })

    .state('app', {
      url: "/app",
      abstract: true,
      templateUrl: "templates/menu.html",
      controller: 'AppCtrl',
      prefetchTemplate: false
    })

    .state('app.payment', {
      url: '/payment/:type/:drinkType/:fId',
      templateUrl: function(params){ return config.template_path + '/payment/' + params.type + "/" + params.drinkType + "/" + params.fId;},
      controller: 'AppCtrl',
      prefetchTemplate: false
    })
    
 //	 .state('app.paymentbottle', {
//		 url: '/payment_bottle/:type/:estId/:drinkId/:recipientId',
//		 templateUrl: function(params){ return config.template_path + '/payment_bottle/' + params.type + "/" +  params.estId + "/" + params.drinkId + "/" + params.recipientId;},
//		 controller: 'AppCtrl',
//		 prefetchTemplate: false
//	   })
   
	 .state('app.paymentbottle', {
		 url: '/payment_bottle/:type/:estId/:drinkId/:recipientId',
		 templateUrl: function(params){ return config.template_path + '/payment_bottle/' + params.type + "/" +  params.estId + "/" + params.drinkId + "/" + params.recipientId;},
		 controller: 'AppCtrl',
		 prefetchTemplate: false
	   })

    .state('app.establishments', {
      url: "/establishments",
          templateUrl: config.template_path + "/establishments",
          controller: 'AppCtrl',
      prefetchTemplate: false
    })
                          
 //   .state('app.establishments_bottle', {
 //         url: "/establishments_bottle/:senderId/:recipientid/:method",
 //         templateUrl: function(params){ return config.template_path + '/establishments_bottle/' + params.senderId + "/" + params.recipientid+ "/" + params.method;},
 //         controller: 'AppCtrl',
 //     prefetchTemplate: false
 //   })

   .state('app.establishments_bottle', {
          url: "/establishments_bottle/:senderId/:recipientid/:method/:gift",
          templateUrl: function(params){ return config.template_path + '/establishments_bottle/' + params.senderId + "/" + params.recipientid+ "/" + params.method+ "/" + params.gift;},
          controller: 'AppCtrl',
      prefetchTemplate: false
    })

    .state('app.menu', {
      url: '/menu/:estId',
      params: {
        estId: {value: null}
      },
      templateUrl: function($stateParams){ return ($stateParams.estId) ? config.template_path + '/menu/'  + $stateParams.estId : false;},
      controller: 'estController',
      prefetchTemplate: false
    })
		
//     .state('app.menuBottle', {
//      url: '/menubottle/:estId/:sender/:recipient/:method',
//          templateUrl: function(params){ return config.template_path + '/menu_bottle/'  + params.estId + "/" +  params.sender + "/" + params.recipient + "/" + params.method;},
//          controller: 'estController',
//      prefetchTemplate: false
//    })
    
    .state('app.menuBottle', {
          url: '/menubottle/:estId/:sender/:recipient/:method/:gift',
          templateUrl: function(params){ return config.template_path + '/menu_bottle/'  + params.estId + "/" +  params.sender + "/" + params.recipient + "/" + params.method + "/" + params.gift;},
          controller: 'estController',
          prefetchTemplate: false
    })

    .state('app.estInfo', {
      url: '/establishments/info/:estId',
          templateUrl: function(params){ return config.template_path + '/establishment/'  + params.estId;},
          controller: 'AppCtrl',
      prefetchTemplate: false
    })

    .state('app.drinkInfo', {
      url: "/drinkinfo/:drinkId",
          templateUrl: function(params){ return config.template_path + '/drinkinfo/'  + params.drinkId;},
          controller: 'DrinkCtrl',
      prefetchTemplate: false

    })

    
    .state('app.giftInfo', {
      url: "/giftInfo/:type/:estId/:item_id/:senderId/:recipientid",
      templateUrl: function(params){  return config.template_path + '/giftInfo/' + "/" + params.type + "/" + params.estId + "/" + params.item_id + "/" + params.senderId + "/" + params.recipientid;},
      controller: 'AppCtrl',
      prefetchTemplate: false
    })

    .state('app.drinkInfoRedeem', {
        url: "/drinkinfo_redeem/:entryId/:estId/:usrID/:drinkID",
        templateUrl: function(params){ console.log(params); return config.template_path + '/drinkinfo_redeem/'  + params.entryId + '/' + params.estId + '/' + params.usrID + '/' + params.drinkID;},
        controller: 'AppCtrl',
        prefetchTemplate: false
      })

    .state('app.news', {
      url: "/news",
          templateUrl: config.template_path + "/news",
          controller: 'AppCtrl',
      prefetchTemplate: false
    })

    .state('app.event', {
      url: "/event/:eventId",
          templateUrl: function(params){ return config.template_path + '/event/'  + params.eventId;},
          controller: 'AppCtrl',
      prefetchTemplate: false

    })

    .state('app.senddrink', {
      url: "/senddrink",
          //templateUrl: config.template_path + "/send_drink"
          templateUrl: config.template_path + "/send_drink",
          controller: 'SenddrinkCtrl'
    })

    .state('app.senddrinkAirtab', {
      url: "/senddrink/airtab",
          templateUrl: config.template_path + "/send_drink/airtab",
          controller: 'SenddrinkCtrl',
      prefetchTemplate: false
    })

    .state('app.senddrinkUsername', {
      url: "/senddrink/username",
          templateUrl: config.template_path + "/send_drink/username",
          controller: 'SenddrinkCtrl',
      prefetchTemplate: false
    })

    .state('app.senddrinkEmail', {
      url: "/senddrink/email",
          templateUrl: config.template_path + "/send_drink/email",
          controller: 'SenddrinkCtrl',
      prefetchTemplate: false
    })

    .state('app.senddrinkText', {
      url: "/senddrink/text",
          templateUrl: config.template_path + "/send_drink/text",
          controller: 'SenddrinkCtrl',
      prefetchTemplate: false
    })

    .state('app.senddrinkContacts', {
      url: "/senddrink/contacts",
          templateUrl: config.template_path + "/send_drink/contacts",
          controller: 'SenddrinkCtrl',
      prefetchTemplate: false
    })
		

    
    //.state('app.sendbottle', {
     // url: "/sendbottle",
     // templateUrl: config.template_path + "/send_bottle",
     // controller: 'SendbottleCtrl',
     // prefetchTemplate: false
    //})	
    
	 .state('app.sendbottle', { 
      url: "/sendbottle",
      templateUrl: config.template_path + "/send_bottle/main/Meal",
      controller: 'SendbottleCtrl',
      prefetchTemplate: false
    })	

     .state('app.sendbottleAirtab', {
      url: "/sendbottle/:method/:gift",
      templateUrl: function(params){ return config.template_path + '/send_bottle/' + params.method + "/" + params.gift;},

      controller: 'SenddrinkCtrl',
      prefetchTemplate: false
    })
    
    .state('app.sendbottleUsername', {
      url: "/sendbottle/:method/:gift",
      templateUrl: function(params){ return config.template_path + '/send_bottle/' + params.method + "/" + params.gift;},
      
      controller: 'SenddrinkCtrl',
      prefetchTemplate: false
    })
 
    .state('app.sendbottleEmail', {
      url: "/sendbottle/:method/:gift",
      templateUrl: function(params){ return config.template_path + '/send_bottle/' + params.method + "/" + params.gift;},

      controller: 'SenddrinkCtrl',
      prefetchTemplate: false
    })

    .state('app.sendbottleText', {
      url: "/sendbottle/:method/:gift",
      templateUrl: function(params){ return config.template_path + '/send_bottle/' + params.method + "/" + params.gift;},

      controller: 'SenddrinkCtrl',
      prefetchTemplate: false
    })

 //   .state('app.sendbottleAirtab', {
 //     url: "/sendbottle/airtab",
 //     templateUrl: config.template_path + "/send_bottle/airtab",
 //     controller: 'SenddrinkCtrl',
 //     prefetchTemplate: false
 //   })
    
//    .state('app.sendbottleUsername', {
//      url: "/sendbottle/username",
//      templateUrl: config.template_path + "/send_bottle/username",
//      controller: 'SenddrinkCtrl',
//      prefetchTemplate: false
//    })
 
//    .state('app.sendbottleEmail', {
//      url: "/sendbottle/email",
//      templateUrl: config.template_path + "/send_bottle/email",
//      controller: 'SenddrinkCtrl',
//      prefetchTemplate: false
//    })
   
//    .state('app.sendbottleText', {
//      url: "/sendbottle/text",
//      templateUrl: config.template_path + "/send_bottle/text",
//      controller: 'SenddrinkCtrl',
//      prefetchTemplate: false
//    })

    
    .state('app.regiftdrink', {          
          url: '/regift_drink/:screen/:ticket_id/:redeemAt/:drinkId',
          templateUrl: function(params){ return config.template_path + '/regift_drink/' + params.screen + "/" + params.ticket_id + "/" + params.redeemAt + "/" + params.drinkId;},
          controller: 'RegiftdrinkCtrl',
          prefetchTemplate: false
    })

    .state('app.regiftdrinkAirtab', {
         url: "/regift_drink/airtab",
         templateUrl: config.template_path + "/regift_drink/airtab",
         controller: 'RegiftdrinkCtrl',
         prefetchTemplate: false
    })

    .state('app.regiftdrinkUsername', {
         url: "/regift_drink/username",
         templateUrl: config.template_path + "/regift_drink/username",
         controller: 'RegiftdrinkCtrl',
         prefetchTemplate: false
    })
    
    .state('app.regiftdrinkContactList', {
         url: "/regift_drink/contact",
         templateUrl: config.template_path + "/regift_drink/contact",
         controller: 'RegiftdrinkCtrl',
         prefetchTemplate: false
    })

    .state('app.regiftdrinkEmail', {
         url: "/regift_drink/email",
         templateUrl: config.template_path + "/regift_drink/email",
         controller: 'RegiftdrinkCtrl',
         prefetchTemplate: false
    })

    .state('app.regiftdrinkText', {
         url: "/regift_drink/text",
         templateUrl: config.template_path + "/regift_drink/text",
         controller: 'RegiftdrinkCtrl',
         prefetchTemplate: false
    })

    .state('app.regiftdrinkContacts', {
         url: "/regift_drink/contacts",
         templateUrl: config.template_path + "/regift_drink/contacts",
         controller: 'RegiftdrinkCtrl',
         prefetchTemplate: false
    })

    .state('app.promo', {
      url: '/promo/:type/:drinkType/:fId/:remaining',
      templateUrl: function(params){ return config.template_path + '/promo/' + params.type + "/" + params.drinkType + "/" + params.fId + "/" + params.remaining;},
      controller: 'promoController',
      prefetchTemplate: false
    })
    
    .state('app.promobottle', {
       	url: '/promo_bottle/:type/:estId/:item_id/:senderId/:recipientid',
        templateUrl: function(params){      	
    	return config.template_path + '/promo_bottle/' + "/" + params.type + "/" + params.estId + "/" + params.item_id + "/" + params.senderId + "/" + params.recipientid ;
      },
      controller: 'promoController',
      prefetchTemplate: false
    })

 //   .state('app.promo_bottle', {
 //      	url: '/promo_bottle/:type/:estId/:item_id/:senderId/:recipientid',
 //       templateUrl: function(params){      	
 //   	return config.template_path + '/promo_bottle/' + "/" + params.type + "/" + params.estId + "/" + params.item_id + "/" + params.senderId + "/" + params.recipientid ;
 //     },
 //     controller: 'promoController',
 //     prefetchTemplate: false
 //   })

//    .state('app.promo_regift', {
//        url: '/promo_regift/:type/:drinkType/:fId/:remaining/:ticket_id/:redeemAt/:redeemId',
//        templateUrl: function(params){ return config.template_path + '/promo_regift/' + params.type + "/" + params.drinkType + "/" + params.fId + "/" + params.remaining + "/" + params.ticket_id + "/" + params.redeemAt + "/" + params.redeemId;},
//        controller: 'promoControllerRegift',
//        prefetchTemplate: false
//      })
    
    .state('app.mydrinks', {
      url: "/mydrinks",
          templateUrl: config.template_path + "/mydrinks",
          controller: 'AppCtrl',
      prefetchTemplate: false
    })
    
    .state('app.mydrinksPromo', {
      url: "/mydrinks/:screen",
      templateUrl: function(params){ return config.template_path + '/mydrinks/' + params.screen;},
      controller: 'AppCtrl',
      prefetchTemplate: false

    })

    .state('app.friends', {
      url: "/friends",
          templateUrl: config.template_path + "/friends",
          controller: 'AppCtrl',
      prefetchTemplate: false
    })

    .state('app.friendoptions', {
      url: '/friends/options/:fId',
          templateUrl: function(params){ return config.template_path + '/friends/options/'  + params.fId;},
          controller: 'AppCtrl',
      prefetchTemplate: false
    })

    .state('app.friendrequest', {
      url: '/friends/request/:fId',
          templateUrl: function(params){ return config.template_path + '/friends/request/'  + params.fId;},
          controller: 'AppCtrl',
      prefetchTemplate: false
    })

    .state('app.addfriend', {
      url: "/addfriend",
          templateUrl: config.template_path + '/addfriend',
          controller: 'AppCtrl'
    })

    .state('app.addfriendEmail', {
      url: "/addfriend/email",
          templateUrl: config.template_path + '/addfriend/email',
          controller: 'AppCtrl'
    })

//    .state('app.mydrinksPromo', {
//      url: "/mydrinks/:screen",
//      templateUrl: function(params){ return config.template_path + '/mydrinks/' + params.screen;},
//      controller: 'AppCtrl',
//      prefetchTemplate: false
//
//   })

    .state('app.addfriendText', {
      url: "/addfriend/text",
          templateUrl: config.template_path + '/addfriend/text',
          controller: 'AppCtrl'
    })
    
    .state('app.addfriendContactText', {
      url: "/addfriend/text_contacts/:phone",
      //        templateUrl: config.template_path + '/addfriend/text',
          templateUrl: function(params){ return config.template_path + '/addfriend/text_contacts/' + params.phone;},
        controller: 'AppCtrl'
    })

    .state('app.addfriendUsername', {
      url: "/addfriend/username",
          templateUrl: config.template_path + '/addfriend/username',
          controller: 'AppCtrl'
    })
    
    .state('app.addfriend_via_contact', {
        url: "/addfriend_via_contact",
        templateUrl: config.template_path + '/addfriend_via_contact',
        controller: 'AppCtrl',
        prefetchTemplate: false
 
    })
    
    .state('app.campaign/send', {
      url: "/campaign/send",
          templateUrl: config.template_path + '/campaign/send',
          controller: 'AppCtrl'
    })		

    .state('app.purchases', {
      url: "/purchases",
          templateUrl: config.template_path + '/purchases',
          controller: 'AppCtrl',
      prefetchTemplate: false
    })

    .state('app.messages', {
      url: "/messages",

          templateUrl: config.template_path + '/messages',
          controller: 'AppCtrl',
          prefetchTemplate: false

    })

    .state('app.newMessage', {
      url: "/messages/new",

          templateUrl: config.template_path + '/messages/new',
          controller: 'AppCtrl',
          prefetchTemplate: false

    })

    .state('app.conversation', {
      url: '/messages/conversation/:thread',

          templateUrl: function(params){ return config.template_path + '/messages/conversation/'  + params.thread;},
          controller: 'AppCtrl',
          prefetchTemplate: false

    })

    .state('app.profile', {
      url: "/profile",
          templateUrl: config.template_path + "/profile_info",
          controller: 'AppCtrl',
      prefetchTemplate: false
    })


    .state('app.about', {
      url: "/about",
          templateUrl: config.template_path + "/about"
    })

    .state('app.terms', {
      url: "/about/terms",
          templateUrl: config.template_path + "/about/terms"
    })

    .state('app.privacy', {
      url: "/about/privacy",
          templateUrl: config.template_path + "/about/privacy"
    })

    .state('app.how_it_works', {
      url: "/how_it_works",
      templateUrl: config.template_path + "/how_it_works"
    })		
		
    .state('app.howtosend', {
      url: "/how_it_works/send",
      templateUrl: config.template_path + "/how_it_works/send"
    })
		
    .state('app.howtoredeem', {
      url: "/how_it_works/redeem",
      templateUrl: config.template_path + "/how_it_works/redeem"
    })
		
    .state('app.dashboard', {
      url: '/dashboard/:Id',
      templateUrl: function(params){ return config.template_path + '/dashboard/' +  params.Id;},
      controller: 'AppCtrl',
      prefetchTemplate: false
    })
		
    .state('app.data-api', {
      url: '/data-api/:action/:id',
      templateUrl: function(params){ return config.template_path + '/data-api/' + params.action + '/' + params.id;},
      prefetchTemplate: false
    })
		
    .state('app.test', {
      url: "/test",
      templateUrl: config.template_path + "/test"
    })		

    .state('app.guest', {
      url: "/guest/:view",
          templateUrl: function(params){ return config.template_path + '/guest/'  + params.view;},
          controller: 'AppCtrl',
          prefetchTemplate: false

    });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/news');
});

app.directive('checkoutform', function($compile) {
    console.log("test");
    return {
        restrict: 'E',
        link: function(scope, element, attrs) {
            $("#checkout_form select, #checkout_form input").not(':input[type=button], :input[type=submit], :input[type=reset]').each(function() {
              name = $(this).attr("name");
              $(this).attr("ng-model", "inputs." + name);
              scope.inputs[name] = $(this).val();
              $(this).removeAttr("value");
              if($(this).attr("type") == "hidden") $(this).remove();
            });
            formhtml = $("<div />").append($("#checkout_form").clone()).html();
            $("#checkout_form").remove();
            element[0].innerHTML = formhtml;
            $compile(element.contents())(scope);
            scope.hideLoading();
        }
    }
});

app.directive('compile', ['$compile', function ($compile) {
  return function(scope, element, attrs) {
    scope.$watch(
      function(scope) {
        return scope.$eval(attrs.compile);
      },
      function(value) {
        element.html(value);
        $compile(element.contents())(scope);
      }
   )};
  }]);

