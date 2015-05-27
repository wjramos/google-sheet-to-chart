<?php

$decoded = $_POST['data'];
$jsonFile = fopen('data.json','w+') or die("can't open file");
fwrite($jsonFile,$decoded);
fclose($jsonFile);
?>