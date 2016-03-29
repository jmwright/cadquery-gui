// TODO: CQGI inteface code will need to be pulled back into here as soon as
// I know what I am doing

// 'use strict';
// var temp = require('temp');
// var fs   = require('fs');
// var exec = require('child_process').exec;

// var executeScript = function() {
//   // Automatically track and cleanup files at exit
//   temp.track();

//   // Get the text that the user entered into the editor
//   var scriptText = editor.getValue();

//   // Create a temporary file that will hold the script so that we can execute it
//   temp.open('cqscript', function(err, info) {
//     if (!err) {
//       fs.write(info.fd, scriptText);
//       fs.close(info.fd, function(err) {
//         if (err !== null) {
//           console.log("Error closing file object: " + err);
//         }

//         // Execute the script using the python interpreter
//         exec("python " + info.path, function(error, stdout, stderr) {
//           if (error !== undefined) {
//               console.log(stdout.trim());
//           }
//           else {
//               console.log(`exec error: ${error}; stderr: ${stderr}`);
//           }
//         });
//       });
//     }
//   });
// }