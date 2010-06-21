<?php

$xaction = $_REQUEST['cmd'];

if ($xaction == 'get') {
  $index = 0;
  $files = array();
  $hd = opendir('../files/'.$_REQUEST['path']);
  while ($file = readdir($hd)) {
    if ($file != '.' and $file != '..') {
      $files[$index]['text'] = $file;
      $files[$index]['lastmod'] = 1272391250000;
      $files[$index]['leaf'] = !is_dir('../files/'.$_REQUEST['path'].'/'.$file);
      $index++;
    }
  }
  header("Content-Type:text/plain");
  print json_encode($files);
}

?>
