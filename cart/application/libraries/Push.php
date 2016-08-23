<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed'); 

class Push {

	public function __construct() {
		$this->CI =& get_instance();
        $this->CI->load->model('Order_model', 'order');
        $this->CI->load->model('User_model', 'user');
        $this->CI->load->model('Product_model', 'product');
        $this->CI->load->model('Drinks_model', 'drinks');
        $this->CI->load->helper('date');
	}

    public function pushApple($recipientId, $message) {
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

    public function pushAndroid($recipientId, $message, $title, $tag = "Push") {
        define( 'API_ACCESS_KEY', 'AIzaSyDQ7oEmA8JCJBKNBdZYZbLqMbssHKUAF28' );

        $registrationIds = $this->getAndroidDeviceIds($recipientId);
         
        // prep the bundle
        $msg = array
        (
            'tag'           => $tag,
            'title'         => $title,
            'subtitle'      => $message,
            'vibrate'       => true,
            'sound'         => true
        );
         
        $fields = array
        (
            'registration_ids'  => $registrationIds,
            'data'              => $msg
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

    public function getAndroidDeviceIds($member) {
        $results =$this->CI->db->query("SELECT * FROM at_devicetokens WHERE type = 'android' AND member = " . mysql_real_escape_string($member));
            
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

    public function getiOSDeviceIds($member) {
        $results =$this->CI->db->query("SELECT * FROM at_devicetokens WHERE type = 'ios' AND member = " . mysql_real_escape_string($member));
            
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
}

/* End of file Someclass.php */