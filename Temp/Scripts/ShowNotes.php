<?php

// Initialize our environment
require 'Initialize.php';

// For this app sample we don't want to store more than 50 notes
$total = Database::getValue('SELECT COUNT(*) from notes');
if ($total >= 50) {
  Database::exec("DELETE FROM notes ORDER BY id ASC LIMIT 49");
}

// Retrieve all the available notes in database
$results = Database::getResults('SELECT * FROM notes ORDER by id DESC');

// And output as a JSON array suitable for the Report control
header('Content-Type: application/json');

// No matter if results are empty: the app understand that no notes found
echo json_encode($results);

exit;