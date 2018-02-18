/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*globals $: false, require: false, BUILDER: false, MVIEWER: false, editor: false*/
'use strict';

var shell = require('electron').shell;
var dialog = require('electron').remote.dialog;
var BrowserWindow = require('electron').remote.BrowserWindow;
var settings = require('electron').remote.require('electron-settings');
var fs = require('fs');

var SCRIPT_TEMPLATE = "import cadquery as cq\n\n" +
  "# Render script results using the CadQuery Gateway Interface\n" +
  "# Use the following to render your model with grey RGB and no transparency\n" +
  "show_object(result, options={\"rgba\":(204, 204, 204, 0.0)})"

var gFileName = null;
var prevScriptText = "";
var curScriptText = "";
var settingsDlg = null;

$(document).ready(function() {
    $('#build_button').on('click', function() {
      BUILDER.build(gFileName);
    });

    $('#edit_button').on('click', function() {
      BUILDER.edit(gFileName, syncScript);
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

    $('#close_script').on('click', function() {
      closeScript();
    });

    $('#export_object').on('click', function() {
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
      VIEWER.zoomAll();
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
        if (curView !== 'BOTTOM_LEFT') {
          VIEWER.setView('BOTTOM_LEFT');
          curView = 'BOTTOM_LEFT';
        }
        else {
          VIEWER.setView('BOTTOM_LEFT_BACK');
          curView = 'BOTTOM_LEFT_BACK';
        }
      }
      // Numpad 2, bottom
      else if (code == 50) {
        VIEWER.setView('BOTTOM');
        curView = 'BOTTOM';
      }
      // Numpad 3, bottom right
      else if (code == 51) {
        if (curView !== 'BOTTOM_RIGHT') {
          VIEWER.setView('BOTTOM_RIGHT');
          curView = 'BOTTOM_RIGHT';
        }
        else {
          VIEWER.setView('BOTTOM_RIGHT_BACK');
          curView = 'BOTTOM_RIGHT_BACK';
        }
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
        if (curView !== 'TOP_LEFT') {
          VIEWER.setView('TOP_LEFT');
          curView = 'TOP_LEFT';
        }
        else {
          VIEWER.setView('TOP_LEFT_BACK');
          curView = 'TOP_LEFT_BACK';
        }
      }
      // Numpad 8, top
      else if (code == 56) {
        VIEWER.setView('TOP');
        curView = 'TOP';
      }
      // Numpad 9, top
      else if (code == 57) {
        if (curView !== 'TOP_RIGHT') {
          VIEWER.setView('TOP_RIGHT');
          curView = 'TOP_RIGHT';
        }
        else {
          VIEWER.setView('TOP_RIGHT_BACK');
          curView = 'TOP_RIGHT_BACK';
        }
      }
    });

    $('#settings_button').on('click', function() {
      settingsDlg = new BrowserWindow({show: false, width: 800, height: 600, center: true});
      settingsDlg.setMenu(null);

      settingsDlg.once('ready-to-show', () => {
        settingsDlg.show();
      })

      settingsDlg.on('closed', () => {
        settingsDlg = null
      })

      settingsDlg.loadURL(`file://${__dirname}/dialogs/settings_dialog.html`)

      // settingsDlg.webContents.openDevTools();
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

    // Initialize a template that the user can start with
    curScriptText = SCRIPT_TEMPLATE;

    // Temporary to help debug views
    // gFileName = '/home/jwright/Downloads/caster_sleeve.py'
    // BUILDER.build(gFileName);
});

function newScript() {
  // We're starting a new script
  gFileName = null;

  // Keep the user from dumping changes they might want to keep
  if (curScriptText !== prevScriptText && prevScriptText !== "") {
    dialog.showMessageBox({type: "question",
                          buttons: ["Yes", "No"],
                          title: "Confirm",
                          message: "Save current work first?"},
    function(answer) {
      // If the user answers 'Yes', they get a save-as dialog
      if (answer === 0) {
        saveScriptAs("Save");
      }
      else {
        // Initialize a template that the user can start with
        curScriptText = SCRIPT_TEMPLATE;

        saveScriptAs("New");
      }
    });
  }
  else {
    // Initialize a template that the user can start with
    curScriptText = SCRIPT_TEMPLATE;

    saveScriptAs("New");
  }
}

function openScript() {
  // Keep the user from dumping changes they might want to keep
  if (curScriptText !== prevScriptText && prevScriptText !== "") {
    dialog.showMessageBox({type: "question",
                          buttons: ["Yes", "No"],
                          title: "Confirm",
                          message: "Save current work first?"},
    function(answer) {
      // If the user answers 'Yes', they get a save-as dialog
      if (answer === 0) {
        saveScript();
      }
    });
  }

  // Allow the user to open a new file
  dialog.showOpenDialog({ filters: [{ name: 'Python', extensions: ['py'] }]},
  function (fileNames) {
    if (fileNames === undefined) return;
    var fileName = fileNames[0];

    // Keep a reference to this for later
    gFileName = fileName;

    fs.readFile(fileName, function read(err, data) {
      if (err) {
          console.log(err);
      }

      curScriptText = data.toString();
      prevScriptText = curScriptText;
    });

    // Display the model in the 3D view
    BUILDER.build(gFileName);
  });
}

function saveScript() {
  if (gFileName === undefined || gFileName === null) {
    saveScriptAs("Save");
  }
  else {
    fs.writeFile(gFileName, curScriptText, function (err) {
      if (err) {
        console.log(err);
      }
    });
  }
}

function saveScriptAs(title) {
  dialog.showSaveDialog({ title: title, filters: [{ name: 'Python', extensions: ['py'] }]}, function (fileName) {
    if (fileName === undefined) return;

    // We want to keep a reference to the file for saving later
    gFileName = fileName;

    fs.writeFile(fileName, curScriptText, function (err) {
      if (err) {
        console.log(err);
      }
    });
  });
}

function closeScript() {
  VIEWER.resetView();

  gFileName = null;
}

// Helps us keep the changes in the external editor in sync with what is here
function syncScript(text) {
  curScriptText = text;
  prevScriptText = curScriptText;
}

function notImplementedYet() {
  dialog.showMessageBox({ message: "This feature has not been implemented yet. Please go to the following Google Group to request that this feature be implemented.\nhttps://groups.google.com/forum/#!forum/cadquery", buttons: ["OK"] });
}
