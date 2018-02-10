/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*globals $: false, require: false, BUILDER: false, MVIEWER: false, editor: false*/
'use strict';

var shell = require('electron').shell;
var remote = require('electron').remote;
var dialog = require('electron').remote.dialog;
var fs = require('fs');

var gFileName = null;

$(document).ready(function() {
    $('#build_button').on('click', function() {
      BUILDER.build(gFileName);
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
      VIEWER.setView('FRONT');
    });

    $('#back_view').on('click', function() {
      VIEWER.setView('BACK');
    });

    $('#top_view').on('click', function() {
      VIEWER.setView('TOP');
    });

    $('#bottom_view').on('click', function() {
      VIEWER.setView('BOTTOM');
    });

    $('#right_view').on('click', function() {
      VIEWER.setView('RIGHT');
    });

    $('#left_view').on('click', function() {
      VIEWER.setView('LEFT');
    });

    $('#iso_view').on('click', function() {
      VIEWER.setView('ISO');
    });

    $('#zoom_to_fit').on('click', function() {
      VIEWER.fitAll();
    });

    var curView = 'ISO';
    $("#mainPane").keypress(function(e) {
      // Handle hotkeys for the 3D view
      var code = e.keyCode || e.which;

      // Numpad 0 (iso, fit all)
      if(code == 48) {
        VIEWER.fitAll();
        curView = 'ISO';
      }
      // Numpad 1, bottom left
      else if (code == 49) {
        VIEWER.setView('BOTTOM_LEFT');
        curView = 'BOTTOM_LEFT';
      }
      // Numpad 2, bottom
      else if (code == 50) {
        VIEWER.setView('BOTTOM');
        curView = 'BOTTOM';
      }
      // Numpad 3, bottom right
      else if (code == 51) {
        VIEWER.setView('BOTTOM_RIGHT');
        curView = 'BOTTOM_RIGHT';
      }
      // Numpad 4, bottom right
      else if (code == 52) {
        VIEWER.setView('LEFT');
        curView = 'LEFT';
      }
      // Numpad 5, front/back swap
      else if (code == 53) {
        if (curView !== 'FRONT') {
          VIEWER.setView('FRONT');
          curView = 'FRONT';
        }
        else {
          VIEWER.setView('BACK');
          curView = 'BACK';
        }
      }
      // Numpad 6, bottom right
      else if (code == 54) {
        VIEWER.setView('RIGHT');
        curView = 'RIGHT';
      }
      // Numpad 7, top left
      else if (code == 55) {
        VIEWER.setView('TOP_LEFT');
        curView = 'TOP_LEFT';
      }
      // Numpad 8, top
      else if (code == 56) {
        VIEWER.setView('TOP');
        curView = 'TOP';
      }
      // Numpad 9, top
      else if (code == 57) {
        VIEWER.setView('TOP_RIGHT');
        curView = 'TOP_RIGHT';
      }
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

    // Temporary to help debug views
    // gFileName = '/home/jwright/Downloads/caster_sleeve.py'
    // BUILDER.build(gFileName);
});

function newScript() {
  // We're starting a new script
  gFileName = null;

  // editor.setValue("# 'import cadquery as cq' is run for you\n\n#Renders your scripted object\nbuild_object(result)");
}

function openScript() {
  dialog.showOpenDialog({ filters: [{ name: 'Python', extensions: ['py'] }]}, function (fileNames) {
    if (fileNames === undefined) return;
    var fileName = fileNames[0];

    // Keep a reference to this for later
    gFileName = fileName;

    // Display the model in the 3D view
    BUILDER.build(gFileName);
  });
}

function saveScript() {
  if (gFileName === undefined || gFileName === null) {
    saveScriptAs();
    return;
  }
  else {
    // fs.writeFile(gFileName, editor.getValue(), function (err) {
    //   console.log(err);
    // });
  }
}

function saveScriptAs() {
  dialog.showSaveDialog({ filters: [{ name: 'Python', extensions: ['py'] }]}, function (fileName) {
    if (fileName === undefined) return;
    // We want to keep a reference to the file for saving later
    gFileName = fileName;

    // fs.writeFile(fileName, editor.getValue(), function (err) {
    //   console.log(err);
    // });
  });
}

function notImplementedYet() {
  dialog.showMessageBox({ message: "This feature has not been implemented yet. Please go to the following Google Group to request that this feature be implemented.\nhttps://groups.google.com/forum/#!forum/cadquery", buttons: ["OK"] });
}
