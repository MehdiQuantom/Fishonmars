<?php

// Initialize our environment
require 'Initialize.php';

// By default, return a request error
$result = false;

// Find if we have a note title and text
if (filter_has_var(INPUT_POST, 'title') &&
 filter_has_var(INPUT_POST, 'text'))
{
  // Filter note title and text
  $title = filter_input(INPUT_POST, 'title', FILTER_SANITIZE_STRING, FILTER_FLAG_NO_ENCODE_QUOTES);
  $text = filter_input(INPUT_POST, 'text', FILTER_SANITIZE_STRING, FILTER_FLAG_NO_ENCODE_QUOTES);

  // Validate note title and text
  if (($title !== false) && ($text !== false)) {

    $title = substr($title, 0, 50);
    $text = substr($text, 0, 255);

    $result = Database::insert
    (
      'notes',
      array('title' => $title, 'text' => $text)
    );
  }
}

if (!$result) {
  http_response_code(400);
}