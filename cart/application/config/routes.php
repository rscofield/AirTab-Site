<?php  if ( ! defined('BASEPATH')) exit('No direct script access allowed');
/*
| -------------------------------------------------------------------------
| URI ROUTING
| -------------------------------------------------------------------------
| This file lets you re-map URI requests to specific controller functions.
|
| Typically there is a one-to-one relationship between a URL string
| and its corresponding controller class/method. The segments in a
| URL normally follow this pattern:
|
|	example.com/class/method/id/
|
| In some instances, however, you may want to remap this relationship
| so that a different class/function is called than the one
| corresponding to the URL.
|
| Please see the user guide for complete details:
|
|	http://codeigniter.com/user_guide/general/routing.html
|
| -------------------------------------------------------------------------
| RESERVED ROUTES
| -------------------------------------------------------------------------
|
| There area two reserved routes:
|
|	$route['default_controller'] = 'welcome';
|
| This route indicates which controller class should be loaded if the
| URI contains no data. In the above example, the "welcome" class
| would be loaded.
|
|	$route['404_override'] = 'errors/page_missing';
|
| This route will tell the Router what URI segments to use if those provided
| in the URL cannot be matched to a valid route.
|
*/

$route['default_controller'] = "main";
$route['404_override'] = '';

//Custom Routes
$route['product/(:num)'] = "main/get_product_details/$1";
$route['user/details/(:num)/(:any)'] = "main/get_user_details/$1/$2";

$route['user/card/add'] = "main/add_new_card";
$route['empty'] = "main/clear";

$route['order/charge_profile/(:num)/(:num)/(:any)'] = "main/charge_profile/$1/$2/$3";

$route['order/charge_profile_bottle/(:num)/(:num)/(:any)/(:any)'] = "main/charge_profile_jblaine/$1/$2/$3/$4";

//Drinks
$route['drinks/test_jblaine/(:any)/(:any)/(:any)/(:any)'] = "drinks/test_jblaine/$1/$2/$3/$4";
//$route['drinks/test_jblaine'] = "drinks/test_jblaine";
    
$route['drinks/add_jblaine/(:any)/(:num)/(:num)/(:any)/(:num)'] = "drinks/add_to_cart_jblaine/$1/$2/$3/$4/$5";
    
$route['drinks/add/(:any)/(:num)/(:num)/(:any)'] = "drinks/add_to_cart/$1/$2/$3/$4";
$route['drinks/add/(:any)/(:num)/(:num)/(:any)/(:any)'] = "drinks/add_to_cart/$1/$2/$3/$4/$5"; //Drink with message

//Order Routes
$route['order/create/(:num)/(:any)'] = "main/create_order/$1/$2";

//$route['test'] = "main/test_jblaine";
$route['test'] = "main/test_jblaine";


/* End of file routes.php */
/* Location: ./application/config/routes.php */