'use strict';

var famous = require('famous');
var Consts = require('./Consts.js');

var Node = famous.core.Node;
var Position = famous.components.Position;
var DOMElement = famous.domRenderables.DOMElement;

function Player(x, y) {
	Node.call(this);

	// Center dot.
	this
		.setMountPoint(0, 0, 0)
		.setAlign(0.5, 0.5, 0)
		.setSizeMode('absolute', 'absolute', 'absolute')
		.setAbsoluteSize(Consts.DOT_SIDE * Consts.DIMENSION, Consts.DOT_SIDE * Consts.DIMENSION / 2, Consts.DOT_SIDE);

	this.score = 0;

	this.domElement = new DOMElement(this, {
		properties: {
			color: '#fff',
			fontSize: '32px'
		},
		content: 'Score ' + Number(this.score)
	});

	this.scoreInc = function scoreInc(inc) {
		this.score += inc;
		this.domElement.setContent('Score ' + this.score);
	};

	this.scoreReset = function scoreReset() {
		this.domElement.setContent('Score ' + 0);
		this.score = 0;
	};

	this.position = new Position(this);
	this.position.setX(x - Consts.DOT_SIDE * Consts.DIMENSION / 2, {});
	this.position.setY(y - Consts.DOT_SIDE * (Consts.DIMENSION - 15), {});
}

Player.prototype = Object.create(Node.prototype);
Player.prototype.constructor = Player;

module.exports = Player;
