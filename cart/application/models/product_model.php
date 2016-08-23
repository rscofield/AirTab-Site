<?php
class Product_model extends CI_Model {

    function __construct()
    {
    	$this->load->database();
        $this->env = ($this->config->item('anet_sandbox')) ? "test" : "live";
        // Call the Model constructor
        parent::__construct();
    }
    
    //This function get all available details about a user (Expression engine, CIM Customer Profile, CIM Payment Profiles)
    function get_details($pId)
    {
        $query = $this->db->get_where('v_cart_products', array('id' => $pId), 1, 0);
        return $query->row();
    }

}