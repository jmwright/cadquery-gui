'use strict';
/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*globals require: false, editor: false, process: false, MVIEWER: false*/

var temp = require('temp');
var fs   = require('fs');
var exec = require('child_process').exec;
var settings = require('electron').remote.require('electron-settings');

var BUILDER = function() {
  function build(path) {
    if (path === undefined || path === null) return;

    var results = "{}";

    // Execute the script using the python interpreter
    exec("python " + process.cwd() + "/assets/python/cq_process.py --file=" + path + " --outputFormat=threeJS", function(error, stdout, stderr) {
      if (error === undefined || error === null) {
          var lines = stdout.trim().split('\n');

          // Remove any extra output from before the JSON
          for(var i = 0; i < lines.length; i++) {
            if (lines[i][0] !== '{') {
              delete lines[i]
            }
            else {
              break;
            }
          }

          results = JSON.parse(lines.join('\n'));

          // VIEWER will display all of the objects that are in the returned JSON
          VIEWER.loadGeometry(results);
      }
      else {
          console.log(`exec error: ${error}; stderr: ${stderr}`);
      }
    });
  }

  // Watches a script for changes so that can be re-executed
  function watch(path, cb) {
    fs.watch(path, { encoding: 'buffer' }, (eventType, filename) => {
      if (filename) {
        // Make sure that the user wants to execute/build the script on save
        if (settings.get('general.execute_on_save')) {
          build(path);
        }

        // Update the callback for anything that wants updates to the text
        fs.readFile(path, function read(err, data) {
          if (err) {
              console.log(err);
          }

          cb(data);
        });
      }
    });
  }

  // Opens the script rendered in the 3D view in an editor of the user's choice
  function edit(path, cb) {
    if (path === undefined || path === null) return;

    exec(settings.get('general.editor_command_line') + ' ' + path, function(error, stdout, stderr) {
      if (error === undefined || error === null) {
        // Make sure that updates to the file are handled
        watch(path, cb);
      }
      else {
          console.log(`exec error: ${error}; stderr: ${stderr}`);
      }
    });
  }

  return {
    build: build,
    edit: edit
  };
}();
