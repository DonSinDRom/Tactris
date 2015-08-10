'use strict';

var famous = require('famous');
var Consts = require('./Consts.js');

var Node = famous.core.Node;
var Position = famous.components.Position;
var DOMElement = famous.domRenderables.DOMElement;

function Cell(id, x, y) {
	Node.call(this);

	// Center dot.
	this
		.setMountPoint(0.5, 0.5, 0)
		.setAlign(0.5, 0.5, 0)
		.setSizeMode('absolute', 'absolute', 'absolute')
		.setAbsoluteSize(Consts.CELL_SIDE, Consts.CELL_SIDE, Consts.CELL_SIDE);

	this.domElement = new DOMElement(this, {
		properties: {
			background: Consts.DOT_COLOR__UNTOUCHED
		}
	});

	this.id = id;
	this.x = x;
	this.y = y;

	this.generate = function generate() {
		if (this.state === Consts.DOT_STATE__UNTOUCHED) {
			this.state = Consts.DOT_STATE__HOVERED;
			this.domElement.setProperty('background-color', Consts.DOT_COLOR__HOVERED);
		}
	};

	this.state = Consts.DOT_STATE__UNTOUCHED;
	this.position = new Position(this);
	this.position.setX(x * Consts.CELL_SIDE, {});
	this.position.setY(y * Consts.CELL_SIDE, {});
}

Cell.prototype = Object.create(Node.prototype);
Cell.prototype.constructor = Cell;

module.exports = Cell;
