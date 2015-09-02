'use strict';

import Consts from './Consts';
import {core, components, domRenderables} from 'famous';

export default class ScoreDisplay extends core.Node {
    constructor () {
        super();

        this
            .setMountPoint(0, 0)
            .setAlign(0, 0)
            .setSizeMode('absolute', 'absolute')
            .setAbsoluteSize(Consts.DOT_SIDE * Consts.DIMENSION / 2, Consts.DOT_SIDE * Consts.DIMENSION / 2);

        this.score = {};
        let localStorageScore = JSON.parse(localStorage.getItem(Consts.DIMENSION + '__score'));
        if (localStorageScore) {
            this.score = localStorageScore;
        } else {
            this.score = {
                best: 0,
                current: 0
            };
            localStorage.setItem(Consts.DIMENSION + '__score', JSON.stringify(this.score));
        }

        this.domElement = new domRenderables.DOMElement(this, {
            tagName: 'h2',
            classes: ['Scores'],
            properties: {
                color: '#fff',
                fontSize: '32px',
                padding: '1rem'
            },
            content: `
			<p class="Score">Score:
				<var class="ScoreValue">
					${this.score.current}
				</var>
			</p>
			<p class="Score">Best:
				<var class="ScoreValue">
					${this.score.best}
				</var>
			</p>`
        });

        this.domElement.setAttribute('role', 'log');
        this.domElement.setAttribute('aria-live', 'polite');

        this.position = new components.Position(this);
    }

    scoreSetContent(value) {
        if (value >= this.score.best) {
            this.domElement.setContent(`
				<p class="Score">Score:
					<var class="ScoreValue">
						${value}
					</var>
				</p>
				<p class="Score">Best:
					<var class="ScoreValue">
						${value}
					</var>
				</p>`);
            this.score.best = value;
        } else {
            this.domElement.setContent(`
				<p class="Score">Score:
					<var class="ScoreValue">
						${value}
					</var>
				</p>
				<p class="Score">Best:
					<var class="ScoreValue">
						${this.score.best}
					</var>
				</p>`);
        }
        localStorage.setItem(Consts.DIMENSION + '__score', JSON.stringify(this.score));
    }

    scoreInc (inc) {
        this.score.current += inc;
        this.scoreSetContent(this.score.current);
    }

    scoreReset () {
        this.score.current = 0;
        this.scoreSetContent(this.score.current);
    }

    scoreSurcharge () {
        this.score.current = this.score.current * Consts.SCORE__SURCHARGE;
        this.scoreSetContent(this.score.current);
    }
}
