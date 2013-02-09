<?php
include_once 'log.php';
include_once 'client.php';

$t =$_GET['t'];
$f =$_GET['f'];
$s =$_GET['s'];
$b =$_GET['b'];
$appid = $_GET['i'];

if(isset($t) && isset($f) && isset($s) && isset($b) && isset($appid) && $appid="tb0802132202")
{
	$t = urldecode ($_GET['t']);
	$f = urldecode ($_GET['f']);
	$s = urldecode ($_GET['s']);
	$b = urldecode ($_GET['b']);
	$appid = urldecode ($_GET['i']);
	$today = date("F j, Y, g:i a");  
	$result = write_log("request from: ".get_client_ip()." at ".$today."\r\n");
  	$headers = "From: ".$f."\r\n" .
     "X-Mailer: php";
	 
	 
	if(is_valid_email($t) && is_valid_email($f))
	{	 
	 if (mail($t, $s, $b,$headers)) {
	   echo("emailCallback('Message successfully sent!');");
	  } else {
	   echo("emailCallback('Message delivery failed');");
	  }
	}else{
		 echo("emailCallback('invalid email');");
	}	
}else{
	 echo("emailCallback('Error');");
}
function is_valid_email($email) {
  return preg_match('#^[a-z0-9.!\#$%&\'*+-/=?^_`{|}~]+@([0-9.]+|([^\s]+\.+[a-z]{2,6}))$#si', $email);
}
 ?>