<?php  if ( ! defined('BASEPATH')) exit('No direct script access allowed');

/**
 * =============================================================
 * For allowing customization of session expire duration
 * 
 * Version:     1.0.0 (beta)
 * Authors:	Ray Scofield, Eric Iles
 * Written:	8/14/14
 * =============================================================
 */

class Airtab_session_ext
{
	
	// ----------------------------------
	// Class params
	// ----------------------------------
	
	var $settings		= array();
	var $ext_class		= "Airtab_session_ext";
	var $name		= "AirTab Session";
	var $version		= "1.0.0";
	var $description	= "Gives control over session expire length.";
	var $settings_exist	= "n";
	var $docs_url		= "";
	var $session_len = 2419200;  // User sessions expire in four weeks


	/**
	 * ----------------------------------------
	 * Constructor
	 * ----------------------------------------
	 */
	function Airtab_session_ext ($settings = "")
	{
		$this->EE = & get_instance();
		$this->settings = $settings;
	}
	

	/**
	 * ----------------------------------------
	 * For activating the extension.
	 * 
	 * ----------------------------------------
	 */
	function activate_extension ()
	{


		// ----------------------------------
		//  Default settings
		// ----------------------------------

		$default_settings = serialize(array(
			"session_len"	=> 2419200
			)
		);

		// ----------------------------------
		//  Add custom processing to sessions_start
		// ----------------------------------
		
		$this->EE->db->query(
			$this->EE->db->insert_string(
				"exp_extensions", array(
				"extension_id" => "",
				"class"        => get_class($this),
				"method"       => "extend_session",
				"hook"         => "sessions_start",
				"settings"     => $default_settings,
				"priority"     => 7,
				"version"      => $this->version,
				"enabled"      => "n"
				)
			)
		);
		
	}


	
	/**
	 * ----------------------------------------
	 * For upgrading the extension from a 
	 * prior version.
	 * 
	 * ----------------------------------------
	 */
	function update_extension ($current = "")
	{

		// ----------------------------------
		//  No adjustments needed
		// ----------------------------------

		return FALSE;
	}
	

	/**
	 * ----------------------------------------
	 * set the session expire length
	 * 
	 * ----------------------------------------
	 */   
	function extend_session(&$session)
	{
		//print "<!--";
		//print_r ($session);
		//print "-->";
	
		$session->user_session_len = $this->session_len;
		$session->session_length	 = $this->session_len;	
		// -------------------------------------------
		//  Return 
		// -------------------------------------------
		
		return FALSE;		
		
	}

}
?>