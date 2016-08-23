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
 * AirTab Messaging Module Front End File
 *
 * @package		ExpressionEngine
 * @subpackage	Addons
 * @category	Module
 * @author		Eric Iles
 * @link		http://www.viperss.com
 */

class Airtab_messaging {
	
	public $return_data;
	
	/**
	 * Constructor
	 */
	public function __construct()
	{
		$this->EE =& get_instance();
	}
	
	// ----------------------------------------------------------------

	public function create_thread() {
		$recipient = $this->EE->TMPL->fetch_param("recipient");
		$message = $this->EE->TMPL->fetch_param("message");
		$userid = ee()->session->userdata('member_id');

		if(!$recipient) return json_encode(array("success"=>false, "msg"=>"You did not specify a recipient for this message."));
		if(!$userid) return json_encode(array("success"=>false, "msg"=>"You are not logged in."));
		if(!$message) return json_encode(array("success"=>false, "msg"=>"You did not specify a message to send."));

		//Make sure the recipient exists
		$rData = $this->get_member_data($recipient);
		//die(print_r($rData, true));
		if(!isset($rData['username'])) return json_encode(array("success"=>false, "msg"=>"You did not specify a valid recipient."));

		$message = base64_decode($message);

		// All checks complete, let's add the message to the conversation
		$db = clone $this->EE->db;
		$db->dbprefix='';	// remove exp_ prefix

		//Create Thread
		$db->insert(
			'at_messaging_threads',
			array(
				'created'  => time()
			)
		);

		$thread = ee()->db->insert_id();

		if(!$thread) return json_encode(array("success"=>false, "msg"=>"Unable to create the new conversation thread."));

		// Create User Threads
		$db->insert(
			'at_messaging_user_threads',
			array(
				'thread_id'	=> $thread,
				'user_id'	=> $recipient,
				'status'	=> 1
			)
		);

		$db->insert(
			'at_messaging_user_threads',
			array(
				'thread_id'	=> $thread,
				'user_id'	=> $userid,
				'status'	=> 1
			)
		);

		//Create Message
		$db->insert(
			'at_messaging_messages',
			array(
				'created'  => time(),
				'user_id' => $userid,
				'message' => $message,
				'thread' => $thread
			)
		);

		$message_id = ee()->db->insert_id();
		if($message_id)  {
			$participants = $this->get_thread_participants($thread, "function");
			foreach($participants as $participant) {
				if($participant['user_id'] == $userid) continue;

				$this->pushNotify_message($participant['user_id'], $message, $thread);
			}
			return json_encode(array("success"=>true, "thread"=>$thread));
		}

		return json_encode(array("success"=>false, "msg"=>"There was an error sending your message."));
	}

	public function modify_user_thread() {
		$id = $this->EE->TMPL->fetch_param("id");
		$act = $this->EE->TMPL->fetch_param("act");
		$userid = ee()->session->userdata('member_id');

		if(!$id) return json_encode(array("success"=>false, "msg"=>"You did not specify a user thread."));
		if(!$act) return json_encode(array("success"=>false, "msg"=>"You did not specify an action to perform on this thread."));
		if(!$userid) return json_encode(array("success"=>false, "msg"=>"You are not currently logged in."));

		switch($act) {
			case "delete":
				$status = 0;
				break;
			case "archive":
				$status = 2;
				break;
			case "restore":
				$status = 1;
				break;
		}

		//All required information is present, update the database
		$db = clone $this->EE->db;
		$db->dbprefix='';	// remove exp_ prefix
		$db->update(
			    'at_messaging_user_threads',
			    array(
			        'status'  => $status // 0 = deleted, 1 = active, 2 = archived
			    ),
			    array(
			        'id' => $id,
			        'user_id' => $userid
			    )
		);

		if(ee()->db->affected_rows() == 1)  return json_encode(array("success"=>true));

		return json_encode(array("success"=>false, "msg"=>"Unable to delete conversation. If this problem persists, please contact AirTab support."));
	}

	public function get_thread_participants($thread = false, $type="tag") {

		$thread = ($thread) ? $thread : $this->EE->TMPL->fetch_param("thread");

		if(!$thread) return ($type == "tag") ? json_encode(array("success"=>false, "msg"=>"You did not specify a user thread.")) : false;

		$db = clone $this->EE->db;
		$db->dbprefix='';	// remove exp_ prefix
		$participants = $db->select('*')
			->from('v_messaging_thread_participants')
			->where(array(
					'thread_id' => $thread,
					'status' => 1
			))
			->get();

		if ($participants->num_rows() == 0) return ($type == "tag") ? json_encode(array("success"=>false, "msg"=>"No active conversation found with that thread ID.")) : false;
		
		if($type == "tag") {
			return json_encode(array(
				"success"=>true,
				"participants"=>$participants->result_array()
			));
		} else {
			return $participants->result_array();
		}
	}

	public function get_messages() {
		$thread = $this->EE->TMPL->fetch_param("thread");
		$since = $this->EE->TMPL->fetch_param("since", 0);
		$userid = ee()->session->userdata('member_id');

		if(!$thread) return json_encode(array("success"=>false, "msg"=>"You did not specify a user thread."));
		if(!$userid) return json_encode(array("success"=>false, "msg"=>"You are not currently logged in."));
		if(!$this->thread_exists($thread)) return json_encode(array("success"=>false, "msg"=>"There is no conversation with that id."));
		if(!$this->has_thread_access($userid, $thread)) return json_encode(array("success"=>false, "msg"=>"You are not a participant in that conversation."));

		$db = clone $this->EE->db;
		$db->dbprefix='';	// remove exp_ prefix
		$messages = $db->select('*')
			->from('v_messaging_messages')
			->where(array(
					'thread' => $thread,
					'created >' => $since
			))
			->get();

		if(!$messages->num_rows) return json_encode(array("success"=>false, "msg"=>"No messages were found."));

		$m = null;

		foreach ($messages->result_array() as $message) {
			$message["avatar"] = $this->get_avatar($message["user_id"], 60);
			$m[] = $message;
		}

		return json_encode(array(
			"success"=>true,
			"messages"=>$m
		));
	}



	//Helper Functions

	//Check if thread exists
	public function thread_exists($thread) {
		if(!$thread) return false;

		$db = clone $this->EE->db;
		$db->dbprefix='';	// remove exp_ prefix
		$thread = $db->select('*')
			->from('at_messaging_threads')
			->where(array(
					'id' => $thread
			))
			->get();

		if($thread->num_rows > 0) return true;

		return false;
	}

	//Check if a user has access to a thread (are they a participant?)

	public function has_thread_access($user, $thread) {
		if(!$user || !$thread) return false;

		$db = clone $this->EE->db;
		$db->dbprefix='';	// remove exp_ prefix
		$participants = $db->select('*')
			->from('v_messaging_thread_participants')
			->where(array(
					'thread_id' => $thread,
					'status' => 1,
					'user_id' => $user
			))
			->get();

		if($participants->num_rows > 0) return true;

		return false;
	}

	public function send_message() {
		$thread = $this->EE->TMPL->fetch_param("thread");
		$message = $this->EE->TMPL->fetch_param("message");
		$userid = ee()->session->userdata('member_id');

		if(!$thread) return json_encode(array("success"=>false, "msg"=>"You did not specify a user thread."));
		if(!$message) return json_encode(array("success"=>false, "msg"=>"You did not specify a message to send."));
		if(!$userid) return json_encode(array("success"=>false, "msg"=>"You are not logged in."));

		if(!$this->thread_exists($thread)) return json_encode(array("success"=>false, "msg"=>"That is not a valid conversation."));
		if(!$this->has_thread_access($userid, $thread)) return json_encode(array("success"=>false, "msg"=>"You are not a participant of that conversation."));

		// Decode Message
		$message = base64_decode($message);

		// All checks complete, let's add the message to the conversation
		$db = clone $this->EE->db;
		$db->dbprefix='';	// remove exp_ prefix
		$db->insert(
			'at_messaging_messages',
			array(
				'created'  => time(),
				'user_id' => $userid,
				'message' => $message,
				'thread' => $thread
			)
		);

		$message_id = ee()->db->insert_id();
		if($message_id)  {
			$participants = $this->get_thread_participants($thread, "function");
			foreach($participants as $participant) {
				if($participant['user_id'] == $userid) continue;

				$this->pushNotify_message($participant['user_id'], $message, $thread);
			}
			return json_encode(array("success"=>true));
		}

		return json_encode(array("success"=>false, "msg"=>"There was an error sending your message."));
	}

	public function get_avatar($member, $size = false) {

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

	function pushNotify_message($recipientId, $message, $thread) {
		$title = "You received a message!";
		$message = ee()->session->userdata('screen_name') . ": " . $message;
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

		$options = array( "thread" => $thread );

		if($deviceToken) $this->pushApple($recipientId, $message, $options, "newMessage");
		if($androidDeviceId) $this->pushAndroid($recipientId, $message, $title, $options, "newMessage");

		return "success";
	}

	function getAndroidDeviceIds($member) {
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

	function pushApple($recipientId, $message, $options, $tag = "Push") {
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

				$body['tag'] = $tag;

				$result = array_merge($body, $options);
				
				// Encode the payload as JSON
				$payload = json_encode($result);
				
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

	function pushAndroid($recipientId, $message, $title, $options, $tag = "Push") {
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

		$result = array_merge($msg, $options);
		 
		$fields = array
		(
			'registration_ids' 	=> $registrationIds,
			'data'				=> $result
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
 
	
}
/* End of file mod.airtab_messaging.php */
/* Location: /system/expressionengine/third_party/airtab/mod.airtab_messaging.php */