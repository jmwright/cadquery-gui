/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*globals $: false, require: false, BUILDER: false, MVIEWER: false, editor: false*/
'use strict';

var shell = require('electron').shell;
var remote = require('remote');
var dialog = remote.require('dialog');
var fs = require('fs');

var gFileName = null;

$(document).ready(function() {
    $('#build_button').on('click', function() {
      BUILDER.build();
    });

    $('#docs').on('click', function() {
      shell.openExternal('http://dcowden.github.io/cadquery/');
    });

    $('#videos').on('click', function() {
      shell.openExternal('https://groups.google.com/forum/#!topic/cadquery/4wPfbwxjloQ');
    });

    $('#user_group').on('click', function() {
      shell.openExternal('https://groups.google.com/forum/#!forum/cadquery');
    });

    $('#new_script').on('click', function() {
      newScript();
    });

    $('#open_script').on('click', function() {
      openScript();
    });

    $('#save_script').on('click', function() {
      saveScript();
    });

    $('#save_script_as').on('click', function() {
      saveScriptAs();
    });

    $('#import_object').on('click', function() {
      notImplementedYet();
    });

    $('#export_object').on('click', function() {
      notImplementedYet();
    });

    $('#upload_script').on('click', function() {
      notImplementedYet();
    });

    $('#download_script').on('click', function() {
      notImplementedYet();
    });

    $('#show_examples').on('click', function() {
      notImplementedYet();
    });

    $('#validate_button').on('click', function() {
      notImplementedYet();
    });

    $('#debug_button').on('click', function() {
      notImplementedYet();
    });

    $('#front_view').on('click', function() {
      MVIEWER.setView('FRONT');
    });

    $('#back_view').on('click', function() {
      MVIEWER.setView('BACK');
    });

    $('#top_view').on('click', function() {
      MVIEWER.setView('TOP');
    });

    $('#bottom_view').on('click', function() {
      MVIEWER.setView('BOTTOM');
    });

    $('#right_view').on('click', function() {
      MVIEWER.setView('RIGHT');
    });

    $('#left_view').on('click', function() {
      MVIEWER.setView('LEFT');
    });

    $('#iso_view').on('click', function() {
      MVIEWER.setView('ISO');
    });

    $('#zoom_to_fit').on('click', function() {
      MVIEWER.zoomAll();
    });

    $('#settings_button').on('click', function() {
      notImplementedYet();
    });

    $('#about_button').on('click', function() {
      notImplementedYet();
    });

    $('#sign_in_button').on('click', function() {
      notImplementedYet();
    });

    //set up model viewer
    VIEWER.init({
      initialView: 'ISO',
      width: 800,
      height: 600,
      containerId: "modelview"
    });
});

function newScript() {
  // We're starting a new script
  gFileName = null;

  editor.setValue("# 'import cadquery as cq' is run for you\n\n#Renders your scripted object\nbuild_object(result)");
}

function openScript() {
  dialog.showOpenDialog({ filters: [{ name: 'Python', extensions: ['py'] }]}, function (fileNames) {
    if (fileNames === undefined) return;
    var fileName = fileNames[0];
    gFileName = fileName; // Keep a reference to this for later
    fs.readFile(fileName, 'utf-8', function (err, data) {
      editor.setValue(data);
    });
  });
}

function saveScript() {
  if (gFileName === undefined || gFileName === null) {
    saveScriptAs();
    return;
  }
  else {
    fs.writeFile(gFileName, editor.getValue(), function (err) {
      console.log(err);
    });
  }
}

function saveScriptAs() {
  dialog.showSaveDialog({ filters: [{ name: 'Python', extensions: ['py'] }]}, function (fileName) {
    if (fileName === undefined) return;
    // We want to keep a reference to the file for saving later
    gFileName = fileName;

    fs.writeFile(fileName, editor.getValue(), function (err) {
      console.log(err);
    });
  });
}

function notImplementedYet() {
  dialog.showMessageBox({ message: "This feature has not been implemented yet. Please go to the following Google Group to request that this feature be implemented.\nhttps://groups.google.com/forum/#!forum/cadquery", buttons: ["OK"] });
}
