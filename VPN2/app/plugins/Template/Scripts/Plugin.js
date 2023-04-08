/*!
 * This file is part of App Builder
 * For licenses information see App Builder help
 * ©2019 App Builder - https://www.davidesperalta.com
 */

window.App.Plugins.Template = function() {

  /* Private plugin's stuff */

  var showMessage = function(msg) {
    alert(msg);
  };

  /* Public interface: actions exposed by the plugin */

  return {

    TemplateSayHello: function() {
      showMessage('Hello from the Template plugin!');
    },

    TemplateSaySomething: function(message) {
      showMessage(message);
    },

    /* Optional plugin's events (called by App Builder) */

    PluginSetupEvent: function() {
      alert('Hello from the Template plugin Setup event!');
    },

    PluginAppReadyEvent: function() {
      alert('Hello from the Template plugin App ready event!');
    },

    PluginDocumentReadyEvent: function() {
      alert('Hello from the Template plugin Document ready event!');
    }
  };
};
