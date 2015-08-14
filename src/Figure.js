'use strict';

var famous = require('famous');
var Consts = require('./Consts.js');
var Cell = require('./Cell.js');

var Node = famous.core.Node;
var Position = famous.components.Position;
var DOMElement = famous.domRenderables.DOMElement;

function Figure(id, randomId) {
	Node.call(this);

	// Center dot.
	this
		.setMountPoint(0, 0)
		.setAlign(0.5, 0.5)
		.setSizeMode('absolute', 'absolute')
		.setAbsoluteSize(Consts.DOT_SIDE * Consts.DIMENSION / 2, Consts.DOT_SIDE * Consts.DIMENSION / 2);

	this.domElement = new DOMElement(this, {
		tagName: 'h1',
		classes: ['Figure']
	});

	this.domElement.setAttribute('role', 'grid');
	this.domElement.setAttribute('aria-live', 'polite');

	this.id = id;
	this.randomId = randomId;

	this.cells = [];
	for (let cellCounter = 0; cellCounter < 4; cellCounter++) {
		let cell = new Cell(cellCounter, Consts.FIGURES[randomId][cellCounter].x, Consts.FIGURES[randomId][cellCounter].y);
		this.addChild(cell);
		this.cells.push(cell);
	}

	this.position = new Position(this);

	this.addUIEvent('click');
}

Figure.prototype = Object.create(Node.prototype);
Figure.prototype.constructor = Figure;

/*jshint -W074 */
Figure.prototype.onReceive = function onReceive(type, ev) {
	switch (type) {
	case 'click':
			this._parent.figureUpdate(this.id);
			this._parent.scoreSurcharge();
			this.emit('id', this.id).emit('randomId', this.randomId);
			break;
	default:
			return false;
	}
};/*jshint +W074 */

module.exports = Figure;
