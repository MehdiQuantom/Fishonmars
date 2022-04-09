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
    .when("/Luncher/:params*?", {controller: "LuncherCtrl", templateUrl: "app/views/Luncher.html"});
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
$rootScope.App.BuildNumber = 33;
$rootScope.App.Scaled = "scaled";
$rootScope.App.Views = ["Login", "Main", "Location", "Camera", "Luncher"];
$rootScope.App.Theme = "default";
$rootScope.App.Themes = ["default"];
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
  Text: "Button5",
  Class: "btn btn-primary btn-md ",
  Disabled: ""
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

$scope.Button1Click = function($event) {
$rootScope.Button1.Event = $event;

window.App.Debugger.log("Start of Button1 Click event", "info", -1);

window.App.Debugger.log("If \x22[PasswordInput.Value]\x22 \x22==\x22 \x221\x22", "info", 1);

if ($rootScope.PasswordInput.Value == 1) {

window.App.Debugger.log("Vibrate \x2210\x22", "info", 2);

$scope.vibrate(10)

window.App.Debugger.log("ReplaceView \x22Main\x22", "info", 3);

$scope.replaceView("Main");

window.App.Debugger.log("Focus \x22LoginInput\x22", "info", 4);

if (document.getElementById("LoginInput")) { document.getElementById("LoginInput").focus(); }

window.App.Debugger.log("Exit", "info", 5);

return null;

window.App.Debugger.log("EndIf", "info", 6);

}

window.App.Debugger.log("End of Button1 Click event", "info", -2);

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

window.App.Debugger.log("Start of Main Show event", "info", -1);

window.App.Debugger.log("AutoCloseAlertBox \x22Successful !\x22 \x22success\x22 \x222\x22 \x22\x22", "info", 1);

$scope.autoCloseAlertBox("Successful !", "success", "2", (("".length > 0) && angular.isFunction($scope[""])) ? $scope[""] : null);

window.App.Debugger.log("End of Main Show event", "info", -2);

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

window.App.Debugger.log("Start of Luncher Show event", "info", -1);

window.App.Debugger.log("If \x22[App.Cordova]\x22 \x22==\x22 \x22false\x22", "info", 1);

if ($rootScope.App.Cordova ==  "false" ) {

window.App.Debugger.log("Disable \x22Input1\x22", "info", 2);

if ($rootScope["Input1"]) { $rootScope["Input1"].Disabled = "true"; }

window.App.Debugger.log("Disable \x22Button1\x22", "info", 3);

if ($rootScope["Button1"]) { $rootScope["Button1"].Disabled = "true"; }

window.App.Debugger.log("Disable \x22Button2\x22", "info", 4);

if ($rootScope["Button2"]) { $rootScope["Button2"].Disabled = "true"; }

window.App.Debugger.log("Disable \x22Button3\x22", "info", 5);

if ($rootScope["Button3"]) { $rootScope["Button3"].Disabled = "true"; }

window.App.Debugger.log("EndIf", "info", 6);

}

window.App.Debugger.log("End of Luncher Show event", "info", -2);

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
