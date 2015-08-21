'use strict';

var famous = require('famous');
var Consts = require('./Consts.js');
var Figure = require('./Figure.js');
var Dot = require('./Dot.js');
var Nav = require('./Nav.js').Nav;
//var Menu = require('./Menu.js');
var getRandomInt = require('./getRandomInt.js');

/*jshint -W079 */
var Node = famous.core.Node;/*jshint +W079 */
var Curves = famous.transitions.Curves;
var DOMElement = famous.domRenderables.DOMElement;

//var audioLineMove = new Audio('http://donsindrom.github.io/Tactris/audio/lineMove.wav');
//var audioFigureSet = new Audio('http://donsindrom.github.io/Tactris/audio/figureSet.wav');

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
	let _localStorageDots = [];
	let localStorageDots = JSON.parse(localStorage.getItem(Consts.DIMENSION + '__dots')) || [];
	for (let row = 0; row < rows; row++) {
		for (let col = 0; col < cols; col++) {
			let dot = new Dot(count++);
			this.addChild(dot);
			this.dots.push(dot);
			if (localStorageDots.length === 0) {
				_localStorageDots.push(Consts.DOT_STATE__UNTOUCHED);
			}
		}
	}
	if (localStorageDots.length === 0) {
		localStorage.setItem(Consts.DIMENSION + '__dots', JSON.stringify(_localStorageDots));
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
			position.set(figure[cellCounter].x * Consts.CELL_SIDE, figure[cellCounter].y * Consts.CELL_SIDE, 0, {
				duration: Consts.DURATION,
				curve: Consts.CURVE
			});
			cell.x = figure[cellCounter].x;
			cell.y = figure[cellCounter].y;
			cell.domElement.setAttribute('aria-colindex', figure[cellCounter].x);
			cell.domElement.setAttribute('aria-rowindex', figure[cellCounter].y);
		}
		figures[index].randomId = uniqueFigureId;
		let _localStorageFigures = JSON.parse(localStorage.getItem(Consts.DIMENSION + '__figures')) || [];
		_localStorageFigures[index] = uniqueFigureId;
		if (_localStorageFigures.length !== 0) {
			localStorage.setItem(Consts.DIMENSION + '__figures', JSON.stringify(_localStorageFigures));
		}
	};

	let _localStorageFigures = [];
	let localStorageFigures = JSON.parse(localStorage.getItem(Consts.DIMENSION + '__figures')) || [];
	for (let figureCounter = 0; figureCounter < 2; figureCounter++) {
		if (localStorageFigures.length === 0) {
			let randomId = this.figureIndexGenerate();
			let figure = new Figure(figureCounter, randomId);
			this.addChild(figure);
			this.figures.push(figure);
			_localStorageFigures.push(randomId);
		} else {
			let figure = new Figure(figureCounter, localStorageFigures[figureCounter]);
			this.addChild(figure);
			this.figures.push(figure);
		}
	}
	if (localStorageFigures.length === 0) {
		localStorage.setItem(Consts.DIMENSION + '__figures', JSON.stringify(_localStorageFigures));
	}

	let nav = new Nav();
	this.addChild(nav);
	this.nav = nav;

//	let menu = new Menu();
//	this.addChild(menu);
//	this.menu = menu;

	this.scoreInc = function scoreInc(value) {
		this.nav.scoreInc(value * scoreMultiplier);
	};
	this.scoreReset = function scoreReset() {
		this.nav.scoreReset();
	};
	this.scoreSurcharge = function scoreSurcharge() {
		this.nav.scoreSurcharge();
	};

	this.figureSet = function figureSet(figure) {
		//audioFigureSet.play();

		let dots = this.dots;
		let hovers = this.dotHovers;

		for (let hover = 0; hover < 4; hover++) {
			dots[hovers[hover]].place();
		}
		this.dotHovers = [];
		this.scoreInc(Consts.SCORE__FIGURE);
		this.linesCheck();
		this.figureUpdate(figure);
		setTimeout(this.isGameEnded(), 10);
	};

	this.figureCheck = function figureCheck() {
		let hovers = this.dotHovers;

		if (hovers.length === 4) {
			let figures = this.figures;
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
					this.figureSet(figure);
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

	let localStorageDotHovers = JSON.parse(localStorage.getItem(Consts.DIMENSION + '__dotHovers')) || [];
	if (localStorageDotHovers.length === 0) {
		this.dotHovers = [];
		localStorage.setItem(Consts.DIMENSION + '__dotHovers', JSON.stringify(this.dotHovers));
	} else {
		this.dotHovers = localStorageDotHovers;
	}

	this.dotSelect = function dotSelect(id) {
		if (this.dots[id].state !== Consts.DOT_STATE__PLACED) {
			this.dots[id].select();
			this.linesCheck();
		}
	}

	/**
	 * Check dot for hoverability
	 * @param {number} id - Id of dot
	 */
	this.dotHover = function (id) {
		switch (this.dots[id].state) {
		case Consts.DOT_STATE__UNTOUCHED:
				if (this.dotHovers.indexOf(id) < 0) {
					if (this.dotHovers.length < 4) {
						this.dotHovers.push(id);
					} else {
						this.dots[this.dotHovers[0]].unhover();
						this.dotHovers.shift();
						this.dotHovers.push(id);
					}
					this.dots[id].hover();
					if (this.dotHovers.length === 4) {
						this.figureCheck();
					}
					localStorage.setItem(Consts.DIMENSION + '__dotHovers', JSON.stringify(this.dotHovers));
				}
				break;
		case Consts.DOT_STATE__HOVERED:
				this.dotHovers.splice(this.dotHovers.indexOf(id), 1);
				this.dots[id].unhover();
				localStorage.setItem(Consts.DIMENSION + '__dotHovers', JSON.stringify(this.dotHovers));
				break;
		default:
				return false;
		}
	};

	let localStorageOrderRows = JSON.parse(localStorage.getItem(Consts.DIMENSION + '__orderRows')) || [];
	if (localStorageOrderRows.length === 0) {
		this.orderRows = [].initialize(Consts.ROWS);
		localStorage.setItem(Consts.DIMENSION + '__orderRows', JSON.stringify(this.orderRows));
	} else {
		this.orderRows = localStorageOrderRows;
	}

	let localStorageOrderColumns = JSON.parse(localStorage.getItem(Consts.DIMENSION + '__orderColumns')) || [];
	if (localStorageOrderColumns.length === 0) {
		this.orderColumns = [].initialize(Consts.COLUMNS);
		localStorage.setItem(Consts.DIMENSION + '__orderColumns', JSON.stringify(this.orderColumns));
	} else {
		this.orderColumns = localStorageOrderColumns;
	}

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
				filledRows.push(line);
			}
			if (column.length === Consts.COLUMNS) {
				filledColumns.push(line);
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
		//audioLineMove.play();

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
						dot.unplace(scoreMultiplier);
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
					localStorage.setItem(Consts.DIMENSION + '__orderColumns', JSON.stringify(orderColumns));
				} else {
					for (let row = 0; row < Consts.ROWS; row++) {
						let dot = this.dots[row * Consts.ROWS + order[lineHash]];
						let position = dot.position;
						position.setX(etalon[Consts.COLUMNS - 1], {
							duration: Consts.DOT_DURATION__POSITION,
							curve: Consts.DOT_CURVE__POSITION
						});
						dot.domElement.setAttribute('aria-colindex', Consts.ROWS - 1);
						dot.unplace(scoreMultiplier);
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
					localStorage.setItem(Consts.DIMENSION + '__orderColumns', JSON.stringify(orderColumns));
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
						dot.unplace(scoreMultiplier);
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
					localStorage.setItem(Consts.DIMENSION + '__orderRows', JSON.stringify(orderRows));
				} else {
					for (let column = 0; column < Consts.COLUMNS; column++) {
						let dot = this.dots[order[lineHash] * Consts.COLUMNS + column];
						let position = dot.position;
						position.setY(etalon[Consts.ROWS - 1], {
							duration: Consts.DOT_DURATION__POSITION,
							curve: Consts.DOT_CURVE__POSITION
						});
						dot.domElement.setAttribute('aria-rowindex', Consts.COLUMNS - 1);
						dot.unplace(scoreMultiplier);
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
					localStorage.setItem(Consts.DIMENSION + '__orderRows', JSON.stringify(orderRows));
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
						dot.unplace(scoreMultiplier);
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
						dot.unplace(scoreMultiplier);
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
						dot.unplace(scoreMultiplier);
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
						dot.unplace(scoreMultiplier);
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
		let orderRows = this.orderRows;
		let orderColumns = this.orderColumns;
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
		for (let y = 0, yL = Consts.ROWS; y < yL; y++) {
			for (let x = 0, xL = Consts.COLUMNS; x < xL; x++) {
				let canPlaceFigure = figuresCollection.some(function(element, index) {
					let figure = element;
					let column = orderColumns[x];
					let row = orderRows[y];
					let xs = figure.map(function (element) { return element.x; });
					let ys = figure.map(function (element) { return element.y; });
					let dx = xs.max() - xs.min() + 1;
					let dy = ys.max() - ys.min() + 1;
					if (row + dy > Consts.ROWS || column + dx > Consts.COLUMNS) {
						return false;
					} else {
						return figure.every(function(element, index) {
							let id = (orderRows[row + element.y]) * Consts.ROWS + (orderColumns[column + element.x]);
							if (dots[id].state !== Consts.DOT_STATE__PLACED) {
								return true;
							} else {
								return false;
							}
						});
					}
				});
				if (canPlaceFigure === true) {
					return true;
				}
			}
		}
		alert('Game over');
		return false;
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

	this.gameStart = function gameStart() {
		var dots = this.dots;

		let etalonRows = this.etalonRows;
		let etalonColumns = this.etalonColumns;

		this.dotHovers.forEach((element) => dots[element].unhover());
		this.dotHovers = [];
		localStorage.setItem(Consts.DIMENSION + '__dotHovers', JSON.stringify(this.dotHovers));
		hoverId = undefined;

		let _localStorageDots = [];
		for (let column = 0; column < Consts.COLUMNS; column++) {
			for (let row = 0; row < Consts.ROWS; row++) {
				let dot = dots[row * Consts.ROWS + column];
				let position = dot.position;
				position.set(etalonColumns[column], etalonRows[row], 0, {
					duration: Consts.DOT_DURATION__POSITION * 4,
					curve: Consts.DOT_CURVE__POSITION
				});
				dot.unplace((row + column) / 2);
				dot.domElement.setAttribute('aria-colindex', column);
				dot.domElement.setAttribute('aria-rowindex', row);
				_localStorageDots.push(Consts.DOT_STATE__UNTOUCHED);
			}
		}
		localStorage.setItem(Consts.DIMENSION + '__dots', JSON.stringify(_localStorageDots));

		this.orderRows = [].initialize(Consts.ROWS);
		this.orderColumns = [].initialize(Consts.COLUMNS);
		localStorage.setItem(Consts.DIMENSION + '__orderRows', JSON.stringify(this.orderRows));
		localStorage.setItem(Consts.DIMENSION + '__orderColumns', JSON.stringify(this.orderColumns));

		this.scoreReset();

		for (let figureCounter = 0; figureCounter < 2; figureCounter++) {
			this.figureUpdate(figureCounter);
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
	this.duration = [2 * Consts.DURATION, 3 * Consts.DURATION, 3 * Consts.DURATION, Consts.DURATION, 2 * Consts.DURATION];

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

	let nav = this.node.nav;
	let navPosition = nav.position;
	if (width > height) {
		navPosition.set(Consts.ROWS * Consts.DOT_SIDE / 2, -Consts.ROWS * Consts.DOT_SIDE / 2);
	} else {
		navPosition.set(-Consts.ROWS * Consts.DOT_SIDE / 2, Consts.ROWS * Consts.DOT_SIDE / 2);
	}

	this.next();
}

Layout.prototype.next = function next() {
	let orderColumns = this.node.orderColumns;
	let orderRows = this.node.orderRows;

	if (this.current++ === Consts.ROWS) {
		this.current = 0;
	}
	let duration = this.duration[this.current];
	let curve = this.curve[this.current];
	let row = 0;
	let column = 0;
	let bounds = [Consts.DOT_SIDE * (1 - Consts.ROWS) / 2, Consts.DOT_SIDE * (1 - Consts.COLUMNS) / 2];

	for (let i = 0; i < this.node.dots.length; i++) {
		let x = bounds[0] + (Consts.DOT_SIDE * column++);
		let y = bounds[1] + (Consts.DOT_SIDE * row);
		if (i < Consts.COLUMNS) {
			this.node.etalonColumns.push(x);
		}
		if (i % Consts.ROWS === 0) {
			this.node.etalonRows.push(y);
		}
		let id = orderRows[row ] * Consts.COLUMNS + orderColumns[column - 1];
		this.node.dots[id].position.set(x, y, 0, {
			duration: i * Consts.ROWS + duration,
			curve: curve
		});
		if (column >= Consts.COLUMNS) {
			column = 0;
			row++;
		}
	}
};

module.exports = Game;
