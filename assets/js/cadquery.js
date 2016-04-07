/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*globals $: false, require: false, BUILDER: false, MVIEWER: false, editor: false*/
'use strict';

var shell = require('electron').shell;
var remote = require('remote');
 var dialog = remote.require('dialog');
 var fs = require('fs');

$(document).ready(function() {
    $('#run-button').on('click', function() {
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
      editor.setValue("# 'import cadquery as cq' is run for you");
    });

    $('#open_script').on('click', function() {
      dialog.showOpenDialog({ filters: [{ name: 'Python', extensions: ['py'] }]}, function (fileNames) {
        if (fileNames === undefined) return;
        var fileName = fileNames[0];
        fs.readFile(fileName, 'utf-8', function (err, data) {
          editor.setValue(data);
        });
      });
    });

    //set up model viewer
    MVIEWER.init({
      initialView: 'ISO',
      width: 800,
      height: 600,
      containerId: "modelview"
    });
});
