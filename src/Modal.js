'use strict';

import Consts from './Consts';
import {core, components, domRenderables} from 'famous';

const Position = components.Position;
const DOMElement = domRenderables.DOMElement;

export default class Modal extends core.Node {
	constructor () {
		super();

		this
			.setPosition(0, 0, 0);

		this.domElement = new DOMElement(this, {
			tagName: 'center',
			classes: ['Modal', 'interactive'],
			properties: {
				color: '#fff',
				fontSize: '24px',
				padding: '1rem',
				backgroundColor: 'rgba(0,0,0,.6)'
			},
			content: 'Modal'
		});

		this.isVisible = false;

		this.position = new Position(this);
		this.position.setY(-Consts.HEIGHT);

		this.addUIEvent('click');
	}

	hide() {
		if (!this.isVisible) {
			return;
		}

		this.position.setY(-Consts.HEIGHT, {
			duration: Consts.MODAL_DURATION,
			curve: Consts.MODAL_CURVE
		});

		this.isVisible = false;
	}

	show () {
		if (this.isVisible) {
			return;
		}

		this.domElement.setContent(`<h1>Game Over!<br>Click to start new game</h1>`);
		this.position.setY(0, {
			duration: Consts.MODAL_DURATION,
			curve: Consts.MODAL_CURVE
		});

		this.isVisible = true;
	}

	onReceive(type, ev) {
		switch (type) {
			case 'click':
				this.hide();
				this._parent.gameStart();
				break;
			default:
				return false;
		}
	}
}
