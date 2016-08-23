<?php
class Drinks_model extends CI_Model {

    var $title   = '';
    var $content = '';
    var $date    = '';

    public function test_jblaine()
    {
        //echo  "this is a test john!";
        return( "this is a test john from model!" );
    }

    function __construct()
    {
    	$this->load->database();
        // Call the Model constructor
        parent::__construct();
    }
    
    function get_details($drink)
    {
        $query = $this->db->get_where('v_cart_products', array('id'=> $drink), 1, 0);
        return $query->row();
    }

    function insert_entry()
    {
        $this->title   = $_POST['title']; // please read the below note
        $this->content = $_POST['content'];
        $this->date    = time();

        $this->db->insert('entries', $this);
    }

    function update_entry()
    {
        $this->title   = $_POST['title'];
        $this->content = $_POST['content'];
        $this->date    = time();

        $this->db->update('entries', $this, array('id' => $_POST['id']));
    }

    function create_ticket($info) {
        if(!$info) return false;

        //Create Channel Entry
        $this->db->insert('exp_channel_titles', $info['channel_titles']);
        $entryid = ($this->db->insert_id()) ? $this->db->insert_id() : false;

        if(!$entryid) return false;

        //Add Channel Entry Data
        $info['channel_data']['entry_id'] = $entryid;
        $this->db->insert('exp_channel_data', $info['channel_data']);

        return $entryid;
    }

    function create_invite($info) {
        if(!$info) return false;

        //Create Channel Entry
        $this->db->insert('exp_channel_titles', $info['channel_titles']);
        $entryid = ($this->db->insert_id()) ? $this->db->insert_id() : false;

        if(!$entryid) return false;

        //Add Channel Entry Data
        $info['channel_data']['entry_id'] = $entryid;
        $this->db->insert('exp_channel_data', $info['channel_data']);

        return $entryid;
    }

    function create_ticket_relationship($entryId, $typeId) {
        $this->db->insert('exp_relationships', array('parent_id' => $entryId, 'child_id'=> $typeId, "field_id"=>"22"));
        return ($this->db->insert_id()) ? $this->db->insert_id() : false;
    }
    
    // function create_ticket_relationship_jblaine($entryId, $typeId, $est,  $drinkType) {
     function create_ticket_relationship_jblaine($entryId, $est,  $drinkType) {
       
       // $this->db->insert('exp_relationships', array('parent_id' => $entryId, 'child_id'=> $typeId, "field_id"=>"22"));
       
        $this->db->insert('exp_relationships', array('parent_id' => $entryId, 'child_id'=> $drinkType, "field_id"=>"22"));
        $relationshipId = $this->db->insert_id();
        
        $this->db->insert('exp_relationships', array('parent_id' => $entryId, 'child_id'=> $est, "field_id"=>"18"));
        $relationshipId = $this->db->insert_id();
     
        $this->db->insert('exp_relationships', array('parent_id' => $entryId, 'child_id'=> $drinkType, "field_id"=>"47"));
        $relationshipId = $this->db->insert_id();
        
        //return ($this->db->insert_id()) ? $this->db->insert_id() : false;
    }
    

}