<?php

header("Content-Type:text/plain");

$xaction = $_REQUEST['cmd'];

if ($xaction == 'get') {
  $index = 0;
  $files = array();
  $_REQUEST['path'] = '/Users/goldledoigt/www'.$_REQUEST['path'];
  $hd = opendir($_REQUEST['path']);
  while ($file = readdir($hd)) {
    if ($file != '.' and $file != '..') {
      $files[$index]['text'] = $file;
      $files[$index]['lastmod'] = 1272391250000;
      if (!is_dir($_REQUEST['path'].'/'.$file)) {
        $files[$index]['leaf'] = true;
        $files[$index]['size'] = filesize($_REQUEST['path'].'/'.$file);
      }
      $files[$index]['iconCls'] = !is_dir($_REQUEST['path'].'/'.$file) ? "icon-file-".strtolower(substr(strrchr($file, '.'), 1)) : "";
      $index++;
    }
  }
  header("Content-Type:text/plain");
  print json_encode($files);
}

else if ($xaction == 'newdir') {
    $_REQUEST['dir'] = '/Users/goldledoigt/www'.$_REQUEST['dir'];
    mkdir($_REQUEST['dir']);
    print '{success:true}';
}

else if ($xaction == 'rename') {
    $_REQUEST['oldname'] = '/Users/goldledoigt/www'.$_REQUEST['oldname'];
    $_REQUEST['newname'] = '/Users/goldledoigt/www'.$_REQUEST['newname'];
    rename($_REQUEST['oldname'], $_REQUEST['newname']);
    print '{success:true}';
}

else if ($xaction == 'delete') {
    $_REQUEST['file'] = '/Users/goldledoigt/www'.$_REQUEST['file'];
    if (is_dir($_REQUEST['file']))
        rmdir($_REQUEST['file']);
    else if (file_exists($_REQUEST['file']))
        unlink($_REQUEST['file']);
    print '{success:true}';
}

else if ($xaction == 'view') {
    $_REQUEST['file'] = '/Users/goldledoigt/www'.$_REQUEST['file'];
    $hd = fopen($_REQUEST['file'], "rb");
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
