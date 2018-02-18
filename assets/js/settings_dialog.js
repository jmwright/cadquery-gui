/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*globals $: false, require: false, BUILDER: false, MVIEWER: false, editor: false*/
'use strict';

var settings = require('electron').remote.require('electron-settings');

$(document).ready(function() {
  // Welcome dialog setting
  $('#show_welcome').prop('checked', settings.get('startup.show_welcome'));

  // Editor command line setting
  $('#editor_command_line').val(settings.get('general.editor_command_line'));

  // Execute script on save setting
  $('#execute_on_save').prop('checked', settings.get('general.execute_on_save'));

  // Debug mode setting
  $('#debug_mode').prop('checked', settings.get('general.debug_mode'));
});
