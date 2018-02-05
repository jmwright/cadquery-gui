/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*globals process: false, require: false, __dirname: false*/
'use strict';

const electron = require('electron');
const app = electron.app;  // Module to control application life.
const BrowserWindow = electron.BrowserWindow;  // Module to create native browser window.
const localShortcut = require('electron-localshortcut'); // Allows us to add hotkeys
const template = require('./menu_template.js');

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
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 800, height: 600});
  mainWindow.maximize();

  // const menu = Menu.buildFromTemplate(template);
  // Menu.setApplicationMenu(menu);

  // and load the index.html of the app.
  mainWindow.loadURL('file://' + __dirname + '/index.html');

  // Open the DevTools, if desired
  // mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });

  // Register an 'F5' key shortcut listener to execute a script
  var ret = localShortcut.register(mainWindow, 'F5', function() {
    // console.log('F5 pressed');

    mainWindow.webContents.executeJavaScript("BUILDER.build();");
  });

  // Register an 'Ctrl+S' key shortcut listener to execute a script
  ret = localShortcut.register(mainWindow, 'CommandOrControl+S', function() {
    // console.log('Ctrl+S pressed');

    mainWindow.webContents.executeJavaScript("saveScript();");
  });

  // Register an 'Ctrl+N' key shortcut listener to execute a script
  ret = localShortcut.register(mainWindow, 'CommandOrControl+N', function() {
    // console.log('Ctrl+S pressed');

    mainWindow.webContents.executeJavaScript("newScript();");
  });

  // Register an 'Ctrl+O' key shortcut listener to execute a script
  ret = localShortcut.register(mainWindow, 'CommandOrControl+O', function() {
    // console.log('Ctrl+O pressed');

    mainWindow.webContents.executeJavaScript("openScript();");
  });
});
