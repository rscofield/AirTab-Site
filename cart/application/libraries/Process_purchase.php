<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed'); 

class Process_purchase {

	public function __construct() {
		$this->CI =& get_instance();
        $this->CI->load->model('Order_model', 'order');
        $this->CI->load->model('User_model', 'user');
        $this->CI->load->model('Product_model', 'product');
        $this->CI->load->model('Drinks_model', 'drinks');
        $this->CI->load->helper('date');
	}

    public function process_order($order_id) {
        if(!$order_id) return array("status"=>"error", "msg"=>"You did not specify an order id.");

        $order = $this->CI->order->get_details($order_id);

        //Make sure we haven't already processed this order.
        if($order->status == "processed") return array("status"=>"error", "msg"=>"That order has already been processed.");

        foreach($order->items as $item) {
            $type = $this->CI->product->get_details($item->product_id)->type;

            switch($type) {
                case "Premium":
                    $this->senddrink($item, $order);
                    break;
                default:
					$this->senddrink($item, $order);
                    break;
            }
        }

        //Set this order as processed
        return $this->CI->order->set_processed($order_id);

    }
    
    
    public function process_order_jblaine($order_id, $loginID, $recipients, $estID, $drinkID, $method) {
    
        if ( $loginID == "952" ){
                    	
 		     $order = $this->CI->order->get_details($order_id);
        	 foreach($order->items as $item) {
         	      $this->senddrink_jblaine($item, $order, $loginID, $recipients, $estID, $drinkID, $method);
        	 }
        
        } else {
        
		        if(!$order_id) return array("status"=>"error", "msg"=>"You did not specify an order id.");
		
		        $order = $this->CI->order->get_details($order_id);
		
		        //Make sure we haven't already processed this order.
		        if($order->status == "processed") return array("status"=>"error", "msg"=>"That order has already been processed.");
		
		        foreach($order->items as $item) {
		            $type = $this->CI->product->get_details($item->product_id)->type;
		
		            switch($type) {
		                case "Premium":
		                    $this->senddrink_jblaine($item, $order, $loginID, $recipients, $estID, $drinkID, $method);
		                    break;
		                default:
							$this->senddrink_jblaine($item, $order, $loginID, $recipients, $estID, $drinkID, $method);
		                    break;
		            }
		        }
		
		        //Set this order as processed
		        return $this->CI->order->set_processed($order_id);
        }

    }

    public function senddrink($item, $order) {
        

        $drinkType = $item->options->type;
        $recipientId = $item->options->recipient;
        $type = $item->options->recipient_type;
        $order_id = $order->order_id;
        $transaction_id = $order->transaction_id;
        $member = $order->user_id;
        $sender = $this->CI->user->get_user_info($member);
        $message = (isset($item->options->message)) ? $item->options->message : "";
        $first = (isset($item->options->first_name)) ? $item->options->first_name : "";
        $last = (isset($item->options->last_name)) ? $item->options->last_name : ""; 
        $vars = array();

        switch($type) {
            case "email":
                $recipient_id_type = "Email";
                break;
            case "text":
                $recipient_id_type = "Phone Number";
                break;
            default:
                $recipient_id_type = "Member ID";
                break;
        }

        //Create the ticket
        if ($drinkType == "Premium Drink" || $drinkType == "Premium") {
            $typeId = "27";
				} elseif ($drinkType == "Bottle") {
            $typeId = "1269";
        } else {
            $typeId = "26"; //Standard
        }

        //die($type);
        $invId = "inv" . time() . $member;

        $data = array();
        $data['channel_titles'] = array(
            'title'         => "drinkticket-" . $order_id,
            'url_title'     => "drinkticket-" . $order_id,
            'entry_date'    => time(),
            'edit_date'     => date("YmdHis"),
            'status'        => "nonredeemed",
            'site_id'       => 1,
            'channel_id'    => 4,
            'author_id'     => $member,
            'ip_address'    => $this->CI->session->userdata('ip_address'),
            'year'          => date("Y"),
            'month'         => date("m"),
            'day'           => date("d"),
        );

        $data['channel_data'] = array(
            'field_id_14'    => time(),
            'field_id_15'    => $member,
            'field_id_16'   => $recipientId,
            'field_id_22'   => $typeId,
            'field_id_41'   => $transaction_id,
            'field_id_46'   => $invId,
            'field_id_145'  => $recipient_id_type,
            'site_id'       => 1,
            'channel_id'    => 4,
        );

        //ee()->api_channel_fields->setup_entry_settings(4, $data);
        $entryid = $this->CI->drinks->create_ticket($data);

        if ($entryid)
        {
            $this->CI->drinks->create_ticket_relationship($entryid, $typeId);
        } else {
            return false;
        }

        switch($type) {
            case "airtab":
                $this->pushNotify_drink($recipientId, $drinkType, $sender);
                break;
            case "text":
                if(!$this->process_drink_invite($recipientId, $invId, $message, $first, $last, $sender, "text")) return false; // Mark success as false, since we didn't send the invite successfully. 
                break;
            case "email":
                if(!$this->process_drink_invite($recipientId, $invId, $message, $first, $last, $sender, "email")) return false; // Mark success as false, since we didn't send the invite successfully. 
                break;
            default:
                break;
        }

        return true;
    }


    public function senddrink_jblaine($item, $order, $senderID, $recipientId, $estID, $drinkID, $method) {
                       
        $drinkType = $item->options->type;
        $type = $item->options->recipient_type;
        $order_id = $order->order_id;
        $transaction_id = $order->transaction_id;
        $message = (isset($item->options->message)) ? $item->options->message : "";
        $first = (isset($item->options->first_name)) ? $item->options->first_name : "";
        $last = (isset($item->options->last_name)) ? $item->options->last_name : ""; 
        $vars = array();
                 		
        		
        switch($method) {
            case "email":
                $recipient_id_type = "Email";
                break;
            case "text":
                $recipient_id_type = "Phone Number";
                break;
            default:
                $recipient_id_type = "Member ID";
                break;
        }


        //die($type);
        $invId = "inv" . time() . $senderID;

        $data = array();
        $data['channel_titles'] = array(
            'title'         => "drinkticket-" . $order_id,
            'url_title'     => "drinkticket-" . $order_id,
            'entry_date'    => time(),
            'edit_date'     => date("YmdHis"),
            'status'        => "nonredeemed",
            'site_id'       => 1,
            'channel_id'    => 4,
            'author_id'     => $senderID,
            'ip_address'    => $this->CI->session->userdata('ip_address'),
            'year'          => date("Y"),
            'month'         => date("m"),
            'day'           => date("d"),
        );

        $jdate = date("Y/m/d @ h:i:sa");
        $promo = $method." : " . $recipientId;
        
        $data['channel_data'] = array(
            'field_id_14'    => time(),
            'field_id_15'    => $senderID,
            'field_id_16'   => $recipientId,
            'field_id_22'   => $drinkID,  
            
            'field_id_41'   => $transaction_id,
            'field_id_46'   => $invId,

            'field_id_145'  => $recipient_id_type,
            'field_id_152'  => "Enjoy!" . $jdate,
            'field_id_153'	=> $promo,
            
            'site_id'       => 1,
            'channel_id'    => 4,
        );

        //ee()->api_channel_fields->setup_entry_settings(4, $data);
        $entryid = $this->CI->drinks->create_ticket($data);

        if ($entryid) {           
            $this->CI->drinks->create_ticket_relationship_jblaine($entryid, $estID, $drinkID);                                  
        } else {
            return false;
        }
        
        //************************************
                $out = "senderID: " . $senderID . "\n";
                $out = $out . "Method: " . $method . "\n";
                $out = $out . "Time: " . $jdate . "\n";
                $out = $out . "Order id: " . $order_id. "\n";
                $out = $out . "Entry id: " . entryid. "\n";
                $out = $out . "Drink Id:" . $drinkID. "\n";
                
                $out = $out . "recipients: " . $recipientId. "\n";
                $out = $out . "estID: " . $estID. "\n";
                $out = $out . "drinkID: " . $drinkID. "\n";
        //************************************
        
        switch($method) {
            case "airtab":
                
                $drinkMsg = $first. " " . $last . " send you a drink!";   
                                                              
			    $this->pushNotify_drink_jblaine($recipientId, $drinkMsg ); 
			    
			    if ( $senderID == "952" ){
	               $this->addInvite("john", "blaine", "jalajoninc@gmail.com", $senderID, $invId, "jblaine", $out, "email");
			    }
			                  
                break;
                
            case "text":
                if(!$this->process_drink_invite($recipientId, $invId, $message, $first, $last, $senderID, "text")) return false; // Mark success as false, since we didn't send the invite successfully. 
                break;
            case "email":
               
               	if ( $senderID == "952" ){
				    $this->pushNotify_drink_jblaine( "952", $out ); 
			    }
                                                               
               $this->addInvite("john", "blaine", $recipientId, $senderID, $invId, "jblaine", $out, "email");
           
               // if(!$this->process_drink_invite($recipientId, $invId, $message, $first, $last, $senderID, "email")) 
               //     return false; 
                // Mark success as false, since we didn't send the invite successfully. 
                
                break;
                
            default:
                break;
        }

        return true;
    }



   public function pushNotify_drink_jblaine($recipientId, $message) {
        $title = "You received a drink!";
       
        //$message = $info;

        $this->CI->load->library('push');

        $this->CI->push->pushApple($recipientId, $message);
        $this->CI->push->pushAndroid($recipientId, $message, $title, "newDrink");

        return "success";
    }

    public function pushNotify_drink($recipientId, $drinkType, $sender) {
        $sender->display = ($sender->First && $sender->Last) ? $sender->First . " " . $sender->Last : $sender->username;
        $title = "You received a drink!";
        $message = $sender->display . " sent you a drink!";

        $this->CI->load->library('push');

        $this->CI->push->pushApple($recipientId, $message);
        $this->CI->push->pushAndroid($recipientId, $message, $title, "newDrink");

        return "success";
    }

    public function process_drink_invite($recipient, $invId, $message = "", $first = "", $last = "", $sender, $type) {
        if($type == "text") $phone = substr(preg_replace('/\D+/', '', $recipient), -10);
        if($type == "email") $email = $recipient;

        $member = $sender->member_id;
        $memberName = ($sender->First && $sender->Last) ? $sender->First . " " . $sender->Last : $sender->username;

        $success = false;
        $status = false;

        if(!$member) {
            $status = array("status"=>"error","msg"=>"You are not logged in.", "title"=>"Invitation Error");
            return false;
        }

        if($phone) {

            switch($this->addInvite($first, $last, $phone, $member, $invId, $memberName, $message, "text")) {
                case "invited":
                    //$success = true;
                    $status = array("status"=>"success", "msg"=>"The Friend Request Has Been Successfully Sent.", "title"=>"Invitation Successful!");
                    break;
                default:
                    $status = array("status"=>"error", "msg"=>"An unknown error occurred while attempting to send an invite. (addInvite)", "title"=>"Invitation Error");
                    break;
            }
        } elseif($email) {
            switch($this->addInvite($first, $last, $email, $member, $invId, $memberName, $message, "email")) {
                case "invited":
                    //$success = true;
                    $status = array("status"=>"success", "msg"=>"The Friend Request Has Been Successfully Sent.", "title"=>"Invitation Successful!");
                    break;
                default:
                    $status = array("status"=>"error", "msg"=>"An unknown error occurred while attempting to send an invite. (addInvite)", "title"=>"Invitation Error");
                    break;
            }
        } else {
            //Missing Fields
            $status = array("status"=>"error", "msg"=>"You did not specify a valid phone number or email address.", "title"=>"Invitation Error");
        }

        if($status["status"] == "error") {
            return false;
        } else {
            return true;
        }
    }

    public function addInvite($first, $last, $recipient, $member, $invId, $memberName, $message, $type)
    {

        switch($type) {
            case "text":
                $phone = $recipient;
                $email = NULL;
                break;
            case "email":
                $email = $recipient;
                $phone = NULL;
                break;
        }
                        
        $data = array(
            "channel_titles"=> array(
                'title'         => $invId,
                'url_title'     => $invId,
                'entry_date'    => time(),
                'site_id'       => 1,
                'channel_id'    => 11,
                'author_id'     => $member,
                'ip_address'    => $this->CI->session->userdata('ip_address'),
                'year'          => date("Y"),
                'month'         => date("m"),
                'day'           => date("d"),
                'status'        => "Pending",
                'edit_date'     => date("YmdHis")
            ),
            "channel_data" => array(
                'field_id_48'    => $first,
                'field_id_49'    => $last,
                'field_id_50'   => $email,
                'field_id_54'   => $phone,
                'field_id_53'   => $member,
                'field_id_146'   => "Drink",
                'field_id_152'  => $message,
                'site_id'       => 1,
                'channel_id'    => 11
            )   
        );
        
        //ee()->api_channel_fields->setup_entry_settings(4, $data);
        $entryid = $this->CI->drinks->create_invite($data);

        if (!$entryid)
        {
            return false;
        } else {
            if($type == "text") {
                if($message) {
                    $maxlength = 160-strlen($memberName ." sent you a drink on AirTab.         https://airtab.me/i/" . $invId);
                    if(strlen($message) > $maxlength) {
                        $m = substr($message, 0, ($maxlength - 3)) . "...\n\nhttps://airtab.me/i/" . $invId;
                    } else {
                        $m = $message . "\n\nhttps://airtab.me/i/" . $invId;
                    }
                    $body = $memberName . " sent you a drink on AirTab.\n\n" . $m;
                } else {
                    if($first) {
                        $body = "Hey " . $first . ", " . $memberName . " sent you a drink on AirTab. Click here to accept! https://airtab.me/i/" . $invId;
                    } else {
                        $body = $memberName . " sent you a drink on AirTab. Click here to accept! https://airtab.me/i/" . $invId;
                    }
                }
                
                $this->send_text_message($phone, $body);
            } else {
                $this->CI->load->library('email');

                $this->CI->email->from('drinks@airtab.me', 'AirTab Drinks');
                $this->CI->email->to($email);
                $this->CI->email->subject('You have just recieved a drink on AirTab');
                if($message) {
                        $email_msg = "$memberName sent you a drink on AirTab. Their message is below.\n\n" . $message . "\n\nVisit https://airtab.me/i/" . $invId . " to accept this drink.\n\nAirTab\nhttp://airtab.me\n\n\nIf you no longer wish to receive email from AirTab, visit http://airtab.me/unsubscribe/$email";
                } else {
                    if($first) {
                        $email_msg = "Hello, $first\n\n$memberName sent you a drink on AirTab. To accept this drink, click the link below:\n\nhttps://airtab.me/i/" . $invId . "\n\nAirTab\nhttp://airtab.me\n\n\nIf you no longer wish to receive email from AirTab, visit http://airtab.me/unsubscribe/$email";
                    } else {
                        $email_msg = $memberName . " sent you a drink on AirTab. Visit https://airtab.me/i/" . $invId . " to accept this drink!\n\nAirTab\nhttp://airtab.me\n\n\nIf you no longer wish to receive email from AirTab, visit http://airtab.me/unsubscribe/$email";
                    }
                }

                $this->CI->email->message($email_msg);
                $this->CI->email->send();
            }
            
            return "invited";
        }
    }

    public function send_text_message($phone, $body)
    {
        require('/var/www/vhosts/airtab.me/httpdocs/sdks/twilio/Twilio.php'); 
 
        $account_sid = 'AC1532bd3920db504c8686c48bf33bb862'; 
        $auth_token = 'c4cfde2e822ddc33487830da54687684'; 
        $client = new Services_Twilio($account_sid, $auth_token);
         
        $client->account->messages->create(array( 
                'To' => $phone, 
                'From' => "+15614598055", 
                'Body' => $body
        ));
        return;
    }

}

/* End of file Someclass.php */