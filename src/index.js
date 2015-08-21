'use strict';

var famous = require('famous');
var Consts = require('./Consts.js');
var Game = require('./Game.js');
var getRandomInt = require('./getRandomInt.js');

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

//localStorage.setItem(Consts.DIMENSION + '__figures', JSON.stringify([2,0]));
//localStorage.setItem(Consts.DIMENSION + '__orderColumns', JSON.stringify([2,0,1,3,4,5,6,8,9,10,11,7]));
//localStorage.setItem(Consts.DIMENSION + '__orderRows', JSON.stringify([5,0,1,2,3,4,7,8,9,10,11,6]));
//localStorage.setItem(Consts.DIMENSION + '__dots', JSON.stringify([0,0,0,-1,-1,-1,0,0,0,0,0,0,-1,-1,0,-1,-1,0,0,-1,-1,-1,0,0,-1,-1,0,-1,-1,-1,-1,0,-1,-1,-1,0,-1,-1,0,-1,-1,-1,-1,0,-1,-1,-1,-1,-1,-1,0,-1,-1,-1,-1,0,-1,-1,-1,-1,0,0,0,-1,0,0,0,0,-1,-1,0,0,0,-1,0,-1,-1,-1,-1,0,0,-1,0,0,-1,-1,0,-1,-1,-1,-1,0,-1,0,-1,-1,-1,-1,0,0,-1,-1,-1,0,-1,0,-1,-1,-1,-1,0,0,-1,-1,-1,-1,-1,0,-1,-1,-1,-1,0,0,-1,-1,-1,0,-1,-1,-1,-1,-1,-1,0,-1,-1,-1,-1,0,-1,-1,-1,0]));

scene.addChild(game);
