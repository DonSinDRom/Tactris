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
		.setMountPoint(0.5, 0.5)
		.setAlign(0.5, 0.5)
		.setSizeMode('absolute', 'absolute')
		.setAbsoluteSize(Consts.CELL_SIZE, Consts.CELL_SIZE);

	this.domElement = new DOMElement(this, {
		properties: {
			background: Consts.DOT_COLOR__UNTOUCHED
		}
	});

	this.domElement.setAttribute('role', 'gridcell');
	this.domElement.setAttribute('aria-readonly', true);
	this.domElement.setAttribute('aria-live', 'polite');
	this.domElement.setAttribute('aria-rowindex', y);
	this.domElement.setAttribute('aria-colindex', x);

	this.id = id;
	this.x = x;
	this.y = y;

	this.state = Consts.DOT_STATE__UNTOUCHED;
	this.position = new Position(this);
	this.position.setX(x * Consts.CELL_SIDE, {});
	this.position.setY(y * Consts.CELL_SIDE, {});
}

Cell.prototype = Object.create(Node.prototype);
Cell.prototype.constructor = Cell;

module.exports = Cell;
