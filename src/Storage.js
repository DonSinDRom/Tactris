'use strict';

import Consts from './Consts';
import localforage from 'localforage';

export default class Storage {
//    /**
//     * @param {boolean} [mute=false]
//     */
//    constructor (mute) {
//        this.mute(mute);
//
//        this._pluck = new Tone.PluckSynth().toMaster();
//        this._ui = new Tone.PolySynth(4, Tone.SimpleSynth).toMaster();
//        this._drum = new Tone.DrumSynth().toMaster();
//        this._drum.volume.value = -20;
//
//        this._duration = Consts.DURATION / 1000;
//
//        this.gameOver();
//    }
//
//    mute (isMute) {
//        Tone.Master.mute = !!isMute;
//    }
//
//    /**
//     * Play UI sound (clicks and so on)
//     */
//    ui () {
//        if (!this.mute) {
//            this._ui.triggerAttackRelease('D3', 0.25 * this._duration);
//        }
//    }
//
//    /**
//     * Play sound of line move
//     * @param {number} line
//     * @param {string} direction either 'x' or 'y'
//     */
//    line (line, direction) {
//        if (!this.mute) {
//            this._pluck.triggerAttackRelease(`${direction === 'x' ? 'A' : 'C'}3`, line * this._duration * 0.25);
//        }
//    }
//
//    gameOver () {
//        if (!this.mute) {
//            this._ui.triggerAttackRelease(['A3', 'D4', 'E4'], 0.25 * this._duration); // Am
//            this._ui.triggerAttackRelease(['D3', 'F3', 'A3'], 0.25 * this._duration, this._duration); // Dm
//        }
//    }
//
//    figure () {
//        if (!this.mute) {
//            this._drum.triggerAttackRelease('C2', 0.1 * this._duration);
//        }
//    }
}
