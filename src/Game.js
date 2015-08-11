'use strict';

var famous = require('famous');
var Consts = require('./Consts.js');
var Figure = require('./Figure.js');
var Dot = require('./Dot.js');
var Player = require('./Player.js');
//var Menu = require('./Menu.js');
var getRandomInt = require('./getRandomInt.js');

/*jshint -W079 */
var Node = famous.core.Node;/*jshint +W079 */
var Curves = famous.transitions.Curves;
var DOMElement = famous.domRenderables.DOMElement;

function Game(rows, cols) {
	Node.call(this);
	this.domElement = new DOMElement(this, {});

	var count = 0;
	this.dots = [];
	for (let row = 0; row < rows; row++) {
		for (let col = 0; col < cols; col++) {
			let dot = new Dot(count++);
			this.addChild(dot);
			this.dots.push(dot);
		}
	}

	this.figures = [];

	this.generateFigureIndex = function generateFigureIndex() {
		let figures = this.figures || [];
		let rand = getRandomInt(0, Consts.FIGURES.length);
		if (figures.length < 1) {
			return rand;
		} else {
			let figuresIndexes = [];
			figures.forEach(function (element) {
				figuresIndexes.push(element.randomId);
			});
			let isFigureUnique = function(array, rand) {
				return array.every(function(element) { return element !== rand; });
			};
			while(!isFigureUnique(figuresIndexes, rand)) {
				rand = getRandomInt(0, Consts.FIGURES.length);
			}
			return rand;
		}
	};

	this.updateFigure = function updateFigure(index) {
		let figures = this.figures;
		let uniqueFigureId = this.generateFigureIndex();
		let figure = Consts.FIGURES[uniqueFigureId];
		for (let cellCounter = 0; cellCounter < 4; cellCounter++) {
			let cell = figures[index].cells[cellCounter];
			let position = cell.position;
			let x = position.getX();
			let y = position.getY();
			position.set(x - (cell.x - figure[cellCounter].x) * Consts.CELL_SIDE, y - (cell.y - figure[cellCounter].y) * Consts.CELL_SIDE, 0, {
				duration: Consts.DURATION,
				curve: Consts.CURVE
			});
			cell.x = figure[cellCounter].x;
			cell.y = figure[cellCounter].y;
		}
		figures[index].randomId = uniqueFigureId;
	};

	for (let figureCounter = 0; figureCounter < 2; figureCounter++) {
		let firstDot = this.dots[0];
		let position = firstDot.position;
		let x = position.getX();
		let y = position.getY();
		let randomId = this.generateFigureIndex(figureCounter);
		let figure = new Figure(figureCounter, randomId, x, y);
		this.addChild(figure);
		this.figures.push(figure);
	}

	let firstDot = this.dots[0];
	let position = firstDot.position;
	let x = position.getX();
	let y = position.getY();
	let player = new Player(x, y);
	this.addChild(player);
	this.player = player;

//	let menu = new Menu();
//	this.addChild(menu);
//	this.menu = menu;

	this.scoreInc = function scoreInc(value) {
		let player = this.player;
		player.scoreInc(value);
	};
	this.scoreReset = function scoreReset() {
		let player = this.player;
		player.scoreReset();
	};

	this.checkFigure = function checkFigure() {
		let hovers = this.hoverDots;

		if (hovers.length === 4) {
			let figures = this.figures;
			let dots = this.dots;
			let rows = this.orderRows;
			let columns = this.orderColumns;

			let _rows = hovers.map(function (element) {
				return Number.parseInt(element / Consts.DIMENSION);
			});
			let _columns = hovers.map(function (element) {
				return element % Consts.DIMENSION;
			});

			let virtualRow = [];
			let virtualColumn = [];
			for (let i = 0; i < 4; i++) {
				virtualRow.push(columns.findIndex(function (element) {
					return element === _columns[i];
				}));
				virtualColumn.push(rows.findIndex(function (element) {
					return element === _rows[i];
				}));
			}
			let zeroPoint = virtualRow.min() * Consts.DIMENSION + virtualColumn.min();

			let data = [];
			for (let i = 0; i < 4; i++) {
				data[i] = {
					x: Math.abs(virtualRow[i] - Number.parseInt(zeroPoint / Consts.DIMENSION)),
					y: Math.abs((virtualColumn[i] % Consts.DIMENSION) - (zeroPoint % Consts.DIMENSION))
				};
			}
			data.sort(function (a, b) {
				var n = a.x - b.x;
				if (n !== 0) {
					return n;
				}
				return a.y - b.y;
			});

			for (var figure = 0; figure < Consts.FIGURESCOUNT; figure++) {
				let f = figures[figure].cells;
				if (f.every(function(element, index) { return element.x === data[index].x && element.y === data[index].y; })) {
					for (let hover = 0; hover < 4; hover++) {
						dots[hovers[hover]].place();
					}
					this.hoverDots = [];
					this.scoreInc(Consts.SCORE__FIGURE);
					this.updateFigure(figure);
					this.checkLines();
					this.isGameEnded();
					figure = Consts.FIGURESCOUNT;
				}
			}
		}
	};

	this.mousing = 0;

	/**
	 * Allow hovering dots by mousemoving
	 * @param {number} id - Id of dot
	 */
	this.mousingDown = function (id) {
		this.mousing = this.dots[id].state ? -1 : +1;
	};
	this.mousingUp = function (id) {
		this.mousing = 0;
	};

	this.hoverDots = [];

	/**
	 * Check dot for hoverability
	 * @param {number} id - Id of dot
	 */
	this.hoverDot = function (id) {
		if (id !== undefined && this.dots[id].state === Consts.DOT_STATE__UNTOUCHED) {
			if (this.hoverDots.indexOf(id) < 0) {
				if (this.hoverDots.length < 4) {
					this.hoverDots.push(id);
				} else {
					this.dots[this.hoverDots[0]].unhover();
					this.hoverDots.shift();
					this.hoverDots.push(id);
				}
				this.dots[id].hover();
				if (this.hoverDots.length === 4) {
					this.checkFigure();
				}
			}
		}
	};

	this.orderRows = [].initialize(Consts.ROWS);
	this.orderColumns = [].initialize(Consts.COLUMNS);

	/**
	 * Check lines if dots are filled
	 */
	/*jshint -W074 */
	this.checkLines = function checkLines() {
		var dots = this.dots;
		var filledRows = [];
		var filledColumns = [];
		for (let line = 0; line < Consts.DIMENSION; line++) {
			let row = dots.filter((element) => Number.parseInt(element.id / Consts.ROWS) === line && element.state === Consts.DOT_STATE__PLACED);
			let column = dots.filter((element) => element.id % Consts.COLUMNS === line && element.state === Consts.DOT_STATE__PLACED);
			if (row.length === Consts.ROWS) {
				console.log('Filled row: ', line);
				filledRows.push(line);
			}
			if (column.length === Consts.COLUMNS) {
				filledColumns.push(line);
				console.log('Filled column: ', line);
			}
		}
		filledRows.sort(function (x, y) {
			if (x < (Consts.ROWS / 2)) {
				return y - x;
			} else {
				return x - y;
			}
		});
		filledColumns.sort(function (x, y) {
			if (x < (Consts.COLUMNS / 2)) {
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
	};/*jshint +W074 */

	/**
	 * Move stateed line
	 * @param {number} id - Id of stateed line
	 */
	/*jshint -W071, -W074 */
	this.moveLine = function moveLine(line, direction) {
		console.log('moveLine', line, direction);
		this.scoreInc(Consts.SCORE__LINE);

		let orderRows = this.orderRows;
		let orderColumns = this.orderColumns;
		let order = [];
		let lineHash = 0;

		switch (direction) {
		case 'x':
				order = orderColumns;
				lineHash = order.indexOf(line);
				if (line < (Consts.COLUMNS / 2)) {
					for (let row = 0; row < Consts.ROWS; row++) {
						let dot = this.dots[row * Consts.ROWS + order[lineHash]];
						let position = dot.position;
						let x = position.getX();
						position.setX(x - Consts.DOT_SIDE * lineHash, {
							duration: Consts.DURATION,
							curve: Consts.CURVE
						});
						dot.unplace();
					}
					for (let column = lineHash - 1; column >= 0; column--) {
						for (let row = 0; row < Consts.ROWS; row++) {
							let dot = this.dots[row * Consts.ROWS + order[column]];
							let position = dot.position;
							let x = position.getX();
							position.setX(x + Consts.DOT_SIDE, {
								duration: Consts.DURATION,
								curve: Consts.CURVE
							});
						}
					}
					orderColumns.splice(lineHash, 1);
					orderColumns.unshift(line);
				} else {
					for (let row = 0; row < Consts.ROWS; row++) {
						let dot = this.dots[row * Consts.ROWS + order[lineHash]];
						let position = dot.position;
						let x = position.getX();
						position.setX(x + Consts.DOT_SIDE * (Consts.ROWS - 1 - lineHash), {
							duration: Consts.DURATION,
							curve: Consts.CURVE
						});
						dot.unplace();
					}
					for (let column = Consts.COLUMNS - 1; column > lineHash; column--) {
						for (let row = 0; row < Consts.ROWS; row++) {
							let dot = this.dots[row * Consts.ROWS + order[column]];
							let position = dot.position;
							let x = position.getX();
							position.setX(x - Consts.DOT_SIDE, {
								duration: Consts.DURATION,
								curve: Consts.CURVE
							});
						}
					}
					orderColumns.splice(lineHash, 1);
					orderColumns.push(line);
				}
				break;
		case 'y':
				order = orderRows;
				lineHash = order.indexOf(line);
				if (line < (Consts.ROWS / 2)) {
					for (let column = 0; column < Consts.COLUMNS; column++) {
						let dot = this.dots[order[lineHash] * Consts.COLUMNS + column];
						let position = dot.position;
						let y = position.getY();
						position.setY(y - Consts.DOT_SIDE * lineHash, {
							duration: Consts.DURATION,
							curve: Consts.CURVE
						});
						dot.unplace();
					}
					for (let row = lineHash - 1; row >= 0; row--) {
						for (let column = 0; column < Consts.COLUMNS; column++) {
							let dot = this.dots[order[row] * Consts.COLUMNS + column];
							let position = dot.position;
							let y = position.getY();
							position.setY(y + Consts.DOT_SIDE, {
								duration: Consts.DURATION,
								curve: Consts.CURVE
							});
						}
					}
					orderRows.splice(lineHash, 1);
					orderRows.unshift(line);
				} else {
					for (let column = 0; column < Consts.COLUMNS; column++) {
						let dot = this.dots[order[lineHash] * Consts.COLUMNS + column];
						let position = dot.position;
						let y = position.getY();
						position.setY(y + Consts.DOT_SIDE * (Consts.COLUMNS - 1 - lineHash), {
							duration: Consts.DURATION,
							curve: Consts.CURVE
						});
						dot.unplace();
					}
					for (let row = Consts.ROWS - 1; row > lineHash; row--) {
						for (let column = 0; column < Consts.COLUMNS; column++) {
							let dot = this.dots[order[row] * Consts.COLUMNS + column];
							let position = dot.position;
							let y = position.getY();
							position.setY(y - Consts.DOT_SIDE, {
								duration: Consts.DURATION,
								curve: Consts.CURVE
							});
						}
					}
					orderRows.splice(lineHash, 1);
					orderRows.push(line);
				}
				break;
		default:
				return false;
		}
	};/*jshint +W071, +W074 */

	/**
	 * Check if player can't place new figure (Game over state)
	 */
	this.isGameEnded = function isGameEnded() {
		let figures = this.figures;
		let dots = this.dots;
		let figuresCollection = [];
		for (let figureCounter = 0, fL = figures.length; figureCounter < fL; figureCounter++) {
			let figureOrigin = figures[figureCounter];
			let figureContainer = [];
			for (let cell = 0; cell < 4; cell++) {
				figureContainer.push({ x: figureOrigin.cells[cell].x, y: figureOrigin.cells[cell].y });
			}
			figuresCollection.push(figureContainer);
		}
		for (let figureCounter = 0, fL = figuresCollection.length; figureCounter < fL; figureCounter++) {
			var curent = figuresCollection[figureCounter];
			for (let dotCounter = 0, dL = dots.length; dotCounter < dL; dotCounter++ ) {
				var counter = 0;
				var tx = Number.parseInt(dotCounter / Consts.ROWS);
				var ty = parseInt(dotCounter % Consts.COLUMNS);
				for (let figureCell = 0, cL = curent.length; figureCell < cL; figureCell++) {
					let cx = curent[figureCell].y;
					let cy = curent[figureCell].x;
					if (cx + tx < Consts.COLUMNS && cy + ty < Consts.ROWS) {
						if (dots[(cx + tx) * Consts.DIMENSION + cy + ty].state !== Consts.DOT_STATE__PLACED) {
							counter++;
						}
					}
				}
				if (counter === 4) {
					return false;
				}
			}
		}
		return true;
	};

	var hoverId;

	/**
	 * Fill dot
	 * @param {number} id - Id of dot
	 */
	this.stateDot = function (id) {
		if (id !== undefined && id !== hoverId) {
			this.hoverDot(id);
			hoverId = id;
		}
	};

	// Centering
	this
		.setMountPoint(0.5, 0.5, 0)
		.setAlign(0.5, 0.5, 0)
		.setOrigin(0.5, 0.5, 0)
		.setPosition(0, 0, 0);
	this.layout = new Layout(this);

	this.addUIEvent('mousedown');
	this.addUIEvent('mouseleave');
	this.addUIEvent('mouseup');
}

Game.prototype = Object.create(Node.prototype);
Game.prototype.constructor = Node;

Game.prototype.onReceive = function onReceive(type, ev) {
	switch (type) {
	case 'mousedown':
			this.emit('x', ev.x).emit('y', ev.y);
			this.mousing = true;
			break;
	case 'mouseleave':
			this.emit('x', ev.x).emit('y', ev.y);
			this.mousing = false;
			break;
	case 'mouseup':
			this.emit('x', ev.x).emit('y', ev.y);
			this.mousing = false;
			break;
	default:
			return false;
	}
};

function Layout(node) {
	this.node = node;
	this.id = this.node.addComponent(this);
	this.current = 0;
	this.curve = [Curves.outQuint, Curves.outElastic, Curves.inElastic, Curves.inOutEase, Curves.inBounce];
	this.duration = [0.5 * Consts.DURATION, 3 * Consts.DURATION, 3 * Consts.DURATION, Consts.DURATION, 0.5 * Consts.DURATION];

	this.next();
}

Layout.prototype.next = function next() {
	if (this.current++ === Consts.ROWS) {
		this.current = 0;
	}
	let duration = this.duration[this.current];
	let curve = this.curve[this.current];
	let row = 0;
	let col = 0;
	let dimension = Consts.DOT_SIDE;
	let bounds = [-(((dimension) * Consts.ROWS / 2) - (dimension / 2)), -(((dimension) * Consts.COLUMNS / 2) - (dimension / 2))];
	for (let i = 0; i < this.node.dots.length; i++) {
		let x = bounds[0] + ((dimension) * col++);
		let y = bounds[1] + ((dimension) * row);
		let z = 0;
		this.node.dots[i].position.set(x, y, z, {
			duration: i * Consts.ROWS + duration,
			curve: curve
		});
		if (col >= Consts.COLUMNS) {
			col = 0;
			row++;
		}
	}
};

module.exports = Game;
