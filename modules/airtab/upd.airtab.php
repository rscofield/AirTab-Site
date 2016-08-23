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
 * airtab Module Install/Update File
 *
 * @package		ExpressionEngine
 * @subpackage	Addons
 * @category	Module
 * @author		Ray Scofield
 * @link		http://www.viperss.com
 */

class Airtab_upd {
	
	public $version = '1.0';
	
	private $EE;
	
	/**
	 * Constructor
	 */
	public function __construct()
	{
		$this->EE =& get_instance();
	}
	
	// ----------------------------------------------------------------
	
	/**
	 * Installation Method
	 *
	 * @return 	boolean 	TRUE
	 */
	public function install()
	{
		$mod_data = array(
			'module_name'			=> 'Airtab',
			'module_version'		=> $this->version,
			'has_cp_backend'		=> "n",
			'has_publish_fields'	=> 'n'
		);
		
		$this->EE->db->insert('modules', $mod_data);
		
		// $this->EE->load->dbforge();
		/**
		 * In order to setup your custom tables, uncomment the line above, and 
		 * start adding them below!
		 */


		/**
		 * Actions
		 */
    /*$data = array(
        'class'     => 'Airtab',
        'method'     => 'process_senddrink_invite'
    );
    $this->EE->db->insert('actions', $data);
    */
		$this->_register_action('process_senddrink_invite');
		$this->_register_action('process_friend_invite_text');
		$this->_register_action('process_friend_invite_email');
		
		return TRUE;
	}
	

	// ----------------------------------------------------------------
	
	/**
	 * Uninstall
	 *
	 * @return 	boolean 	TRUE
	 */	
	public function uninstall()
	{
		$mod_id = $this->EE->db->select('module_id')
								->get_where('modules', array(
									'module_name'	=> 'Airtab'
								))->row('module_id');
		
		$this->EE->db->where('module_id', $mod_id)
					 ->delete('module_member_groups');
		
		$this->EE->db->where('module_name', 'Airtab')
					 ->delete('modules');
		
		// $this->EE->load->dbforge();
		// Delete your custom tables & any ACT rows 
		// you have in the actions table
		
		return TRUE;
	}
	
	// ----------------------------------------------------------------
	
	/**
	 * Module Updater
	 *
	 * @return 	boolean 	TRUE
	 */	
	public function update($current = '')
	{
		// If you have updates, drop 'em in here.
		return TRUE;
	}
	
	protected function _register_action($method)
    {
        ee()->db->where('class', "Airtab");
        ee()->db->where('method', $method);
        if (ee()->db->count_all_results('actions') == 0) {
            ee()->db->insert('actions', array(
                'class' => "Airtab",
                'method' => $method
            ));
        }
    }
}
/* End of file upd.airtab.php */
/* Location: /system/expressionengine/third_party/airtab/upd.airtab.php */