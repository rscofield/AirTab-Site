<?php
class Order_model extends CI_Model {

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
    
    //This function gets all available details about an order
    function get_details($id = false)
    {
        //Ensure order id was specified
        if(!$id) return false;

        $order = $this->get_order($id);

        if(!$order) return false;

        $order->items = $this->get_order_items($order->order_id);

        return $order;
    }

    public function get_order($order_id = false) {
        if(!$order_id) return false;

        $query = $this->db->get_where('cart_orders', array('order_id' => $order_id), 1, 0);

        //Did we find an order?
        if(!$query->num_rows()) return false;

        return $query->row();
    } 

    public function get_order_items($order_id = false) {

        $query = $this->db->get_where('cart_order_items', array('order_id' => $order_id));

        //Did we find any order items? If not, return othing
        if(!$query->num_rows()) return;
        $items = array();
        foreach ($query->result() as $row) {
            if(@$row->options) $row->options = json_decode($row->options);
            $items[] = $row;
        }

        return $items;
    }

    public function add_order($order = false) {
        if(!$order || !@$order->order_id || !@$order->user_id || !@$order->total) return false;

        if(!@$order->subtotal) $order->subtotal = $order->total;


        $data = array(
            'order_id'  => $order->order_id,
            'user_id'   => $order->user_id,
            'subtotal'  => $order->subtotal,
            'total'     => $order->total,
            'created'   => time()
        );

        $this->db->insert('cart_orders', $data);

        $order = $this->get_order($order->order_id);

        //Did we find an order?
        return (!$order) ? false : $order;
    }

    public function add_order_items($order_id = false, $items = false) {
        if(!$order_id || !$items || !is_array($items) || count($items) == 0) return false;

        $new_items = array();
        foreach($items as $k=>$item) {
            $item = (object) $item;
            $new_items[] = $item;
            $data = array(
                'order_id'      => $order_id,
                'product_id'    => $item->id,
                'subtotal'      => $item->subtotal,
                'qty'           => $item->qty,
                'price'         => $item->price,
                'options'       => json_encode($item->options)
            );

            $this->db->insert('cart_order_items', $data);
            if(!$this->db->insert_id()) return false;
        }

        return $this->get_order_items($order_id);
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

    public function payment_complete($order_id = false, $r = false) {
        if(!$order_id || !$r) return false;

        $this->db->update('cart_orders', array("completed"=>time(), "authorization_code"=>$r->authorization_code, "transaction_id"=>$r->transaction_id), "order_id = '" . $order_id . "'");
        return ($this->db->affected_rows()) ? true : false;
    }

    public function set_processed($order_id = false) {
        if(!$order_id) return false;

        $this->db->update('cart_orders', array("status"=>"processed"), "order_id = '" . $order_id . "'");
        return ($this->db->affected_rows()) ? true : false;
    }

}