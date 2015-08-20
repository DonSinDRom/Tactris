'use strict';

var famous = require('famous');
var Consts = require('./Consts.js');
var Game = require('./Game.js');

var FamousEngine = famous.core.FamousEngine;

/*jshint -W121 */
if (!Array.prototype.initialize) {
	Array.prototype.initialize = require('./Array.js').initialize;
}
if (!Array.prototype.max) {
	Array.prototype.max = require('./Array.js').max;
}
if (!Array.prototype.min) {
	Array.prototype.min = require('./Array.js').min;
}
if (!Array.prototype.every) {
	Array.prototype.every = require('./Array.js').every;
}
if (!Array.prototype.some) {
	Array.prototype.some = require('./Array.js').some;
}
if (!Array.prototype.filter) {
	Array.prototype.filter = require('./Array.js').filter;
}
if (!Array.prototype.find) {
	Array.prototype.find = require('./Array.js').find;
}
if (!Array.prototype.findIndex) {
	Array.prototype.findIndex = require('./Array.js').findIndex;
}
if (!Array.prototype.forEach) {
	Array.prototype.forEach = require('./Array.js').forEach;
}
if (!Array.prototype.includes) {
	Array.prototype.includes = require('./Array.js').includes;
}
/*jshint +W121 */

FamousEngine.init();
var scene = FamousEngine.createScene();
var game = new Game(Consts.ROWS, Consts.COLUMNS);
scene.addChild(game);
