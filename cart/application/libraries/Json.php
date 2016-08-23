<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed'); 

class Json {

	public function __construct() {
		$this->CI =& get_instance();
	}

    public function output($d)
    {
    	$data['json'] = json_encode($d);
    	$this->CI->output->set_content_type('application/json');
		$this->CI->parser->parse('json', $data);
    }

    public function error($msg) {
    	$error = array(
    		"status" => "error",
    		"msg"	=> $msg
    	);

    	$this->output($error);
    }

    public function parse($d) {
    	return json_decode($d);
    }
}

/* End of file Someclass.php */