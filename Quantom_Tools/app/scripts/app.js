/*!
 * This file is part of App Builder
 * For licenses information see App Builder help
 * ©2019 DecSoft App Builder - https://www.davidesperalta.com/
 */

window.App = {};

window.App.Utils = (function () {

  var
    lastSound = 0;

  return {

    lowerCase: function (text) {
      return text.toLowerCase();
    },
    
    upperCase: function (text) {
      return text.toUpperCase();
    },    

    strLen: function (text) {
      return text.length;
    },

    trimStr: function (text) {
      return text.trim();
    },

    strSearch: function (text, query) {
      return text.search(query);
    },

    splitStr: function (text, separator) {
      return text.split(separator);
    },

    subStr: function (text, start, count) {
      return text.substr(start, count);
    },

    strReplace: function (text, from, to) {
      return text.replace(from, to);
    },

    strReplaceAll: function (text, from, to) {
      return text.split(from).join(to);
    },

    playSound: function (mp3Url, oggUrl) {
      if (lastSound === 0) {
        lastSound = new Audio();
      }
      if (lastSound.canPlayType('audio/mpeg')) {
        lastSound.src = mp3Url;
        lastSound.type = 'audio/mpeg';
      } else {
        lastSound.src = oggUrl;
        lastSound.type = 'audio/ogg';
      }
      lastSound.play();
    },

    stopSound: function () {
      lastSound.pause();
      lastSound.currentTime = 0.0;
    },

    sleep: function (ms) {
      var
        start = new Date().getTime();
      for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > ms){
          break;
        }
      }
    },
    
    parseViewParams: function (params) {
      if (angular.isUndefined(params)) {
        return {};
      }
      var 
        result = {},
        pairs = params.split('&');
      pairs.forEach(function(pair) {
        pair = pair.split('=');
        result[pair[0]] = decodeURIComponent(pair[1] || '');
      });
      return JSON.parse(JSON.stringify(result));
    },
    
    transformRequest: function (kind) {
      if (kind === 'json') {
        return function(data) { 
          return JSON.stringify(data); 
        };
      } else if (kind === 'form') {
        return function(data) { 
          var 
            frmData = []; 
          angular.forEach(data, function(value, key) { 
            frmData.push(encodeURIComponent(key) + '=' + encodeURIComponent(value)); 
          }); 
          return frmData.join('&'); 
        };
      } else if (kind === 'data') {
        return function(data) { 
          var 
            frmData = new FormData(); 
          angular.forEach(data, function(value, key) { 
            frmData.append(key, value); 
          }); 
          return frmData; 
        };      
      }
    }
  };
})();

window.App.Modal = (function () {

  var
    stack = [],
    current = 0;

  return {

    insert: function (name) {
      current = stack.length;
      stack[current] = {};
      stack[current].name = name;
      stack[current].instance = null;
      return stack[current];
    },

    getCurrent: function () {
      if (stack[current]) {
        return stack[current].instance;
      } else {
        return null;
      }
    },
    
    removeCurrent: function () {
      stack.splice(current, 1);
      current = current - 1;
      current = (current < 0) ? 0 : current;
    },

    closeAll: function () {
      for (var i = stack.length-1; i >= 0; i--) {
        stack[i].instance.dismiss();
      }
      stack = [];
      current = 0;
    }
  };
})();

window.App.Debugger = (function () {

  return {

    exists: function () {
      return (typeof window.external === 'object')
       && ('hello' in window.external);
    },

    log: function (text, aType, lineNum) {
      if (window.App.Debugger.exists()) {
        window.external.log('' + text, aType || 'info', lineNum || 0);
      } else {
        console.log(text);
      }
    },

    watch: function (varName, newValue, oldValue) {
      if (window.App.Debugger.exists()) {
        if (angular.isArray(newValue)) {
          window.external.watch('', varName, newValue.toString(), 'array');
        } else if (angular.isObject(newValue)) {
          angular.forEach(newValue, function (value, key) {
            if (!angular.isFunction (value)) {
              try {
                window.external.watch(varName, key, value.toString(), typeof value);
              } 
              catch(exception) {}
            }
          });
        } else if (angular.isString(newValue) || angular.isNumber(newValue)) {
          window.external.watch('', varName, newValue.toString(), typeof newValue);
        }
      }
    }
  };
})();

window.App.Module = angular.module
(
  'AppModule',
  [
    'ngAria',
    'ngRoute',
    'ngTouch',
    'ngSanitize',
    'blockUI',
    'chart.js',
    'ngOnload',
    'ui.bootstrap',
    'angular-canvas-gauge',
    'com.2fdevs.videogular',
    'com.2fdevs.videogular.plugins.controls',
    'AppCtrls'
  ]
);

window.App.Module.run(function () {
  if (window.FastClick) {
    window.FastClick.attach(window.document.body);
  }
});

window.App.Module.directive('ngScroll',
[
  '$parse',

  function ($parse) {
    return {
      restrict: 'A',
      link: function ($scope, el, attrs) {
        el.bind('scroll', function (event) {
          var
            fn = $parse(attrs.ngScroll);
          fn($scope, {$event: event});
          $scope.$apply();
        });
      }
    };
  }
]);

window.App.Module.directive('ngImageLoad',
[
  '$parse',

  function ($parse) {
    return {
      restrict: 'A',
      link: function ($scope, el, attrs) {
        el.bind('load', function (event) {
          var 
            fn = $parse(attrs.ngImageLoad);
          fn($scope, {$event: event});
        });
      }
    };
  }
]);

window.App.Module.directive('stringToNumber', function() {
  return {
    require: 'ngModel',
    link: function(scope, element, attrs, ngModel) {
      ngModel.$parsers.push(function(value) {
        return '' + value;
      });
      ngModel.$formatters.push(function(value) {
        return parseFloat(value);
      });
    }
  };
});

window.App.Module.directive('ngImageError',
[
  '$parse',

  function ($parse) {
    return {
      restrict: 'A',
      link: function ($scope, el, attrs) {
        el.bind('error', function (event) {
          var 
            fn = $parse(attrs.ngImageError);
          fn($scope, {$event: event});
        });
      }
    };
  }
]);

window.App.Module.directive('ngContextMenu',
[
  '$parse',

  function ($parse) {
    return {
      restrict: 'A',
      link: function ($scope, el, attrs) {
        el.bind('contextmenu', function (event) {
          var
            fn = $parse(attrs.ngContextMenu);
          fn($scope, {$event: event});
        });
      }
    };
  }
]);

window.App.Module.directive('bindFile',
[
  function () {
    return {
      restrict: 'A',
      require: 'ngModel',
      link: function ($scope, el, attrs, ngModel) {
        el.bind('change', function (event) {
          ngModel.$setViewValue(event.target.files[0]);
          $scope.$apply();
        });

        $scope.$watch(function () {
          return ngModel.$viewValue;
        }, function (value) {
          if (!value) {
            el.val('');
          }
        });
      }
    };
  }
]);

window.App.Module.config
([
  '$compileProvider',

  function ($compileProvider) {
    $compileProvider.debugInfoEnabled(window.App.Debugger.exists());
    $compileProvider.imgSrcSanitizationWhitelist
     (/^\s*(https?|blob|ftp|mailto|file|tel|app|data|moz-extension|chrome-extension|ms-appdata|ms-appx-web):/);
  }
]);

window.App.Module.config
([
  '$httpProvider',

  function ($httpProvider) {
    if (!$httpProvider.defaults.headers.get) {
      $httpProvider.defaults.headers.get = {};
    }
    if (!$httpProvider.defaults.headers.post) {
      $httpProvider.defaults.headers.post = {};
    }
    $httpProvider.defaults.headers.get['Cache-Control'] = 'no-cache';
    $httpProvider.defaults.headers.get['If-Modified-Since'] = 'Mon, 26 Jul 1997 05:00:00 GMT';    
    $httpProvider.defaults.headers.post['Content-Type'] = undefined;
    $httpProvider.defaults.transformRequest.unshift(window.App.Utils.transformRequest('data'));
}]);

window.App.Module.config
([
  '$provide',

  function ($provide) {
    $provide.decorator('$exceptionHandler',
    ['$injector',
      function ($injector) {
        return function (exception, cause) {
          var
            $rs = $injector.get('$rootScope');

          if (!angular.isUndefined(cause)) {
            exception.message += ' (caused by "'+cause+'")';
          }

          $rs.App.LastError = exception.message;
          $rs.OnAppError();
          $rs.App.LastError = '';

          if (window.App.Debugger.exists()) {
            throw exception;
          } else {
            if (window.console) {
              window.console.error(exception);
            }
          }
        };
      }
    ]);
  }
]);

window.App.Module.config
([
  'blockUIConfig',

  function (blockUIConfig) {
    blockUIConfig.delay = 0;
    blockUIConfig.autoBlock = false;
    blockUIConfig.resetOnException = true;
    blockUIConfig.message = 'Please wait';
    blockUIConfig.autoInjectBodyBlock = false;
    blockUIConfig.blockBrowserNavigation = true;
  }
]);

window.App.Module.config
([
  '$routeProvider',

  function ($routeProvider) {
    $routeProvider.otherwise({redirectTo: "/" + window.App.Config.DefaultView})
    .when("/Login/:params*?", {controller: "LoginCtrl", templateUrl: "app/views/Login.html"})
    .when("/Main/:params*?", {controller: "MainCtrl", templateUrl: "app/views/Main.html"})
    .when("/Location/:params*?", {controller: "LocationCtrl", templateUrl: "app/views/Location.html"})
    .when("/Camera/:params*?", {controller: "CameraCtrl", templateUrl: "app/views/Camera.html"})
    .when("/Luncher/:params*?", {controller: "LuncherCtrl", templateUrl: "app/views/Luncher.html"})
    .when("/Globals/:params*?", {controller: "GlobalsCtrl", templateUrl: "app/views/Globals.html"})
    .when("/Find_Helium_Devices/:params*?", {controller: "Find_Helium_DevicesCtrl", templateUrl: "app/views/Find_Helium_Devices.html"})
    .when("/Video_Player/:params*?", {controller: "Video_PlayerCtrl", templateUrl: "app/views/Video_Player.html"})
    .when("/Barcode_Scanner/:params*?", {controller: "Barcode_ScannerCtrl", templateUrl: "app/views/Barcode_Scanner.html"})
    .when("/Barcode_Maker/:params*?", {controller: "Barcode_MakerCtrl", templateUrl: "app/views/Barcode_Maker.html"})
    .when("/PDF_Viewer/:params*?", {controller: "PDF_ViewerCtrl", templateUrl: "app/views/PDF_Viewer.html"});
  }
]);

window.App.Module.service
(
  'AppEventsService',

  ['$rootScope',

  function ($rootScope) {

    function setAppHideEvent() {
      window.document.addEventListener('visibilitychange', function (event) {
        if (window.document.hidden) {
          window.App.Event = event;
          $rootScope.OnAppHide();
          $rootScope.$apply();
        }
      }, false);
    }
    
    function setAppShowEvent() {
      window.document.addEventListener('visibilitychange', function (event) {
        if (!window.document.hidden) {
          window.App.Event = event;
          $rootScope.OnAppShow();
          $rootScope.$apply();
        }
      }, false);
    }    

    function setAppOnlineEvent() {
      window.addEventListener('online', function (event) {
        window.App.Event = event;
        $rootScope.OnAppOnline();
      }, false);
    }

    function setAppOfflineEvent() {
      window.addEventListener('offline', function (event) {
        window.App.Event = event;
        $rootScope.OnAppOffline();
      }, false);
    }

    function setAppResizeEvent() {
      window.addEventListener('resize', function (event) {
        window.App.Event = event;
        $rootScope.OnAppResize();
      }, false);
    }

    function setAppPauseEvent() {
      if (!window.App.Cordova) {
        document.addEventListener('pause', function (event) {
          window.App.Event = event;
          $rootScope.OnAppPause();
          $rootScope.$apply();
        }, false);
      }
    }

    function setAppReadyEvent() {
      if (window.App.Cordova) {
        angular.element(window.document).ready(function (event) {
          window.App.Event = event;
          $rootScope.OnAppReady();
        });
      } else {
        document.addEventListener('deviceready', function (event) {
          window.App.Event = event;
          $rootScope.OnAppReady();
        }, false);
      }
    }

    function setAppResumeEvent() {
      if (!window.App.Cordova) {
        document.addEventListener('resume', function (event) {
          window.App.Event = event;
          $rootScope.OnAppResume();
          $rootScope.$apply();
        }, false);
      }
    }

    function setAppBackButtonEvent() {
      if (!window.App.Cordova) {
        document.addEventListener('backbutton', function (event) {
          window.App.Event = event;
          $rootScope.OnAppBackButton();
        }, false);
      }
    }

    function setAppMenuButtonEvent() {
      if (!window.App.Cordova) {
        document.addEventListener('deviceready', function (event) {
          // http://stackoverflow.com/q/30309354
          navigator.app.overrideButton('menubutton', true);
          document.addEventListener('menubutton', function (event) {
            window.App.Event = event;
            $rootScope.OnAppMenuButton();
          }, false);
        }, false);
      }
    }

    function setAppOrientationEvent() {
      window.addEventListener('orientationchange', function (event) {
        window.App.Event = event;
        $rootScope.OnAppOrientation();
      }, false);
    }

    function setAppVolumeUpEvent() {
      if (!window.App.Cordova) {
        document.addEventListener('volumeupbutton', function (event) {
          window.App.Event = event;
          $rootScope.OnAppVolumeUpButton();
        }, false);
      }
    }

    function setAppVolumeDownEvent() {
      if (!window.App.Cordova) {
        document.addEventListener('volumedownbutton', function (event) {
          window.App.Event = event;
          $rootScope.OnAppVolumeDownButton();
        }, false);
      }
    }

    function setAppKeyUpEvent() {
      document.addEventListener('keyup', function (event) {
        window.App.Event = event;
        $rootScope.OnAppKeyUp();
      }, false);
    }

    function setAppKeyDownEvent() {
      document.addEventListener('keydown', function (event) {
        window.App.Event = event;
        $rootScope.OnAppKeyDown();
      }, false);
    }
    
    function setAppClickEvent() {
      document.addEventListener('click', function (event) {
        window.App.Event = event;
        $rootScope.OnAppClick();
      }, false);
    }    

    function setAppMouseUpEvent() {
      document.addEventListener('mouseup', function (event) {
        window.App.Event = event;
        $rootScope.OnAppMouseUp();
      }, false);
    }

    function setAppMouseDownEvent() {
      document.addEventListener('mousedown', function (event) {
        window.App.Event = event;
        $rootScope.OnAppMouseDown();
      }, false);
    }
    
    function setAppMouseMoveEvent() {
      document.addEventListener('mousemove', function (event) {
        window.App.Event = event;
        $rootScope.OnAppMouseMove();
      }, false);
    }    

    function setAppViewChangeEvent() {
      angular.element(window.document).ready(function (event) {
        $rootScope.$on('$locationChangeStart', function (event, next, current) {
          window.App.Event = event;
          $rootScope.App.NextView = next.substring(next.lastIndexOf('/') + 1);
          $rootScope.App.PrevView = current.substring(current.lastIndexOf('/') + 1);
          $rootScope.OnAppViewChange();
        });
      });
    }
    
    function setAppWebExtMsgEvent() {
      if (window.chrome) {
        chrome.runtime.onMessage.addListener(function (message, sender, responseFunc) {
          $rootScope.App.WebExtMessage = message;
          $rootScope.OnAppWebExtensionMsg();
        });
      }    
    }    

    return {
      init : function () {
        
        
              
        setAppReadyEvent();
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
      }
    };
  }
]);

window.App.Module.service
(
  'AppGlobalsService',

  ['$rootScope', '$filter',

  function ($rootScope, $filter) {

    var setGlobals = function () {    
      $rootScope.App = {};
      $rootScope.App._Timers = {};
      var s = function (name, method) {
        Object.defineProperty($rootScope.App, name, { get: method });
      };      
      s('Url', function () { return window.location.href; });      
      s('WeekDay', function () { return new Date().getDay(); });
      s('Event', function () { return window.App.Event || ''; });
      s('OuterWidth', function () { return window.outerWidth; });
      s('InnerWidth', function () { return window.innerWidth; });
      s('InnerHeight', function () { return window.innerHeight; });
      s('OuterHeight', function () { return window.outerHeight; });
      s('Timestamp', function () { return new Date().getTime(); });
      s('Day', function () { return $filter('date')(new Date(), 'dd'); });
      s('Hour', function () { return $filter('date')(new Date(), 'hh'); });
      s('Week', function () { return $filter('date')(new Date(), 'ww'); });
      s('Month', function () { return $filter('date')(new Date(), 'MM'); });
      s('Year', function () { return $filter('date')(new Date(), 'yyyy'); });
      s('Hour24', function () { return $filter('date')(new Date(), 'HH'); });
      s('Online', function () { return navigator.onLine ? 'true' : 'false' });
      s('Minutes', function () { return $filter('date')(new Date(), 'mm'); });
      s('Seconds', function () { return $filter('date')(new Date(), 'ss'); });
      s('DayShort', function () { return $filter('date')(new Date(), 'd'); });
      s('WeekShort', function () { return $filter('date')(new Date(), 'w'); });
      s('HourShort', function () { return $filter('date')(new Date(), 'h'); });
      s('YearShort', function () { return $filter('date')(new Date(), 'yy'); });
      s('MonthShort', function () { return $filter('date')(new Date(), 'M'); });
      s('Hour24Short', function () { return $filter('date')(new Date(), 'H'); });
      s('Fullscreen', function () { return window.BigScreen.element !== null; });
      s('MinutesShort', function () { return $filter('date')(new Date(), 'm'); });
      s('SecondsShort', function () { return $filter('date')(new Date(), 's'); });
      s('Milliseconds', function () { return $filter('date')(new Date(), 'sss'); });
      s('Debugger', function () { return window.App.Debugger.exists() ? 'true' : 'false'; });      
      s('Cordova', function () {  return angular.isUndefined(window.App.Cordova) ? 'true' : 'false'; });
      s('Orientation', function () { return window.innerWidth >= window.innerHeight ? 'landscape' : 'portrait'; });
      s('ActiveControl', function () { return (window.document.activeElement !== null) ? window.document.activeElement.id : ''; });
      s('CurrentView', function () { var s = window.document.location.hash.substring(3), i = s.indexOf('/'); return (i !== -1) ? s.substring(0, i) : s; });
      s('DialogView', function () { return window.document.querySelector('.modal-content .appView') ? window.document.querySelector('.modal-content .appView').id : ''; });

      
$rootScope.App.IdleIsIdling = "false";
$rootScope.App.IdleIsRunning = "false";
$rootScope.App.ID = "com.mehdiquantom.pwa";
$rootScope.App.Name = "Quantom Services";
$rootScope.App.ShortName = "MQ";
$rootScope.App.Version = "1.4.0";
$rootScope.App.Description = "Mehdi Quantom";
$rootScope.App.AuthorName = "Mehdi Quantom";
$rootScope.App.AuthorEmail = "bbjon4000@gmail.com";
$rootScope.App.AuthorUrl = "https://mehdiquantom.github.io/Fishonmars";
$rootScope.App.LanguageCode = "en";
$rootScope.App.TextDirection = "ltr";
$rootScope.App.BuildNumber = 415;
$rootScope.App.Scaled = "scaled";
$rootScope.App.Views = ["Login", "Main", "Location", "Camera", "Luncher", "Globals", "Find_Helium_Devices", "Video_Player", "Barcode_Scanner", "Barcode_Maker", "PDF_Viewer"];
$rootScope.App.Theme = "default";
$rootScope.App.Themes = ["Default"];
if ($rootScope.App.Themes.indexOf("default") == -1) { $rootScope.App.Themes.push("default"); }
    };

    return {
      init : function () {
        setGlobals();
      }
    };
  }
]);

window.App.Module.service
(
  'AppControlsService',

  ['$rootScope', '$http', '$sce',

  function ($rootScope, $http, $sce) {

    var setControlVars = function () {
      

$rootScope.MediaPlayer1 = {
  ABRole: 10001,
  Hidden: "",
  Class: "videogular-container ",
  Loop: true,
  Autoplay: true,
  Error: null,
  Sources: [],
  Tracks: []
};
$rootScope.MediaPlayer1.Sources.push({src: $sce.trustAsResourceUrl("app/images/Concept.mp4"), type: "video/mp4"});
$rootScope.MediaPlayer1.Sources.push({src: $sce.trustAsResourceUrl("app/images/Concept.mp4"), type: "video/3gp"});
$rootScope.MediaPlayer1.Sources.push({src: $sce.trustAsResourceUrl("app/images/Concept.mp4"), type: "video/ogg"});
$rootScope.MediaPlayer1.Sources.push({src: $sce.trustAsResourceUrl("app/images/Concept.mp4"), type: "video/webm"});

$rootScope.PasswordInput = {
  ABRole: 3001,
  Hidden: "",
  Value: "Password",
  Title: "Password",
  AriaLabel: "",
  TabIndex: 0,
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top",
  PlaceHolder: "",
  Class: "form-control form-control-md ",
  Disabled: "",
  ReadOnly: ""
};

$rootScope.Button1 = {
  ABRole: 2001,
  Hidden: "",
  Title: "",
  AriaLabel: "",
  TabIndex: 0,
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverTitle: "",
  PopoverEvent: "mouseenter",
  PopoverPos: "top",
  Badge: "",
  Icon: "",
  Text: "Login",
  Class: "btn btn-primary btn-md ",
  Disabled: ""
};

$rootScope.Label7 = {
  ABRole: 6002,
  Hidden: "",
  Class: "",
  Text: "Enter Your Unique Password:",
  Input: "",
  Title: "Enter Your Unique Password:",
  AriaLabel: "",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top",
  Icon: "fas fa-lock"
};

$rootScope.AutoUnblockTimer = {
  ABRole: 30002,
  Interval: 1000
};
$rootScope.App._Timers.AutoUnblockTimer = null;

$rootScope.Progressbar1 = {
  ABRole: 5001,
  Hidden: "true",
  Title: "",
  AriaLabel: "",
  BarText: "",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top",
  Class: "progress-bar bg-success progress-bar-striped progress-bar-animated ",
  Percentage: 100
};

$rootScope.QuantomSevicesConnector = {
  ABRole: 30001,
  Transform: "data",
  Status: 0,
  StatusText: "",
  Response: "",
  Request: {
    data: {},
    headers: {},
    url: "https://mehdiquantom.github.io/Fishonmars/QuantomSevicesConnector",
    method: "GET"
  }
};

$rootScope.Button12 = {
  ABRole: 2001,
  Hidden: "",
  Title: "",
  AriaLabel: "",
  TabIndex: 0,
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverTitle: "",
  PopoverEvent: "mouseenter",
  PopoverPos: "top",
  Badge: "",
  Icon: "",
  Text: "Locker | Android",
  Class: "btn btn-link btn-md ",
  Disabled: ""
};

$rootScope.HtmlContent2 = {
  ABRole: 6001,
  Hidden: "",
  Class: "ios-inertial-scroll ",
  Title: "",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top"
};

$rootScope.Input3 = {
  ABRole: 20001,
  Hidden: "",
  Url: "",
  Data: "",
  Value: null,
  Title: "",
  Text: "Pick A File",
  Placeholder: "Choose file",
  AriaLabel: "",
  Accept: "",
  TabIndex: 3,
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top",
  Class: "",
  Disabled: ""
};

$rootScope.HtmlContent3 = {
  ABRole: 6001,
  Hidden: "",
  Class: "ios-inertial-scroll ",
  Title: "",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top"
};

$rootScope.Textarea2 = {
  ABRole: 9001,
  Hidden: "",
  Value: "",
  Title: "",
  AriaLabel: "",
  TabIndex: 0,
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top",
  PlaceHolder: "",
  Class: "form-control form-control-md ",
  Disabled: "",
  ReadOnly: "true"
};

$rootScope.Label6 = {
  ABRole: 6002,
  Hidden: "",
  Class: "",
  Text: "Response",
  Input: "Textarea2",
  Title: "",
  AriaLabel: "",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top",
  Icon: ""
};

$rootScope.Button8 = {
  ABRole: 2001,
  Hidden: "",
  Title: "",
  AriaLabel: "",
  TabIndex: 4,
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverTitle: "",
  PopoverEvent: "mouseenter",
  PopoverPos: "top",
  Badge: "",
  Icon: "fa fa-paper-plane",
  Text: "Send",
  Class: "btn btn-primary btn-lg ",
  Disabled: ""
};

$rootScope.Button15 = {
  ABRole: 2001,
  Hidden: "",
  Title: "",
  AriaLabel: "",
  TabIndex: 0,
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverTitle: "",
  PopoverEvent: "mouseenter",
  PopoverPos: "top",
  Badge: "",
  Icon: "",
  Text: "Biometric Available",
  Class: "btn btn-link btn-md ",
  Disabled: ""
};

$rootScope.Button16 = {
  ABRole: 2001,
  Hidden: "",
  Title: "",
  AriaLabel: "",
  TabIndex: 0,
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverTitle: "",
  PopoverEvent: "mouseenter",
  PopoverPos: "top",
  Badge: "",
  Icon: "",
  Text: "Authenticate",
  Class: "btn btn-link btn-md ",
  Disabled: ""
};

$rootScope.Button3 = {
  ABRole: 2001,
  Hidden: "",
  Title: "",
  AriaLabel: "",
  TabIndex: 0,
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverTitle: "",
  PopoverEvent: "mouseenter",
  PopoverPos: "top",
  Badge: "",
  Icon: "",
  Text: "GeoLocation",
  Class: "btn btn-primary btn-md ",
  Disabled: ""
};

$rootScope.Button4 = {
  ABRole: 2001,
  Hidden: "",
  Title: "",
  AriaLabel: "",
  TabIndex: 0,
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverTitle: "",
  PopoverEvent: "mouseenter",
  PopoverPos: "top",
  Badge: "",
  Icon: "",
  Text: "Camera",
  Class: "btn btn-primary btn-md ",
  Disabled: ""
};

$rootScope.Button5 = {
  ABRole: 2001,
  Hidden: "",
  Title: "",
  AriaLabel: "",
  TabIndex: 0,
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverTitle: "",
  PopoverEvent: "mouseenter",
  PopoverPos: "top",
  Badge: "",
  Icon: "",
  Text: "Luncher",
  Class: "btn btn-primary btn-md ",
  Disabled: ""
};

$rootScope.Button9 = {
  ABRole: 2001,
  Hidden: "",
  Title: "",
  AriaLabel: "",
  TabIndex: 0,
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverTitle: "",
  PopoverEvent: "mouseenter",
  PopoverPos: "top",
  Badge: "",
  Icon: "",
  Text: "Globals",
  Class: "btn btn-primary btn-md ",
  Disabled: ""
};

$rootScope.Button10 = {
  ABRole: 2001,
  Hidden: "",
  Title: "",
  AriaLabel: "",
  TabIndex: 0,
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverTitle: "",
  PopoverEvent: "mouseenter",
  PopoverPos: "top",
  Badge: "",
  Icon: "",
  Text: "Device Info",
  Class: "btn btn-primary btn-md ",
  Disabled: ""
};

$rootScope.Button11 = {
  ABRole: 2001,
  Hidden: "",
  Title: "",
  AriaLabel: "",
  TabIndex: 0,
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverTitle: "",
  PopoverEvent: "mouseenter",
  PopoverPos: "top",
  Badge: "",
  Icon: "",
  Text: "Barcode Scanner",
  Class: "btn btn-primary btn-md ",
  Disabled: ""
};

$rootScope.Navbar1 = {
  ABRole: 6004,
  Hidden: "",
  Brand: ""+$rootScope.App.Name+"",
  Image: "app/images/navbar.png",
  Kind: "primary",
  Placement: "fixed-top",
  Item: {},
  Items: []
};

$rootScope.Location1 = {
  ABRole: 50003,
  Timeout: 5000
};

$rootScope.LatitudeInput = {
  ABRole: 3001,
  Hidden: "",
  Value: "Latitude",
  Title: "",
  AriaLabel: "",
  TabIndex: 0,
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top",
  PlaceHolder: "",
  Class: "form-control form-control-md ",
  Disabled: "",
  ReadOnly: ""
};

$rootScope.LongitudeInput = {
  ABRole: 3001,
  Hidden: "",
  Value: "Longitude",
  Title: "",
  AriaLabel: "",
  TabIndex: 0,
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top",
  PlaceHolder: "",
  Class: "form-control form-control-md ",
  Disabled: "",
  ReadOnly: ""
};

$rootScope.MapsIFrame = {
  ABRole: 4001,
  Hidden: "",
  Url: "",
  Class: "ios-iframe-wrapper "
};

$rootScope.Button2 = {
  ABRole: 2001,
  Hidden: "",
  Title: "",
  AriaLabel: "",
  TabIndex: 0,
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverTitle: "",
  PopoverEvent: "mouseenter",
  PopoverPos: "top",
  Badge: "",
  Icon: "",
  Text: "Get Location",
  Class: "btn btn-primary btn-md ",
  Disabled: ""
};

$rootScope.PlayButton = {
  ABRole: 2001,
  Hidden: "",
  Title: "",
  AriaLabel: "",
  TabIndex: 0,
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverTitle: "",
  PopoverEvent: "mouseenter",
  PopoverPos: "top",
  Badge: "",
  Icon: "",
  Text: "Play",
  Class: "btn btn-success btn-md ",
  Disabled: ""
};

$rootScope.CaptureButton = {
  ABRole: 2001,
  Hidden: "",
  Title: "",
  AriaLabel: "",
  TabIndex: 0,
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverTitle: "",
  PopoverEvent: "mouseenter",
  PopoverPos: "top",
  Badge: "",
  Icon: "",
  Text: "Capture",
  Class: "btn btn-primary btn-md ",
  Disabled: ""
};

$rootScope.WebCam = {
  ABRole: 10002,
  Hidden: "",
  Error: "",
  VideoWidth: "",
  VideoHeight: "",
  Class: ""
};

$rootScope.WebCamHtml = {
  ABRole: 6001,
  Hidden: "",
  Class: "ios-inertial-scroll ",
  Title: "",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top"
};

$rootScope.Button6 = {
  ABRole: 2001,
  Hidden: "",
  Title: "",
  AriaLabel: "",
  TabIndex: 0,
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverTitle: "",
  PopoverEvent: "mouseenter",
  PopoverPos: "top",
  Badge: "",
  Icon: "",
  Text: "Check the specified app",
  Class: "btn btn-info btn-md ",
  Disabled: ""
};

$rootScope.Input1 = {
  ABRole: 3001,
  Hidden: "",
  Value: "com.whatsapp",
  Title: "",
  AriaLabel: "",
  TabIndex: 0,
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top",
  PlaceHolder: "",
  Class: "form-control form-control-md ",
  Disabled: "",
  ReadOnly: ""
};

$rootScope.Button7 = {
  ABRole: 2001,
  Hidden: "",
  Title: "",
  AriaLabel: "",
  TabIndex: 0,
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverTitle: "",
  PopoverEvent: "mouseenter",
  PopoverPos: "top",
  Badge: "",
  Icon: "",
  Text: "Launch the specified app",
  Class: "btn btn-success btn-md ",
  Disabled: ""
};

$rootScope.Label1 = {
  ABRole: 6002,
  Hidden: "",
  Class: "",
  Text: "App ID",
  Input: "Input1",
  Title: "",
  AriaLabel: "",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top",
  Icon: ""
};

$rootScope.HtmlContent1 = {
  ABRole: 6001,
  Hidden: "",
  Class: "ios-inertial-scroll ",
  Title: "",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top"
};

$rootScope.Timer1 = {
  ABRole: 30002,
  Interval: 1000
};
$rootScope.App._Timers.Timer1 = null;

$rootScope.Progressbar2 = {
  ABRole: 5001,
  Hidden: "true",
  Title: "",
  AriaLabel: "",
  BarText: "",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top",
  Class: "progress-bar bg-success progress-bar-striped progress-bar-animated ",
  Percentage: 100
};

$rootScope.IFrame1 = {
  ABRole: 4001,
  Hidden: "true",
  Url: "",
  Class: "ios-iframe-wrapper "
};

$rootScope.Location2 = {
  ABRole: 50003,
  Timeout: 5000
};

$rootScope.Input8 = {
  ABRole: 3001,
  Hidden: "true",
  Value: "Latitude",
  Title: "",
  AriaLabel: "",
  TabIndex: 0,
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top",
  PlaceHolder: "",
  Class: "form-control form-control-md ",
  Disabled: "",
  ReadOnly: ""
};

$rootScope.Input9 = {
  ABRole: 3001,
  Hidden: "true",
  Value: "Longitude",
  Title: "",
  AriaLabel: "",
  TabIndex: 0,
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top",
  PlaceHolder: "",
  Class: "form-control form-control-md ",
  Disabled: "",
  ReadOnly: ""
};

$rootScope.IFrame2 = {
  ABRole: 4001,
  Hidden: "true",
  Url: "",
  Class: "ios-iframe-wrapper "
};

$rootScope.Button14 = {
  ABRole: 2001,
  Hidden: "",
  Title: "",
  AriaLabel: "",
  TabIndex: 0,
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverTitle: "",
  PopoverEvent: "mouseenter",
  PopoverPos: "top",
  Badge: "",
  Icon: "fas fa-info",
  Text: "Get Location",
  Class: "btn btn-link btn-md ",
  Disabled: ""
};

$rootScope.Label2 = {
  ABRole: 6002,
  Hidden: "true",
  Class: "",
  Text: "Free",
  Input: "",
  Title: "",
  AriaLabel: "",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top",
  Icon: ""
};

$rootScope.Label3 = {
  ABRole: 6002,
  Hidden: "true",
  Class: "",
  Text: "Premium",
  Input: "",
  Title: "",
  AriaLabel: "",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top",
  Icon: ""
};

$rootScope.MediaPlayer2 = {
  ABRole: 10001,
  Hidden: "",
  Class: "videogular-container ",
  Loop: false,
  Autoplay: false,
  Error: null,
  Sources: [],
  Tracks: []
};
$rootScope.MediaPlayer2.Sources.push({src: $sce.trustAsResourceUrl("app/images/Concept.mp4"), type: "video/mp4"});
$rootScope.MediaPlayer2.Sources.push({src: $sce.trustAsResourceUrl("app/images/Concept.mp4"), type: "video/3gp"});
$rootScope.MediaPlayer2.Sources.push({src: $sce.trustAsResourceUrl("app/images/Concept.mp4"), type: "video/ogg"});
$rootScope.MediaPlayer2.Sources.push({src: $sce.trustAsResourceUrl("app/images/Concept.mp4"), type: "video/webm"});

$rootScope.Textarea1 = {
  ABRole: 9001,
  Hidden: "",
  Value: "",
  Title: "",
  AriaLabel: "",
  TabIndex: 0,
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top",
  PlaceHolder: "",
  Class: "form-control form-control-md ",
  Disabled: "",
  ReadOnly: ""
};

$rootScope.Range1 = {
  ABRole: 3007,
  Hidden: "",
  Min: "0",
  Max: "100",
  Step: "1",
  Value: 0,
  Orient: "",
  Title: "",
  AriaLabel: "",
  TabIndex: 0,
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top",
  Class: "form-control custom-range ",
  Disabled: ""
};

$rootScope.Input2 = {
  ABRole: 3007,
  Hidden: "",
  Min: "0",
  Max: "100",
  Step: "1",
  Value: 50,
  Orient: "",
  Title: "",
  AriaLabel: "",
  TabIndex: 0,
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top",
  Class: "form-control custom-range ",
  Disabled: ""
};

$rootScope.HtmlContent4 = {
  ABRole: 6001,
  Hidden: "",
  Class: "ios-inertial-scroll ",
  Title: "",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top"
};

$rootScope.EventsLabel = {
  ABRole: 6002,
  Hidden: "",
  Class: "",
  Text: "Position",
  Input: "Input1",
  Title: "",
  AriaLabel: "",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top",
  Icon: ""
};

$rootScope.Label4 = {
  ABRole: 6002,
  Hidden: "",
  Class: "",
  Text: "Volume",
  Input: "Input2",
  Title: "",
  AriaLabel: "",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top",
  Icon: ""
};

$rootScope.Label5 = {
  ABRole: 6002,
  Hidden: "",
  Class: "",
  Text: "Events",
  Input: "Textarea1",
  Title: "",
  AriaLabel: "",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top",
  Icon: ""
};

$rootScope.Barcode = {
  ABRole: 30007,
  Prompt: "",
  Formats: "",
  FrontCamera: "false",
  FlipButton: "false",
  TorchButton: "false",
  Orientation: ""
};

$rootScope.Button13 = {
  ABRole: 2001,
  Hidden: "",
  Title: "",
  AriaLabel: "",
  TabIndex: 0,
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverTitle: "",
  PopoverEvent: "mouseenter",
  PopoverPos: "top",
  Badge: "",
  Icon: "fa fa-qrcode fa-lg",
  Text: "Tap to scan",
  Class: "btn btn-primary btn-lg ",
  Disabled: ""
};

$rootScope.TextTextarea = {
  ABRole: 9001,
  Hidden: "",
  Value: "",
  Title: "",
  AriaLabel: "",
  TabIndex: 0,
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top",
  PlaceHolder: "",
  Class: "form-control form-control-md ",
  Disabled: "",
  ReadOnly: ""
};

$rootScope.QrCodeTarget = {
  ABRole: 6001,
  Hidden: "",
  Class: "ios-inertial-scroll ",
  Title: "",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top"
};

$rootScope.QrCodeButton = {
  ABRole: 2001,
  Hidden: "",
  Title: "",
  AriaLabel: "",
  TabIndex: 0,
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverTitle: "",
  PopoverEvent: "mouseenter",
  PopoverPos: "top",
  Badge: "",
  Icon: "fa fa-qrcode fa-lg",
  Text: "Generate QR",
  Class: "btn btn-primary btn-md ",
  Disabled: ""
};

$rootScope.QrCodeInput = {
  ABRole: 3001,
  Hidden: "",
  Value: "Mehdi_Quantom",
  Title: "",
  AriaLabel: "",
  TabIndex: 0,
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top",
  PlaceHolder: "",
  Class: "form-control form-control-md ",
  Disabled: "",
  ReadOnly: ""
};

$rootScope.Image1 = {
  ABRole: 8001,
  Hidden: "",
  Image: "",
  Class: "",
  Alt: "",
  Title: "",
  AriaLabel: "",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top"
};

$rootScope.IFrame3 = {
  ABRole: 4001,
  Hidden: "",
  Url: "",
  Class: "ios-iframe-wrapper "
};
    };

    return {
      init : function () {
        setControlVars();
      }
    };
  }
]);

window.App.Plugins = {};

window.App.Module.service
(
  'AppPluginsService',

  ['$rootScope',

  function ($rootScope) {

    return {
      init : function () {
        Object.keys(window.App.Plugins).forEach(function (plugin) {
          if (angular.isFunction(window.App.Plugins[plugin])) {
            plugin = window.App.Plugins[plugin].call();
            if (angular.isFunction(plugin.PluginSetupEvent)) {
              plugin.PluginSetupEvent();
            }
            if (angular.isUndefined(window.App.Cordova) &&
             angular.isFunction(plugin.PluginAppReadyEvent)) {
               document.addEventListener('deviceready',
                plugin.PluginAppReadyEvent, false);
            }
          }
        });
      },
      docReady : function () {
        Object.keys(window.App.Plugins).forEach(function (plugin) {
          if (angular.isFunction(window.App.Plugins[plugin])) {
            plugin = window.App.Plugins[plugin].call();
            if (angular.isFunction(plugin.PluginDocumentReadyEvent)) {
              angular.element(window.document).ready(
               plugin.PluginDocumentReadyEvent);
            }
          }
        });
      }      
    };
  }
]);

window.App.Ctrls = angular.module('AppCtrls', []);

window.App.Ctrls.controller
(
  'AppCtrl',

  ['$scope', '$rootScope', '$location', '$uibModal', '$http', '$sce', '$timeout', '$window', '$document', 'blockUI', '$uibPosition',
    '$templateCache', 'AppEventsService', 'AppGlobalsService', 'AppControlsService', 'AppPluginsService',

  function ($scope, $rootScope, $location, $uibModal, $http, $sce, $timeout, $window, $document, blockUI, $uibPosition,
   $templateCache, AppEventsService, AppGlobalsService, AppControlsService, AppPluginsService) {

    window.App.Scope = $scope;
    window.App.RootScope = $rootScope;

    AppEventsService.init();
    AppGlobalsService.init();
    AppControlsService.init();
    AppPluginsService.init();
     
    $scope.trustAsHtml = function (html) {
      return $sce.trustAsHtml(html);
    };    

    $scope.showView = function (viewName) {
      window.App.Modal.closeAll();
      $timeout(function () {
        $location.path(viewName);
      });
    };

    $scope.replaceView = function (viewName) {
      window.App.Modal.closeAll();
      $timeout(function () {
        $location.path(viewName).replace();
      });      
    };

    $scope.showModalView = function (viewName, callback) {
      var
        execCallback = null,
        modal = window.App.Modal.insert(viewName);

      modal.instance = $uibModal.open
      ({
        size: 'lg',
        scope: $scope,
        keyboard: false,
        animation: false,
        backdrop: 'static',
        windowClass: 'dialogView',
        controller: viewName + 'Ctrl',
        templateUrl: 'app/views/' + viewName + '.html'
      });
      execCallback = function (modalResult) {
        window.App.Modal.removeCurrent();
        if (angular.isFunction (callback)) {
          callback(modalResult);
        }
      };
      modal.instance.result.then(
        function (modalResult){execCallback(modalResult);},
        function (modalResult){execCallback(modalResult);}
      );      
    };

    $scope.closeModalView = function (modalResult) {
      var
        modal = window.App.Modal.getCurrent();

      if (modal !== null) {
        modal.close(modalResult);
      }
    };

    $scope.loadVariables = function (text) {

      var
        setVar = function (name, value) {
          var
            newName = '',
            dotPos = name.indexOf('.');

          if (dotPos !== -1) {
            newName = name.split('.');
            if (newName.length === 2) {
              $rootScope[newName[0].trim()][newName[1].trim()] = value;
            } else if (newName.length === 3) {
              // We support up to 3 levels here
              $rootScope[newName[0].trim()][newName[1].trim()][newName[2].trim()] = value;
            }
          } else {
            $rootScope[name] = value;
          }
        };

      var
        varName = '',
        varValue = '',
        isArray = false,
        text = text || '',
        separatorPos = -1;

      angular.forEach(text.split('\n'), function (value, key) {
        separatorPos = value.indexOf('=');
        if ((value.trim() !== '') && (value.substr(0, 1) !== ';') && (separatorPos !== -1)) {
          varName = value.substr(0, separatorPos).trim();
          if (varName !== '') {
            varValue = value.substr(separatorPos + 1, value.length).trim();
            isArray = varValue.substr(0, 1) === '|';
            if (!isArray) {
              setVar(varName, varValue);
            } else {
              setVar(varName, varValue.substr(1, varValue.length).split('|'));
            }
          }
        }
      });
    };
    
    $scope.alertBox = function (content, type) {
      var
        execCallback = null,
        aType = type || 'info',
        modal = window.App.Modal.insert('builder/views/alertBox.html');

      modal.instance = $uibModal.open
      ({
        size: 'lg',
        scope: $scope,
        keyboard: true,        
        animation: false,
        controller: 'AppDialogsCtrl',
        templateUrl: 'builder/views/alertBox.html',
        resolve: {
          properties: function () {
            return {
              Type: aType,
              Content: content
            };
          }
        }
      });
      execCallback = function () {
        window.App.Modal.removeCurrent();     
      };
      modal.instance.result.then(
        function (modalResult){execCallback();},
        function (modalResult){execCallback();}
      );
    };  

    $scope.autoCloseAlertBox = function (content, type, seconds, callback) {
      var
        execCallback = null,
        aType = type || 'info',
        modal = window.App.Modal.insert('builder/views/autoCloseAlertBox.html');

      modal.instance = $uibModal.open
      ({
        size: 'lg',
        scope: $scope,
        keyboard: false,
        animation: false,
        backdrop: 'static',
        controller: 'AppDialogsCtrl',
        templateUrl: 'builder/views/autoCloseAlertBox.html',
        resolve: {
          properties: function () {
            return {
              Type: aType,
              Content: content
            };
          }
        }
      });
      execCallback = function () {
        window.App.Modal.removeCurrent();
        if (angular.isFunction (callback)) {
          callback();
        }        
      };
      modal.instance.result.then(
        function (modalResult){execCallback();},
        function (modalResult){execCallback();}
      );
      setTimeout(function () {
        $scope.closeModalView();
      }, seconds !== '' ? parseFloat(seconds) * 1000 : 5000);
    };
    
    $scope.inputBox = function (header, buttons,
     inputVar, defaultVal, type, callback) {
      var
        execCallback = null,
        aType = type || 'info',
        aButtons = buttons || 'Ok|Cancel',
        modal = window.App.Modal.insert('builder/views/inputBox.html');

      $rootScope[inputVar] = defaultVal;

      modal.instance = $uibModal.open
      ({
        size: 'lg',
        scope: $scope,
        keyboard: false,
        animation: false,
        backdrop: 'static',
        controller: 'AppDialogsCtrl',
        templateUrl: 'builder/views/inputBox.html',
        resolve: {
          properties: function () {
            return {
              Type: aType,
              Header: header,
              Buttons: aButtons.split('|'),
              InputVar: $rootScope.inputVar
            };
          }
        }
      });
      execCallback = function (modalResult) {
        window.App.Modal.removeCurrent();
        if (angular.isFunction (callback)) {
          callback(modalResult, $rootScope[inputVar]);
        }
      };
      modal.instance.result.then(
        function (modalResult){execCallback(modalResult);},
        function (modalResult){execCallback(modalResult);}
      );
    };

    $scope.messageBox = function (header,
     content, buttons, type, callback) {
      var
        execCallback = null,
        aType = type || 'info',
        aButtons = buttons || null,
        modal = window.App.Modal.insert('builder/views/messageBox.html');

      modal.instance = $uibModal.open
      ({
        size: 'lg',
        scope: $scope,
        keyboard: false,
        animation: false,
        backdrop: 'static',
        controller: 'AppDialogsCtrl',
        templateUrl: 'builder/views/messageBox.html',
        resolve: {
          properties: function () {
            return {
              Type: aType,
              Header: header,
              Content: content,
              Buttons: aButtons !== null ? aButtons.split('|') : null
            };
          }
        }
      });
      execCallback = function (modalResult) {
        window.App.Modal.removeCurrent();
        if (angular.isFunction (callback)) {
          callback(modalResult);
        }
      };
      modal.instance.result.then(
        function (modalResult){execCallback(modalResult);},
        function (modalResult){execCallback(modalResult);}
      );
    };

    $scope.alert = function (title, text) {
      if (window.App.Cordova || !('notification' in navigator)) {
        window.alert(text);
      } else {
        navigator.notification.alert(
         text, null, title, null);
      }
    };

    $scope.confirm = function (title, text, callback) {
      if (window.App.Cordova || !('notification' in navigator)) {
        callback(window.confirm(text));
      } else {
        navigator.notification.confirm
        (
          text,
          function (btnIndex) {
            callback(btnIndex === 1);
          },
          title,
          null
        );
      }
    };

    $scope.prompt = function (title, text, defaultVal, callback) {
      if (window.App.Cordova || !('notification' in navigator)) {
        var
          result = window.prompt(text, defaultVal);
        callback(result !== null, result);
      } else {
        navigator.notification.prompt(
          text,
          function (result) {
            callback(result.buttonIndex === 1, result.input1);
          },
          title,
          null,
          defaultVal
        );
      }
    };

    $scope.beep = function (times) {
      if (window.App.Cordova || !('notification' in navigator)) {
        window.App.Utils.playSound
        (
          'builder/sounds/beep/beep.mp3',
          'builder/sounds/beep/beep.ogg'
        );
      } else {
        navigator.notification.beep(times);
      }
    };

    $scope.vibrate = function (milliseconds) {
      if (window.App.Cordova || !('notification' in navigator)) {
        var
          body = angular.element(document.body);
        body.addClass('animated shake');
        setTimeout(function () {
          body.removeClass('animated shake');
        }, milliseconds);
      } else {
        navigator.vibrate(milliseconds);
      }
    };

    $scope.setLocalOption = function (key, value) {
      window.localStorage.setItem(key, value);
    };

    $scope.getLocalOption = function (key) {
      return window.localStorage.getItem(key) || '';
    };

    $scope.removeLocalOption = function (key) {
      window.localStorage.removeItem(key);
    };

    $scope.clearLocalOptions = function () {
      window.localStorage.clear();
    };

    $scope.log = function (text, lineNum) {
      window.App.Debugger.log(text, lineNum);
    };

    $window.TriggerAppOrientationEvent = function () {
      $rootScope.OnAppOrientation();
      $rootScope.$apply();
    };

    $scope.idleStart = function (seconds) {

      $scope.idleStop();
      $rootScope.App.IdleIsIdling = false;

      if($rootScope.App._IdleSeconds !== seconds) {
        $rootScope.App._IdleSeconds = seconds;
      }

      $document.on('mousemove mousedown mousewheel keydown scroll touchstart touchmove DOMMouseScroll', $scope._resetIdle);

      $rootScope.App.IdleIsRunning = true;

      $rootScope.App._IdleTimer = setTimeout(function () {
        $rootScope.App.IdleIsIdling = true;
        $rootScope.OnAppIdleStart();
        $scope.$apply();
      }, $rootScope.App._IdleSeconds * 1000);
    };

    $scope._resetIdle = function () {
      if($rootScope.App.IdleIsIdling) {
        $rootScope.OnAppIdleEnd();
        $rootScope.App.IdleIsIdling = false;
        $scope.$apply();
      }
      $scope.idleStart($rootScope.App._IdleSeconds);
    };

    $scope.idleStop = function () {
      $document.off('mousemove mousedown mousewheel keydown scroll touchstart touchmove DOMMouseScroll', $scope._resetIdle);
      clearTimeout($rootScope.App._IdleTimer);
      $rootScope.App.IdleIsRunning = false;
    };

    $scope.trustSrc = function (src) {
      return $sce.trustAsResourceUrl(src);
    };

    $scope.openWindow = function (url, showLocation, target) {
      var
        options = 'location=';

      if (showLocation) {
        options += 'yes';
      } else {
        options += 'no';
      }

      if (window.App.Cordova) {
        options += ', width=500, height=500, resizable=yes, scrollbars=yes';
      }

      return window.open(url, target, options);
    };

    $scope.closeWindow = function (winRef) {
      if (angular.isObject(winRef) && angular.isFunction (winRef.close)) {
        winRef.close();
      }
    };    
    
    $scope.fileDownload = function(url, subdir, fileName,
     privatelly, headers, errorCallback, successCallback) {
     
      if (window.App.Cordova) {
        if (angular.isFunction(errorCallback)) { 
          errorCallback('-1'); 
        }
        return;
      }
      
      var
        ft = new FileTransfer(),
        root = privatelly.toString() === 'true' ? cordova.file.dataDirectory :
         (device.platform.toLowerCase() === 'ios') ?
          cordova.file.documentsDirectory : cordova.file.externalRootDirectory;

      window.resolveLocalFileSystemURL(root, function (dir) {
        dir.getDirectory(subdir, { create: true, exclusive: false }, function (downloadDir) {
          downloadDir.getFile(fileName, { create: true, exclusive: false }, function (file) {
            ft.download(url, file.toURL(), function(entry) { 
              if (angular.isFunction(successCallback)) { successCallback(entry.toURL(), entry); } 
            }, 
            function(error) {
              if (angular.isFunction(errorCallback)) { errorCallback(4, error); }               
            }, 
            false, 
            { "headers": angular.isObject(headers) ? headers : {} });
          }, 
          function(error) {
            if (angular.isFunction(errorCallback)) { 
              errorCallback(3, error); 
            }               
          });
        }, 
        function(error) {
          if (angular.isFunction(errorCallback)) { 
            errorCallback(2, error); 
          }               
        });
      }, 
      function(error) {
        if (angular.isFunction(errorCallback)) { 
          errorCallback(1, error); 
        }               
      });
    };        

   
$scope.UpdateDatetimeVariables = function()
{

window.App.Debugger.log("Start of UpdateDatetimeVariables app function", "info", -1);

window.App.Debugger.log("SetVar \x22[Hour]\x22 \x22[App.Hour]\x22 \x22String\x22", "info", 1);

$rootScope.Hour = $rootScope.App.Hour;

window.App.Debugger.log("SetVar \x22[Hour24]\x22 \x22[App.Hour24]\x22 \x22String\x22", "info", 2);

$rootScope.Hour24 = $rootScope.App.Hour24;

window.App.Debugger.log("SetVar \x22[Minutes]\x22 \x22[App.Minutes]\x22 \x22String\x22", "info", 3);

$rootScope.Minutes = $rootScope.App.Minutes;

window.App.Debugger.log("SetVar \x22[Seconds]\x22 \x22[App.Seconds]\x22 \x22String\x22", "info", 4);

$rootScope.Seconds = $rootScope.App.Seconds;

window.App.Debugger.log("SetVar \x22[HourShort]\x22 \x22[App.HourShort]\x22 \x22String\x22", "info", 5);

$rootScope.HourShort = $rootScope.App.HourShort;

window.App.Debugger.log("SetVar \x22[Timestamp]\x22 \x22[App.Timestamp]\x22 \x22String\x22", "info", 6);

$rootScope.Timestamp = $rootScope.App.Timestamp;

window.App.Debugger.log("SetVar \x22[Hour24Short]\x22 \x22[App.Hour24Short]\x22 \x22String\x22", "info", 7);

$rootScope.Hour24Short = $rootScope.App.Hour24Short;

window.App.Debugger.log("SetVar \x22[MinutesShort]\x22 \x22[App.MinutesShort]\x22 \x22String\x22", "info", 8);

$rootScope.MinutesShort = $rootScope.App.MinutesShort;

window.App.Debugger.log("SetVar \x22[SecondsShort]\x22 \x22[App.SecondsShort]\x22 \x22String\x22", "info", 9);

$rootScope.SecondsShort = $rootScope.App.SecondsShort;

window.App.Debugger.log("SetVar \x22[Milliseconds]\x22 \x22[App.Milliseconds]\x22 \x22String\x22", "info", 10);

$rootScope.Milliseconds = ""+$rootScope.App.Milliseconds+"";

window.App.Debugger.log("End of UpdateDatetimeVariables app function", "info", -2);
};

$scope.DownloadErrorCallback = function(ErrorCode, ErrorObject)
{

window.App.Debugger.log("Start of DownloadErrorCallback app function", "info", -1);

window.App.Debugger.log("Enable \x22DownloadButton12\x22", "info", 1);

if ($rootScope["DownloadButton12"]) { $rootScope["DownloadButton12"].Disabled = ""; }

window.App.Debugger.log("StrSerialize \x22[ErrorObject]\x22 \x22[SerializedErrorObject]\x22", "info", 2);

$rootScope.SerializedErrorObject = JSON.stringify(ErrorObject);

window.App.Debugger.log("Alert \x22An error occur\x22 \x22Error code: [ErrorCode] - Error: [SerializedErrorObject]\x22", "info", 3);

$scope.alert("An error occur", "Error code: "+ErrorCode+" - Error: "+$rootScope.SerializedErrorObject+"");

window.App.Debugger.log("End of DownloadErrorCallback app function", "info", -2);
};

$scope.DownloadSuccessCallback = function(FileUrl, FileEntry)
{

window.App.Debugger.log("Start of DownloadSuccessCallback app function", "info", -1);

window.App.Debugger.log("StrSearch \x22[FileUrl]\x22 \x22.png\x22 \x22[Result]\x22", "info", 1);

$rootScope.Result = window.App.Utils.strSearch(FileUrl, ".png");

window.App.Debugger.log("If \x22[Result]\x22 \x22!=\x22 \x22-1\x22", "info", 2);

if ($rootScope.Result != -1) {

window.App.Debugger.log("SetVar \x22[DownloadImage.Image]\x22 \x22[FileUrl]\x22 \x22String\x22", "info", 3);

$rootScope.DownloadImage.Image = FileUrl;

window.App.Debugger.log("ApplyModel", "info", 4);

$timeout(function() { $rootScope.$apply(); });

window.App.Debugger.log("Else", "info", 5);

} else {

window.App.Debugger.log("Alert \x22Done!\x22 \x22Downloaded: [FileUrl]\x22", "info", 6);

$scope.alert("Done!", "Downloaded: "+FileUrl+"");

window.App.Debugger.log("EndIf", "info", 7);

}

window.App.Debugger.log("End of DownloadSuccessCallback app function", "info", -2);
};

$scope.LocationERR = function()
{

window.App.Debugger.log("Start of LocationERR app function", "info", -1);

window.App.Debugger.log("Return \x22Make Sure Location Access Is =Granted !\x22 \x22String\x22", "info", 1);

return "Make Sure Location Access Is =Granted !";

window.App.Debugger.log("End of LocationERR app function", "info", -2);
};

$scope.PromptCallback = function(Result, InputValue)
{

window.App.Debugger.log("Start of PromptCallback app function", "info", -1);

window.App.Debugger.log("VarIsTrue \x22[Result]\x22 \x22[Confirmed]\x22", "info", 1);

$rootScope.Confirmed = (window.App.Utils.lowerCase(Result.toString()) === "true") ? "true" : "false";

window.App.Debugger.log("Ifex \x22([Confirmed] == \x27true\x27) && ([InputValue] == \x27Mehdi\x27)\x22", "info", 2);

if(($rootScope.Confirmed == 'true') && (InputValue == 'Mehdi')) {

window.App.Debugger.log("ReplaceView \x22Main\x22", "info", 3);

$scope.replaceView("Main");

window.App.Debugger.log("AlertBox \x22Passkey: \x22[InputValue]\x22 Valid\x22 \x22dark\x22", "info", 4);

$scope.alertBox("Passkey: \x22"+InputValue+"\x22 Valid", "dark");

window.App.Debugger.log("Else", "info", 5);

} else {

window.App.Debugger.log("AlertBox \x22Rejected !\x22 \x22danger\x22", "info", 6);

$scope.alertBox("Rejected !", "danger");

window.App.Debugger.log("EndIf", "info", 7);

}

window.App.Debugger.log("End of PromptCallback app function", "info", -2);
};

$scope.BiometricAvailableSuccessCallback = function(DeviceKind)
{

window.App.Debugger.log("Start of BiometricAvailableSuccessCallback app function", "info", -1);

window.App.Debugger.log("Alert \x22Congrats!\x22 \x22Finger print is available! :: [DeviceKind]\x22", "info", 1);

$scope.alert("Congrats!", "Finger print is available! :: "+DeviceKind+"");

window.App.Debugger.log("End of BiometricAvailableSuccessCallback app function", "info", -2);
};

$scope.BiometricAvailableErrorCallback = function(Error)
{

window.App.Debugger.log("Start of BiometricAvailableErrorCallback app function", "info", -1);

window.App.Debugger.log("Alert \x22Warning\x22 \x22Fingerprint is not available! :: [Error]\x22", "info", 1);

$scope.alert("Warning", "Fingerprint is not available! :: "+Error+"");

window.App.Debugger.log("End of BiometricAvailableErrorCallback app function", "info", -2);
};

$scope.BiometricAuthenticateSuccessCallback = function()
{

window.App.Debugger.log("Start of BiometricAuthenticateSuccessCallback app function", "info", -1);

window.App.Debugger.log("Alert \x22Congrats!\x22 \x22Authenticate Successfully!\x22", "info", 1);

$scope.alert("Congrats!", "Authenticate Successfully!");

window.App.Debugger.log("End of BiometricAuthenticateSuccessCallback app function", "info", -2);
};

$scope.BiometricAuthenticateErrorCallback = function(Error)
{

window.App.Debugger.log("Start of BiometricAuthenticateErrorCallback app function", "info", -1);

window.App.Debugger.log("Alert \x22Warning\x22 \x22Authentication Error! :: [Error]\x22", "info", 1);

$scope.alert("Warning", "Authentication Error! :: "+Error+"");

window.App.Debugger.log("End of BiometricAuthenticateErrorCallback app function", "info", -2);
};

}]);

window.App.Ctrls.controller
(
  'AppDialogsCtrl',

  ['$scope', 'properties',

  function ($scope, properties) {
    $scope.Properties = properties;
  }
]);

window.App.Ctrls.controller
(
  'AppEventsCtrl',

  ['$scope', '$rootScope', '$location', '$uibModal', '$http', '$sce', '$timeout', '$window', '$document', 'blockUI', '$uibPosition', '$templateCache',

  function ($scope, $rootScope, $location, $uibModal, $http, $sce, $timeout, $window, $document, blockUI, $uibPosition, $templateCache) {

    $rootScope.OnAppClick = function () {
      
    };
    
    $rootScope.OnAppHide = function () {
      
    };
    
    $rootScope.OnAppShow = function () {
      
    };    

    $rootScope.OnAppReady = function () {
      
window.App.Debugger.log("Start of App Ready event", "info", -1);

window.App.Debugger.log("ArrayClear \x22[Navbar1.Items]\x22", "info", 1);

$rootScope.Navbar1.Items = [];

window.App.Debugger.log("ArrayClear \x22[Navbar1.Items]\x22", "info", 2);

$rootScope.Navbar1.Items = [];

window.App.Debugger.log("NewObject \x22[Item]\x22", "info", 3);

$rootScope.Item = {};

window.App.Debugger.log("ObjectSetProp \x22[Item]\x22 \x22Text\x22 \x22Item number 1\x22", "info", 4);

$rootScope.Item["Text"] = "Item number 1";

window.App.Debugger.log("ObjectSetProp \x22[Item]\x22 \x22Icon\x22 \x22fa fa-info-circle\x22", "info", 5);

$rootScope.Item["Icon"] = "fa fa-info-circle";

window.App.Debugger.log("ArrayPush \x22[Navbar1.Items]\x22 \x22[Item]\x22", "info", 6);

$rootScope.Navbar1.Items.push($rootScope.Item);

window.App.Debugger.log("NewObject \x22[Item]\x22", "info", 7);

$rootScope.Item = {};

window.App.Debugger.log("ObjectSetProp \x22[Item]\x22 \x22Text\x22 \x22Item number 2\x22", "info", 8);

$rootScope.Item["Text"] = "Item number 2";

window.App.Debugger.log("ObjectSetProp \x22[Item]\x22 \x22Icon\x22 \x22fa fa-info-circle\x22", "info", 9);

$rootScope.Item["Icon"] = "fa fa-info-circle";

window.App.Debugger.log("ArrayPush \x22[Navbar1.Items]\x22 \x22[Item]\x22", "info", 10);

$rootScope.Navbar1.Items.push($rootScope.Item);

window.App.Debugger.log("NewObject \x22[Item]\x22", "info", 11);

$rootScope.Item = {};

window.App.Debugger.log("ObjectSetProp \x22[Item]\x22 \x22Text\x22 \x22Item number 3\x22", "info", 12);

$rootScope.Item["Text"] = "Item number 3";

window.App.Debugger.log("ObjectSetProp \x22[Item]\x22 \x22Icon\x22 \x22fa fa-info-circle\x22", "info", 13);

$rootScope.Item["Icon"] = "fa fa-info-circle";

window.App.Debugger.log("NewArray \x22[SubItems]\x22", "info", 14);

$rootScope.SubItems = [];

window.App.Debugger.log("NewObject \x22[SubItem]\x22", "info", 15);

$rootScope.SubItem = {};

window.App.Debugger.log("ObjectSetProp \x22[SubItem]\x22 \x22Text\x22 \x22Item number 4\x22", "info", 16);

$rootScope.SubItem["Text"] = "Item number 4";

window.App.Debugger.log("ObjectSetProp \x22[SubItem]\x22 \x22Icon\x22 \x22fa fa-info-circle\x22", "info", 17);

$rootScope.SubItem["Icon"] = "fa fa-info-circle";

window.App.Debugger.log("ArrayPush \x22[SubItems]\x22 \x22[SubItem]\x22", "info", 18);

$rootScope.SubItems.push($rootScope.SubItem);

window.App.Debugger.log("NewObject \x22[SubItem]\x22", "info", 19);

$rootScope.SubItem = {};

window.App.Debugger.log("ObjectSetProp \x22[SubItem]\x22 \x22Text\x22 \x22Item number 5\x22", "info", 20);

$rootScope.SubItem["Text"] = "Item number 5";

window.App.Debugger.log("ObjectSetProp \x22[SubItem]\x22 \x22Icon\x22 \x22fa fa-info-circle\x22", "info", 21);

$rootScope.SubItem["Icon"] = "fa fa-info-circle";

window.App.Debugger.log("ArrayPush \x22[SubItems]\x22 \x22[SubItem]\x22", "info", 22);

$rootScope.SubItems.push($rootScope.SubItem);

window.App.Debugger.log("ObjectSetProp \x22[Item]\x22 \x22Items\x22 \x22[SubItems]\x22", "info", 23);

$rootScope.Item["Items"] = $rootScope.SubItems;

window.App.Debugger.log("ArrayPush \x22[Navbar1.Items]\x22 \x22[Item]\x22", "info", 24);

$rootScope.Navbar1.Items.push($rootScope.Item);

window.App.Debugger.log("CopyVar \x22[Navbar1.Items]\x22 \x22[Navbar1.Items]\x22", "info", 25);

$rootScope.Navbar1.Items = $rootScope.Navbar1.Items;

window.App.Debugger.log("End of App Ready event", "info", -2);

    };

    $rootScope.OnAppPause = function () {
      
    };

    $rootScope.OnAppKeyUp = function () {
      
    };

    $rootScope.OnAppKeyDown = function () {
      
    };

    $rootScope.OnAppMouseUp = function () {
      
    };

    $rootScope.OnAppMouseDown = function () {
      
    };
    
    $rootScope.OnAppMouseMove = function () {
      
    };    

    $rootScope.OnAppError = function () {
      
    };

    $rootScope.OnAppResize = function () {
      
    };

    $rootScope.OnAppResume = function () {
      
    };

    $rootScope.OnAppOnline = function () {
      
    };

    $rootScope.OnAppOffline = function () {
      
    };

    $rootScope.OnAppIdleEnd = function () {
      
    };

    $rootScope.OnAppIdleStart = function () {
      
    };

    $rootScope.OnAppBackButton = function () {
      
    };

    $rootScope.OnAppMenuButton = function () {
      
    };

    $rootScope.OnAppViewChange = function () {
      
    };

    $rootScope.OnAppOrientation = function () {
      
    };

    $rootScope.OnAppVolumeUpButton = function () {
      
    };

    $rootScope.OnAppVolumeDownButton = function () {
      
    };
    
    $rootScope.OnAppWebExtensionMsg = function () {
      
    };    
  }
]);

angular.element(window.document).ready(function () {
  angular.bootstrap(window.document, ['AppModule']);
});

window.App.Config = {};
window.App.Config.DefaultView = 'Login';



window.App.Ctrls.controller("LoginCtrl", ["$scope", "$rootScope", "$routeParams", "$sce", "$timeout", "$interval", "$http", "$uibPosition", "$templateCache", "blockUI", "AppPluginsService",

function($scope, $rootScope, $routeParams, $sce, $timeout, $interval, $http, $position, $templateCache, blockUI, AppPluginsService) {

$rootScope.Login = {};
$rootScope.Login.ABView = true;
$rootScope.Login.Params = window.App.Utils.parseViewParams($routeParams.params);

window.App.Login = {};
window.App.Login.Scope = $scope;

angular.element(window.document).ready(function(event){
var theme = $rootScope.App.Theme.toLowerCase();
angular.element(document.querySelector("body")).removeClass(theme).addClass(theme);
});

angular.element(window.document).ready(function(event){
AppPluginsService.docReady();
});

angular.element(window.document).ready(function(event){
$rootScope.Login.Event = event;

window.App.Debugger.log("Start of Login Show event", "info", -1);

window.App.Debugger.log("If \x22[App.Cordova]\x22 \x22==\x22 \x22false\x22", "info", 1);

if ($rootScope.App.Cordova ==  "false" ) {

window.App.Debugger.log("Hide \x22IsAvailableButton\x22", "info", 2);

if ($rootScope["IsAvailableButton"]) { $rootScope["IsAvailableButton"].Hidden = "true"; }

window.App.Debugger.log("Hide \x22AuthenticateButton\x22", "info", 3);

if ($rootScope["AuthenticateButton"]) { $rootScope["AuthenticateButton"].Hidden = "true"; }

window.App.Debugger.log("Else", "info", 4);

} else {

window.App.Debugger.log("Hide \x22InfoHtmlContent\x22", "info", 5);

if ($rootScope["InfoHtmlContent"]) { $rootScope["InfoHtmlContent"].Hidden = "true"; }

window.App.Debugger.log("EndIf", "info", 6);

}

window.App.Debugger.log("Prompt \x22Key\x22 \x22Enter Your Unique PassKey <!>\x22 \x22\x22 \x22PromptCallback\x22", "info", 7);

$scope.prompt("Key", "Enter Your Unique PassKey <!>", "", (("PromptCallback".length > 0) && angular.isFunction($scope["PromptCallback"])) ? $scope["PromptCallback"] : null);

window.App.Debugger.log("SetAppScaled \x22scaled\x22", "info", 8);

angular.element(document.getElementById("appStyle")).attr("href", "app/styles/" + window.App.Utils.lowerCase("scaled") + ".css");
$rootScope.App.Scaled = "scaled";

window.App.Debugger.log("SetViewSize \x22100vw\x22 \x22100vh\x22", "info", 9);

window.document.getElementById($rootScope.App.DialogView !== "" ? $rootScope.App.DialogView : $rootScope.App.CurrentView).style.width = "100vw";
window.document.getElementById($rootScope.App.DialogView !== "" ? $rootScope.App.DialogView : $rootScope.App.CurrentView).style.height = "100vh";

window.App.Debugger.log("If \x22[App.Cordova]\x22 \x22==\x22 \x22false\x22", "info", 10);

if ($rootScope.App.Cordova ==  "false" ) {

window.App.Debugger.log("Disable \x22Button12\x22", "info", 11);

if ($rootScope["Button12"]) { $rootScope["Button12"].Disabled = "true"; }

window.App.Debugger.log("AlertBox \x22Sorry, Error eccur.\x22 \x22dark\x22", "info", 12);

$scope.alertBox("Sorry, Error eccur.", "dark");

window.App.Debugger.log("EndIf", "info", 13);

}

window.App.Debugger.log("UserAgent \x22[UserAgent]\x22", "info", 14);

var ua = new UAParser(); $rootScope.UserAgent = ua.getResult();

window.App.Debugger.log("End of Login Show event", "info", -2);

$rootScope.$apply();
});

$rootScope.MediaPlayer1.onCanPlay = function() {

};

$rootScope.MediaPlayer1.onReady = function(API) {
$rootScope.MediaPlayer1.API = API;

};

$rootScope.MediaPlayer1.onError = function() {
if (!$rootScope.MediaPlayer1.API || !$rootScope.MediaPlayer1.API.totalTime) { return; }
if (document.querySelector("#MediaPlayer1 audio") && document.querySelector("#MediaPlayer1 audio").error) {
  $rootScope.MediaPlayer1.Error = document.querySelector("#MediaPlayer1 audio").error;
} else if (document.querySelector("#MediaPlayer1 video") && document.querySelector("#MediaPlayer1 video").error) {
  $rootScope.MediaPlayer1.Error = document.querySelector("#MediaPlayer1 video").error;
}
if ($rootScope.MediaPlayer1.Error === null) { return; }
};

$rootScope.MediaPlayer1.onComplete = function() {
};

$rootScope.MediaPlayer1.onUpdate = function() {
if (!$rootScope.MediaPlayer1.API || !$rootScope.MediaPlayer1.API.totalTime) { return; }
};

$scope.PasswordInputFocus = function($event) {
$rootScope.PasswordInput.Event = $event;

window.App.Debugger.log("Start of PasswordInput Focus event", "info", -1);

window.App.Debugger.log("GetStyle \x22Label7\x22 \x22font-size\x22 \x22[FontSize]\x22", "info", 1);

$rootScope.FontSize = window.getComputedStyle(document.getElementById("Label7"), null).getPropertyValue("font-size");

window.App.Debugger.log("StrReplaceAll \x22[FontSize]\x22 \x22px\x22 \x22\x22 \x22[FontSize]\x22", "info", 2);

$rootScope.FontSize = window.App.Utils.strReplaceAll($rootScope.FontSize, "px", "");

window.App.Debugger.log("Math \x22[FontSize]+2\x22 \x22[FontSize]\x22", "info", 3);

$rootScope.FontSize = Parser.parse(""+$rootScope.FontSize+"+2").evaluate();

window.App.Debugger.log("SetStyle \x22Label7\x22 \x22font-size\x22 \x22[FontSize]px\x22", "info", 4);

angular.element(document.getElementById("Label7")).css("font-size", ""+$rootScope.FontSize+"px");

window.App.Debugger.log("SetStyle \x22Label7\x22 \x22transition\x22 \x22font-size 200ms\x22", "info", 5);

angular.element(document.getElementById("Label7")).css("transition", "font-size 200ms");

window.App.Debugger.log("End of PasswordInput Focus event", "info", -2);

};

$scope.Button1Click = function($event) {
$rootScope.Button1.Event = $event;

window.App.Debugger.log("Start of Button1 Click event", "info", -1);

window.App.Debugger.log("If \x22[PasswordInput.Value]\x22 \x22==\x22 \x220\x22", "info", 1);

if ($rootScope.PasswordInput.Value == 0) {

window.App.Debugger.log("Show \x22Progressbar1\x22", "info", 2);

if ($rootScope["Progressbar1"]) { $rootScope["Progressbar1"].Hidden = ""; }

window.App.Debugger.log("SetVar \x22[Progressbar1.Percentage]\x22 \x22100\x22 \x22String\x22", "info", 3);

$rootScope.Progressbar1.Percentage = "100";

window.App.Debugger.log("TimerStart \x22AutoUnblockTimer\x22", "info", 4);

$rootScope.AutoUnblockTimer.TimerStart();

window.App.Debugger.log("Focus \x22PasswordInput\x22", "info", 5);

if (document.getElementById("PasswordInput")) { document.getElementById("PasswordInput").focus(); }

window.App.Debugger.log("ReplaceView \x22Main\x22", "info", 6);

$scope.replaceView("Main");

window.App.Debugger.log("BlockApp", "info", 7);

blockUI.reset(); blockUI.start();

window.App.Debugger.log("BlockedText \x22Please Wait . . .\x22", "info", 8);

blockUI.message("Please Wait . . .");

window.App.Debugger.log("EndIf", "info", 9);

}

window.App.Debugger.log("Exit", "info", 10);

return null;

window.App.Debugger.log("End of Button1 Click event", "info", -2);

};

$rootScope.AutoUnblockTimer.OnInterval = function() {

window.App.Debugger.log("Start of AutoUnblockTimer Interval event", "info", -1);

window.App.Debugger.log("UnblockApp", "info", 1);

blockUI.stop();

window.App.Debugger.log("TimerStop \x22AutoUnblockTimer\x22", "info", 2);

$rootScope.AutoUnblockTimer.TimerStop();

window.App.Debugger.log("End of AutoUnblockTimer Interval event", "info", -2);

};

$rootScope.AutoUnblockTimer.TimerStart = function() {
  $rootScope.AutoUnblockTimer.TimerStop();
  $rootScope.App._Timers.AutoUnblockTimer = $interval($rootScope.AutoUnblockTimer.OnInterval, $rootScope.AutoUnblockTimer.Interval);
};

$rootScope.AutoUnblockTimer.TimerStop = function() {
  if ($rootScope.App._Timers.AutoUnblockTimer !== null) {
    $interval.cancel($rootScope.App._Timers.AutoUnblockTimer);
  }
};

$rootScope.QuantomSevicesConnector.Execute = function() {
  $rootScope.QuantomSevicesConnector.Request.transformRequest = window.App.Utils.transformRequest($rootScope.QuantomSevicesConnector.Transform);
  $http($rootScope.QuantomSevicesConnector.Request)
  .then(function(response) {
    $rootScope.QuantomSevicesConnector.Status = response.status;
    $rootScope.QuantomSevicesConnector.Response = response.data;
    $rootScope.QuantomSevicesConnector.StatusText = response.statusText;

  },
  function(response) {
    $rootScope.QuantomSevicesConnector.Status = response.status;
    $rootScope.QuantomSevicesConnector.Response = response.data;
    $rootScope.QuantomSevicesConnector.StatusText = response.statusText;

  });
};

$scope.Button12Click = function($event) {
$rootScope.Button12.Event = $event;

window.App.Debugger.log("Start of Button12 Click event", "info", -1);

window.App.Debugger.log("Disable \x22Button12\x22", "info", 1);

if ($rootScope["Button12"]) { $rootScope["Button12"].Disabled = "true"; }

window.App.Debugger.log("FileDownload \x22http://mehdiiiiii.hyperphp.com/DL_SERVER_3/Crypt_Tool_Mehdi_Quantom.apk\x22 \x22\x22 \x22Crypt_Tool_Mehdi_Quantom.apk\x22 \x22false\x22 \x22\x22 \x22DownloadErrorCallback\x22 \x22DownloadSuccessCallback\x22", "info", 2);

$scope.fileDownload("http://mehdiiiiii.hyperphp.com/DL_SERVER_3/Crypt_Tool_Mehdi_Quantom.apk", "", "Crypt_Tool_Mehdi_Quantom.apk", "false", "", (("DownloadErrorCallback".length > 0) && angular.isFunction($scope["DownloadErrorCallback"])) ? $scope["DownloadErrorCallback"] : null, (("DownloadSuccessCallback".length > 0) && angular.isFunction($scope["DownloadSuccessCallback"])) ? $scope["DownloadSuccessCallback"] : null);

window.App.Debugger.log("End of Button12 Click event", "info", -2);

};
$scope.Input3Change = function(event) {
  $rootScope.Input3.Event = event;
};

angular.element(window.document).ready(function(event){
  angular.element(document.getElementById("Input3")).on("change", function(event){
    $rootScope.Input3.Url = URL.createObjectURL(event.target.files[0]);
    $scope.Input3Change(event);
  });
});

$scope.Button8Click = function($event) {
$rootScope.Button8.Event = $event;

window.App.Debugger.log("Start of Button8 Click event", "info", -1);

window.App.Debugger.log("SimplePost \x22https://mehdiquantom.github.io/DataStore/post.php\x22 \x22|YourFile:Input3.Value\x22 \x22Textarea2.Value\x22", "info", 1);

$http.post("https://mehdiquantom.github.io/DataStore/post.php", 
{"YourFile":$rootScope.Input3.Value})
.then(function(response){$rootScope.Textarea2.Value = response.data;});

window.App.Debugger.log("End of Button8 Click event", "info", -2);

};

$scope.Button15Click = function($event) {
$rootScope.Button15.Event = $event;

window.App.Debugger.log("Start of Button15 Click event", "info", -1);

window.App.Debugger.log("Disable \x22Button15\x22", "info", 1);

if ($rootScope["Button15"]) { $rootScope["Button15"].Disabled = "true"; }

window.App.Debugger.log("BiometricIsAvailable \x22BiometricAvailableSuccessCallback\x22 \x22BiometricAvailableErrorCallback\x22", "info", 2);

window.App.Plugins.Biometric.call().BiometricIsAvailable("BiometricAvailableSuccessCallback", "BiometricAvailableErrorCallback");

window.App.Debugger.log("End of Button15 Click event", "info", -2);

};

$scope.Button16Click = function($event) {
$rootScope.Button16.Event = $event;

window.App.Debugger.log("Start of Button16 Click event", "info", -1);

window.App.Debugger.log("Disable \x22Button16\x22", "info", 1);

if ($rootScope["Button16"]) { $rootScope["Button16"].Disabled = "true"; }

window.App.Debugger.log("BiometricAuthenticate \x22BiometricAuthenticateSuccessCallback\x22 \x22BiometricAuthenticateErrorCallback\x22", "info", 2);

window.App.Plugins.Biometric.call().BiometricAuthenticate("BiometricAuthenticateSuccessCallback", "BiometricAuthenticateErrorCallback");

window.App.Debugger.log("End of Button16 Click event", "info", -2);

};

}]);
window.App.Ctrls.controller("MainCtrl", ["$scope", "$rootScope", "$routeParams", "$sce", "$timeout", "$interval", "$http", "$uibPosition", "$templateCache", "blockUI", "AppPluginsService",

function($scope, $rootScope, $routeParams, $sce, $timeout, $interval, $http, $position, $templateCache, blockUI, AppPluginsService) {

$rootScope.Main = {};
$rootScope.Main.ABView = true;
$rootScope.Main.Params = window.App.Utils.parseViewParams($routeParams.params);

window.App.Main = {};
window.App.Main.Scope = $scope;

angular.element(window.document).ready(function(event){
var theme = $rootScope.App.Theme.toLowerCase();
angular.element(document.querySelector("body")).removeClass(theme).addClass(theme);
});

angular.element(window.document).ready(function(event){
AppPluginsService.docReady();
});

angular.element(window.document).ready(function(event){
$rootScope.Main.Event = event;

$rootScope.$apply();
});

$scope.Button3Click = function($event) {
$rootScope.Button3.Event = $event;

window.App.Debugger.log("Start of Button3 Click event", "info", -1);

window.App.Debugger.log("ReplaceView \x22Location\x22", "info", 1);

$scope.replaceView("Location");

window.App.Debugger.log("End of Button3 Click event", "info", -2);

};

$scope.Button4Click = function($event) {
$rootScope.Button4.Event = $event;

window.App.Debugger.log("Start of Button4 Click event", "info", -1);

window.App.Debugger.log("ReplaceView \x22Camera\x22", "info", 1);

$scope.replaceView("Camera");

window.App.Debugger.log("End of Button4 Click event", "info", -2);

};

$scope.Button5Click = function($event) {
$rootScope.Button5.Event = $event;

window.App.Debugger.log("Start of Button5 Click event", "info", -1);

window.App.Debugger.log("ShowView \x22Luncher\x22", "info", 1);

$scope.showView("Luncher");

window.App.Debugger.log("End of Button5 Click event", "info", -2);

};

$scope.Button9Click = function($event) {
$rootScope.Button9.Event = $event;

window.App.Debugger.log("Start of Button9 Click event", "info", -1);

window.App.Debugger.log("ShowView \x22Globals\x22", "info", 1);

$scope.showView("Globals");

window.App.Debugger.log("End of Button9 Click event", "info", -2);

};

$scope.Button10Click = function($event) {
$rootScope.Button10.Event = $event;

window.App.Debugger.log("Start of Button10 Click event", "info", -1);

window.App.Debugger.log("ShowView \x22Device_Info\x22", "info", 1);

$scope.showView("Device_Info");

window.App.Debugger.log("End of Button10 Click event", "info", -2);

};

$scope.Button11Click = function($event) {
$rootScope.Button11.Event = $event;

window.App.Debugger.log("Start of Button11 Click event", "info", -1);

window.App.Debugger.log("StatusBarShow", "info", 1);

if (window.StatusBar !== undefined) {window.StatusBar.show();}

window.App.Debugger.log("ShowDialog \x22Luncher\x22", "info", 2);

$scope.showModalView("Luncher");

window.App.Debugger.log("End of Button11 Click event", "info", -2);

};
$rootScope.Navbar1.ItemClick = function($event, item) {
  $rootScope.Navbar1.Event = $event;
  $rootScope.Navbar1.Item = item;
};

$rootScope.Navbar1.BrandClick = function($event) {
  $rootScope.Navbar1.Event = $event;
window.App.Debugger.log("Start of Navbar1 Brand click event", "info", -1);

window.App.Debugger.log("BlockApp", "info", 1);

blockUI.reset(); blockUI.start();

window.App.Debugger.log("BlockedText \x22Logged Out !\x22", "info", 2);

blockUI.message("Logged Out !");

window.App.Debugger.log("TimerStart \x22AutoUnblockTimer\x22", "info", 3);

$rootScope.AutoUnblockTimer.TimerStart();

window.App.Debugger.log("ShowView \x22Login\x22", "info", 4);

$scope.showView("Login");

window.App.Debugger.log("End of Navbar1 Brand click event", "info", -2);

};

}]);

window.App.Ctrls.controller("LocationCtrl", ["$scope", "$rootScope", "$routeParams", "$sce", "$timeout", "$interval", "$http", "$uibPosition", "$templateCache", "blockUI", "AppPluginsService",

function($scope, $rootScope, $routeParams, $sce, $timeout, $interval, $http, $position, $templateCache, blockUI, AppPluginsService) {

$rootScope.Location = {};
$rootScope.Location.ABView = true;
$rootScope.Location.Params = window.App.Utils.parseViewParams($routeParams.params);

window.App.Location = {};
window.App.Location.Scope = $scope;

angular.element(window.document).ready(function(event){
var theme = $rootScope.App.Theme.toLowerCase();
angular.element(document.querySelector("body")).removeClass(theme).addClass(theme);
});

angular.element(window.document).ready(function(event){
AppPluginsService.docReady();
});

angular.element(window.document).ready(function(event){
$rootScope.Location.Event = event;

window.App.Debugger.log("Start of Location Show event", "info", -1);

window.App.Debugger.log("Geolocation \x22Location1\x22", "info", 1);

$rootScope.Location1.getGeolocation();

window.App.Debugger.log("End of Location Show event", "info", -2);

$rootScope.$apply();
});

$rootScope.Location1.getGeolocation = function() {
  navigator.geolocation.getCurrentPosition($rootScope.Location1.onSuccess, $rootScope.Location1.onError, { timeout: $rootScope.Location1.Timeout, maximumAge: 3000, enableHighAccuracy: true });
};

$rootScope.Location1.onSuccess = function(position) {
  $rootScope.Location1.Latitude = position.coords.latitude;
  $rootScope.Location1.Altitude = position.coords.altitude;
  $rootScope.Location1.Longitude = position.coords.longitude;
  $rootScope.Location1.Accuracy = position.coords.accuracy;
  $rootScope.Location1.AltitudeAccuracy = position.coords.altitudeAccuracy;
  $rootScope.Location1.Heading = position.coords.heading;
  $rootScope.Location1.Speed = position.coords.speed;
  $rootScope.$apply();



window.App.Debugger.log("Start of Location1 Success event", "info", -1);

window.App.Debugger.log("SetVar \x22[LatitudeInput.Value]\x22 \x22[Location1.Latitude]\x22 \x22String\x22", "info", 1);

$rootScope.LatitudeInput.Value = $rootScope.Location1.Latitude;

window.App.Debugger.log("SetVar \x22[LongitudeInput.Value]\x22 \x22[Location1.Longitude]\x22 \x22String\x22", "info", 2);

$rootScope.LongitudeInput.Value = $rootScope.Location1.Longitude;

window.App.Debugger.log("SetVar \x22[MapsIFrame.Url]\x22 \x22https://www.google.com/maps/embed/v1/search?key=AIzaSyDxsY4GzmMbQZHO-ELpVNgBPE2HynZA2Qg&q=[Location1.Latitude],[Location1.Longitude]\x22 \x22String\x22", "info", 3);

$rootScope.MapsIFrame.Url = "https://www.google.com/maps/embed/v1/search?key=AIzaSyDxsY4GzmMbQZHO-ELpVNgBPE2HynZA2Qg&q="+$rootScope.Location1.Latitude+","+$rootScope.Location1.Longitude+"";

window.App.Debugger.log("ApplyModel", "info", 4);

$timeout(function() { $rootScope.$apply(); });

window.App.Debugger.log("End of Location1 Success event", "info", -2);

};

$rootScope.Location1.onError = function(error) {
  $rootScope.Location1.Error = error.code;



window.App.Debugger.log("Start of Location1 Error event", "info", -1);

window.App.Debugger.log("StartJS", "info", 1);


alert( window.App.Scope.LocationERR() );

window.App.Debugger.log("End of Location1 Error event", "info", -2);

};

$scope.Button2Click = function($event) {
$rootScope.Button2.Event = $event;

window.App.Debugger.log("Start of Button2 Click event", "info", -1);

window.App.Debugger.log("Geolocation \x22Location1\x22", "info", 1);

$rootScope.Location1.getGeolocation();

window.App.Debugger.log("End of Button2 Click event", "info", -2);

};

}]);

window.App.Ctrls.controller("CameraCtrl", ["$scope", "$rootScope", "$routeParams", "$sce", "$timeout", "$interval", "$http", "$uibPosition", "$templateCache", "blockUI", "AppPluginsService",

function($scope, $rootScope, $routeParams, $sce, $timeout, $interval, $http, $position, $templateCache, blockUI, AppPluginsService) {

$rootScope.Camera = {};
$rootScope.Camera.ABView = true;
$rootScope.Camera.Params = window.App.Utils.parseViewParams($routeParams.params);

window.App.Camera = {};
window.App.Camera.Scope = $scope;

angular.element(window.document).ready(function(event){
var theme = $rootScope.App.Theme.toLowerCase();
angular.element(document.querySelector("body")).removeClass(theme).addClass(theme);
});

angular.element(window.document).ready(function(event){
AppPluginsService.docReady();
});

angular.element(window.document).ready(function(event){
$rootScope.Camera.Event = event;

window.App.Debugger.log("Start of Camera Show event", "info", -1);

window.App.Debugger.log("WebCamCheck \x22WebCam\x22", "info", 1);

navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia || navigator.oGetUserMedia;
if (navigator.getUserMedia) {
  navigator.getUserMedia({video: true}, $rootScope.WebCam.onSuccess, $rootScope.WebCam.onError);
} else {
  $rootScope.WebCam.onError(-1);
}

window.App.Debugger.log("End of Camera Show event", "info", -2);

$rootScope.$apply();
});

$scope.PlayButtonClick = function($event) {
$rootScope.PlayButton.Event = $event;

window.App.Debugger.log("Start of PlayButton Click event", "info", -1);

window.App.Debugger.log("WebCamStart \x22WebCam\x22", "info", 1);

$rootScope.WebCam.Video.play();

window.App.Debugger.log("End of PlayButton Click event", "info", -2);

};

$scope.CaptureButtonClick = function($event) {
$rootScope.CaptureButton.Event = $event;

window.App.Debugger.log("Start of CaptureButton Click event", "info", -1);

window.App.Debugger.log("WebCamShot \x22WebCam\x22 \x22[Base64Img]\x22", "info", 1);

$rootScope.WebCam.CanvasContext.drawImage($rootScope.WebCam.Video, 0, 0);
$rootScope.Base64Img = $rootScope.WebCam.Canvas.toDataURL();

window.App.Debugger.log("SetAttribute \x22Image\x22 \x22src\x22 \x22[Base64Img]\x22", "info", 2);

document.getElementById("Image").setAttribute("src", ""+$rootScope.Base64Img+"");

window.App.Debugger.log("Invalid syntax for ScaleCapturedImage at CaptureButton Click event", "error", 0);

window.App.Debugger.log("End of CaptureButton Click event", "info", -2);

};

angular.element(window.document).ready(function(event){
  $rootScope.WebCam.VideoStream = false;
  $rootScope.WebCam.Video = document.getElementById("WebCam");
  $rootScope.WebCam.Canvas = document.getElementById("WebCamCanvas");
  $rootScope.WebCam.CanvasContext = $rootScope.WebCam.Canvas.getContext("2d");

  $rootScope.WebCam.Video.onloadedmetadata = function() {
    $rootScope.WebCam.VideoWidth = this.videoWidth;
    $rootScope.WebCam.VideoHeight = this.videoHeight;
    $rootScope.WebCam.Canvas.setAttribute("width", this.videoWidth);
    $rootScope.WebCam.Canvas.setAttribute("height", this.videoHeight);
    $rootScope.WebCam.CanvasContext.translate($rootScope.WebCam.Canvas.width, 0);
    $rootScope.WebCam.CanvasContext.scale(-1, 1);
  };
});

$rootScope.WebCam.onSuccess = function(stream) {
  $rootScope.WebCam.VideoStream = stream;
try {
  $rootScope.WebCam.Video.srcObject = stream;
} catch (error) {
  $rootScope.WebCam.Video.src = window.URL.createObjectURL(stream);
}
window.App.Debugger.log("Start of WebCam Success event", "info", -1);

window.App.Debugger.log("AlertBox \x22We have permissions!\x22 \x22success\x22", "info", 1);

$scope.alertBox("We have permissions!", "success");

window.App.Debugger.log("End of WebCam Success event", "info", -2);

};

$rootScope.WebCam.onError = function(error) {

$rootScope.WebCam.Error = error;
window.App.Debugger.log("Start of WebCam Error event", "info", -1);

window.App.Debugger.log("Disable \x22PlayButton\x22", "info", 1);

if ($rootScope["PlayButton"]) { $rootScope["PlayButton"].Disabled = "true"; }

window.App.Debugger.log("Disable \x22CaptureButton\x22", "info", 2);

if ($rootScope["CaptureButton"]) { $rootScope["CaptureButton"].Disabled = "true"; }

window.App.Debugger.log("If \x22[WebCam.Error]\x22 \x22==\x22 \x22-1\x22", "info", 3);

if ($rootScope.WebCam.Error == -1) {

window.App.Debugger.log("AlertBox \x22Error. Webcam is not supported in this browser.\x22 \x22warning\x22", "info", 4);

$scope.alertBox("Error. Webcam is not supported in this browser.", "warning");

window.App.Debugger.log("Else", "info", 5);

} else {

window.App.Debugger.log("AlertBox \x22Error: [WebCam.Error]\x22 \x22warning\x22", "info", 6);

$scope.alertBox("Error: "+$rootScope.WebCam.Error+"", "warning");

window.App.Debugger.log("EndIf", "info", 7);

}

window.App.Debugger.log("End of WebCam Error event", "info", -2);

};

}]);

window.App.Ctrls.controller("LuncherCtrl", ["$scope", "$rootScope", "$routeParams", "$sce", "$timeout", "$interval", "$http", "$uibPosition", "$templateCache", "blockUI", "AppPluginsService",

function($scope, $rootScope, $routeParams, $sce, $timeout, $interval, $http, $position, $templateCache, blockUI, AppPluginsService) {

$rootScope.Luncher = {};
$rootScope.Luncher.ABView = true;
$rootScope.Luncher.Params = window.App.Utils.parseViewParams($routeParams.params);

window.App.Luncher = {};
window.App.Luncher.Scope = $scope;

angular.element(window.document).ready(function(event){
var theme = $rootScope.App.Theme.toLowerCase();
angular.element(document.querySelector("body")).removeClass(theme).addClass(theme);
});

angular.element(window.document).ready(function(event){
AppPluginsService.docReady();
});

angular.element(window.document).ready(function(event){
$rootScope.Luncher.Event = event;

$rootScope.$apply();
});

$scope.Button6Click = function($event) {
$rootScope.Button6.Event = $event;

window.App.Debugger.log("Start of Button6 Click event", "info", -1);

window.App.Debugger.log("StartJS", "info", 1);


startApp.set({
"package": window.App.RootScope.Input1.Value
}).check(window.App.Scope.CheckSuccess, window.App.Scope.CheckError);

window.App.Debugger.log("End of Button6 Click event", "info", -2);

};

$scope.Button7Click = function($event) {
$rootScope.Button7.Event = $event;

window.App.Debugger.log("Start of Button7 Click event", "info", -1);

window.App.Debugger.log("StartJS", "info", 1);


startApp.set({
"application": window.App.RootScope.Input1.Value
}).start(angular.noop, window.App.Scope.LaunchError);

window.App.Debugger.log("End of Button7 Click event", "info", -2);

};

}]);

window.App.Ctrls.controller("GlobalsCtrl", ["$scope", "$rootScope", "$routeParams", "$sce", "$timeout", "$interval", "$http", "$uibPosition", "$templateCache", "blockUI", "AppPluginsService",

function($scope, $rootScope, $routeParams, $sce, $timeout, $interval, $http, $position, $templateCache, blockUI, AppPluginsService) {

$rootScope.Globals = {};
$rootScope.Globals.ABView = true;
$rootScope.Globals.Params = window.App.Utils.parseViewParams($routeParams.params);

window.App.Globals = {};
window.App.Globals.Scope = $scope;

angular.element(window.document).ready(function(event){
var theme = $rootScope.App.Theme.toLowerCase();
angular.element(document.querySelector("body")).removeClass(theme).addClass(theme);
});

angular.element(window.document).ready(function(event){
AppPluginsService.docReady();
});

angular.element(window.document).ready(function(event){
$rootScope.Globals.Event = event;

window.App.Debugger.log("Start of Globals Show event", "info", -1);

window.App.Debugger.log("TimerStart \x22Timer1\x22", "info", 1);

$rootScope.Timer1.TimerStart();

window.App.Debugger.log("UpdateDatetimeVariables", "info", 2);

$scope.UpdateDatetimeVariables();

window.App.Debugger.log("End of Globals Show event", "info", -2);

$rootScope.$apply();
});

$rootScope.Timer1.OnInterval = function() {

window.App.Debugger.log("Start of Timer1 Interval event", "info", -1);

window.App.Debugger.log("UpdateDatetimeVariables", "info", 1);

$scope.UpdateDatetimeVariables();

window.App.Debugger.log("End of Timer1 Interval event", "info", -2);

};

$rootScope.Timer1.TimerStart = function() {
  $rootScope.Timer1.TimerStop();
  $rootScope.App._Timers.Timer1 = $interval($rootScope.Timer1.OnInterval, $rootScope.Timer1.Interval);
};

$rootScope.Timer1.TimerStop = function() {
  if ($rootScope.App._Timers.Timer1 !== null) {
    $interval.cancel($rootScope.App._Timers.Timer1);
  }
};

}]);

window.App.Ctrls.controller("Find_Helium_DevicesCtrl", ["$scope", "$rootScope", "$routeParams", "$sce", "$timeout", "$interval", "$http", "$uibPosition", "$templateCache", "blockUI", "AppPluginsService",

function($scope, $rootScope, $routeParams, $sce, $timeout, $interval, $http, $position, $templateCache, blockUI, AppPluginsService) {

$rootScope.Find_Helium_Devices = {};
$rootScope.Find_Helium_Devices.ABView = true;
$rootScope.Find_Helium_Devices.Params = window.App.Utils.parseViewParams($routeParams.params);

window.App.Find_Helium_Devices = {};
window.App.Find_Helium_Devices.Scope = $scope;

angular.element(window.document).ready(function(event){
var theme = $rootScope.App.Theme.toLowerCase();
angular.element(document.querySelector("body")).removeClass(theme).addClass(theme);
});

angular.element(window.document).ready(function(event){
AppPluginsService.docReady();
});

angular.element(window.document).ready(function(event){
$rootScope.Find_Helium_Devices.Event = event;

window.App.Debugger.log("Start of Find_Helium_Devices Show event", "info", -1);

window.App.Debugger.log("TimerStart \x22Timer2\x22", "info", 1);

$rootScope.Timer2.TimerStart();

window.App.Debugger.log("End of Find_Helium_Devices Show event", "info", -2);

$rootScope.$apply();
});

$rootScope.Location2.getGeolocation = function() {
  navigator.geolocation.getCurrentPosition($rootScope.Location2.onSuccess, $rootScope.Location2.onError, { timeout: $rootScope.Location2.Timeout, maximumAge: 3000, enableHighAccuracy: true });
};

$rootScope.Location2.onSuccess = function(position) {
  $rootScope.Location2.Latitude = position.coords.latitude;
  $rootScope.Location2.Altitude = position.coords.altitude;
  $rootScope.Location2.Longitude = position.coords.longitude;
  $rootScope.Location2.Accuracy = position.coords.accuracy;
  $rootScope.Location2.AltitudeAccuracy = position.coords.altitudeAccuracy;
  $rootScope.Location2.Heading = position.coords.heading;
  $rootScope.Location2.Speed = position.coords.speed;
  $rootScope.$apply();



window.App.Debugger.log("Start of Location2 Success event", "info", -1);

window.App.Debugger.log("Show \x22IFrame2\x22", "info", 1);

if ($rootScope["IFrame2"]) { $rootScope["IFrame2"].Hidden = ""; }

window.App.Debugger.log("Show \x22IFrame1\x22", "info", 2);

if ($rootScope["IFrame1"]) { $rootScope["IFrame1"].Hidden = ""; }

window.App.Debugger.log("Show \x22Label2\x22", "info", 3);

if ($rootScope["Label2"]) { $rootScope["Label2"].Hidden = ""; }

window.App.Debugger.log("Show \x22Label3\x22", "info", 4);

if ($rootScope["Label3"]) { $rootScope["Label3"].Hidden = ""; }

window.App.Debugger.log("Show \x22Input8\x22", "info", 5);

if ($rootScope["Input8"]) { $rootScope["Input8"].Hidden = ""; }

window.App.Debugger.log("Show \x22Input9\x22", "info", 6);

if ($rootScope["Input9"]) { $rootScope["Input9"].Hidden = ""; }

window.App.Debugger.log("SetVar \x22[Input8.Value]\x22 \x22[Location2.Latitude]\x22 \x22String\x22", "info", 7);

$rootScope.Input8.Value = $rootScope.Location2.Latitude;

window.App.Debugger.log("SetVar \x22[Input9.Value]\x22 \x22[Location2.Longitude]\x22 \x22String\x22", "info", 8);

$rootScope.Input9.Value = $rootScope.Location2.Longitude;

window.App.Debugger.log("SetVar \x22[IFrame2.Url]\x22 \x22https://explorer.helium.com\x22 \x22String\x22", "info", 9);

$rootScope.IFrame2.Url = "https://explorer.helium.com";

window.App.Debugger.log("SetVar \x22[IFrame1.Url]\x22 \x22https://mehdiquantom.github.io/Fishonmars/QuantomHeliumSeviceConnector/\x22 \x22String\x22", "info", 10);

$rootScope.IFrame1.Url = "https://mehdiquantom.github.io/Fishonmars/QuantomHeliumSeviceConnector/";

window.App.Debugger.log("SetVar \x22[Progressbar2.Class]\x22 \x22progress-bar bg-success progress-bar-striped progress-bar-animated\x22 \x22String\x22", "info", 11);

$rootScope.Progressbar2.Class = "progress-bar bg-success progress-bar-striped progress-bar-animated";

window.App.Debugger.log("SetVar \x22[Progressbar2.Percentage]\x22 \x22100\x22 \x22String\x22", "info", 12);

$rootScope.Progressbar2.Percentage = "100";

window.App.Debugger.log("Show \x22HtmlContent2\x22", "info", 13);

if ($rootScope["HtmlContent2"]) { $rootScope["HtmlContent2"].Hidden = ""; }

window.App.Debugger.log("ApplyModel", "info", 14);

$timeout(function() { $rootScope.$apply(); });

window.App.Debugger.log("End of Location2 Success event", "info", -2);

};

$rootScope.Location2.onError = function(error) {
  $rootScope.Location2.Error = error.code;



window.App.Debugger.log("Start of Location2 Error event", "info", -1);

window.App.Debugger.log("StartJS", "info", 1);


alert( window.App.Scope.LocationERR() );

window.App.Debugger.log("SetVar \x22[Progressbar1.Percentage]\x22 \x2240\x22 \x22String\x22", "info", 4);

$rootScope.Progressbar1.Percentage = "40";

window.App.Debugger.log("SetVar \x22[Progressbar2.Class]\x22 \x22progress-bar bg-danger progress-bar-striped progress-bar-animated\x22 \x22String\x22", "info", 5);

$rootScope.Progressbar2.Class = "progress-bar bg-danger progress-bar-striped progress-bar-animated";

window.App.Debugger.log("End of Location2 Error event", "info", -2);

};

$scope.Button14Click = function($event) {
$rootScope.Button14.Event = $event;

window.App.Debugger.log("Start of Button14 Click event", "info", -1);

window.App.Debugger.log("Geolocation \x22Location2\x22", "info", 1);

$rootScope.Location2.getGeolocation();

window.App.Debugger.log("Show \x22Progressbar2\x22", "info", 2);

if ($rootScope["Progressbar2"]) { $rootScope["Progressbar2"].Hidden = ""; }

window.App.Debugger.log("End of Button14 Click event", "info", -2);

};

}]);

window.App.Ctrls.controller("Video_PlayerCtrl", ["$scope", "$rootScope", "$routeParams", "$sce", "$timeout", "$interval", "$http", "$uibPosition", "$templateCache", "blockUI", "AppPluginsService",

function($scope, $rootScope, $routeParams, $sce, $timeout, $interval, $http, $position, $templateCache, blockUI, AppPluginsService) {

$rootScope.Video_Player = {};
$rootScope.Video_Player.ABView = true;
$rootScope.Video_Player.Params = window.App.Utils.parseViewParams($routeParams.params);

window.App.Video_Player = {};
window.App.Video_Player.Scope = $scope;

angular.element(window.document).ready(function(event){
var theme = $rootScope.App.Theme.toLowerCase();
angular.element(document.querySelector("body")).removeClass(theme).addClass(theme);
});

angular.element(window.document).ready(function(event){
AppPluginsService.docReady();
});

angular.element(window.document).ready(function(event){
$rootScope.Video_Player.Event = event;

$rootScope.CurrentTime = "0";

$rootScope.$apply();
});

$rootScope.MediaPlayer2.onCanPlay = function() {

};

$rootScope.MediaPlayer2.onReady = function(API) {
$rootScope.MediaPlayer2.API = API;

$rootScope.Textarea1.Value = "Player ready";

};

$rootScope.MediaPlayer2.onError = function() {
if (!$rootScope.MediaPlayer2.API || !$rootScope.MediaPlayer2.API.totalTime) { return; }
if (document.querySelector("#MediaPlayer2 audio") && document.querySelector("#MediaPlayer2 audio").error) {
  $rootScope.MediaPlayer2.Error = document.querySelector("#MediaPlayer2 audio").error;
} else if (document.querySelector("#MediaPlayer2 video") && document.querySelector("#MediaPlayer2 video").error) {
  $rootScope.MediaPlayer2.Error = document.querySelector("#MediaPlayer2 video").error;
}
if ($rootScope.MediaPlayer2.Error === null) { return; }
$scope.alert("", "Error code: "+$rootScope.MediaPlayer1.Error.code+" - Error message: "+$rootScope.MediaPlayer1.Error.message+"");

};

$rootScope.MediaPlayer2.onComplete = function() {
$rootScope.Textarea1.Value = ""+$rootScope.Textarea1.Value+"\nPlayer complete";

};

$rootScope.MediaPlayer2.onUpdate = function() {
if (!$rootScope.MediaPlayer2.API || !$rootScope.MediaPlayer2.API.totalTime) { return; }
$rootScope.Volume = $rootScope.MediaPlayer2.API.volume;

$rootScope.TimeLeft = $rootScope.MediaPlayer2.API.timeLeft;

$rootScope.TotalTime = $rootScope.MediaPlayer2.API.totalTime;

$rootScope.CurrentTime = $rootScope.MediaPlayer2.API.currentTime;

$rootScope.Volume = Parser.parse(""+$rootScope.Volume+" * 100").evaluate();

$rootScope.Volume = Math.round($rootScope.Volume);

$rootScope.TimeLeft = Math.round($rootScope.TimeLeft);

$rootScope.TotalTime = Math.round($rootScope.TotalTime);

$rootScope.CurrentTime = Math.round($rootScope.CurrentTime);

$rootScope.Range1.Value = Parser.parse(""+$rootScope.CurrentTime+" / "+$rootScope.TotalTime+" * 100").evaluate();

$rootScope.Range1.Value = Math.round($rootScope.Range1.Value);

$rootScope.Input2.Value = $rootScope.Volume;

};

$scope.Range1Click = function($event) {
$rootScope.Range1.Event = $event;

$rootScope.MediaPlayer2.API.seekTime($rootScope.Range1.Value, true);

};

$scope.Input2Change = function($event) {
$rootScope.Input2.Event = $event;

if (window.document.querySelector('#MediaPlayer2 video')) {window.document.querySelector('#MediaPlayer2 video').muted = false;}
$rootScope.MediaPlayer2.API.setVolume($rootScope.Input2.Value / 100);

};

}]);

window.App.Ctrls.controller("Barcode_ScannerCtrl", ["$scope", "$rootScope", "$routeParams", "$sce", "$timeout", "$interval", "$http", "$uibPosition", "$templateCache", "blockUI", "AppPluginsService",

function($scope, $rootScope, $routeParams, $sce, $timeout, $interval, $http, $position, $templateCache, blockUI, AppPluginsService) {

$rootScope.Barcode_Scanner = {};
$rootScope.Barcode_Scanner.ABView = true;
$rootScope.Barcode_Scanner.Params = window.App.Utils.parseViewParams($routeParams.params);

window.App.Barcode_Scanner = {};
window.App.Barcode_Scanner.Scope = $scope;

angular.element(window.document).ready(function(event){
var theme = $rootScope.App.Theme.toLowerCase();
angular.element(document.querySelector("body")).removeClass(theme).addClass(theme);
});

angular.element(window.document).ready(function(event){
AppPluginsService.docReady();
});

angular.element(window.document).ready(function(event){
$rootScope.Barcode_Scanner.Event = event;

window.App.Debugger.log("Start of Barcode_Scanner Show event", "info", -1);

window.App.Debugger.log("StatusBarColor \x22#00000\x22", "info", 1);

if (window.StatusBar !== undefined) {window.StatusBar.backgroundColorByHexString("#00000");}

window.App.Debugger.log("End of Barcode_Scanner Show event", "info", -2);

$rootScope.$apply();
});

$rootScope.Barcode.barcodeScan = function() {
  if (window.App.Cordova) {
    $rootScope.Barcode.onError(-1);
  } else {
    cordova.plugins.barcodeScanner.scan($rootScope.Barcode.onSuccess, $rootScope.Barcode.onError, {"orientation" : $rootScope.Barcode.Orientation,"prompt" : $rootScope.Barcode.Prompt,"formats": $rootScope.Barcode.Formats,"preferFrontCamera": ($rootScope.Barcode.FrontCamera == "true"),"showFlipCameraButton": ($rootScope.Barcode.FlipButton == "true"),"showTorchButton": ($rootScope.Barcode.TorchButton == "true")});
  }
};

$rootScope.Barcode.onSuccess = function(result) {
  $rootScope.Barcode.Text = result.text;
  $rootScope.Barcode.Format = result.format;
  $rootScope.Barcode.Cancelled = result.cancelled.toString();



window.App.Debugger.log("Start of Barcode Success event", "info", -1);

window.App.Debugger.log("If \x22[Barcode.Cancelled]\x22 \x22==\x22 \x22true\x22", "info", 1);

if ($rootScope.Barcode.Cancelled ==  "true" ) {

window.App.Debugger.log("AlertBox \x22User cancelled\x22 \x22info\x22", "info", 2);

$scope.alertBox("User cancelled", "info");

window.App.Debugger.log("Else", "info", 3);

} else {

window.App.Debugger.log("If \x22[Barcode.Format]\x22 \x22==\x22 \x22QR_CODE\x22", "info", 4);

if ($rootScope.Barcode.Format ==  "QR_CODE" ) {

window.App.Debugger.log("SubStr \x22[Barcode.Text]\x22 \x220\x22 \x224\x22 \x22[Http]\x22", "info", 5);

$rootScope.Http = window.App.Utils.subStr($rootScope.Barcode.Text, 0, 4);

window.App.Debugger.log("LowerStr \x22[Http]\x22 \x22[Http]\x22", "info", 6);

$rootScope.Http = window.App.Utils.lowerCase(""+$rootScope.Http+"");

window.App.Debugger.log("If \x22[Http]\x22 \x22==\x22 \x22http\x22", "info", 7);

if ($rootScope.Http ==  "http" ) {

window.App.Debugger.log("OpenWindow \x22[Barcode.Text]\x22 \x22false\x22 \x22_blank\x22 \x22[WindowID]\x22", "info", 8);

$rootScope.WindowID = $scope.openWindow($rootScope.Barcode.Text, "false", "_blank");

window.App.Debugger.log("Else", "info", 9);

} else {

window.App.Debugger.log("SetVar \x22[TextTextarea.Value]\x22 \x22[Barcode.Text]\x22 \x22String\x22", "info", 10);

$rootScope.TextTextarea.Value = $rootScope.Barcode.Text;

window.App.Debugger.log("ReplaceView \x22Text\x22", "info", 11);

$scope.replaceView("Text");

window.App.Debugger.log("EndIf", "info", 12);

}

window.App.Debugger.log("Else", "info", 13);

} else {

window.App.Debugger.log("SetVar \x22[TextTextarea.Value]\x22 \x22[Barcode.Text]\x22 \x22String\x22", "info", 14);

$rootScope.TextTextarea.Value = $rootScope.Barcode.Text;

window.App.Debugger.log("ReplaceView \x22Text\x22", "info", 15);

$scope.replaceView("Text");

window.App.Debugger.log("EndIf", "info", 16);

}

window.App.Debugger.log("EndIf", "info", 17);

}

window.App.Debugger.log("End of Barcode Success event", "info", -2);

$rootScope.$apply();
};

$rootScope.Barcode.onError = function(error) {
  $rootScope.Barcode.Error = error;



window.App.Debugger.log("Start of Barcode Error event", "info", -1);

window.App.Debugger.log("If \x22[Barcode.Error]\x22 \x22==\x22 \x22-1\x22", "info", 1);

if ($rootScope.Barcode.Error == -1) {

window.App.Debugger.log("AlertBox \x22Barcode plugin is not available\x22 \x22danger\x22", "info", 2);

$scope.alertBox("Barcode plugin is not available", "danger");

window.App.Debugger.log("Else", "info", 3);

} else {

window.App.Debugger.log("AlertBox \x22Sorry, an error occur: [Barcode.Error]\x22 \x22warning\x22", "info", 4);

$scope.alertBox("Sorry, an error occur: "+$rootScope.Barcode.Error+"", "warning");

window.App.Debugger.log("EndIf", "info", 5);

}

window.App.Debugger.log("End of Barcode Error event", "info", -2);

};

$scope.Button13Click = function($event) {
$rootScope.Button13.Event = $event;

window.App.Debugger.log("Start of Button13 Click event", "info", -1);

window.App.Debugger.log("BarcodeScan \x22Barcode\x22", "info", 1);

$rootScope.Barcode.barcodeScan();

window.App.Debugger.log("End of Button13 Click event", "info", -2);

};

}]);

window.App.Ctrls.controller("Barcode_MakerCtrl", ["$scope", "$rootScope", "$routeParams", "$sce", "$timeout", "$interval", "$http", "$uibPosition", "$templateCache", "blockUI", "AppPluginsService",

function($scope, $rootScope, $routeParams, $sce, $timeout, $interval, $http, $position, $templateCache, blockUI, AppPluginsService) {

$rootScope.Barcode_Maker = {};
$rootScope.Barcode_Maker.ABView = true;
$rootScope.Barcode_Maker.Params = window.App.Utils.parseViewParams($routeParams.params);

window.App.Barcode_Maker = {};
window.App.Barcode_Maker.Scope = $scope;

angular.element(window.document).ready(function(event){
var theme = $rootScope.App.Theme.toLowerCase();
angular.element(document.querySelector("body")).removeClass(theme).addClass(theme);
});

angular.element(window.document).ready(function(event){
AppPluginsService.docReady();
});

angular.element(window.document).ready(function(event){
$rootScope.Barcode_Maker.Event = event;

window.App.Debugger.log("Start of Barcode_Maker Show event", "info", -1);

window.App.Debugger.log("GetOption \x22QrImage\x22 \x22[Result]\x22", "info", 1);

$rootScope.Result = $scope.getLocalOption("QrImage");

window.App.Debugger.log("If \x22[Result]\x22 \x22!=\x22 \x22\x22", "info", 2);

if ($rootScope.Result != "") {

window.App.Debugger.log("SetAttribute \x22Image1\x22 \x22src\x22 \x22[Result]\x22", "info", 3);

document.getElementById("Image1").setAttribute("src", ""+$rootScope.Result+"");

window.App.Debugger.log("EndIf", "info", 4);

}

window.App.Debugger.log("End of Barcode_Maker Show event", "info", -2);

$rootScope.$apply();
});

$scope.QrCodeButtonClick = function($event) {
$rootScope.QrCodeButton.Event = $event;

window.App.Debugger.log("Start of QrCodeButton Click event", "info", -1);

window.App.Debugger.log("StartJS", "info", 1);


if (!window.qrcode) {
window.qrcode = new QRCode("QrCodeTarget", {
text: window.App.RootScope.QrCodeInput.Value,
width: 150,
height: 150,
colorDark : "#000",
colorLight : "#fff",
correctLevel : QRCode.CorrectLevel.H
});
var
QrCodeImage = document.querySelector('#QrCodeTarget img');
QrCodeImage.addEventListener('load', function() {
localStorage.setItem('QrImage', this.src);
}, false);
} else {
window.qrcode.clear();
qrcode.makeCode(window.App.RootScope.QrCodeInput.Value);
}

window.App.Debugger.log("End of QrCodeButton Click event", "info", -2);

};

}]);

window.App.Ctrls.controller("PDF_ViewerCtrl", ["$scope", "$rootScope", "$routeParams", "$sce", "$timeout", "$interval", "$http", "$uibPosition", "$templateCache", "blockUI", "AppPluginsService",

function($scope, $rootScope, $routeParams, $sce, $timeout, $interval, $http, $position, $templateCache, blockUI, AppPluginsService) {

$rootScope.PDF_Viewer = {};
$rootScope.PDF_Viewer.ABView = true;
$rootScope.PDF_Viewer.Params = window.App.Utils.parseViewParams($routeParams.params);

window.App.PDF_Viewer = {};
window.App.PDF_Viewer.Scope = $scope;

angular.element(window.document).ready(function(event){
var theme = $rootScope.App.Theme.toLowerCase();
angular.element(document.querySelector("body")).removeClass(theme).addClass(theme);
});

angular.element(window.document).ready(function(event){
AppPluginsService.docReady();
});

angular.element(window.document).ready(function(event){
$rootScope.PDF_Viewer.Event = event;

window.App.Debugger.log("Start of PDF_Viewer Show event", "info", -1);

window.App.Debugger.log("SetVar \x22[IFrame3.Url]\x22 \x22app/files/pdfjs/web/viewer.html?file=sample.pdf\x22 \x22String\x22", "info", 1);

$rootScope.IFrame3.Url = "app/files/pdfjs/web/viewer.html?file=sample.pdf";

window.App.Debugger.log("End of PDF_Viewer Show event", "info", -2);

$rootScope.$apply();
});

}]);
