
function contactEmail(email, name) {
  
  var contact = {
      email: email,
      name: name
  }

  contactCallback(contact);
}

function contactPhone(phone, name) {
  rootScope.showLoading();
  var contact = {
      phone: phone.replace(/\D/g,''),
      name: name
  }

  contactCallback(contact);
}


function getContact(type, callback) {
  
  contactCallback = callback;
 
  if(typeof Android != "undefined") Android.getContactJBlaine(type);
}

function inviteFacebookFriends() {
	
	 if(typeof Android != "undefined") Android.inviteFacebookFriends();

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

function setDeviceId() {
  if(typeof Android == "undefined") return;
  rootScope.deviceId = Android.getDeviceId();
  if(rootScope.isLogged) {
    rootScope.saveDeviceId();
  }
}


function getAndroidContactList() {
	
	  if(typeof Android != "undefined") {
		  var r = Android.getAndroidContacts();
		  return( r );
	  }
}

function gotoNative() {
	
	  if(typeof Android != "undefined") {
		  var r = Android.gotoNative();
		  alert( r );
	  }
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

function addStatusBar() {
  document.body.style.marginTop = "20px";
}

function pushNotification(notification) {
  notification = JSON.parse(notification);
  console.log(notification);
  if(notification.tag == "newMessage" && conversation && notification.thread == conversation.thread) {
    if(typeof messageUpdater == "undefined") return;

    messageUpdater(conversation.thread, conversation.lastMessage);
  }
}
