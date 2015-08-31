'use strict';

var famous = require('famous');
var Consts = require('./Consts.js');

var Node = famous.core.Node;
var Position = famous.components.Position;
var DOMElement = famous.domRenderables.DOMElement;

let width = Consts.WIDTH;
let heigth = Consts.HEIGHT;

function Button() {
	Node.call(this);

	let alignX = 0, alignY = 0;
	if (width > heigth) {
		alignX = 0;
		alignY = 0.5;
	} else {
		alignX = 0.5;
		alignY = 0;
	}

	this
		.setMountPoint(0, 0)
		.setAlign(alignX, alignY)
		.setSizeMode('absolute', 'absolute')
		.setAbsoluteSize(Consts.DOT_SIDE * Consts.DIMENSION / 2, Consts.DOT_SIDE * Consts.DIMENSION / 2);

	this.domElement = new DOMElement(this, {
		tagName: 'h2',
		properties: {
			display: 'inline',
			color: '#fff',
			fontSize: '32px',
			padding: '1rem'
		},
		content: 'New Game',
		classes: ['Button', 'interactive']
	});

	this.addUIEvent('click');
	this.position = new Position(this);
}

Button.prototype = Object.create(Node.prototype);
Button.prototype.constructor = Button;

Button.prototype.onReceive = function onReceive(type, ev) {
	switch (type) {
	case 'click':
			this._parent.gameStart();
			//this.emit('id', this.domElement.id).emit('state', this.domElement.state);
			break;
	default:
			return false;
	}
};

function Score() {
	Node.call(this);

	this
		.setMountPoint(0, 0)
		.setAlign(0, 0)
		.setSizeMode('absolute', 'absolute')
		.setAbsoluteSize(Consts.DOT_SIDE * Consts.DIMENSION / 2, Consts.DOT_SIDE * Consts.DIMENSION / 2);

	this.score = {};
	let localStorageScore = JSON.parse(localStorage.getItem(Consts.DIMENSION + '__score'));
	if (localStorageScore) {
		this.score = localStorageScore;
	} else {
		this.score = {
			best: 0,
			current: 0
		};
		localStorage.setItem(Consts.DIMENSION + '__score', JSON.stringify(this.score));
	}

	this.domElement = new DOMElement(this, {
		tagName: 'h2',
		classes: ['Scores'],
		properties: {
			color: '#fff',
			fontSize: '32px',
			padding: '1rem'
		},
		content: `
			<p class="Score">Score:
				<var class="ScoreValue">
					${this.score.current}
				</var>
			</p>
			<p class="Score">Best:
				<var class="ScoreValue">
					${this.score.best}
				</var>
			</p>`
	});

	this.domElement.setAttribute('role', 'log');
	this.domElement.setAttribute('aria-live', 'polite');

	this.scoreSetContent = function scoreSetContent(value) {
		if (value >= this.score.best) {
			this.domElement.setContent(`
				<p class="Score">Score:
					<var class="ScoreValue">
						${value}
					</var>
				</p>
				<p class="Score">Best:
					<var class="ScoreValue">
						${value}
					</var>
				</p>`);
			this.score.best = value;
		} else {
			this.domElement.setContent(`
				<p class="Score">Score:
					<var class="ScoreValue">
						${value}
					</var>
				</p>
				<p class="Score">Best:
					<var class="ScoreValue">
						${this.score.best}
					</var>
				</p>`);
		};
		localStorage.setItem(Consts.DIMENSION + '__score', JSON.stringify(this.score));
	}

	this.scoreInc = function scoreInc(inc) {
		this.score.current += inc;
		this.scoreSetContent(this.score.current);
	};

	this.scoreReset = function scoreReset() {
		this.score.current = 0;
		this.scoreSetContent(this.score.current);
	};

	this.scoreSurcharge = function scoreSurcharge() {
		this.score.current = Number.parseInt(this.score.current * Consts.SCORE__SURCHARGE);
		this.scoreSetContent(this.score.current);
	};

	this.position = new Position(this);
}

Score.prototype = Object.create(Node.prototype);
Score.prototype.constructor = Score;

function Nav() {
	Node.call(this);

	let x = 0, y = 0;
	if (width > heigth) {
		x = 2;
		y = 1;
	} else {
		x = 1;
		y = 2;
	}

	this
		.setMountPoint(0, 0)
		.setAlign(0.5, 0.5)
		.setSizeMode('absolute', 'absolute')
		.setAbsoluteSize(Consts.DOT_SIDE * Consts.DIMENSION / x, Consts.DOT_SIDE * Consts.DIMENSION / y);

	this.domElement = new DOMElement(this, {
		tagName: 'nav',
		classes: ['Nav']
	});

	let score = new Score();
	this.addChild(score);
	this.score = score;

	let button = new Button();
	this.addChild(button);
	this.button = button;

	this.gameStart = function gameStart() {
		this._parent.gameStart();
	};
	this.scoreInc = function scoreInc(value) {
		this.score.scoreInc(value);
	};
	this.scoreReset = function scoreReset() {
		this.score.scoreReset();
	};
	this.scoreSurcharge = function scoreSurcharge() {
		this.score.scoreSurcharge();
	};

	this.position = new Position(this);
}

Nav.prototype = Object.create(Node.prototype);
Nav.prototype.constructor = Nav;


module.exports.Nav = Nav;
module.exports.Button = Button;
module.exports.Score = Score;
