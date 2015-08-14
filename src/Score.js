'use strict';

var famous = require('famous');
var Consts = require('./Consts.js');

var Node = famous.core.Node;
var Position = famous.components.Position;
var DOMElement = famous.domRenderables.DOMElement;

function Score(x, y) {
	Node.call(this);

	// Center dot.
	this
		.setMountPoint(0, 0, 0)
		.setAlign(0.5, 0.5, 0)
		.setSizeMode('absolute', 'absolute', 'absolute')
		.setAbsoluteSize(Consts.DOT_SIDE * Consts.DIMENSION, Consts.DOT_SIDE * Consts.DIMENSION / 2, Consts.DOT_SIDE);

//	let score = new Score(0);
//	this.addChild(score);
//	this.score = score;

	this.score = 0;

	this.domElement = new DOMElement(this, {
		tagName: 'h2',
		classes: ['Scores'],
		properties: {
			color: '#fff',
			fontSize: '32px'
		},
		content: 'Score: <var class="Score">' + this.score + '</var>'
	});

	this.domElement.setAttribute('role', 'log');
	this.domElement.setAttribute('aria-live', 'polite');

	this.scoreSetContent = function scoreSetContent(value) {
		this.domElement.setContent('Score: <var class="Score">' + value + '</var>');
	}

	this.scoreInc = function scoreInc(inc) {
		this.score += inc;
		this.scoreSetContent(this.score);
	};

	this.scoreReset = function scoreReset() {
		this.score = 0;
		this.scoreSetContent(this.score);
	};

	this.scoreSurcharge = function scoreSurcharge() {
		this.score = Number.parseInt(this.score * Consts.SCORE__SURCHARGE);
		this.scoreSetContent(this.score);
	};

	this.position = new Position(this);
	this.position.setX(x - Consts.DOT_SIDE * Consts.DIMENSION / 2, {});
	this.position.setY(y - Consts.DOT_SIDE * Consts.DIMENSION / -2, {});
}

Score.prototype = Object.create(Node.prototype);
Score.prototype.constructor = Score;

module.exports = Score;
