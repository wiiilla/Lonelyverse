<?php
header("Expires: Tue, 01 Jan 2000 00:00:00 GMT");
header("Last-Modified: " . gmdate("D, d M Y H:i:s") . " GMT");
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");

$tweets=$_POST['updatedTweets'];
$myFile = "tweets.json";

//Convert updated array to JSON
$jsondata = json_encode($tweets, JSON_PRETTY_PRINT);

//write json data into data.json file
if(file_put_contents($myFile, $jsondata)) {
	echo 'Data successfully saved';
	clearstatcache();
}
else{
	echo "error";
}
?>
