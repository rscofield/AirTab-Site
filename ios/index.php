<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="initial-scale=1, maximum-scale=1, user-scalable=no, width=device-width">
    <title></title>
<link href='//fonts.googleapis.com/css?family=RobotoDraft:regular,bold,italic,thin,light,bolditalic,black,medium&lang=en' rel='stylesheet' type='text/css'>
    <link href="css/ionic.css?<?=filemtime("./css/ionic.css")?>" rel="stylesheet">
    <link href="css/style.css?<?=filemtime("./css/style.css")?>" rel="stylesheet">

    
    <script src="/assets/js/jquery-1.11.1.min.js"></script>
    <!-- IF using Sass (run gulp sass first), then uncomment below and remove the CSS includes above
    <link href="css/ionic.app.css" rel="stylesheet">
    -->

    <!-- ionic/angularjs js -->
    <script src="js/ionic.bundle.min.js?<?=filemtime("./js/ionic.bundle.min.js")?>"></script>

    <!-- your app's js -->
    <script src="js/app.js?<?=filemtime("./js/app.js")?>"></script>
    <script src="js/app_ios_native_calls.js?<?=filemtime("./js/app_ios_native_calls.js")?>"></script>

    <script src="js/controllers.js?<?=filemtime("./js/controllers.js")?>"></script>
    <script src="js/airtab_regift.js?<?=filemtime("./js/airtab_regift.js")?>"></script>
  
    <script src="js/airtab_gift.js?<?=filemtime("./js/airtab_gift.js")?>"></script>
  
    <script src="js/airtab_bottle.js?<?=filemtime("./js/airtab_bottle.js")?>"></script>
    <script src="js/airtab_bottle_cart.js?<?=filemtime("./js/airtab_bottle_cart.js")?>"></script>

    <script src="js/airtab_mydrinks.js?<?=filemtime("./js/airtab_mydrinks.js")?>"></script>
    <script src="js/airtab_redeem.js?<?=filemtime("./js/airtab_redeem.js")?>"></script>
    <script src="js/airtab_senddrink.js?<?=filemtime("./js/airtab_senddrink.js")?>"></script>
    <script src="js/airtab_friends_via_contact.js?<?=filemtime("./js/airtab_friends_via_contact.js")?>"></script>


    <script type="text/javascript" src="//maps.googleapis.com/maps/api/js?libraries=places"></script>
    <script>
      document.addEventListener('deviceready', function() {
        ionic.Platform.detect();
      });
  </script>
  </head>

  <body ng-app="starter">
    <ion-nav-view></ion-nav-view>
  </body>
</html>
