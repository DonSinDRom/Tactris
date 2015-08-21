'use strict';

var famous = require('famous');
var Consts = require('./Consts.js');
var Game = require('./Game.js');
var Polyfills = require('./Polyfills.js');
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
//Polyfills
if (!Array.prototype.every) {
	Array.prototype.every = require('./Polyfills.js').ArrayEvery;
}
if (!Array.prototype.some) {
	Array.prototype.some = require('./Polyfills.js').ArraySome;
}
if (!Array.prototype.filter) {
	Array.prototype.filter = require('./Polyfills.js').ArrayFilter;
}
if (!Array.prototype.find) {
	Array.prototype.find = require('./Polyfills.js').ArrayFind;
}
if (!Array.prototype.findIndex) {
	Array.prototype.findIndex = require('./Polyfills.js').ArrayFindIndex;
}
if (!Array.prototype.forEach) {
	Array.prototype.forEach = require('./Polyfills.js').ArrayForEach;
}
if (!Array.prototype.includes) {
	Array.prototype.includes = require('./Polyfills.js').ArrayIncludes;
}
if (!Object.keys) {
	Object.keys = require('./Polyfills.js').ObjectKeys;
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
