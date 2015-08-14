'use strict';

var famous = require('famous');
var Consts = require('./Consts.js');
var Figure = require('./Figure.js');
var Dot = require('./Dot.js');
var Score = require('./Score.js');
//var Menu = require('./Menu.js');
var getRandomInt = require('./getRandomInt.js');

/*jshint -W079 */
var Node = famous.core.Node;/*jshint +W079 */
var Curves = famous.transitions.Curves;
var DOMElement = famous.domRenderables.DOMElement;

function Game(rows, cols) {
	Node.call(this);
	this.domElement = new DOMElement(this, {
		tagName: 'main',
		classes: ['Game']
	});

	this.domElement.setAttribute('role', 'grid');
	this.domElement.setAttribute('aria-multiselectable', true);
	this.domElement.setAttribute('aria-colcount', Consts.COLUMNS);
	this.domElement.setAttribute('aria-rowcount', Consts.ROWS);

	var scoreMultiplier = 1;
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

	this.figureIndexGenerate = function figureIndexGenerate() {
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

	this.figureUpdate = function figureUpdate(index) {
		let figures = this.figures;
		let uniqueFigureId = this.figureIndexGenerate();
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
			cell.domElement.setAttribute('aria-colindex', figure[cellCounter].x);
			cell.domElement.setAttribute('aria-rowindex', figure[cellCounter].y);
		}
		figures[index].randomId = uniqueFigureId;
	};

	for (let figureCounter = 0; figureCounter < 2; figureCounter++) {
		let randomId = this.figureIndexGenerate();
		let figure = new Figure(figureCounter, randomId);
		this.addChild(figure);
		this.figures.push(figure);
	}

	let score = new Score();
	this.addChild(score);
	this.score = score;

//	let menu = new Menu();
//	this.addChild(menu);
//	this.menu = menu;

	this.scoreInc = function scoreInc(value) {
		this.score.scoreInc(value * scoreMultiplier);
	};
	this.scoreReset = function scoreReset() {
		this.score.scoreReset();
	};
	this.scoreSurcharge = function scoreSurcharge() {
		this.score.scoreSurcharge();
	};

	this.figureCheck = function figureCheck() {
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
					this.figureUpdate(figure);
					this.linesCheck();
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
	this.dotHover = function (id) {
		switch (this.dots[id].state) {
		case Consts.DOT_STATE__UNTOUCHED:
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
						this.figureCheck();
					}
				}
				break;
		case Consts.DOT_STATE__HOVERED:
				this.hoverDots.splice(this.hoverDots.indexOf(id), 1);
				this.dots[id].unhover();
				break;
		default:
				return false;
		}
	};

	this.orderRows = [].initialize(Consts.ROWS);
	this.orderColumns = [].initialize(Consts.COLUMNS);
	this.etalonRows = [];
	this.etalonColumns = [];

	/**
	 * Check lines if dots are filled
	 */
	/*jshint -W074 */
	this.linesCheck = function linesCheck() {
		var dots = this.dots;
		var filledRows = [];
		var filledColumns = [];
		let orderRows = this.orderRows;
		let orderColumns = this.orderColumns;
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

		if (filledRows.length === 1 && (filledRows[0] === orderRows[0] || filledRows[0] === orderRows[Consts.ROWS - 1])) {
			this.lineRotate(filledRows[0], 'y');
			scoreMultiplier++;
		} else {
			for (let row = 0; row < filledRows.length; row++) {
				this.lineMove(filledRows[row], 'y');
				scoreMultiplier++;
			}
		}
		if (filledColumns.length === 1 && (filledColumns[0] === orderColumns[0] || filledColumns[0] === orderColumns[Consts.COLUMNS - 1])) {
			this.lineRotate(filledColumns[0], 'x');
			scoreMultiplier++;
		} else {
			for (let column = 0; column < filledColumns.length; column++) {
				this.lineMove(filledColumns[column], 'x');
				scoreMultiplier++;
			}
		}

		scoreMultiplier = 1;
	};/*jshint +W074 */

	/**
	 * Move stateed line
	 * @param {number} id - Id of stateed line
	 */
	/*jshint -W071, -W074 */
	this.lineMove = function lineMove(line, direction) {
		console.log('lineMove', line, direction);
		this.scoreInc(Consts.SCORE__LINE);

		let orderRows = this.orderRows;
		let orderColumns = this.orderColumns;
		let etalonRows = this.etalonRows;
		let etalonColumns = this.etalonColumns;
		let order = [];
		let etalon = [];
		let lineHash = 0;

		switch (direction) {
		case 'x':
				order = orderColumns;
				etalon = etalonColumns;
				lineHash = order.indexOf(line);
				if (line < (Consts.COLUMNS / 2)) {
					for (let row = 0; row < Consts.ROWS; row++) {
						let dot = this.dots[row * Consts.ROWS + order[lineHash]];
						let position = dot.position;
						position.setX(etalon[0], {
							duration: Consts.DOT_DURATION__POSITION,
							curve: Consts.DOT_CURVE__POSITION
						});
						dot.domElement.setAttribute('aria-colindex', 0);
						dot.unplace(true);
					}
					for (let column = lineHash - 1; column >= 0; column--) {
						for (let row = 0; row < Consts.ROWS; row++) {
							let dot = this.dots[row * Consts.ROWS + order[column]];
							let position = dot.position;
							position.setX(etalon[column + 1], {
								duration: Consts.DOT_DURATION__POSITION,
								curve: Consts.DOT_CURVE__POSITION
							});
							dot.domElement.setAttribute('aria-colindex', column + 1);
						}
					}
					orderColumns.splice(lineHash, 1);
					orderColumns.unshift(line);
				} else {
					for (let row = 0; row < Consts.ROWS; row++) {
						let dot = this.dots[row * Consts.ROWS + order[lineHash]];
						let position = dot.position;
						position.setX(etalon[Consts.COLUMNS - 1], {
							duration: Consts.DOT_DURATION__POSITION,
							curve: Consts.DOT_CURVE__POSITION
						});
						dot.domElement.setAttribute('aria-colindex', Consts.ROWS - 1);
						dot.unplace(true);
					}
					for (let column = Consts.COLUMNS - 1; column > lineHash; column--) {
						for (let row = 0; row < Consts.ROWS; row++) {
							let dot = this.dots[row * Consts.ROWS + order[column]];
							let position = dot.position;
							position.setX(etalon[column - 1], {
								duration: Consts.DOT_DURATION__POSITION,
								curve: Consts.DOT_CURVE__POSITION
							});
							dot.domElement.setAttribute('aria-colindex', column - 1);
						}
					}
					orderColumns.splice(lineHash, 1);
					orderColumns.push(line);
				}
				break;
		case 'y':
				order = orderRows;
				etalon = etalonRows;
				lineHash = order.indexOf(line);
				if (line < (Consts.ROWS / 2)) {
					for (let column = 0; column < Consts.COLUMNS; column++) {
						let dot = this.dots[order[lineHash] * Consts.COLUMNS + column];
						let position = dot.position;
						position.setY(etalon[0], {
							duration: Consts.DOT_DURATION__POSITION,
							curve: Consts.DOT_CURVE__POSITION
						});
						dot.domElement.setAttribute('aria-rowindex', 0);
						dot.unplace(true);
					}
					for (let row = lineHash - 1; row >= 0; row--) {
						for (let column = 0; column < Consts.COLUMNS; column++) {
							let dot = this.dots[order[row] * Consts.COLUMNS + column];
							let position = dot.position;
							position.setY(etalon[row + 1], {
								duration: Consts.DOT_DURATION__POSITION,
								curve: Consts.DOT_CURVE__POSITION
							});
							dot.domElement.setAttribute('aria-rowindex', row + 1);
						}
					}
					orderRows.splice(lineHash, 1);
					orderRows.unshift(line);
				} else {
					for (let column = 0; column < Consts.COLUMNS; column++) {
						let dot = this.dots[order[lineHash] * Consts.COLUMNS + column];
						let position = dot.position;
						position.setY(etalon[Consts.ROWS - 1], {
							duration: Consts.DOT_DURATION__POSITION,
							curve: Consts.DOT_CURVE__POSITION
						});
						dot.domElement.setAttribute('aria-rowindex', Consts.COLUMNS - 1);
						dot.unplace(true);
					}
					for (let row = Consts.ROWS - 1; row > lineHash; row--) {
						for (let column = 0; column < Consts.COLUMNS; column++) {
							let dot = this.dots[order[row] * Consts.COLUMNS + column];
							let position = dot.position;
							position.setY(etalon[row - 1], {
								duration: Consts.DOT_DURATION__POSITION,
								curve: Consts.DOT_CURVE__POSITION
							});
							dot.domElement.setAttribute('aria-rowindex', row - 1);
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
	 * Rotate stateed line
	 * @param {number} id - Id of stateed line
	 */
	/*jshint -W071, -W074 */
	this.lineRotate = function lineRotate(line, direction) {
		console.log('lineRotate', line, direction);
		this.scoreInc(Consts.SCORE__LINE);

		let orderRows = this.orderRows;
		let orderColumns = this.orderColumns;
		let etalonRows = this.etalonRows;
		let etalonColumns = this.etalonColumns;
		let order = [];
		let etalon = [];
		let lineHash = 0;

		switch (direction) {
		case 'x':
				order = orderColumns;
				etalon = etalonColumns;
				lineHash = order.indexOf(line);
				if (line === 0) {
					for (let row = 0; row < Consts.ROWS; row++) {
						let dot = this.dots[row * Consts.ROWS + order[lineHash]];
						let rotation = dot.rotation;
						let x = rotation.getX();
						let y = rotation.getY();
						let inc = 2 * Math.PI;
						rotation.set(x + inc, y + inc, 0, {
							duration: Consts.DOT_DURATION__ROTATION,
							curve: Consts.DOT_CURVE__ROTATION
						});
						dot.unplace(true);
					}
				} else {
					for (let row = 0; row < Consts.ROWS; row++) {
						let dot = this.dots[row * Consts.ROWS + order[lineHash]];
						let rotation = dot.rotation;
						let x = rotation.getX();
						let y = rotation.getY();
						let inc = 2 * Math.PI;
						rotation.set(x + inc, y + inc, 0, {
							duration: Consts.DOT_DURATION__ROTATION,
							curve: Consts.DOT_CURVE__ROTATION
						});
						dot.unplace(true);
					}
				}
				break;
		case 'y':
				order = orderRows;
				etalon = etalonRows;
				lineHash = order.indexOf(line);
				if (line < (Consts.ROWS / 2)) {
					for (let column = 0; column < Consts.COLUMNS; column++) {
						let dot = this.dots[order[lineHash] * Consts.COLUMNS + column];
						let rotation = dot.rotation;
						let x = rotation.getX();
						let y = rotation.getY();
						let inc = 2 * Math.PI;
						rotation.set(x + inc, y + inc, 0, {
							duration: Consts.DOT_DURATION__ROTATION,
							curve: Consts.DOT_CURVE__ROTATION
						});
						dot.unplace(true);
					}
				} else {
					for (let column = 0; column < Consts.COLUMNS; column++) {
						let dot = this.dots[order[lineHash] * Consts.COLUMNS + column];
						let rotation = dot.rotation;
						let x = rotation.getX();
						let y = rotation.getY();
						let inc = 2 * Math.PI;
						rotation.set(x + inc, y + inc, 0, {
							duration: Consts.DOT_DURATION__ROTATION,
							curve: Consts.DOT_CURVE__ROTATION
						});
						dot.unplace(true);
					}
				}
				break;
		default:
				return false;
		}
	}

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
		alert('Game over');
		return true;
	};

	var hoverId;

	/**
	 * Fill dot
	 * @param {number} id - Id of dot
	 */
	this.dotState = function (id) {
		if (id !== undefined && id !== hoverId) {
			this.dotHover(id);
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

	console.log(this);
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

	let width = document.body.clientWidth;
	let height = document.body.clientHeight;
	for (let figureCounter = 0; figureCounter < 2; figureCounter++) {
		let figure = this.node.figures[figureCounter];
		let position = figure.position;
		if (width > height) {
			position.set(-Consts.ROWS * Consts.DOT_SIDE, (figureCounter -1) * Consts.ROWS * Consts.DOT_SIDE / 2);
		} else {
			position.set(-figureCounter * Consts.ROWS * Consts.DOT_SIDE / 2, -Consts.ROWS * Consts.DOT_SIDE);
		}
	}

	let score = this.node.score;
	let position = score.position;
	if (width > height) {
		position.set(Consts.ROWS * Consts.DOT_SIDE / 2, -Consts.ROWS * Consts.DOT_SIDE / 2);
	} else {
		position.set(-Consts.ROWS * Consts.DOT_SIDE / 2, Consts.ROWS * Consts.DOT_SIDE / 2);
	}

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
		if (i < Consts.COLUMNS) {
			this.node.etalonColumns.push(x);
		}
		if (i % Consts.ROWS === 0) {
			this.node.etalonRows.push(y);
		}
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
