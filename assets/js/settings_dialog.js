/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*globals $: false, require: false, BUILDER: false, MVIEWER: false, editor: false*/
'use strict';

var remote = require('electron').remote;
var settings = remote.require('electron-settings');

$(document).ready(function() {
  $('#apply_settings').on('click', function() {
    // Welcome dialog setting
    settings.set('startup.show_welcome', $('#show_welcome').prop('checked'));

    // Editor command line setting
    settings.set('general.editor_command_line', $('#editor_command_line').val());

    // Execute script on save setting
    settings.set('general.execute_on_save', $('#execute_on_save').prop('checked'));

    // Debug mode setting
    settings.set('general.debug_mode', $('#debug_mode').prop('checked'));

    // Hotkey for building and displaying scripts
    settings.set('hotkeys.build_script_hotkey', $('#build_script_hotkey').val());

    // Hotkey for saving scripts
    settings.set('hotkeys.save_script_hotkey', $('#save_script_hotkey').val());

    // Hotekey for creating a new script
    settings.set('hotkeys.new_script_hotkey', $('#new_script_hotkey').val());

    // Hotkey for opening an existing script
    settings.set('hotkeys.open_script_hotkey', $('#open_script_hotkey').val());
  });

  $('#close_settings').on('click', function() {
    var window = remote.getCurrentWindow();
    window.close();
  });

  $('#cancel_settings').on('click', function() {
    var window = remote.getCurrentWindow();
    window.close();
  });

  // Opens a reference for users who want to change cqg's keymappings
  $('#modifiers_link').on('click', function(e) {
    e.preventDefault();
    require('electron').shell.openExternal("https://electronjs.org/docs/api/accelerator#available-modifiers");
  });

  // Welcome dialog setting
  $('#show_welcome').prop('checked', settings.get('startup.show_welcome'));

  // Editor command line setting
  $('#editor_command_line').val(settings.get('general.editor_command_line'));

  // Execute script on save setting
  $('#execute_on_save').prop('checked', settings.get('general.execute_on_save'));

  // Debug mode setting
  $('#debug_mode').prop('checked', settings.get('general.debug_mode'));

  // Hotkey for building and displaying scripts
  $('#build_script_hotkey').val(settings.get('hotkeys.build_script_hotkey'));

  // Hotkey for saving scripts
  $('#save_script_hotkey').val(settings.get('hotkeys.save_script_hotkey'));

  // Hotkey for creating a new script
  $('#new_script_hotkey').val(settings.get('hotkeys.new_script_hotkey'));

  // Hotkey for opening an existing script
  $('#open_script_hotkey').val(settings.get('hotkeys.open_script_hotkey'));
});
