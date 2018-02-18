/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*globals process: false, require: false, __dirname: false*/
'use strict';

const {app, Menu} = require('electron');
// const app = electron.app;  // Module to control application life.
const BrowserWindow = require('electron').BrowserWindow;  // Module to create native browser window.
const localShortcut = require('electron-localshortcut'); // Allows us to add hotkeys
const settings = require('electron-settings');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var mainWindow = null;

require('electron-reload')(__dirname);

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform != 'darwin') {
    app.quit();
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', function() {
  // Set defaults for the settings if this is the first time the app has run
  if (!settings.has('startup.first_run') || settings.get('startup.first_run')) {
      setDefaultSettings();

      // Keep track of the fact that we have already been here
      // settings.set('startup.first_run', false);
  }

  // Create the browser window.
  mainWindow = new BrowserWindow({width: 800, height: 600, icon: __dirname + '/assets/images/cadquery-gui_logo_dark.svg'});
  mainWindow.maximize();
  mainWindow.setMenu(null);

  // const menu = Menu.buildFromTemplate(template.template);
  // Menu.setApplicationMenu(menu);

  // and load the index.html of the app.
  mainWindow.loadURL('file://' + __dirname + '/index.html');

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });

  // Register an 'F5' key shortcut listener to execute a script
  var ret = localShortcut.register(mainWindow, 'F5', function() {

    mainWindow.webContents.executeJavaScript("BUILDER.build();");
  });

  // Register an 'Ctrl+S' key shortcut listener to execute a script
  ret = localShortcut.register(mainWindow, 'CommandOrControl+S', function() {

    mainWindow.webContents.executeJavaScript("saveScript();");
  });

  // Register an 'Ctrl+N' key shortcut listener to execute a script
  ret = localShortcut.register(mainWindow, 'CommandOrControl+N', function() {

    mainWindow.webContents.executeJavaScript("newScript();");
  });

  // Register an 'Ctrl+O' key shortcut listener to execute a script
  ret = localShortcut.register(mainWindow, 'CommandOrControl+O', function() {

    mainWindow.webContents.executeJavaScript("openScript();");
  });

  ret = localShortcut.register(mainWindow, 'CommandOrControl+Shift+C', function() {
    // Open the DevTools, if desired
    mainWindow.webContents.openDevTools();
  });
});

// Sets a sane starting set of settings for the app
function setDefaultSettings() {
  // Welcome dialog setting
  settings.set('startup.show_welcome', true);

  // Editor command line setting
  settings.set('general.editor_command_line', 'atom $MYSCRIPT_FULL_PATH');

  // Execute script on save setting
  settings.set('general.execute_on_save', true);

  // Debug mode setting
  settings.set('general.debug_mode', false);
}
