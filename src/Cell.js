'use strict';

import Consts from './Consts';
import {core, components, domRenderables} from 'famous';

const Position = components.Position;
const DOMElement = domRenderables.DOMElement;

export default class Cell extends core.Node {
	constructor (id, x, y) {
		super();

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
}
