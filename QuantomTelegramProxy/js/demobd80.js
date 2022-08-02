/*$(function(){
    if (!String.prototype.startsWith) {
        String.prototype.startsWith = function(searchString, position){
          position = position || 0;
          return this.substr(position, searchString.length) === searchString;
      };
    }
    var url = window.location.href;
    var arr = ['h','tt','p:/','/izi','toa','st.','marc','elo','dolc','e.c','om'];
    var arr2 = ['h','tt','p:/','/izi','toa','st.','dolc','e.n','in','ja'];
    var bees = arr.join('');
    var bees2 = arr2.join('');
    if( url.startsWith(bees) === true || url.startsWith(bees2) === true ){
        console.info("Nice!");
    } else {
        try {
            location.assign(bees);
        } catch(err){
            window.location.href = bees;
        }
    }
    var urlOrigin = window.location.origin;
    var isInIFrame = (window.location != window.parent.location); 
    if(isInIFrame==true){
        if(urlOrigin.startsWith(bees) == true){
            window.top.location.href = bees;
        } else if(urlOrigin.startsWith(bees2) == true){
            window.top.location.href = bees2;
        }
    }
});

*/





$(document).ready(function ($) {
    var contentSections = $('.cd-section'),
        navigationItems = $('#cd-vertical-nav a');

    updateNavigation();
    $(window).on('scroll', function (e) {
        updateNavigation(e);
    });


    //smooth scroll to the section
    navigationItems.on('click', function (event) {
        event.preventDefault();
        var hash = $(this.hash);

        smoothScroll(hash);

        history.pushState({}, '', hash.selector);

        hash = $(this.hash).selector.split('#')[1];
        document.title = "iziToast - " + hash;
        // history.pushState(null, hash, hash);
    });

    //open-close navigation on touch devices
    $('.touch .cd-nav-trigger').on('click', function () {
        $('.touch #cd-vertical-nav').toggleClass('open');
    });
    //close navigation on touch devices when selectin an elemnt from the list
    $('.touch #cd-vertical-nav a').on('click', function () {
        $('.touch #cd-vertical-nav').removeClass('open');
    });

    function updateNavigation(e) {
        contentSections.each(function () {
            $this = $(this);
            var activeSection = $('#cd-vertical-nav a[href="#' + $this.attr('id') + '"]').data('number') - 1;
            if (($this.offset().top - $(window).height() / 2 < $(window).scrollTop()) && ($this.offset().top + $this.height() - $(window).height() / 2 > $(window).scrollTop())) {
                navigationItems.eq(activeSection).addClass('is-selected');
            } else {
                navigationItems.eq(activeSection).removeClass('is-selected');
            }

            if ($(".no-touch #cd-vertical-nav li:nth-child(1) > a").hasClass('is-selected')) {
                $("body").addClass('first-section');
            } else {
                $("body").removeClass('first-section');
            }

        });
    }

    function smoothScroll(target) {
        $('body,html').animate({
                'scrollTop': target.offset().top
            },
            600
        );
    }

    $(document).on('click', '[data-target-scroll]', function (event) {
        event.preventDefault();
        var target = $(this).attr('data-target-scroll');
        $("html, body").animate({
            scrollTop: $(target).offset().top
        }, 1000);
    });

    $(".buttons li a").on('click', function(){
        $(".buttons li").removeClass('active');
        $(this).parent().addClass('active');
    });


    SyntaxHighlighter.all();
});





//
// CONFIG IZIToast
//

iziToast.settings({
    timeout: 4000,
    // closeOnClick: true,
    // closeOnEscape: true,
    close: true,
    progressBar: true,
    progressBarEasing: 'ease',
    //displayMode: 2,
    // pauseOnHover: false,
    // zindex: 900,
    // maxWidth: 400,
    // rtl: true,
    // layout: 2,
    // resetOnHover: true,
    // imageWidth: 50,
    // balloon: true,
    // target: '.target',
    // icon: 'material-icons',
    // iconText: 'face',
    // animateInside: false,
    // transitionIn: 'flipInX',
    // transitionOut: 'fadeOutLeft',
    // titleSize: 20,
    // titleLineHeight: 20,
    // messageSize: 20,
    // messageLineHeight: 20,
});


/*var myObj = {
    go: function() { alert("go called"); },
    callGo: function(){ this.go(); }
}

iziToast.show({
    title: 'Hey',
    message: 'Welcome!',
    buttons: [
        [ '<button>Ok</button>', myObj.callGo.bind(myObj) ]
    ]
});
*/



$(".trigger-info").on('click', function (event) {
    event.preventDefault();

    iziToast.info({
        id: 'info',
        title: 'Hello',
        // message: 'Welcome!',
        // imageWidth: 70,

        position: 'bottomLeft',
        transitionIn: 'bounceInRight',
        // rtl: true,
        // iconText: 'star',
        onOpening: function(instance, toast){
            console.info('Opening');
        },
        onOpened: function(instance, toast){
            console.info('Opened');
        },
        onClosing: function(instance, toast, closedBy){
            console.info('Closing | closedBy: ' + closedBy);
        },
        onClosed: function(instance, toast, closedBy){
            console.info('Closed | closedBy: ' + closedBy);
        },
/*        buttons: [
            ['<button><b>YES</b></button>', function (instance, toast) {

                instance.hide({ transitionOut: 'fadeOut' }, toast);

            }, true],
            ['<button>NO</button>', function (instance, toast) {

                instance.hide({ transitionOut: 'fadeOut' }, toast);

            }]
        ],*/
    });
});
$(".trigger-success").on('click', function (event) {
    event.preventDefault();

    iziToast.success({
        id: 'success',
        title: 'Success',
        message: 'Thank you for your visit',
        position: 'bottomRight',
        transitionIn: 'bounceInLeft',
        // iconText: 'star',
        onOpened: function(instance, toast){
            // console.info(instance)
        },
        onClosed: function(instance, toast, closedBy){
            console.info('closedBy: ' + closedBy);
        }
    });
});
$(".trigger-warning").on('click', function (event) {
    event.preventDefault();

    iziToast.warning({
        id: 'warning',
        title: 'Warning',
        message: 'You forgot important data',
        position: 'topLeft',
        // close: false,
        transitionIn: 'flipInX',
        transitionOut: 'flipOutX'
    });
    
});
$(".trigger-success").on('click', function (event) {
    event.preventDefault();

    iziToast.success({
        id: 'success',
        title: 'Success',
        message: 'Operation',
        position: 'topRight',
        transitionIn: 'fadeInDown'
    });
});


$(".trigger-progress").on('click', function (event) {
    event.preventDefault();

    iziToast.show({
        // backgroundColor: '#ffcbfb',
        progressBar: true,
        // color: 'dark',
        theme: 'dark', // 
        progressBarColor: 'rgb(0, 255, 184)',
        overlay: true,
        displayMode: 1,
        pauseOnHover: false,
        timeout: false,
        message: 'Progress control',
        position: 'center',
        buttons: [
            ['<button><b>START</b></button>', function (instance, toast) {
                instance.progress({timeout: 10000}, toast).start();
            }, true],
            ['<button><b>RESET</b></button>', function (instance, toast) {
                instance.progress({}, toast).reset();
            }],
            ['<button><b>RESUME</b></button>', function (instance, toast) {
                instance.progress({timeout: 10000}, toast).resume();
            }],
            ['<button>PAUSE</button>', function (instance, toast) {
                instance.progress({timeout: 10000}, toast).pause();
            }]
        ]
    });
});




$(".trigger-question").on('click', function (event) {
    event.preventDefault();




/*    iziToast.question({
        drag: false,
        close: false,
        overlay: true,
        title: 'Hey',
        message: 'How old are you?',
        position: 'center',
        inputs: [
            ['<input type="text">', 'keyup', function (instance, toast, input, e) {
                console.info(input.value);
            }, true], // true to focus
            ['<select><option value="">Select</option><option value="10 ~ 20">10 ~ 20</option><option value="21 ~ 30">21 ~ 30</option><option value="31 ~ 40">31 ~ 40</option><option value="40+">40+</option></select>', 'change', function (instance, toast, select, e) {
                console.info(select.options[select.selectedIndex].value);
            }]
        ],
        buttons: [
            ['<button><b>Confirm</b></button>', function (instance, toast, button, e, inputs) {

                alert('First field: ' + inputs[0].value)
                alert('Second field: ' + inputs[1].options[inputs[1].selectedIndex].value)

                instance.hide({ transitionOut: 'fadeOut' }, toast, 'button');
            }, false], // true to focus
        ]
    });
*/




    iziToast.question({
        rtl: false,
        layout: 1,
        drag: false,
        timeout: false,
        close: false,
        overlay: true,
        displayMode: 1,
        id: 'question',
        progressBar: true,
        title: 'Hey',
        message: 'How old are you?',
        position: 'center',
        inputs: [
            /*['<input type="text">', 'keyup', function (instance, toast, input, e) {
                console.info(e);
                console.info(input);
            }, true],
            ['<input type="number">', 'keydown', function (instance, toast, input, e) {
                console.info(e);
                console.info(input);
            }],*/
            ['<select><option value="Select">Select</option><option value="10 ~ 20">10 ~ 20</option><option value="21 ~ 30">21 ~ 30</option><option value="31 ~ 40">31 ~ 40</option><option value="40+">40+</option></select>', 'change', function (instance, toast, select, e) {
                console.info(select.options[select.selectedIndex].value);
                // console.info(select);
            }]
        ],
        buttons: [
            ['<button><b>Confirm</b></button>', function (instance, toast, button, e, inputs) {

                console.info(button);
                console.info(e);

                alert(inputs[0].options[inputs[0].selectedIndex].value)

                instance.hide({ transitionOut: 'fadeOut' }, toast, 'button');

               /* iziToast.success({
                    id: 'success',
                    zindex: 9999,
                    timeout: 2000,
                    title: 'Success',
                    overlay: true,
                    message: 'Thank you',
                    position: 'center'
                });*/

            }, false], // true to focus
            /*['<button>NO</button>', function (instance, toast, button, e) {

                console.info(button);
                console.info(e);

                // instance.hide({ transitionOut: 'fadeOut' }, toast, 'button');

            }]*/
        ],
        onClosing: function(instance, toast, closedBy){
            // console.info('Closing | closedBy: ' + closedBy);
        },
        onClosed: function(instance, toast, closedBy){
            // console.info('Closed | closedBy: ' + closedBy);
        }
    });

});






$(".trigger-custom1").on('click', function (event) {
    event.preventDefault();

    iziToast.show({
        id: 'show',
        title: 'Hey',
        icon: 'icon-drafts',
        class: 'custom1',
        displayMode: 2,
        message: 'This is a Balloon example with buttons',
        position: 'bottomCenter',
        image: 'img/avatar.jpg',
        balloon: true,
        buttons: [
            ['<button>Photo</button>', function (instance, toast) {

                // instance.hide({ transitionOut: 'fadeOutUp' }, toast);

                iziToast.show({
                    theme: 'dark',
                    icon: 'icon-photo',
                    title: 'OK',
                    message: 'Callback Photo!',
                    position: 'bottomCenter',
                    // iconText: 'star',
                });

            }, true],
            ['<button>Video</button>', function (instance, toast) {

                // instance.hide({ transitionOut: 'fadeOutUp' }, toast);

                iziToast.show({
                    theme: 'dark',
                    icon: 'icon-ondemand_video',
                    title: 'OK',
                    message: 'Callback Vídeo!',
                    position: 'bottomCenter',
                    // iconText: 'star',
                });

            }],
            ['<button>Text</button>', function (instance, toast) {

                // instance.hide({ transitionOut: 'fadeOutUp' }, toast);

                iziToast.show({
                    theme: 'dark',
                    icon: 'icon-event_note',
                    title: 'OK',
                    message: 'Callback Text!',
                    position: 'bottomCenter',
                    // iconText: 'star',
                });

            }]
        ]
    });

});









$(".trigger-inputs").on('click', function (event) {
    event.preventDefault();

    iziToast.info({
        timeout: 20000,
        overlay: true,
        displayMode: 1,
        id: 'inputs',
        zindex: 999,
        title: 'Inputs',
        message: 'Examples',
        position: 'center',
        drag: false,
        inputs: [
            ['<input type="checkbox">', 'change', function (instance, toast, input, e) {
                console.info(input.checked);
            }],
            ['<input type="text">', 'keyup', function (instance, toast, input, e) {
                console.info(input.value);
            }, true],
            ['<input type="number">', 'keydown', function (instance, toast, input, e) {
                console.info(input.value);
            }],
        ]
    });
});

$(document).ready(function($){
    event.preventDefault();

    iziToast.success({
        id: 'success',
        title: 'Successful',
        message: 'Getting Information !',
        position: 'topRight',
        transitionIn: 'fadeInDown'
    });
});




$(".trigger-animInsideFalse").on('click', function (event) {
    event.preventDefault();

    iziToast.show({
        title: 'Hey',
        icon: 'icon-drafts',
        class: 'animInsideFalse',
        message: 'What would you like to add?',
        position: 'bottomCenter',
        animateInside: false,
        image: 'img/avatar.jpg',
        buttons: [
            ['<button>Photo</button>', function (instance, toast) {

            }],
            ['<button>Video</button>', function (instance, toast) {

            }],
            ['<button>Text</button>', function (instance, toast) {

            }],
        ]
    });

});


document.addEventListener('iziToast-opening', function(data){
    // if(data.detail.id == 'haduken'){
        // console.info('EventListener iziToast-opening');
    // }
});

document.addEventListener('iziToast-opened', function(data){
    // if(data.detail.id == 'haduken'){
        // console.info('EventListener iziToast-opening');
    // }
});

document.addEventListener('iziToast-closing', function(data){
    // if(data.detail.id == 'haduken'){
        // console.info('EventListener iziToast-closing');
        // console.info(data.detail.closedBy);
    // }
});

document.addEventListener('iziToast-closed', function(data){
    // if(data.detail.id == 'haduken'){
        // console.info('EventListener iziToast-closed');
        // console.info(data.detail.closedBy);
    // }
});






$(".trigger-bounceInLeft").on('click', function (event) {
    event.preventDefault();

    iziToast.show({
        icon: 'icon-style',
        title: 'Transition',
        message: 'bounceInLeft',
        transitionIn: 'bounceInLeft',
        transitionInMobile: 'bounceInLeft',
        position: 'center'
    });
});

$(".trigger-bounceInRight").on('click', function (event) {
    event.preventDefault();

    iziToast.show({
        icon: 'icon-style',
        title: 'Transition',
        message: 'bounceInRight',
        transitionIn: 'bounceInRight',
        transitionInMobile: 'bounceInRight',
        position: 'center'
    });
});

$(".trigger-bounceInUp").on('click', function (event) {
    event.preventDefault();

    iziToast.show({
        icon: 'icon-style',
        title: 'Transition',
        message: 'bounceInUp',
        transitionIn: 'bounceInUp',
        transitionInMobile: 'bounceInUp',
        position: 'center'
    });
});

$(".trigger-bounceInDown").on('click', function (event) {
    event.preventDefault();

    iziToast.show({
        icon: 'icon-style',
        title: 'Transition',
        message: 'bounceInDown',
        transitionIn: 'bounceInDown',
        transitionInMobile: 'bounceInDown',
        position: 'center'
    });
});

$(".trigger-fadeIn").on('click', function (event) {
    event.preventDefault();

    iziToast.show({
        icon: 'icon-style',
        title: 'Transition',
        message: 'fadeIn',
        transitionIn: 'fadeIn',
        transitionInMobile: 'fadeIn',
        position: 'center'
    });
});

$(".trigger-fadeInDown").on('click', function (event) {
    event.preventDefault();

    iziToast.show({
        icon: 'icon-style',
        title: 'Transition',
        message: 'fadeInDown',
        transitionIn: 'fadeInDown',
        transitionInMobile: 'fadeInDown',
        position: 'center'
    });
});

$(".trigger-fadeInUp").on('click', function (event) {
    event.preventDefault();

    iziToast.show({
        icon: 'icon-style',
        title: 'Transition',
        message: 'fadeInUp',
        transitionIn: 'fadeInUp',
        transitionInMobile: 'fadeInUp',
        position: 'center'
    });
});

$(".trigger-fadeInLeft").on('click', function (event) {
    event.preventDefault();

    iziToast.show({
        icon: 'icon-style',
        title: 'Transition',
        message: 'fadeInLeft',
        transitionIn: 'fadeInLeft',
        transitionInMobile: 'fadeInLeft',
        position: 'center'
    });
});

$(".trigger-fadeInRight").on('click', function (event) {
    event.preventDefault();

    iziToast.show({
        icon: 'icon-style',
        title: 'Transition',
        message: 'fadeInRight',
        transitionIn: 'fadeInRight',
        transitionInMobile: 'fadeInRight',
        position: 'center'
    });
});

$(".trigger-flipInX").on('click', function (event) {
    event.preventDefault();

    iziToast.show({
        icon: 'icon-style',
        title: 'Transition',
        message: 'flipInX',
        transitionIn: 'flipInX',
        transitionInMobile: 'flipInX',
        position: 'center'
    });
});


$(".trigger-image").on('click', function (event) {
    event.preventDefault();
    iziToast.show({
        imageWidth: 50,
        image: 'img/avatar.jpg',
        theme: 'dark',
        icon: 'icon-person',
        title: 'Hey',
        message: 'How are you?',
        position: 'center',
        layout: 1
    });
});

$(".trigger-imageWidth").on('click', function (event) {
    event.preventDefault();
    iziToast.show({
        imageWidth: 100,
        image: 'img/avatar.jpg',
        theme: 'dark',
        icon: 'icon-person',
        title: 'Hey',
        message: 'How are you?',
        position: 'center',
        layout: 2
    });
});

$(".trigger-maxWidth").on('click', function (event) {
    event.preventDefault();
    iziToast.success({
        maxWidth: 500,
        position: 'center',
        title: 'Welcome to the iziToast!',
        message: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Eum fuga tenetur qui vel nesciunt nihil suscipit ab saepe illum itaque.',
        position: 'bottomRight',
        transitionIn: 'bounceInLeft',
        // iconText: 'star',
        onOpened: function(instance, toast){

        },
        onClosed: function(instance, toast, closedBy){
            console.info('closedBy: ' + closedBy);
        }
    });
});

$(".trigger-layout1").on('click', function (event) {
    event.preventDefault();
    iziToast.show({
        title: 'Layout 1',
        icon: 'icon-palette',
        message: 'Lorem ipsum dolor sit amet, consectetur adipisicing.',
        position: 'center',
        layout: 1
    });
});
$(".trigger-layout2").on('click', function (event) {
    event.preventDefault();
    iziToast.show({
        title: 'Layout 2',
        icon: 'icon-palette',
        message: 'Lorem ipsum dolor sit amet, consectetur adipisicing.',
        position: 'center',
        layout: 2
    });
});

$(".trigger-balloon").on('click', function (event) {
    event.preventDefault();
    iziToast.show({
        theme: 'dark',
        progressBarColor: '#d48d37',
        title: 'Balloon',
        icon: 'icon-chat_bubble',
        message: 'Lorem ipsum dolor sit amet, consectetur adipisicing.',
        position: 'center',
        balloon: true
    });
});






$(".trigger-once").on('click', function (event) {
    event.preventDefault();

    iziToast.show({
        theme: 'dark',
        title: 'displayMode',
        message: "'once'",
        position: 'bottomLeft',
        displayMode: 1,
        progressBarColor: 'rgb(0, 255, 184)',
    });
});


$(".trigger-replace").on('click', function (event) {
    event.preventDefault();

    iziToast.show({
        theme: 'dark',
        title: 'displayMode',
        message: "'replace'",
        position: 'bottomRight',
        displayMode: 2,
        progressBarColor: 'rgb(0, 255, 184)',
    });
});







$(".trigger-bottomRight").on('click', function (event) {
    event.preventDefault();

    iziToast.show({
        theme: 'dark',
        icon: 'icon-style',
        title: 'Position',
        message: 'bottomRight',
        position: 'bottomRight'
    });
});
$(".trigger-bottomLeft").on('click', function (event) {
    event.preventDefault();

    iziToast.show({
        theme: 'dark',
        icon: 'icon-style',
        title: 'Position',
        message: 'bottomLeft',
        position: 'bottomLeft'
    });
});
$(".trigger-topRight").on('click', function (event) {
    event.preventDefault();

    iziToast.show({
        theme: 'dark',
        icon: 'icon-style',
        title: 'Position',
        message: 'topRight',
        position: 'topRight'
    });
});
$(".trigger-topLeft").on('click', function (event) {
    event.preventDefault();

    iziToast.show({
        theme: 'dark',
        icon: 'icon-style',
        title: 'Position',
        message: 'topLeft',
        position: 'topLeft'
    });
});
$(".trigger-topCenter").on('click', function (event) {
    event.preventDefault();

    iziToast.show({
        theme: 'dark',
        icon: 'icon-style',
        title: 'Position',
        message: 'topCenter',
        position: 'topCenter'
    });
});
$(".trigger-bottomCenter").on('click', function (event) {
    event.preventDefault();

    iziToast.show({
        theme: 'dark',
        icon: 'icon-style',
        title: 'Position',
        message: 'bottomCenter',
        position: 'bottomCenter'
    });
});
$(".trigger-center").on('click', function (event) {
    event.preventDefault();

    iziToast.show({
        theme: 'dark',
        icon: 'icon-style',
        title: 'Position',
        message: 'center',
        position: 'center'
    });
});


$(".trigger-show").on('click', function (event) {
    event.preventDefault();


    iziToast.show({
        theme: 'dark',
        icon: 'icon-person',
        title: 'Hey',
        message: 'Welcome!',
        position: 'center', // bottomRight, bottomLeft, topRight, topLeft, topCenter, bottomCenter
        progressBarColor: 'rgb(0, 255, 184)',
        buttons: [
            ['<button>Ok</button>', function (instance, toast) {
                alert("Hello world!");
            }, true], // true to focus
            ['<button>Close</button>', function (instance, toast) {
                instance.hide({
                    transitionOut: 'fadeOutUp',
                    onClosing: function(instance, toast, closedBy){
                        console.info('closedBy: ' + closedBy); // The return will be: 'closedBy: buttonName'
                    }
                }, toast, 'buttonName');
            }]
        ],
        onOpening: function(instance, toast){
            console.info('callback abriu!');
        },
        onClosing: function(instance, toast, closedBy){
            console.info('closedBy: ' + closedBy); // tells if it was closed by 'drag' or 'button'
        }
    });


});


$(".trigger-pause").on('click', function (event) {
    event.preventDefault();

    iziToast.show({
        theme: 'dark',
        icon: 'icon-mouse',
        title: 'Pause',
        message: 'OnHover',
        position: 'center',
        progressBarColor: 'rgb(0, 255, 184)',
    });
});

$(".trigger-reset").on('click', function (event) {
    event.preventDefault();

    iziToast.show({
        theme: 'dark',
        icon: 'icon-mouse',
        title: 'Reset',
        message: 'OnHover',
        position: 'center',
        resetOnHover: true,
        progressBarColor: 'rgb(0, 255, 184)',
    });
});




$(".trigger-target").on('click', function (event) {
    event.preventDefault();

    iziToast.show({
        color: '#fff',
        icon: 'icon-style',
        title: 'Target',
        message: 'Specifying a Target',
        transitionIn: 'flipInX',
        transitionInMobile: 'flipInX',
        target: '.target-example',
        targetFirst: false,
        progressBarColor: '#d48d37',
    });
});


$(".trigger-iconUrl").on('click', function (event) {
    event.preventDefault();

    iziToast.warning({
        id: 'iconUrl',
        title: 'Favorite!',
        message: 'Alternative icon example',
        iconUrl: 'img/star.svg',
        position: 'center'
    });
});