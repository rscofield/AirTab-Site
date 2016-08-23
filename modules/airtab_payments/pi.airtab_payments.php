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
 * AirTab Payments Plugin
 *
 * @package		ExpressionEngine
 * @subpackage	Addons
 * @category	Plugin
 * @author		Eric Iles
 * @link		http://viperss.com
 */

require_once __DIR__.'/libraries/AuthorizeNet.php';

$plugin_info = array(
	'pi_name'		=> 'AirTab Payments',
	'pi_version'	=> '1.0',
	'pi_author'		=> 'Eric Iles',
	'pi_author_url'	=> 'http://viperss.com',
	'pi_description'=> 'This plugin handles the payment process for AirTab.',
	'pi_usage'		=> Airtab_payments::usage()
);


class Airtab_payments {

	public $return_data;
	public $settings;
	public $transaction;
    
	/**
	 * Constructor
	 */
	public function __construct()
	{
		$this->EE =& get_instance();
		
		//Live Account
		//$this->transaction = new AuthorizeNetAIM('7TMw9fk78', '79Gzg9U4WsFDX29r');
		
		
		//Sandbox
		$this->transaction = new AuthorizeNetAIM('6Fjqj5fBN5x', '83W56F64xDbkp54w');
		
		//die(print_r($this->transaction, true));
		
		/*
		$this->gateway = Omnipay::create('AuthorizeNet_AIM');
		$this->gateway->setApiLoginId("7TMw9fk78");
		$this->gateway->setTransactionKey("79Gzg9U4WsFDX29r");
		$this->gateway->setTestMode("true");
		//print_r($this->gateway);*/
		
		
		
	}
	
	// ----------------------------------------------------------------
	
	/**
	 * Plugin Usage
	 */
	public static function usage()
	{
		ob_start();
		
		$buffer = ob_get_contents();
		ob_end_clean();
		return $buffer;
	}
	
	//CHeck the device ID and session ID to verify the user is logged in and create a new session for the webView.
	//Will generate an error if not valid.
	public function checkLogin()
	{
		echo "test";
		die(print_r($this->settings,true));
	}
	
	public function checkout() {
		$ccnum = ee()->TMPL->fetch_param('ccnum');
		
		$this->transaction->amount = '14.95';
		$this->transaction->card_num = $ccnum;
		$this->transaction->exp_date = '10/16';
		
		$response = $this->transaction->authorizeAndCapture();
		
		if ($response->approved) {
		  echo "<h1>Success! The test credit card has been charged!</h1>";
		  echo "Transaction ID: " . $response->transaction_id;
		} else {
		  echo $response->error_message;
		}
	}
	
	
}


/* End of file pi.airtab_payments.php */
/* Location: /system/expressionengine/third_party/airtab_payments/pi.airtab_payments.php */