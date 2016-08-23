<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Drinks extends CI_Controller {

	/**
	 * Controller for Handling Drinks
	 */


	public function index()
	{
		$data = $this->session->all_userdata();
		$this->json->output($data);
	}

	// Add drink to shopping cart
	public function add_to_cart($recipients = false, $qty = 1, $drinkType = false, $recipient_type = false, $message = false) {
		$this->load->library('cart');

		$this->load->model('Drinks_model', 'drinks');

		$qty = ($this->input->get_post('qty')) ? $this->input->get_post('qty') : $qty; // How Many
		$drinkType = ($drinkType) ? $drinkType : $this->input->get_post('drinkType'); // id of Drink Type
		$recipients = ($recipients) ? $recipients : $this->input->get_post('recipients');
		$recipient_type = ($recipient_type) ? $recipient_type : $this->input->get_post('recipient_type'); // airtab, text, email?

		if(!$drinkType) return $this->json->error("You did not specify a drink type.");
		if(!$recipients) return $this->json->error("You did not specify any recipients.");
		if(!$recipient_type) return $this->json->error("You did not specify the type of recipient.");

		$recipients = explode(',', $recipients);

		foreach($recipients as $recipient) {
			$drinkInfo = $this->drinks->get_details($drinkType);
			$drinkInfo->qty = $qty;
			$drinkInfo->options = array("type"=> $drinkInfo->type, "title"=> $drinkInfo->name, "recipient"=>$recipient, "recipient_type"=> $recipient_type);

			//If a message has been specified, add it to the product options.
			if($message) $drinkInfo->options["message"] = xss_clean(base64_decode($message));

			if(!$this->cart->insert((array) $drinkInfo)) return $this->json->error("There was a problem adding the product to your cart.");
		}

		//Output cart contents
		$this->json->output(array("status"=>"success", "cart"=>$this->cart->view_cart()));
	}
    
    
    public function test_jblaine( $loginID, $recipients, $estID, $drinkID ) {
        //return( "status"=>"test_jblaine" );
   //     $out = $recipients . "<br>" . $qty  . "<br>" . $drinkType  . "<br>" . $recipient_type  . "<br>" . $message . "<br>" . $loginID;
     
   //     $out = "loginID: " . $loginID. "<br>" . $recipients. "<br>" . $estID. "<br>" . $drinkID ;
  
        $out = "loginID: " . $loginID. "<br>" ;
 
        $out = $out . "estID: " . $estID . "<br>" ;
 
        $out = $out . "drinkID: " . $drinkID . "<br>" ;
       
        $out = $out . "recipients: " . $recipients . "<br>" ;
        
        $this->json->output( array("status"=>$out) );
        
    }
    
    public function add_to_cart_jblaine($recipients = false, $qty = 1, $drinkType = false, $recipient_type = false, $message = false, $loginID = 0 ) {
        
        
        $this->load->library('cart');
        
        $this->load->model('Drinks_model', 'drinks');
        
        $qty = ($this->input->get_post('qty')) ? $this->input->get_post('qty') : $qty; // How Many
        
        
        $drinkType = ($drinkType) ? $drinkType : $this->input->get_post('drinkType'); // id of Drink Type
        $recipients = ($recipients) ? $recipients : $this->input->get_post('recipients');
        $recipient_type = ($recipient_type) ? $recipient_type : $this->input->get_post('recipient_type'); // airtab, text, email?
        
        if(!$drinkType) return $this->json->error("You did not specify a drink type.");
        if(!$recipients) return $this->json->error("You did not specify any recipients.");
        if(!$recipient_type) return $this->json->error("You did not specify the type of recipient.");
        
        $recipients = explode(',', $recipients);
        
        foreach($recipients as $recipient) {
            $drinkInfo = $this->drinks->get_details($drinkType);
            $drinkInfo->qty = $qty;
            $drinkInfo->options = array("type"=> $drinkInfo->type, "title"=> $drinkInfo->name, "recipient"=>$recipient, "recipient_type"=> $recipient_type);
            
            //If a message has been specified, add it to the product options.
            if($message) $drinkInfo->options["message"] = xss_clean(base64_decode($message));
            
            if(!$this->cart->insert((array) $drinkInfo)) return $this->json->error("There was a problem adding the product to your cart.");
        }
        
        //Output cart contents
        $this->json->output(array("status"=>"success", "cart"=>$this->cart->view_cart()));
    }

	//This function only removes any drink items from the cart, main/clear removed everything
	public function clear() {
		$this->load->library('cart');
		foreach($this->cart->contents() as $item) {
				$item['qty'] = 0;
				$this->cart->update($item);
		}
		$this->json->output(array("status"=>"success", "msg"=>"Your cart has been cleared."));
	}
}

/* End of file welcome.php */
/* Location: ./application/controllers/welcome.php */