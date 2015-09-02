'use strict';

import Consts from './Consts';
import {core, components, domRenderables} from 'famous';

export default class NewGameButton extends core.Node {
    constructor () {
        super();

        let alignX = 0;
        let alignY = 0;

        if (Consts.WIDTH > Consts.HEIGHT) {
            alignX = 0;
            alignY = 0.5;
        } else {
            alignX = 0.5;
            alignY = 0;
        }

        this
            .setMountPoint(0, 0)
            .setAlign(alignX, alignY)
            .setSizeMode('absolute', 'absolute')
            .setAbsoluteSize(Consts.DOT_SIDE * Consts.DIMENSION / 2, Consts.DOT_SIDE * Consts.DIMENSION / 4);

        this.domElement = new domRenderables.DOMElement(this, {
            tagName: 'h2',
            properties: {
                display: 'inline',
                color: '#fff',
                fontSize: '32px',
                padding: '1rem'
            },
            content: 'New Game',
            classes: ['NewGameButton', 'interactive']
        });

        this.addUIEvent('click');
        this.position = new components.Position(this);
    }

    onReceive(type, ev) {
        switch (type) {
            case 'click':
                if (!this._parent._parent.isMovePossible() || confirm('Are you sure?')) {
                    this._parent.gameStart();
                }
                break;
            default:
                return false;
        }
    }
}