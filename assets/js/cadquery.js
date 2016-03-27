/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*globals $: false, require: false, editor: false*/
'use strict';
const cqgi = require('./assets/js/cqlib/cqgi.js');

$(document).ready(function() {
    $('#run-button').on('click', function() {
        cqgi.executeScript();
    });

    //set up model viewer
    MVIEWER.init({
        initialView: 'ISO',
        width: 800,
        height: 600,
        containerId: "three_container"
    });
});
