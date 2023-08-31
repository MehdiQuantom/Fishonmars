<!DOCTYPE html>
<html>
<head>
    <title>User Details</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
</head>

<style>
    #myTable{
         font-family: 'helvetica neue',helvetica,arial,'lucida grande',sans-serif;
         border-collapse: collapse;
    } 
    #myTable td {
        border: solid 1px #e4e4e4;
        padding: 10px;
        font-size: 15px;
        text-align: left;
        font-weight: bold;
        color: #7d7d7d;
    }
    #myTable td > div{
        font-weight: normal;
    }
    #myTable tr{
     background-color: #fbfbfb;
     color: #000000;
    }
    #myTable tr:hover{
     background-color: #FFFFFF;
     color: #000000;
    }
</style>
<body>

<?php

    require './user-details.php';
    
    $user_data = new UserDetails();
    $location = $user_data->get_country();

    echo '<table id="myTable" width="100%">
    <tbody>
    <tr>
    <td>Country</td>
    <td><div>'.$location['country'].'</div></td>
    </tr>

    <tr>
    <td>State</td>
    <td><div>'.$location['state'].'</div></td>
    </tr>

    <tr>
    <td>City</td>
    <td><div>'.$location['city'].'</div></td>
    </tr>

    <tr>
    <td>country code</td>
    <td><div>'.$location['country_code'].'</div></td>
    </tr>

    <tr>
    <td>Continent</td>
    <td><div>'.$location['continent'].'</div></td>
    </tr>

    <tr>
    <td>Continent code</td>
    <td><div>'.$location['continent_code'].'</div></td>
    </tr>

    <tr>
    <td>IP Address</td>
    <td><div>'.$user_data->get_ip().'</div></td>
    </tr>

    <tr>
    <td>Browser</td>
    <td><div>'.$user_data->get_browser().'</div></td>
    </tr>

    <tr>
    <td>Operating system</td>
    <td><div>'.$user_data->get_os().'</div></td>
    </tr>

    <tr>
    <td>Device</td>
    <td><div>'.$user_data->get_device().'</div></td>
    </tr>

    <tr>
    <td>Device name</td>
    <td><div>'.$user_data->get_device_name().'</div></td>
    </tr>

    </tbody>
    </table>';
?>

</body>
</html>