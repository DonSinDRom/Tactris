'use strict';

var famous = require('famous');
var Consts = require('./Consts.js');

var Node = famous.core.Node;
var Position = famous.components.Position;
var DOMElement = famous.domRenderables.DOMElement;

function Button() {
	Node.call(this);

	// Center dot.
	this
		.setMountPoint(0.5, 0.5)
		.setAlign(0.5, 0.5)
		.setSizeMode('absolute', 'absolute')
		.setAbsoluteSize(Consts.DOT_SIDE * Consts.DIMENSION / 2, Consts.DOT_SIDE * Consts.DIMENSION / 2);

	this.domElement = new DOMElement(this, {
		tagName: 'span',
		content: 'New Game',
		properties: {
			color: '#fff',
			fontSize: '32px'
		},
		classes: ['Button']
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


function Nav() {
	Node.call(this);

	// Center dot.
	this
		.setMountPoint(0, 0)
		.setAlign(0.5, 0.5)
		.setSizeMode('absolute', 'absolute')
		.setAbsoluteSize(Consts.DOT_SIDE * Consts.DIMENSION / 2, Consts.DOT_SIDE * Consts.DIMENSION / 2);

	this.domElement = new DOMElement(this, {
		tagName: 'h1',
//		content: 'Nav',
//		properties: {
//			background: Consts.DOT_COLOR__UNTOUCHED
//		},
		classes: ['Nav']
	});

	let button = new Button();
	this.addChild(button);
	this.button = button;

	this.gameStart = function gameStart() {
		this._parent.gameStart();
	};

	this.position = new Position(this);
}

Nav.prototype = Object.create(Node.prototype);
Nav.prototype.constructor = Nav;


module.exports.Nav = Nav;
module.exports.Button = Button;
