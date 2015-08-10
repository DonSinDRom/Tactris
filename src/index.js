'use strict';

var famous = require('famous');
var Consts = require('./Consts.js');
var Game = require('./Game.js');

var FamousEngine = famous.core.FamousEngine;


/*jshint -W121 */
/**
 * Initialize fixed-sized array with incremented values
 * @param {number} length - Length of array
 */
if (!Array.prototype.initialize) {
	Array.prototype.initialize = function (length) {
		var arr = [];
		for (var i = 0; i < length; i++) {
			arr.push(i);
		}
		return arr;
	};
}
Array.prototype.max = function() {
	return Math.max.apply(null, this);
};
Array.prototype.min = function() {
	return Math.min.apply(null, this);
};
/*jshint -W121 */


FamousEngine.init();
var scene = FamousEngine.createScene();
var game = new Game(Consts.ROWS, Consts.COLUMNS);
scene.addChild(game);
