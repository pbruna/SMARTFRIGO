var $ = require('jquery');
$.ui = require('jquery-ui');
var jQuery = $;
var css = require('../styles.css');
require('bootstrap');

require('core-js');
window.zone = require('zone.js');
require('reflect-metadata');
// var System = require('systemjs');

require('./systemjs.config.js');

System.import('app').catch(function (err) { console.error(err); });