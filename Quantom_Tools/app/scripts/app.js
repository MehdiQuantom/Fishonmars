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
    .when("/Find_Helium_Devices/:params*?", {controller: "Find_Helium_DevicesCtrl", templateUrl: "app/views/Find_Helium_Devices.html"});
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
$rootScope.App.Version = "1.0.0";
$rootScope.App.Description = "Mehdi Quantom";
$rootScope.App.AuthorName = "Mehdi Quantom";
$rootScope.App.AuthorEmail = "bbjon4000@gmail.com";
$rootScope.App.AuthorUrl = "https://mehdiquantom.github.io/Fishonmars";
$rootScope.App.LanguageCode = "en";
$rootScope.App.TextDirection = "ltr";
$rootScope.App.BuildNumber = 181;
$rootScope.App.Scaled = "scaled";
$rootScope.App.Views = ["Login", "Main", "Location", "Camera", "Luncher", "Globals", "Find_Helium_Devices"];
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
  Interval: 10000
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
  Icon: "",
  Text: "Find Helium Devices",
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
  Text: "Webcam + Camera",
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

$rootScope.IFrame1 = {
  ABRole: 4001,
  Hidden: "true",
  Url: "https://mehdiquantom.github.io/Fishonmars/QuantomSevicesConnector",
  Class: "ios-iframe-wrapper "
};

$rootScope.Location2 = {
  ABRole: 50003,
  Timeout: 5000
};

$rootScope.Input8 = {
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

$rootScope.Input9 = {
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
  Icon: "",
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
  Text: "Pro",
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

$scope.pdfmake = function()
{

window.App.Debugger.log("Start of pdfmake app function", "info", -1);

window.App.Debugger.log("Invalid syntax for window.App = {}; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for window.App.Utils = (function () { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for var at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for lastSound = 0; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for return { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for lowerCase: function (text) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for return text.toLowerCase(); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for upperCase: function (text) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for return text.toUpperCase(); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for strLen: function (text) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for return text.length; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for trimStr: function (text) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for return text.trim(); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for strSearch: function (text, query) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for return text.search(query); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for splitStr: function (text, separator) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for return text.split(separator); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for subStr: function (text, start, count) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for return text.substr(start, count); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for strReplace: function (text, from, to) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for return text.replace(from, to); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for strReplaceAll: function (text, from, to) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for return text.split(from).join(to); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for playSound: function (mp3Url, oggUrl) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for if (lastSound === 0) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for lastSound = new Audio(); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for if (lastSound.canPlayType(\x27audio/mpeg\x27)) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for lastSound.src = mp3Url; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for lastSound.type = \x27audio/mpeg\x27; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } else { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for lastSound.src = oggUrl; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for lastSound.type = \x27audio/ogg\x27; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for lastSound.play(); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for stopSound: function () { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for lastSound.pause(); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for lastSound.currentTime = 0.0; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for sleep: function (ms) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for var at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for start = new Date().getTime(); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for for (var i = 0; i < 1e7; i++) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for if ((new Date().getTime() - start) > ms){ at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for break; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for parseViewParams: function (params) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for if (angular.isUndefined(params)) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for return {}; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for var at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for result = {}, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for pairs = params.split(\x27&\x27); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for pairs.forEach(function(pair) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for pair = pair.split(\x27=\x27); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for result[pair[0 = decodeURIComponent(pair[1] || \x27\x27); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for return JSON.parse(JSON.stringify(result)); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for transformRequest: function (kind) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for if (kind === \x27json\x27) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for return function(data) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for return JSON.stringify(data); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } else if (kind === \x27form\x27) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for return function(data) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for var at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for frmData = []; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for angular.forEach(data, function(value, key) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for frmData.push(encodeURIComponent(key) + \x27=\x27 + encodeURIComponent(value)); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for return frmData.join(\x27&\x27); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } else if (kind === \x27data\x27) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for return function(data) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for var at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for frmData = new FormData(); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for angular.forEach(data, function(value, key) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for frmData.append(key, value); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for return frmData; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for })(); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for window.App.Modal = (function () { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for var at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for stack = [], at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for current = 0; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for return { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for insert: function (name) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for current = stack.length; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for stack[current] = {}; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for stack[current].name = name; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for stack[current].instance = null; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for return stack[current]; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for getCurrent: function () { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for if (stack[current]) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for return stack[current].instance; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } else { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for return null; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for removeCurrent: function () { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for stack.splice(current, 1); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for current = current - 1; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for current = (current < 0) ? 0 : current; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for closeAll: function () { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for for (var i = stack.length-1; i >= 0; i--) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for stack[i].instance.dismiss(); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for stack = []; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for current = 0; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for })(); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for window.App.Debugger = (function () { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for return { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for exists: function () { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for return (typeof window.external === \x27object\x27) at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for && (\x27hello\x27 in window.external); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for log: function (text, aType, lineNum) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for if (window.App.Debugger.exists()) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for window.external.log(\x27\x27 + text, aType || \x27info\x27, lineNum || 0); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } else { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for console.log(text); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for watch: function (varName, newValue, oldValue) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for if (window.App.Debugger.exists()) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for if (angular.isArray(newValue)) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for window.external.watch(\x27\x27, varName, newValue.toString(), \x27array\x27); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } else if (angular.isObject(newValue)) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for angular.forEach(newValue, function (value, key) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for if (!angular.isFunction (value)) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for try { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for window.external.watch(varName, key, value.toString(), typeof value); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for catch(exception) {} at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } else if (angular.isString(newValue) || angular.isNumber(newValue)) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for window.external.watch(\x27\x27, varName, newValue.toString(), typeof newValue); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for })(); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for window.App.Module = angular.module at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for ( at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for \x27AppModule\x27, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for [ at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for \x27ngAria\x27, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for \x27ngRoute\x27, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for \x27ngTouch\x27, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for \x27ngSanitize\x27, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for \x27blockUI\x27, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for \x27chart.js\x27, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for \x27ngOnload\x27, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for \x27ui.bootstrap\x27, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for \x27angular-canvas-gauge\x27, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for \x27com.2fdevs.videogular\x27, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for \x27com.2fdevs.videogular.plugins.controls\x27, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for \x27AppCtrls\x27 at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for ] at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for ); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for window.App.Module.run(function () { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for if (window.FastClick) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for window.FastClick.attach(window.document.body); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for window.App.Module.directive(\x27ngScroll\x27, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for [ at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for \x27$parse\x27, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for function ($parse) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for return { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for restrict: \x27A\x27, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for link: function ($scope, el, attrs) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for el.bind(\x27scroll\x27, function (event) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for var at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for fn = $parse(attrs.ngScroll); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for fn($scope, {$event: event}); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $scope.$apply(); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for ]); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for window.App.Module.directive(\x27ngImageLoad\x27, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for [ at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for \x27$parse\x27, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for function ($parse) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for return { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for restrict: \x27A\x27, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for link: function ($scope, el, attrs) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for el.bind(\x27load\x27, function (event) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for var at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for fn = $parse(attrs.ngImageLoad); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for fn($scope, {$event: event}); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for ]); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for window.App.Module.directive(\x27stringToNumber\x27, function() { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for return { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for require: \x27ngModel\x27, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for link: function(scope, element, attrs, ngModel) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for ngModel.$parsers.push(function(value) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for return \x27\x27 + value; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for ngModel.$formatters.push(function(value) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for return parseFloat(value); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for window.App.Module.directive(\x27ngImageError\x27, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for [ at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for \x27$parse\x27, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for function ($parse) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for return { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for restrict: \x27A\x27, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for link: function ($scope, el, attrs) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for el.bind(\x27error\x27, function (event) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for var at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for fn = $parse(attrs.ngImageError); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for fn($scope, {$event: event}); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for ]); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for window.App.Module.directive(\x27ngContextMenu\x27, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for [ at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for \x27$parse\x27, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for function ($parse) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for return { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for restrict: \x27A\x27, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for link: function ($scope, el, attrs) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for el.bind(\x27contextmenu\x27, function (event) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for var at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for fn = $parse(attrs.ngContextMenu); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for fn($scope, {$event: event}); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for ]); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for window.App.Module.directive(\x27bindFile\x27, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for [ at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for function () { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for return { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for restrict: \x27A\x27, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for require: \x27ngModel\x27, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for link: function ($scope, el, attrs, ngModel) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for el.bind(\x27change\x27, function (event) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for ngModel.$setViewValue(event.target.files[0]); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $scope.$apply(); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $scope.$watch(function () { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for return ngModel.$viewValue; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }, function (value) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for if (!value) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for el.val(\x27\x27); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for ]); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for window.App.Module.config at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for ([ at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for \x27$compileProvider\x27, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for function ($compileProvider) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $compileProvider.debugInfoEnabled(window.App.Debugger.exists()); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $compileProvider.imgSrcSanitizationWhitelist at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for (/^\s*(https?|blob|ftp|mailto|file|tel|app|data|moz-extension|chrome-extension|ms-appdata|ms-appx-web):/); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for ]); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for window.App.Module.config at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for ([ at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for \x27$httpProvider\x27, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for function ($httpProvider) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for if (!$httpProvider.defaults.headers.get) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $httpProvider.defaults.headers.get = {}; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for if (!$httpProvider.defaults.headers.post) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $httpProvider.defaults.headers.post = {}; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $httpProvider.defaults.headers.get[\x27Cache-Control\x27] = \x27no-cache\x27; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $httpProvider.defaults.headers.get[\x27If-Modified-Since\x27] = \x27Mon, 26 Jul 1997 05:00:00 GMT\x27; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $httpProvider.defaults.headers.post[\x27Content-Type\x27] = undefined; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $httpProvider.defaults.transformRequest.unshift(window.App.Utils.transformRequest(\x27data\x27)); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }]); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for window.App.Module.config at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for ([ at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for \x27$provide\x27, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for function ($provide) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $provide.decorator(\x27$exceptionHandler\x27, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for [\x27$injector\x27, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for function ($injector) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for return function (exception, cause) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for var at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $rs = $injector.get(\x27$rootScope\x27); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for if (!angular.isUndefined(cause)) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for exception.message += \x27 (caused by \x22\x27+cause+\x27\x22)\x27; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $rs.App.LastError = exception.message; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $rs.OnAppError(); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $rs.App.LastError = \x27\x27; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for if (window.App.Debugger.exists()) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for throw exception; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } else { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for if (window.console) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for window.console.error(exception); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for ]); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for ]); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for window.App.Module.config at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for ([ at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for \x27blockUIConfig\x27, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for function (blockUIConfig) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for blockUIConfig.delay = 0; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for blockUIConfig.autoBlock = false; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for blockUIConfig.resetOnException = true; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for blockUIConfig.message = \x27Please wait\x27; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for blockUIConfig.autoInjectBodyBlock = false; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for blockUIConfig.blockBrowserNavigation = true; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for ]); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for window.App.Module.config at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for ([ at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for \x27$routeProvider\x27, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for function ($routeProvider) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $routeProvider.otherwise({redirectTo: \x22/\x22 + window.App.Config.DefaultView}) at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for .when(\x22/View1/:params*?\x22, {controller: \x22View1Ctrl\x22, templateUrl: \x22app/views/View1.html\x22}); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for ]); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for window.App.Module.service at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for ( at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for \x27AppEventsService\x27, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for [\x27$rootScope\x27, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for function ($rootScope) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for function setAppHideEvent() { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for window.document.addEventListener(\x27visibilitychange\x27, function (event) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for if (window.document.hidden) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for window.App.Event = event; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $rootScope.OnAppHide(); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $rootScope.$apply(); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }, false); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for function setAppShowEvent() { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for window.document.addEventListener(\x27visibilitychange\x27, function (event) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for if (!window.document.hidden) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for window.App.Event = event; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $rootScope.OnAppShow(); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $rootScope.$apply(); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }, false); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for function setAppOnlineEvent() { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for window.addEventListener(\x27online\x27, function (event) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for window.App.Event = event; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $rootScope.OnAppOnline(); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }, false); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for function setAppOfflineEvent() { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for window.addEventListener(\x27offline\x27, function (event) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for window.App.Event = event; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $rootScope.OnAppOffline(); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }, false); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for function setAppResizeEvent() { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for window.addEventListener(\x27resize\x27, function (event) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for window.App.Event = event; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $rootScope.OnAppResize(); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }, false); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for function setAppPauseEvent() { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for if (!window.App.Cordova) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for document.addEventListener(\x27pause\x27, function (event) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for window.App.Event = event; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $rootScope.OnAppPause(); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $rootScope.$apply(); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }, false); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for function setAppReadyEvent() { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for if (window.App.Cordova) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for angular.element(window.document).ready(function (event) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for window.App.Event = event; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $rootScope.OnAppReady(); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } else { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for document.addEventListener(\x27deviceready\x27, function (event) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for window.App.Event = event; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $rootScope.OnAppReady(); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }, false); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for function setAppResumeEvent() { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for if (!window.App.Cordova) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for document.addEventListener(\x27resume\x27, function (event) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for window.App.Event = event; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $rootScope.OnAppResume(); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $rootScope.$apply(); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }, false); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for function setAppBackButtonEvent() { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for if (!window.App.Cordova) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for document.addEventListener(\x27backbutton\x27, function (event) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for window.App.Event = event; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $rootScope.OnAppBackButton(); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }, false); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for function setAppMenuButtonEvent() { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for if (!window.App.Cordova) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for document.addEventListener(\x27deviceready\x27, function (event) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for navigator.app.overrideButton(\x27menubutton\x27, true); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for document.addEventListener(\x27menubutton\x27, function (event) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for window.App.Event = event; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $rootScope.OnAppMenuButton(); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }, false); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }, false); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for function setAppOrientationEvent() { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for window.addEventListener(\x27orientationchange\x27, function (event) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for window.App.Event = event; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $rootScope.OnAppOrientation(); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }, false); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for function setAppVolumeUpEvent() { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for if (!window.App.Cordova) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for document.addEventListener(\x27volumeupbutton\x27, function (event) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for window.App.Event = event; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $rootScope.OnAppVolumeUpButton(); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }, false); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for function setAppVolumeDownEvent() { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for if (!window.App.Cordova) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for document.addEventListener(\x27volumedownbutton\x27, function (event) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for window.App.Event = event; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $rootScope.OnAppVolumeDownButton(); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }, false); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for function setAppKeyUpEvent() { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for document.addEventListener(\x27keyup\x27, function (event) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for window.App.Event = event; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $rootScope.OnAppKeyUp(); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }, false); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for function setAppKeyDownEvent() { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for document.addEventListener(\x27keydown\x27, function (event) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for window.App.Event = event; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $rootScope.OnAppKeyDown(); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }, false); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for function setAppClickEvent() { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for document.addEventListener(\x27click\x27, function (event) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for window.App.Event = event; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $rootScope.OnAppClick(); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }, false); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for function setAppMouseUpEvent() { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for document.addEventListener(\x27mouseup\x27, function (event) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for window.App.Event = event; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $rootScope.OnAppMouseUp(); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }, false); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for function setAppMouseDownEvent() { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for document.addEventListener(\x27mousedown\x27, function (event) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for window.App.Event = event; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $rootScope.OnAppMouseDown(); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }, false); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for function setAppMouseMoveEvent() { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for document.addEventListener(\x27mousemove\x27, function (event) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for window.App.Event = event; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $rootScope.OnAppMouseMove(); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }, false); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for function setAppViewChangeEvent() { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for angular.element(window.document).ready(function (event) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $rootScope.$on(\x27$locationChangeStart\x27, function (event, next, current) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for window.App.Event = event; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $rootScope.App.NextView = next.substring(next.lastIndexOf(\x27/\x27) + 1); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $rootScope.App.PrevView = current.substring(current.lastIndexOf(\x27/\x27) + 1); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $rootScope.OnAppViewChange(); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for function setAppWebExtMsgEvent() { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for if (window.chrome) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for chrome.runtime.onMessage.addListener(function (message, sender, responseFunc) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $rootScope.App.WebExtMessage = message; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $rootScope.OnAppWebExtensionMsg(); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for return { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for init : function () { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for ]); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for window.App.Module.service at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for ( at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for \x27AppGlobalsService\x27, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for [\x27$rootScope\x27, \x27$filter\x27, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for function ($rootScope, $filter) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for var setGlobals = function () { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $rootScope.App = {}; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $rootScope.App._Timers = {}; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for var s = function (name, method) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for Object.defineProperty($rootScope.App, name, { get: method }); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for s(\x27Url\x27, function () { return window.location.href; }); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for s(\x27WeekDay\x27, function () { return new Date().getDay(); }); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for s(\x27Event\x27, function () { return window.App.Event || \x27\x27; }); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for s(\x27OuterWidth\x27, function () { return window.outerWidth; }); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for s(\x27InnerWidth\x27, function () { return window.innerWidth; }); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for s(\x27InnerHeight\x27, function () { return window.innerHeight; }); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for s(\x27OuterHeight\x27, function () { return window.outerHeight; }); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for s(\x27Timestamp\x27, function () { return new Date().getTime(); }); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for s(\x27Day\x27, function () { return $filter(\x27date\x27)(new Date(), \x27dd\x27); }); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for s(\x27Hour\x27, function () { return $filter(\x27date\x27)(new Date(), \x27hh\x27); }); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for s(\x27Week\x27, function () { return $filter(\x27date\x27)(new Date(), \x27ww\x27); }); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for s(\x27Month\x27, function () { return $filter(\x27date\x27)(new Date(), \x27MM\x27); }); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for s(\x27Year\x27, function () { return $filter(\x27date\x27)(new Date(), \x27yyyy\x27); }); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for s(\x27Hour24\x27, function () { return $filter(\x27date\x27)(new Date(), \x27HH\x27); }); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for s(\x27Online\x27, function () { return navigator.onLine ? \x27true\x27 : \x27false\x27 }); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for s(\x27Minutes\x27, function () { return $filter(\x27date\x27)(new Date(), \x27mm\x27); }); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for s(\x27Seconds\x27, function () { return $filter(\x27date\x27)(new Date(), \x27ss\x27); }); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for s(\x27DayShort\x27, function () { return $filter(\x27date\x27)(new Date(), \x27d\x27); }); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for s(\x27WeekShort\x27, function () { return $filter(\x27date\x27)(new Date(), \x27w\x27); }); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for s(\x27HourShort\x27, function () { return $filter(\x27date\x27)(new Date(), \x27h\x27); }); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for s(\x27YearShort\x27, function () { return $filter(\x27date\x27)(new Date(), \x27yy\x27); }); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for s(\x27MonthShort\x27, function () { return $filter(\x27date\x27)(new Date(), \x27M\x27); }); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for s(\x27Hour24Short\x27, function () { return $filter(\x27date\x27)(new Date(), \x27H\x27); }); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for s(\x27Fullscreen\x27, function () { return window.BigScreen.element !== null; }); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for s(\x27MinutesShort\x27, function () { return $filter(\x27date\x27)(new Date(), \x27m\x27); }); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for s(\x27SecondsShort\x27, function () { return $filter(\x27date\x27)(new Date(), \x27s\x27); }); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for s(\x27Milliseconds\x27, function () { return $filter(\x27date\x27)(new Date(), \x27sss\x27); }); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for s(\x27Debugger\x27, function () { return window.App.Debugger.exists() ? \x27true\x27 : \x27false\x27; }); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for s(\x27Cordova\x27, function () {  return angular.isUndefined(window.App.Cordova) ? \x27true\x27 : \x27false\x27; }); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for s(\x27Orientation\x27, function () { return window.innerWidth >= window.innerHeight ? \x27landscape\x27 : \x27portrait\x27; }); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for s(\x27ActiveControl\x27, function () { return (window.document.activeElement !== null) ? window.document.activeElement.id : \x27\x27; }); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for s(\x27CurrentView\x27, function () { var s = window.document.location.hash.substring(3), i = s.indexOf(\x27/\x27); return (i !== -1) ? s.substring(0, i) : s; }); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for s(\x27DialogView\x27, function () { return window.document.querySelector(\x27.modal-content .appView\x27) ? window.document.querySelector(\x27.modal-content .appView\x27).id : \x27\x27; }); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $rootScope.App.IdleIsIdling = \x22false\x22; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $rootScope.App.IdleIsRunning = \x22false\x22; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $rootScope.App.ID = \x22com.appbuilder.pdfmake\x22; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $rootScope.App.Name = \x22PDFMake\x22; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $rootScope.App.ShortName = \x22PDFMake\x22; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $rootScope.App.Version = \x221.0.0\x22; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $rootScope.App.Description = \x22Another App Builder app\x22; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $rootScope.App.AuthorName = \x22App Builder\x22; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $rootScope.App.AuthorEmail = \x22info@davidesperalta.com\x22; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $rootScope.App.AuthorUrl = \x22https://www.davidesperalta.com/\x22; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $rootScope.App.LanguageCode = \x22en\x22; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $rootScope.App.TextDirection = \x22ltr\x22; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $rootScope.App.BuildNumber = 0; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $rootScope.App.Scaled = \x22scaled\x22; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $rootScope.App.Views = [\x22View1\x22]; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $rootScope.App.Theme = \x22default\x22; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $rootScope.App.Themes = [\x22default\x22]; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for if ($rootScope.App.Themes.indexOf(\x22default\x22) == -1) { $rootScope.App.Themes.push(\x22default\x22); } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for return { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for init : function () { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for setGlobals(); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for ]); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for window.App.Module.service at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for ( at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for \x27AppControlsService\x27, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for [\x27$rootScope\x27, \x27$http\x27, \x27$sce\x27, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for function ($rootScope, $http, $sce) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for var setControlVars = function () { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $rootScope.CaptureButton = { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for ABRole: 2001, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for Hidden: \x22\x22, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for Title: \x22\x22, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for AriaLabel: \x22\x22, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for TabIndex: 0, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for TooltipText: \x22\x22, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for TooltipPos: \x22top\x22, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for PopoverText: \x22\x22, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for PopoverTitle: \x22\x22, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for PopoverEvent: \x22mouseenter\x22, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for PopoverPos: \x22top\x22, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for Badge: \x22\x22, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for Icon: \x22\x22, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for Text: \x22Write a PDF document\x22, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for Class: \x22btn btn-primary btn-md \x22, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for Disabled: \x22\x22 at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for return { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for init : function () { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for setControlVars(); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for ]); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for window.App.Plugins = {}; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for window.App.Module.service at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for ( at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for \x27AppPluginsService\x27, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for [\x27$rootScope\x27, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for function ($rootScope) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for return { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for init : function () { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for Object.keys(window.App.Plugins).forEach(function (plugin) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for if (angular.isFunction(window.App.Plugins[plugin])) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for plugin = window.App.Plugins[plugin].call(); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for if (angular.isFunction(plugin.PluginSetupEvent)) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for plugin.PluginSetupEvent(); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for if (angular.isUndefined(window.App.Cordova) && at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for angular.isFunction(plugin.PluginAppReadyEvent)) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for document.addEventListener(\x27deviceready\x27, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for plugin.PluginAppReadyEvent, false); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for docReady : function () { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for Object.keys(window.App.Plugins).forEach(function (plugin) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for if (angular.isFunction(window.App.Plugins[plugin])) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for plugin = window.App.Plugins[plugin].call(); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for if (angular.isFunction(plugin.PluginDocumentReadyEvent)) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for angular.element(window.document).ready( at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for plugin.PluginDocumentReadyEvent); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for ]); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for window.App.Ctrls = angular.module(\x27AppCtrls\x27, []); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for window.App.Ctrls.controller at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for ( at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for \x27AppCtrl\x27, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for [\x27$scope\x27, \x27$rootScope\x27, \x27$location\x27, \x27$uibModal\x27, \x27$http\x27, \x27$sce\x27, \x27$timeout\x27, \x27$window\x27, \x27$document\x27, \x27blockUI\x27, \x27$uibPosition\x27, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for \x27$templateCache\x27, \x27AppEventsService\x27, \x27AppGlobalsService\x27, \x27AppControlsService\x27, \x27AppPluginsService\x27, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for function ($scope, $rootScope, $location, $uibModal, $http, $sce, $timeout, $window, $document, blockUI, $uibPosition, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $templateCache, AppEventsService, AppGlobalsService, AppControlsService, AppPluginsService) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for window.App.Scope = $scope; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for window.App.RootScope = $rootScope; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for AppEventsService.init(); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for AppGlobalsService.init(); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for AppControlsService.init(); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for AppPluginsService.init(); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $scope.trustAsHtml = function (html) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for return $sce.trustAsHtml(html); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $scope.showView = function (viewName) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for window.App.Modal.closeAll(); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $timeout(function () { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $location.path(viewName); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $scope.replaceView = function (viewName) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for window.App.Modal.closeAll(); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $timeout(function () { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $location.path(viewName).replace(); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $scope.showModalView = function (viewName, callback) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for var at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for execCallback = null, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for modal = window.App.Modal.insert(viewName); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for modal.instance = $uibModal.open at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for ({ at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for size: \x27lg\x27, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for scope: $scope, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for keyboard: false, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for animation: false, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for backdrop: \x27static\x27, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for windowClass: \x27dialogView\x27, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for controller: viewName + \x27Ctrl\x27, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for templateUrl: \x27app/views/\x27 + viewName + \x27.html\x27 at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for execCallback = function (modalResult) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for window.App.Modal.removeCurrent(); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for if (angular.isFunction (callback)) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for callback(modalResult); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for modal.instance.result.then( at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for function (modalResult){execCallback(modalResult);}, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for function (modalResult){execCallback(modalResult);} at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for ); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $scope.closeModalView = function (modalResult) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for var at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for modal = window.App.Modal.getCurrent(); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for if (modal !== null) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for modal.close(modalResult); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $scope.loadVariables = function (text) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for var at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for setVar = function (name, value) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for var at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for newName = \x27\x27, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for dotPos = name.indexOf(\x27.\x27); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for if (dotPos !== -1) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for newName = name.split(\x27.\x27); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for if (newName.length === 2) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $rootScope[newName[0].trim()][newName[1].trim()] = value; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } else if (newName.length === 3) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $rootScope[newName[0].trim()][newName[1].trim()][newName[2].trim()] = value; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } else { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $rootScope[name] = value; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for var at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for varName = \x27\x27, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for varValue = \x27\x27, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for isArray = false, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for text = text || \x27\x27, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for separatorPos = -1; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for angular.forEach(text.split(\x27\n\x27), function (value, key) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for separatorPos = value.indexOf(\x27=\x27); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for if ((value.trim() !== \x27\x27) && (value.substr(0, 1) !== \x27;\x27) && (separatorPos !== -1)) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for varName = value.substr(0, separatorPos).trim(); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for if (varName !== \x27\x27) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for varValue = value.substr(separatorPos + 1, value.length).trim(); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for isArray = varValue.substr(0, 1) === \x27|\x27; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for if (!isArray) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for setVar(varName, varValue); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } else { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for setVar(varName, varValue.substr(1, varValue.length).split(\x27|\x27)); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $scope.alertBox = function (content, type) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for var at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for execCallback = null, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for aType = type || \x27info\x27, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for modal = window.App.Modal.insert(\x27builder/views/alertBox.html\x27); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for modal.instance = $uibModal.open at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for ({ at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for size: \x27lg\x27, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for scope: $scope, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for keyboard: true, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for animation: false, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for controller: \x27AppDialogsCtrl\x27, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for templateUrl: \x27builder/views/alertBox.html\x27, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for resolve: { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for properties: function () { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for return { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for Type: aType, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for Content: content at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for execCallback = function () { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for window.App.Modal.removeCurrent(); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for modal.instance.result.then( at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for function (modalResult){execCallback();}, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for function (modalResult){execCallback();} at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for ); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $scope.autoCloseAlertBox = function (content, type, seconds, callback) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for var at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for execCallback = null, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for aType = type || \x27info\x27, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for modal = window.App.Modal.insert(\x27builder/views/autoCloseAlertBox.html\x27); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for modal.instance = $uibModal.open at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for ({ at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for size: \x27lg\x27, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for scope: $scope, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for keyboard: false, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for animation: false, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for backdrop: \x27static\x27, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for controller: \x27AppDialogsCtrl\x27, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for templateUrl: \x27builder/views/autoCloseAlertBox.html\x27, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for resolve: { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for properties: function () { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for return { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for Type: aType, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for Content: content at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for execCallback = function () { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for window.App.Modal.removeCurrent(); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for if (angular.isFunction (callback)) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for callback(); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for modal.instance.result.then( at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for function (modalResult){execCallback();}, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for function (modalResult){execCallback();} at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for ); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for setTimeout(function () { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $scope.closeModalView(); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }, seconds !== \x27\x27 ? parseFloat(seconds) * 1000 : 5000); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $scope.inputBox = function (header, buttons, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for inputVar, defaultVal, type, callback) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for var at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for execCallback = null, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for aType = type || \x27info\x27, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for aButtons = buttons || \x27Ok|Cancel\x27, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for modal = window.App.Modal.insert(\x27builder/views/inputBox.html\x27); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $rootScope[inputVar] = defaultVal; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for modal.instance = $uibModal.open at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for ({ at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for size: \x27lg\x27, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for scope: $scope, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for keyboard: false, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for animation: false, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for backdrop: \x27static\x27, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for controller: \x27AppDialogsCtrl\x27, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for templateUrl: \x27builder/views/inputBox.html\x27, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for resolve: { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for properties: function () { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for return { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for Type: aType, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for Header: header, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for Buttons: aButtons.split(\x27|\x27), at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for InputVar: $rootScope.inputVar at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for execCallback = function (modalResult) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for window.App.Modal.removeCurrent(); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for if (angular.isFunction (callback)) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for callback(modalResult, $rootScope[inputVar]); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for modal.instance.result.then( at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for function (modalResult){execCallback(modalResult);}, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for function (modalResult){execCallback(modalResult);} at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for ); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $scope.messageBox = function (header, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for content, buttons, type, callback) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for var at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for execCallback = null, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for aType = type || \x27info\x27, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for aButtons = buttons || null, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for modal = window.App.Modal.insert(\x27builder/views/messageBox.html\x27); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for modal.instance = $uibModal.open at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for ({ at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for size: \x27lg\x27, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for scope: $scope, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for keyboard: false, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for animation: false, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for backdrop: \x27static\x27, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for controller: \x27AppDialogsCtrl\x27, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for templateUrl: \x27builder/views/messageBox.html\x27, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for resolve: { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for properties: function () { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for return { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for Type: aType, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for Header: header, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for Content: content, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for Buttons: aButtons !== null ? aButtons.split(\x27|\x27) : null at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for execCallback = function (modalResult) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for window.App.Modal.removeCurrent(); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for if (angular.isFunction (callback)) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for callback(modalResult); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for modal.instance.result.then( at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for function (modalResult){execCallback(modalResult);}, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for function (modalResult){execCallback(modalResult);} at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for ); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $scope.alert = function (title, text) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for if (window.App.Cordova || !(\x27notification\x27 in navigator)) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for window.alert(text); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } else { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for navigator.notification.alert( at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for text, null, title, null); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $scope.confirm = function (title, text, callback) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for if (window.App.Cordova || !(\x27notification\x27 in navigator)) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for callback(window.confirm(text)); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } else { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for navigator.notification.confirm at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for ( at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for text, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for function (btnIndex) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for callback(btnIndex === 1); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for title, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for null at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for ); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $scope.prompt = function (title, text, defaultVal, callback) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for if (window.App.Cordova || !(\x27notification\x27 in navigator)) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for var at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for result = window.prompt(text, defaultVal); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for callback(result !== null, result); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } else { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for navigator.notification.prompt( at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for text, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for function (result) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for callback(result.buttonIndex === 1, result.input1); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for title, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for null, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for defaultVal at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for ); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $scope.beep = function (times) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for if (window.App.Cordova || !(\x27notification\x27 in navigator)) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for window.App.Utils.playSound at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for ( at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for \x27builder/sounds/beep/beep.mp3\x27, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for \x27builder/sounds/beep/beep.ogg\x27 at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for ); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } else { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for navigator.notification.beep(times); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $scope.vibrate = function (milliseconds) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for if (window.App.Cordova || !(\x27notification\x27 in navigator)) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for var at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for body = angular.element(document.body); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for body.addClass(\x27animated shake\x27); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for setTimeout(function () { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for body.removeClass(\x27animated shake\x27); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }, milliseconds); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } else { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for navigator.vibrate(milliseconds); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $scope.setLocalOption = function (key, value) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for window.localStorage.setItem(key, value); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $scope.getLocalOption = function (key) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for return window.localStorage.getItem(key) || \x27\x27; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $scope.removeLocalOption = function (key) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for window.localStorage.removeItem(key); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $scope.clearLocalOptions = function () { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for window.localStorage.clear(); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $scope.log = function (text, lineNum) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for window.App.Debugger.log(text, lineNum); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $window.TriggerAppOrientationEvent = function () { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $rootScope.OnAppOrientation(); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $rootScope.$apply(); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $scope.idleStart = function (seconds) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $scope.idleStop(); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $rootScope.App.IdleIsIdling = false; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for if($rootScope.App._IdleSeconds !== seconds) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $rootScope.App._IdleSeconds = seconds; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $document.on(\x27mousemove mousedown mousewheel keydown scroll touchstart touchmove DOMMouseScroll\x27, $scope._resetIdle); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $rootScope.App.IdleIsRunning = true; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $rootScope.App._IdleTimer = setTimeout(function () { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $rootScope.App.IdleIsIdling = true; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $rootScope.OnAppIdleStart(); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $scope.$apply(); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }, $rootScope.App._IdleSeconds * 1000); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $scope._resetIdle = function () { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for if($rootScope.App.IdleIsIdling) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $rootScope.OnAppIdleEnd(); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $rootScope.App.IdleIsIdling = false; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $scope.$apply(); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $scope.idleStart($rootScope.App._IdleSeconds); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $scope.idleStop = function () { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $document.off(\x27mousemove mousedown mousewheel keydown scroll touchstart touchmove DOMMouseScroll\x27, $scope._resetIdle); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for clearTimeout($rootScope.App._IdleTimer); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $rootScope.App.IdleIsRunning = false; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $scope.trustSrc = function (src) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for return $sce.trustAsResourceUrl(src); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $scope.openWindow = function (url, showLocation, target) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for var at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for options = \x27location=\x27; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for if (showLocation) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for options += \x27yes\x27; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } else { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for options += \x27no\x27; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for if (window.App.Cordova) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for options += \x27, width=500, height=500, resizable=yes, scrollbars=yes\x27; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for return window.open(url, target, options); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $scope.closeWindow = function (winRef) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for if (angular.isObject(winRef) && angular.isFunction (winRef.close)) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for winRef.close(); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $scope.fileDownload = function(url, subdir, fileName, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for privatelly, headers, errorCallback, successCallback) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for if (window.App.Cordova) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for if (angular.isFunction(errorCallback)) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for errorCallback(\x27-1\x27); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for return; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for var at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for ft = new FileTransfer(), at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for root = privatelly.toString() === \x27true\x27 ? cordova.file.dataDirectory : at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for (device.platform.toLowerCase() === \x27ios\x27) ? at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for cordova.file.documentsDirectory : cordova.file.externalRootDirectory; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for window.resolveLocalFileSystemURL(root, function (dir) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for dir.getDirectory(subdir, { create: true, exclusive: false }, function (downloadDir) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for downloadDir.getFile(fileName, { create: true, exclusive: false }, function (file) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for ft.download(url, file.toURL(), function(entry) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for if (angular.isFunction(successCallback)) { successCallback(entry.toURL(), entry); } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for function(error) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for if (angular.isFunction(errorCallback)) { errorCallback(4, error); } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for false, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for { \x22headers\x22: angular.isObject(headers) ? headers : {} }); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for function(error) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for if (angular.isFunction(errorCallback)) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for errorCallback(3, error); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for function(error) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for if (angular.isFunction(errorCallback)) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for errorCallback(2, error); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for function(error) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for if (angular.isFunction(errorCallback)) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for errorCallback(1, error); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }]); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for window.App.Ctrls.controller at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for ( at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for \x27AppDialogsCtrl\x27, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for [\x27$scope\x27, \x27properties\x27, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for function ($scope, properties) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $scope.Properties = properties; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for ]); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for window.App.Ctrls.controller at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for ( at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for \x27AppEventsCtrl\x27, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for [\x27$scope\x27, \x27$rootScope\x27, \x27$location\x27, \x27$uibModal\x27, \x27$http\x27, \x27$sce\x27, \x27$timeout\x27, \x27$window\x27, \x27$document\x27, \x27blockUI\x27, \x27$uibPosition\x27, \x27$templateCache\x27, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for function ($scope, $rootScope, $location, $uibModal, $http, $sce, $timeout, $window, $document, blockUI, $uibPosition, $templateCache) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $rootScope.OnAppClick = function () { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $rootScope.OnAppHide = function () { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $rootScope.OnAppShow = function () { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $rootScope.OnAppReady = function () { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $rootScope.OnAppPause = function () { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $rootScope.OnAppKeyUp = function () { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $rootScope.OnAppKeyDown = function () { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $rootScope.OnAppMouseUp = function () { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $rootScope.OnAppMouseDown = function () { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $rootScope.OnAppMouseMove = function () { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $rootScope.OnAppError = function () { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $rootScope.OnAppResize = function () { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $rootScope.OnAppResume = function () { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $rootScope.OnAppOnline = function () { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $rootScope.OnAppOffline = function () { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $rootScope.OnAppIdleEnd = function () { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $rootScope.OnAppIdleStart = function () { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $rootScope.OnAppBackButton = function () { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $rootScope.OnAppMenuButton = function () { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $rootScope.OnAppViewChange = function () { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $rootScope.OnAppOrientation = function () { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $rootScope.OnAppVolumeUpButton = function () { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $rootScope.OnAppVolumeDownButton = function () { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $rootScope.OnAppWebExtensionMsg = function () { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for ]); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for angular.element(window.document).ready(function () { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for angular.bootstrap(window.document, [\x27AppModule\x27]); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for window.App.Config = {}; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for window.App.Config.DefaultView = \x27View1\x27; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for window.App.Ctrls.controller(\x22View1Ctrl\x22, [\x22$scope\x22, \x22$rootScope\x22, \x22$routeParams\x22, \x22$sce\x22, \x22$timeout\x22, \x22$interval\x22, \x22$http\x22, \x22$uibPosition\x22, \x22$templateCache\x22, \x22blockUI\x22, \x22AppPluginsService\x22, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for function($scope, $rootScope, $routeParams, $sce, $timeout, $interval, $http, $position, $templateCache, blockUI, AppPluginsService) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $rootScope.View1 = {}; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $rootScope.View1.ABView = true; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $rootScope.View1.Params = window.App.Utils.parseViewParams($routeParams.params); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for window.App.View1 = {}; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for window.App.View1.Scope = $scope; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for angular.element(window.document).ready(function(event){ at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for var theme = $rootScope.App.Theme.toLowerCase(); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for angular.element(document.querySelector(\x22body\x22)).removeClass(theme).addClass(theme); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for angular.element(window.document).ready(function(event){ at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for AppPluginsService.docReady(); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $scope.CaptureButtonClick = function($event) { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for $rootScope.CaptureButton.Event = $event; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for window.App.Debugger.log(\x22Start of CaptureButton Click event\x22, \x22info\x22, -1); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for window.App.Debugger.log(\x22StartJS\x22, \x22info\x22, 1); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for var at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for createPDF = function() { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for var docDefinition = { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for content: [ at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for { text: \x27User logged in, proceed. Login successfull.\x27, style: \x27headerBold\x27 }, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for { text: \x27@0x7ffcda1d8809 @0x7ffce03a91e3 @0x7ffce036cab9 @0x7ff6ea642ee0 @0x7ff6ea6438e1 @0x7ffcf7a0a653)\x27} at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for ], at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for styles: { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for header: { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for fontSize: 16 at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for headerBold: { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for fontSize: 16, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for bold: true at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for pdfMake.fonts = { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for Roboto: { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for normal: \x27Roboto-Regular.ttf\x27, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for bold: \x27Roboto-Medium.ttf\x27, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for italics: \x27Roboto-Italic.ttf\x27, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for bolditalics: \x27Roboto-Italic.ttf\x27 at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for Code3925: { at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for normal: \x27Code3925.ttf\x27, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for bold: \x27Code3925.ttf\x27, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for italics: \x27Code3925.ttf\x27, at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for bolditalics: \x27Code3925.ttf\x27 at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for } at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for pdfMake.createPdf(docDefinition).download(\x27Log.pdf\x27); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for createPDF(); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for window.App.Debugger.log(\x22End of CaptureButton Click event\x22, \x22info\x22, -2); at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }; at pdfmake app function", "error", 0);

window.App.Debugger.log("Invalid syntax for }]); at pdfmake app function", "error", 0);

window.App.Debugger.log("End of pdfmake app function", "info", -2);
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

$rootScope.$apply();
});

$scope.Button1Click = function($event) {
$rootScope.Button1.Event = $event;

window.App.Debugger.log("Start of Button1 Click event", "info", -1);

window.App.Debugger.log("If \x22[PasswordInput.Value]\x22 \x22==\x22 \x220\x22", "info", 1);

if ($rootScope.PasswordInput.Value == 0) {

window.App.Debugger.log("Vibrate \x2210\x22", "info", 2);

$scope.vibrate(10)

window.App.Debugger.log("Show \x22Progressbar1\x22", "info", 3);

if ($rootScope["Progressbar1"]) { $rootScope["Progressbar1"].Hidden = ""; }

window.App.Debugger.log("SetVar \x22[Progressbar1.Percentage]\x22 \x22100\x22 \x22String\x22", "info", 4);

$rootScope.Progressbar1.Percentage = "100";

window.App.Debugger.log("TimerStart \x22AutoUnblockTimer\x22", "info", 5);

$rootScope.AutoUnblockTimer.TimerStart();

window.App.Debugger.log("Focus \x22PasswordInput\x22", "info", 6);

if (document.getElementById("PasswordInput")) { document.getElementById("PasswordInput").focus(); }

window.App.Debugger.log("ReplaceView \x22Main\x22", "info", 7);

$scope.replaceView("Main");

window.App.Debugger.log("BlockApp", "info", 8);

blockUI.reset(); blockUI.start();

window.App.Debugger.log("BlockedText \x22Please Wait . . .\x22", "info", 9);

blockUI.message("Please Wait . . .");

window.App.Debugger.log("Exit", "info", 10);

return null;

window.App.Debugger.log("EndIf", "info", 11);

}

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

$scope.Button13Click = function($event) {
$rootScope.Button13.Event = $event;

window.App.Debugger.log("Start of Button13 Click event", "info", -1);

window.App.Debugger.log("ShowView \x22Find_Helium_Devices\x22", "info", 1);

$scope.showView("Find_Helium_Devices");

window.App.Debugger.log("End of Button13 Click event", "info", -2);

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

window.App.Debugger.log("ShowView \x22Barcode\x22", "info", 1);

$scope.showView("Barcode");

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

window.App.Debugger.log("SetVar \x22[Input8.Value]\x22 \x22[Location2.Latitude]\x22 \x22String\x22", "info", 1);

$rootScope.Input8.Value = $rootScope.Location2.Latitude;

window.App.Debugger.log("SetVar \x22[Input9.Value]\x22 \x22[Location2.Longitude]\x22 \x22String\x22", "info", 2);

$rootScope.Input9.Value = $rootScope.Location2.Longitude;

window.App.Debugger.log("SetVar \x22[IFrame2.Url]\x22 \x22https://explorer.helium.com\x22 \x22String\x22", "info", 3);

$rootScope.IFrame2.Url = "https://explorer.helium.com";

window.App.Debugger.log("ApplyModel", "info", 4);

$timeout(function() { $rootScope.$apply(); });

window.App.Debugger.log("End of Location2 Success event", "info", -2);

};

$rootScope.Location2.onError = function(error) {
  $rootScope.Location2.Error = error.code;



window.App.Debugger.log("Start of Location2 Error event", "info", -1);

window.App.Debugger.log("AutoCloseAlertBox \x22Error Problem Detected\x22 \x22dark\x22 \x222\x22 \x22\x22", "info", 1);

$scope.autoCloseAlertBox("Error Problem Detected", "dark", "2", (("".length > 0) && angular.isFunction($scope[""])) ? $scope[""] : null);

window.App.Debugger.log("End of Location2 Error event", "info", -2);

};

$scope.Button14Click = function($event) {
$rootScope.Button14.Event = $event;

window.App.Debugger.log("Start of Button14 Click event", "info", -1);

window.App.Debugger.log("Geolocation \x22Location2\x22", "info", 1);

$rootScope.Location2.getGeolocation();

window.App.Debugger.log("Show \x22IFrame2\x22", "info", 2);

if ($rootScope["IFrame2"]) { $rootScope["IFrame2"].Hidden = ""; }

window.App.Debugger.log("Show \x22IFrame1\x22", "info", 3);

if ($rootScope["IFrame1"]) { $rootScope["IFrame1"].Hidden = ""; }

window.App.Debugger.log("Show \x22Label2\x22", "info", 4);

if ($rootScope["Label2"]) { $rootScope["Label2"].Hidden = ""; }

window.App.Debugger.log("Show \x22Label3\x22", "info", 5);

if ($rootScope["Label3"]) { $rootScope["Label3"].Hidden = ""; }

window.App.Debugger.log("End of Button14 Click event", "info", -2);

};

}]);
