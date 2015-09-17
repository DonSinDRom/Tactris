'use strict';

import Consts from './Consts';
import { core, components, domRenderables, math, physics, webglGeometries, webglRenderables, utilities } from 'famous';

const FamousEngine = core.FamousEngine;
const Position = components.Position;
const Rotation = components.Rotation;
const DOMElement = domRenderables.DOMElement;

const Gravity3D = physics.Gravity3D;
const Particle = physics.Particle;
const PhysicsEngine = physics.PhysicsEngine;
const Spring = physics.Spring;
const Vec3 = math.Vec3;

const Box = webglGeometries.Box;
const Color = utilities.Color;
const Mesh = webglRenderables.Mesh;
const world = new PhysicsEngine();
const geometry = new Box();

export default class Dot extends core.Node {
	constructor (id) {
		super();

		if (Consts.isDOM) {
			this.domElement = new DOMElement(this, {
				properties: {
					background: Consts.DOT_COLOR__UNTOUCHED
				},
				classes: ['Dot']
			});

			// Center dot.
			this
				.setMountPoint(0.5, 0.5)
				.setAlign(0.5, 0.5)
				.setOrigin(0.5, 0.5)
				.setSizeMode('absolute', 'absolute')
				.setAbsoluteSize(Consts.DOT_SIZE, Consts.DOT_SIZE);

			this.domElement.setAttribute('role', 'gridcell');
			this.domElement.setAttribute('aria-selected', false);
			this.domElement.setAttribute('aria-live', 'polite');
			this.domElement.setAttribute('aria-rowindex', Number.parseInt(id / Consts.ROWS));
			this.domElement.setAttribute('aria-colindex', id % Consts.COLUMNS);
		} else {
			this
				.setMountPoint(0.5, 0.5)
				.setAlign(0.5, 0.5)
				.setOrigin(0.5, 0.5)
				.setProportionalSize(1 / Consts.DIMENSION, 1 / Consts.DIMENSION)
				.setDifferentialSize(-Consts.DOT_MARGIN, -Consts.DOT_MARGIN);

			this.mesh = new Mesh(this)
				.setGeometry(geometry)
				.setBaseColor(new Color(Consts.DOT_COLOR__UNTOUCHED));
		}

		this.id = id;

		let localStorageDots = JSON.parse(localStorage.getItem(Consts.DIMENSION + '__dots')) || [];
		if (localStorageDots.length > 0) {
			let _state = localStorageDots[id];
			this.state = _state;
			switch (_state) {
				case Consts.DOT_STATE__PLACED:
					this.state = Consts.DOT_STATE__PLACED;
					if (Consts.isDOM) {
						this.domElement.setProperty('background', Consts.DOT_COLOR__PLACED);
						this.domElement.setAttribute('aria-readonly', true);
						this.domElement.setAttribute('aria-selected', true);
					} else {
						let _color = new Color();
						_color.setHex(Consts.DOT_COLOR__CANVAS___PLACED);
						this.mesh.setBaseColor(_color);
					}
					break;
				case Consts.DOT_STATE__HOVERED:
					this.state = Consts.DOT_STATE__HOVERED;
					if (Consts.isDOM) {
						this.domElement.setProperty('background', Consts.DOT_COLOR__HOVERED);
						this.domElement.setAttribute('aria-readonly', false);
						this.domElement.setAttribute('aria-selected', true);
					} else {
						let _color = new Color();
						_color.setHex(Consts.DOT_COLOR__CANVAS___HOVERED);
						this.mesh.setBaseColor(_color);
					}
					break;
				case Consts.DOT_STATE__UNTOUCHED:
				default:
					this.state = Consts.DOT_STATE__UNTOUCHED;
					if (Consts.isDOM) {
						this.domElement.setProperty('background', Consts.DOT_COLOR__UNTOUCHED);
						this.domElement.setAttribute('aria-readonly', false);
						this.domElement.setAttribute('aria-selected', false);
					} else {
						let _color = new Color();
						_color.setHex(Consts.DOT_COLOR__CANVAS___UNTOUCHED);
						this.mesh.setBaseColor(_color);
					}
					break;
			}
		} else {
			this.state = Consts.DOT_STATE__UNTOUCHED;
		}

		this.position = new Position(this);
		this.rotation = new Rotation(this);
		this.rotation.set(0, 0, 0, 0);

		this.addUIEvent('mousedown');
		this.addUIEvent('mousemove');
		this.addUIEvent('click');
		this.addUIEvent('mouseup');
	}

	hover () {
		if (this.state === Consts.DOT_STATE__UNTOUCHED) {
			this.state = Consts.DOT_STATE__HOVERED;
			if (Consts.isDOM) {
				this.domElement.setProperty('background', Consts.DOT_COLOR__HOVERED);
				this.domElement.setAttribute('aria-selected', true);
			} else {
				let _color = new Color();
				_color.setHex(Consts.DOT_COLOR__CANVAS___HOVERED);
				this.mesh.setBaseColor(_color);
			}
			let _localStorageDots = JSON.parse(localStorage.getItem(Consts.DIMENSION + '__dots'));
			_localStorageDots[this.id] = Consts.DOT_STATE__HOVERED;
			localStorage.setItem(Consts.DIMENSION + '__dots', JSON.stringify(_localStorageDots));
		}
	}

	unhover() {
		if (this.state === Consts.DOT_STATE__HOVERED) {
			this.state = Consts.DOT_STATE__UNTOUCHED;
			if (Consts.isDOM) {
				this.domElement.setProperty('background', Consts.DOT_COLOR__UNTOUCHED);
				this.domElement.setAttribute('aria-selected', false);
			} else {
				let _color = new Color();
				_color.setHex(Consts.DOT_COLOR__CANVAS___UNTOUCHED);
				this.mesh.setBaseColor(_color);
			}
			let _localStorageDots = JSON.parse(localStorage.getItem(Consts.DIMENSION + '__dots'));
			_localStorageDots[this.id] = Consts.DOT_STATE__UNTOUCHED;
			localStorage.setItem(Consts.DIMENSION + '__dots', JSON.stringify(_localStorageDots));
		}
	}

	place () {
		if (this.state === Consts.DOT_STATE__HOVERED) {
			this.state = Consts.DOT_STATE__PLACED;
			if (Consts.isDOM) {
				this.domElement.setProperty('background', Consts.DOT_COLOR__PLACED);
				this.domElement.setAttribute('aria-readonly', true);
			} else {
				let _color = new Color();
				_color.setHex(Consts.DOT_COLOR__CANVAS___PLACED);
				this.mesh.setBaseColor(_color);
			}
			let _localStorageDots = JSON.parse(localStorage.getItem(Consts.DIMENSION + '__dots'));
			_localStorageDots[this.id] = Consts.DOT_STATE__PLACED;
			localStorage.setItem(Consts.DIMENSION + '__dots', JSON.stringify(_localStorageDots));
		}
	}

	unplace (delayArg) {
		var delay = delayArg || false;
		var self = this;
		if (this.state === Consts.DOT_STATE__PLACED) {
			if (delay) {
				var clock = FamousEngine.getClock();
				if (Consts.isDOM) {
					clock.setTimeout(function() {
						self.domElement.setProperty('background', Consts.DOT_COLOR__UNTOUCHED);
					}, Consts.DURATION * delayArg);
				} else {
					let _color = new Color();
					_color.setHex(Consts.DOT_COLOR__CANVAS___UNTOUCHED);
					clock.setTimeout(function() {
						self.mesh.setBaseColor(_color);
					}, Consts.DURATION * delayArg);
				}
			} else {
				if (Consts.isDOM) {
					this.domElement.setProperty('background', Consts.DOT_COLOR__UNTOUCHED);
				} else {
					let _color = new Color();
					_color.setHex(Consts.DOT_COLOR__CANVAS___UNTOUCHED);
					this.mesh.setBaseColor(_color);
				}
			}
			this.state = Consts.DOT_STATE__UNTOUCHED;
			if (Consts.isDOM) {
				this.domElement.setAttribute('aria-readonly', false);
				this.domElement.setAttribute('aria-selected', false);
			}
			let _localStorageDots = JSON.parse(localStorage.getItem(Consts.DIMENSION + '__dots'));
			_localStorageDots[this.id] = Consts.DOT_STATE__UNTOUCHED;
			localStorage.setItem(Consts.DIMENSION + '__dots', JSON.stringify(_localStorageDots));
		}
	}

	select() {
		if (this.state !== Consts.DOT_STATE__PLACED) {
			this.state = Consts.DOT_STATE__PLACED;
			if (Consts.isDOM) {
				this.domElement.setProperty('background', Consts.DOT_COLOR__PLACED);
				this.domElement.setAttribute('aria-readonly', true);
			}
			let _localStorageDots = JSON.parse(localStorage.getItem(Consts.DIMENSION + '__dots'));
			_localStorageDots[this.id] = Consts.DOT_STATE__PLACED;
			localStorage.setItem(Consts.DIMENSION + '__dots', JSON.stringify(_localStorageDots));
		}
	}

	onReceive (type, ev) {
		switch (type) {
			case 'mousedown':
				this._parent.mousingDown(this.id);
				break;
			case 'mousemove':
				if (this._parent.mousing === true) {
					this._parent.dotState(this.id);
					this.emit('id', this.domElement.id).emit('state', this.domElement.state);
				}
				break;
			case 'click':
				this._parent.dotState(this.id);
				this.emit('id', this.domElement.id).emit('state', this.domElement.state);
				break;
			case 'mouseup':
				this._parent.mousingUp(this.id);
				break;
			default:
				return false;
		}
	}
}
