/**
 * This javascript file will constitute the entry point of your solution.
 *
 * Edit it as you need.  It currently contains things that you might find helpful to get started.
 */

// This is not really required, but means that changes to index.html will cause a reload.
require("./site/index.html");
// Apply the styles in style.css to the page.
require("./site/style.css");

// if you want to use es6, you can do something like
// require('./es6/myEs6code');
// here to load the myEs6code.js file, and it will be automatically transpiled.

// Change this to get detailed logging from the stomp library
global.DEBUG = false;

var url = "ws://localhost:8011/stomp"
var client = Stomp.client(url)

var app = require("./app.js");

client.debug = function(msg) {
  if (global.DEBUG) {
    console.info(msg)
  }
}

client.connect({}, function() { app.connectCallback(client) }, function(error) {
  alert(error.headers.message)
})

