'use strict';

import Consts from './Consts';
import {core, domRenderables} from 'famous';
import Figure from './Figure';
import Dot from './Dot';
import Nav from './Nav';
import Modal from './Modal';
import Layout from './Layout';
import getRandomInt from './getRandomInt';

const DOMElement = domRenderables.DOMElement;


//var audioLineMove = new Audio('http://donsindrom.github.io/Tactris/audio/lineMove.wav');
//var audioFigureSet = new Audio('http://donsindrom.github.io/Tactris/audio/figureSet.wav');

export default class Game extends core.Node {
	constructor (rows, cols) {
		super();

		this._setupDomElement();

		this.scoreMultiplier = 1;
		let count = 0;
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


		this.stat = {};
		let localStorageStat = JSON.parse(localStorage.getItem(Consts.DIMENSION + '__stat'));
		if (localStorageStat) {
			this.stat = localStorageStat;
		} else {
			this.stat = {
				rowsMoved: 0,
				columnsMoved: 0,
				figuresPlaced: 0
			};
			localStorage.setItem(Consts.DIMENSION + '__stat', JSON.stringify(this.stat));
		}


		this.nav = new Nav();
		this.addChild(this.nav);

		this.modal = new Modal();
		this.addChild(this.modal);


		this.mousing = 0;


		let localStorageDotHovers = JSON.parse(localStorage.getItem(Consts.DIMENSION + '__dotHovers')) || [];
		if (localStorageDotHovers.length === 0) {
			this.dotHovers = [];
			localStorage.setItem(Consts.DIMENSION + '__dotHovers', JSON.stringify(this.dotHovers));
		} else {
			this.dotHovers = localStorageDotHovers;
		}


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


		this.hoverId = undefined;


		this
			.setMountPoint(0.5, 0.5)
			.setAlign(0.5, 0.5)
			.setOrigin(0.5, 0.5)
			.setSizeMode('absolute', 'absolute')
			.setAbsoluteSize(Consts.COLUMNS * Consts.DOT_SIDE, Consts.ROWS * Consts.DOT_SIDE);

		this.layout = new Layout(this);

		console.log(this);

		this._addUIEvents();
	}

	_addUIEvents () {
		this.addUIEvent('mousedown');
		this.addUIEvent('mouseleave');
		this.addUIEvent('mouseup');
	}

	_setupDomElement () {
		this.domElement = new DOMElement(this, {
			tagName: 'main',
			classes: ['Game']
		});

		this.domElement.setAttribute('role', 'grid');
		this.domElement.setAttribute('aria-multiselectable', true);
		this.domElement.setAttribute('aria-colcount', Consts.COLUMNS);
		this.domElement.setAttribute('aria-rowcount', Consts.ROWS);
	}

	figureIndexGenerate () {
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
	}

	figureUpdate(index) {
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
	}

	statInc(statArg) {
		let stat = this.stat;
		let localStorageStat = JSON.parse(localStorage.getItem(Consts.DIMENSION + '__stat')) || stat;
		let keys = Object.keys(statArg);
		keys.forEach(function(key) {
			stat[key] += statArg[key];
			if (stat[key] !== localStorageStat[key]) {
				localStorageStat[key] = stat[key];
			}
		});
		localStorage.setItem(Consts.DIMENSION + '__stat', JSON.stringify(stat));
	}

	statSet (statArg) {
		let stat = this.stat;
		let localStorageStat = JSON.parse(localStorage.getItem(Consts.DIMENSION + '__stat')) || stat;
		let keys = Object.keys(statArg);
		keys.forEach(function(key) {
			stat[key] = statArg[key];
			if (stat[key] !== localStorageStat[key]) {
				localStorageStat[key] = stat[key];
			}
		});
		localStorage.setItem(Consts.DIMENSION + '__stat', JSON.stringify(stat));
	}

	scoreInc(value) {
		this.nav.scoreInc(value * this.scoreMultiplier);
	}

	scoreReset() {
		this.nav.scoreReset();
	}

	scoreSurcharge() {
		this.nav.scoreSurcharge();
	}

	figureSet(figure) {
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
		this.statInc({ figuresPlaced: 1 });
		setTimeout(this.isGameEnded(), 10);
	}

	/*jshint -W074 */
	figureCheck () {
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
	}
	/*jshint +W074 */

	/**
	 * Allow hovering dots by mousemoving
	 * @param {number} id - Id of dot
	 */
	mousingDown (id) {
		this.mousing = this.dots[id].state ? -1 : +1;
	}

	mousingUp (id) {
		this.mousing = 0;
	}

	dotSelect (id) {
		if (this.dots[id].state !== Consts.DOT_STATE__PLACED) {
			this.dots[id].select();
			this.linesCheck();
		}
	}

	/**
	 * Check dot for hoverability
	 * @param {number} id - Id of dot
	 */
	dotHover (id) {
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
	}

	/**
	 * Check lines if dots are filled
	 */
	/*jshint -W074 */
	linesCheck () {
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

		let toTop = filledRows.filter((element) => element >= Consts.ROWS / 2);
		let toRight = filledColumns.filter((element) => element < Consts.COLUMNS / 2);
		let toBottom = filledRows.filter((element) => element < Consts.ROWS / 2);
		let toLeft = filledColumns.filter((element) => element >= Consts.COLUMNS / 2);

		toTop.sort((a, b) => b - a);
		toRight.sort((a, b) => b - a);
		toBottom.sort((a, b) => a - b);
		toLeft.sort((a, b) => a - b);

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
			this.scoreMultiplier++;
		} else {
			for (let row = 0; row < toTop.length; row++) {
				this.lineMove(toTop[row], 'y', row + 1);
				this.scoreMultiplier++;
			}
			for (let row = 0; row < toBottom.length; row++) {
				this.lineMove(toBottom[row], 'y', row + 1);
				this.scoreMultiplier++;
			}
		}
		if (filledColumns.length === 1 && (filledColumns[0] === orderColumns[0] || filledColumns[0] === orderColumns[Consts.COLUMNS - 1])) {
			this.lineRotate(filledColumns[0], 'x');
			this.scoreMultiplier++;
		} else {
			for (let column = 0; column < toLeft.length; column++) {
				this.lineMove(toLeft[column], 'x', column + 1);
				this.scoreMultiplier++;
			}
			for (let column = 0; column < toRight.length; column++) {
				this.lineMove(toRight[column], 'x', column + 1);
				this.scoreMultiplier++;
			}
		}

		this.statInc({rowsMoved: filledRows.length, columnsMoved: filledColumns.length});
		this.scoreMultiplier = 1;
	}
	/*jshint +W074 */

	/**
	 * Move stateed line
	 * @param {number} id - Id of stateed line
	 */
	/*jshint -W071, -W074 */
	lineMove (line, direction, delay) {
		console.log('lineMove', line, direction, delay);
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
						dot.unplace(delay);
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
						dot.unplace(delay);
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
						dot.unplace(delay);
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
						dot.unplace(delay);
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
		return true;
	}
	/*jshint +W071, +W074 */

	/**
	 * Rotate stateed line
	 * @param {number} id - Id of stateed line
	 */
	/*jshint -W071, -W074 */
	lineRotate (line, direction) {
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
						dot.unplace(this.scoreMultiplier);
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
						dot.unplace(this.scoreMultiplier);
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
						dot.unplace(this.scoreMultiplier);
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
						dot.unplace(this.scoreMultiplier);
					}
				}
				break;
			default:
				return false;
		}
	}
	/*jshint +W071, +W074 */

	/*jshint -W074, -W083 */
	isMovePossible () {
		let figures = this.figures;
		let orderRows = this.orderRows;
		let orderColumns = this.orderColumns;
		let dots = this.dots;
		let figuresCollection = [];
		for (let figureCounter = 0, fL = figures.length; figureCounter < fL; figureCounter++) {
			let figureOrigin = figures[figureCounter];
			let figureContainer = [];
			for (let cell = 0; cell < 4; cell++) {
				figureContainer.push({x: figureOrigin.cells[cell].x, y: figureOrigin.cells[cell].y});
			}
			figuresCollection.push(figureContainer);
		}
		for (let y = 0, yL = Consts.ROWS; y < yL; y++) {
			for (let x = 0, xL = Consts.COLUMNS; x < xL; x++) {
				let canPlaceFigure = figuresCollection.some(function (element, index) {
					let figure = element;
					let column = orderColumns[x];
					let row = orderRows[y];
					let xs = figure.map(function (element) {
						return element.x;
					});
					let ys = figure.map(function (element) {
						return element.y;
					});
					let dx = xs.max() - xs.min() + 1;
					let dy = ys.max() - ys.min() + 1;
					if (row + dy > Consts.ROWS || column + dx > Consts.COLUMNS) {
						return false;
					} else {
						return figure.every(function (element, index) {
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

		return false;
	}
	/*jshint +W074, +W083 */

	/**
	 * Check if player can't place new figure (Game over state)
	 */
	isGameEnded () {
		if (this.isMovePossible()) {
			return true;
		} else {
			this.modal.show();
			return false;
		}
	}

	/**
	 * Fill dot
	 * @param {number} id - Id of dot
	 */
	dotState (id) {
		if (id !== undefined && id !== this.hoverId) {
			this.dotHover(id);
			this.hoverId = id;
		}
	}

	gameStart () {
		var dots = this.dots;

		let etalonRows = this.etalonRows;
		let etalonColumns = this.etalonColumns;

		this.dotHovers.forEach((element) => dots[element].unhover());
		this.dotHovers = [];
		localStorage.setItem(Consts.DIMENSION + '__dotHovers', JSON.stringify(this.dotHovers));
		this.hoverId = undefined;

		let _localStorageDots = [];
		for (let column = 0; column < Consts.COLUMNS; column++) {
			for (let row = 0; row < Consts.ROWS; row++) {
				let dot = dots[row * Consts.ROWS + column];
				let position = dot.position;
				position.set(etalonColumns[column], etalonRows[row], 0, {
					duration: Consts.DOT_DURATION__POSITION * 4,
					curve: Consts.DOT_CURVE__POSITION
				});
				dot.unplace();
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

		this.modal.hide();
	}

	onReceive(type, ev) {
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
	}
}
