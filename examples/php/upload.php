<?php
header('Content-Type:text/plain');
$success = 'false';
$path = '../files';

if (!strlen($_SERVER['HTTP_X_FILE_NAME'])) {
  foreach($_FILES as $file) {
    $path .= "/" . basename($file['name']);
    if (move_uploaded_file($file['tmp_name'], $path))
      $success = 'true';
  }
} else {
  $temp_file = tempnam($path, "my_file_");
  file_put_contents($temp_file, file_get_contents("php://input"));
  $filename = $path."/".$_SERVER['HTTP_X_FILE_NAME'];
  rename($temp_file, $filename);
  chmod($filename, 0644);
  $success = 'true';
}

print '{success:'.$success.'}';
?>
