<?php
class User_model extends CI_Model {

    function __construct()
    {
    	$this->load->database();
        $this->env = ($this->config->item('anet_sandbox')) ? "test" : "live";
        // Call the Model constructor
        parent::__construct();
    }

    //Check the database to make sure a session is valid
    function validate_session($session, $user_id) {
        $query = $this->db->get_where('exp_sessions', array('member_id' => $user_id, 'session_id'=>$session), 1, 0);
        return ($query->num_rows()) ? true : false;
    }
    
    //This function get all available details about a user (Expression engine, CIM Customer Profile, CIM Payment Profiles)
    function get_details($id)
    {
        //$user = new stdClass;
        $user = $this->get_user_info($id);
        $user->profile_id = 0;
        $user->profile_id = $this->get_profile_id($id);
        if(!$user->profile_id) return $user; // No profile exists

        $payment_profiles = $this->get_payment_profiles($user->profile_id);
        if($payment_profiles) {
            $user->payment_profiles = $payment_profiles;
            $user->payment_profiles_count = count($payment_profiles);
        }

        return $user;
    }

    // Query the database to find if a user has a CIM customer profile, if they do, return the profile id
    function get_profile_id($id) {
        $query = $this->db->get_where('cart_cim_profiles', array('user_id' => $id, 'env'=>$this->env), 1, 0);
        if($query->num_rows()) return $query->row()->profile_id;

        return false;
    }

    function profile_to_user_id($profile_id) {
        $query = $this->db->get_where('cart_cim_profiles', array('profile_id' => $profile_id, 'env'=>$this->env), 1, 0);
        if($query->num_rows()) return $query->row()->user_id;

        return false;
    }

    //Query the database to get the Expression Engine member details
    function get_user_info($id) {
        $query = $this->db->get_where('v_members', array('member_id' => $id), 1, 0);
        return $query->row();
    }

    //Search the database for stored Payment Profiles, and query Authorize.net for the details
    function get_payment_profiles($pId) {
        $this->db->select('payment_profile as id, env, last_activity, expiration, valid_until');
        $this->db->order_by("last_activity desc");
        $query = $this->db->get_where('v_cart_payment_profiles', array('profile_id' => $pId, 'env'=>$this->env));
        if($query->num_rows()) {
            $profiles = array();
            foreach($query->result() as $profile) {
                $info = $this->get_payment_profile_details($pId, $profile->id, $profile->expiration, $profile->valid_until);
                if($info) $profiles[] = $info;
            }
            return $profiles;
        }

        return null;
    }

    // Query Authorize.net for the Payment Profile Details
    public function get_payment_profile_details($profile_id, $payment_profile_id, $expiration, $valid_until) {
        $this->load->library("cim");
        $request = new Cim;
        $response = $request->getCustomerPaymentProfile($profile_id, $payment_profile_id);
        if ($response->isOk()) {
            if(!$response->xml->paymentProfile->payment->creditCard) return; //Not a credit card payment profile, possibly eCheck?
            $response->xml->paymentProfile->expiration = $expiration;
            $response->xml->paymentProfile->valid_until = $valid_until;
            $response->xml->paymentProfile->payment->creditCard->cardNumber = substr($response->xml->paymentProfile->payment->creditCard->cardNumber, -4, 4);
            return $response->xml->paymentProfile;
        } else {
            return;
        }
    }

    public function payment_profile_activity($profile_id) {
        if(!$profile_id) return false;
        $this->db->update('cart_cim_payment_profiles', array("last_activity"=>time()), "payment_profile = '" . $profile_id . "'");
        return ($this->db->affected_rows()) ? true : false;
    }

    public function insert_customer_profile($user = false) {
        if(!$user || !$user->profile_id || !$user->member_id) return false;

        $data = array(
           'user_id' => $user->member_id,
           'profile_id' => $user->profile_id,
           'env' => $this->env,
        );

        $this->db->insert('cart_cim_profiles', $data);
        return ($this->db->insert_id()) ? $this->db->insert_id() : false;
    }

    public function insert_payment_profile($profile_id = false, $payment_profile_id = false, $expiration = false) {
        if(!$profile_id || !$payment_profile_id || !$expiration) return false;

        $user_id = $this->profile_to_user_id($profile_id);

        if(!$user_id) return false;

        $data = array(
           'payment_profile' => $payment_profile_id,
           'user_id' => $user_id,
           'last_activity' => time(),
           'env' => $this->env,
           'expiration' => $expiration . "-01"
        );

        $this->db->insert('cart_cim_payment_profiles', $data);
        return ($this->db->insert_id()) ? $this->db->insert_id() : false;
    }

}