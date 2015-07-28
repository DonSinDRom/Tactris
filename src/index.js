'use strict';

const famous = require('famous');

const Node = famous.core.Node;
const FamousEngine = famous.core.FamousEngine;
const Align = famous.components.Align;
const Position = famous.components.Position;
const Size = famous.components.Size;
const Rotation = famous.components.Rotation;
const Curves = famous.transitions.Curves;
const DOMElement = famous.domRenderables.DOMElement;

const COLOR = 'rgb(122,199,79)';
const COLOR__ACTIVE = 'rgb(232,116,97)';
const DOT_SIZE = 48;
const DOT_MARGIN = 1;
const DOT_SIDE = DOT_SIZE + DOT_MARGIN;
const ROWS = 10;
const COLUMNS = 10;
const DURATION = 600;
const CURVE = 'outBounce'; //outQuint outElastic inElastic inOutEase inBounce outBounce

/**
 * Initialize fixed-sized array with determinated value
 * @param {*} value - Determinated value
 * @param {number} length - Length of array
 */
if (!Array.prototype.initialize) {
	Array.prototype.initialize = function (value, length) {
		var arr = [];
		while (length--) {
			arr.push(value);
		}
		return arr;
	};
}


function Background(rows, cols) {
	Node.call(this);
	this._domElement = new DOMElement(this, {
		properties: {
			backgroundColor: '#333'
		}
	});

	var count = 0;
	this.dots = [];
	for (let row = 0; row < rows; row++) {
		for (let col = 0; col < cols; col++) {
			let dot = new Dot(count++);
			this.addChild(dot);
			this.dots.push(dot);
		}
	}


	this.mousing = 0;
	/**
	 * Allow selecting dots by mousemoving
	 * @param {number} id - Id of dot
	 */
	this.mousingDown = function (id) {
		this.mousing = this.dots[id].fill ? -1 : +1;
	};
	this.mousingUp = function (id) {
		this.mousing = 0;
	};

	this.hoverDots = [];

	/**
	 * Check dot for selectability
	 * @param {number} id - Id of dot
	 */
	this.hoverDot = function (id) {
		if (id !== undefined) {
			if (!this.hoverDots.includes(id)) {
				if (this.hoverDots.length < 12) {
					this.hoverDots.push(id);
					return true;
				} else {
					this.dots[this.hoverDots[0]].toggleFill();
					this.hoverDots.shift();
					this.hoverDots.push(id);
					return true;
				}
			}
		}
	};

	this.orderRows = [0,1,2,3,4,5,6,7,8,9];
	this.orderColumns = [0,1,2,3,4,5,6,7,8,9];

	this.checkLine = function checkLine() {
		var dots = this.dots;
		var filledRows = [];
		var filledColumns = [];
		for (let line = 0; line < 10; line++) {
			let row = dots.filter((element) => element.id % 10 === line && element.fill === true);
			let column = dots.filter((element) => Number.parseInt(element.id / 10) === line && element.fill === true);
			if (row.length === 10) {
				console.log('Filled row: ', line);
				filledRows.push(line);
			}
			if (column.length === 10) {
				filledColumns.push(line);
				console.log('Filled column: ', line);
			}
		}
		filledRows.sort(function (x, y) {
			if (x < 5) {
				return y - x;
			} else {
				return x - y;
			}
		});
		filledColumns.sort(function (x, y) {
			if (x < 5) {
				return y - x;
			} else {
				return x - y;
			}
		});
		for (let row = 0; row < filledRows.length; row++) {
			this.moveLine(filledRows[row], 'y');
		}
		for (let column = 0; column < filledColumns.length; column++) {
			this.moveLine(filledColumns[column], 'x');
		}
	}

	this.moveLine = function moveLine(line, direction) {
		console.log('moveLine', line, direction);
		let dots = this.dots;
		let orderRows = this.orderRows;
		let orderColumns = this.orderColumns;

		if (direction === 'x') {
			let order = orderRows;
			let lineX = order.indexOf(line);

			if (line < 5) {

				for (let row = 0; row < 10; row++) {
					let dot = this.dots[order[lineX] * 10 + row];
					let position = dot.position;
					let y = position.getY();
					position.setY(y - DOT_SIDE * lineX, {
						duration: DURATION,
						curve: CURVE
					});
					dot.deselect();
				}
				for (let column = lineX - 1; column >= 0; column--) {
					for (let row = 0; row < 10; row++) {
						let dot = this.dots[order[column] * 10 + row];
						let position = dot.position;
						let y = position.getY();
						position.setY(y + DOT_SIDE, {
							duration: DURATION,
							curve: CURVE
						});
					}
				}
				orderRows.splice(lineX, 1);
				orderRows.unshift(line);

			} else {

				for (let row = 0; row < 10; row++) {
					let dot = this.dots[order[lineX] * 10 + row];
					let position = dot.position;
					let y = position.getY();
					position.setY(y + DOT_SIDE * (9 - lineX), {
						duration: DURATION,
						curve: CURVE
					});
					dot.deselect();
				}
				for (let column = 9; column > lineX; column--) {
					for (let row = 0; row < 10; row++) {
						let dot = this.dots[order[column] * 10 + row];
						let position = dot.position;
						let y = position.getY();
						position.setY(y - DOT_SIDE, {
							duration: DURATION,
							curve: CURVE
						});
					}
				}
				orderRows.splice(lineX, 1);
				orderRows.push(line);
			}

		} else {


			let order = orderColumns;
			let lineX = order.indexOf(line);

			if (line < 5) {

				for (let column = 0; column < 10; column++) {
					let dot = this.dots[column * 10 + order[lineX]];
					let position = dot.position;
					let x = position.getX();
					position.setX(x - DOT_SIDE * lineX, {
						duration: DURATION,
						curve: CURVE
					});
					dot.deselect();
				}
				for (let row = lineX - 1; row >= 0; row--) {
					for (let column = 0; column < 10; column++) {
						let dot = this.dots[column * 10 + order[row]];
						let position = dot.position;
						let x = position.getX();
						position.setX(x + DOT_SIDE, {
							duration: DURATION,
							curve: CURVE
						});
					}
				}
				orderColumns.splice(lineX, 1);
				orderColumns.unshift(line);

			} else {

				for (let column = 0; column < 10; column++) {
					let dot = this.dots[column * 10 + order[lineX]];
					let position = dot.position;
					let x = position.getX();
					position.setX(x + DOT_SIDE * (9 - lineX), {
						duration: DURATION,
						curve: CURVE
					});
					dot.deselect();
				}
				for (let row = 9; row > lineX; row--) {
					for (let column = 0; column < 10; column++) {
						let dot = this.dots[column * 10 + order[row]];
						let position = dot.position;
						let x = position.getX();
						position.setX(x - DOT_SIDE, {
							duration: DURATION,
							curve: CURVE
						});
					}
				}
				orderColumns.splice(lineX, 1);
				orderColumns.push(line);
			}

		}
	}

	var hoverId;
	this.fillDot = function (id) {
		if (id !== undefined) {
			if (id !== hoverId) {
				this.dots[id].toggleFill();
				//this.defineFilledLine(id);
				this.checkLine();
				hoverId = id;
			}
		}
	};

	// Centering
	this
		.setMountPoint(0.5, 0.5, 0)
		.setAlign(0.5, 0.5, 0)
		.setOrigin(0.5, 0.5, 0)
		.setPosition(0, 0, 0);
	this.layout = new Layout(this);

	// addUIEvent is being used in order to instruct the node's DOMElement
	// to add the appropriate event listener through the DOMRenderer.
	// DOM events are being emitted as UI Events and routed accordingly.
	this.addUIEvent('mousedown');
	this.addUIEvent('touchstart');
	// this.addUIEvent('mousemove');
	// this.addUIEvent('touchmove');
	this.addUIEvent('mouseup');
	this.addUIEvent('touchend');
}

Background.prototype = Object.create(Node.prototype);
Background.prototype.constructor = Node;

Background.prototype.onReceive = function onReceive(type, ev) {
	if (type === 'mousedown') {
		// dispatch globally
		this.emit('x', ev.x).emit('y', ev.y);
		this.mousing = true;
	}
	if (type === 'touchstart') {
		// dispatch globally
		this.emit('x', ev.x).emit('y', ev.y);
		this.mousing = true;
	}
	// if (type === 'mousemove') {
	//   // dispatch globally
	//   this.emit('x', ev.x).emit('y', ev.y);
	// }
	// if (type === 'touchmove') {
	//   // dispatch globally
	//   this.emit('x', ev.x).emit('y', ev.y);
	// }
	if (type === 'mouseup') {
		// dispatch globally
		this.emit('x', ev.x).emit('y', ev.y);
		this.mousing = false;
	}
	if (type === 'touchend') {
		// dispatch globally
		this.emit('x', ev.x).emit('y', ev.y);
		this.mousing = false;
	}
};

// The Layout component is a state machine. Each layout can is a state.
// The state is defined by
// 1. spacing: The dot spacing.
// 2. randomizePositionZ: Whether the x position should be randomized.
// 3. curve: The easing curve used to enter the state.
// 4. duration: The duration of the animation used for transitioning to the
//      state.
function Layout(node) {
	this.node = node;
	this.id = this.node.addComponent(this);
	this.current = 0;
	// Dot layout -> Square layout -> Square layout with random Z
	// -> Expanded square -> Square layout
	this.curve = [Curves.outQuint, Curves.outElastic, Curves.inElastic, Curves.inOutEase, Curves.inBounce];
	this.duration = [0.5 * DURATION, 3 * DURATION, 3 * DURATION, DURATION, 0.5 * DURATION];

	// Transitions to initial state.
	this.next();
}

// Transitions to the next state.
// Called by node.
Layout.prototype.next = function next() {
	if (this.current++ === ROWS) {
		this.current = 0;
	}
	let duration = this.duration[this.current];
	let curve = this.curve[this.current];
	let row = 0;
	let col = 0;
	let dimension = DOT_SIDE;
	let bounds = [-(((dimension) * ROWS / 2) - (dimension / 2)), -(((dimension) * COLUMNS / 2) - (dimension / 2))];
	for (let i = 0; i < this.node.getChildren().length; i++) {
		let x = bounds[0] + ((dimension) * col++);
		let y = bounds[1] + ((dimension) * row);
		let z = 0;
		this.node.dots[i].position.set(x, y, z, {
			duration: i * ROWS + duration,
			curve: curve
		});
		if (col >= COLUMNS) {
			col = 0;
			row++;
		}
	}
};




// Dots are nodes.
// They have a DOMElement attached to them by default.
function Dot(id) {
	Node.call(this);

	// Center dot.
	this
		.setMountPoint(0.5, 0.5, 0)
		.setAlign(0.5, 0.5, 0)
		.setSizeMode('absolute', 'absolute', 'absolute')
		.setAbsoluteSize(DOT_SIZE, DOT_SIZE, DOT_SIZE);

	// Add the DOMElement (DOMElements are components).
	this._domElement = new DOMElement(this, {
		classes: ['no-user-select'],
		properties: {
			background: COLOR
		}
	});
	this.id = id;
	this.fill = false;

	this.select = function select() {
		if (!this.fill) {
			this.fill = true;
			this._domElement.setProperty('background-color', COLOR__ACTIVE);
		}
	};

	this.deselect = function deselect() {
		if (this.fill) {
			this.fill = false;
			this._domElement.setProperty('background-color', COLOR);
		}
	};

	this.toggleFill = function toggleFill() {
		this.fill = !this.fill;
		this._domElement.setProperty('background-color', this.fill ? COLOR__ACTIVE : COLOR);
	};
	// Add the Position component.
	// The position component allows us to transition between different states
	// instead of instantly setting the final translation.
	this.position = new Position(this);
	// addUIEvent is being used in order to instruct the node's DOMElement
	// to add the appropriate event listener through the DOMRenderer.
	// DOM events are being emitted as UI Events and routed accordingly.
	this.addUIEvent('mousedown');
	this.addUIEvent('touchstart');
	this.addUIEvent('mousemove');
	this.addUIEvent('touchmove');
	this.addUIEvent('click');
	this.addUIEvent('mouseup');
	this.addUIEvent('touchend');
}

Dot.prototype = Object.create(Node.prototype);
Dot.prototype.constructor = Dot;

Dot.prototype.onReceive = function onReceive(type, ev) {
	if (type === 'mousedown') {
		this._parent.mousingDown(this.id);
	}
	if (type === 'touchstart') {
		this._parent.mousingUp(this.id);
	}
	if (type === 'mousemove') {
		if (this._parent.mousing === true) {
			this._parent.fillDot(this.id);
			this.emit('id', this._domElement.id).emit('fill', this._domElement.fill);
		}
	}
	if (type === 'touchmove') {
		if (this._parent.mousing === true) {
			this._parent.fillDot(this.id);
			this.emit('id', this._domElement.id).emit('fill', this._domElement.fill);
		}
	}
	if (type === 'click') {
		this._parent.fillDot(this.id);
		this.emit('id', this._domElement.id).emit('fill', this._domElement.fill);
	}
	if (type === 'mouseup') {
		this._parent.mousingUp(this.id);
	}
	if (type === 'touchend') {
		this._parent.mousingDown(this.id);
	}
};

FamousEngine.init();
var scene = FamousEngine.createScene();
scene.addChild(new Background(ROWS, COLUMNS));
