'use strict';

var famous = require('famous');
var Consts = require('./Consts.js');

var Node = famous.core.Node;
var Position = famous.components.Position;
var DOMElement = famous.domRenderables.DOMElement;

function Modal() {
	Node.call(this);

	this
		.setPosition(0, 0, 0);

	this.domElement = new DOMElement(this, {
		tagName: 'center',
		classes: ['Modal', 'interactive'],
		properties: {
			color: '#fff',
			fontSize: '24px',
			padding: '1rem',
			backgroundColor: 'rgba(0,0,0,.6)'
		},
		content: 'Modal'
	});

	this.hide = function hide() {
		this.position.setY(-Consts.HEIGHT, {
			duration: Consts.MODAL_DURATION,
			curve: Consts.MODAL_CURVE
		});
	};

	this.show = function show() {
		this.domElement.setContent(`<h1>Game Over!<br>Click to start new game</h1>`);
		this.position.setY(0, {
			duration: Consts.MODAL_DURATION,
			curve: Consts.MODAL_CURVE
		});
	};

	this.position = new Position(this);
	this.position.setY(-Consts.HEIGHT);

	this.addUIEvent('click');
}

Modal.prototype = Object.create(Node.prototype);
Modal.prototype.constructor = Modal;

Modal.prototype.onReceive = function onReceive(type, ev) {
	switch (type) {
	case 'click':
			this.hide();
			this._parent.gameStart();
			break;
	default:
			return false;
	}
};/*jshint +W074 */

module.exports = Modal;
