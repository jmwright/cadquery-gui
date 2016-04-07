'use strict';
/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*globals require: false, editor: false, process: false, MVIEWER: false*/

var temp = require('temp');
var fs   = require('fs');
var exec = require('child_process').exec;

var BUILDER = function() {
  function build() {
    // Automatically track and cleanup files at exit
    temp.track();

    // Get the text that the user entered into the editor
    var scriptText = editor.getValue();

    // Create a temporary file that will hold the script so that we can execute it
    temp.open('cqscript', function(err, info) {
      if (!err) {
        fs.write(info.fd, scriptText);
        fs.close(info.fd, function(err) {
          if (err !== null) {
            console.log("Error closing file object: " + err);
          }

          // Execute the script using the python interpreter
          exec("python " + process.cwd() + "/assets/python/cq_process.py --file=" + info.path + " --outputFormat=threeJS", function(error, stdout, stderr) {
            if (error === undefined || error === null) {
                var lines = stdout.trim().split('\n');
                lines.splice(0, 1);
                var results = JSON.parse(lines.join('\n'));
                // TODO: Rework MVIEWER to accept multiple objects to render
                MVIEWER.load(results);
            }
            else {
                console.log(`exec error: ${error}; stderr: ${stderr}`);
            }
          });
        });
      }
    });
  }

  return {
    build: build
  };
}();