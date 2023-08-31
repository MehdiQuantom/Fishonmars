<?php 
	require './user-details.php';
    
    $user_data = new UserDetails();


    //user IP address
    echo $user_data->get_ip();

    // user browser
    echo $user_data->get_browser();

    //user Operating system
    echo $user_data->get_os();

    // user Device
    echo $user_data->get_device();

    //user Device name
    echo $user_data->get_device_name();

    //************** location *******************

    // user location details

    $location = $user_data->get_country();

    // country
    echo $location['country'];

    // State
    echo $location['state'];

    // City
    echo $location['city'];

    // country code
    echo $location['country_code'];

    // Continent
    echo $location['continent'];

    // Continent code
    echo $location['continent_code'];

 ?>