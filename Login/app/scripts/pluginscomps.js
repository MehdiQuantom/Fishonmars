/*!
 This file is part of DecSoft App Builder.
 Visit our website for license information.
 Copyright ©2020 DecSoft. All rights reserved.
 Visit our website at: https://www.decsoftutils.com
 */

Vue.component('decsoft-selectex', {
  props: ['name', 'classes', 'hidden', 'size', 'tabIndex', 'title', 'items', 'itemIndex', 'value', 'disabled', 'changeHandler', 'focusHandler', 'blurHandler', 'clickHandler', 'dblclickHandler', 'mousedownHandler', 'mouseupHandler', 'mousemoveHandler', 'mouseenterHandler', 'mouseleaveHandler', 'contextmenuHandler'],
  template: '\
   <select v-bind:id="name" v-bind:tabindex="tabIndex" v-show="!hidden" v-bind:class="[classes, \'custom-select\', \'custom-select-\' + size]" v-bind:title="title" v-bind:disabled="disabled" @change="changeHandler" v-on:focus="focusHandler" v-on:blur="blurHandler" v-on:click="clickHandler" v-on:dblclick="dblclickHandler" v-on:mousedown="mousedownHandler" v-on:mouseup="mouseupHandler" v-on:mousemove="mousemoveHandler" v-on:mouseenter="mouseenterHandler" v-on:mouseleave="mouseleaveHandler" v-on:contextmenu="contextmenuHandler">\
    <option v-bind:selected="index === itemIndex" v-for="(item, index) in items" v-bind:data-index="index">{{item.text}}</option>\
   </select>\
  '
});

Vue.component('decsoft-typeahead', {
  props: ['name', 'classes', 'readonly', 'hidden', 'title', 'tabIndex', 'value', 'disabled', 'placeholder', 'size', 'item', 'items', 'emptyText', 'autocomplete', 'highlight', 'itemClickHandler', 'changeHandler', 'focusHandler', 'blurHandler', 'clickHandler', 'dblclickHandler', 'mousedownHandler', 'mouseupHandler', 'mousemoveHandler', 'mouseenterHandler', 'mouseleaveHandler', 'contextmenuHandler', 'keyupHandler', 'keydownHandler', 'cutHandler', 'copyHandler', 'pasteHandler'],
  template: '\
   <div v-bind:id="name" v-bind:title="title" v-show="!hidden" v-bind:class="[classes, \'decsoft-typeahead-container\']">\
    <input v-bind:readonly="readonly" v-bind:tabindex="tabIndex" type="text" v-bind:placeholder="placeholder" v-bind:value="value" v-bind:disabled="disabled" v-bind:id="name + \'-input\'" v-bind:class="[\'form-control\', \'form-control-\' + size]" v-on:change="changeHandler" v-on:focus="focusHandler" v-on:blur="blurHandler" v-on:click="clickHandler" v-on:dblclick="dblclickHandler" v-on:mousedown="mousedownHandler" v-on:mouseup="mouseupHandler" v-on:mousemove="mousemoveHandler" v-on:mouseenter="mouseenterHandler" v-on:mouseleave="mouseleaveHandler" v-on:contextmenu="contextmenuHandler" v-on:keyup="keyupHandler" v-on:keydown="keydownHandler" v-on:cut="cutHandler" v-on:copy="copyHandler" v-on:paste="pasteHandler" />\
    <ul v-bind:id="name + \'-list\'" class="list-group decsoft-typeahead-list">\
	</ul>\
   </div>\
  ',
  
  mounted: function () {
	var
	  self = this,
	  container = $('#' + this.name);
	
    container.find('input').css({
	  width: container.css('width'),
	  height: container.css('height')
	});  
	
    $('body').on('click', function () {
	  $('#' + self.name + '-list').html('').hide();  	
	});
	
    $('body').on('click', '.' + this.name + '-list-item', self.itemClickHandler);	
  }
});
