<?php  if ( ! defined('BASEPATH')) exit('No direct script access allowed');

/**
 * ExpressionEngine - by EllisLab
 *
 * @package		ExpressionEngine
 * @author		ExpressionEngine Dev Team
 * @copyright	Copyright (c) 2003 - 2011, EllisLab, Inc.
 * @license		http://expressionengine.com/user_guide/license.html
 * @link		http://expressionengine.com
 * @since		Version 2.0
 * @filesource
 */
 
// ------------------------------------------------------------------------

/**
 * airtab Module Front End File
 *
 * @package		ExpressionEngine
 * @subpackage	Addons
 * @category	Module
 * @author		Ray Scofield
 * @link		http://www.viperss.com
 */

class Airtab {
	
	public $return_data;
	
	/**
	 * Constructor
	 */
	public function __construct()
	{
		$this->EE =& get_instance();
	}
	
	// ----------------------------------------------------------------

	/**
	 * Start on your custom code here...
	 */
	 
	/**
	 * Tags
	 */
	 public function log_page_load()
	 {
		$count = $this->EE->TMPL->fetch_param("count", "1");
		$match = $this->EE->TMPL->fetch_param("match", "1");
		if ($count == $match)  {
			// change table prefix to air_
			$dbprefix = $this->EE->db->dbprefix;  // save current prefix
			$this->EE->db->dbprefix = 'air_';
			// load optional misc field data
			$misc = $this->EE->TMPL->fetch_param("misc", "");
		
			$this->EE->db->insert(
				'posted',
				array(
					'page'  => $this->EE->uri->uri_string(),
					'ip' => $this->EE->session->userdata('ip_address'),
					'member_id' => $this->EE->session->userdata('member_id'),
					'misc' => $misc,
					'user_agent' => $_SERVER['HTTP_USER_AGENT']
				)
			);	
			// put prefix back to what it was
			$this->EE->db->dbprefix = $dbprefix; 
		}
		
		$this->return_data = "";
	 }
	 
	 // process any redeemed drink text notifications to establishment
	 public function redeemed_drink_est_notify($estab = false, $server = false)
	 {
		if(!$estab) $estab = $this->EE->TMPL->fetch_param("estab", "0");
		if(!$server) $server = $this->EE->TMPL->fetch_param("server", "0");
		// see if we have a redeem notify number set in establishment record
		$db = clone $this->EE->db;
		$db->dbprefix='';	// remove exp_ prefix	
		$results = $db->select('est_redeem_notify')
			->from('v_establishment')
			->where(array(
					'entry_id' => $estab
				))
			->get();		
		if ($results->num_rows() == 1)
		{
			$number = $results->row("est_redeem_notify");
			if($number)
			{
				// we do, send text notify message to number
				$body = "AirTab drink was redeemed by server id=" . $server . " at " . date('d.m.Y H:i:s');
				$this->send_text_message($number,$body);
			}
		}
		
		$this->return_data = "";
	 }	 
	 
	 public function get_user_info()
	 {
			$member_id = $this->EE->TMPL->fetch_param("member_id");
			$member_data[] = $this->get_member_data($member_id);
			//echo "<pre>";
			//print_r($member_data);	
			//echo "<pre>";
			return $this->EE->TMPL->parse_variables($this->EE->TMPL->tagdata, $member_data);
	 }
	 
	 /**
	  * Forms
	  */

	public function avatar() {
		$member = $this->EE->TMPL->fetch_param("member");
		$size = $this->EE->TMPL->fetch_param("size");

		if($size) {
			$defaultsize = $size;
		} else {
			$defaultsize = "640";
		}


		if($member) {
			$db = clone $this->EE->db;
			$db->dbprefix='';

			$results = $db->select('filename')
				->from('v_avatars')
				->where(array(
						'member' => $member
					))
				->get();
			
			//User doesn't have permission to skip checkout
			if ($results->num_rows() == 0)
			{
				$avatar = "//airtab.me/uploads/avatars/_" . $defaultsize . "/default_avatar.png";
			} else {
				$avatar = "//airtab.me/avatar/?file=" . $results->row("filename") . "&size=$size";
			}
			
			return $avatar;
		}

		return "";
	}

	public function invite_type() {
		$inviteId = $this->EE->TMPL->fetch_param("id");

		if(!$inviteId) return "Invitation";

		$results = ee()->db->limit(1)
			->where('title', $inviteId)
			->get('channel_titles');

		if ($results->num_rows() > 0) {
			$entry_id = $results->row('entry_id');
			$results2 = ee()->db->limit(1)
				->where('entry_id', $entry_id)
				->get('channel_data');
			if ($results2->num_rows() > 0) {
				return $results2->row('field_id_146')." Invitation";	
			}
		}

		return "Invitation";
	}

	public function process_friend_invite_member() {
		$member = ee()->session->userdata('member_id');
		$id = $this->EE->TMPL->fetch_param("id");

		if(!$member) {
			$status = array("status"=>"error","msg"=>"You are not logged in.", "title"=>"Invitation Error");
			// return all our data to an AJAX call
			echo json_encode($error);
			return;
		}

		if(!$id) {
			$status = array("status"=>"error","msg"=>"You did not specify a user id.", "title"=>"Invitation Error");
			// return all our data to an AJAX call
			echo json_encode($error);
			return;
		}

		switch($this->checkInvite_member($id, $member)) {
			case "friended":
				$status = array("status" => "success","msg"=>"A friend request has been successfully sent!", "title"=>"Friend Request Sent");
				break;
			case "exists":
				$status = array("status" => "error", "msg"=>"You have already sent an request to that member.", "title"=>"Invitation Error");
				break;
			case "alreadyfriend":
				$status = array("status" => "error","msg"=>"You are already friends with that member.", "title"=>"Invitation Error");
				break;
			case "frienderror":
				$status = array("status" => "error","msg"=>"There was an error sending a friend request.", "title"=>"Invitation Error");
				break;
			case "nouserexists":
				$status = array("status" => "error","msg"=>"No user with that user id exists.", "title"=>"Invitation Error");
				break;
			default:
				$status = array("status"=>"error", "msg"=>"An unknown error occurred attempting to send an invitation. (checkInvite)", "title"=>"Invitation Error");
				break;
		}

		echo json_encode($status);
		return;
	}

	// Check if the person has already been invited/is already a member
	function checkInvite_member($id, $member) {

		// Check if a member with this email already exists
		$results = ee()->db->limit(1)
			->where('member_id', $id)
			->get('members');
		
		if ($results->num_rows() > 0)
		{
			$id = $results->row('member_id');
			return $this->addFriend($id, $member);
		}
		
		return "nouserexists";
	}
	
	function getAndroidDeviceIds($member) {
	    $id = 'APA91bHQEXTE98nCCSGdiXWi3lDt0rHHiXt_UayDfnB6bMOhriZ8iCeP7k4RVaU8wGjrHgZxsx-u3wBoH_5cKdjO62xs1hJ8tBEo1SwsI4T5g5RYhpR0B-z972W7HuaaQ09a7joXXi6oFp176qZRZUPj-W1FQeKY6A';
	
	    $registrationIds = array($id);
	    
	    return( registrationIds );
	}

	function getAndroidDeviceIdsEx($member) {
		$results =$this->EE->db->query("SELECT * FROM at_devicetokens WHERE type = 'android' AND member = " . mysql_real_escape_string($member));
			
		//Does this user have any push tokens?
		if ($results->num_rows() > 0)
		{
			$ids = array();
			foreach($results->result() as $result) {
				array_push($ids, $result->token);
			}
			return $ids;
		}

		return false;
	}

	function getiOSDeviceIds($member) {
		$results =$this->EE->db->query("SELECT * FROM at_devicetokens WHERE type = 'ios' AND member = " . mysql_real_escape_string($member));
			
		//Does this user have any push tokens?
		if ($results->num_rows() > 0)
		{
			$ids = array();
			foreach($results->result() as $result) {
				array_push($ids, $result);
			}
			return $ids;
		}

		return false;
	}

	public function android_device_token() {
		$act = $this->EE->TMPL->fetch_param("act", "get");
		$token = $this->EE->TMPL->fetch_param("token", false);
		$json = $this->EE->TMPL->fetch_param("json", false);
		$getMember = $this->EE->TMPL->fetch_param("member", false);
		$member_id = ee()->session->userdata('member_id', false);

		if($act == "get") {
			if(!$getMember) {
				$status = json_encode(array("status" => "error", "msg"=>"You did not specify a member.$json"));
				echo $status;
				return false;
			} else {
				$results =$this->EE->db->query("SELECT * FROM at_devicetokens WHERE type = 'android' AND member = " . mysql_real_escape_string($getMember));
			
				//Does this user have any push tokens?
				if ($results->num_rows() > 0)
				{
					if($json === false) {
						return $results->result_array();
					} else {
						//echo json_encode(array("status"=>"success", "keys"=>$results));
						echo json_encode($results->result_array());
						return;
					}
				}
			}
		} else if ($act == "set") {
			/*ee()->db->update(
				    'member_data',
				    array(
				        'm_field_id_18'  => $token
				    ),
				    array(
				        'member_id' => $member_id
				    )
			);*/
			if(!$member_id) {
				$status = json_encode(array("status" => "error", "msg"=>"You are not logged in."));
				echo $status;
				return;
			} else if(!$token) {
				$status = json_encode(array("status" => "error", "msg"=>"You did not specify a device token."));
				echo $status;
				return;
			} else {
				$this->EE->db->query("INSERT INTO at_devicetokens (token, type, member, updated) VALUES ('$token', 'android', $member_id, '" . time() . "') ON DUPLICATE KEY UPDATE member=$member_id, updated='" . time() . "'");
				$status = json_encode(array("status" => "success", "msg"=>"Successfully updated the Device ID."));
				echo $status;
				return;
			}
		}
	}
	

	public function set_device_token() {
		$token = $this->EE->TMPL->fetch_param("token", false);
		$member_id = $this->EE->TMPL->fetch_param("member_id", false);
		$platform = $this->EE->TMPL->fetch_param("platform", false);
		
		return( $this->set_device_tokenEx($member_id, $platform, $token) );
	}
	

	public function set_device_tokenEx($member_id, $platform, $token) {

			if(!$member_id) {
				$status = json_encode(array("status" => "error", "msg"=>"You are not logged in."));
				echo $status;
				return( "Error: set token for " . $member_id );
			} else if(!$token) {
				$status = json_encode(array("status" => "error", "msg"=>"You did not specify a device token."));
				echo $status;
				return( "Error: set token for " . $member_id );
			} else {
			
			    if( $token == null ){
					return( "Error: Bad token." );			    
			    } else {
					$this->EE->db->query("INSERT INTO at_devicetokens (token, type, member, updated) VALUES ('$token', '$platform', $member_id, '" . time() . "') ON DUPLICATE KEY UPDATE member=$member_id, updated='" . time() . "'");
					$status = json_encode(array("status" => "success", "msg"=>"Successfully updated the Device ID." . $member_id ) );
					return( "success: set token for " . $member_id );
				}
			}
	}
	 
	public function form_senddrink_invite_text() 
	{

		// set the sender_id from session logged in member
		$sender_id = $this->EE->session->userdata('member_id');
		if( $sender_id === FALSE ) {
				return "";
		}
		
		// Build an array to hold the form's hidden fields
		$hidden_fields = array(
				"sender_id" => $sender_id,
				"send_type" => "text",
				"ACT" => $this->EE->functions->fetch_action_id( 'Airtab', 'process_senddrink_invite' )
		);
		
		// Build an array with the form data
		$form_data = array(
				"id" => $this->EE->TMPL->form_id,
				"class" => $this->EE->TMPL->form_class,
				"hidden_fields" => $hidden_fields
		);

		// Fetch contents of the tag pair, ie, the form contents
		$tagdata = $this->EE->TMPL->tagdata;

		$form = $this->EE->functions->form_declaration($form_data) . 
				$tagdata . "</form>";

		return $form;
	}

	public function senddrink() {
		$drinkType = $this->EE->TMPL->fetch_param("drinkType");
		$recipientId = $this->EE->TMPL->fetch_param("recipient");
		$type = $this->EE->TMPL->fetch_param("type");
		$order_id = $this->EE->TMPL->fetch_param("order_id");
		$transaction_id = $this->EE->TMPL->fetch_param("transaction_id");
		$member = ee()->session->userdata('member_id');
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
		ee()->load->library('api');
		ee()->api->instantiate('channel_entries');

		if ($drinkType == "Premium") {
		 	$typeId = "27";
		} else {
			$typeId = "26"; //Standard
		}

		//die($type);
		$invId = "inv" . time() . $member;

		$data = array(
		    'title'         => "drinkticket-" . $order_id,
		    'entry_date'    => time(),
		    'edit_date'     => time(),
		    'field_id_14'    => time(),
		    'field_id_15'    => ee()->session->userdata('member_id'),
		    'field_id_16'   => $recipientId,
		    'field_id_22'   => $typeId,
		    'field_id_41'	=> $transaction_id,
		    'field_id_46'	=> $invId,
		    'field_id_145'	=> $recipient_id_type,
		    'status'		=> "nonredeemed"
		);

		//ee()->api_channel_fields->setup_entry_settings(4, $data);

		if (ee()->api_channel_entries->save_entry($data, 4) === FALSE)
		{
		    $vars[0]['json'] = json_encode(array("success"=>false, "msg"=>"Could not create ticket. Please contact customer service."));
		    
		} else {
			$entryid = $this->EE->api_channel_entries->entry_id;
			ee()->db->insert('relationships', array('parent_id' => $entryid, 'child_id'=> $typeId, "field_id"=>"22"));
			$relationshipId = ee()->db->insert_id();
			$vars[0]['json'] = json_encode(array("success"=>true));
		}

		switch($type) {
			case "airtab":
				$this->pushNotify_drink($recipientId, $drinkType);
				break;
			case "text":
				if(!$this->process_drink_invite_text($recipientId, $invId)) $vars[0]['json'] = json_encode(array("success"=>false)); // Mark success as false, since we didn't send the invite successfully. 
				break;
			case "email":
				if(!$this->process_drink_invite_email($recipientId, $invId)) $vars[0]['json'] = json_encode(array("success"=>false)); // Mark success as false, since we didn't send the invite successfully. 
				break;
			default:
				break;
		}

		return ee()->TMPL->parse_variables(ee()->TMPL->tagdata, $vars);
	}
	
	public function senddrink_promo() {
		$drinkType = $this->EE->TMPL->fetch_param("drinkType");
		$recipientId = $this->EE->TMPL->fetch_param("recipient");
		$type = $this->EE->TMPL->fetch_param("type");
		$message = $this->EE->TMPL->fetch_param("message", "");
		$first = $this->EE->TMPL->fetch_param("first_name", "");
		$last = $this->EE->TMPL->fetch_param("last_name", "");
		$member = ee()->session->userdata('member_id');
		$order_id = "PROMO".time().$member;
		$transaction_id = "PROMO-".time().$member;
		$vars = array();

		if($message != "") $message = base64_decode($message); // Message is base64 encoded in order to pass it via url, let's decode it.

		$db = clone $this->EE->db;
		$db->dbprefix='';

		$results = $db->select('*')
			->from('at_skipcheckout')
			->where(array(
					'id' => $member
				))
			->get();
		
		switch($type) {
			case "email":
				$recipient_id_type = "Email";
				break;
			case "text":
				$recipient_id_type = "Phone Number";
				$recipientId = $this->sanitize_phone(html_entity_decode($this->EE->TMPL->fetch_param("recipient")));
				break;
			default:
				$recipient_id_type = "Member ID";
				break;
		}


		
		
		// update the # of drinks sent
//		$db->update(
//			    'at_skipcheckout',
//			    array(
//			        'drinks_sent'  => $results->row('drinks_sent')+1
//			    ),
//			    array(
//			        'id' => $results->row('id')
//			    )
//		);		

		//Create the ticket
		ee()->load->library('api');
		ee()->api->instantiate('channel_entries');

		if ($drinkType == "Premium") {
		 	$typeId = "27";
		} else if ($drinkType == "Standard") {
			$typeId = "26"; //Standard
		} else {
			$typeId = $drinkType; 
		}

		//die($type);
		$invId = "inv" . time() . $member;

		$data = array(
		    'title'         => "promoticket-" . time() . $member,
		    'entry_date'    => time(),
		    'edit_date'     => time(),
		    'field_id_14'    => time(),
		    'field_id_15'    => ee()->session->userdata('member_id'),
		    'field_id_16'   => $recipientId,
		    'field_id_22'   => $typeId,
		    'field_id_41'	=> $transaction_id,
		    'field_id_46'	=> $invId,
		    'field_id_145'	=> $recipient_id_type,
		    'field_id_152'	=> $message,
		    'status'		=> "nonredeemed"
		);

		//ee()->api_channel_fields->setup_entry_settings(4, $data);

		if (ee()->api_channel_entries->save_entry($data, 4) === FALSE)
		{
		    $vars[0]['json'] = json_encode(array("success"=>false, "msg"=>"Could not create ticket. Please contact customer service."));
		    
		} else {
			$entryid = $this->EE->api_channel_entries->entry_id;
			ee()->db->insert('relationships', array('parent_id' => $entryid, 'child_id'=> $typeId, "field_id"=>"22"));
			$relationshipId = ee()->db->insert_id();
			$vars[0]['json'] = json_encode(array("success"=>true));
		}

		//$this->pushNotify_drink($recipientId, $drinkType);
		//$this->pushNotify_drink( 952, $drinkType);
		
		switch($type) {
			case "airtab":
				$status = $this->pushNotify_drink($recipientId, $drinkType);
				return( "You have successfully sent a drink." );
				//break;
			case "text":
				if(!$this->process_drink_invite_text($recipientId, $invId, $message, $first, $last )) $vars[0]['json'] = json_encode(array("success"=>false)); // Mark success as false, since we didn't send the invite successfully. 
				return( "You have successfully TEXT a drink to " . $recipientId );
				//break;
			case "email":
				if(!$this->process_drink_invite_email($recipientId, $invId, $message, $first, $last, "drink90")) $vars[0]['json'] = json_encode(array("success"=>false)); // Mark success as false, since we didn't send the invite successfully. 
				return( "You have successfully EMAIL a drink to " . $recipientId );
				//break;
			default:
				break;
		}


		return ee()->TMPL->parse_variables(ee()->TMPL->tagdata, $vars) ;
	}

	public function senddrink_promo_bottle() {
	
		$est = $this->EE->TMPL->fetch_param("estID");
		$drinkType = $this->EE->TMPL->fetch_param("drinkType");
		$recipientId = $this->EE->TMPL->fetch_param("recipient");
		$type = $this->EE->TMPL->fetch_param("type");
		$message = $this->EE->TMPL->fetch_param("message", "");
		$first = $this->EE->TMPL->fetch_param("first_name", "");
		$last = $this->EE->TMPL->fetch_param("last_name", "");
		$member = ee()->session->userdata('member_id');
		$order_id = "PROMO".time().$member;
		$transaction_id = "PROMO-".time().$member;
		$vars = array();
		

		if($message != "") $message = base64_decode($message); // Message is base64 encoded in order to pass it via url, let's decode it.

		$db = clone $this->EE->db;
		$db->dbprefix='';

		
		switch($type) {
			case "email":
				$recipient_id_type = "Email";
				break;
			case "text":
				$recipient_id_type = "Phone Number";
				$recipientId = $this->sanitize_phone(html_entity_decode($this->EE->TMPL->fetch_param("recipient")));
				break;
			default:
				$recipient_id_type = "Member ID";
				break;
		}

        $drinkSent = "drink";
        
		//Create the ticket
		ee()->load->library('api');
		ee()->api->instantiate('channel_entries');
        
		if ($drinkType == "Premium") {
		 	$typeId = "27";
		} else if ($drinkType == "Standard") {
			$typeId = "26"; //Standard
		} else {
			$typeId = $drinkType; 
			$drinkSent = "gift";			
		}

		//die($type);
		$invId = "inv" . time() . $member;
		
        //$message = $message." >> ".$drinkType; 
         
		$data = array(
		    'title'         => "promoticket-" . time() . $member,
		    'entry_date'    => time(),
		    'edit_date'     => time(),
		    'field_id_14'    => time(),
		    'field_id_15'    => ee()->session->userdata('member_id'),
		    'field_id_16'   => $recipientId,
		    'field_id_22'   => $typeId,
		    'field_id_41'	=> $transaction_id,
		    'field_id_46'	=> $invId,
		    'field_id_145'	=> $recipient_id_type,
		    'field_id_152'	=> $message,
		    'status'		=> "nonredeemed"
		);

		//$status = $this->pushNotify_bottle($recipientId, $drinkType, "gift" );					

		if (ee()->api_channel_entries->save_entry($data, 4) === FALSE)
		{
		    $vars[0]['json'] = json_encode(array("success"=>false, "msg"=>"Could not create ticket. Please contact customer service."));
		    
		} else {
			$entryid = $this->EE->api_channel_entries->entry_id;
			ee()->db->insert('relationships', array('parent_id' => $entryid, 'child_id'=> $typeId, "field_id"=>"22"));
			$relationshipId = ee()->db->insert_id();
			$vars[0]['json'] = json_encode(array("success"=>true, "giftid"=>$entryid));
			
			ee()->db->insert('relationships', array('parent_id' => $entryid, 'child_id'=> $est, "field_id"=>"18"));
			$relationshipId = ee()->db->insert_id();
						
			ee()->db->insert('relationships', array('parent_id' => $entryid, 'child_id'=> $drinkType, "field_id"=>"47"));
			$relationshipId = ee()->db->insert_id();			
		}
		

		switch($type) {
			case "airtab":
				$status = $this->pushNotify_bottle($recipientId, $drinkType, "gift" );					
				break;
			case "text":
				if(!$this->process_drink_invite_text($recipientId, $invId, $message, $first, $last, $drinkSent )) $vars[0]['json'] = json_encode(array("success"=>false)); // Mark success as false, since we didn't send the invite successfully. 
				break;
			case "email":
				if(!$this->process_drink_invite_email($recipientId, $invId, $message, $first, $last)) $vars[0]['json'] = json_encode(array("success"=>false)); // Mark success as false, since we didn't send the invite successfully. 
				break;
			default:
				break;
		}

		return ee()->TMPL->parse_variables(ee()->TMPL->tagdata, $vars) ;
	}
	
	
	public function has_promo_rights() {
		$member = ee()->session->userdata('member_id');
		$vars = array();

		$db = clone $this->EE->db;
		$db->dbprefix='';

		$results = $db->select('*')
			->from('at_skipcheckout')
			->where(array(
					'id' => $member
				))
			->get();

		if ($results->num_rows() == 0)
		{
			return ee()->TMPL->no_results();
		}


		if($results->row('drinks_limit') && ($results->row('drinks_sent') >= $results->row('drinks_limit'))) {
			return ee()->TMPL->no_results();
		}

		$vars[0]['remaining'] = ($results->row('drinks_limit')) ? $results->row('drinks_limit') - $results->row('drinks_sent') : "Unlimited";
		return ee()->TMPL->parse_variables(ee()->TMPL->tagdata, $vars);
	}

	public function redeem_drink() {
		$ticket = $this->EE->TMPL->fetch_param("ticket", false);
		$est = $this->EE->TMPL->fetch_param("establishment", false);
		$drink = $this->EE->TMPL->fetch_param("drink", false);
		$serverId = $this->EE->TMPL->fetch_param("server", false);
		$errormes = false;
		$serverIdImage = false;
		$midnight = strtotime('today midnight');
		$closing = strtotime("today 6am");
		$now = strtotime('now');
		$drinkcount = 1;
		$member_id = ee()->session->userdata('member_id');
		date_default_timezone_set('America/New_York'); //Eastern Time

		//Storage for output
		$vars = array();


		//Initial Checks for required information
		if(!$member_id) {
			$vars[0]['error'] = '{"status": "error", "msg": "It appears you are not currently logged in. Please login and try again.", "title":"Redemption Error"}';
			return ee()->TMPL->parse_variables(ee()->TMPL->tagdata, $vars);
		}
		if(!$ticket || !$est || !$drink || !$serverId) {
			$vars[0]['error'] = '{"status": "error", "msg": "Either the Ticket ID, Establishment ID, Drink ID or Server Code are missing. Please try again.", "title":"Redemption Error"}';
			return ee()->TMPL->parse_variables(ee()->TMPL->tagdata, $vars);
		}
		
		
		// make sure ticket is redeemable
		$server_sql = ee()->db->select('status')
			->from('exp_channel_titles')
			->where(array(
		        	'entry_id'  => $ticket,
					'status' => 'nonredeemed'
			))->get();
		if ($server_sql->num_rows() <= 0)
		{
		    $vars[0]['error'] = '{"status": "error", "msg": "This ticket has already been redeemed.".$member_id, "title":"Redemption Error"}';
		    return ee()->TMPL->parse_variables(ee()->TMPL->tagdata, $vars);
		}
		
		// limit to 3 drinks redeemed in 3 hours (don't restrict Promo users)
		if(!$this->has_promo_rights()) {
			$sql = "SELECT entry_id FROM v_drink_tickets WHERE tck_r_member=".$member_id." AND tck_redeem_date > 1 AND (UNIX_TIMESTAMP()-tck_redeem_date)/60 < 180";
			$query = ee()->db->query($sql);
			if ($query->num_rows() >= 3)
			{
				$vars[0]['error'] = '{"status": "error", "msg": "Three drinks redeemed in three hours limit exceeded.", "title":"Redemption Error"}';
				return ee()->TMPL->parse_variables(ee()->TMPL->tagdata, $vars);
			}
		}			
		
		if($now >= $closing) {
			//it is after closing, but before midnight of this business day
			$oldest = $closing + 1; // Make oldest drink ticket 1 second after closing
		} else {
			//It is after midnight but before closing
			$oldest = strtotime("yesterday 6:00:01am"); // Make oldest drink ticket 7am
		}
		
		$server_sql = ee()->db->select('m_field_id_16')
			->from('member_data')
			->where(array(
		        	'm_field_id_15' => $serverId
			))->get();

		if ($server_sql->num_rows() == 0)
		{
		    $vars[0]['error'] = '{"status": "error", "msg": "The server code you entered is invalid. Please check with your server and try again.", "title":"Redemption Error"}';
		    return ee()->TMPL->parse_variables(ee()->TMPL->tagdata, $vars);
		} else {
			$serverIdImage = $server_sql->row("m_field_id_16");
		}
		
		$drink_count_sql = ee()->db->select('entry_id')
			->from('channel_data')
			->where(array(
		        	'field_id_17 >' => "$oldest",
		        	'field_id_140' => $serverId
		))->get();

		$drinkcount = $drink_count_sql->num_rows()+1;

		ee()->db->update(
		    'channel_data',
		    array(
		        'field_id_17'  => $now,
            'field_id_18'  => $est,
            'field_id_47'  => $drink,
		        'field_id_140' => $serverId
		    ),
		    array(
		        'entry_id' => $ticket,
		        'field_id_16' => $member_id
		    )
		);

		
		//Make sure that the ticket was found and updated
		if(ee()->db->affected_rows() == 1) {
			//Ticket was found and updated, update status and relationships (establishment and drink)
			ee()->db->update(
			    'channel_titles',
			    array(
			        'status'  => "pending"
			    ),
			    array(
			        'entry_id' => $ticket
			    )
			);
			
			ee()->db->insert('relationships', array('parent_id' => $ticket, 'child_id'=> $est, "field_id"=>"18"));
			ee()->db->insert('relationships', array('parent_id' => $ticket, 'child_id'=> $drink, "field_id"=>"47"));
		} else {
			$vars[0]['error'] = '{"status": "error", "msg": "An unknown error has occurred. If the problem persists, please contact AirTab Support.", "title":"Redemption Error"}';
			return ee()->TMPL->parse_variables(ee()->TMPL->tagdata, $vars);
		}


		//Everything was successful

		//Send Notification To Establishment
		$this->redeemed_drink_est_notify($est, $serverId);

		//Output Success
		$vars[0]['success'] = true;
		$vars[0]['est'] = $est;
		$vars[0]['server_image'] = $serverIdImage;
		$vars[0]['server_id'] = $serverId;
		$vars[0]['drink_count'] = $drinkcount;
		return ee()->TMPL->parse_variables(ee()->TMPL->tagdata, $vars);
	}


	public function regift_drink() {
		$ticket = $this->EE->TMPL->fetch_param("ticket", false);
		$est = $this->EE->TMPL->fetch_param("establishment", false);
		$drink = $this->EE->TMPL->fetch_param("drink", false);
		$serverId = $this->EE->TMPL->fetch_param("server", false);
		$recipientId = $this->EE->TMPL->fetch_param("recipientId", false);
		
		
		$errormes = false;
		$serverIdImage = false;
		$midnight = strtotime('today midnight');
		$closing = strtotime("today 6am");
		$now = strtotime('now');
		$drinkcount = 1;
		$member_id = ee()->session->userdata('member_id');
		date_default_timezone_set('America/New_York'); //Eastern Time

		//Storage for output
		$vars = array();


		//Initial Checks for required information
		if(!$member_id) {
			$vars[0]['error'] = '{"status": "error", "msg": "It appears you are not currently logged in. Please login and try again.", "title":"Redemption Error"}';
			return ee()->TMPL->parse_variables(ee()->TMPL->tagdata, $vars);
		}
		if(!$ticket || !$est || !$drink || !$serverId) {
			$vars[0]['error'] = '{"status": "error", "msg": "Either the Ticket ID, Establishment ID, Drink ID or Server Code are missing. Please try again.", "title":"Redemption Error"}';
			return ee()->TMPL->parse_variables(ee()->TMPL->tagdata, $vars);
		}
		
		
		// make sure ticket is redeemable
		$server_sql = ee()->db->select('status')
			->from('exp_channel_titles')
			->where(array(
		        	'entry_id'  => $ticket,
					'status' => 'nonredeemed'
			))->get();
		if ($server_sql->num_rows() <= 0)
		{
		    $vars[0]['error'] = '{"status": "error", "msg": "This ticket has already been redeemed.".$member_id, "title":"Redemption Error"}';
		    return ee()->TMPL->parse_variables(ee()->TMPL->tagdata, $vars);
		}
		
		// limit to 3 drinks redeemed in 3 hours (don't restrict Promo users)
	//	if(!$this->has_promo_rights()) {
	//		$sql = "SELECT entry_id FROM v_drink_tickets WHERE tck_r_member=".$member_id." AND tck_redeem_date > 1 AND (UNIX_TIMESTAMP()-tck_redeem_date)/60 < 180";
	//		$query = ee()->db->query($sql);
	//		if ($query->num_rows() >= 3)
	//		{
	//			$vars[0]['error'] = '{"status": "error", "msg": "Three drinks redeemed in three hours limit exceeded.", "title":"Redemption Error"}';
	//			return ee()->TMPL->parse_variables(ee()->TMPL->tagdata, $vars);
	//		}
	//	}			
		
		if($now >= $closing) {
			//it is after closing, but before midnight of this business day
			$oldest = $closing + 1; // Make oldest drink ticket 1 second after closing
		} else {
			//It is after midnight but before closing
			$oldest = strtotime("yesterday 6:00:01am"); // Make oldest drink ticket 7am
		}
		
		$server_sql = ee()->db->select('m_field_id_16')
			->from('member_data')
			->where(array(
		        	'm_field_id_15' => $serverId
			))->get();

		if ($server_sql->num_rows() == 0)
		{
		    $vars[0]['error'] = '{"status": "error", "msg": "The server code you entered is invalid. Please check with your server and try again.", "title":"Redemption Error"}';
		    return ee()->TMPL->parse_variables(ee()->TMPL->tagdata, $vars);
		} else {
			$serverIdImage = $server_sql->row("m_field_id_16");
		}
		
		$drink_count_sql = ee()->db->select('entry_id')
			->from('channel_data')
			->where(array(
		        	'field_id_17 >' => "$oldest",
		        	'field_id_140' => $serverId
		))->get();

		$drinkcount = $drink_count_sql->num_rows()+1;

		ee()->db->update(
		    'channel_data',
		    array(
		        'field_id_17'  => $now,
		        'field_id_140' => $serverId
		    ),
		    array(
		        'entry_id' => $ticket,
		        'field_id_16' => $member_id
		    )
		);

		
		//Make sure that the ticket was found and updated
		if(ee()->db->affected_rows() == 1) {
			//Ticket was found and updated, update status and relationships (establishment and drink)
			ee()->db->update(
			    'channel_titles',
			    array(
			        'status'  => "regifted : " . $recipientId
			    ),
			    array(
			        'entry_id' => $ticket
			    )
			);
			
			//ee()->db->insert('relationships', array('parent_id' => $ticket, 'child_id'=> $est, "field_id"=>"18"));
			//ee()->db->insert('relationships', array('parent_id' => $ticket, 'child_id'=> $drink, "field_id"=>"47"));
		} else {
			$vars[0]['error'] = '{"status": "error", "msg": "An unknown error has occurred. If the problem persists, please contact AirTab Support.", "title":"Redemption Error"}';
			return ee()->TMPL->parse_variables(ee()->TMPL->tagdata, $vars);
		}


		//Everything was successful

		//Send Notification To Establishment
		$this->redeemed_drink_est_notify($est, $serverId);

		//Output Success
		$vars[0]['success'] = true;
		$vars[0]['est'] = $est;
		$vars[0]['server_image'] = $serverIdImage;
		$vars[0]['server_id'] = $serverId;
		$vars[0]['drink_count'] = $drinkcount;
		return ee()->TMPL->parse_variables(ee()->TMPL->tagdata, $vars);
	}

	public function form_senddrink_invite_email() 
	{

		// set the sender_id from session logged in member
		$sender_id = $this->EE->session->userdata('member_id');
		if( $sender_id === FALSE ) {
				return "";
		}
		
		// Build an array to hold the form's hidden fields
		$hidden_fields = array(
				"sender_id" => $sender_id,
				"send_type" => "email",
				"ACT" => $this->EE->functions->fetch_action_id( 'Airtab', 'process_senddrink_invite' )
		);
		
		// Build an array with the form data
		$form_data = array(
				"id" => $this->EE->TMPL->form_id,
				"class" => $this->EE->TMPL->form_class,
				"hidden_fields" => $hidden_fields
		);

		// Fetch contents of the tag pair, ie, the form contents
		$tagdata = $this->EE->TMPL->tagdata;

		$form = $this->EE->functions->form_declaration($form_data) . 
				$tagdata . "</form>";

		return $form;
	}  

	public function form_senddrink_invite_username() 
	{

		// set the sender_id from session logged in member
		$sender_id = $this->EE->session->userdata('member_id');
		if( $sender_id === FALSE ) {
				return "";
		}
		
		// Build an array to hold the form's hidden fields
		$hidden_fields = array(
				"sender_id" => $sender_id,
				"send_type" => "username",
				"ACT" => $this->EE->functions->fetch_action_id( 'Airtab', 'process_senddrink_invite' )
		);
		
		// Build an array with the form data

		$form_data = array(
				"name" => $this->EE->TMPL->fetch_param("form_name"),
				"id" => $this->EE->TMPL->fetch_param("form_id"),
				"class" => $this->EE->TMPL->fetch_param("form_class"),
				"hidden_fields" => $hidden_fields
		);

		// Fetch contents of the tag pair, ie, the form contents
		$tagdata = $this->EE->TMPL->tagdata;

		$form = $this->EE->functions->form_declaration($form_data) . 
				$tagdata . "</form>";

		return $form;
	}  	
	
	public function process_senddrink_invite() 
	{

    echo "<pre>";
		print_r( $_POST );
		echo "</pre>";
		
    exit;		
	}
	
	/** Invite friends */
	 
	public function get_form_fields() 
	{
		$name = $this->EE->TMPL->fetch_param("name");
		// Build an array with the form data
		switch($name) {
			case "addFriendByText":
				$form_data = array(
					"send_type" => "text",
					"ACT" => $this->EE->functions->fetch_action_id( 'Airtab', 'process_friend_invite_text' ),
					"phone" => "",
					"message" => ""
				);
				break;
			case "addFriendByContactText":
				$form_data = array(
					"ACT" => $this->EE->functions->fetch_action_id( 'Airtab', 'process_friend_invite_text' )
				);
				break;
			case "addFriendByEmail":
				$form_data = array(
					"ACT" => $this->EE->functions->fetch_action_id( 'Airtab', 'process_friend_invite_email' ),
					"email" => "",
					"message" => ""
				);
				break;
			case "addFriendByContactEmail":
				$form_data = array(
					"ACT" => $this->EE->functions->fetch_action_id( 'Airtab', 'process_friend_invite_email' )
				);
				break;
		}

		return json_encode($form_data);
	}  
	
	public function form_friend_invite_email() 
	{

		// set the sender_id from session logged in member
		$sender_id = $this->EE->session->userdata('member_id');
		if( $sender_id === FALSE ) {
				return "";
		}
		
		// Build an array to hold the form's hidden fields
		$hidden_fields = array(
				"sender_id" => $sender_id,
				"send_type" => "email",
				"ACT" => $this->EE->functions->fetch_action_id( 'Airtab', 'process_invite' )
		);
		
		// Build an array with the form data
		$form_data = array(
				"id" => $this->EE->TMPL->form_id,
				"class" => $this->EE->TMPL->form_class,
				"hidden_fields" => $hidden_fields
		);

		// Fetch contents of the tag pair, ie, the form contents
		$tagdata = $this->EE->TMPL->tagdata;

		$form = $this->EE->functions->form_declaration($form_data) . 
				$tagdata . "</form>";

		return $form;
	}  
	
	public function form_friend_invite_username() 
	{

		// set the sender_id from session logged in member
		$sender_id = $this->EE->session->userdata('member_id');
		if( $sender_id === FALSE ) {
				return "";
		}
		
		// Build an array to hold the form's hidden fields
		$hidden_fields = array(
				"sender_id" => $sender_id,
				"send_type" => "username",
				"ACT" => $this->EE->functions->fetch_action_id( 'Airtab', 'process_invite' )
		);
		
		// Build an array with the form data
		$form_data = array(
				"id" => $this->EE->TMPL->form_id,
				"class" => $this->EE->TMPL->form_class,
				"hidden_fields" => $hidden_fields
		);

		// Fetch contents of the tag pair, ie, the form contents
		$tagdata = $this->EE->TMPL->tagdata;

		$form = $this->EE->functions->form_declaration($form_data) . 
				$tagdata . "</form>";

		return $form;
	} 

	public function process_drink_invite_text($phone, $invId, $message = "", $first = "", $last = "", $itemSent = "drink") {
		$phone = substr(preg_replace('/\D+/', '', $phone), -10);
		$member = ee()->session->userdata('member_id');
		$memberData = $this->get_member_data($member);
		$memberName = ($memberData['LName'] != "") ? $memberData['FName'] . " " . $memberData['LName'] : $memberData['FName'];

		$success = false;
		$status = false;

		if(!$member) {
			$status = array("status"=>"error","msg"=>"You are not logged in.", "title"=>"Invitation Error");
			// return all our data to an AJAX call
			echo json_encode($error);
			return;
		}

		if($phone) {

			switch($this->checkInvite_text($first, $last, $phone, $member, "Drink")) {
				case "friended":
					$status = array("status" => "error","msg"=>"A friend request has been successfully sent!", "title"=>"Friend Request Sent");
					break;
				case "exists":
					$status = array("status" => "error", "msg"=>"You have already sent an invite to that phone number.", "title"=>"Invitation Error");
					break;
				case "alreadyfriend":
					$status = array("status" => "error","msg"=>"You have already sent a friend request to that user.", "title"=>"Invitation Error");
					break;
				case "frienderror":
					$status = array("status" => "error","msg"=>"A member with that phone number esists. However, there was an error sending a friend request.", "title"=>"Invitation Error");
					break;
				case "AddInvite":
					break;
				default: 
					$status = array("status"=>"error", "msg"=>"An unknown error occurred attempting to send an invitation. (checkInvite)", "title"=>"Invitation Error");
					break;
			}

			
			
			// If not status is set, then let's continue with adding the invite
			if(!$status) {
				switch($this->addInvite_text($first, $last, $phone, $member, $invId, $memberName, $message, "Drink", $itemSent )) {
					case "invited":
						//$success = true;
						$status = array("status"=>"success", "msg"=>"The Friend Request Has Been Successfully Sent.", "title"=>"Invitation Successful!");
						break;
					default:
						$status = array("status"=>"error", "msg"=>"An unknown error occurred while attempting to send an invite. (addInvite)", "title"=>"Invitation Error");
						break;
				}
			}
		} else {
			//Missing Fields
			$status = array("status"=>"error", "msg"=>"You did not specify a valid phone number.", "title"=>"Invitation Error");
		}

		if($status["status"] == "error") {
			return false;
		} else {
			return true;
		}
	}

	public function process_friend_invite_text()
	{
		if( !$this->EE->input->post('phone', true) ) {
			$first = "";
			$last = "";
			$phone = $this->EE->TMPL->fetch_param("phone");
			$message = "";
		} else {
			$first = $this->EE->input->post('first_name', true);
			$last = $this->EE->input->post('last_name', true);
			$phone = $this->EE->input->post('phone', true);
			$message = $this->EE->input->post('message', true);
		}
		
		$member = ee()->session->userdata('member_id');
		$memberData = $this->get_member_data($member);
		$memberName = ($memberData['LName'] != "") ? $memberData['FName'] . " " . $memberData['LName'] : $memberData['FName'];

		$phone = substr(preg_replace('/\D+/', '', $phone), -10);

		$success = false;
		$status = false;

		if(!$member) {
			$status = array("status"=>"error","msg"=>"You are not logged in.", "title"=>"Invitation Error");
			// return all our data to an AJAX call
			echo json_encode($error);
			return;
		}

		//Check required fields
		if($phone) {
			//All the Required Fields are present

			//Check if First and Last name are present, if not, use the phone number in place of the name.
			if($first) {
				$name = ($last) ? $first . " " . $last : $first;
			} else {
				$name = $phone;
			}
			
			switch($this->checkInvite_text($first, $last, $phone, $member)) {
				case "friended":
					$status = array("status" => "error","msg"=>"A friend request has been successfully sent!", "title"=>"Friend Request Sent");
					break;
				case "exists":
					$status = array("status" => "error", "msg"=>"You have already sent an invite to that phone number.", "title"=>"Invitation Error");
					break;
				case "alreadyfriend":
					$status = array("status" => "error","msg"=>"You have already sent a friend request to that user.", "title"=>"Invitation Error");
					break;
				case "frienderror":
					$status = array("status" => "error","msg"=>"A member with that phone number esists. However, there was an error sending a friend request.", "title"=>"Invitation Error");
					break;
				case "AddInvite":
					break;
				default: 
					$status = array("status"=>"error", "msg"=>"An unknown error occurred attempting to send an invitation. (checkInvite)", "title"=>"Invitation Error");
					break;
			}
			
			$invId = "inv" . time() . $member;
			
			// If not status is set, then let's continue with adding the invite
			if(!$status) {
				switch($this->addInvite_text($first, $last, $phone, $member, $invId, $memberName, $message)) {
					case "invited":
						//$success = true;
						$status = array("status"=>"success", "msg"=>"The Friend Request Has Been Successfully Sent.", "title"=>"Invitation Successful!");
						break;
					default:
						$status = array("status"=>"error", "msg"=>"An unknown error occurred while attempting to send an invite. (addInvite)", "title"=>"Invitation Error");
						break;
				}
			}
		} else {
			//Missing Fields
			$status = array("status"=>"error", "msg"=>"You did not specify a valid phone number.", "title"=>"Invitation Error");
		}

		echo json_encode($status);
		return;

	}

	public function foursquare_establishments() {
		require('/var/www/vhosts/airtab.me/httpdocs/sdks/foursquare/FoursquareAPI.class.php');

		//Get Variables
		$latitude = $this->EE->TMPL->fetch_param("latitude");
		$longitude = $this->EE->TMPL->fetch_param("longitude");
		$radius = $this->EE->TMPL->fetch_param("radius") ? $this->EE->TMPL->fetch_param("radius") : 5000; //Meters
		$limit = $this->EE->TMPL->fetch_param("limit") ? $this->EE->TMPL->fetch_param("limit") : 10;

		if(!$latitude || !$longitude) return json_encode(array("status" => "error", "message"=>"Could not detect your location. Missing latitude, longitude, or both."));

		//Init API
		$foursquare = new FoursquareAPI("ZTJX33C4BT3OMIVE1GMWNK40H52JAAYOGLE4NIR1BSJACIBA", "OD1BAKYMRJZGN51JBWJNL1ZP02GXFHC3VAUAMFF1SMOL2I3W");
		// Searching for venues nearby Montreal, Quebec
		$endpoint = "venues/search";

		//Categories
		$cats = "4d4b7105d754a06376d81259,4bf58dd8d48988d1e5931735,52e81612bcbc57f1066b79ef,4bf58dd8d48988d18e941735,4bf58dd8d48988d17c941735";
		// Prepare parameters
		$params = array("ll"=>"$latitude,$longitude", "limit"=>$limit, "intent"=>"browse", "radius"=>$radius, "categoryId"=>$cats);

		// Returns a list of Venues
		// $POST defaults to false
		$venues = $foursquare->GetPublic($endpoint, $params);
		$venues = json_decode($venues);

		//die(print_r($venues, true));

		foreach($venues->response->venues as &$venue) {
			$venue->type = "foursquare";
			$venue->location->distance *= 0.000621371192;
			$venue->location->distance = round($venue->location->distance, 2);
		}

		return substr(json_encode($venues->response->venues), 1, -1);
	}

	function checkInvite_text($first, $last, $phone, $member, $invType = "Friend") {

		// Check if a member with this email already exists
	/*	$results = ee()->db->limit(1)
			->where('m_field_id_3', $phone)
			->get('member_data');
		
		if ($results->num_rows() > 0)
		{
			$id = $results->row('member_id');
			return addFriend($id, $phone, $first, $last, $member);
		}
	*/	
		// Check if an invite for this member exists
		if($invType == "Friend") {
			$db = clone $this->EE->db;
			$db->dbprefix='';

			$results = $db->limit(1)
				->where(array('phone'=>$phone, 'sender_id'=>$member, 'status'=>"Pending"))
				->get('v_invites');
			
			if ($results->num_rows() > 0)
			{
				//return "exists";
			}
		}
		return "AddInvite";
	}

	/** general use functions */
	
	// Add invitation request to the database
	function addInvite_text($first, $last, $phone, $member, $invId, $memberName, $message, $invType = "Friend", $itemSent = "drink")
	{
		
		ee()->load->library('api');
		ee()->api->instantiate('channel_entries');
						
		$data = array(
				'title'         => $invId,
				'entry_date'    => time(),
				'edit_date'     => time(),
				'field_id_48'    => $first,
				'field_id_49'    => $last,
				'field_id_54'   => $phone,
				'field_id_53'   => $member,
				'field_id_146'   => $invType,
				'field_id_152'	=> $message,
				'status'		=> "Pending"
		);
		
		if (ee()->api_channel_entries->save_entry($data, 11) === FALSE)
		{
			return;
		} else {

			//If message was posted, send that with url added at end, or else, fall back to our message.
			if($invType == "Drink") {
				if($message) {
					$maxlength = 160-strlen($memberName ." sent you a drink . on AirTab.         https://airtab.me/i/" . $invId);
					if(strlen($message) > $maxlength) {
						$m = substr($message, 0, ($maxlength - 3)) . "...\n\nhttps://airtab.me/i/" . $invId;
					} else {
						$m = $message . "\n\nhttps://airtab.me/i/" . $invId;
					}
					$body = $memberName . " sent you a drink .. on AirTab.\n\n" . $m;
				} else {
					if($first) {
						$body = "Hey " . $first . ", " . $memberName . " sent you a drink on AirTab. Click here to accept! https://airtab.me/i/" . $invId;
					} else {
//						$body = $memberName . " sent you a drink ... on AirTab. Click here to accept! https://airtab.me/i/" . $invId;
						$body = $memberName . " sent you a " . $itemSent . " on AirTab. Click here to accept! https://airtab.me/i/" . $invId;
					}
				}
			} else {
				if($message) {
					$body = $memberName . " wants to be friends on AirTab.\n\n" . substr($message, 0, 160-strlen($memberName ." wants to be friends on AirTab.         https://airtab.me/i/" . $invId)) . "\n\nhttps://airtab.me/i/" . $invId;
				} else {
					if($first) {
						$body = "Hey " . $first . ", " . $memberName . " would like connect with you on AirTab. Click here to connect! https://airtab.me/i/" . $invId;
					} else {
						$body = $memberName . " would like to connect with you on AirTab. Click here to connect! https://airtab.me/i/" . $invId;
					}
				}
			}
			 
			$this->send_text_message($phone, $body);
			return "invited";
		}
	}

	function send_text_message($phone, $body)
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
	
	public function process_send_promotion() {
		$type = $this->EE->TMPL->fetch_param("type");
		$to = $this->EE->TMPL->fetch_param("to");
		$body = $this->EE->TMPL->fetch_param("body");
		$member = ee()->session->userdata('member_id');
		if(!$member) {
			$status = array("status"=>"error","msg"=>"You are not logged in.", "title"=>"Invitation Error");
			// return all our data to an AJAX call
			echo json_encode($status);
			return;
		}
		if($type == "text") {
			$this->send_text_message($to, $body);		
		} else if($type == "email") {
			ee()->load->library('email');
			ee()->load->helper('text');			
			ee()->email->wordwrap = true;
			ee()->email->mailtype = 'text';
			ee()->email->from("invites@airtab.me");
			ee()->email->to($to);
			ee()->email->subject("AirTab special offer");
			ee()->email->message(entities_to_ascii($body));
			ee()->email->Send();			
		} else {
			$status = array("status"=>"error","msg"=>"bad type.", "title"=>"Send Promotion");
			// return all our data to an AJAX call
			echo json_encode($status);
			return;		
		}
		echo json_encode(array("status"=>"success", "title"=>"Send Promotion"));
	}
	
	public function process_drink_invite_email($email, $invId, $message = "", $first = "", $last = "") {
		$member = ee()->session->userdata('member_id');
		$memberData = $this->get_member_data($member);
		$memberName = ($memberData['LName'] != "") ? $memberData['FName'] . " " . $memberData['LName'] : $memberData['FName'];

		$success = false;
		$status = false;

		if(!$member) {
			$status = array("status"=>"error","msg"=>"You are not logged in.", "title"=>"Invitation Error");
			// return all our data to an AJAX call
			echo json_encode($error);
			return;
		}

		if($email) {

			switch($this->checkInvite_email($first, $last, $email, $member, "Drink")) {
				case "friended":
					$status = array("status" => "error","msg"=>"A friend request has been successfully sent!", "title"=>"Friend Request Sent");
					break;
				case "exists":
					$status = array("status" => "error", "msg"=>"You have already sent an invite to that email address.", "title"=>"Invitation Error");
					break;
				case "alreadyfriend":
					$status = array("status" => "error","msg"=>"You have already sent a friend request to that user.", "title"=>"Invitation Error");
					break;
				case "frienderror":
					$status = array("status" => "error","msg"=>"A member with that email address esists. However, there was an error sending a friend request.", "title"=>"Invitation Error");
					break;
				case "addInvite":
					break;
				default: 
					$status = array("status"=>"error", "msg"=>"An unknown error occurred attempting to send an invitation. (checkInvite)", "title"=>"Invitation Error");
					break;
			}

			
			
			// If not status is set, then let's continue with adding the invite
			if(!$status) {
				switch($this->addInvite_email($first, $last, $email, $member, $invId, $memberName, $message, "Drink")) {
					case "invited":
						//$success = true;
						$status = array("status"=>"success", "msg"=>"The Friend Request Has Been Successfully Sent.", "title"=>"Invitation Successful!");
						break;
					default:
						$status = array("status"=>"error", "msg"=>"An unknown error occurred while attempting to send an invite. (addInvite)", "title"=>"Invitation Error");
						break;
				}
			}
		} else {
			//Missing Fields
			$status = array("status"=>"error", "msg"=>"You did not specify a valid email address.", "title"=>"Invitation Error");
		}

		if($status["status"] == "error") {
			return false;
		} else {
			return true;
		}
	}

	function process_friend_invite_email() {
		if( !ee()->input->post('email', false) ) {
			$first = "";
			$last = "";
			$email = $this->EE->TMPL->fetch_param("email");
			$message = "";
		} else {
			$first = $this->EE->input->post('first_name', true);
			$last = $this->EE->input->post('last_name', true);
			$email = ee()->input->post('email', false);
			$message = $this->EE->input->post('message', true);
		}
		$member = ee()->session->userdata('member_id');
		$memberData = $this->get_member_data($member);
		$memberName = ($memberData['LName'] != "") ? $memberData['FName'] . " " . $memberData['LName'] : $memberData['FName'];

		$success = false;
		$status = false;

		if(!$member) {
			$status = array("status"=>"error","msg"=>"You are not logged in.", "title"=>"Invitation Error");
			// return all our data to an AJAX call
			echo json_encode($error);
			return;
		}

		//Check required fields
		if( $email) {
			//All the Required Fields are present
			if($first) {
				$name = ($last) ? $first . " " . $last : $first;
			} else {
				$name = $email;
			}
			
			switch($this->checkInvite_email($first, $last, $email, $member)) {
				case "friended":
					$status = array("status" => "error","msg"=>"A friend request has been successfully sent!", "title"=>"Friend Request Sent");
					break;
				case "exists":
					$status = array("status" => "error", "msg"=>"You have already sent an invite to that email address.", "title"=>"Invitation Error");
					break;
				case "alreadyfriend":
					$status = array("status" => "error","msg"=>"You have already sent a friend request to that user.", "title"=>"Invitation Error");
					break;
				case "frienderror":
					$status = array("status" => "error","msg"=>"A member with that email address esists. However, there was an error sending a friend request.", "title"=>"Invitation Error");
					break;
				case "addInvite":
					break;
				default: 
					$status = array("status"=>"error", "msg"=>"An unknown error occurred attempting to send an invitation. (checkInvite)", "title"=>"Invitation Error");
					break;
			}
			
			$invId = "inv" . time() . $member;
			
			// If not status is set, then let's continue with adding the invite
			if(!$status) {
				switch($this->addInvite_email($first, $last, $email, $member, $invId, $memberName, $message)) {
					case "invited":
						//$success = true;
						$status = array("status"=>"success", "msg"=>"The Friend Request Has Been Successfully Sent.", "title"=>"Invitation Successful!");
						break;
					default:
						$status = array("status"=>"error", "msg"=>"An unknown error occurred while attempting to send an invite. (addInvite)", "title"=>"Invitation Error");
						break;
				}
			}
		} else {
			//Missing Fields
			$status = array("status"=>"error", "msg"=>"You did not specify a valid email address.", "title"=>"Invitation Error");
		}

		echo json_encode($status);
		return;
	}

	public function username_to_id() {
		$username = $this->EE->TMPL->fetch_param("username");

		if(!$username) return json_encode(array("success"=>"false", "error"=>"You did not specify a username."));

		$user = ee()->db->select('member_id')
			->from('members')
			->where(array(
					'username' => $username
			))
			->get();
		
		if ($user->num_rows() > 0)
		{
			return json_encode(array(
				"success"=>true,
				"userid"=>$user->row("member_id")
			));
		}

		return json_encode(array(
			"success"=>false,
			"error"=>"No user with that username exists."
		));
	}

	public function email_to_id() {
		$email = $this->EE->TMPL->fetch_param("email");

		if(!$email) return json_encode(array("success"=>"false", "error"=>"You did not specify an email address."));

		$user = ee()->db->select('member_id')
			->from('members')
			->where(array(
					'email' => $email
			))
			->get();
		
		if ($user->num_rows() > 0)
		{
			return json_encode(array(
				"success"=>true,
				"userid"=>$user->row("member_id")
			));
		}

		return json_encode(array(
			"success"=>false,
			"error"=>"No user with that email exists."
		));
	}

	public function remove_friend() {
		$friend = $this->EE->TMPL->fetch_param("friend_id"); // Friend ID
		$member = ee()->session->userdata('member_id'); // Get Current User's ID
		//$member = ee()->input->post('member');


		if(!$friend) {
			return json_encode(array(
				"success"=>false,
				"error" => "You did not specify a member ID."
			));
		}

		if(!$member) {
			return json_encode(array(
				"success"=>false,
				"error" => "You are not logged in."
			));
		}

		//Get Entry ID for friend request

		$results = ee()->db->select('entry_id')
		  ->from('channel_data')
		  ->where(array(
		        	'field_id_55' => $friend,
					'field_id_31' => $member
				))
		  ->get();

		if ($results->num_rows() == 0)
		{
			//Didn't Find Friend Request, Try switching sender/receiver
			$results = ee()->db->select('entry_id')
			  ->from('channel_data')
			  ->where(array(
			        	'field_id_31' => $friend,
						'field_id_55' => $member
					))
			  ->get();
			
			if ($results->num_rows() == 0)
			{
		    	return json_encode(array(
					"success"=>false,
					"error" => "It does not appear that you are currently friends with that user."
				));
			}
		}

		//Friend Entry Found, Delete It
		ee()->load->library('api');
		ee()->api->instantiate('channel_entries');
			
		if(ee()->api_channel_entries->delete_entry(array($results->row('entry_id'))) === FALSE) {
			return json_encode(array(
				"success"=>false,
				"error" => "There was an error while attempting to remove that friend."
			));
		}

		return json_encode(array(
			"success"=>true
		));
	}

	public function process_friend_request() {
		$friend = $this->EE->TMPL->fetch_param("friend_id"); // Friend ID
		$act = $this->EE->TMPL->fetch_param("action"); // Friend ID
		$member = ee()->session->userdata('member_id'); // Get Current User's ID
		//$member = ee()->input->post('member');


		if(!$friend) {
			return json_encode(array(
				"success"=>false,
				"error" => "You did not specify a member ID."
			));
		}

		if(!$act) {
			return json_encode(array(
				"success"=>false,
				"error" => "You did not specify an action."
			));
		}

		if(!$member) {
			return json_encode(array(
				"success"=>false,
				"error" => "You are not logged in."
			));
		}

		//Get Entry ID for friend request

		$results = ee()->db->select('entry_id')
		  ->from('channel_data')
		  ->where(array(
		        	'field_id_55' => $friend,
					'field_id_31' => $member
				))
		  ->get();

		if ($results->num_rows() == 0)
		{
			//Didn't Find Friend Request, Try switching sender/receiver
			$results = ee()->db->select('entry_id')
			  ->from('channel_data')
			  ->where(array(
			        	'field_id_31' => $friend,
						'field_id_55' => $member
					))
			  ->get();
			
			if ($results->num_rows() == 0)
			{
		    	return json_encode(array(
					"success"=>false,
					"error" => "Unable to locate friend request. Please try again later."
				));
			}
		}

		//Friend Entry Found, Let's process this request.

		if($act == "decline") {
			ee()->load->library('api');
			ee()->api->instantiate('channel_entries');

			if(ee()->api_channel_entries->delete_entry(array($results->row('entry_id'))) === FALSE) {
				return json_encode(array(
					"success"=>false,
					"error" => "There was an error while attempting to remove that friend."
				));
			}
		} else if($act == "accept") {
			ee()->db->update(
			    'channel_titles',
			    array(
			        'status'  => "Approved"
			    ),
			    array(
			        'entry_id' => $results->row('entry_id')
			    )
			);

			if(!ee()->db->affected_rows()) {
				return json_encode(array(
					"success"=>false,
					"error" => "There was an error while attempting to accept that request. Please try again later."
				));
			}

			$msg = ee()->session->userdata('screen_name') . " has accepted your friend request.";
			$this->pushNotify_friend($friend, $msg);
		}
			
		

		return json_encode(array(
			"success"=>true
		));
	}

	// Check if the person has already been invited/is already a member
	function checkInvite_email($first, $last, $email, $member, $invType = "Friend") {

		// Check if a member with this email already exists
		if($invType == "Friend") {
			$results = ee()->db->limit(1)
				->where('email', $email)
				->get('members');
			
			if ($results->num_rows() > 0)
			{
				$id = $results->row('member_id');
				return $this->addFriend($id, $member);
			}

			
			// Check if an invite for this member exists
			$results = ee()->db->limit(1)
				->where(array('field_id_50'=>$email, 'field_id_53'=>$member))
				->get('channel_data');
			
			if ($results->num_rows() > 0)
			{

				return "exists";
			}
		}

		return "addInvite";
	}

	// Add the invite to the database
	function addInvite_email($first, $last, $email, $member, $invId, $memberName, $message, $invType = "Friend")
	{
		
		ee()->load->library('api');
		ee()->api->instantiate('channel_entries');
		
		$data = array(
		    'title'         => $invId,
		    'entry_date'    => time(),
		    'edit_date'     => time(),
		    'field_id_48'    => $first,
		    'field_id_49'    => $last,
		    'field_id_50'   => $email,
		    'field_id_53'   => $member,
		    'field_id_146'   => $invType,
		    'status'		=> "Pending"
		);
		
			//email
		if($invType == "Drink") {
			$from = "drinks@airtab.me";
			$recipient = $email;
			$email_subject = "You just recieved a drink on AirTab";
			if($message) {
					$email_msg = "$memberName sent you a drink on AirTab. Their message is below.\n\n" . $message . "\n\nVisit https://airtab.me/i/" . $invId . " to accept this drink.\n\nAirTab\nhttp://airtab.me\n\n\nIf you no longer wish to receive email from AirTab, visit http://airtab.me/unsubscribe/$email";
			} else {
				if($first) {
					$email_msg = "Hello, $first\n\n$memberName sent you a drink on AirTab. To accept this drink, click the link below:\n\nhttps://airtab.me/i/" . $invId . "\n\nAirTab\nhttp://airtab.me\n\n\nIf you no longer wish to receive email from AirTab, visit http://airtab.me/unsubscribe/$email";
				} else {
					$email_msg = $memberName . " sent you a drink on AirTab. Visit https://airtab.me/i/" . $invId . " to accept this drink!\n\nAirTab\nhttp://airtab.me\n\n\nIf you no longer wish to receive email from AirTab, visit http://airtab.me/unsubscribe/$email";
				}
			}
		} else {
			$from = "invites@airtab.me";
			$recipient = $email;
			$email_subject = "You have been invited to join AirTab";
			if($message) {
					$email_msg = "$memberName sent you an invitation to AirTab. Their message is below.\n\n" . $message . "\n\nVisit https://airtab.me/i/" . $invId . " to accept this invitation.\n\nAirTab\nhttp://airtab.me\n\n\nIf you no longer wish to receive email from AirTab, visit http://airtab.me/unsubscribe/$email";
			} else {
				if($first) {
					$email_msg = "Hello, $first\n\nYou have been invited to join AirTab by $memberName. To accept this invitation, click the link below:\n\nhttps://airtab.me/i/" . $invId . "\n\nAirTab\nhttp://airtab.me\n\n\nIf you no longer wish to receive email from AirTab, visit http://airtab.me/unsubscribe/$email";
				} else {
					$email_msg = $memberName . " would like to connect with you on AirTab. Visit https://airtab.me/i/" . $invId . " to accept their friend request!\n\nAirTab\nhttp://airtab.me\n\n\nIf you no longer wish to receive email from AirTab, visit http://airtab.me/unsubscribe/$email";
				}
			}
		}
		
		
		if (ee()->api_channel_entries->save_entry($data, 11) === FALSE)
		{
		    return;
		} else {
			ee()->load->library('email');
			ee()->load->helper('text');
			
			ee()->email->wordwrap = true;
			ee()->email->mailtype = 'text';
			ee()->email->from($from);
			ee()->email->to($recipient);
			ee()->email->subject($email_subject);
			ee()->email->message(entities_to_ascii($email_msg));
			ee()->email->Send();
			return "invited";
		}
	}

	// Add friend if user is already member
	function addFriend($id, $member) {
			
		$results = ee()->db->select('entry_id')
			->from('channel_data')
			->where(array(
					'field_id_55' => $id,
					'field_id_31' => $member
				))
			->get();
		
		if ($results->num_rows() == 0)
		{
			//Didn't Find Friend Request, Try switching sender/receiver
			$results = ee()->db->select('entry_id')
				->from('channel_data')
				->where(array(
						'field_id_31' => $id,
						'field_id_55' => $member
					))
				->get();
			
			if ($results->num_rows() == 0)
			{
				//Friend doesn't already exist.
				ee()->load->library('api');
				ee()->api->instantiate('channel_entries');
				
				$data = array(
						'title'         => "fnd" . time() . $member,
						'entry_date'    => time(),
						'edit_date'     => time(),
						'field_id_31'   => $id,
						'field_id_55'   => $member,
						'status'		=> "Pending Approval"
				);
				
				if (ee()->api_channel_entries->save_entry($data, 6) === FALSE)
				{
						return "frienderror";
				} else {
					$this->pushNotify_friend($id, false);
					return "friended";
				}
			}
		}
		
		return "alreadyfriend";
	}

	function pushNotify_friend($recipientId, $msg = false) {

		if(!$recipientId) return "error";

		$title = "New AirTab Friend Request";

		if(!$msg) {
			$message = ee()->session->userdata('screen_name') . " sent you a friend request!";
		} else {
			$message = $msg;
		}

		$results = ee()->db->limit(1)
		->where('member_id', $recipientId)
		->get('member_data');

		$deviceToken = $results->row('m_field_id_5');
		$androidDeviceId = $results->row('m_field_id_18');
		if($results->row('m_field_id_17') == "Yes") {
			$dev = true;
		} else {
			$dev = false;
		}

		//$memberData = $this->get_member_data($member);
		//$message = message. " - " .$memberData['email']; 

		if($deviceToken) $this->pushApple($recipientId, $message, $dev);
		if($androidDeviceId) $this->pushAndroid($recipientId, $message, $title, "newFriendRequest");

		return "success";
	}
	

	function pushNotify_drink($recipientId, $drinkType) {
		$title = "You received a drink!";
		$message = ee()->session->userdata('screen_name') . " sent you a drink!";
		$results = ee()->db->limit(1)
		->where('member_id', $recipientId)
		->get('member_data');

		$deviceToken = $results->row('m_field_id_5');
		$androidDeviceId = $results->row('m_field_id_18');
		if($results->row('m_field_id_17') == "Yes") {
			$dev = true;
		} else {
			$dev = false;
		}

		if($deviceToken) $this->pushApple($recipientId, $message, $dev);		
		//if($androidDeviceId) $this->pushAndroid($recipientId, $message, $title, "newDrink");
		$this->pushAndroid($recipientId, $message, $title);

		return "device token: ".$deviceToken;
	}

	function pushNotify_bottle($recipientId, $drinkType, $itemSent) {
		$title = "You received a drink!";
		$message = ee()->session->userdata('screen_name') . " sent you a " . $itemSent . "!";
		$results = ee()->db->limit(1)
		->where('member_id', $recipientId)
		->get('member_data');

		$deviceToken = $results->row('m_field_id_5');
		$androidDeviceId = $results->row('m_field_id_18');
		if($results->row('m_field_id_17') == "Yes") {
			$dev = true;
		} else {
			$dev = false;
		}

		if($deviceToken) $this->pushApple($recipientId, $message, $dev);
		if($androidDeviceId) $this->pushAndroid($recipientId, $message, $title, "newDrink");

		return "device token: ".$deviceToken;
	}

	function pushApple($recipientId, $message) {
	
		$status = "no token";
		$deviceTokens = $this->getiOSDeviceIds($recipientId);
		
		if($deviceTokens) {
			foreach ($deviceTokens as $deviceToken) {
			
				if($deviceToken->dev != 0) {
				// My private key's passphrase here:
					$passphrase = 'pw4airtabdev';
					$pushUrl = "ssl://gateway.sandbox.push.apple.com:2195";
					$pushCert = "/var/www/vhosts/airtab.me/httpdocs/push/apns-dev.pem";

				} else {
					$passphrase = "pw4airtab";
					$pushUrl = "ssl://gateway.push.apple.com:2195";
					$pushCert = "/var/www/vhosts/airtab.me/httpdocs/push/apns-prod.pem";
				}
					
					// My alert message here:
				
				
				//badge
				$badge = 1;
				
				$ctx = stream_context_create();
				stream_context_set_option($ctx, 'ssl', 'local_cert', $pushCert);
				stream_context_set_option($ctx, 'ssl', 'passphrase', $passphrase);
				
				// Open a connection to the APNS server
				$fp = stream_socket_client(
						$pushUrl, $err,
						$errstr, 60, STREAM_CLIENT_CONNECT|STREAM_CLIENT_PERSISTENT, $ctx);
				
				if (!$fp)
				exit("Failed to connect: $err $errstr" . PHP_EOL);
				
				//echo 'Connected to APNS' . PHP_EOL;
				
				// Create the payload body
				$body['aps'] = array(
				    'alert' => $message,
				    //'badge' => $badge,
				    'sound' => "glass-clink-2.aiff"
				);
				
				// Encode the payload as JSON
				$payload = json_encode($body);
				
				$msg = chr(0) . pack('n', 32) . pack('H*', $deviceToken->token) . pack('n', strlen($payload)) . $payload;
			
				// Send it to the server
				fwrite($fp, $msg, strlen($msg));
				// Build the binary notification
				
				// Close the connection to the server
				fclose($fp);
			}
			return "success";
		}
		return $status;
	}

	function pushAndroid_ORG_DEL($recipientId, $message, $title, $tag = "Push") {
		define( 'API_ACCESS_KEY', 'AIzaSyDQ7oEmA8JCJBKNBdZYZbLqMbssHKUAF28' );

		$registrationIds = $this->getAndroidDeviceIds($recipientId);
		
		// prep the bundle
		$msg = array
		(
		    'tag' 			=> $tag,
			'title'			=> $title,
			'subtitle'		=> $message,
			'vibrate'		=> true,
			'sound'			=> true
		);
		 
		$fields = array
		(
			'registration_ids' 	=> $registrationIds,
			'data'				=> $msg
		);
		 
		$headers = array
		(
			'Authorization: key=' . API_ACCESS_KEY,
			'Content-Type: application/json'
		);
		 
		$ch = curl_init();
		curl_setopt( $ch,CURLOPT_URL, 'https://android.googleapis.com/gcm/send' );
		curl_setopt( $ch,CURLOPT_POST, true );
		curl_setopt( $ch,CURLOPT_HTTPHEADER, $headers );
		curl_setopt( $ch,CURLOPT_RETURNTRANSFER, true );
		curl_setopt( $ch,CURLOPT_SSL_VERIFYPEER, false );
		curl_setopt( $ch,CURLOPT_POSTFIELDS, json_encode( $fields ) );
		$result = curl_exec($ch );
		curl_close( $ch );
		 
		return $result;
	}
	
	function pushAndroid($recipientId, $message, $title) {
		    
	    define( 'API_ACCESS_KEY', 'AIzaSyDQ7oEmA8JCJBKNBdZYZbLqMbssHKUAF28' );
	    
	   //$id = 'APA91bGP_uZKIhbXmC5rjeB2tYFJsNLP7N55R0g0ollfuFnJQ3GG6-MEqhMGXq6MxetWM1PM1RdnZKAHHMOtm9Jt1LmcvR2d14__teDhwbVr6uJNvKdtsxw536FtS0ySqcc2Pmyh8ew2KHuXY-e4e65rGYkZKvr9yg';	    
	   //$id = 'APA91bHQEXTE98nCCSGdiXWi3lDt0rHHiXt_UayDfnB6bMOhriZ8iCeP7k4RVaU8wGjrHgZxsx-u3wBoH_5cKdjO62xs1hJ8tBEo1SwsI4T5g5RYhpR0B-z972W7HuaaQ09a7joXXi6oFp176qZRZUPj-W1FQeKY6A';	   
	   //$registrationIds = array($id);

	    $registrationIds = array();
	    	    
	    $results =$this->EE->db->query("SELECT * FROM at_devicetokens WHERE type = 'android' AND member = ".$recipientId );
			
		//Does this user have any push tokens?
		if ($results->num_rows() > 0) {
			foreach($results->result() as $result) {
				array_push($registrationIds, $result->token);
				//$l = strlen($result->token);
				//$message = $message . " " .$recipientId;
			}
		}
	    
	    	
	    $msg = array (
	                  'tag' 			=> 'Push',
	                  'title'			=> $title,
	                  'subtitle'		=> $message,
	                  'vibrate'		=> true,
	                  'sound'			=> true
	                  );
	    
	    
	    $fields = array (
	                     'registration_ids' 	=> $registrationIds,
	                     'data'				=> $msg
	                     );
	    
	    $headers = array (
	                      'Authorization: key=' . API_ACCESS_KEY,
	                      'Content-Type: application/json'
	                      );
	
	    $ch = curl_init();
	    curl_setopt( $ch,CURLOPT_URL, 'https://android.googleapis.com/gcm/send' );
	    curl_setopt( $ch,CURLOPT_POST, true );
	    curl_setopt( $ch,CURLOPT_HTTPHEADER, $headers );
	    curl_setopt( $ch,CURLOPT_RETURNTRANSFER, true );
	    curl_setopt( $ch,CURLOPT_SSL_VERIFYPEER, false );
	    curl_setopt( $ch,CURLOPT_POSTFIELDS, json_encode( $fields ) );
	    $result = curl_exec($ch );
	    curl_close( $ch );
		 
		return $result;
	}
		
	
	/*
	function push_notify() {
		$id = $this->EE->TMPL->fetch_param("member"); // Friend ID
		$msg = $this->EE->TMPL->fetch_param("message");

		//return "test";

		if($id && $msg) {
			$results = ee()->db->limit(1)
				->where('member_id', $id)
				->get('member_data');
			
			$deviceToken = $results->row('m_field_id_5');

			if(!$deviceToken) return "Error";
			
			// My private key's passphrase here:
			$passphrase = 'pw4airtab';
			
			// My alert message here:
			$message = $msg;
			
			//badge
			$badge = 1;
			
			$ctx = stream_context_create();
			stream_context_set_option($ctx, 'ssl', 'local_cert', '/var/www/vhosts/airtab.me/httpdocs/push/apns-prod.pem');
			stream_context_set_option($ctx, 'ssl', 'passphrase', $passphrase);
			
			// Open a connection to the APNS server
			$fp = stream_socket_client(
					'ssl://gateway.push.apple.com:2195', $err,
					$errstr, 60, STREAM_CLIENT_CONNECT|STREAM_CLIENT_PERSISTENT, $ctx);
			
			if (!$fp) return "error, no stream";
			//exit("Failed to connect: $err $errstr" . PHP_EOL);
			
			//echo 'Connected to APNS' . PHP_EOL;
			
			// Create the payload body
			$body['aps'] = array(
					'alert' => $message,
					//'badge' => $badge,
					'sound' => "glass-clink-2.aiff"
			);
			
			// Encode the payload as JSON
			$payload = json_encode($body);
			
			// Build the binary notification
			$msg = chr(0) . pack('n', 32) . pack('H*', $deviceToken) . pack('n', strlen($payload)) . $payload;
			
			// Send it to the server
			$result = fwrite($fp, $msg, strlen($msg));
			
			if (!$result) {
				return "error sending notification";
			} else {
				return "success";
			}
			
			// Close the connection to the server
			fclose($fp);
		}

		return "didnt send";
	}*/

	public function change_member_to_bar() {
		$mId = ee()->session->userdata('member_id');
		$group = ee()->session->userdata('group_id');
		$estId = $this->EE->TMPL->fetch_param("est");

		if(!$mId || !$group) return "Please Contact AirTab Support. Error: Missing Group or Member ID";

		//Is this user Super-Admin or AirTab Admin? If so, don't change usergroup.
		if($group == 1 || $group == 10) return "Please Contact AirTab Support. Error: Invalid User Group (" . $mId . " - " . $group . ")";

		//Change User's Member Group
		ee()->db->update(
		    'members',
		    array(
		        'group_id'  => "6"
		    ),
		    array(
		        'member_id' => $mId
		    )
		);

		if(!ee()->db->affected_rows()) {
			return "Please Contact AirTab Support. Error: Update Failed (" . $mId . " - " . $group . ")";
		}
		if(!$estId) {
			return "Please Contact AirTab Support. Error: Could Not Create Master Redemption Code (NOESTPROVIDED)";
		}

		//Set Master Redemption Code
		ee()->db->update(
		    'member_data',
		    array(
		        'm_field_id_15'  => $estId . "01",
		        'm_field_id_16'	 => "494"
		    ),
		    array(
		        'member_id' => $mId
		    )
		);

		if(!ee()->db->affected_rows()) {
			return "Please Contact AirTab Support. Error: Could Not Set Master Redemption Code (" . $mId . " - " . $estId . "01)";
		}

		return "<script type='text/javascript'>window.location.href='/dashboard/#/establishment/' + $estId;</script>";
		//return "success";
	}

	public function get_session() {
		$session = ee()->session->userdata('session_id');
		$member = ee()->session->userdata('member_id');

		if(!$session || !$member) return json_encode(array("status"=>"error", "msg"=>"You are not currently logged in."));

		return json_encode(array("status"=>"success", "session"=>$session, "user_id"=>$member));
	}

	function sanitize_phone($str) {
		$num = "";
		for( $i=0,$c=strlen($str); $i<$c; $i++ ) if ( is_numeric($str[$i]) ) $num .= $str[$i];

		return $num;
	}

	function get_member_data($member_id)
	{
		// I want to pull all possible information I can about this user now including
		// custom fields.
		$member_fields = array();
		$sql           = 'SELECT
			m_field_id
			, m_field_name as field_name
			, m_field_label as field_label
			, m_field_description as field_description
		FROM exp_member_fields
		WHERE m_field_reg = \'y\'
		ORDER BY m_field_order ASC';
		$result        = ee()->db->query($sql);
		if ($result->num_rows() > 0) {
			foreach ($result->result_array() as $row) {
				$id = intval($row['m_field_id']);
				unset($row['m_field_id']);
				$member_fields['m_field_id_' . $id] = $row;
			}
		}
		
		$member_data = array();
		$sql         = 'SELECT DISTINCT
		exp_members.group_id
		, exp_members.username
		, exp_members.screen_name
		, exp_members.email
		, exp_members.url
		, exp_members.location
		, exp_members.ip_address
		, exp_members.join_date
		, exp_members.language
		, exp_members.time_format
		, exp_members.timezone
		, exp_members.bday_m
		, exp_members.bday_d
		, exp_members.bday_y		
		, exp_member_groups.group_title
		, exp_member_groups.group_description
		, exp_member_data.*
	FROM exp_members
	INNER JOIN exp_member_groups ON exp_member_groups.group_id = exp_members.group_id
	INNER JOIN exp_member_data ON exp_member_data.member_id = exp_members.member_id
	WHERE exp_members.member_id = \'' . $member_id . '\'';
		$result      = ee()->db->query($sql);
		if ($result->num_rows() > 0) {
			$member_data = $result->result_array();
			$member_data = $member_data[0];
		}
		foreach ($member_fields as $field => $ar) {
			if (isset($member_data[$field])) {
				$member_data[$ar['field_name']]                  = $member_data[$field];
				$member_data[$ar['field_name'] . '_label']       = $ar['field_label'];
				$member_data[$ar['field_name'] . '_name']        = $ar['field_name'];
				$member_data[$ar['field_name'] . '_description'] = $ar['field_description'];
				unset($member_data[$field]);
			}
		}
		return $member_data;
	}
 
    // Insert data into table at_deficiency.
    // Author : R Scofield
    public function at_deficiency_insert()
    {
        $type = $this->EE->TMPL->fetch_param("type");
				$lat = $this->EE->TMPL->fetch_param("lat");
        $long = $this->EE->TMPL->fetch_param("long");
        $member_id = $this->EE->session->userdata('member_id');
        $numFound = $this->EE->TMPL->fetch_param("num");
        $now = new DateTime();
        $curTime = $now->format('Y-m-d H:i:s');
                
        $queryEx = $this->EE->db->query("INSERT INTO at_deficiency (type,latitude,longitude,occurred,user_id,num_found) VALUES ( '$type','$lat','$long','$curTime',$member_id,$numFound )");
        
        return;      
    }
 
    // Insert data into table at_user_recommend
    //
    public function at_user_recommend()
    {
        $place = $this->EE->TMPL->fetch_param("place");
				$address = $this->EE->TMPL->fetch_param("address");
        $member_id = $this->EE->session->userdata('member_id');
        $establishment_id = $this->EE->TMPL->fetch_param("establishment_id");
        $now = new DateTime();
        $curTime = $now->format('Y-m-d H:i:s');
		//$member_id = ee()->session->userdata('member_id'); // Get Current User's ID
                
        $queryEx = $this->EE->db->query("INSERT INTO at_user_recommend (establishment_name, address, occurred, member_id, estab_id) VALUES ( '$place','$address','$curTime',$member_id,$establishment_id )");
        
        //return "success";
        return $now->format('Y-m-d H:i:s');
        
    }
    	
     // Get Friends' List
    // Friends List is stored in table exp_channel_data (channel_id = 6)
    // Member's First/Last name and phone are stored in table exp_member_data
    // Member's image is stored in table exp_channel_data (channel_id = 19)
    // Author : John W. Blaine.
     public function sql_get_friends_list() {
   
     	$rArray = array();
        
        $member_id = $this->EE->TMPL->fetch_param("member_id");
        
  	    $imgArray = $this->sql_get_all_image();
      
        $sql = 'SELECT * FROM exp_members 
        LEFT JOIN exp_member_data
        ON ( exp_members.member_id = exp_member_data.member_id) ORDER BY exp_members.member_id';
        
        $allMembers = $this->EE->db->query( $sql );
        
        $sql = "SELECT * FROM exp_channel_data where exp_channel_data.channel_id = 6 AND ( (exp_channel_data.field_id_31 = $member_id) OR (exp_channel_data.field_id_55 = $member_id) ) ";
//        $sql = "SELECT * FROM v_friends where ( (v_friends.field_id_31 = $member_id) OR (exp_channel_data.field_id_55 = $member_id) ) ";
//        $sql = "SELECT * FROM v_friends where (friend_id = $member_id OR sender_id = $member_id)";
        
        $query = $this->EE->db->query( $sql );
        if ($query->num_rows() > 0){
            foreach($query->result_array() as $row) {
                
                $friend = $row['field_id_31'];
                
                if( $row['field_id_31'] == $member_id ){
                    $friend = $row['field_id_55'];
                }
 	                           
                foreach($allMembers->result_array() as $mRow) {                  
                  
                  //exp_channel_titles`.`status`
                  //$mRow['status'] 
                  
                 // if (strcmp( $mRow['status'], "Approved" ) == 0) {
   					 					
		                  if ($friend == $mRow['member_id'] ){ 
		                                     
				               $img = "";     
		 	   	               for($x = 0; $x < count($imgArray); $x++ ) {    	 
			   	               		if( $imgArray[$x]["member"] == $friend ){
			           				        $img = $imgArray[$x]["image"];
			           				        break;     
			   	               	    }       
			                   }  
			                                                 	                   	              	   
			              	   array_push($rArray, array( "id" => $friend, "usr" => $mRow['username'], 
			              	                              "first" => $mRow['m_field_id_1'], "last" => $mRow['m_field_id_2'],
			              	                               "phone" => $mRow['m_field_id_3'], "img" => $img ));                
			              	                   
				 	           break;   
		                  }   
                  
                 // }
                                              
                }               
            }
         }
                
        return json_encode($rArray);
    }
    
    
    public function sql_get_all_airtab_members() {
            $member_id = $this->EE->TMPL->fetch_param("member_id");
        	$rArray = array();    
        	$fArray = array();    
        	   
	        $sqlFriend = "SELECT * FROM exp_channel_data where exp_channel_data.channel_id = 6 AND ( (exp_channel_data.field_id_31 = $member_id) OR (exp_channel_data.field_id_55 = $member_id) ) ";	        
	        $query = $this->EE->db->query( $sqlFriend );
	        
	        if ($query->num_rows() > 0){
	            foreach($query->result_array() as $row) {
	                
	                $friend = $row['field_id_31'];
	                
	                if( $row['field_id_31'] == $member_id ){
	                    $friend = $row['field_id_55'];
	                }
	                array_push($fArray, array(  "id" => $friend  ));
	  			}
	  		}
	  	
	  	    $allImages = $this->sql_get_all_image();
	  	
		  	$sql = 'SELECT * FROM exp_members 
	        LEFT JOIN exp_member_data
	        ON ( exp_members.member_id = exp_member_data.member_id) ORDER BY exp_members.member_id';
	        
	     	   $allMembers = $this->EE->db->query( $sql );
	  		   foreach($allMembers->result_array() as $mRow) {                  
    	            
    	            $friend = "no";
    	                	            
                 	 for($x = 0; $x < count($fArray); $x++ ) {    	 
	   	               		if( $fArray[$x]["id"] == $mRow['member_id'] ){
   	           						$friend = "yes";
 	           				        break;     
	   	               	    }       
	                  }  
	                
	                $img = "";  
		      	    for($x = 0; $x < count($allImages); $x++ ) {    	 
		   	               if( $allImages[$x]["member"] == $mRow['member_id'] ){
		                            $img = str_replace( "{filedir_9}", "", $allImages[$x]["image"] );                        
		      	   					//return( $img );
		      	   					break;
		  	               }       
		            }                                
                  	                                                 	                   	              	   
	              	   array_push($rArray, array( "id" => $mRow['member_id'], "usr" => $mRow['username'], 
	              	                              "first" => $mRow['m_field_id_1'], "last" => $mRow['m_field_id_2'], "password" => md5($mRow['password']), 
	              	                               "phone" => $mRow['m_field_id_3'], "email" => $mRow['email'], "img" => $img, "friend" => $friend ));                
	              	                   
               }               
	  		  		
  		return json_encode($rArray);
    
    }
         
    // Get Member's images
    // Member's image is stored in table exp_channel_data (channel_id = 19)
    // Author : John W. Blaine.
    public function sql_get_all_image() {
    	
    	$rArray = array();
    
        $rVal = "";
        $sql = 'SELECT * FROM exp_channel_data 
        LEFT JOIN exp_channel_titles
        ON ( exp_channel_data.entry_id = exp_channel_titles.entry_id)
        WHERE exp_channel_data.channel_id = 19';
        
        $query = $this->EE->db->query( $sql ); 
        
      	if ($query->num_rows() > 0) {
  	    	foreach($query->result_array() as $result) { 	    	       
                   //$img = str_replace( "{filedir_9}", "airtab.me/", $result['field_id_147'] );     
                   $img = str_replace( "{filedir_9}", "", $result['field_id_147'] );                        
                   array_push($rArray, array( "member" => $result['author_id'],  "image" => $img ));                
			}
  	    }       
        return $rArray;
    }

     public function getDrinkWithMessage() {
       $member_id = $this->EE->TMPL->fetch_param("member_id");
       $promo_code = $this->EE->TMPL->fetch_param("promo_code");
                              
       /* Check if the promo is still active */          	    
                              
       /* Check if the user already receive promo drinks */          	    
       $rArray = array();
  	    
  	    /*
  	   $query = $this->EE->db->query("SELECT * FROM v_drink_tickets 
        LEFT JOIN v_avatars
        ON ( v_drink_tickets.tck_p_member = v_avatars.member)   
  	   WHERE tck_r_member = $member_id AND status = 'nonredeemed' ORDER BY tck_purchase_date DESC");
       */
       
   	    /*
       
                          array( "first" => $result['p_member_username'], 
                          "last" => $result['p_member_username'],
                          "usr" => $result['p_member_username'],
                          "usrid" => $result['tck_p_member'],
                          "phone" => $result['p_member_username'],
                          "email" => $result['p_member_username'],
                          "id" => $result['tck_p_member'],
                          "msg" => $result['message'],
                          "date" => $date,
                          "type" => $result['type'],
                           "redeemed_drink_id" =>$result['redeemed_drink_id'],
                           "redeemed_at" => $redeem_at,
                          "ticket_id" => $result['ticket_id'],
                          "entry_id" => $result['entry_id'],
                          "image" => $img ));  
       */
       
       
   	   $query = $this->EE->db->query("SELECT v_drink_tickets.entry_id, v_drink_tickets.p_member_username, v_drink_tickets.redeemed_drink_id,
   	   v_drink_tickets.tck_p_member, v_drink_tickets.message,  v_drink_tickets.type,  v_drink_tickets.ticket_id,v_drink_tickets.drink_picture,
       v_drink_tickets.tck_purchase_date,  v_drink_tickets.redeemed_at_id, v_avatars.filename
   	   FROM v_drink_tickets 
   	    
   	    LEFT JOIN v_avatars
        ON ( v_drink_tickets.tck_p_member = v_avatars.member)   
   	   
   	   WHERE v_drink_tickets.tck_r_member = $member_id AND v_drink_tickets.status = 'nonredeemed' ORDER BY v_drink_tickets.tck_purchase_date DESC");
  
  
       if ($query->num_rows() > 0) {
  	       foreach($query->result_array() as $result) { 	
  	           	       
        	      $date = ee()->localize->human_time( $result['tck_purchase_date'] );
                	
                  $img = $result['filename'];                        
 //                 $img = "2";                        
                  
                  if ( $img == null ){
                  		$img = "";
                  }
                  
                  $redeem_at = $result['redeemed_at_id'];
                  
                  if ( $result['redeemed_at_id'] == null ){
                     $redeem_at = "AnyWhere";
                  } 
                  
                  $redeemed_drink_id = $result['redeemed_drink_id']; 
                  $drink_pic = str_replace( "{filedir_1}", "https://airtab.me/images/uploads/drinks/", $result['drink_picture'] );                 
                  if ( $redeemed_drink_id == null ) {
                    if ($result['type'] == "Premium") {
                      $redeemed_drink_id = "243";
                      $drink_pic = "https://airtab.me/images/uploads/drinks/PremiumCocktails_Airtab_Preview.jpg";       
                    } elseif ($result['type'] == "Standard") {
                      $redeemed_drink_id = "213";
                      $drink_pic = "https://airtab.me/images/uploads/drinks/StandardCocktails_Airtab_Preview.jpg";       
                    }
                  } 
                			                  			   
                   array_push($rArray, 
                   array( "first" => $result['p_member_username'], 
                          "last" => $result['p_member_username'],
                          "usr" => $result['p_member_username'],
                          "usrid" => $result['tck_p_member'],
                          "phone" => $result['p_member_username'],
                          "email" => $result['p_member_username'],
                          "id" => $result['tck_p_member'],
                          "msg" => $result['message'],
                          "date" => $date,
                          "type" => $result['type'],
                          "drink_picture" => $drink_pic,
                          "redeemed_at" => $redeem_at,
                          "ticket_id" => $result['ticket_id'],
//                          "redeemed_drink_id" =>$result['redeemed_drink_id'],                          
                          "redeemed_drink_id" => $redeemed_drink_id,                          
                          "entry_id" => $result['entry_id'],
                          "image" => $img ));  
			   
		   } 	   
  	   }
  	   
  	   return json_encode($rArray);
    }
    
    public function getImageName( $mem_id ) {
     	    $allImages = $this->sql_get_all_image();
     	    
     	    for($x = 0; $x < count($allImages); $x++ ) {    	 
   	               if( $allImages[$x]["member"] == $mem_id ){
                            $img = str_replace( "{filedir_9}", "", $allImages[$x]["image"] );                        
      	   					return( $img );
       	   					//return( "" );
  	               }       
            }                                
     	    
     	    return( "" );
     	    
	}
		
	
	public function sql_process_friend_invite_member() {
	
	    $id = $this->EE->TMPL->fetch_param("member_id");
	    $member = $this->EE->TMPL->fetch_param("friends_id");
 			
		return $this->addFriend($id, $member);	
	}
	
	public function sql_close_drink_ticket() {
	
	    $ticket_id = $this->EE->TMPL->fetch_param("ticket_id");
 			
 	    // 'closed' or 'pending' ??????
 	    //
 	     		
  		$sql = "UPDATE v_drink_ticket_fields SET v_drink_ticket_fields.status = 'closed' WHERE v_drink_ticket_fields.title = '$ticket_id' ";                   
        $updateDink = $this->EE->db->query( $sql ); 
 		
 		//$rVal = "sql_drink_regift:" . $ticket_id . ":" . $member_id . ":" . $recipientId;
 		$rVal = "sql_drink_regift:" . $ticket_id . ":" . "done" . ":" . "";
 		
 		return( $rVal );	
	}

    public function sql_get_establishments_with_bottle() {
       $member_id = $this->EE->TMPL->fetch_param("member_id");
                                        	    
       $rArray = array();
  	    
  	   $query = $this->EE->db->query("SELECT * FROM v_establishment_menu");
       
       if ($query->num_rows() > 0) {
  	       foreach($query->result_array() as $result) { 	    	       
			   //array_push($rArray,  array( "name" => $result['estab_name'], "type" => $result['Type'], "bottle" => $result['title'], "price" => $result['Price'] )); 
			   array_push($rArray,  array( "name" => $result['estab_name'], "type" => $result['Type'], "bottle" => $result['title'], "price" => $result['Price'] )); 
		   } 	   
  	   }
  	    
       return json_encode($rArray);
    }
    
  /************************************************************************************
   			Function : sql_promo_drinks 
            By: John W. Blaine 
   			Description : Sends promotion drink to the recipient.
   			              - The recipient is the member running the app.             
  *************************************************************************************/
  		    
   public function sql_promo_drinks() {
       $sender_id = $this->EE->TMPL->fetch_param("sender_id");
       $recipientId = $this->EE->TMPL->fetch_param("recipientID");
       
       $promo_code = $this->EE->TMPL->fetch_param("promo_code");
       $type = $this->EE->TMPL->fetch_param("type");
       $est = $this->EE->TMPL->fetch_param("estID");
       $drinkType = $this->EE->TMPL->fetch_param("drinkType");
  
       $message = $this->EE->TMPL->fetch_param("message");
               
       
        // Check if this promo is valid
        $sql_valid_promo = "SELECT * FROM at_promotions WHERE name = '$promo_code' "; 
     	$query_valid_promo = $this->EE->db->query( $sql_valid_promo );
        
        if ($query_valid_promo->num_rows() == 0) {
    		return(  "Invaild Promo code : ". $promo_code. "!" ); 		
  		} else {
     		//return(  "Vaild Promo code : ". $promo_code ); 		
 		}       
        
        
       // Check if the member already receieved this promo
        $sql_already_rx = "SELECT * FROM v_drink_tickets WHERE tck_r_member = $recipientId AND promo_code = '$promo_code' "; 
    	$query_already_rx = $this->EE->db->query( $sql_already_rx );
       
 //       if ( $query_already_rx->num_rows() == 0 ) {
  
        if ( ($query_already_rx->num_rows() == 0) || ($recipientId == 1171)  || ($recipientId == 30)  || ($recipientId == 2) ) {
     		
     		//return(  $sender_id. " : " . $promo_code . " <> " .$query_already_rx->num_rows() );
     		
     		$this->senddrink_promo_drinks($sender_id, $type, $recipientId, $est, $drinkType, $message, $promo_code );
     		$msg = "You have successfully accepted the drink sent by AirtabBartender.";
     		$msg = $msg."<br><br>". "This drink will now appear in the My Drinks section in";
     		$msg = $msg."<br>". "your AirTab App for you to redeem at your convenience.";
     		
      		return(  $msg );
		} else {
     		return(  "You've already received this promotional drink!" );
		}
		
		
	}
    
   /************************************************************************************
   			Function : senddrink_promo_drinks 
            By: John W. Blaine 
   			Description : Sends promotion drink to the recipient.
   			              - The recipient is the member running the app.
   			                 			                
   			Example:  $this->senddrink_promo_drinks( 587, "airtab", 952, 2275, "Premium", "Enjoy!" );
   			
     			      $senderID = 587 (AirTabBartender)
                      $type = "airtab"
                      $recipientId = 952
                      $est = 2275
                      $drinkType = "Premium"
                      $message = "Enjoy!"	                    
   *************************************************************************************/
    
    function senddrink_promo_drinks( $senderID, $type, $recipientId, $estID, $drinkType, $message, $promo_code ) {
	
		$first = $this->EE->TMPL->fetch_param("first_name", "");
		$last = $this->EE->TMPL->fetch_param("last_name", "");
		$order_id = "PROMO".time().$senderID;
		$transaction_id = "PROMO-".time().$senderID;
		$vars = array();

		$db = clone $this->EE->db;
		$db->dbprefix='';

		$results = $db->select('*')
			->from('at_skipcheckout')
			->where(array(
					'id' => $senderID
				))
			->get();
		
		//User doesn't have permission to skip checkout
		if ($results->num_rows() == 0)
		{
			$vars[0]['json'] = json_encode(array("success"=>false, "msg"=>"You don't have permission to skip the checkout process."));
			return ee()->TMPL->parse_variables(ee()->TMPL->tagdata, $vars);
		}

		if($results->row('drinks_limit') && ($results->row('drinks_sent') >= $results->row('drinks_limit'))) {
			$vars[0]['json'] = json_encode(array("success"=>false, "msg"=>"You have exceeded your allotment of promotional tickets."));
			return ee()->TMPL->parse_variables(ee()->TMPL->tagdata, $vars);
		}

		switch($type) {
			case "email":
				$recipient_id_type = "Email";
				break;
			case "text":
				$recipient_id_type = "Phone Number";
				$recipientId = $this->sanitize_phone(html_entity_decode($this->EE->TMPL->fetch_param("recipient")));
				break;
			default:
				$recipient_id_type = "Member ID";
				break;
		}

		// update the # of drinks sent
		$db->update(
			    'at_skipcheckout',
			    array(
			        'drinks_sent'  => $results->row('drinks_sent')+1
			    ),
			    array(
			        'id' => $results->row('id')
			    )
		);		

		//Create the ticket
		ee()->load->library('api');
		ee()->api->instantiate('channel_entries');

		if ($drinkType == "Premium") {
		 	$typeId = "27";
		} else if ($drinkType == "Standard") {
			$typeId = "26"; //Standard
		} else {
			$typeId = $drinkType; 
		}

		//die($type);
		$invId = "inv" . time() . $senderID;
		
        //$message = $message." >> " . " < mem:" . $senderID; 
         
		$data = array(
		    'title'         => "promoticket-" . time() . $senderID,
		    'entry_date'    => time(),
		    'edit_date'     => time(),
		    'field_id_14'    => time(),
		    'field_id_15'    => $senderID,
		    'field_id_16'   => $recipientId,
		    'field_id_22'   => $typeId,
		    'field_id_41'	=> $transaction_id,
		    'field_id_46'	=> $invId,
		    'field_id_145'	=> $recipient_id_type,
		    'field_id_152'	=> $message,
		    'field_id_153'	=> $promo_code,
		    'status'		=> "nonredeemed"
		);


		if (ee()->api_channel_entries->save_entry($data, 4) === FALSE)
		{
		    $vars[0]['json'] = json_encode(array("success"=>false, "msg"=>"Could not create ticket. Please contact customer service."));
		    
		} else {
			$entryid = $this->EE->api_channel_entries->entry_id;
			ee()->db->insert('relationships', array('parent_id' => $entryid, 'child_id'=> $typeId, "field_id"=>"22"));
			$relationshipId = ee()->db->insert_id();
			$vars[0]['json'] = json_encode(array("success"=>true));
			
			//-------------jblaine-----------------------
			ee()->db->insert('relationships', array('parent_id' => $entryid, 'child_id'=> $estID, "field_id"=>"18"));
			$relationshipId = ee()->db->insert_id();
			$vars[0]['json'] = json_encode(array("success"=>true));
						
			ee()->db->insert('relationships', array('parent_id' => $entryid, 'child_id'=> $drinkType, "field_id"=>"47"));
			$relationshipId = ee()->db->insert_id();
			$vars[0]['json'] = json_encode(array("success"=>true));
						
			//--------------------------------------------
		}
   	
   	    //$sql = 'SELECT * FROM exp_members';
        //LEFT JOIN exp_member_data
        //ON ( exp_members.member_id = exp_member_data.member_id) ORDER BY exp_members.member_id';
     	//$allMembers = $this->EE->db->query( $sql );
	    //foreach($allMembers->result_array() as $mRow) {                      
     	//    $id = $mRow['member_id'];
		//}
		
		switch($type) {
			case "airtab":
				$status = $this->pushNotify_drink($recipientId, $drinkType);
				//$this->process_drink_invite_text('john@airtabappp.com', 'invId', 'message', 'first', 'last' );
				break;
			case "text":
				if(!$this->process_drink_invite_text($recipientId, $invId, $message, $first, $last )) $vars[0]['json'] = json_encode(array("success"=>false)); // Mark success as false, since we didn't send the invite successfully. 
				break;
			case "email":
				if(!$this->process_drink_invite_email($recipientId, $invId, $message, $first, $last )) $vars[0]['json'] = json_encode(array("success"=>false)); // Mark success as false, since we didn't send the invite successfully. 
				break;
			default:
				break;
		}

		return ee()->TMPL->parse_variables(ee()->TMPL->tagdata, $vars) ;
	}
    
    public function notifications_blast() {
    	
    	//$status = $this->pushApple( "952", "hi john" );
    		
    	$sql = 'SELECT * FROM exp_members 
        LEFT JOIN exp_member_data
        ON ( exp_members.member_id = exp_member_data.member_id) ORDER BY exp_members.member_id';

        $rVal = "";
        
     	$allMembers = $this->EE->db->query( $sql );

 	    foreach($allMembers->result_array() as $mRow) {                  

     	    $id = $mRow['member_id'];
     	    $usr = $mRow['username']; 
            $first = $mRow['m_field_id_1'];
            $last = $mRow['m_field_id_2'];
      	    $phone = $mRow['m_field_id_3'];         
      	           
      	    if (   $id == 952 ){     
 	        	
 	        	//$rVal = $rVal.$id.":".$first." ".$last.":";
 	        	$rVal = "Hello John";
 	        	$status = $this->pushApple( "1171", $rVal );
 	        	
 	        }

    	}
    	
        return( $rVal );
    }
    
    
		
}
/* End of file mod.airtab.php */
/* Location: /system/expressionengine/third_party/airtab/mod.airtab.php */