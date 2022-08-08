/*!
 * This file is part of App Builder
 * For licenses information see App Builder help
 * ©2019 App Builder - https://www.davidesperalta.com
 */

window.App.Plugins.Biometric = function() {

  /* Private plugin's stuff */

  /*
  var showMessage = function(msg) {
    alert(msg);
  };
  */

  /* Public interface: actions exposed by the plugin */

  return {

    BiometricIsAvailable: function(sucessCallback, errorCallback) {
      Fingerprint.isAvailable(
       function(deviceKind) {
         if (angular.isFunction(window.App.Scope[sucessCallback])) {
           window.App.Scope[sucessCallback](deviceKind);
         }       
       }, 
       function(error) {
         if (angular.isFunction(window.App.Scope[errorCallback])) {
           window.App.Scope[errorCallback](error);
         }              
       });
    },

    BiometricAuthenticate: function(sucessCallback, errorCallback) {
      Fingerprint.show(
       {
         "clientId": window.App.RootScope.App.Name,
         "clientSecret": window.App.RootScope.App.ID.split('').reverse().join('')
       }, 
       function() {
         if (angular.isFunction(window.App.Scope[sucessCallback])) {
           window.App.Scope[sucessCallback]();
         }       
       }, 
       function(error) {
         if (angular.isFunction(window.App.Scope[errorCallback])) {
           window.App.Scope[errorCallback](error);
         }              
       });
    },

    /* Optional plugin's events (called by App Builder) */

    PluginSetupEvent: function() {
      //alert('Hello from the Template plugin Setup event!');
    },

    PluginAppReadyEvent: function() {
      //alert('Hello from the Template plugin App ready event!');
    },

    PluginDocumentReadyEvent: function() {
      //alert('Hello from the Template plugin Document ready event!');
    }
  };
};
