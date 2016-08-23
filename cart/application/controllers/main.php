<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Main extends CI_Controller {

	/**
	 * Controller for Handling Drinks
	 */
    public function test_jblaine()
    {
        $this->load->library('cart');
        $this->load->model('Drinks_model', 'drinks');

        echo  $this->drinks->test_jblaine();
        return( "this is a test john!" );
    }


	public function index()
	{
		$data = $this->session->all_userdata();
		$this->json->output($data);
	}

	public function view() {
		$this->cart->view_cart();
	}

	public function update_item() {
		$this->cart->update_item();
	}

	public function create_order($user_id = false, $session = false) {
		$user_id = ($user_id) ? $user_id : $this->input->get_post('user_id');
		$session = ($session) ? $session : $this->input->get_post('session');

		//Make sure user id is set
		if(!$user_id) return $this->json->error("You did not specify a user.");

		//Make sure session id is set
		if(!$session) return $this->json->error("You did not specify a user session token.");

		$this->load->model('User_model', 'user');

		if($this->user->validate_session($session, $user_id)) {
			//Create Order
			$this->json->output(array("status"=>"success", "order"=>$this->cart->create_order($user_id)));
		} else {
			$this->json->error("You did not provide a valid session/user combination.");
		}
	}

	public function clear() {
		$this->load->library('cart');
		$this->cart->destroy();
		$this->json->output(array("status"=>"success", "msg"=>"Your cart has been cleared."));
	}

	public function create_profile() {
		$this->json->output($this->cart->create_profile());
	}

	public function add_new_card() {
		$r = json_decode(file_get_contents('php://input'));

		//Make sure user id is set
		if(!isset($r->newcard)) return $this->json->error("You did not specify any payment information.");
		if(!isset($r->user)) return $this->json->error("You did not specify any user authentication credentials.");
		if(!isset($r->newcard->first_name) || !isset($r->newcard->last_name)) return $this->json->error("You did not specify your First and Last name.");
		if(!isset($r->newcard->address) || !isset($r->newcard->city) || !isset($r->newcard->state) || !isset($r->newcard->zip)) return $this->json->error("You did not specify a complete billing address.");
		if(!isset($r->newcard->cardNumber)) return $this->json->error("You did not specify a credit card number.");
		if(!$r->newcard->expiration_month || !$r->newcard->expiration_year) return $this->json->error("You did not specify an expiration date.");
		if(time() >= mktime(0,0,0,$r->newcard->expiration_month+1,1,$r->newcard->expiration_year)) return $this->json->error("The card information you provided is already expired.");
		if(!$r->user->id || !$r->user->session) return $this->json->error("You did not specify a user/token combination for authentication.");

		//Everything checks out so far, let's check if the user has a profile
		$this->load->model('User_model', 'user');

		//Authenticate User before attempting to create a new payment profile
		if(!$this->user->validate_session($r->user->session, $r->user->id)) return $this->json->error("You did not provide a valid session/user combination.");

		//Check if the user already has a CIM Customer Profile before creating a Payment Profile
		$r->user->profile_id = $this->user->get_profile_id($r->user->id);

		//If the user doesn't have a CIM Customer Profile, create one...
		if(!$r->user->profile_id) {
			$user = $this->user->get_details($r->user->id);
			if(!$user) return $this->json->error("Unable to fetch details of the specified user. (get_details)");

			$user = $this->cart->create_profile($user);

			if(!$user->profile_id) return $this->json->error("Unable to create CIM Customer Profile.");

			$r->user->profile_id = $user->profile_id;
		}

		//Now that we have the user's CIM Profile ID, let's create the new payment profile
		$billTo = new stdClass();
		$billTo->firstName = $r->newcard->first_name;
		$billTo->lastName = $r->newcard->last_name;
		$billTo->address = $r->newcard->address;
		$billTo->city = $r->newcard->city;
		$billTo->state = $r->newcard->state;
		$billTo->zip = $r->newcard->zip;

		$payment = new stdClass();
		$payment->cardNumber = $r->newcard->cardNumber;
		$payment->expirationDate = $r->newcard->expiration_year . "-" . $r->newcard->expiration_month;

		return $this->json->output($this->cart->create_payment_profile($r->user->profile_id, $billTo, $payment));
	}

	public function get_user_details($user_id = false, $session = false) {
		$user_id = ($user_id) ? $user_id : $this->input->get_post('user_id');
		$session = ($session) ? $session : $this->input->get_post('session');

		//Make sure user id is set
		if(!$user_id) return $this->json->error("You did not specify a user.");

		//Make sure session id is set
		if(!$session) return $this->json->error("You did not specify a user session token.");

		$this->load->model('User_model', 'user');

		if($this->user->validate_session($session, $user_id)) {
			//Get information
			$this->json->output($this->user->get_details($user_id));
		} else {
			$this->json->error("You did not provide a valid session/user combination.");
		}
	}

	public function validate_session() {
		$user_id = $this->input->get_post('user_id');
		$session = $this->input->get_post('session');

		//Make sure user id is set
		if(!$user_id) return $this->json->error("You did not specify a user id.");

		//Make sure session id is set
		if(!$session) return $this->json->error("You did not specify a session id.");

		$this->load->model('User_model', 'user');

		if($this->user->validate_session($session, $user_id)) {
			$this->json->output(array("status"=>"success"));
		} else {
			$this->json->error("You did not provide a valid session/user combination.");
		}
        
	}

	public function get_product_details($pId = false) {

		$pId = ($pId) ? $pId : $this->input->get_post('product_id');

		//Make sure product id is set
		if(!$pId) return $this->json->error("You did not specify a product id.");

		$this->load->model('Product_model', 'products');

		$product = $this->products->get_details($pId);

		if(!$product) return $this->json->error("No product with that ID was found.");

		return $this->json->output($product);
	}

	//Test Functions
	public function charge_profile($profile_id = false, $payment_profile_id = false, $order_id = false) {
	
	    
		if(!$profile_id || !$payment_profile_id || !$order_id) return $this->json->error("You did not provide all the required information to charge your card.");

		$this->load->model('Order_model', 'order');
		$order = $this->order->get_order($order_id);
	    
		$this->json->output($this->cart->charge_profile($profile_id, $payment_profile_id, $order_id, $order->total));
	}
		
	public function charge_profile_jblaine($profile_id = false, $payment_profile_id = false, $order_id = false, $loginID, $recipients, $estID, $drinkID, $method) {
		    
		if(!$profile_id || !$payment_profile_id || !$order_id) {
			return $this->json->error("You did not provide all the required information to charge your card.");
		}

		$this->load->model('Order_model', 'order');
		$order = $this->order->get_order($order_id);
		
		$this->json->output($this->cart->charge_profile_jblaine($profile_id, $payment_profile_id, $order_id, $order->total, $loginID, $recipients, $estID, $drinkID, $method));
				
	}

	public function process() {
		$this->load->library("process_purchase");
		
		return $this->json->output($this->process_purchase->process_order("order1414556698_1"));
	}
	
	public function process_jblaine() {
		$this->load->library("process_purchase");
		
		return $this->json->output($this->process_purchase->process_order_jblaine("order1414556698_1"));
	}
	
}

/* End of file welcome.php */
/* Location: ./application/controllers/welcome.php */