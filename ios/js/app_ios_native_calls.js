
function contactEmail(email, name) {
  
  var contact = {
      email: email,
      name: name
  }

  contactCallback(contact);
}


function contactPhone(phone, name) {
	  var contact = {
	      phone: phone.replace(/\D/g,''),
	      name: name
	  }

	  contactCallback(contact);
}

function getContact(callback) {
  contactCallback = callback;
  
 
  if(typeof bridge != "undefined") bridge.callHandler("getContact", "sent_drink", function(r) {
   
	  r = JSON.parse(r);
      contactCallback(r);
   
  })
}


function inviteFacebookFriends() {
	//  contactCallback = callback;
	  if(typeof bridge != "undefined") bridge.callHandler("inviteFacebookFriends", null, function(r) {
		//  alert( r );
	    r = JSON.parse(r);
	    if(r.status == "error") {
	      contactCallback(r);
	    }
	  })
}

function createContactAirTabGroupEx(contactList) {
	
	  if(typeof bridge != "undefined") bridge.callHandler("createContactAirTabGroup", contactList, function(r) {		
		    r = JSON.parse(r);
			contactCallback(r);		
		  })

}

// Get contact-list from mobile-phone
//
function getContactListFromPhone(callback) {
	  contactCallback = callback;
	  if(typeof bridge != "undefined") bridge.callHandler("getContactListFromPhone", null, function(r) {		
	    r = JSON.parse(r);
		contactCallback(r);		
	  })
}

function cancelContact() {
  rootScope.hideLoading();
}

function backButton() {
  if(typeof rootScope.modal != "undefined" && rootScope.modal._isShown == true) {
    if(rootScope.modal.isLogin) {
      console.log("tried closing login Modal. Quitting app.");
      if(typeof Android != "undefined") Android.closeApp();
      return;
    }
    rootScope.modal.hide();
    rootScope.modal.remove();
  } else {
    if(rootScope.$viewHistory.backView == null) {
      if(typeof Android != "undefined") Android.closeApp();
    } else {
      nav.back();
    }
  }
}

function profileEditComplete() {
  rootScope.hideModal();
}

function openKeyboard() {
  console.log("opening Keyboard");
  if(typeof Android != "undefined") Android.openKeyboard();
}

function registerComplete() {
  rootScope.isLogged = true;
  rootScope.hideModal();
  rootScope.initialize();
}

function gotoNative() {
	  if(!bridge) return;

	  bridge.callHandler("gotoNative", null, function(r) {
		  //alert( r );
	  });
}

function setDeviceId() {
  if(!bridge) return;

  bridge.callHandler("getPushInfo", null, function(r) {
      if(r == "not_available") {
        console.log("no push information available");
      } else {
        pushRegister(r);
      }
  });
}

function loginFB(callback) {

  fbCallback = callback;

  if(!bridge) return;
    
  bridge.callHandler("loginFB", null, function(r) {
	  fbCallback( r );
  });
}


function imageCaptured() {
  if(typeof Android != "undefined") {
    var result = JSON.parse(Android.getImageData());
    imageCallback(result);
  }
}

function imageFromPhone(result) {
  if(imageCallback) imageCallback(result);
}

function pushNotification(info) {
  console.log(info);
  rootScope.pushNotification(info);
}

function pushRegister(info) {
  console.log(info);
  rootScope.pushRegister(info);
}

document.addEventListener('DOMContentLoaded', function(){
    var updateStatusBar = navigator.userAgent.match(/iphone|ipad|ipod/i) && navigator.appVersion.match(/OS (\d)/) && parseInt(navigator.appVersion.match(/OS (\d*)/)[1], 10) >= 7;

    if (updateStatusBar) {
        document.body.classList.add('platform-ios');
        document.body.classList.add('platform-cordova');
    }
});

function openNewWindow(url) {
  if(bridge) {
    bridge.callHandler("openNewWindow", url, null);
  }
}

function connectWebViewJavascriptBridge(callback) {
    console.log("Checking for WebViewJavascriptBridge");
    if (window.WebViewJavascriptBridge) {
      console.log("Bridge Found");
      callback(WebViewJavascriptBridge)
    } else {
      document.addEventListener('WebViewJavascriptBridgeReady', function() {
        console.log("Bridge Found");
        callback(WebViewJavascriptBridge)
      }, false)
    }
  }

function loginFBRX(fbID, fnm, lnm, email) {
	
	//window.location.assign("https://airtab.me/dashboard/#/register/android");
	
	//alert( email  );
	//alert( fbID + ":" + fnm + ":" + lnm + ":" + email );
}

connectWebViewJavascriptBridge(function(b) {

    /* Init your app here */

    bridge = b;
    bridge.init(function(message, responseCallback) {
        alert('Received message: ' + message)   
        if (responseCallback) {
            responseCallback("Right back atcha")
        }
    })

    bridge.send('Hello from AirTab.me!');

    bridge.registerHandler("pushRegister", function(responseData) { pushRegister(responseData); });
    bridge.registerHandler("pushNotification", function(responseData) { pushNotification(responseData); });
});

/**
*
*  Base64 encode / decode
*  http://www.webtoolkit.info/
*
**/
var Base64 = {

  // private property
  _keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

  // public method for encoding
  encode : function (input) {
      var output = "";
      var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
      var i = 0;

      input = Base64._utf8_encode(input);

      while (i < input.length) {

          chr1 = input.charCodeAt(i++);
          chr2 = input.charCodeAt(i++);
          chr3 = input.charCodeAt(i++);

          enc1 = chr1 >> 2;
          enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
          enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
          enc4 = chr3 & 63;

          if (isNaN(chr2)) {
              enc3 = enc4 = 64;
          } else if (isNaN(chr3)) {
              enc4 = 64;
          }

          output = output +
          this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
          this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);

      }

      return output;
  },

  // public method for decoding
  decode : function (input) {
      var output = "";
      var chr1, chr2, chr3;
      var enc1, enc2, enc3, enc4;
      var i = 0;

      input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

      while (i < input.length) {

          enc1 = this._keyStr.indexOf(input.charAt(i++));
          enc2 = this._keyStr.indexOf(input.charAt(i++));
          enc3 = this._keyStr.indexOf(input.charAt(i++));
          enc4 = this._keyStr.indexOf(input.charAt(i++));

          chr1 = (enc1 << 2) | (enc2 >> 4);
          chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
          chr3 = ((enc3 & 3) << 6) | enc4;

          output = output + String.fromCharCode(chr1);

          if (enc3 != 64) {
              output = output + String.fromCharCode(chr2);
          }
          if (enc4 != 64) {
              output = output + String.fromCharCode(chr3);
          }

      }

      output = Base64._utf8_decode(output);

      return output;

  },

  // private method for UTF-8 encoding
  _utf8_encode : function (string) {
      string = string.replace(/\r\n/g,"\n");
      var utftext = "";

      for (var n = 0; n < string.length; n++) {

          var c = string.charCodeAt(n);

          if (c < 128) {
              utftext += String.fromCharCode(c);
          }
          else if((c > 127) && (c < 2048)) {
              utftext += String.fromCharCode((c >> 6) | 192);
              utftext += String.fromCharCode((c & 63) | 128);
          }
          else {
              utftext += String.fromCharCode((c >> 12) | 224);
              utftext += String.fromCharCode(((c >> 6) & 63) | 128);
              utftext += String.fromCharCode((c & 63) | 128);
          }

      }

      return utftext;
  },

  // private method for UTF-8 decoding
  _utf8_decode : function (utftext) {
      var string = "";
      var i = 0;
      var c = c1 = c2 = 0;

      while ( i < utftext.length ) {

          c = utftext.charCodeAt(i);

          if (c < 128) {
              string += String.fromCharCode(c);
              i++;
          }
          else if((c > 191) && (c < 224)) {
              c2 = utftext.charCodeAt(i+1);
              string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
              i += 2;
          }
          else {
              c2 = utftext.charCodeAt(i+1);
              c3 = utftext.charCodeAt(i+2);
              string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
              i += 3;
          }

      }

      return string;
  }

}
