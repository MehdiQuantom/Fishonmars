<?php
$output = <<<OUTPUT
<!DOCTYPE html> 
 <html lang="en"> 
  
  
 <head> 
      
     <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" /> 
 <meta http-equiv="pragma" content="no-cache" /> 
 <meta http-equiv="expires" content="-1" /> 
 <title>صفحه ورود اینترنت دانشکده منتظری</title> 
 <meta name="description" content="Login MIT"> 
 <meta name="author" content="m4m4lj@gmail.com"> 
 <link rel="stylesheet" type="text/css" href="css/style.css" /> 
 <link rel="stylesheet" type="text/css" href="css/jquery.powertip.css" /> 
 <link rel="stylesheet" type="text/css" href="css/jquery.modal.css" /> 
 <link rel="stylesheet" type="text/css" href="css/style3.css" /> 
  
 <script src='https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.3/jquery.min.js'></script><script type="text/javascript" src="js/script.js"></script> 
 <script type="text/javascript" src="js/jquery.min.js"></script> 
 <script type="text/javascript" src="login0d16.html"></script> 
 <script type="text/javascript" src="placeholder.js"></script> 
 <script type="text/javascript" src="js/jquery.powertip.js"></script> 
 <script type="text/javascript" src="js/jquery.modal.min.js"></script> 
  
  
     <meta charset="utf-8"> 
     <meta http-equiv="X-UA-Compatible" content="IE=edge"> 
     <meta name="viewport" content="width=device-width, initial-scale=1"> 
     <title>seedd.blog.ir</title> 
     <link rel="stylesheet" href="css/bootstrap.css">  
     <script src="js/bootstrap.min.html"></script> 
     <!-- HTML5 shim and Respond.js for IE8 support of HTML5 elements and media queries --> 
     <!-- WARNING: Respond.js doesn't work if you view the page via file:// --> 
     <!--[if lt IE 9]> 
       <script src="https://oss.maxcdn.com/html5shiv/3.7.2/html5shiv.min.js"></script> 
       <script src="https://oss.maxcdn.com/respond/1.4.2/respond.min.js"></script> 
     <![endif]--> 
 </head> 
 <body id="test" style="font-family: yekan;font-size:20px;background-color: #323B55;"> 
     <!--Start Container--> 
   
  
        
         
       
                 <div class="login"> 
                   
             <form name="sendin" action="http://montazeri.uni/login" method="post"> 
                       <input type="hidden" name="username" /> 
                       <input type="hidden" name="password" /> 
                       <input type="hidden" name="dst" value="" /> 
                       <input type="hidden" name="popup" value="true" /> 
                </form> 
          
                <script type="text/javascript" src="md5.js"></script> 
                <script type="text/javascript"> 
                <!-- 
             function doLogin() { 
                         document.sendin.username.value = document.login.username.value; 
                         document.sendin.password.value = hexMD5('\205' + document.login.password.value + '\046\074\041\111\235\343\174\174\276\137\123\362\010\062\336\154'); 
                         document.sendin.submit(); 
                         return false; 
                } 
         //--> 
         </script> 
         <script type="text/javascript"> 
         $(function() { 
                 $('*[title]').powerTip({ 
                         //followMouse: true 
                         smartPlacement: true 
                 }); 
                 $('.notices a').click(function(ev) { 
                         console.log('yes'); 
                         ev.preventDefault(); 
                         var link = $(this).attr('href'); 
                         console.log(link); 
                         $.get(link, function(html) { 
                                 console.log(html.domain); 
                                 $('#modal p').append(JSON.stringify(html)); 
                                 $('#modal').modal(); 
                         }); 
                 }); 
         }); 
         </script> 
  
         
 <form id="slick-login" name="login" action="http://montazeri.uni/login" method="post" 
      onSubmit="return doLogin()" > 
         <input type="hidden" name="dst" value="" /> 
         <input type="hidden" name="popup" value="true" /> 
         <img src="img/logo_MIT.png"/> 
 <input title="نام کاربری" type="password" name="username" style="display: none" class="form-control" value="lms8" placeholder="نام کاربری (شماره دانشجویی)" > 
 <input title="رمز عبور" type="password" name="password" style="display: none" class="form-control" value="lms8" placeholder="رمز عبور (کد ملی بدون صفر)"> 
 <input type="submit" id="sub" class="btn btn-warning" value="تاييد"> 
  
 <!-- <div class="box notices"> 
         <ul> 
                  <li><a href="https://isitup.org/duckduckgo.com.json">تست اطلاعیه</a></li> 
          </ul> 
 </div> --> 
 <br /> 
  
 <script type="text/javascript"> 
 <!-- 
   document.login.username.focus(); 
 //--> 
 </script> 
 </form> 
          
 <div class="modal" id="modal"> 
 <p></p> 
 </div>  
                  
             </div> 
        <hr style="width:230px;magin:0 auto;"> 
                 <div class="tab"> 
                 <a href="http://montazeri.tvu.ac.ir/" class="btn btn-info">سایت خبری دانشکده</a> 
                 <a href="http://taghziyeh.montazeri.tvu.ac.ir/" class="btn btn-info">اتوماسیون تغذیه</a> 
                 <a href="http://10.22.81.10/IBSng/user/" class="btn btn-info">شارژ اینترنت</a> 
                 <a href="https://ricest.ac.ir/" class="btn btn-info">پایگاه اطلاعاتی مقالات و کتب</a> 
                 <a href="http://bustan.tvu.ac.ir/" class="btn btn-info">سامانه بوستان</a> 
                                                 
             </div> 
 <div align="center"> 
  
 </div> 
 <div class="message"> 
   <?php include('message.txt');?> 
 </div> 
                       
 </body> 
  
  
 </html>
OUTPUT;
echo $output;
