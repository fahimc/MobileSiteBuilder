<?php
//header('Content-Type: application/json');
$feed = new DOMDocument();
$feed->load(urldecode($_GET['r']));
// $json = array();
// 
// $json['title'] = $feed->getElementsByTagName('channel')->item(0)->getElementsByTagName('title')->item(0)->firstChild->nodeValue;
// $json['description'] = $feed->getElementsByTagName('channel')->item(0)->getElementsByTagName('description')->item(0)->firstChild->nodeValue;
// $json['link'] = $feed->getElementsByTagName('channel')->item(0)->getElementsByTagName('link')->item(0)->firstChild->nodeValue;
// 
// $items = $feed->getElementsByTagName('channel')->item(0)->getElementsByTagName('item');
// 
// $json['item'] = array();
// $i = 0;
// 
// 
// foreach($items as $item) {
// 
   // $title = $item->getElementsByTagName('title')->item(0)->firstChild->nodeValue;
   // $description = $item->getElementsByTagName('description')->item(0)->firstChild->nodeValue;
   // $pubDate = $item->getElementsByTagName('pubDate')->item(0)->firstChild->nodeValue;
   // $guid = $item->getElementsByTagName('guid')->item(0)->firstChild->nodeValue;
//    
   // $json['item'][$i++]['title'] = $title;
   // $json['item'][$i++]['description'] = $description;
   // $json['item'][$i++]['pubdate'] = $pubDate;
   // $json['item'][$i++]['guid'] = $guid;   
//      
// }

if(isset($_GET['c']))
{
	$output = str_replace(array("\r\n", "\r"), "\n", $feed->saveXML());
	$lines = explode("\n", $output);
$new_lines = array();

foreach ($lines as $i => $line) {
    if(!empty($line))
        $new_lines[] = trim($line);
}
$new_lines = str_replace("'", "&#39;", $new_lines);
// echo $_GET['c']."(".json_encode($json).");";	
echo  $_GET['c']."('". implode($new_lines)."');";	
}else{
echo json_encode($json);		
}


?>