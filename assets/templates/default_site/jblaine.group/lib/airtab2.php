<?php

/*********************
   module: airtab2.php
   
*********************/

class airtab2 {

	 function getName( $idata ) {
	        return "hello ".$idata;
	 }
  
  	 function genKey($fname) {
 	    $key = ord($fname[0]);	        
		for ($i = 1; $i < strlen($fname);$i++) {
		    $key =  ord($fname[$i]) ^  $key;
		}
		return( $key );
	 }
	 
  	 function enc($data, $key) {
	 	$rval = "";			 	
		for ($i = 0; $i < strlen($data); $i++) {
			 $byte = ord($data[$i]);
			 $nVal = $byte ^ $key;
			 $rval = $rval.	sprintf("%c", $nVal);			 
			 $key = $nVal;				 	
		}
		return( $rval );
	 }
	 
	 function dec($data, $key) {
	 	$rval = "";		
	 	
		for ($i = 0; $i < strlen($data); $i++) {
			 $byte = ord($data[$i]);
			 $nVal = $byte ^ $key;
			 $rval = $rval.	sprintf("%c", $nVal);			 			 
			 $key = $byte;				 			 	
		}
		return( $rval );
	 }
  
}
  
?>