'use strict';

import Consts from './Consts';
import {core, components, domRenderables} from 'famous';
import NewGameButton from './NewGameButton';
import ScoreDisplay from './ScoreDisplay';

export default class Nav extends core.Node {
	constructor () {
		super();

		let x = 0, y = 0;
		if (Consts.WIDTH > Consts.HEIGHT) {
			x = 2;
			y = 1;
		} else {
			x = 1;
			y = 2;
		}

		this
			.setMountPoint(0, 0)
			.setAlign(0.5, 0.5)
			.setSizeMode('absolute', 'absolute')
			.setAbsoluteSize(Consts.DOT_SIDE * Consts.DIMENSION / x, Consts.DOT_SIDE * Consts.DIMENSION / y);

		this.domElement = new domRenderables.DOMElement(this, {
			tagName: 'nav',
			classes: ['Nav']
		});

		this.score = new ScoreDisplay();
		this.addChild(this.score);

		this.button = new NewGameButton();
		this.addChild(this.button);

		this.position = new components.Position(this);
	}

	gameStart() {
		this._parent.gameStart();
	}

	isGameEnded () {
		this._parent.isGameEnded();
	}

	scoreInc(value) {
		this.score.scoreInc(value);
	}

	scoreReset() {
		this.score.scoreReset();
	}

	scoreSurcharge() {
		this.score.scoreSurcharge();
	}
}
