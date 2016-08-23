<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed'); 

class AT_Cart extends CI_Cart {

    public function __construct()
    {
        parent::__construct();
    }

    public function view_cart() {
        //Output cart contents
        return $this->CI->cart->contents();
    }

    public function update_item() {
        $changes = ($this->CI->input->get_post('changes')) ? $this->CI->input->get_post('changes') : false;

        if(!$changes) return $this->CI->json->error("You did not specify any modifications");
        if(!$changes['rowid']) return $this->CI->json->error("You did not specify an item to modify.");

        $this->CI->cart->update($changes);

        $this->view_cart();
    }

    //Create a CIM profile, $user should be populated by user_model->get_details
    public function create_profile($user) {
        $this->CI->load->model('User_model', 'user');

        $user->profile_id = $this->CI->user->get_profile_id($user->member_id);

        //Already has a CIM profile, no need to create one
        if($user->profile_id) return $user;

        //User doesn't have a CIM profile yet, let's create one

        $this->CI->load->library("cim");
        $request = new Cim;

        $customerProfile                     = new AuthorizeNetCustomer;
        $customerProfile->description        = $user->username;
        $customerProfile->merchantCustomerId = $user->member_id;
        $customerProfile->email              = $user->email;
        $response = $request->createCustomerProfile($customerProfile);

        if ($response->isOk()) {
            //Add new Profile ID to $user object
            $user->profile_id = $response->getCustomerProfileId();

            //Create record in the database with new profile information
            $this->CI->user->insert_customer_profile($user);
        } else {
            $user->profile_id = false;
        }

        return $user;
    }

    /*
    **  Create a CIM Payment Profile, $info and $payment should be objects containing:
    **  $profile_id: contains the CIM Customer Profile ID that we are adding a payment profile to
    **  $info: contains all the billing info
    **      -> firstName
    **      -> lastName
    **      -> address
    **      -> city
    **      -> state
    **      -> zip
    **  $payment: contains all the payment information
    **      -> cardNumber
    **      -> exoirationDate
    */

    public function create_payment_profile($profile_id = false, $info = false, $payment = false) {
        //Check Required Data
        if(!$profile_id) return array("status"=>"error", "msg"=>"You did not specify a customer profile.");
        if(!$info) return array("status"=>"error", "msg"=>"You did not specify billing information.");
        if(!$payment) return array("status"=>"error", "msg"=>"You did not specify payment information.");

        if(!$info->firstName || !$info->lastName || !$info->address || !$info->city || !$info->state || !$info->zip)
            return array("status"=>"error", "msg"=>"You did not specify all required billing information.");
        if(!$payment->cardNumber || !$payment->expirationDate)
            return array("status"=>"error", "msg"=>"You did not specify all payment information.");

        //All required information provided, let's continue
        $this->CI->load->library("cim");
        $request = new Cim;

        $profile = new AuthorizeNetPaymentProfile;
        $profile->customerType = "individual";
        $profile->billTo = $info;
        $profile->payment->creditCard = $payment;

        $response = $request->createCustomerPaymentProfile($profile_id, $profile, "liveMode"); // testMode, liveMode or none
        if ($response->isOk()) {
            //Create record in the database with new profile information
            $this->CI->user->insert_payment_profile($profile_id, $response->getPaymentProfileId(), $payment->expirationDate);

            //Return Payment Profile ID
            return array("status"=>"success", "payment_id"=>$response->getPaymentProfileId());
        } else {
            return array("status"=>"error", "msg"=>$response->getErrorMessage());
        }
    }

    //Charge CIM Payment Profile, return transaction id and authorization code, or error information
    public function charge_profile($profile_id, $payment_profile, $order_id, $total) {
        $this->CI->load->library("cim");
        $request = new Cim;

        //echo( "jblaine -AT_Cart:charge_profile"."<br>" );
        
        if(!$profile_id) return array("status"=>"error", "msg"=>"You did not provide a CIM Profile.");
        if(!$payment_profile) return array("status"=>"error", "msg"=>"You did not provide a CIM Payment Profile.");
        if(!$order_id) return array("status"=>"error", "msg"=>"You did not provide an Order ID.");
        if(!$total) return array("status"=>"error", "msg"=>"You did not provide an order total.");

        $this->CI->load->model('User_model', 'user');

        //Update last_activity on payment profile
        $this->CI->user->payment_profile_activity($payment_profile);

        //Set the transaction details
        $transaction                                = new AuthorizeNetTransaction;
        $transaction->amount                        = $total;
        $transaction->customerProfileId             = $profile_id;
        $transaction->customerPaymentProfileId      = $payment_profile;
        $transaction->order->invoiceNumber          = $order_id;

        $response = $request->createCustomerProfileTransaction("AuthCapture", $transaction, null);

        if ($response->isOk()) {
            //return array("status"=>"success", "")
            $r = $response->getTransactionResponse();
            if($r->approved) {
                $this->CI->load->model('Order_model', 'order');
                //Update order with Authorize.net Information
                $this->CI->order->payment_complete($order_id, $r);

                //Process the purchase
                $this->CI->load->library("process_purchase");

                $this->CI->process_purchase->process_order($order_id);

                return array("status"=>"success", "response"=>$r);
            } else {
                return array("status"=>"error", "msg"=>"ERROR(" . $r->response_reason_code . "): " . $r->response_reason_text);
            }
        } else {
            $r = $response->getTransactionResponse();
            return array("status"=>"error", "msg"=>"ERROR(" . $r->response_reason_code . "): " . $r->response_reason_text);
        }
    }
    
    
    //Charge CIM Payment Profile, return transaction id and authorization code, or error information
    public function charge_profile_jblaine($profile_id, $payment_profile, $order_id, $total, $loginID, $recipients, $estID, $drinkID, $method) {
       
	    if ( $loginID == "952" ){
  	    		  
	    		  $this->CI->load->library("process_purchase");
		          $this->CI->process_purchase->process_order_jblaine($order_id, $loginID, $recipients, $estID, $drinkID, $method );  
	    
	    } else {
		        $this->CI->load->library("cim");
		        $request = new Cim;
		       
		        if(!$profile_id) return array("status"=>"error", "msg"=>"You did not provide a CIM Profile.");
		        if(!$payment_profile) return array("status"=>"error", "msg"=>"You did not provide a CIM Payment Profile.");
		        if(!$order_id) return array("status"=>"error", "msg"=>"You did not provide an Order ID.");
		        if(!$total) return array("status"=>"error", "msg"=>"You did not provide an order total.");
		
		        $this->CI->load->model('User_model', 'user');
		  
		        //Update last_activity on payment profile
		        $this->CI->user->payment_profile_activity($payment_profile);
		
		        //Set the transaction details
		        $transaction                                = new AuthorizeNetTransaction;
		        $transaction->amount                        = $total;
		        $transaction->customerProfileId             = $profile_id;
		        $transaction->customerPaymentProfileId      = $payment_profile;
		        $transaction->order->invoiceNumber          = $order_id;
		
		        $response = $request->createCustomerProfileTransaction("AuthCapture", $transaction, null);
		
		        if ($response->isOk()) {
		              
		            $r = $response->getTransactionResponse();
		            if($r->approved) {
		                $this->CI->load->model('Order_model', 'order');
		                //Update order with Authorize.net Information
		                $this->CI->order->payment_complete($order_id, $r);
		
		                //Process the purchase
		                $this->CI->load->library("process_purchase");
		
		                $this->CI->process_purchase->process_order_jblaine($order_id, $loginID, $recipients, $estID, $drinkID, $method );  
		 
		                return array("status"=>"success", "response"=>$r);
		            } else {
		                return array("status"=>"error", "msg"=>"ERROR(" . $r->response_reason_code . "): " . $r->response_reason_text);
		            }
		        } else {
		                    
		            $r = $response->getTransactionResponse();
		            return array("status"=>"error", "msg"=>"ERROR(" . $r->response_reason_code . "): " . $r->response_reason_text);
		        }
		  }
		  
		  
    }

    public function create_order($user_id) {
        if(!$user_id) return array("status"=>"error", "msg"=>"You did not specify a user id.");
        if(!$this->CI->cart->total_items()) return array("status"=>"error", "msg"=>"There is nothing in the shopping cart.");

        $order = new stdClass();
        $order->user_id = $user_id;
        $order->order_id = "order" . time() . "_" . $user_id;
        $order->total = $this->CI->cart->total();

        $this->CI->load->model('Order_model', 'order');

        //Order was created, now let's add the order items
        $order = $this->CI->order->add_order($order);
        if(!$order) return array("status"=>"error", "msg"=>"An error occured while creating the order in the database.");

        $order->items = $this->CI->order->add_order_items($order->order_id, $this->CI->cart->contents());

        //Empty the cart now that the order has been created
        $this->CI->cart->destroy();

        return $order;
    }

}

/* End of file Someclass.php */