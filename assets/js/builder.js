'use strict';
/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*globals require: false, editor: false, process: false, MVIEWER: false*/

var temp = require('temp');
var fs   = require('fs');
var exec = require('child_process').exec;
var settings = require('electron').remote.require('electron-settings');
var request = require('request');

var BUILDER = function() {
  function build(path) {
    if (path === undefined || path === null) return;

    var results = "{}";

    // Determine if we are using an external server, and where to look for it
    var use_external_server = settings.get('exec.use_external_server');
    var external_server_address = settings.get('exec.external_server_address');

    if (use_external_server) {
      // Pull the contents of the script file being dipsplayed out and stuff it into a JSON object
      var script_json = {};
      var script = fs.readFileSync(path).toString();
      script_json["script"] = script;

      request.post({
            headers: {'content-type' : 'text/json', 'X-Output-Mode': 'json'},
            url:     external_server_address,
            body:    JSON.stringify(script_json)
          },
        function(error, response, body) {
          if (!error && response.statusCode == 200) {
            // Some versions of CadQuery output this extra line at the top that will break JSON parsing
            var trimmed = body.replace("Unable to handle function call", "").trim();
            results = JSON.parse(trimmed);

            // Display the results
            VIEWER.loadGeometry(results);
          }
          else {
            console.log("There was a problem contacting the server: " + response.statusCode);
          }
      });
    }
    else {
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
