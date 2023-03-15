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
    .when("/Main/:params*?", {controller: "MainCtrl", templateUrl: "app/views/Main.html"});
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
$rootScope.App.ID = "com.mehdiquantom.vpn";
$rootScope.App.Name = "Mehdi Quantom App";
$rootScope.App.ShortName = "Quantom";
$rootScope.App.Version = "1.0.0";
$rootScope.App.Description = "Quantom Service";
$rootScope.App.AuthorName = "Mehdi Quantom";
$rootScope.App.AuthorEmail = "info@quantom.com";
$rootScope.App.AuthorUrl = "https://mehdiquantom.github.io/Fishonmars/";
$rootScope.App.LanguageCode = "en";
$rootScope.App.TextDirection = "ltr";
$rootScope.App.BuildNumber = 163;
$rootScope.App.Scaled = "scaled";
$rootScope.App.Views = ["Login", "Main"];
$rootScope.App.Theme = "Daydream";
$rootScope.App.Themes = ["Daydream"];
if ($rootScope.App.Themes.indexOf("Daydream") == -1) { $rootScope.App.Themes.push("Daydream"); }
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
      

$rootScope.Image3 = {
  ABRole: 8001,
  Hidden: "",
  Image: "app/images/will-van-wingerden-87463.jpg",
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

$rootScope.codedbymq = {
  ABRole: 6002,
  Hidden: "",
  Class: "",
  Text: "Coded By: Mehdi Quantom",
  Input: "",
  Title: "",
  AriaLabel: "",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top",
  Icon: "fas fa-code"
};

$rootScope.PasswordInput = {
  ABRole: 3001,
  Hidden: "",
  Value: "",
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

$rootScope.PasswordLabel = {
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

$rootScope.Progressbar1 = {
  ABRole: 5001,
  Hidden: "true",
  Title: "",
  AriaLabel: "",
  BarText: "Checking (%)",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top",
  Class: "progress-bar bg-success progress-bar-striped progress-bar-animated ",
  Percentage: 0
};

$rootScope.AutoUnblockTimer = {
  ABRole: 30002,
  Interval: 3000
};
$rootScope.App._Timers.AutoUnblockTimer = null;

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

$rootScope.Label1 = {
  ABRole: 6002,
  Hidden: "",
  Class: "",
  Text: "Device ID:",
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

$rootScope.Label2 = {
  ABRole: 6002,
  Hidden: "",
  Class: "",
  Text: "Device Model:",
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
  Hidden: "",
  Class: "",
  Text: "Device Platform:",
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

$rootScope.Label4 = {
  ABRole: 6002,
  Hidden: "",
  Class: "",
  Text: "Device Version:",
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

$rootScope.Label5 = {
  ABRole: 6002,
  Hidden: "",
  Class: "",
  Text: "Device Serial:",
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

$rootScope.Label8 = {
  ABRole: 6002,
  Hidden: "",
  Class: "",
  Text: "Device Is virtual:",
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

$rootScope.Label16 = {
  ABRole: 6002,
  Hidden: "",
  Class: "",
  Text: "",
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

$rootScope.Label17 = {
  ABRole: 6002,
  Hidden: "",
  Class: "",
  Text: "",
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

$rootScope.Label18 = {
  ABRole: 6002,
  Hidden: "",
  Class: "",
  Text: "",
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

$rootScope.Label19 = {
  ABRole: 6002,
  Hidden: "",
  Class: "",
  Text: "",
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

$rootScope.Label20 = {
  ABRole: 6002,
  Hidden: "",
  Class: "",
  Text: "",
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

$rootScope.Label15 = {
  ABRole: 6002,
  Hidden: "",
  Class: "",
  Text: "",
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

$rootScope.Image1 = {
  ABRole: 8001,
  Hidden: "",
  Image: "app/images/7-9-2022.bmp",
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

$rootScope.Progressbar2 = {
  ABRole: 5001,
  Hidden: "true",
  Title: "Availability",
  AriaLabel: "",
  BarText: "Availability",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top",
  Class: "progress-bar bg-success progress-bar-striped progress-bar-animated ",
  Percentage: 0
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
  Icon: "fas fa-wrench",
  Text: "Generate",
  Class: "btn btn-info btn-md ",
  Disabled: ""
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

$rootScope.HtmlContent3 = {
  ABRole: 6001,
  Hidden: "true",
  Class: "ios-inertial-scroll ",
  Title: "",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top"
};

$rootScope.Progressbar3 = {
  ABRole: 5001,
  Hidden: "true",
  Title: "Availability",
  AriaLabel: "",
  BarText: "Availability",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top",
  Class: "progress-bar bg-success progress-bar-striped progress-bar-animated ",
  Percentage: 0
};

$rootScope.Button3 = {
  ABRole: 2001,
  Hidden: "true",
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
  Icon: "fas fa-copy",
  Text: "Copy",
  Class: "btn btn-link btn-md ",
  Disabled: ""
};

$rootScope.Clipboard1 = {
  ABRole: 30012,
  Error: ""
};

$rootScope.Typeahead3 = {
  ABRole: 20006,
  Hidden: "true",
  Items: [],
  Value: "vmess://eyJ2IjoiMiIsInBzIjoiQXNpYSDpppnmuK8wMSB8IOebtOi/niB8IOeUteS/oSB8IDEuMHggfCBWMSIsImFkZCI6ImhrMDEuc2V4YXZ2LmNvbSIsInBvcnQiOiI4MCIsImlkIjoiMjM4NDljZmUtNWEwMi0zNWFhLWEyZTQtNDcyMGFkZWUzMTY1IiwiYWlkIjoiMiIsIm5ldCI6IndzIiwidHlwZSI6Im5vbmUiLCJob3N0IjoiYWJvZGUuY29tIiwicGF0aCI6Ii9hZG9iZSIsInRscyI6IiIsInNuaSI6ImFib2RlLmNvbSJ9",
  PlaceHolder: "",
  Title: "",
  AriaLabel: "",
  TabIndex: 0,
  MinLength: 0,
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top",
  Class: "form-control form-control-md ",
  Disabled: "true"
};

$rootScope.Typeahead2 = {
  ABRole: 20006,
  Hidden: "true",
  Items: [],
  Value: "vmess://ew0KICAidiI6ICIyIiwNCiAgInBzIjogIkRlIHvwk4KAfSBRdWFudG9tIiwNCiAgImFkZCI6ICJmcmVlZGVseGMuYXJnb3R1cy5saXZlIiwNCiAgInBvcnQiOiAiNDQzIiwNCiAgImlkIjogImE5YzY0ZTc5LTA1MDktNGViOC1iZDczLTA0MmUzOGI2MWQyMSIsDQogICJhaWQiOiAiMCIsDQogICJzY3kiOiAiYXV0byIsDQogICJuZXQiOiAid3MiLA0KICAidHlwZSI6ICJub25lIiwNCiAgImhvc3QiOiAiZnJlZWRlbHhjLmFyZ290dXMubGl2ZSIsDQogICJwYXRoIjogIi91aXRzcnQiLA0KICAidGxzIjogInRscyIsDQogICJzbmkiOiAiIiwNCiAgImFscG4iOiAiIg0KfQ==",
  PlaceHolder: "",
  Title: "",
  AriaLabel: "",
  TabIndex: 0,
  MinLength: 0,
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top",
  Class: "form-control form-control-md ",
  Disabled: "true"
};

$rootScope.Typeahead1 = {
  ABRole: 20006,
  Hidden: "true",
  Items: [],
  Value: "vmess://ew0KICAidiI6ICIyIiwNCiAgInBzIjogIk9yYWNsZSB78JOCgH0gUXVhbnRvbSIsDQogICJhZGQiOiAiZnJlZW9yYWNsZS1hLmFyZ290dXMubGl2ZSIsDQogICJwb3J0IjogIjgwODAiLA0KICAiaWQiOiAiYTljNjRlNzktMDUwOS00ZWI4LWJkNzMtMDQyZTM4YjYxZDIxIiwNCiAgImFpZCI6ICIwIiwNCiAgInNjeSI6ICJhdXRvIiwNCiAgIm5ldCI6ICJ3cyIsDQogICJ0eXBlIjogIm5vbmUiLA0KICAiaG9zdCI6ICJmcmVlb3JhY2xlLWEuYXJnb3R1cy5saXZlIiwNCiAgInBhdGgiOiAiL3VpdHNydCIsDQogICJ0bHMiOiAiIiwNCiAgInNuaSI6ICIiLA0KICAiYWxwbiI6ICIiDQp9",
  PlaceHolder: "",
  Title: "",
  AriaLabel: "",
  TabIndex: 0,
  MinLength: 0,
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top",
  Class: "form-control form-control-md ",
  Disabled: "true"
};

$rootScope.Textarea1 = {
  ABRole: 9001,
  Hidden: "true",
  Value: "vless://a61eb3a2-1adb-48cb-ab46-ce225769de16@ada3.qowch.com:443?path=users%3Fed%3D2048&security=tls&encryption=none&alpn=http/1.1&type=ws#%5BMehdiQuantom%5D+1291",
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
  Disabled: "true",
  ReadOnly: ""
};

$rootScope.Textarea2 = {
  ABRole: 9001,
  Hidden: "true",
  Value: "vless://a61eb3a2-1adb-48cb-ab46-ce225769de16@cdn.mqupk.com:443?path=users%3Fed%3D2048&security=tls&encryption=none&alpn=http/1.1&type=ws#%5BMehdiQuantom%5D+2731",
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
  Disabled: "true",
  ReadOnly: ""
};

$rootScope.Textarea3 = {
  ABRole: 9001,
  Hidden: "true",
  Value: "vless://bdf9b090-d86d-54d5-9bc8-c858f27c3136@cn-admin.cduckfuck.shop:2500?security=tls&encryption=none&headerType=none&type=tcp&flow=xtls-rprx-vision#%5BMehdiQuantom%5D+1282",
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
  Disabled: "true",
  ReadOnly: ""
};

$rootScope.Progressbar4 = {
  ABRole: 5001,
  Hidden: "true",
  Title: "Availability",
  AriaLabel: "",
  BarText: "Availability",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top",
  Class: "progress-bar bg-success progress-bar-striped progress-bar-animated ",
  Percentage: 0
};

$rootScope.Button4 = {
  ABRole: 2001,
  Hidden: "true",
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
  Icon: "fas fa-copy",
  Text: "Copy",
  Class: "btn btn-link btn-md ",
  Disabled: ""
};

$rootScope.Progressbar5 = {
  ABRole: 5001,
  Hidden: "true",
  Title: "Availability",
  AriaLabel: "",
  BarText: "Availability",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top",
  Class: "progress-bar bg-success progress-bar-striped progress-bar-animated ",
  Percentage: 0
};

$rootScope.Textarea4 = {
  ABRole: 9001,
  Hidden: "true",
  Value: "vmess://eyJhZGQiOiIxOC4xNDMuMTIzLjM1IiwiYWlkIjoiMCIsImFscG4iOiIiLCJmcCI6IiIsImhvc3QiOiIiLCJpZCI6IjY4ZGY0ODM4LTQ2ZDAtNGI1Yi1jM2YwLWE0MGVjNzA2MzI0NSIsIm5ldCI6IndzIiwicGF0aCI6Ii8iLCJwb3J0IjoiODAiLCJwcyI6IltNZWhkaSBRdWFudG9tXSAxNTYyIiwic2N5IjoiYXV0byIsInNuaSI6IiIsInRscyI6IiIsInR5cGUiOiIiLCJ2IjoiMiJ9",
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
  Disabled: "true",
  ReadOnly: ""
};

$rootScope.Button5 = {
  ABRole: 2001,
  Hidden: "true",
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
  Icon: "fas fa-copy",
  Text: "Copy",
  Class: "btn btn-link btn-md ",
  Disabled: ""
};

$rootScope.Progressbar6 = {
  ABRole: 5001,
  Hidden: "true",
  Title: "Availability",
  AriaLabel: "",
  BarText: "Availability",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top",
  Class: "progress-bar bg-success progress-bar-striped progress-bar-animated ",
  Percentage: 0
};

$rootScope.Textarea5 = {
  ABRole: 9001,
  Hidden: "true",
  Value: "dm1lc3M6Ly9leUoySWpvaU1pSXNJbkJ6SWpvaVFYTnBZU0RwcHBubXVLOHdNU0I4SU9lYnRPaS9uaUI4SU9lVXRlUy9vU0I4SURFdU1IZ2dmQ0JXTVNJc0ltRmtaQ0k2SW1ock1ERXVjMlY0WVhaMkxtTnZiU0lzSW5CdmNuUWlPaUkwTkRNaUxDSnBaQ0k2SWpreVkySTROREZtTFROa1pXUXRNek5tWmkxaE16WTJMV1l6Wm1WallUYzBNamhtTkNJc0ltRnBaQ0k2SWpJaUxDSnVaWFFpT2lKMFkzQWlMQ0owZVhCbElqb2libTl1WlNJc0ltaHZjM1FpT2lJaUxDSndZWFJvSWpvaUwyRmtiMkpsSWl3aWRHeHpJam9pZEd4eklpd2ljMjVwSWpvaUluMD0NCnZtZXNzOi8vZXlKMklqb2lNaUlzSW5Ceklqb2lRWE5wWVNEcHBwbm11Szh3TWlCOElPbWFwK21Ca3lCOElPZVV0ZVMvb1NCOElETXVNSGdnZkNCV01TSXNJbUZrWkNJNkltWnpMV050TG1Gc2FIUjBaSGN1WTI0aUxDSndiM0owSWpvaU1qQXhPRGNpTENKcFpDSTZJamt5WTJJNE5ERm1MVE5rWldRdE16Tm1aaTFoTXpZMkxXWXpabVZqWVRjME1qaG1OQ0lzSW1GcFpDSTZJaklpTENKdVpYUWlPaUozY3lJc0luUjVjR1VpT2lKdWIyNWxJaXdpYUc5emRDSTZJaUlzSW5CaGRHZ2lPaUl2WVdSdlltVWlMQ0owYkhNaU9pSWlMQ0p6Ym1raU9pSWlmUT09DQp2bWVzczovL2V5SjJJam9pTWlJc0luQnpJam9pUVhOcFlTRHBwcG5tdUs4d015QjhJT2VidE9pL25pQjhJT1dGamVhMWdTQjhJREV1TUhnZ2ZDQldNU0lzSW1Ga1pDSTZJbWhyTURNdWMyVjRZWFoyTG1OdmJTSXNJbkJ2Y25RaU9pSTBORE1pTENKcFpDSTZJamt5WTJJNE5ERm1MVE5rWldRdE16Tm1aaTFoTXpZMkxXWXpabVZqWVRjME1qaG1OQ0lzSW1GcFpDSTZJakV3SWl3aWJtVjBJam9pZEdOd0lpd2lkSGx3WlNJNkltNXZibVVpTENKb2IzTjBJam9pSWl3aWNHRjBhQ0k2SWk5aFpHOWlaU0lzSW5Sc2N5STZJblJzY3lJc0luTnVhU0k2SWlKOQ0Kdm1lc3M6Ly9leUoySWpvaU1pSXNJbkJ6SWpvaVFYTnBZU0RwcHBubXVLOHdOQ0I4SU9tYXArbUJreUI4SU9pQmxPbUFtaUI4SURNdU1IZ2dmQ0JXTVNJc0ltRmtaQ0k2SW1aekxXTnRMbUZzYUhSMFpIY3VZMjRpTENKd2IzSjBJam9pTWpBeU5EZ2lMQ0pwWkNJNklqa3lZMkk0TkRGbUxUTmtaV1F0TXpObVppMWhNelkyTFdZelptVmpZVGMwTWpobU5DSXNJbUZwWkNJNklqSWlMQ0p1WlhRaU9pSjNjeUlzSW5SNWNHVWlPaUp1YjI1bElpd2lhRzl6ZENJNkltRmtiMkpsTG1OdmJTSXNJbkJoZEdnaU9pSXZZV1J2WW1VaUxDSjBiSE1pT2lJaUxDSnpibWtpT2lKaFpHOWlaUzVqYjIwaWZRPT0NCnZtZXNzOi8vZXlKMklqb2lNaUlzSW5Ceklqb2lRWE5wWVNEcHBwbm11Szh3TlNCOElPbWFwK21Ca3lCOElPZW51K1dLcUNCOElESXVNSGdnZkNCV01TSXNJbUZrWkNJNklucDZMbk5sZUdGMmRpNWpiMjBpTENKd2IzSjBJam9pTXpZM016SWlMQ0pwWkNJNklqa3lZMkk0TkRGbUxUTmtaV1F0TXpObVppMWhNelkyTFdZelptVmpZVGMwTWpobU5DSXNJbUZwWkNJNklqSWlMQ0p1WlhRaU9pSjNjeUlzSW5SNWNHVWlPaUp1YjI1bElpd2lhRzl6ZENJNklpSXNJbkJoZEdnaU9pSXZZV1J2WW1VaUxDSjBiSE1pT2lJaUxDSnpibWtpT2lJaWZRPT0NCnZtZXNzOi8vZXlKMklqb2lNaUlzSW5Ceklqb2lRWE5wWVNEcHBwbm11Szh3TmlCOElPbWFwK21Ca3lCOElPUzRpZWU5a1NCOElESXVNSGdnZkNCV01TSXNJbUZrWkNJNklucDZMbk5sZUdGMmRpNWpiMjBpTENKd2IzSjBJam9pTXpFeE16VWlMQ0pwWkNJNklqa3lZMkk0TkRGbUxUTmtaV1F0TXpObVppMWhNelkyTFdZelptVmpZVGMwTWpobU5DSXNJbUZwWkNJNklqSWlMQ0p1WlhRaU9pSjNjeUlzSW5SNWNHVWlPaUp1YjI1bElpd2lhRzl6ZENJNklpSXNJbkJoZEdnaU9pSXZZV1J2WW1VaUxDSjBiSE1pT2lJaUxDSnpibWtpT2lJaWZRPT0NCnZtZXNzOi8vZXlKMklqb2lNaUlzSW5Ceklqb2lRWE5wWVNEcHBwbm11Szh3TnlCOElPbWFwK21Ca3lCOElFNWxkR1pzYVhnZ2ZDQXlMakI0SUh3Z1ZqRWlMQ0poWkdRaU9pSjZlaTV6WlhoaGRuWXVZMjl0SWl3aWNHOXlkQ0k2SWpJd016VTFJaXdpYVdRaU9pSTVNbU5pT0RReFppMHpaR1ZrTFRNelptWXRZVE0yTmkxbU0yWmxZMkUzTkRJNFpqUWlMQ0poYVdRaU9pSXlJaXdpYm1WMElqb2lkM01pTENKMGVYQmxJam9pYm05dVpTSXNJbWh2YzNRaU9pSWlMQ0p3WVhSb0lqb2lMMkZrYjJKbElpd2lkR3h6SWpvaUlpd2ljMjVwSWpvaUluMD0NCnZtZXNzOi8vZXlKMklqb2lNaUlzSW5Ceklqb2lRWE5wWVNEcHBwbm11Szh3T0NCOElPZWJ0T2kvbmlCOElPaS9xdVdqcStXd3ZDQjhJREV1TUhnZ2ZDQldNU0lzSW1Ga1pDSTZJbWhyTURndWMyVjRZWFoyTG1OdmJTSXNJbkJ2Y25RaU9pSTBORE1pTENKcFpDSTZJamt5WTJJNE5ERm1MVE5rWldRdE16Tm1aaTFoTXpZMkxXWXpabVZqWVRjME1qaG1OQ0lzSW1GcFpDSTZJakV3SWl3aWJtVjBJam9pZEdOd0lpd2lkSGx3WlNJNkltNXZibVVpTENKb2IzTjBJam9pSWl3aWNHRjBhQ0k2SWk5aFpHOWlaU0lzSW5Sc2N5STZJblJzY3lJc0luTnVhU0k2SWlKOQ0Kdm1lc3M6Ly9leUoySWpvaU1pSXNJbkJ6SWpvaVFYTnBZU0RwcHBubXVLOHdPU0I4SU9lYnRPaS9uaUI4SUU1bGRHWnNhWGdnZkNBeExqQjRJSHdnVmpFaUxDSmhaR1FpT2lKb2F6QTVMbk5sZUdGMmRpNWpiMjBpTENKd2IzSjBJam9pTkRReklpd2lhV1FpT2lJNU1tTmlPRFF4WmkwelpHVmtMVE16Wm1ZdFlUTTJOaTFtTTJabFkyRTNOREk0WmpRaUxDSmhhV1FpT2lJeE1DSXNJbTVsZENJNkluUmpjQ0lzSW5SNWNHVWlPaUp1YjI1bElpd2lhRzl6ZENJNklpSXNJbkJoZEdnaU9pSXZZV1J2WW1VaUxDSjBiSE1pT2lKMGJITWlMQ0p6Ym1raU9pSWlmUT09DQp2bWVzczovL2V5SjJJam9pTWlJc0luQnpJam9pUVhOcFlTRHBwcG5tdUs4eE1DQjhJT1M4bU9XTWx1ZVV0ZVMvb2VlNnYraTNyeUI4SURFdU1IZ2dmQ0JXTVNJc0ltRmtaQ0k2SWpFd05DNHlNRGd1TVRBNExqSXpPQ0lzSW5CdmNuUWlPaUl6TmpBd01DSXNJbWxrSWpvaU9USmpZamcwTVdZdE0yUmxaQzB6TTJabUxXRXpOall0WmpObVpXTmhOelF5T0dZMElpd2lZV2xrSWpvaU1pSXNJbTVsZENJNkluZHpJaXdpZEhsd1pTSTZJbTV2Ym1VaUxDSm9iM04wSWpvaUlpd2ljR0YwYUNJNklpOWhaRzlpWlNJc0luUnNjeUk2SWlJc0luTnVhU0k2SWlKOQ0Kdm1lc3M6Ly9leUoySWpvaU1pSXNJbkJ6SWpvaVJFVWc1YjYzNVp1OUlId2c2WnFuNllHVElId2dNUzR3ZUNCOElGWXhJQ0lzSW1Ga1pDSTZJbnA2TG5ObGVHRjJkaTVqYjIwaUxDSndiM0owSWpvaU16RTFNRFVpTENKcFpDSTZJamt5WTJJNE5ERm1MVE5rWldRdE16Tm1aaTFoTXpZMkxXWXpabVZqWVRjME1qaG1OQ0lzSW1GcFpDSTZJaklpTENKdVpYUWlPaUozY3lJc0luUjVjR1VpT2lKdWIyNWxJaXdpYUc5emRDSTZJbUZrYjJKbExtTnZiU0lzSW5CaGRHZ2lPaUl2WVdSdlltVWlMQ0owYkhNaU9pSWlMQ0p6Ym1raU9pSmhaRzlpWlM1amIyMGlmUT09DQp2bWVzczovL2V5SjJJam9pTWlJc0luQnpJam9pU1U0ZzVZMnc1YnFtSUh3ZzZacW42WUdUSUh3Z01TNHdlQ0I4SUZZeElpd2lZV1JrSWpvaWVub3VjMlY0WVhaMkxtTnZiU0lzSW5CdmNuUWlPaUl6TXpjMk5pSXNJbWxrSWpvaU9USmpZamcwTVdZdE0yUmxaQzB6TTJabUxXRXpOall0WmpObVpXTmhOelF5T0dZMElpd2lZV2xrSWpvaU1pSXNJbTVsZENJNkluZHpJaXdpZEhsd1pTSTZJbTV2Ym1VaUxDSm9iM04wSWpvaUlpd2ljR0YwYUNJNklpOWhaRzlpWlNJc0luUnNjeUk2SWlJc0luTnVhU0k2SWlKOQ0Kdm1lc3M6Ly9leUoySWpvaU1pSXNJbkJ6SWpvaVNsQWc1cGVsNXB5c01ERWdmQ0RwbXFmcGdaTWdmQ0F5TGpCNElId2dWakVpTENKaFpHUWlPaUptY3kxamJTNWhiR2gwZEdSM0xtTnVJaXdpY0c5eWRDSTZJakl4TlRFd0lpd2lhV1FpT2lJNU1tTmlPRFF4WmkwelpHVmtMVE16Wm1ZdFlUTTJOaTFtTTJabFkyRTNOREk0WmpRaUxDSmhhV1FpT2lJeUlpd2libVYwSWpvaWQzTWlMQ0owZVhCbElqb2libTl1WlNJc0ltaHZjM1FpT2lKaFpHOWlaUzVqYjIwaUxDSndZWFJvSWpvaUwyRmtiMkpsSWl3aWRHeHpJam9pSWl3aWMyNXBJam9pWVdSdlltVXVZMjl0SW4wPQ0Kdm1lc3M6Ly9leUoySWpvaU1pSXNJbkJ6SWpvaVNsQWc1cGVsNXB5c01ESWdmQ0RwbXFmcGdaTWdmQ0F4TGpCNElId2dWakVpTENKaFpHUWlPaUo2ZWk1elpYaGhkbll1WTI5dElpd2ljRzl5ZENJNklqTTJOVFV3SWl3aWFXUWlPaUk1TW1OaU9EUXhaaTB6WkdWa0xUTXpabVl0WVRNMk5pMW1NMlpsWTJFM05ESTRaalFpTENKaGFXUWlPaUl5SWl3aWJtVjBJam9pZDNNaUxDSjBlWEJsSWpvaWJtOXVaU0lzSW1odmMzUWlPaUlpTENKd1lYUm9Jam9pTDJGa2IySmxJaXdpZEd4eklqb2lJaXdpYzI1cElqb2lJbjA9DQp2bWVzczovL2V5SjJJam9pTWlJc0luQnpJam9pUzFJZzZaK3A1WnU5TURFZ2ZDRHBtcWZwZ1pNZ2ZDQXhMakI0SUh3Z1ZqRWlMQ0poWkdRaU9pSjZlaTV6WlhoaGRuWXVZMjl0SWl3aWNHOXlkQ0k2SWpNek5UZzRJaXdpYVdRaU9pSTVNbU5pT0RReFppMHpaR1ZrTFRNelptWXRZVE0yTmkxbU0yWmxZMkUzTkRJNFpqUWlMQ0poYVdRaU9pSXlJaXdpYm1WMElqb2lkM01pTENKMGVYQmxJam9pYm05dVpTSXNJbWh2YzNRaU9pSWlMQ0p3WVhSb0lqb2lMMkZrYjJKbElpd2lkR3h6SWpvaUlpd2ljMjVwSWpvaUluMD0NCnZtZXNzOi8vZXlKMklqb2lNaUlzSW5Ceklqb2lTMUlnNlorcDVadTlNRElnZkNEcG1xZnBnWk1nZkNBeUxqQjRJSHdnVmpFaUxDSmhaR1FpT2lKbWN5MWpiUzVoYkdoMGRHUjNMbU51SWl3aWNHOXlkQ0k2SWpRME16WTJJaXdpYVdRaU9pSTVNbU5pT0RReFppMHpaR1ZrTFRNelptWXRZVE0yTmkxbU0yWmxZMkUzTkRJNFpqUWlMQ0poYVdRaU9pSXlJaXdpYm1WMElqb2lkM01pTENKMGVYQmxJam9pYm05dVpTSXNJbWh2YzNRaU9pSWlMQ0p3WVhSb0lqb2lMMkZrYjJKbElpd2lkR3h6SWpvaUlpd2ljMjVwSWpvaUluMD0NCnZtZXNzOi8vZXlKMklqb2lNaUlzSW5Ceklqb2lVbFVnNUwrRTU3Mlg1cGF2SUh3ZzZacW42WUdUSUh3Z01TNHdlQ0I4SUZZeElpd2lZV1JrSWpvaWVub3VjMlY0WVhaMkxtTnZiU0lzSW5CdmNuUWlPaUl4TlRreE9DSXNJbWxrSWpvaU9USmpZamcwTVdZdE0yUmxaQzB6TTJabUxXRXpOall0WmpObVpXTmhOelF5T0dZMElpd2lZV2xrSWpvaU1pSXNJbTVsZENJNkluZHpJaXdpZEhsd1pTSTZJbTV2Ym1VaUxDSm9iM04wSWpvaVlXUnZZbVV1WTI5dElpd2ljR0YwYUNJNklpOWhaRzlpWlNJc0luUnNjeUk2SWlJc0luTnVhU0k2SW1Ga2IySmxMbU52YlNKOQ0Kdm1lc3M6Ly9leUoySWpvaU1pSXNJbkJ6SWpvaVUwY2c1cGF3NVlxZzVaMmhJSHdnNlpxbjZZR1RJSHdnTVM0d2VDQjhJRll4SWl3aVlXUmtJam9pZW5vdWMyVjRZWFoyTG1OdmJTSXNJbkJ2Y25RaU9pSXpNVE0zTVNJc0ltbGtJam9pT1RKallqZzBNV1l0TTJSbFpDMHpNMlptTFdFek5qWXRaak5tWldOaE56UXlPR1kwSWl3aVlXbGtJam9pTWlJc0ltNWxkQ0k2SW5keklpd2lkSGx3WlNJNkltNXZibVVpTENKb2IzTjBJam9pSWl3aWNHRjBhQ0k2SWk5aFpHOWlaU0lzSW5Sc2N5STZJaUlzSW5OdWFTSTZJaUo5DQp2bWVzczovL2V5SjJJam9pTWlJc0luQnpJam9pVkZJZzVaeWY2SUN6NVlXMklId2c2WnFuNllHVElId2dWakVpTENKaFpHUWlPaUptY3kxamJTNWhiR2gwZEdSM0xtTnVJaXdpY0c5eWRDSTZJak16TlRBeElpd2lhV1FpT2lJNU1tTmlPRFF4WmkwelpHVmtMVE16Wm1ZdFlUTTJOaTFtTTJabFkyRTNOREk0WmpRaUxDSmhhV1FpT2lJeUlpd2libVYwSWpvaWQzTWlMQ0owZVhCbElqb2libTl1WlNJc0ltaHZjM1FpT2lJaUxDSndZWFJvSWpvaUwyRmtiMkpsSWl3aWRHeHpJam9pSWl3aWMyNXBJam9pSW4wPQ0Kdm1lc3M6Ly9leUoySWpvaU1pSXNJbkJ6SWpvaVZWTWc1NzZPNVp1OU1ERWdmQ0RwbXFmcGdaTWdmQ0F5TGpCNElId2dWakVpTENKaFpHUWlPaUptY3kxamJTNWhiR2gwZEdSM0xtTnVJaXdpY0c5eWRDSTZJalEzTlRZMklpd2lhV1FpT2lJNU1tTmlPRFF4WmkwelpHVmtMVE16Wm1ZdFlUTTJOaTFtTTJabFkyRTNOREk0WmpRaUxDSmhhV1FpT2lJeUlpd2libVYwSWpvaWQzTWlMQ0owZVhCbElqb2libTl1WlNJc0ltaHZjM1FpT2lKaFpHOWlaUzVqYjIwaUxDSndZWFJvSWpvaUwyRmtiMkpsSWl3aWRHeHpJam9pSWl3aWMyNXBJam9pWVdSdlltVXVZMjl0SW4wPQ0Kdm1lc3M6Ly9leUoySWpvaU1pSXNJbkJ6SWpvaVZWTWc1NzZPNVp1OU1ESWdmQ0RwbXFmcGdaTWdmQ0F4TGpCNElId2dWakVpTENKaFpHUWlPaUo2ZWk1elpYaGhkbll1WTI5dElpd2ljRzl5ZENJNklqTXpOVGc1SWl3aWFXUWlPaUk1TW1OaU9EUXhaaTB6WkdWa0xUTXpabVl0WVRNMk5pMW1NMlpsWTJFM05ESTRaalFpTENKaGFXUWlPaUl5SWl3aWJtVjBJam9pZDNNaUxDSjBlWEJsSWpvaWJtOXVaU0lzSW1odmMzUWlPaUlpTENKd1lYUm9Jam9pTDJGa2IySmxJaXdpZEd4eklqb2lJaXdpYzI1cElqb2lJbjA9DQp2bWVzczovL2V5SjJJam9pTWlJc0luQnpJam9pUTJoaGRFZFFWT1M0aytlVXFPaUtndWVDdVNJc0ltRmtaQ0k2SW1aekxXTnRMbUZzYUhSMFpIY3VZMjRpTENKd2IzSjBJam9pTXpZMk16Z2lMQ0pwWkNJNklqa3lZMkk0TkRGbUxUTmtaV1F0TXpObVppMWhNelkyTFdZelptVmpZVGMwTWpobU5DSXNJbUZwWkNJNklqSWlMQ0p1WlhRaU9pSjNjeUlzSW5SNWNHVWlPaUp1YjI1bElpd2lhRzl6ZENJNklpSXNJbkJoZEdnaU9pSXZZV1J2WW1VaUxDSjBiSE1pT2lJaUxDSnpibWtpT2lJaWZRPT0NCnZtZXNzOi8vZXlKMklqb2lNaUlzSW5Ceklqb2lWR0ZwZDJGdUlPV1BzT2E1dmlCOElPaS9xdVdqcStXd3ZDQjhJREV1TUhnZ2ZDQldNU0lzSW1Ga1pDSTZJakUyTlM0eE5UUXVNalEyTGpFd015SXNJbkJ2Y25RaU9pSTRNQ0lzSW1sa0lqb2lPVEpqWWpnME1XWXRNMlJsWkMwek0yWm1MV0V6TmpZdFpqTm1aV05oTnpReU9HWTBJaXdpWVdsa0lqb2lNaUlzSW01bGRDSTZJbmR6SWl3aWRIbHdaU0k2SW01dmJtVWlMQ0pvYjNOMElqb2lJaXdpY0dGMGFDSTZJaTloWkc5aVpTSXNJblJzY3lJNklpSXNJbk51YVNJNklpSjk=",
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
  Disabled: "true",
  ReadOnly: ""
};

$rootScope.Button6 = {
  ABRole: 2001,
  Hidden: "true",
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
  Icon: "fas fa-copy",
  Text: "Copy",
  Class: "btn btn-link btn-md ",
  Disabled: ""
};

$rootScope.Button7 = {
  ABRole: 2001,
  Hidden: "true",
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
  Icon: "fas fa-copy",
  Text: "Copy",
  Class: "btn btn-link btn-md ",
  Disabled: ""
};

$rootScope.HtmlContent4 = {
  ABRole: 6001,
  Hidden: "true",
  Class: "ios-inertial-scroll ",
  Title: "",
  TooltipText: "",
  TooltipPos: "top",
  PopoverText: "",
  PopoverEvent: "mouseenter",
  PopoverTitle: "",
  PopoverPos: "top"
};

$rootScope.Button8 = {
  ABRole: 2001,
  Hidden: "true",
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
  Icon: "fas fa-rss",
  Text: "Nodes Availability",
  Class: "btn btn-secondary btn-md ",
  Disabled: ""
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

angular.element(window.document).ready(function(event){
$rootScope.Login.Event = event;

window.App.Debugger.log("Start of Login Show event", "info", -1);

window.App.Debugger.log("UserAgent \x22[UserAgent]\x22", "info", 1);

var ua = new UAParser(); $rootScope.UserAgent = ua.getResult();

window.App.Debugger.log("DeviceId \x22[Label15.Text]\x22", "info", 2);

$rootScope.Label15.Text = window.App.Cordova ? navigator.userAgent : device.uuid;

window.App.Debugger.log("DeviceModel \x22[Label16.Text]\x22", "info", 3);

$rootScope.Label16.Text = window.App.Cordova ? navigator.appCodeName : device.model;

window.App.Debugger.log("DevicePlatform \x22[Label17.Text]\x22", "info", 4);

$rootScope.Label17.Text = window.App.Cordova ? navigator.platform : device.platform;

window.App.Debugger.log("DeviceVersion \x22[Label18.Text]\x22", "info", 5);

$rootScope.Label18.Text = window.App.Cordova ? navigator.appVersion : device.version;

window.App.Debugger.log("DeviceSerial \x22[Label19.Text]\x22", "info", 6);

$rootScope.Label19.Text = window.App.Cordova ? "" : device.serial;

window.App.Debugger.log("DeviceIsVirtual \x22[Label20.Text]\x22", "info", 7);

$rootScope.Label20.Text = window.App.Cordova ? "false" : device.isVirtual.toString();

window.App.Debugger.log("End of Login Show event", "info", -2);

$rootScope.$apply();
});

$scope.PasswordInputFocus = function($event) {
$rootScope.PasswordInput.Event = $event;

window.App.Debugger.log("Start of PasswordInput Focus event", "info", -1);

window.App.Debugger.log("SetStyle \x22Label7\x22 \x22color\x22 \x22red\x22", "info", 1);

angular.element(document.getElementById("Label7")).css("color", "red");

window.App.Debugger.log("SetStyle \x22Label7\x22 \x22transition\x22 \x22color 200ms\x22", "info", 2);

angular.element(document.getElementById("Label7")).css("transition", "color 200ms");

window.App.Debugger.log("End of PasswordInput Focus event", "info", -2);

};

$scope.PasswordInputBlur = function($event) {
$rootScope.PasswordInput.Event = $event;

window.App.Debugger.log("Start of PasswordInput Blur event", "info", -1);

window.App.Debugger.log("SetStyle \x22Label7\x22 \x22color\x22 \x22black\x22", "info", 1);

angular.element(document.getElementById("Label7")).css("color", "black");

window.App.Debugger.log("SetStyle \x22Label7\x22 \x22transition\x22 \x22color 200ms\x22", "info", 2);

angular.element(document.getElementById("Label7")).css("transition", "color 200ms");

window.App.Debugger.log("End of PasswordInput Blur event", "info", -2);

};

$scope.Button1Click = function($event) {
$rootScope.Button1.Event = $event;

window.App.Debugger.log("Start of Button1 Click event", "info", -1);

window.App.Debugger.log("If \x22[PasswordInput.Value]\x22 \x22==\x22 \x22v7MicEgJJ570\x22", "info", 1);

if ($rootScope.PasswordInput.Value ==  "v7MicEgJJ570" ) {

window.App.Debugger.log("SetVar \x22[Progressbar1.Percentage]\x22 \x22100\x22 \x22String\x22", "info", 2);

$rootScope.Progressbar1.Percentage = "100";

window.App.Debugger.log("Show \x22Progressbar1\x22", "info", 3);

if ($rootScope["Progressbar1"]) { $rootScope["Progressbar1"].Hidden = ""; }

window.App.Debugger.log("TimerStart \x22AutoUnblockTimer\x22", "info", 4);

$rootScope.AutoUnblockTimer.TimerStart();

window.App.Debugger.log("ReplaceView \x22Main\x22", "info", 5);

$scope.replaceView("Main");

window.App.Debugger.log("BlockApp", "info", 6);

blockUI.reset(); blockUI.start();

window.App.Debugger.log("BlockedText \x22Please Wait . . .\x22", "info", 7);

blockUI.message("Please Wait . . .");

window.App.Debugger.log("Exit", "info", 8);

return null;

window.App.Debugger.log("Else", "info", 9);

} else {

window.App.Debugger.log("SetVar \x22[Progressbar1.Percentage]\x22 \x2245\x22 \x22String\x22", "info", 10);

$rootScope.Progressbar1.Percentage = "45";

window.App.Debugger.log("SetVar \x22[Progressbar1.Class]\x22 \x22progress-bar bg-danger progress-bar-striped progress-bar-animated\x22 \x22String\x22", "info", 11);

$rootScope.Progressbar1.Class = "progress-bar bg-danger progress-bar-striped progress-bar-animated";

window.App.Debugger.log("Show \x22Progressbar1\x22", "info", 12);

if ($rootScope["Progressbar1"]) { $rootScope["Progressbar1"].Hidden = ""; }

window.App.Debugger.log("BlockApp", "info", 13);

blockUI.reset(); blockUI.start();

window.App.Debugger.log("BlockedText \x22Authorisation Faild !\x22", "info", 14);

blockUI.message("Authorisation Faild !");

window.App.Debugger.log("Focus \x22LoginInput\x22", "info", 15);

if (document.getElementById("LoginInput")) { document.getElementById("LoginInput").focus(); }

window.App.Debugger.log("Exit", "info", 16);

return null;

window.App.Debugger.log("EndIf", "info", 17);

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

$scope.Button2Click = function($event) {
$rootScope.Button2.Event = $event;

window.App.Debugger.log("Start of Button2 Click event", "info", -1);

window.App.Debugger.log("Show \x22Textarea1\x22", "info", 1);

if ($rootScope["Textarea1"]) { $rootScope["Textarea1"].Hidden = ""; }

window.App.Debugger.log("Show \x22Textarea2\x22", "info", 2);

if ($rootScope["Textarea2"]) { $rootScope["Textarea2"].Hidden = ""; }

window.App.Debugger.log("Disable \x22Button2\x22", "info", 3);

if ($rootScope["Button2"]) { $rootScope["Button2"].Disabled = "true"; }

window.App.Debugger.log("Show \x22HtmlContent3\x22", "info", 4);

if ($rootScope["HtmlContent3"]) { $rootScope["HtmlContent3"].Hidden = ""; }

window.App.Debugger.log("Show \x22Button3\x22", "info", 5);

if ($rootScope["Button3"]) { $rootScope["Button3"].Hidden = ""; }

window.App.Debugger.log("Show \x22Textarea1\x22", "info", 6);

if ($rootScope["Textarea1"]) { $rootScope["Textarea1"].Hidden = ""; }

window.App.Debugger.log("Show \x22Textarea2\x22", "info", 7);

if ($rootScope["Textarea2"]) { $rootScope["Textarea2"].Hidden = ""; }

window.App.Debugger.log("Show \x22Textarea3\x22", "info", 8);

if ($rootScope["Textarea3"]) { $rootScope["Textarea3"].Hidden = ""; }

window.App.Debugger.log("Show \x22Textarea4\x22", "info", 9);

if ($rootScope["Textarea4"]) { $rootScope["Textarea4"].Hidden = ""; }

window.App.Debugger.log("Show \x22Button4\x22", "info", 10);

if ($rootScope["Button4"]) { $rootScope["Button4"].Hidden = ""; }

window.App.Debugger.log("Show \x22Textarea5\x22", "info", 11);

if ($rootScope["Textarea5"]) { $rootScope["Textarea5"].Hidden = ""; }

window.App.Debugger.log("Show \x22Button5\x22", "info", 12);

if ($rootScope["Button5"]) { $rootScope["Button5"].Hidden = ""; }

window.App.Debugger.log("Show \x22Button6\x22", "info", 13);

if ($rootScope["Button6"]) { $rootScope["Button6"].Hidden = ""; }

window.App.Debugger.log("Show \x22Button7\x22", "info", 14);

if ($rootScope["Button7"]) { $rootScope["Button7"].Hidden = ""; }

window.App.Debugger.log("Show \x22Progressbar2\x22", "info", 15);

if ($rootScope["Progressbar2"]) { $rootScope["Progressbar2"].Hidden = ""; }

window.App.Debugger.log("Show \x22Progressbar3\x22", "info", 16);

if ($rootScope["Progressbar3"]) { $rootScope["Progressbar3"].Hidden = ""; }

window.App.Debugger.log("Show \x22Progressbar4\x22", "info", 17);

if ($rootScope["Progressbar4"]) { $rootScope["Progressbar4"].Hidden = ""; }

window.App.Debugger.log("Show \x22Progressbar5\x22", "info", 18);

if ($rootScope["Progressbar5"]) { $rootScope["Progressbar5"].Hidden = ""; }

window.App.Debugger.log("Show \x22Progressbar6\x22", "info", 19);

if ($rootScope["Progressbar6"]) { $rootScope["Progressbar6"].Hidden = ""; }

window.App.Debugger.log("Show \x22Button8\x22", "info", 20);

if ($rootScope["Button8"]) { $rootScope["Button8"].Hidden = ""; }

window.App.Debugger.log("End of Button2 Click event", "info", -2);

};

$scope.Button3Click = function($event) {
$rootScope.Button3.Event = $event;

window.App.Debugger.log("Start of Button3 Click event", "info", -1);

window.App.Debugger.log("CopyToClipboard \x22Clipboard1\x22 \x22[Textarea1.Value]\x22", "info", 1);

if ($rootScope.Textarea1.Value !== "") {
  $rootScope.Clipboard1.Clipboard = new Clipboard(".btn", {text: function() {return $rootScope.Textarea1.Value;}});
  $rootScope.Clipboard1.Clipboard.on("error", function(e) {$rootScope.Clipboard1.onError(e)});
  $rootScope.Clipboard1.Clipboard.on("success", function(e) {$rootScope.Clipboard1.onSuccess(e)});
}

window.App.Debugger.log("Disable \x22Button3\x22", "info", 2);

if ($rootScope["Button3"]) { $rootScope["Button3"].Disabled = "true"; }

window.App.Debugger.log("End of Button3 Click event", "info", -2);

};

$rootScope.Clipboard1.onSuccess = function(event) {




$rootScope.Clipboard1.Clipboard.destroy();
};

$rootScope.Clipboard1.onError = function(error) {
  $rootScope.Clipboard1.Error = error;




$rootScope.Clipboard1.Clipboard.destroy();
};

$scope.Button4Click = function($event) {
$rootScope.Button4.Event = $event;

window.App.Debugger.log("Start of Button4 Click event", "info", -1);

window.App.Debugger.log("CopyToClipboard \x22Clipboard1\x22 \x22[Textarea2.Value]\x22", "info", 1);

if ($rootScope.Textarea2.Value !== "") {
  $rootScope.Clipboard1.Clipboard = new Clipboard(".btn", {text: function() {return $rootScope.Textarea2.Value;}});
  $rootScope.Clipboard1.Clipboard.on("error", function(e) {$rootScope.Clipboard1.onError(e)});
  $rootScope.Clipboard1.Clipboard.on("success", function(e) {$rootScope.Clipboard1.onSuccess(e)});
}

window.App.Debugger.log("Disable \x22Button4\x22", "info", 2);

if ($rootScope["Button4"]) { $rootScope["Button4"].Disabled = "true"; }

window.App.Debugger.log("End of Button4 Click event", "info", -2);

};

$scope.Button5Click = function($event) {
$rootScope.Button5.Event = $event;

window.App.Debugger.log("Start of Button5 Click event", "info", -1);

window.App.Debugger.log("CopyToClipboard \x22Clipboard1\x22 \x22[Textarea3.Value]\x22", "info", 1);

if ($rootScope.Textarea3.Value !== "") {
  $rootScope.Clipboard1.Clipboard = new Clipboard(".btn", {text: function() {return $rootScope.Textarea3.Value;}});
  $rootScope.Clipboard1.Clipboard.on("error", function(e) {$rootScope.Clipboard1.onError(e)});
  $rootScope.Clipboard1.Clipboard.on("success", function(e) {$rootScope.Clipboard1.onSuccess(e)});
}

window.App.Debugger.log("Disable \x22Button5\x22", "info", 2);

if ($rootScope["Button5"]) { $rootScope["Button5"].Disabled = "true"; }

window.App.Debugger.log("End of Button5 Click event", "info", -2);

};

$scope.Button6Click = function($event) {
$rootScope.Button6.Event = $event;

window.App.Debugger.log("Start of Button6 Click event", "info", -1);

window.App.Debugger.log("CopyToClipboard \x22Clipboard1\x22 \x22[Textarea4.Value]\x22", "info", 1);

if ($rootScope.Textarea4.Value !== "") {
  $rootScope.Clipboard1.Clipboard = new Clipboard(".btn", {text: function() {return $rootScope.Textarea4.Value;}});
  $rootScope.Clipboard1.Clipboard.on("error", function(e) {$rootScope.Clipboard1.onError(e)});
  $rootScope.Clipboard1.Clipboard.on("success", function(e) {$rootScope.Clipboard1.onSuccess(e)});
}

window.App.Debugger.log("Disable \x22Button6\x22", "info", 2);

if ($rootScope["Button6"]) { $rootScope["Button6"].Disabled = "true"; }

window.App.Debugger.log("End of Button6 Click event", "info", -2);

};

$scope.Button7Click = function($event) {
$rootScope.Button7.Event = $event;

window.App.Debugger.log("Start of Button7 Click event", "info", -1);

window.App.Debugger.log("CopyToClipboard \x22Clipboard1\x22 \x22[Textarea5.Value]\x22", "info", 1);

if ($rootScope.Textarea5.Value !== "") {
  $rootScope.Clipboard1.Clipboard = new Clipboard(".btn", {text: function() {return $rootScope.Textarea5.Value;}});
  $rootScope.Clipboard1.Clipboard.on("error", function(e) {$rootScope.Clipboard1.onError(e)});
  $rootScope.Clipboard1.Clipboard.on("success", function(e) {$rootScope.Clipboard1.onSuccess(e)});
}

window.App.Debugger.log("Disable \x22Button7\x22", "info", 2);

if ($rootScope["Button7"]) { $rootScope["Button7"].Disabled = "true"; }

window.App.Debugger.log("End of Button7 Click event", "info", -2);

};

$scope.Button8Click = function($event) {
$rootScope.Button8.Event = $event;

window.App.Debugger.log("Start of Button8 Click event", "info", -1);

window.App.Debugger.log("SetVar \x22[Progressbar2.Percentage]\x22 \x2248\x22 \x22String\x22", "info", 1);

$rootScope.Progressbar2.Percentage = "48";

window.App.Debugger.log("SetVar \x22[Progressbar3.Percentage]\x22 \x2267\x22 \x22String\x22", "info", 2);

$rootScope.Progressbar3.Percentage = "67";

window.App.Debugger.log("SetVar \x22[Progressbar4.Percentage]\x22 \x2212\x22 \x22String\x22", "info", 3);

$rootScope.Progressbar4.Percentage = "12";

window.App.Debugger.log("SetVar \x22[Progressbar5.Percentage]\x22 \x2224\x22 \x22String\x22", "info", 4);

$rootScope.Progressbar5.Percentage = "24";

window.App.Debugger.log("SetVar \x22[Progressbar6.Percentage]\x22 \x2298\x22 \x22String\x22", "info", 5);

$rootScope.Progressbar6.Percentage = "98";

window.App.Debugger.log("Show \x22Progressbar2\x22", "info", 6);

if ($rootScope["Progressbar2"]) { $rootScope["Progressbar2"].Hidden = ""; }

window.App.Debugger.log("Show \x22Progressbar3\x22", "info", 7);

if ($rootScope["Progressbar3"]) { $rootScope["Progressbar3"].Hidden = ""; }

window.App.Debugger.log("Show \x22Progressbar4\x22", "info", 8);

if ($rootScope["Progressbar4"]) { $rootScope["Progressbar4"].Hidden = ""; }

window.App.Debugger.log("Show \x22Progressbar5\x22", "info", 9);

if ($rootScope["Progressbar5"]) { $rootScope["Progressbar5"].Hidden = ""; }

window.App.Debugger.log("Show \x22Progressbar6\x22", "info", 10);

if ($rootScope["Progressbar6"]) { $rootScope["Progressbar6"].Hidden = ""; }

window.App.Debugger.log("Show \x22HtmlContent4\x22", "info", 11);

if ($rootScope["HtmlContent4"]) { $rootScope["HtmlContent4"].Hidden = ""; }

window.App.Debugger.log("Disable \x22Button8\x22", "info", 12);

if ($rootScope["Button8"]) { $rootScope["Button8"].Disabled = "true"; }

window.App.Debugger.log("End of Button8 Click event", "info", -2);

};

}]);
