'use strict';

var famous = require('famous');
var Consts = require('./Consts.js');

var Node = famous.core.Node;
var Position = famous.components.Position;
var DOMElement = famous.domRenderables.DOMElement;

function Menu() {
	Node.call(this);

	// Centering
	this
		.setMountPoint(0.5, 0.5, 0)
		.setAlign(0.5, 0.5, 0)
		.setOrigin(0.5, 0.5, 0)
		.setPosition(0, 0, 0);

	this.domElement = new DOMElement(this, {
		properties: {
			cursor: 'cell'
		},
		content: 'Menu'
	});

	this.position = new Position(this);
}

Menu.prototype = Object.create(Node.prototype);
Menu.prototype.constructor = Menu;

module.exports = Menu;
