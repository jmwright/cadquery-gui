/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*globals process: false, require: false, __dirname: false*/
'use strict';

const { app, Menu } = require('electron');
// const app = electron.app;  // Module to control application life.
const BrowserWindow = require('electron').BrowserWindow;  // Module to create native browser window.
const localShortcut = require('electron-localshortcut'); // Allows us to add hotkeys
const settings = require('electron-settings');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
var mainWindow = null;

require('electron-reload')(__dirname);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform != 'darwin') {
    app.quit();
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', function () {
  // Set defaults for the settings if this is the first time the app has run
  if (!settings.has('startup.first_run') || settings.get('startup.first_run')) {
    setDefaultSettings();

    // Keep track of the fact that we have already been here
    settings.set('startup.first_run', false);
  }

  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800, height: 600, icon: __dirname + '/assets/images/cadquery-gui_logo_dark.svg', webPreferences: {
      nodeIntegration: true
    }
  });
  mainWindow.maximize();
  mainWindow.setMenu(null);

  // const menu = Menu.buildFromTemplate(template.template);
  // Menu.setApplicationMenu(menu);

  // and load the index.html of the app.
  mainWindow.loadURL('file://' + __dirname + '/index.html');

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });

  // Register an 'F9' key shortcut listener to execute a script
  var ret = localShortcut.register(mainWindow, settings.get('hotkeys.build_script_hotkey'), function () {

    mainWindow.webContents.executeJavaScript("BUILDER.build();");
  });

  // Register an 'Ctrl+N' key shortcut listener to execute a script
  ret = localShortcut.register(mainWindow, settings.get('hotkeys.new_script_hotkey'), function () {

    mainWindow.webContents.executeJavaScript("newScript();");
  });

  // Register an 'Ctrl+O' key shortcut listener to execute a script
  ret = localShortcut.register(mainWindow, settings.get('hotkeys.open_script_hotkey'), function () {

    mainWindow.webContents.executeJavaScript("openScript();");
  });

  ret = localShortcut.register(mainWindow, 'CommandOrControl+Shift+C', function () {
    // Open the DevTools, if desired
    mainWindow.webContents.openDevTools();
  });
});

// Sets a sane starting set of settings for the app
function setDefaultSettings() {
  // Editor command line setting
  settings.set('general.editor_command_line', 'atom');

  // Execute script on save setting
  settings.set('general.execute_on_save', true);

  // Debug mode setting
  settings.set('general.debug_mode', false);

  // Hotkey for building and displaying scripts
  settings.set('hotkeys.build_script_hotkey', 'F9');

  // Hotekey for creating a new script
  settings.set('hotkeys.new_script_hotkey', 'CommandOrControl+N');

  // Hotkey for opening an existing script
  settings.set('hotkeys.open_script_hotkey', 'CommandOrControl+O');

  // Whether or not to use an external build server
  settings.set('exec.use_external_server', false);

  // The address of the external build server to use
  settings.set('exec.external_server_address', 'http://127.0.0.1:8080/function/cq-render');
}
