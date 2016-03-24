/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*globals $: false, require: false*/
'use strict';

$(document).ready(function() {
    $('#run-button').on('click', function() {
        var scriptText = editor.getValue();
        const exec = require('child_process').exec;
        const child = exec('echo "' + scriptText + '" | python',
          (error, stdout, stderr) => {
            console.log(`stdout: ${stdout}`);
            console.log(`stderr: ${stderr}`);
            if (error !== null) {
              console.log(`exec error: ${error}`);
            }
        });
    });
});