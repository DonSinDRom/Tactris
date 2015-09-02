'use strict';

import Consts from './Consts';
import {transitions} from 'famous';
const Curves = transitions.Curves;

export default class Layout {
    constructor (node) {
        this.node = node;
        this.id = this.node.addComponent(this);
        this.current = 0;
        this.curve = [Curves.outQuint, Curves.outElastic, Curves.inElastic, Curves.inOutEase, Curves.inBounce];
        this.duration = [2 * Consts.DURATION, 3 * Consts.DURATION, 3 * Consts.DURATION, Consts.DURATION, 2 * Consts.DURATION];

        const width = document.body.clientWidth;
        const height = document.body.clientHeight;
        for (let figureCounter = 0; figureCounter < 2; figureCounter++) {
            let figure = this.node.figures[figureCounter];
            let position = figure.position;
            if (width > height) {
                position.set(-Consts.ROWS * Consts.DOT_SIDE, (figureCounter -1) * Consts.ROWS * Consts.DOT_SIDE / 2);
            } else {
                position.set(-figureCounter * Consts.ROWS * Consts.DOT_SIDE / 2, -Consts.ROWS * Consts.DOT_SIDE);
            }
        }

        const nav = this.node.nav;
        const navPosition = nav.position;
        if (width > height) {
            navPosition.set(Consts.ROWS * Consts.DOT_SIDE / 2, -Consts.ROWS * Consts.DOT_SIDE / 2);
        } else {
            navPosition.set(-Consts.ROWS * Consts.DOT_SIDE / 2, Consts.ROWS * Consts.DOT_SIDE / 2);
        }

        this.next();
    }

    next () {
        const orderColumns = this.node.orderColumns;
        const orderRows = this.node.orderRows;

        if (this.current++ === Consts.ROWS) {
            this.current = 0;
        }
        const duration = this.duration[this.current];
        const curve = this.curve[this.current];
        let row = 0;
        let column = 0;
        const bounds = [Consts.DOT_SIDE * (1 - Consts.ROWS) / 2, Consts.DOT_SIDE * (1 - Consts.COLUMNS) / 2];

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
    }
}
