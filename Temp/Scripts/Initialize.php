<?php

// Hide all PHP errors (useful, we never wanted to show error in production code)
error_reporting(0);
ini_set('display_errors', 0);

// Enable CORS (http://enable-cors.org/server_php.html)
header('Access-Control-Allow-Origin: *');
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
  if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD']))
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
  if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']))
    header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");
  exit;
}

// Require our Database class
require 'Database.php';

// Try to connect with the database
try {
  Database::connect('mysql:host=localhost;dbname=dec_appbuilder', 'dec_appbuilder', 'alkjOPIJ2isoihfuhuwad2r');
} catch (Exception $e) {
  // And exit the script execution here if we cannot connect
  http_response_code(500);
  echo 'Can\'t connect to the database: ' . $e->getMessage();
  exit;
}
