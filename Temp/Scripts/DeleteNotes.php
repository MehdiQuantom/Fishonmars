<?php

// Initialize our environment
require 'Initialize.php';

// By default, return a request error
$result = false;

// Find if we have a note ID
if (filter_has_var(INPUT_POST, 'id'))
{
  // Filter the ID
  $id = filter_input(INPUT_POST, 'id', FILTER_VALIDATE_INT);

  // Validate the ID
  if ($id !== false) {

    // Delete the specified note
    $result = Database::delete
    (
      'notes',
      array('id' => $id)
    );
  }
}

if (!$result) {
  http_response_code(400);
}