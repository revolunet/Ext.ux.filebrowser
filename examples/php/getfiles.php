<?php

header("Content-Type:text/plain");

$xaction = $_REQUEST['cmd'];

if ($xaction == 'get') {
  $index = 0;
  $files = array();
  $hd = opendir('../files/'.$_REQUEST['path']);
  while ($file = readdir($hd)) {
    if ($file != '.' and $file != '..') {
      $files[$index]['text'] = $file;
      $files[$index]['lastmod'] = 1272391250000;
      if (!is_dir('../files/'.$_REQUEST['path'].'/'.$file)) {
        $files[$index]['leaf'] = true;
        $files[$index]['size'] = filesize('../files/'.$_REQUEST['path'].'/'.$file);   
      }
      $files[$index]['iconCls'] = !is_dir('../files/'.$_REQUEST['path'].'/'.$file) ? "icon-file-".strtolower(substr(strrchr($file, '.'), 1)) : "";
      $index++;
    }
  }
  header("Content-Type:text/plain");
  print json_encode($files);
}

else if ($xaction == 'newdir') {
    mkdir('../files/'.$_REQUEST['dir']);
    print '{success:true}';
}

else if ($xaction == 'rename') {
    rename('../files/'.$_REQUEST['oldname'], '../files/'.$_REQUEST['newname']);
    print '{success:true}';
}

else if ($xaction == 'delete') {
    if (is_dir('../files/'.$_REQUEST['file']))
        rmdir('../files/'.$_REQUEST['file']);
    else if (file_exists('../files/'.$_REQUEST['file']))
        unlink('../files/'.$_REQUEST['file']);
    print '{success:true}';
}

else if ($xaction == 'view') {

    $hd = fopen('../files/'.$_REQUEST['file'], "rb");
    while (!feof($hd)) {
        $file .= fread($hd, 1024);
    }
    fclose($hd);
    $ext = strtolower(substr(strrchr($_REQUEST['file'], '.'), 1));
    header('Content-Disposition: inline; filename="'. $_REQUEST['file'] . '"');
    header ('Content-type: image/'.$ext);
    header('Content-Length: ' . filesize($file)); 
    print $file;
}

?>
