(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * The MIT License (MIT)
 * 
 * Copyright (c) 2015 Famous Industries Inc.
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

var Position = require('./Position');

/**
 * Align is a component designed to allow for smooth tweening
 * of the alignment of a node relative to its parent.
 *
 * @class Align
 * @augments Position
 *
 * @param {Node} node Node that the Align component will be attached to
 */
function Align(node) {
    Position.call(this, node);

    var initial = node.getAlign();

    this._x.set(initial[0]);
    this._y.set(initial[1]);
    this._z.set(initial[2]);
}

/**
 * Return the name of the Align component
 *
 * @method
 *
 * @return {String} Name of the component
 */
Align.prototype.toString = function toString() {
    return 'Align';
};

Align.prototype = Object.create(Position.prototype);
Align.prototype.constructor = Align;

/**
 * When the node this component is attached to updates, update the value
 * of the Node's align.
 *
 * @method
 *
 * @return {undefined} undefined
 */
Align.prototype.update = function update() {
    this._node.setAlign(this._x.get(), this._y.get(), this._z.get());
    this._checkUpdate();
};

Align.prototype.onUpdate = Align.prototype.update;

module.exports = Align;

},{"./Position":7}],2:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

var Commands = require('../core/Commands');

/**
 * Camera is a component that is responsible for sending information to the renderer about where
 * the camera is in the scene.  This allows the user to set the type of projection, the focal depth,
 * and other properties to adjust the way the scenes are rendered.
 *
 * @class Camera
 *
 * @param {Node} node to which the instance of Camera will be a component of
 */
function Camera(node) {
    this._node = node;
    this._projectionType = Camera.ORTHOGRAPHIC_PROJECTION;
    this._focalDepth = 0;
    this._near = 0;
    this._far = 0;
    this._requestingUpdate = false;
    this._id = node.addComponent(this);
    this._viewTransform = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
    this._viewDirty = false;
    this._perspectiveDirty = false;
    this.setFlat();
}

Camera.FRUSTUM_PROJECTION = 0;
Camera.PINHOLE_PROJECTION = 1;
Camera.ORTHOGRAPHIC_PROJECTION = 2;

/**
 * @method
 *
 * @return {String} Name of the component
 */
Camera.prototype.toString = function toString() {
    return 'Camera';
};

/**
 * Gets object containing serialized data for the component
 *
 * @method
 *
 * @return {Object} the state of the component
 */
Camera.prototype.getValue = function getValue() {
    return {
        component: this.toString(),
        projectionType: this._projectionType,
        focalDepth: this._focalDepth,
        near: this._near,
        far: this._far
    };
};

/**
 * Set the components state based on some serialized data
 *
 * @method
 *
 * @param {Object} state an object defining what the state of the component should be
 *
 * @return {Boolean} status of the set
 */
Camera.prototype.setValue = function setValue(state) {
    if (this.toString() === state.component) {
        this.set(state.projectionType, state.focalDepth, state.near, state.far);
        return true;
    }
    return false;
};

/**
 * Set the internals of the component
 *
 * @method
 *
 * @param {Number} type an id corresponding to the type of projection to use
 * @param {Number} depth the depth for the pinhole projection model
 * @param {Number} near the distance of the near clipping plane for a frustum projection
 * @param {Number} far the distance of the far clipping plane for a frustum projection
 *
 * @return {Boolean} status of the set
 */
Camera.prototype.set = function set(type, depth, near, far) {
    if (!this._requestingUpdate) {
        this._node.requestUpdate(this._id);
        this._requestingUpdate = true;
    }
    this._projectionType = type;
    this._focalDepth = depth;
    this._near = near;
    this._far = far;
};

/**
 * Set the camera depth for a pinhole projection model
 *
 * @method
 *
 * @param {Number} depth the distance between the Camera and the origin
 *
 * @return {Camera} this
 */
Camera.prototype.setDepth = function setDepth(depth) {
    if (!this._requestingUpdate) {
        this._node.requestUpdate(this._id);
        this._requestingUpdate = true;
    }
    this._perspectiveDirty = true;
    this._projectionType = Camera.PINHOLE_PROJECTION;
    this._focalDepth = depth;
    this._near = 0;
    this._far = 0;

    return this;
};

/**
 * Gets object containing serialized data for the component
 *
 * @method
 *
 * @param {Number} near distance from the near clipping plane to the camera
 * @param {Number} far distance from the far clipping plane to the camera
 *
 * @return {Camera} this
 */
Camera.prototype.setFrustum = function setFrustum(near, far) {
    if (!this._requestingUpdate) {
        this._node.requestUpdate(this._id);
        this._requestingUpdate = true;
    }

    this._perspectiveDirty = true;
    this._projectionType = Camera.FRUSTUM_PROJECTION;
    this._focalDepth = 0;
    this._near = near;
    this._far = far;

    return this;
};

/**
 * Set the Camera to have orthographic projection
 *
 * @method
 *
 * @return {Camera} this
 */
Camera.prototype.setFlat = function setFlat() {
    if (!this._requestingUpdate) {
        this._node.requestUpdate(this._id);
        this._requestingUpdate = true;
    }

    this._perspectiveDirty = true;
    this._projectionType = Camera.ORTHOGRAPHIC_PROJECTION;
    this._focalDepth = 0;
    this._near = 0;
    this._far = 0;

    return this;
};

/**
 * When the node this component is attached to updates, the Camera will
 * send new camera information to the Compositor to update the rendering
 * of the scene.
 *
 * @method
 *
 * @return {undefined} undefined
 */
Camera.prototype.onUpdate = function onUpdate() {
    this._requestingUpdate = false;

    var path = this._node.getLocation();

    this._node
        .sendDrawCommand(Commands.WITH)
        .sendDrawCommand(path);

    if (this._perspectiveDirty) {
        this._perspectiveDirty = false;

        switch (this._projectionType) {
            case Camera.FRUSTUM_PROJECTION:
                this._node.sendDrawCommand(Commands.FRUSTRUM_PROJECTION);
                this._node.sendDrawCommand(this._near);
                this._node.sendDrawCommand(this._far);
                break;
            case Camera.PINHOLE_PROJECTION:
                this._node.sendDrawCommand(Commands.PINHOLE_PROJECTION);
                this._node.sendDrawCommand(this._focalDepth);
                break;
            case Camera.ORTHOGRAPHIC_PROJECTION:
                this._node.sendDrawCommand(Commands.ORTHOGRAPHIC_PROJECTION);
                break;
        }
    }

    if (this._viewDirty) {
        this._viewDirty = false;

        this._node.sendDrawCommand(Commands.CHANGE_VIEW_TRANSFORM);
        this._node.sendDrawCommand(this._viewTransform[0]);
        this._node.sendDrawCommand(this._viewTransform[1]);
        this._node.sendDrawCommand(this._viewTransform[2]);
        this._node.sendDrawCommand(this._viewTransform[3]);

        this._node.sendDrawCommand(this._viewTransform[4]);
        this._node.sendDrawCommand(this._viewTransform[5]);
        this._node.sendDrawCommand(this._viewTransform[6]);
        this._node.sendDrawCommand(this._viewTransform[7]);

        this._node.sendDrawCommand(this._viewTransform[8]);
        this._node.sendDrawCommand(this._viewTransform[9]);
        this._node.sendDrawCommand(this._viewTransform[10]);
        this._node.sendDrawCommand(this._viewTransform[11]);

        this._node.sendDrawCommand(this._viewTransform[12]);
        this._node.sendDrawCommand(this._viewTransform[13]);
        this._node.sendDrawCommand(this._viewTransform[14]);
        this._node.sendDrawCommand(this._viewTransform[15]);
    }
};

/**
 * When the transform of the node this component is attached to
 * changes, have the Camera update its projection matrix and
 * if needed, flag to node to update.
 *
 * @method
 *
 * @param {Array} transform an array denoting the transform matrix of the node
 *
 * @return {Camera} this
 */
Camera.prototype.onTransformChange = function onTransformChange(transform) {
    var a = transform;
    this._viewDirty = true;

    if (!this._requestingUpdate) {
        this._node.requestUpdate(this._id);
        this._requestingUpdate = true;
    }

    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
    a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
    a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
    a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15],

    b00 = a00 * a11 - a01 * a10,
    b01 = a00 * a12 - a02 * a10,
    b02 = a00 * a13 - a03 * a10,
    b03 = a01 * a12 - a02 * a11,
    b04 = a01 * a13 - a03 * a11,
    b05 = a02 * a13 - a03 * a12,
    b06 = a20 * a31 - a21 * a30,
    b07 = a20 * a32 - a22 * a30,
    b08 = a20 * a33 - a23 * a30,
    b09 = a21 * a32 - a22 * a31,
    b10 = a21 * a33 - a23 * a31,
    b11 = a22 * a33 - a23 * a32,

    det = 1/(b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06);

    this._viewTransform[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
    this._viewTransform[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
    this._viewTransform[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
    this._viewTransform[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
    this._viewTransform[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
    this._viewTransform[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
    this._viewTransform[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
    this._viewTransform[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
    this._viewTransform[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
    this._viewTransform[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
    this._viewTransform[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
    this._viewTransform[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
    this._viewTransform[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
    this._viewTransform[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
    this._viewTransform[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
    this._viewTransform[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;
};

module.exports = Camera;

},{"../core/Commands":15}],3:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

var CallbackStore = require('../utilities/CallbackStore');
var Vec2 = require('../math/Vec2');

var VEC_REGISTER = new Vec2();

var gestures = {drag: true, tap: true, rotate: true, pinch: true};

/**
 * Component to manage gesture events. Will track 'pinch', 'rotate', 'tap', and 'drag' events, on an
 * as-requested basis.
 *
 * @class GestureHandler
 *
 * @param {Node} node The node with which to register the handler.
 * @param {Array} events An array of event objects specifying .event and .callback properties.
 */
function GestureHandler(node, events) {
    this.node = node;
    this.id = node.addComponent(this);

    this._events = new CallbackStore();

    this.last1 = new Vec2();
    this.last2 = new Vec2();

    this.delta1 = new Vec2();
    this.delta2 = new Vec2();

    this.velocity1 = new Vec2();
    this.velocity2 = new Vec2();

    this.dist = 0;
    this.diff12 = new Vec2();

    this.center = new Vec2();
    this.centerDelta = new Vec2();
    this.centerVelocity = new Vec2();

    this.pointer1 = {
        position: this.last1,
        delta: this.delta1,
        velocity: this.velocity1
    };

    this.pointer2 = {
        position: this.last2,
        delta: this.delta2,
        velocity: this.velocity2
    };

    this.event = {
        status: null,
        time: 0,
        pointers: [],
        center: this.center,
        centerDelta: this.centerDelta,
        centerVelocity: this.centerVelocity,
        points: 0,
        current: 0
    };

    this.trackedPointerIDs = [-1, -1];
    this.timeOfPointer = 0;
    this.multiTap = 0;

    this.mice = [];

    this.gestures = [];
    this.options = {};
    this.trackedGestures = {};

    var i;
    var len;

    if (events) {
        for (i = 0, len = events.length; i < len; i++) {
            this.on(events[i], events[i].callback);
        }
    }

    node.addUIEvent('touchstart');
    node.addUIEvent('mousedown');
    node.addUIEvent('touchmove');
    node.addUIEvent('mousemove');
    node.addUIEvent('touchend');
    node.addUIEvent('mouseup');
    node.addUIEvent('mouseleave');
}


/**
 * onReceive fires when the node this component is attached to gets an event.
 *
 * @method
 *
 * @param {String} ev name of the event
 * @param {Object} payload data associated with the event
 *
 * @return {undefined} undefined
 */
GestureHandler.prototype.onReceive = function onReceive (ev, payload) {
    switch(ev) {
        case 'touchstart':
        case 'mousedown':
            _processPointerStart.call(this, payload);
            break;
        case 'touchmove':
        case 'mousemove':
            _processPointerMove.call(this, payload);
            break;
        case 'touchend':
        case 'mouseup':
            _processPointerEnd.call(this, payload);
            break;
        case 'mouseleave':
            _processMouseLeave.call(this, payload);
            break;
        default:
            break;
    }
};

/**
 * Return the name of the GestureHandler component
 *
 * @method
 *
 * @return {String} Name of the component
 */
GestureHandler.prototype.toString = function toString() {
    return 'GestureHandler';
};

/**
 * Register a callback to be invoked on an event.
 *
 * @method
 *
 * @param {Object|String} ev The event object or event name.
 * @param {Function} cb The callback
 *
 * @return {undefined} undefined
 */
GestureHandler.prototype.on = function on(ev, cb) {
    var gesture = ev.event || ev;
    if (gestures[gesture]) {
        this.trackedGestures[gesture] = true;
        this.gestures.push(gesture);
        if (ev.event) this.options[gesture] = ev;
        this._events.on(gesture, cb);
    }
};

/**
 * Trigger gestures in the order they were requested, if they occurred.
 *
 * @method
 *
 * @return {undefined} undefined
 */
GestureHandler.prototype.triggerGestures = function() {
    var payload = this.event;
    for (var i = 0, len = this.gestures.length; i < len; i++) {
        var gesture = this.gestures[i];
        switch (gesture) {
            case 'rotate':
            case 'pinch':
                if (payload.points === 2) this.trigger(gesture, payload);
                break;
            case 'tap':
                if (payload.status === 'start') {
                    if (this.options.tap) {
                        var pts = this.options.tap.points || 1;
                        if(this.multiTap >= pts && payload.points >= pts) this.trigger(gesture, payload);
                    }
                    else this.trigger(gesture, payload);
                }
                break;
            default:
                this.trigger(gesture, payload);
                break;
        }
    }
};

/**
 * Trigger the callback associated with an event, passing in a payload.
 *
 * @method trigger
 *
 * @param {String} ev The event name
 * @param {Object} payload The event payload
 *
 * @return {undefined} undefined
 */
GestureHandler.prototype.trigger = function trigger (ev, payload) {
    this._events.trigger(ev, payload);
};

/**
 * Process up to the first two touch/mouse move events. Exit out if the first two points are already being tracked.
 *
 * @method _processPointerStart
 * @private
 *
 * @param {Object} e The event object
 *
 * @return {undefined} undefined
 */
function _processPointerStart(e) {
    var t;
    if (!e.targetTouches) {
        this.mice[0] = e;
        t = this.mice;
        e.identifier = 1;
    }
    else t = e.targetTouches;

    if (t[0] && t[1] && this.trackedPointerIDs[0] === t[0].identifier && this.trackedPointerIDs[1] === t[1].identifier) {
        return;
    }

    this.event.time = Date.now();

    var threshold;
    var id;

    if (this.trackedPointerIDs[0] !== t[0].identifier) {
        if (this.trackedGestures.tap) {
            threshold = (this.options.tap && this.options.tap.threshold) || 250;
            if (this.event.time - this.timeOfPointer < threshold) this.event.taps++;
            else this.event.taps = 1;
            this.timeOfPointer = this.event.time;
            this.multiTap = 1;
        }
        this.event.current = 1;
        this.event.points = 1;
        id = t[0].identifier;
        this.trackedPointerIDs[0] = id;

        this.last1.set(t[0].pageX, t[0].pageY);
        this.velocity1.clear();
        this.delta1.clear();
        this.event.pointers.push(this.pointer1);
    }
    if (t[1] && this.trackedPointerIDs[1] !== t[1].identifier) {
        if (this.trackedGestures.tap) {
            threshold = (this.options.tap && this.options.tap.threshold) || 250;
            if (this.event.time - this.timeOfPointer < threshold) this.multiTap = 2;
        }
        this.event.current = 2;
        this.event.points = 2;
        id = t[1].identifier;
        this.trackedPointerIDs[1] = id;

        this.last2.set(t[1].pageX, t[1].pageY);
        this.velocity2.clear();
        this.delta2.clear();

        Vec2.add(this.last1, this.last2, this.center).scale(0.5);
        this.centerDelta.clear();
        this.centerVelocity.clear();

        Vec2.subtract(this.last2, this.last1, this.diff12);
        this.dist = this.diff12.length();

        if (this.trackedGestures.pinch) {
            this.event.scale = this.event.scale || 1;
            this.event.scaleDelta = 0;
            this.event.scaleVelocity = 0;
        }
        if (this.trackedGestures.rotate) {
            this.event.rotation = this.event.rotation || 0;
            this.event.rotationDelta = 0;
            this.event.rotationVelocity = 0;
        }
        this.event.pointers.push(this.pointer2);
    }

    this.event.status = 'start';
    if (this.event.points === 1) {
        this.center.copy(this.last1);
        this.centerDelta.clear();
        this.centerVelocity.clear();
        if (this.trackedGestures.pinch) {
            this.event.scale = 1;
            this.event.scaleDelta = 0;
            this.event.scaleVelocity = 0;
        }
        if (this.trackedGestures.rotate) {
            this.event.rotation = 0;
            this.event.rotationDelta = 0;
            this.event.rotationVelocity = 0;
        }
    }
    this.triggerGestures();
}

/**
 * Process up to the first two touch/mouse move events.
 *
 * @method _processPointerMove
 * @private
 *
 * @param {Object} e The event object.
 *
 * @return {undefined} undefined
 */
function _processPointerMove(e) {
    var t;
    if (!e.targetTouches) {
        if (!this.event.current) return;
        this.mice[0] = e;
        t = this.mice;
        e.identifier = 1;
    }
    else t = e.targetTouches;

    var time = Date.now();
    var dt = time - this.event.time;
    if (dt === 0) return;
    var invDt = 1000 / dt;
    this.event.time = time;

    this.event.current = 1;
    this.event.points = 1;
    if (this.trackedPointerIDs[0] === t[0].identifier) {
        VEC_REGISTER.set(t[0].pageX, t[0].pageY);
        Vec2.subtract(VEC_REGISTER, this.last1, this.delta1);
        Vec2.scale(this.delta1, invDt, this.velocity1);
        this.last1.copy(VEC_REGISTER);

    }
    if (t[1]) {
        this.event.current = 2;
        this.event.points = 2;
        VEC_REGISTER.set(t[1].pageX, t[1].pageY);
        Vec2.subtract(VEC_REGISTER, this.last2, this.delta2);
        Vec2.scale(this.delta2, invDt, this.velocity2);
        this.last2.copy(VEC_REGISTER);

        Vec2.add(this.last1, this.last2, VEC_REGISTER).scale(0.5);
        Vec2.subtract(VEC_REGISTER, this.center, this.centerDelta);
        Vec2.add(this.velocity1, this.velocity2, this.centerVelocity).scale(0.5);
        this.center.copy(VEC_REGISTER);

        Vec2.subtract(this.last2, this.last1, VEC_REGISTER);

        if (this.trackedGestures.rotate) {
            var dot = VEC_REGISTER.dot(this.diff12);
            var cross = VEC_REGISTER.cross(this.diff12);
            var theta = -Math.atan2(cross, dot);
            this.event.rotation += theta;
            this.event.rotationDelta = theta;
            this.event.rotationVelocity = theta * invDt;
        }

        var dist = VEC_REGISTER.length();
        var scale = dist / this.dist;
        this.diff12.copy(VEC_REGISTER);
        this.dist = dist;

        if (this.trackedGestures.pinch) {
            this.event.scale *= scale;
            scale -= 1.0;
            this.event.scaleDelta = scale;
            this.event.scaleVelocity = scale * invDt;
        }
    }

    this.event.status = 'move';
    if (this.event.points === 1) {
        this.center.copy(this.last1);
        this.centerDelta.copy(this.delta1);
        this.centerVelocity.copy(this.velocity1);
        if (this.trackedGestures.pinch) {
            this.event.scale = 1;
            this.event.scaleDelta = 0;
            this.event.scaleVelocity = 0;
        }
        if (this.trackedGestures.rotate) {
            this.event.rotation = 0;
            this.event.rotationDelta = 0;
            this.event.rotationVelocity = 0;
        }
    }
    this.triggerGestures();
}

/**
 * Process up to the first two touch/mouse end events. Exit out if the two points being tracked are still active.
 *
 * @method _processPointerEnd
 * @private
 *
 * @param {Object} e The event object
 *
 * @return {undefined} undefined
 */
function _processPointerEnd(e) {
    var t;
    if (!e.targetTouches) {
        if (!this.event.current) return;
        this.mice.pop();
        t = this.mice;
    }
    else t = e.targetTouches;

    if (t[0] && t[1] && this.trackedPointerIDs[0] === t[0].identifier && this.trackedPointerIDs[1] === t[1].identifier) {
            return;
    }

    var id;

    this.event.status = 'end';
    if (!t[0]) {
        this.event.current = 0;
        this.trackedPointerIDs[0] = -1;
        this.trackedPointerIDs[1] = -1;
        this.triggerGestures();
        this.event.pointers.pop();
        this.event.pointers.pop();
        return;
    }
    else if(this.trackedPointerIDs[0] !== t[0].identifier) {
        this.trackedPointerIDs[0] = -1;
        id = t[0].identifier;
        this.trackedPointerIDs[0] = id;

        this.last1.set(t[0].pageX, t[0].pageY);
        this.velocity1.clear();
        this.delta1.clear();
    }
    if (!t[1]) {
        this.event.current = 1;
        this.trackedPointerIDs[1] = -1;
        this.triggerGestures();
        this.event.points = 1;
        this.event.pointers.pop();
    }
    else if (this.trackedPointerIDs[1] !== t[1].identifier) {
        this.trackedPointerIDs[1] = -1;
        this.event.points = 2;
        id = t[1].identifier;
        this.trackedPointerIDs[1] = id;

        this.last2.set(t[1].pageX, t[1].pageY);
        this.velocity2.clear();
        this.delta2.clear();

        Vec2.add(this.last1, this.last2, this.center).scale(0.5);
        this.centerDelta.clear();
        this.centerVelocity.clear();

        Vec2.subtract(this.last2, this.last1, this.diff12);
        this.dist = this.diff12.length();
    }
}

/**
 * Treats a mouseleave event as a gesture end.
 *
 * @method _processMouseLeave
 * @private
 *
 * @return {undefined} undefined
 */
function _processMouseLeave() {
    if (this.event.current) {
        this.event.status = 'end';
        this.event.current = 0;
        this.trackedPointerIDs[0] = -1;
        this.triggerGestures();
        this.event.pointers.pop();
    }
}

module.exports = GestureHandler;

},{"../math/Vec2":49,"../utilities/CallbackStore":94}],4:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

var Position = require('./Position');

/**
 * MountPoint is a component designed to allow for smooth tweening
 * of where on the Node it is attached to the parent.
 *
 * @class MountPoint
 * @augments Position
 *
* @param {Node} node Node that the MountPoint component will be attached to
 */
function MountPoint(node) {
    Position.call(this, node);

    var initial = node.getMountPoint();

    this._x.set(initial[0]);
    this._y.set(initial[1]);
    this._z.set(initial[2]);
}

/**
 * Return the name of the MountPoint component
 *
 * @method
 *
 * @return {String} Name of the component
 */
MountPoint.prototype.toString = function toString() {
    return 'MountPoint';
};

MountPoint.prototype = Object.create(Position.prototype);
MountPoint.prototype.constructor = MountPoint;

/**
 * When the node this component is attached to updates, update the value
 * of the Node's mount point.
 *
 * @method
 *
 * @return {undefined} undefined
 */
MountPoint.prototype.update = function update() {
    this._node.setMountPoint(this._x.get(), this._y.get(), this._z.get());
    this._checkUpdate();
};

MountPoint.prototype.onUpdate = MountPoint.prototype.update;

module.exports = MountPoint;

},{"./Position":7}],5:[function(require,module,exports){
/**
 * The MIT License (MIT)
 * 
 * Copyright (c) 2015 Famous Industries Inc.
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

var Transitionable = require('../transitions/Transitionable');


/**
 * Opacity is a component designed to allow for smooth tweening
 * of the Node's opacity
 *
 * @class Opacity
 *
 * @param {Node} node Node that the Opacity component is attached to
 */
function Opacity(node) {
    this._node = node;
    this._id = node.addComponent(this);
    this._value = new Transitionable(1);

    this._requestingUpdate = false;
}

/**
 * Return the name of the Opacity component
 *
 * @method
 *
 * @return {String} Name of the component
 */
Opacity.prototype.toString = function toString() {
    return 'Opacity';
};

/**
 * Retrieves internal state of Opacity component
 *
 * @method
 *
 * @return {Object} contains component key which holds the stringified constructor 
 * and value key which contains the numeric value
 */
Opacity.prototype.getValue = function getValue() {
    return {
        component: this.toString(),
        value: this._value.get()
    };
};

/**
 * Set the internal state of the Opacity component
 *
 * @method
 *
 * @param {Object} value Object containing the component key, which holds stringified constructor, and a value key, which contains a numeric value used to set opacity if the constructor value matches
 *
 * @return {Boolean} true if set is successful, false otherwise
 */
Opacity.prototype.setValue = function setValue(value) {
    if (this.toString() === value.component) {
        this.set(value.value);
        return true;
    }
    return false;
};

/**
 * Set the opacity of the Node
 *
 * @method
 *
 * @param {Number} value value used to set Opacity
 * @param {Object} transition options for the transition
 * @param {Function} callback to be called following Opacity set completion
 *
 * @return {Opacity} this
 */
Opacity.prototype.set = function set(value, transition, callback) {
    if (!this._requestingUpdate) {
        this._node.requestUpdate(this._id);
        this._requestingUpdate = true;
    }

    this._value.set(value, transition, callback);
    return this;
};

/**
 * Get the current opacity for the component
 *
 * @method
 *
 * @return {Number} opacity as known by the component
 */
Opacity.prototype.get = function get() {
    return this._value.get();
};

/**
 * Stops Opacity transition
 *
 * @method
 *
 * @return {Opacity} this
 */
Opacity.prototype.halt = function halt() {
    this._value.halt();
    return this;
};

/**
 * Tells whether or not the opacity is in a transition
 *
 * @method
 *
 * @return {Boolean} whether or not the opacity is transitioning
 */
Opacity.prototype.isActive = function isActive(){
    return this._value.isActive();
};

/**
 * When the node this component is attached to updates, update the value
 * of the Node's opacity.
 *
 * @method
 *
 * @return {undefined} undefined
 */
Opacity.prototype.update = function update () {
    this._node.setOpacity(this._value.get());
    
    if (this._value.isActive()) {
      this._node.requestUpdateOnNextTick(this._id);
    }
    else {
      this._requestingUpdate = false;
    }
};

Opacity.prototype.onUpdate = Opacity.prototype.update;

module.exports = Opacity;

},{"../transitions/Transitionable":92}],6:[function(require,module,exports){
/**
 * The MIT License (MIT)
 * 
 * Copyright (c) 2015 Famous Industries Inc.
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

var Position = require('./Position');

/**
 * Origin is a component designed to allow for smooth tweening
 * of where on the Node should be considered the origin for rotations and scales.
 *
 * @class Origin
 * @augments Position
 *
 * @param {Node} node Node that the Origin component will be attached to
 */
function Origin(node) {
    Position.call(this, node);

    var initial = node.getOrigin();

    this._x.set(initial[0]);
    this._y.set(initial[1]);
    this._z.set(initial[2]);
}

/**
 * Return the name of the Origin component
 *
 * @method
 *
 * @return {String} Name of the component
 */
Origin.prototype.toString = function toString() {
    return 'Origin';
};

Origin.prototype = Object.create(Position.prototype);
Origin.prototype.constructor = Origin;

/**
 * When the node this component is attached to updates, update the value
 * of the Node's origin
 *
 * @method
 *
 * @return {undefined} undefined
 */
Origin.prototype.update = function update() {
    this._node.setOrigin(this._x.get(), this._y.get(), this._z.get());
    this._checkUpdate();
};

Origin.prototype.onUpdate = Origin.prototype.update;

module.exports = Origin;

},{"./Position":7}],7:[function(require,module,exports){
/**
 * The MIT License (MIT)
 * 
 * Copyright (c) 2015 Famous Industries Inc.
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

var Transitionable = require('../transitions/Transitionable');

/**
 * The Position component serves as a way to tween to translation of a Node.
 *  It is also the base class for the other core components that interact
 * with the Vec3 properties on the Node
 *
 * @class Position
 *
 * @param {Node} node Node that the Position component will be attached to
 */
function Position(node) {
    this._node = node;
    this._id = node.addComponent(this);
  
    this._requestingUpdate = false;
    
    var initialPosition = node.getPosition();

    this._x = new Transitionable(initialPosition[0]);
    this._y = new Transitionable(initialPosition[1]);
    this._z = new Transitionable(initialPosition[2]);
}

/**
 * Return the name of the Position component
 *
 * @method
 *
 * @return {String} Name of the component
 */
Position.prototype.toString = function toString() {
    return 'Position';
};

/**
 * Gets object containing stringified constructor, and corresponding dimensional values
 *
 * @method
 *
 * @return {Object} the internal state of the component
 */
Position.prototype.getValue = function getValue() {
    return {
        component: this.toString(),
        x: this._x.get(),
        y: this._y.get(),
        z: this._z.get()
    };
};

/**
 * Set the translation of the Node
 *
 * @method
 *
 * @param {Object} state Object -- component: stringified constructor, x: number, y: number, z: number
 *
 * @return {Boolean} status of the set
 */
Position.prototype.setValue = function setValue(state) {
    if (this.toString() === state.component) {
        this.set(state.x, state.y, state.z);
        return true;
    }
    return false;
};

/**
 * Getter for X translation
 *
 * @method
 *
 * @return {Number} the Node's translation along its x-axis
 */
Position.prototype.getX = function getX() {
    return this._x.get();
};

/**
 * Getter for Y translation
 *
 * @method
 *
 * @return {Number} the Node's translation along its Y-axis
 */
Position.prototype.getY = function getY() {
    return this._y.get();
};

/**
 * Getter for z translation
 *
 * @method
 *
 * @return {Number} the Node's translation along its z-axis
 */
Position.prototype.getZ = function getZ() {
    return this._z.get();
};

/**
 * Whether or not the Position is currently changing
 *
 * @method
 *
 * @return {Boolean} whether or not the Position is changing the Node's position
 */
Position.prototype.isActive = function isActive() {
    return this._x.isActive() || this._y.isActive() || this._z.isActive();
};

/**
 * Decide whether the component needs to be updated on the next tick.
 *
 * @method
 * @private
 *
 * @return {undefined} undefined
 */
Position.prototype._checkUpdate = function _checkUpdate() {
    if (this.isActive()) this._node.requestUpdateOnNextTick(this._id);
    else this._requestingUpdate = false;
};

/**
 * When the node this component is attached to updates, update the value
 * of the Node's position
 *
 * @method
 *
 * @return {undefined} undefined
 */
Position.prototype.update = function update () {
    this._node.setPosition(this._x.get(), this._y.get(), this._z.get());
    this._checkUpdate();
};

Position.prototype.onUpdate = Position.prototype.update;

/** 
 * Setter for X position
 *
 * @method
 * 
 * @param {Number} val used to set x coordinate
 * @param {Object} transition options for the transition
 * @param {Function} callback function to execute after setting X 
 *
 * @return {Position} this
 */
Position.prototype.setX = function setX(val, transition, callback) {
    if (!this._requestingUpdate) {
        this._node.requestUpdate(this._id);
        this._requestingUpdate = true;
    }

    this._x.set(val, transition, callback);
    return this;
};

/** 
 * Setter for Y position
 *
 * @method
 * 
 * @param {Number} val used to set y coordinate
 * @param {Object} transition options for the transition
 * @param {Function} callback function to execute after setting Y 
 *
 * @return {Position} this
 */
Position.prototype.setY = function setY(val, transition, callback) {
    if (!this._requestingUpdate) {
        this._node.requestUpdate(this._id);
        this._requestingUpdate = true;
    }

    this._y.set(val, transition, callback);
    return this;
};

/** 
 * Setter for Z position
 *
 * @method
 * 
 * @param {Number} val used to set z coordinate
 * @param {Object} transition options for the transition
 * @param {Function} callback function to execute after setting Z 
 *
 * @return {Position} this
 */
Position.prototype.setZ = function setZ(val, transition, callback) {
    if (!this._requestingUpdate) {
        this._node.requestUpdate(this._id);
        this._requestingUpdate = true;
    }

    this._z.set(val, transition, callback);
    return this;
};


/** 
 * Setter for X, Y, and Z positions
 *
 * @method
 * 
 * @param {Number} x used to set x coordinate
 * @param {Number} y used to set y coordinate
 * @param {Number} z used to set z coordinate
 * @param {Object} transition options for the transition
 * @param {Function} callback function to execute after setting X 
 *
 * @return {Position} this
 */
Position.prototype.set = function set(x, y, z, transition, callback) {
    if (!this._requestingUpdate) {
        this._node.requestUpdate(this._id);
        this._requestingUpdate = true;
    }

    var xCallback;
    var yCallback;
    var zCallback;

    if (z != null) {
        zCallback = callback;
    }
    else if (y != null) {
        yCallback = callback;
    }
    else if (x != null) {
        xCallback = callback;
    }

    if (x != null) this._x.set(x, transition, xCallback);
    if (y != null) this._y.set(y, transition, yCallback);
    if (z != null) this._z.set(z, transition, zCallback);

    return this;
};

/**
 * Stops transition of Position component
 *
 * @method
 *
 * @return {Position} this
 */
Position.prototype.halt = function halt() {
    this._x.halt();
    this._y.halt();
    this._z.halt();
    return this;
};

module.exports = Position;

},{"../transitions/Transitionable":92}],8:[function(require,module,exports){
/**
 * The MIT License (MIT)
 * 
 * Copyright (c) 2015 Famous Industries Inc.
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

var Position = require('./Position');

/**
 * Rotation is a component that allows the tweening of a Node's rotation. Rotation
 * happens about a Node's origin which is by default [0, 0, .5].
 *
 * @class Rotation
 * @augments Position
 *
 * @param {Node} node Node that the Rotation component will be attached to
 */
function Rotation(node) {
    Position.call(this, node);

    var initial = node.getRotation();

    var x = initial[0];
    var y = initial[1];
    var z = initial[2];
    var w = initial[3];

    var xx = x * x;
    var yy = y * y;
    var zz = z * z;

    var ty = 2 * (x * z + y * w);
    ty = ty < -1 ? -1 : ty > 1 ? 1 : ty;

    var rx = Math.atan2(2 * (x * w - y * z), 1 - 2 * (xx + yy));
    var ry = Math.asin(ty);
    var rz = Math.atan2(2 * (z * w - x * y), 1 - 2 * (yy + zz));

    this._x.set(rx);
    this._y.set(ry);
    this._z.set(rz);
}

/**
 * Return the name of the Rotation component
 *
 * @method
 *
 * @return {String} Name of the component
 */
Rotation.prototype.toString = function toString() {
    return 'Rotation';
};

Rotation.prototype = Object.create(Position.prototype);
Rotation.prototype.constructor = Rotation;

/**
 * When the node this component is attached to updates, update the value
 * of the Node's rotation
 *
 * @method
 *
 * @return {undefined} undefined
 */
Rotation.prototype.update = function update() {
    this._node.setRotation(this._x.get(), this._y.get(), this._z.get());
    this._checkUpdate();
};

Rotation.prototype.onUpdate = Rotation.prototype.update;

module.exports = Rotation;

},{"./Position":7}],9:[function(require,module,exports){
/**
 * The MIT License (MIT)
 * 
 * Copyright (c) 2015 Famous Industries Inc.
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

var Position = require('./Position');

/**
 * Scale is a component that allows the tweening of a Node's scale. Scale
 * happens about a Node's origin which is by default [0, 0, .5].
 *
 * @class Scale
 * @augments Position
 *
 * @param {Node} node Node that the Scale component will be attached to
 */
function Scale(node) {
    Position.call(this, node);

    this._x.set(1);
    this._y.set(1);
    this._z.set(1);
}

/**
 * Return the name of the Scale component
 *
 * @method
 *
 * @return {String} Name of the component
 */
Scale.prototype.toString = function toString() {
    return 'Scale';
};

Scale.prototype = Object.create(Position.prototype);
Scale.prototype.constructor = Scale;

/**
 * When the node this component is attached to updates, update the value
 * of the Node's scale.
 *
 * @method
 *
 * @return {undefined} undefined
 */
Scale.prototype.update = function update() {
    this._node.setScale(this._x.get(), this._y.get(), this._z.get());
    this._checkUpdate();
};

Scale.prototype.onUpdate = Scale.prototype.update;

module.exports = Scale;

},{"./Position":7}],10:[function(require,module,exports){
/**
 * The MIT License (MIT)
 * 
 * Copyright (c) 2015 Famous Industries Inc.
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

var Transitionable = require('../transitions/Transitionable');
var SizeSystem = require('../core/SizeSystem');

/**
 * Size component used for managing the size of the Node it is attached to.
 * Supports absolute and relative (proportional and differential) sizing.
 *
 * @class Size
 *
 * @param {Node} node Node that the Size component is attached to
 */
function Size(node) {
    this._node = node;
    this._id = node.addComponent(this);
    this._requestingUpdate = false;

    var initialProportionalSize = node.getProportionalSize();
    var initialDifferentialSize = node.getDifferentialSize();
    var initialAbsoluteSize = node.getAbsoluteSize();

    this._proportional = {
        x: new Transitionable(initialProportionalSize[0]),
        y: new Transitionable(initialProportionalSize[1]),
        z: new Transitionable(initialProportionalSize[2])
    };
    this._differential = {
        x: new Transitionable(initialDifferentialSize[0]),
        y: new Transitionable(initialDifferentialSize[1]),
        z: new Transitionable(initialDifferentialSize[2])
    };
    this._absolute = {
        x: new Transitionable(initialAbsoluteSize[0]),
        y: new Transitionable(initialAbsoluteSize[1]),
        z: new Transitionable(initialAbsoluteSize[2])
    };
}

Size.RELATIVE = 0;
Size.ABSOLUTE = 1;
Size.RENDER = 2;
Size.DEFAULT = Size.RELATIVE;

/**
 * Set which mode each axis of Size will have its dimensions
 * calculated by.  Size can be calculated by absolute pixel definitions,
 * relative to its parent, or by the size of its renderables
 *
 * @method
 *
 * @param {Number} x the mode of size for the width
 * @param {Number} y the mode of size for the height
 * @param {Number} z the mode of size for the depth
 *
 * @return {Size} this
 */
Size.prototype.setMode = function setMode(x, y, z) {
    this._node.setSizeMode(x, y, z);
    return this;
};

/**
 * Return the name of the Size component
 *
 * @method
 *
 * @return {String} Name of the component
 */
Size.prototype.toString = function toString() {
    return 'Size';
};

/**
 * @typedef absoluteSizeValue
 * @type {Object}
 * @property {String} type current type of sizing being applied ('absolute')
 * @property {String} component component name ('Size')
 * @property {number} x
 * @property {number} y
 * @property {number} z
 */

/**
 * @typedef relativeSizeValue
 * @type {Object}
 * @property {String} type current type of sizing being applied ('relative')
 * @property {String} component component name ('Size')
 * @property {Object} differential
 * @property {number} differential.x
 * @property {number} differential.y
 * @property {number} differential.z
 * @property {Object} proportional
 * @property {number} proportional.x
 * @property {number} proportional.y
 * @property {number} proportional.z
 */

/**
 * Returns serialized state of the component.
 *
 * @method
 *
 * @return {Object} the internal state of the component
 */
Size.prototype.getValue = function getValue() {
    return {
        sizeMode: SizeSystem.get(this._node.getLocation()).getSizeMode(),
        absolute: {
            x: this._absolute.x.get(),
            y: this._absolute.y.get(),
            z: this._absolute.z.get()
        },
        differential: {
            x: this._differential.x.get(),
            y: this._differential.y.get(),
            z: this._differential.z.get()
        },
        proportional: {
            x: this._proportional.x.get(),
            y: this._proportional.y.get(),
            z: this._proportional.z.get()
        }
    };
};

/**
 * Updates state of component.
 *
 * @method
 *
 * @param {Object} state state encoded in same format as state retrieved through `getValue`
 *
 * @return {Boolean} boolean indicating whether the new state has been applied
 */
Size.prototype.setValue = function setValue(state) {
    if (this.toString() === state.component) {
        this.setMode.apply(this, state.sizeMode);
        if (state.absolute) {
            this.setAbsolute(state.absolute.x, state.absolute.y, state.absolute.z);
        }
        if (state.differential) {
            this.setAbsolute(state.differential.x, state.differential.y, state.differential.z);
        }
        if (state.proportional) {
            this.setAbsolute(state.proportional.x, state.proportional.y, state.proportional.z);
        }
    }
    return false;
};

/**
 * Helper function that grabs the activity of a certain type of size.
 *
 * @method
 * @private
 *
 * @param {Object} type Representation of a type of the sizing model
 *
 * @return {Boolean} boolean indicating whether the new state has been applied
 */
Size.prototype._isActive = function _isActive(type) {
    return type.x.isActive() || type.y.isActive() || type.z.isActive();
};

/**
 * Helper function that grabs the activity of a certain type of size.
 *
 * @method
 *
 * @param {String} type Type of size
 *
 * @return {Boolean} boolean indicating whether the new state has been applied
 */

Size.prototype.isActive = function isActive(){
    return (
        this._isActive(this._absolute) ||
        this._isActive(this._proportional) ||
        this._isActive(this._differential)
    );
};

/**
 * When the node this component is attached to updates, update the value
 * of the Node's size.
 *
 * @method
 *
 * @return {undefined} undefined
 */
Size.prototype.onUpdate = function onUpdate() {
    var abs = this._absolute;
    this._node.setAbsoluteSize(
        abs.x.get(),
        abs.y.get(),
        abs.z.get()
    );
    var prop = this._proportional;
    var diff = this._differential;
    this._node.setProportionalSize(
        prop.x.get(),
        prop.y.get(),
        prop.z.get()
    );
    this._node.setDifferentialSize(
        diff.x.get(),
        diff.y.get(),
        diff.z.get()
    );

    if (this.isActive()) this._node.requestUpdateOnNextTick(this._id);
    else this._requestingUpdate = false;
};


/**
* Applies absolute size.
*
* @method
*
* @param {Number} x used to set absolute size in x-direction (width)
* @param {Number} y used to set absolute size in y-direction (height)
* @param {Number} z used to set absolute size in z-direction (depth)
* @param {Object} options options hash
* @param {Function} callback callback function to be executed after the
*                            transitions have been completed
* @return {Size} this
*/
Size.prototype.setAbsolute = function setAbsolute(x, y, z, options, callback) {
    if (!this._requestingUpdate) {
        this._node.requestUpdate(this._id);
        this._requestingUpdate = true;
    }

    var xCallback;
    var yCallback;
    var zCallback;

    if (z != null) {
        zCallback = callback;
    }
    else if (y != null) {
        yCallback = callback;
    }
    else if (x != null) {
        xCallback = callback;
    }

    var abs = this._absolute;
    if (x != null) {
        abs.x.set(x, options, xCallback);
    }
    if (y != null) {
        abs.y.set(y, options, yCallback);
    }
    if (z != null) {
        abs.z.set(z, options, zCallback);
    }
};

/**
* Applies proportional size.
*
* @method
*
* @param {Number} x used to set proportional size in x-direction (width)
* @param {Number} y used to set proportional size in y-direction (height)
* @param {Number} z used to set proportional size in z-direction (depth)
* @param {Object} options options hash
* @param {Function} callback callback function to be executed after the
*                            transitions have been completed
* @return {Size} this
*/
Size.prototype.setProportional = function setProportional(x, y, z, options, callback) {
    if (!this._requestingUpdate) {
        this._node.requestUpdate(this._id);
        this._requestingUpdate = true;
    }

    var xCallback;
    var yCallback;
    var zCallback;

    if (z != null) {
        zCallback = callback;
    }
    else if (y != null) {
        yCallback = callback;
    }
    else if (x != null) {
        xCallback = callback;
    }

    var prop = this._proportional;
    if (x != null) {
        prop.x.set(x, options, xCallback);
    }
    if (y != null) {
        prop.y.set(y, options, yCallback);
    }
    if (z != null) {
        prop.z.set(z, options, zCallback);
    }
    return this;
};

/**
* Applies differential size to Size component.
*
* @method
*
* @param {Number} x used to set differential size in x-direction (width)
* @param {Number} y used to set differential size in y-direction (height)
* @param {Number} z used to set differential size in z-direction (depth)
* @param {Object} options options hash
* @param {Function} callback callback function to be executed after the
*                            transitions have been completed
* @return {Size} this
*/
Size.prototype.setDifferential = function setDifferential(x, y, z, options, callback) {
    if (!this._requestingUpdate) {
        this._node.requestUpdate(this._id);
        this._requestingUpdate = true;
    }

    var xCallback;
    var yCallback;
    var zCallback;

    if (z != null) {
        zCallback = callback;
    }
    else if (y != null) {
        yCallback = callback;
    }
    else if (x != null) {
        xCallback = callback;
    }

    var diff = this._differential;
    if (x != null) {
        diff.x.set(x, options, xCallback);
    }
    if (y != null) {
        diff.y.set(y, options, yCallback);
    }
    if (z != null) {
        diff.z.set(z, options, zCallback);
    }
    return this;
};

/**
 * Retrieves the computed size applied to the underlying Node.
 *
 * @method
 *
 * @return {Array} size three dimensional computed size
 */
Size.prototype.get = function get () {
    return this._node.getSize();
};

/**
 * Halts all currently active size transitions.
 *
 * @method
 *
 * @return {Size} this
 */
Size.prototype.halt = function halt () {
    this._proportional.x.halt();
    this._proportional.y.halt();
    this._proportional.z.halt();
    this._differential.x.halt();
    this._differential.y.halt();
    this._differential.z.halt();
    this._absolute.x.halt();
    this._absolute.y.halt();
    this._absolute.z.halt();
    return this;
};

module.exports = Size;

},{"../core/SizeSystem":24,"../transitions/Transitionable":92}],11:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

var Transitionable = require('../transitions/Transitionable');
var Quaternion = require('../math/Quaternion');

var Q_REGISTER = new Quaternion();
var Q2_REGISTER = new Quaternion();

function Vec3Transitionable(x, y, z, transform) {
    this._transform = transform;
    this._dirty = false;
    this.x = new Transitionable(x);
    this.y = new Transitionable(y);
    this.z = new Transitionable(z);
    this._values = {x: x, y: y, z: z};
}

Vec3Transitionable.prototype.get = function get() {
    this._values.x = this.x.get();
    this._values.y = this.y.get();
    this._values.z = this.z.get();
    return this._values;
};

Vec3Transitionable.prototype.set = function set(x, y, z, options, callback) {
    if (!this._transform._dirty) {
        this._transform._node.requestUpdate(this._transform._id);
        this._transform._dirty = true;
    }
    this._dirty = true;

    var cbX = null;
    var cbY = null;
    var cbZ = null;

    if (z != null) cbZ = callback;
    else if (y != null) cbY = callback;
    else if (x != null) cbX = callback;

    if (x != null) this.x.set(x, options, cbX);
    if (y != null) this.y.set(y, options, cbY);
    if (z != null) this.z.set(z, options, cbZ);

    return this;
};

Vec3Transitionable.prototype.isActive = function isActive() {
    return this.x.isActive() || this.y.isActive() || this.z.isActive();
};

Vec3Transitionable.prototype.pause = function pause() {
    this.x.pause();
    this.y.pause();
    this.z.pause();
    return this;
};

Vec3Transitionable.prototype.resume = function resume() {
    this.x.resume();
    this.y.resume();
    this.z.resume();
    return this;
};

Vec3Transitionable.prototype.halt = function halt() {
    this.x.halt();
    this.y.halt();
    this.z.halt();
    return this;
};

function QuatTransitionable(x, y, z, w, transform) {
    this._transform = transform;
    this._dirty = false;
    this._t = new Transitionable([x,y,z,w]);
}

QuatTransitionable.prototype.get = function get() {
    return this._t.get();
};


QuatTransitionable.prototype.set = function set(x, y, z, w, options, callback) {
    if (!this._transform._dirty) {
        this._transform._node.requestUpdate(this._transform._id);
        this._transform._dirty = true;
    }
    this._dirty = true;

    options.method = 'slerp';
    this._t.set([x,y,z,w], options, callback);
};


QuatTransitionable.prototype.isActive = function isActive() {
    return this._t.isActive();
};

QuatTransitionable.prototype.pause = function pause() {
    this._t.pause();
    return this;
};

QuatTransitionable.prototype.resume = function resume() {
    this._t.resume();
    return this;
};

QuatTransitionable.prototype.halt = function halt() {
    this._dirty = false;
    this._t.halt();
    return this;
};

function Transform(node) {
    this._node = node;
    this._id = node.addComponent(this);
    this.origin = null;
    this.mountPoint = null;
    this.align = null;
    this.scale = null;
    this.position = null;
    this.rotation = null;

    this._dirty = false;
}

Transform.prototype.toString = function toString() {
    return 'Transform';
};

Transform.prototype.getValue = function getValue() {
    return {
        component: this.toString(),
        origin: this.origin && this.origin.get(),
        mountPoint: this.mountPoint && this.mountPoint.get(),
        align: this.align && this.align.get(),
        scale: this.scale && this.scale.get(),
        position: this.position && this.position.get(),
        rotation: this.rotation && this.rotation.get()
    };
};

Transform.prototype.setState = function setState(state) {
    if (this.toString() === state.component) {
        if (state.origin) {
            this.setOrigin(state.origin.x, state.origin.y, state.origin.z);
        }
        if (state.mountPoint) {
            this.setMountPoint(state.mountPoint.x, state.mountPoint.y, state.mountPoint.z);
        }
        if (state.align) {
            this.setAlign(state.align.x, state.align.y, state.align.z);
        }
        if (state.scale) {
            this.setScale(state.scale.x, state.scale.y, state.scale.z);
        }
        if (state.position) {
            this.setPosition(state.position.x, state.position.y, state.position.z);
        }
        if (state.rotation) {
            this.setRotation(state.rotation.x, state.rotation.y, state.rotation.z, state.rotation.w);
        }
        return true;
    }
    return false;
};

Transform.prototype.setOrigin = function setOrigin(x, y, z, options, callback) {
    if (!this.origin) {
        var v = this._node.getOrigin();
        this.origin = new Vec3Transitionable(v[0], v[1], v[2], this);
    }
    this.origin.set(x, y, z, options, callback);
    return this;
};

Transform.prototype.setMountPoint = function setMountPoint(x, y, z, options, callback) {
    if (!this.mountPoint) {
        var v = this._node.getMountPoint();
        this.mountPoint = new Vec3Transitionable(v[0], v[1], v[2], this);
    }
    this.mountPoint.set(x, y, z, options, callback);
    return this;
};

Transform.prototype.setAlign = function setAlign(x, y, z, options, callback) {
    if (!this.align) {
        var v = this._node.getAlign();
        this.align = new Vec3Transitionable(v[0], v[1], v[2], this);
    }
    this.align.set(x, y, z, options, callback);
    return this;
};

Transform.prototype.setScale = function setScale(x, y, z, options, callback) {
    if (!this.scale) {
        var v = this._node.getScale();
        this.scale = new Vec3Transitionable(v[0], v[1], v[2], this);
    }
    this.scale.set(x, y, z, options, callback);
    return this;
};

Transform.prototype.setPosition = function setPosition(x, y, z, options, callback) {
    if (!this.position) {
        var v = this._node.getPosition();
        this.position = new Vec3Transitionable(v[0], v[1], v[2], this);
    }
    this.position.set(x, y, z, options, callback);
    return this;
};

Transform.prototype.translate = function translate(x, y, z, options, callback) {
    if (!this.position) {
        var v = this._node.getPosition();
        this.position = new Vec3Transitionable(v[0], v[1], v[2], this);
    }
    var p = this.position;
    var xq = p.x._queue;
    var yq = p.y._queue;
    var zq = p.z._queue;
    var xEnd = x == null ? null : x + (xq.length > 0 ? xq[xq.length - 5] : p.x._state);
    var yEnd = y == null ? null : y + (yq.length > 0 ? yq[yq.length - 5] : p.y._state);
    var zEnd = z == null ? null : z + (zq.length > 0 ? zq[zq.length - 5] : p.z._state);
    this.position.set(xEnd, yEnd, zEnd, options, callback);
    return this;
};

Transform.prototype.setRotation = function setRotation(x, y, z, w, options, callback) {
    if (!this.rotation) {
        var v = this._node.getRotation();
        this.rotation = new QuatTransitionable(v[0], v[1], v[2], v[3], this);
    }
    var q = Q_REGISTER;
    if (typeof w === 'number') {
        q.set(w, x, y, z);
    }
    else {
        q.fromEuler(x, y, z);
        callback = options;
        options = w;
    }
    this.rotation.set(q.x, q.y, q.z, q.w, options, callback);
    return this;
};

Transform.prototype.rotate = function rotate(x, y, z, w, options, callback) {
    if (!this.rotation) {
        var v = this._node.getRotation();
        this.rotation = new QuatTransitionable(v[0], v[1], v[2], v[3], this);
    }
    var queue = this.rotation._t._queue;
    var len = queue.length;
    var referenceQ;
    var arr;
    if (len !== 0) arr = queue[len - 5];
    else arr = this.rotation._t._state;
    referenceQ = Q2_REGISTER.set(arr[3], arr[0], arr[1], arr[2]);

    var rotQ = Q_REGISTER;
    if (typeof w === 'number') {
        rotQ.set(w, x, y, z);
    }
    else {
        rotQ.fromEuler(x, y, z);
        callback = options;
        options = w;
    }

    var q = referenceQ.multiply(rotQ);
    this.rotation.set(q.x, q.y, q.z, q.w, options, callback);
    return this;
};

Transform.prototype.clean = function clean() {
    var node = this._node;
    var c;
    var isDirty = false;
    if ((c = this.origin) && c._dirty) {
        node.setOrigin(c.x.get(), c.y.get(), c.z.get());
        c._dirty = c.isActive();
        isDirty = isDirty || c._dirty;
    }
    if ((c = this.mountPoint) && c._dirty) {
        node.setMountPoint(c.x.get(), c.y.get(), c.z.get());
        c._dirty = c.isActive();
        isDirty = isDirty || c._dirty;
    }
    if ((c = this.align) && c._dirty) {
        node.setAlign(c.x.get(), c.y.get(), c.z.get());
        c._dirty = c.isActive();
        isDirty = isDirty || c._dirty;
    }
    if ((c = this.scale) && c._dirty) {
        node.setScale(c.x.get(), c.y.get(), c.z.get());
        c._dirty = c.isActive();
        isDirty = isDirty || c._dirty;
    }
    if ((c = this.position) && c._dirty) {
        node.setPosition(c.x.get(), c.y.get(), c.z.get());
        c._dirty = c.isActive();
        isDirty = isDirty || c._dirty;
    }
    if ((c = this.rotation) && c._dirty) {
        var q = c.get();
        node.setRotation(q[0], q[1], q[2], q[3]);
        c._dirty = c.isActive();
        isDirty = isDirty || c._dirty;
    }
    if (isDirty) this._node.requestUpdateOnNextTick(this._id);
    else this._dirty = false;
};

Transform.prototype.onUpdate = Transform.prototype.clean;

module.exports = Transform;

},{"../math/Quaternion":48,"../transitions/Transitionable":92}],12:[function(require,module,exports){
/**
 * The MIT License (MIT)
 * 
 * Copyright (c) 2015 Famous Industries Inc.
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

module.exports = {
    Align: require('./Align'),
    Camera: require('./Camera'),
    GestureHandler: require('./GestureHandler'),
    MountPoint: require('./MountPoint'),
    Opacity: require('./Opacity'),
    Origin: require('./Origin'),
    Position: require('./Position'),
    Rotation: require('./Rotation'),
    Scale: require('./Scale'),
    Size: require('./Size'),
    Transform: require('./Transform')
};

},{"./Align":1,"./Camera":2,"./GestureHandler":3,"./MountPoint":4,"./Opacity":5,"./Origin":6,"./Position":7,"./Rotation":8,"./Scale":9,"./Size":10,"./Transform":11}],13:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

/**
 * Channels are being used for interacting with the UI Thread when running in
 * a Web Worker or with the UIManager/ Compositor when running in single
 * threaded mode (no Web Worker).
 *
 * @class Channel
 * @constructor
 */
function Channel() {
    if (typeof self !== 'undefined' && self.window !== self) {
        this._enterWorkerMode();
    }
}


/**
 * Called during construction. Subscribes for `message` event and routes all
 * future `sendMessage` messages to the Main Thread ("UI Thread").
 *
 * Primarily used for testing.
 *
 * @method
 *
 * @return {undefined} undefined
 */
Channel.prototype._enterWorkerMode = function _enterWorkerMode() {
    this._workerMode = true;
    var _this = this;
    self.addEventListener('message', function onmessage(ev) {
        _this.onMessage(ev.data);
    });
};

/**
 * Meant to be overridden by `Famous`.
 * Assigned method will be invoked for every received message.
 *
 * @type {Function}
 * @override
 *
 * @return {undefined} undefined
 */
Channel.prototype.onMessage = null;

/**
 * Sends a message to the UIManager.
 *
 * @param  {Any}    message Arbitrary message object.
 *
 * @return {undefined} undefined
 */
Channel.prototype.sendMessage = function sendMessage (message) {
    if (this._workerMode) {
        self.postMessage(message);
    }
    else {
        this.onmessage(message);
    }
};

/**
 * Meant to be overriden by the UIManager when running in the UI Thread.
 * Used for preserving API compatibility with Web Workers.
 * When running in Web Worker mode, this property won't be mutated.
 *
 * Assigned method will be invoked for every message posted by `famous-core`.
 *
 * @type {Function}
 * @override
 */
Channel.prototype.onmessage = null;

/**
 * Sends a message to the manager of this channel (the `Famous` singleton) by
 * invoking `onMessage`.
 * Used for preserving API compatibility with Web Workers.
 *
 * @private
 * @alias onMessage
 *
 * @param {Any} message a message to send over the channel
 *
 * @return {undefined} undefined
 */
Channel.prototype.postMessage = function postMessage(message) {
    return this.onMessage(message);
};

module.exports = Channel;

},{}],14:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

/**
 * Equivalent of an Engine in the Worker Thread. Used to synchronize and manage
 * time across different Threads.
 *
 * @class  Clock
 * @constructor
 * @private
 */
function Clock () {
    this._time = 0;
    this._frame = 0;
    this._timerQueue = [];
    this._updatingIndex = 0;

    this._scale = 1;
    this._scaledTime = this._time;
}

/**
 * Sets the scale at which the clock time is passing.
 * Useful for slow-motion or fast-forward effects.
 *
 * `1` means no time scaling ("realtime"),
 * `2` means the clock time is passing twice as fast,
 * `0.5` means the clock time is passing two times slower than the "actual"
 * time at which the Clock is being updated via `.step`.
 *
 * Initally the clock time is not being scaled (factor `1`).
 *
 * @method  setScale
 * @chainable
 *
 * @param {Number} scale    The scale at which the clock time is passing.
 *
 * @return {Clock} this
 */
Clock.prototype.setScale = function setScale (scale) {
    this._scale = scale;
    return this;
};

/**
 * @method  getScale
 *
 * @return {Number} scale    The scale at which the clock time is passing.
 */
Clock.prototype.getScale = function getScale () {
    return this._scale;
};

/**
 * Updates the internal clock time.
 *
 * @method  step
 * @chainable
 *
 * @param  {Number} time high resolution timestamp used for invoking the
 *                       `update` method on all registered objects
 * @return {Clock}       this
 */
Clock.prototype.step = function step (time) {
    this._frame++;

    this._scaledTime = this._scaledTime + (time - this._time)*this._scale;
    this._time = time;

    for (var i = 0; i < this._timerQueue.length; i++) {
        if (this._timerQueue[i](this._scaledTime)) {
            this._timerQueue.splice(i, 1);
        }
    }
    return this;
};

/**
 * Returns the internal clock time.
 *
 * @method  now
 *
 * @return  {Number} time high resolution timestamp used for invoking the
 *                       `update` method on all registered objects
 */
Clock.prototype.now = function now () {
    return this._scaledTime;
};

/**
 * Returns the internal clock time.
 *
 * @method  getTime
 * @deprecated Use #now instead
 *
 * @return  {Number} time high resolution timestamp used for invoking the
 *                       `update` method on all registered objects
 */
Clock.prototype.getTime = Clock.prototype.now;

/**
 * Returns the number of frames elapsed so far.
 *
 * @method getFrame
 *
 * @return {Number} frames
 */
Clock.prototype.getFrame = function getFrame () {
    return this._frame;
};

/**
 * Wraps a function to be invoked after a certain amount of time.
 * After a set duration has passed, it executes the function and
 * removes it as a listener to 'prerender'.
 *
 * @method setTimeout
 *
 * @param {Function} callback function to be run after a specified duration
 * @param {Number} delay milliseconds from now to execute the function
 *
 * @return {Function} timer function used for Clock#clearTimer
 */
Clock.prototype.setTimeout = function (callback, delay) {
    var params = Array.prototype.slice.call(arguments, 2);
    var startedAt = this._time;
    var timer = function(time) {
        if (time - startedAt >= delay) {
            callback.apply(null, params);
            return true;
        }
        return false;
    };
    this._timerQueue.push(timer);
    return timer;
};


/**
 * Wraps a function to be invoked after a certain amount of time.
 *  After a set duration has passed, it executes the function and
 *  resets the execution time.
 *
 * @method setInterval
 *
 * @param {Function} callback function to be run after a specified duration
 * @param {Number} delay interval to execute function in milliseconds
 *
 * @return {Function} timer function used for Clock#clearTimer
 */
Clock.prototype.setInterval = function setInterval(callback, delay) {
    var params = Array.prototype.slice.call(arguments, 2);
    var startedAt = this._time;
    var timer = function(time) {
        if (time - startedAt >= delay) {
            callback.apply(null, params);
            startedAt = time;
        }
        return false;
    };
    this._timerQueue.push(timer);
    return timer;
};

/**
 * Removes previously via `Clock#setTimeout` or `Clock#setInterval`
 * registered callback function
 *
 * @method clearTimer
 * @chainable
 *
 * @param  {Function} timer  previously by `Clock#setTimeout` or
 *                              `Clock#setInterval` returned callback function
 * @return {Clock}              this
 */
Clock.prototype.clearTimer = function (timer) {
    var index = this._timerQueue.indexOf(timer);
    if (index !== -1) {
        this._timerQueue.splice(index, 1);
    }
    return this;
};

module.exports = Clock;


},{}],15:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

/**
 * An enumeration of the commands in our command queue.
 */
var Commands = {
    INIT_DOM: 0,
    DOM_RENDER_SIZE: 1,
    CHANGE_TRANSFORM: 2,
    CHANGE_SIZE: 3,
    CHANGE_PROPERTY: 4,
    CHANGE_CONTENT: 5,
    CHANGE_ATTRIBUTE: 6,
    ADD_CLASS: 7,
    REMOVE_CLASS: 8,
    SUBSCRIBE: 9,
    GL_SET_DRAW_OPTIONS: 10,
    GL_AMBIENT_LIGHT: 11,
    GL_LIGHT_POSITION: 12,
    GL_LIGHT_COLOR: 13,
    MATERIAL_INPUT: 14,
    GL_SET_GEOMETRY: 15,
    GL_UNIFORMS: 16,
    GL_BUFFER_DATA: 17,
    GL_CUTOUT_STATE: 18,
    GL_MESH_VISIBILITY: 19,
    GL_REMOVE_MESH: 20,
    PINHOLE_PROJECTION: 21,
    ORTHOGRAPHIC_PROJECTION: 22,
    CHANGE_VIEW_TRANSFORM: 23,
    WITH: 24,
    FRAME: 25,
    ENGINE: 26,
    START: 27,
    STOP: 28,
    TIME: 29,
    TRIGGER: 30,
    NEED_SIZE_FOR: 31,
    DOM: 32,
    READY: 33,
    ALLOW_DEFAULT: 34,
    PREVENT_DEFAULT: 35,
    UNSUBSCRIBE: 36,
    prettyPrint: function (buffer, start, count) {
        var callback;
        start = start ? start : 0;
        var data = {
            i: start,
            result: ''
        };
        for (var len = count ? count + start : buffer.length ; data.i < len ; data.i++) {
            callback = commandPrinters[buffer[data.i]];
            if (!callback) throw new Error('PARSE ERROR: no command registered for: ' + buffer[data.i]);
            callback(buffer, data);
        }
        return data.result;
    }
};

var commandPrinters = [];

commandPrinters[Commands.INIT_DOM] = function init_dom (buffer, data) {
    data.result += data.i + '. INIT_DOM\n    tagName: ' + buffer[++data.i] + '\n\n';
};

commandPrinters[Commands.DOM_RENDER_SIZE] = function dom_render_size (buffer, data) {
    data.result += data.i + '. DOM_RENDER_SIZE\n    selector: ' + buffer[++data.i] + '\n\n';
};

commandPrinters[Commands.CHANGE_TRANSFORM] = function change_transform (buffer, data) {
    data.result += data.i + '. CHANGE_TRANSFORM\n    val: [';
    for (var j = 0 ; j < 16 ; j++) data.result += buffer[++data.i] + (j < 15 ? ', ' : '');
    data.result += ']\n\n';
};

commandPrinters[Commands.CHANGE_SIZE] = function change_size (buffer, data) {
    data.result += data.i + '. CHANGE_SIZE\n    x: ' + buffer[++data.i] + ', y: ' + buffer[++data.i] + '\n\n';
};

commandPrinters[Commands.CHANGE_PROPERTY] = function change_property (buffer, data) {
    data.result += data.i + '. CHANGE_PROPERTY\n    key: ' + buffer[++data.i] + ', value: ' + buffer[++data.i] + '\n\n';
};

commandPrinters[Commands.CHANGE_CONTENT] = function change_content (buffer, data) {
    data.result += data.i + '. CHANGE_CONTENT\n    content: ' + buffer[++data.i] + '\n\n';
};

commandPrinters[Commands.CHANGE_ATTRIBUTE] = function change_attribute (buffer, data) {
    data.result += data.i + '. CHANGE_ATTRIBUTE\n    key: ' + buffer[++data.i] + ', value: ' + buffer[++data.i] + '\n\n';
};

commandPrinters[Commands.ADD_CLASS] = function add_class (buffer, data) {
    data.result += data.i + '. ADD_CLASS\n    className: ' + buffer[++data.i] + '\n\n';
};

commandPrinters[Commands.REMOVE_CLASS] = function remove_class (buffer, data) {
    data.result += data.i + '. REMOVE_CLASS\n    className: ' + buffer[++data.i] + '\n\n';
};

commandPrinters[Commands.SUBSCRIBE] = function subscribe (buffer, data) {
    data.result += data.i + '. SUBSCRIBE\n    event: ' + buffer[++data.i] + '\n\n';
};

commandPrinters[Commands.GL_SET_DRAW_OPTIONS] = function gl_set_draw_options (buffer, data) {
    data.result += data.i + '. GL_SET_DRAW_OPTIONS\n    options: ' + buffer[++data.i] + '\n\n';
};

commandPrinters[Commands.GL_AMBIENT_LIGHT] = function gl_ambient_light (buffer, data) {
    data.result += data.i + '. GL_AMBIENT_LIGHT\n    r: ' + buffer[++data.i] + 'g: ' + buffer[++data.i] + 'b: ' + buffer[++data.i] + '\n\n';
};

commandPrinters[Commands.GL_LIGHT_POSITION] = function gl_light_position (buffer, data) {
    data.result += data.i + '. GL_LIGHT_POSITION\n    x: ' + buffer[++data.i] + 'y: ' + buffer[++data.i] + 'z: ' + buffer[++data.i] + '\n\n';
};

commandPrinters[Commands.GL_LIGHT_COLOR] = function gl_light_color (buffer, data) {
    data.result += data.i + '. GL_LIGHT_COLOR\n    r: ' + buffer[++data.i] + 'g: ' + buffer[++data.i] + 'b: ' + buffer[++data.i] + '\n\n';
};

commandPrinters[Commands.MATERIAL_INPUT] = function material_input (buffer, data) {
    data.result += data.i + '. MATERIAL_INPUT\n    key: ' + buffer[++data.i] + ', value: ' + buffer[++data.i] + '\n\n';
};

commandPrinters[Commands.GL_SET_GEOMETRY] = function gl_set_geometry (buffer, data) {
    data.result += data.i + '. GL_SET_GEOMETRY\n   x: ' + buffer[++data.i] + ', y: ' + buffer[++data.i] + ', z: ' + buffer[++data.i] + '\n\n';
};

commandPrinters[Commands.GL_UNIFORMS] = function gl_uniforms (buffer, data) {
    data.result += data.i + '. GL_UNIFORMS\n    key: ' + buffer[++data.i] + ', value: ' + buffer[++data.i] + '\n\n';
};

commandPrinters[Commands.GL_BUFFER_DATA] = function gl_buffer_data (buffer, data) {
    data.result += data.i + '. GL_BUFFER_DATA\n    data: ';
    for (var i = 0; i < 5 ; i++) data.result += buffer[++data.i] + ', ';
    data.result += '\n\n';
};

commandPrinters[Commands.GL_CUTOUT_STATE] = function gl_cutout_state (buffer, data) {
    data.result += data.i + '. GL_CUTOUT_STATE\n    state: ' + buffer[++data.i] + '\n\n';
};

commandPrinters[Commands.GL_MESH_VISIBILITY] = function gl_mesh_visibility (buffer, data) {
    data.result += data.i + '. GL_MESH_VISIBILITY\n    visibility: ' + buffer[++data.i] + '\n\n';
};

commandPrinters[Commands.GL_REMOVE_MESH] = function gl_remove_mesh (buffer, data) {
    data.result += data.i + '. GL_REMOVE_MESH\n\n';
};

commandPrinters[Commands.PINHOLE_PROJECTION] = function pinhole_projection (buffer, data) {
    data.result += data.i + '. PINHOLE_PROJECTION\n    depth: ' + buffer[++data.i] + '\n\n';
};

commandPrinters[Commands.ORTHOGRAPHIC_PROJECTION] = function orthographic_projection (buffer, data) {
    data.result += data.i + '. ORTHOGRAPHIC_PROJECTION\n';
};

commandPrinters[Commands.CHANGE_VIEW_TRANSFORM] = function change_view_transform (buffer, data) {
    data.result += data.i + '. CHANGE_VIEW_TRANSFORM\n   value: [';
    for (var i = 0; i < 16 ; i++) data.result += buffer[++data.i] + (i < 15 ? ', ' : '');
    data.result += ']\n\n';
};

commandPrinters[Commands.PREVENT_DEFAULT] = function prevent_default (buffer, data) {
    data.result += data.i + '. PREVENT_DEFAULT\n    value: ' + buffer[++data.i] + '\n\n';
};

commandPrinters[Commands.ALLOW_DEFAULT] = function allow_default (buffer, data) {
    data.result += data.i + '. ALLOW_DEFAULT\n    value: ' + buffer[++data.i] + '\n\n';
};

commandPrinters[Commands.READY] = function ready (buffer, data) {
    data.result += data.i + '. READY\n\n';
};

commandPrinters[Commands.WITH] = function w (buffer, data) {
    data.result += data.i + '. **WITH**\n     path: ' + buffer[++data.i] + '\n\n';
};

commandPrinters[Commands.TIME] = function time (buffer, data) {
    data.result += data.i + '. TIME\n     ms: ' + buffer[++data.i] + '\n\n';
};

commandPrinters[Commands.NEED_SIZE_FOR] = function need_size_for (buffer, data) {
    data.result += data.i + '. NEED_SIZE_FOR\n    selector: ' + buffer[++data.i] + '\n\n';
};

module.exports = Commands;


},{}],16:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

var Event = require('./Event');
var PathUtils = require('./Path');

/**
 * The Dispatch class is used to propogate events down the
 * scene graph.
 *
 * @class Dispatch
 * @param {Scene} context The context on which it operates
 * @constructor
 */
function Dispatch () {
    this._nodes = {}; // a container for constant time lookup of nodes

    this._queue = []; // The queue is used for two purposes
                      // 1. It is used to list indicies in the
                      //    Nodes path which are then used to lookup
                      //    a node in the scene graph.
                      // 2. It is used to assist dispatching
                      //    such that it is possible to do a breadth first
                      //    traversal of the scene graph.
}

/**
 * Protected method that sets the updater for the dispatch. The updater will
 * almost certainly be the FamousEngine class.
 *
 * @method
 * @protected
 *
 * @param {FamousEngine} updater The updater which will be passed through the scene graph
 *
 * @return {undefined} undefined
 */
Dispatch.prototype._setUpdater = function _setUpdater (updater) {
    this._updater = updater;

    for (var key in this._nodes) this._nodes[key]._setUpdater(updater);
};

/**
 * Enque the children of a node within the dispatcher. Does not clear
 * the dispatchers queue first.
 *
 * @method addChildrenToQueue
 * @return {void}
 *
 * @param {Node} node from which to add children to the queue
 */
Dispatch.prototype.addChildrenToQueue = function addChildrenToQueue (node) {
    var children = node.getChildren();
    var child;
    for (var i = 0, len = children.length ; i < len ; i++) {
        child = children[i];
        if (child) this._queue.push(child);
    }
};

/**
 * Returns the next item in the Dispatch's queue.
 *
 * @method next
 * @return {Node} next node in the queue
 */
Dispatch.prototype.next = function next () {
    return this._queue.shift();
};

/**
 * Returns the next node in the queue, but also adds its children to
 * the end of the queue. Continually calling this method will result
 * in a breadth first traversal of the render tree.
 *
 * @method breadthFirstNext
 * @return {Node | undefined} the next node in the traversal if one exists
 */
Dispatch.prototype.breadthFirstNext = function breadthFirstNext () {
    var child = this._queue.shift();
    if (!child) return void 0;
    this.addChildrenToQueue(child);
    return child;
};

/**
 * Calls the onMount method for the node at a given path and
 * properly registers all of that nodes children to their proper
 * paths. Throws if that path doesn't have a node registered as
 * a parent or if there is no node registered at that path.
 *
 * @method mount
 *
 * @param {String} path at which to begin mounting
 * @param {Node} node the node that was mounted
 *
 * @return {void}
 */
Dispatch.prototype.mount = function mount (path, node) {
    if (!node) throw new Error('Dispatch: no node passed to mount at: ' + path);
    if (this._nodes[path])
        throw new Error('Dispatch: there is a node already registered at: ' + path);

    node._setUpdater(this._updater);
    this._nodes[path] = node;
    var parentPath = PathUtils.parent(path);

    // scenes are their own parents
    var parent = !parentPath ? node : this._nodes[parentPath];

    if (!parent)
        throw new Error(
                'Parent to path: ' + path +
                ' doesn\'t exist at expected path: ' + parentPath
        );

    var children = node.getChildren();
    var components = node.getComponents();
    var i;
    var len;

    if (parent.isMounted()) node._setMounted(true, path);
    if (parent.isShown()) node._setShown(true);

    if (parent.isMounted()) {
        node._setParent(parent);
        if (node.onMount) node.onMount(path);

        for (i = 0, len = components.length ; i < len ; i++)
            if (components[i] && components[i].onMount)
                components[i].onMount(node, i);

        for (i = 0, len = children.length ; i < len ; i++)
            if (children[i] && children[i].mount) children[i].mount(path + '/' + i);
            else if (children[i]) this.mount(path + '/' + i, children[i]);
    }

    if (parent.isShown()) {
        if (node.onShow) node.onShow();
        for (i = 0, len = components.length ; i < len ; i++)
            if (components[i] && components[i].onShow)
                components[i].onShow();
    }
};

/**
 * Calls the onDismount method for the node at a given path
 * and deregisters all of that nodes children. Throws if there
 * is no node registered at that path.
 *
 * @method dismount
 * @return {void}
 *
 * @param {String} path at which to begin dismounting
 */
Dispatch.prototype.dismount = function dismount (path) {
    var node = this._nodes[path];

    if (!node)
        throw new Error(
                'No node registered to path: ' + path
        );

    var children = node.getChildren();
    var components = node.getComponents();
    var i;
    var len;

    if (node.isShown()) {
        node._setShown(false);
        if (node.onHide) node.onHide();
        for (i = 0, len = components.length ; i < len ; i++)
            if (components[i] && components[i].onHide)
                components[i].onHide();
    }

    if (node.isMounted()) {
        if (node.onDismount) node.onDismount(path);

        for (i = 0, len = children.length ; i < len ; i++)
            if (children[i] && children[i].dismount) children[i].dismount();
            else if (children[i]) this.dismount(path + '/' + i);

        for (i = 0, len = components.length ; i < len ; i++)
            if (components[i] && components[i].onDismount)
                components[i].onDismount();

        node._setMounted(false);
        node._setParent(null);
    }

    this._nodes[path] = null;
};

/**
 * Returns a the node registered to the given path, or none
 * if no node exists at that path.
 *
 * @method getNode
 * @return {Node | void} node at the given path
 *
 * @param {String} path at which to look up the node
 */
Dispatch.prototype.getNode = function getNode (path) {
    return this._nodes[path];
};

/**
 * Issues the onShow method to the node registered at the given path,
 * and shows the entire subtree below that node. Throws if no node
 * is registered to this path.
 *
 * @method show
 * @return {void}
 *
 * @param {String} path the path of the node to show
 */
Dispatch.prototype.show = function show (path) {
    var node = this._nodes[path];

    if (!node)
        throw new Error(
                'No node registered to path: ' + path
        );

    if (node.onShow) node.onShow();

    var components = node.getComponents();
    for (var i = 0, len = components.length ; i < len ; i++)
        if (components[i] && components[i].onShow)
            components[i].onShow();


    this.addChildrenToQueue(node);
    var child;

    while ((child = this.breadthFirstNext()))
        this.show(child.getLocation());

};

/**
 * Issues the onHide method to the node registered at the given path,
 * and hides the entire subtree below that node. Throws if no node
 * is registered to this path.
 *
 * @method hide
 * @return {void}
 *
 * @param {String} path the path of the node to hide
 */
Dispatch.prototype.hide = function hide (path) {
    var node = this._nodes[path];

    if (!node)
        throw new Error(
                'No node registered to path: ' + path
        );

    if (node.onHide) node.onHide();

    var components = node.getComponents();
    for (var i = 0, len = components.length ; i < len ; i++)
        if (components[i] && components[i].onHide)
            components[i].onHide();


    this.addChildrenToQueue(node);
    var child;

    while ((child = this.breadthFirstNext()))
        this.hide(child.getLocation());

};

/**
 * lookupNode takes a path and returns the node at the location specified
 * by the path, if one exists. If not, it returns undefined.
 *
 * @param {String} location The location of the node specified by its path
 *
 * @return {Node | undefined} The node at the requested path
 */
Dispatch.prototype.lookupNode = function lookupNode (location) {
    if (!location) throw new Error('lookupNode must be called with a path');

    this._queue.length = 0;
    var path = this._queue;

    _splitTo(location, path);

    for (var i = 0, len = path.length ; i < len ; i++)
        path[i] = this._nodes[path[i]];

    return path[path.length - 1];
};

/**
 * dispatch takes an event name and a payload and dispatches it to the
 * entire scene graph below the node that the dispatcher is on. The nodes
 * receive the events in a breadth first traversal, meaning that parents
 * have the opportunity to react to the event before children.
 *
 * @param {String} path path of the node to send the event to
 * @param {String} event name of the event
 * @param {Any} payload data associated with the event
 *
 * @return {undefined} undefined
 */
Dispatch.prototype.dispatch = function dispatch (path, event, payload) {
    if (!path) throw new Error('dispatch requires a path as it\'s first argument');
    if (!event) throw new Error('dispatch requires an event name as it\'s second argument');

    var node = this._nodes[path];

    if (!node) return;

    this.addChildrenToQueue(node);
    var child;

    while ((child = this.breadthFirstNext()))
        if (child && child.onReceive)
            child.onReceive(event, payload);

};

/**
 * dispatchUIevent takes a path, an event name, and a payload and dispatches them in
 * a manner anologous to DOM bubbling. It first traverses down to the node specified at
 * the path. That node receives the event first, and then every ancestor receives the event
 * until the context.
 *
 * @param {String} path the path of the node
 * @param {String} event the event name
 * @param {Any} payload the payload
 *
 * @return {undefined} undefined
 */
Dispatch.prototype.dispatchUIEvent = function dispatchUIEvent (path, event, payload) {
    if (!path) throw new Error('dispatchUIEvent needs a valid path to dispatch to');
    if (!event) throw new Error('dispatchUIEvent needs an event name as its second argument');
    var node;

    Event.call(payload);
    node = this.getNode(path);
    if (node) {
        var parent;
        var components;
        var i;
        var len;

        payload.node = node;

        while (node) {
            if (node.onReceive) node.onReceive(event, payload);
            components = node.getComponents();

            for (i = 0, len = components.length ; i < len ; i++)
                if (components[i] && components[i].onReceive)
                    components[i].onReceive(event, payload);

            if (payload.propagationStopped) break;
            parent = node.getParent();
            if (parent === node) return;
            node = parent;
        }
    }
};

/**
 * _splitTo is a private method which takes a path and splits it at every '/'
 * pushing the result into the supplied array. This is a destructive change.
 *
 * @private
 * @param {String} string the specified path
 * @param {Array} target the array to which the result should be written
 *
 * @return {Array} the target after having been written to
 */
function _splitTo (string, target) {
    target.length = 0; // clears the array first.
    var last = 0;
    var i;
    var len = string.length;

    for (i = 0 ; i < len ; i++) {
        if (string[i] === '/') {
            target.push(string.substring(last, i));
            last = i + 1;
        }
    }

    if (i - last > 0) target.push(string.substring(last, i));

    return target;
}

module.exports = new Dispatch();

},{"./Event":17,"./Path":20}],17:[function(require,module,exports){
/**
 * The MIT License (MIT)
 * 
 * Copyright (c) 2015 Famous Industries Inc.
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

/**
 * The Event class adds the stopPropagation functionality
 * to the UIEvents within the scene graph.
 *
 * @constructor Event
 */
function Event () {
    this.propagationStopped = false;
    this.stopPropagation = stopPropagation;
}

/**
 * stopPropagation ends the bubbling of the event in the
 * scene graph.
 *
 * @method stopPropagation
 *
 * @return {undefined} undefined
 */
function stopPropagation () {
    this.propagationStopped = true;
}

module.exports = Event;


},{}],18:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

var Clock = require('./Clock');
var Scene = require('./Scene');
var Channel = require('./Channel');
var Dispatch = require('./Dispatch');
var UIManager = require('../renderers/UIManager');
var Compositor = require('../renderers/Compositor');
var RequestAnimationFrameLoop = require('../render-loops/RequestAnimationFrameLoop');
var TransformSystem = require('./TransformSystem');
var SizeSystem = require('./SizeSystem');
var Commands = require('./Commands');

var ENGINE_START = [Commands.ENGINE, Commands.START];
var ENGINE_STOP = [Commands.ENGINE, Commands.STOP];
var TIME_UPDATE = [Commands.TIME, null];

/**
 * Famous has two responsibilities, one to act as the highest level
 * updater and another to send messages over to the renderers. It is
 * a singleton.
 *
 * @class FamousEngine
 * @constructor
 */
function FamousEngine() {
    var _this = this;

    Dispatch._setUpdater(this);

    this._updateQueue = []; // The updateQueue is a place where nodes
                            // can place themselves in order to be
                            // updated on the frame.

    this._nextUpdateQueue = []; // the nextUpdateQueue is used to queue
                                // updates for the next tick.
                                // this prevents infinite loops where during
                                // an update a node continuously puts itself
                                // back in the update queue.

    this._scenes = {}; // a hash of all of the scenes's that the FamousEngine
                         // is responsible for.

    this._messages = TIME_UPDATE;   // a queue of all of the draw commands to
                                    // send to the the renderers this frame.

    this._inUpdate = false; // when the famous is updating this is true.
                            // all requests for updates will get put in the
                            // nextUpdateQueue

    this._clock = new Clock(); // a clock to keep track of time for the scene
                               // graph.


    this._channel = new Channel();
    this._channel.onMessage = function (message) {
        _this.handleMessage(message);
    };
}


/**
 * An init script that initializes the FamousEngine with options
 * or default parameters.
 *
 * @method
 *
 * @param {Object} options a set of options containing a compositor and a render loop
 *
 * @return {FamousEngine} this
 */
FamousEngine.prototype.init = function init(options) {
    if (typeof window === 'undefined') {
        throw new Error(
            'FamousEngine#init needs to have access to the global window object. ' +
            'Instantiate Compositor and UIManager manually in the UI thread.'
        );
    }
    this.compositor = options && options.compositor || new Compositor();
    this.renderLoop = options && options.renderLoop || new RequestAnimationFrameLoop();
    this.uiManager = new UIManager(this.getChannel(), this.compositor, this.renderLoop);
    return this;
};

/**
 * Sets the channel that the engine will use to communicate to
 * the renderers.
 *
 * @method
 *
 * @param {Channel} channel     The channel to be used for communicating with
 *                              the `UIManager`/ `Compositor`.
 *
 * @return {FamousEngine} this
 */
FamousEngine.prototype.setChannel = function setChannel(channel) {
    this._channel = channel;
    return this;
};

/**
 * Returns the channel that the engine is currently using
 * to communicate with the renderers.
 *
 * @method
 *
 * @return {Channel} channel    The channel to be used for communicating with
 *                              the `UIManager`/ `Compositor`.
 */
FamousEngine.prototype.getChannel = function getChannel () {
    return this._channel;
};

/**
 * _update is the body of the update loop. The frame consists of
 * pulling in appending the nextUpdateQueue to the currentUpdate queue
 * then moving through the updateQueue and calling onUpdate with the current
 * time on all nodes. While _update is called _inUpdate is set to true and
 * all requests to be placed in the update queue will be forwarded to the
 * nextUpdateQueue.
 *
 * @method
 *
 * @return {undefined} undefined
 */
FamousEngine.prototype._update = function _update () {
    this._inUpdate = true;
    var time = this._clock.now();
    var nextQueue = this._nextUpdateQueue;
    var queue = this._updateQueue;
    var item;

    this._messages[1] = time;

    SizeSystem.update();
    TransformSystem.update();

    while (nextQueue.length) queue.unshift(nextQueue.pop());

    while (queue.length) {
        item = queue.shift();
        if (item && item.update) item.update(time);
        if (item && item.onUpdate) item.onUpdate(time);
    }

    this._inUpdate = false;
};

/**
 * requestUpdates takes a class that has an onUpdate method and puts it
 * into the updateQueue to be updated at the next frame.
 * If FamousEngine is currently in an update, requestUpdate
 * passes its argument to requestUpdateOnNextTick.
 *
 * @method
 *
 * @param {Object} requester an object with an onUpdate method
 *
 * @return {undefined} undefined
 */
FamousEngine.prototype.requestUpdate = function requestUpdate (requester) {
    if (!requester)
        throw new Error(
            'requestUpdate must be called with a class to be updated'
        );

    if (this._inUpdate) this.requestUpdateOnNextTick(requester);
    else this._updateQueue.push(requester);
};

/**
 * requestUpdateOnNextTick is requests an update on the next frame.
 * If FamousEngine is not currently in an update than it is functionally equivalent
 * to requestUpdate. This method should be used to prevent infinite loops where
 * a class is updated on the frame but needs to be updated again next frame.
 *
 * @method
 *
 * @param {Object} requester an object with an onUpdate method
 *
 * @return {undefined} undefined
 */
FamousEngine.prototype.requestUpdateOnNextTick = function requestUpdateOnNextTick (requester) {
    this._nextUpdateQueue.push(requester);
};

/**
 * postMessage sends a message queue into FamousEngine to be processed.
 * These messages will be interpreted and sent into the scene graph
 * as events if necessary.
 *
 * @method
 *
 * @param {Array} messages an array of commands.
 *
 * @return {FamousEngine} this
 */
FamousEngine.prototype.handleMessage = function handleMessage (messages) {
    if (!messages)
        throw new Error(
            'onMessage must be called with an array of messages'
        );

    var command;

    while (messages.length > 0) {
        command = messages.shift();
        switch (command) {
            case Commands.WITH:
                this.handleWith(messages);
                break;
            case Commands.FRAME:
                this.handleFrame(messages);
                break;
            default:
                throw new Error('received unknown command: ' + command);
        }
    }
    return this;
};

/**
 * handleWith is a method that takes an array of messages following the
 * WITH command. It'll then issue the next commands to the path specified
 * by the WITH command.
 *
 * @method
 *
 * @param {Array} messages array of messages.
 *
 * @return {FamousEngine} this
 */
FamousEngine.prototype.handleWith = function handleWith (messages) {
    var path = messages.shift();
    var command = messages.shift();
    switch (command) {
        case Commands.TRIGGER: // the TRIGGER command sends a UIEvent to the specified path
            var type = messages.shift();
            var ev = messages.shift();
            Dispatch.dispatchUIEvent(path, type, ev);
            break;
        default:
            throw new Error('received unknown command: ' + command);
    }
    return this;
};

/**
 * handleFrame is called when the renderers issue a FRAME command to
 * FamousEngine. FamousEngine will then step updating the scene graph to the current time.
 *
 * @method
 *
 * @param {Array} messages array of messages.
 *
 * @return {FamousEngine} this
 */
FamousEngine.prototype.handleFrame = function handleFrame (messages) {
    if (!messages) throw new Error('handleFrame must be called with an array of messages');
    if (!messages.length) throw new Error('FRAME must be sent with a time');

    this.step(messages.shift());
    return this;
};

/**
 * step updates the clock and the scene graph and then sends the draw commands
 * that accumulated in the update to the renderers.
 *
 * @method
 *
 * @param {Number} time current engine time
 *
 * @return {FamousEngine} this
 */
FamousEngine.prototype.step = function step (time) {
    if (time == null) throw new Error('step must be called with a time');

    this._clock.step(time);
    this._update();

    if (this._messages.length) {
        this._channel.sendMessage(this._messages);
        while (this._messages.length > 2) this._messages.pop();
    }

    return this;
};

/**
 * returns the context of a particular path. The context is looked up by the selector
 * portion of the path and is listed from the start of the string to the first
 * '/'.
 *
 * @method
 *
 * @param {String} selector the path to look up the context for.
 *
 * @return {Context | Undefined} the context if found, else undefined.
 */
FamousEngine.prototype.getContext = function getContext (selector) {
    if (!selector) throw new Error('getContext must be called with a selector');

    var index = selector.indexOf('/');
    selector = index === -1 ? selector : selector.substring(0, index);

    return this._scenes[selector];
};

/**
 * Returns the instance of clock used by the FamousEngine.
 *
 * @method
 *
 * @return {Clock} FamousEngine's clock
 */
FamousEngine.prototype.getClock = function getClock () {
    return this._clock;
};

/**
 * Enqueues a message to be transfered to the renderers.
 *
 * @method
 *
 * @param {Any} command Draw Command
 *
 * @return {FamousEngine} this
 */
FamousEngine.prototype.message = function message (command) {
    this._messages.push(command);
    return this;
};

/**
 * Creates a scene under which a scene graph could be built.
 *
 * @method
 *
 * @param {String} selector a dom selector for where the scene should be placed
 *
 * @return {Scene} a new instance of Scene.
 */
FamousEngine.prototype.createScene = function createScene (selector) {
    selector = selector || 'body';

    if (this._scenes[selector]) this._scenes[selector].dismount();
    this._scenes[selector] = new Scene(selector, this);
    return this._scenes[selector];
};

/**
 * Introduce an already instantiated scene to the engine.
 *
 * @method
 *
 * @param {Scene} scene the scene to reintroduce to the engine
 *
 * @return {FamousEngine} this
 */
FamousEngine.prototype.addScene = function addScene (scene) {
    var selector = scene._selector;

    var current = this._scenes[selector];
    if (current && current !== scene) current.dismount();
    if (!scene.isMounted()) scene.mount(scene.getSelector());
    this._scenes[selector] = scene;
    return this;
};

/**
 * Remove a scene.
 *
 * @method
 *
 * @param {Scene} scene the scene to remove from the engine
 *
 * @return {FamousEngine} this
 */
FamousEngine.prototype.removeScene = function removeScene (scene) {
    var selector = scene._selector;

    var current = this._scenes[selector];
    if (current && current === scene) {
        if (scene.isMounted()) scene.dismount();
        delete this._scenes[selector];
    }
    return this;
};

/**
 * Starts the engine running in the Main-Thread.
 * This effects **every** updateable managed by the Engine.
 *
 * @method
 *
 * @return {FamousEngine} this
 */
FamousEngine.prototype.startRenderLoop = function startRenderLoop() {
    this._channel.sendMessage(ENGINE_START);
    return this;
};

/**
 * Stops the engine running in the Main-Thread.
 * This effects **every** updateable managed by the Engine.
 *
 * @method
 *
 * @return {FamousEngine} this
 */
FamousEngine.prototype.stopRenderLoop = function stopRenderLoop() {
    this._channel.sendMessage(ENGINE_STOP);
    return this;
};

/**
 * @method
 * @deprecated Use {@link FamousEngine#startRenderLoop} instead!
 *
 * @return {FamousEngine} this
 */
FamousEngine.prototype.startEngine = function startEngine() {
    console.warn(
        'FamousEngine.startEngine is deprecated! Use ' +
        'FamousEngine.startRenderLoop instead!'
    );
    return this.startRenderLoop();
};

/**
 * @method
 * @deprecated Use {@link FamousEngine#stopRenderLoop} instead!
 *
 * @return {FamousEngine} this
 */
FamousEngine.prototype.stopEngine = function stopEngine() {
    console.warn(
        'FamousEngine.stopEngine is deprecated! Use ' +
        'FamousEngine.stopRenderLoop instead!'
    );
    return this.stopRenderLoop();
};

module.exports = new FamousEngine();

},{"../render-loops/RequestAnimationFrameLoop":83,"../renderers/Compositor":86,"../renderers/UIManager":88,"./Channel":13,"./Clock":14,"./Commands":15,"./Dispatch":16,"./Scene":22,"./SizeSystem":24,"./TransformSystem":26}],19:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

/*jshint -W079 */

'use strict';

var SizeSystem = require('./SizeSystem');
var Dispatch = require('./Dispatch');
var TransformSystem = require('./TransformSystem');
var Size = require('./Size');
var Transform = require('./Transform');

/**
 * Nodes define hierarchy and geometrical transformations. They can be moved
 * (translated), scaled and rotated.
 *
 * A Node is either mounted or unmounted. Unmounted nodes are detached from the
 * scene graph. Unmounted nodes have no parent node, while each mounted node has
 * exactly one parent. Nodes have an arbitrary number of children, which can be
 * dynamically added using {@link Node#addChild}.
 *
 * Each Node has an arbitrary number of `components`. Those components can
 * send `draw` commands to the renderer or mutate the node itself, in which case
 * they define behavior in the most explicit way. Components that send `draw`
 * commands are considered `renderables`. From the node's perspective, there is
 * no distinction between nodes that send draw commands and nodes that define
 * behavior.
 *
 * Because of the fact that Nodes themself are very unopinioted (they don't
 * "render" to anything), they are often being subclassed in order to add e.g.
 * components at initialization to them. Because of this flexibility, they might
 * as well have been called `Entities`.
 *
 * @example
 * // create three detached (unmounted) nodes
 * var parent = new Node();
 * var child1 = new Node();
 * var child2 = new Node();
 *
 * // build an unmounted subtree (parent is still detached)
 * parent.addChild(child1);
 * parent.addChild(child2);
 *
 * // mount parent by adding it to the context
 * var context = Famous.createContext("body");
 * context.addChild(parent);
 *
 * @class Node
 * @constructor
 */
function Node () {
    this._requestingUpdate = false;
    this._inUpdate = false;
    this._mounted = false;
    this._shown = true;
    this._updater = null;
    this._opacity = 1;
    this._UIEvents = [];

    this._updateQueue = [];
    this._nextUpdateQueue = [];

    this._freedComponentIndicies = [];
    this._components = [];

    this._freedChildIndicies = [];
    this._children = [];

    this._fullChildren = [];

    this._parent = null;

    this._id = null;

    this._transformID = null;
    this._sizeID = null;

    if (!this.constructor.NO_DEFAULT_COMPONENTS) this._init();
}

Node.RELATIVE_SIZE = 0;
Node.ABSOLUTE_SIZE = 1;
Node.RENDER_SIZE = 2;
Node.DEFAULT_SIZE = 0;
Node.NO_DEFAULT_COMPONENTS = false;

/**
 * Protected method. Initializes a node with a default Transform and Size component
 *
 * @method
 * @protected
 *
 * @return {undefined} undefined
 */
Node.prototype._init = function _init () {
    this._transformID = this.addComponent(new Transform());
    this._sizeID = this.addComponent(new Size());
};

/**
 * Protected method. Sets the parent of this node such that it can be looked up.
 *
 * @method
 *
 * @param {Node} parent The node to set as the parent of this
 *
 * @return {undefined} undefined;
 */
Node.prototype._setParent = function _setParent (parent) {
    if (this._parent && this._parent.getChildren().indexOf(this) !== -1) {
        this._parent.removeChild(this);
    }
    this._parent = parent;
};

/**
 * Protected method. Sets the mount state of the node. Should only be called
 * by the dispatch
 *
 * @method
 *
 * @param {Boolean} mounted whether or not the Node is mounted.
 * @param {String} path The path that the node will be mounted to
 *
 * @return {undefined} undefined
 */
Node.prototype._setMounted = function _setMounted (mounted, path) {
    this._mounted = mounted;
    this._id = path ? path : null;
};

/**
 * Protected method, sets whether or not the Node is shown. Should only
 * be called by the dispatch
 *
 * @method
 *
 * @param {Boolean} shown whether or not the node is shown
 *
 * @return {undefined} undefined
 */
Node.prototype._setShown = function _setShown (shown) {
    this._shown = shown;
};

/**
 * Protected method. Sets the updater of the node.
 *
 * @method
 *
 * @param {FamousEngine} updater the Updater of the node.
 *
 * @return {undefined} undefined
 */
Node.prototype._setUpdater = function _setUpdater (updater) {
    this._updater = updater;
    if (this._requestingUpdate) this._updater.requestUpdate(this);
};

/**
 * Determine the node's location in the scene graph hierarchy.
 * A location of `body/0/1` can be interpreted as the following scene graph
 * hierarchy (ignoring siblings of ancestors and additional child nodes):
 *
 * `Context:body` -> `Node:0` -> `Node:1`, where `Node:1` is the node the
 * `getLocation` method has been invoked on.
 *
 * @method getLocation
 *
 * @return {String} location (path), e.g. `body/0/1`
 */
Node.prototype.getLocation = function getLocation () {
    return this._id;
};

/**
 * @alias getId
 *
 * @return {String} the path of the Node
 */
Node.prototype.getId = Node.prototype.getLocation;

/**
 * Dispatches the event using the Dispatch. All descendent nodes will
 * receive the dispatched event.
 *
 * @method emit
 *
 * @param  {String} event   Event type.
 * @param  {Object} payload Event object to be dispatched.
 *
 * @return {Node} this
 */
Node.prototype.emit = function emit (event, payload) {
    Dispatch.dispatch(this.getLocation(), event, payload);
    return this;
};

// THIS WILL BE DEPRECATED
Node.prototype.sendDrawCommand = function sendDrawCommand (message) {
    this._updater.message(message);
    return this;
};

/**
 * Recursively serializes the Node, including all previously added components.
 *
 * @method getValue
 *
 * @return {Object}     Serialized representation of the node, including
 *                      components.
 */
Node.prototype.getValue = function getValue () {
    var numberOfChildren = this._children.length;
    var numberOfComponents = this._components.length;
    var i = 0;

    var value = {
        location: this.getId(),
        spec: {
            location: this.getId(),
            showState: {
                mounted: this.isMounted(),
                shown: this.isShown(),
                opacity: this.getOpacity() || null
            },
            offsets: {
                mountPoint: [0, 0, 0],
                align: [0, 0, 0],
                origin: [0, 0, 0]
            },
            vectors: {
                position: [0, 0, 0],
                rotation: [0, 0, 0, 1],
                scale: [1, 1, 1]
            },
            size: {
                sizeMode: [0, 0, 0],
                proportional: [1, 1, 1],
                differential: [0, 0, 0],
                absolute: [0, 0, 0],
                render: [0, 0, 0]
            }
        },
        UIEvents: this._UIEvents,
        components: [],
        children: []
    };

    if (value.location) {
        var transform = TransformSystem.get(this.getId());
        var size = SizeSystem.get(this.getId());

        for (i = 0 ; i < 3 ; i++) {
            value.spec.offsets.mountPoint[i] = transform.offsets.mountPoint[i];
            value.spec.offsets.align[i] = transform.offsets.align[i];
            value.spec.offsets.origin[i] = transform.offsets.origin[i];
            value.spec.vectors.position[i] = transform.vectors.position[i];
            value.spec.vectors.rotation[i] = transform.vectors.rotation[i];
            value.spec.vectors.scale[i] = transform.vectors.scale[i];
            value.spec.size.sizeMode[i] = size.sizeMode[i];
            value.spec.size.proportional[i] = size.proportionalSize[i];
            value.spec.size.differential[i] = size.differentialSize[i];
            value.spec.size.absolute[i] = size.absoluteSize[i];
            value.spec.size.render[i] = size.renderSize[i];
        }

        value.spec.vectors.rotation[3] = transform.vectors.rotation[3];
    }

    for (i = 0; i < numberOfChildren ; i++)
        if (this._children[i] && this._children[i].getValue)
            value.children.push(this._children[i].getValue());

    for (i = 0 ; i < numberOfComponents ; i++)
        if (this._components[i] && this._components[i].getValue)
            value.components.push(this._components[i].getValue());

    return value;
};

/**
 * Similar to {@link Node#getValue}, but returns the actual "computed" value. E.g.
 * a proportional size of 0.5 might resolve into a "computed" size of 200px
 * (assuming the parent has a width of 400px).
 *
 * @method getComputedValue
 *
 * @return {Object}     Serialized representation of the node, including
 *                      children, excluding components.
 */
Node.prototype.getComputedValue = function getComputedValue () {
    console.warn('Node.getComputedValue is depricated. Use Node.getValue instead');
    var numberOfChildren = this._children.length;

    var value = {
        location: this.getId(),
        computedValues: {
            transform: this.isMounted() ? TransformSystem.get(this.getLocation()).getLocalTransform() : null,
            size: this.isMounted() ? SizeSystem.get(this.getLocation()).get() : null
        },
        children: []
    };

    for (var i = 0 ; i < numberOfChildren ; i++)
        if (this._children[i] && this._children[i].getComputedValue)
            value.children.push(this._children[i].getComputedValue());

    return value;
};

/**
 * Retrieves all children of the current node.
 *
 * @method getChildren
 *
 * @return {Array.<Node>}   An array of children.
 */
Node.prototype.getChildren = function getChildren () {
    return this._fullChildren;
};

/**
 * Method used internally to retrieve the children of a node. Each index in the
 * returned array represents a path fragment.
 *
 * @method getRawChildren
 * @private
 *
 * @return {Array}  An array of children. Might contain `null` elements.
 */
Node.prototype.getRawChildren = function getRawChildren() {
    return this._children;
};

/**
 * Retrieves the parent of the current node. Unmounted nodes do not have a
 * parent node.
 *
 * @method getParent
 *
 * @return {Node}       Parent node.
 */
Node.prototype.getParent = function getParent () {
    return this._parent;
};

/**
 * Schedules the {@link Node#update} function of the node to be invoked on the
 * next frame (if no update during this frame has been scheduled already).
 * If the node is currently being updated (which means one of the requesters
 * invoked requestsUpdate while being updated itself), an update will be
 * scheduled on the next frame.
 *
 * @method requestUpdate
 *
 * @param  {Object} requester   If the requester has an `onUpdate` method, it
 *                              will be invoked during the next update phase of
 *                              the node.
 *
 * @return {Node} this
 */
Node.prototype.requestUpdate = function requestUpdate (requester) {
    if (this._inUpdate || !this.isMounted())
        return this.requestUpdateOnNextTick(requester);
    if (this._updateQueue.indexOf(requester) === -1) {
        this._updateQueue.push(requester);
        if (!this._requestingUpdate) this._requestUpdate();
    }
    return this;
};

/**
 * Schedules an update on the next tick. Similarily to
 * {@link Node#requestUpdate}, `requestUpdateOnNextTick` schedules the node's
 * `onUpdate` function to be invoked on the frame after the next invocation on
 * the node's onUpdate function.
 *
 * @method requestUpdateOnNextTick
 *
 * @param  {Object} requester   If the requester has an `onUpdate` method, it
 *                              will be invoked during the next update phase of
 *                              the node.
 *
 * @return {Node} this
 */
Node.prototype.requestUpdateOnNextTick = function requestUpdateOnNextTick (requester) {
    if (this._nextUpdateQueue.indexOf(requester) === -1)
        this._nextUpdateQueue.push(requester);
    return this;
};

/**
 * Checks if the node is mounted. Unmounted nodes are detached from the scene
 * graph.
 *
 * @method isMounted
 *
 * @return {Boolean}    Boolean indicating whether the node is mounted or not.
 */
Node.prototype.isMounted = function isMounted () {
    return this._mounted;
};

/**
 * Checks if the node is being rendered. A node is being rendererd when it is
 * mounted to a parent node **and** shown.
 *
 * @method isRendered
 *
 * @return {Boolean}    Boolean indicating whether the node is rendered or not.
 */
Node.prototype.isRendered = function isRendered () {
    return this._mounted && this._shown;
};

/**
 * Checks if the node is visible ("shown").
 *
 * @method isShown
 *
 * @return {Boolean}    Boolean indicating whether the node is visible
 *                      ("shown") or not.
 */
Node.prototype.isShown = function isShown () {
    return this._shown;
};

/**
 * Determines the node's relative opacity.
 * The opacity needs to be within [0, 1], where 0 indicates a completely
 * transparent, therefore invisible node, whereas an opacity of 1 means the
 * node is completely solid.
 *
 * @method getOpacity
 *
 * @return {Number}         Relative opacity of the node.
 */
Node.prototype.getOpacity = function getOpacity () {
    return this._opacity;
};

/**
 * Determines the node's previously set mount point.
 *
 * @method getMountPoint
 *
 * @return {Float32Array}   An array representing the mount point.
 */
Node.prototype.getMountPoint = function getMountPoint () {
    if (!this.constructor.NO_DEFAULT_COMPONENTS)
        return this.getComponent(this._transformID).getMountPoint();
    else if (this.isMounted())
        return TransformSystem.get(this.getLocation()).getMountPoint();
    else throw new Error('This node does not have access to a transform component');
};

/**
 * Determines the node's previously set align.
 *
 * @method getAlign
 *
 * @return {Float32Array}   An array representing the align.
 */
Node.prototype.getAlign = function getAlign () {
    if (!this.constructor.NO_DEFAULT_COMPONENTS)
        return this.getComponent(this._transformID).getAlign();
    else if (this.isMounted())
        return TransformSystem.get(this.getLocation()).getAlign();
    else throw new Error('This node does not have access to a transform component');
};

/**
 * Determines the node's previously set origin.
 *
 * @method getOrigin
 *
 * @return {Float32Array}   An array representing the origin.
 */
Node.prototype.getOrigin = function getOrigin () {
    if (!this.constructor.NO_DEFAULT_COMPONENTS)
        return this.getComponent(this._transformID).getOrigin();
    else if (this.isMounted())
        return TransformSystem.get(this.getLocation()).getOrigin();
    else throw new Error('This node does not have access to a transform component');
};

/**
 * Determines the node's previously set position.
 *
 * @method getPosition
 *
 * @return {Float32Array}   An array representing the position.
 */
Node.prototype.getPosition = function getPosition () {
    if (!this.constructor.NO_DEFAULT_COMPONENTS)
        return this.getComponent(this._transformID).getPosition();
    else if (this.isMounted())
        return TransformSystem.get(this.getLocation()).getPosition();
    else throw new Error('This node does not have access to a transform component');
};

/**
 * Returns the node's current rotation
 *
 * @method getRotation
 *
 * @return {Float32Array} an array of four values, showing the rotation as a quaternion
 */
Node.prototype.getRotation = function getRotation () {
    if (!this.constructor.NO_DEFAULT_COMPONENTS)
        return this.getComponent(this._transformID).getRotation();
    else if (this.isMounted())
        return TransformSystem.get(this.getLocation()).getRotation();
    else throw new Error('This node does not have access to a transform component');
};

/**
 * Returns the scale of the node
 *
 * @method
 *
 * @return {Float32Array} an array showing the current scale vector
 */
Node.prototype.getScale = function getScale () {
    if (!this.constructor.NO_DEFAULT_COMPONENTS)
        return this.getComponent(this._transformID).getScale();
    else if (this.isMounted())
        return TransformSystem.get(this.getLocation()).getScale();
    else throw new Error('This node does not have access to a transform component');
};

/**
 * Returns the current size mode of the node
 *
 * @method
 *
 * @return {Float32Array} an array of numbers showing the current size mode
 */
Node.prototype.getSizeMode = function getSizeMode () {
    if (!this.constructor.NO_DEFAULT_COMPONENTS)
        return this.getComponent(this._sizeID).getSizeMode();
    else if (this.isMounted())
        return SizeSystem.get(this.getLocation()).getSizeMode();
    else throw new Error('This node does not have access to a size component');
};

/**
 * Returns the current proportional size
 *
 * @method
 *
 * @return {Float32Array} a vector 3 showing the current proportional size
 */
Node.prototype.getProportionalSize = function getProportionalSize () {
    if (!this.constructor.NO_DEFAULT_COMPONENTS)
        return this.getComponent(this._sizeID).getProportional();
    else if (this.isMounted())
        return SizeSystem.get(this.getLocation()).getProportional();
    else throw new Error('This node does not have access to a size component');
};

/**
 * Returns the differential size of the node
 *
 * @method
 *
 * @return {Float32Array} a vector 3 showing the current differential size
 */
Node.prototype.getDifferentialSize = function getDifferentialSize () {
    if (!this.constructor.NO_DEFAULT_COMPONENTS)
        return this.getComponent(this._sizeID).getDifferential();
    else if (this.isMounted())
        return SizeSystem.get(this.getLocation()).getDifferential();
    else throw new Error('This node does not have access to a size component');
};

/**
 * Returns the absolute size of the node
 *
 * @method
 *
 * @return {Float32Array} a vector 3 showing the current absolute size of the node
 */
Node.prototype.getAbsoluteSize = function getAbsoluteSize () {
    if (!this.constructor.NO_DEFAULT_COMPONENTS)
        return this.getComponent(this._sizeID).getAbsolute();
    else if (this.isMounted())
        return SizeSystem.get(this.getLocation()).getAbsolute();
    else throw new Error('This node does not have access to a size component');
};

/**
 * Returns the current Render Size of the node. Note that the render size
 * is asynchronous (will always be one frame behind) and needs to be explicitely
 * calculated by setting the proper size mode.
 *
 * @method
 *
 * @return {Float32Array} a vector 3 showing the current render size
 */
Node.prototype.getRenderSize = function getRenderSize () {
    if (!this.constructor.NO_DEFAULT_COMPONENTS)
        return this.getComponent(this._sizeID).getRender();
    else if (this.isMounted())
        return SizeSystem.get(this.getLocation()).getRender();
    else throw new Error('This node does not have access to a size component');
};

/**
 * Returns the external size of the node
 *
 * @method
 *
 * @return {Float32Array} a vector 3 of the final calculated side of the node
 */
Node.prototype.getSize = function getSize () {
    if (!this.constructor.NO_DEFAULT_COMPONENTS)
        return this.getComponent(this._sizeID).get();
    else if (this.isMounted())
        return SizeSystem.get(this.getLocation()).get();
    else throw new Error('This node does not have access to a size component');
};

/**
 * Returns the current world transform of the node
 *
 * @method
 *
 * @return {Float32Array} a 16 value transform
 */
Node.prototype.getTransform = function getTransform () {
    return TransformSystem.get(this.getLocation());
};

/**
 * Get the list of the UI Events that are currently associated with this node
 *
 * @method
 *
 * @return {Array} an array of strings representing the current subscribed UI event of this node
 */
Node.prototype.getUIEvents = function getUIEvents () {
    return this._UIEvents;
};

/**
 * Adds a new child to this node. If this method is called with no argument it will
 * create a new node, however it can also be called with an existing node which it will
 * append to the node that this method is being called on. Returns the new or passed in node.
 *
 * @method
 *
 * @param {Node | void} child the node to appended or no node to create a new node.
 *
 * @return {Node} the appended node.
 */
Node.prototype.addChild = function addChild (child) {
    var index = child ? this._children.indexOf(child) : -1;
    child = child ? child : new Node();

    if (index === -1) {
        index = this._freedChildIndicies.length ?
                this._freedChildIndicies.pop() : this._children.length;

        this._children[index] = child;
        this._fullChildren.push(child);
    }

    if (this.isMounted())
        child.mount(this.getLocation() + '/' + index);

    return child;
};

/**
 * Removes a child node from another node. The passed in node must be
 * a child of the node that this method is called upon.
 *
 * @method
 *
 * @param {Node} child node to be removed
 *
 * @return {Boolean} whether or not the node was successfully removed
 */
Node.prototype.removeChild = function removeChild (child) {
    var index = this._children.indexOf(child);

    if (index > - 1) {
        this._freedChildIndicies.push(index);

        this._children[index] = null;

        if (child.isMounted()) child.dismount();

        var fullChildrenIndex = this._fullChildren.indexOf(child);
        var len = this._fullChildren.length;
        var i = 0;

        for (i = fullChildrenIndex; i < len-1; i++)
            this._fullChildren[i] = this._fullChildren[i + 1];

        this._fullChildren.pop();

        return true;
    }
    else {
        return false;
    }
};

/**
 * Each component can only be added once per node.
 *
 * @method addComponent
 *
 * @param {Object} component    A component to be added.
 * @return {Number} index       The index at which the component has been
 *                              registered. Indices aren't necessarily
 *                              consecutive.
 */
Node.prototype.addComponent = function addComponent (component) {
    var index = this._components.indexOf(component);
    if (index === -1) {
        index = this._freedComponentIndicies.length ? this._freedComponentIndicies.pop() : this._components.length;
        this._components[index] = component;

        if (this.isMounted() && component.onMount)
            component.onMount(this, index);

        if (this.isShown() && component.onShow)
            component.onShow();
    }

    return index;
};

/**
 * @method  getComponent
 *
 * @param  {Number} index   Index at which the component has been registered
 *                          (using `Node#addComponent`).
 * @return {*}              The component registered at the passed in index (if
 *                          any).
 */
Node.prototype.getComponent = function getComponent (index) {
    return this._components[index];
};

/**
 * Removes a previously via {@link Node#addComponent} added component.
 *
 * @method removeComponent
 *
 * @param  {Object} component   An component that has previously been added
 *                              using {@link Node#addComponent}.
 *
 * @return {Node} this
 */
Node.prototype.removeComponent = function removeComponent (component) {
    var index = this._components.indexOf(component);
    if (index !== -1) {
        this._freedComponentIndicies.push(index);
        if (this.isShown() && component.onHide)
            component.onHide();

        if (this.isMounted() && component.onDismount)
            component.onDismount();

        this._components[index] = null;
    }
    return component;
};

/**
 * Removes a node's subscription to a particular UIEvent. All components
 * on the node will have the opportunity to remove all listeners depending
 * on this event.
 *
 * @method
 *
 * @param {String} eventName the name of the event
 *
 * @return {undefined} undefined
 */
Node.prototype.removeUIEvent = function removeUIEvent (eventName) {
    var UIEvents = this.getUIEvents();
    var components = this._components;
    var component;

    var index = UIEvents.indexOf(eventName);
    if (index !== -1) {
        UIEvents.splice(index, 1);
        for (var i = 0, len = components.length ; i < len ; i++) {
            component = components[i];
            if (component && component.onRemoveUIEvent) component.onRemoveUIEvent(eventName);
        }
    }
};

/**
 * Subscribes a node to a UI Event. All components on the node
 * will have the opportunity to begin listening to that event
 * and alerting the scene graph.
 *
 * @method
 *
 * @param {String} eventName the name of the event
 *
 * @return {Node} this
 */
Node.prototype.addUIEvent = function addUIEvent (eventName) {
    var UIEvents = this.getUIEvents();
    var components = this._components;
    var component;

    var added = UIEvents.indexOf(eventName) !== -1;
    if (!added) {
        UIEvents.push(eventName);
        for (var i = 0, len = components.length ; i < len ; i++) {
            component = components[i];
            if (component && component.onAddUIEvent) component.onAddUIEvent(eventName);
        }
    }

    return this;
};

/**
 * Private method for the Node to request an update for itself.
 *
 * @method
 * @private
 *
 * @param {Boolean} force whether or not to force the update
 *
 * @return {undefined} undefined
 */
Node.prototype._requestUpdate = function _requestUpdate (force) {
    if (force || !this._requestingUpdate) {
        if (this._updater)
            this._updater.requestUpdate(this);
        this._requestingUpdate = true;
    }
};

/**
 * Private method to set an optional value in an array, and
 * request an update if this changes the value of the array.
 *
 * @method
 *
 * @param {Array} vec the array to insert the value into
 * @param {Number} index the index at which to insert the value
 * @param {Any} val the value to potentially insert (if not null or undefined)
 *
 * @return {Boolean} whether or not a new value was inserted.
 */
Node.prototype._vecOptionalSet = function _vecOptionalSet (vec, index, val) {
    if (val != null && vec[index] !== val) {
        vec[index] = val;
        if (!this._requestingUpdate) this._requestUpdate();
        return true;
    }
    return false;
};

/**
 * Shows the node, which is to say, calls onShow on all of the
 * node's components. Renderable components can then issue the
 * draw commands necessary to be shown.
 *
 * @method
 *
 * @return {Node} this
 */
Node.prototype.show = function show () {
    Dispatch.show(this.getLocation());
    this._shown = true;
    return this;
};

/**
 * Hides the node, which is to say, calls onHide on all of the
 * node's components. Renderable components can then issue
 * the draw commands necessary to be hidden
 *
 * @method
 *
 * @return {Node} this
 */
Node.prototype.hide = function hide () {
    Dispatch.hide(this.getLocation());
    this._shown = false;
    return this;
};

/**
 * Sets the align value of the node. Will call onAlignChange
 * on all of the Node's components.
 *
 * @method
 *
 * @param {Number} x Align value in the x dimension.
 * @param {Number} y Align value in the y dimension.
 * @param {Number} z Align value in the z dimension.
 *
 * @return {Node} this
 */
Node.prototype.setAlign = function setAlign (x, y, z) {
    if (!this.constructor.NO_DEFAULT_COMPONENTS)
        this.getComponent(this._transformID).setAlign(x, y, z);
    else if (this.isMounted())
        TransformSystem.get(this.getLocation()).setAlign(x, y, z);
    else throw new Error('This node does not have access to a transform component');
    return this;
};

/**
 * Sets the mount point value of the node. Will call onMountPointChange
 * on all of the node's components.
 *
 * @method
 *
 * @param {Number} x MountPoint value in x dimension
 * @param {Number} y MountPoint value in y dimension
 * @param {Number} z MountPoint value in z dimension
 *
 * @return {Node} this
 */
Node.prototype.setMountPoint = function setMountPoint (x, y, z) {
    if (!this.constructor.NO_DEFAULT_COMPONENTS)
        this.getComponent(this._transformID).setMountPoint(x, y, z);
    else if (this.isMounted())
        TransformSystem.get(this.getLocation()).setMountPoint(x, y, z);
    else throw new Error('This node does not have access to a transform component');
    return this;
};

/**
 * Sets the origin value of the node. Will call onOriginChange
 * on all of the node's components.
 *
 * @method
 *
 * @param {Number} x Origin value in x dimension
 * @param {Number} y Origin value in y dimension
 * @param {Number} z Origin value in z dimension
 *
 * @return {Node} this
 */
Node.prototype.setOrigin = function setOrigin (x, y, z) {
    if (!this.constructor.NO_DEFAULT_COMPONENTS)
        this.getComponent(this._transformID).setOrigin(x, y, z);
    else if (this.isMounted())
        TransformSystem.get(this.getLocation()).setOrigin(x, y, z);
    else throw new Error('This node does not have access to a transform component');
    return this;
};

/**
 * Sets the position of the node. Will call onPositionChange
 * on all of the node's components.
 *
 * @method
 *
 * @param {Number} x Position in x
 * @param {Number} y Position in y
 * @param {Number} z Position in z
 *
 * @return {Node} this
 */
Node.prototype.setPosition = function setPosition (x, y, z) {
    if (!this.constructor.NO_DEFAULT_COMPONENTS)
        this.getComponent(this._transformID).setPosition(x, y, z);
    else if (this.isMounted())
        TransformSystem.get(this.getLocation()).setPosition(x, y, z);
    else throw new Error('This node does not have access to a transform component');
    return this;
};

/**
 * Sets the rotation of the node. Will call onRotationChange
 * on all of the node's components. This method takes either
 * Euler angles or a quaternion. If the fourth argument is undefined
 * Euler angles are assumed.
 *
 * @method
 *
 * @param {Number} x Either the rotation around the x axis or the magnitude in x of the axis of rotation.
 * @param {Number} y Either the rotation around the y axis or the magnitude in y of the axis of rotation.
 * @param {Number} z Either the rotation around the z axis or the magnitude in z of the axis of rotation.
 * @param {Number|undefined} w the amount of rotation around the axis of rotation, if a quaternion is specified.
 *
 * @return {Node} this
 */
Node.prototype.setRotation = function setRotation (x, y, z, w) {
    if (!this.constructor.NO_DEFAULT_COMPONENTS)
        this.getComponent(this._transformID).setRotation(x, y, z, w);
    else if (this.isMounted())
        TransformSystem.get(this.getLocation()).setRotation(x, y, z, w);
    else throw new Error('This node does not have access to a transform component');
    return this;
};

/**
 * Sets the scale of the node. The default value is 1 in all dimensions.
 * The node's components will have onScaleChanged called on them.
 *
 * @method
 *
 * @param {Number} x Scale value in x
 * @param {Number} y Scale value in y
 * @param {Number} z Scale value in z
 *
 * @return {Node} this
 */
Node.prototype.setScale = function setScale (x, y, z) {
    if (!this.constructor.NO_DEFAULT_COMPONENTS)
        this.getComponent(this._transformID).setScale(x, y, z);
    else if (this.isMounted())
        TransformSystem.get(this.getLocation()).setScale(x, y, z);
    else throw new Error('This node does not have access to a transform component');
    return this;
};

/**
 * Sets the value of the opacity of this node. All of the node's
 * components will have onOpacityChange called on them/
 *
 * @method
 *
 * @param {Number} val Value of the opacity. 1 is the default.
 *
 * @return {Node} this
 */
Node.prototype.setOpacity = function setOpacity (val) {
    if (val !== this._opacity) {
        this._opacity = val;
        if (!this._requestingUpdate) this._requestUpdate();

        var i = 0;
        var list = this._components;
        var len = list.length;
        var item;
        for (; i < len ; i++) {
            item = list[i];
            if (item && item.onOpacityChange) item.onOpacityChange(val);
        }
    }
    return this;
};

/**
 * Sets the size mode being used for determining the node's final width, height
 * and depth.
 * Size modes are a way to define the way the node's size is being calculated.
 * Size modes are enums set on the {@link Size} constructor (and aliased on
 * the Node).
 *
 * @example
 * node.setSizeMode(Node.RELATIVE_SIZE, Node.ABSOLUTE_SIZE, Node.ABSOLUTE_SIZE);
 * // Instead of null, any proportional height or depth can be passed in, since
 * // it would be ignored in any case.
 * node.setProportionalSize(0.5, null, null);
 * node.setAbsoluteSize(null, 100, 200);
 *
 * @method setSizeMode
 *
 * @param {SizeMode} x    The size mode being used for determining the size in
 *                        x direction ("width").
 * @param {SizeMode} y    The size mode being used for determining the size in
 *                        y direction ("height").
 * @param {SizeMode} z    The size mode being used for determining the size in
 *                        z direction ("depth").
 *
 * @return {Node} this
 */
Node.prototype.setSizeMode = function setSizeMode (x, y, z) {
    if (!this.constructor.NO_DEFAULT_COMPONENTS)
        this.getComponent(this._sizeID).setSizeMode(x, y, z);
    else if (this.isMounted())
        SizeSystem.get(this.getLocation()).setSizeMode(x, y, z);
    else throw new Error('This node does not have access to a size component');
    return this;
};

/**
 * A proportional size defines the node's dimensions relative to its parents
 * final size.
 * Proportional sizes need to be within the range of [0, 1].
 *
 * @method setProportionalSize
 *
 * @param {Number} x    x-Size in pixels ("width").
 * @param {Number} y    y-Size in pixels ("height").
 * @param {Number} z    z-Size in pixels ("depth").
 *
 * @return {Node} this
 */
Node.prototype.setProportionalSize = function setProportionalSize (x, y, z) {
    if (!this.constructor.NO_DEFAULT_COMPONENTS)
        this.getComponent(this._sizeID).setProportional(x, y, z);
    else if (this.isMounted())
        SizeSystem.get(this.getLocation()).setProportional(x, y, z);
    else throw new Error('This node does not have access to a size component');
    return this;
};

/**
 * Differential sizing can be used to add or subtract an absolute size from an
 * otherwise proportionally sized node.
 * E.g. a differential width of `-10` and a proportional width of `0.5` is
 * being interpreted as setting the node's size to 50% of its parent's width
 * *minus* 10 pixels.
 *
 * @method setDifferentialSize
 *
 * @param {Number} x    x-Size to be added to the relatively sized node in
 *                      pixels ("width").
 * @param {Number} y    y-Size to be added to the relatively sized node in
 *                      pixels ("height").
 * @param {Number} z    z-Size to be added to the relatively sized node in
 *                      pixels ("depth").
 *
 * @return {Node} this
 */
Node.prototype.setDifferentialSize = function setDifferentialSize (x, y, z) {
    if (!this.constructor.NO_DEFAULT_COMPONENTS)
        this.getComponent(this._sizeID).setDifferential(x, y, z);
    else if (this.isMounted())
        SizeSystem.get(this.getLocation()).setDifferential(x, y, z);
    else throw new Error('This node does not have access to a size component');
    return this;
};

/**
 * Sets the node's size in pixels, independent of its parent.
 *
 * @method setAbsoluteSize
 *
 * @param {Number} x x-Size in pixels ("width").
 * @param {Number} y y-Size in pixels ("height").
 * @param {Number} z z-Size in pixels ("depth").
 *
 * @return {Node} this
 */
Node.prototype.setAbsoluteSize = function setAbsoluteSize (x, y, z) {
    if (!this.constructor.NO_DEFAULT_COMPONENTS)
        this.getComponent(this._sizeID).setAbsolute(x, y, z);
    else if (this.isMounted())
        SizeSystem.get(this.getLocation()).setAbsolute(x, y, z);
    else throw new Error('This node does not have access to a size component');
    return this;
};

/**
 * Method for getting the current frame. Will be deprecated.
 *
 * @method
 *
 * @return {Number} current frame
 */
Node.prototype.getFrame = function getFrame () {
    return this._updater.getFrame();
};

/**
 * returns an array of the components currently attached to this
 * node.
 *
 * @method getComponents
 *
 * @return {Array} list of components.
 */
Node.prototype.getComponents = function getComponents () {
    return this._components;
};

/**
 * Enters the node's update phase while updating its own spec and updating its components.
 *
 * @method update
 *
 * @param  {Number} time    high-resolution timestamp, usually retrieved using
 *                          requestAnimationFrame
 *
 * @return {Node} this
 */
Node.prototype.update = function update (time){
    this._inUpdate = true;
    var nextQueue = this._nextUpdateQueue;
    var queue = this._updateQueue;
    var item;

    while (nextQueue.length) queue.unshift(nextQueue.pop());

    while (queue.length) {
        item = this._components[queue.shift()];
        if (item && item.onUpdate) item.onUpdate(time);
    }

    this._inUpdate = false;
    this._requestingUpdate = false;

    if (!this.isMounted()) {
        // last update
        this._parent = null;
        this._id = null;
    }
    else if (this._nextUpdateQueue.length) {
        this._updater.requestUpdateOnNextTick(this);
        this._requestingUpdate = true;
    }
    return this;
};

/**
 * Mounts the node and therefore its subtree by setting it as a child of the
 * passed in parent.
 *
 * @method mount
 *
 * @param  {String} path unique path of node (e.g. `body/0/1`)
 *
 * @return {Node} this
 */
Node.prototype.mount = function mount (path) {
    if (this.isMounted())
        throw new Error('Node is already mounted at: ' + this.getLocation());

    if (!this.constructor.NO_DEFAULT_COMPONENTS){
        TransformSystem.registerTransformAtPath(path, this.getComponent(this._transformID));
        SizeSystem.registerSizeAtPath(path, this.getComponent(this._sizeID));
    }
    else {
        TransformSystem.registerTransformAtPath(path);
        SizeSystem.registerSizeAtPath(path);
    }
    Dispatch.mount(path, this);

    if (!this._requestingUpdate) this._requestUpdate();
    return this;

};

/**
 * Dismounts (detaches) the node from the scene graph by removing it as a
 * child of its parent.
 *
 * @method
 *
 * @return {Node} this
 */
Node.prototype.dismount = function dismount () {
    if (!this.isMounted())
        throw new Error('Node is not mounted');

    var path = this.getLocation();

    TransformSystem.deregisterTransformAtPath(path);
    SizeSystem.deregisterSizeAtPath(path);
    Dispatch.dismount(path);

    if (!this._requestingUpdate) this._requestUpdate();
};

module.exports = Node;

},{"./Dispatch":16,"./Size":23,"./SizeSystem":24,"./Transform":25,"./TransformSystem":26}],20:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

/**
 * A collection of utilities for handling paths.
 *
 * @namespace
 */
var Path = {

    /**
     * determines if the passed in path has a trailing slash. Paths of the form
     * 'body/0/1/' return true, while paths of the form 'body/0/1' return false.
     *
     * @method
     *
     * @param {String} path the path
     *
     * @return {Boolean} whether or not the path has a trailing slash
     */
    hasTrailingSlash: function hasTrailingSlash (path) {
        return path[path.length - 1] === '/';
    },

    /**
     * Returns the depth in the tree this path represents. Essentially counts
     * the slashes ignoring a trailing slash.
     *
     * @method
     *
     * @param {String} path the path
     *
     * @return {Number} the depth in the tree that this path represents
     */
    depth: function depth (path) {
        var count = 0;
        var length = path.length;
        var len = this.hasTrailingSlash(path) ? length - 1 : length;
        var i = 0;
        for (; i < len ; i++) count += path[i] === '/' ? 1 : 0;
        return count;
    },

    /**
     * Gets the position of this path in relation to its siblings.
     *
     * @method
     *
     * @param {String} path the path
     *
     * @return {Number} the index of this path in relation to its siblings.
     */
    index: function index (path) {
        var length = path.length;
        var len = this.hasTrailingSlash(path) ? length - 1 : length;
        while (len--) if (path[len] === '/') break;
        var result = parseInt(path.substring(len + 1));
        return isNaN(result) ? 0 : result;
    },

    /**
     * Gets the position of the path at a particular breadth in relationship
     * to its siblings
     *
     * @method
     *
     * @param {String} path the path
     * @param {Number} depth the breadth at which to find the index
     *
     * @return {Number} index at the particular depth
     */
    indexAtDepth: function indexAtDepth (path, depth) {
        var i = 0;
        var len = path.length;
        var index = 0;
        for (; i < len ; i++) {
            if (path[i] === '/') index++;
            if (index === depth) {
                path = path.substring(i ? i + 1 : i);
                index = path.indexOf('/');
                path = index === -1 ? path : path.substring(0, index);
                index = parseInt(path);
                return isNaN(index) ? path : index;
            }
        }
    },

    /**
     * returns the path of the passed in path's parent.
     *
     * @method
     *
     * @param {String} path the path
     *
     * @return {String} the path of the passed in path's parent
     */
    parent: function parent (path) {
        return path.substring(0, path.lastIndexOf('/', path.length - 2));
    },

    /**
     * Determines whether or not the first argument path is the direct child
     * of the second argument path.
     *
     * @method
     *
     * @param {String} child the path that may be a child
     * @param {String} parent the path that may be a parent
     *
     * @return {Boolean} whether or not the first argument path is a child of the second argument path
     */
    isChildOf: function isChildOf (child, parent) {
        return this.isDescendentOf(child, parent) && this.depth(child) === this.depth(parent) + 1;
    },

    /**
     * Returns true if the first argument path is a descendent of the second argument path.
     *
     * @method
     *
     * @param {String} child potential descendent path
     * @param {String} parent potential ancestor path
     *
     * @return {Boolean} whether or not the path is a descendent
     */
    isDescendentOf: function isDescendentOf(child, parent) {
        if (child === parent) return false;
        child = this.hasTrailingSlash(child) ? child : child + '/';
        parent = this.hasTrailingSlash(parent) ? parent : parent + '/';
        return this.depth(parent) < this.depth(child) && child.indexOf(parent) === 0;
    },

    /**
     * returns the selector portion of the path.
     *
     * @method
     *
     * @param {String} path the path
     *
     * @return {String} the selector portion of the path.
     */
    getSelector: function getSelector(path) {
        var index = path.indexOf('/');
        return index === -1 ? path : path.substring(0, index);
    }

};

module.exports = Path;

},{}],21:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

/*jshint -W079 */

'use strict';

var PathUtils = require('./Path');

/**
 * A class that can be used to associate any item with a path.
 * Items and paths are kept in flat arrays for easy iteration
 * and a memo is used to provide constant time lookup.
 *
 * @class
 *
 */
function PathStore () {
    this.items = [];
    this.paths = [];
    this.memo = {};
}

/**
 * Associates an item with the given path. Errors if an item
 * already exists at the given path.
 *
 * @method
 *
 * @param {String} path The path at which to insert the item
 * @param {Any} item The item to associate with the given path.
 *
 * @return {undefined} undefined
 */
PathStore.prototype.insert = function insert (path, item) {
    var paths = this.paths;
    var index = paths.indexOf(path);
    if (index !== -1)
        throw new Error('item already exists at path: ' + path);

    var i = 0;
    var targetDepth = PathUtils.depth(path);
    var targetIndex = PathUtils.index(path);

    // The item will be inserted at a point in the array
    // such that it is within its own breadth in the tree
    // that the paths represent
    while (
        paths[i] &&
        targetDepth >= PathUtils.depth(paths[i])
    ) i++;

    // The item will be sorted within its breadth by index
    // in regard to its siblings.
    while (
        paths[i] &&
        targetDepth === PathUtils.depth(paths[i]) &&
        targetIndex < PathUtils.index(paths[i])
    ) i++;

    // insert the items in the path
    paths.splice(i, 0, path);
    this.items.splice(i, 0, item);

    // store the relationship between path and index in the memo
    this.memo[path] = i;

    // all items behind the inserted item are now no longer
    // accurately stored in the memo. Thus the memo must be cleared for
    // these items.
    for (var len = this.paths.length ; i < len ; i++)
        this.memo[this.paths[i]] = null;
};

/**
 * Removes the the item from the store at the given path.
 * Errors if no item exists at the given path.
 *
 * @method
 *
 * @param {String} path The path at which to remove the item.
 *
 * @return {undefined} undefined
 */
PathStore.prototype.remove = function remove (path) {
    var paths = this.paths;
    var index = this.memo[path] ? this.memo[path] : paths.indexOf(path);
    if (index === -1)
        throw new Error('Cannot remove. No item exists at path: ' + path);

    paths.splice(index, 1);
    this.items.splice(index, 1);

    this.memo[path] = null;

    for (var len = this.paths.length ; index < len ; index++)
        this.memo[this.paths[index]] = null;
};

/**
 * Returns the item stored at the current path. Returns undefined
 * if no item is stored at that path.
 *
 * @method
 *
 * @param {String} path The path to lookup the item for
 *
 * @return {Any | undefined} the item stored or undefined
 */
PathStore.prototype.get = function get (path) {
    if (this.memo[path]) return this.items[this.memo[path]];

    var index = this.paths.indexOf(path);

    if (index === -1) return void 0;

    this.memo[path] = index;

    return this.items[index];
};

/**
 * Returns an array of the items currently stored in this
 * PathStore.
 *
 * @method
 *
 * @return {Array} items currently stored
 */
PathStore.prototype.getItems = function getItems () {
    return this.items;
};

/**
 * Returns an array of the paths currently stored in this
 * PathStore.
 *
 * @method
 *
 * @return {Array} paths currently stored
 */
PathStore.prototype.getPaths = function getPaths () {
    return this.paths;
};

module.exports = PathStore;

},{"./Path":20}],22:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

/*jshint -W079 */

'use strict';

var Node = require('./Node');
var Dispatch = require('./Dispatch');
var Commands = require('./Commands');
var TransformSystem = require('./TransformSystem');
var SizeSystem = require('./SizeSystem');

/**
 * Scene is the bottom of the scene graph. It is its own
 * parent and provides the global updater to the scene graph.
 *
 * @class Scene
 * @constructor
 * @extends Node
 *
 * @param {String} selector a string which is a dom selector
 *                 signifying which dom element the context
 *                 should be set upon
 * @param {Famous} updater a class which conforms to Famous' interface
 *                 it needs to be able to send methods to
 *                 the renderers and update nodes in the scene graph
 */
function Scene (selector, updater) {
    if (!selector) throw new Error('Scene needs to be created with a DOM selector');
    if (!updater) throw new Error('Scene needs to be created with a class like Famous');

    Node.call(this);         // Scene inherits from node

    this._globalUpdater = updater; // The updater that will both
                                   // send messages to the renderers
                                   // and update dirty nodes

    this._selector = selector; // reference to the DOM selector
                               // that represents the element
                               // in the dom that this context
                               // inhabits

    this.mount(selector); // Mount the context to itself
                          // (it is its own parent)

    this._globalUpdater                  // message a request for the dom
        .message(Commands.NEED_SIZE_FOR)  // size of the context so that
        .message(selector);               // the scene graph has a total size

    this.show(); // the context begins shown (it's already present in the dom)
}

// Scene inherits from node
Scene.prototype = Object.create(Node.prototype);
Scene.prototype.constructor = Scene;
Scene.NO_DEFAULT_COMPONENTS = true;

/**
 * Scene getUpdater function returns the passed in updater
 *
 * @return {Famous} the updater for this Scene
 */
Scene.prototype.getUpdater = function getUpdater () {
    return this._updater;
};

/**
 * Returns the selector that the context was instantiated with
 *
 * @return {String} dom selector
 */
Scene.prototype.getSelector = function getSelector () {
    return this._selector;
};

/**
 * Returns the dispatcher of the context. Used to send events
 * to the nodes in the scene graph.
 *
 * @return {Dispatch} the Scene's Dispatch
 * @deprecated
 */
Scene.prototype.getDispatch = function getDispatch () {
    console.warn('Scene#getDispatch is deprecated, require the dispatch directly');
    return Dispatch;
};

/**
 * Receives an event. If the event is 'CONTEXT_RESIZE' it sets the size of the scene
 * graph to the payload, which must be an array of numbers of at least
 * length three representing the pixel size in 3 dimensions.
 *
 * @param {String} event the name of the event being received
 * @param {*} payload the object being sent
 *
 * @return {undefined} undefined
 */
Scene.prototype.onReceive = function onReceive (event, payload) {
    // TODO: In the future the dom element that the context is attached to
    // should have a representation as a component. It would be render sized
    // and the context would receive its size the same way that any render size
    // component receives its size.
    if (event === 'CONTEXT_RESIZE') {
        if (payload.length < 2)
            throw new Error(
                    'CONTEXT_RESIZE\'s payload needs to be at least a pair' +
                    ' of pixel sizes'
            );

        this.setSizeMode('absolute', 'absolute', 'absolute');
        this.setAbsoluteSize(payload[0],
                             payload[1],
                             payload[2] ? payload[2] : 0);

        this._updater.message(Commands.WITH).message(this._selector).message(Commands.READY);
    }
};


Scene.prototype.mount = function mount (path) {
    if (this.isMounted())
        throw new Error('Scene is already mounted at: ' + this.getLocation());
    Dispatch.mount(path, this);
    this._id = path;
    this._mounted = true;
    this._parent = this;
    TransformSystem.registerTransformAtPath(path);
    SizeSystem.registerSizeAtPath(path);
};

module.exports = Scene;

},{"./Commands":15,"./Dispatch":16,"./Node":19,"./SizeSystem":24,"./TransformSystem":26}],23:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

var ONES = [1, 1, 1];
var ZEROS = [0, 0, 0];

/**
 * The Size class is responsible for processing Size from a node
 * @constructor Size
 *
 * @param {Size} parent the parent size
 */
function Size (parent) {

    this.finalSize = new Float32Array(3);
    this.sizeChanged = false;

    this.sizeMode = new Uint8Array(3);
    this.sizeModeChanged = false;

    this.absoluteSize = new Float32Array(3);
    this.absoluteSizeChanged = false;

    this.proportionalSize = new Float32Array(ONES);
    this.proportionalSizeChanged = false;

    this.differentialSize = new Float32Array(3);
    this.differentialSizeChanged = false;

    this.renderSize = new Float32Array(3);
    this.renderSizeChanged = false;

    this.parent = parent != null ? parent : null;
}

// an enumeration of the different types of size modes
Size.RELATIVE = 0;
Size.ABSOLUTE = 1;
Size.RENDER = 2;
Size.DEFAULT = Size.RELATIVE;

/**
 * Private method which sets a value within an array
 * and report if the value has changed.
 *
 * @method
 *
 * @param {Array} vec The array to set the value in
 * @param {Number} index The index at which to set the value
 * @param {Any} val If the val is undefined or null, or if the value
 *                  is the same as what is already there, then nothing
 *                  is set.
 *
 * @return {Boolean} returns true if anything changed
 */
function _vecOptionalSet (vec, index, val) {
    if (val != null && vec[index] !== val) {
        vec[index] = val;
        return true;
    } else return false;
}

/**
 * Private method which sets three values within an array of three
 * using _vecOptionalSet. Returns whether anything has changed.
 *
 * @method
 *
 * @param {Array} vec The array to set the values of
 * @param {Any} x The first value to set within the array
 * @param {Any} y The second value to set within the array
 * @param {Any} z The third value to set within the array
 *
 * @return {Boolean} whether anything has changed
 */
function setVec (vec, x, y, z) {
    var propagate = false;

    propagate = _vecOptionalSet(vec, 0, x) || propagate;
    propagate = _vecOptionalSet(vec, 1, y) || propagate;
    propagate = _vecOptionalSet(vec, 2, z) || propagate;

    return propagate;
}

/**
 * Private method to allow for polymorphism in the size mode such that strings
 * or the numbers from the enumeration can be used.
 *
 * @method
 *
 * @param {String|Number} val The Size mode to resolve.
 *
 * @return {Number} the resolved size mode from the enumeration.
 */
function resolveSizeMode (val) {
    if (val.constructor === String) {
        switch (val.toLowerCase()) {
            case 'relative':
            case 'default': return Size.RELATIVE;
            case 'absolute': return Size.ABSOLUTE;
            case 'render': return Size.RENDER;
            default: throw new Error('unknown size mode: ' + val);
        }
    }
    else if (val < 0 || val > Size.RENDER) throw new Error('unknown size mode: ' + val);
    return val;
}

/**
 * Sets the parent of this size.
 *
 * @method
 *
 * @param {Size} parent The parent size component
 *
 * @return {Size} this
 */
Size.prototype.setParent = function setParent (parent) {
    this.parent = parent;
    return this;
};

/**
 * Gets the parent of this size.
 *
 * @method
 *
 * @returns {Size|undefined} the parent if one exists
 */
Size.prototype.getParent = function getParent () {
    return this.parent;
};

/**
 * Gets the size mode of this size representation
 *
 * @method
 *
 * @param {Number} x the size mode to use for the width
 * @param {Number} y the size mode to use for the height
 * @param {Number} z the size mode to use for the depth
 *
 * @return {array} array of size modes
 */
Size.prototype.setSizeMode = function setSizeMode (x, y, z) {
    if (x != null) x = resolveSizeMode(x);
    if (y != null) y = resolveSizeMode(y);
    if (z != null) z = resolveSizeMode(z);
    this.sizeModeChanged = setVec(this.sizeMode, x, y, z);
    return this;
};

/**
 * Returns the size mode of this component.
 *
 * @method
 *
 * @return {Array} the current size mode of the this.
 */
Size.prototype.getSizeMode = function getSizeMode () {
    return this.sizeMode;
};

/**
 * Sets the absolute size of this size representation.
 *
 * @method
 *
 * @param {Number} x The x dimension of the absolute size
 * @param {Number} y The y dimension of the absolute size
 * @param {Number} z The z dimension of the absolute size
 *
 * @return {Size} this
 */
Size.prototype.setAbsolute = function setAbsolute (x, y, z) {
    this.absoluteSizeChanged = setVec(this.absoluteSize, x, y, z);
    return this;
};

/**
 * Gets the absolute size of this size representation
 *
 * @method
 *
 * @return {array} array of absolute size
 */
Size.prototype.getAbsolute = function getAbsolute () {
    return this.absoluteSize;
};

/**
 * Sets the proportional size of this size representation.
 *
 * @method
 *
 * @param {Number} x The x dimension of the proportional size
 * @param {Number} y The y dimension of the proportional size
 * @param {Number} z The z dimension of the proportional size
 *
 * @return {Size} this
 */
Size.prototype.setProportional = function setProportional (x, y, z) {
    this.proportionalSizeChanged = setVec(this.proportionalSize, x, y, z);
    return this;
};

/**
 * Gets the propotional size of this size representation
 *
 * @method
 *
 * @return {array} array of proportional size
 */
Size.prototype.getProportional = function getProportional () {
    return this.proportionalSize;
};

/**
 * Sets the differential size of this size representation.
 *
 * @method
 *
 * @param {Number} x The x dimension of the differential size
 * @param {Number} y The y dimension of the differential size
 * @param {Number} z The z dimension of the differential size
 *
 * @return {Size} this
 */
Size.prototype.setDifferential = function setDifferential (x, y, z) {
    this.differentialSizeChanged = setVec(this.differentialSize, x, y, z);
    return this;
};

/**
 * Gets the differential size of this size representation
 *
 * @method
 *
 * @return {array} array of differential size
 */
Size.prototype.getDifferential = function getDifferential () {
    return this.differentialSize;
};

/**
 * Sets the size of this size representation.
 *
 * @method
 *
 * @param {Number} x The x dimension of the size
 * @param {Number} y The y dimension of the size
 * @param {Number} z The z dimension of the size
 *
 * @return {Size} this
 */
Size.prototype.get = function get () {
    return this.finalSize;
};

/**
 * fromSpecWithParent takes the parent node's size, the target node's spec,
 * and a target array to write to. Using the node's size mode it calculates
 * a final size for the node from the node's spec. Returns whether or not
 * the final size has changed from its last value.
 *
 * @method
 *
 * @param {Array} components the node's components
 *
 * @return {Boolean} true if the size of the node has changed.
 */
Size.prototype.fromComponents = function fromComponents (components) {
    var mode = this.sizeMode;
    var target = this.finalSize;
    var parentSize = this.parent ? this.parent.get() : ZEROS;
    var prev;
    var changed = false;
    var len = components.length;
    var j;
    for (var i = 0 ; i < 3 ; i++) {
        prev = target[i];
        switch (mode[i]) {
            case Size.RELATIVE:
                target[i] = parentSize[i] * this.proportionalSize[i] + this.differentialSize[i];
                break;
            case Size.ABSOLUTE:
                target[i] = this.absoluteSize[i];
                break;
            case Size.RENDER:
                var candidate;
                var component;
                for (j = 0; j < len ; j++) {
                    component = components[j];
                    if (component && component.getRenderSize) {
                        candidate = component.getRenderSize()[i];
                        target[i] = target[i] < candidate || target[i] === 0 ? candidate : target[i];
                    }
                }
                break;
        }
        changed = changed || prev !== target[i];
    }
    this.sizeChanged = changed;
    return changed;
};

module.exports = Size;


},{}],24:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

var PathStore = require('./PathStore');
var Size = require('./Size');
var Dispatch = require('./Dispatch');
var PathUtils = require('./Path');

/**
 * The size system is used to calculate size throughout the scene graph.
 * It holds size components and operates upon them.
 *
 * @constructor
 */
function SizeSystem () {
    this.pathStore = new PathStore();
}

/**
 * Registers a size component to a give path. A size component can be passed as the second argument
 * or a default one will be created. Throws if no size component has been added at the parent path.
 *
 * @method
 *
 * @param {String} path The path at which to register the size component
 * @param {Size | undefined} size The size component to be registered or undefined.
 *
 * @return {undefined} undefined
 */
SizeSystem.prototype.registerSizeAtPath = function registerSizeAtPath (path, size) {
    if (!PathUtils.depth(path)) return this.pathStore.insert(path, size ? size : new Size());

    var parent = this.pathStore.get(PathUtils.parent(path));

    if (!parent) throw new Error(
            'No parent size registered at expected path: ' + PathUtils.parent(path)
    );

    if (size) size.setParent(parent);

    this.pathStore.insert(path, size ? size : new Size(parent));
};

/**
 * Removes the size component from the given path. Will throw if no component is at that
 * path
 *
 * @method
 *
 * @param {String} path The path at which to remove the size.
 *
 * @return {undefined} undefined
 */
SizeSystem.prototype.deregisterSizeAtPath = function deregisterSizeAtPath(path) {
    this.pathStore.remove(path);
};

/**
 * Returns the size component stored at a given path. Returns undefined if no
 * size component is registered to that path.
 *
 * @method
 *
 * @param {String} path The path at which to get the size component.
 *
 * @return {undefined} undefined
 */
SizeSystem.prototype.get = function get (path) {
    return this.pathStore.get(path);
};

/**
 * Updates the sizes in the scene graph. Called internally by the famous engine.
 *
 * @method
 *
 * @return {undefined} undefined
 */
SizeSystem.prototype.update = function update () {
    var sizes = this.pathStore.getItems();
    var paths = this.pathStore.getPaths();
    var node;
    var size;
    var i;
    var len;
    var components;

    for (i = 0, len = sizes.length ; i < len ; i++) {
        node = Dispatch.getNode(paths[i]);
        components = node.getComponents();
        if (!node) continue;
        size = sizes[i];
        if (size.sizeModeChanged) sizeModeChanged(node, components, size);
        if (size.absoluteSizeChanged) absoluteSizeChanged(node, components, size);
        if (size.proportionalSizeChanged) proportionalSizeChanged(node, components, size);
        if (size.differentialSizeChanged) differentialSizeChanged(node, components, size);
        if (size.renderSizeChanged) renderSizeChanged(node, components, size);
        if (size.fromComponents(components)) sizeChanged(node, components, size);
    }
};

// private methods

/**
 * Private method to alert the node and components that size mode changed.
 *
 * @method
 * @private
 *
 * @param {Node} node Node to potentially call sizeModeChanged on
 * @param {Array} components a list of the nodes' components
 * @param {Size} size the size class for the Node
 *
 * @return {undefined} undefined
 */
function sizeModeChanged (node, components, size) {
    var sizeMode = size.getSizeMode();
    var x = sizeMode[0];
    var y = sizeMode[1];
    var z = sizeMode[2];
    if (node.onSizeModeChange) node.onSizeModeChange(x, y, z);
    for (var i = 0, len = components.length ; i < len ; i++)
        if (components[i] && components[i].onSizeModeChange)
            components[i].onSizeModeChange(x, y, z);
    size.sizeModeChanged = false;
}

/**
 * Private method to alert the node and components that absoluteSize changed.
 *
 * @method
 * @private
 *
 * @param {Node} node Node to potentially call onAbsoluteSizeChange on
 * @param {Array} components a list of the nodes' components
 * @param {Size} size the size class for the Node
 *
 * @return {undefined} undefined
 */
function absoluteSizeChanged (node, components, size) {
    var absoluteSize = size.getAbsolute();
    var x = absoluteSize[0];
    var y = absoluteSize[1];
    var z = absoluteSize[2];
    if (node.onAbsoluteSizeChange) node.onAbsoluteSizeChange(x, y, z);
    for (var i = 0, len = components.length ; i < len ; i++)
        if (components[i] && components[i].onAbsoluteSizeChange)
            components[i].onAbsoluteSizeChange(x, y, z);
    size.absoluteSizeChanged = false;
}

/**
 * Private method to alert the node and components that the proportional size changed.
 *
 * @method
 * @private
 *
 * @param {Node} node Node to potentially call onProportionalSizeChange on
 * @param {Array} components a list of the nodes' components
 * @param {Size} size the size class for the Node
 *
 * @return {undefined} undefined
 */
function proportionalSizeChanged (node, components, size) {
    var proportionalSize = size.getProportional();
    var x = proportionalSize[0];
    var y = proportionalSize[1];
    var z = proportionalSize[2];
    if (node.onProportionalSizeChange) node.onProportionalSizeChange(x, y, z);
    for (var i = 0, len = components.length ; i < len ; i++)
        if (components[i] && components[i].onProportionalSizeChange)
            components[i].onProportionalSizeChange(x, y, z);
    size.proportionalSizeChanged = false;
}

/**
 * Private method to alert the node and components that differential size changed.
 *
 * @method
 * @private
 *
 * @param {Node} node Node to potentially call onDifferentialSize on
 * @param {Array} components a list of the nodes' components
 * @param {Size} size the size class for the Node
 *
 * @return {undefined} undefined
 */
function differentialSizeChanged (node, components, size) {
    var differentialSize = size.getDifferential();
    var x = differentialSize[0];
    var y = differentialSize[1];
    var z = differentialSize[2];
    if (node.onDifferentialSizeChange) node.onDifferentialSizeChange(x, y, z);
    for (var i = 0, len = components.length ; i < len ; i++)
        if (components[i] && components[i].onDifferentialSizeChange)
            components[i].onDifferentialSizeChange(x, y, z);
    size.differentialSizeChanged = false;
}

/**
 * Private method to alert the node and components that render size changed.
 *
 * @method
 * @private
 *
 * @param {Node} node Node to potentially call onRenderSizeChange on
 * @param {Array} components a list of the nodes' components
 * @param {Size} size the size class for the Node
 *
 * @return {undefined} undefined
 */
function renderSizeChanged (node, components, size) {
    var renderSize = size.getRenderSize();
    var x = renderSize[0];
    var y = renderSize[1];
    var z = renderSize[2];
    if (node.onRenderSizeChange) node.onRenderSizeChange(x, y, z);
    for (var i = 0, len = components.length ; i < len ; i++)
        if (components[i] && components[i].onRenderSizeChange)
            components[i].onRenderSizeChange(x, y, z);
    size.renderSizeChanged = false;
}

/**
 * Private method to alert the node and components that the size changed.
 *
 * @method
 * @private
 *
 * @param {Node} node Node to potentially call onSizeChange on
 * @param {Array} components a list of the nodes' components
 * @param {Size} size the size class for the Node
 *
 * @return {undefined} undefined
 */
function sizeChanged (node, components, size) {
    var finalSize = size.get();
    var x = finalSize[0];
    var y = finalSize[1];
    var z = finalSize[2];
    if (node.onSizeChange) node.onSizeChange(x, y, z);
    for (var i = 0, len = components.length ; i < len ; i++)
        if (components[i] && components[i].onSizeChange)
            components[i].onSizeChange(x, y, z);
    size.sizeChanged = false;
}

module.exports = new SizeSystem();

},{"./Dispatch":16,"./Path":20,"./PathStore":21,"./Size":23}],25:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

var QUAT = [0, 0, 0, 1];
var ONES = [1, 1, 1];

/**
 * The transform class is responsible for calculating the transform of a particular
 * node from the data on the node and its parent
 *
 * @constructor Transform
 *
 * @param {Transform} parent the parent Transform
 */
function Transform (parent) {
    this.local = new Float32Array(Transform.IDENT);
    this.global = new Float32Array(Transform.IDENT);
    this.offsets = {
        align: new Float32Array(3),
        alignChanged: false,
        mountPoint: new Float32Array(3),
        mountPointChanged: false,
        origin: new Float32Array(3),
        originChanged: false
    };
    this.vectors = {
        position: new Float32Array(3),
        positionChanged: false,
        rotation: new Float32Array(QUAT),
        rotationChanged: false,
        scale: new Float32Array(ONES),
        scaleChanged: false
    };
    this._lastEulerVals = [0, 0, 0];
    this._lastEuler = false;
    this.parent = parent ? parent : null;
    this.breakPoint = false;
    this.calculatingWorldMatrix = false;
}

Transform.IDENT = [ 1, 0, 0, 0,
                    0, 1, 0, 0,
                    0, 0, 1, 0,
                    0, 0, 0, 1 ];

Transform.WORLD_CHANGED = 1;
Transform.LOCAL_CHANGED = 2;

/**
 * resets the transform state such that it no longer has a parent
 * and is not a breakpoint.
 *
 * @method
 *
 * @return {undefined} undefined
 */
Transform.prototype.reset = function reset () {
    this.parent = null;
    this.breakPoint = false;
    this.calculatingWorldMatrix = false;
};

/**
 * sets the parent of this transform.
 *
 * @method
 *
 * @param {Transform} parent The transform class that parents this class
 *
 * @return {undefined} undefined
 */
Transform.prototype.setParent = function setParent (parent) {
    this.parent = parent;
};

/**
 * returns the parent of this transform
 *
 * @method
 *
 * @return {Transform | null} the parent of this transform if one exists
 */
Transform.prototype.getParent = function getParent () {
    return this.parent;
};

/**
 * Makes this transform a breakpoint. This will cause it to calculate
 * both a local (relative to the nearest ancestor breakpoint) and a world
 * matrix (relative to the scene).
 *
 * @method
 *
 * @return {undefined} undefined
 */
Transform.prototype.setBreakPoint = function setBreakPoint () {
    this.breakPoint = true;
    this.calculatingWorldMatrix = true;
};

/**
 * Set this node to calculate the world matrix.
 *
 * @method
 *
 * @return {undefined} undefined
 */
Transform.prototype.setCalculateWorldMatrix = function setCalculateWorldMatrix () {
    this.calculatingWorldMatrix = true;
};

/**
 * returns whether or not this transform is a breakpoint.
 *
 * @method
 *
 * @return {Boolean} true if this transform is a breakpoint
 */
Transform.prototype.isBreakPoint = function isBreakPoint () {
    return this.breakPoint;
};

/**
 * returns the local transform
 *
 * @method
 *
 * @return {Float32Array} local transform
 */
Transform.prototype.getLocalTransform = function getLocalTransform () {
    return this.local;
};

/**
 * returns the world transform. Requires that this transform is a breakpoint.
 *
 * @method
 *
 * @return {Float32Array} world transform.
 */
Transform.prototype.getWorldTransform = function getWorldTransform () {
    if (!this.isBreakPoint() && !this.calculatingWorldMatrix)
        throw new Error('This transform is not calculating world transforms');
    return this.global;
};

/**
 * Takes a node and calculates the proper transform from it.
 *
 * @method
 *
 * @param {Node} node the node to calculate the transform from
 *
 * @return {undefined} undefined
 */
Transform.prototype.calculate = function calculate (node) {
    if (!this.parent || this.parent.isBreakPoint())
        return fromNode(node, this);
    else return fromNodeWithParent(node, this);
};

/**
 * A private method to potentially set a value within an
 * array. Will set the value if a value was given
 * for the third argument and if that value is different
 * than the value that is currently in the array at the given index.
 * Returns true if a value was set and false if not.
 *
 * @method
 *
 * @param {Array} vec The array to set the value within
 * @param {Number} index The index at which to set the value
 * @param {Any} val The value to potentially set in the array
 *
 * @return {Boolean} whether or not a value was set
 */
function _vecOptionalSet (vec, index, val) {
    if (val != null && vec[index] !== val) {
        vec[index] = val;
        return true;
    } else return false;
}

/**
 * private method to set values within an array.
 * Returns whether or not the array has been changed.
 *
 * @method
 *
 * @param {Array} vec The vector to be operated upon
 * @param {Number | null | undefined} x The x value of the vector
 * @param {Number | null | undefined} y The y value of the vector
 * @param {Number | null | undefined} z The z value of the vector
 * @param {Number | null | undefined} w the w value of the vector
 *
 * @return {Boolean} whether or not the array was changed
 */
function setVec (vec, x, y, z, w) {
    var propagate = false;

    propagate = _vecOptionalSet(vec, 0, x) || propagate;
    propagate = _vecOptionalSet(vec, 1, y) || propagate;
    propagate = _vecOptionalSet(vec, 2, z) || propagate;
    if (w != null)
        propagate = _vecOptionalSet(vec, 3, w) || propagate;

    return propagate;
}

/**
 * Gets the position component of the transform
 *
 * @method
 *
 * @return {Float32Array} the position component of the transform
 */
Transform.prototype.getPosition = function getPosition () {
    return this.vectors.position;
};

/**
 * Sets the position component of the transform.
 *
 * @method
 *
 * @param {Number} x The x dimension of the position
 * @param {Number} y The y dimension of the position
 * @param {Number} z The z dimension of the position
 *
 * @return {undefined} undefined
 */
Transform.prototype.setPosition = function setPosition (x, y, z) {
    this.vectors.positionChanged = setVec(this.vectors.position, x, y, z);
};

/**
 * Gets the rotation component of the transform. Will return a quaternion.
 *
 * @method
 *
 * @return {Float32Array} the quaternion representation of the transform's rotation
 */
Transform.prototype.getRotation = function getRotation () {
    return this.vectors.rotation;
};

/**
 * Sets the rotation component of the transform. Can take either Euler
 * angles or a quaternion.
 *
 * @method
 *
 * @param {Number} x The rotation about the x axis or the extent in the x dimension
 * @param {Number} y The rotation about the y axis or the extent in the y dimension
 * @param {Number} z The rotation about the z axis or the extent in the z dimension
 * @param {Number} w The rotation about the proceeding vector
 *
 * @return {undefined} undefined
 */
Transform.prototype.setRotation = function setRotation (x, y, z, w) {
    var quat = this.vectors.rotation;
    var qx, qy, qz, qw;

    if (w != null) {
        qx = x;
        qy = y;
        qz = z;
        qw = w;
        this._lastEulerVals[0] = null;
        this._lastEulerVals[1] = null;
        this._lastEulerVals[2] = null;
        this._lastEuler = false;
    }
    else {
        if (x == null || y == null || z == null) {
            if (this._lastEuler) {
                x = x == null ? this._lastEulerVals[0] : x;
                y = y == null ? this._lastEulerVals[1] : y;
                z = z == null ? this._lastEulerVals[2] : z;
            }
            else {
                var sp = -2 * (quat[1] * quat[2] - quat[3] * quat[0]);

                if (Math.abs(sp) > 0.99999) {
                    y = y == null ? Math.PI * 0.5 * sp : y;
                    x = x == null ? Math.atan2(-quat[0] * quat[2] + quat[3] * quat[1], 0.5 - quat[1] * quat[1] - quat[2] * quat[2]) : x;
                    z = z == null ? 0 : z;
                }
                else {
                    y = y == null ? Math.asin(sp) : y;
                    x = x == null ? Math.atan2(quat[0] * quat[2] + quat[3] * quat[1], 0.5 - quat[0] * quat[0] - quat[1] * quat[1]) : x;
                    z = z == null ? Math.atan2(quat[0] * quat[1] + quat[3] * quat[2], 0.5 - quat[0] * quat[0] - quat[2] * quat[2]) : z;
                }
            }
        }

        var hx = x * 0.5;
        var hy = y * 0.5;
        var hz = z * 0.5;

        var sx = Math.sin(hx);
        var sy = Math.sin(hy);
        var sz = Math.sin(hz);
        var cx = Math.cos(hx);
        var cy = Math.cos(hy);
        var cz = Math.cos(hz);

        var sysz = sy * sz;
        var cysz = cy * sz;
        var sycz = sy * cz;
        var cycz = cy * cz;

        qx = sx * cycz + cx * sysz;
        qy = cx * sycz - sx * cysz;
        qz = cx * cysz + sx * sycz;
        qw = cx * cycz - sx * sysz;

        this._lastEuler = true;
        this._lastEulerVals[0] = x;
        this._lastEulerVals[1] = y;
        this._lastEulerVals[2] = z;
    }

    this.vectors.rotationChanged = setVec(quat, qx, qy, qz, qw);
};

/**
 * Gets the scale component of the transform
 *
 * @method
 *
 * @return {Float32Array} the scale component of the transform
 */
Transform.prototype.getScale = function getScale () {
    return this.vectors.scale;
};

/**
 * Sets the scale component of the transform.
 *
 * @method
 *
 * @param {Number | null | undefined} x The x dimension of the scale
 * @param {Number | null | undefined} y The y dimension of the scale
 * @param {Number | null | undefined} z The z dimension of the scale
 *
 * @return {undefined} undefined
 */
Transform.prototype.setScale = function setScale (x, y, z) {
    this.vectors.scaleChanged = setVec(this.vectors.scale, x, y, z);
};

/**
 * Gets the align value of the transform
 *
 * @method
 *
 * @return {Float32Array} the align value of the transform
 */
Transform.prototype.getAlign = function getAlign () {
    return this.offsets.align;
};

/**
 * Sets the align value of the transform.
 *
 * @method
 *
 * @param {Number | null | undefined} x The x dimension of the align
 * @param {Number | null | undefined} y The y dimension of the align
 * @param {Number | null | undefined} z The z dimension of the align
 *
 * @return {undefined} undefined
 */
Transform.prototype.setAlign = function setAlign (x, y, z) {
    this.offsets.alignChanged = setVec(this.offsets.align, x, y, z != null ? z - 0.5 : z);
};

/**
 * Gets the mount point value of the transform.
 *
 * @method
 *
 * @return {Float32Array} the mount point of the transform
 */
Transform.prototype.getMountPoint = function getMountPoint () {
    return this.offsets.mountPoint;
};

/**
 * Sets the mount point value of the transform.
 *
 * @method
 *
 * @param {Number | null | undefined} x the x dimension of the mount point
 * @param {Number | null | undefined} y the y dimension of the mount point
 * @param {Number | null | undefined} z the z dimension of the mount point
 *
 * @return {undefined} undefined
 */
Transform.prototype.setMountPoint = function setMountPoint (x, y, z) {
    this.offsets.mountPointChanged = setVec(this.offsets.mountPoint, x, y, z != null ? z - 0.5 : z);
};

/**
 * Gets the origin of the transform.
 *
 * @method
 *
 * @return {Float32Array} the origin
 */
Transform.prototype.getOrigin = function getOrigin () {
    return this.offsets.origin;
};

/**
 * Sets the origin of the transform.
 *
 * @method
 *
 * @param {Number | null | undefined} x the x dimension of the origin
 * @param {Number | null | undefined} y the y dimension of the origin
 * @param {Number | null | undefined} z the z dimension of the origin
 *
 * @return {undefined} undefined
 */
Transform.prototype.setOrigin = function setOrigin (x, y, z) {
    this.offsets.originChanged = setVec(this.offsets.origin, x, y, z != null ? z - 0.5 : z);
};

/**
 * Calculates the world for this particular transform.
 *
 * @method
 *
 * @return {undefined} undefined
 */
Transform.prototype.calculateWorldMatrix = function calculateWorldMatrix () {
    var nearestBreakPoint = this.parent;

    while (nearestBreakPoint && !nearestBreakPoint.isBreakPoint())
        nearestBreakPoint = nearestBreakPoint.parent;

    if (nearestBreakPoint) return multiply(this.global, nearestBreakPoint.getWorldTransform(), this.local);
    else {
        for (var i = 0; i < 16 ; i++) this.global[i] = this.local[i];
        return false;
    }
};


/**
 * Private function. Creates a transformation matrix from a Node's spec.
 *
 * @param {Node} node the node to create a transform for
 * @param {Transform} transform transform to apply
 *
 * @return {Boolean} whether or not the target array was changed
 */
function fromNode (node, transform) {
    var target = transform.getLocalTransform();
    var mySize = node.getSize();
    var vectors = transform.vectors;
    var offsets = transform.offsets;
    var parentSize = node.getParent().getSize();
    var changed = 0;

    var t00         = target[0];
    var t01         = target[1];
    var t02         = target[2];
    var t10         = target[4];
    var t11         = target[5];
    var t12         = target[6];
    var t20         = target[8];
    var t21         = target[9];
    var t22         = target[10];
    var t30         = target[12];
    var t31         = target[13];
    var t32         = target[14];
    var posX        = vectors.position[0];
    var posY        = vectors.position[1];
    var posZ        = vectors.position[2];
    var rotX        = vectors.rotation[0];
    var rotY        = vectors.rotation[1];
    var rotZ        = vectors.rotation[2];
    var rotW        = vectors.rotation[3];
    var scaleX      = vectors.scale[0];
    var scaleY      = vectors.scale[1];
    var scaleZ      = vectors.scale[2];
    var alignX      = offsets.align[0] * parentSize[0];
    var alignY      = offsets.align[1] * parentSize[1];
    var alignZ      = offsets.align[2] * parentSize[2];
    var mountPointX = offsets.mountPoint[0] * mySize[0];
    var mountPointY = offsets.mountPoint[1] * mySize[1];
    var mountPointZ = offsets.mountPoint[2] * mySize[2];
    var originX     = offsets.origin[0] * mySize[0];
    var originY     = offsets.origin[1] * mySize[1];
    var originZ     = offsets.origin[2] * mySize[2];

    var wx = rotW * rotX;
    var wy = rotW * rotY;
    var wz = rotW * rotZ;
    var xx = rotX * rotX;
    var yy = rotY * rotY;
    var zz = rotZ * rotZ;
    var xy = rotX * rotY;
    var xz = rotX * rotZ;
    var yz = rotY * rotZ;

    target[0] = (1 - 2 * (yy + zz)) * scaleX;
    target[1] = (2 * (xy + wz)) * scaleX;
    target[2] = (2 * (xz - wy)) * scaleX;
    target[3] = 0;
    target[4] = (2 * (xy - wz)) * scaleY;
    target[5] = (1 - 2 * (xx + zz)) * scaleY;
    target[6] = (2 * (yz + wx)) * scaleY;
    target[7] = 0;
    target[8] = (2 * (xz + wy)) * scaleZ;
    target[9] = (2 * (yz - wx)) * scaleZ;
    target[10] = (1 - 2 * (xx + yy)) * scaleZ;
    target[11] = 0;
    target[12] = alignX + posX - mountPointX + originX -
                 (target[0] * originX + target[4] * originY + target[8] * originZ);
    target[13] = alignY + posY - mountPointY + originY -
                 (target[1] * originX + target[5] * originY + target[9] * originZ);
    target[14] = alignZ + posZ - mountPointZ + originZ -
                 (target[2] * originX + target[6] * originY + target[10] * originZ);
    target[15] = 1;

    if (transform.calculatingWorldMatrix && transform.calculateWorldMatrix())
        changed |= Transform.WORLD_CHANGED;

    if (t00 !== target[0] ||
        t01 !== target[1] ||
        t02 !== target[2] ||
        t10 !== target[4] ||
        t11 !== target[5] ||
        t12 !== target[6] ||
        t20 !== target[8] ||
        t21 !== target[9] ||
        t22 !== target[10] ||
        t30 !== target[12] ||
        t31 !== target[13] ||
        t32 !== target[14]) changed |= Transform.LOCAL_CHANGED;

    return changed;
}

/**
 * Private function. Uses the parent transform, the node's spec, the node's size, and the parent's size
 * to calculate a final transform for the node. Returns true if the transform has changed.
 *
 * @private
 *
 * @param {Node} node the node to create a transform for
 * @param {Transform} transform transform to apply
 *
 * @return {Boolean} whether or not the transform changed
 */
function fromNodeWithParent (node, transform) {
    var target = transform.getLocalTransform();
    var parentMatrix = transform.parent.getLocalTransform();
    var mySize = node.getSize();
    var vectors = transform.vectors;
    var offsets = transform.offsets;
    var parentSize = node.getParent().getSize();
    var changed = false;

    // local cache of everything
    var t00         = target[0];
    var t01         = target[1];
    var t02         = target[2];
    var t10         = target[4];
    var t11         = target[5];
    var t12         = target[6];
    var t20         = target[8];
    var t21         = target[9];
    var t22         = target[10];
    var t30         = target[12];
    var t31         = target[13];
    var t32         = target[14];
    var p00         = parentMatrix[0];
    var p01         = parentMatrix[1];
    var p02         = parentMatrix[2];
    var p10         = parentMatrix[4];
    var p11         = parentMatrix[5];
    var p12         = parentMatrix[6];
    var p20         = parentMatrix[8];
    var p21         = parentMatrix[9];
    var p22         = parentMatrix[10];
    var p30         = parentMatrix[12];
    var p31         = parentMatrix[13];
    var p32         = parentMatrix[14];
    var posX        = vectors.position[0];
    var posY        = vectors.position[1];
    var posZ        = vectors.position[2];
    var rotX        = vectors.rotation[0];
    var rotY        = vectors.rotation[1];
    var rotZ        = vectors.rotation[2];
    var rotW        = vectors.rotation[3];
    var scaleX      = vectors.scale[0];
    var scaleY      = vectors.scale[1];
    var scaleZ      = vectors.scale[2];
    var alignX      = offsets.align[0] * parentSize[0];
    var alignY      = offsets.align[1] * parentSize[1];
    var alignZ      = offsets.align[2] * parentSize[2];
    var mountPointX = offsets.mountPoint[0] * mySize[0];
    var mountPointY = offsets.mountPoint[1] * mySize[1];
    var mountPointZ = offsets.mountPoint[2] * mySize[2];
    var originX     = offsets.origin[0] * mySize[0];
    var originY     = offsets.origin[1] * mySize[1];
    var originZ     = offsets.origin[2] * mySize[2];

    var wx = rotW * rotX;
    var wy = rotW * rotY;
    var wz = rotW * rotZ;
    var xx = rotX * rotX;
    var yy = rotY * rotY;
    var zz = rotZ * rotZ;
    var xy = rotX * rotY;
    var xz = rotX * rotZ;
    var yz = rotY * rotZ;

    var rs0 = (1 - 2 * (yy + zz)) * scaleX;
    var rs1 = (2 * (xy + wz)) * scaleX;
    var rs2 = (2 * (xz - wy)) * scaleX;
    var rs3 = (2 * (xy - wz)) * scaleY;
    var rs4 = (1 - 2 * (xx + zz)) * scaleY;
    var rs5 = (2 * (yz + wx)) * scaleY;
    var rs6 = (2 * (xz + wy)) * scaleZ;
    var rs7 = (2 * (yz - wx)) * scaleZ;
    var rs8 = (1 - 2 * (xx + yy)) * scaleZ;

    var tx = alignX + posX - mountPointX + originX - (rs0 * originX + rs3 * originY + rs6 * originZ);
    var ty = alignY + posY - mountPointY + originY - (rs1 * originX + rs4 * originY + rs7 * originZ);
    var tz = alignZ + posZ - mountPointZ + originZ - (rs2 * originX + rs5 * originY + rs8 * originZ);

    target[0] = p00 * rs0 + p10 * rs1 + p20 * rs2;
    target[1] = p01 * rs0 + p11 * rs1 + p21 * rs2;
    target[2] = p02 * rs0 + p12 * rs1 + p22 * rs2;
    target[3] = 0;
    target[4] = p00 * rs3 + p10 * rs4 + p20 * rs5;
    target[5] = p01 * rs3 + p11 * rs4 + p21 * rs5;
    target[6] = p02 * rs3 + p12 * rs4 + p22 * rs5;
    target[7] = 0;
    target[8] = p00 * rs6 + p10 * rs7 + p20 * rs8;
    target[9] = p01 * rs6 + p11 * rs7 + p21 * rs8;
    target[10] = p02 * rs6 + p12 * rs7 + p22 * rs8;
    target[11] = 0;
    target[12] = p00 * tx + p10 * ty + p20 * tz + p30;
    target[13] = p01 * tx + p11 * ty + p21 * tz + p31;
    target[14] = p02 * tx + p12 * ty + p22 * tz + p32;
    target[15] = 1;

    if (transform.calculatingWorldMatrix && transform.calculateWorldMatrix())
        changed |= Transform.WORLD_CHANGED;

    if (t00 !== target[0] ||
        t01 !== target[1] ||
        t02 !== target[2] ||
        t10 !== target[4] ||
        t11 !== target[5] ||
        t12 !== target[6] ||
        t20 !== target[8] ||
        t21 !== target[9] ||
        t22 !== target[10] ||
        t30 !== target[12] ||
        t31 !== target[13] ||
        t32 !== target[14]) changed |= Transform.LOCAL_CHANGED;

    return changed;
}

/**
 * private method to multiply two transforms.
 *
 * @method
 *
 * @param {Array} out The array to write the result to
 * @param {Array} a the left hand transform
 * @param {Array} b the right hand transform
 *
 * @return {undefined} undefined
 */
function multiply (out, a, b) {
    var a00 = a[0], a01 = a[1], a02 = a[2],
        a10 = a[4], a11 = a[5], a12 = a[6],
        a20 = a[8], a21 = a[9], a22 = a[10],
        a30 = a[12], a31 = a[13], a32 = a[14];

    var changed = false;
    var res;

    // Cache only the current line of the second matrix
    var b0  = b[0], b1 = b[1], b2 = b[2], b3 = b[3];

    res = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    changed = changed ? changed : out[0] === res;
    out[0] = res;

    res = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    changed = changed ? changed : out[1] === res;
    out[1] = res;

    res = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    changed = changed ? changed : out[2] === res;
    out[2] = res;

    out[3] = 0;

    b0 = b[4]; b1 = b[5]; b2 = b[6]; b3 = b[7];

    res = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    changed = changed ? changed : out[4] === res;
    out[4] = res;

    res = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    changed = changed ? changed : out[5] === res;
    out[5] = res;

    res = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    changed = changed ? changed : out[6] === res;
    out[6] = res;

    out[7] = 0;

    b0 = b[8]; b1 = b[9]; b2 = b[10]; b3 = b[11];

    res = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    changed = changed ? changed : out[8] === res;
    out[8] = res;

    res = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    changed = changed ? changed : out[9] === res;
    out[9] = res;

    res = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    changed = changed ? changed : out[10] === res;
    out[10] = res;

    out[11] = 0;

    b0 = b[12]; b1 = b[13]; b2 = b[14]; b3 = b[15];

    res = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    changed = changed ? changed : out[12] === res;
    out[12] = res;

    res = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    changed = changed ? changed : out[13] === res;
    out[13] = res;

    res = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    changed = changed ? changed : out[14] === res;
    out[14] = res;

    out[15] = 1;

    return changed;
}

module.exports = Transform;

},{}],26:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

var PathUtils = require('./Path');
var Transform = require('./Transform');
var Dispatch = require('./Dispatch');
var PathStore = require('./PathStore');

/**
 * The transform class is responsible for calculating the transform of a particular
 * node from the data on the node and its parent
 *
 * @constructor {TransformSystem}
 */
function TransformSystem () {
    this.pathStore = new PathStore();
}

/**
 * registers a new Transform for the given path. This transform will be updated
 * when the TransformSystem updates.
 *
 * @method registerTransformAtPath
 * @return {undefined} undefined
 *
 * @param {String} path for the transform to be registered to.
 * @param {Transform | undefined} transform optional transform to register.
 */
TransformSystem.prototype.registerTransformAtPath = function registerTransformAtPath (path, transform) {
    if (!PathUtils.depth(path))
        return this.pathStore.insert(path, transform ? transform : new Transform());

    var parent = this.pathStore.get(PathUtils.parent(path));

    if (!parent) throw new Error(
            'No parent transform registered at expected path: ' + PathUtils.parent(path)
    );

    if (transform) transform.setParent(parent);

    this.pathStore.insert(path, transform ? transform : new Transform(parent));
};

/**
 * deregisters a transform registered at the given path.
 *
 * @method deregisterTransformAtPath
 * @return {void}
 *
 * @param {String} path at which to register the transform
 */
TransformSystem.prototype.deregisterTransformAtPath = function deregisterTransformAtPath (path) {
    this.pathStore.remove(path);
};

/**
 * Method which will make the transform currently stored at the given path a breakpoint.
 * A transform being a breakpoint means that both a local and world transform will be calculated
 * for that point. The local transform being the concatinated transform of all ancestor transforms up
 * until the nearest breakpoint, and the world being the concatinated transform of all ancestor transforms.
 * This method throws if no transform is at the provided path.
 *
 * @method
 *
 * @param {String} path The path at which to turn the transform into a breakpoint
 *
 * @return {undefined} undefined
 */
TransformSystem.prototype.makeBreakPointAt = function makeBreakPointAt (path) {
    var transform = this.pathStore.get(path);
    if (!transform) throw new Error('No transform Registered at path: ' + path);
    transform.setBreakPoint();
};

/**
 * Method that will make the transform at this location calculate a world matrix.
 *
 * @method
 *
 * @param {String} path The path at which to make the transform calculate a world matrix
 *
 * @return {undefined} undefined
 */
TransformSystem.prototype.makeCalculateWorldMatrixAt = function makeCalculateWorldMatrixAt (path) {
        var transform = this.pathStore.get(path);
        if (!transform) throw new Error('No transform Registered at path: ' + path);
        transform.setCalculateWorldMatrix();
};

/**
 * Returns the instance of the transform class associated with the given path,
 * or undefined if no transform is associated.
 *
 * @method
 *
 * @param {String} path The path to lookup
 *
 * @return {Transform | undefined} the transform at that path is available, else undefined.
 */
TransformSystem.prototype.get = function get (path) {
    return this.pathStore.get(path);
};

/**
 * update is called when the transform system requires an update.
 * It traverses the transform array and evaluates the necessary transforms
 * in the scene graph with the information from the corresponding node
 * in the scene graph
 *
 * @method update
 *
 * @return {undefined} undefined
 */
TransformSystem.prototype.update = function update () {
    var transforms = this.pathStore.getItems();
    var paths = this.pathStore.getPaths();
    var transform;
    var changed;
    var node;
    var vectors;
    var offsets;
    var components;

    for (var i = 0, len = transforms.length ; i < len ; i++) {
        node = Dispatch.getNode(paths[i]);
        if (!node) continue;
        components = node.getComponents();
        transform = transforms[i];
        vectors = transform.vectors;
        offsets = transform.offsets;
        if (offsets.alignChanged) alignChanged(node, components, offsets);
        if (offsets.mountPointChanged) mountPointChanged(node, components, offsets);
        if (offsets.originChanged) originChanged(node, components, offsets);
        if (vectors.positionChanged) positionChanged(node, components, vectors);
        if (vectors.rotationChanged) rotationChanged(node, components, vectors);
        if (vectors.scaleChanged) scaleChanged(node, components, vectors);
        if ((changed = transform.calculate(node))) {
            transformChanged(node, components, transform);
            if (changed & Transform.LOCAL_CHANGED) localTransformChanged(node, components, transform.getLocalTransform());
            if (changed & Transform.WORLD_CHANGED) worldTransformChanged(node, components, transform.getWorldTransform());
        }
    }
};

// private methods

/**
 * Private method to call when align changes. Triggers 'onAlignChange' methods
 * on the node and all of the node's components
 *
 * @method
 * @private
 *
 * @param {Node} node the node on which to call onAlignChange if necessary
 * @param {Array} components the components on which to call onAlignChange if necessary
 * @param {Object} offsets the set of offsets from the transform
 *
 * @return {undefined} undefined
 */
function alignChanged (node, components, offsets) {
    var x = offsets.align[0];
    var y = offsets.align[1];
    var z = offsets.align[2];
    if (node.onAlignChange) node.onAlignChange(x, y, z);
    for (var i = 0, len = components.length ; i < len ; i++)
        if (components[i] && components[i].onAlignChange)
            components[i].onAlignChange(x, y, z);
    offsets.alignChanged = false;
}

/**
 * Private method to call when MountPoint changes. Triggers 'onMountPointChange' methods
 * on the node and all of the node's components
 *
 * @method
 * @private
 *
 * @param {Node} node the node on which to trigger a change event if necessary
 * @param {Array} components the components on which to trigger a change event if necessary
 * @param {Object} offsets the set of offsets from the transform
 *
 * @return {undefined} undefined
 */
function mountPointChanged (node, components, offsets) {
    var x = offsets.mountPoint[0];
    var y = offsets.mountPoint[1];
    var z = offsets.mountPoint[2];
    if (node.onMountPointChange) node.onMountPointChange(x, y, z);
    for (var i = 0, len = components.length ; i < len ; i++)
        if (components[i] && components[i].onMountPointChange)
            components[i].onMountPointChange(x, y, z);
    offsets.mountPointChanged = false;
}

/**
 * Private method to call when Origin changes. Triggers 'onOriginChange' methods
 * on the node and all of the node's components
 *
 * @method
 * @private
 *
 * @param {Node} node the node on which to trigger a change event if necessary
 * @param {Array} components the components on which to trigger a change event if necessary
 * @param {Object} offsets the set of offsets from the transform
 *
 * @return {undefined} undefined
 */
function originChanged (node, components, offsets) {
    var x = offsets.origin[0];
    var y = offsets.origin[1];
    var z = offsets.origin[2];
    if (node.onOriginChange) node.onOriginChange(x, y, z);
    for (var i = 0, len = components.length ; i < len ; i++)
        if (components[i] && components[i].onOriginChange)
            components[i].onOriginChange(x, y, z);
    offsets.originChanged = false;
}

/**
 * Private method to call when Position changes. Triggers 'onPositionChange' methods
 * on the node and all of the node's components
 *
 * @method
 * @private
 *
 * @param {Node} node the node on which to trigger a change event if necessary
 * @param {Array} components the components on which to trigger a change event if necessary
 * @param {Object} vectors the set of vectors from the transform
 *
 * @return {undefined} undefined
 */
function positionChanged (node, components, vectors) {
    var x = vectors.position[0];
    var y = vectors.position[1];
    var z = vectors.position[2];
    if (node.onPositionChange) node.onPositionChange(x, y, z);
    for (var i = 0, len = components.length ; i < len ; i++)
        if (components[i] && components[i].onPositionChange)
            components[i].onPositionChange(x, y, z);
    vectors.positionChanged = false;
}

/**
 * Private method to call when Rotation changes. Triggers 'onRotationChange' methods
 * on the node and all of the node's components
 *
 * @method
 * @private
 *
 * @param {Node} node the node on which to trigger a change event if necessary
 * @param {Array} components the components on which to trigger a change event if necessary
 * @param {Object} vectors the set of vectors from the transform
 *
 * @return {undefined} undefined
 */
function rotationChanged (node, components, vectors) {
    var x = vectors.rotation[0];
    var y = vectors.rotation[1];
    var z = vectors.rotation[2];
    var w = vectors.rotation[3];
    if (node.onRotationChange) node.onRotationChange(x, y, z, w);
    for (var i = 0, len = components.length ; i < len ; i++)
        if (components[i] && components[i].onRotationChange)
            components[i].onRotationChange(x, y, z, w);
    vectors.rotationChanged = false;
}

/**
 * Private method to call when Scale changes. Triggers 'onScaleChange' methods
 * on the node and all of the node's components
 *
 * @method
 * @private
 *
 * @param {Node} node the node on which to trigger a change event if necessary
 * @param {Array} components the components on which to trigger a change event if necessary
 * @param {Object} vectors the set of vectors from the transform
 *
 * @return {undefined} undefined
 */
function scaleChanged (node, components, vectors) {
    var x = vectors.scale[0];
    var y = vectors.scale[1];
    var z = vectors.scale[2];
    if (node.onScaleChange) node.onScaleChange(x, y, z);
    for (var i = 0, len = components.length ; i < len ; i++)
        if (components[i] && components[i].onScaleChange)
            components[i].onScaleChange(x, y, z);
    vectors.scaleChanged = false;
}

/**
 * Private method to call when either the Local or World Transform changes.
 * Triggers 'onTransformChange' methods on the node and all of the node's components
 *
 * @method
 * @private
 *
 * @param {Node} node the node on which to trigger a change event if necessary
 * @param {Array} components the components on which to trigger a change event if necessary
 * @param {Transform} transform the transform class that changed
 *
 * @return {undefined} undefined
 */
function transformChanged (node, components, transform) {
    if (node.onTransformChange) node.onTransformChange(transform);
    for (var i = 0, len = components.length ; i < len ; i++)
        if (components[i] && components[i].onTransformChange)
            components[i].onTransformChange(transform);
}

/**
 * Private method to call when the local transform changes. Triggers 'onLocalTransformChange' methods
 * on the node and all of the node's components
 *
 * @method
 * @private
 *
 * @param {Node} node the node on which to trigger a change event if necessary
 * @param {Array} components the components on which to trigger a change event if necessary
 * @param {Array} transform the local transform
 *
 * @return {undefined} undefined
 */
function localTransformChanged (node, components, transform) {
    if (node.onLocalTransformChange) node.onLocalTransformChange(transform);
    for (var i = 0, len = components.length ; i < len ; i++)
        if (components[i] && components[i].onLocalTransformChange)
            components[i].onLocalTransformChange(transform);
}

/**
 * Private method to call when the world transform changes. Triggers 'onWorldTransformChange' methods
 * on the node and all of the node's components
 *
 * @method
 * @private
 *
 * @param {Node} node the node on which to trigger a change event if necessary
 * @param {Array} components the components on which to trigger a change event if necessary
 * @param {Array} transform the world transform
 *
 * @return {undefined} undefined
 */
function worldTransformChanged (node, components, transform) {
    if (node.onWorldTransformChange) node.onWorldTransformChange(transform);
    for (var i = 0, len = components.length ; i < len ; i++)
        if (components[i] && components[i].onWorldTransformChange)
            components[i].onWorldTransformChange(transform);
}

module.exports = new TransformSystem();

},{"./Dispatch":16,"./Path":20,"./PathStore":21,"./Transform":25}],27:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

module.exports = {
    Channel: require('./Channel'),
    Clock: require('./Clock'),
    Commands: require('./Commands'),
    Dispatch: require('./Dispatch'),
    Event: require('./Event'),
    FamousEngine: require('./FamousEngine'),
    Node: require('./Node'),
    Path: require('./Path'),
    PathStore: require('./PathStore'),
    Scene: require('./Scene'),
    Size: require('./Size'),
    SizeSystem: require('./SizeSystem'),
    Transform: require('./Transform'),
    TransformSystem: require('./TransformSystem')
};

},{"./Channel":13,"./Clock":14,"./Commands":15,"./Dispatch":16,"./Event":17,"./FamousEngine":18,"./Node":19,"./Path":20,"./PathStore":21,"./Scene":22,"./Size":23,"./SizeSystem":24,"./Transform":25,"./TransformSystem":26}],28:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

var CallbackStore = require('../utilities/CallbackStore');
var TransformSystem = require('../core/TransformSystem');
var Commands = require('../core/Commands');
var Size = require('../core/Size');

/**
 * A DOMElement is a component that can be added to a Node with the
 * purpose of sending draw commands to the renderer. Renderables send draw commands
 * to through their Nodes to the Compositor where they are acted upon.
 *
 * @class DOMElement
 *
 * @param {Node} node                   The Node to which the `DOMElement`
 *                                      renderable should be attached to.
 * @param {Object} options              Initial options used for instantiating
 *                                      the Node.
 * @param {Object} options.properties   CSS properties that should be added to
 *                                      the actual DOMElement on the initial draw.
 * @param {Object} options.attributes   Element attributes that should be added to
 *                                      the actual DOMElement.
 * @param {String} options.id           String to be applied as 'id' of the actual
 *                                      DOMElement.
 * @param {String} options.content      String to be applied as the content of the
 *                                      actual DOMElement.
 * @param {Boolean} options.cutout      Specifies the presence of a 'cutout' in the
 *                                      WebGL canvas over this element which allows
 *                                      for DOM and WebGL layering.  On by default.
 */
function DOMElement(node, options) {
    if (!node) throw new Error('DOMElement must be instantiated on a node');

    this._changeQueue = [];

    this._requestingUpdate = false;
    this._renderSized = false;
    this._requestRenderSize = false;

    this._UIEvents = node.getUIEvents().slice(0);
    this._classes = ['famous-dom-element'];
    this._requestingEventListeners = [];
    this._styles = {};

    this._attributes = {};
    this._content = '';

    this._tagName = options && options.tagName ? options.tagName : 'div';
    this._renderSize = [0, 0, 0];

    this._node = node;

    if (node) node.addComponent(this);

    this._callbacks = new CallbackStore();

    this.setProperty('display', node.isShown() ? 'block' : 'none');
    this.onOpacityChange(node.getOpacity());

    if (!options) return;

    var i;
    var key;

    if (options.classes)
        for (i = 0; i < options.classes.length; i++)
            this.addClass(options.classes[i]);

    if (options.attributes)
        for (key in options.attributes)
            this.setAttribute(key, options.attributes[key]);

    if (options.properties)
        for (key in options.properties)
            this.setProperty(key, options.properties[key]);

    if (options.id) this.setId(options.id);
    if (options.content) this.setContent(options.content);
    if (options.cutout === false) this.setCutoutState(options.cutout);
}

/**
 * Serializes the state of the DOMElement.
 *
 * @method
 *
 * @return {Object} serialized interal state
 */
DOMElement.prototype.getValue = function getValue() {
    return {
        classes: this._classes,
        styles: this._styles,
        attributes: this._attributes,
        content: this._content,
        id: this._attributes.id,
        tagName: this._tagName
    };
};

/**
 * Method to be invoked by the node as soon as an update occurs. This allows
 * the DOMElement renderable to dynamically react to state changes on the Node.
 *
 * This flushes the internal draw command queue by sending individual commands
 * to the node using `sendDrawCommand`.
 *
 * @method
 *
 * @return {undefined} undefined
 */
DOMElement.prototype.onUpdate = function onUpdate () {
    var node = this._node;
    var queue = this._changeQueue;
    var len = queue.length;

    if (len && node) {
        node.sendDrawCommand(Commands.WITH);
        node.sendDrawCommand(node.getLocation());

        while (len--) node.sendDrawCommand(queue.shift());
        if (this._requestRenderSize) {
            node.sendDrawCommand(Commands.DOM_RENDER_SIZE);
            node.sendDrawCommand(node.getLocation());
            this._requestRenderSize = false;
        }

    }

    this._requestingUpdate = false;
};

/**
 * Method to be invoked by the Node as soon as the node (or any of its
 * ancestors) is being mounted.
 *
 * @method onMount
 *
 * @param {Node} node      Parent node to which the component should be added.
 * @param {String} id      Path at which the component (or node) is being
 *                          attached. The path is being set on the actual
 *                          DOMElement as a `data-fa-path`-attribute.
 *
 * @return {undefined} undefined
 */
DOMElement.prototype.onMount = function onMount(node, id) {
    this._node = node;
    this._id = id;
    this._UIEvents = node.getUIEvents().slice(0);
    TransformSystem.makeBreakPointAt(node.getLocation());
    this.onSizeModeChange.apply(this, node.getSizeMode());
    this.draw();
    this.setAttribute('data-fa-path', node.getLocation());
};

/**
 * Method to be invoked by the Node as soon as the node is being dismounted
 * either directly or by dismounting one of its ancestors.
 *
 * @method
 *
 * @return {undefined} undefined
 */
DOMElement.prototype.onDismount = function onDismount() {
    this.setProperty('display', 'none');
    this.setAttribute('data-fa-path', '');
    this.setCutoutState(false);

    this.onUpdate();
    this._initialized = false;
};

/**
 * Method to be invoked by the node as soon as the DOMElement is being shown.
 * This results into the DOMElement setting the `display` property to `block`
 * and therefore visually showing the corresponding DOMElement (again).
 *
 * @method
 *
 * @return {undefined} undefined
 */
DOMElement.prototype.onShow = function onShow() {
    this.setProperty('display', 'block');
};

/**
 * Method to be invoked by the node as soon as the DOMElement is being hidden.
 * This results into the DOMElement setting the `display` property to `none`
 * and therefore visually hiding the corresponding DOMElement (again).
 *
 * @method
 *
 * @return {undefined} undefined
 */
DOMElement.prototype.onHide = function onHide() {
    this.setProperty('display', 'none');
};

/**
 * Enables or disables WebGL 'cutout' for this element, which affects
 * how the element is layered with WebGL objects in the scene.
 *
 * @method
 *
 * @param {Boolean} usesCutout  The presence of a WebGL 'cutout' for this element.
 *
 * @return {DOMElement} this
 */
DOMElement.prototype.setCutoutState = function setCutoutState (usesCutout) {
    if (this._initialized)
        this._changeQueue.push(Commands.GL_CUTOUT_STATE, usesCutout);

    if (!this._requestingUpdate) this._requestUpdate();
    return this;
};

/**
 * Method to be invoked by the node as soon as the transform matrix associated
 * with the node changes. The DOMElement will react to transform changes by sending
 * `CHANGE_TRANSFORM` commands to the `DOMRenderer`.
 *
 * @method
 *
 * @param {Float32Array} transform The final transform matrix
 *
 * @return {undefined} undefined
 */
DOMElement.prototype.onTransformChange = function onTransformChange (transform) {
    this._changeQueue.push(Commands.CHANGE_TRANSFORM);
    transform = transform.getLocalTransform();

    for (var i = 0, len = transform.length ; i < len ; i++)
        this._changeQueue.push(transform[i]);

    if (!this._requestingUpdate) this._requestUpdate();
};

/**
 * Method to be invoked by the node as soon as its computed size changes.
 *
 * @method
 *
 * @param {Number} x width of the Node the DOMElement is attached to
 * @param {Number} y height of the Node the DOMElement is attached to
 *
 * @return {DOMElement} this
 */
DOMElement.prototype.onSizeChange = function onSizeChange(x, y) {
    var sizeMode = this._node.getSizeMode();
    var sizedX = sizeMode[0] !== Size.RENDER;
    var sizedY = sizeMode[1] !== Size.RENDER;
    if (this._initialized)
        this._changeQueue.push(Commands.CHANGE_SIZE,
            sizedX ? x : sizedX,
            sizedY ? y : sizedY);

    if (!this._requestingUpdate) this._requestUpdate();
    return this;
};

/**
 * Method to be invoked by the node as soon as its opacity changes
 *
 * @method
 *
 * @param {Number} opacity The new opacity, as a scalar from 0 to 1
 *
 * @return {DOMElement} this
 */
DOMElement.prototype.onOpacityChange = function onOpacityChange(opacity) {
    return this.setProperty('opacity', opacity);
};

/**
 * Method to be invoked by the node as soon as a new UIEvent is being added.
 * This results into an `ADD_EVENT_LISTENER` command being sent.
 *
 * @param {String} uiEvent uiEvent to be subscribed to (e.g. `click`)
 *
 * @return {undefined} undefined
 */
DOMElement.prototype.onAddUIEvent = function onAddUIEvent(uiEvent) {
    if (this._UIEvents.indexOf(uiEvent) === -1) {
        this._subscribe(uiEvent);
        this._UIEvents.push(uiEvent);
    }
    else if (this._inDraw) {
        this._subscribe(uiEvent);
    }
    return this;
};

/**
 * Method to be invoked by the node as soon as a UIEvent is removed from
 * the node.  This results into an `UNSUBSCRIBE` command being sent.
 *
 * @param {String} UIEvent UIEvent to be removed (e.g. `mousedown`)
 *
 * @return {undefined} undefined
 */
DOMElement.prototype.onRemoveUIEvent = function onRemoveUIEvent(UIEvent) {
    var index = this._UIEvents.indexOf(UIEvent);
    if (index !== -1) {
        this._unsubscribe(UIEvent);
        this._UIEvents.splice(index, 1);
    }
    else if (this._inDraw) {
        this._unsubscribe(UIEvent);
    }
    return this;
};

/**
 * Appends an `SUBSCRIBE` command to the command queue.
 *
 * @method
 * @private
 *
 * @param {String} uiEvent Event type (e.g. `click`)
 *
 * @return {undefined} undefined
 */
DOMElement.prototype._subscribe = function _subscribe (uiEvent) {
    if (this._initialized) {
        this._changeQueue.push(Commands.SUBSCRIBE, uiEvent);
    }

    if (!this._requestingUpdate) this._requestUpdate();
};

/**
 * When running in a worker, the browser's default action for specific events
 * can't be prevented on a case by case basis (via `e.preventDefault()`).
 * Instead this function should be used to register an event to be prevented by
 * default.
 *
 * @method
 *
 * @param  {String} uiEvent     UI Event (e.g. wheel) for which to prevent the
 *                              browser's default action (e.g. form submission,
 *                              scrolling)
 * @return {undefined}          undefined
 */
DOMElement.prototype.preventDefault = function preventDefault (uiEvent) {
    if (this._initialized) {
        this._changeQueue.push(Commands.PREVENT_DEFAULT, uiEvent);
    }
    if (!this._requestingUpdate) this._requestUpdate();
};

/**
 * Opposite of {@link DOMElement#preventDefault}. No longer prevent the
 * browser's default action on subsequent events of this type.
 *
 * @method
 *
 * @param  {type} uiEvent       UI Event previously registered using
 *                              {@link DOMElement#preventDefault}.
 * @return {undefined}          undefined
 */
DOMElement.prototype.allowDefault = function allowDefault (uiEvent) {
    if (this._initialized) {
        this._changeQueue.push(Commands.ALLOW_DEFAULT, uiEvent);
    }

    if (!this._requestingUpdate) this._requestUpdate();
};

/**
 * Appends an `UNSUBSCRIBE` command to the command queue.
 *
 * @method
 * @private
 *
 * @param {String} UIEvent Event type (e.g. `click`)
 *
 * @return {undefined} undefined
 */
DOMElement.prototype._unsubscribe = function _unsubscribe (UIEvent) {
    if (this._initialized) {
        this._changeQueue.push(Commands.UNSUBSCRIBE, UIEvent);
    }

    if (!this._requestingUpdate) this._requestUpdate();
};

/**
 * Method to be invoked by the node as soon as the underlying size mode
 * changes. This results into the size being fetched from the node in
 * order to update the actual, rendered size.
 *
 * @method
 *
 * @param {Number} x the sizing mode in use for determining size in the x direction
 * @param {Number} y the sizing mode in use for determining size in the y direction
 * @param {Number} z the sizing mode in use for determining size in the z direction
 *
 * @return {undefined} undefined
 */
DOMElement.prototype.onSizeModeChange = function onSizeModeChange(x, y, z) {
    if (x === Size.RENDER || y === Size.RENDER || z === Size.RENDER) {
        this._renderSized = true;
        this._requestRenderSize = true;
    }
    var size = this._node.getSize();
    this.onSizeChange(size[0], size[1]);
};

/**
 * Method to be retrieve the rendered size of the DOM element that is
 * drawn for this node.
 *
 * @method
 *
 * @return {Array} size of the rendered DOM element in pixels
 */
DOMElement.prototype.getRenderSize = function getRenderSize() {
    return this._renderSize;
};

/**
 * Method to have the component request an update from its Node
 *
 * @method
 * @private
 *
 * @return {undefined} undefined
 */
DOMElement.prototype._requestUpdate = function _requestUpdate() {
    if (!this._requestingUpdate && this._id) {
        this._node.requestUpdate(this._id);
        this._requestingUpdate = true;
    }
};

/**
 * Initializes the DOMElement by sending the `INIT_DOM` command. This creates
 * or reallocates a new Element in the actual DOM hierarchy.
 *
 * @method
 *
 * @return {undefined} undefined
 */
DOMElement.prototype.init = function init () {
    this._changeQueue.push(Commands.INIT_DOM, this._tagName);
    this._initialized = true;
    this.onTransformChange(TransformSystem.get(this._node.getLocation()));
    var size = this._node.getSize();
    this.onSizeChange(size[0], size[1]);
    if (!this._requestingUpdate) this._requestUpdate();
};

/**
 * Sets the id attribute of the DOMElement.
 *
 * @method
 *
 * @param {String} id New id to be set
 *
 * @return {DOMElement} this
 */
DOMElement.prototype.setId = function setId (id) {
    this.setAttribute('id', id);
    return this;
};

/**
 * Adds a new class to the internal class list of the underlying Element in the
 * DOM.
 *
 * @method
 *
 * @param {String} value New class name to be added
 *
 * @return {DOMElement} this
 */
DOMElement.prototype.addClass = function addClass (value) {
    if (this._classes.indexOf(value) < 0) {
        if (this._initialized) this._changeQueue.push(Commands.ADD_CLASS, value);
        this._classes.push(value);
        if (!this._requestingUpdate) this._requestUpdate();
        if (this._renderSized) this._requestRenderSize = true;
        return this;
    }

    if (this._inDraw) {
        if (this._initialized) this._changeQueue.push(Commands.ADD_CLASS, value);
        if (!this._requestingUpdate) this._requestUpdate();
    }
    return this;
};

/**
 * Removes a class from the DOMElement's classList.
 *
 * @method
 *
 * @param {String} value Class name to be removed
 *
 * @return {DOMElement} this
 */
DOMElement.prototype.removeClass = function removeClass (value) {
    var index = this._classes.indexOf(value);

    if (index < 0) return this;

    this._changeQueue.push(Commands.REMOVE_CLASS, value);

    this._classes.splice(index, 1);

    if (!this._requestingUpdate) this._requestUpdate();
    return this;
};


/**
 * Checks if the DOMElement has the passed in class.
 *
 * @method
 *
 * @param {String} value The class name
 *
 * @return {Boolean} Boolean value indicating whether the passed in class name is in the DOMElement's class list.
 */
DOMElement.prototype.hasClass = function hasClass (value) {
    return this._classes.indexOf(value) !== -1;
};

/**
 * Sets an attribute of the DOMElement.
 *
 * @method
 *
 * @param {String} name Attribute key (e.g. `src`)
 * @param {String} value Attribute value (e.g. `http://famo.us`)
 *
 * @return {DOMElement} this
 */
DOMElement.prototype.setAttribute = function setAttribute (name, value) {
    if (this._attributes[name] !== value || this._inDraw) {
        this._attributes[name] = value;
        if (this._initialized) this._changeQueue.push(Commands.CHANGE_ATTRIBUTE, name, value);
        if (!this._requestUpdate) this._requestUpdate();
    }

    return this;
};

/**
 * Sets a CSS property
 *
 * @chainable
 *
 * @param {String} name  Name of the CSS rule (e.g. `background-color`)
 * @param {String} value Value of CSS property (e.g. `red`)
 *
 * @return {DOMElement} this
 */
DOMElement.prototype.setProperty = function setProperty (name, value) {
    if (this._styles[name] !== value || this._inDraw) {
        this._styles[name] = value;
        if (this._initialized) this._changeQueue.push(Commands.CHANGE_PROPERTY, name, value);
        if (!this._requestingUpdate) this._requestUpdate();
        if (this._renderSized) this._requestRenderSize = true;
    }

    return this;
};

/**
 * Sets the content of the DOMElement. This is using `innerHTML`, escaping user
 * generated content is therefore essential for security purposes.
 *
 * @method
 *
 * @param {String} content Content to be set using `.innerHTML = ...`
 *
 * @return {DOMElement} this
 */
DOMElement.prototype.setContent = function setContent (content) {
    if (this._content !== content || this._inDraw) {
        this._content = content;
        if (this._initialized) this._changeQueue.push(Commands.CHANGE_CONTENT, content);
        if (!this._requestingUpdate) this._requestUpdate();
        if (this._renderSized) this._requestRenderSize = true;
    }

    return this;
};

/**
 * Subscribes to a DOMElement using.
 *
 * @method on
 *
 * @param {String} event       The event type (e.g. `click`).
 * @param {Function} listener  Handler function for the specified event type
 *                              in which the payload event object will be
 *                              passed into.
 *
 * @return {Function} A function to call if you want to remove the callback
 */
DOMElement.prototype.on = function on (event, listener) {
    return this._callbacks.on(event, listener);
};

/**
 * Function to be invoked by the Node whenever an event is being received.
 * There are two different ways to subscribe for those events:
 *
 * 1. By overriding the onReceive method (and possibly using `switch` in order
 *     to differentiate between the different event types).
 * 2. By using DOMElement and using the built-in CallbackStore.
 *
 * @method
 *
 * @param {String} event Event type (e.g. `click`)
 * @param {Object} payload Event object.
 *
 * @return {undefined} undefined
 */
DOMElement.prototype.onReceive = function onReceive (event, payload) {
    if (event === 'resize') {
        this._renderSize[0] = payload.val[0];
        this._renderSize[1] = payload.val[1];
        if (!this._requestingUpdate) this._requestUpdate();
    }
    this._callbacks.trigger(event, payload);
};

/**
 * The draw function is being used in order to allow mutating the DOMElement
 * before actually mounting the corresponding node.
 *
 * @method
 * @private
 *
 * @return {undefined} undefined
 */
DOMElement.prototype.draw = function draw() {
    var key;
    var i;
    var len;

    this._inDraw = true;

    this.init();

    for (i = 0, len = this._classes.length ; i < len ; i++)
        this.addClass(this._classes[i]);

    if (this._content) this.setContent(this._content);

    for (key in this._styles)
        if (this._styles[key] != null)
            this.setProperty(key, this._styles[key]);

    for (key in this._attributes)
        if (this._attributes[key] != null)
            this.setAttribute(key, this._attributes[key]);

    for (i = 0, len = this._UIEvents.length ; i < len ; i++)
        this.onAddUIEvent(this._UIEvents[i]);

    this._inDraw = false;
};

module.exports = DOMElement;

},{"../core/Commands":15,"../core/Size":23,"../core/TransformSystem":26,"../utilities/CallbackStore":94}],29:[function(require,module,exports){
/**
 * The MIT License (MIT)
 * 
 * Copyright (c) 2015 Famous Industries Inc.
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

module.exports = {
    DOMElement: require('./DOMElement')
};

},{"./DOMElement":28}],30:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

var ElementCache = require('./ElementCache');
var math = require('./Math');
var PathUtils = require('../core/Path');
var vendorPrefix = require('../utilities/vendorPrefix');
var CallbackStore = require('../utilities/CallbackStore');
var eventMap = require('./events/EventMap');

var TRANSFORM = null;

/**
 * DOMRenderer is a class responsible for adding elements
 * to the DOM and writing to those elements.
 * There is a DOMRenderer per context, represented as an
 * element and a selector. It is instantiated in the
 * context class.
 *
 * @class DOMRenderer
 *
 * @param {HTMLElement} element an element.
 * @param {String} selector the selector of the element.
 * @param {Compositor} compositor the compositor controlling the renderer
 */
function DOMRenderer (element, selector, compositor) {
    var _this = this;

    element.classList.add('famous-dom-renderer');

    TRANSFORM = TRANSFORM || vendorPrefix('transform');
    this._compositor = compositor; // a reference to the compositor

    this._target = null; // a register for holding the current
                         // element that the Renderer is operating
                         // upon

    this._parent = null; // a register for holding the parent
                         // of the target

    this._path = null; // a register for holding the path of the target
                       // this register must be set first, and then
                       // children, target, and parent are all looked
                       // up from that.

    this._children = []; // a register for holding the children of the
                         // current target.

     this._insertElCallbackStore = new CallbackStore();
     this._removeElCallbackStore = new CallbackStore();

    this._root = new ElementCache(element, selector); // the root
                                                      // of the dom tree that this
                                                      // renderer is responsible
                                                      // for

    this._boundTriggerEvent = function (ev) {
        return _this._triggerEvent(ev);
    };

    this._selector = selector;

    this._elements = {};

    this._elements[selector] = this._root;

    this.perspectiveTransform = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
    this._VPtransform = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);

    this._lastEv = null;
}


/**
 * Attaches an EventListener to the element associated with the passed in path.
 * Prevents the default browser action on all subsequent events if
 * `preventDefault` is truthy.
 * All incoming events will be forwarded to the compositor by invoking the
 * `sendEvent` method.
 * Delegates events if possible by attaching the event listener to the context.
 *
 * @method
 *
 * @param {String} type DOM event type (e.g. click, mouseover).
 * @param {Boolean} preventDefault Whether or not the default browser action should be prevented.
 *
 * @return {undefined} undefined
 */
DOMRenderer.prototype.subscribe = function subscribe(type) {
    this._assertTargetLoaded();
    this._listen(type);
    this._target.subscribe[type] = true;
};

/**
 * Used to preventDefault if an event of the specified type is being emitted on
 * the currently loaded target.
 *
 * @method
 *
 * @param  {String} type    The type of events that should be prevented.
 * @return {undefined}      undefined
 */
DOMRenderer.prototype.preventDefault = function preventDefault(type) {
    this._assertTargetLoaded();
    this._listen(type);
    this._target.preventDefault[type] = true;
};

/**
 * Used to undo a previous call to preventDefault. No longer `preventDefault`
 * for this event on the loaded target.
 *
 * @method
 * @private
 *
 * @param  {String} type    The event type that should no longer be affected by
 *                          `preventDefault`.
 * @return {undefined}      undefined
 */
DOMRenderer.prototype.allowDefault = function allowDefault(type) {
    this._assertTargetLoaded();
    this._listen(type);
    this._target.preventDefault[type] = false;
};

/**
 * Internal helper function used for adding an event listener for the the
 * currently loaded ElementCache.
 *
 * If the event can be delegated as specified in the {@link EventMap}, the
 * bound {@link _triggerEvent} function will be added as a listener on the
 * root element. Otherwise, the listener will be added directly to the target
 * element.
 *
 * @private
 * @method
 *
 * @param  {String} type    The event type to listen to (e.g. click).
 * @return {undefined}      undefined
 */
DOMRenderer.prototype._listen = function _listen(type) {
    this._assertTargetLoaded();

    if (
        !this._target.listeners[type] && !this._root.listeners[type]
    ) {
        // FIXME Add to content DIV if available
        var target = eventMap[type][1] ? this._root : this._target;
        target.listeners[type] = this._boundTriggerEvent;
        target.element.addEventListener(type, this._boundTriggerEvent);
    }
};

/**
 * Unsubscribes from all events that are of the specified type.
 *
 * @method
 *
 * @param {String} type DOM event type (e.g. click, mouseover).
 * @return {undefined} undefined
 */
DOMRenderer.prototype.unsubscribe = function unsubscribe(type) {
    this._assertTargetLoaded();
    this._target.subscribe[type] = false;
};

/**
 * Function to be added using `addEventListener` to the corresponding
 * DOMElement.
 *
 * @method
 * @private
 *
 * @param {Event} ev DOM Event payload
 *
 * @return {undefined} undefined
 */
DOMRenderer.prototype._triggerEvent = function _triggerEvent(ev) {
    if (this._lastEv === ev) return;

    // Use ev.path, which is an array of Elements (polyfilled if needed).
    var evPath = ev.path ? ev.path : _getPath(ev);
    // First element in the path is the element on which the event has actually
    // been emitted.
    for (var i = 0; i < evPath.length; i++) {
        // Skip nodes that don't have a dataset property or data-fa-path
        // attribute.
        if (!evPath[i].dataset) continue;
        var path = evPath[i].dataset.faPath;
        if (!path) continue;

        // Optionally preventDefault. This needs forther consideration and
        // should be optional. Eventually this should be a separate command/
        // method.
        if (this._elements[path].preventDefault[ev.type]) {
            ev.preventDefault();
        }

        // Stop further event propogation and path traversal as soon as the
        // first ElementCache subscribing for the emitted event has been found.
        if (this._elements[path] && this._elements[path].subscribe[ev.type]) {
            this._lastEv = ev;

            var NormalizedEventConstructor = eventMap[ev.type][0];

            // Finally send the event to the Worker Thread through the
            // compositor.
            this._compositor.sendEvent(path, ev.type, new NormalizedEventConstructor(ev));

            break;
        }
    }
};


/**
 * getSizeOf gets the dom size of a particular DOM element.  This is
 * needed for render sizing in the scene graph.
 *
 * @method
 *
 * @param {String} path path of the Node in the scene graph
 *
 * @return {Array} a vec3 of the offset size of the dom element
 */
DOMRenderer.prototype.getSizeOf = function getSizeOf(path) {
    var element = this._elements[path];
    if (!element) return null;

    var res = {val: element.size};
    this._compositor.sendEvent(path, 'resize', res);
    return res;
};

function _getPath(ev) {
    // TODO move into _triggerEvent, avoid object allocation
    var path = [];
    var node = ev.target;
    while (node !== document.body) {
        path.push(node);
        node = node.parentNode;
    }
    return path;
}

/**
 * Executes the retrieved draw commands. Draw commands only refer to the
 * cross-browser normalized `transform` property.
 *
 * @method
 *
 * @param {Object} renderState description
 *
 * @return {undefined} undefined
 */
DOMRenderer.prototype.draw = function draw(renderState) {
    if (renderState.perspectiveDirty) {
        this.perspectiveDirty = true;

        this.perspectiveTransform[0] = renderState.perspectiveTransform[0];
        this.perspectiveTransform[1] = renderState.perspectiveTransform[1];
        this.perspectiveTransform[2] = renderState.perspectiveTransform[2];
        this.perspectiveTransform[3] = renderState.perspectiveTransform[3];

        this.perspectiveTransform[4] = renderState.perspectiveTransform[4];
        this.perspectiveTransform[5] = renderState.perspectiveTransform[5];
        this.perspectiveTransform[6] = renderState.perspectiveTransform[6];
        this.perspectiveTransform[7] = renderState.perspectiveTransform[7];

        this.perspectiveTransform[8] = renderState.perspectiveTransform[8];
        this.perspectiveTransform[9] = renderState.perspectiveTransform[9];
        this.perspectiveTransform[10] = renderState.perspectiveTransform[10];
        this.perspectiveTransform[11] = renderState.perspectiveTransform[11];

        this.perspectiveTransform[12] = renderState.perspectiveTransform[12];
        this.perspectiveTransform[13] = renderState.perspectiveTransform[13];
        this.perspectiveTransform[14] = renderState.perspectiveTransform[14];
        this.perspectiveTransform[15] = renderState.perspectiveTransform[15];
    }

    if (renderState.viewDirty || renderState.perspectiveDirty) {
        math.multiply(this._VPtransform, this.perspectiveTransform, renderState.viewTransform);
        this._root.element.style[TRANSFORM] = this._stringifyMatrix(this._VPtransform);
    }
};


/**
 * Internal helper function used for ensuring that a path is currently loaded.
 *
 * @method
 * @private
 *
 * @return {undefined} undefined
 */
DOMRenderer.prototype._assertPathLoaded = function _asserPathLoaded() {
    if (!this._path) throw new Error('path not loaded');
};

/**
 * Internal helper function used for ensuring that a parent is currently loaded.
 *
 * @method
 * @private
 *
 * @return {undefined} undefined
 */
DOMRenderer.prototype._assertParentLoaded = function _assertParentLoaded() {
    if (!this._parent) throw new Error('parent not loaded');
};

/**
 * Internal helper function used for ensuring that children are currently
 * loaded.
 *
 * @method
 * @private
 *
 * @return {undefined} undefined
 */
DOMRenderer.prototype._assertChildrenLoaded = function _assertChildrenLoaded() {
    if (!this._children) throw new Error('children not loaded');
};

/**
 * Internal helper function used for ensuring that a target is currently loaded.
 *
 * @method  _assertTargetLoaded
 *
 * @return {undefined} undefined
 */
DOMRenderer.prototype._assertTargetLoaded = function _assertTargetLoaded() {
    if (!this._target) throw new Error('No target loaded');
};

/**
 * Finds and sets the parent of the currently loaded element (path).
 *
 * @method
 * @private
 *
 * @return {ElementCache} Parent element.
 */
DOMRenderer.prototype.findParent = function findParent () {
    this._assertPathLoaded();

    var path = this._path;
    var parent;

    while (!parent && path.length) {
        path = path.substring(0, path.lastIndexOf('/'));
        parent = this._elements[path];
    }

    this._parent = parent;
    return parent;
};

/**
 * Used for determining the target loaded under the current path.
 *
 * @method
 * @deprecated
 *
 * @return {ElementCache|undefined} Element loaded under defined path.
 */
DOMRenderer.prototype.findTarget = function findTarget() {
    this._target = this._elements[this._path];
    return this._target;
};

/**
 * Loads the passed in path into the DOMRenderer.
 *
 * @method
 *
 * @param {String} path Path to be loaded
 *
 * @return {String} Loaded path
 */
DOMRenderer.prototype.loadPath = function loadPath (path) {
    this._path = path;
    this._target = this._elements[this._path];
    return this._path;
};

/**
 * Finds children of a parent element that are descendents of a inserted element in the scene
 * graph. Appends those children to the inserted element.
 *
 * @method resolveChildren
 * @return {void}
 *
 * @param {HTMLElement} element the inserted element
 * @param {HTMLElement} parent the parent of the inserted element
 */
DOMRenderer.prototype.resolveChildren = function resolveChildren (element, parent) {
    var i = 0;
    var childNode;
    var path = this._path;
    var childPath;

    while ((childNode = parent.childNodes[i])) {
        if (!childNode.dataset) {
            i++;
            continue;
        }
        childPath = childNode.dataset.faPath;
        if (!childPath) {
            i++;
            continue;
        }
        if (PathUtils.isDescendentOf(childPath, path)) element.appendChild(childNode);
        else i++;
    }
};

/**
 * Inserts a DOMElement at the currently loaded path, assuming no target is
 * loaded. Only one DOMElement can be associated with each path.
 *
 * @method
 *
 * @param {String} tagName Tag name (capitalization will be normalized).
 *
 * @return {undefined} undefined
 */
DOMRenderer.prototype.insertEl = function insertEl (tagName) {

    this.findParent();

    this._assertParentLoaded();

    if (this._parent.void)
        throw new Error(
            this._parent.path + ' is a void element. ' +
            'Void elements are not allowed to have children.'
        );

    if (!this._target) this._target = new ElementCache(document.createElement(tagName), this._path);

    var el = this._target.element;
    var parent = this._parent.element;

    this.resolveChildren(el, parent);

    parent.appendChild(el);
    this._elements[this._path] = this._target;

    this._insertElCallbackStore.trigger(this._path, this._target);

};


/**
 * Sets a property on the currently loaded target.
 *
 * @method
 *
 * @param {String} name Property name (e.g. background, color, font)
 * @param {String} value Proprty value (e.g. black, 20px)
 *
 * @return {undefined} undefined
 */
DOMRenderer.prototype.setProperty = function setProperty (name, value) {
    this._assertTargetLoaded();
    this._target.element.style[name] = value;
};


/**
 * Sets the size of the currently loaded target.
 * Removes any explicit sizing constraints when passed in `false`
 * ("true-sizing").
 *
 * Invoking setSize is equivalent to a manual invocation of `setWidth` followed
 * by `setHeight`.
 *
 * @method
 *
 * @param {Number|false} width   Width to be set.
 * @param {Number|false} height  Height to be set.
 *
 * @return {undefined} undefined
 */
DOMRenderer.prototype.setSize = function setSize (width, height) {
    this._assertTargetLoaded();

    this.setWidth(width);
    this.setHeight(height);
};

/**
 * Sets the width of the currently loaded ElementCache.
 *
 * @method
 *
 * @param  {Number|false} width     The explicit width to be set on the
 *                                  ElementCache's target (and content) element.
 *                                  `false` removes any explicit sizing
 *                                  constraints from the underlying DOM
 *                                  Elements.
 *
 * @return {undefined} undefined
 */
DOMRenderer.prototype.setWidth = function setWidth(width) {
    this._assertTargetLoaded();

    var contentWrapper = this._target.content;

    if (width === false) {
        this._target.explicitWidth = true;
        if (contentWrapper) contentWrapper.style.width = '';
        width = contentWrapper ? contentWrapper.offsetWidth : 0;
        this._target.element.style.width = width + 'px';
    }
    else {
        this._target.explicitWidth = false;
        if (contentWrapper) contentWrapper.style.width = width + 'px';
        this._target.element.style.width = width + 'px';
    }

    this._target.size[0] = width;
};

/**
 * Sets the height of the currently loaded ElementCache.
 *
 * @method  setHeight
 *
 * @param  {Number|false} height    The explicit height to be set on the
 *                                  ElementCache's target (and content) element.
 *                                  `false` removes any explicit sizing
 *                                  constraints from the underlying DOM
 *                                  Elements.
 *
 * @return {undefined} undefined
 */
DOMRenderer.prototype.setHeight = function setHeight(height) {
    this._assertTargetLoaded();

    var contentWrapper = this._target.content;

    if (height === false) {
        this._target.explicitHeight = true;
        if (contentWrapper) contentWrapper.style.height = '';
        height = contentWrapper ? contentWrapper.offsetHeight : 0;
        this._target.element.style.height = height + 'px';
    }
    else {
        this._target.explicitHeight = false;
        if (contentWrapper) contentWrapper.style.height = height + 'px';
        this._target.element.style.height = height + 'px';
    }

    this._target.size[1] = height;
};

/**
 * Sets an attribute on the currently loaded target.
 *
 * @method
 *
 * @param {String} name Attribute name (e.g. href)
 * @param {String} value Attribute value (e.g. http://famous.org)
 *
 * @return {undefined} undefined
 */
DOMRenderer.prototype.setAttribute = function setAttribute(name, value) {
    this._assertTargetLoaded();
    this._target.element.setAttribute(name, value);
};

/**
 * Sets the `innerHTML` content of the currently loaded target.
 *
 * @method
 *
 * @param {String} content Content to be set as `innerHTML`
 *
 * @return {undefined} undefined
 */
DOMRenderer.prototype.setContent = function setContent(content) {
    this._assertTargetLoaded();

    if (this._target.formElement) {
        this._target.element.value = content;
    }
    else {
        if (!this._target.content) {
            this._target.content = document.createElement('div');
            this._target.content.classList.add('famous-dom-element-content');
            this._target.element.insertBefore(
                this._target.content,
                this._target.element.firstChild
            );
        }
        this._target.content.innerHTML = content;
    }


    this.setSize(
        this._target.explicitWidth ? false : this._target.size[0],
        this._target.explicitHeight ? false : this._target.size[1]
    );
};


/**
 * Sets the passed in transform matrix (world space). Inverts the parent's world
 * transform.
 *
 * @method
 *
 * @param {Float32Array} transform The transform for the loaded DOM Element in world space
 *
 * @return {undefined} undefined
 */
DOMRenderer.prototype.setMatrix = function setMatrix (transform) {
    this._assertTargetLoaded();
    this._target.element.style[TRANSFORM] = this._stringifyMatrix(transform);
};


/**
 * Adds a class to the classList associated with the currently loaded target.
 *
 * @method
 *
 * @param {String} domClass Class name to be added to the current target.
 *
 * @return {undefined} undefined
 */
DOMRenderer.prototype.addClass = function addClass(domClass) {
    this._assertTargetLoaded();
    this._target.element.classList.add(domClass);
};


/**
 * Removes a class from the classList associated with the currently loaded
 * target.
 *
 * @method
 *
 * @param {String} domClass Class name to be removed from currently loaded target.
 *
 * @return {undefined} undefined
 */
DOMRenderer.prototype.removeClass = function removeClass(domClass) {
    this._assertTargetLoaded();
    this._target.element.classList.remove(domClass);
};


/**
 * Stringifies the passed in matrix for setting the `transform` property.
 *
 * @method  _stringifyMatrix
 * @private
 *
 * @param {Array} m    Matrix as an array or array-like object.
 * @return {String}     Stringified matrix as `matrix3d`-property.
 */
DOMRenderer.prototype._stringifyMatrix = function _stringifyMatrix(m) {
    var r = 'matrix3d(';

    r += (m[0] < 0.000001 && m[0] > -0.000001) ? '0,' : m[0] + ',';
    r += (m[1] < 0.000001 && m[1] > -0.000001) ? '0,' : m[1] + ',';
    r += (m[2] < 0.000001 && m[2] > -0.000001) ? '0,' : m[2] + ',';
    r += (m[3] < 0.000001 && m[3] > -0.000001) ? '0,' : m[3] + ',';
    r += (m[4] < 0.000001 && m[4] > -0.000001) ? '0,' : m[4] + ',';
    r += (m[5] < 0.000001 && m[5] > -0.000001) ? '0,' : m[5] + ',';
    r += (m[6] < 0.000001 && m[6] > -0.000001) ? '0,' : m[6] + ',';
    r += (m[7] < 0.000001 && m[7] > -0.000001) ? '0,' : m[7] + ',';
    r += (m[8] < 0.000001 && m[8] > -0.000001) ? '0,' : m[8] + ',';
    r += (m[9] < 0.000001 && m[9] > -0.000001) ? '0,' : m[9] + ',';
    r += (m[10] < 0.000001 && m[10] > -0.000001) ? '0,' : m[10] + ',';
    r += (m[11] < 0.000001 && m[11] > -0.000001) ? '0,' : m[11] + ',';
    r += (m[12] < 0.000001 && m[12] > -0.000001) ? '0,' : m[12] + ',';
    r += (m[13] < 0.000001 && m[13] > -0.000001) ? '0,' : m[13] + ',';
    r += (m[14] < 0.000001 && m[14] > -0.000001) ? '0,' : m[14] + ',';

    r += m[15] + ')';
    return r;
};

/**
 * Registers a function to be executed when a new element is being inserted at
 * the specified path.
 *
 * @method
 *
 * @param  {String}   path      Path at which to listen for element insertion.
 * @param  {Function} callback  Function to be executed when an insertion
 *                              occurs.
 * @return {DOMRenderer}        this
 */
DOMRenderer.prototype.onInsertEl = function onInsertEl(path, callback) {
    this._insertElCallbackStore.on(path, callback);
    return this;
};

/**
 * Deregisters a listener function to be no longer executed on future element
 * insertions at the specified path.
 *
 * @method
 *
 * @param  {String}   path      Path at which the listener function has been
 *                              registered.
 * @param  {Function} callback  Callback function to be deregistered.
 * @return {DOMRenderer}        this
 */
DOMRenderer.prototype.offInsertEl = function offInsertEl(path, callback) {
    this._insertElCallbackStore.off(path, callback);
    return this;
};

/**
 * Registers an event handler to be triggered as soon as an element at the
 * specified path is being removed.
 *
 * @method
 *
 * @param  {String}   path      Path at which to listen for the removal of an
 *                              element.
 * @param  {Function} callback  Function to be executed when an element is
 *                              being removed at the specified path.
 * @return {DOMRenderer}        this
 */
DOMRenderer.prototype.onRemoveEl = function onRemoveEl(path, callback) {
    this._removeElCallbackStore.on(path, callback);
    return this;
};

/**
 * Deregisters a listener function to be no longer executed when an element is
 * being removed from the specified path.
 *
 * @method
 *
 * @param  {String}   path      Path at which the listener function has been
 *                              registered.
 * @param  {Function} callback  Callback function to be deregistered.
 * @return {DOMRenderer}        this
 */
DOMRenderer.prototype.offRemoveEl = function offRemoveEl(path, callback) {
    this._removeElCallbackStore.off(path, callback);
    return this;
};

module.exports = DOMRenderer;

},{"../core/Path":20,"../utilities/CallbackStore":94,"../utilities/vendorPrefix":105,"./ElementCache":31,"./Math":32,"./events/EventMap":36}],31:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

var VoidElements = require('./VoidElements');

/**
 * ElementCache is being used for keeping track of an element's DOM Element,
 * path, world transform, inverted parent, final transform (as being used for
 * setting the actual `transform`-property) and post render size (final size as
 * being rendered to the DOM).
 *
 * @class ElementCache
 *
 * @param {Element} element DOMElement
 * @param {String} path Path used for uniquely identifying the location in the
 *                      scene graph.
 */
function ElementCache (element, path) {
    this.tagName = element.tagName.toLowerCase();
    this.void = VoidElements[this.tagName];

    var constructor = element.constructor;

    this.formElement = constructor === HTMLInputElement ||
        constructor === HTMLTextAreaElement ||
        constructor === HTMLSelectElement;

    this.element = element;
    this.path = path;
    this.content = null;
    this.size = new Int16Array(3);
    this.explicitHeight = false;
    this.explicitWidth = false;
    this.postRenderSize = new Float32Array(2);
    this.listeners = {};
    this.preventDefault = {};
    this.subscribe = {};
}

module.exports = ElementCache;

},{"./VoidElements":33}],32:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

/**
 * A method for inverting a transform matrix
 *
 * @method
 *
 * @param {Array} out array to store the return of the inversion
 * @param {Array} a transform matrix to inverse
 *
 * @return {Array} out
 *   output array that is storing the transform matrix
 */
function invert (out, a) {
    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
        a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
        a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
        a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15],

        b00 = a00 * a11 - a01 * a10,
        b01 = a00 * a12 - a02 * a10,
        b02 = a00 * a13 - a03 * a10,
        b03 = a01 * a12 - a02 * a11,
        b04 = a01 * a13 - a03 * a11,
        b05 = a02 * a13 - a03 * a12,
        b06 = a20 * a31 - a21 * a30,
        b07 = a20 * a32 - a22 * a30,
        b08 = a20 * a33 - a23 * a30,
        b09 = a21 * a32 - a22 * a31,
        b10 = a21 * a33 - a23 * a31,
        b11 = a22 * a33 - a23 * a32,

        // Calculate the determinant
        det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

    if (!det) {
        return null;
    }
    det = 1.0 / det;

    out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
    out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
    out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
    out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
    out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
    out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
    out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
    out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
    out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
    out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
    out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
    out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
    out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
    out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
    out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
    out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;

    return out;
}

/**
 * A method for multiplying two matricies
 *
 * @method
 *
 * @param {Array} out array to store the return of the multiplication
 * @param {Array} a transform matrix to multiply
 * @param {Array} b transform matrix to multiply
 *
 * @return {Array} out
 *   output array that is storing the transform matrix
 */
function multiply (out, a, b) {
    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
        a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
        a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
        a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15],

        b0 = b[0], b1 = b[1], b2 = b[2], b3 = b[3],
        b4 = b[4], b5 = b[5], b6 = b[6], b7 = b[7],
        b8 = b[8], b9 = b[9], b10 = b[10], b11 = b[11],
        b12 = b[12], b13 = b[13], b14 = b[14], b15 = b[15];

    var changed = false;
    var out0, out1, out2, out3;

    out0 = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    out1 = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    out2 = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    out3 = b0*a03 + b1*a13 + b2*a23 + b3*a33;

    changed = changed ?
              changed : out0 === out[0] ||
                        out1 === out[1] ||
                        out2 === out[2] ||
                        out3 === out[3];

    out[0] = out0;
    out[1] = out1;
    out[2] = out2;
    out[3] = out3;

    b0 = b4; b1 = b5; b2 = b6; b3 = b7;
    out0 = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    out1 = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    out2 = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    out3 = b0*a03 + b1*a13 + b2*a23 + b3*a33;

    changed = changed ?
              changed : out0 === out[4] ||
                        out1 === out[5] ||
                        out2 === out[6] ||
                        out3 === out[7];

    out[4] = out0;
    out[5] = out1;
    out[6] = out2;
    out[7] = out3;

    b0 = b8; b1 = b9; b2 = b10; b3 = b11;
    out0 = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    out1 = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    out2 = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    out3 = b0*a03 + b1*a13 + b2*a23 + b3*a33;

    changed = changed ?
              changed : out0 === out[8] ||
                        out1 === out[9] ||
                        out2 === out[10] ||
                        out3 === out[11];

    out[8] = out0;
    out[9] = out1;
    out[10] = out2;
    out[11] = out3;

    b0 = b12; b1 = b13; b2 = b14; b3 = b15;
    out0 = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    out1 = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    out2 = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    out3 = b0*a03 + b1*a13 + b2*a23 + b3*a33;

    changed = changed ?
              changed : out0 === out[12] ||
                        out1 === out[13] ||
                        out2 === out[14] ||
                        out3 === out[15];

    out[12] = out0;
    out[13] = out1;
    out[14] = out2;
    out[15] = out3;

    return out;
}

module.exports = {
    multiply: multiply,
    invert: invert
};

},{}],33:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

/**
 * Map of void elements as defined by the
 * [HTML5 spec](http://www.w3.org/TR/html5/syntax.html#elements-0).
 *
 * @type {Object}
 */
var VoidElements = {
    area  : true,
    base  : true,
    br    : true,
    col   : true,
    embed : true,
    hr    : true,
    img   : true,
    input : true,
    keygen: true,
    link  : true,
    meta  : true,
    param : true,
    source: true,
    track : true,
    wbr   : true
};

module.exports = VoidElements;

},{}],34:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

var UIEvent = require('./UIEvent');

/**
 * See [UI Events (formerly DOM Level 3 Events)](http://www.w3.org/TR/2015/WD-uievents-20150428/#events-compositionevents).
 *
 * @class CompositionEvent
 * @augments UIEvent
 *
 * @param {Event} ev The native DOM event.
 */
function CompositionEvent(ev) {
    // [Constructor(DOMString typeArg, optional CompositionEventInit compositionEventInitDict)]
    // interface CompositionEvent : UIEvent {
    //     readonly    attribute DOMString data;
    // };

    UIEvent.call(this, ev);

    /**
     * @name CompositionEvent#data
     * @type String
     */
    this.data = ev.data;
}

CompositionEvent.prototype = Object.create(UIEvent.prototype);
CompositionEvent.prototype.constructor = CompositionEvent;

/**
 * Return the name of the event type
 *
 * @method
 *
 * @return {String} Name of the event type
 */
CompositionEvent.prototype.toString = function toString () {
    return 'CompositionEvent';
};

module.exports = CompositionEvent;

},{"./UIEvent":42}],35:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

/**
 * The Event class is being used in order to normalize native DOM events.
 * Events need to be normalized in order to be serialized through the structured
 * cloning algorithm used by the `postMessage` method (Web Workers).
 *
 * Wrapping DOM events also has the advantage of providing a consistent
 * interface for interacting with DOM events across browsers by copying over a
 * subset of the exposed properties that is guaranteed to be consistent across
 * browsers.
 *
 * See [UI Events (formerly DOM Level 3 Events)](http://www.w3.org/TR/2015/WD-uievents-20150428/#interface-Event).
 *
 * @class Event
 *
 * @param {Event} ev The native DOM event.
 */
function Event(ev) {
    // [Constructor(DOMString type, optional EventInit eventInitDict),
    //  Exposed=Window,Worker]
    // interface Event {
    //   readonly attribute DOMString type;
    //   readonly attribute EventTarget? target;
    //   readonly attribute EventTarget? currentTarget;

    //   const unsigned short NONE = 0;
    //   const unsigned short CAPTURING_PHASE = 1;
    //   const unsigned short AT_TARGET = 2;
    //   const unsigned short BUBBLING_PHASE = 3;
    //   readonly attribute unsigned short eventPhase;

    //   void stopPropagation();
    //   void stopImmediatePropagation();

    //   readonly attribute boolean bubbles;
    //   readonly attribute boolean cancelable;
    //   void preventDefault();
    //   readonly attribute boolean defaultPrevented;

    //   [Unforgeable] readonly attribute boolean isTrusted;
    //   readonly attribute DOMTimeStamp timeStamp;

    //   void initEvent(DOMString type, boolean bubbles, boolean cancelable);
    // };

    /**
     * @name Event#type
     * @type String
     */
    this.type = ev.type;

    /**
     * @name Event#defaultPrevented
     * @type Boolean
     */
    this.defaultPrevented = ev.defaultPrevented;

    /**
     * @name Event#timeStamp
     * @type Number
     */
    this.timeStamp = ev.timeStamp;


    /**
     * Used for exposing the current target's value.
     *
     * @name Event#value
     * @type String
     */
    var targetConstructor = ev.target.constructor;
    // TODO Support HTMLKeygenElement
    if (
        targetConstructor === HTMLInputElement ||
        targetConstructor === HTMLTextAreaElement ||
        targetConstructor === HTMLSelectElement
    ) {
        this.value = ev.target.value;
    }
}

/**
 * Return the name of the event type
 *
 * @method
 *
 * @return {String} Name of the event type
 */
Event.prototype.toString = function toString () {
    return 'Event';
};

module.exports = Event;

},{}],36:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

var CompositionEvent = require('./CompositionEvent');
var Event = require('./Event');
var FocusEvent = require('./FocusEvent');
var InputEvent = require('./InputEvent');
var KeyboardEvent = require('./KeyboardEvent');
var MouseEvent = require('./MouseEvent');
var TouchEvent = require('./TouchEvent');
var UIEvent = require('./UIEvent');
var WheelEvent = require('./WheelEvent');

/**
 * A mapping of DOM events to the corresponding handlers
 *
 * @name EventMap
 * @type Object
 */
var EventMap = {
    change                         : [Event, true],
    submit                         : [Event, true],

    // UI Events (http://www.w3.org/TR/uievents/)
    abort                          : [Event, false],
    beforeinput                    : [InputEvent, true],
    blur                           : [FocusEvent, false],
    click                          : [MouseEvent, true],
    compositionend                 : [CompositionEvent, true],
    compositionstart               : [CompositionEvent, true],
    compositionupdate              : [CompositionEvent, true],
    dblclick                       : [MouseEvent, true],
    focus                          : [FocusEvent, false],
    focusin                        : [FocusEvent, true],
    focusout                       : [FocusEvent, true],
    input                          : [InputEvent, true],
    keydown                        : [KeyboardEvent, true],
    keyup                          : [KeyboardEvent, true],
    load                           : [Event, false],
    mousedown                      : [MouseEvent, true],
    mouseenter                     : [MouseEvent, false],
    mouseleave                     : [MouseEvent, false],

    // bubbles, but will be triggered very frequently
    mousemove                      : [MouseEvent, false],

    mouseout                       : [MouseEvent, true],
    mouseover                      : [MouseEvent, true],
    mouseup                        : [MouseEvent, true],
    contextMenu                    : [MouseEvent, true],
    resize                         : [UIEvent, false],

    // might bubble
    scroll                         : [UIEvent, false],

    select                         : [Event, true],
    unload                         : [Event, false],
    wheel                          : [WheelEvent, true],

    // Touch Events Extension (http://www.w3.org/TR/touch-events-extensions/)
    touchcancel                    : [TouchEvent, true],
    touchend                       : [TouchEvent, true],
    touchmove                      : [TouchEvent, true],
    touchstart                     : [TouchEvent, true]
};

module.exports = EventMap;

},{"./CompositionEvent":34,"./Event":35,"./FocusEvent":37,"./InputEvent":38,"./KeyboardEvent":39,"./MouseEvent":40,"./TouchEvent":41,"./UIEvent":42,"./WheelEvent":43}],37:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

var UIEvent = require('./UIEvent');

/**
 * See [UI Events (formerly DOM Level 3 Events)](http://www.w3.org/TR/2015/WD-uievents-20150428/#events-focusevent).
 *
 * @class FocusEvent
 * @augments UIEvent
 *
 * @param {Event} ev The native DOM event.
 */
function FocusEvent(ev) {
    // [Constructor(DOMString typeArg, optional FocusEventInit focusEventInitDict)]
    // interface FocusEvent : UIEvent {
    //     readonly    attribute EventTarget? relatedTarget;
    // };

    UIEvent.call(this, ev);
}

FocusEvent.prototype = Object.create(UIEvent.prototype);
FocusEvent.prototype.constructor = FocusEvent;

/**
 * Return the name of the event type
 *
 * @method
 *
 * @return {String} Name of the event type
 */
FocusEvent.prototype.toString = function toString () {
    return 'FocusEvent';
};

module.exports = FocusEvent;

},{"./UIEvent":42}],38:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

var UIEvent = require('./UIEvent');

/**
 * See [Input Events](http://w3c.github.io/editing-explainer/input-events.html#idl-def-InputEvent).
 *
 * @class InputEvent
 * @augments UIEvent
 *
 * @param {Event} ev The native DOM event.
 */
function InputEvent(ev) {
    // [Constructor(DOMString typeArg, optional InputEventInit inputEventInitDict)]
    // interface InputEvent : UIEvent {
    //     readonly    attribute DOMString inputType;
    //     readonly    attribute DOMString data;
    //     readonly    attribute boolean   isComposing;
    //     readonly    attribute Range     targetRange;
    // };

    UIEvent.call(this, ev);

    /**
     * @name    InputEvent#inputType
     * @type    String
     */
    this.inputType = ev.inputType;

    /**
     * @name    InputEvent#data
     * @type    String
     */
    this.data = ev.data;

    /**
     * @name    InputEvent#isComposing
     * @type    Boolean
     */
    this.isComposing = ev.isComposing;

    /**
     * **Limited browser support**.
     *
     * @name    InputEvent#targetRange
     * @type    Boolean
     */
    this.targetRange = ev.targetRange;
}

InputEvent.prototype = Object.create(UIEvent.prototype);
InputEvent.prototype.constructor = InputEvent;

/**
 * Return the name of the event type
 *
 * @method
 *
 * @return {String} Name of the event type
 */
InputEvent.prototype.toString = function toString () {
    return 'InputEvent';
};

module.exports = InputEvent;

},{"./UIEvent":42}],39:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

var UIEvent = require('./UIEvent');

/**
 * See [UI Events (formerly DOM Level 3 Events)](http://www.w3.org/TR/2015/WD-uievents-20150428/#events-keyboardevents).
 *
 * @class KeyboardEvent
 * @augments UIEvent
 *
 * @param {Event} ev The native DOM event.
 */
function KeyboardEvent(ev) {
    // [Constructor(DOMString typeArg, optional KeyboardEventInit keyboardEventInitDict)]
    // interface KeyboardEvent : UIEvent {
    //     // KeyLocationCode
    //     const unsigned long DOM_KEY_LOCATION_STANDARD = 0x00;
    //     const unsigned long DOM_KEY_LOCATION_LEFT = 0x01;
    //     const unsigned long DOM_KEY_LOCATION_RIGHT = 0x02;
    //     const unsigned long DOM_KEY_LOCATION_NUMPAD = 0x03;
    //     readonly    attribute DOMString     key;
    //     readonly    attribute DOMString     code;
    //     readonly    attribute unsigned long location;
    //     readonly    attribute boolean       ctrlKey;
    //     readonly    attribute boolean       shiftKey;
    //     readonly    attribute boolean       altKey;
    //     readonly    attribute boolean       metaKey;
    //     readonly    attribute boolean       repeat;
    //     readonly    attribute boolean       isComposing;
    //     boolean getModifierState (DOMString keyArg);
    // };

    UIEvent.call(this, ev);

    /**
     * @name KeyboardEvent#DOM_KEY_LOCATION_STANDARD
     * @type Number
     */
    this.DOM_KEY_LOCATION_STANDARD = 0x00;

    /**
     * @name KeyboardEvent#DOM_KEY_LOCATION_LEFT
     * @type Number
     */
    this.DOM_KEY_LOCATION_LEFT = 0x01;

    /**
     * @name KeyboardEvent#DOM_KEY_LOCATION_RIGHT
     * @type Number
     */
    this.DOM_KEY_LOCATION_RIGHT = 0x02;

    /**
     * @name KeyboardEvent#DOM_KEY_LOCATION_NUMPAD
     * @type Number
     */
    this.DOM_KEY_LOCATION_NUMPAD = 0x03;

    /**
     * @name KeyboardEvent#key
     * @type String
     */
    this.key = ev.key;

    /**
     * @name KeyboardEvent#code
     * @type String
     */
    this.code = ev.code;

    /**
     * @name KeyboardEvent#location
     * @type Number
     */
    this.location = ev.location;

    /**
     * @name KeyboardEvent#ctrlKey
     * @type Boolean
     */
    this.ctrlKey = ev.ctrlKey;

    /**
     * @name KeyboardEvent#shiftKey
     * @type Boolean
     */
    this.shiftKey = ev.shiftKey;

    /**
     * @name KeyboardEvent#altKey
     * @type Boolean
     */
    this.altKey = ev.altKey;

    /**
     * @name KeyboardEvent#metaKey
     * @type Boolean
     */
    this.metaKey = ev.metaKey;

    /**
     * @name KeyboardEvent#repeat
     * @type Boolean
     */
    this.repeat = ev.repeat;

    /**
     * @name KeyboardEvent#isComposing
     * @type Boolean
     */
    this.isComposing = ev.isComposing;

    /**
     * @name KeyboardEvent#keyCode
     * @type String
     * @deprecated
     */
    this.keyCode = ev.keyCode;
}

KeyboardEvent.prototype = Object.create(UIEvent.prototype);
KeyboardEvent.prototype.constructor = KeyboardEvent;

/**
 * Return the name of the event type
 *
 * @method
 *
 * @return {String} Name of the event type
 */
KeyboardEvent.prototype.toString = function toString () {
    return 'KeyboardEvent';
};

module.exports = KeyboardEvent;

},{"./UIEvent":42}],40:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

var UIEvent = require('./UIEvent');

/**
 * See [UI Events (formerly DOM Level 3 Events)](http://www.w3.org/TR/2015/WD-uievents-20150428/#events-mouseevents).
 *
 * @class KeyboardEvent
 * @augments UIEvent
 *
 * @param {Event} ev The native DOM event.
 */
function MouseEvent(ev) {
    // [Constructor(DOMString typeArg, optional MouseEventInit mouseEventInitDict)]
    // interface MouseEvent : UIEvent {
    //     readonly    attribute long           screenX;
    //     readonly    attribute long           screenY;
    //     readonly    attribute long           clientX;
    //     readonly    attribute long           clientY;
    //     readonly    attribute boolean        ctrlKey;
    //     readonly    attribute boolean        shiftKey;
    //     readonly    attribute boolean        altKey;
    //     readonly    attribute boolean        metaKey;
    //     readonly    attribute short          button;
    //     readonly    attribute EventTarget?   relatedTarget;
    //     // Introduced in this specification
    //     readonly    attribute unsigned short buttons;
    //     boolean getModifierState (DOMString keyArg);
    // };

    UIEvent.call(this, ev);

    /**
     * @name MouseEvent#screenX
     * @type Number
     */
    this.screenX = ev.screenX;

    /**
     * @name MouseEvent#screenY
     * @type Number
     */
    this.screenY = ev.screenY;

    /**
     * @name MouseEvent#clientX
     * @type Number
     */
    this.clientX = ev.clientX;

    /**
     * @name MouseEvent#clientY
     * @type Number
     */
    this.clientY = ev.clientY;

    /**
     * @name MouseEvent#ctrlKey
     * @type Boolean
     */
    this.ctrlKey = ev.ctrlKey;

    /**
     * @name MouseEvent#shiftKey
     * @type Boolean
     */
    this.shiftKey = ev.shiftKey;

    /**
     * @name MouseEvent#altKey
     * @type Boolean
     */
    this.altKey = ev.altKey;

    /**
     * @name MouseEvent#metaKey
     * @type Boolean
     */
    this.metaKey = ev.metaKey;

    /**
     * @type MouseEvent#button
     * @type Number
     */
    this.button = ev.button;

    /**
     * @type MouseEvent#buttons
     * @type Number
     */
    this.buttons = ev.buttons;

    /**
     * @type MouseEvent#pageX
     * @type Number
     */
    this.pageX = ev.pageX;

    /**
     * @type MouseEvent#pageY
     * @type Number
     */
    this.pageY = ev.pageY;

    /**
     * @type MouseEvent#x
     * @type Number
     */
    this.x = ev.x;

    /**
     * @type MouseEvent#y
     * @type Number
     */
    this.y = ev.y;

    /**
     * @type MouseEvent#offsetX
     * @type Number
     */
    this.offsetX = ev.offsetX;

    /**
     * @type MouseEvent#offsetY
     * @type Number
     */
    this.offsetY = ev.offsetY;
}

MouseEvent.prototype = Object.create(UIEvent.prototype);
MouseEvent.prototype.constructor = MouseEvent;

/**
 * Return the name of the event type
 *
 * @method
 *
 * @return {String} Name of the event type
 */
MouseEvent.prototype.toString = function toString () {
    return 'MouseEvent';
};

module.exports = MouseEvent;

},{"./UIEvent":42}],41:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

var UIEvent = require('./UIEvent');

var EMPTY_ARRAY = [];

/**
 * See [Touch Interface](http://www.w3.org/TR/2013/REC-touch-events-20131010/#touch-interface).
 *
 * @class Touch
 * @private
 *
 * @param {Touch} touch The native Touch object.
 */
function Touch(touch) {
    // interface Touch {
    //     readonly    attribute long        identifier;
    //     readonly    attribute EventTarget target;
    //     readonly    attribute double      screenX;
    //     readonly    attribute double      screenY;
    //     readonly    attribute double      clientX;
    //     readonly    attribute double      clientY;
    //     readonly    attribute double      pageX;
    //     readonly    attribute double      pageY;
    // };

    /**
     * @name Touch#identifier
     * @type Number
     */
    this.identifier = touch.identifier;

    /**
     * @name Touch#screenX
     * @type Number
     */
    this.screenX = touch.screenX;

    /**
     * @name Touch#screenY
     * @type Number
     */
    this.screenY = touch.screenY;

    /**
     * @name Touch#clientX
     * @type Number
     */
    this.clientX = touch.clientX;

    /**
     * @name Touch#clientY
     * @type Number
     */
    this.clientY = touch.clientY;

    /**
     * @name Touch#pageX
     * @type Number
     */
    this.pageX = touch.pageX;

    /**
     * @name Touch#pageY
     * @type Number
     */
    this.pageY = touch.pageY;
}


/**
 * Normalizes the browser's native TouchList by converting it into an array of
 * normalized Touch objects.
 *
 * @method  cloneTouchList
 * @private
 *
 * @param  {TouchList} touchList    The native TouchList array.
 * @return {Array.<Touch>}          An array of normalized Touch objects.
 */
function cloneTouchList(touchList) {
    if (!touchList) return EMPTY_ARRAY;
    // interface TouchList {
    //     readonly    attribute unsigned long length;
    //     getter Touch? item (unsigned long index);
    // };

    var touchListArray = [];
    for (var i = 0; i < touchList.length; i++) {
        touchListArray[i] = new Touch(touchList[i]);
    }
    return touchListArray;
}

/**
 * See [Touch Event Interface](http://www.w3.org/TR/2013/REC-touch-events-20131010/#touchevent-interface).
 *
 * @class TouchEvent
 * @augments UIEvent
 *
 * @param {Event} ev The native DOM event.
 */
function TouchEvent(ev) {
    // interface TouchEvent : UIEvent {
    //     readonly    attribute TouchList touches;
    //     readonly    attribute TouchList targetTouches;
    //     readonly    attribute TouchList changedTouches;
    //     readonly    attribute boolean   altKey;
    //     readonly    attribute boolean   metaKey;
    //     readonly    attribute boolean   ctrlKey;
    //     readonly    attribute boolean   shiftKey;
    // };
    UIEvent.call(this, ev);

    /**
     * @name TouchEvent#touches
     * @type Array.<Touch>
     */
    this.touches = cloneTouchList(ev.touches);

    /**
     * @name TouchEvent#targetTouches
     * @type Array.<Touch>
     */
    this.targetTouches = cloneTouchList(ev.targetTouches);

    /**
     * @name TouchEvent#changedTouches
     * @type TouchList
     */
    this.changedTouches = cloneTouchList(ev.changedTouches);

    /**
     * @name TouchEvent#altKey
     * @type Boolean
     */
    this.altKey = ev.altKey;

    /**
     * @name TouchEvent#metaKey
     * @type Boolean
     */
    this.metaKey = ev.metaKey;

    /**
     * @name TouchEvent#ctrlKey
     * @type Boolean
     */
    this.ctrlKey = ev.ctrlKey;

    /**
     * @name TouchEvent#shiftKey
     * @type Boolean
     */
    this.shiftKey = ev.shiftKey;
}

TouchEvent.prototype = Object.create(UIEvent.prototype);
TouchEvent.prototype.constructor = TouchEvent;

/**
 * Return the name of the event type
 *
 * @method
 *
 * @return {String} Name of the event type
 */
TouchEvent.prototype.toString = function toString () {
    return 'TouchEvent';
};

module.exports = TouchEvent;

},{"./UIEvent":42}],42:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

var Event = require('./Event');

/**
 * See [UI Events (formerly DOM Level 3 Events)](http://www.w3.org/TR/2015/WD-uievents-20150428).
 *
 * @class UIEvent
 * @augments Event
 *
 * @param  {Event} ev   The native DOM event.
 */
function UIEvent(ev) {
    // [Constructor(DOMString type, optional UIEventInit eventInitDict)]
    // interface UIEvent : Event {
    //     readonly    attribute Window? view;
    //     readonly    attribute long    detail;
    // };
    Event.call(this, ev);

    /**
     * @name UIEvent#detail
     * @type Number
     */
    this.detail = ev.detail;
}

UIEvent.prototype = Object.create(Event.prototype);
UIEvent.prototype.constructor = UIEvent;

/**
 * Return the name of the event type
 *
 * @method
 *
 * @return {String} Name of the event type
 */
UIEvent.prototype.toString = function toString () {
    return 'UIEvent';
};

module.exports = UIEvent;

},{"./Event":35}],43:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

var MouseEvent = require('./MouseEvent');

/**
 * See [UI Events (formerly DOM Level 3 Events)](http://www.w3.org/TR/2015/WD-uievents-20150428/#events-wheelevents).
 *
 * @class WheelEvent
 * @augments UIEvent
 *
 * @param {Event} ev The native DOM event.
 */
function WheelEvent(ev) {
    // [Constructor(DOMString typeArg, optional WheelEventInit wheelEventInitDict)]
    // interface WheelEvent : MouseEvent {
    //     // DeltaModeCode
    //     const unsigned long DOM_DELTA_PIXEL = 0x00;
    //     const unsigned long DOM_DELTA_LINE = 0x01;
    //     const unsigned long DOM_DELTA_PAGE = 0x02;
    //     readonly    attribute double        deltaX;
    //     readonly    attribute double        deltaY;
    //     readonly    attribute double        deltaZ;
    //     readonly    attribute unsigned long deltaMode;
    // };

    MouseEvent.call(this, ev);

    /**
     * @name WheelEvent#DOM_DELTA_PIXEL
     * @type Number
     */
    this.DOM_DELTA_PIXEL = 0x00;

    /**
     * @name WheelEvent#DOM_DELTA_LINE
     * @type Number
     */
    this.DOM_DELTA_LINE = 0x01;

    /**
     * @name WheelEvent#DOM_DELTA_PAGE
     * @type Number
     */
    this.DOM_DELTA_PAGE = 0x02;

    /**
     * @name WheelEvent#deltaX
     * @type Number
     */
    this.deltaX = ev.deltaX;

    /**
     * @name WheelEvent#deltaY
     * @type Number
     */
    this.deltaY = ev.deltaY;

    /**
     * @name WheelEvent#deltaZ
     * @type Number
     */
    this.deltaZ = ev.deltaZ;

    /**
     * @name WheelEvent#deltaMode
     * @type Number
     */
    this.deltaMode = ev.deltaMode;
}

WheelEvent.prototype = Object.create(MouseEvent.prototype);
WheelEvent.prototype.constructor = WheelEvent;

/**
 * Return the name of the event type
 *
 * @method
 *
 * @return {String} Name of the event type
 */
WheelEvent.prototype.toString = function toString () {
    return 'WheelEvent';
};

module.exports = WheelEvent;

},{"./MouseEvent":40}],44:[function(require,module,exports){
/**
 * The MIT License (MIT)
 * 
 * Copyright (c) 2015 Famous Industries Inc.
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

module.exports = {
    CompositionEvent: require('./CompositionEvent'),
    Event: require('./Event'),
    EventMap: require('./EventMap'),
    FocusEvent: require('./FocusEvent'),
    InputEvent: require('./InputEvent'),
    KeyboardEvent: require('./KeyboardEvent'),
    MouseEvent: require('./MouseEvent'),
    TouchEvent: require('./TouchEvent'),
    UIEvent: require('./UIEvent'),
    WheelEvent: require('./WheelEvent')
};


},{"./CompositionEvent":34,"./Event":35,"./EventMap":36,"./FocusEvent":37,"./InputEvent":38,"./KeyboardEvent":39,"./MouseEvent":40,"./TouchEvent":41,"./UIEvent":42,"./WheelEvent":43}],45:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

module.exports = {
    DOMRenderer: require('./DOMRenderer'),
    ElementCache: require('./ElementCache'),
    Events: require('./events'),
    Math: require('./Math'),
    VoidElements: require('./VoidElements')
};

},{"./DOMRenderer":30,"./ElementCache":31,"./Math":32,"./VoidElements":33,"./events":44}],46:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

module.exports = {
    components: require('./components'),
    core: require('./core'),
    renderLoops: require('./render-loops'),
    domRenderables: require('./dom-renderables'),
    domRenderers: require('./dom-renderers'),
    math: require('./math'),
    physics: require('./physics'),
    renderers: require('./renderers'),
    transitions: require('./transitions'),
    utilities: require('./utilities'),
    webglRenderables: require('./webgl-renderables'),
    webglRenderers: require('./webgl-renderers'),
    webglGeometries: require('./webgl-geometries'),
    webglMaterials: require('./webgl-materials'),
    webglShaders: require('./webgl-shaders'),
    polyfills: require('./polyfills')
};

},{"./components":12,"./core":27,"./dom-renderables":29,"./dom-renderers":45,"./math":51,"./physics":79,"./polyfills":81,"./render-loops":84,"./renderers":89,"./transitions":93,"./utilities":101,"./webgl-geometries":110,"./webgl-materials":124,"./webgl-renderables":126,"./webgl-renderers":139,"./webgl-shaders":141}],47:[function(require,module,exports){
/**
 * The MIT License (MIT)
 * 
 * Copyright (c) 2015 Famous Industries Inc.
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

/**
 * A 3x3 numerical matrix, represented as an array.
 *
 * @class Mat33
 *
 * @param {Array} values a 3x3 matrix flattened
 */
function Mat33(values) {
    this.values = values || [1,0,0,0,1,0,0,0,1];
}

/**
 * Return the values in the Mat33 as an array.
 *
 * @method
 *
 * @return {Array} matrix values as array of rows.
 */
Mat33.prototype.get = function get() {
    return this.values;
};

/**
 * Set the values of the current Mat33.
 *
 * @method
 *
 * @param {Array} values Array of nine numbers to set in the Mat33.
 *
 * @return {Mat33} this
 */
Mat33.prototype.set = function set(values) {
    this.values = values;
    return this;
};

/**
 * Copy the values of the input Mat33.
 *
 * @method
 *
 * @param {Mat33} matrix The Mat33 to copy.
 * 
 * @return {Mat33} this
 */
Mat33.prototype.copy = function copy(matrix) {
    var A = this.values;
    var B = matrix.values;

    A[0] = B[0];
    A[1] = B[1];
    A[2] = B[2];
    A[3] = B[3];
    A[4] = B[4];
    A[5] = B[5];
    A[6] = B[6];
    A[7] = B[7];
    A[8] = B[8];

    return this;
};

/**
 * Take this Mat33 as A, input vector V as a column vector, and return Mat33 product (A)(V).
 *
 * @method
 *
 * @param {Vec3} v Vector to rotate.
 * @param {Vec3} output Vec3 in which to place the result.
 *
 * @return {Vec3} The input vector after multiplication.
 */
Mat33.prototype.vectorMultiply = function vectorMultiply(v, output) {
    var M = this.values;
    var v0 = v.x;
    var v1 = v.y;
    var v2 = v.z;

    output.x = M[0]*v0 + M[1]*v1 + M[2]*v2;
    output.y = M[3]*v0 + M[4]*v1 + M[5]*v2;
    output.z = M[6]*v0 + M[7]*v1 + M[8]*v2;

    return output;
};

/**
 * Multiply the provided Mat33 with the current Mat33.  Result is (this) * (matrix).
 *
 * @method
 *
 * @param {Mat33} matrix Input Mat33 to multiply on the right.
 *
 * @return {Mat33} this
 */
Mat33.prototype.multiply = function multiply(matrix) {
    var A = this.values;
    var B = matrix.values;

    var A0 = A[0];
    var A1 = A[1];
    var A2 = A[2];
    var A3 = A[3];
    var A4 = A[4];
    var A5 = A[5];
    var A6 = A[6];
    var A7 = A[7];
    var A8 = A[8];

    var B0 = B[0];
    var B1 = B[1];
    var B2 = B[2];
    var B3 = B[3];
    var B4 = B[4];
    var B5 = B[5];
    var B6 = B[6];
    var B7 = B[7];
    var B8 = B[8];

    A[0] = A0*B0 + A1*B3 + A2*B6;
    A[1] = A0*B1 + A1*B4 + A2*B7;
    A[2] = A0*B2 + A1*B5 + A2*B8;
    A[3] = A3*B0 + A4*B3 + A5*B6;
    A[4] = A3*B1 + A4*B4 + A5*B7;
    A[5] = A3*B2 + A4*B5 + A5*B8;
    A[6] = A6*B0 + A7*B3 + A8*B6;
    A[7] = A6*B1 + A7*B4 + A8*B7;
    A[8] = A6*B2 + A7*B5 + A8*B8;

    return this;
};

/**
 * Transposes the Mat33.
 *
 * @method
 *
 * @return {Mat33} this
 */
Mat33.prototype.transpose = function transpose() {
    var M = this.values;

    var M1 = M[1];
    var M2 = M[2];
    var M3 = M[3];
    var M5 = M[5];
    var M6 = M[6];
    var M7 = M[7];

    M[1] = M3;
    M[2] = M6;
    M[3] = M1;
    M[5] = M7;
    M[6] = M2;
    M[7] = M5;

    return this;
};

/**
 * The determinant of the Mat33.
 *
 * @method
 *
 * @return {Number} The determinant.
 */
Mat33.prototype.getDeterminant = function getDeterminant() {
    var M = this.values;

    var M3 = M[3];
    var M4 = M[4];
    var M5 = M[5];
    var M6 = M[6];
    var M7 = M[7];
    var M8 = M[8];

    var det = M[0]*(M4*M8 - M5*M7) -
              M[1]*(M3*M8 - M5*M6) +
              M[2]*(M3*M7 - M4*M6);

    return det;
};

/**
 * The inverse of the Mat33.
 *
 * @method
 *
 * @return {Mat33} this
 */
Mat33.prototype.inverse = function inverse() {
    var M = this.values;

    var M0 = M[0];
    var M1 = M[1];
    var M2 = M[2];
    var M3 = M[3];
    var M4 = M[4];
    var M5 = M[5];
    var M6 = M[6];
    var M7 = M[7];
    var M8 = M[8];

    var det = M0*(M4*M8 - M5*M7) -
              M1*(M3*M8 - M5*M6) +
              M2*(M3*M7 - M4*M6);

    if (Math.abs(det) < 1e-40) return null;

    det = 1 / det;

    M[0] = (M4*M8 - M5*M7) * det;
    M[3] = (-M3*M8 + M5*M6) * det;
    M[6] = (M3*M7 - M4*M6) * det;
    M[1] = (-M1*M8 + M2*M7) * det;
    M[4] = (M0*M8 - M2*M6) * det;
    M[7] = (-M0*M7 + M1*M6) * det;
    M[2] = (M1*M5 - M2*M4) * det;
    M[5] = (-M0*M5 + M2*M3) * det;
    M[8] = (M0*M4 - M1*M3) * det;

    return this;
};

/**
 * Clones the input Mat33.
 *
 * @method
 *
 * @param {Mat33} m Mat33 to clone.
 *
 * @return {Mat33} New copy of the original Mat33.
 */
Mat33.clone = function clone(m) {
    return new Mat33(m.values.slice());
};

/**
 * The inverse of the Mat33.
 *
 * @method
 *
 * @param {Mat33} matrix Mat33 to invert.
 * @param {Mat33} output Mat33 in which to place the result.
 *
 * @return {Mat33} The Mat33 after the invert.
 */
Mat33.inverse = function inverse(matrix, output) {
    var M = matrix.values;
    var result = output.values;

    var M0 = M[0];
    var M1 = M[1];
    var M2 = M[2];
    var M3 = M[3];
    var M4 = M[4];
    var M5 = M[5];
    var M6 = M[6];
    var M7 = M[7];
    var M8 = M[8];

    var det = M0*(M4*M8 - M5*M7) -
              M1*(M3*M8 - M5*M6) +
              M2*(M3*M7 - M4*M6);

    if (Math.abs(det) < 1e-40) return null;

    det = 1 / det;

    result[0] = (M4*M8 - M5*M7) * det;
    result[3] = (-M3*M8 + M5*M6) * det;
    result[6] = (M3*M7 - M4*M6) * det;
    result[1] = (-M1*M8 + M2*M7) * det;
    result[4] = (M0*M8 - M2*M6) * det;
    result[7] = (-M0*M7 + M1*M6) * det;
    result[2] = (M1*M5 - M2*M4) * det;
    result[5] = (-M0*M5 + M2*M3) * det;
    result[8] = (M0*M4 - M1*M3) * det;

    return output;
};

/**
 * Transposes the Mat33.
 *
 * @method
 *
 * @param {Mat33} matrix Mat33 to transpose.
 * @param {Mat33} output Mat33 in which to place the result.
 *
 * @return {Mat33} The Mat33 after the transpose.
 */
Mat33.transpose = function transpose(matrix, output) {
    var M = matrix.values;
    var result = output.values;

    var M0 = M[0];
    var M1 = M[1];
    var M2 = M[2];
    var M3 = M[3];
    var M4 = M[4];
    var M5 = M[5];
    var M6 = M[6];
    var M7 = M[7];
    var M8 = M[8];

    result[0] = M0;
    result[1] = M3;
    result[2] = M6;
    result[3] = M1;
    result[4] = M4;
    result[5] = M7;
    result[6] = M2;
    result[7] = M5;
    result[8] = M8;

    return output;
};

/**
 * Add the provided Mat33's.
 *
 * @method
 *
 * @param {Mat33} matrix1 The left Mat33.
 * @param {Mat33} matrix2 The right Mat33.
 * @param {Mat33} output Mat33 in which to place the result.
 *
 * @return {Mat33} The result of the addition.
 */
Mat33.add = function add(matrix1, matrix2, output) {
    var A = matrix1.values;
    var B = matrix2.values;
    var result = output.values;

    var A0 = A[0];
    var A1 = A[1];
    var A2 = A[2];
    var A3 = A[3];
    var A4 = A[4];
    var A5 = A[5];
    var A6 = A[6];
    var A7 = A[7];
    var A8 = A[8];

    var B0 = B[0];
    var B1 = B[1];
    var B2 = B[2];
    var B3 = B[3];
    var B4 = B[4];
    var B5 = B[5];
    var B6 = B[6];
    var B7 = B[7];
    var B8 = B[8];

    result[0] = A0 + B0;
    result[1] = A1 + B1;
    result[2] = A2 + B2;
    result[3] = A3 + B3;
    result[4] = A4 + B4;
    result[5] = A5 + B5;
    result[6] = A6 + B6;
    result[7] = A7 + B7;
    result[8] = A8 + B8;

    return output;
};

/**
 * Subtract the provided Mat33's.
 *
 * @method
 *
 * @param {Mat33} matrix1 The left Mat33.
 * @param {Mat33} matrix2 The right Mat33.
 * @param {Mat33} output Mat33 in which to place the result.
 *
 * @return {Mat33} The result of the subtraction.
 */
Mat33.subtract = function subtract(matrix1, matrix2, output) {
    var A = matrix1.values;
    var B = matrix2.values;
    var result = output.values;

    var A0 = A[0];
    var A1 = A[1];
    var A2 = A[2];
    var A3 = A[3];
    var A4 = A[4];
    var A5 = A[5];
    var A6 = A[6];
    var A7 = A[7];
    var A8 = A[8];

    var B0 = B[0];
    var B1 = B[1];
    var B2 = B[2];
    var B3 = B[3];
    var B4 = B[4];
    var B5 = B[5];
    var B6 = B[6];
    var B7 = B[7];
    var B8 = B[8];

    result[0] = A0 - B0;
    result[1] = A1 - B1;
    result[2] = A2 - B2;
    result[3] = A3 - B3;
    result[4] = A4 - B4;
    result[5] = A5 - B5;
    result[6] = A6 - B6;
    result[7] = A7 - B7;
    result[8] = A8 - B8;

    return output;
};
/**
 * Multiply the provided Mat33 M2 with this Mat33.  Result is (this) * (M2).
 *
 * @method
 * @param {Mat33} matrix1 The left Mat33.
 * @param {Mat33} matrix2 The right Mat33.
 * @param {Mat33} output Mat33 in which to place the result.
 *
 * @return {Mat33} the result of the multiplication.
 */
Mat33.multiply = function multiply(matrix1, matrix2, output) {
    var A = matrix1.values;
    var B = matrix2.values;
    var result = output.values;

    var A0 = A[0];
    var A1 = A[1];
    var A2 = A[2];
    var A3 = A[3];
    var A4 = A[4];
    var A5 = A[5];
    var A6 = A[6];
    var A7 = A[7];
    var A8 = A[8];

    var B0 = B[0];
    var B1 = B[1];
    var B2 = B[2];
    var B3 = B[3];
    var B4 = B[4];
    var B5 = B[5];
    var B6 = B[6];
    var B7 = B[7];
    var B8 = B[8];

    result[0] = A0*B0 + A1*B3 + A2*B6;
    result[1] = A0*B1 + A1*B4 + A2*B7;
    result[2] = A0*B2 + A1*B5 + A2*B8;
    result[3] = A3*B0 + A4*B3 + A5*B6;
    result[4] = A3*B1 + A4*B4 + A5*B7;
    result[5] = A3*B2 + A4*B5 + A5*B8;
    result[6] = A6*B0 + A7*B3 + A8*B6;
    result[7] = A6*B1 + A7*B4 + A8*B7;
    result[8] = A6*B2 + A7*B5 + A8*B8;

    return output;
};

module.exports = Mat33;

},{}],48:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

var sin = Math.sin;
var cos = Math.cos;
var asin = Math.asin;
var acos = Math.acos;
var atan2 = Math.atan2;
var sqrt = Math.sqrt;

/**
 * A vector-like object used to represent rotations. If theta is the angle of
 * rotation, and (x', y', z') is a normalized vector representing the axis of
 * rotation, then w = cos(theta/2), x = sin(theta/2)*x', y = sin(theta/2)*y',
 * and z = sin(theta/2)*z'.
 *
 * @class Quaternion
 *
 * @param {Number} w The w component.
 * @param {Number} x The x component.
 * @param {Number} y The y component.
 * @param {Number} z The z component.
 */
function Quaternion(w, x, y, z) {
    this.w = w || 1;
    this.x = x || 0;
    this.y = y || 0;
    this.z = z || 0;
}

/**
 * Multiply the current Quaternion by input Quaternion q.
 * Left-handed multiplication.
 *
 * @method
 *
 * @param {Quaternion} q The Quaternion to multiply by on the right.
 *
 * @return {Quaternion} this
 */
Quaternion.prototype.multiply = function multiply(q) {
    var x1 = this.x;
    var y1 = this.y;
    var z1 = this.z;
    var w1 = this.w;
    var x2 = q.x;
    var y2 = q.y;
    var z2 = q.z;
    var w2 = q.w || 0;

    this.w = w1 * w2 - x1 * x2 - y1 * y2 - z1 * z2;
    this.x = x1 * w2 + x2 * w1 + y2 * z1 - y1 * z2;
    this.y = y1 * w2 + y2 * w1 + x1 * z2 - x2 * z1;
    this.z = z1 * w2 + z2 * w1 + x2 * y1 - x1 * y2;
    return this;
};

/**
 * Multiply the current Quaternion by input Quaternion q on the left, i.e. q * this.
 * Left-handed multiplication.
 *
 * @method
 *
 * @param {Quaternion} q The Quaternion to multiply by on the left.
 *
 * @return {Quaternion} this
 */
Quaternion.prototype.leftMultiply = function leftMultiply(q) {
    var x1 = q.x;
    var y1 = q.y;
    var z1 = q.z;
    var w1 = q.w || 0;
    var x2 = this.x;
    var y2 = this.y;
    var z2 = this.z;
    var w2 = this.w;

    this.w = w1*w2 - x1*x2 - y1*y2 - z1*z2;
    this.x = x1*w2 + x2*w1 + y2*z1 - y1*z2;
    this.y = y1*w2 + y2*w1 + x1*z2 - x2*z1;
    this.z = z1*w2 + z2*w1 + x2*y1 - x1*y2;
    return this;
};

/**
 * Apply the current Quaternion to input Vec3 v, according to
 * v' = ~q * v * q.
 *
 * @method
 *
 * @param {Vec3} v The reference Vec3.
 * @param {Vec3} output Vec3 in which to place the result.
 *
 * @return {Vec3} The rotated version of the Vec3.
 */
Quaternion.prototype.rotateVector = function rotateVector(v, output) {
    var cw = this.w;
    var cx = -this.x;
    var cy = -this.y;
    var cz = -this.z;

    var vx = v.x;
    var vy = v.y;
    var vz = v.z;

    var tw = -cx * vx - cy * vy - cz * vz;
    var tx = vx * cw + vy * cz - cy * vz;
    var ty = vy * cw + cx * vz - vx * cz;
    var tz = vz * cw + vx * cy - cx * vy;

    var w = cw;
    var x = -cx;
    var y = -cy;
    var z = -cz;

    output.x = tx * w + x * tw + y * tz - ty * z;
    output.y = ty * w + y * tw + tx * z - x * tz;
    output.z = tz * w + z * tw + x * ty - tx * y;
    return output;
};

/**
 * Invert the current Quaternion.
 *
 * @method
 *
 * @return {Quaternion} this
 */
Quaternion.prototype.invert = function invert() {
    this.w = -this.w;
    this.x = -this.x;
    this.y = -this.y;
    this.z = -this.z;
    return this;
};

/**
 * Conjugate the current Quaternion.
 *
 * @method
 *
 * @return {Quaternion} this
 */
Quaternion.prototype.conjugate = function conjugate() {
    this.x = -this.x;
    this.y = -this.y;
    this.z = -this.z;
    return this;
};

/**
 * Compute the length (norm) of the current Quaternion.
 *
 * @method
 *
 * @return {Number} length of the Quaternion
 */
Quaternion.prototype.length = function length() {
    var w = this.w;
    var x = this.x;
    var y = this.y;
    var z = this.z;
    return sqrt(w * w + x * x + y * y + z * z);
};

/**
 * Alter the current Quaternion to be of unit length;
 *
 * @method
 *
 * @return {Quaternion} this
 */
Quaternion.prototype.normalize = function normalize() {
    var w = this.w;
    var x = this.x;
    var y = this.y;
    var z = this.z;
    var length = sqrt(w * w + x * x + y * y + z * z);
    if (length === 0) return this;
    length = 1 / length;
    this.w *= length;
    this.x *= length;
    this.y *= length;
    this.z *= length;
    return this;
};

/**
 * Set the w, x, y, z components of the current Quaternion.
 *
 * @method
 *
 * @param {Number} w The w component.
 * @param {Number} x The x component.
 * @param {Number} y The y component.
 * @param {Number} z The z component.
 *
 * @return {Quaternion} this
 */
Quaternion.prototype.set = function set(w, x ,y, z) {
    if (w != null) this.w = w;
    if (x != null) this.x = x;
    if (y != null) this.y = y;
    if (z != null) this.z = z;
    return this;
};

/**
 * Copy input Quaternion q onto the current Quaternion.
 *
 * @method
 *
 * @param {Quaternion} q The reference Quaternion.
 *
 * @return {Quaternion} this
 */
Quaternion.prototype.copy = function copy(q) {
    this.w = q.w;
    this.x = q.x;
    this.y = q.y;
    this.z = q.z;
    return this;
};

/**
 * Reset the current Quaternion.
 *
 * @method
 *
 * @return {Quaternion} this
 */
Quaternion.prototype.clear = function clear() {
    this.w = 1;
    this.x = 0;
    this.y = 0;
    this.z = 0;
    return this;
};

/**
 * The dot product. Can be used to determine the cosine of the angle between
 * the two rotations, assuming both Quaternions are of unit length.
 *
 * @method
 *
 * @param {Quaternion} q The other Quaternion.
 *
 * @return {Number} the resulting dot product
 */
Quaternion.prototype.dot = function dot(q) {
    return this.w * q.w + this.x * q.x + this.y * q.y + this.z * q.z;
};

/**
 * Spherical linear interpolation.
 *
 * @method
 *
 * @param {Quaternion} q The final orientation.
 * @param {Number} t The tween parameter.
 * @param {Vec3} output Vec3 in which to put the result.
 *
 * @return {Quaternion} The quaternion the slerp results were saved to
 */
Quaternion.prototype.slerp = function slerp(q, t, output) {
    var w = this.w;
    var x = this.x;
    var y = this.y;
    var z = this.z;

    var qw = q.w;
    var qx = q.x;
    var qy = q.y;
    var qz = q.z;

    var omega;
    var cosomega;
    var sinomega;
    var scaleFrom;
    var scaleTo;

    cosomega = w * qw + x * qx + y * qy + z * qz;
    if ((1.0 - cosomega) > 1e-5) {
        omega = acos(cosomega);
        sinomega = sin(omega);
        scaleFrom = sin((1.0 - t) * omega) / sinomega;
        scaleTo = sin(t * omega) / sinomega;
    }
    else {
        scaleFrom = 1.0 - t;
        scaleTo = t;
    }

    output.w = w * scaleFrom + qw * scaleTo;
    output.x = x * scaleFrom + qx * scaleTo;
    output.y = y * scaleFrom + qy * scaleTo;
    output.z = z * scaleFrom + qz * scaleTo;

    return output;
};

/**
 * Get the Mat33 matrix corresponding to the current Quaternion.
 *
 * @method
 *
 * @param {Object} output Object to process the Transform matrix
 *
 * @return {Array} the Quaternion as a Transform matrix
 */
Quaternion.prototype.toMatrix = function toMatrix(output) {
    var w = this.w;
    var x = this.x;
    var y = this.y;
    var z = this.z;

    var xx = x*x;
    var yy = y*y;
    var zz = z*z;
    var xy = x*y;
    var xz = x*z;
    var yz = y*z;

    return output.set([
        1 - 2 * (yy + zz), 2 * (xy - w*z), 2 * (xz + w*y),
        2 * (xy + w*z), 1 - 2 * (xx + zz), 2 * (yz - w*x),
        2 * (xz - w*y), 2 * (yz + w*x), 1 - 2 * (xx + yy)
    ]);
};

/**
 * The rotation angles about the x, y, and z axes corresponding to the
 * current Quaternion, when applied in the ZYX order.
 *
 * @method
 *
 * @param {Vec3} output Vec3 in which to put the result.
 *
 * @return {Vec3} the Vec3 the result was stored in
 */
Quaternion.prototype.toEuler = function toEuler(output) {
    var w = this.w;
    var x = this.x;
    var y = this.y;
    var z = this.z;

    var xx = x * x;
    var yy = y * y;
    var zz = z * z;

    var ty = 2 * (x * z + y * w);
    ty = ty < -1 ? -1 : ty > 1 ? 1 : ty;

    output.x = atan2(2 * (x * w - y * z), 1 - 2 * (xx + yy));
    output.y = asin(ty);
    output.z = atan2(2 * (z * w - x * y), 1 - 2 * (yy + zz));

    return output;
};

/**
 * The Quaternion corresponding to the Euler angles x, y, and z,
 * applied in the ZYX order.
 *
 * @method
 *
 * @param {Number} x The angle of rotation about the x axis.
 * @param {Number} y The angle of rotation about the y axis.
 * @param {Number} z The angle of rotation about the z axis.
 * @param {Quaternion} output Quaternion in which to put the result.
 *
 * @return {Quaternion} The equivalent Quaternion.
 */
Quaternion.prototype.fromEuler = function fromEuler(x, y, z) {
    var hx = x * 0.5;
    var hy = y * 0.5;
    var hz = z * 0.5;

    var sx = sin(hx);
    var sy = sin(hy);
    var sz = sin(hz);
    var cx = cos(hx);
    var cy = cos(hy);
    var cz = cos(hz);

    this.w = cx * cy * cz - sx * sy * sz;
    this.x = sx * cy * cz + cx * sy * sz;
    this.y = cx * sy * cz - sx * cy * sz;
    this.z = cx * cy * sz + sx * sy * cz;

    return this;
};

/**
 * Alter the current Quaternion to reflect a rotation of input angle about
 * input axis x, y, and z.
 *
 * @method
 *
 * @param {Number} angle The angle of rotation.
 * @param {Vec3} x The axis of rotation.
 * @param {Vec3} y The axis of rotation.
 * @param {Vec3} z The axis of rotation.
 *
 * @return {Quaternion} this
 */
Quaternion.prototype.fromAngleAxis = function fromAngleAxis(angle, x, y, z) {
    var len = sqrt(x * x + y * y + z * z);
    if (len === 0) {
        this.w = 1;
        this.x = this.y = this.z = 0;
    }
    else {
        len = 1 / len;
        var halfTheta = angle * 0.5;
        var s = sin(halfTheta);
        this.w = cos(halfTheta);
        this.x = s * x * len;
        this.y = s * y * len;
        this.z = s * z * len;
    }
    return this;
};

/**
 * Multiply the input Quaternions.
 * Left-handed coordinate system multiplication.
 *
 * @method
 *
 * @param {Quaternion} q1 The left Quaternion.
 * @param {Quaternion} q2 The right Quaternion.
 * @param {Quaternion} output Quaternion in which to place the result.
 *
 * @return {Quaternion} The product of multiplication.
 */
Quaternion.multiply = function multiply(q1, q2, output) {
    var w1 = q1.w || 0;
    var x1 = q1.x;
    var y1 = q1.y;
    var z1 = q1.z;

    var w2 = q2.w || 0;
    var x2 = q2.x;
    var y2 = q2.y;
    var z2 = q2.z;

    output.w = w1 * w2 - x1 * x2 - y1 * y2 - z1 * z2;
    output.x = x1 * w2 + x2 * w1 + y2 * z1 - y1 * z2;
    output.y = y1 * w2 + y2 * w1 + x1 * z2 - x2 * z1;
    output.z = z1 * w2 + z2 * w1 + x2 * y1 - x1 * y2;
    return output;
};

/**
 * Normalize the input quaternion.
 *
 * @method
 *
 * @param {Quaternion} q The reference Quaternion.
 * @param {Quaternion} output Quaternion in which to place the result.
 *
 * @return {Quaternion} The normalized quaternion.
 */
Quaternion.normalize = function normalize(q, output) {
    var w = q.w;
    var x = q.x;
    var y = q.y;
    var z = q.z;
    var length = sqrt(w * w + x * x + y * y + z * z);
    if (length === 0) return this;
    length = 1 / length;
    output.w *= length;
    output.x *= length;
    output.y *= length;
    output.z *= length;
    return output;
};

/**
 * The conjugate of the input Quaternion.
 *
 * @method
 *
 * @param {Quaternion} q The reference Quaternion.
 * @param {Quaternion} output Quaternion in which to place the result.
 *
 * @return {Quaternion} The conjugate Quaternion.
 */
Quaternion.conjugate = function conjugate(q, output) {
    output.w = q.w;
    output.x = -q.x;
    output.y = -q.y;
    output.z = -q.z;
    return output;
};

/**
 * Clone the input Quaternion.
 *
 * @method
 *
 * @param {Quaternion} q the reference Quaternion.
 *
 * @return {Quaternion} The cloned Quaternion.
 */
Quaternion.clone = function clone(q) {
    return new Quaternion(q.w, q.x, q.y, q.z);
};

/**
 * The dot product of the two input Quaternions.
 *
 * @method
 *
 * @param {Quaternion} q1 The left Quaternion.
 * @param {Quaternion} q2 The right Quaternion.
 *
 * @return {Number} The dot product of the two Quaternions.
 */
Quaternion.dot = function dot(q1, q2) {
    return q1.w * q2.w + q1.x * q2.x + q1.y * q2.y + q1.z * q2.z;
};

module.exports = Quaternion;

},{}],49:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

/**
 * A two-dimensional vector.
 *
 * @class Vec2
 *
 * @param {Number} x The x component.
 * @param {Number} y The y component.
 */
var Vec2 = function(x, y) {
    if (x instanceof Array || x instanceof Float32Array) {
        this.x = x[0] || 0;
        this.y = x[1] || 0;
    }
    else {
        this.x = x || 0;
        this.y = y || 0;
    }
};

/**
 * Set the components of the current Vec2.
 *
 * @method
 *
 * @param {Number} x The x component.
 * @param {Number} y The y component.
 *
 * @return {Vec2} this
 */
Vec2.prototype.set = function set(x, y) {
    if (x != null) this.x = x;
    if (y != null) this.y = y;
    return this;
};

/**
 * Add the input v to the current Vec2.
 *
 * @method
 *
 * @param {Vec2} v The Vec2 to add.
 *
 * @return {Vec2} this
 */
Vec2.prototype.add = function add(v) {
    this.x += v.x;
    this.y += v.y;
    return this;
};

/**
 * Subtract the input v from the current Vec2.
 *
 * @method
 *
 * @param {Vec2} v The Vec2 to subtract.
 *
 * @return {Vec2} this
 */
Vec2.prototype.subtract = function subtract(v) {
    this.x -= v.x;
    this.y -= v.y;
    return this;
};

/**
 * Scale the current Vec2 by a scalar or Vec2.
 *
 * @method
 *
 * @param {Number|Vec2} s The Number or vec2 by which to scale.
 *
 * @return {Vec2} this
 */
Vec2.prototype.scale = function scale(s) {
    if (s instanceof Vec2) {
        this.x *= s.x;
        this.y *= s.y;
    }
    else {
        this.x *= s;
        this.y *= s;
    }
    return this;
};

/**
 * Rotate the Vec2 counter-clockwise by theta about the z-axis.
 *
 * @method
 *
 * @param {Number} theta Angle by which to rotate.
 *
 * @return {Vec2} this
 */
Vec2.prototype.rotate = function(theta) {
    var x = this.x;
    var y = this.y;

    var cosTheta = Math.cos(theta);
    var sinTheta = Math.sin(theta);

    this.x = x * cosTheta - y * sinTheta;
    this.y = x * sinTheta + y * cosTheta;

    return this;
};

/**
 * The dot product of of the current Vec2 with the input Vec2.
 *
 * @method
 *
 * @param {Number} v The other Vec2.
 *
 * @return {Vec2} this
 */
Vec2.prototype.dot = function(v) {
    return this.x * v.x + this.y * v.y;
};

/**
 * The cross product of of the current Vec2 with the input Vec2.
 *
 * @method
 *
 * @param {Number} v The other Vec2.
 *
 * @return {Vec2} this
 */
Vec2.prototype.cross = function(v) {
    return this.x * v.y - this.y * v.x;
};

/**
 * Preserve the magnitude but invert the orientation of the current Vec2.
 *
 * @method
 *
 * @return {Vec2} this
 */
Vec2.prototype.invert = function invert() {
    this.x *= -1;
    this.y *= -1;
    return this;
};

/**
 * Apply a function component-wise to the current Vec2.
 *
 * @method
 *
 * @param {Function} fn Function to apply.
 *
 * @return {Vec2} this
 */
Vec2.prototype.map = function map(fn) {
    this.x = fn(this.x);
    this.y = fn(this.y);
    return this;
};

/**
 * Get the magnitude of the current Vec2.
 *
 * @method
 *
 * @return {Number} the length of the vector
 */
Vec2.prototype.length = function length() {
    var x = this.x;
    var y = this.y;

    return Math.sqrt(x * x + y * y);
};

/**
 * Copy the input onto the current Vec2.
 *
 * @method
 *
 * @param {Vec2} v Vec2 to copy
 *
 * @return {Vec2} this
 */
Vec2.prototype.copy = function copy(v) {
    this.x = v.x;
    this.y = v.y;
    return this;
};

/**
 * Reset the current Vec2.
 *
 * @method
 *
 * @return {Vec2} this
 */
Vec2.prototype.clear = function clear() {
    this.x = 0;
    this.y = 0;
    return this;
};

/**
 * Check whether the magnitude of the current Vec2 is exactly 0.
 *
 * @method
 *
 * @return {Boolean} whether or not the length is 0
 */
Vec2.prototype.isZero = function isZero() {
    if (this.x !== 0 || this.y !== 0) return false;
    else return true;
};

/**
 * The array form of the current Vec2.
 *
 * @method
 *
 * @return {Array} the Vec to as an array
 */
Vec2.prototype.toArray = function toArray() {
    return [this.x, this.y];
};

/**
 * Normalize the input Vec2.
 *
 * @method
 *
 * @param {Vec2} v The reference Vec2.
 * @param {Vec2} output Vec2 in which to place the result.
 *
 * @return {Vec2} The normalized Vec2.
 */
Vec2.normalize = function normalize(v, output) {
    var x = v.x;
    var y = v.y;

    var length = Math.sqrt(x * x + y * y) || 1;
    length = 1 / length;
    output.x = v.x * length;
    output.y = v.y * length;

    return output;
};

/**
 * Clone the input Vec2.
 *
 * @method
 *
 * @param {Vec2} v The Vec2 to clone.
 *
 * @return {Vec2} The cloned Vec2.
 */
Vec2.clone = function clone(v) {
    return new Vec2(v.x, v.y);
};

/**
 * Add the input Vec2's.
 *
 * @method
 *
 * @param {Vec2} v1 The left Vec2.
 * @param {Vec2} v2 The right Vec2.
 * @param {Vec2} output Vec2 in which to place the result.
 *
 * @return {Vec2} The result of the addition.
 */
Vec2.add = function add(v1, v2, output) {
    output.x = v1.x + v2.x;
    output.y = v1.y + v2.y;

    return output;
};

/**
 * Subtract the second Vec2 from the first.
 *
 * @method
 *
 * @param {Vec2} v1 The left Vec2.
 * @param {Vec2} v2 The right Vec2.
 * @param {Vec2} output Vec2 in which to place the result.
 *
 * @return {Vec2} The result of the subtraction.
 */
Vec2.subtract = function subtract(v1, v2, output) {
    output.x = v1.x - v2.x;
    output.y = v1.y - v2.y;
    return output;
};

/**
 * Scale the input Vec2.
 *
 * @method
 *
 * @param {Vec2} v The reference Vec2.
 * @param {Number} s Number to scale by.
 * @param {Vec2} output Vec2 in which to place the result.
 *
 * @return {Vec2} The result of the scaling.
 */
Vec2.scale = function scale(v, s, output) {
    output.x = v.x * s;
    output.y = v.y * s;
    return output;
};

/**
 * The dot product of the input Vec2's.
 *
 * @method
 *
 * @param {Vec2} v1 The left Vec2.
 * @param {Vec2} v2 The right Vec2.
 *
 * @return {Number} The dot product.
 */
Vec2.dot = function dot(v1, v2) {
    return v1.x * v2.x + v1.y * v2.y;
};

/**
 * The cross product of the input Vec2's.
 *
 * @method
 *
 * @param {Number} v1 The left Vec2.
 * @param {Number} v2 The right Vec2.
 *
 * @return {Number} The z-component of the cross product.
 */
Vec2.cross = function(v1,v2) {
    return v1.x * v2.y - v1.y * v2.x;
};

module.exports = Vec2;

},{}],50:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

/**
 * A three-dimensional vector.
 *
 * @class Vec3
 *
 * @param {Number} x The x component.
 * @param {Number} y The y component.
 * @param {Number} z The z component.
 */
var Vec3 = function(x ,y, z){
    this.x = x || 0;
    this.y = y || 0;
    this.z = z || 0;
};

/**
 * Set the components of the current Vec3.
 *
 * @method
 *
 * @param {Number} x The x component.
 * @param {Number} y The y component.
 * @param {Number} z The z component.
 *
 * @return {Vec3} this
 */
Vec3.prototype.set = function set(x, y, z) {
    if (x != null) this.x = x;
    if (y != null) this.y = y;
    if (z != null) this.z = z;

    return this;
};

/**
 * Add the input v to the current Vec3.
 *
 * @method
 *
 * @param {Vec3} v The Vec3 to add.
 *
 * @return {Vec3} this
 */
Vec3.prototype.add = function add(v) {
    this.x += v.x;
    this.y += v.y;
    this.z += v.z;

    return this;
};

/**
 * Subtract the input v from the current Vec3.
 *
 * @method
 *
 * @param {Vec3} v The Vec3 to subtract.
 *
 * @return {Vec3} this
 */
Vec3.prototype.subtract = function subtract(v) {
    this.x -= v.x;
    this.y -= v.y;
    this.z -= v.z;

    return this;
};

/**
 * Rotate the current Vec3 by theta clockwise about the x axis.
 *
 * @method
 *
 * @param {Number} theta Angle by which to rotate.
 *
 * @return {Vec3} this
 */
Vec3.prototype.rotateX = function rotateX(theta) {
    var y = this.y;
    var z = this.z;

    var cosTheta = Math.cos(theta);
    var sinTheta = Math.sin(theta);

    this.y = y * cosTheta - z * sinTheta;
    this.z = y * sinTheta + z * cosTheta;

    return this;
};

/**
 * Rotate the current Vec3 by theta clockwise about the y axis.
 *
 * @method
 *
 * @param {Number} theta Angle by which to rotate.
 *
 * @return {Vec3} this
 */
Vec3.prototype.rotateY = function rotateY(theta) {
    var x = this.x;
    var z = this.z;

    var cosTheta = Math.cos(theta);
    var sinTheta = Math.sin(theta);

    this.x = z * sinTheta + x * cosTheta;
    this.z = z * cosTheta - x * sinTheta;

    return this;
};

/**
 * Rotate the current Vec3 by theta clockwise about the z axis.
 *
 * @method
 *
 * @param {Number} theta Angle by which to rotate.
 *
 * @return {Vec3} this
 */
Vec3.prototype.rotateZ = function rotateZ(theta) {
    var x = this.x;
    var y = this.y;

    var cosTheta = Math.cos(theta);
    var sinTheta = Math.sin(theta);

    this.x = x * cosTheta - y * sinTheta;
    this.y = x * sinTheta + y * cosTheta;

    return this;
};

/**
 * The dot product of the current Vec3 with input Vec3 v.
 *
 * @method
 *
 * @param {Vec3} v The other Vec3.
 *
 * @return {Vec3} this
 */
Vec3.prototype.dot = function dot(v) {
    return this.x*v.x + this.y*v.y + this.z*v.z;
};

/**
 * The dot product of the current Vec3 with input Vec3 v.
 * Stores the result in the current Vec3.
 *
 * @method cross
 *
 * @param {Vec3} v The other Vec3
 *
 * @return {Vec3} this
 */
Vec3.prototype.cross = function cross(v) {
    var x = this.x;
    var y = this.y;
    var z = this.z;

    var vx = v.x;
    var vy = v.y;
    var vz = v.z;

    this.x = y * vz - z * vy;
    this.y = z * vx - x * vz;
    this.z = x * vy - y * vx;
    return this;
};

/**
 * Scale the current Vec3 by a scalar.
 *
 * @method
 *
 * @param {Number} s The Number by which to scale
 *
 * @return {Vec3} this
 */
Vec3.prototype.scale = function scale(s) {
    this.x *= s;
    this.y *= s;
    this.z *= s;

    return this;
};

/**
 * Preserve the magnitude but invert the orientation of the current Vec3.
 *
 * @method
 *
 * @return {Vec3} this
 */
Vec3.prototype.invert = function invert() {
    this.x = -this.x;
    this.y = -this.y;
    this.z = -this.z;

    return this;
};

/**
 * Apply a function component-wise to the current Vec3.
 *
 * @method
 *
 * @param {Function} fn Function to apply.
 *
 * @return {Vec3} this
 */
Vec3.prototype.map = function map(fn) {
    this.x = fn(this.x);
    this.y = fn(this.y);
    this.z = fn(this.z);

    return this;
};

/**
 * The magnitude of the current Vec3.
 *
 * @method
 *
 * @return {Number} the magnitude of the Vec3
 */
Vec3.prototype.length = function length() {
    var x = this.x;
    var y = this.y;
    var z = this.z;

    return Math.sqrt(x * x + y * y + z * z);
};

/**
 * The magnitude squared of the current Vec3.
 *
 * @method
 *
 * @return {Number} magnitude of the Vec3 squared
 */
Vec3.prototype.lengthSq = function lengthSq() {
    var x = this.x;
    var y = this.y;
    var z = this.z;

    return x * x + y * y + z * z;
};

/**
 * Copy the input onto the current Vec3.
 *
 * @method
 *
 * @param {Vec3} v Vec3 to copy
 *
 * @return {Vec3} this
 */
Vec3.prototype.copy = function copy(v) {
    this.x = v.x;
    this.y = v.y;
    this.z = v.z;
    return this;
};

/**
 * Reset the current Vec3.
 *
 * @method
 *
 * @return {Vec3} this
 */
Vec3.prototype.clear = function clear() {
    this.x = 0;
    this.y = 0;
    this.z = 0;
    return this;
};

/**
 * Check whether the magnitude of the current Vec3 is exactly 0.
 *
 * @method
 *
 * @return {Boolean} whether or not the magnitude is zero
 */
Vec3.prototype.isZero = function isZero() {
    return this.x === 0 && this.y === 0 && this.z === 0;
};

/**
 * The array form of the current Vec3.
 *
 * @method
 *
 * @return {Array} a three element array representing the components of the Vec3
 */
Vec3.prototype.toArray = function toArray() {
    return [this.x, this.y, this.z];
};

/**
 * Preserve the orientation but change the length of the current Vec3 to 1.
 *
 * @method
 *
 * @return {Vec3} this
 */
Vec3.prototype.normalize = function normalize() {
    var x = this.x;
    var y = this.y;
    var z = this.z;

    var len = Math.sqrt(x * x + y * y + z * z) || 1;
    len = 1 / len;

    this.x *= len;
    this.y *= len;
    this.z *= len;
    return this;
};

/**
 * Apply the rotation corresponding to the input (unit) Quaternion
 * to the current Vec3.
 *
 * @method
 *
 * @param {Quaternion} q Unit Quaternion representing the rotation to apply
 *
 * @return {Vec3} this
 */
Vec3.prototype.applyRotation = function applyRotation(q) {
    var cw = q.w;
    var cx = -q.x;
    var cy = -q.y;
    var cz = -q.z;

    var vx = this.x;
    var vy = this.y;
    var vz = this.z;

    var tw = -cx * vx - cy * vy - cz * vz;
    var tx = vx * cw + vy * cz - cy * vz;
    var ty = vy * cw + cx * vz - vx * cz;
    var tz = vz * cw + vx * cy - cx * vy;

    var w = cw;
    var x = -cx;
    var y = -cy;
    var z = -cz;

    this.x = tx * w + x * tw + y * tz - ty * z;
    this.y = ty * w + y * tw + tx * z - x * tz;
    this.z = tz * w + z * tw + x * ty - tx * y;
    return this;
};

/**
 * Apply the input Mat33 the the current Vec3.
 *
 * @method
 *
 * @param {Mat33} matrix Mat33 to apply
 *
 * @return {Vec3} this
 */
Vec3.prototype.applyMatrix = function applyMatrix(matrix) {
    var M = matrix.get();

    var x = this.x;
    var y = this.y;
    var z = this.z;

    this.x = M[0]*x + M[1]*y + M[2]*z;
    this.y = M[3]*x + M[4]*y + M[5]*z;
    this.z = M[6]*x + M[7]*y + M[8]*z;
    return this;
};

/**
 * Normalize the input Vec3.
 *
 * @method
 *
 * @param {Vec3} v The reference Vec3.
 * @param {Vec3} output Vec3 in which to place the result.
 *
 * @return {Vec3} The normalize Vec3.
 */
Vec3.normalize = function normalize(v, output) {
    var x = v.x;
    var y = v.y;
    var z = v.z;

    var length = Math.sqrt(x * x + y * y + z * z) || 1;
    length = 1 / length;

    output.x = x * length;
    output.y = y * length;
    output.z = z * length;
    return output;
};

/**
 * Apply a rotation to the input Vec3.
 *
 * @method
 *
 * @param {Vec3} v The reference Vec3.
 * @param {Quaternion} q Unit Quaternion representing the rotation to apply.
 * @param {Vec3} output Vec3 in which to place the result.
 *
 * @return {Vec3} The rotated version of the input Vec3.
 */
Vec3.applyRotation = function applyRotation(v, q, output) {
    var cw = q.w;
    var cx = -q.x;
    var cy = -q.y;
    var cz = -q.z;

    var vx = v.x;
    var vy = v.y;
    var vz = v.z;

    var tw = -cx * vx - cy * vy - cz * vz;
    var tx = vx * cw + vy * cz - cy * vz;
    var ty = vy * cw + cx * vz - vx * cz;
    var tz = vz * cw + vx * cy - cx * vy;

    var w = cw;
    var x = -cx;
    var y = -cy;
    var z = -cz;

    output.x = tx * w + x * tw + y * tz - ty * z;
    output.y = ty * w + y * tw + tx * z - x * tz;
    output.z = tz * w + z * tw + x * ty - tx * y;
    return output;
};

/**
 * Clone the input Vec3.
 *
 * @method
 *
 * @param {Vec3} v The Vec3 to clone.
 *
 * @return {Vec3} The cloned Vec3.
 */
Vec3.clone = function clone(v) {
    return new Vec3(v.x, v.y, v.z);
};

/**
 * Add the input Vec3's.
 *
 * @method
 *
 * @param {Vec3} v1 The left Vec3.
 * @param {Vec3} v2 The right Vec3.
 * @param {Vec3} output Vec3 in which to place the result.
 *
 * @return {Vec3} The result of the addition.
 */
Vec3.add = function add(v1, v2, output) {
    output.x = v1.x + v2.x;
    output.y = v1.y + v2.y;
    output.z = v1.z + v2.z;
    return output;
};

/**
 * Subtract the second Vec3 from the first.
 *
 * @method
 *
 * @param {Vec3} v1 The left Vec3.
 * @param {Vec3} v2 The right Vec3.
 * @param {Vec3} output Vec3 in which to place the result.
 *
 * @return {Vec3} The result of the subtraction.
 */
Vec3.subtract = function subtract(v1, v2, output) {
    output.x = v1.x - v2.x;
    output.y = v1.y - v2.y;
    output.z = v1.z - v2.z;
    return output;
};

/**
 * Scale the input Vec3.
 *
 * @method
 *
 * @param {Vec3} v The reference Vec3.
 * @param {Number} s Number to scale by.
 * @param {Vec3} output Vec3 in which to place the result.
 *
 * @return {Vec3} The result of the scaling.
 */
Vec3.scale = function scale(v, s, output) {
    output.x = v.x * s;
    output.y = v.y * s;
    output.z = v.z * s;
    return output;
};

/**
 * The dot product of the input Vec3's.
 *
 * @method
 *
 * @param {Vec3} v1 The left Vec3.
 * @param {Vec3} v2 The right Vec3.
 *
 * @return {Number} The dot product.
 */
Vec3.dot = function dot(v1, v2) {
    return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
};

/**
 * The (right-handed) cross product of the input Vec3's.
 * v1 x v2.
 *
 * @method
 *
 * @param {Vec3} v1 The left Vec3.
 * @param {Vec3} v2 The right Vec3.
 * @param {Vec3} output Vec3 in which to place the result.
 *
 * @return {Object} the object the result of the cross product was placed into
 */
Vec3.cross = function cross(v1, v2, output) {
    var x1 = v1.x;
    var y1 = v1.y;
    var z1 = v1.z;
    var x2 = v2.x;
    var y2 = v2.y;
    var z2 = v2.z;

    output.x = y1 * z2 - z1 * y2;
    output.y = z1 * x2 - x1 * z2;
    output.z = x1 * y2 - y1 * x2;
    return output;
};

/**
 * The projection of v1 onto v2.
 *
 * @method
 *
 * @param {Vec3} v1 The left Vec3.
 * @param {Vec3} v2 The right Vec3.
 * @param {Vec3} output Vec3 in which to place the result.
 *
 * @return {Object} the object the result of the cross product was placed into 
 */
Vec3.project = function project(v1, v2, output) {
    var x1 = v1.x;
    var y1 = v1.y;
    var z1 = v1.z;
    var x2 = v2.x;
    var y2 = v2.y;
    var z2 = v2.z;

    var scale = x1 * x2 + y1 * y2 + z1 * z2;
    scale /= x2 * x2 + y2 * y2 + z2 * z2;

    output.x = x2 * scale;
    output.y = y2 * scale;
    output.z = z2 * scale;

    return output;
};

module.exports = Vec3;

},{}],51:[function(require,module,exports){
/**
 * The MIT License (MIT)
 * 
 * Copyright (c) 2015 Famous Industries Inc.
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

module.exports = {
    Mat33: require('./Mat33'),
    Quaternion: require('./Quaternion'),
    Vec2: require('./Vec2'),
    Vec3: require('./Vec3')
};


},{"./Mat33":47,"./Quaternion":48,"./Vec2":49,"./Vec3":50}],52:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

var Vec3 = require('../math/Vec3');
var Mat33 = require('../math/Mat33');

var ObjectManager = require('../utilities/ObjectManager');
ObjectManager.register('DynamicGeometry', DynamicGeometry);
ObjectManager.register('DynamicGeometryFeature', DynamicGeometryFeature);
var oMRequestDynamicGeometryFeature = ObjectManager.requestDynamicGeometryFeature;
var oMFreeDynamicGeometryFeature = ObjectManager.freeDynamicGeometryFeature;

var TRIPLE_REGISTER = new Vec3();

/**
 * The so called triple product. Used to find a vector perpendicular to (v2 - v1) in the direction of v3.
 * (v1 x v2) x v3.
 *
 * @method
 * @private
 * @param {Vec3} v1 The first Vec3.
 * @param {Vec3} v2 The second Vec3.
 * @param {Vec3} v3 The third Vec3.
 * @return {Vec3} The result of the triple product.
 */
function tripleProduct(v1, v2, v3) {
    var v = TRIPLE_REGISTER;

    Vec3.cross(v1, v2, v);
    Vec3.cross(v, v3, v);

    return v;
}

/**
 * Of a set of vertices, retrieves the vertex furthest in the given direction.
 *
 * @method
 * @private
 * @param {Vec3[]} vertices The reference set of Vec3's.
 * @param {Vec3} direction The direction to compare against.
 * @return {Object} The vertex and its index in the vertex array.
 */
function _hullSupport(vertices, direction) {
    var furthest;
    var max = -Infinity;
    var dot;
    var vertex;
    var index;
    for (var i = 0; i < vertices.length; i++) {
        vertex = vertices[i];
        dot = Vec3.dot(vertex, direction);
        if (dot > max) {
            furthest = vertex;
            max = dot;
            index = i;
        }
    }

    return {
        vertex: furthest,
        index: index
    };
}

var VEC_REGISTER = new Vec3();
var POINTCHECK_REGISTER = new Vec3();
var AO_REGISTER = new Vec3();
var AB_REGISTER = new Vec3();
var AC_REGISTER = new Vec3();
var AD_REGISTER = new Vec3();
var BC_REGISTER = new Vec3();
var BD_REGISTER = new Vec3();

/**
 * Used internally to represent polyhedral facet information.
 *
 * @class DynamicGeometryFeature
 * @param {Number} distance The distance of the feature from the origin.
 * @param {Vec3} normal The Vec3 orthogonal to the feature, pointing out of the geometry.
 * @param {Number[]} vertexIndices The indices of the vertices which compose the feature.
 */
function DynamicGeometryFeature(distance, normal, vertexIndices) {
    this.distance = distance;
    this.normal = normal;
    this.vertexIndices = vertexIndices;
}

/**
 * Used by ObjectManager to reset objects.
 *
 * @method
 * @param {Number} distance Distance from the origin.
 * @param {Vec3} normal Vec3 normal to the feature.
 * @param {Number[]} vertexIndices Indices of the vertices which compose the feature.
 * @return {DynamicGeometryFeature} this
 */
DynamicGeometryFeature.prototype.reset = function(distance, normal, vertexIndices) {
    this.distance = distance;
    this.normal = normal;
    this.vertexIndices = vertexIndices;

    return this;
};

/**
 * Abstract object representing a growing polyhedron. Used in ConvexHull and in GJK+EPA collision detection.
 *
 * @class DynamicGeometry
 */
function DynamicGeometry() {
    this.vertices = [];
    this.numVertices = 0;
    this.features = [];
    this.numFeatures = 0;
    this.lastVertexIndex = 0;

    this._IDPool = {
        vertices: [],
        features: []
    };
}

/**
 * Used by ObjectManager to reset objects.
 *
 * @method
 * @return {DynamicGeometry} this
 */
DynamicGeometry.prototype.reset = function reset() {
    this.vertices = [];
    this.numVertices = 0;
    this.features = [];
    this.numFeatures = 0;
    this.lastVertexIndex = 0;

    this._IDPool = {
        vertices: [],
        features: []
    };

    return this;
};

/**
 * Add a vertex to the polyhedron.
 *
 * @method
 * @param {Object} vertexObj Object returned by the support function.
 * @return {undefined} undefined
 */
DynamicGeometry.prototype.addVertex = function(vertexObj) {
    var index = this._IDPool.vertices.length ? this._IDPool.vertices.pop() : this.vertices.length;
    this.vertices[index] = vertexObj;
    this.lastVertexIndex = index;
    this.numVertices++;
};

/**
 * Remove a vertex and push its location in the vertex array to the IDPool for later use.
 *
 * @method
 * @param {Number} index Index of the vertex to remove.
 * @return {Object} vertex The vertex object.
 */
DynamicGeometry.prototype.removeVertex = function(index) {
    var vertex = this.vertices[index];
    this.vertices[index] = null;
    this._IDPool.vertices.push(index);
    this.numVertices--;

    return vertex;
};

/**
 * Add a feature (facet) to the polyhedron. Used internally in the reshaping process.
 *
 * @method
 * @param {Number} distance The distance of the feature from the origin.
 * @param {Vec3} normal The facet normal.
 * @param {Number[]} vertexIndices The indices of the vertices which compose the feature.
 * @return {undefined} undefined
 */
DynamicGeometry.prototype.addFeature = function(distance, normal, vertexIndices) {
    var index = this._IDPool.features.length ? this._IDPool.features.pop() : this.features.length;
    this.features[index] = oMRequestDynamicGeometryFeature().reset(distance, normal, vertexIndices);
    this.numFeatures++;
};

/**
 * Remove a feature and push its location in the feature array to the IDPool for later use.
 *
 * @method
 * @param {Number} index Index of the feature to remove.
 * @return {undefined} undefined
 */
DynamicGeometry.prototype.removeFeature = function(index) {
    var feature = this.features[index];
    this.features[index] = null;
    this._IDPool.features.push(index);
    this.numFeatures--;

    oMFreeDynamicGeometryFeature(feature);
};

/**
 * Retrieve the last vertex object added to the geometry.
 *
 * @method
 * @return {Object} The last vertex added.
 */
DynamicGeometry.prototype.getLastVertex = function() {
    return this.vertices[this.lastVertexIndex];
};

/**
 * Return the feature closest to the origin.
 *
 * @method
 * @return {DynamicGeometryFeature} The closest feature.
 */
DynamicGeometry.prototype.getFeatureClosestToOrigin = function() {
    var min = Infinity;
    var closest = null;
    var features = this.features;
    for (var i = 0, len = features.length; i < len; i++) {
        var feature = features[i];
        if (!feature) continue;
        if (feature.distance < min) {
            min = feature.distance;
            closest = feature;
        }
    }
    return closest;
};

/**
 * Adds edge if not already on the frontier, removes if the edge or its reverse are on the frontier.
 * Used when reshaping DynamicGeometry's.
 *
 * @method
 * @private
 * @param {Object[]} vertices Vec3 reference array.
 * @param {Array.<Number[]>} frontier Current edges potentially separating the features to remove from the persistant shape.
 * @param {Number} start The index of the starting Vec3 on the edge.
 * @param {Number} end The index of the culminating Vec3.
 * @return {undefined} undefined
 */
function _validateEdge(vertices, frontier, start, end) {
    var e0 = vertices[start].vertex;
    var e1 = vertices[end].vertex;
    for (var i = 0, len = frontier.length; i < len; i++) {
        var edge = frontier[i];
        if (!edge) continue;
        var v0 = vertices[edge[0]].vertex;
        var v1 = vertices[edge[1]].vertex;
        if ((e0 === v0 && (e1 === v1)) || (e0 === v1 && (e1 === v0))) {
            frontier[i] = null;
            return;
        }
    }
    frontier.push([start, end]);
}

/**
 * Based on the last (exterior) point added to the polyhedron, removes features as necessary and redetermines
 * its (convex) shape to include the new point by adding triangle features. Uses referencePoint, a point on the shape's
 * interior, to ensure feature normals point outward, else takes referencePoint to be the origin.
 *
 * @method
 * @param {Vec3} referencePoint Point known to be in the interior, used to orient feature normals.
 * @return {undefined} undefined
 */
DynamicGeometry.prototype.reshape = function(referencePoint) {
    var vertices = this.vertices;
    var point = this.getLastVertex().vertex;
    var features = this.features;
    var vertexOnFeature;
    var featureVertices;

    var i, j, len;

    // The removal of features creates a hole in the polyhedron -- frontierEdges maintains the edges
    // of this hole, each of which will form one edge of a new feature to be created
    var frontierEdges = [];

    for (i = 0, len = features.length; i < len; i++) {
        if (!features[i]) continue;
        featureVertices = features[i].vertexIndices;
        vertexOnFeature = vertices[featureVertices[0]].vertex;
        // If point is 'above' the feature, remove that feature, and check to add its edges to the frontier.
        if (Vec3.dot(features[i].normal, Vec3.subtract(point, vertexOnFeature, POINTCHECK_REGISTER)) > -0.001) {
            _validateEdge(vertices, frontierEdges, featureVertices[0], featureVertices[1]);
            _validateEdge(vertices, frontierEdges, featureVertices[1], featureVertices[2]);
            _validateEdge(vertices, frontierEdges, featureVertices[2], featureVertices[0]);
            this.removeFeature(i);
        }
    }

    var A = point;
    var a = this.lastVertexIndex;
    for (j = 0, len = frontierEdges.length; j < len; j++) {
        if (!frontierEdges[j]) continue;
        var b = frontierEdges[j][0];
        var c = frontierEdges[j][1];
        var B = vertices[b].vertex;
        var C = vertices[c].vertex;

        var AB = Vec3.subtract(B, A, AB_REGISTER);
        var AC = Vec3.subtract(C, A, AC_REGISTER);
        var ABC = Vec3.cross(AB, AC, new Vec3());
        ABC.normalize();

        if (!referencePoint) {
            var distance = Vec3.dot(ABC, A);
            if (distance < 0) {
                ABC.invert();
                distance *= -1;
            }
            this.addFeature(distance, ABC, [a, b, c]);
        }
        else {
            var reference = Vec3.subtract(referencePoint, A, VEC_REGISTER);
            if (Vec3.dot(ABC, reference) > -0.001) ABC.invert();
            this.addFeature(null, ABC, [a, b, c]);
        }
    }
};

/**
 * Checks if the Simplex instance contains the origin, returns true or false.
 * If false, removes a point and, as a side effect, changes input direction to be both
 * orthogonal to the current working simplex and point toward the origin.
 * Calls callback on the removed point.
 *
 * @method
 * @param {Vec3} direction Vector used to store the new search direction.
 * @param {Function} callback Function invoked with the removed vertex, used e.g. to free the vertex object
 * in the object manager.
 * @return {Boolean} The result of the containment check.
 */
DynamicGeometry.prototype.simplexContainsOrigin = function(direction, callback) {
    var numVertices = this.vertices.length;

    var a = this.lastVertexIndex;
    var b = a - 1;
    var c = a - 2;
    var d = a - 3;

    b = b < 0 ? b + numVertices : b;
    c = c < 0 ? c + numVertices : c;
    d = d < 0 ? d + numVertices : d;

    var A = this.vertices[a].vertex;
    var B = this.vertices[b].vertex;
    var C = this.vertices[c].vertex;
    var D = this.vertices[d].vertex;

    var AO = Vec3.scale(A, -1, AO_REGISTER);
    var AB = Vec3.subtract(B, A, AB_REGISTER);
    var AC, AD, BC, BD;
    var ABC, ACD, ABD, BCD;
    var distanceABC, distanceACD, distanceABD, distanceBCD;

    var vertexToRemove;

    if (numVertices === 4) {
        // Tetrahedron
        AC = Vec3.subtract(C, A, AC_REGISTER);
        AD = Vec3.subtract(D, A, AD_REGISTER);

        ABC = Vec3.cross(AB, AC, new Vec3());
        ACD = Vec3.cross(AC, AD, new Vec3());
        ABD = Vec3.cross(AB, AD, new Vec3());
        ABC.normalize();
        ACD.normalize();
        ABD.normalize();
        if (Vec3.dot(ABC, AD) > 0) ABC.invert();
        if (Vec3.dot(ACD, AB) > 0) ACD.invert();
        if (Vec3.dot(ABD, AC) > 0) ABD.invert();
        // Don't need to check BCD because we would have just checked that in the previous iteration
        // -- we added A to the BCD triangle because A was in the direction of the origin.

        distanceABC = Vec3.dot(ABC, AO);
        distanceACD = Vec3.dot(ACD, AO);
        distanceABD = Vec3.dot(ABD, AO);

        // Norms point away from origin -> origin is inside tetrahedron
        if (distanceABC < 0.001 && distanceABD < 0.001 && distanceACD < 0.001) {
            BC = Vec3.subtract(C, B, BC_REGISTER);
            BD = Vec3.subtract(D, B, BD_REGISTER);
            BCD = Vec3.cross(BC, BD, new Vec3());
            BCD.normalize();
            if (Vec3.dot(BCD, AB) <= 0) BCD.invert();
            distanceBCD = -1 * Vec3.dot(BCD,B);
            // Prep features for EPA
            this.addFeature(-distanceABC, ABC, [a,b,c]);
            this.addFeature(-distanceACD, ACD, [a,c,d]);
            this.addFeature(-distanceABD, ABD, [a,d,b]);
            this.addFeature(-distanceBCD, BCD, [b,c,d]);
            return true;
        }
        else if (distanceABC >= 0.001) {
            vertexToRemove = this.removeVertex(d);
            direction.copy(ABC);
        }
        else if (distanceACD >= 0.001) {
            vertexToRemove = this.removeVertex(b);
            direction.copy(ACD);
        }
        else {
            vertexToRemove = this.removeVertex(c);
            direction.copy(ABD);
        }
    }
    else if (numVertices === 3) {
        // Triangle
        AC = Vec3.subtract(C, A, AC_REGISTER);
        Vec3.cross(AB, AC, direction);
        if (Vec3.dot(direction, AO) <= 0) direction.invert();
    }
    else {
        // Line
        direction.copy(tripleProduct(AB, AO, AB));
    }
    if (vertexToRemove && callback) callback(vertexToRemove);
    return false;
};

/**
 * Given an array of Vec3's, computes the convex hull. Used in constructing bodies in the physics system and to
 * create custom GL meshes.
 *
 * @class ConvexHull
 * @param {Vec3[]} vertices Cloud of vertices of which the enclosing convex hull is desired.
 * @param {Number} iterations Maximum number of vertices to compose the convex hull.
 */
function ConvexHull(vertices, iterations) {
    iterations = iterations || 1e3;
    var hull = _computeConvexHull(vertices, iterations);

    var i, len;

    var indices = [];
    for (i = 0, len = hull.features.length; i < len; i++) {
        var f = hull.features[i];
        if (f) indices.push(f.vertexIndices);
    }

    var polyhedralProperties = _computePolyhedralProperties(hull.vertices, indices);
    var centroid = polyhedralProperties.centroid;

    var worldVertices = [];
    for (i = 0, len = hull.vertices.length; i < len; i++) {
        worldVertices.push(Vec3.subtract(hull.vertices[i].vertex, centroid, new Vec3()));
    }

    var normals = [];
    for (i = 0, len = worldVertices.length; i < len; i++) {
        normals.push(Vec3.normalize(worldVertices[i], new Vec3()));
    }

    var graph = {};
    var _neighborMatrix = {};
    for (i = 0; i < indices.length; i++) {
        var a = indices[i][0];
        var b = indices[i][1];
        var c = indices[i][2];

        _neighborMatrix[a] = _neighborMatrix[a] || {};
        _neighborMatrix[b] = _neighborMatrix[b] || {};
        _neighborMatrix[c] = _neighborMatrix[c] || {};

        graph[a] = graph[a] || [];
        graph[b] = graph[b] || [];
        graph[c] = graph[c] || [];

        if (!_neighborMatrix[a][b]) {
            _neighborMatrix[a][b] = 1;
            graph[a].push(b);
        }
        if (!_neighborMatrix[a][c]) {
            _neighborMatrix[a][c] = 1;
            graph[a].push(c);
        }
        if (!_neighborMatrix[b][a]) {
            _neighborMatrix[b][a] = 1;
            graph[b].push(a);
        }
        if (!_neighborMatrix[b][c]) {
            _neighborMatrix[b][c] = 1;
            graph[b].push(c);
        }
        if (!_neighborMatrix[c][a]) {
            _neighborMatrix[c][a] = 1;
            graph[c].push(a);
        }
        if (!_neighborMatrix[c][b]) {
            _neighborMatrix[c][b] = 1;
            graph[c].push(b);
        }
    }

    this.indices = indices;
    this.vertices = worldVertices;
    this.normals = normals;
    this.polyhedralProperties = polyhedralProperties;
    this.graph = graph;
}

/**
 * Performs the actual computation of the convex hull.
 *
 * @method
 * @private
 * @param {Vec3[]} vertices Cloud of vertices of which the enclosing convex hull is desired.
 * @param {Number} maxIterations Maximum number of vertices to compose the convex hull.
 * @return {DynamicGeometry} The computed hull.
 */
function _computeConvexHull(vertices, maxIterations) {
    var hull = new DynamicGeometry();

    hull.addVertex(_hullSupport(vertices, new Vec3(1, 0, 0)));
    hull.addVertex(_hullSupport(vertices, new Vec3(-1, 0, 0)));
    var A = hull.vertices[0].vertex;
    var B = hull.vertices[1].vertex;
    var AB = Vec3.subtract(B, A, AB_REGISTER);

    var dot;
    var vertex;
    var furthest;
    var index;
    var i, len;

    var max = -Infinity;
    for (i = 0; i < vertices.length; i++) {
        vertex = vertices[i];
        if (vertex === A || vertex === B) continue;
        var AV = Vec3.subtract(vertex, A, VEC_REGISTER);
        dot = Vec3.dot(AV, tripleProduct(AB, AV, AB));
        dot = dot < 0 ? dot * -1 : dot;
        if (dot > max) {
            max = dot;
            furthest = vertex;
            index = i;
        }
    }
    hull.addVertex({
        vertex: furthest,
        index: index
    });

    var C = furthest;
    var AC = Vec3.subtract(C, A, AC_REGISTER);
    var ABC = Vec3.cross(AB, AC, new Vec3());
    ABC.normalize();

    max = -Infinity;
    for (i = 0; i < vertices.length; i++) {
        vertex = vertices[i];
        if (vertex === A || vertex === B || vertex === C) continue;
        dot = Vec3.dot(Vec3.subtract(vertex, A, VEC_REGISTER), ABC);
        dot = dot < 0 ? dot * -1 : dot;
        if (dot > max) {
            max = dot;
            furthest = vertex;
            index = i;
        }
    }
    hull.addVertex({
        vertex: furthest,
        index: index
    });

    var D = furthest;
    var AD = Vec3.subtract(D, A, AD_REGISTER);
    var BC = Vec3.subtract(C, B, BC_REGISTER);
    var BD = Vec3.subtract(D, B, BD_REGISTER);

    var ACD = Vec3.cross(AC, AD, new Vec3());
    var ABD = Vec3.cross(AB, AD, new Vec3());
    var BCD = Vec3.cross(BC, BD, new Vec3());
    ACD.normalize();
    ABD.normalize();
    BCD.normalize();
    if (Vec3.dot(ABC, AD) > 0) ABC.invert();
    if (Vec3.dot(ACD, AB) > 0) ACD.invert();
    if (Vec3.dot(ABD, AC) > 0) ABD.invert();
    if (Vec3.dot(BCD, AB) < 0) BCD.invert();

    var a = 0;
    var b = 1;
    var c = 2;
    var d = 3;

    hull.addFeature(null, ABC, [a, b, c]);
    hull.addFeature(null, ACD, [a, c, d]);
    hull.addFeature(null, ABD, [a, b, d]);
    hull.addFeature(null, BCD, [b, c, d]);

    var assigned = {};
    for (i = 0, len = hull.vertices.length; i < len; i++) {
       assigned[hull.vertices[i].index] = true;
    }

    var cx = A.x + B.x + C.x + D.x;
    var cy = A.y + B.y + C.y + D.y;
    var cz = A.z + B.z + C.z + D.z;
    var referencePoint = new Vec3(cx, cy, cz);
    referencePoint.scale(0.25);

    var features = hull.features;
    var iteration = 0;
    while (iteration++ < maxIterations) {
        var currentFeature = null;
        for (i = 0, len = features.length; i < len; i++) {
            if (!features[i] || features[i].done) continue;
            currentFeature = features[i];
            furthest = null;
            index = null;
            A = hull.vertices[currentFeature.vertexIndices[0]].vertex;
            var s = _hullSupport(vertices, currentFeature.normal);
            furthest = s.vertex;
            index = s.index;
            var dist = Vec3.dot(Vec3.subtract(furthest, A, VEC_REGISTER), currentFeature.normal);

            if (dist < 0.001 || assigned[index]) {
                currentFeature.done = true;
                continue;
            }

            assigned[index] = true;
            hull.addVertex(s);
            hull.reshape(referencePoint);
        }
            // No feature has points 'above' it -> finished
        if (currentFeature === null) break;
    }

    return hull;
}

/**
 * Helper function used in _computePolyhedralProperties.
 * Sets f0 - f2 and g0 - g2 depending on w0 - w2.
 *
 * @method
 * @private
 * @param {Number} w0 Reference x coordinate.
 * @param {Number} w1 Reference y coordinate.
 * @param {Number} w2 Reference z coordinate.
 * @param {Number[]} f One of two output registers to contain the result of the calculation.
 * @param {Number[]} g One of two output registers to contain the result of the calculation.
 * @return {undefined} undefined
 */
function _subexpressions(w0, w1, w2, f, g) {
    var t0 = w0 + w1;
    f[0] = t0 + w2;
    var t1 = w0 * w0;
    var t2 = t1 + w1 * t0;
    f[1] = t2 + w2 * f[0];
    f[2] = w0 * t1 + w1 * t2 + w2 * f[1];
    g[0] = f[1] + w0 * (f[0] + w0);
    g[1] = f[1] + w1 * (f[0] + w1);
    g[2] = f[1] + w2 * (f[0] + w2);
}

/**
 * Determines various properties of the volume.
 *
 * @method
 * @private
 * @param {Vec3[]} vertices The vertices of the polyhedron.
 * @param {Array.<Number[]>} indices Array of arrays of indices of vertices composing the triangular features of the polyhedron,
 * one array for each feature.
 * @return {Object} Object holding the calculated span, volume, center, and euler tensor.
 */
function _computePolyhedralProperties(vertices, indices) {
    // Order: 1, x, y, z, x^2, y^2, z^2, xy, yz, zx
    var integrals = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    var fx = [];
    var fy = [];
    var fz = [];
    var gx = [];
    var gy = [];
    var gz = [];

    var i, len;

    for (i = 0, len = indices.length; i < len; i++) {
        var A = vertices[indices[i][0]].vertex;
        var B = vertices[indices[i][1]].vertex;
        var C = vertices[indices[i][2]].vertex;
        var AB = Vec3.subtract(B, A, AB_REGISTER);
        var AC = Vec3.subtract(C, A, AC_REGISTER);
        var ABC = AB.cross(AC);
        if (Vec3.dot(A, ABC) < 0) ABC.invert();

        var d0 = ABC.x;
        var d1 = ABC.y;
        var d2 = ABC.z;

        var x0 = A.x;
        var y0 = A.y;
        var z0 = A.z;
        var x1 = B.x;
        var y1 = B.y;
        var z1 = B.z;
        var x2 = C.x;
        var y2 = C.y;
        var z2 = C.z;

        _subexpressions(x0, x1, x2, fx, gx);
        _subexpressions(y0, y1, y2, fy, gy);
        _subexpressions(z0, z1, z2, fz, gz);

        integrals[0] += d0 * fx[0];
        integrals[1] += d0 * fx[1];
        integrals[2] += d1 * fy[1];
        integrals[3] += d2 * fz[1];
        integrals[4] += d0 * fx[2];
        integrals[5] += d1 * fy[2];
        integrals[6] += d2 * fz[2];
        integrals[7] += d0 * (y0 * gx[0] + y1 * gx[1] + y2 * gx[2]);
        integrals[8] += d1 * (z0 * gy[0] + z1 * gy[1] + z2 * gy[2]);
        integrals[9] += d2 * (x0 * gz[0] + x1 * gz[1] + x2 * gz[2]);
    }

    integrals[0] /= 6;
    integrals[1] /= 24;
    integrals[2] /= 24;
    integrals[3] /= 24;
    integrals[4] /= 60;
    integrals[5] /= 60;
    integrals[6] /= 60;
    integrals[7] /= 120;
    integrals[8] /= 120;
    integrals[9] /= 120;

    var minX = Infinity, maxX = -Infinity;
    var minY = Infinity, maxY = -Infinity;
    var minZ = Infinity, maxZ = -Infinity;

    for (i = 0, len = vertices.length; i < len; i++) {
        var vertex = vertices[i].vertex;
        if (vertex.x < minX) minX = vertex.x;
        if (vertex.x > maxX) maxX = vertex.x;
        if (vertex.y < minY) minY = vertex.y;
        if (vertex.y > maxY) maxY = vertex.y;
        if (vertex.z < minZ) minZ = vertex.z;
        if (vertex.z > maxZ) maxZ = vertex.z;
    }

    var size = [maxX - minX, maxY - minY, maxZ - minZ];
    var volume = integrals[0];
    var centroid = new Vec3(integrals[1], integrals[2], integrals[3]);
    centroid.scale(1 / volume);

    var eulerTensor = new Mat33([
                                  integrals[4], integrals[7], integrals[9],
                                  integrals[7], integrals[5], integrals[8],
                                  integrals[9], integrals[8], integrals[6]
                                 ]);

    return {
        size: size,
        volume: volume,
        centroid: centroid,
        eulerTensor: eulerTensor
    };
}

module.exports = {
    DynamicGeometry: DynamicGeometry,
    ConvexHull: ConvexHull
};

},{"../math/Mat33":47,"../math/Vec3":50,"../utilities/ObjectManager":97}],53:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

var Particle = require('./bodies/Particle');
var Constraint = require('./constraints/Constraint');
var Force = require('./forces/Force');

var CallbackStore = require('../utilities/CallbackStore');

var Vec3 = require('../math/Vec3');
var Quaternion = require('../math/Quaternion');

var VEC_REGISTER = new Vec3();
var QUAT_REGISTER = new Quaternion();
var DELTA_REGISTER = new Vec3();

/**
 * Singleton PhysicsEngine object.
 * Manages bodies, forces, constraints.
 *
 * @class PhysicsEngine
 * @param {Object} options A hash of configurable options.
 */
function PhysicsEngine(options) {
    this.events = new CallbackStore();

    options = options || {};
    /** @prop bodies The bodies currently active in the engine. */
    this.bodies = [];
    /** @prop forces The forces currently active in the engine. */
    this.forces = [];
    /** @prop constraints The constraints currently active in the engine. */
    this.constraints = [];

    /** @prop step The time between frames in the engine. */
    this.step = options.step || 1000/60;
    /** @prop iterations The number of times each constraint is solved per frame. */
    this.iterations = options.iterations || 10;
    /** @prop _indexPool Pools of indicies to track holes in the arrays. */
    this._indexPools = {
        bodies: [],
        forces: [],
        constraints: []
    };

    this._entityMaps = {
        bodies: {},
        forces: {},
        constraints: {}
    };

    this.speed = options.speed || 1.0;
    this.time = 0;
    this.delta = 0;

    this.origin = options.origin || new Vec3();
    this.orientation = options.orientation ? options.orientation.normalize() :  new Quaternion();

    this.frameDependent = options.frameDependent || false;

    this.transformBuffers = {
        position: [0, 0, 0],
        rotation: [0, 0, 0, 1]
    };
}

/**
 * Listen for a specific event.
 *
 * @method
 * @param {String} key Name of the event.
 * @param {Function} callback Callback to register for the event.
 * @return {PhysicsEngine} this
 */
PhysicsEngine.prototype.on = function on(key, callback) {
    this.events.on(key, callback);
    return this;
};

/**
 * Stop listening for a specific event.
 *
 * @method
 * @param {String} key Name of the event.
 * @param {Function} callback Callback to deregister for the event.
 * @return {PhysicsEngine} this
 */
PhysicsEngine.prototype.off = function off(key, callback) {
    this.events.off(key, callback);
    return this;
};

/**
 * Trigger an event.
 *
 * @method
 * @param {String} key Name of the event.
 * @param {Object} payload Payload to pass to the event listeners.
 * @return {PhysicsEngine} this
 */
PhysicsEngine.prototype.trigger = function trigger(key, payload) {
    this.events.trigger(key, payload);
    return this;
};

/**
 * Set the origin of the world.
 *
 * @method
 * @chainable
 * @param {Number} x The x component.
 * @param {Number} y The y component.
 * @param {Number} z The z component.
 * @return {PhysicsEngine} this
 */
PhysicsEngine.prototype.setOrigin = function setOrigin(x, y, z) {
    this.origin.set(x, y, z);
    return this;
};

/**
 * Set the orientation of the world.
 *
 * @method
 * @chainable
 * @param {Number} w The w component.
 * @param {Number} x The x component.
 * @param {Number} y The y component.
 * @param {Number} z The z component.
 * @return {PhysicsEngine} this
 */
PhysicsEngine.prototype.setOrientation = function setOrientation(w, x, y, z) {
    this.orientation.set(w, x, y, z).normalize();
    return this;
};

/**
 * Private helper method to store an element in a library array.
 *
 * @method
 * @private
 * @param {Object} context Object in possesion of the element arrays.
 * @param {Object} element The body, force, or constraint to add.
 * @param {String} key Where to store the element.
 * @return {undefined} undefined
 */
function _addElement(context, element, key) {
    var map = context._entityMaps[key];
    if (map[element._ID] == null) {
        var library = context[key];
        var indexPool = context._indexPools[key];
        if (indexPool.length) map[element._ID] = indexPool.pop();
        else map[element._ID] = library.length;
        library[map[element._ID]] = element;
    }
}

/**
 * Private helper method to remove an element from a library array.
 *
 * @method
 * @private
 * @param {Object} context Object in possesion of the element arrays.
 * @param {Object} element The body, force, or constraint to remove.
 * @param {String} key Where to store the element.
 * @return {undefined} undefined
 */
function _removeElement(context, element, key) {
    var map = context._entityMaps[key];
    var index = map[element._ID];
    if (index != null) {
        context._indexPools[key].push(index);
        context[key][index] = null;
        map[element._ID] = null;
    }
}

/**
 * Add a group of bodies, force, or constraints to the engine.
 *
 * @method
 * @return {PhysicsEngine} this
 */
PhysicsEngine.prototype.add = function add() {
    for (var j = 0, lenj = arguments.length; j < lenj; j++) {
        var entity = arguments[j];
        if (entity instanceof Array) {
            for (var i = 0, len = entity.length; i < len; i++) {
                var e = entity[i];
                this.add(e);
            }
        }
        else {
            if (entity instanceof Particle) this.addBody(entity);
            else if (entity instanceof Constraint) this.addConstraint(entity);
            else if (entity instanceof Force) this.addForce(entity);
        }
    }
    return this;
};

/**
 * Remove a group of bodies, force, or constraints from the engine.
 *
 * @method
 * @return {PhysicsEngine} this
 */
PhysicsEngine.prototype.remove = function remove() {
    for (var j = 0, lenj = arguments.length; j < lenj; j++) {
        var entity = arguments[j];
        if (entity instanceof Array) {
            for (var i = 0, len = entity.length; i < len; i++) {
                var e = entity[i];
                this.add(e);
            }
        }
        else {
            if (entity instanceof Particle) this.removeBody(entity);
            else if (entity instanceof Constraint) this.removeConstraint(entity);
            else if (entity instanceof Force) this.removeForce(entity);
        }
    }
    return this;
};

/**
 * Begin tracking a body.
 *
 * @method
 * @param {Particle} body The body to track.
 * @return {undefined} undefined
 */
PhysicsEngine.prototype.addBody = function addBody(body) {
    _addElement(this, body, 'bodies');
};

/**
 * Begin tracking a force.
 *
 * @method
 * @param {Force} force The force to track.
 * @return {undefined} undefined
 */
PhysicsEngine.prototype.addForce = function addForce(force) {
    _addElement(this, force, 'forces');
};

/**
 * Begin tracking a constraint.
 *
 * @method
 * @param {Constraint} constraint The constraint to track.
 * @return {undefined} undefined
 */
PhysicsEngine.prototype.addConstraint = function addConstraint(constraint) {
    _addElement(this, constraint, 'constraints');
};

/**
 * Stop tracking a body.
 *
 * @method
 * @param {Particle} body The body to stop tracking.
 * @return {undefined} undefined
 */
PhysicsEngine.prototype.removeBody = function removeBody(body) {
    _removeElement(this, body, 'bodies');
};

/**
 * Stop tracking a force.
 *
 * @method
 * @param {Force} force The force to stop tracking.
 * @return {undefined} undefined
 */
PhysicsEngine.prototype.removeForce = function removeForce(force) {
    _removeElement(this, force, 'forces');
};

/**
 * Stop tracking a constraint.
 *
 * @method
 * @param {Constraint} constraint The constraint to stop tracking.
 * @return {undefined} undefined
 */
PhysicsEngine.prototype.removeConstraint = function removeConstraint(constraint) {
    _removeElement(this, constraint, 'constraints');
};

/**
 * Update the physics system to reflect the changes since the last frame. Steps forward in increments of
 * PhysicsEngine.step.
 *
 * @method
 * @param {Number} time The time to which to update.
 * @return {undefined} undefined
 */
PhysicsEngine.prototype.update = function update(time) {
    if (this.time === 0) this.time = time;

    var bodies = this.bodies;
    var forces = this.forces;
    var constraints = this.constraints;

    var frameDependent = this.frameDependent;
    var step = this.step;
    var dt = step * 0.001;
    var speed = this.speed;

    var delta = this.delta;
    delta += (time - this.time) * speed;
    this.time = time;

    var i, len;
    var force, body, constraint;

    while(delta > step) {
        this.events.trigger('prestep', time);

        // Update Forces on particles
        for (i = 0, len = forces.length; i < len; i++) {
            force = forces[i];
            if (force === null) continue;
            force.update(time, dt);
        }

        // Tentatively update velocities
        for (i = 0, len = bodies.length; i < len; i++) {
            body = bodies[i];
            if (body === null) continue;
            _integrateVelocity(body, dt);
        }

        // Prep constraints for solver
        for (i = 0, len = constraints.length; i < len; i++) {
            constraint = constraints[i];
            if (constraint === null) continue;
            constraint.update(time, dt);
        }

        // Iteratively resolve constraints
        for (var j = 0, numIterations = this.iterations; j < numIterations; j++) {
            for (i = 0, len = constraints.length; i < len; i++) {
                constraint = constraints[i];
                if (constraint === null) continue;
                constraint.resolve(time, dt);
            }
        }

        // Increment positions and orientations
        for (i = 0, len = bodies.length; i < len; i++) {
            body = bodies[i];
            if (body === null) continue;
            _integratePose(body, dt);
        }

        this.events.trigger('poststep', time);

        if (frameDependent) delta = 0;
        else delta -= step;
    }

    this.delta = delta;
};

/**
 * Transform the body position and rotation to world coordinates.
 *
 * @method
 * @param {Particle} body The body to retrieve the transform of.
 * @return {Object} Position and rotation of the body, taking into account
 * the origin and orientation of the world.
 */
PhysicsEngine.prototype.getTransform = function getTransform(body) {
    var o = this.origin;
    var oq = this.orientation;
    var transform = this.transformBuffers;

    var p = body.position;
    var q = body.orientation;
    var rot = q;
    var loc = p;

    if (oq.w !== 1) {
        rot = Quaternion.multiply(q, oq, QUAT_REGISTER);
        loc = oq.rotateVector(p, VEC_REGISTER);
    }

    transform.position[0] = o.x+loc.x;
    transform.position[1] = o.y+loc.y;
    transform.position[2] = o.z+loc.z;

    transform.rotation[0] = rot.x;
    transform.rotation[1] = rot.y;
    transform.rotation[2] = rot.z;
    transform.rotation[3] = rot.w;

    return transform;
};

/**
 * Update the Particle momenta based off of current incident force and torque.
 *
 * @method
 * @private
 * @param {Particle} body The body to update.
 * @param {Number} dt Delta time.
 * @return {undefined} undefined
 */
function _integrateVelocity(body, dt) {
    body.momentum.add(Vec3.scale(body.force, dt, DELTA_REGISTER));
    body.angularMomentum.add(Vec3.scale(body.torque, dt, DELTA_REGISTER));
    Vec3.scale(body.momentum, body.inverseMass, body.velocity);
    body.inverseInertia.vectorMultiply(body.angularMomentum, body.angularVelocity);
    body.force.clear();
    body.torque.clear();
}

/**
 * Update the Particle position and orientation based off current translational and angular velocities.
 *
 * @method
 * @private
 * @param {Particle} body The body to update.
 * @param {Number} dt Delta time.
 * @return {undefined} undefined
 */
function _integratePose(body, dt) {
    if (body.restrictions !== 0) {
        var restrictions = body.restrictions;
        var x = null;
        var y = null;
        var z = null;
        var ax = null;
        var ay = null;
        var az = null;

        if (restrictions & 32) x = 0;
        if (restrictions & 16) y = 0;
        if (restrictions & 8) z = 0;
        if (restrictions & 4) ax = 0;
        if (restrictions & 2) ay = 0;
        if (restrictions & 1) az = 0;

        if (x !== null || y !== null || z !== null) body.setVelocity(x,y,z);
        if (ax !== null || ay !== null || az !== null) body.setAngularVelocity(ax, ay, az);
    }

    body.position.add(Vec3.scale(body.velocity, dt, DELTA_REGISTER));

    var w = body.angularVelocity;
    var q = body.orientation;
    var wx = w.x;
    var wy = w.y;
    var wz = w.z;

    var qw = q.w;
    var qx = q.x;
    var qy = q.y;
    var qz = q.z;

    var hdt = dt * 0.5;
    q.w += (-wx * qx - wy * qy - wz * qz) * hdt;
    q.x += (wx * qw + wy * qz - wz * qy) * hdt;
    q.y += (wy * qw + wz * qx - wx * qz) * hdt;
    q.z += (wz * qw + wx * qy - wy * qx) * hdt;

    q.normalize();

    body.updateInertia();
}

module.exports = PhysicsEngine;

},{"../math/Quaternion":48,"../math/Vec3":50,"../utilities/CallbackStore":94,"./bodies/Particle":55,"./constraints/Constraint":62,"./forces/Force":73}],54:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

var Vec3 = require('../../math/Vec3');
var convexBodyFactory = require('./convexBodyFactory');

var _Box = convexBodyFactory([
            // Order: back-left, back-right, front-left, front-right
            // Top half
            new Vec3(-100, -100, -100),
            new Vec3(100, -100, -100),
            new Vec3(-100, -100, 100),
            new Vec3(100, -100, 100),
            // Bottom half
            new Vec3(-100, 100, -100),
            new Vec3(100, 100, -100),
            new Vec3(-100, 100, 100),
            new Vec3(100, 100, 100)
        ]);

/**
 * @class Box
 * @extends Particle
 * @param {Object} options Initial state of the body.
 */
function Box(options) {
    _Box.call(this, options);
    this.normals = [
        // Order: top, right, front
        new Vec3(0, 1, 0),
        new Vec3(1, 0, 0),
        new Vec3(0, 0, 1)
    ];

    this.type = 1 << 1;
}

Box.prototype = Object.create(_Box.prototype);
Box.prototype.constructor = Box;

module.exports = Box;

},{"../../math/Vec3":50,"./convexBodyFactory":58}],55:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

var Vec3 = require('../../math/Vec3');
var Quaternion = require('../../math/Quaternion');
var Mat33 = require('../../math/Mat33');

var CallbackStore = require('../../utilities/CallbackStore');

var ZERO_VECTOR = new Vec3();

var MAT1_REGISTER = new Mat33();

var _ID = 0;
/**
 * Fundamental physical body. Maintains translational and angular momentum, position and orientation, and other properties
 * such as size and coefficients of restitution and friction used in collision response.
 *
 * @class Particle
 * @param {Object} options Initial state of the body.
 */
function Particle(options) {
    this.events = new CallbackStore();

    options = options || {};

    this.position = options.position || new Vec3();
    this.orientation = options.orientation || new Quaternion();

    this.velocity = new Vec3();
    this.momentum = new Vec3();
    this.angularVelocity = new Vec3();
    this.angularMomentum = new Vec3();

    this.mass = options.mass || 1;
    this.inverseMass = 1 / this.mass;

    this.force = new Vec3();
    this.torque = new Vec3();

    this.restitution = options.restitution != null ? options.restitution : 0.4;
    this.friction = options.friction != null ? options.friction : 0.2;

    this.inverseInertia = new Mat33([0,0,0,0,0,0,0,0,0]);

    this.localInertia = new Mat33([0,0,0,0,0,0,0,0,0]);
    this.localInverseInertia = new Mat33([0,0,0,0,0,0,0,0,0]);

    this.size = options.size || [0, 0, 0];

    var v = options.velocity;
    if (v) this.setVelocity(v.x, v.y, v.z);

    this.restrictions = 0;
    this.setRestrictions.apply(this, options.restrictions || []);

    this.collisionMask = options.collisionMask || 1;
    this.collisionGroup = options.collisionGroup || 1;

    this.type = 1 << 0;

    this._ID = _ID++;
}

/**
 * Listen for a specific event.
 *
 * @method
 * @param {String} key Name of the event.
 * @param {Function} callback Callback to register for the event.
 * @return {Particle} this
 */
Particle.prototype.on = function on(key, callback) {
    this.events.on(key, callback);
    return this;
};

/**
 * Stop listening for a specific event.
 *
 * @method
 * @param {String} key Name of the event.
 * @param {Function} callback Callback to deregister for the event.
 * @return {Particle} this
 */
Particle.prototype.off = function off(key, callback) {
    this.events.off(key, callback);
    return this;
};

/**
 * Trigger an event.
 *
 * @method
 * @param {String} key Name of the event.
 * @param {Object} payload Payload to pass to the event listeners.
 * @return {Particle} this
 */
Particle.prototype.trigger = function trigger(key, payload) {
    this.events.trigger(key, payload);
    return this;
};

/**
 * Getter for the restriction bitmask. Converts the restrictions to their string representation.
 *
 * @method
 * @return {String[]} restrictions
 */
Particle.prototype.getRestrictions = function getRestrictions() {
    var linear = '';
    var angular = '';
    var restrictions = this.restrictions;
    if (restrictions & 32) linear += 'x';
    if (restrictions & 16) linear += 'y';
    if (restrictions & 8) linear += 'z';
    if (restrictions & 4) angular += 'x';
    if (restrictions & 2) angular += 'y';
    if (restrictions & 1) angular += 'z';

    return [linear, angular];
};

/**
 * Setter for the particle restriction bitmask.
 *
 * @method
 * @param {String} transRestrictions The restrictions to linear motion.
 * @param {String} rotRestrictions The restrictions to rotational motion.
 * @return {Particle} this
 */
Particle.prototype.setRestrictions = function setRestrictions(transRestrictions, rotRestrictions) {
    transRestrictions = transRestrictions || '';
    rotRestrictions = rotRestrictions || '';
    this.restrictions = 0;
    if (transRestrictions.indexOf('x') > -1) this.restrictions |= 32;
    if (transRestrictions.indexOf('y') > -1) this.restrictions |= 16;
    if (transRestrictions.indexOf('z') > -1) this.restrictions |= 8;
    if (rotRestrictions.indexOf('x') > -1) this.restrictions |= 4;
    if (rotRestrictions.indexOf('y') > -1) this.restrictions |= 2;
    if (rotRestrictions.indexOf('z') > -1) this.restrictions |= 1;
    return this;
};

/**
 * Getter for mass
 *
 * @method
 * @return {Number} mass
 */
Particle.prototype.getMass = function getMass() {
    return this.mass;
};

/**
 * Set the mass of the Particle.
 *
 * @method
 * @param {Number} mass The mass.
 * @return {Particle} this
 */
Particle.prototype.setMass = function setMass(mass) {
    this.mass = mass;
    this.inverseMass = 1 / mass;
    return this;
};

/**
 * Getter for inverse mass
 *
 * @method
 * @return {Number} inverse mass
 */
Particle.prototype.getInverseMass = function() {
    return this.inverseMass;
};

/**
 * Resets the inertia tensor and its inverse to reflect the current shape.
 *
 * @method
 * @return {Particle} this
 */
Particle.prototype.updateLocalInertia = function updateLocalInertia() {
    this.localInertia.set([0,0,0,0,0,0,0,0,0]);
    this.localInverseInertia.set([0,0,0,0,0,0,0,0,0]);
    return this;
};

/**
 * Updates the world inverse inertia tensor.
 *
 * @method
 * @return {Particle} this
 */
Particle.prototype.updateInertia = function updateInertia() {
    var localInvI = this.localInverseInertia;
    var q = this.orientation;
    if ((localInvI[0] === localInvI[4] && localInvI[4] === localInvI[8]) || q.w === 1) return this;
    var R = q.toMatrix(MAT1_REGISTER);
    Mat33.multiply(R, this.inverseInertia, this.inverseInertia);
    Mat33.multiply(this.localInverseInertia, R.transpose(), this.inverseInertia);
    return this;
};

/**
 * Getter for position
 *
 * @method
 * @return {Vec3} position
 */
Particle.prototype.getPosition = function getPosition() {
    return this.position;
};

/**
 * Setter for position
 *
 * @method
 * @param {Number} x the x coordinate for position
 * @param {Number} y the y coordinate for position
 * @param {Number} z the z coordinate for position
 * @return {Particle} this
 * @return {Particle} this
 */
Particle.prototype.setPosition = function setPosition(x, y, z) {
    this.position.set(x, y, z);
    return this;
};

/**
 * Getter for velocity
 *
 * @method
 * @return {Vec3} velocity
 */
Particle.prototype.getVelocity = function getVelocity() {
    return this.velocity;
};

/**
 * Setter for velocity
 *
 * @method
 * @param {Number} x the x coordinate for velocity
 * @param {Number} y the y coordinate for velocity
 * @param {Number} z the z coordinate for velocity
 * @return {Particle} this
 */
Particle.prototype.setVelocity = function setVelocity(x, y, z) {
    this.velocity.set(x, y, z);
    Vec3.scale(this.velocity, this.mass, this.momentum);
    return this;
};

/**
 * Getter for momenutm
 *
 * @method
 * @return {Vec3} momentum
 */
Particle.prototype.getMomentum = function getMomentum() {
    return this.momentum;
};

/**
 * Setter for momentum
 *
 * @method
 * @param {Number} x the x coordinate for momentum
 * @param {Number} y the y coordinate for momentum
 * @param {Number} z the z coordinate for momentum
 * @return {Particle} this
 */
Particle.prototype.setMomentum = function setMomentum(x, y, z) {
    this.momentum.set(x, y, z);
    Vec3.scale(this.momentum, this.inverseMass, this.velocity);
    return this;
};

/**
 * Getter for orientation
 *
 * @method
 * @return {Quaternion} orientation
 */
Particle.prototype.getOrientation = function getOrientation() {
    return this.orientation;
};

/**
 * Setter for orientation
 *
 * @method
 * @param {Number} w The w component.
 * @param {Number} x The x component.
 * @param {Number} y The y component.
 * @param {Number} z The z component.
 * @return {Particle} this
 */
Particle.prototype.setOrientation = function setOrientation(w,x,y,z) {
    this.orientation.set(w,x,y,z).normalize();
    this.updateInertia();
    return this;
};

/**
 * Getter for angular velocity
 *
 * @method
 * @return {Vec3} angularVelocity
 */
Particle.prototype.getAngularVelocity = function getAngularVelocity() {
    return this.angularVelocity;
};

/**
 * Setter for angular velocity
 *
 * @method
 * @param {Number} x The x component.
 * @param {Number} y The y component.
 * @param {Number} z The z component.
 * @return {Particle} this
 */
Particle.prototype.setAngularVelocity = function setAngularVelocity(x,y,z) {
    this.angularVelocity.set(x,y,z);
    var I = Mat33.inverse(this.inverseInertia, MAT1_REGISTER);
    if (I) I.vectorMultiply(this.angularVelocity, this.angularMomentum);
    else this.angularMomentum.clear();
    return this;
};

/**
 * Getter for angular momentum
 *
 * @method
 * @return {Vec3} angular momentum
 */
Particle.prototype.getAngularMomentum = function getAngularMomentum() {
    return this.angularMomentum;
};

/**
 * Setter for angular momentum
 *
 * @method
 * @param {Number} x The x component.
 * @param {Number} y The y component.
 * @param {Number} z The z component.
 * @return {Particle} this
 */
Particle.prototype.setAngularMomentum = function setAngularMomentum(x,y,z) {
    this.angularMomentum.set(x,y,z);
    this.inverseInertia.vectorMultiply(this.angularMomentum, this.angularVelocity);
    return this;
};

/**
 * Getter for the force on the Particle
 *
 * @method
 * @return {Vec3} force
 */
Particle.prototype.getForce = function getForce() {
    return this.force;
};

/**
 * Setter for the force on the Particle
 *
 * @method
 * @param {Number} x The x component.
 * @param {Number} y The y component.
 * @param {Number} z The z component.
 * @return {Particle} this
 */
Particle.prototype.setForce = function setForce(x, y, z) {
    this.force.set(x, y, z);
    return this;
};

/**
 * Getter for torque.
 *
 * @method
 * @return {Vec3} torque
 */
Particle.prototype.getTorque = function getTorque() {
    return this.torque;
};

/**
 * Setter for torque.
 *
 * @method
 * @param {Number} x The x component.
 * @param {Number} y The y component.
 * @param {Number} z The z component.
 * @return {Particle} this
 */
Particle.prototype.setTorque = function setTorque(x, y, z) {
    this.torque.set(x, y, z);
    return this;
};

/**
 * Extends Particle.applyForce with an optional argument
 * to apply the force at an off-centered location, resulting in a torque.
 *
 * @method
 * @param {Vec3} force Force to apply.
 * @return {Particle} this
 */
Particle.prototype.applyForce = function applyForce(force) {
    this.force.add(force);
    return this;
};

/**
 * Applied a torque force to a Particle, inducing a rotation.
 *
 * @method
 * @param {Vec3} torque Torque to apply.
 * @return {Particle} this
 */
Particle.prototype.applyTorque = function applyTorque(torque) {
    this.torque.add(torque);
    return this;
};

/**
 * Applies an impulse to momentum and updates velocity.
 *
 * @method
 * @param {Vec3} impulse Impulse to apply.
 * @return {Particle} this
 */
Particle.prototype.applyImpulse = function applyImpulse(impulse) {
    this.momentum.add(impulse);
    Vec3.scale(this.momentum, this.inverseMass, this.velocity);
    return this;
};

/**
 * Applies an angular impulse to angular momentum and updates angular velocity.
 *
 * @method
 * @param {Vec3} angularImpulse Angular impulse to apply.
 * @return {Particle} this
 */
Particle.prototype.applyAngularImpulse = function applyAngularImpulse(angularImpulse) {
    this.angularMomentum.add(angularImpulse);
    this.inverseInertia.vectorMultiply(this.angularMomentum, this.angularVelocity);
    return this;
};

/**
 * Used in collision detection. The support function should accept a Vec3 direction
 * and return the point on the body's shape furthest in that direction. For point particles,
 * this returns the zero vector.
 *
 * @method
 * @return {Vec3} The zero vector.
 */
Particle.prototype.support = function support() {
    return ZERO_VECTOR;
};

/**
 * Update the body's shape to reflect current orientation. Called in Collision.
 * Noop for point particles.
 *
 * @method
 * @return {undefined} undefined
 */
Particle.prototype.updateShape = function updateShape() {};

module.exports = Particle;

},{"../../math/Mat33":47,"../../math/Quaternion":48,"../../math/Vec3":50,"../../utilities/CallbackStore":94}],56:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

var Particle = require('./Particle');
var Vec3 = require('../../math/Vec3');

var SUPPORT_REGISTER = new Vec3();

/**
 * Spherical Rigid body
 *
 * @class Sphere
 * @extends Particle
 * @param {Object} options The initial state of the body.
 */
function Sphere(options) {
    Particle.call(this, options);
    var r  = options.radius || 1;
    this.radius = r;
    this.size = [2*r, 2*r, 2*r];
    this.updateLocalInertia();
    this.inverseInertia.copy(this.localInverseInertia);

    var w = options.angularVelocity;
    if (w) this.setAngularVelocity(w.x, w.y, w.z);

    this.type = 1 << 2;
}

Sphere.prototype = Object.create(Particle.prototype);
Sphere.prototype.constructor = Sphere;

/**
 * Getter for radius.
 *
 * @method
 * @return {Number} radius
 */
Sphere.prototype.getRadius = function getRadius() {
    return this.radius;
};

/**
 * Setter for radius.
 *
 * @method
 * @param {Number} radius The intended radius of the sphere.
 * @return {Sphere} this
 */
Sphere.prototype.setRadius = function setRadius(radius) {
    this.radius = radius;
    this.size = [2*this.radius, 2*this.radius, 2*this.radius];
    return this;
};

/**
 * Infers the inertia tensor.
 *
 * @override
 * @method
 * @return {undefined} undefined
 */
Sphere.prototype.updateLocalInertia = function updateInertia() {
    var m = this.mass;
    var r = this.radius;

    var mrr = m * r * r;

    this.localInertia.set([
        0.4 * mrr, 0, 0,
        0, 0.4 * mrr, 0,
        0, 0, 0.4 * mrr
    ]);

    this.localInverseInertia.set([
        2.5 / mrr, 0, 0,
        0, 2.5 / mrr, 0,
        0, 0, 2.5 / mrr
    ]);
};

/**
 * Returns the point on the sphere furthest in a given direction.
 *
 * @method
 * @param {Vec3} direction The direction in which to search.
 * @return {Vec3} The support point.
 */
Sphere.prototype.support = function support(direction) {
    return Vec3.scale(direction, this.radius, SUPPORT_REGISTER);
};

/**
 * @exports Sphere
 * @module Sphere
 */
module.exports = Sphere;

},{"../../math/Vec3":50,"./Particle":55}],57:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

var Particle = require('./Particle');
var Vec3 = require('../../math/Vec3');

/**
 * @enum directions
 */
Wall.DOWN = 0;
Wall.UP = 1;
Wall.LEFT = 2;
Wall.RIGHT = 3;
Wall.FORWARD = 4;
Wall.BACKWARD = 5;

/**
 * An axis-aligned boundary. Will not respond to forces or impulses.
 *
 * @class Wall
 * @extends Particle
 * @param {Object} options The initial state of the body.
 */
function Wall(options) {
    Particle.call(this, options);

    var n = this.normal = new Vec3();

    var d = this.direction = options.direction;
    switch (d) {
        case Wall.DOWN:
            n.set(0, 1, 0);
            break;
        case Wall.UP:
            n.set(0, -1, 0);
            break;
        case Wall.LEFT:
            n.set(-1, 0, 0);
            break;
        case Wall.RIGHT:
            n.set(1, 0, 0);
            break;
        case Wall.FORWARD:
            n.set(0, 0, -1);
            break;
        case Wall.BACKWARD:
            n.set(0, 0, 1);
            break;
        default:
            break;
    }

    this.invNormal = Vec3.clone(n, new Vec3()).invert();

    this.mass = Infinity;
    this.inverseMass = 0;

    this.type = 1 << 3;
}

Wall.prototype = Object.create(Particle.prototype);
Wall.prototype.constructor = Wall;

module.exports = Wall;

},{"../../math/Vec3":50,"./Particle":55}],58:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

var Particle = require('./Particle');
var Mat33 = require('../../math/Mat33');
var Vec3 = require('../../math/Vec3');
var Geometry = require('../Geometry');
var ConvexHull = Geometry.ConvexHull;

var TEMP_REGISTER = new Vec3();

/**
 * Returns a constructor for a physical body reflecting the shape defined by input ConvexHull or Vec3 array.
 *
 * @method
 * @param {ConvexHull | Vec3[]} hull ConvexHull instance or Vec3 array.
 * @return {Function} The constructor for the custom convex body type.
 */
function convexBodyFactory(hull) {
    if (!(hull instanceof ConvexHull)) {
        if (!(hull instanceof Array)) throw new Error('convexBodyFactory requires a ConvexHull object or an array of Vec3\'s as input.');
        else hull = new ConvexHull(hull);
    }

    /**
     * The body class with inertia and vertices inferred from the input ConvexHull or Vec3 array.
     *
     * @class ConvexBody
     * @param {Object} options The options hash.
     */
    function ConvexBody(options) {
        Particle.call(this, options);

        var originalSize = hull.polyhedralProperties.size;
        var size = options.size || originalSize;

        var scaleX = size[0] / originalSize[0];
        var scaleY = size[1] / originalSize[1];
        var scaleZ = size[2] / originalSize[2];

        this._scale = [scaleX, scaleY, scaleZ];

        var T = new Mat33([scaleX, 0, 0, 0, scaleY, 0, 0, 0, scaleZ]);

        this.hull = hull;

        this.vertices = [];
        for (var i = 0, len = hull.vertices.length; i < len; i++) {
            this.vertices.push(T.vectorMultiply(hull.vertices[i], new Vec3()));
        }

        _computeInertiaProperties.call(this, T);
        this.inverseInertia.copy(this.localInverseInertia);
        this.updateInertia();

        var w = options.angularVelocity;
        if (w) this.setAngularVelocity(w.x, w.y, w.z);
    }

    ConvexBody.prototype = Object.create(Particle.prototype);
    ConvexBody.prototype.constructor = ConvexBody;

    /**
     * Set the size and recalculate
     *
     * @method
     * @chainable
     * @param {Number} x The x span.
     * @param {Number} y The y span.
     * @param {Number} z The z span.
     * @return {ConvexBody} this
     */
    ConvexBody.prototype.setSize = function setSize(x,y,z) {
        var originalSize = hull.polyhedralProperties.size;

        this.size[0] = x;
        this.size[1] = y;
        this.size[2] = z;

        var scaleX = x / originalSize[0];
        var scaleY = y / originalSize[1];
        var scaleZ = z / originalSize[2];

        this._scale = [scaleX, scaleY, scaleZ];

        var T = new Mat33([scaleX, 0, 0, 0, scaleY, 0, 0, 0, scaleZ]);

        var vertices = this.vertices;
        for (var i = 0, len = hull.vertices.length; i < len; i++) {
            T.vectorMultiply(hull.vertices[i], vertices[i]);
        }

        return this;
    };

    /**
     * Update the local inertia and inverse inertia to reflect the current size.
     *
     * @method
     * @return {ConvexBody} this
     */
    ConvexBody.prototype.updateLocalInertia = function updateInertia() {
        var scaleX = this._scale[0];
        var scaleY = this._scale[1];
        var scaleZ = this._scale[2];

        var T = new Mat33([scaleX, 0, 0, 0, scaleY, 0, 0, 0, scaleZ]);

        _computeInertiaProperties.call(this, T);

        return this;
    };

    /**
     * Retrieve the vertex furthest in a direction. Used internally for collision detection.
     *
     * @method
     * @param {Vec3} direction The direction in which to search.
     * @return {Vec3} The furthest vertex.
     */
    ConvexBody.prototype.support = function support(direction) {
        var vertices = this.vertices;
        var vertex, dot, furthest;
        var max = -Infinity;
        for (var i = 0, len = vertices.length; i < len; i++) {
            vertex = vertices[i];
            dot = Vec3.dot(vertex,direction);
            if (dot > max) {
                furthest = vertex;
                max = dot;
            }
        }
        return furthest;
    };

    /**
     * Update vertices to reflect current orientation.
     *
     * @method
     * @return {ConvexBody} this
     */
    ConvexBody.prototype.updateShape = function updateShape() {
        var vertices = this.vertices;
        var q = this.orientation;
        var modelVertices = this.hull.vertices;

        var scaleX = this._scale[0];
        var scaleY = this._scale[1];
        var scaleZ = this._scale[2];

        var t = TEMP_REGISTER;
        for (var i = 0, len = vertices.length; i < len; i++) {
            t.copy(modelVertices[i]);
            t.x *= scaleX;
            t.y *= scaleY;
            t.z *= scaleZ;
            Vec3.applyRotation(t, q, vertices[i]);
        }

        return this;
    };

    return ConvexBody;
}

/**
 * Determines mass and inertia tensor based off the density, size, and facet information of the polyhedron.
 *
 * @method
 * @private
 * @param {Mat33} T The matrix transforming the intial set of vertices to a set reflecting the body size.
 * @return {undefined} undefined
 */
function _computeInertiaProperties(T) {
    var polyhedralProperties = this.hull.polyhedralProperties;
    var T_values = T.get();
    var detT = T_values[0] * T_values[4] * T_values[8];

    var E_o = polyhedralProperties.eulerTensor;

    var E = new Mat33();
    Mat33.multiply(T, E_o, E);
    Mat33.multiply(E, T, E);
    var E_values = E.get();

    var Exx = E_values[0];
    var Eyy = E_values[4];
    var Ezz = E_values[8];
    var Exy = E_values[1];
    var Eyz = E_values[7];
    var Exz = E_values[2];

    var newVolume = polyhedralProperties.volume * detT;
    var mass = this.mass;
    var density = mass / newVolume;

    var Ixx = Eyy + Ezz;
    var Iyy = Exx + Ezz;
    var Izz = Exx + Eyy;
    var Ixy = -Exy;
    var Iyz = -Eyz;
    var Ixz = -Exz;

    var centroid = polyhedralProperties.centroid;

    Ixx -= newVolume * (centroid.y * centroid.y + centroid.z * centroid.z);
    Iyy -= newVolume * (centroid.z * centroid.z + centroid.x * centroid.x);
    Izz -= newVolume * (centroid.x * centroid.x + centroid.y * centroid.y);
    Ixy += newVolume * centroid.x * centroid.y;
    Iyz += newVolume * centroid.y * centroid.z;
    Ixz += newVolume * centroid.z * centroid.x;

    Ixx *= density * detT;
    Iyy *= density * detT;
    Izz *= density * detT;
    Ixy *= density * detT;
    Iyz *= density * detT;
    Ixz *= density * detT;

    var inertia = [
        Ixx, Ixy, Ixz,
        Ixy, Iyy, Iyz,
        Ixz, Iyz, Izz
    ];

    this.localInertia.set(inertia);
    Mat33.inverse(this.localInertia, this.localInverseInertia);
}

module.exports = convexBodyFactory;

},{"../../math/Mat33":47,"../../math/Vec3":50,"../Geometry":52,"./Particle":55}],59:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

var Constraint = require('./Constraint');
var Vec3 = require('../../math/Vec3');
var Mat33 = require('../../math/Mat33');

var DELTA_REGISTER = new Vec3();

/**
 *  A constraint that keeps a physics body a given direction away from a given
 *  anchor, or another attached body.
 *
 *  @class Angle
 *  @extends Constraint
 *  @param {Particle} a One of the bodies.
 *  @param {Particle} b The other body.
 *  @param {Object} options An object of configurable options.
 */
function Angle(a, b, options) {
    this.a = a;
    this.b = b;

    Constraint.call(this, options);

    this.effectiveInertia = new Mat33();
    this.angularImpulse = new Vec3();
    this.error = 0;
}

Angle.prototype = Object.create(Constraint.prototype);
Angle.prototype.constructor = Angle;

/**
 * Initialize the Angle. Sets defaults if a property was not already set.
 *
 * @method
 * @param {Object} options The options hash.
 * @return {undefined} undefined
 */
Angle.prototype.init = function() {
    this.cosAngle = this.cosAngle || this.a.orientation.dot(this.b.orientation);
};

/**
 * Warmstart the constraint and prepare calculations used in .resolve.
 *
 * @method
 * @return {undefined} undefined
 */
Angle.prototype.update = function update() {
    var a = this.a;
    var b = this.b;

    var q1 = a.orientation;
    var q2 = b.orientation;

    var cosTheta = q1.dot(q2);
    var diff = 2*(cosTheta - this.cosAngle);

    this.error = diff;

    var angularImpulse = this.angularImpulse;
    b.applyAngularImpulse(angularImpulse);
    a.applyAngularImpulse(angularImpulse.invert());

    Mat33.add(a.inverseInertia, b.inverseInertia, this.effectiveInertia);
    this.effectiveInertia.inverse();

    angularImpulse.clear();
};

/**
 * Adds an angular impulse to a physics body's angular velocity.
 *
 * @method
 * @return {undefined} undefined
 */
Angle.prototype.resolve = function update() {
    var a = this.a;
    var b = this.b;

    var diffW = DELTA_REGISTER;

    var w1 = a.angularVelocity;
    var w2 = b.angularVelocity;

    Vec3.subtract(w1, w2, diffW);
    diffW.scale(1 + this.error);

    var angularImpulse = diffW.applyMatrix(this.effectiveInertia);

    b.applyAngularImpulse(angularImpulse);
    a.applyAngularImpulse(angularImpulse.invert());
    angularImpulse.invert();
    this.angularImpulse.add(angularImpulse);
};

module.exports = Angle;

},{"../../math/Mat33":47,"../../math/Vec3":50,"./Constraint":62}],60:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

var Constraint = require('./Constraint');
var Vec3 = require('../../math/Vec3');
var Mat33 = require('../../math/Mat33');
var Quaternion = require('../../math/Quaternion');

var VEC1_REGISTER = new Vec3();
var VEC2_REGISTER = new Vec3();
var VB1_REGISTER = new Vec3();
var VB2_REGISTER = new Vec3();
var WxR_REGISTER = new Vec3();

/**
 * A constraint that maintains positions and orientations with respect to a specific anchor point.
 *
 * @class BallAndSocket
 * @extends Constraint
 * @param {Particle} a One of the bodies.
 * @param {Particle} b The other body.
 * @param {Options} options An object of configurable options.
 */
function BallAndSocket(a, b, options) {
    this.a = a;
    this.b = b;

    Constraint.call(this, options);

    this.impulse = new Vec3();
    this.angImpulseA = new Vec3();
    this.angImpulseB = new Vec3();
    this.error = new Vec3();
    this.effMassMatrix = new Mat33();
}

BallAndSocket.prototype = Object.create(Constraint.prototype);
BallAndSocket.prototype.constructor = BallAndSocket;

/**
 * Initialize the BallAndSocket. Sets defaults if a property was not already set.
 *
 * @method
 * @return {undefined} undefined
 */
BallAndSocket.prototype.init = function() {
    var w = this.anchor;

    var a = this.a;
    var b = this.b;

    var q1t = Quaternion.conjugate(a.orientation, new Quaternion());
    var q2t = Quaternion.conjugate(b.orientation, new Quaternion());

    this.rA = Vec3.subtract(w, a.position, new Vec3());
    this.rB = Vec3.subtract(w, b.position, new Vec3());

    this.bodyRA = q1t.rotateVector(this.rA, new Vec3());
    this.bodyRB = q2t.rotateVector(this.rB, new Vec3());
};

/**
 * Detect violations of the constraint. Warm start the constraint, if possible.
 *
 * @method
 * @param {Number} time The current time in the physics engine.
 * @param {Number} dt The physics engine frame delta.
 * @return {undefined} undefined
 */
BallAndSocket.prototype.update = function(time, dt) {
    var a = this.a;
    var b = this.b;

    var rA = a.orientation.rotateVector(this.bodyRA, this.rA);
    var rB = b.orientation.rotateVector(this.bodyRB, this.rB);

    var xRA = new Mat33([0,rA.z,-rA.y,-rA.z,0,rA.x,rA.y,-rA.x,0]);
    var xRB = new Mat33([0,rB.z,-rB.y,-rB.z,0,rB.x,rB.y,-rB.x,0]);

    var RIaRt = Mat33.multiply(xRA, a.inverseInertia, new Mat33()).multiply(xRA.transpose());
    var RIbRt = Mat33.multiply(xRB, b.inverseInertia, new Mat33()).multiply(xRB.transpose());

    var invEffInertia = Mat33.add(RIaRt, RIbRt, RIaRt);

    var worldA = Vec3.add(a.position, this.rA, this.anchor);
    var worldB = Vec3.add(b.position, this.rB, VEC2_REGISTER);

    Vec3.subtract(worldB, worldA, this.error);
    this.error.scale(0.2/dt);

    var imA = a.inverseMass;
    var imB = b.inverseMass;

    var invEffMass = new Mat33([imA + imB,0,0,0,imA + imB,0,0,0,imA + imB]);

    Mat33.add(invEffInertia, invEffMass, this.effMassMatrix);
    this.effMassMatrix.inverse();

    var impulse = this.impulse;
    var angImpulseA = this.angImpulseA;
    var angImpulseB = this.angImpulseB;

    b.applyImpulse(impulse);
    b.applyAngularImpulse(angImpulseB);
    impulse.invert();
    a.applyImpulse(impulse);
    a.applyAngularImpulse(angImpulseA);

    impulse.clear();
    angImpulseA.clear();
    angImpulseB.clear();
};

/**
 * Apply impulses to resolve the constraint.
 *
 * @method
 * @return {undefined} undefined
 */
BallAndSocket.prototype.resolve = function resolve() {
    var a = this.a;
    var b = this.b;

    var rA = this.rA;
    var rB = this.rB;

    var v1 = Vec3.add(a.velocity, Vec3.cross(a.angularVelocity, rA, WxR_REGISTER), VB1_REGISTER);
    var v2 = Vec3.add(b.velocity, Vec3.cross(b.angularVelocity, rB, WxR_REGISTER), VB2_REGISTER);

    var impulse = v1.subtract(v2).subtract(this.error).applyMatrix(this.effMassMatrix);
    var angImpulseB = Vec3.cross(rB, impulse, VEC1_REGISTER);
    var angImpulseA = Vec3.cross(rA, impulse, VEC2_REGISTER).invert();

    b.applyImpulse(impulse);
    b.applyAngularImpulse(angImpulseB);
    impulse.invert();
    a.applyImpulse(impulse);
    a.applyAngularImpulse(angImpulseA);
    impulse.invert();

    this.impulse.add(impulse);
    this.angImpulseA.add(angImpulseA);
    this.angImpulseB.add(angImpulseB);
};

module.exports = BallAndSocket;

},{"../../math/Mat33":47,"../../math/Quaternion":48,"../../math/Vec3":50,"./Constraint":62}],61:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

var Vec3 = require('../../math/Vec3');
var Constraint = require('./Constraint');

var SweepAndPrune = require('./collision/SweepAndPrune');
var BruteForce = require('./collision/BruteForce');
var ConvexCollision = require('./collision/ConvexCollisionDetection');
var gjk = ConvexCollision.gjk;
var epa = ConvexCollision.epa;
var ContactManifoldTable = require('./collision/ContactManifold');

var ObjectManager = require('../../utilities/ObjectManager');
ObjectManager.register('CollisionData', CollisionData);
var oMRequestCollisionData = ObjectManager.requestCollisionData;

var VEC_REGISTER = new Vec3();

/**
 * Helper function to clamp a value to a given range.
 *
 * @method
 * @private
 * @param {Number} value The value to clamp.
 * @param {Number} lower The lower end.
 * @param {Number} upper The upper end.
 * @return {Number} The clamped value.
 */
function clamp(value, lower, upper) {
    return value < lower ? lower : value > upper ? upper : value;
}

/**
 * Object maintaining various figures of a collision. Registered in ObjectManager.
 *
 * @class CollisionData
 * @param {Number} penetration The degree of penetration.
 * @param {Vec3} normal The normal for the collision.
 * @param {Vec3} worldContactA The contact for A in world coordinates.
 * @param {Vec3} worldContactB The contact for B in world coordinates.
 * @param {Vec3} localContactA The contact for A in local coordinates.
 * @param {Vec3} localContactB The contact for B in local coordinates.
 */
function CollisionData(penetration, normal, worldContactA, worldContactB, localContactA, localContactB) {
    this.penetration = penetration;
    this.normal = normal;
    this.worldContactA = worldContactA;
    this.worldContactB = worldContactB;
    this.localContactA = localContactA;
    this.localContactB = localContactB;
}

/**
 * Used by ObjectManager to reset the object with different data.
 *
 * @method
 * @param {Number} penetration The degree of penetration.
 * @param {Vec3} normal The normal for the collision.
 * @param {Vec3} worldContactA The contact for A in world coordinates.
 * @param {Vec3} worldContactB The contact for B in world coordinates.
 * @param {Vec3} localContactA The contact for A in local coordinates.
 * @param {Vec3} localContactB The contact for B in local coordinates.
 * @return {CollisionData} this
 */
CollisionData.prototype.reset = function reset(penetration, normal, worldContactA, worldContactB, localContactA, localContactB) {
    this.penetration = penetration;
    this.normal = normal;
    this.worldContactA = worldContactA;
    this.worldContactB = worldContactB;
    this.localContactA = localContactA;
    this.localContactB = localContactB;

    return this;
};

/**
 * Ridid body Elastic Collision
 *
 * @class Collision
 * @extends Constraint
 * @param {Particle[]} targets The bodies to track.
 * @param {Object} options The options hash.
 */
function Collision(targets, options) {
    this.targets = [];
    if (targets) this.targets = this.targets.concat(targets);

    Constraint.call(this, options);
}

Collision.prototype = Object.create(Constraint.prototype);
Collision.prototype.constructor = Collision;

/**
 * Initialize the Collision tracker. Sets defaults if a property was not already set.
 *
 * @method
 * @return {undefined} undefined
 */
Collision.prototype.init = function() {
    if (this.broadPhase) {
        var BroadPhase = this.broadphase;
        if (BroadPhase instanceof Function) this.broadPhase = new BroadPhase(this.targets);
    }
    else this.broadPhase = new SweepAndPrune(this.targets);
    this.contactManifoldTable = this.contactManifoldTable || new ContactManifoldTable();
};

/**
 * Collison detection. Updates the existing contact manifolds, runs the broadphase, and performs narrowphase
 * collision detection. Warm starts the contacts based on the results of the previous physics frame
 * and prepares necesssary calculations for the resolution.
 *
 * @method
 * @param {Number} time The current time in the physics engine.
 * @param {Number} dt The physics engine frame delta.
 * @return {undefined} undefined
 */
 Collision.prototype.update = function update(time, dt) {
    this.contactManifoldTable.update(dt);
    if (this.targets.length === 0) return;
    var i, len;
    for (i = 0, len = this.targets.length; i < len; i++) {
        this.targets[i].updateShape();
    }
    var potentialCollisions = this.broadPhase.update();
    var pair;
    for (i = 0, len = potentialCollisions.length; i < len; i++) {
        pair = potentialCollisions[i];
        if (pair) this.applyNarrowPhase(pair);
    }
    this.contactManifoldTable.prepContacts(dt);
};

/**
 * Apply impulses to resolve all Contact constraints.
 *
 * @method
 * @param {Number} time The current time in the physics engine.
 * @param {Number} dt The physics engine frame delta.
 * @return {undefined} undefined
 */
Collision.prototype.resolve = function resolve(time, dt) {
    this.contactManifoldTable.resolveManifolds(dt);
};

/**
 * Add a target or targets to the collision system.
 *
 * @method
 * @param {Particle} target The body to begin tracking.
 * @return {undefined} undefined
 */
Collision.prototype.addTarget = function addTarget(target) {
    this.targets.push(target);
    this.broadPhase.add(target);
};

/**
 * Remove a target or targets from the collision system.
 *
 * @method
 * @param {Particle} target The body to remove.
 * @return {undefined} undefined
 */
Collision.prototype.removeTarget = function removeTarget(target) {
    var index = this.targets.indexOf(target);
    if (index < 0) return;
    this.targets.splice(index, 1);
    this.broadPhase.remove(target);
};


var CONVEX = 1 << 0;
var BOX = 1 << 1;
var SPHERE = 1 << 2;
var WALL = 1 << 3;

var CONVEX_CONVEX = CONVEX | CONVEX;
var BOX_BOX = BOX | BOX;
var BOX_CONVEX = BOX | CONVEX;
var SPHERE_SPHERE = SPHERE | SPHERE;
var BOX_SPHERE = BOX | SPHERE;
var CONVEX_SPHERE = CONVEX | SPHERE;
var CONVEX_WALL = CONVEX | WALL;
var BOX_WALL = BOX | WALL;
var SPHERE_WALL = SPHERE | WALL;

var dispatch = {};
dispatch[CONVEX_CONVEX] = convexIntersectConvex;
dispatch[BOX_BOX] = convexIntersectConvex;
dispatch[BOX_CONVEX] = convexIntersectConvex;
dispatch[CONVEX_SPHERE] = convexIntersectConvex;
dispatch[SPHERE_SPHERE] = sphereIntersectSphere;
dispatch[BOX_SPHERE] = boxIntersectSphere;
dispatch[CONVEX_WALL] = convexIntersectWall;
dispatch[BOX_WALL] = convexIntersectWall;
dispatch[SPHERE_WALL] = convexIntersectWall;

/**
 * Narrowphase collision detection,
 * registers the Contact constraints for colliding bodies.
 *
 * Will detect the type of bodies in the collision.
 *
 * @method
 * @param {Particle[]} targets The targets.
 * @return {undefined} undefined
 */
Collision.prototype.applyNarrowPhase = function applyNarrowPhase(targets) {
    for (var i = 0, len = targets.length; i < len; i++) {
        for (var j = i + 1; j < len; j++) {
            var  a = targets[i];
            var b = targets[j];

            if ((a.collisionMask & b.collisionGroup && a.collisionGroup & b.collisionMask) === 0) continue;

            var collisionType = a.type | b.type;

            if (dispatch[collisionType]) dispatch[collisionType](this, a, b);
        }
    }
};

/**
 * Detects sphere-sphere collisions and registers the Contact.
 *
 * @private
 * @method
 * @param {Object} context The Collision instance.
 * @param {Sphere} sphere1 One sphere collider.
 * @param {Sphere} sphere2 The other sphere collider.
 * @return {undefined} undefined
 */
function sphereIntersectSphere(context, sphere1, sphere2) {
    var p1 = sphere1.position;
    var p2 = sphere2.position;
    var relativePosition = Vec3.subtract(p2, p1, new Vec3());
    var distance = relativePosition.length();
    var sumRadii = sphere1.radius + sphere2.radius;
    var n = relativePosition.scale(1/distance);

    var overlap = sumRadii - distance;

    // Distance check
    if (overlap < 0) return;

    var rSphere1 = Vec3.scale(n, sphere1.radius, new Vec3());
    var rSphere2 = Vec3.scale(n, -sphere2.radius, new Vec3());

    var wSphere1 = Vec3.add(p1, rSphere1, new Vec3());
    var wSphere2 = Vec3.add(p2, rSphere2, new Vec3());

    var collisionData = oMRequestCollisionData().reset(overlap, n, wSphere1, wSphere2, rSphere1, rSphere2);

    context.contactManifoldTable.registerContact(sphere1, sphere2, collisionData);
}

/**
* Detects box-sphere collisions and registers the Contact.
*
* @param {Object} context The Collision instance.
* @param {Box} box The box collider.
* @param {Sphere} sphere The sphere collider.
* @return {undefined} undefined
*/
function boxIntersectSphere(context, box, sphere) {
    if (box.type === SPHERE) {
        var temp = sphere;
        sphere = box;
        box = temp;
    }

    var pb = box.position;
    var ps = sphere.position;
    var relativePosition = Vec3.subtract(ps, pb, VEC_REGISTER);

    var q = box.orientation;

    var r = sphere.radius;

    var bsize = box.size;
    var halfWidth = bsize[0]*0.5;
    var halfHeight = bsize[1]*0.5;
    var halfDepth = bsize[2]*0.5;

    // x, y, z
    var bnormals = box.normals;
    var n1 = q.rotateVector(bnormals[1], new Vec3());
    var n2 = q.rotateVector(bnormals[0], new Vec3());
    var n3 = q.rotateVector(bnormals[2], new Vec3());

    // Find the point on the cube closest to the center of the sphere
    var closestPoint = new Vec3();
    closestPoint.x = clamp(Vec3.dot(relativePosition,n1), -halfWidth, halfWidth);
    closestPoint.y = clamp(Vec3.dot(relativePosition,n2), -halfHeight, halfHeight);
    closestPoint.z = clamp(Vec3.dot(relativePosition,n3), -halfDepth, halfDepth);
    // The vector found is relative to the center of the unrotated box -- rotate it
    // to find the point w.r.t. to current orientation
    closestPoint.applyRotation(q);

    // The impact point in world space
    var impactPoint = Vec3.add(pb, closestPoint, new Vec3());
    var sphereToImpact = Vec3.subtract(impactPoint, ps, impactPoint);
    var distanceToSphere = sphereToImpact.length();

    // If impact point is not closer to the sphere's center than its radius -> no collision
    var overlap = r - distanceToSphere;
    if (overlap < 0) return;

    var n = Vec3.scale(sphereToImpact, -1 / distanceToSphere, new Vec3());
    var rBox = closestPoint;
    var rSphere = sphereToImpact;

    var wBox = Vec3.add(pb, rBox, new Vec3());
    var wSphere = Vec3.add(ps, rSphere, new Vec3());

    var collisionData = oMRequestCollisionData().reset(overlap, n, wBox, wSphere, rBox, rSphere);

    context.contactManifoldTable.registerContact(box, sphere, collisionData);
}

/**
* Detects convex-convex collisions and registers the Contact. Uses GJK to determine overlap and then
* EPA to determine the actual collision data.
*
* @param {Object} context The Collision instance.
* @param {Particle} convex1 One convex body collider.
* @param {Particle} convex2 The other convex body collider.
* @return {undefined} undefined
*/
function convexIntersectConvex(context, convex1, convex2) {
    var glkSimplex = gjk(convex1, convex2);

    // No simplex -> no collision
    if (!glkSimplex) return;

    var collisionData = epa(convex1, convex2, glkSimplex);
    if (collisionData !== null) context.contactManifoldTable.registerContact(convex1, convex2, collisionData);
}

/**
* Detects convex-wall collisions and registers the Contact.
*
* @param {Object} context The Collision instance.
* @param {Particle} convex The convex body collider.
* @param {Wall} wall The wall collider.
* @return {undefined} undefined
*/
function convexIntersectWall(context, convex, wall) {
    if (convex.type === WALL) {
        var temp = wall;
        wall = convex;
        convex = temp;
    }

    var convexPos = convex.position;
    var wallPos = wall.position;

    var n = wall.normal;
    var invN = wall.invNormal;

    var rConvex = convex.support(invN);
    var wConvex = Vec3.add(convexPos, rConvex, new Vec3());

    var diff = Vec3.subtract(wConvex, wallPos, VEC_REGISTER);

    var penetration = Vec3.dot(diff, invN);

    if (penetration < 0) return;

    var wWall = Vec3.scale(n, penetration, new Vec3()).add(wConvex);
    var rWall = Vec3.subtract(wWall, wall.position, new Vec3());

    var collisionData = oMRequestCollisionData().reset(penetration, invN, wConvex, wWall, rConvex, rWall);

    context.contactManifoldTable.registerContact(convex, wall, collisionData);
}

Collision.SweepAndPrune = SweepAndPrune;
Collision.BruteForce = BruteForce.BruteForce;
Collision.BruteForceAABB = BruteForce.BruteForceAABB;

module.exports = Collision;

},{"../../math/Vec3":50,"../../utilities/ObjectManager":97,"./Constraint":62,"./collision/BruteForce":68,"./collision/ContactManifold":69,"./collision/ConvexCollisionDetection":70,"./collision/SweepAndPrune":71}],62:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

var _ID = 0;
/**
 * Base Constraint class to be used in the Physics
 * Subclass this class to implement a constraint
 *
 * @virtual
 * @class Constraint
 * @param {Object} options The options hash.
 */
function Constraint(options) {
    options = options || {};
    this.setOptions(options);

    this._ID = _ID++;
}

/**
 * Decorates the Constraint with the options object.
 *
 * @method
 * @param {Object} options The options hash.
 * @return {undefined} undefined
 */
Constraint.prototype.setOptions = function setOptions(options) {
    for (var key in options) this[key] = options[key];
    this.init(options);
};

/**
 * Method invoked upon instantiation and the setting of options.
 *
 * @method
 * @param {Object} options The options hash.
 * @return {undefined} undefined
 */
Constraint.prototype.init = function init(options) {};

/**
 * Detect violations of the constraint. Warm start the constraint, if possible.
 *
 * @method
 * @param {Number} time The current time in the physics engine.
 * @param {Number} dt The physics engine frame delta.
 * @return {undefined} undefined
 */
Constraint.prototype.update = function update(time, dt) {};

/**
 * Apply impulses to resolve the constraint.
 *
 * @method
 * @param {Number} time The current time in the physics engine.
 * @param {Number} dt The physics engine frame delta.
 * @return {undefined} undefined
 */
Constraint.prototype.resolve = function resolve(time, dt) {};

module.exports = Constraint;

},{}],63:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

var Constraint = require('./Constraint');
var Vec3 = require('../../math/Vec3');

var IMPULSE_REGISTER = new Vec3();
var NORMAL_REGISTER = new Vec3();

/** @const */
var EPSILSON = 1e-7;
/** @const */
var PI = Math.PI;


/**
 * A constraint that keeps a physics body on a given implicit curve.
 *
 * @class Curve
 * @extends Constraint
 * @param {Particle[]} targets The bodies to track.
 * @param {Object} options The options hash.
 */
function Curve(targets, options) {
    if (targets) {
        if (targets instanceof Array) this.targets = targets;
        else this.targets = [targets];
    }
    else this.targets = [];

    Constraint.call(this, options);

    this.impulses = {};
    this.normals = {};
    this.velocityBiases = {};
    this.divisors = {};
}

Curve.prototype = Object.create(Constraint.prototype);
Curve.prototype.constructor = Curve;

/**
 * Initialize the Curve. Sets defaults if a property was not already set.
 *
 * @method
 * @return {undefined} undefined
 */
Curve.prototype.init = function() {
    this.equation1 = this.equation1 || function() {
        return 0;
    };
    this.equation2 = this.equation2 || function(x, y, z) {
        return z;
    };
    this.period = this.period || 1;
    this.dampingRatio = this.dampingRatio || 0.5;

    this.stiffness = 4 * PI * PI / (this.period * this.period);
    this.damping = 4 * PI * this.dampingRatio / this.period;
};

/**
 * Warmstart the constraint and prepare calculations used in the .resolve step.
 *
 * @method
 * @param {Number} time The current time in the physics engine.
 * @param {Number} dt The physics engine frame delta.
 * @return {undefined} undefined
 */
Curve.prototype.update = function update(time, dt) {
    var targets = this.targets;

    var normals = this.normals;
    var velocityBiases = this.velocityBiases;
    var divisors = this.divisors;
    var impulses = this.impulses;

    var impulse = IMPULSE_REGISTER;
    var n = NORMAL_REGISTER;

    var f = this.equation1;
    var g = this.equation2;

    var _c = this.damping;
    var _k = this.stiffness;

    for (var i = 0, len = targets.length; i < len; i++) {
        var body = targets[i];
        var ID = body._ID;
        if (body.immune) continue;

        var p = body.position;
        var m = body.mass;

        var gamma;
        var beta;

        if (this.period === 0) {
            gamma = 0;
            beta = 1;
        }
        else {
            var c = _c * m;
            var k = _k * m;

            gamma = 1 / (dt*(c + dt*k));
            beta  = dt*k / (c + dt*k);
        }

        var x = p.x;
        var y = p.y;
        var z = p.z;

        var f0 = f(x, y, z);
        var dfx = (f(x + EPSILSON, y, z) - f0) / EPSILSON;
        var dfy = (f(x, y + EPSILSON, z) - f0) / EPSILSON;
        var dfz = (f(x, y, z + EPSILSON) - f0) / EPSILSON;

        var g0 = g(x, y, z);
        var dgx = (g(x + EPSILSON, y, z) - g0) / EPSILSON;
        var dgy = (g(x, y + EPSILSON, z) - g0) / EPSILSON;
        var dgz = (g(x, y, z + EPSILSON) - g0) / EPSILSON;

        n.set(dfx + dgx, dfy + dgy, dfz + dgz);
        n.normalize();

        var baumgarte = beta * (f0 + g0) / dt;
        var divisor = gamma + 1 / m;

        var lambda = impulses[ID] || 0;
        Vec3.scale(n, lambda, impulse);
        body.applyImpulse(impulse);

        normals[ID] = normals[ID] || new Vec3();
        normals[ID].copy(n);
        velocityBiases[ID] = baumgarte;
        divisors[ID] = divisor;
        impulses[ID] = 0;
    }
};

/**
 * Adds a curve impulse to a physics body.
 *
 * @method
 * @return {undefined} undefined
 */
Curve.prototype.resolve = function resolve() {
    var targets = this.targets;

    var normals = this.normals;
    var velocityBiases = this.velocityBiases;
    var divisors = this.divisors;
    var impulses = this.impulses;

    var impulse = IMPULSE_REGISTER;

    for (var i = 0, len = targets.length; i < len; i++) {
        var body = targets[i];
        var ID = body._ID;
        if (body.immune) continue;

        var v = body.velocity;
        var n = normals[ID];

        var lambda = -(Vec3.dot(n, v) + velocityBiases[ID]) / divisors[ID];

        Vec3.scale(n, lambda, impulse);
        body.applyImpulse(impulse);


        impulses[ID] += lambda;
    }
};

module.exports = Curve;

},{"../../math/Vec3":50,"./Constraint":62}],64:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

var Constraint = require('./Constraint');
var Vec3 = require('../../math/Vec3');

var NORMAL_REGISTER = new Vec3();
var IMPULSE_REGISTER = new Vec3();
var V_REGISTER = new Vec3();
var P_REGISTER = new Vec3();
var DIRECTION_REGISTER = new Vec3();

/** @const */
var PI = Math.PI;

/**
 * A constraint that maintains the direction of one body from another.
 *
 * @class Direction
 * @extends Constraint
 * @param {Particle} a One of the bodies.
 * @param {Particle} b The other body.
 * @param {Object} options An object of configurable options.
 */
function Direction(a, b, options) {
    this.a = a;
    this.b = b;

    Constraint.call(this, options);

    this.impulse = 0;
    this.distance = 0;
    this.normal = new Vec3();
    this.velocityBias = 0;
    this.divisor = 0;
}

Direction.prototype = Object.create(Constraint.prototype);
Direction.prototype.constructor = Direction;

/**
 * Initialize the Direction. Sets defaults if a property was not already set.
 *
 * @method
 * @return {undefined} undefined
 */
Direction.prototype.init = function() {
    this.direction = this.direction || Vec3.subtract(this.b.position, this.a.position, new Vec3());
    this.direction.normalize();
    this.minLength = this.minLength || 0;
    this.period = this.period || 0.2;
    this.dampingRatio = this.dampingRatio || 0.5;

    this.stiffness = 4 * PI * PI / (this.period * this.period);
    this.damping = 4 * PI * this.dampingRatio / this.period;
};

/**
 * Warmstart the constraint and prepare calculations used in .resolve.
 *
 * @method
 * @param {Number} time The current time in the physics engine.
 * @param {Number} dt The physics engine frame delta.
 * @return {undefined} undefined
 */
Direction.prototype.update = function update(time, dt) {
    var a = this.a;
    var b = this.b;

    var n = NORMAL_REGISTER;
    var diffP = P_REGISTER;
    var impulse = IMPULSE_REGISTER;
    var directionVector = DIRECTION_REGISTER;

    var p1 = a.position;
    var w1 = a.inverseMass;

    var p2 = b.position;
    var w2 = b.inverseMass;

    var direction = this.direction;

    Vec3.subtract(p2, p1, diffP);
    Vec3.scale(direction, Vec3.dot(direction, diffP), directionVector);
    var goal = directionVector.add(p1);

    Vec3.subtract(p2, goal, n);
    var dist = n.length();
    n.normalize();

    var invEffectiveMass = w1 + w2;
    var effectiveMass = 1 / invEffectiveMass;
    var gamma;
    var beta;

    if (this.period === 0) {
        gamma = 0;
        beta  = 1;
    }
    else {
        var c = this.damping * effectiveMass;
        var k = this.stiffness * effectiveMass;

        gamma = 1 / (dt*(c + dt*k));
        beta  = dt*k / (c + dt*k);
    }

    var baumgarte = beta * dist / dt;
    var divisor = gamma + invEffectiveMass;

    var lambda = this.impulse;
    Vec3.scale(n, lambda, impulse);
    b.applyImpulse(impulse);
    a.applyImpulse(impulse.invert());

    this.normal.copy(n);
    this.distance = dist;
    this.velocityBias = baumgarte;
    this.divisor = divisor;
    this.impulse = 0;
};

/**
 * Adds an impulse to a physics body's velocity due to the constraint
 *
 * @method
 * @return {undefined} undefined
 */
Direction.prototype.resolve = function update() {
    var a = this.a;
    var b = this.b;

    var impulse  = IMPULSE_REGISTER;
    var diffV = V_REGISTER;

    var minLength = this.minLength;

    var dist = this.distance;
    if (Math.abs(dist) < minLength) return;

    var v1 = a.velocity;
    var v2 = b.velocity;
    var n = this.normal;

    Vec3.subtract(v2, v1, diffV);

    var lambda = -(Vec3.dot(n, diffV) + this.velocityBias) / this.divisor;
    Vec3.scale(n, lambda, impulse);
    b.applyImpulse(impulse);
    a.applyImpulse(impulse.invert());

    this.impulse += lambda;
};

module.exports = Direction;

},{"../../math/Vec3":50,"./Constraint":62}],65:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

var Constraint = require('./Constraint');
var Vec3 = require('../../math/Vec3');

var NORMAL_REGISTER = new Vec3();
var IMPULSE_REGISTER = new Vec3();
var V_REGISTER = new Vec3();
var P_REGISTER = new Vec3();

/** @const */
var PI = Math.PI;

/**
 * A constraint that keeps two bodies within a certain distance.
 *
 * @class Distance
 * @extends Constraint
 * @param {Particle} a One of the bodies.
 * @param {Particle} b The other body.
 * @param {Object} options An object of configurable options.
 */
function Distance(a, b, options) {
    this.a = a;
    this.b = b;

    Constraint.call(this, options);

    this.impulse = 0;
    this.distance = 0;
    this.normal = new Vec3();
    this.velocityBias = 0;
    this.divisor = 0;
}

Distance.prototype = Object.create(Constraint.prototype);
Distance.prototype.constructor = Distance;

/**
 * Initialize the Distance. Sets defaults if a property was not already set.
 *
 * @method
 * @return {undefined} undefined
 */
Distance.prototype.init = function() {
    this.length = this.length || Vec3.subtract(this.b.position, this.a.position, P_REGISTER).length();
    this.minLength = this.minLength || 0;
    this.period = this.period || 0.2;
    this.dampingRatio = this.dampingRatio || 0.5;

    this.stiffness = 4 * PI * PI / (this.period * this.period);
    this.damping = 4 * PI * this.dampingRatio / this.period;
};

/**
 * Detect violations of the constraint. Warm start the constraint, if possible.
 *
 * @method
 * @param {Number} time The current time in the physics engine.
 * @param {Number} dt The physics engine frame delta.
 * @return {undefined} undefined
 */
Distance.prototype.update = function(time, dt) {
    var a = this.a;
    var b = this.b;

    var n = NORMAL_REGISTER;
    var diffP = P_REGISTER;
    var impulse = IMPULSE_REGISTER;

    var length = this.length;

    var p1 = a.position;
    var w1 = a.inverseMass;

    var p2 = b.position;
    var w2 = b.inverseMass;

    Vec3.subtract(p2, p1, diffP);

    var separation = diffP.length();

    Vec3.scale(diffP, 1 / separation, n);

    var dist = separation - length;

    var invEffectiveMass = w1 + w2;
    var effectiveMass = 1 / invEffectiveMass;
    var gamma;
    var beta;

    if (this.period === 0) {
        gamma = 0;
        beta  = 1;
    }
    else {
        var c = this.damping * effectiveMass;
        var k = this.stiffness * effectiveMass;

        gamma = 1 / (dt*(c + dt*k));
        beta  = dt*k / (c + dt*k);
    }

    var baumgarte = beta * dist / dt;
    var divisor = gamma + invEffectiveMass;

    var lambda = this.impulse;
    Vec3.scale(n, lambda, impulse);
    b.applyImpulse(impulse);
    a.applyImpulse(impulse.invert());

    this.normal.copy(n);
    this.distance = dist;
    this.velocityBias = baumgarte;
    this.divisor = divisor;
    this.impulse = 0;
};

/**
 * Apply impulses to resolve the constraint.
 *
 * @method
 * @return {undefined} undefined
 */
Distance.prototype.resolve = function resolve() {
    var a = this.a;
    var b = this.b;

    var impulse = IMPULSE_REGISTER;
    var diffV = V_REGISTER;

    var minLength = this.minLength;

    var dist = this.distance;
    if (Math.abs(dist) < minLength) return;

    var v1 = a.getVelocity();
    var v2 = b.getVelocity();

    var n = this.normal;

    Vec3.subtract(v2, v1, diffV);
    var lambda = -(Vec3.dot(n, diffV) + this.velocityBias) / this.divisor;
    Vec3.scale(n, lambda, impulse);
    b.applyImpulse(impulse);
    a.applyImpulse(impulse.invert());

    this.impulse += lambda;
};

module.exports = Distance;

},{"../../math/Vec3":50,"./Constraint":62}],66:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

var Constraint = require('./Constraint');
var Vec3 = require('../../math/Vec3');
var Mat33 = require('../../math/Mat33');
var Quaternion = require('../../math/Quaternion');

var VEC1_REGISTER = new Vec3();
var VEC2_REGISTER = new Vec3();
var VEC3_REGISTER = new Vec3();
var VEC4_REGISTER = new Vec3();
var VB1_REGISTER = new Vec3();
var VB2_REGISTER = new Vec3();
var WxR_REGISTER = new Vec3();
var DELTA_REGISTER = new Vec3();

/**
 * A constraint that confines two bodies to the plane defined by the axis of the hinge.
 *
 * @class Hinge
 * @extends Constraint
 * @param {Particle} a One of the bodies.
 * @param {Particle} b The other body.
 * @param {Options} options The options hash.
 *
 */
function Hinge(a, b, options) {
    this.a = a;
    this.b = b;

    Constraint.call(this, options);

    this.impulse = new Vec3();
    this.angImpulseA = new Vec3();
    this.angImpulseB = new Vec3();
    this.error = new Vec3();
    this.errorRot = [0,0];
    this.effMassMatrix = new Mat33();
    this.effMassMatrixRot = [];
}

Hinge.prototype = Object.create(Constraint.prototype);
Hinge.prototype.constructor = Hinge;

/**
 * Initialize the Hinge. Sets defaults if a property was not already set.
 *
 * @method
 * @return {undefined} undefined
 */
Hinge.prototype.init = function() {
    var w = this.anchor;

    var u = this.axis.normalize();

    var a = this.a;
    var b = this.b;

    var q1t = Quaternion.conjugate(a.orientation, new Quaternion());
    var q2t = Quaternion.conjugate(b.orientation, new Quaternion());

    this.rA = Vec3.subtract(w, a.position, new Vec3());
    this.rB = Vec3.subtract(w, b.position, new Vec3());

    this.bodyRA = q1t.rotateVector(this.rA, new Vec3());
    this.bodyRB = q2t.rotateVector(this.rB, new Vec3());

    this.axisA = Vec3.clone(u);
    this.axisB = Vec3.clone(u);

    this.axisBTangent1 = new Vec3();
    this.axisBTangent2 = new Vec3();

    this.t1xA = new Vec3();
    this.t2xA = new Vec3();

    this.bodyAxisA = q1t.rotateVector(u, new Vec3());
    this.bodyAxisB = q2t.rotateVector(u, new Vec3());
};

/**
 * Detect violations of the constraint. Warm start the constraint, if possible.
 *
 * @method
 * @param {Number} time The current time in the physics engine.
 * @param {Number} dt The physics engine frame delta.
 * @return {undefined} undefined
 */
Hinge.prototype.update = function(time, dt) {
    var a = this.a;
    var b = this.b;

    var axisA = a.orientation.rotateVector(this.bodyAxisA, this.axisA);
    var axisB = b.orientation.rotateVector(this.bodyAxisB, this.axisB);
    this.axis.copy(axisB);

    var n = axisB;
    var t1 = this.axisBTangent1;
    var t2 = this.axisBTangent2;

    if (n.x >= 0.57735) {
        t1.set(n.y, -n.x, 0);
    }
    else {
        t1.set(0, n.z, -n.y);
    }
    t1.normalize();
    Vec3.cross(n, t1, t2);

    var t1xA = Vec3.cross(t1, axisA, this.t1xA);
    var t2xA = Vec3.cross(t2, axisA, this.t2xA);

    var rA = a.orientation.rotateVector(this.bodyRA, this.rA);
    var rB = b.orientation.rotateVector(this.bodyRB, this.rB);

    var xRA = new Mat33([0,rA.z,-rA.y,-rA.z,0,rA.x,rA.y,-rA.x,0]);
    var xRB = new Mat33([0,rB.z,-rB.y,-rB.z,0,rB.x,rB.y,-rB.x,0]);

    var RIaRt = Mat33.multiply(xRA, a.inverseInertia, new Mat33()).multiply(xRA.transpose());
    var RIbRt = Mat33.multiply(xRB, b.inverseInertia, new Mat33()).multiply(xRB.transpose());

    var invEffInertia = Mat33.add(RIaRt, RIbRt, RIaRt);

    var worldA = Vec3.add(a.position, this.rA, this.anchor);
    var worldB = Vec3.add(b.position, this.rB, VEC1_REGISTER);

    var invDt = 1/dt;
    Vec3.subtract(worldB, worldA, this.error);
    this.error.scale(0.2*invDt);

    var imA = a.inverseMass;
    var imB = b.inverseMass;

    var invEffMass = new Mat33([imA + imB,0,0,0,imA + imB,0,0,0,imA + imB]);

    Mat33.add(invEffInertia, invEffMass, this.effMassMatrix);
    this.effMassMatrix.inverse();

    var invIAt1xA = a.inverseInertia.vectorMultiply(t1xA, VEC1_REGISTER);
    var invIAt2xA = a.inverseInertia.vectorMultiply(t2xA, VEC2_REGISTER);
    var invIBt1xA = b.inverseInertia.vectorMultiply(t1xA, VEC3_REGISTER);
    var invIBt2xA = b.inverseInertia.vectorMultiply(t2xA, VEC4_REGISTER);

    var a11 = Vec3.dot(t1xA, invIAt1xA) + Vec3.dot(t1xA, invIBt1xA);
    var a12 = Vec3.dot(t1xA, invIAt2xA) + Vec3.dot(t1xA, invIBt2xA);
    var a21 = Vec3.dot(t2xA, invIAt1xA) + Vec3.dot(t2xA, invIBt1xA);
    var a22 = Vec3.dot(t2xA, invIAt2xA) + Vec3.dot(t2xA, invIBt2xA);

    var det = 1 / (a11*a22 - a12*a21);

    this.effMassMatrixRot[0] = a22 * det;
    this.effMassMatrixRot[1] = -a21 * det;
    this.effMassMatrixRot[2] = -a12 * det;
    this.effMassMatrixRot[3] = a11 * det;

    this.errorRot[0] = Vec3.dot(axisA, t1) * 0.2*invDt;
    this.errorRot[1] = Vec3.dot(axisA, t2) * 0.2*invDt;

    var impulse = this.impulse.scale(0.5);
    var angImpulseA = this.angImpulseA.scale(0.5);
    var angImpulseB = this.angImpulseB.scale(0.5);

    b.applyImpulse(impulse);
    b.applyAngularImpulse(angImpulseB);
    impulse.invert();
    a.applyImpulse(impulse);
    a.applyAngularImpulse(angImpulseA);

    impulse.clear();
    angImpulseA.clear();
    angImpulseB.clear();
};

/**
 * Apply impulses to resolve the constraint.
 *
 * @method
 * @return {undefined} undefined
 */
Hinge.prototype.resolve = function resolve() {
    var a = this.a;
    var b = this.b;

    var rA = this.rA;
    var rB = this.rB;

    var t1xA = this.t1xA;
    var t2xA = this.t2xA;

    var w1 = a.angularVelocity;
    var w2 = b.angularVelocity;

    var v1 = Vec3.add(a.velocity, Vec3.cross(w1, rA, WxR_REGISTER), VB1_REGISTER);
    var v2 = Vec3.add(b.velocity, Vec3.cross(w2, rB, WxR_REGISTER), VB2_REGISTER);

    var impulse = v1.subtract(v2).subtract(this.error).applyMatrix(this.effMassMatrix);

    var diffW = Vec3.subtract(w2, w1, DELTA_REGISTER);

    var errorRot = this.errorRot;
    var jv1 = Vec3.dot(t1xA, diffW) + errorRot[0];
    var jv2 = Vec3.dot(t2xA, diffW) + errorRot[1];

    var K = this.effMassMatrixRot;

    var l1 = -(K[0]*jv1 + K[1]*jv2);
    var l2 = -(K[2]*jv1 + K[3]*jv2);

    var angImpulse = Vec3.scale(t1xA, l1, VEC2_REGISTER).add(Vec3.scale(t2xA, l2, VEC3_REGISTER));

    var angImpulseB = Vec3.cross(rB, impulse, VEC1_REGISTER).add(angImpulse);
    var angImpulseA = Vec3.cross(rA, impulse, VEC4_REGISTER).invert().subtract(angImpulse);

    b.applyImpulse(impulse);
    b.applyAngularImpulse(angImpulseB);
    impulse.invert();
    a.applyImpulse(impulse);
    a.applyAngularImpulse(angImpulseA);
    impulse.invert();

    this.impulse.add(impulse);
    this.angImpulseA.add(angImpulseA);
    this.angImpulseB.add(angImpulseB);
};

module.exports = Hinge;

},{"../../math/Mat33":47,"../../math/Quaternion":48,"../../math/Vec3":50,"./Constraint":62}],67:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

/**
 * Axis-aligned bounding box. Used in collision broadphases.
 *
 * @class AABB
 * @param {Particle} body The body around which to track a bounding box.
 */
function AABB(body) {
    this._body = body;
    this._ID = body._ID;
    this.position = null;
    this.vertices = {
        x: [],
        y: [],
        z: []
    };
    this.update();
}

var SPHERE = 1 << 2;
var WALL = 1 << 3;

var DOWN = 0;
var UP = 1;
var LEFT = 2;
var RIGHT = 3;
var FORWARD = 4;
var BACKWARD = 5;

/**
 * Update the bounds to reflect the current orientation and position of the parent Body.
 *
 * @method
 * @return {undefined} undefined
 */
AABB.prototype.update = function() {
    var body = this._body;
    var pos = this.position = body.position;

    var minX = Infinity, maxX = -Infinity;
    var minY = Infinity, maxY = -Infinity;
    var minZ = Infinity, maxZ = -Infinity;

    var type = body.type;
    if (type === SPHERE) {
        maxX = maxY = maxZ = body.radius;
        minX = minY = minZ = -body.radius;
    }
    else if (type === WALL) {
        var d = body.direction;
        maxX = maxY = maxZ = 1e6;
        minX = minY = minZ = -1e6;
        switch (d) {
            case DOWN:
                maxY = 25;
                minY = -1e3;
                break;
            case UP:
                maxY = 1e3;
                minY = -25;
                break;
            case LEFT:
                maxX = 25;
                minX = -1e3;
                break;
            case RIGHT:
                maxX = 1e3;
                minX = -25;
                break;
            case FORWARD:
                maxZ = 25;
                minZ = -1e3;
                break;
            case BACKWARD:
                maxZ = 1e3;
                minZ = -25;
                break;
            default:
                break;
       }
    }
    else if (body.vertices) {
        // ConvexBody
        var bodyVertices = body.vertices;
        for (var i = 0, len = bodyVertices.length; i < len; i++) {
            var vertex = bodyVertices[i];
            if (vertex.x < minX) minX = vertex.x;
            if (vertex.x > maxX) maxX = vertex.x;
            if (vertex.y < minY) minY = vertex.y;
            if (vertex.y > maxY) maxY = vertex.y;
            if (vertex.z < minZ) minZ = vertex.z;
            if (vertex.z > maxZ) maxZ = vertex.z;
        }
    }
    else {
        // Particle
        maxX = maxY = maxZ = 25;
        minX = minY = minZ = -25;
    }
    var vertices = this.vertices;
    vertices.x[0] = minX + pos.x;
    vertices.x[1] = maxX + pos.x;
    vertices.y[0] = minY + pos.y;
    vertices.y[1] = maxY + pos.y;
    vertices.z[0] = minZ + pos.z;
    vertices.z[1] = maxZ + pos.z;
};

/**
 * Check for overlap between two AABB's.
 *
 * @method
 * @param {AABB} aabb1 The first bounding box.
 * @param {AABB} aabb2 The second bounding box.
 * @return {undefined} undefined
 */
AABB.checkOverlap = function(aabb1, aabb2) {
    var vertices1 = aabb1.vertices;
    var vertices2 = aabb2.vertices;

    var x10 = vertices1.x[0];
    var x11 = vertices1.x[1];
    var x20 = vertices2.x[0];
    var x21 = vertices2.x[1];
    if ((x20 <= x10 && x10 <= x21) || (x10 <= x20 && x20 <= x11)) {
        var y10 = vertices1.y[0];
        var y11 = vertices1.y[1];
        var y20 = vertices2.y[0];
        var y21 = vertices2.y[1];
        if ((y20 <= y10 && y10 <= y21) || (y10 <= y20 && y20 <= y11)) {
            var z10 = vertices1.z[0];
            var z11 = vertices1.z[1];
            var z20 = vertices2.z[0];
            var z21 = vertices2.z[1];
            if ((z20 <= z10 && z10 <= z21) || (z10 <= z20 && z20 <= z11)) {
                return true;
            }
        }
    }
    return false;
};

AABB.vertexThreshold = 100;

module.exports = AABB;

},{}],68:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

var AABB = require('./AABB');

/**
 * O(n^2) comparisons with an AABB check for a midphase. Likely to be more performant
 * that the BruteForce when the bodies have many vertices. Only feasible for a small number of bodies.
 *
 * @class BruteForAABB
 * @param {Particles[]} targets The bodies to track.
 */
function BruteForceAABB(targets) {
    this._volumes = [];
    this._entityRegistry = {};
    for (var i = 0; i < targets.length; i++) {
        this.add(targets[i]);
    }
}

/**
 * Start tracking a Particle.
 *
 * @method
 * @param {Particle} body The body to track.
 * @return {undefined} undefined
 */
BruteForceAABB.prototype.add = function add(body) {
    var boundingVolume = new AABB(body);

    this._entityRegistry[body._ID] = body;
    this._volumes.push(boundingVolume);
};

/**
 * Return an array of possible collision pairs, culled by an AABB intersection test.
 *
 * @method
 * @return {Array.<Particle[]>} Results.
 */
BruteForceAABB.prototype.update = function update() {
    var _volumes = this._volumes;
    var _entityRegistry = this._entityRegistry;

    for (var k = 0, len = _volumes.length; k < len; k++) {
        _volumes[k].update();
    }

    var result = [];
    for (var i = 0, numTargets = _volumes.length; i < numTargets; i++) {
        for (var j = i + 1; j < numTargets; j++) {
            if (AABB.checkOverlap(_volumes[i], _volumes[j])) {
                result.push([_entityRegistry[i], _entityRegistry[j]]);
            }
        }
    }
    return result;
};

/**
 * The most simple yet computationally intensive broad-phase. Immediately passes its targets to the narrow-phase,
 * resulting in an O(n^2) process. Only feasible for a relatively small number of bodies.
 *
 * @class BruteForce
 * @param {Particle[]} targets The targets to track.
 */
function BruteForce(targets) {
    this.targets = targets;
}

/**
 * Start tracking a Particle.
 *
 * @method
 * @param {Particle} body The body to track.
 * @return {undefined} undefined
 */
BruteForce.prototype.add = function add(body) {
    this.targets.push(body);
};

/**
 * Immediately returns an array of possible collisions.
 *
 * @method
 * @return {Array.<Particle[]>} Results.
 */
BruteForce.prototype.update = function update() {
    return [this.targets];
};

module.exports.BruteForceAABB = BruteForceAABB;
module.exports.BruteForce = BruteForce;

},{"./AABB":67}],69:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

var Vec3 = require('../../../math/Vec3');
var ObjectManager = require('../../../utilities/ObjectManager');

ObjectManager.register('Manifold', Manifold);
ObjectManager.register('Contact', Contact);
var oMRequestManifold = ObjectManager.requestManifold;
var oMRequestContact = ObjectManager.requestContact;
var oMFreeManifold = ObjectManager.freeManifold;
var oMFreeContact = ObjectManager.freeContact;

/**
 * Helper function to clamp a value to a given range.
 *
 * @method
 * @private
 * @param {Number} value The value to clamp.
 * @param {Number} lower The lower limit.
 * @param {Number} upper The upper limit
 * @return {Number} The clamped value.
 */
function clamp(value, lower, upper) {
    return value < lower ? lower : value > upper ? upper : value;
}

var VEC1_REGISTER = new Vec3();
var VEC2_REGISTER = new Vec3();
var VB1_REGISTER = new Vec3();
var VB2_REGISTER = new Vec3();
var WxR_REGISTER = new Vec3();
var R1_REGISTER = new Vec3();
var R2_REGISTER = new Vec3();
var NORMALIMPULSE_REGISTER = new Vec3();
var TANGENTIMPULSE1_REGISTER = new Vec3();
var TANGENTIMPULSE2_REGISTER = new Vec3();
var WA_REGISTER = new Vec3();
var WB_REGISTER = new Vec3();
var PENETRATING_REGISTER = new Vec3();
var DRIFTA_REGISTER = new Vec3();
var DRIFTB_REGISTER = new Vec3();

/**
 * Table maintaining and managing current contact manifolds.
 *
 * @class ContactManifoldTable
 */
function ContactManifoldTable() {
    this.manifolds = [];
    this.collisionMatrix = {};
    this._IDPool = [];
}

/**
 * Create a new contact manifold. Tracked by the collisionMatrix according to
 * its low-high ordered ID pair.
 *
 * @method
 * @param {Number} lowID The lower id of the pair of bodies.
 * @param {Number} highID The higher id of the pair of bodies.
 * @param {Particle} bodyA The first body.
 * @param {Particle} bodyB The second body.
 * @return {ContactManifold} The new manifold.
 */
ContactManifoldTable.prototype.addManifold = function addManifold(lowID, highID, bodyA, bodyB) {
    var collisionMatrix = this.collisionMatrix;
    collisionMatrix[lowID] = collisionMatrix[lowID] || {};

    var index = this._IDPool.length ? this._IDPool.pop() : this.manifolds.length;
    this.collisionMatrix[lowID][highID] = index;
    var manifold = oMRequestManifold().reset(lowID, highID, bodyA, bodyB);
    this.manifolds[index] = manifold;

    return manifold;
};

/**
 * Remove a manifold and free it for later reuse.
 *
 * @method
 * @param {ContactManifold} manifold The manifold to remove.
 * @param {Number} index The index of the manifold.
 * @return {undefined} undefined
 */
ContactManifoldTable.prototype.removeManifold = function removeManifold(manifold, index) {
    var collisionMatrix = this.collisionMatrix;

    this.manifolds[index] = null;
    collisionMatrix[manifold.lowID][manifold.highID] = null;
    this._IDPool.push(index);

    oMFreeManifold(manifold);
};

/**
 * Update each of the manifolds, removing those that no longer contain contact points.
 *
 * @method
 * @param {Number} dt Delta time.
 * @return {undefined} undefined
 */
ContactManifoldTable.prototype.update = function update(dt) {
    var manifolds = this.manifolds;
    for (var i = 0, len = manifolds.length; i < len; i++) {
        var manifold = manifolds[i];
        if (!manifold) continue;
        var persists = manifold.update(dt);
        if (!persists) {
            this.removeManifold(manifold, i);
            manifold.bodyA.events.trigger('collision:end', manifold);
            manifold.bodyB.events.trigger('collision:end', manifold);
        }
    }
};

/**
 * Warm start all Contacts, and perform precalculations needed in the iterative solver.
 *
 * @method
 * @param {Number} dt Delta time.
 * @return {undefined} undefined
 */
ContactManifoldTable.prototype.prepContacts = function prepContacts(dt) {
    var manifolds = this.manifolds;
    for (var i = 0, len = manifolds.length; i < len; i++) {
        var manifold = manifolds[i];
        if (!manifold) continue;
        var contacts = manifold.contacts;
        for (var j = 0, lenj = contacts.length; j < lenj; j++) {
            var contact = contacts[j];
            if (!contact) continue;
            contact.update(dt);
        }
    }
};

/**
 * Resolve all contact manifolds.
 *
 * @method
 * @return {undefined} undefined
 */
ContactManifoldTable.prototype.resolveManifolds = function resolveManifolds() {
    var manifolds = this.manifolds;
    for (var i = 0, len = manifolds.length; i < len; i++) {
        var manifold = manifolds[i];
        if (!manifold) continue;
        manifold.resolveContacts();
    }
};

/**
 * Create a new Contact, also creating a new Manifold if one does not already exist for that pair.
 *
 * @method
 * @param {Body} bodyA The first body.
 * @param {Body} bodyB The second body.
 * @param {CollisionData} collisionData The data for the collision.
 * @return {undefined} undefined
 */
ContactManifoldTable.prototype.registerContact = function registerContact(bodyA, bodyB, collisionData) {
    var lowID;
    var highID;

    if (bodyA._ID < bodyB._ID) {
        lowID = bodyA._ID;
        highID = bodyB._ID;
    }
    else {
        lowID = bodyB._ID;
        highID = bodyA._ID;
    }

    var manifolds = this.manifolds;
    var collisionMatrix = this.collisionMatrix;
    var manifold;
    if (!collisionMatrix[lowID] || collisionMatrix[lowID][highID] == null) {
        manifold = this.addManifold(lowID, highID, bodyA, bodyB);
        manifold.addContact(bodyA, bodyB, collisionData);
        bodyA.events.trigger('collision:start', manifold);
        bodyB.events.trigger('collision:start', manifold);
    }
    else {
        manifold = manifolds[ collisionMatrix[lowID][highID] ];
        manifold.contains(collisionData);
        manifold.addContact(bodyA, bodyB, collisionData);
    }
};

var THRESHOLD = 10;

/**
 * Class to keep track of Contact points.
 * @class manifold
 * @param {Number} lowID The lower id of the pair of bodies.
 * @param {Number} highID The higher id of the pair of bodies.
 * @param {Particle} bodyA The first body.
 * @param {Particle} bodyB The second body.
 */
function Manifold(lowID, highID, bodyA, bodyB) {
    this.lowID = lowID;
    this.highID = highID;

    this.contacts = [];
    this.numContacts = 0;

    this.bodyA = bodyA;
    this.bodyB = bodyB;

    this.lru = 0;
}

/**
 * Used by ObjectManager to reset the object with different data.
 *
 * @method
 * @param {Number} lowID The lower id of the pair of bodies.
 * @param {Number} highID The higher id of the pair of bodies.
 * @param {Particle} bodyA The first body.
 * @param {Particle} bodyB The second body.
 * @return {Manifold} this
 */
Manifold.prototype.reset = function reset(lowID, highID, bodyA, bodyB) {
    this.lowID = lowID;
    this.highID = highID;

    this.contacts = [];
    this.numContacts = 0;

    this.bodyA = bodyA;
    this.bodyB = bodyB;

    this.lru = 0;

    return this;
};

/**
 * Create a new Contact point and add it to the Manifold.
 *
 * @method
 * @param {Body} bodyA The first body.
 * @param {Body} bodyB The second body.
 * @param {CollisionData} collisionData The data for the collision.
 * @return {undefined} undefined
 */
Manifold.prototype.addContact = function addContact(bodyA, bodyB, collisionData) {
    var index = this.lru;
    if (this.contacts[index]) this.removeContact(this.contacts[index], index);
    this.contacts[index] = oMRequestContact().reset(bodyA, bodyB, collisionData);
    this.lru = (this.lru + 1) % 4;
    this.numContacts++;
};

/**
 * Remove and free a Contact for later reuse.
 *
 * @method
 * @param {Contact} contact The Contact to remove.
 * @param {Number} index The index of the Contact.
 * @return {undefined} undefined
 */
Manifold.prototype.removeContact = function removeContact(contact, index) {
    this.contacts[index] = null;
    this.numContacts--;

    ObjectManager.freeCollisionData(contact.data);
    contact.data = null;
    oMFreeContact(contact);
};

/**
 * Check if a Contact already exists for the collision data within a certain tolerance.
 * If found, remove the Contact.
 *
 * @method
 * @param {CollisionData} collisionData The data for the collision.
 * @return {Boolean} The containment check.
 */
Manifold.prototype.contains = function contains(collisionData) {
    var wA = collisionData.worldContactA;
    var wB = collisionData.worldContactB;

    var contacts = this.contacts;
    for (var i = 0, len = contacts.length; i < len; i++) {
        var contact = contacts[i];
        if (!contact) continue;
        var data = contact.data;
        var distA = Vec3.subtract(data.worldContactA, wA, DRIFTA_REGISTER).length();
        var distB = Vec3.subtract(data.worldContactB, wB, DRIFTB_REGISTER).length();

        if (distA < THRESHOLD || distB < THRESHOLD) {
            this.removeContact(contact, i);
            return true;
        }
    }

    return false;
};

/**
 * Remove Contacts the local points of which have drifted above a certain tolerance.
 * Return true or false to indicate that the Manifold still contains at least one Contact.
 *
 * @method
 * @return {Boolean} Whether or not the manifold persists.
 */
Manifold.prototype.update = function update() {
    var contacts = this.contacts;
    var bodyA = this.bodyA;
    var bodyB = this.bodyB;

    var posA = bodyA.position;
    var posB = bodyB.position;

    for (var i = 0, len = contacts.length; i < len; i++) {
        var contact = contacts[i];
        if (!contact) continue;
        var data = contact.data;
        var n = data.normal;
        var rA = data.localContactA;
        var rB = data.localContactB;

        var cached_wA = data.worldContactA;
        var cached_wB = data.worldContactB;

        var wA = Vec3.add(posA, rA, WA_REGISTER);
        var wB = Vec3.add(posB, rB, WB_REGISTER);

        var notPenetrating = Vec3.dot(Vec3.subtract(wB, wA, PENETRATING_REGISTER), n) > 0;

        var driftA = Vec3.subtract(cached_wA, wA, DRIFTA_REGISTER);
        var driftB = Vec3.subtract(cached_wB, wB, DRIFTB_REGISTER);


        if (driftA.length() >= THRESHOLD || driftB.length() >= THRESHOLD || notPenetrating) {
            this.removeContact(contact, i);
        }
    }

    if (this.numContacts) return true;
    else return false;
};

/**
 * Resolve all contacts.
 *
 * @method
 * @return {undefined} undefined
 */
Manifold.prototype.resolveContacts = function resolveContacts() {
    var contacts = this.contacts;
    for (var i = 0, len = contacts.length; i < len; i++) {
        if (!contacts[i]) continue;
        contacts[i].resolve();
    }
};

/**
 * Class to maintain collision data between two bodies.
 * The end of the resolve chain, and where the actual impulses are applied.
 *
 * @class Contact
 * @param {Body} bodyA The first body.
 * @param {Body} bodyB The second body.
 * @param {CollisionData} collisionData The data for the collision.
 */
function Contact(bodyA, bodyB, collisionData) {
    this.bodyA = bodyA;
    this.bodyB = bodyB;
    this.data = collisionData;

    this.normalImpulse = 0;
    this.tangentImpulse1 = 0;
    this.tangentImpulse2 = 0;

    this.impulse = new Vec3();
    this.angImpulseA = new Vec3();
    this.angImpulseB = new Vec3();

    if (collisionData) this.init();
}

/**
 * Used by ObjectManager to reset the object with different data.
 *
 * @method
 * @param {Body} bodyA The first body.
 * @param {Body} bodyB The second body.
 * @param {CollisionData} collisionData The data for the collision.
 * @return {Contact} this
 */
Contact.prototype.reset = function reset(bodyA, bodyB, collisionData) {
    this.bodyA = bodyA;
    this.bodyB = bodyB;
    this.data = collisionData;

    this.normalImpulse = 0;
    this.tangentImpulse1 = 0;
    this.tangentImpulse2 = 0;

    this.impulse.clear();
    this.angImpulseA.clear();
    this.angImpulseB.clear();

    this.init();

    return this;
};

/**
 * Initialization method called on instantiantion or reset of the Contact. Performs
 * precalculations that will not change over the life of the Contact.
 *
 * @method
 * @return {undefined} undefined
 */
Contact.prototype.init = function init() {
    var data = this.data;
    var n = data.normal;
    var t1 = new Vec3();
    if (n.x >= 0.57735) {
        t1.set(n.y, -n.x, 0);
    }
    else {
        t1.set(0, n.z, -n.y);
    }
    t1.normalize();
    var t2 = Vec3.cross(n, t1, new Vec3());

    this.tangent1 = t1;
    this.tangent2 = t2;

    var bodyA = this.bodyA;
    var bodyB = this.bodyB;

    var rBodyA = data.localContactA;
    var rBodyB = data.localContactB;

    var invEffectiveMass = bodyA.inverseMass + bodyB.inverseMass;

    var r1n = Vec3.cross(rBodyA, n, R1_REGISTER);
    var r2n = Vec3.cross(rBodyB, n, R2_REGISTER);
    this.effNormalMass = 1 / (invEffectiveMass +
        Vec3.dot(r1n, bodyA.inverseInertia.vectorMultiply(r1n, VEC1_REGISTER)) +
        Vec3.dot(r2n, bodyB.inverseInertia.vectorMultiply(r2n, VEC1_REGISTER)));

    var r1t1 = Vec3.cross(rBodyA, t1, R1_REGISTER);
    var r2t1 = Vec3.cross(rBodyB, t1, R2_REGISTER);
    this.effTangentialMass1 = 1 / (invEffectiveMass +
        Vec3.dot(r1t1, bodyA.inverseInertia.vectorMultiply(r1t1, VEC1_REGISTER)) +
         Vec3.dot(r2t1, bodyB.inverseInertia.vectorMultiply(r2t1, VEC1_REGISTER)));

    var r1t2 = Vec3.cross(rBodyA, t2, R1_REGISTER);
    var r2t2 = Vec3.cross(rBodyB, t2, R2_REGISTER);
    this.effTangentialMass2 = 1 / (invEffectiveMass +
        Vec3.dot(r1t2, bodyA.inverseInertia.vectorMultiply(r1t2, VEC1_REGISTER)) +
         Vec3.dot(r2t2, bodyB.inverseInertia.vectorMultiply(r2t2, VEC1_REGISTER)));

    this.restitution = Math.min(bodyA.restitution, bodyB.restitution);
    this.friction = bodyA.friction * bodyB.friction;
};

/**
 * Warm start the Contact, prepare for the iterative solver, and reset impulses.
 *
 * @method
 * @param {Number} dt Delta time.
 * @return {undefined} undefined
 */
Contact.prototype.update = function update(dt) {
    var data = this.data;
    var bodyA = this.bodyA;
    var bodyB = this.bodyB;

    var rBodyA = data.localContactA;
    var rBodyB = data.localContactB;

    var n = data.normal;

    var vb1 = Vec3.add(bodyA.velocity, Vec3.cross(bodyA.angularVelocity, rBodyA, WxR_REGISTER), VB1_REGISTER);
    var vb2 = Vec3.add(bodyB.velocity, Vec3.cross(bodyB.angularVelocity, rBodyB, WxR_REGISTER), VB2_REGISTER);
    var relativeVelocity = vb2.subtract(vb1);
    var contactSpeed = Vec3.dot(relativeVelocity, n);

    var beta = 0.15;
    var slop = 1.5;
    var velocityTolerance = 20.0;

    var restitution = Math.abs(contactSpeed) < velocityTolerance ? 0.0 : this.restitution;
    this.velocityBias = -beta * Math.max(data.penetration - slop, 0.0) / dt;
    this.velocityBias += restitution * contactSpeed;

    var impulse = this.impulse.scale(0.25);
    var angImpulseA = this.angImpulseA.scale(0.25);
    var angImpulseB = this.angImpulseB.scale(0.25);

    bodyB.applyImpulse(impulse);
    bodyB.applyAngularImpulse(angImpulseB);
    impulse.invert();
    bodyA.applyImpulse(impulse);
    bodyA.applyAngularImpulse(angImpulseA);

    this.normalImpulse = 0;
    this.tangentImpulse1 = 0;
    this.tangentImpulse2 = 0;

    impulse.clear();
    angImpulseA.clear();
    angImpulseB.clear();
};

/**
 * Apply impulses to resolve the contact and simulate friction.
 *
 * @method
 * @return {undefined} undefined
 */
Contact.prototype.resolve = function resolve() {
    var data = this.data;
    var bodyA = this.bodyA;
    var bodyB = this.bodyB;

    var rBodyA = data.localContactA;
    var rBodyB = data.localContactB;

    var n = data.normal;
    var t1 = this.tangent1;
    var t2 = this.tangent2;

    var vb1 = Vec3.add(bodyA.velocity, Vec3.cross(bodyA.angularVelocity, rBodyA, WxR_REGISTER), VB1_REGISTER);
    var vb2 = Vec3.add(bodyB.velocity, Vec3.cross(bodyB.angularVelocity, rBodyB, WxR_REGISTER), VB2_REGISTER);
    var relativeVelocity = vb2.subtract(vb1);

    var normalLambda = -(Vec3.dot(relativeVelocity, n) + this.velocityBias) * this.effNormalMass;
    var newNormalImpulse = Math.max(this.normalImpulse + normalLambda, 0);
    normalLambda = newNormalImpulse - this.normalImpulse;

    var maxFriction = this.friction * newNormalImpulse;

    var tangentLambda1 = -Vec3.dot(relativeVelocity, t1) * this.effTangentialMass1;
    var newTangentImpulse1 = clamp(this.tangentImpulse1 + tangentLambda1, -maxFriction, maxFriction);
    tangentLambda1 = newTangentImpulse1 - this.tangentImpulse1;

    var tangentLambda2 = -Vec3.dot(relativeVelocity, t2) * this.effTangentialMass2;
    var newTangentImpulse2 = clamp(this.tangentImpulse2 + tangentLambda2, -maxFriction, maxFriction);
    tangentLambda2 = newTangentImpulse2 - this.tangentImpulse2;

    var impulse = Vec3.scale(n, normalLambda, NORMALIMPULSE_REGISTER);
    var tangentImpulse1 = Vec3.scale(t1, tangentLambda1, TANGENTIMPULSE1_REGISTER);
    var tangentImpulse2 = Vec3.scale(t2, tangentLambda2, TANGENTIMPULSE2_REGISTER);

    impulse.add(tangentImpulse1).add(tangentImpulse2);

    var angImpulseB = Vec3.cross(rBodyB, impulse, VEC1_REGISTER);
    var angImpulseA = Vec3.cross(rBodyA, impulse, VEC2_REGISTER).invert();

    bodyB.applyImpulse(impulse);
    bodyB.applyAngularImpulse(angImpulseB);
    impulse.invert();
    bodyA.applyImpulse(impulse);
    bodyA.applyAngularImpulse(angImpulseA);

    this.normalImpulse = newNormalImpulse;
    this.tangentImpulse1 = newTangentImpulse1;
    this.tangentImpulse2 = newTangentImpulse2;

    this.impulse.add(impulse);
    this.angImpulseA.add(angImpulseA);
    this.angImpulseB.add(angImpulseB);
};

module.exports = ContactManifoldTable;

},{"../../../math/Vec3":50,"../../../utilities/ObjectManager":97}],70:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

var Vec3 = require('../../../math/Vec3');
var ObjectManager = require('../../../utilities/ObjectManager');

ObjectManager.register('GJK_EPASupportPoint', GJK_EPASupportPoint);
var oMRequestGJK_EPASupportPoint = ObjectManager.requestGJK_EPASupportPoint;
var oMRequestDynamicGeometry = ObjectManager.requestDynamicGeometry;
var oMFreeGJK_EPASupportPoint = ObjectManager.freeGJK_EPASupportPoint;
var oMFreeDynamicGeometry = ObjectManager.freeDynamicGeometry;
var oMFreeDynamicGeometryFeature = ObjectManager.freeDynamicGeometryFeature;

var P_REGISTER = new Vec3();
var V0_REGISTER = new Vec3();
var V1_REGISTER = new Vec3();
var V2_REGISTER = new Vec3();

var DIRECTION_REGISTER = new Vec3();
var INVDIRECTION_REGISTER = new Vec3();

/**
 * Support point to be added to the DynamicGeometry. The point in Minkowski space as well as the
 * original pair.
 *
 * @class GJK_EPASupportPoint
 * @param {Vec3} vertex The point in Minkowski space.
 * @param {Vec3} worldVertexA The one vertex.
 * @param {Vec3} worldVertexB The other vertex.
 */
function GJK_EPASupportPoint(vertex, worldVertexA, worldVertexB) {
    this.vertex = vertex;
    this.worldVertexA = worldVertexA;
    this.worldVertexB = worldVertexB;
}

/**
 * Used by ObjectManager to reset the object with different data.
 *
 * @method
 * @param {Vec3} vertex The point in Minkowski space.
 * @param {Vec3} worldVertexA The one vertex.
 * @param {Vec3} worldVertexB The other vertex.
 * @return {GJK_EPASupportPoint} this
 */
GJK_EPASupportPoint.prototype.reset = function reset(vertex, worldVertexA, worldVertexB) {
    this.vertex = vertex;
    this.worldVertexA = worldVertexA;
    this.worldVertexB = worldVertexB;

    return this;
};

/**
 * Free the DynamicGeomtetry and associate vertices and features for later reuse.
 *
 * @method
 * @param {DynamicGeometry} geometry The geometry to release to the pool.
 * @return {undefined} undefined
 */
function freeGJK_EPADynamicGeometry(geometry) {
    var vertices = geometry.vertices;
    var i;
    i = vertices.length;
    while (i--) {
        var v = vertices.pop();
        if (v !== null) oMFreeGJK_EPASupportPoint(v);
    }
    geometry.numVertices = 0;
    var features = geometry.features;
    i = features.length;
    while (i--) {
        var f = features.pop();
        if (f !== null) oMFreeDynamicGeometryFeature(f);
    }
    geometry.numFeatures = 0;
    oMFreeDynamicGeometry(geometry);
}

/**
 * Find the point in Minkowski space furthest in a given direction for two convex Bodies.
 *
 * @method
 * @param {Particle} body1 The one body.
 * @param {Particle} body2 The other body.
 * @param {Vec3} direction The search direction.
 * @return {GJK_EPASupportPoint} The result.
 */
function minkowskiSupport(body1, body2, direction) {
    var inverseDirection = Vec3.scale(direction, -1, INVDIRECTION_REGISTER);

    var w1 = Vec3.add(body1.support(direction), body1.position, new Vec3());
    var w2 = Vec3.add(body2.support(inverseDirection), body2.position, new Vec3());

    // The vertex in Minkowski space as well as the original pair in world space
    return oMRequestGJK_EPASupportPoint().reset(Vec3.subtract(w1, w2, new Vec3()), w1, w2);
}

/**
 * Gilbert-Johnson-Keerthi collision detection. Returns a DynamicGeometry simplex if the bodies are found
 * to have collided, or false for no collsion.
 *
 * @method
 * @param {Particle} body1 The one body.
 * @param {Particle} body2 The other body.
 * @return {DynamicGeometry|Boolean} Result of the GJK query.
 */
function gjk(body1, body2) {
    var support = minkowskiSupport;
    // Use p2 - p1 to seed the initial choice of direction
    var direction = Vec3.subtract(body2.position, body1.position, DIRECTION_REGISTER).normalize();
    var simplex = oMRequestDynamicGeometry();
    simplex.addVertex(support(body1, body2, direction));
    direction.invert();

    var i = 0;
    var maxIterations = 1e3;
    while(i++ < maxIterations) {
        if (direction.x === 0 && direction.y === 0 && direction.z === 0) break;
        simplex.addVertex(support(body1, body2, direction));
        if (Vec3.dot(simplex.getLastVertex().vertex, direction) < 0) break;
        // If simplex contains origin, return for use in EPA
        if (simplex.simplexContainsOrigin(direction, oMFreeGJK_EPASupportPoint)) return simplex;
    }
    freeGJK_EPADynamicGeometry(simplex);
    return false;
}

/**
 * Expanding Polytope Algorithm--penetration depth, collision normal, and contact points.
 * Returns a CollisonData object.
 *
 * @method
 * @param {Body} body1 The one body.
 * @param {Body} body2 The other body.
 * @param {DynamicGeometry} polytope The seed simplex from GJK.
 * @return {CollisionData} The collision data.
 */
function epa(body1, body2, polytope) {
    var support = minkowskiSupport;
    var depthEstimate = Infinity;

    var i = 0;
    var maxIterations = 1e3;
    while(i++ < maxIterations) {
        var closest = polytope.getFeatureClosestToOrigin();
        if (closest === null) return null;
        var direction = closest.normal;
        var point = support(body1, body2, direction);
        depthEstimate = Math.min(depthEstimate, Vec3.dot(point.vertex, direction));
        if (depthEstimate - closest.distance <= 0.01) {
            var supportA = polytope.vertices[closest.vertexIndices[0]];
            var supportB = polytope.vertices[closest.vertexIndices[1]];
            var supportC = polytope.vertices[closest.vertexIndices[2]];

            var A = supportA.vertex;
            var B = supportB.vertex;
            var C = supportC.vertex;
            var P = Vec3.scale(direction, closest.distance, P_REGISTER);

            var V0 = Vec3.subtract(B, A, V0_REGISTER);
            var V1 = Vec3.subtract(C, A, V1_REGISTER);
            var V2 = Vec3.subtract(P, A, V2_REGISTER);

            var d00 = Vec3.dot(V0, V0);
            var d01 = Vec3.dot(V0, V1);
            var d11 = Vec3.dot(V1, V1);
            var d20 = Vec3.dot(V2, V0);
            var d21 = Vec3.dot(V2, V1);
            var denom = d00*d11 - d01*d01;

            var v = (d11*d20 - d01*d21) / denom;
            var w = (d00*d21 - d01*d20) / denom;
            var u = 1.0 - v - w;

            var body1Contact =      supportA.worldVertexA.scale(u)
                               .add(supportB.worldVertexA.scale(v))
                               .add(supportC.worldVertexA.scale(w));

            var body2Contact =      supportA.worldVertexB.scale(u)
                               .add(supportB.worldVertexB.scale(v))
                               .add(supportC.worldVertexB.scale(w));

            var localBody1Contact = Vec3.subtract(body1Contact, body1.position, new Vec3());
            var localBody2Contact = Vec3.subtract(body2Contact, body2.position, new Vec3());

            freeGJK_EPADynamicGeometry(polytope);
            oMFreeGJK_EPASupportPoint(point);

            return ObjectManager.requestCollisionData().reset(closest.distance, direction, body1Contact, body2Contact, localBody1Contact, localBody2Contact);
        }
        else {
            polytope.addVertex(point);
            polytope.reshape();
        }
    }
    throw new Error('EPA failed to terminate in allotted iterations.');
}

module.exports.gjk = gjk;
module.exports.epa = epa;

},{"../../../math/Vec3":50,"../../../utilities/ObjectManager":97}],71:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

var AABB = require('./AABB');

/**
 * @const {String[]} AXES x, y, and z axes
 */
var AXES = ['x', 'y', 'z'];

/**
 * Persistant object maintaining sorted lists of AABB endpoints used in a sweep-and-prune broadphase.
 * Used to accelerate collision detection.
 * http://en.wikipedia.org/wiki/Sweep_and_prune
 *
 * @class SweepAndPrune
 * @param {Particle[]} targets The bodies to track.
 */
function SweepAndPrune(targets) {
    this._sweepVolumes = [];
    this._entityRegistry = {};
    this._boundingVolumeRegistry = {};
    this.endpoints = {x: [], y: [], z: []};

    this.overlaps = [];
    this.overlapsMatrix = {};
    this._IDPool = [];
    targets = targets || [];
    for (var i = 0; i < targets.length; i++) {
        this.add(targets[i]);
    }
}

/**
 * Start tracking a body in the broad-phase.
 *
 * @method
 * @param {Body} body The body to track.
 * @return {undefined} undefined
 */
SweepAndPrune.prototype.add = function(body) {
    var boundingVolume = new AABB(body);
    var sweepVolume = new SweepVolume(boundingVolume);

    this._entityRegistry[body._ID] = body;
    this._boundingVolumeRegistry[body._ID] = boundingVolume;
    this._sweepVolumes.push(sweepVolume);
    for (var i = 0; i < 3; i++) {
        var axis = AXES[i];
        this.endpoints[axis].push(sweepVolume.points[axis][0]);
        this.endpoints[axis].push(sweepVolume.points[axis][1]);
    }
};

/**
 * Stop tracking a body in the broad-phase.
 *
 * @method
 * @param {Body} body The body to cease tracking.
 * @return {undefined} undefined
 */
SweepAndPrune.prototype.remove = function remove(body) {
    this._entityRegistry[body._ID] = null;
    this._boundingVolumeRegistry[body._ID] = null;
    var i, len;
    var index;
    for (i = 0, len = this._sweepVolumes.length; i < len; i++) {
        if (this._sweepVolumes[i]._ID === body._ID) {
            index = i;
            break;
        }
    }
    this._sweepVolumes.splice(index, 1);
    var endpoints = this.endpoints;
    var point;

    var xs = [];
    for (i = 0, len = endpoints.x.length; i < len; i++) {
        point = endpoints.x[i];
        if (point._ID !== body._ID) xs.push(point);
    }
    var ys = [];
    for (i = 0, len = endpoints.y.length; i < len; i++) {
        point = endpoints.y[i];
        if (point._ID !== body._ID) ys.push(point);
    }
    var zs = [];
    for (i = 0, len = endpoints.z.length; i < len; i++) {
        point = endpoints.z[i];
        if (point._ID !== body._ID) zs.push(point);
    }
    endpoints.x = xs;
    endpoints.y = ys;
    endpoints.z = zs;
};

/**
 * Update the endpoints of the tracked AABB's and resort the endpoint lists accordingly. Uses an insertion sort,
 * where swaps during the sort are taken to signify a potential change in overlap status for the two
 * relevant AABB's. Returns pairs of overlapping AABB's.
 *
 * @method
 * @return {Array.<Particle[]>} The result of the broadphase.
 */
SweepAndPrune.prototype.update = function() {
    var _sweepVolumes = this._sweepVolumes;
    var _entityRegistry = this._entityRegistry;
    var _boundingVolumeRegistry = this._boundingVolumeRegistry;

    var i, j, k, len;

    for (j = 0, len = _sweepVolumes.length; j < len; j++) {
        _sweepVolumes[j].update();
    }

    var endpoints = this.endpoints;
    var overlaps = this.overlaps;
    var overlapsMatrix = this.overlapsMatrix;
    var _IDPool = this._IDPool;

    for (k = 0; k < 3; k++) {
        var axis = AXES[k];
        // Insertion sort:
        var endpointAxis = endpoints[axis];
        for (j = 1, len = endpointAxis.length; j < len; j++) {
            var current = endpointAxis[j];
            var val = current.value;
            var swap;
            var row;
            var index;
            var lowID;
            var highID;
            var cID;
            var sID;

            i = j - 1;
            while (i >= 0 && (swap = endpointAxis[i]).value > val) {
                // A swap occurence indicates that current and swap either just started or just stopped overlapping

                cID = current._ID;
                sID = swap._ID;

                if (cID < sID) {
                    lowID = cID;
                    highID = sID;
                }
                else {
                    lowID = sID;
                    highID = cID;
                }

                // If, for this axis, min point of current and max point of swap
                if (~current.side & swap.side) {
                    // Now overlapping on this axis -> possible overlap, do full AABB check
                    if (AABB.checkOverlap(_boundingVolumeRegistry[cID], _boundingVolumeRegistry[sID])) {
                        row = overlapsMatrix[lowID] = overlapsMatrix[lowID] || {};
                        index = row[highID] = _IDPool.length ? _IDPool.pop() : overlaps.length;
                        overlaps[index] = [_entityRegistry[lowID], _entityRegistry[highID]];
                    }
                // Else if, for this axis, max point of current and min point of swap
                }
                else if (current.side & ~swap.side) {
                    // Now not overlapping on this axis -> definitely not overlapping
                    if ((row = overlapsMatrix[lowID]) && row[highID] != null) {
                        index = row[highID];
                        overlaps[index] = null;
                        row[highID] = null;
                        _IDPool.push(index);
                    }
                }
                // Else if max of both or min of both, still overlapping

                endpointAxis[i + 1] = swap;
                i--;
            }
            endpointAxis[i + 1] = current;
        }
    }

    return overlaps;
};

/**
 * Object used to associate an AABB with its endpoints in the sorted lists.
 *
 * @class SweepVolume
 * @param {AABB} boundingVolume The bounding volume to track.
 */
function SweepVolume(boundingVolume) {
    this._boundingVolume = boundingVolume;
    this._ID = boundingVolume._ID;
    this.points = {
        x: [{_ID: boundingVolume._ID, side: 0, value: null}, {_ID: boundingVolume._ID, side: 1, value: null}],
        y: [{_ID: boundingVolume._ID, side: 0, value: null}, {_ID: boundingVolume._ID, side: 1, value: null}],
        z: [{_ID: boundingVolume._ID, side: 0, value: null}, {_ID: boundingVolume._ID, side: 1, value: null}]
    };
    this.update();
}

/**
 * Update the endpoints to reflect the current location of the AABB.
 *
 * @method
 * @return {undefined} undefined
 */
SweepVolume.prototype.update = function() {
    var boundingVolume = this._boundingVolume;
    boundingVolume.update();

    var points = this.points;

    for (var i = 0; i < 3; i++) {
        var axis = AXES[i];
        points[axis][0].value = boundingVolume.vertices[axis][0];
        points[axis][1].value = boundingVolume.vertices[axis][1];
    }
};

module.exports = SweepAndPrune;

},{"./AABB":67}],72:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

var Force = require('./Force');
var Vec3 = require('../../math/Vec3');

var FORCE_REGISTER = new Vec3();

/**
 * Use drag to oppose momentum of a moving object
 *
 * @class Drag
 * @extends Force
 * @param {Particle[]} targets The targets to affect.
 * @param {Object} options The options hash.
 */
function Drag(targets, options) {
    Force.call(this, targets, options);
}

Drag.prototype = Object.create(Force.prototype);
Drag.prototype.constructor = Drag;

/**
 * Used to scale velocity in the computation of the drag force.
 *
 * @property {Function} QUADRATIC
 * @param {Number} v The speed.
 * @return {Number} The scale by which to multiply.
 */
Drag.QUADRATIC = function QUADRATIC(v) {
    return v*v;
};

/**
 * Used to scale velocity in the computation of the drag force.
 *
 * @property {Function} LINEAR
 * @param {Number} v The speed.
 * @return {Number} The scale by which to multiply.
 */
Drag.LINEAR = function LINEAR(v) {
    return v;
};

/**
 * Initialize the Force. Sets defaults if a property was not already set.
 *
 * @method
 * @param {Object} options The options hash.
 * @return {undefined} undefined
 */
Drag.prototype.init = function() {
    this.max = this.max || Infinity;
    this.strength = this.strength || 1;
    this.type = this.type || Drag.LINEAR;
};

/**
 * Apply the force.
 *
 * @method
 * @return {undefined} undefined
 */
Drag.prototype.update = function update() {
    var targets = this.targets;
    var type = this.type;

    var force = FORCE_REGISTER;

    var max = this.max;
    var strength = this.strength;
    for (var i = 0, len = targets.length; i < len; i++) {
        var target = targets[i];
        var velocity = target.velocity;
        var v = velocity.length();
        var invV = v ? 1 / v : 0;
        var magnitude = -strength * type(v);
        Vec3.scale(velocity, (magnitude < -max ? -max : magnitude) * invV, force);
        target.applyForce(force);
    }
};

module.exports = Drag;

},{"../../math/Vec3":50,"./Force":73}],73:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

var _ID = 0;
/**
 * Abstract force manager to apply forces to targets.
 *
 * @class Force
 * @virtual
 * @param {Particle[]} targets The targets of the force.
 * @param {Object} options The options hash.
 */
function Force(targets, options) {
    if (targets) {
        if (targets instanceof Array) this.targets = targets;
        else this.targets = [targets];
    }
    else this.targets = [];

    options = options || {};
    this.setOptions(options);

    this._ID = _ID++;
}

/**
 * Decorates the Force with the options object.
 *
 * @method
 * @param {Object} options The options hash.
 * @return {undefined} undefined
 */
Force.prototype.setOptions = function setOptions(options) {
    for (var key in options) this[key] = options[key];
    this.init(options);
};

/**
 * Add a target or targets to the Force.
 *
 * @method
 * @param {Particle} target The body to begin targetting.
 * @return {undefined} undefined
 */
Force.prototype.addTarget = function addTarget(target) {
    this.targets.push(target);
};

/**
 * Remove a target or targets from the Force.
 *
 * @method
 * @param {Particle} target The body to stop targetting.
 * @return {undefined} undefined
 */
Force.prototype.removeTarget = function removeTarget(target) {
    var index = this.targets.indexOf(target);
    if (index < 0) return;
    this.targets.splice(index, 1);
};

/**
 * Method invoked upon instantiation and the setting of options.
 *
 * @method
 * @param {Object} options The options hash.
 * @return {undefined} undefined
 */
Force.prototype.init = function init(options) {};

/**
 * Apply forces on each target.
 *
 * @method
 * @param {Number} time The current time in the physics engine.
 * @param {Number} dt The physics engine frame delta.
 * @return {undefined} undefined
 */
Force.prototype.update = function update(time, dt) {};

module.exports = Force;

},{}],74:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

var Force = require('./Force');
var Vec3 = require('../../math/Vec3');

var FORCE_REGISTER = new Vec3();

/**
 * Force that pulls all objects in a direction with constant acceleration
 *
 * @class Gravity1D
 * @extends Force
 * @param {Particle[]} targets The targets to affect.
 * @param {Object} options The options hash.
 */
function Gravity1D(targets, options) {
    Force.call(this, targets, options);
}

Gravity1D.prototype = Object.create(Force.prototype);
Gravity1D.prototype.constructor = Gravity1D;

/**
 * @enum directions
 */
Gravity1D.DOWN     = 0;
Gravity1D.UP       = 1;
Gravity1D.LEFT     = 2;
Gravity1D.RIGHT    = 3;
Gravity1D.FORWARD  = 4;
Gravity1D.BACKWARD = 5;

/**
 * Initialize the Force. Sets defaults if a property was not already set.
 *
 * @method
 * @param {Object} options The options hash.
 * @return {undefined} undefined
 */
Gravity1D.prototype.init = function(options) {
    this.max = this.max || Infinity;
    if (options.acceleration) {
        this.strength = this.acceleration.length();
        this.direction = -1;
        return;
    }
    var acceleration = this.acceleration = new Vec3();
    var direction = this.direction = this.direction || Gravity1D.DOWN;
    var magnitude = this.strength = this.strength || 200;
    switch (direction) {
        case Gravity1D.DOWN:
            acceleration.set(0, magnitude, 0);
            break;
        case Gravity1D.UP:
            acceleration.set(0, -1 * magnitude, 0);
            break;
        case Gravity1D.LEFT:
            acceleration.set(-1 * magnitude, 0, 0);
            break;
        case Gravity1D.RIGHT:
            acceleration.set(magnitude, 0, 0);
            break;
        case Gravity1D.FORWARD:
            acceleration.set(0, 0, -1 * magnitude);
            break;
        case Gravity1D.BACKWARD:
            acceleration.set(0, 0, magnitude);
            break;
        default:
            break;
    }
};

/**
 * Apply the force.
 *
 * @method
 * @return {undefined} undefined
 */
Gravity1D.prototype.update = function() {
    var targets = this.targets;

    var force = FORCE_REGISTER;

    var max = this.max;
    var acceleration = this.acceleration;
    var a = acceleration.length();
    var invA = a ? 1 / a : 0;
    for (var i = 0, len = targets.length; i < len; i++) {
        var target = targets[i];
        var magnitude = a * target.mass;
        Vec3.scale(acceleration, (magnitude > max ? max : magnitude) * invA, force);
        target.applyForce(force);
    }
};

module.exports = Gravity1D;

},{"../../math/Vec3":50,"./Force":73}],75:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

var Force = require('./Force');
var Vec3 = require('../../math/Vec3');

var FORCE_REGISTER = new Vec3();

/**
 * An inverse square force dependent on the masses of the source and targets.
 *
 * @class Gravity3D
 * @extends Force
 * @param {Particle} source The optional source of the attraction field.
 * @param {Particle[]} targets The targets to affect.
 * @param {Object} options The options hash.
 */
function Gravity3D(source, targets, options) {
    this.source = source || null;
    Force.call(this, targets, options);
}

Gravity3D.prototype = Object.create(Force.prototype);
Gravity3D.prototype.constructor = Gravity3D;

/**
 * Initialize the Force. Sets defaults if a property was not already set.
 *
 * @method
 * @return {undefined} undefined
 */
Gravity3D.prototype.init = function() {
    this.max = this.max || Infinity;
    this.strength = this.strength || 200;
};

/**
 * Apply the force.
 *
 * @method
 * @return {undefined} undefined
 */
Gravity3D.prototype.update = function() {
    var source = this.source;
    var targets = this.targets;

    var force = FORCE_REGISTER;

    var strength = this.strength;
    var max = this.max;
    var anchor = this.anchor || source.position;
    var sourceMass = this.anchor ? 1 : source.mass;
    for (var i = 0, len = targets.length; i < len; i++) {
        var target = targets[i];
        Vec3.subtract(anchor, target.position, force);
        var dist = force.length();
        var invDistance = dist ? 1 / dist : 0;
        var magnitude = strength * sourceMass * target.mass * invDistance * invDistance;
        if (magnitude < 0) {
            magnitude = magnitude < -max ? -max : magnitude;
        }
        else {
            magnitude = magnitude > max ? max : magnitude;
        }
        force.scale(magnitude * invDistance);
        target.applyForce(force);
        if (source) source.applyForce(force.invert());
    }
};

module.exports = Gravity3D;

},{"../../math/Vec3":50,"./Force":73}],76:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

var Force = require('./Force');
var Vec3 = require('../../math/Vec3');

var TORQUE_REGISTER = new Vec3();

/**
 * A behavior that slows angular velocity by applying torque.
 *
 * @class RotationalDrag
 * @extends Force
 * @param {Particle[]} targets The targets to affect.
 * @param {Object} options options to set on drag
 */
function RotationalDrag(targets, options) {
    Force.call(this, targets, options);
}

RotationalDrag.prototype = Object.create(Force.prototype);
RotationalDrag.prototype.constructor = RotationalDrag;

/**
 * Used to scale angular velocity in the computation of the drag torque.
 *
 * @property {Function} QUADRATIC
 * @param {Vec3} omega The angular velocity.
 * @return {Number} The scale by which to multiply.
 */
RotationalDrag.QUADRATIC = function QUADRATIC(omega) {
    return omega.length();
};

/**
 * Used to scale angular velocity in the computation of the drag torque.
 *
 * @property {Function} LINEAR
 * @return {Number} The scale by which to multiply.
 */
RotationalDrag.LINEAR = function LINEAR() {
    return 1;
};

/**
 * Initialize the Force. Sets defaults if a property was not already set.
 *
 * @method
 * @return {undefined} undefined
 */
RotationalDrag.prototype.init = function init() {
    this.max = this.max || Infinity;
    this.strength = this.strength || 1;
    this.type = this.type || RotationalDrag.LINEAR;
};

/**
 * Adds a rotational drag force to a physics body's torque accumulator.
 *
 * @method
 * @return {undefined} undefined
 */
RotationalDrag.prototype.update = function update() {
    var targets = this.targets;
    var type = this.type;

    var torque = TORQUE_REGISTER;

    var max = this.max;
    var strength = this.strength;
    for (var i = 0, len = targets.length; i < len; i++) {
        var target = targets[i];
        var omega = target.angularVelocity;
        var magnitude = -strength * type(omega);
        Vec3.scale(omega, magnitude < -max ? -max : magnitude, torque);
        target.applyTorque(torque);
    }
};

module.exports = RotationalDrag;

},{"../../math/Vec3":50,"./Force":73}],77:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

var Force = require('./Force');
var Vec3 = require('../../math/Vec3');
var Mat33 = require('../../math/Mat33');
var Quaternion = require('../../math/Quaternion');

var Q_REGISTER = new Quaternion();
var DAMPING_REGISTER = new Vec3();
var XYZ_REGISTER = new Vec3();
var MAT_REGISTER = new Mat33();

/** @const PI */
var PI = Math.PI;

/**
 * A spring-like behavior that attempts to enforce a specfic orientation by applying torque.
 *
 * @class RotationalSpring
 * @extends Force
 * @param {Particle} source The optional source of the spring.
 * @param {Particle[]} targets The targets to affect.
 * @param {Object} options The options hash.
 */
function RotationalSpring(source, targets, options) {
    this.source = source || null;
    Force.call(this, targets, options);
}

RotationalSpring.prototype = Object.create(Force.prototype);
RotationalSpring.prototype.constructor = RotationalSpring;

/**
 * Initialize the Force. Sets defaults if a property was not already set.
 *
 * @method
 * @param {Object} options The options hash.
 * @return {undefined} undefined
 */
RotationalSpring.prototype.init = function init(options) {
    if (!this.source) this.anchor = this.anchor ? this.anchor.normalize() : new Quaternion(1,0,0,0);
    if (options.stiffness || options.damping) {
        this.stiffness = this.stiffness || 100;
        this.damping = this.damping || 0;
        this.period = null;
        this.dampingRatio = null;
    }
    else if (options.period || options.dampingRatio) {
        this.period = this.period || 1;
        this.dampingRatio = this.dampingRatio || 0;

        this.stiffness = 2 * PI / this.period;
        this.stiffness *= this.stiffness;
        this.damping = 4 * PI * this.dampingRatio / this.period;
    }
};

/**
 * Adds a torque force to a physics body's torque accumulator.
 *
 * @method
 * @return {undefined} undefined
 */
RotationalSpring.prototype.update = function update() {
    var source = this.source;
    var targets = this.targets;

    var deltaQ = Q_REGISTER;
    var dampingTorque = DAMPING_REGISTER;
    var XYZ = XYZ_REGISTER;
    var effInertia = MAT_REGISTER;

    var max = this.max;
    var stiffness = this.stiffness;
    var damping = this.damping;
    var anchor = this.anchor || source.orientation;
    var invSourceInertia = this.anchor ? null : source.inverseInertia;
    for (var i = 0, len = targets.length; i < len; i++) {
        var target = targets[i];
        var q = target.orientation;
        Quaternion.conjugate(q, deltaQ);
        deltaQ.multiply(anchor);

        if (deltaQ.w >= 1) continue;
        var halftheta = Math.acos(deltaQ.w);
        var length = Math.sqrt(1 - deltaQ.w * deltaQ.w);

        var deltaOmega = XYZ.copy(deltaQ).scale(2 * halftheta / length);

        deltaOmega.scale(stiffness);

        if (invSourceInertia !== null) {
            Mat33.add(invSourceInertia, target.inverseInertia, effInertia).inverse();
        }
        else {
            Mat33.inverse(target.inverseInertia, effInertia);
        }

        if (damping !== 0) {
            if (source) {
                deltaOmega.add(Vec3.subtract(target.angularVelocity, source.angularVelocity, dampingTorque).scale(-damping));
            }
            else {
                deltaOmega.add(Vec3.scale(target.angularVelocity, -damping, dampingTorque));
            }
        }

        var torque = deltaOmega.applyMatrix(effInertia);
        var magnitude = torque.length();

        if (magnitude > max) torque.scale(max/magnitude);

        target.applyTorque(torque);
        if (source) source.applyTorque(torque.invert());
    }
};

module.exports = RotationalSpring;

},{"../../math/Mat33":47,"../../math/Quaternion":48,"../../math/Vec3":50,"./Force":73}],78:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

var Force = require('./Force');
var Vec3 = require('../../math/Vec3');

var FORCE_REGISTER = new Vec3();
var DAMPING_REGISTER = new Vec3();

/**
 * A force that accelerates a Particle towards a specific anchor point. Can be anchored to
 * a Vec3 or another source Particle.
 *
 * @class Spring
 * @extends Force
 * @param {Particle} source The optional source of the spring.
 * @param {Particle[]} targets The targets to affect.
 * @param {Object} options The options hash.
 */
function Spring(source, targets, options) {
    this.source = source || null;
    Force.call(this, targets, options);
}

Spring.prototype = Object.create(Force.prototype);
Spring.prototype.constructor = Spring;

/** @const */
var PI = Math.PI;

/**
 * A FENE (Finitely Extensible Nonlinear Elastic) spring force. See: http://en.wikipedia.org/wiki/FENE
 *
 * @property {Function} FENE
 * @param {Number} dist Current distance from source body.
 * @param {Number} rMax Maximum range of influence.
 * @return {Number} unscaled force
 */
Spring.FENE = function(dist, rMax) {
    var rMaxSmall = rMax * 0.99;
    var r = Math.max(Math.min(dist, rMaxSmall), -rMaxSmall);
    return r / (1 - r * r/(rMax * rMax));
};

/**
 * A Hookean spring force, linear in the displacement
 *      see: http://en.wikipedia.org/wiki/Hooke's_law
 * @property {Function} HOOKE
 * @param {Number} dist Current distance from source body/
 * @return {Number} unscaled force
 */
Spring.HOOKE = function(dist) {
    return dist;
};

/**
 * Initialize the Force. Sets defaults if a property was not already set.
 *
 * @method
 * @param {Object} options The options hash.
 * @return {undefined} undefined
 */
Spring.prototype.init = function(options) {
    this.max = this.max || Infinity;
    this.length = this.length || 0;
    this.type = this.type || Spring.HOOKE;
    this.maxLength = this.maxLength || Infinity;
    if (options.stiffness || options.damping) {
        this.stiffness = this.stiffness || 100;
        this.damping = this.damping || 0;
        this.period = null;
        this.dampingRatio = null;
    }
    else if (options.period || options.dampingRatio) {
        this.period = this.period || 1;
        this.dampingRatio = this.dampingRatio || 0;

        this.stiffness = 2 * PI / this.period;
        this.stiffness *= this.stiffness;
        this.damping = 4 * PI * this.dampingRatio / this.period;
    }
};

/**
 * Apply the force.
 *
 * @method
 * @return {undefined} undefined
 */
Spring.prototype.update = function() {
    var source = this.source;
    var targets = this.targets;

    var force = FORCE_REGISTER;
    var dampingForce = DAMPING_REGISTER;

    var max = this.max;
    var stiffness = this.stiffness;
    var damping = this.damping;
    var restLength = this.length;
    var maxLength = this.maxLength;
    var anchor = this.anchor || source.position;
    var invSourceMass = this.anchor ? 0 : source.inverseMass;
    var type = this.type;

    for (var i = 0, len = targets.length; i < len; i++) {
        var target = targets[i];
        Vec3.subtract(anchor, target.position, force);
        var dist = force.length();
        var stretch = dist - restLength;

        if (Math.abs(stretch) < 1e-6) continue;

        var effMass = 1 / (target.inverseMass + invSourceMass);
        if (this.period !== null) {
            stiffness *= effMass;
            damping *= effMass;
        }

        force.scale(stiffness * type(stretch, maxLength) / stretch);

        if (damping !== 0) {
            if (source) {
                force.add(Vec3.subtract(target.velocity, source.velocity, dampingForce).scale(-damping));
            }
            else {
                force.add(Vec3.scale(target.velocity, -damping, dampingForce));
            }
        }

        var magnitude = force.length();
        var invMag = magnitude ? 1 / magnitude : 0;

        Vec3.scale(force, (magnitude > max ? max : magnitude) * invMag, force);

        target.applyForce(force);
        if (source) source.applyForce(force.invert());
    }
};

module.exports = Spring;

},{"../../math/Vec3":50,"./Force":73}],79:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

module.exports = {
    Particle: require('./bodies/Particle'),
    convexBodyFactory: require('./bodies/convexBodyFactory'),
    Box: require('./bodies/Box'),
    Sphere: require('./bodies/Sphere'),
    Wall: require('./bodies/Wall'),

    Constraint: require('./constraints/Constraint'),
    Angle: require('./constraints/Angle'),
    Collision: require('./constraints/Collision'),
    Direction: require('./constraints/Direction'),
    Distance: require('./constraints/Distance'),
    Curve: require('./constraints/Curve'),
    Hinge: require('./constraints/Hinge'),
    BallAndSocket: require('./constraints/BallAndSocket'),

    Force: require('./forces/Force'),
    Drag: require('./forces/Drag'),
    RotationalDrag: require('./forces/RotationalDrag'),
    Gravity1D: require('./forces/Gravity1D'),
    Gravity3D: require('./forces/Gravity3D'),
    Spring: require('./forces/Spring'),
    RotationalSpring: require('./forces/RotationalSpring'),

    PhysicsEngine: require('./PhysicsEngine'),
    Geometry: require('./Geometry')
};

},{"./Geometry":52,"./PhysicsEngine":53,"./bodies/Box":54,"./bodies/Particle":55,"./bodies/Sphere":56,"./bodies/Wall":57,"./bodies/convexBodyFactory":58,"./constraints/Angle":59,"./constraints/BallAndSocket":60,"./constraints/Collision":61,"./constraints/Constraint":62,"./constraints/Curve":63,"./constraints/Direction":64,"./constraints/Distance":65,"./constraints/Hinge":66,"./forces/Drag":72,"./forces/Force":73,"./forces/Gravity1D":74,"./forces/Gravity3D":75,"./forces/RotationalDrag":76,"./forces/RotationalSpring":77,"./forces/Spring":78}],80:[function(require,module,exports){
// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
// requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel
// MIT license

'use strict';

var lastTime = 0;
var vendors = ['ms', 'moz', 'webkit', 'o'];

var rAF, cAF;

if (typeof window === 'object') {
    rAF = window.requestAnimationFrame;
    cAF = window.cancelAnimationFrame || window.cancelRequestAnimationFrame;
    for (var x = 0; x < vendors.length && !rAF; ++x) {
        rAF = window[vendors[x] + 'RequestAnimationFrame'];
        cAF = window[vendors[x] + 'CancelRequestAnimationFrame'] ||
              window[vendors[x] + 'CancelAnimationFrame'];
    }

    if (rAF && !cAF) {
        // cAF not supported.
        // Fall back to setInterval for now (very rare).
        rAF = null;
    }
}

if (!rAF) {
    var now = Date.now ? Date.now : function () {
        return new Date().getTime();
    };

    rAF = function(callback) {
        var currTime = now();
        var timeToCall = Math.max(0, 16 - (currTime - lastTime));
        var id = setTimeout(function () {
            callback(currTime + timeToCall);
        }, timeToCall);
        lastTime = currTime + timeToCall;
        return id;
    };

    cAF = function (id) {
        clearTimeout(id);
    };
}

var animationFrame = {
    /**
     * Cross browser version of [requestAnimationFrame]{@link https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame}.
     *
     * Used by Engine in order to establish a render loop.
     *
     * If no (vendor prefixed version of) `requestAnimationFrame` is available,
     * `setTimeout` will be used in order to emulate a render loop running at
     * approximately 60 frames per second.
     *
     * @method  requestAnimationFrame
     *
     * @param   {Function}  callback function to be invoked on the next frame.
     * @return  {Number}    requestId to be used to cancel the request using
     *                      {@link cancelAnimationFrame}.
     */
    requestAnimationFrame: rAF,

    /**
     * Cross browser version of [cancelAnimationFrame]{@link https://developer.mozilla.org/en-US/docs/Web/API/window/cancelAnimationFrame}.
     *
     * Cancels a previously using [requestAnimationFrame]{@link animationFrame#requestAnimationFrame}
     * scheduled request.
     *
     * Used for immediately stopping the render loop within the Engine.
     *
     * @method  cancelAnimationFrame
     *
     * @param   {Number}    requestId of the scheduled callback function
     *                      returned by [requestAnimationFrame]{@link animationFrame#requestAnimationFrame}.
     */
    cancelAnimationFrame: cAF
};

module.exports = animationFrame;

},{}],81:[function(require,module,exports){
/**
 * The MIT License (MIT)
 * 
 * Copyright (c) 2015 Famous Industries Inc.
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

module.exports = {
    requestAnimationFrame: require('./animationFrame').requestAnimationFrame,
    cancelAnimationFrame: require('./animationFrame').cancelAnimationFrame
};

},{"./animationFrame":80}],82:[function(require,module,exports){
/**
 * The MIT License (MIT)
 * 
 * Copyright (c) 2015 Famous Industries Inc.
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

var now = require('./now');

/**
 * Loop class used for updating objects on a frame-by-frame. Synchronizes the
 * `update` method invocations to the refresh rate of the screen.
 * Does not normalize the high resolution timestamp when being consecutively
 * started and stopped.
 * 
 * @class ContainerLoop
 */
function ContainerLoop() {
    this._updates = [];
    this._stoppedAt = now();
    this._sleep = 0;

    this.start();

    var _this = this;
    window.addEventListener('message', function(ev) {
        _this._onWindowMessage(ev);
    });
}

/**
 * When there is a `FRAME` message passed into the window
 *
 * @method
 * @private
 *
 * @param {Object} ev event payload from the window
 * 
 * @return {ContainerLoop} this
 */
ContainerLoop.prototype._onWindowMessage = function _onWindowMessage(ev) {
    if (
        this._running &&
        ev.data.constructor === Array &&
        ev.data[0] === 'FRAME'
    ) {
        this.step(ev.data[1] - this._sleep);
    }
};

/**
 * Starts the ContainerLoop.
 *
 * @method
 * 
 * @return {ContainerLoop} this
 */
ContainerLoop.prototype.start = function start() {
    this._running = true;
    this._sleep += now() - this._stoppedAt;
    return this;
};

/**
 * Stops the ContainerLoop.
 *
 * @method
 * 
 * @return {ContainerLoop} this
 */
ContainerLoop.prototype.stop = function stop() {
    this._running = false;
    this._stoppedAt = now();
    return this;
};

/**
 * Determines whether the ContainerLoop is currently running or not.
 *
 * @method
 * 
 * @return {Boolean} boolean value indicating whether the ContainerLoop is currently running or not
 */
ContainerLoop.prototype.isRunning = function isRunning() {
    return this._running;
};

/**
 * Updates all registered objects.
 *
 * @method
 * 
 * @param {Number} time high resolution timstamp used for invoking the `update` method on all registered objects
 *
 * @return {ContainerLoop} this
 */
ContainerLoop.prototype.step = function step (time) {
    for (var i = 0, len = this._updates.length ; i < len ; i++) {
        this._updates[i].update(time);
    }
    return this;
};

/**
 * Registeres an updateable object which `update` method should be invoked on
 * every paint, starting on the next paint (assuming the ContainerLoop is running).
 *
 * @method
 * 
 * @param {Object} updateable object to be updated
 * @param {Function} updateable.update update function to be called on the registered object
 *
 * @return {ContainerLoop} this
 */
ContainerLoop.prototype.update = function update(updateable) {
    if (this._updates.indexOf(updateable) === -1) {
        this._updates.push(updateable);
    }
    return this;
};

/**
 * Deregisters an updateable object previously registered using `update` to be
 * no longer updated.
 *
 * @method
 * 
 * @param {Object} updateable updateable object previously registered using `update`
 *
 * @return {ContainerLoop} this
 */
ContainerLoop.prototype.noLongerUpdate = function noLongerUpdate(updateable) {
    var index = this._updates.indexOf(updateable);
    if (index > -1) {
        this._updates.splice(index, 1);
    }
    return this;
};

module.exports = ContainerLoop;

},{"./now":85}],83:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

var polyfills = require('../polyfills');
var rAF = polyfills.requestAnimationFrame;
var cAF = polyfills.cancelAnimationFrame;

/**
 * Boolean constant indicating whether the RequestAnimationFrameLoop has access
 * to the document. The document is being used in order to subscribe for
 * visibilitychange events used for normalizing the RequestAnimationFrameLoop
 * time when e.g. when switching tabs.
 *
 * @constant
 * @type {Boolean}
 */
var DOCUMENT_ACCESS = typeof document !== 'undefined';

if (DOCUMENT_ACCESS) {
    var VENDOR_HIDDEN, VENDOR_VISIBILITY_CHANGE;

    // Opera 12.10 and Firefox 18 and later support
    if (typeof document.hidden !== 'undefined') {
        VENDOR_HIDDEN = 'hidden';
        VENDOR_VISIBILITY_CHANGE = 'visibilitychange';
    }
    else if (typeof document.mozHidden !== 'undefined') {
        VENDOR_HIDDEN = 'mozHidden';
        VENDOR_VISIBILITY_CHANGE = 'mozvisibilitychange';
    }
    else if (typeof document.msHidden !== 'undefined') {
        VENDOR_HIDDEN = 'msHidden';
        VENDOR_VISIBILITY_CHANGE = 'msvisibilitychange';
    }
    else if (typeof document.webkitHidden !== 'undefined') {
        VENDOR_HIDDEN = 'webkitHidden';
        VENDOR_VISIBILITY_CHANGE = 'webkitvisibilitychange';
    }
}

/**
 * RequestAnimationFrameLoop class used for updating objects on a frame-by-frame.
 * Synchronizes the `update` method invocations to the refresh rate of the
 * screen. Manages the `requestAnimationFrame`-loop by normalizing the passed in
 * timestamp when switching tabs.
 *
 * @class RequestAnimationFrameLoop
 */
function RequestAnimationFrameLoop() {
    var _this = this;

    // References to objects to be updated on next frame.
    this._updates = [];

    this._looper = function(time) {
        _this.loop(time);
    };
    this._time = 0;
    this._stoppedAt = 0;
    this._sleep = 0;

    // Indicates whether the engine should be restarted when the tab/ window is
    // being focused again (visibility change).
    this._startOnVisibilityChange = true;

    // requestId as returned by requestAnimationFrame function;
    this._rAF = null;

    this._sleepDiff = true;

    // The engine is being started on instantiation.
    // TODO(alexanderGugel)
    this.start();

    // The RequestAnimationFrameLoop supports running in a non-browser
    // environment (e.g. Worker).
    if (DOCUMENT_ACCESS) {
        document.addEventListener(VENDOR_VISIBILITY_CHANGE, function() {
            _this._onVisibilityChange();
        });
    }
}

/**
 * Handle the switching of tabs.
 *
 * @method
 * @private
 *
 * @return {undefined} undefined
 */
RequestAnimationFrameLoop.prototype._onVisibilityChange = function _onVisibilityChange() {
    if (document[VENDOR_HIDDEN]) {
        this._onUnfocus();
    }
    else {
        this._onFocus();
    }
};

/**
 * Internal helper function to be invoked as soon as the window/ tab is being
 * focused after a visibiltiy change.
 *
 * @method
 * @private
 *
 * @return {undefined} undefined
 */
RequestAnimationFrameLoop.prototype._onFocus = function _onFocus() {
    if (this._startOnVisibilityChange) {
        this._start();
    }
};

/**
 * Internal helper function to be invoked as soon as the window/ tab is being
 * unfocused (hidden) after a visibiltiy change.
 *
 * @method  _onFocus
 * @private
 *
 * @return {undefined} undefined
 */
RequestAnimationFrameLoop.prototype._onUnfocus = function _onUnfocus() {
    this._stop();
};

/**
 * Starts the RequestAnimationFrameLoop. When switching to a differnt tab/
 * window (changing the visibiltiy), the engine will be retarted when switching
 * back to a visible state.
 *
 * @method
 *
 * @return {RequestAnimationFrameLoop} this
 */
RequestAnimationFrameLoop.prototype.start = function start() {
    if (!this._running) {
        this._startOnVisibilityChange = true;
        this._start();
    }
    return this;
};

/**
 * Internal version of RequestAnimationFrameLoop's start function, not affecting
 * behavior on visibilty change.
 *
 * @method
 * @private
*
 * @return {undefined} undefined
 */
RequestAnimationFrameLoop.prototype._start = function _start() {
    this._running = true;
    this._sleepDiff = true;
    this._rAF = rAF(this._looper);
};

/**
 * Stops the RequestAnimationFrameLoop.
 *
 * @method
 * @private
 *
 * @return {RequestAnimationFrameLoop} this
 */
RequestAnimationFrameLoop.prototype.stop = function stop() {
    if (this._running) {
        this._startOnVisibilityChange = false;
        this._stop();
    }
    return this;
};

/**
 * Internal version of RequestAnimationFrameLoop's stop function, not affecting
 * behavior on visibilty change.
 *
 * @method
 * @private
 *
 * @return {undefined} undefined
 */
RequestAnimationFrameLoop.prototype._stop = function _stop() {
    this._running = false;
    this._stoppedAt = this._time;

    // Bug in old versions of Fx. Explicitly cancel.
    cAF(this._rAF);
};

/**
 * Determines whether the RequestAnimationFrameLoop is currently running or not.
 *
 * @method
 *
 * @return {Boolean} boolean value indicating whether the
 * RequestAnimationFrameLoop is currently running or not
 */
RequestAnimationFrameLoop.prototype.isRunning = function isRunning() {
    return this._running;
};

/**
 * Updates all registered objects.
 *
 * @method
 *
 * @param {Number} time high resolution timstamp used for invoking the `update`
 * method on all registered objects
 *
 * @return {RequestAnimationFrameLoop} this
 */
RequestAnimationFrameLoop.prototype.step = function step (time) {
    this._time = time;
    if (this._sleepDiff) {
        this._sleep += time - this._stoppedAt;
        this._sleepDiff = false;
    }

    // The same timetamp will be emitted immediately before and after visibility
    // change.
    var normalizedTime = time - this._sleep;
    for (var i = 0, len = this._updates.length ; i < len ; i++) {
        this._updates[i].update(normalizedTime);
    }
    return this;
};

/**
 * Method being called by `requestAnimationFrame` on every paint. Indirectly
 * recursive by scheduling a future invocation of itself on the next paint.
 *
 * @method
 *
 * @param {Number} time high resolution timstamp used for invoking the `update`
 * method on all registered objects
 * @return {RequestAnimationFrameLoop} this
 */
RequestAnimationFrameLoop.prototype.loop = function loop(time) {
    this.step(time);
    this._rAF = rAF(this._looper);
    return this;
};

/**
 * Registeres an updateable object which `update` method should be invoked on
 * every paint, starting on the next paint (assuming the
 * RequestAnimationFrameLoop is running).
 *
 * @method
 *
 * @param {Object} updateable object to be updated
 * @param {Function} updateable.update update function to be called on the
 * registered object
 *
 * @return {RequestAnimationFrameLoop} this
 */
RequestAnimationFrameLoop.prototype.update = function update(updateable) {
    if (this._updates.indexOf(updateable) === -1) {
        this._updates.push(updateable);
    }
    return this;
};

/**
 * Deregisters an updateable object previously registered using `update` to be
 * no longer updated.
 *
 * @method
 *
 * @param {Object} updateable updateable object previously registered using
 * `update`
 *
 * @return {RequestAnimationFrameLoop} this
 */
RequestAnimationFrameLoop.prototype.noLongerUpdate = function noLongerUpdate(updateable) {
    var index = this._updates.indexOf(updateable);
    if (index > -1) {
        this._updates.splice(index, 1);
    }
    return this;
};

module.exports = RequestAnimationFrameLoop;

},{"../polyfills":81}],84:[function(require,module,exports){
/**
 * The MIT License (MIT)
 * 
 * Copyright (c) 2015 Famous Industries Inc.
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

module.exports = {
    RequestAnimationFrameLoop: require('./RequestAnimationFrameLoop'),
    ContainerLoop: require('./ContainerLoop'),
    now: require('./now')
};

},{"./ContainerLoop":82,"./RequestAnimationFrameLoop":83,"./now":85}],85:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
'use strict';

// Polyfill for performance.now()
var now = (window.performance && window.performance.now) ? function() {
    return window.performance.now();
} : Date.now;

module.exports = now;

},{}],86:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

var Context = require('./Context');
var injectCSS = require('./inject-css');
var Commands = require('../core/Commands');

/**
 * Instantiates a new Compositor.
 * The Compositor receives draw commands frm the UIManager and routes the to the
 * respective context objects.
 *
 * Upon creation, it injects a stylesheet used for styling the individual
 * renderers used in the context objects.
 *
 * @class Compositor
 * @constructor
 * @return {undefined} undefined
 */
function Compositor() {
    injectCSS();

    this._contexts = {};
    this._outCommands = [];
    this._inCommands = [];
    this._time = null;

    this._resized = false;

    var _this = this;
    window.addEventListener('resize', function() {
        _this.onResize();
    });
}

Compositor.prototype.onResize = function onResize () {
    this._resized = true;
    for (var selector in this._contexts) {
        this._contexts[selector].updateSize();
    }
};

/**
 * Retrieves the time being used by the internal clock managed by
 * `FamousEngine`.
 *
 * The time is being passed into core by the Engine through the UIManager.
 * Since core has the ability to scale the time, the time needs to be passed
 * back to the rendering system.
 *
 * @method
 *
 * @return {Number} time The clock time used in core.
 */
Compositor.prototype.getTime = function getTime() {
    return this._time;
};

/**
 * Schedules an event to be sent the next time the out command queue is being
 * flushed.
 *
 * @method
 * @private
 *
 * @param  {String} path Render path to the node the event should be triggered
 * on (*targeted event*)
 * @param  {String} ev Event type
 * @param  {Object} payload Event object (serializable using structured cloning
 * algorithm)
 *
 * @return {undefined} undefined
 */
Compositor.prototype.sendEvent = function sendEvent(path, ev, payload) {
    this._outCommands.push(Commands.WITH, path, Commands.TRIGGER, ev, payload);
};

/**
 * Internal helper method used for notifying externally
 * resized contexts (e.g. by resizing the browser window).
 *
 * @method
 * @private
 *
 * @param  {String} selector render path to the node (context) that should be
 * resized
 * @param  {Array} size new context size
 *
 * @return {undefined} undefined
 */
Compositor.prototype.sendResize = function sendResize (selector, size) {
    this.sendEvent(selector, 'CONTEXT_RESIZE', size);
};

/**
 * Internal helper method used by `drawCommands`.
 * Subsequent commands are being associated with the node defined the the path
 * following the `WITH` command.
 *
 * @method
 * @private
 *
 * @param  {Number} iterator position index within the commands queue
 * @param  {Array} commands remaining message queue received, used to
 * shift single messages from
 *
 * @return {undefined} undefined
 */
Compositor.prototype.handleWith = function handleWith (iterator, commands) {
    var path = commands[iterator];
    var pathArr = path.split('/');
    var context = this.getOrSetContext(pathArr.shift());
    return context.receive(path, commands, iterator);
};

/**
 * Retrieves the top-level Context associated with the passed in document
 * query selector. If no such Context exists, a new one will be instantiated.
 *
 * @method
 *
 * @param  {String} selector document query selector used for retrieving the
 * DOM node that should be used as a root element by the Context
 *
 * @return {Context} context
 */
Compositor.prototype.getOrSetContext = function getOrSetContext(selector) {
    if (this._contexts[selector]) {
        return this._contexts[selector];
    }
    else {
        var context = new Context(selector, this);
        this._contexts[selector] = context;
        return context;
    }
};

/**
 * Retrieves a context object registered under the passed in selector.
 *
 * @method
 *
 * @param  {String} selector    Query selector that has previously been used to
 *                              register the context.
 * @return {Context}            The repsective context.
 */
Compositor.prototype.getContext = function getContext(selector) {
    if (this._contexts[selector])
        return this._contexts[selector];
};

/**
 * Processes the previously via `receiveCommands` updated incoming "in"
 * command queue.
 * Called by UIManager on a frame by frame basis.
 *
 * @method
 *
 * @return {Array} outCommands set of commands to be sent back
 */
Compositor.prototype.drawCommands = function drawCommands() {
    var commands = this._inCommands;
    var localIterator = 0;
    var command = commands[localIterator];
    while (command) {
        switch (command) {
            case Commands.TIME:
                this._time = commands[++localIterator];
                break;
            case Commands.WITH:
                localIterator = this.handleWith(++localIterator, commands);
                break;
            case Commands.NEED_SIZE_FOR:
                this.giveSizeFor(++localIterator, commands);
                break;
        }
        command = commands[++localIterator];
    }

    // TODO: Switch to associative arrays here...

    for (var key in this._contexts) {
        this._contexts[key].draw();
    }

    if (this._resized) {
        this.updateSize();
    }

    return this._outCommands;
};


/**
 * Updates the size of all previously registered context objects.
 * This results into CONTEXT_RESIZE events being sent and the root elements
 * used by the individual renderers being resized to the the DOMRenderer's root
 * size.
 *
 * @method
 *
 * @return {undefined} undefined
 */
Compositor.prototype.updateSize = function updateSize() {
    for (var selector in this._contexts) {
        this._contexts[selector].updateSize();
    }
};

/**
 * Used by ThreadManager to update the internal queue of incoming commands.
 * Receiving commands does not immediately start the rendering process.
 *
 * @method
 *
 * @param  {Array} commands command queue to be processed by the compositor's
 * `drawCommands` method
 *
 * @return {undefined} undefined
 */
Compositor.prototype.receiveCommands = function receiveCommands(commands) {
    var len = commands.length;
    for (var i = 0; i < len; i++) {
        this._inCommands.push(commands[i]);
    }

    for (var selector in this._contexts) {
        this._contexts[selector].checkInit();
    }
};

/**
 * Internal helper method used by `drawCommands`.
 *
 * @method
 * @private
 *
 * @param  {Number} iterator position index within the command queue
 * @param  {Array} commands remaining message queue received, used to
 * shift single messages
 *
 * @return {undefined} undefined
 */
Compositor.prototype.giveSizeFor = function giveSizeFor(iterator, commands) {
    var selector = commands[iterator];
    var context = this.getContext(selector);
    if (context) {
        var size = context.getRootSize();
        this.sendResize(selector, size);
    } else {
        this.getOrSetContext(selector);
    }
};

/**
 * Flushes the queue of outgoing "out" commands.
 * Called by ThreadManager.
 *
 * @method
 *
 * @return {undefined} undefined
 */
Compositor.prototype.clearCommands = function clearCommands() {
    this._inCommands.length = 0;
    this._outCommands.length = 0;
    this._resized = false;
};

module.exports = Compositor;

},{"../core/Commands":15,"./Context":87,"./inject-css":90}],87:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

var WebGLRenderer = require('../webgl-renderers/WebGLRenderer');
var Camera = require('../components/Camera');
var DOMRenderer = require('../dom-renderers/DOMRenderer');
var Commands = require('../core/Commands');

/**
 * Context is a render layer with its own WebGLRenderer and DOMRenderer.
 * It is the interface between the Compositor which receives commands
 * and the renderers that interpret them. It also relays information to
 * the renderers about resizing.
 *
 * The DOMElement at the given query selector is used as the root. A
 * new DOMElement is appended to this root element, and used as the
 * parent element for all Famous DOM rendering at this context. A
 * canvas is added and used for all WebGL rendering at this context.
 *
 * @class Context
 * @constructor
 *
 * @param {String} selector Query selector used to locate root element of
 * context layer.
 * @param {Compositor} compositor Compositor reference to pass down to
 * WebGLRenderer.
 */
function Context(selector, compositor) {
    this._compositor = compositor;
    this._rootEl = document.querySelector(selector);
    this._selector = selector;

    if (this._rootEl === null) {
        throw new Error(
            'Failed to create Context: ' +
            'No matches for "' + selector + '" found.'
        );
    }

    this._selector = selector;

    // Initializes the DOMRenderer.
    // Every Context has at least a DOMRenderer for now.
    this._initDOMRenderer();

    // WebGLRenderer will be instantiated when needed.
    this._webGLRenderer = null;
    this._domRenderer = new DOMRenderer(this._domRendererRootEl, selector, compositor);
    this._canvasEl = null;

    // State holders

    this._renderState = {
        projectionType: Camera.ORTHOGRAPHIC_PROJECTION,
        perspectiveTransform: new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]),
        viewTransform: new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]),
        viewDirty: false,
        perspectiveDirty: false
    };

    this._size = [];

    this._meshTransform = new Float32Array(16);
    this._meshSize = [0, 0, 0];

    this._initDOM = false;

    this._commandCallbacks = [];
    this.initCommandCallbacks();

    this.updateSize();
}

/**
 * Queries DOMRenderer size and updates canvas size. Relays size information to
 * WebGLRenderer.
 *
 * @method
 *
 * @return {Context} this
 */
Context.prototype.updateSize = function () {
    var width = this._rootEl.offsetWidth;
    var height = this._rootEl.offsetHeight;

    this._size[0] = width;
    this._size[1] = height;
    this._size[2] = (width > height) ? width : height;

    this._compositor.sendResize(this._selector, this._size);
    if (this._webGLRenderer) this._webGLRenderer.updateSize(this._size);

    return this;
};

/**
 * Draw function called after all commands have been handled for current frame.
 * Issues draw commands to all renderers with current renderState.
 *
 * @method
 *
 * @return {undefined} undefined
 */
Context.prototype.draw = function draw() {
    this._domRenderer.draw(this._renderState);
    if (this._webGLRenderer) this._webGLRenderer.draw(this._renderState);

    if (this._renderState.perspectiveDirty) this._renderState.perspectiveDirty = false;
    if (this._renderState.viewDirty) this._renderState.viewDirty = false;
};

/**
 * Initializes the DOMRenderer by creating a root DIV element and appending it
 * to the context.
 *
 * @method
 * @private
 *
 * @return {undefined} undefined
 */
Context.prototype._initDOMRenderer = function _initDOMRenderer() {
    this._domRendererRootEl = document.createElement('div');
    this._rootEl.appendChild(this._domRendererRootEl);
    this._domRendererRootEl.style.visibility = 'hidden';

    this._domRenderer = new DOMRenderer(
        this._domRendererRootEl,
        this._selector,
        this._compositor
    );
};

Context.prototype.initCommandCallbacks = function initCommandCallbacks () {
    this._commandCallbacks[Commands.INIT_DOM] = initDOM;
    this._commandCallbacks[Commands.DOM_RENDER_SIZE] = domRenderSize;
    this._commandCallbacks[Commands.CHANGE_TRANSFORM] = changeTransform;
    this._commandCallbacks[Commands.CHANGE_SIZE] = changeSize;
    this._commandCallbacks[Commands.CHANGE_PROPERTY] = changeProperty;
    this._commandCallbacks[Commands.CHANGE_CONTENT] = changeContent;
    this._commandCallbacks[Commands.CHANGE_ATTRIBUTE] = changeAttribute;
    this._commandCallbacks[Commands.ADD_CLASS] = addClass;
    this._commandCallbacks[Commands.REMOVE_CLASS] = removeClass;
    this._commandCallbacks[Commands.SUBSCRIBE] = subscribe;
    this._commandCallbacks[Commands.UNSUBSCRIBE] = unsubscribe;
    this._commandCallbacks[Commands.GL_SET_DRAW_OPTIONS] = glSetDrawOptions;
    this._commandCallbacks[Commands.GL_AMBIENT_LIGHT] = glAmbientLight;
    this._commandCallbacks[Commands.GL_LIGHT_POSITION] = glLightPosition;
    this._commandCallbacks[Commands.GL_LIGHT_COLOR] = glLightColor;
    this._commandCallbacks[Commands.MATERIAL_INPUT] = materialInput;
    this._commandCallbacks[Commands.GL_SET_GEOMETRY] = glSetGeometry;
    this._commandCallbacks[Commands.GL_UNIFORMS] = glUniforms;
    this._commandCallbacks[Commands.GL_BUFFER_DATA] = glBufferData;
    this._commandCallbacks[Commands.GL_CUTOUT_STATE] = glCutoutState;
    this._commandCallbacks[Commands.GL_MESH_VISIBILITY] = glMeshVisibility;
    this._commandCallbacks[Commands.GL_REMOVE_MESH] = glRemoveMesh;
    this._commandCallbacks[Commands.PINHOLE_PROJECTION] = pinholeProjection;
    this._commandCallbacks[Commands.ORTHOGRAPHIC_PROJECTION] = orthographicProjection;
    this._commandCallbacks[Commands.CHANGE_VIEW_TRANSFORM] = changeViewTransform;
    this._commandCallbacks[Commands.PREVENT_DEFAULT] = preventDefault;
    this._commandCallbacks[Commands.ALLOW_DEFAULT] = allowDefault;
    this._commandCallbacks[Commands.READY] = ready;
};

/**
 * Initializes the WebGLRenderer and updates it initial size.
 *
 * The Initialization process consists of the following steps:
 *
 * 1. A new `<canvas>` element is being created and appended to the root element.
 * 2. The WebGLRenderer is being instantiated.
 * 3. The size of the WebGLRenderer is being updated.
 *
 * @method
 * @private
 *
 * @return {undefined} undefined
 */
Context.prototype._initWebGLRenderer = function _initWebGLRenderer() {
    this._webGLRendererRootEl = document.createElement('canvas');
    this._rootEl.appendChild(this._webGLRendererRootEl);

    this._webGLRenderer = new WebGLRenderer(
        this._webGLRendererRootEl,
        this._compositor
    );

    // Don't read offset width and height.
    this._webGLRenderer.updateSize(this._size);
};

/**
 * Gets the size of the parent element of the DOMRenderer for this context.
 *
 * @method
 *
 * @return {undefined} undefined
 */
Context.prototype.getRootSize = function getRootSize() {
    return [
        this._rootEl.offsetWidth,
        this._rootEl.offsetHeight
    ];
};


/**
 * Initializes the context if the `READY` command has been received earlier.
 *
 * @return {undefined} undefined
 */
Context.prototype.checkInit = function checkInit () {
    if (this._initDOM) {
        this._domRendererRootEl.style.visibility = 'visible';
        this._initDOM = false;
    }
};

/**
 * Handles delegation of commands to renderers of this context.
 *
 * @method
 *
 * @param {String} path String used as identifier of a given node in the
 * scene graph.
 * @param {Array} commands List of all commands from this frame.
 * @param {Number} iterator Number indicating progress through the command
 * queue.
 *
 * @return {Number} iterator indicating progress through the command queue.
 */
Context.prototype.receive = function receive(path, commands, iterator) {
    var localIterator = iterator;

    var command = commands[++localIterator];

    this._domRenderer.loadPath(path);

    while (command != null) {
        if (command === Commands.WITH || command === Commands.TIME) return localIterator - 1;
        else localIterator = this._commandCallbacks[command](this, path, commands, localIterator) + 1;
        command = commands[localIterator];
    }

    return localIterator;
};

/**
 * Getter method used for retrieving the used DOMRenderer.
 *
 * @method
 *
 * @return {DOMRenderer}    The DOMRenderer being used by the Context.
 */
Context.prototype.getDOMRenderer = function getDOMRenderer() {
    return this._domRenderer;
};

/**
 * Getter method used for retrieving the used WebGLRenderer (if any).
 *
 * @method
 *
 * @return {WebGLRenderer|null}    The WebGLRenderer being used by the Context.
 */
Context.prototype.getWebGLRenderer = function getWebGLRenderer() {
    return this._webGLRenderer;
};

// Command Callbacks
function preventDefault (context, path, commands, iterator) {
    if (context._webGLRenderer) context._webGLRenderer.getOrSetCutout(path);
    context._domRenderer.preventDefault(commands[++iterator]);
    return iterator;
}

function allowDefault (context, path, commands, iterator) {
    if (context._webGLRenderer) context._webGLRenderer.getOrSetCutout(path);
    context._domRenderer.allowDefault(commands[++iterator]);
    return iterator;
}

function ready (context, path, commands, iterator) {
    context._initDOM = true;
    return iterator;
}

function initDOM (context, path, commands, iterator) {
    context._domRenderer.insertEl(commands[++iterator]);
    return iterator;
}

function domRenderSize (context, path, commands, iterator) {
    context._domRenderer.getSizeOf(commands[++iterator]);
    return iterator;
}

function changeTransform (context, path, commands, iterator) {
    var temp = context._meshTransform;

    temp[0] = commands[++iterator];
    temp[1] = commands[++iterator];
    temp[2] = commands[++iterator];
    temp[3] = commands[++iterator];
    temp[4] = commands[++iterator];
    temp[5] = commands[++iterator];
    temp[6] = commands[++iterator];
    temp[7] = commands[++iterator];
    temp[8] = commands[++iterator];
    temp[9] = commands[++iterator];
    temp[10] = commands[++iterator];
    temp[11] = commands[++iterator];
    temp[12] = commands[++iterator];
    temp[13] = commands[++iterator];
    temp[14] = commands[++iterator];
    temp[15] = commands[++iterator];

    context._domRenderer.setMatrix(temp);

    if (context._webGLRenderer)
        context._webGLRenderer.setCutoutUniform(path, 'u_transform', temp);

    return iterator;
}

function changeSize (context, path, commands, iterator) {
    var width = commands[++iterator];
    var height = commands[++iterator];

    context._domRenderer.setSize(width, height);
    if (context._webGLRenderer) {
        context._meshSize[0] = width;
        context._meshSize[1] = height;
        context._webGLRenderer.setCutoutUniform(path, 'u_size', context._meshSize);
    }

    return iterator;
}

function changeProperty (context, path, commands, iterator) {
    if (context._webGLRenderer) context._webGLRenderer.getOrSetCutout(path);
    context._domRenderer.setProperty(commands[++iterator], commands[++iterator]);
    return iterator;
}

function changeContent (context, path, commands, iterator) {
    if (context._webGLRenderer) context._webGLRenderer.getOrSetCutout(path);
    context._domRenderer.setContent(commands[++iterator]);
    return iterator;
}

function changeAttribute (context, path, commands, iterator) {
    if (context._webGLRenderer) context._webGLRenderer.getOrSetCutout(path);
    context._domRenderer.setAttribute(commands[++iterator], commands[++iterator]);
    return iterator;
}

function addClass (context, path, commands, iterator) {
    if (context._webGLRenderer) context._webGLRenderer.getOrSetCutout(path);
    context._domRenderer.addClass(commands[++iterator]);
    return iterator;
}

function removeClass (context, path, commands, iterator) {
    if (context._webGLRenderer) context._webGLRenderer.getOrSetCutout(path);
    context._domRenderer.removeClass(commands[++iterator]);
    return iterator;
}

function subscribe (context, path, commands, iterator) {
    if (context._webGLRenderer) context._webGLRenderer.getOrSetCutout(path);
    context._domRenderer.subscribe(commands[++iterator]);
    return iterator;
}

function unsubscribe (context, path, commands, iterator) {
    if (context._webGLRenderer) context._webGLRenderer.getOrSetCutout(path);
    context._domRenderer.unsubscribe(commands[++iterator]);
    return iterator;
}

function glSetDrawOptions (context, path, commands, iterator) {
    if (!context._webGLRenderer) context._initWebGLRenderer();
    context._webGLRenderer.setMeshOptions(path, commands[++iterator]);
    return iterator;
}

function glAmbientLight (context, path, commands, iterator) {
    if (!context._webGLRenderer) context._initWebGLRenderer();
    context._webGLRenderer.setAmbientLightColor(
        path,
        commands[++iterator],
        commands[++iterator],
        commands[++iterator]
    );
    return iterator;
}

function glLightPosition (context, path, commands, iterator) {
    if (!context._webGLRenderer) context._initWebGLRenderer();
    context._webGLRenderer.setLightPosition(
        path,
        commands[++iterator],
        commands[++iterator],
        commands[++iterator]
    );
    return iterator;
}

function glLightColor (context, path, commands, iterator) {
    if (!context._webGLRenderer) context._initWebGLRenderer();
    context._webGLRenderer.setLightColor(
        path,
        commands[++iterator],
        commands[++iterator],
        commands[++iterator]
    );
    return iterator;
}

function materialInput (context, path, commands, iterator) {
    if (!context._webGLRenderer) context._initWebGLRenderer();
    context._webGLRenderer.handleMaterialInput(
        path,
        commands[++iterator],
        commands[++iterator]
    );
    return iterator;
}

function glSetGeometry (context, path, commands, iterator) {
    if (!context._webGLRenderer) context._initWebGLRenderer();
    context._webGLRenderer.setGeometry(
        path,
        commands[++iterator],
        commands[++iterator],
        commands[++iterator]
    );
    return iterator;
}

function glUniforms (context, path, commands, iterator) {
    if (!context._webGLRenderer) context._initWebGLRenderer();
    context._webGLRenderer.setMeshUniform(
        path,
        commands[++iterator],
        commands[++iterator]
    );
    return iterator;
}

function glBufferData (context, path, commands, iterator) {
    if (!context._webGLRenderer) context._initWebGLRenderer();
    context._webGLRenderer.bufferData(
        commands[++iterator],
        commands[++iterator],
        commands[++iterator],
        commands[++iterator],
        commands[++iterator]
    );
    return iterator;
}

function glCutoutState (context, path, commands, iterator) {
    if (!context._webGLRenderer) context._initWebGLRenderer();
    context._webGLRenderer.setCutoutState(path, commands[++iterator]);
    return iterator;
}

function glMeshVisibility (context, path, commands, iterator) {
    if (!context._webGLRenderer) context._initWebGLRenderer();
    context._webGLRenderer.setMeshVisibility(path, commands[++iterator]);
    return iterator;
}

function glRemoveMesh (context, path, commands, iterator) {
    if (!context._webGLRenderer) context._initWebGLRenderer();
    context._webGLRenderer.removeMesh(path);
    return iterator;
}

function pinholeProjection (context, path, commands, iterator) {
    context._renderState.projectionType = Camera.PINHOLE_PROJECTION;
    context._renderState.perspectiveTransform[11] = -1 / commands[++iterator];
    context._renderState.perspectiveDirty = true;
    return iterator;
}

function orthographicProjection (context, path, commands, iterator) {
    context._renderState.projectionType = Camera.ORTHOGRAPHIC_PROJECTION;
    context._renderState.perspectiveTransform[11] = 0;
    context._renderState.perspectiveDirty = true;
    return iterator;
}

function changeViewTransform (context, path, commands, iterator) {
    context._renderState.viewTransform[0] = commands[++iterator];
    context._renderState.viewTransform[1] = commands[++iterator];
    context._renderState.viewTransform[2] = commands[++iterator];
    context._renderState.viewTransform[3] = commands[++iterator];

    context._renderState.viewTransform[4] = commands[++iterator];
    context._renderState.viewTransform[5] = commands[++iterator];
    context._renderState.viewTransform[6] = commands[++iterator];
    context._renderState.viewTransform[7] = commands[++iterator];

    context._renderState.viewTransform[8] = commands[++iterator];
    context._renderState.viewTransform[9] = commands[++iterator];
    context._renderState.viewTransform[10] = commands[++iterator];
    context._renderState.viewTransform[11] = commands[++iterator];

    context._renderState.viewTransform[12] = commands[++iterator];
    context._renderState.viewTransform[13] = commands[++iterator];
    context._renderState.viewTransform[14] = commands[++iterator];
    context._renderState.viewTransform[15] = commands[++iterator];

    context._renderState.viewDirty = true;
    return iterator;
}

module.exports = Context;

},{"../components/Camera":2,"../core/Commands":15,"../dom-renderers/DOMRenderer":30,"../webgl-renderers/WebGLRenderer":136}],88:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

var Commands = require('../core/Commands');

/**
 * The UIManager is being updated by an Engine by consecutively calling its
 * `update` method. It can either manage a real Web-Worker or the global
 * FamousEngine core singleton.
 *
 * @example
 * var compositor = new Compositor();
 * var engine = new Engine();
 *
 * // Using a Web Worker
 * var worker = new Worker('worker.bundle.js');
 * var threadmanger = new UIManager(worker, compositor, engine);
 *
 * // Without using a Web Worker
 * var threadmanger = new UIManager(Famous, compositor, engine);
 *
 * @class  UIManager
 * @constructor
 *
 * @param {Famous|Worker} thread The thread being used to receive messages
 * from and post messages to. Expected to expose a WebWorker-like API, which
 * means providing a way to listen for updates by setting its `onmessage`
 * property and sending updates using `postMessage`.
 * @param {Compositor} compositor an instance of Compositor used to extract
 * enqueued draw commands from to be sent to the thread.
 * @param {RenderLoop} renderLoop an instance of Engine used for executing
 * the `ENGINE` commands on.
 */
function UIManager (thread, compositor, renderLoop) {
    this._thread = thread;
    this._compositor = compositor;
    this._renderLoop = renderLoop;

    this._renderLoop.update(this);

    var _this = this;
    this._thread.onmessage = function (ev) {
        var message = ev.data ? ev.data : ev;
        if (message[0] === Commands.ENGINE) {
            switch (message[1]) {
                case Commands.START:
                    _this._engine.start();
                    break;
                case Commands.STOP:
                    _this._engine.stop();
                    break;
                default:
                    console.error(
                        'Unknown ENGINE command "' + message[1] + '"'
                    );
                    break;
            }
        }
        else {
            _this._compositor.receiveCommands(message);
        }
    };
    this._thread.onerror = function (error) {
        console.error(error);
    };
}

/**
 * Returns the thread being used by the UIManager.
 * This could either be an an actual web worker or a `FamousEngine` singleton.
 *
 * @method
 *
 * @return {Worker|FamousEngine} Either a web worker or a `FamousEngine` singleton.
 */
UIManager.prototype.getThread = function getThread() {
    return this._thread;
};

/**
 * Returns the compositor being used by this UIManager.
 *
 * @method
 *
 * @return {Compositor} The compositor used by the UIManager.
 */
UIManager.prototype.getCompositor = function getCompositor() {
    return this._compositor;
};

/**
 * Returns the engine being used by this UIManager.
 *
 * @method
 * @deprecated Use {@link UIManager#getRenderLoop instead!}
 *
 * @return {Engine} The engine used by the UIManager.
 */
UIManager.prototype.getEngine = function getEngine() {
    return this._renderLoop;
};


/**
 * Returns the render loop currently being used by the UIManager.
 *
 * @method
 *
 * @return {RenderLoop}  The registered render loop used for updating the
 * UIManager.
 */
UIManager.prototype.getRenderLoop = function getRenderLoop() {
    return this._renderLoop;
};

/**
 * Update method being invoked by the Engine on every `requestAnimationFrame`.
 * Used for updating the notion of time within the managed thread by sending
 * a FRAME command and sending messages to
 *
 * @method
 *
 * @param  {Number} time unix timestamp to be passed down to the worker as a
 * FRAME command
 * @return {undefined} undefined
 */
UIManager.prototype.update = function update (time) {
    this._thread.postMessage([Commands.FRAME, time]);
    var threadMessages = this._compositor.drawCommands();
    this._thread.postMessage(threadMessages);
    this._compositor.clearCommands();
};

module.exports = UIManager;

},{"../core/Commands":15}],89:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

module.exports = {
    Compositor: require('./Compositor'),
    Context: require('./Context'),
    UIManager: require('./UIManager'),
    injectCSS: require('./inject-css')
};

},{"./Compositor":86,"./Context":87,"./UIManager":88,"./inject-css":90}],90:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

var css = '.famous-dom-renderer {' +
    'width:100%;' +
    'height:100%;' +
    'transform-style:preserve-3d;' +
    '-webkit-transform-style:preserve-3d;' +
'}' +

'.famous-dom-element {' +
    '-webkit-transform-origin:0% 0%;' +
    'transform-origin:0% 0%;' +
    '-webkit-backface-visibility:visible;' +
    'backface-visibility:visible;' +
    '-webkit-transform-style:preserve-3d;' +
    'transform-style:preserve-3d;' +
    '-webkit-tap-highlight-color:transparent;' +
    'pointer-events:auto;' +
    'z-index:1;' +
'}' +

'.famous-dom-element-content,' +
'.famous-dom-element {' +
    'position:absolute;' +
    'box-sizing:border-box;' +
    '-moz-box-sizing:border-box;' +
    '-webkit-box-sizing:border-box;' +
'}' +

'.famous-webgl-renderer {' +
    '-webkit-transform:translateZ(1000000px);' +  /* TODO: Fix when Safari Fixes*/
    'transform:translateZ(1000000px);' +
    'pointer-events:none;' +
    'position:absolute;' +
    'z-index:1;' +
    'top:0;' +
    'width:100%;' +
    'height:100%;' +
'}';

var INJECTED = typeof document === 'undefined';

function injectCSS() {
    if (INJECTED) return;
    INJECTED = true;
    if (document.createStyleSheet) {
        var sheet = document.createStyleSheet();
        sheet.cssText = css;
    }
    else {
        var head = document.getElementsByTagName('head')[0];
        var style = document.createElement('style');

        if (style.styleSheet) {
            style.styleSheet.cssText = css;
        }
        else {
            style.appendChild(document.createTextNode(css));
        }

        (head ? head : document.documentElement).appendChild(style);
    }
}

module.exports = injectCSS;

},{}],91:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

/*jshint -W008 */

'use strict';

/**
 * A library of curves which map an animation explicitly as a function of time.
 *
 * @namespace
 * @property {Function} linear
 * @property {Function} easeIn
 * @property {Function} easeOut
 * @property {Function} easeInOut
 * @property {Function} easeOutBounce
 * @property {Function} spring
 * @property {Function} inQuad
 * @property {Function} outQuad
 * @property {Function} inOutQuad
 * @property {Function} inCubic
 * @property {Function} outCubic
 * @property {Function} inOutCubic
 * @property {Function} inQuart
 * @property {Function} outQuart
 * @property {Function} inOutQuart
 * @property {Function} inQuint
 * @property {Function} outQuint
 * @property {Function} inOutQuint
 * @property {Function} inSine
 * @property {Function} outSine
 * @property {Function} inOutSine
 * @property {Function} inExpo
 * @property {Function} outExpo
 * @property {Function} inOutExp
 * @property {Function} inCirc
 * @property {Function} outCirc
 * @property {Function} inOutCirc
 * @property {Function} inElastic
 * @property {Function} outElastic
 * @property {Function} inOutElastic
 * @property {Function} inBounce
 * @property {Function} outBounce
 * @property {Function} inOutBounce
 * @property {Function} flat            - Useful for delaying the execution of
 *                                        a subsequent transition.
 */
var Curves = {
    linear: function(t) {
        return t;
    },

    easeIn: function(t) {
        return t*t;
    },

    easeOut: function(t) {
        return t*(2-t);
    },

    easeInOut: function(t) {
        if (t <= 0.5) return 2*t*t;
        else return -2*t*t + 4*t - 1;
    },

    easeOutBounce: function(t) {
        return t*(3 - 2*t);
    },

    spring: function(t) {
        return (1 - t) * Math.sin(6 * Math.PI * t) + t;
    },

    inQuad: function(t) {
        return t*t;
    },

    outQuad: function(t) {
        return -(t-=1)*t+1;
    },

    inOutQuad: function(t) {
        if ((t/=.5) < 1) return .5*t*t;
        return -.5*((--t)*(t-2) - 1);
    },

    inCubic: function(t) {
        return t*t*t;
    },

    outCubic: function(t) {
        return ((--t)*t*t + 1);
    },

    inOutCubic: function(t) {
        if ((t/=.5) < 1) return .5*t*t*t;
        return .5*((t-=2)*t*t + 2);
    },

    inQuart: function(t) {
        return t*t*t*t;
    },

    outQuart: function(t) {
        return -((--t)*t*t*t - 1);
    },

    inOutQuart: function(t) {
        if ((t/=.5) < 1) return .5*t*t*t*t;
        return -.5 * ((t-=2)*t*t*t - 2);
    },

    inQuint: function(t) {
        return t*t*t*t*t;
    },

    outQuint: function(t) {
        return ((--t)*t*t*t*t + 1);
    },

    inOutQuint: function(t) {
        if ((t/=.5) < 1) return .5*t*t*t*t*t;
        return .5*((t-=2)*t*t*t*t + 2);
    },

    inSine: function(t) {
        return -1.0*Math.cos(t * (Math.PI/2)) + 1.0;
    },

    outSine: function(t) {
        return Math.sin(t * (Math.PI/2));
    },

    inOutSine: function(t) {
        return -.5*(Math.cos(Math.PI*t) - 1);
    },

    inExpo: function(t) {
        return (t===0) ? 0.0 : Math.pow(2, 10 * (t - 1));
    },

    outExpo: function(t) {
        return (t===1.0) ? 1.0 : (-Math.pow(2, -10 * t) + 1);
    },

    inOutExpo: function(t) {
        if (t===0) return 0.0;
        if (t===1.0) return 1.0;
        if ((t/=.5) < 1) return .5 * Math.pow(2, 10 * (t - 1));
        return .5 * (-Math.pow(2, -10 * --t) + 2);
    },

    inCirc: function(t) {
        return -(Math.sqrt(1 - t*t) - 1);
    },

    outCirc: function(t) {
        return Math.sqrt(1 - (--t)*t);
    },

    inOutCirc: function(t) {
        if ((t/=.5) < 1) return -.5 * (Math.sqrt(1 - t*t) - 1);
        return .5 * (Math.sqrt(1 - (t-=2)*t) + 1);
    },

    inElastic: function(t) {
        var s=1.70158;var p=0;var a=1.0;
        if (t===0) return 0.0;  if (t===1) return 1.0;  if (!p) p=.3;
        s = p/(2*Math.PI) * Math.asin(1.0/a);
        return -(a*Math.pow(2,10*(t-=1)) * Math.sin((t-s)*(2*Math.PI)/ p));
    },

    outElastic: function(t) {
        var s=1.70158;var p=0;var a=1.0;
        if (t===0) return 0.0;  if (t===1) return 1.0;  if (!p) p=.3;
        s = p/(2*Math.PI) * Math.asin(1.0/a);
        return a*Math.pow(2,-10*t) * Math.sin((t-s)*(2*Math.PI)/p) + 1.0;
    },

    inOutElastic: function(t) {
        var s=1.70158;var p=0;var a=1.0;
        if (t===0) return 0.0;  if ((t/=.5)===2) return 1.0;  if (!p) p=(.3*1.5);
        s = p/(2*Math.PI) * Math.asin(1.0/a);
        if (t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin((t-s)*(2*Math.PI)/p));
        return a*Math.pow(2,-10*(t-=1)) * Math.sin((t-s)*(2*Math.PI)/p)*.5 + 1.0;
    },

    inBack: function(t, s) {
        if (s === undefined) s = 1.70158;
        return t*t*((s+1)*t - s);
    },

    outBack: function(t, s) {
        if (s === undefined) s = 1.70158;
        return ((--t)*t*((s+1)*t + s) + 1);
    },

    inOutBack: function(t, s) {
        if (s === undefined) s = 1.70158;
        if ((t/=.5) < 1) return .5*(t*t*(((s*=(1.525))+1)*t - s));
        return .5*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2);
    },

    inBounce: function(t) {
        return 1.0 - Curves.outBounce(1.0-t);
    },

    outBounce: function(t) {
        if (t < (1/2.75)) {
            return (7.5625*t*t);
        }
        else if (t < (2/2.75)) {
            return (7.5625*(t-=(1.5/2.75))*t + .75);
        }
        else if (t < (2.5/2.75)) {
            return (7.5625*(t-=(2.25/2.75))*t + .9375);
        }
        else {
            return (7.5625*(t-=(2.625/2.75))*t + .984375);
        }
    },

    inOutBounce: function(t) {
        if (t < .5) return Curves.inBounce(t*2) * .5;
        return Curves.outBounce(t*2-1.0) * .5 + .5;
    },

    flat: function() {
        return 0;
    }
};

module.exports = Curves;

},{}],92:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

var Curves = require('./Curves');
var FamousEngine = require('../core/FamousEngine');

/**
 * A state maintainer for a smooth transition between
 *    numerically-specified states. Example numeric states include floats and
 *    arrays of floats objects.
 *
 * An initial state is set with the constructor or using
 *     {@link Transitionable#from}. Subsequent transitions consist of an
 *     intermediate state, easing curve, duration and callback. The final state
 *     of each transition is the initial state of the subsequent one. Calls to
 *     {@link Transitionable#get} provide the interpolated state along the way.
 *
 * Note that there is no event loop here - calls to {@link Transitionable#get}
 *    are the only way to find state projected to the current (or provided)
 *    time and are the only way to trigger callbacks and mutate the internal
 *    transition queue.
 *
 * @example
 * var t = new Transitionable([0, 0]);
 * t
 *     .to([100, 0], 'linear', 1000)
 *     .delay(1000)
 *     .to([200, 0], 'outBounce', 1000);
 *
 * var div = document.createElement('div');
 * div.style.background = 'blue';
 * div.style.width = '100px';
 * div.style.height = '100px';
 * document.body.appendChild(div);
 *
 * div.addEventListener('click', function() {
 *     t.isPaused() ? t.resume() : t.pause();
 * });
 *
 * requestAnimationFrame(function loop() {
 *     div.style.transform = 'translateX(' + t.get()[0] + 'px)' + ' translateY(' + t.get()[1] + 'px)';
 *     requestAnimationFrame(loop);
 * });
 *
 * @class Transitionable
 * @constructor
 * @param {Number|Array.Number} initialState    initial state to transition
 *                                              from - equivalent to a pursuant
 *                                              invocation of
 *                                              {@link Transitionable#from}
 */
function Transitionable(initialState) {
    this._queue = [];
    this._from = null;
    this._state = null;
    this._startedAt = null;
    this._pausedAt = null;
    if (initialState != null) this.from(initialState);
}

/**
 * Internal Clock used for determining the current time for the ongoing
 * transitions.
 *
 * @type {Performance|Date|Clock}
 */
Transitionable.Clock = FamousEngine.getClock();

/**
 * Registers a transition to be pushed onto the internal queue.
 *
 * @method to
 * @chainable
 *
 * @param  {Number|Array.Number}    finalState              final state to
 *                                                          transiton to
 * @param  {String|Function}        [curve=Curves.linear]   easing function
 *                                                          used for
 *                                                          interpolating
 *                                                          [0, 1]
 * @param  {Number}                 [duration=100]          duration of
 *                                                          transition
 * @param  {Function}               [callback]              callback function
 *                                                          to be called after
 *                                                          the transition is
 *                                                          complete
 * @param  {String}                 [method]                method used for
 *                                                          interpolation
 *                                                          (e.g. slerp)
 * @return {Transitionable}         this
 */
Transitionable.prototype.to = function to(finalState, curve, duration, callback, method) {
    curve = curve != null && curve.constructor === String ? Curves[curve] : curve;
    if (this._queue.length === 0) {
        this._startedAt = this.constructor.Clock.now();
        this._pausedAt = null;
    }
    this._queue.push(
        finalState,
        curve != null ? curve : Curves.linear,
        duration != null ? duration : 100,
        callback,
        method
    );
    return this;
};

/**
 * Resets the transition queue to a stable initial state.
 *
 * @method from
 * @chainable
 *
 * @param  {Number|Array.Number}    initialState    initial state to
 *                                                  transition from
 * @return {Transitionable}         this
 */
Transitionable.prototype.from = function from(initialState) {
    this._state = initialState;
    this._from = this._sync(null, this._state);
    this._queue.length = 0;
    this._startedAt = this.constructor.Clock.now();
    this._pausedAt = null;
    return this;
};

/**
 * Delays the execution of the subsequent transition for a certain period of
 * time.
 *
 * @method delay
 * @chainable
 *
 * @param {Number}      duration    delay time in ms
 * @param {Function}    [callback]  Zero-argument function to call on observed
 *                                  completion (t=1)
 * @return {Transitionable}         this
 */
Transitionable.prototype.delay = function delay(duration, callback) {
    var endState = this._queue.length > 0 ? this._queue[this._queue.length - 5] : this._state;
    return this.to(endState, Curves.flat, duration, callback);
};

/**
 * Overrides current transition.
 *
 * @method override
 * @chainable
 *
 * @param  {Number|Array.Number}    [finalState]    final state to transiton to
 * @param  {String|Function}        [curve]         easing function used for
 *                                                  interpolating [0, 1]
 * @param  {Number}                 [duration]      duration of transition
 * @param  {Function}               [callback]      callback function to be
 *                                                  called after the transition
 *                                                  is complete
 * @param {String}                  [method]        optional method used for
 *                                                  interpolating between the
 *                                                  values. Set to `slerp` for
 *                                                  spherical linear
 *                                                  interpolation.
 * @return {Transitionable}         this
 */
Transitionable.prototype.override = function override(finalState, curve, duration, callback, method) {
    if (this._queue.length > 0) {
        if (finalState != null) this._queue[0] = finalState;
        if (curve != null)      this._queue[1] = curve.constructor === String ? Curves[curve] : curve;
        if (duration != null)   this._queue[2] = duration;
        if (callback != null)   this._queue[3] = callback;
        if (method != null)     this._queue[4] = method;
    }
    return this;
};


/**
 * Used for interpolating between the start and end state of the currently
 * running transition
 *
 * @method  _interpolate
 * @private
 *
 * @param  {Object|Array|Number} output     Where to write to (in order to avoid
 *                                          object allocation and therefore GC).
 * @param  {Object|Array|Number} from       Start state of current transition.
 * @param  {Object|Array|Number} to         End state of current transition.
 * @param  {Number} progress                Progress of the current transition,
 *                                          in [0, 1]
 * @param  {String} method                  Method used for interpolation (e.g.
 *                                          slerp)
 * @return {Object|Array|Number}            output
 */
Transitionable.prototype._interpolate = function _interpolate(output, from, to, progress, method) {
    if (to instanceof Object) {
        if (method === 'slerp') {
            var x, y, z, w;
            var qx, qy, qz, qw;
            var omega, cosomega, sinomega, scaleFrom, scaleTo;

            x = from[0];
            y = from[1];
            z = from[2];
            w = from[3];

            qx = to[0];
            qy = to[1];
            qz = to[2];
            qw = to[3];

            if (progress === 1) {
                output[0] = qx;
                output[1] = qy;
                output[2] = qz;
                output[3] = qw;
                return output;
            }

            cosomega = w * qw + x * qx + y * qy + z * qz;
            if ((1.0 - cosomega) > 1e-5) {
                omega = Math.acos(cosomega);
                sinomega = Math.sin(omega);
                scaleFrom = Math.sin((1.0 - progress) * omega) / sinomega;
                scaleTo = Math.sin(progress * omega) / sinomega;
            }
            else {
                scaleFrom = 1.0 - progress;
                scaleTo = progress;
            }

            output[0] = x * scaleFrom + qx * scaleTo;
            output[1] = y * scaleFrom + qy * scaleTo;
            output[2] = z * scaleFrom + qz * scaleTo;
            output[3] = w * scaleFrom + qw * scaleTo;
        }
        else if (to instanceof Array) {
            for (var i = 0, len = to.length; i < len; i++) {
                output[i] = this._interpolate(output[i], from[i], to[i], progress, method);
            }
        }
        else {
            for (var key in to) {
                output[key] = this._interpolate(output[key], from[key], to[key], progress, method);
            }
        }
    }
    else {
        output = from + progress * (to - from);
    }
    return output;
};


/**
 * Internal helper method used for synchronizing the current, absolute state of
 * a transition to a given output array, object literal or number. Supports
 * nested state objects by through recursion.
 *
 * @method  _sync
 * @private
 *
 * @param  {Number|Array|Object} output     Where to write to (in order to avoid
 *                                          object allocation and therefore GC).
 * @param  {Number|Array|Object} input      Input state to proxy onto the
 *                                          output.
 * @return {Number|Array|Object} output     Passed in output object.
 */
Transitionable.prototype._sync = function _sync(output, input) {
    if (typeof input === 'number') output = input;
    else if (input instanceof Array) {
        if (output == null) output = [];
        for (var i = 0, len = input.length; i < len; i++) {
            output[i] = _sync(output[i], input[i]);
        }
    }
    else if (input instanceof Object) {
        if (output == null) output = {};
        for (var key in input) {
            output[key] = _sync(output[key], input[key]);
        }
    }
    return output;
};

/**
 * Get interpolated state of current action at provided time. If the last
 *    action has completed, invoke its callback.
 *
 * @method get
 *
 * @param {Number=} t               Evaluate the curve at a normalized version
 *                                  of this time. If omitted, use current time
 *                                  (Unix epoch time retrieved from Clock).
 * @return {Number|Array.Number}    Beginning state interpolated to this point
 *                                  in time.
 */
Transitionable.prototype.get = function get(t) {
    if (this._queue.length === 0) return this._state;

    t = this._pausedAt ? this._pausedAt : t;
    t = t ? t : this.constructor.Clock.now();

    var progress = (t - this._startedAt) / this._queue[2];
    this._state = this._interpolate(
        this._state,
        this._from,
        this._queue[0],
        this._queue[1](progress > 1 ? 1 : progress),
        this._queue[4]
    );
    var state = this._state;
    if (progress >= 1) {
        this._startedAt = this._startedAt + this._queue[2];
        this._from = this._sync(this._from, this._state);
        this._queue.shift();
        this._queue.shift();
        this._queue.shift();
        var callback = this._queue.shift();
        this._queue.shift();
        if (callback) callback();
    }
    return progress > 1 ? this.get() : state;
};

/**
 * Is there at least one transition pending completion?
 *
 * @method isActive
 *
 * @return {Boolean}    Boolean indicating whether there is at least one pending
 *                      transition. Paused transitions are still being
 *                      considered active.
 */
Transitionable.prototype.isActive = function isActive() {
    return this._queue.length > 0;
};

/**
 * Halt transition at current state and erase all pending actions.
 *
 * @method halt
 * @chainable
 *
 * @return {Transitionable} this
 */
Transitionable.prototype.halt = function halt() {
    return this.from(this.get());
};

/**
 * Pause transition. This will not erase any actions.
 *
 * @method pause
 * @chainable
 *
 * @return {Transitionable} this
 */
Transitionable.prototype.pause = function pause() {
    this._pausedAt = this.constructor.Clock.now();
    return this;
};

/**
 * Has the current action been paused?
 *
 * @method isPaused
 * @chainable
 *
 * @return {Boolean} if the current action has been paused
 */
Transitionable.prototype.isPaused = function isPaused() {
    return !!this._pausedAt;
};

/**
 * Resume a previously paused transition.
 *
 * @method resume
 * @chainable
 *
 * @return {Transitionable} this
 */
Transitionable.prototype.resume = function resume() {
    var diff = this._pausedAt - this._startedAt;
    this._startedAt = this.constructor.Clock.now() - diff;
    this._pausedAt = null;
    return this;
};

/**
 * Cancel all transitions and reset to a stable state
 *
 * @method reset
 * @chainable
 * @deprecated Use `.from` instead!
 *
 * @param {Number|Array.Number|Object.<number, number>} start
 *    stable state to set to
 * @return {Transitionable}                             this
 */
Transitionable.prototype.reset = function(start) {
    return this.from(start);
};

/**
 * Add transition to end state to the queue of pending transitions. Special
 *    Use: calling without a transition resets the object to that state with
 *    no pending actions
 *
 * @method set
 * @chainable
 * @deprecated Use `.to` instead!
 *
 * @param {Number|FamousEngineMatrix|Array.Number|Object.<number, number>} state
 *    end state to which we interpolate
 * @param {transition=} transition object of type {duration: number, curve:
 *    f[0,1] -> [0,1] or name}. If transition is omitted, change will be
 *    instantaneous.
 * @param {function()=} callback Zero-argument function to call on observed
 *    completion (t=1)
 * @return {Transitionable} this
 */
Transitionable.prototype.set = function(state, transition, callback) {
    if (transition == null) {
        this.from(state);
        if (callback) callback();
    }
    else {
        this.to(state, transition.curve, transition.duration, callback, transition.method);
    }
    return this;
};

module.exports = Transitionable;

},{"../core/FamousEngine":18,"./Curves":91}],93:[function(require,module,exports){
/**
 * The MIT License (MIT)
 * 
 * Copyright (c) 2015 Famous Industries Inc.
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

module.exports = {
    Curves: require('./Curves'),
    Transitionable: require('./Transitionable')
};

},{"./Curves":91,"./Transitionable":92}],94:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

/**
 * A lightweight, featureless EventEmitter.
 *
 * @class CallbackStore
 * @constructor
 */
function CallbackStore () {
    this._events = {};
}

/**
 * Adds a listener for the specified event (= key).
 *
 * @method on
 * @chainable
 *
 * @param  {String}   key       The event type (e.g. `click`).
 * @param  {Function} callback  A callback function to be invoked whenever `key`
 *                              event is being triggered.
 * @return {Function} destroy   A function to call if you want to remove the
 *                              callback.
 */
CallbackStore.prototype.on = function on (key, callback) {
    if (!this._events[key]) this._events[key] = [];
    var callbackList = this._events[key];
    callbackList.push(callback);
    return function () {
        callbackList.splice(callbackList.indexOf(callback), 1);
    };
};

/**
 * Removes a previously added event listener.
 *
 * @method off
 * @chainable
 *
 * @param  {String} key         The event type from which the callback function
 *                              should be removed.
 * @param  {Function} callback  The callback function to be removed from the
 *                              listeners for key.
 * @return {CallbackStore} this
 */
CallbackStore.prototype.off = function off (key, callback) {
    var events = this._events[key];
    if (events) events.splice(events.indexOf(callback), 1);
    return this;
};

/**
 * Invokes all the previously for this key registered callbacks.
 *
 * @method trigger
 * @chainable
 *
 * @param  {String}        key      The event type.
 * @param  {Object}        payload  The event payload (event object).
 * @return {CallbackStore} this
 */
CallbackStore.prototype.trigger = function trigger (key, payload) {
    var events = this._events[key];
    if (events) {
        var i = 0;
        var len = events.length;
        for (; i < len ; i++) events[i](payload);
    }
    return this;
};

module.exports = CallbackStore;

},{}],95:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

var Transitionable = require('../transitions/Transitionable');

/**
 * @class Color
 * @constructor
 *
 * @param {Color|String|Array} color Optional argument for setting color using Hex, a Color instance, color name or RGB.
 * @param {Object} transition Optional transition.
 * @param {Function} cb Callback function to be called on completion of the initial transition.
 *
 * @return {undefined} undefined
 */
function Color(color, transition, cb) {
    this._r = new Transitionable(0);
    this._g = new Transitionable(0);
    this._b = new Transitionable(0);
    this._opacity = new Transitionable(1);
    if (color) this.set(color, transition, cb);
}

/**
 * Returns the definition of the Class: 'Color'.
 *
 * @method
 *
 * @return {String} "Color"
 */
Color.prototype.toString = function toString() {
    return 'Color';
};

/**
 * Sets the color. It accepts an optional transition parameter and callback.
 * set(Color, transition, callback)
 * set('#000000', transition, callback)
 * set('black', transition, callback)
 * set([r, g, b], transition, callback)
 *
 * @method
 *
 * @param {Color|String|Array} color Sets color using Hex, a Color instance, color name or RGB.
 * @param {Object} transition Optional transition
 * @param {Function} cb Callback function to be called on completion of the transition.
 *
 * @return {Color} Color
 */
Color.prototype.set = function set(color, transition, cb) {
    switch (Color.determineType(color)) {
        case 'hex': return this.setHex(color, transition, cb);
        case 'colorName': return this.setColor(color, transition, cb);
        case 'instance': return this.changeTo(color, transition, cb);
        case 'rgb': return this.setRGB(color[0], color[1], color[2], transition, cb);
    }
    return this;
};

/**
 * Returns whether Color is still in an animating (transitioning) state.
 *
 * @method
 *
 * @returns {Boolean} Boolean value indicating whether the there is an active transition.
 */
Color.prototype.isActive = function isActive() {
    return this._r.isActive() ||
           this._g.isActive() ||
           this._b.isActive() ||
           this._opacity.isActive();
};

/**
 * Halt transition at current state and erase all pending actions.
 *
 * @method
 *
 * @return {Color} Color
 */
Color.prototype.halt = function halt() {
    this._r.halt();
    this._g.halt();
    this._b.halt();
    this._opacity.halt();
    return this;
};

/**
 * Sets the color values from another Color instance.
 *
 * @method
 *
 * @param {Color} color Color instance.
 * @param {Object} transition Optional transition.
 * @param {Function} cb Optional callback function.
 *
 * @return {Color} Color
 */
Color.prototype.changeTo = function changeTo(color, transition, cb) {
    if (Color.isColorInstance(color)) {
        var rgb = color.getRGB();
        this.setRGB(rgb[0], rgb[1], rgb[2], transition, cb);
    }
    return this;
};

/**
 * Sets the color based on static color names.
 *
 * @method
 *
 * @param {String} name Color name
 * @param {Object} transition Optional transition parameters
 * @param {Function} cb Optional callback
 *
 * @return {Color} Color
 */
Color.prototype.setColor = function setColor(name, transition, cb) {
    if (colorNames[name]) {
        this.setHex(colorNames[name], transition, cb);
    }
    return this;
};

/**
 * Returns the color in either RGB or with the requested format.
 *
 * @method
 *
 * @param {String} option Optional argument for determining which type of color to get (default is RGB)
 *
 * @returns {Object} Color in either RGB or specific option value
 */
Color.prototype.getColor = function getColor(option) {
    if (Color.isString(option)) option = option.toLowerCase();
    return (option === 'hex') ? this.getHex() : this.getRGB();
};

/**
 * Sets the R of the Color's RGB
 *
 * @method
 *
 * @param {Number} r R channel of color
 * @param {Object} transition Optional transition parameters
 * @param {Function} cb Optional callback
 *
 * @return {Color} Color
 */
Color.prototype.setR = function setR(r, transition, cb) {
    this._r.set(r, transition, cb);
    return this;
};

/**
 * Sets the G of the Color's RGB
 *
 * @method
 *
 * @param {Number} g G channel of color
 * @param {Object} transition Optional transition parameters
 * @param {Function} cb Optional callback
 *
 * @return {Color} Color
 */
Color.prototype.setG = function setG(g, transition, cb) {
    this._g.set(g, transition, cb);
    return this;
};

/**
 * Sets the B of the Color's RGB
 *
 * @method
 *
 * @param {Number} b B channel of color
 * @param {Object} transition Optional transition parameters
 * @param {Function} cb Optional callback
 *
 * @return {Color} Color
 */
Color.prototype.setB = function setB(b, transition, cb) {
    this._b.set(b, transition, cb);
    return this;
};

/**
 * Sets opacity value
 *
 * @method
 *
 * @param {Number} opacity Opacity value
 * @param {Object} transition Optional transition parameters
 * @param {Function} cb Optional callback
 *
 * @return {Color} Color
 */
Color.prototype.setOpacity = function setOpacity(opacity, transition, cb) {
    this._opacity.set(opacity, transition, cb);
    return this;
};

/**
 * Sets RGB
 *
 * @method
 *
 * @param {Number} r R channel of color
 * @param {Number} g G channel of color
 * @param {Number} b B channel of color
 * @param {Object} transition Optional transition parameters
 * @param {Function} cb Optional callback
 *
 * @return {Color} Color
 */
Color.prototype.setRGB = function setRGB(r, g, b, transition, cb) {
    this.setR(r, transition);
    this.setG(g, transition);
    this.setB(b, transition, cb);
    return this;
};

/**
 * Returns R of RGB
 *
 * @method
 *
 * @returns {Number} R of Color
 */
Color.prototype.getR = function getR() {
    return this._r.get();
};

/**
 * Returns G of RGB
 *
 * @method
 *
 * @returns {Number} G of Color
 */
Color.prototype.getG = function getG() {
    return this._g.get();
};

/**
 * Returns B of RGB
 *
 * @method
 *
 * @returns {Number} B of Color
 */
Color.prototype.getB = function getB() {
    return this._b.get();
};

/**
 * Returns Opacity value
 *
 * @method
 *
 * @returns {Number} Opacity
 */
Color.prototype.getOpacity = function getOpacity() {
    return this._opacity.get();
};

/**
 * Returns RGB
 *
 * @method
 *
 * @returns {Array} RGB
 */
Color.prototype.getRGB = function getRGB() {
    return [this.getR(), this.getG(), this.getB()];
};

/**
 * Returns Normalized RGB
 *
 * @method
 *
 * @returns {Array} Normalized RGB
 */
Color.prototype.getNormalizedRGB = function getNormalizedRGB() {
    var r = this.getR() / 255.0;
    var g = this.getG() / 255.0;
    var b = this.getB() / 255.0;
    return [r, g, b];
};

/**
 * Returns Normalized RGBA
 *
 * @method
 *
 * @returns {Array} Normalized RGBA
 */
Color.prototype.getNormalizedRGBA = function getNormalizedRGB() {
    var r = this.getR() / 255.0;
    var g = this.getG() / 255.0;
    var b = this.getB() / 255.0;
    var opacity = this.getOpacity();
    return [r, g, b, opacity];
};

/**
 * Returns the current color in Hex
 *
 * @method
 *
 * @returns {String} Hex value
 */
Color.prototype.getHex = function getHex() {
    var r = Color.toHex(this.getR());
    var g = Color.toHex(this.getG());
    var b = Color.toHex(this.getB());
    return '#' + r + g + b;
};

/**
 * Sets color using Hex
 *
 * @method
 *
 * @param {String} hex Hex value
 * @param {Object} transition Optional transition parameters
 * @param {Function} cb Optional callback
 *
 * @return {Color} Color
 */
Color.prototype.setHex = function setHex(hex, transition, cb) {
    hex = (hex.charAt(0) === '#') ? hex.substring(1, hex.length) : hex;

    if (hex.length === 3) {
        var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, function(m, r, g, b) {
            return r + r + g + g + b + b;
        });
    }

    var r = parseInt(hex.substring(0, 2), 16);
    var g = parseInt(hex.substring(2, 4), 16);
    var b = parseInt(hex.substring(4, 6), 16);
    this.setRGB(r, g, b, transition, cb);
    return this;
};

/**
 * Converts a number to a hex value
 *
 * @method
 *
 * @param {Number} num Number
 *
 * @returns {String} Hex value
 */
Color.toHex = function toHex(num) {
    var hex = num.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
};

/**
 * Determines the given input with the appropriate configuration
 *
 * @method
 *
 * @param {Color|String|Array} type Color type
 *
 * @returns {String} Appropriate color type
 */
Color.determineType = function determineType(type) {
    if (Color.isColorInstance(type)) return 'instance';
    if (colorNames[type]) return 'colorName';
    if (Color.isHex(type)) return 'hex';
    if (Array.isArray(type)) return 'rgb';
};

/**
 * Returns a boolean checking whether input is a 'String'
 *
 * @method
 *
 * @param {String} val String value
 *
 * @returns {Boolean} Boolean
 */
Color.isString = function isString(val) {
    return (typeof val === 'string');
};

/**
 * Returns a boolean checking whether string input has a hash (#) symbol
 *
 * @method
 *
 * @param {String} val Value
 *
 * @returns {Boolean} Boolean
 */
Color.isHex = function isHex(val) {
    if (!Color.isString(val)) return false;
    return val[0] === '#';
};

/**
 * Returns boolean whether the input is a Color instance
 *
 * @method
 *
 * @param {Color} val Value
 *
 * @returns {Boolean} Boolean
 */
Color.isColorInstance = function isColorInstance(val) {
    return !!val.getColor;
};

/**
 * Common color names with their associated Hex values
 */
var colorNames = { aliceblue: '#f0f8ff', antiquewhite: '#faebd7', aqua: '#00ffff', aquamarine: '#7fffd4', azure: '#f0ffff', beige: '#f5f5dc', bisque: '#ffe4c4', black: '#000000', blanchedalmond: '#ffebcd', blue: '#0000ff', blueviolet: '#8a2be2', brown: '#a52a2a', burlywood: '#deb887', cadetblue: '#5f9ea0', chartreuse: '#7fff00', chocolate: '#d2691e', coral: '#ff7f50', cornflowerblue: '#6495ed', cornsilk: '#fff8dc', crimson: '#dc143c', cyan: '#00ffff', darkblue: '#00008b', darkcyan: '#008b8b', darkgoldenrod: '#b8860b', darkgray: '#a9a9a9', darkgreen: '#006400', darkgrey: '#a9a9a9', darkkhaki: '#bdb76b', darkmagenta: '#8b008b', darkolivegreen: '#556b2f', darkorange: '#ff8c00', darkorchid: '#9932cc', darkred: '#8b0000', darksalmon: '#e9967a', darkseagreen: '#8fbc8f', darkslateblue: '#483d8b', darkslategray: '#2f4f4f', darkslategrey: '#2f4f4f', darkturquoise: '#00ced1', darkviolet: '#9400d3', deeppink: '#ff1493', deepskyblue: '#00bfff', dimgray: '#696969', dimgrey: '#696969', dodgerblue: '#1e90ff', firebrick: '#b22222', floralwhite: '#fffaf0', forestgreen: '#228b22', fuchsia: '#ff00ff', gainsboro: '#dcdcdc', ghostwhite: '#f8f8ff', gold: '#ffd700', goldenrod: '#daa520', gray: '#808080', green: '#008000', greenyellow: '#adff2f', grey: '#808080', honeydew: '#f0fff0', hotpink: '#ff69b4', indianred: '#cd5c5c', indigo: '#4b0082', ivory: '#fffff0', khaki: '#f0e68c', lavender: '#e6e6fa', lavenderblush: '#fff0f5', lawngreen: '#7cfc00', lemonchiffon: '#fffacd', lightblue: '#add8e6', lightcoral: '#f08080', lightcyan: '#e0ffff', lightgoldenrodyellow: '#fafad2', lightgray: '#d3d3d3', lightgreen: '#90ee90', lightgrey: '#d3d3d3', lightpink: '#ffb6c1', lightsalmon: '#ffa07a', lightseagreen: '#20b2aa', lightskyblue: '#87cefa', lightslategray: '#778899', lightslategrey: '#778899', lightsteelblue: '#b0c4de', lightyellow: '#ffffe0', lime: '#00ff00', limegreen: '#32cd32', linen: '#faf0e6', magenta: '#ff00ff', maroon: '#800000', mediumaquamarine: '#66cdaa', mediumblue: '#0000cd', mediumorchid: '#ba55d3', mediumpurple: '#9370db', mediumseagreen: '#3cb371', mediumslateblue: '#7b68ee', mediumspringgreen: '#00fa9a', mediumturquoise: '#48d1cc', mediumvioletred: '#c71585', midnightblue: '#191970', mintcream: '#f5fffa', mistyrose: '#ffe4e1', moccasin: '#ffe4b5', navajowhite: '#ffdead', navy: '#000080', oldlace: '#fdf5e6', olive: '#808000', olivedrab: '#6b8e23', orange: '#ffa500', orangered: '#ff4500', orchid: '#da70d6', palegoldenrod: '#eee8aa', palegreen: '#98fb98', paleturquoise: '#afeeee', palevioletred: '#db7093', papayawhip: '#ffefd5', peachpuff: '#ffdab9', peru: '#cd853f', pink: '#ffc0cb', plum: '#dda0dd', powderblue: '#b0e0e6', purple: '#800080', rebeccapurple: '#663399', red: '#ff0000', rosybrown: '#bc8f8f', royalblue: '#4169e1', saddlebrown: '#8b4513', salmon: '#fa8072', sandybrown: '#f4a460', seagreen: '#2e8b57', seashell: '#fff5ee', sienna: '#a0522d', silver: '#c0c0c0', skyblue: '#87ceeb', slateblue: '#6a5acd', slategray: '#708090', slategrey: '#708090', snow: '#fffafa', springgreen: '#00ff7f', steelblue: '#4682b4', tan: '#d2b48c', teal: '#008080', thistle: '#d8bfd8', tomato: '#ff6347', turquoise: '#40e0d0', violet: '#ee82ee', wheat: '#f5deb3', white: '#ffffff', whitesmoke: '#f5f5f5', yellow: '#ffff00', yellowgreen: '#9acd32' };

module.exports = Color;

},{"../transitions/Transitionable":92}],96:[function(require,module,exports){
/**
 * The MIT License (MIT)
 * 
 * Copyright (c) 2015 Famous Industries Inc.
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
 
'use strict';

/**
 * Collection to map keyboard codes in plain english
 *
 * @class KeyCodes
 * @static
 */
module.exports = {
    0: 48,
    1: 49,
    2: 50,
    3: 51,
    4: 52,
    5: 53,
    6: 54,
    7: 55,
    8: 56,
    9: 57,
    a: 97,
    b: 98,
    c: 99,
    d: 100,
    e: 101,
    f: 102,
    g: 103,
    h: 104,
    i: 105,
    j: 106,
    k: 107,
    l: 108,
    m: 109,
    n: 110,
    o: 111,
    p: 112,
    q: 113,
    r: 114,
    s: 115,
    t: 116,
    u: 117,
    v: 118,
    w: 119,
    x: 120,
    y: 121,
    z: 122,
    A: 65,
    B: 66,
    C: 67,
    D: 68,
    E: 69,
    F: 70,
    G: 71,
    H: 72,
    I: 73,
    J: 74,
    K: 75,
    L: 76,
    M: 77,
    N: 78,
    O: 79,
    P: 80,
    Q: 81,
    R: 82,
    S: 83,
    T: 84,
    U: 85,
    V: 86,
    W: 87,
    X: 88,
    Y: 89,
    Z: 90,
    ENTER : 13,
    LEFT_ARROW: 37,
    RIGHT_ARROW: 39,
    UP_ARROW: 38,
    DOWN_ARROW: 40,
    SPACE: 32,
    SHIFT: 16,
    TAB: 9
};


},{}],97:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

/**
 * Singleton object to manage recycling of objects with typically short
 * lifespans, used to cut down on the amount of garbage collection required.
 *
 * @singleton
 */
var ObjectManager = {};


/**
 * Internal pool used for storing instances of the regsitered constructors.
 *
 * @type {Object}
 * @private
 */
ObjectManager.pools = {};

/**
 * Register request and free functions for the given type.
 *
 * @method register
 *
 * @param {String} type             Unique object "type" to identity pools of
 *                                  allocated objects.
 * @param {Function} Constructor    Zero-argument Constructor function used for
 *                                  allocating new objects.
 * @return {undefined} undefined
 */
ObjectManager.register = function(type, Constructor) {
    var pool = this.pools[type] = [];

    this['request' + type] = _request(pool, Constructor);
    this['free' + type] = _free(pool);
};

function _request(pool, Constructor) {
    return function request() {
        if (pool.length !== 0) return pool.pop();
        else return new Constructor();
    };
}

function _free(pool) {
    return function free(obj) {
        pool.push(obj);
    };
}

/**
 * Untrack all object of the given type. Used to allow allocated objects to be
 * garbage collected.
 *
 * @method disposeOf
 *
 * @param {String}  type    type as registered using
 *                          [register]{@link ObjectManager#register}.
 * @return {undefined} undefined
 */
ObjectManager.disposeOf = function(type) {
    var pool = this.pools[type];
    var i = pool.length;
    while (i--) pool.pop();
};

module.exports = ObjectManager;

},{}],98:[function(require,module,exports){
'use strict';

function Registry () {
    this._keyToValue = {};
    this._values = [];
    this._keys = [];
    this._keyToIndex = {};
    this._freedIndices = [];
}

Registry.prototype.register = function register (key, value) {
    var index = this._keyToIndex[key];
    if (index == null) {
        index = this._freedIndices.pop();
        if (index === undefined) index = this._values.length;

        this._values[index] = value;
        this._keys[index] = key;

        this._keyToIndex[key] = index;
        this._keyToValue[key] = value;
    }
    else {
        this._keyToValue[key] = value;
        this._values[index] = value;
    }
};

Registry.prototype.unregister = function unregister (key) {
    var index = this._keyToIndex[key];

    if (index != null) {
        this._freedIndices.push(index);
        this._keyToValue[key] = null;
        this._keyToIndex[key] = null;
        this._values[index] = null;
        this._keys[index] = null;
    }
};

Registry.prototype.get = function get (key) {
    return this._keyToValue[key];
};

Registry.prototype.getValues = function getValues () {
    return this._values;
};

Registry.prototype.getKeys = function getKeys () {
    return this._keys;
};

Registry.prototype.getKeyToValue = function getKeyToValue () {
    return this._keyToValue;
};

module.exports = Registry;

},{}],99:[function(require,module,exports){
/**
 * The MIT License (MIT)
 * 
 * Copyright (c) 2015 Famous Industries Inc.
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

/**
 * Returns a number guaranteed to be within the range [lower, upper].
 *
 * @method clamp
 * 
 * @param  {Number} value value to be processed by clamp
 * @param  {Number} lower lower bound  of the range
 * @param  {Number} upper upper bound of the range
 * @return {Number}       value between [lower, upper]
 */
function clamp(value, lower, upper) {
    return value < lower ? lower : value > upper ? upper : value;
}

module.exports = clamp;


},{}],100:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

/**
 * Deep clone an object.
 *
 * @method  clone
 *
 * @param {Object} b       Object to be cloned.
 * @return {Object} a      Cloned object (deep equality).
 */
var clone = function clone(b) {
    var a;
    if (typeof b === 'object') {
        a = (b instanceof Array) ? [] : {};
        for (var key in b) {
            if (typeof b[key] === 'object' && b[key] !== null) {
                if (b[key] instanceof Array) {
                    a[key] = new Array(b[key].length);
                    for (var i = 0; i < b[key].length; i++) {
                        a[key][i] = clone(b[key][i]);
                    }
                }
                else {
                  a[key] = clone(b[key]);
                }
            }
            else {
                a[key] = b[key];
            }
        }
    }
    else {
        a = b;
    }
    return a;
};

module.exports = clone;

},{}],101:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

module.exports = {
    CallbackStore: require('./CallbackStore'),
    clamp: require('./clamp'),
    clone: require('./clone'),
    Color: require('./Color'),
    KeyCodes: require('./KeyCodes'),
    keyValueToArrays: require('./keyValueToArrays'),
    loadURL: require('./loadURL'),
    ObjectManager: require('./ObjectManager'),
    Registry: require('./Registry'),
    strip: require('./strip'),
    vendorPrefix: require('./vendorPrefix')
};

},{"./CallbackStore":94,"./Color":95,"./KeyCodes":96,"./ObjectManager":97,"./Registry":98,"./clamp":99,"./clone":100,"./keyValueToArrays":102,"./loadURL":103,"./strip":104,"./vendorPrefix":105}],102:[function(require,module,exports){
'use strict';

/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

/**
 * Takes an object containing keys and values and returns an object
 * comprising two "associate" arrays, one with the keys and the other
 * with the values.
 *
 * @method keyValuesToArrays
 *
 * @param {Object} obj                      Objects where to extract keys and values
 *                                          from.
 * @return {Object}         result
 *         {Array.<String>} result.keys     Keys of `result`, as returned by
 *                                          `Object.keys()`
 *         {Array}          result.values   Values of passed in object.
 */
module.exports = function keyValuesToArrays(obj) {
    var keysArray = [], valuesArray = [];
    var i = 0;
    for(var key in obj) {
        if (obj.hasOwnProperty(key)) {
            keysArray[i] = key;
            valuesArray[i] = obj[key];
            i++;
        }
    }
    return {
        keys: keysArray,
        values: valuesArray
    };
};

},{}],103:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

/**
 * Load a URL and return its contents in a callback.
 *
 * @method loadURL
 * @memberof Utilities
 *
 * @param {String} url URL of object
 * @param {Function} callback callback to dispatch with content
 *
 * @return {undefined} undefined
 */
var loadURL = function loadURL(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function onreadystatechange() {
        if (this.readyState === 4) {
            if (callback) callback(this.responseText);
        }
    };
    xhr.open('GET', url);
    xhr.send();
};

module.exports = loadURL;

},{}],104:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

/**
 * Removes all non-primitive values from a (nested) object.
 *
 * Used for makeing arbitrary objects serializable through the structured
 * cloning algorithm used by `postMessage`.
 *
 * Supported primitives: `null`, `undefined`, `Boolean`, `Number`, `String`
 *
 * @method strip
 *
 * @param  {*} obj              A primitive or (non-)serializable object without
 *                              circular references.
 * @return {*} strippedObj      A primitive or (nested) object only containing
 *                              primitive types (serializable).
 */
function strip(obj) {
    switch (obj) {
        case null:
        case undefined:
            return obj;
    }
    switch (obj.constructor) {
        case Boolean:
        case Number:
        case String:
            return obj;
        case Object:
            for (var key in obj) {
                var stripped = strip(obj[key], true);
                obj[key] = stripped;
            }
            return obj;
        default:
            return null;
    }
}

module.exports = strip;

},{}],105:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

var PREFIXES = ['', '-ms-', '-webkit-', '-moz-', '-o-'];

/**
 * A helper function used for determining the vendor prefixed version of the
 * passed in CSS property.
 *
 * Vendor checks are being conducted in the following order:
 *
 * 1. (no prefix)
 * 2. `-mz-`
 * 3. `-webkit-`
 * 4. `-moz-`
 * 5. `-o-`
 *
 * @method vendorPrefix
 *
 * @param {String} property     CSS property (no camelCase), e.g.
 *                              `border-radius`.
 * @return {String} prefixed    Vendor prefixed version of passed in CSS
 *                              property (e.g. `-webkit-border-radius`).
 */
function vendorPrefix(property) {
    for (var i = 0; i < PREFIXES.length; i++) {
        var prefixed = PREFIXES[i] + property;
        if (document.documentElement.style[prefixed] === '') {
            return prefixed;
        }
    }
    return property;
}

module.exports = vendorPrefix;

},{}],106:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

var Geometry = require('./Geometry');

/**
 * DynamicGeometry is a component that defines and manages data
 * (vertex data and attributes) that is used to draw to WebGL.
 *
 * @class DynamicGeometry
 * @constructor
 *
 * @param {Object} options instantiation options
 * @return {undefined} undefined
 */
function DynamicGeometry(options) {
    Geometry.call(this, options);

    this.spec.dynamic = true;
}

/**
 * Returns the number of attribute values used to draw the DynamicGeometry.
 *
 * @class DynamicGeometry
 * @constructor
 *
 * @return {Object} flattened length of the vertex positions attribute in the geometry.
 */
DynamicGeometry.prototype.getLength = function getLength() {
    return this.getVertexPositions().length;
};

/**
 * Gets the buffer object based on buffer name. Throws error
 * if bufferName is not provided.
 *
 * @method
 *
 * @param  {String}  bufferName     name of vertexBuffer to be retrieved.
 * @return {Object}                 value of buffer with corresponding bufferName.
 */
DynamicGeometry.prototype.getVertexBuffer = function getVertexBuffer(bufferName) {
    if (! bufferName) throw 'getVertexBuffer requires a name';

    var idx = this.spec.bufferNames.indexOf(bufferName);

    if (~idx) return this.spec.bufferValues[idx];
    else      throw 'buffer does not exist';
};

/**
 * Sets a vertex buffer with given name to input value. Registers a new
 * buffer if one does not exist with given name.
 *
 * @method
 * @param  {String} bufferName  Name of vertexBuffer to be set.
 * @param  {Array}  value       Input data to fill target buffer.
 * @param  {Number} size        Vector size of input buffer data.
 * @return {Object}             current geometry.
 */
DynamicGeometry.prototype.setVertexBuffer = function setVertexBuffer(bufferName, value, size) {
    var idx = this.spec.bufferNames.indexOf(bufferName);

    if (idx === -1) {
        idx = this.spec.bufferNames.push(bufferName) - 1;
    }

    this.spec.bufferValues[idx] = value || [];
    this.spec.bufferSpacings[idx] = size || this.DEFAULT_BUFFER_SIZE;

    if (this.spec.invalidations.indexOf(idx) === -1) {
        this.spec.invalidations.push(idx);
    }

    return this;
};

/**
 * Copies and sets all buffers from another geometry instance.
 *
 * @method
 *
 * @param  {Object} geometry    Geometry instance to copy buffers from.
 * @return {Object}             current geometry.
 */
DynamicGeometry.prototype.fromGeometry = function fromGeometry(geometry) {
    var len = geometry.spec.bufferNames.length;
    for (var i = 0; i < len; i++) {
        this.setVertexBuffer(
            geometry.spec.bufferNames[i],
            geometry.spec.bufferValues[i],
            geometry.spec.bufferSpacings[i]
        );
    }
    return this;
};

/**
 * Set the positions of the vertices in this geometry.
 *
 * @method
 * @param  {Array}     value   New value for vertex position buffer
 * @return {Object}            current geometry.
 */
DynamicGeometry.prototype.setVertexPositions = function (value) {
    return this.setVertexBuffer('a_pos', value, 3);
};

/**
 * Set the normals on this geometry.
 *
 * @method
 * @param  {Array}     value   Value to set normal buffer to.
 * @return {Object}            current geometry.
 */
DynamicGeometry.prototype.setNormals = function (value) {
    return this.setVertexBuffer('a_normals', value, 3);
};

/**
 * Set the texture coordinates on this geometry.
 *
 * @method
 * @param  {Array}     value   New value for texture coordinates buffer.
 * @return {Object}            current geometry.
 */
DynamicGeometry.prototype.setTextureCoords = function (value) {
    return this.setVertexBuffer('a_texCoord', value, 2);
};

/**
 * Set the texture coordinates on this geometry.
 * @method
 * @param  {Array}     value   New value for index buffer
 * @return {Object}            current geometry.
 */
DynamicGeometry.prototype.setIndices = function (value) {
    return this.setVertexBuffer('indices', value, 1);
};

/**
 * Set the WebGL drawing primitive for this geometry.
 *
 * @method
 * @param  {String} value  New drawing primitive for geometry
 * @return {Object}        current geometry.
 */
DynamicGeometry.prototype.setDrawType = function (value) {
    this.spec.type = value.toUpperCase();
    return this;
};

/**
 * Returns the 'pos' vertex buffer of the geometry.
 *
 * @method
 * @return {Array} Vertex buffer.
 */
DynamicGeometry.prototype.getVertexPositions = function () {
    return this.getVertexBuffer('a_pos');
};

/**
 * Returns the 'normal' vertex buffer of the geometry.
 * @method
 * @return {Array} Vertex Buffer.
 */
DynamicGeometry.prototype.getNormals = function () {
    return this.getVertexBuffer('a_normals');
};

/**
 * Returns the 'textureCoord' vertex buffer of the geometry.
 * @method
 * @return {Array} Vertex Buffer.
 */
DynamicGeometry.prototype.getTextureCoords = function () {
    return this.getVertexBuffer('a_texCoord');
};

module.exports = DynamicGeometry;

},{"./Geometry":107}],107:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

var GeometryIds = 0;

/**
 * Geometry is a component that defines and manages data
 * (vertex data and attributes) that is used to draw to WebGL.
 *
 * @class Geometry
 * @constructor
 *
 * @param {Object} options instantiation options
 * @return {undefined} undefined
 */
function Geometry(options) {
    this.options = options || {};
    this.DEFAULT_BUFFER_SIZE = 3;

    this.spec = {
        id: GeometryIds++,
        dynamic: false,
        type: this.options.type || 'TRIANGLES',
        bufferNames: [],
        bufferValues: [],
        bufferSpacings: [],
        invalidations: []
    };

    if (this.options.buffers) {
        var len = this.options.buffers.length;
        for (var i = 0; i < len;) {
            this.spec.bufferNames.push(this.options.buffers[i].name);
            this.spec.bufferValues.push(this.options.buffers[i].data);
            this.spec.bufferSpacings.push(this.options.buffers[i].size || this.DEFAULT_BUFFER_SIZE);
            this.spec.invalidations.push(i++);
        }
    }
}

module.exports = Geometry;

},{}],108:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

var Vec3 = require('../math/Vec3');
var Vec2 = require('../math/Vec2');

var outputs = [
    new Vec3(),
    new Vec3(),
    new Vec3(),
    new Vec2(),
    new Vec2()
];

/**
 * A helper object used to calculate buffers for complicated geometries.
 * Tailored for the WebGLRenderer, used by most primitives.
 *
 * @static
 * @class GeometryHelper
 * @return {undefined} undefined
 */
var GeometryHelper = {};

/**
 * A function that iterates through vertical and horizontal slices
 * based on input detail, and generates vertices and indices for each
 * subdivision.
 *
 * @static
 * @method
 *
 * @param  {Number} detailX Amount of slices to iterate through.
 * @param  {Number} detailY Amount of stacks to iterate through.
 * @param  {Function} func Function used to generate vertex positions at each point.
 * @param  {Boolean} wrap Optional parameter (default: Pi) for setting a custom wrap range
 *
 * @return {Object} Object containing generated vertices and indices.
 */
GeometryHelper.generateParametric = function generateParametric(detailX, detailY, func, wrap) {
    var vertices = [];
    var i;
    var theta;
    var phi;
    var j;

    // We can wrap around slightly more than once for uv coordinates to look correct.

    var offset = (Math.PI / (detailX - 1));
    var Xrange = wrap ? Math.PI + offset : Math.PI;

    var out = [];

    for (i = 0; i < detailX + 1; i++) {
        theta = (i === 0 ? 0.0001 : i) * Math.PI / detailX;
        for (j = 0; j < detailY; j++) {
            phi = j * 2.0 * Xrange / detailY;
            func(theta, phi, out);
            vertices.push(out[0], out[1], out[2]);
        }
    }

    var indices = [],
        v = 0,
        next;
    for (i = 0; i < detailX; i++) {
        for (j = 0; j < detailY; j++) {
            next = (j + 1) % detailY;
            indices.push(v + j, v + j + detailY, v + next);
            indices.push(v + next, v + j + detailY, v + next + detailY);
        }
        v += detailY;
    }

    return {
        vertices: vertices,
        indices: indices
    };
};

/**
 * Calculates normals belonging to each face of a geometry.
 * Assumes clockwise declaration of vertices.
 *
 * @static
 * @method
 *
 * @param {Array} vertices Vertices of all points on the geometry.
 * @param {Array} indices Indices declaring faces of geometry.
 * @param {Array} out Array to be filled and returned.
 *
 * @return {Array} Calculated face normals.
 */
GeometryHelper.computeNormals = function computeNormals(vertices, indices, out) {
    var normals = out || [];
    var indexOne;
    var indexTwo;
    var indexThree;
    var normal;
    var j;
    var len = indices.length / 3;
    var i;
    var x;
    var y;
    var z;
    var length;

    for (i = 0; i < len; i++) {
        indexTwo = indices[i*3 + 0] * 3;
        indexOne = indices[i*3 + 1] * 3;
        indexThree = indices[i*3 + 2] * 3;

        outputs[0].set(vertices[indexOne], vertices[indexOne + 1], vertices[indexOne + 2]);
        outputs[1].set(vertices[indexTwo], vertices[indexTwo + 1], vertices[indexTwo + 2]);
        outputs[2].set(vertices[indexThree], vertices[indexThree + 1], vertices[indexThree + 2]);

        normal = outputs[2].subtract(outputs[0]).cross(outputs[1].subtract(outputs[0])).normalize();

        normals[indexOne + 0] = (normals[indexOne + 0] || 0) + normal.x;
        normals[indexOne + 1] = (normals[indexOne + 1] || 0) + normal.y;
        normals[indexOne + 2] = (normals[indexOne + 2] || 0) + normal.z;

        normals[indexTwo + 0] = (normals[indexTwo + 0] || 0) + normal.x;
        normals[indexTwo + 1] = (normals[indexTwo + 1] || 0) + normal.y;
        normals[indexTwo + 2] = (normals[indexTwo + 2] || 0) + normal.z;

        normals[indexThree + 0] = (normals[indexThree + 0] || 0) + normal.x;
        normals[indexThree + 1] = (normals[indexThree + 1] || 0) + normal.y;
        normals[indexThree + 2] = (normals[indexThree + 2] || 0) + normal.z;
    }

    for (i = 0; i < normals.length; i += 3) {
        x = normals[i];
        y = normals[i+1];
        z = normals[i+2];
        length = Math.sqrt(x * x + y * y + z * z);
        for(j = 0; j< 3; j++) {
            normals[i+j] /= length;
        }
    }

    return normals;
};

/**
 * Divides all inserted triangles into four sub-triangles. Alters the
 * passed in arrays.
 *
 * @static
 * @method
 *
 * @param {Array} indices Indices declaring faces of geometry
 * @param {Array} vertices Vertices of all points on the geometry
 * @param {Array} textureCoords Texture coordinates of all points on the geometry
 * @return {undefined} undefined
 */
GeometryHelper.subdivide = function subdivide(indices, vertices, textureCoords) {
    var triangleIndex = indices.length / 3;
    var face;
    var i;
    var j;
    var k;
    var pos;
    var tex;

    while (triangleIndex--) {
        face = indices.slice(triangleIndex * 3, triangleIndex * 3 + 3);

        pos = face.map(function(vertIndex) {
            return new Vec3(vertices[vertIndex * 3], vertices[vertIndex * 3 + 1], vertices[vertIndex * 3 + 2]);
        });
        vertices.push.apply(vertices, Vec3.scale(Vec3.add(pos[0], pos[1], outputs[0]), 0.5, outputs[1]).toArray());
        vertices.push.apply(vertices, Vec3.scale(Vec3.add(pos[1], pos[2], outputs[0]), 0.5, outputs[1]).toArray());
        vertices.push.apply(vertices, Vec3.scale(Vec3.add(pos[0], pos[2], outputs[0]), 0.5, outputs[1]).toArray());

        if (textureCoords) {
            tex = face.map(function(vertIndex) {
                return new Vec2(textureCoords[vertIndex * 2], textureCoords[vertIndex * 2 + 1]);
            });
            textureCoords.push.apply(textureCoords, Vec2.scale(Vec2.add(tex[0], tex[1], outputs[3]), 0.5, outputs[4]).toArray());
            textureCoords.push.apply(textureCoords, Vec2.scale(Vec2.add(tex[1], tex[2], outputs[3]), 0.5, outputs[4]).toArray());
            textureCoords.push.apply(textureCoords, Vec2.scale(Vec2.add(tex[0], tex[2], outputs[3]), 0.5, outputs[4]).toArray());
        }

        i = vertices.length - 3;
        j = i + 1;
        k = i + 2;

        indices.push(i, j, k);
        indices.push(face[0], i, k);
        indices.push(i, face[1], j);
        indices[triangleIndex] = k;
        indices[triangleIndex + 1] = j;
        indices[triangleIndex + 2] = face[2];
    }
};

/**
 * Creates duplicate of vertices that are shared between faces.
 * Alters the input vertex and index arrays.
 *
 * @static
 * @method
 *
 * @param {Array} vertices Vertices of all points on the geometry
 * @param {Array} indices Indices declaring faces of geometry
 * @return {undefined} undefined
 */
GeometryHelper.getUniqueFaces = function getUniqueFaces(vertices, indices) {
    var triangleIndex = indices.length / 3,
        registered = [],
        index;

    while (triangleIndex--) {
        for (var i = 0; i < 3; i++) {

            index = indices[triangleIndex * 3 + i];

            if (registered[index]) {
                vertices.push(vertices[index * 3], vertices[index * 3 + 1], vertices[index * 3 + 2]);
                indices[triangleIndex * 3 + i] = vertices.length / 3 - 1;
            }
            else {
                registered[index] = true;
            }
        }
    }
};

/**
 * Divides all inserted triangles into four sub-triangles while maintaining
 * a radius of one. Alters the passed in arrays.
 *
 * @static
 * @method
 *
 * @param {Array} vertices Vertices of all points on the geometry
 * @param {Array} indices Indices declaring faces of geometry
 * @return {undefined} undefined
 */
GeometryHelper.subdivideSpheroid = function subdivideSpheroid(vertices, indices) {
    var triangleIndex = indices.length / 3,
        abc,
        face,
        i, j, k;

    while (triangleIndex--) {
        face = indices.slice(triangleIndex * 3, triangleIndex * 3 + 3);
        abc = face.map(function(vertIndex) {
            return new Vec3(vertices[vertIndex * 3], vertices[vertIndex * 3 + 1], vertices[vertIndex * 3 + 2]);
        });

        vertices.push.apply(vertices, Vec3.normalize(Vec3.add(abc[0], abc[1], outputs[0]), outputs[1]).toArray());
        vertices.push.apply(vertices, Vec3.normalize(Vec3.add(abc[1], abc[2], outputs[0]), outputs[1]).toArray());
        vertices.push.apply(vertices, Vec3.normalize(Vec3.add(abc[0], abc[2], outputs[0]), outputs[1]).toArray());

        i = vertices.length / 3 - 3;
        j = i + 1;
        k = i + 2;

        indices.push(i, j, k);
        indices.push(face[0], i, k);
        indices.push(i, face[1], j);
        indices[triangleIndex * 3] = k;
        indices[triangleIndex * 3 + 1] = j;
        indices[triangleIndex * 3 + 2] = face[2];
    }
};

/**
 * Divides all inserted triangles into four sub-triangles while maintaining
 * a radius of one. Alters the passed in arrays.
 *
 * @static
 * @method
 *
 * @param {Array} vertices Vertices of all points on the geometry
 * @param {Array} out Optional array to be filled with resulting normals.
 *
 * @return {Array} New list of calculated normals.
 */
GeometryHelper.getSpheroidNormals = function getSpheroidNormals(vertices, out) {
    out = out || [];
    var length = vertices.length / 3;
    var normalized;

    for (var i = 0; i < length; i++) {
        normalized = new Vec3(
            vertices[i * 3 + 0],
            vertices[i * 3 + 1],
            vertices[i * 3 + 2]
        ).normalize().toArray();

        out[i * 3 + 0] = normalized[0];
        out[i * 3 + 1] = normalized[1];
        out[i * 3 + 2] = normalized[2];
    }

    return out;
};

/**
 * Calculates texture coordinates for spheroid primitives based on
 * input vertices.
 *
 * @static
 * @method
 *
 * @param {Array} vertices Vertices of all points on the geometry
 * @param {Array} out Optional array to be filled with resulting texture coordinates.
 *
 * @return {Array} New list of calculated texture coordinates
 */
GeometryHelper.getSpheroidUV = function getSpheroidUV(vertices, out) {
    out = out || [];
    var length = vertices.length / 3;
    var vertex;

    var uv = [];

    for(var i = 0; i < length; i++) {
        vertex = outputs[0].set(
            vertices[i * 3],
            vertices[i * 3 + 1],
            vertices[i * 3 + 2]
        )
        .normalize()
        .toArray();

        var azimuth = this.getAzimuth(vertex);
        var altitude = this.getAltitude(vertex);

        uv[0] = azimuth * 0.5 / Math.PI + 0.5;
        uv[1] = altitude / Math.PI + 0.5;

        out.push.apply(out, uv);
    }

    return out;
};

/**
 * Iterates through and normalizes a list of vertices.
 *
 * @static
 * @method
 *
 * @param {Array} vertices Vertices of all points on the geometry
 * @param {Array} out Optional array to be filled with resulting normalized vectors.
 *
 * @return {Array} New list of normalized vertices
 */
GeometryHelper.normalizeAll = function normalizeAll(vertices, out) {
    out = out || [];
    var len = vertices.length / 3;

    for (var i = 0; i < len; i++) {
        Array.prototype.push.apply(out, new Vec3(vertices[i * 3], vertices[i * 3 + 1], vertices[i * 3 + 2]).normalize().toArray());
    }

    return out;
};

/**
 * Normalizes a set of vertices to model space.
 *
 * @static
 * @method
 *
 * @param {Array} vertices Vertices of all points on the geometry
 * @param {Array} out Optional array to be filled with model space position vectors.
 *
 * @return {Array} Output vertices.
 */
GeometryHelper.normalizeVertices = function normalizeVertices(vertices, out) {
    out = out || [];
    var len = vertices.length / 3;
    var vectors = [];
    var minX;
    var maxX;
    var minY;
    var maxY;
    var minZ;
    var maxZ;
    var v;
    var i;

    for (i = 0; i < len; i++) {
        v = vectors[i] = new Vec3(
            vertices[i * 3],
            vertices[i * 3 + 1],
            vertices[i * 3 + 2]
        );

        if (minX == null || v.x < minX) minX = v.x;
        if (maxX == null || v.x > maxX) maxX = v.x;

        if (minY == null || v.y < minY) minY = v.y;
        if (maxY == null || v.y > maxY) maxY = v.y;

        if (minZ == null || v.z < minZ) minZ = v.z;
        if (maxZ == null || v.z > maxZ) maxZ = v.z;
    }

    var translation = new Vec3(
        getTranslationFactor(maxX, minX),
        getTranslationFactor(maxY, minY),
        getTranslationFactor(maxZ, minZ)
    );

    var scale = Math.min(
        getScaleFactor(maxX + translation.x, minX + translation.x),
        getScaleFactor(maxY + translation.y, minY + translation.y),
        getScaleFactor(maxZ + translation.z, minZ + translation.z)
    );

    for (i = 0; i < vectors.length; i++) {
        out.push.apply(out, vectors[i].add(translation).scale(scale).toArray());
    }

    return out;
};

/**
 * Determines translation amount for a given axis to normalize model coordinates.
 *
 * @method
 * @private
 *
 * @param {Number} max Maximum position value of given axis on the model.
 * @param {Number} min Minimum position value of given axis on the model.
 *
 * @return {Number} Number by which the given axis should be translated for all vertices.
 */
function getTranslationFactor(max, min) {
    return -(min + (max - min) / 2);
}

/**
 * Determines scale amount for a given axis to normalize model coordinates.
 *
 * @method
 * @private
 *
 * @param {Number} max Maximum scale value of given axis on the model.
 * @param {Number} min Minimum scale value of given axis on the model.
 *
 * @return {Number} Number by which the given axis should be scaled for all vertices.
 */
function getScaleFactor(max, min) {
    return 1 / ((max - min) / 2);
}

/**
 * Finds the azimuth, or angle above the XY plane, of a given vector.
 *
 * @static
 * @method
 *
 * @param {Array} v Vertex to retreive azimuth from.
 *
 * @return {Number} Azimuth value in radians.
 */
GeometryHelper.getAzimuth = function azimuth(v) {
    return Math.atan2(v[2], -v[0]);
};

/**
 * Finds the altitude, or angle above the XZ plane, of a given vector.
 *
 * @static
 * @method
 *
 * @param {Array} v Vertex to retreive altitude from.
 *
 * @return {Number} Altitude value in radians.
 */
GeometryHelper.getAltitude = function altitude(v) {
    return Math.atan2(-v[1], Math.sqrt((v[0] * v[0]) + (v[2] * v[2])));
};

/**
 * Converts a list of indices from 'triangle' to 'line' format.
 *
 * @static
 * @method
 *
 * @param {Array} indices Indices of all faces on the geometry
 * @param {Array} out Indices of all faces on the geometry
 *
 * @return {Array} New list of line-formatted indices
 */
GeometryHelper.trianglesToLines = function triangleToLines(indices, out) {
    var numVectors = indices.length / 3;
    out = out || [];
    var i;

    for (i = 0; i < numVectors; i++) {
        out.push(indices[i * 3 + 0], indices[i * 3 + 1]);
        out.push(indices[i * 3 + 1], indices[i * 3 + 2]);
        out.push(indices[i * 3 + 2], indices[i * 3 + 0]);
    }

    return out;
};

/**
 * Adds a reverse order triangle for every triangle in the mesh. Adds extra vertices
 * and indices to input arrays.
 *
 * @static
 * @method
 *
 * @param {Array} vertices X, Y, Z positions of all vertices in the geometry
 * @param {Array} indices Indices of all faces on the geometry
 * @return {undefined} undefined
 */
GeometryHelper.addBackfaceTriangles = function addBackfaceTriangles(vertices, indices) {
    var nFaces = indices.length / 3;

    var maxIndex = 0;
    var i = indices.length;
    while (i--) if (indices[i] > maxIndex) maxIndex = indices[i];

    maxIndex++;

    for (i = 0; i < nFaces; i++) {
        var indexOne = indices[i * 3],
            indexTwo = indices[i * 3 + 1],
            indexThree = indices[i * 3 + 2];

        indices.push(indexOne + maxIndex, indexThree + maxIndex, indexTwo + maxIndex);
    }

    // Iterating instead of .slice() here to avoid max call stack issue.

    var nVerts = vertices.length;
    for (i = 0; i < nVerts; i++) {
        vertices.push(vertices[i]);
    }
};

module.exports = GeometryHelper;

},{"../math/Vec2":49,"../math/Vec3":50}],109:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

var loadURL        = require('../utilities/loadURL');
var GeometryHelper = require('./GeometryHelper');

/*
 * A singleton object that takes that makes requests
 * for OBJ files and returns the formatted data as
 * an argument to a callback function.
 *
 * @static
 * @class OBJLoader
 * @return {undefined} undefined
 */
var OBJLoader = {
    cached: {},
    requests: {},
    formatText: format
};

/*
 * Takes a path to desired obj file and makes an XMLHttp request
 * if the resource is not cached. Sets up the 'onresponse' function
 * as a callback for formatting and callback invocation.
 *
 * @method
 *
 * @param {String}      url     URL of desired obj
 * @param {Function}    cb      Function to be fired upon successful formatting of obj
 * @param {Object}      options Options hash to that can affect the output of the OBJ
 *                              vertices.
 * @return {undefined} undefined
 */
OBJLoader.load = function load(url, cb, options) {
    if (!this.cached[url]) {
        if (!this.requests[url]) {
            this.requests[url] = [cb];
            loadURL(
                url,
                this._onsuccess.bind(
                    this,
                    url,
                    options
                )
            );
        }
        else {
            this.requests[url].push(cb);
        }
    }
    else {
        cb(this.cached[url]);
    }
};

/*
 * Fired on response from server for OBJ asset. Formats the
 * returned string and stores the buffer data in cache.
 * Invokes all queued callbacks before clearing them.
 *
 * @method
 * @private
 *
 * @param {String}  URL of requested obj
 * @param {Object}  Options for formatting the OBJ
 * @param {String}  Content of the server response
 * @return {undefined} undefined
 */
OBJLoader._onsuccess = function _onsuccess(url, options, text) {
    var buffers = format.call(this, text, options || {});
    this.cached[url] = buffers;

    for (var i = 0; i < this.requests[url].length; i++) {
        this.requests[url][i](buffers);
    }

    this.requests[url] = null;
};

/*
 * Takes raw string format of obj and converts it to a javascript
 * object representing the buffers needed to draw the geometry.
 *
 * @method
 * @private
 *
 * @param {String}  raw obj data in text format
 * @param {Object}  Options for formatting the OBJ
 *
 * @return {Object} vertex buffer data
 */
function format(text, options) {
    text = sanitize(text);

    var lines = text.split('\n');

    var geometries = [];
    options = options || {};

    var faceTexCoords = [];
    var faceVertices = [];
    var faceNormals = [];

    var normals = [];
    var texCoords = [];
    var vertices = [];

    var i1, i2, i3, i4;
    var split;
    var line;

    var length = lines.length;

    for (var i = 0; i < length; i++) {
        line = lines[i];
        split = lines[i].trim().split(' ');

        // Handle vertex positions

        if (line.indexOf('v ') !== -1) {
            vertices.push([
                parseFloat(split[1]),
                parseFloat(split[2]),
                parseFloat(split[3])
            ]);
        }

        // Handle texture coordinates

        else if(line.indexOf('vt ') !== -1) {
            texCoords.push([
                parseFloat(split[1]),
                parseFloat(split[2])
            ]);
        }

        // Handle vertex normals

        else if (line.indexOf('vn ') !== -1) {
            normals.push([
                parseFloat(split[1]),
                parseFloat(split[2]),
                parseFloat(split[3])
            ]);
        }

        // Handle face

        else if (line.indexOf('f ') !== -1) {

            // Vertex, Normal

            if (split[1].indexOf('//') !== -1) {
                i1 = split[1].split('//');
                i2 = split[2].split('//');
                i3 = split[3].split('//');

                faceVertices.push([
                    parseFloat(i1[0]) - 1,
                    parseFloat(i2[0]) - 1,
                    parseFloat(i3[0]) - 1
                ]);
                faceNormals.push([
                    parseFloat(i1[1]) - 1,
                    parseFloat(i2[1]) - 1,
                    parseFloat(i3[1]) - 1
                ]);

                // Handle quad

                if (split[4]) {
                    i4 = split[4].split('//');
                    faceVertices.push([
                        parseFloat(i1[0]) - 1,
                        parseFloat(i3[0]) - 1,
                        parseFloat(i4[0]) - 1
                    ]);
                    faceNormals.push([
                        parseFloat(i1[2]) - 1,
                        parseFloat(i3[2]) - 1,
                        parseFloat(i4[2]) - 1
                    ]);
                }
            }

            // Vertex, TexCoord, Normal

            else if (split[1].indexOf('/') !== -1) {
                i1 = split[1].split('/');
                i2 = split[2].split('/');
                i3 = split[3].split('/');

                faceVertices.push([
                    parseFloat(i1[0]) - 1,
                    parseFloat(i2[0]) - 1,
                    parseFloat(i3[0]) - 1
                ]);
                faceTexCoords.push([
                    parseFloat(i1[1]) - 1,
                    parseFloat(i2[1]) - 1,
                    parseFloat(i3[1]) - 1
                ]);
                faceNormals.push([
                    parseFloat(i1[2]) - 1,
                    parseFloat(i2[2]) - 1,
                    parseFloat(i3[2]) - 1
                ]);

                // Handle Quad

                if (split[4]) {
                    i4 = split[4].split('/');

                    faceVertices.push([
                        parseFloat(i1[0]) - 1,
                        parseFloat(i3[0]) - 1,
                        parseFloat(i4[0]) - 1
                    ]);
                    faceTexCoords.push([
                        parseFloat(i1[1]) - 1,
                        parseFloat(i3[1]) - 1,
                        parseFloat(i4[1]) - 1
                    ]);
                    faceNormals.push([
                        parseFloat(i1[2]) - 1,
                        parseFloat(i3[2]) - 1,
                        parseFloat(i4[2]) - 1
                    ]);
                }
            }

            // Vertex

            else {
                faceVertices.push([
                    parseFloat(split[1]) - 1,
                    parseFloat(split[2]) - 1,
                    parseFloat(split[3]) - 1
                ]);
                faceTexCoords.push([
                    parseFloat(split[1]) - 1,
                    parseFloat(split[2]) - 1,
                    parseFloat(split[3]) - 1
                ]);
                faceNormals.push([
                    parseFloat(split[1]) - 1,
                    parseFloat(split[2]) - 1,
                    parseFloat(split[3]) - 1
                ]);

                // Handle Quad

                if (split[4]) {
                    faceVertices.push([
                        parseFloat(split[1]) - 1,
                        parseFloat(split[3]) - 1,
                        parseFloat(split[4]) - 1
                    ]);
                    faceTexCoords.push([
                        parseFloat(split[1]) - 1,
                        parseFloat(split[3]) - 1,
                        parseFloat(split[4]) - 1
                    ]);
                    faceNormals.push([
                        parseFloat(split[1]) - 1,
                        parseFloat(split[3]) - 1,
                        parseFloat(split[4]) - 1
                    ]);
                }
            }
        }

        else if (line.indexOf('g ') !== -1) {
            if (faceVertices.length) {
                geometries.push(
                    packageGeometry(
                        vertices,
                        normals,
                        texCoords,
                        faceVertices,
                        faceNormals,
                        faceTexCoords,
                        options
                    )
                );
            }

            faceVertices.length = 0;
            faceTexCoords.length = 0;
            faceNormals.length = 0;
        }
    }

    geometries.push(
        packageGeometry(
            vertices,
            normals,
            texCoords,
            faceVertices,
            faceNormals,
            faceTexCoords,
            options
        )
    );

    return geometries;
}

/*
 * Replaces all double spaces with single spaces and removes
 * all trailing spaces from lines of a given string.
 *
 * @method
 * @private
 *
 * @param {Array} v Pool of all vertices for OBJ.
 * @param {Array} n Pool of all normals for OBJ.
 * @param {Array} t Pool of all texture coordinates for OBJ.
 * @param {Array} fv Vertices for each face of the geometry.
 * @param {Array} fn Normals for each face of the geometry.
 * @param {Array} ft Texture coordinates for each face of the geometry.
 * @param {Object} options Optional paramters that affect face attributes.
 *
 * @return {Object} geometry buffers
 */
function packageGeometry(v, n, t, fv, fn, ft, options) {
    var cached = cacheVertices(
        v,
        n,
        t,
        fv,
        fn,
        ft
    );

    cached.vertices = flatten(cached.vertices);
    cached.normals = flatten(cached.normals);
    cached.texCoords = flatten(cached.texCoords);
    cached.indices = flatten(cached.indices);

    if (options.normalize) {
        cached.vertices = GeometryHelper.normalizeVertices(
            cached.vertices
        );
    }

    if (options.computeNormals) {
        cached.normals = GeometryHelper.computeNormals(
            cached.vertices,
            cached.indices
        );
    }

    return {
        vertices: cached.vertices,
        normals: cached.normals,
        textureCoords: cached.texCoords,
        indices: cached.indices
    };
}

/*
 * Replaces all double spaces with single spaces and removes
 * all trailing spaces from lines of a given string.
 *
 * @method
 * @private
 *
 * @param {String} text String to be sanitized.
 *
 * @return {String}     Sanitized string.
 */
function sanitize(text) {
    return text.replace(/ +(?= )/g,'').replace(/\s+$/g, '');
}

/*
 * Takes a given pool of attributes and face definitions
 * and removes all duplicate vertices.
 *
 * @method
 * @private
 *
 * @param {Array} v     Pool of vertices used in face declarations.
 * @param {Array} n     Pool of normals used in face declarations.
 * @param {Array} t     Pool of textureCoords used in face declarations.
 * @param {Array} fv    Vertex positions at each face in the OBJ.
 * @param {Array} fn    Normals at each face in the OBJ.
 * @param {Array} ft    Texture coordinates at each face in the OBJ.
 *
 * @return {Object}     Object containing the vertices, textureCoordinates and
 *                      normals of the OBJ.
 */
function cacheVertices(v, n, t, fv, fn, ft) {
    var outNormals = [];
    var outPos = [];
    var outTexCoord = [];
    var outIndices = [];

    var vertexCache = {};

    var positionIndex;
    var normalIndex;
    var texCoordIndex;

    var currentIndex = 0;
    var fvLength = fv.length;
    var fnLength = fn.length;
    var ftLength = ft.length;
    var faceLength;
    var index;

    for (var i = 0; i < fvLength; i++) {
        outIndices[i] = [];
        faceLength = fv[i].length;

        for (var j = 0; j < faceLength; j++) {
            if (ftLength) texCoordIndex = ft[i][j];
            if (fnLength) normalIndex   = fn[i][j];
                          positionIndex = fv[i][j];

            index = vertexCache[positionIndex + ',' + normalIndex + ',' + texCoordIndex];

            if(index === undefined) {
                index = currentIndex++;

                              outPos.push(v[positionIndex]);
                if (fnLength) outNormals.push(n[normalIndex]);
                if (ftLength) outTexCoord.push(t[texCoordIndex]);

                vertexCache[positionIndex + ',' + normalIndex + ',' + texCoordIndex] = index;
            }

            outIndices[i].push(index);
        }
    }

    return {
        vertices: outPos,
        normals: outNormals,
        texCoords: outTexCoord,
        indices: outIndices
    };
}

/*
 * Flattens an array of arrays. Not recursive. Assumes
 * all children are arrays.
 *
 * @method
 * @private
 *
 * @param {Array} arr Input array to be flattened.
 *
 * @return {Array} Flattened version of input array.
 */
function flatten(arr) {
    var len = arr.length;
    var out = [];

    for (var i = 0; i < len; i++) {
        out.push.apply(out, arr[i]);
    }

    return out;
}

module.exports = OBJLoader;

},{"../utilities/loadURL":103,"./GeometryHelper":108}],110:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

module.exports = {
    Box: require('./primitives/Box'),
    Circle: require('./primitives/Circle'),
    Cylinder: require('./primitives/Cylinder'),
    GeodesicSphere: require('./primitives/GeodesicSphere'),
    Icosahedron: require('./primitives/Icosahedron'),
    ParametricCone: require('./primitives/ParametricCone'),
    Plane: require('./primitives/Plane'),
    Sphere: require('./primitives/Sphere'),
    Tetrahedron: require('./primitives/Tetrahedron'),
    Torus: require('./primitives/Torus'),
    Triangle: require('./primitives/Triangle'),
    GeometryHelper: require('./GeometryHelper'),
    DynamicGeometry: require('./DynamicGeometry'),
    Geometry: require('./Geometry'),
    OBJLoader: require('./OBJLoader')
};

},{"./DynamicGeometry":106,"./Geometry":107,"./GeometryHelper":108,"./OBJLoader":109,"./primitives/Box":111,"./primitives/Circle":112,"./primitives/Cylinder":113,"./primitives/GeodesicSphere":114,"./primitives/Icosahedron":115,"./primitives/ParametricCone":116,"./primitives/Plane":117,"./primitives/Sphere":118,"./primitives/Tetrahedron":119,"./primitives/Torus":120,"./primitives/Triangle":121}],111:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

var Geometry = require('../Geometry');

function pickOctant(i) {
    return [(i & 1) * 2 - 1, (i & 2) - 1, (i & 4) / 2 - 1];
}

var boxData = [
    [0, 4, 2, 6, -1, 0, 0],
    [1, 3, 5, 7, +1, 0, 0],
    [0, 1, 4, 5, 0, -1, 0],
    [2, 6, 3, 7, 0, +1, 0],
    [0, 2, 1, 3, 0, 0, -1],
    [4, 5, 6, 7, 0, 0, +1]
];

/**
 * This function returns a new static geometry, which is passed
 * custom buffer data.
 *
 * @class BoxGeometry
 * @constructor
 *
 * @param {Object}  options Parameters that alter the
 * vertex buffers of the generated geometry.
 *
 * @return {Object} constructed geometry
 */
function BoxGeometry(options) {
    options = options || {};

    var vertices      = [];
    var textureCoords = [];
    var normals       = [];
    var indices       = [];

    var data;
    var d;
    var v;
    var i;
    var j;

    for (i = 0; i < boxData.length; i++) {
        data = boxData[i];
        v = i * 4;
        for (j = 0; j < 4; j++) {
            d = data[j];
            var octant = pickOctant(d);
            vertices.push(octant[0], octant[1], octant[2]);
            textureCoords.push(j & 1, (j & 2) / 2);
            normals.push(data[4], data[5], data[6]);
        }
        indices.push(v, v + 1, v + 2);
        indices.push(v + 2, v + 1, v + 3);

    }

    options.buffers = [
        { name: 'a_pos', data: vertices },
        { name: 'a_texCoord', data: textureCoords, size: 2 },
        { name: 'a_normals', data: normals },
        { name: 'indices', data: indices, size: 1 }
    ];

    return new Geometry(options);
}

module.exports = BoxGeometry;

},{"../Geometry":107}],112:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

var Geometry = require('../Geometry');
var GeometryHelper = require('../GeometryHelper');

/**
 * This function returns a new static geometry, which is passed
 * custom buffer data.
 *
 * @class Circle
 * @constructor
 *
 * @param {Object} options Parameters that alter the
 * vertex buffers of the generated geometry.
 *
 * @return {Object} constructed geometry
 */
function Circle (options) {
    options  = options || {};
    var detail   = options.detail || 30;
    var buffers  = getCircleBuffers(detail, true);

    if (options.backface !== false) {
        GeometryHelper.addBackfaceTriangles(buffers.vertices, buffers.indices);
    }

    var textureCoords = getCircleTexCoords(buffers.vertices);
    var normals = GeometryHelper.computeNormals(buffers.vertices, buffers.indices);

    options.buffers = [
        { name: 'a_pos', data: buffers.vertices },
        { name: 'a_texCoord', data: textureCoords, size: 2 },
        { name: 'a_normals', data: normals },
        { name: 'indices', data: buffers.indices, size: 1 }
    ];

    return new Geometry(options);
}

function getCircleTexCoords (vertices) {
    var textureCoords = [];
    var nFaces = vertices.length / 3;

    for (var i = 0; i < nFaces; i++) {
        var x = vertices[i * 3],
            y = vertices[i * 3 + 1];

        textureCoords.push(0.5 + x * 0.5, 0.5 + -y * 0.5);
    }

    return textureCoords;
}

/**
 * Calculates and returns all vertex positions, texture
 * coordinates and normals of the circle primitive.
 *
 * @method
 *
 * @param {Number} detail Amount of detail that determines how many
 * vertices are created and where they are placed
 *
 * @return {Object} constructed geometry
 */
function getCircleBuffers(detail) {
    var vertices = [0, 0, 0];
    var indices = [];
    var counter = 1;
    var theta;
    var x;
    var y;

    for (var i = 0; i < detail + 1; i++) {
        theta = i / detail * Math.PI * 2;

        x = Math.cos(theta);
        y = Math.sin(theta);

        vertices.push(x, y, 0);

        if (i > 0) indices.push(0, counter, ++counter);
    }

    return {
        vertices: vertices,
        indices: indices
    };
}

module.exports = Circle;

},{"../Geometry":107,"../GeometryHelper":108}],113:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

var Geometry = require('../Geometry');
var GeometryHelper = require('../GeometryHelper');

/**
 * This class creates a new geometry instance and sets
 * its vertex positions, texture coordinates, normals,
 * and indices to based on the primitive.
 *
 * @class Cylinder
 * @constructor
 *
 * @param {Object} options Parameters that alter thed
 * vertex buffers of the generated geometry.
 *
 * @return {Object} constructed geometry
 */
function Cylinder (options) {
    options  = options || {};
    var radius   = options.radius || 1;
    var detail   = options.detail || 15;
    var buffers;

    buffers = GeometryHelper.generateParametric(
        detail,
        detail,
        Cylinder.generator.bind(null, radius)
    );

    if (options.backface !== false) {
        GeometryHelper.addBackfaceTriangles(buffers.vertices, buffers.indices);
    }

    options.buffers = [
        { name: 'a_pos', data: buffers.vertices },
        { name: 'a_texCoord', data: GeometryHelper.getSpheroidUV(buffers.vertices), size: 2 },
        { name: 'a_normals', data: GeometryHelper.computeNormals(buffers.vertices, buffers.indices) },
        { name: 'indices', data: buffers.indices, size: 1 }
    ];

    return new Geometry(options);
}

/**
 * Function used in iterative construction of parametric primitive.
 *
 * @static
 * @method
 * @param {Number} r Cylinder radius.
 * @param {Number} u Longitudal progress from 0 to PI.
 * @param {Number} v Latitudal progress from 0 to PI.
 * @param {Array} pos X, Y, Z position of vertex at given slice and stack.
 *
 * @return {undefined} undefined
 */
Cylinder.generator = function generator(r, u, v, pos) {
    pos[1] = r * Math.sin(v);
    pos[0] = r * Math.cos(v);
    pos[2] = r * (-1 + u / Math.PI * 2);
};

module.exports = Cylinder;

},{"../Geometry":107,"../GeometryHelper":108}],114:[function(require,module,exports){
/**
 * The MIT License (MIT)
 * 
 * Copyright (c) 2015 Famous Industries Inc.
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

var Geometry = require('../Geometry');
var GeometryHelper = require('../GeometryHelper');

/**
 * This function returns a new static geometry, which is passed
 * custom buffer data.
 *
 * @class GeodesicSphere
 * @constructor
 *
 * @param {Object} options Parameters that alter the
 * vertex buffers of the generated geometry.
 * 
 * @return {Object} constructed geometry
 */
function GeodesicSphere (options) {
    var t = (1 + Math.sqrt(5)) * 0.5;

    var vertices = [
        - 1,  t,  0,    1,  t,  0,   - 1, - t,  0,    1, - t,  0,
         0, - 1, -t,    0,  1, -t,    0, - 1,   t,    0,  1,   t,
         t,  0,   1,    t,  0, -1,   - t,  0,   1,   - t,  0, -1
    ];
    var indices = [
        0,  5, 11,    0,  1,  5,    0,  7,  1,    0, 10,  7,    0, 11, 10,
        1,  9,  5,    5,  4, 11,    11, 2, 10,   10,  6,  7,    7,  8,  1,
        3,  4,  9,    3,  2,  4,    3,  6,  2,    3,  8,  6,    3,  9,  8,
        4,  5,  9,    2, 11,  4,    6, 10,  2,    8,  7,  6,    9,  1,  8
    ];

    vertices = GeometryHelper.normalizeAll(vertices);

    options = options || {};
    var detail  = options.detail || 3;

    while(--detail) GeometryHelper.subdivideSpheroid(vertices, indices);
    GeometryHelper.getUniqueFaces(vertices, indices);

    var normals       = GeometryHelper.computeNormals(vertices, indices);
    var textureCoords = GeometryHelper.getSpheroidUV(vertices);

    options.buffers = [
        { name: 'a_pos', data: vertices },
        { name: 'a_texCoord', data: textureCoords, size: 2 },
        { name: 'a_normals', data: normals },
        { name: 'indices', data: indices, size: 1 }
    ];

    return new Geometry(options);
}

module.exports = GeodesicSphere;

},{"../Geometry":107,"../GeometryHelper":108}],115:[function(require,module,exports){
/**
 * The MIT License (MIT)
 * 
 * Copyright (c) 2015 Famous Industries Inc.
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

var Geometry = require('../Geometry');
var GeometryHelper = require('../GeometryHelper');

/**
 * This function returns a new static geometry, which is passed
 * custom buffer data.
 *
 * @class Icosahedron
 * @constructor
 *
 * @param {Object} options Parameters that alter the
 * vertex buffers of the generated geometry.
 * 
 * @return {Object} constructed geometry
 */
function Icosahedron( options )
{
   options = options || {};
    var t = ( 1 + Math.sqrt( 5 ) ) / 2;

    var vertices = [
        - 1,   t,  0,    1,  t,  0,   - 1, - t,  0,    1, - t,  0,
          0, - 1, -t,    0,  1, -t,     0, - 1,  t,    0,   1,  t,
          t,   0,  1,    t,  0, -1,   - t,   0,  1,  - t,   0, -1
    ];
    var indices = [
        0,  5, 11,    0,  1,  5,    0,  7,  1,    0, 10,  7,    0, 11, 10,
        1,  9,  5,    5,  4, 11,    11, 2, 10,   10,  6,  7,    7,  8,  1,
        3,  4,  9,    3,  2,  4,    3,  6,  2,    3,  8,  6,    3,  9,  8,
        4,  5,  9,    2, 11,  4,    6, 10,  2,    8,  7,  6,    9,  1,  8
    ];

    GeometryHelper.getUniqueFaces(vertices, indices);

    var normals       = GeometryHelper.computeNormals(vertices, indices);
    var textureCoords = GeometryHelper.getSpheroidUV(vertices);

    vertices      = GeometryHelper.normalizeAll(vertices);

    options.buffers = [
        { name: 'a_pos', data: vertices },
        { name: 'a_texCoord', data: textureCoords, size: 2 },
        { name: 'a_normals', data: normals },
        { name: 'indices', data: indices, size: 1 }
    ];

    return new Geometry(options);
}

module.exports = Icosahedron;

},{"../Geometry":107,"../GeometryHelper":108}],116:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

var Geometry = require('../Geometry');
var GeometryHelper = require('../GeometryHelper');

/**
 * This function returns a new static geometry, which is passed
 * custom buffer data.
 *
 * @class ParametricCone
 * @constructor
 *
 * @param {Object} options Parameters that alter the
 * vertex buffers of the generated geometry.
 *
 * @return {Object} constructed geometry
 */
function ParametricCone (options) {
    options  = options || {};
    var detail   = options.detail || 15;
    var radius   = options.radius || 1 / Math.PI;

    var buffers = GeometryHelper.generateParametric(
        detail,
        detail,
        ParametricCone.generator.bind(null, radius)
    );

    if (options.backface !== false) {
        GeometryHelper.addBackfaceTriangles(buffers.vertices, buffers.indices);
    }

    options.buffers = [
        { name: 'a_pos', data: buffers.vertices },
        { name: 'a_texCoord', data: GeometryHelper.getSpheroidUV( buffers.vertices ), size: 2 },
        { name: 'a_normals', data: GeometryHelper.computeNormals( buffers.vertices, buffers.indices ) },
        { name: 'indices', data: buffers.indices, size: 1 }
    ];

    return new Geometry(options);
}

/**
 * function used in iterative construction of parametric primitive.
 *
 * @static
 * @method
 * @param {Number} r Cone Radius.
 * @param {Number} u Longitudal progress from 0 to PI.
 * @param {Number} v Latitudal progress from 0 to PI.
 * @return {Array} x, y and z coordinate of geometry.
 */

ParametricCone.generator = function generator(r, u, v, pos) {
    pos[0] = -r * u * Math.cos(v);
    pos[1] = r * u * Math.sin(v);
    pos[2] = -u / (Math.PI / 2) + 1;
};

module.exports = ParametricCone;

},{"../Geometry":107,"../GeometryHelper":108}],117:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

var Geometry = require('../Geometry');
var GeometryHelper = require('../GeometryHelper');

/**
 * This function returns a new static geometry, which is passed
 * custom buffer data.
 *
 * @class Plane
 * @constructor
 *
 * @param {Object} options Parameters that alter the
 * vertex buffers of the generated geometry.
 *
 * @return {Object} constructed geometry
 */
function Plane(options) {
    options = options || {};
    var detailX = options.detailX || options.detail || 1;
    var detailY = options.detailY || options.detail || 1;

    var vertices      = [];
    var textureCoords = [];
    var normals       = [];
    var indices       = [];

    var i;

    for (var y = 0; y <= detailY; y++) {
        var t = y / detailY;
        for (var x = 0; x <= detailX; x++) {
            var s = x / detailX;
            vertices.push(2. * (s - .5), 2 * (t - .5), 0);
            textureCoords.push(s, 1 - t);
            if (x < detailX && y < detailY) {
                i = x + y * (detailX + 1);
                indices.push(i, i + 1, i + detailX + 1);
                indices.push(i + detailX + 1, i + 1, i + detailX + 2);
            }
        }
    }

    if (options.backface !== false) {
        GeometryHelper.addBackfaceTriangles(vertices, indices);

        // duplicate texture coordinates as well

        var len = textureCoords.length;
        for (i = 0; i < len; i++) textureCoords.push(textureCoords[i]);
    }

    normals = GeometryHelper.computeNormals(vertices, indices);

    options.buffers = [
        { name: 'a_pos', data: vertices },
        { name: 'a_texCoord', data: textureCoords, size: 2 },
        { name: 'a_normals', data: normals },
        { name: 'indices', data: indices, size: 1 }
    ];

    return new Geometry(options);
}

module.exports = Plane;

},{"../Geometry":107,"../GeometryHelper":108}],118:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

var Geometry = require('../Geometry');
var GeometryHelper = require('../GeometryHelper');

/**
 * This function returns a new static geometry, which is passed
 * custom buffer data.
 *
 * @class ParametricSphere
 * @constructor
 *
 * @param {Object} options Parameters that alter the
 * vertex buffers of the generated geometry.
 *
 * @return {Object} constructed geometry
 */
function ParametricSphere (options) {
    options = options || {};
    var detail = options.detail || 10;
    var detailX = options.detailX || detail;
    var detailY = options.detailY || detail;

    var buffers = GeometryHelper.generateParametric(
        detailX,
        detailY,
        ParametricSphere.generator,
        true
    );

    options.buffers = [
        { name: 'a_pos', data: buffers.vertices },
        { name: 'a_texCoord', data: GeometryHelper.getSpheroidUV(buffers.vertices), size: 2 },
        { name: 'a_normals', data: GeometryHelper.getSpheroidNormals(buffers.vertices) },
        { name: 'indices', data: buffers.indices, size: 1 }
    ];

    return new Geometry(options);
}

/**
 * Function used in iterative construction of parametric primitive.
 *
 * @static
 * @method
 * @param {Number} u Longitudal progress from 0 to PI.
 * @param {Number} v Latitudal progress from 0 to PI.
 * @param {Array} pos X, Y, Z position of vertex at given slice and stack.
 *
 * @return {undefined} undefined
 */
ParametricSphere.generator = function generator(u, v, pos) {
    var x = Math.sin(u) * Math.cos(v);
    var y = Math.cos(u);
    var z = -Math.sin(u) * Math.sin(v);

    pos[0] = x;
    pos[1] = y;
    pos[2] = z;
};

module.exports = ParametricSphere;

},{"../Geometry":107,"../GeometryHelper":108}],119:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

var Geometry = require('../Geometry');
var GeometryHelper = require('../GeometryHelper');

/**
 * This function generates custom buffers and passes them to
 * a new static geometry, which is returned to the user.
 *
 * @class Tetrahedron
 * @constructor
 *
 * @param {Object} options Parameters that alter the
 * vertex buffers of the generated geometry.
 *
 * @return {Object} constructed geometry
 */
function Tetrahedron(options) {
    var textureCoords = [];
    var normals = [];
    var detail;
    var i;
    var t = Math.sqrt(3);

    var vertices = [
        // Back
         1, -1, -1 / t,
        -1, -1, -1 / t,
         0,  1,  0,

        // Right
         0,  1,  0,
         0, -1, t - 1 / t,
         1, -1, -1 / t,

        // Left
         0,  1,  0,
        -1, -1, -1 / t,
         0, -1,  t - 1 / t,

        // Bottom
         0, -1,  t - 1 / t,
        -1, -1, -1 / t,
         1, -1, -1 / t
    ];

    var indices = [
        0, 1, 2,
        3, 4, 5,
        6, 7, 8,
        9, 10, 11
    ];

    for (i = 0; i < 4; i++) {
        textureCoords.push(
            0.0, 0.0,
            0.5, 1.0,
            1.0, 0.0
        );
    }

    options       = options || {};

    while(--detail) GeometryHelper.subdivide(indices, vertices, textureCoords);
    normals       = GeometryHelper.computeNormals(vertices, indices);

    options.buffers = [
        { name: 'a_pos', data: vertices },
        { name: 'a_texCoord', data: textureCoords, size: 2 },
        { name: 'a_normals', data: normals },
        { name: 'indices', data: indices, size: 1 }
    ];

    return new Geometry(options);
}

module.exports = Tetrahedron;

},{"../Geometry":107,"../GeometryHelper":108}],120:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

var Geometry = require('../Geometry');
var GeometryHelper = require('../GeometryHelper');

/**
 * This function returns a new static geometry, which is passed
 * custom buffer data.
 *
 * @class Torus
 * @constructor
 *
 * @param {Object} options Parameters that alter the
 * vertex buffers of the generated geometry.
 *
 * @return {Object} constructed geometry
 */

function Torus(options) {
    options  = options || {};
    var detail   = options.detail || 30;
    var holeRadius = options.holeRadius || 0.80;
    var tubeRadius = options.tubeRadius || 0.20;

    var buffers = GeometryHelper.generateParametric(
        detail,
        detail,
        Torus.generator.bind(null, holeRadius, tubeRadius)
    );

    options.buffers = [
        { name: 'a_pos', data: buffers.vertices },
        { name: 'a_texCoord', data: GeometryHelper.getSpheroidUV(buffers.vertices), size: 2 },
        { name: 'a_normals', data: GeometryHelper.computeNormals(buffers.vertices, buffers.indices) },
        { name: 'indices', data: buffers.indices, size: 1 }
    ];

    return new Geometry(options);
}

/**
 * function used in iterative construction of parametric primitive.
 *
 * @static
 * @method
 * @param {Number} c Radius of inner hole.
 * @param {Number} a Radius of tube.
 * @param {Number} u Longitudal progress from 0 to PI.
 * @param {Number} v Latitudal progress from 0 to PI.
 * @param {Array} pos X, Y, Z position of vertex at given slice and stack.
 *
 * @return {undefined} undefined
 */
Torus.generator = function generator(c, a, u, v, pos) {
    pos[0] = (c + a * Math.cos(2 * v)) * Math.sin(2 * u);
    pos[1] = -(c + a * Math.cos(2 * v)) * Math.cos(2 * u);
    pos[2] = a * Math.sin(2 * v);
};

module.exports = Torus;

},{"../Geometry":107,"../GeometryHelper":108}],121:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

var Geometry = require('../Geometry');
var GeometryHelper = require('../GeometryHelper');

/**
 * This function returns a new static geometry, which is passed
 * custom buffer data.
 *
 * @class Triangle
 * @constructor
 *
 * @param {Object} options Parameters that alter the
 * vertex buffers of the generated geometry.
 *
 * @return {Object} constructed geometry
 */
function Triangle (options) {
    options  = options || {};
    var detail   = options.detail || 1;
    var normals  = [];
    var textureCoords = [
        0.0, 0.0,
        0.5, 1.0,
        1.0, 0.0
    ];
    var indices  = [
        0, 1, 2
    ];
    var vertices = [
        -1, -1, 0,
         0,  1, 0,
         1, -1, 0
    ];

    while(--detail) GeometryHelper.subdivide(indices, vertices, textureCoords);

    if (options.backface !== false) {
        GeometryHelper.addBackfaceTriangles(vertices, indices);
    }

    normals = GeometryHelper.computeNormals(vertices, indices);

    options.buffers = [
            { name: 'a_pos', data: vertices },
            { name: 'a_texCoord', data: textureCoords, size: 2 },
            { name: 'a_normals', data: normals },
            { name: 'indices', data: indices, size: 1 }
    ];

    return new Geometry(options);
}

module.exports = Triangle;

},{"../Geometry":107,"../GeometryHelper":108}],122:[function(require,module,exports){
/**
 * The MIT License (MIT)
 * 
 * Copyright (c) 2015 Famous Industries Inc.
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
 
'use strict';

var TextureRegistry = require('./TextureRegistry');

var expressions = {};

var snippets = {

    /* Abs - The abs function returns the absolute value of x, i.e. x when x is positive or zero and -x for negative x. The input parameter can be a floating scalar or a float vector. In case of a float vector the operation is done component-wise.
     */

    abs: {glsl: 'abs(%1);', output: { 4: 4, 3: 3, 2: 2, 1: 1 }},
    /* Sign - The sign function returns 1.0 when x is positive, 0.0 when x is zero and -1.0 when x is negative. The input parameter can be a floating scalar or a float vector. In case of a float vector the operation is done component-wise. */

    sign: {glsl: 'sign(%1);', output: { 4: 4, 3: 3, 2: 2, 1: 1 }},

    /* Floor - The floor function returns the largest integer number that is smaller or equal to x. The input parameter can be a floating scalar or a float vector. In case of a float vector the operation is done component-wise. */

    floor: {glsl: 'floor(%1);', output: { 4: 4, 3: 3, 2: 2, 1: 1 }},

    /* Ceiling - The ceiling function returns the smallest number that is larger or equal to x. The input parameter can be a floating scalar or a float vector. In case of a float vector the operation is done component-wise. */

    ceiling: {glsl: 'ceil(%1);', output: { 4: 4, 3: 3, 2: 2, 1: 1 }},

    /* The mod expression returns the remained of the division operation of the two inputs. */

    mod: {glsl: 'mod(%1, %2);'},

    /* Min - The min function returns the smaller of the two arguments. The input parameters can be floating scalars or float vectors. In case of float vectors the operation is done component-wise. */

    min: {glsl: 'min(%1, %2);', output: { 4: 4, 3: 3, 2: 2, 1: 1 }},

    /* Max - The max function returns the larger of the two arguments. The input parameters can be floating scalars or float vectors. In case of float vectors the operation is done component-wise. */

    max: {glsl: 'max(%1, %2);', output: { 4: 4, 3: 3, 2: 2, 1: 1 }},

    /* Clamp - The clamp function returns x if it is larger than minVal and smaller than maxVal. In case x is smaller than minVal, minVal is returned. If x is larger than maxVal, maxVal is returned. The input parameters can be floating scalars or float vectors. In case of float vectors the operation is done component-wise. */

    clamp: {glsl: 'clamp(%1, %2, %3);', output: { '4,1,1': 4, '3,1,1': 3, '2,1,1': 2, '1,1,1': 1 }},

    /* Mix - The mix function returns the linear blend of x and y, i.e. the product of x and (1 - a) plus the product of y and a. The input parameters can be floating scalars or float vectors. In case of float vectors the operation is done component-wise. */

    mix: {glsl: 'mix(%1, %2, %3);', output: { '4,4,1': 4, '3,3,1': 3, '2,2,1': 2, '1,1,1': 1 }},

    /* Step - The step function returns 0.0 if x is smaller then edge and otherwise 1.0. The input parameters can be floating scalars or float vectors. In case of float vectors the operation is done component-wise. */

    step: {glsl: 'step(%1, %2, %3);', output: { '1,1': 1, '1,2': 2, '1,3': 3, '1,4': 4 }},

    /* Smoothstep - The smoothstep function returns 0.0 if x is smaller then edge0 and 1.0 if x is larger than edge1. Otherwise the return value is interpolated between 0.0 and 1.0 using Hermite polynomirals. The input parameters can be floating scalars or float vectors. In case of float vectors the operation is done component-wise. */

    smoothstep: {glsl: 'smoothstep(%1);', output: { '1,1,1':1, '2,2,2':2, '3,3,3':3, '4,4,4':4 }},

    /* fragCoord - The fragCoord function returns the fragment's position in screenspace. */

    fragCoord: {glsl: 'gl_FragColor;', output: 4 },

    /* Sin - The sin function returns the sine of an angle in radians. The input parameter can be a floating scalar or a float vector. In case of a float vector the sine is calculated separately for every component. */


    sin: {glsl: 'sin(%1);', output: {'1':1, '2':2, '3':3, '4':4}},

    /* Cos - The cos function returns the cosine of an angle in radians. The input parameter can be a floating scalar or a float vector. */

    cos: {glsl: 'cos(%1);', output: {'1':1, '2':2, '3':3, '4':4}},

    /* Pow - The power function returns x raised to the power of y. The input parameters can be floating scalars or float vectors. In case of float vectors the operation is done component-wise. */

    pow: {glsl: 'pow(%1, %2);', output: {'1,1':1, '2,2':2, '3,3':3, '1,4':4}},

    /* Sqrt - The sqrt function returns the square root of x. The input parameter can be a floating scalar or a float vector. In case of a float vector the operation is done component-wise. */

    sqrt: {glsl: 'sqrt(%1);', output: {'1,1':1, '2,2':2, '3,3':3, '1,4':4}},

    /* time - The time function returns the elapsed time in the unix epoch in milliseconds.*/

    time: {glsl: 'u_time;', output: 1},

    /* The Add function takes two inputs, adds them together and outputs the result. This addition operation is performed on a per channel basis, meaning that the inputs' R channels get added, G channels get added, B channels get added, etc. Both inputs must have the same number of channels unless one of them is a single Constant value. Constants can be added to a vector with any number of inputs. */

    add: {glsl: '%1 + %2;', output:  {'1,1':1, '2,2':2, '3,3':3, '4,4':4, '2,1':2, '3,1':3, '4,1':4}},

    /* The subtract function takes two inputs, subtracts the first from the second,  and outputs the result. This addition operation is performed on a per channel basis, meaning that the inputs' R channels get subtracted, G channels get subtracted, B channels get subtracted, etc. Both inputs must have the same number of channels unless one of them is a single Constant value. Constants can be added to a vector with any number of inputs. */

    subtract: {glsl: '%1 - %2;', output: {'1,1':1, '2,2':2, '3,3':3, '4,4':4, '2,1':2, '3,1':3, '4,1':4}},

    /* The Add function takes two inputs, adds them together and outputs the result. This addition operation is performed on a per channel basis, meaning that the inputs' R channels get added, G channels get added, B channels get added, etc. Both inputs must have the same number of channels unless one of them is a single Constant value. Constants can be added to a vector with any number of inputs. */

    multiply: {glsl: '%1 * %2;', output: {'1,1':1, '2,2':2, '3,3':3, '4,4':4, '2,1':2, '3,1':3, '4,1':4}},

    /* The normal function returns the 3-dimensional surface normal, which is a vector that is perpendicular to the tangent plane at that point.*/

    normal: { glsl: 'vec4((v_normal + 1.0) * 0.5, 1.0);', output: 4 },

    /* The uv function returns the 2-dimensional vector that maps the object's 3-dimensional vertices to a 2D plane. */

    uv: {glsl:'v_textureCoordinate;', output: 2},

    /* The mesh position function returns the transformed fragment's position in world-space.  */

    meshPosition: {glsl:'(v_position + 1.0) * 0.5;', output: 3},


    normalize: {glsl: 'normalize(%1)', output: {1: 1, 2: 2, 3: 3, 4: 4}},


    dot: {glsl: 'dot(%1, %2);', output: {'1,1': 1,'2,2':1, '3,3': 1, '4,4':1 }},

    /* The image function fetches the model's */

    image: {glsl:'texture2D($TEXTURE, v_textureCoordinate);', output: 4 },


    /* The constant function returns a static value which is defined at compile-time that cannot be changed dynamically.*/

    constant: {glsl: '%1;'},

    /* The Parameter function has values that can be modified (dynamically during runtime in some cases) in a MaterialInstance of the base material containing the parameter. These expressions should be given unique names, via the Parameter Name property, to be used when identifying the specific parameter in the MaterialInstance. If two parameters of the same type have the same name in the same material, they will be assumed to be the same parameter. Changing the value of the parameter in the MaterialInstance would change the value of both the parameter expressions in the material. A default value for the parameter will also be set in the base material. This will be the value of the parameter in the MaterialInstance unless it is overridden and modified there. */

    parameter: {uniforms: {parameter: 1}, glsl: 'parameter;'},
    vec3: {glsl: 'vec3(%1);', output: 3},
    vec2: {glsl: 'vec2(%1);', output: 2}
};

expressions.registerExpression = function registerExpression(name, schema) {
    this[name] = function (inputs, options) {
        return new Material(name, schema, inputs, options);
    };
};

for (var snippetName in snippets) {
    expressions.registerExpression(snippetName, snippets[snippetName]);
}

/**
 * Material is a public class that composes a material-graph out of expressions
 *
 *
 * @class Material
 * @constructor
 *
 * @param {Object} definiton of nascent expression with shader code, inputs and uniforms
 * @param {Array} list of Material expressions, images, or constant
 * @param {Object} map of uniform data of float, vec2, vec3, vec4
 */

function Material(name, chunk, inputs, options) {
    options = options || {};

    this.name = name;
    this.chunk = chunk;
    this.inputs = inputs ? (Array.isArray(inputs) ? inputs : [inputs]): [];
    this.uniforms = options.uniforms || {};
    this.varyings = options.varyings;
    this.attributes = options.attributes;

    this.meshes = [];

    if (options.texture) {
        this.texture = options.texture.__isATexture__ ? options.texture : TextureRegistry.register(null, options.texture);
    }

    this._id = Material.id++;

    this.invalidations = [];
    this.__isAMaterial__ = true;
}

Material.id = 2;

Material.prototype.setUniform = function setUniform(name, value) {
    this.uniforms[name] = value;

    this.invalidations.push(name);

    for(var i = 0; i < this.meshes.length; i++) this.meshes[i]._requestUpdate();
};

module.exports = expressions;
expressions.Material = Material;

expressions.Texture = function (source) {
    if (typeof window === 'undefined') return console.error('Texture constructor cannot be run inside of a worker');
    return expressions.image([], { texture: source });
};

expressions.Custom = function (schema, inputs, uniforms) {
    return new Material('custom', {glsl: schema, output: 1, uniforms: uniforms || {}} , inputs);
};

// Recursively iterates over a material's inputs, invoking a given callback
// with the current material
Material.prototype.traverse = function traverse(callback) {
	var inputs = this.inputs;
    var len = inputs && inputs.length;
    var idx = -1;

    while (++idx < len) inputs[idx].traverse(callback);

    callback(this);
};


},{"./TextureRegistry":123}],123:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

/*
 * A singleton object that holds texture instances in a registry which
 * can be accessed by key.  Allows for texture sharing and easy referencing.
 *
 * @static
 * @class TextureRegistry
 */
var TextureRegistry = {
    registry: {},
    textureIds: 1
};

/*
 * Registers a new Texture object with a unique id and input parameters to be
 * handled by the WebGLRenderer.  If no accessor is input the texture will be
 * created but not store in the registry.
 *
 * @method register
 *
 * @param {String} accessor Key used to later access the texture object.
 * @param {Object | Array | String} data Data to be used in the WebGLRenderer to
 * generate texture data.
 * @param {Object} options Optional parameters to affect the rendering of the
 * WebGL texture.
 *
 * @return {Object} Newly generated texture object.
 */
TextureRegistry.register = function register(accessor, data, options) {
    if (accessor) {
        this.registry[accessor] = { id: this.textureIds++, __isATexture__: true, data: data, options: options };
        return this.registry[accessor];
    }
	else {
        return { id: this.textureIds++, data: data, __isATexture__: true, options: options };
    }
};

/*
 * Retreives the texture object from registry.  Throws if no texture is
 * found at given key.
 *
 * @method get
 *
 * @param {String} accessor Key of a desired texture in the registry.
 *
 * @return {Object} Desired texture object.
 */
TextureRegistry.get = function get(accessor) {
    if (!this.registry[accessor]) {
        throw 'Texture "' + accessor + '" not found!';
    }
    else {
        return this.registry[accessor];
    }
};

module.exports = TextureRegistry;

},{}],124:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

module.exports = {
    Material: require('./Material'),
    TextureRegistry: require('./TextureRegistry')
};

},{"./Material":122,"./TextureRegistry":123}],125:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';
var Geometry = require('../webgl-geometries');
var Commands = require('../core/Commands');
var TransformSystem = require('../core/TransformSystem');
var defaultGeometry = new Geometry.Plane();

/**
 * The Mesh class is responsible for providing the API for how
 * a RenderNode will interact with the WebGL API by adding
 * a set of commands to the renderer.
 *
 * @class Mesh
 * @constructor
 * @renderable
 *
 * @param {Node} node Dispatch LocalDispatch to be retrieved
 * @param {Object} options Optional params for configuring Mesh
 *
 * @return {undefined} undefined
 */

var INPUTS = ['baseColor', 'normals', 'glossiness', 'positionOffset'];

function Mesh (node, options) {
    this._node = null;
    this._id = null;
    this._changeQueue = [];
    this._initialized = false;
    this._requestingUpdate = false;
    this._inDraw = false;
    this.value = {
        geometry: defaultGeometry,
        drawOptions: null,
        color: null,
        expressions: {},
        flatShading: null,
        glossiness: null,
        positionOffset: null,
        normals: null
    };
    if (node) node.addComponent(this);
    if (options) this.setDrawOptions(options);
}
/**
 * Pass custom options to Mesh, such as a 3 element map
 * which displaces the position of each vertex in world space.
 *
 * @method
 *
 * @param {Object} options Draw options
 * @return {Mesh} Current mesh
 */
Mesh.prototype.setDrawOptions = function setOptions (options) {
    this._changeQueue.push(Commands.GL_SET_DRAW_OPTIONS);
    this._changeQueue.push(options);

    this.value.drawOptions = options;
    return this;
};

/**
 * Get the mesh's custom options.
 *
 * @method
 *
 * @returns {Object} Options
 */
Mesh.prototype.getDrawOptions = function getDrawOptions () {
    return this.value.drawOptions;
};

/**
 * Assigns a geometry to be used for this mesh. Sets the geometry from either
 * a 'Geometry' or a valid primitive (string) name. Queues the set command for this
 * geometry and looks for buffers to send to the renderer to update geometry.
 *
 * @method
 *
 * @param {Geometry|String} geometry Geometry to be associated with the mesh.
 * @param {Object} options Various configurations for geometries.
 *
 * @return {Mesh} Mesh
 */
Mesh.prototype.setGeometry = function setGeometry (geometry, options) {
    if (typeof geometry === 'string') {
        if (!Geometry[geometry]) throw 'Invalid geometry: "' + geometry + '".';
        else geometry = new Geometry[geometry](options);
    }

    if (this.value.geometry !== geometry || this._inDraw) {
        if (this._initialized) {
            this._changeQueue.push(Commands.GL_SET_GEOMETRY);
            this._changeQueue.push(geometry.spec.id);
            this._changeQueue.push(geometry.spec.type);
            this._changeQueue.push(geometry.spec.dynamic);
        }
        this._requestUpdate();
        this.value.geometry = geometry;
    }

    if (this._initialized) {
        if (this._node) {
            var i = this.value.geometry.spec.invalidations.length;
            if (i) this._requestUpdate();
            while (i--) {
                this.value.geometry.spec.invalidations.pop();
                this._changeQueue.push(Commands.GL_BUFFER_DATA);
                this._changeQueue.push(this.value.geometry.spec.id);
                this._changeQueue.push(this.value.geometry.spec.bufferNames[i]);
                this._changeQueue.push(this.value.geometry.spec.bufferValues[i]);
                this._changeQueue.push(this.value.geometry.spec.bufferSpacings[i]);
                this._changeQueue.push(this.value.geometry.spec.dynamic);
            }
        }
    }
    return this;
};

/**
 * Gets the geometry of a mesh.
 *
 * @method
 *
 * @returns {Geometry} Geometry
 */
Mesh.prototype.getGeometry = function getGeometry () {
    return this.value.geometry;
};

/**
* Changes the color of Mesh, passing either a material expression or
* color using the 'Color' utility component.
*
* @method
*
* @param {Object|Color} color Material, image, vec3, or Color instance
*
* @return {Mesh} Mesh
*/
Mesh.prototype.setBaseColor = function setBaseColor (color) {
    var uniformValue;
    var isMaterial = color.__isAMaterial__;
    var isColor = !!color.getNormalizedRGBA;

    if (isMaterial) {
        addMeshToMaterial(this, color, 'baseColor');
        this.value.color = null;
        this.value.expressions.baseColor = color;
        uniformValue = color;
    }
    else if (isColor) {
        this.value.expressions.baseColor = null;
        this.value.color = color;
        uniformValue = color.getNormalizedRGBA();
    }

    if (this._initialized) {

        // If a material expression

        if (color.__isAMaterial__) {
            this._changeQueue.push(Commands.MATERIAL_INPUT);
        }

        // If a color component

        else if (color.getNormalizedRGB) {
            this._changeQueue.push(Commands.GL_UNIFORMS);
        }

        this._changeQueue.push('u_baseColor');
        this._changeQueue.push(uniformValue);
    }

    this._requestUpdate();

    return this;
};

/**
 * Returns either the material expression or the color instance of Mesh.
 *
 * @method
 *
 * @returns {MaterialExpress|Color} MaterialExpress or Color instance
 */
Mesh.prototype.getBaseColor = function getBaseColor () {
    return this.value.expressions.baseColor || this.value.color;
};

/**
 * Change whether the Mesh is affected by light. Default is true.
 *
 * @method
 *
 * @param {boolean} bool Boolean for setting flat shading
 *
 * @return {Mesh} Mesh
 */
Mesh.prototype.setFlatShading = function setFlatShading (bool) {
    if (this._inDraw || this.value.flatShading !== bool) {
        this.value.flatShading = bool;
        if (this._initialized) {
            this._changeQueue.push(Commands.GL_UNIFORMS);
            this._changeQueue.push('u_flatShading');
            this._changeQueue.push(bool ? 1 : 0);
        }
        this._requestUpdate();
    }

    return this;
};

/**
 * Returns a boolean for whether Mesh is affected by light.
 *
 * @method
 *
 * @returns {Boolean} Boolean
 */
Mesh.prototype.getFlatShading = function getFlatShading () {
    return this.value.flatShading;
};


/**
 * Defines a 3-element map which is used to provide significant physical
 * detail to the surface by perturbing the facing direction of each individual
 * pixel.
 *
 * @method
 *
 * @param {Object|Array} materialExpression Material, Image or vec3
 *
 * @return {Mesh} Mesh
 */
Mesh.prototype.setNormals = function setNormals (materialExpression) {
    var isMaterial = materialExpression.__isAMaterial__;

    if (isMaterial) {
        addMeshToMaterial(this, materialExpression, 'normals');
        this.value.expressions.normals = materialExpression;
    }

    if (this._initialized) {
        this._changeQueue.push(materialExpression.__isAMaterial__ ? Commands.MATERIAL_INPUT : Commands.GL_UNIFORMS);
        this._changeQueue.push('u_normals');
        this._changeQueue.push(materialExpression);
    }

    this._requestUpdate();

    return this;
};

/**
 * Returns the Normals expression of Mesh
 *
 * @method
 *
 * @param {materialExpression} materialExpression Normals Material Expression
 *
 * @returns {Array} The normals expression for Mesh
 */
Mesh.prototype.getNormals = function getNormals (materialExpression) {
    return this.value.expressions.normals;
};

/**
 * Defines the glossiness of the mesh from either a material expression or a
 * scalar value
 *
 * @method
 *
 * @param {MaterialExpression|Color} glossiness Accepts either a material expression or Color instance
 * @param {Number} strength Optional value for changing the strength of the glossiness
 *
 * @return {Mesh} Mesh
 */
Mesh.prototype.setGlossiness = function setGlossiness(glossiness, strength) {
    var isMaterial = glossiness.__isAMaterial__;
    var isColor = !!glossiness.getNormalizedRGB;

    if (isMaterial) {
        addMeshToMaterial(this, glossiness, 'glossiness');
        this.value.glossiness = [null, null];
        this.value.expressions.glossiness = glossiness;
    }
    else if (isColor) {
        this.value.expressions.glossiness = null;
        this.value.glossiness = [glossiness, strength || 20];
        glossiness = glossiness ? glossiness.getNormalizedRGB() : [0, 0, 0];
        glossiness.push(strength || 20);
    }

    if (this._initialized) {
        this._changeQueue.push(glossiness.__isAMaterial__ ? Commands.MATERIAL_INPUT : Commands.GL_UNIFORMS);
        this._changeQueue.push('u_glossiness');
        this._changeQueue.push(glossiness);
    }

    this._requestUpdate();
    return this;
};

/**
 * Returns material expression or scalar value for glossiness.
 *
 * @method
 *
 * @returns {MaterialExpress|Number} MaterialExpress or Number
 */
Mesh.prototype.getGlossiness = function getGlossiness() {
    return this.value.expressions.glossiness || this.value.glossiness;
};

/**
 * Defines 3 element map which displaces the position of each vertex in world
 * space.
 *
 * @method
 *
 * @param {MaterialExpression|Array} materialExpression Position offset expression
 *
 * @return {Mesh} Mesh
 */
Mesh.prototype.setPositionOffset = function positionOffset(materialExpression) {
    var uniformValue;
    var isMaterial = materialExpression.__isAMaterial__;

    if (isMaterial) {
        addMeshToMaterial(this, materialExpression, 'positionOffset');
        this.value.expressions.positionOffset = materialExpression;
        uniformValue = materialExpression;
    }
    else {
        this.value.expressions.positionOffset = null;
        this.value.positionOffset = materialExpression;
        uniformValue = this.value.positionOffset;
    }

    if (this._initialized) {
        this._changeQueue.push(materialExpression.__isAMaterial__ ? Commands.MATERIAL_INPUT : Commands.GL_UNIFORMS);
        this._changeQueue.push('u_positionOffset');
        this._changeQueue.push(uniformValue);
    }

    this._requestUpdate();

    return this;
};

/**
 * Returns position offset.
 *
 * @method
 *
 * @returns {MaterialExpress|Number} MaterialExpress or Number
 */
Mesh.prototype.getPositionOffset = function getPositionOffset () {
    return this.value.expressions.positionOffset || this.value.positionOffset;
};

/**
 * Get the mesh's expressions
 *
 * @method
 *
 * @returns {Object} Object
 */
Mesh.prototype.getMaterialExpressions = function getMaterialExpressions () {
    return this.value.expressions;
};

/**
 * Get the mesh's value
 *
 * @method
 *
 * @returns {Number} Value
 */
Mesh.prototype.getValue = function getValue () {
    return this.value;
};

/**
 * Queues the invalidations for Mesh
 *
 * @param {String} expressionName Expression Name
 *
 * @return {Mesh} Mesh
 */
Mesh.prototype._pushInvalidations = function _pushInvalidations (expressionName) {
    var uniformKey;
    var expression = this.value.expressions[expressionName];
    var sender = this._node;
    if (expression) {
        expression.traverse(function (node) {
            var i = node.invalidations.length;
            while (i--) {
                uniformKey = node.invalidations.pop();
                sender.sendDrawCommand(Commands.GL_UNIFORMS);
                sender.sendDrawCommand(uniformKey);
                sender.sendDrawCommand(node.uniforms[uniformKey]);
            }
        });
    }
    return this;
};

/**
* Sends draw commands to the renderer
*
* @private
* @method
*
* @return {undefined} undefined
*/
Mesh.prototype.onUpdate = function onUpdate() {
    var node = this._node;
    var queue = this._changeQueue;

    if (node && node.isMounted()) {
        node.sendDrawCommand(Commands.WITH);
        node.sendDrawCommand(node.getLocation());

        // If any invalidations exist, push them into the queue
        if (this.value.color && this.value.color.isActive()) {
            this._node.sendDrawCommand(Commands.GL_UNIFORMS);
            this._node.sendDrawCommand('u_baseColor');
            this._node.sendDrawCommand(this.value.color.getNormalizedRGBA());
            this._node.requestUpdateOnNextTick(this._id);
        }
        if (this.value.glossiness && this.value.glossiness[0] && this.value.glossiness[0].isActive()) {
            this._node.sendDrawCommand(Commands.GL_UNIFORMS);
            this._node.sendDrawCommand('u_glossiness');
            var glossiness = this.value.glossiness[0].getNormalizedRGB();
            glossiness.push(this.value.glossiness[1]);
            this._node.sendDrawCommand(glossiness);
            this._node.requestUpdateOnNextTick(this._id);
        }
        else {
            this._requestingUpdate = false;
        }

        // If any invalidations exist, push them into the queue
        this._pushInvalidations('baseColor');
        this._pushInvalidations('positionOffset');
        this._pushInvalidations('normals');
        this._pushInvalidations('glossiness');

        for (var i = 0; i < queue.length; i++) {
            node.sendDrawCommand(queue[i]);
        }

        queue.length = 0;
    }
};

/**
 * Save reference to node, set its ID and call draw on Mesh.
 *
 * @method
 *
 * @param {Node} node Node
 * @param {Number} id Identifier for Mesh
 *
 * @return {undefined} undefined
 */
Mesh.prototype.onMount = function onMount (node, id) {
    this._node = node;
    this._id = id;

    TransformSystem.makeCalculateWorldMatrixAt(node.getLocation());

    this.draw();
};

/**
 * Queues the command for dismounting Mesh
 *
 * @method
 *
 * @return {undefined} undefined
 */
Mesh.prototype.onDismount = function onDismount () {
    this._initialized = false;
    this._inDraw = false;

    this._node.sendDrawCommand(Commands.WITH);
    this._node.sendDrawCommand(this._node.getLocation());
    this._node.sendDrawCommand(Commands.GL_REMOVE_MESH);

    this._node = null;
    this._id = null;
};

/**
 * Makes Mesh visible
 *
 * @method
 *
 * @return {undefined} undefined
 */
Mesh.prototype.onShow = function onShow () {
    this._changeQueue.push(Commands.GL_MESH_VISIBILITY, true);

    this._requestUpdate();
};

/**
 * Makes Mesh hidden
 *
 * @method
 *
 * @return {undefined} undefined
 */
Mesh.prototype.onHide = function onHide () {
    this._changeQueue.push(Commands.GL_MESH_VISIBILITY, false);

    this._requestUpdate();
};

/**
 * Receives transform change updates from the scene graph.
 *
 * @method
 * @private
 *
 * @param {Array} transform Transform matric
 *
 * @return {undefined} undefined
 */
Mesh.prototype.onTransformChange = function onTransformChange (transform) {
    if (this._initialized) {
        this._changeQueue.push(Commands.GL_UNIFORMS);
        this._changeQueue.push('u_transform');
        this._changeQueue.push(transform.getWorldTransform());
    }

    this._requestUpdate();
};

/**
 * Receives size change updates from the scene graph.
 *
 * @method
 * @private
 *
 * @param {Number} x width of the Node the Mesh is attached to
 * @param {Number} y height of the Node the Mesh is attached to
 * @param {Number} z depth of the Node the Mesh is attached to
 *
 * @return {undefined} undefined
 */
Mesh.prototype.onSizeChange = function onSizeChange (x, y, z) {
    if (this._initialized) {
        this._changeQueue.push(Commands.GL_UNIFORMS);
        this._changeQueue.push('u_size');
        this._changeQueue.push([x, y, z]);
    }

    this._requestUpdate();
};

/**
 * Receives opacity change updates from the scene graph.
 *
 * @method
 * @private
 *
 * @param {Number} opacity Opacity
 *
 * @return {undefined} undefined
 */
Mesh.prototype.onOpacityChange = function onOpacityChange (opacity) {
    if (this._initialized) {
        this._changeQueue.push(Commands.GL_UNIFORMS);
        this._changeQueue.push('u_opacity');
        this._changeQueue.push(opacity);
    }

    this._requestUpdate();
};

/**
 * Adds functionality for UI events (TODO)
 *
 * @method
 *
 * @param {String} UIEvent UI Event
 *
 * @return {undefined} undefined
 */
Mesh.prototype.onAddUIEvent = function onAddUIEvent (UIEvent) {
    //TODO
};

/**
 * Queues instance to be updated.
 *
 * @method
 *
 * @return {undefined} undefined
 */
Mesh.prototype._requestUpdate = function _requestUpdate () {
    if (!this._requestingUpdate && this._node) {
        this._node.requestUpdate(this._id);
        this._requestingUpdate = true;
    }
};

/**
 * Initializes the mesh with appropriate listeners.
 *
 * @method
 *
 * @return {undefined} undefined
 */
Mesh.prototype.init = function init () {
    this._initialized = true;
    this.onTransformChange(TransformSystem.get(this._node.getLocation()));
    var size = this._node.getSize();
    this.onSizeChange(size[0], size[1], size[2]);
    this.onOpacityChange(this._node.getOpacity());
    this._requestUpdate();
};

/**
 * Draws given Mesh's current state.
 *
 * @method
 *
 * @return {undefined} undefined
 */
Mesh.prototype.draw = function draw () {
    this._inDraw = true;

    this.init();

    var value = this.getValue();

    if (value.geometry != null) this.setGeometry(value.geometry);
    if (value.color != null) this.setBaseColor(value.color);
    if (value.glossiness != null) this.setGlossiness.apply(this, value.glossiness);
    if (value.drawOptions != null) this.setDrawOptions(value.drawOptions);
    if (value.flatShading != null) this.setFlatShading(value.flatShading);

    if (value.expressions.normals != null) this.setNormals(value.expressions.normals);
    if (value.expressions.baseColor != null) this.setBaseColor(value.expressions.baseColor);
    if (value.expressions.glossiness != null) this.setGlossiness(value.expressions.glossiness);
    if (value.expressions.positionOffset != null) this.setPositionOffset(value.expressions.positionOffset);

    this._inDraw = false;
};


function addMeshToMaterial(mesh, material, name) {
    var expressions = mesh.value.expressions;
    var previous = expressions[name];
    var shouldRemove = true;
    var len = material.inputs;

    while(len--)
        addMeshToMaterial(mesh, material.inputs[len], name);

    len = INPUTS.length;

    while (len--)
        shouldRemove |= (name !== INPUTS[len] && previous !== expressions[INPUTS[len]]);

    if (shouldRemove)
        material.meshes.splice(material.meshes.indexOf(previous), 1);

    if (material.meshes.indexOf(mesh) === -1)
        material.meshes.push(mesh);
}

module.exports = Mesh;

},{"../core/Commands":15,"../core/TransformSystem":26,"../webgl-geometries":110}],126:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

module.exports = {
    Mesh: require('./Mesh'),
    PointLight: require('./lights/PointLight'),
    AmbientLight: require('./lights/AmbientLight')
};

},{"./Mesh":125,"./lights/AmbientLight":127,"./lights/PointLight":129}],127:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

var Light = require('./Light');
var Commands = require('../../core/Commands');

/**
 * AmbientLight extends the functionality of Light. It sets the ambience in
 * the scene. Ambience is a light source that emits light in the entire
 * scene, evenly.
 *
 * @class AmbientLight
 * @constructor
 * @augments Light
 *
 * @param {Node} node LocalDispatch to be retrieved from the corresponding Render Node
 *
 * @return {undefined} undefined
 */
function AmbientLight(node) {
    Light.call(this, node);
    this.commands.color = Commands.GL_AMBIENT_LIGHT;
}

/**
 * Extends Light constructor
 */
AmbientLight.prototype = Object.create(Light.prototype);

/**
 * Sets AmbientLight as the constructor
 */
AmbientLight.prototype.constructor = AmbientLight;

module.exports = AmbientLight;

},{"../../core/Commands":15,"./Light":128}],128:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

var Commands = require('../../core/Commands');

/**
 * The blueprint for all light components.
 *
 * @class Light
 * @constructor
 * @abstract
 *
 * @param {Node} node The controlling node from the corresponding Render Node
 *
 * @return {undefined} undefined
 */
function Light(node) {
    this._node = node;
    this._requestingUpdate = false;
    this._color = null;
    this.queue = [];
    this.commands = {
        color: Commands.GL_LIGHT_COLOR,
        position: Commands.GL_LIGHT_POSITION
    };
    this._id = node.addComponent(this);
}

/**
* Changes the color of the light, using the 'Color' utility component.
*
* @method
*
* @param {Color} color Color instance
*
* @return {Light} Light
*/
Light.prototype.setColor = function setColor(color) {
    if (!color.getNormalizedRGB) return false;
    if (!this._requestingUpdate) {
        this._node.requestUpdate(this._id);
        this._requestingUpdate = true;
    }
    this._color = color;
    this.queue.push(this.commands.color);
    var rgb = this._color.getNormalizedRGB();
    this.queue.push(rgb[0]);
    this.queue.push(rgb[1]);
    this.queue.push(rgb[2]);
    return this;
};

/**
* Returns the current color.

* @method
*
* @returns {Color} Color
*/
Light.prototype.getColor = function getColor() {
    return this._color;
};

/**
* Sends draw commands to the renderer
*
* @private
* @method
*
* @return {undefined} undefined
*/
Light.prototype.onUpdate = function onUpdate() {
    var path = this._node.getLocation();

    this._node
        .sendDrawCommand(Commands.WITH)
        .sendDrawCommand(path);

    var i = this.queue.length;
    while (i--) {
        this._node.sendDrawCommand(this.queue.shift());
    }

    if (this._color && this._color.isActive()) {
        this._node.sendDrawCommand(this.commands.color);
        var rgb = this._color.getNormalizedRGB();
        this._node.sendDrawCommand(rgb[0]);
        this._node.sendDrawCommand(rgb[1]);
        this._node.sendDrawCommand(rgb[2]);
        this._node.requestUpdateOnNextTick(this._id);
    }
    else {
        this._requestingUpdate = false;
    }
};

module.exports = Light;

},{"../../core/Commands":15}],129:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

var Light = require('./Light');
var TransformSystem = require('../../core/TransformSystem');

/**
 * PointLight extends the functionality of Light. PointLight is a light source
 * that emits light in all directions from a point in space.
 *
 * @class PointLight
 * @constructor
 * @augments Light
 *
 * @param {Node} node LocalDispatch to be retrieved from the corresponding Render Node
 *
 * @return {undefined} undefined
 */
function PointLight(node) {
    Light.call(this, node);
}

/**
 * Extends Light constructor
 */
PointLight.prototype = Object.create(Light.prototype);

/**
 * Sets PointLight as the constructor
 */
PointLight.prototype.constructor = PointLight;

/**
 * Receive the notice that the node you are on has been mounted.
 *
 * @param {Node} node Node that the component has been associated with
 * @param {Number} id ID associated with the node
 *
 * @return {undefined} undefined
 */
PointLight.prototype.onMount = function onMount(node, id) {
    this._id = id;
    TransformSystem.makeBreakPointAt(this._node.getLocation());
    this.onTransformChange(TransformSystem.get(this._node.getLocation()));
};

/**
 * Receives transform change updates from the scene graph.
 *
 * @private
 *
 * @param {Array} transform Transform matrix
 *
 * @return {undefined} undefined
 */
PointLight.prototype.onTransformChange = function onTransformChange (transform) {
    if (!this._requestingUpdate) {
        this._node.requestUpdate(this._id);
        this._requestingUpdate = true;
    }
    transform = transform.getWorldTransform();
    this.queue.push(this.commands.position);
    this.queue.push(transform[12]);
    this.queue.push(transform[13]);
    this.queue.push(transform[14]);
};

module.exports = PointLight;

},{"../../core/TransformSystem":26,"./Light":128}],130:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

/**
 * Buffer is a private class that wraps the vertex data that defines
 * the the points of the triangles that webgl draws. Each buffer
 * maps to one attribute of a mesh.
 *
 * @class Buffer
 * @constructor
 *
 * @param {Number} target The bind target of the buffer to update: ARRAY_BUFFER or ELEMENT_ARRAY_BUFFER
 * @param {Object} type Array type to be used in calls to gl.bufferData.
 * @param {WebGLContext} gl The WebGL context that the buffer is hosted by.
 *
 * @return {undefined} undefined
 */
function Buffer(target, type, gl) {
    this.buffer = null;
    this.target = target;
    this.type = type;
    this.data = [];
    this.gl = gl;
}

/**
 * Creates a WebGL buffer if one does not yet exist and binds the buffer to
 * to the context. Runs bufferData with appropriate data.
 *
 * @method
 *
 * @return {undefined} undefined
 */
Buffer.prototype.subData = function subData() {
    var gl = this.gl;
    var data = [];

    // to prevent against maximum call-stack issue.
    for (var i = 0, chunk = 10000; i < this.data.length; i += chunk)
        data = Array.prototype.concat.apply(data, this.data.slice(i, i + chunk));

    this.buffer = this.buffer || gl.createBuffer();
    gl.bindBuffer(this.target, this.buffer);
    gl.bufferData(this.target, new this.type(data), gl.STATIC_DRAW);
};

module.exports = Buffer;

},{}],131:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

var INDICES = 'indices';

var Buffer = require('./Buffer');

/**
 * BufferRegistry is a class that manages allocation of buffers to
 * input geometries.
 *
 * @class BufferRegistry
 * @constructor
 *
 * @param {WebGLContext} context WebGL drawing context to be passed to buffers.
 *
 * @return {undefined} undefined
 */
function BufferRegistry(context) {
    this.gl = context;

    this.registry = {};
    this._dynamicBuffers = [];
    this._staticBuffers = [];

    this._arrayBufferMax = 30000;
    this._elementBufferMax = 30000;
}

/**
 * Binds and fills all the vertex data into webgl buffers.  Will reuse buffers if
 * possible.  Populates registry with the name of the buffer, the WebGL buffer
 * object, spacing of the attribute, the attribute's offset within the buffer,
 * and finally the length of the buffer.  This information is later accessed by
 * the root to draw the buffers.
 *
 * @method
 *
 * @param {Number} geometryId Id of the geometry instance that holds the buffers.
 * @param {String} name Key of the input buffer in the geometry.
 * @param {Array} value Flat array containing input data for buffer.
 * @param {Number} spacing The spacing, or itemSize, of the input buffer.
 * @param {Boolean} dynamic Boolean denoting whether a geometry is dynamic or static.
 *
 * @return {undefined} undefined
 */
BufferRegistry.prototype.allocate = function allocate(geometryId, name, value, spacing, dynamic) {
    var vertexBuffers = this.registry[geometryId] || (this.registry[geometryId] = { keys: [], values: [], spacing: [], offset: [], length: [] });

    var j = vertexBuffers.keys.indexOf(name);
    var isIndex = name === INDICES;
    var bufferFound = false;
    var newOffset;
    var offset = 0;
    var length;
    var buffer;
    var k;

    if (j === -1) {
        j = vertexBuffers.keys.length;
        length = isIndex ? value.length : Math.floor(value.length / spacing);

        if (!dynamic) {

            // Use a previously created buffer if available.

            for (k = 0; k < this._staticBuffers.length; k++) {

                if (isIndex === this._staticBuffers[k].isIndex) {
                    newOffset = this._staticBuffers[k].offset + value.length;
                    if ((!isIndex && newOffset < this._arrayBufferMax) || (isIndex && newOffset < this._elementBufferMax)) {
                        buffer = this._staticBuffers[k].buffer;
                        offset = this._staticBuffers[k].offset;
                        this._staticBuffers[k].offset += value.length;
                        bufferFound = true;
                        break;
                    }
                }
            }

            // Create a new static buffer in none were found.

            if (!bufferFound) {
                buffer = new Buffer(
                    isIndex ? this.gl.ELEMENT_ARRAY_BUFFER : this.gl.ARRAY_BUFFER,
                    isIndex ? Uint16Array : Float32Array,
                    this.gl
                );

                this._staticBuffers.push({ buffer: buffer, offset: value.length, isIndex: isIndex });
            }
        }
        else {

            // For dynamic geometries, always create new buffer.

            buffer = new Buffer(
                isIndex ? this.gl.ELEMENT_ARRAY_BUFFER : this.gl.ARRAY_BUFFER,
                isIndex ? Uint16Array : Float32Array,
                this.gl
            );

            this._dynamicBuffers.push({ buffer: buffer, offset: value.length, isIndex: isIndex });
        }

        // Update the registry for the spec with buffer information.

        vertexBuffers.keys.push(name);
        vertexBuffers.values.push(buffer);
        vertexBuffers.spacing.push(spacing);
        vertexBuffers.offset.push(offset);
        vertexBuffers.length.push(length);
    }

    var len = value.length;
    for (k = 0; k < len; k++) {
        vertexBuffers.values[j].data[offset + k] = value[k];
    }
    vertexBuffers.values[j].subData();
};

module.exports = BufferRegistry;

},{"./Buffer":130}],132:[function(require,module,exports){
'use strict';

/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

/**
 * Takes the original rendering contexts' compiler function
 * and augments it with added functionality for parsing and
 * displaying errors.
 *
 * @method
 *
 * @returns {Function} Augmented function
 */
function Debug() {
    return _augmentFunction(
        this.gl.compileShader,
        function(shader) {
            if (!this.getShaderParameter(shader, this.COMPILE_STATUS)) {
                var errors = this.getShaderInfoLog(shader);
                var source = this.getShaderSource(shader);
                _processErrors(errors, source);
            }
        }
    );
}

// Takes a function, keeps the reference and replaces it by a closure that
// executes the original function and the provided callback.
function _augmentFunction(func, callback) {
    return function() {
        var res = func.apply(this, arguments);
        callback.apply(this, arguments);
        return res;
    };
}

// Parses errors and failed source code from shaders in order
// to build displayable error blocks.
// Inspired by Jaume Sanchez Elias.
function _processErrors(errors, source) {

    var css = 'body,html{background:#e3e3e3;font-family:monaco,monospace;font-size:14px;line-height:1.7em}' +
              '#shaderReport{left:0;top:0;right:0;box-sizing:border-box;position:absolute;z-index:1000;color:' +
              '#222;padding:15px;white-space:normal;list-style-type:none;margin:50px auto;max-width:1200px}' +
              '#shaderReport li{background-color:#fff;margin:13px 0;box-shadow:0 1px 2px rgba(0,0,0,.15);' +
              'padding:20px 30px;border-radius:2px;border-left:20px solid #e01111}span{color:#e01111;' +
              'text-decoration:underline;font-weight:700}#shaderReport li p{padding:0;margin:0}' +
              '#shaderReport li:nth-child(even){background-color:#f4f4f4}' +
              '#shaderReport li p:first-child{margin-bottom:10px;color:#666}';

    var el = document.createElement('style');
    document.getElementsByTagName('head')[0].appendChild(el);
    el.textContent = css;

    var report = document.createElement('ul');
    report.setAttribute('id', 'shaderReport');
    document.body.appendChild(report);

    var re = /ERROR: [\d]+:([\d]+): (.+)/gmi;
    var lines = source.split('\n');

    var m;
    while ((m = re.exec(errors)) != null) {
        if (m.index === re.lastIndex) re.lastIndex++;
        var li = document.createElement('li');
        var code = '<p><span>ERROR</span> "' + m[2] + '" in line ' + m[1] + '</p>';
        code += '<p><b>' + lines[m[1] - 1].replace(/^[ \t]+/g, '') + '</b></p>';
        li.innerHTML = code;
        report.appendChild(li);
    }
}

module.exports = Debug;

},{}],133:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

var clone = require('../utilities/clone');
var keyValueToArrays = require('../utilities/keyValueToArrays');

var vertexWrapper = require('../webgl-shaders').vertex;
var fragmentWrapper = require('../webgl-shaders').fragment;
var Debug = require('./Debug');

var VERTEX_SHADER = 35633;
var FRAGMENT_SHADER = 35632;
var identityMatrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

var header = 'precision mediump float;\n';

var TYPES = {
    undefined: 'float ',
    1: 'float ',
    2: 'vec2 ',
    3: 'vec3 ',
    4: 'vec4 ',
    16: 'mat4 '
};

var inputTypes = {
    u_baseColor: 'vec4',
    u_normals: 'vert',
    u_glossiness: 'vec4',
    u_positionOffset: 'vert'
};

var masks =  {
    vert: 1,
    vec3: 2,
    vec4: 4,
    float: 8
};

/**
 * Uniform keys and values
 */
var uniforms = keyValueToArrays({
    u_perspective: identityMatrix,
    u_view: identityMatrix,
    u_resolution: [0, 0, 0],
    u_transform: identityMatrix,
    u_size: [1, 1, 1],
    u_time: 0,
    u_opacity: 1,
    u_metalness: 0,
    u_glossiness: [0, 0, 0, 0],
    u_baseColor: [1, 1, 1, 1],
    u_normals: [1, 1, 1],
    u_positionOffset: [0, 0, 0],
    u_lightPosition: identityMatrix,
    u_lightColor: identityMatrix,
    u_ambientLight: [0, 0, 0],
    u_flatShading: 0,
    u_numLights: 0
});

/**
 * Attributes keys and values
 */
var attributes = keyValueToArrays({
    a_pos: [0, 0, 0],
    a_texCoord: [0, 0],
    a_normals: [0, 0, 0]
});

/**
 * Varyings keys and values
 */
var varyings = keyValueToArrays({
    v_textureCoordinate: [0, 0],
    v_normal: [0, 0, 0],
    v_position: [0, 0, 0],
    v_eyeVector: [0, 0, 0]
});

/**
 * A class that handles interactions with the WebGL shader program
 * used by a specific context.  It manages creation of the shader program
 * and the attached vertex and fragment shaders.  It is also in charge of
 * passing all uniforms to the WebGLContext.
 *
 * @class Program
 * @constructor
 *
 * @param {WebGL_Context} gl Context to be used to create the shader program
 * @param {Object} options Program options
 *
 * @return {undefined} undefined
 */
function Program(gl, options) {
    this.gl = gl;
    this.options = options || {};

    this.registeredMaterials = {};
    this.cachedUniforms = {};
    this.uniformTypes = [];

    this.definitionVec4 = [];
    this.definitionVec3 = [];
    this.definitionFloat = [];
    this.applicationVec3 = [];
    this.applicationVec4 = [];
    this.applicationFloat = [];
    this.applicationVert = [];
    this.definitionVert = [];

    if (this.options.debug) {
        this.gl.compileShader = Debug.call(this);
    }

    this.resetProgram();
}

/**
 * Determines whether a material has already been registered to
 * the shader program.
 *
 * @method
 *
 * @param {String} name Name of target input of material.
 * @param {Object} material Compiled material object being verified.
 *
 * @return {Program} this Current program.
 */
Program.prototype.registerMaterial = function registerMaterial(name, material) {
    var compiled = material;
    var type = inputTypes[name];
    var mask = masks[type];

    if ((this.registeredMaterials[material._id] & mask) === mask) return this;

    var k;

    for (k in compiled.uniforms) {
        if (uniforms.keys.indexOf(k) === -1) {
            uniforms.keys.push(k);
            uniforms.values.push(compiled.uniforms[k]);
        }
    }

    for (k in compiled.varyings) {
        if (varyings.keys.indexOf(k) === -1) {
            varyings.keys.push(k);
            varyings.values.push(compiled.varyings[k]);
        }
    }

    for (k in compiled.attributes) {
        if (attributes.keys.indexOf(k) === -1) {
            attributes.keys.push(k);
            attributes.values.push(compiled.attributes[k]);
        }
    }

    this.registeredMaterials[material._id] |= mask;

    if (type === 'float') {
        this.definitionFloat.push(material.defines);
        this.definitionFloat.push('float fa_' + material._id + '() {\n '  + compiled.glsl + ' \n}');
        this.applicationFloat.push('if (int(abs(ID)) == ' + material._id + ') return fa_' + material._id  + '();');
    }

    if (type === 'vec3') {
        this.definitionVec3.push(material.defines);
        this.definitionVec3.push('vec3 fa_' + material._id + '() {\n '  + compiled.glsl + ' \n}');
        this.applicationVec3.push('if (int(abs(ID.x)) == ' + material._id + ') return fa_' + material._id + '();');
    }

    if (type === 'vec4') {
        this.definitionVec4.push(material.defines);
        this.definitionVec4.push('vec4 fa_' + material._id + '() {\n '  + compiled.glsl + ' \n}');
        this.applicationVec4.push('if (int(abs(ID.x)) == ' + material._id + ') return fa_' + material._id + '();');
    }

    if (type === 'vert') {
        this.definitionVert.push(material.defines);
        this.definitionVert.push('vec3 fa_' + material._id + '() {\n '  + compiled.glsl + ' \n}');
        this.applicationVert.push('if (int(abs(ID.x)) == ' + material._id + ') return fa_' + material._id + '();');
    }

    return this.resetProgram();
};

/**
 * Clears all cached uniforms and attribute locations.  Assembles
 * new fragment and vertex shaders and based on material from
 * currently registered materials.  Attaches said shaders to new
 * shader program and upon success links program to the WebGL
 * context.
 *
 * @method
 *
 * @return {Program} Current program.
 */
Program.prototype.resetProgram = function resetProgram() {
    var vertexHeader = [header];
    var fragmentHeader = [header];

    var fragmentSource;
    var vertexSource;
    var program;
    var name;
    var value;
    var i;

    this.uniformLocations   = [];
    this.attributeLocations = {};

    this.uniformTypes = {};

    this.attributeNames = clone(attributes.keys);
    this.attributeValues = clone(attributes.values);

    this.varyingNames = clone(varyings.keys);
    this.varyingValues = clone(varyings.values);

    this.uniformNames = clone(uniforms.keys);
    this.uniformValues = clone(uniforms.values);

    this.cachedUniforms = {};

    fragmentHeader.push('uniform sampler2D u_textures[7];\n');

    if (this.applicationVert.length) {
        vertexHeader.push('uniform sampler2D u_textures[7];\n');
    }

    for(i = 0; i < this.uniformNames.length; i++) {
        name = this.uniformNames[i];
        value = this.uniformValues[i];
        vertexHeader.push('uniform ' + TYPES[value.length] + name + ';\n');
        fragmentHeader.push('uniform ' + TYPES[value.length] + name + ';\n');
    }

    for(i = 0; i < this.attributeNames.length; i++) {
        name = this.attributeNames[i];
        value = this.attributeValues[i];
        vertexHeader.push('attribute ' + TYPES[value.length] + name + ';\n');
    }

    for(i = 0; i < this.varyingNames.length; i++) {
        name = this.varyingNames[i];
        value = this.varyingValues[i];
        vertexHeader.push('varying ' + TYPES[value.length]  + name + ';\n');
        fragmentHeader.push('varying ' + TYPES[value.length] + name + ';\n');
    }

    vertexSource = vertexHeader.join('') + vertexWrapper
        .replace('#vert_definitions', this.definitionVert.join('\n'))
        .replace('#vert_applications', this.applicationVert.join('\n'));

    fragmentSource = fragmentHeader.join('') + fragmentWrapper
        .replace('#vec3_definitions', this.definitionVec3.join('\n'))
        .replace('#vec3_applications', this.applicationVec3.join('\n'))
        .replace('#vec4_definitions', this.definitionVec4.join('\n'))
        .replace('#vec4_applications', this.applicationVec4.join('\n'))
        .replace('#float_definitions', this.definitionFloat.join('\n'))
        .replace('#float_applications', this.applicationFloat.join('\n'));

    program = this.gl.createProgram();

    this.gl.attachShader(
        program,
        this.compileShader(this.gl.createShader(VERTEX_SHADER), vertexSource)
    );

    this.gl.attachShader(
        program,
        this.compileShader(this.gl.createShader(FRAGMENT_SHADER), fragmentSource)
    );

    this.gl.linkProgram(program);

    if (! this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
        console.error('link error: ' + this.gl.getProgramInfoLog(program));
        this.program = null;
    }
    else {
        this.program = program;
        this.gl.useProgram(this.program);
    }

    this.setUniforms(this.uniformNames, this.uniformValues);

    var textureLocation = this.gl.getUniformLocation(this.program, 'u_textures[0]');
    this.gl.uniform1iv(textureLocation, [0, 1, 2, 3, 4, 5, 6]);

    return this;
};

/**
 * Compares the value of the input uniform value against
 * the cached value stored on the Program class.  Updates and
 * creates new entries in the cache when necessary.
 *
 * @method
 * @param {String} targetName Key of uniform spec being evaluated.
 * @param {Number|Array} value Value of uniform spec being evaluated.
 *
 * @return {Boolean} boolean Indicating whether the uniform being set is cached.
 */
Program.prototype.uniformIsCached = function(targetName, value) {
    if(this.cachedUniforms[targetName] == null) {
        if (value.length) {
            this.cachedUniforms[targetName] = new Float32Array(value);
        }
        else {
            this.cachedUniforms[targetName] = value;
        }
        return false;
    }
    else if (value.length) {
        var i = value.length;
        while (i--) {
            if(value[i] !== this.cachedUniforms[targetName][i]) {
                i = value.length;
                while(i--) this.cachedUniforms[targetName][i] = value[i];
                return false;
            }
        }
    }

    else if (this.cachedUniforms[targetName] !== value) {
        this.cachedUniforms[targetName] = value;
        return false;
    }

    return true;
};

/**
 * Handles all passing of uniforms to WebGL drawing context.  This
 * function will find the uniform location and then, based on
 * a type inferred from the javascript value of the uniform, it will call
 * the appropriate function to pass the uniform to WebGL.  Finally,
 * setUniforms will iterate through the passed in shaderChunks (if any)
 * and set the appropriate uniforms to specify which chunks to use.
 *
 * @method
 * @param {Array} uniformNames Array containing the keys of all uniforms to be set.
 * @param {Array} uniformValue Array containing the values of all uniforms to be set.
 *
 * @return {Program} Current program.
 */
Program.prototype.setUniforms = function (uniformNames, uniformValue) {
    var gl = this.gl;
    var location;
    var value;
    var name;
    var len;
    var i;

    if (!this.program) return this;

    len = uniformNames.length;
    for (i = 0; i < len; i++) {
        name = uniformNames[i];
        value = uniformValue[i];

        // Retreive the cached location of the uniform,
        // requesting a new location from the WebGL context
        // if it does not yet exist.

        location = this.uniformLocations[name];

        if (location === null) continue;
        if (location === undefined) {
            location = gl.getUniformLocation(this.program, name);
            this.uniformLocations[name] = location;
        }

        // Check if the value is already set for the
        // given uniform.
        if (this.uniformIsCached(name, value)) continue;

        // Determine the correct function and pass the uniform
        // value to WebGL.
        if (!this.uniformTypes[name]) {
            this.uniformTypes[name] = this.getUniformTypeFromValue(value);
        }

        // Call uniform setter function on WebGL context with correct value

        switch (this.uniformTypes[name]) {
            case 'uniform4fv': gl.uniform4fv(location, value); break;
            case 'uniform3fv': gl.uniform3fv(location, value); break;
            case 'uniform2fv': gl.uniform2fv(location, value); break;
            case 'uniform1fv': gl.uniform1fv(location, value); break;
            case 'uniform1f' : gl.uniform1f(location, value); break;
            case 'uniformMatrix3fv': gl.uniformMatrix3fv(location, false, value); break;
            case 'uniformMatrix4fv': gl.uniformMatrix4fv(location, false, value); break;
        }
    }

    return this;
};

/**
 * Infers uniform setter function to be called on the WebGL context, based
 * on an input value.
 *
 * @method
 *
 * @param {Number|Array} value Value from which uniform type is inferred.
 *
 * @return {String} Name of uniform function for given value.
 */
Program.prototype.getUniformTypeFromValue = function getUniformTypeFromValue(value) {
    if (Array.isArray(value) || value instanceof Float32Array) {
        switch (value.length) {
            case 1:  return 'uniform1fv';
            case 2:  return 'uniform2fv';
            case 3:  return 'uniform3fv';
            case 4:  return 'uniform4fv';
            case 9:  return 'uniformMatrix3fv';
            case 16: return 'uniformMatrix4fv';
        }
    }
    else if (!isNaN(parseFloat(value)) && isFinite(value)) {
        return 'uniform1f';
    }

    throw 'cant load uniform "' + name + '" with value:' + JSON.stringify(value);
};

/**
 * Adds shader source to shader and compiles the input shader.  Checks
 * compile status and logs error if necessary.
 *
 * @method
 *
 * @param {Object} shader Program to be compiled.
 * @param {String} source Source to be used in the shader.
 *
 * @return {Object} Compiled shader.
 */
Program.prototype.compileShader = function compileShader(shader, source) {
    var i = 1;

    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
        console.error('compile error: ' + this.gl.getShaderInfoLog(shader));
        console.error('1: ' + source.replace(/\n/g, function () {
            return '\n' + (i+=1) + ': ';
        }));
    }

    return shader;
};

module.exports = Program;

},{"../utilities/clone":100,"../utilities/keyValueToArrays":102,"../webgl-shaders":141,"./Debug":132}],134:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

/**
 * Texture is a private class that stores image data
 * to be accessed from a shader or used as a render target.
 *
 * @class Texture
 * @constructor
 *
 * @param {GL} gl GL
 * @param {Object} options Options
 *
 * @return {undefined} undefined
 */
function Texture(gl, options) {
    options = options || {};
    this.id = gl.createTexture();
    this.width = options.width || 0;
    this.height = options.height || 0;
    this.mipmap = options.mipmap;
    this.format = options.format || 'RGBA';
    this.type = options.type || 'UNSIGNED_BYTE';
    this.gl = gl;

    this.bind();

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, options.flipYWebgl || false);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, options.premultiplyAlphaWebgl || false);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl[options.magFilter] || gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl[options.minFilter] || gl.NEAREST);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl[options.wrapS] || gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl[options.wrapT] || gl.CLAMP_TO_EDGE);
}

/**
 * Binds this texture as the selected target.
 *
 * @method
 * @return {Object} Current texture instance.
 */
Texture.prototype.bind = function bind() {
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.id);
    return this;
};

/**
 * Erases the texture data in the given texture slot.
 *
 * @method
 * @return {Object} Current texture instance.
 */
Texture.prototype.unbind = function unbind() {
    this.gl.bindTexture(this.gl.TEXTURE_2D, null);
    return this;
};

/**
 * Replaces the image data in the texture with the given image.
 *
 * @method
 *
 * @param {Image}   img     The image object to upload pixel data from.
 * @return {Object}         Current texture instance.
 */
Texture.prototype.setImage = function setImage(img) {
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl[this.format], this.gl[this.format], this.gl[this.type], img);
    if (this.mipmap) this.gl.generateMipmap(this.gl.TEXTURE_2D);
    return this;
};

/**
 * Replaces the image data in the texture with an array of arbitrary data.
 *
 * @method
 *
 * @param {Array}   input   Array to be set as data to texture.
 * @return {Object}         Current texture instance.
 */
Texture.prototype.setArray = function setArray(input) {
    this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl[this.format], this.width, this.height, 0, this.gl[this.format], this.gl[this.type], input);
    return this;
};

/**
 * Dumps the rgb-pixel contents of a texture into an array for debugging purposes
 *
 * @method
 *
 * @param {Number} x        x-offset between texture coordinates and snapshot
 * @param {Number} y        y-offset between texture coordinates and snapshot
 * @param {Number} width    x-depth of the snapshot
 * @param {Number} height   y-depth of the snapshot
 *
 * @return {Array}          An array of the pixels contained in the snapshot.
 */
Texture.prototype.readBack = function readBack(x, y, width, height) {
    var gl = this.gl;
    var pixels;
    x = x || 0;
    y = y || 0;
    width = width || this.width;
    height = height || this.height;
    var fb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.id, 0);
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE) {
        pixels = new Uint8Array(width * height * 4);
        gl.readPixels(x, y, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    }
    return pixels;
};

module.exports = Texture;

},{}],135:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
'use strict';

var Texture = require('./Texture');
var createCheckerboard = require('./createCheckerboard');

/**
 * Handles loading, binding, and resampling of textures for WebGLRenderer.
 *
 * @class TextureManager
 * @constructor
 *
 * @param {WebGL_Context} gl Context used to create and bind textures.
 *
 * @return {undefined} undefined
 */
function TextureManager(gl) {
    this.registry = [];
    this._needsResample = [];

    this._activeTexture = 0;
    this._boundTexture = null;

    this._checkerboard = createCheckerboard();

    this.gl = gl;
}

/**
 * Update function used by WebGLRenderer to queue resamples on
 * registered textures.
 *
 * @method
 *
 * @param {Number}      time    Time in milliseconds according to the compositor.
 * @return {undefined}          undefined
 */
TextureManager.prototype.update = function update(time) {
    var registryLength = this.registry.length;

    for (var i = 1; i < registryLength; i++) {
        var texture = this.registry[i];

        if (texture && texture.isLoaded && texture.resampleRate) {
            if (!texture.lastResample || time - texture.lastResample > texture.resampleRate) {
                if (!this._needsResample[texture.id]) {
                    this._needsResample[texture.id] = true;
                    texture.lastResample = time;
                }
            }
        }
    }
};

/**
 * Creates a spec and creates a texture based on given texture data.
 * Handles loading assets if necessary.
 *
 * @method
 *
 * @param {Object}  input   Object containing texture id, texture data
 *                          and options used to draw texture.
 * @param {Number}  slot    Texture slot to bind generated texture to.
 * @return {undefined}      undefined
 */
TextureManager.prototype.register = function register(input, slot) {
    var _this = this;

    var source = input.data;
    var textureId = input.id;
    var options = input.options || {};
    var texture = this.registry[textureId];
    var spec;

    if (!texture) {

        texture = new Texture(this.gl, options);
        texture.setImage(this._checkerboard);

        // Add texture to registry

        spec = this.registry[textureId] = {
            resampleRate: options.resampleRate || null,
            lastResample: null,
            isLoaded: false,
            texture: texture,
            source: source,
            id: textureId,
            slot: slot
        };

        // Handle array

        if (Array.isArray(source) || source instanceof Uint8Array || source instanceof Float32Array) {
            this.bindTexture(textureId);
            texture.setArray(source);
            spec.isLoaded = true;
        }

        // Handle video

        else if (source instanceof HTMLVideoElement) {
            source.addEventListener('loadeddata', function() {
                _this.bindTexture(textureId);
                texture.setImage(source);

                spec.isLoaded = true;
                spec.source = source;
            });
        }

        // Handle image url

        else if (typeof source === 'string') {
            loadImage(source, function (img) {
                _this.bindTexture(textureId);
                texture.setImage(img);

                spec.isLoaded = true;
                spec.source = img;
            });
        }
    }

    return textureId;
};

/**
 * Loads an image from a string or Image object and executes a callback function.
 *
 * @method
 * @private
 *
 * @param {Object|String} input The input image data to load as an asset.
 * @param {Function} callback The callback function to be fired when the image has finished loading.
 *
 * @return {Object} Image object being loaded.
 */
function loadImage (input, callback) {
    var image = (typeof input === 'string' ? new Image() : input) || {};
        image.crossOrigin = 'anonymous';

    if (!image.src) image.src = input;
    if (!image.complete) {
        image.onload = function () {
            callback(image);
        };
    }
    else {
        callback(image);
    }

    return image;
}

/**
 * Sets active texture slot and binds target texture.  Also handles
 * resampling when necessary.
 *
 * @method
 *
 * @param {Number} id Identifier used to retreive texture spec
 *
 * @return {undefined} undefined
 */
TextureManager.prototype.bindTexture = function bindTexture(id) {
    var spec = this.registry[id];

    if (this._activeTexture !== spec.slot) {
        this.gl.activeTexture(this.gl.TEXTURE0 + spec.slot);
        this._activeTexture = spec.slot;
    }

    if (this._boundTexture !== id) {
        this._boundTexture = id;
        spec.texture.bind();
    }

    if (this._needsResample[spec.id]) {

        // TODO: Account for resampling of arrays.

        spec.texture.setImage(spec.source);
        this._needsResample[spec.id] = false;
    }
};

module.exports = TextureManager;

},{"./Texture":134,"./createCheckerboard":138}],136:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

var Program = require('./Program');
var BufferRegistry = require('./BufferRegistry');
var sorter = require('./radixSort');
var keyValueToArrays = require('../utilities/keyValueToArrays');
var TextureManager = require('./TextureManager');
var compileMaterial = require('./compileMaterial');
var Registry = require('../utilities/Registry');

var identity = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

var globalUniforms = keyValueToArrays({
    'u_numLights': 0,
    'u_ambientLight': new Array(3),
    'u_lightPosition': new Array(3),
    'u_lightColor': new Array(3),
    'u_perspective': new Array(16),
    'u_time': 0,
    'u_view': new Array(16)
});

/**
 * WebGLRenderer is a private class that manages all interactions with the WebGL
 * API. Each frame it receives commands from the compositor and updates its
 * registries accordingly. Subsequently, the draw function is called and the
 * WebGLRenderer issues draw calls for all meshes in its registry.
 *
 * @class WebGLRenderer
 * @constructor
 *
 * @param {Element} canvas The DOM element that GL will paint itself onto.
 * @param {Compositor} compositor Compositor used for querying the time from.
 *
 * @return {undefined} undefined
 */
function WebGLRenderer(canvas, compositor) {
    canvas.classList.add('famous-webgl-renderer');

    this.canvas = canvas;
    this.compositor = compositor;

    var gl = this.gl = this.getWebGLContext(this.canvas);

    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    gl.polygonOffset(0.1, 0.1);
    gl.enable(gl.POLYGON_OFFSET_FILL);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.depthFunc(gl.LEQUAL);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);

    this.meshRegistry = new Registry();
    this.cutoutRegistry = new Registry();
    this.lightRegistry = new Registry();

    this.numLights = 0;
    this.ambientLightColor = [0, 0, 0];
    this.lightPositions = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    this.lightColors = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    this.textureManager = new TextureManager(gl);
    this.bufferRegistry = new BufferRegistry(gl);
    this.program = new Program(gl, { debug: true });

    this.state = {
        boundArrayBuffer: null,
        boundElementBuffer: null,
        lastDrawn: null,
        enabledAttributes: {},
        enabledAttributesKeys: []
    };

    this.resolutionName = ['u_resolution'];
    this.resolutionValues = [[0, 0, 0]];

    this.cachedSize = [];

    /*
    The projectionTransform has some constant components, i.e. the z scale, and the x and y translation.

    The z scale keeps the final z position of any vertex within the clip's domain by scaling it by an
    arbitrarily small coefficient. This has the advantage of being a useful default in the event of the
    user forgoing a near and far plane, an alien convention in dom space as in DOM overlapping is
    conducted via painter's algorithm.

    The x and y translation transforms the world space origin to the top left corner of the screen.

    The final component (this.projectionTransform[15]) is initialized as 1 because certain projection models,
    e.g. the WC3 specified model, keep the XY plane as the projection hyperplane.
    */
    this.projectionTransform = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, -0.000001, 0, -1, 1, 0, 1];

    // TODO: remove this hack

    var cutout = this.cutoutGeometry = {
        spec: {
            id: -1,
            bufferValues: [[-1, -1, 0, 1, -1, 0, -1, 1, 0, 1, 1, 0]],
            bufferNames: ['a_pos'],
            type: 'TRIANGLE_STRIP'
        }
    };

    this.bufferRegistry.allocate(
        this.cutoutGeometry.spec.id,
        cutout.spec.bufferNames[0],
        cutout.spec.bufferValues[0],
        3
    );
}

/**
 * Attempts to retreive the WebGLRenderer context using several
 * accessors. For browser compatability. Throws on error.
 *
 * @method
 *
 * @param {Object} canvas Canvas element from which the context is retreived
 *
 * @return {Object} WebGLContext WebGL context
 */
WebGLRenderer.prototype.getWebGLContext = function getWebGLContext(canvas) {
    var names = ['webgl', 'experimental-webgl', 'webkit-3d', 'moz-webgl'];
    var context;

    for (var i = 0, len = names.length; i < len; i++) {
        try {
            context = canvas.getContext(names[i]);
        }
        catch (error) {
            console.error('Error creating WebGL context: ' + error.toString());
        }
        if (context) return context;
    }

    if (!context) {
        console.error('Could not retrieve WebGL context. Please refer to https://www.khronos.org/webgl/ for requirements');
        return false;
    }

};

/**
 * Adds a new base spec to the light registry at a given path.
 *
 * @method
 *
 * @param {String} path Path used as id of new light in lightRegistry
 *
 * @return {Object} Newly created light spec
 */
WebGLRenderer.prototype.createLight = function createLight(path) {
    this.numLights++;
    var light = {
        color: [0, 0, 0],
        position: [0, 0, 0]
    };
    this.lightRegistry.register(path, light);
    return light;
};

/**
 * Adds a new base spec to the mesh registry at a given path.
 *
 * @method
 *
 * @param {String} path Path used as id of new mesh in meshRegistry.
 *
 * @return {Object} Newly created mesh spec.
 */
WebGLRenderer.prototype.createMesh = function createMesh(path) {
    var uniforms = keyValueToArrays({
        u_opacity: 1,
        u_transform: identity,
        u_size: [0, 0, 0],
        u_baseColor: [0.5, 0.5, 0.5, 1],
        u_positionOffset: [0, 0, 0],
        u_normals: [0, 0, 0],
        u_flatShading: 0,
        u_glossiness: [0, 0, 0, 0]
    });
    var mesh = {
        depth: null,
        uniformKeys: uniforms.keys,
        uniformValues: uniforms.values,
        buffers: {},
        geometry: null,
        drawType: null,
        textures: [],
        visible: true
    };

    this.meshRegistry.register(path, mesh);
    return mesh;
};

/**
 * Sets flag on indicating whether to do skip draw phase for
 * cutout mesh at given path.
 *
 * @method
 *
 * @param {String} path Path used as id of target cutout mesh.
 * @param {Boolean} usesCutout Indicates the presence of a cutout mesh
 *
 * @return {undefined} undefined
 */
WebGLRenderer.prototype.setCutoutState = function setCutoutState(path, usesCutout) {
    var cutout = this.getOrSetCutout(path);

    cutout.visible = usesCutout;
};

/**
 * Creates or retreives cutout
 *
 * @method
 *
 * @param {String} path Path used as id of target cutout mesh.
 *
 * @return {Object} Newly created cutout spec.
 */
WebGLRenderer.prototype.getOrSetCutout = function getOrSetCutout(path) {
    var cutout = this.cutoutRegistry.get(path);

    if (!cutout) {
        var uniforms = keyValueToArrays({
            u_opacity: 0,
            u_transform: identity.slice(),
            u_size: [0, 0, 0],
            u_origin: [0, 0, 0],
            u_baseColor: [0, 0, 0, 1]
        });

        cutout = {
            uniformKeys: uniforms.keys,
            uniformValues: uniforms.values,
            geometry: this.cutoutGeometry.spec.id,
            drawType: this.cutoutGeometry.spec.type,
            visible: true
        };

        this.cutoutRegistry.register(path, cutout);
    }

    return cutout;
};

/**
 * Sets flag on indicating whether to do skip draw phase for
 * mesh at given path.
 *
 * @method
 * @param {String} path Path used as id of target mesh.
 * @param {Boolean} visibility Indicates the visibility of target mesh.
 *
 * @return {undefined} undefined
 */
WebGLRenderer.prototype.setMeshVisibility = function setMeshVisibility(path, visibility) {
    var mesh = this.meshRegistry.get(path) || this.createMesh(path);

    mesh.visible = visibility;
};

/**
 * Deletes a mesh from the meshRegistry.
 *
 * @method
 * @param {String} path Path used as id of target mesh.
 *
 * @return {undefined} undefined
 */
WebGLRenderer.prototype.removeMesh = function removeMesh(path) {
    this.meshRegistry.unregister(path);
};

/**
 * Creates or retreives cutout
 *
 * @method
 * @param {String} path Path used as id of cutout in cutout registry.
 * @param {String} uniformName Identifier used to upload value
 * @param {Array} uniformValue Value of uniform data
 *
 * @return {undefined} undefined
 */
WebGLRenderer.prototype.setCutoutUniform = function setCutoutUniform(path, uniformName, uniformValue) {
    var cutout = this.getOrSetCutout(path);

    var index = cutout.uniformKeys.indexOf(uniformName);

    if (uniformValue.length) {
        for (var i = 0, len = uniformValue.length; i < len; i++) {
            cutout.uniformValues[index][i] = uniformValue[i];
        }
    }
    else {
        cutout.uniformValues[index] = uniformValue;
    }
};

/**
 * Edits the options field on a mesh
 *
 * @method
 * @param {String} path Path used as id of target mesh
 * @param {Object} options Map of draw options for mesh
 *
 * @return {WebGLRenderer} this
 */
WebGLRenderer.prototype.setMeshOptions = function(path, options) {
    var mesh = this.meshRegistry.get(path) || this.createMesh(path);

    mesh.options = options;
    return this;
};

/**
 * Changes the color of the fixed intensity lighting in the scene
 *
 * @method
 *
 * @param {String} path Path used as id of light
 * @param {Number} r red channel
 * @param {Number} g green channel
 * @param {Number} b blue channel
 *
 * @return {WebGLRenderer} this
 */
WebGLRenderer.prototype.setAmbientLightColor = function setAmbientLightColor(path, r, g, b) {
    this.ambientLightColor[0] = r;
    this.ambientLightColor[1] = g;
    this.ambientLightColor[2] = b;
    return this;
};

/**
 * Changes the location of the light in the scene
 *
 * @method
 *
 * @param {String} path Path used as id of light
 * @param {Number} x x position
 * @param {Number} y y position
 * @param {Number} z z position
 *
 * @return {WebGLRenderer} this
 */
WebGLRenderer.prototype.setLightPosition = function setLightPosition(path, x, y, z) {
    var light = this.lightRegistry.get(path) || this.createLight(path);
    light.position[0] = x;
    light.position[1] = y;
    light.position[2] = z;
    return this;
};

/**
 * Changes the color of a dynamic intensity lighting in the scene
 *
 * @method
 *
 * @param {String} path Path used as id of light in light Registry.
 * @param {Number} r red channel
 * @param {Number} g green channel
 * @param {Number} b blue channel
 *
 * @return {WebGLRenderer} this
 */
WebGLRenderer.prototype.setLightColor = function setLightColor(path, r, g, b) {
    var light = this.lightRegistry.get(path) || this.createLight(path);

    light.color[0] = r;
    light.color[1] = g;
    light.color[2] = b;
    return this;
};

/**
 * Compiles material spec into program shader
 *
 * @method
 *
 * @param {String} path Path used as id of cutout in cutout registry.
 * @param {String} name Name that the rendering input the material is bound to
 * @param {Object} material Material spec
 *
 * @return {WebGLRenderer} this
 */
WebGLRenderer.prototype.handleMaterialInput = function handleMaterialInput(path, name, material) {
    var mesh = this.meshRegistry.get(path) || this.createMesh(path);
    material = compileMaterial(material, mesh.textures.length);

    // Set uniforms to enable texture!

    mesh.uniformValues[mesh.uniformKeys.indexOf(name)][0] = -material._id;

    // Register textures!

    var i = material.textures.length;
    while (i--) {
        mesh.textures.push(
            this.textureManager.register(material.textures[i], mesh.textures.length + i)
        );
    }

    // Register material!

    this.program.registerMaterial(name, material);

    return this.updateSize();
};

/**
 * Changes the geometry data of a mesh
 *
 * @method
 *
 * @param {String} path Path used as id of cutout in cutout registry.
 * @param {Object} geometry Geometry object containing vertex data to be drawn
 * @param {Number} drawType Primitive identifier
 * @param {Boolean} dynamic Whether geometry is dynamic
 *
 * @return {undefined} undefined
 */
WebGLRenderer.prototype.setGeometry = function setGeometry(path, geometry, drawType, dynamic) {
    var mesh = this.meshRegistry.get(path) || this.createMesh(path);

    mesh.geometry = geometry;
    mesh.drawType = drawType;
    mesh.dynamic = dynamic;

    return this;
};

/**
 * Uploads a new value for the uniform data when the mesh is being drawn
 *
 * @method
 *
 * @param {String} path Path used as id of mesh in mesh registry
 * @param {String} uniformName Identifier used to upload value
 * @param {Array} uniformValue Value of uniform data
 *
 * @return {undefined} undefined
 */
WebGLRenderer.prototype.setMeshUniform = function setMeshUniform(path, uniformName, uniformValue) {
    var mesh = this.meshRegistry.get(path) || this.createMesh(path);

    var index = mesh.uniformKeys.indexOf(uniformName);

    if (index === -1) {
        mesh.uniformKeys.push(uniformName);
        mesh.uniformValues.push(uniformValue);
    }
    else {
        mesh.uniformValues[index] = uniformValue;
    }
};

/**
 * Allocates a new buffer using the internal BufferRegistry.
 *
 * @method
 *
 * @param {Number} geometryId Id of geometry in geometry registry
 * @param {String} bufferName Attribute location name
 * @param {Array} bufferValue Vertex data
 * @param {Number} bufferSpacing The dimensions of the vertex
 * @param {Boolean} isDynamic Whether geometry is dynamic
 *
 * @return {undefined} undefined
 */
WebGLRenderer.prototype.bufferData = function bufferData(geometryId, bufferName, bufferValue, bufferSpacing, isDynamic) {
    this.bufferRegistry.allocate(geometryId, bufferName, bufferValue, bufferSpacing, isDynamic);
};

/**
 * Triggers the 'draw' phase of the WebGLRenderer. Iterates through registries
 * to set uniforms, set attributes and issue draw commands for renderables.
 *
 * @method
 *
 * @param {Object} renderState Parameters provided by the compositor, that affect the rendering of all renderables.
 *
 * @return {undefined} undefined
 */
WebGLRenderer.prototype.draw = function draw(renderState) {
    var time = this.compositor.getTime();

    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    this.textureManager.update(time);

    this.meshRegistryKeys = sorter(this.meshRegistry.getKeys(), this.meshRegistry.getKeyToValue());

    this.setGlobalUniforms(renderState);
    this.drawCutouts();
    this.drawMeshes();
};

/**
 * Iterates through and draws all registered meshes. This includes
 * binding textures, handling draw options, setting mesh uniforms
 * and drawing mesh buffers.
 *
 * @method
 *
 * @return {undefined} undefined
 */
WebGLRenderer.prototype.drawMeshes = function drawMeshes() {
    var gl = this.gl;
    var buffers;
    var mesh;

    var meshes = this.meshRegistry.getValues();

    for(var i = 0; i < meshes.length; i++) {
        mesh = meshes[i];

        if (!mesh) continue;

        buffers = this.bufferRegistry.registry[mesh.geometry];

        if (!mesh.visible) continue;

        if (mesh.uniformValues[0] < 1) {
            gl.depthMask(false);
            gl.enable(gl.BLEND);
        }
        else {
            gl.depthMask(true);
            gl.disable(gl.BLEND);
        }

        if (!buffers) continue;

        var j = mesh.textures.length;
        while (j--) this.textureManager.bindTexture(mesh.textures[j]);

        if (mesh.options) this.handleOptions(mesh.options, mesh);

        this.program.setUniforms(mesh.uniformKeys, mesh.uniformValues);
        this.drawBuffers(buffers, mesh.drawType, mesh.geometry);

        if (mesh.options) this.resetOptions(mesh.options);
    }
};

/**
 * Iterates through and draws all registered cutout meshes. Blending
 * is disabled, cutout uniforms are set and finally buffers are drawn.
 *
 * @method
 *
 * @return {undefined} undefined
 */
WebGLRenderer.prototype.drawCutouts = function drawCutouts() {
    var cutout;
    var buffers;
    var cutouts = this.cutoutRegistry.getValues();
    var len = cutouts.length;

    this.gl.disable(this.gl.CULL_FACE);
    this.gl.enable(this.gl.BLEND);
    this.gl.depthMask(true);

    for (var i = 0; i < len; i++) {
        cutout = cutouts[i];

        if (!cutout) continue;

        buffers = this.bufferRegistry.registry[cutout.geometry];

        if (!cutout.visible) continue;

        this.program.setUniforms(cutout.uniformKeys, cutout.uniformValues);
        this.drawBuffers(buffers, cutout.drawType, cutout.geometry);
    }

    this.gl.enable(this.gl.CULL_FACE);
};

/**
 * Sets uniforms to be shared by all meshes.
 *
 * @method
 *
 * @param {Object} renderState Draw state options passed down from compositor.
 *
 * @return {undefined} undefined
 */
WebGLRenderer.prototype.setGlobalUniforms = function setGlobalUniforms(renderState) {
    var light;
    var stride;
    var lights = this.lightRegistry.getValues();
    var len = lights.length;

    for (var i = 0; i < len; i++) {
        light = lights[i];

        if (!light) continue;

        stride = i * 4;

        // Build the light positions' 4x4 matrix

        this.lightPositions[0 + stride] = light.position[0];
        this.lightPositions[1 + stride] = light.position[1];
        this.lightPositions[2 + stride] = light.position[2];

        // Build the light colors' 4x4 matrix

        this.lightColors[0 + stride] = light.color[0];
        this.lightColors[1 + stride] = light.color[1];
        this.lightColors[2 + stride] = light.color[2];
    }

    globalUniforms.values[0] = this.numLights;
    globalUniforms.values[1] = this.ambientLightColor;
    globalUniforms.values[2] = this.lightPositions;
    globalUniforms.values[3] = this.lightColors;

    /*
     * Set time and projection uniforms
     * projecting world space into a 2d plane representation of the canvas.
     * The x and y scale (this.projectionTransform[0] and this.projectionTransform[5] respectively)
     * convert the projected geometry back into clipspace.
     * The perpective divide (this.projectionTransform[11]), adds the z value of the point
     * multiplied by the perspective divide to the w value of the point. In the process
     * of converting from homogenous coordinates to NDC (normalized device coordinates)
     * the x and y values of the point are divided by w, which implements perspective.
     */
    this.projectionTransform[0] = 1 / (this.cachedSize[0] * 0.5);
    this.projectionTransform[5] = -1 / (this.cachedSize[1] * 0.5);
    this.projectionTransform[11] = renderState.perspectiveTransform[11];

    globalUniforms.values[4] = this.projectionTransform;
    globalUniforms.values[5] = this.compositor.getTime() * 0.001;
    globalUniforms.values[6] = renderState.viewTransform;

    this.program.setUniforms(globalUniforms.keys, globalUniforms.values);
};

/**
 * Loads the buffers and issues the draw command for a geometry.
 *
 * @method
 *
 * @param {Object} vertexBuffers All buffers used to draw the geometry.
 * @param {Number} mode Enumerator defining what primitive to draw
 * @param {Number} id ID of geometry being drawn.
 *
 * @return {undefined} undefined
 */
WebGLRenderer.prototype.drawBuffers = function drawBuffers(vertexBuffers, mode, id) {
    var gl = this.gl;
    var length = 0;
    var attribute;
    var location;
    var spacing;
    var offset;
    var buffer;
    var iter;
    var j;
    var i;

    iter = vertexBuffers.keys.length;
    for (i = 0; i < iter; i++) {
        attribute = vertexBuffers.keys[i];

        // Do not set vertexAttribPointer if index buffer.

        if (attribute === 'indices') {
            j = i; continue;
        }

        // Retreive the attribute location and make sure it is enabled.

        location = this.program.attributeLocations[attribute];

        if (location === -1) continue;
        if (location === undefined) {
            location = gl.getAttribLocation(this.program.program, attribute);
            this.program.attributeLocations[attribute] = location;
            if (location === -1) continue;
        }

        if (!this.state.enabledAttributes[attribute]) {
            gl.enableVertexAttribArray(location);
            this.state.enabledAttributes[attribute] = true;
            this.state.enabledAttributesKeys.push(attribute);
        }

        // Retreive buffer information used to set attribute pointer.

        buffer = vertexBuffers.values[i];
        spacing = vertexBuffers.spacing[i];
        offset = vertexBuffers.offset[i];
        length = vertexBuffers.length[i];

        // Skip bindBuffer if buffer is currently bound.

        if (this.state.boundArrayBuffer !== buffer) {
            gl.bindBuffer(buffer.target, buffer.buffer);
            this.state.boundArrayBuffer = buffer;
        }

        if (this.state.lastDrawn !== id) {
            gl.vertexAttribPointer(location, spacing, gl.FLOAT, gl.FALSE, 0, 4 * offset);
        }
    }

    // Disable any attributes that not currently being used.

    var len = this.state.enabledAttributesKeys.length;
    for (i = 0; i < len; i++) {
        var key = this.state.enabledAttributesKeys[i];
        if (this.state.enabledAttributes[key] && vertexBuffers.keys.indexOf(key) === -1) {
            gl.disableVertexAttribArray(this.program.attributeLocations[key]);
            this.state.enabledAttributes[key] = false;
        }
    }

    if (length) {

        // If index buffer, use drawElements.

        if (j !== undefined) {
            buffer = vertexBuffers.values[j];
            offset = vertexBuffers.offset[j];
            spacing = vertexBuffers.spacing[j];
            length = vertexBuffers.length[j];

            // Skip bindBuffer if buffer is currently bound.

            if (this.state.boundElementBuffer !== buffer) {
                gl.bindBuffer(buffer.target, buffer.buffer);
                this.state.boundElementBuffer = buffer;
            }

            gl.drawElements(gl[mode], length, gl.UNSIGNED_SHORT, 2 * offset);
        }
        else {
            gl.drawArrays(gl[mode], 0, length);
        }
    }

    this.state.lastDrawn = id;
};


/**
 * Updates the width and height of parent canvas, sets the viewport size on
 * the WebGL context and updates the resolution uniform for the shader program.
 * Size is retreived from the container object of the renderer.
 *
 * @method
 *
 * @param {Array} size width, height and depth of canvas
 *
 * @return {undefined} undefined
 */
WebGLRenderer.prototype.updateSize = function updateSize(size) {
    if (size) {
        var pixelRatio = window.devicePixelRatio || 1;
        var displayWidth = ~~(size[0] * pixelRatio);
        var displayHeight = ~~(size[1] * pixelRatio);
        this.canvas.width = displayWidth;
        this.canvas.height = displayHeight;
        this.gl.viewport(0, 0, displayWidth, displayHeight);

        this.cachedSize[0] = size[0];
        this.cachedSize[1] = size[1];
        this.cachedSize[2] = (size[0] > size[1]) ? size[0] : size[1];
        this.resolutionValues[0] = this.cachedSize;
    }

    this.program.setUniforms(this.resolutionName, this.resolutionValues);

    return this;
};

/**
 * Updates the state of the WebGL drawing context based on custom parameters
 * defined on a mesh.
 *
 * @method
 *
 * @param {Object} options Draw state options to be set to the context.
 * @param {Mesh} mesh Associated Mesh
 *
 * @return {undefined} undefined
 */
WebGLRenderer.prototype.handleOptions = function handleOptions(options, mesh) {
    var gl = this.gl;
    if (!options) return;

    if (options.blending) gl.enable(gl.BLEND);

    switch (options.side) {
        case 'double':
            this.gl.cullFace(this.gl.FRONT);
            this.drawBuffers(this.bufferRegistry.registry[mesh.geometry], mesh.drawType, mesh.geometry);
            this.gl.cullFace(this.gl.BACK);
            break;
        case 'back':
            gl.cullFace(gl.FRONT);
            break;
    }
};

/**
 * Resets the state of the WebGL drawing context to default values.
 *
 * @method
 *
 * @param {Object} options Draw state options to be set to the context.
 *
 * @return {undefined} undefined
 */
WebGLRenderer.prototype.resetOptions = function resetOptions(options) {
    var gl = this.gl;
    if (!options) return;
    if (options.blending) gl.disable(gl.BLEND);
    if (options.side === 'back') gl.cullFace(gl.BACK);
};

module.exports = WebGLRenderer;

},{"../utilities/Registry":98,"../utilities/keyValueToArrays":102,"./BufferRegistry":131,"./Program":133,"./TextureManager":135,"./compileMaterial":137,"./radixSort":140}],137:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
'use strict';

var types = {
    1: 'float ',
    2: 'vec2 ',
    3: 'vec3 ',
    4: 'vec4 '
};

/**
 * Traverses material to create a string of glsl code to be applied in
 * the vertex or fragment shader.
 *
 * @method
 *
 * @param {Object} material Material to be compiled.
 * @param {Number} textureSlot Next available texture slot for Mesh.
 *
 * @return {undefined} undefined
 */
function compileMaterial(material, textureSlot) {
    var glsl = '';
    var uniforms = {};
    var varyings = {};
    var attributes = {};
    var defines = [];
    var textures = [];

    material.traverse(function (node, depth) {
        if (! node.chunk) return;

        var type = types[_getOutputLength(node)];
        var label = _makeLabel(node);
        var output = _processGLSL(node.chunk.glsl, node.inputs, textures.length + textureSlot);

        glsl += type + label + ' = ' + output + '\n ';

        if (node.uniforms) _extend(uniforms, node.uniforms);
        if (node.varyings) _extend(varyings, node.varyings);
        if (node.attributes) _extend(attributes, node.attributes);
        if (node.chunk.defines) defines.push(node.chunk.defines);
        if (node.texture) textures.push(node.texture);
    });

    return {
        _id: material._id,
        glsl: glsl + 'return ' + _makeLabel(material) + ';',
        defines: defines.join('\n'),
        uniforms: uniforms,
        varyings: varyings,
        attributes: attributes,
        textures: textures
    };
}

// Helper function used to infer length of the output
// from a given material node.
function _getOutputLength(node) {

    // Handle constant values

    if (typeof node === 'number') return 1;
    if (Array.isArray(node)) return node.length;

    // Handle materials

    var output = node.chunk.output;
    if (typeof output === 'number') return output;

    // Handle polymorphic output

    var key = node.inputs.map(function recurse(node) {
        return _getOutputLength(node);
    }).join(',');

    return output[key];
}

// Helper function to run replace inputs and texture tags with
// correct glsl.
function _processGLSL(str, inputs, textureSlot) {
    return str
        .replace(/%\d/g, function (s) {
            return _makeLabel(inputs[s[1]-1]);
        })
        .replace(/\$TEXTURE/, 'u_textures[' + textureSlot + ']');
}

// Helper function used to create glsl definition of the
// input material node.
function _makeLabel (n) {
    if (Array.isArray(n)) return _arrayToVec(n);
    if (typeof n === 'object') return 'fa_' + (n._id);
    else return n.toFixed(6);
}

// Helper to copy the properties of an object onto another object.
function _extend (a, b) {
	for (var k in b) a[k] = b[k];
}

// Helper to create glsl vector representation of a javascript array.
function _arrayToVec(array) {
    var len = array.length;
    return 'vec' + len + '(' + array.join(',')  + ')';
}

module.exports = compileMaterial;

},{}],138:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

/**
 * Generates a checkerboard pattern to be used as a placeholder texture while
 * an image loads over the network.
 *
 * @method  createCheckerBoard
 *
 * @return {HTMLCanvasElement} The `canvas` element that has been used in order
 *                             to generate the pattern.
 */
function createCheckerBoard() {
    var context = document.createElement('canvas').getContext('2d');
    context.canvas.width = context.canvas.height = 128;
    for (var y = 0; y < context.canvas.height; y += 16) {
        for (var x = 0; x < context.canvas.width; x += 16) {
            context.fillStyle = (x ^ y) & 16 ? '#FFF' : '#DDD';
            context.fillRect(x, y, 16, 16);
        }
    }

    return context.canvas;
}

module.exports = createCheckerBoard;

},{}],139:[function(require,module,exports){
/**
 * The MIT License (MIT)
 * 
 * Copyright (c) 2015 Famous Industries Inc.
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

module.exports = {
    Buffer: require('./Buffer'),
    BufferRegistry: require('./BufferRegistry'),
    compileMaterial: require('./compileMaterial'),
    createCheckerboard: require('./createCheckerboard'),
    Debug: require('./Debug'),
    Program: require('./Program'),
    radixSort: require('./radixSort'),
    Texture: require('./Texture'),
    TextureManager: require('./TextureManager'),
    WebGLRenderer: require('./WebGLRenderer')
};

},{"./Buffer":130,"./BufferRegistry":131,"./Debug":132,"./Program":133,"./Texture":134,"./TextureManager":135,"./WebGLRenderer":136,"./compileMaterial":137,"./createCheckerboard":138,"./radixSort":140}],140:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
'use strict';

var radixBits = 11,
    maxRadix = 1 << (radixBits),
    radixMask = maxRadix - 1,
    buckets = new Array(maxRadix * Math.ceil(64 / radixBits)),
    msbMask = 1 << ((32 - 1) % radixBits),
    lastMask = (msbMask << 1) - 1,
    passCount = ((32 / radixBits) + 0.999999999999999) | 0,
    maxOffset = maxRadix * (passCount - 1),
    normalizer = Math.pow(20, 6);

var buffer = new ArrayBuffer(4);
var floatView = new Float32Array(buffer, 0, 1);
var intView = new Int32Array(buffer, 0, 1);

// comparator pulls relevant sorting keys out of mesh
function comp(list, registry, i) {
    var key = list[i];
    var item = registry[key];
    return (item.depth ? item.depth : registry[key].uniformValues[1][14]) + normalizer;
}

//mutator function records mesh's place in previous pass
function mutator(list, registry, i, value) {
    var key = list[i];
    registry[key].depth = intToFloat(value) - normalizer;
    return key;
}

//clean function removes mutator function's record
function clean(list, registry, i) {
    registry[list[i]].depth = null;
}

//converts a javascript float to a 32bit integer using an array buffer
//of size one
function floatToInt(k) {
    floatView[0] = k;
    return intView[0];
}
//converts a 32 bit integer to a regular javascript float using an array buffer
//of size one
function intToFloat(k) {
    intView[0] = k;
    return floatView[0];
}

/**
 * Sorts an array of mesh IDs according to their z-depth.
 *
 * @param  {Array} list         An array of meshes.
 * @param  {Object} registry    A registry mapping the path names to meshes.
 * @return {Array}              An array of the meshes sorted by z-depth.
 */
function radixSort(list, registry) {
    var pass = 0;
    var out = [];

    var i, j, k, n, div, offset, swap, id, sum, tsum, size;

    passCount = ((32 / radixBits) + 0.999999999999999) | 0;

    for (i = 0, n = maxRadix * passCount; i < n; i++) buckets[i] = 0;

    for (i = 0, n = list.length; i < n; i++) {
        div = floatToInt(comp(list, registry, i));
        div ^= div >> 31 | 0x80000000;
        for (j = 0, k = 0; j < maxOffset; j += maxRadix, k += radixBits) {
            buckets[j + (div >>> k & radixMask)]++;
        }
        buckets[j + (div >>> k & lastMask)]++;
    }

    for (j = 0; j <= maxOffset; j += maxRadix) {
        for (id = j, sum = 0; id < j + maxRadix; id++) {
            tsum = buckets[id] + sum;
            buckets[id] = sum - 1;
            sum = tsum;
        }
    }
    if (--passCount) {
        for (i = 0, n = list.length; i < n; i++) {
            div = floatToInt(comp(list, registry, i));
            out[++buckets[div & radixMask]] = mutator(list, registry, i, div ^= div >> 31 | 0x80000000);
        }
        
        swap = out;
        out = list;
        list = swap;
        while (++pass < passCount) {
            for (i = 0, n = list.length, offset = pass * maxRadix, size = pass * radixBits; i < n; i++) {
                div = floatToInt(comp(list, registry, i));
                out[++buckets[offset + (div >>> size & radixMask)]] = list[i];
            }

            swap = out;
            out = list;
            list = swap;
        }
    }

    for (i = 0, n = list.length, offset = pass * maxRadix, size = pass * radixBits; i < n; i++) {
        div = floatToInt(comp(list, registry, i));
        out[++buckets[offset + (div >>> size & lastMask)]] = mutator(list, registry, i, div ^ (~div >> 31 | 0x80000000));
        clean(list, registry, i);
    }

    return out;
}

module.exports = radixSort;

},{}],141:[function(require,module,exports){
/**
 * The MIT License (MIT)
 *
 * Copyright (c) 2015 Famous Industries Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';



var shaders = {
    vertex: "#define GLSLIFY 1\n/**\n * The MIT License (MIT)\n * \n * Copyright (c) 2015 Famous Industries Inc.\n * \n * Permission is hereby granted, free of charge, to any person obtaining a copy\n * of this software and associated documentation files (the \"Software\"), to deal\n * in the Software without restriction, including without limitation the rights\n * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell\n * copies of the Software, and to permit persons to whom the Software is\n * furnished to do so, subject to the following conditions:\n * \n * The above copyright notice and this permission notice shall be included in\n * all copies or substantial portions of the Software.\n * \n * THE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\n * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\n * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\n * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\n * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\n * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN\n * THE SOFTWARE.\n */\n\n/**\n * The MIT License (MIT)\n * \n * Copyright (c) 2015 Famous Industries Inc.\n * \n * Permission is hereby granted, free of charge, to any person obtaining a copy\n * of this software and associated documentation files (the \"Software\"), to deal\n * in the Software without restriction, including without limitation the rights\n * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell\n * copies of the Software, and to permit persons to whom the Software is\n * furnished to do so, subject to the following conditions:\n * \n * The above copyright notice and this permission notice shall be included in\n * all copies or substantial portions of the Software.\n * \n * THE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\n * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\n * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\n * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\n * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\n * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN\n * THE SOFTWARE.\n */\n\n/**\n * Calculates transpose inverse matrix from transform\n * \n * @method random\n * @private\n *\n *\n */\n\n\nmat3 getNormalMatrix_1_0(in mat4 t) {\n   mat3 matNorm;\n   mat4 a = t;\n\n   float a00 = a[0][0], a01 = a[0][1], a02 = a[0][2], a03 = a[0][3],\n   a10 = a[1][0], a11 = a[1][1], a12 = a[1][2], a13 = a[1][3],\n   a20 = a[2][0], a21 = a[2][1], a22 = a[2][2], a23 = a[2][3],\n   a30 = a[3][0], a31 = a[3][1], a32 = a[3][2], a33 = a[3][3],\n   b00 = a00 * a11 - a01 * a10,\n   b01 = a00 * a12 - a02 * a10,\n   b02 = a00 * a13 - a03 * a10,\n   b03 = a01 * a12 - a02 * a11,\n   b04 = a01 * a13 - a03 * a11,\n   b05 = a02 * a13 - a03 * a12,\n   b06 = a20 * a31 - a21 * a30,\n   b07 = a20 * a32 - a22 * a30,\n   b08 = a20 * a33 - a23 * a30,\n   b09 = a21 * a32 - a22 * a31,\n   b10 = a21 * a33 - a23 * a31,\n   b11 = a22 * a33 - a23 * a32,\n\n   det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;\n   det = 1.0 / det;\n\n   matNorm[0][0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;\n   matNorm[0][1] = (a12 * b08 - a10 * b11 - a13 * b07) * det;\n   matNorm[0][2] = (a10 * b10 - a11 * b08 + a13 * b06) * det;\n\n   matNorm[1][0] = (a02 * b10 - a01 * b11 - a03 * b09) * det;\n   matNorm[1][1] = (a00 * b11 - a02 * b08 + a03 * b07) * det;\n   matNorm[1][2] = (a01 * b08 - a00 * b10 - a03 * b06) * det;\n\n   matNorm[2][0] = (a31 * b05 - a32 * b04 + a33 * b03) * det;\n   matNorm[2][1] = (a32 * b02 - a30 * b05 - a33 * b01) * det;\n   matNorm[2][2] = (a30 * b04 - a31 * b02 + a33 * b00) * det;\n\n   return matNorm;\n}\n\n\n\n/**\n * The MIT License (MIT)\n * \n * Copyright (c) 2015 Famous Industries Inc.\n * \n * Permission is hereby granted, free of charge, to any person obtaining a copy\n * of this software and associated documentation files (the \"Software\"), to deal\n * in the Software without restriction, including without limitation the rights\n * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell\n * copies of the Software, and to permit persons to whom the Software is\n * furnished to do so, subject to the following conditions:\n * \n * The above copyright notice and this permission notice shall be included in\n * all copies or substantial portions of the Software.\n * \n * THE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\n * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\n * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\n * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\n * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\n * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN\n * THE SOFTWARE.\n */\n\n/**\n * Calculates a matrix that creates the identity when multiplied by m\n * \n * @method inverse\n * @private\n *\n *\n */\n\n\nfloat inverse_2_1(float m) {\n    return 1.0 / m;\n}\n\nmat2 inverse_2_1(mat2 m) {\n    return mat2(m[1][1],-m[0][1],\n               -m[1][0], m[0][0]) / (m[0][0]*m[1][1] - m[0][1]*m[1][0]);\n}\n\nmat3 inverse_2_1(mat3 m) {\n    float a00 = m[0][0], a01 = m[0][1], a02 = m[0][2];\n    float a10 = m[1][0], a11 = m[1][1], a12 = m[1][2];\n    float a20 = m[2][0], a21 = m[2][1], a22 = m[2][2];\n\n    float b01 =  a22 * a11 - a12 * a21;\n    float b11 = -a22 * a10 + a12 * a20;\n    float b21 =  a21 * a10 - a11 * a20;\n\n    float det = a00 * b01 + a01 * b11 + a02 * b21;\n\n    return mat3(b01, (-a22 * a01 + a02 * a21), (a12 * a01 - a02 * a11),\n                b11, (a22 * a00 - a02 * a20), (-a12 * a00 + a02 * a10),\n                b21, (-a21 * a00 + a01 * a20), (a11 * a00 - a01 * a10)) / det;\n}\n\nmat4 inverse_2_1(mat4 m) {\n    float\n        a00 = m[0][0], a01 = m[0][1], a02 = m[0][2], a03 = m[0][3],\n        a10 = m[1][0], a11 = m[1][1], a12 = m[1][2], a13 = m[1][3],\n        a20 = m[2][0], a21 = m[2][1], a22 = m[2][2], a23 = m[2][3],\n        a30 = m[3][0], a31 = m[3][1], a32 = m[3][2], a33 = m[3][3],\n\n        b00 = a00 * a11 - a01 * a10,\n        b01 = a00 * a12 - a02 * a10,\n        b02 = a00 * a13 - a03 * a10,\n        b03 = a01 * a12 - a02 * a11,\n        b04 = a01 * a13 - a03 * a11,\n        b05 = a02 * a13 - a03 * a12,\n        b06 = a20 * a31 - a21 * a30,\n        b07 = a20 * a32 - a22 * a30,\n        b08 = a20 * a33 - a23 * a30,\n        b09 = a21 * a32 - a22 * a31,\n        b10 = a21 * a33 - a23 * a31,\n        b11 = a22 * a33 - a23 * a32,\n\n        det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;\n\n    return mat4(\n        a11 * b11 - a12 * b10 + a13 * b09,\n        a02 * b10 - a01 * b11 - a03 * b09,\n        a31 * b05 - a32 * b04 + a33 * b03,\n        a22 * b04 - a21 * b05 - a23 * b03,\n        a12 * b08 - a10 * b11 - a13 * b07,\n        a00 * b11 - a02 * b08 + a03 * b07,\n        a32 * b02 - a30 * b05 - a33 * b01,\n        a20 * b05 - a22 * b02 + a23 * b01,\n        a10 * b10 - a11 * b08 + a13 * b06,\n        a01 * b08 - a00 * b10 - a03 * b06,\n        a30 * b04 - a31 * b02 + a33 * b00,\n        a21 * b02 - a20 * b04 - a23 * b00,\n        a11 * b07 - a10 * b09 - a12 * b06,\n        a00 * b09 - a01 * b07 + a02 * b06,\n        a31 * b01 - a30 * b03 - a32 * b00,\n        a20 * b03 - a21 * b01 + a22 * b00) / det;\n}\n\n\n\n/**\n * The MIT License (MIT)\n * \n * Copyright (c) 2015 Famous Industries Inc.\n * \n * Permission is hereby granted, free of charge, to any person obtaining a copy\n * of this software and associated documentation files (the \"Software\"), to deal\n * in the Software without restriction, including without limitation the rights\n * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell\n * copies of the Software, and to permit persons to whom the Software is\n * furnished to do so, subject to the following conditions:\n * \n * The above copyright notice and this permission notice shall be included in\n * all copies or substantial portions of the Software.\n * \n * THE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\n * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\n * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\n * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\n * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\n * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN\n * THE SOFTWARE.\n */\n\n/**\n * Reflects a matrix over its main diagonal.\n * \n * @method transpose\n * @private\n *\n *\n */\n\n\nfloat transpose_3_2(float m) {\n    return m;\n}\n\nmat2 transpose_3_2(mat2 m) {\n    return mat2(m[0][0], m[1][0],\n                m[0][1], m[1][1]);\n}\n\nmat3 transpose_3_2(mat3 m) {\n    return mat3(m[0][0], m[1][0], m[2][0],\n                m[0][1], m[1][1], m[2][1],\n                m[0][2], m[1][2], m[2][2]);\n}\n\nmat4 transpose_3_2(mat4 m) {\n    return mat4(m[0][0], m[1][0], m[2][0], m[3][0],\n                m[0][1], m[1][1], m[2][1], m[3][1],\n                m[0][2], m[1][2], m[2][2], m[3][2],\n                m[0][3], m[1][3], m[2][3], m[3][3]);\n}\n\n\n\n\n/**\n * Converts vertex from modelspace to screenspace using transform\n * information from context.\n *\n * @method applyTransform\n * @private\n *\n *\n */\n\nvec4 applyTransform(vec4 pos) {\n    //TODO: move this multiplication to application code. \n\n    /**\n     * Currently multiplied in the vertex shader to avoid consuming the complexity of holding an additional\n     * transform as state on the mesh object in WebGLRenderer. Multiplies the object's transformation from object space\n     * to world space with its transformation from world space to eye space.\n     */\n    mat4 MVMatrix = u_view * u_transform;\n\n    //TODO: move the origin, sizeScale and y axis inversion to application code in order to amortize redundant per-vertex calculations.\n\n    /**\n     * The transform uniform should be changed to the result of the transformation chain:\n     *\n     * view * modelTransform * invertYAxis * sizeScale * origin\n     *\n     * which could be simplified to:\n     *\n     * view * modelTransform * convertToDOMSpace\n     *\n     * where convertToDOMSpace represents the transform matrix:\n     *\n     *                           size.x 0       0       size.x \n     *                           0      -size.y 0       size.y\n     *                           0      0       1       0\n     *                           0      0       0       1\n     *\n     */\n\n    /**\n     * Assuming a unit volume, moves the object space origin [0, 0, 0] to the \"top left\" [1, -1, 0], the DOM space origin.\n     * Later in the transformation chain, the projection transform negates the rigidbody translation.\n     * Equivalent to (but much faster than) multiplying a translation matrix \"origin\"\n     *\n     *                           1 0 0 1 \n     *                           0 1 0 -1\n     *                           0 0 1 0\n     *                           0 0 0 1\n     *\n     * in the transform chain: projection * view * modelTransform * invertYAxis * sizeScale * origin * positionVector.\n     */\n    pos.x += 1.0;\n    pos.y -= 1.0;\n\n    /**\n     * Assuming a unit volume, scales an object to the amount of pixels in the size uniform vector's specified dimensions.\n     * Later in the transformation chain, the projection transform transforms the point into clip space by scaling\n     * by the inverse of the canvas' resolution.\n     * Equivalent to (but much faster than) multiplying a scale matrix \"sizeScale\"\n     *\n     *                           size.x 0      0      0 \n     *                           0      size.y 0      0\n     *                           0      0      size.z 0\n     *                           0      0      0      1\n     *\n     * in the transform chain: projection * view * modelTransform * invertYAxis * sizeScale * origin * positionVector.\n     */\n    pos.xyz *= u_size * 0.5;\n\n    /**\n     * Inverts the object space's y axis in order to match DOM space conventions. \n     * Later in the transformation chain, the projection transform reinverts the y axis to convert to clip space.\n     * Equivalent to (but much faster than) multiplying a scale matrix \"invertYAxis\"\n     *\n     *                           1 0 0 0 \n     *                           0 -1 0 0\n     *                           0 0 1 0\n     *                           0 0 0 1\n     *\n     * in the transform chain: projection * view * modelTransform * invertYAxis * sizeScale * origin * positionVector.\n     */\n    pos.y *= -1.0;\n\n    /**\n     * Exporting the vertex's position as a varying, in DOM space, to be used for lighting calculations. This has to be in DOM space\n     * since light position and direction is derived from the scene graph, calculated in DOM space.\n     */\n\n    v_position = (MVMatrix * pos).xyz;\n\n    /**\n    * Exporting the eye vector (a vector from the center of the screen) as a varying, to be used for lighting calculations.\n    * In clip space deriving the eye vector is a matter of simply taking the inverse of the position, as the position is a vector\n    * from the center of the screen. However, since our points are represented in DOM space,\n    * the position is a vector from the top left corner of the screen, so some additional math is needed (specifically, subtracting\n    * the position from the center of the screen, i.e. half the resolution of the canvas).\n    */\n\n    v_eyeVector = (u_resolution * 0.5) - v_position;\n\n    /**\n     * Transforming the position (currently represented in dom space) into view space (with our dom space view transform)\n     * and then projecting the point into raster both by applying a perspective transformation and converting to clip space\n     * (the perspective matrix is a combination of both transformations, therefore it's probably more apt to refer to it as a\n     * projection transform).\n     */\n\n    pos = u_perspective * MVMatrix * pos;\n\n    return pos;\n}\n\n/**\n * Placeholder for positionOffset chunks to be templated in.\n * Used for mesh deformation.\n *\n * @method calculateOffset\n * @private\n *\n *\n */\n#vert_definitions\nvec3 calculateOffset(vec3 ID) {\n    #vert_applications\n    return vec3(0.0);\n}\n\n/**\n * Writes the position of the vertex onto the screen.\n * Passes texture coordinate and normal attributes as varyings\n * and passes the position attribute through position pipeline.\n *\n * @method main\n * @private\n *\n *\n */\nvoid main() {\n    v_textureCoordinate = a_texCoord;\n    vec3 invertedNormals = a_normals + (u_normals.x < 0.0 ? calculateOffset(u_normals) * 2.0 - 1.0 : vec3(0.0));\n    invertedNormals.y *= -1.0;\n    v_normal = transpose_3_2(mat3(inverse_2_1(u_transform))) * invertedNormals;\n    vec3 offsetPos = a_pos + calculateOffset(u_positionOffset);\n    gl_Position = applyTransform(vec4(offsetPos, 1.0));\n}\n",
    fragment: "#define GLSLIFY 1\n/**\n * The MIT License (MIT)\n * \n * Copyright (c) 2015 Famous Industries Inc.\n * \n * Permission is hereby granted, free of charge, to any person obtaining a copy\n * of this software and associated documentation files (the \"Software\"), to deal\n * in the Software without restriction, including without limitation the rights\n * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell\n * copies of the Software, and to permit persons to whom the Software is\n * furnished to do so, subject to the following conditions:\n * \n * The above copyright notice and this permission notice shall be included in\n * all copies or substantial portions of the Software.\n * \n * THE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\n * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\n * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\n * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\n * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\n * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN\n * THE SOFTWARE.\n */\n\n/**\n * The MIT License (MIT)\n * \n * Copyright (c) 2015 Famous Industries Inc.\n * \n * Permission is hereby granted, free of charge, to any person obtaining a copy\n * of this software and associated documentation files (the \"Software\"), to deal\n * in the Software without restriction, including without limitation the rights\n * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell\n * copies of the Software, and to permit persons to whom the Software is\n * furnished to do so, subject to the following conditions:\n * \n * The above copyright notice and this permission notice shall be included in\n * all copies or substantial portions of the Software.\n * \n * THE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\n * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\n * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\n * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\n * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\n * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN\n * THE SOFTWARE.\n */\n\n/**\n * Placeholder for fragmentShader  chunks to be templated in.\n * Used for normal mapping, gloss mapping and colors.\n * \n * @method applyMaterial\n * @private\n *\n *\n */\n\n#float_definitions\nfloat applyMaterial_1_0(float ID) {\n    #float_applications\n    return 1.;\n}\n\n#vec3_definitions\nvec3 applyMaterial_1_0(vec3 ID) {\n    #vec3_applications\n    return vec3(0);\n}\n\n#vec4_definitions\nvec4 applyMaterial_1_0(vec4 ID) {\n    #vec4_applications\n\n    return vec4(0);\n}\n\n\n\n/**\n * The MIT License (MIT)\n * \n * Copyright (c) 2015 Famous Industries Inc.\n * \n * Permission is hereby granted, free of charge, to any person obtaining a copy\n * of this software and associated documentation files (the \"Software\"), to deal\n * in the Software without restriction, including without limitation the rights\n * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell\n * copies of the Software, and to permit persons to whom the Software is\n * furnished to do so, subject to the following conditions:\n * \n * The above copyright notice and this permission notice shall be included in\n * all copies or substantial portions of the Software.\n * \n * THE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR\n * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,\n * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE\n * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER\n * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,\n * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN\n * THE SOFTWARE.\n */\n\n/**\n * Calculates the intensity of light on a surface.\n *\n * @method applyLight\n * @private\n *\n */\nvec4 applyLight_2_1(in vec4 baseColor, in vec3 normal, in vec4 glossiness, int numLights, vec3 ambientColor, vec3 eyeVector, mat4 lightPosition, mat4 lightColor, vec3 v_position) {\n    vec3 diffuse = vec3(0.0);\n    bool hasGlossiness = glossiness.a > 0.0;\n    bool hasSpecularColor = length(glossiness.rgb) > 0.0;\n\n    for(int i = 0; i < 4; i++) {\n        if (i >= numLights) break;\n        vec3 lightDirection = normalize(lightPosition[i].xyz - v_position);\n        float lambertian = max(dot(lightDirection, normal), 0.0);\n\n        if (lambertian > 0.0) {\n            diffuse += lightColor[i].rgb * baseColor.rgb * lambertian;\n            if (hasGlossiness) {\n                vec3 halfVector = normalize(lightDirection + eyeVector);\n                float specularWeight = pow(max(dot(halfVector, normal), 0.0), glossiness.a);\n                vec3 specularColor = hasSpecularColor ? glossiness.rgb : lightColor[i].rgb;\n                diffuse += specularColor * specularWeight * lambertian;\n            }\n        }\n\n    }\n\n    return vec4(ambientColor + diffuse, baseColor.a);\n}\n\n\n\n\n\n/**\n * Writes the color of the pixel onto the screen\n *\n * @method main\n * @private\n *\n *\n */\nvoid main() {\n    vec4 material = u_baseColor.r >= 0.0 ? u_baseColor : applyMaterial_1_0(u_baseColor);\n\n    /**\n     * Apply lights only if flat shading is false\n     * and at least one light is added to the scene\n     */\n    bool lightsEnabled = (u_flatShading == 0.0) && (u_numLights > 0.0 || length(u_ambientLight) > 0.0);\n\n    vec3 normal = normalize(v_normal);\n    vec4 glossiness = u_glossiness.x < 0.0 ? applyMaterial_1_0(u_glossiness) : u_glossiness;\n\n    vec4 color = lightsEnabled ?\n    applyLight_2_1(material, normalize(v_normal), glossiness,\n               int(u_numLights),\n               u_ambientLight * u_baseColor.rgb,\n               normalize(v_eyeVector),\n               u_lightPosition,\n               u_lightColor,   \n               v_position)\n    : material;\n\n    gl_FragColor = color;\n    gl_FragColor.a *= u_opacity;   \n}\n"
};

module.exports = shaders;

},{}],142:[function(require,module,exports){
//     Underscore.js 1.8.3
//     http://underscorejs.org
//     (c) 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `exports` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var
    push             = ArrayProto.push,
    slice            = ArrayProto.slice,
    toString         = ObjProto.toString,
    hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind,
    nativeCreate       = Object.create;

  // Naked function reference for surrogate-prototype-swapping.
  var Ctor = function(){};

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  // Current version.
  _.VERSION = '1.8.3';

  // Internal function that returns an efficient (for current engines) version
  // of the passed-in callback, to be repeatedly applied in other Underscore
  // functions.
  var optimizeCb = function(func, context, argCount) {
    if (context === void 0) return func;
    switch (argCount == null ? 3 : argCount) {
      case 1: return function(value) {
        return func.call(context, value);
      };
      case 2: return function(value, other) {
        return func.call(context, value, other);
      };
      case 3: return function(value, index, collection) {
        return func.call(context, value, index, collection);
      };
      case 4: return function(accumulator, value, index, collection) {
        return func.call(context, accumulator, value, index, collection);
      };
    }
    return function() {
      return func.apply(context, arguments);
    };
  };

  // A mostly-internal function to generate callbacks that can be applied
  // to each element in a collection, returning the desired result — either
  // identity, an arbitrary callback, a property matcher, or a property accessor.
  var cb = function(value, context, argCount) {
    if (value == null) return _.identity;
    if (_.isFunction(value)) return optimizeCb(value, context, argCount);
    if (_.isObject(value)) return _.matcher(value);
    return _.property(value);
  };
  _.iteratee = function(value, context) {
    return cb(value, context, Infinity);
  };

  // An internal function for creating assigner functions.
  var createAssigner = function(keysFunc, undefinedOnly) {
    return function(obj) {
      var length = arguments.length;
      if (length < 2 || obj == null) return obj;
      for (var index = 1; index < length; index++) {
        var source = arguments[index],
            keys = keysFunc(source),
            l = keys.length;
        for (var i = 0; i < l; i++) {
          var key = keys[i];
          if (!undefinedOnly || obj[key] === void 0) obj[key] = source[key];
        }
      }
      return obj;
    };
  };

  // An internal function for creating a new object that inherits from another.
  var baseCreate = function(prototype) {
    if (!_.isObject(prototype)) return {};
    if (nativeCreate) return nativeCreate(prototype);
    Ctor.prototype = prototype;
    var result = new Ctor;
    Ctor.prototype = null;
    return result;
  };

  var property = function(key) {
    return function(obj) {
      return obj == null ? void 0 : obj[key];
    };
  };

  // Helper for collection methods to determine whether a collection
  // should be iterated as an array or as an object
  // Related: http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
  // Avoids a very nasty iOS 8 JIT bug on ARM-64. #2094
  var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
  var getLength = property('length');
  var isArrayLike = function(collection) {
    var length = getLength(collection);
    return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
  };

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles raw objects in addition to array-likes. Treats all
  // sparse array-likes as if they were dense.
  _.each = _.forEach = function(obj, iteratee, context) {
    iteratee = optimizeCb(iteratee, context);
    var i, length;
    if (isArrayLike(obj)) {
      for (i = 0, length = obj.length; i < length; i++) {
        iteratee(obj[i], i, obj);
      }
    } else {
      var keys = _.keys(obj);
      for (i = 0, length = keys.length; i < length; i++) {
        iteratee(obj[keys[i]], keys[i], obj);
      }
    }
    return obj;
  };

  // Return the results of applying the iteratee to each element.
  _.map = _.collect = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length,
        results = Array(length);
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      results[index] = iteratee(obj[currentKey], currentKey, obj);
    }
    return results;
  };

  // Create a reducing function iterating left or right.
  function createReduce(dir) {
    // Optimized iterator function as using arguments.length
    // in the main function will deoptimize the, see #1991.
    function iterator(obj, iteratee, memo, keys, index, length) {
      for (; index >= 0 && index < length; index += dir) {
        var currentKey = keys ? keys[index] : index;
        memo = iteratee(memo, obj[currentKey], currentKey, obj);
      }
      return memo;
    }

    return function(obj, iteratee, memo, context) {
      iteratee = optimizeCb(iteratee, context, 4);
      var keys = !isArrayLike(obj) && _.keys(obj),
          length = (keys || obj).length,
          index = dir > 0 ? 0 : length - 1;
      // Determine the initial value if none is provided.
      if (arguments.length < 3) {
        memo = obj[keys ? keys[index] : index];
        index += dir;
      }
      return iterator(obj, iteratee, memo, keys, index, length);
    };
  }

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`.
  _.reduce = _.foldl = _.inject = createReduce(1);

  // The right-associative version of reduce, also known as `foldr`.
  _.reduceRight = _.foldr = createReduce(-1);

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, predicate, context) {
    var key;
    if (isArrayLike(obj)) {
      key = _.findIndex(obj, predicate, context);
    } else {
      key = _.findKey(obj, predicate, context);
    }
    if (key !== void 0 && key !== -1) return obj[key];
  };

  // Return all the elements that pass a truth test.
  // Aliased as `select`.
  _.filter = _.select = function(obj, predicate, context) {
    var results = [];
    predicate = cb(predicate, context);
    _.each(obj, function(value, index, list) {
      if (predicate(value, index, list)) results.push(value);
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, predicate, context) {
    return _.filter(obj, _.negate(cb(predicate)), context);
  };

  // Determine whether all of the elements match a truth test.
  // Aliased as `all`.
  _.every = _.all = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length;
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      if (!predicate(obj[currentKey], currentKey, obj)) return false;
    }
    return true;
  };

  // Determine if at least one element in the object matches a truth test.
  // Aliased as `any`.
  _.some = _.any = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length;
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      if (predicate(obj[currentKey], currentKey, obj)) return true;
    }
    return false;
  };

  // Determine if the array or object contains a given item (using `===`).
  // Aliased as `includes` and `include`.
  _.contains = _.includes = _.include = function(obj, item, fromIndex, guard) {
    if (!isArrayLike(obj)) obj = _.values(obj);
    if (typeof fromIndex != 'number' || guard) fromIndex = 0;
    return _.indexOf(obj, item, fromIndex) >= 0;
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    var isFunc = _.isFunction(method);
    return _.map(obj, function(value) {
      var func = isFunc ? method : value[method];
      return func == null ? func : func.apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, _.property(key));
  };

  // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.
  _.where = function(obj, attrs) {
    return _.filter(obj, _.matcher(attrs));
  };

  // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.
  _.findWhere = function(obj, attrs) {
    return _.find(obj, _.matcher(attrs));
  };

  // Return the maximum element (or element-based computation).
  _.max = function(obj, iteratee, context) {
    var result = -Infinity, lastComputed = -Infinity,
        value, computed;
    if (iteratee == null && obj != null) {
      obj = isArrayLike(obj) ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value > result) {
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index, list) {
        computed = iteratee(value, index, list);
        if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
          result = value;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iteratee, context) {
    var result = Infinity, lastComputed = Infinity,
        value, computed;
    if (iteratee == null && obj != null) {
      obj = isArrayLike(obj) ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value < result) {
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index, list) {
        computed = iteratee(value, index, list);
        if (computed < lastComputed || computed === Infinity && result === Infinity) {
          result = value;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Shuffle a collection, using the modern version of the
  // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
  _.shuffle = function(obj) {
    var set = isArrayLike(obj) ? obj : _.values(obj);
    var length = set.length;
    var shuffled = Array(length);
    for (var index = 0, rand; index < length; index++) {
      rand = _.random(0, index);
      if (rand !== index) shuffled[index] = shuffled[rand];
      shuffled[rand] = set[index];
    }
    return shuffled;
  };

  // Sample **n** random values from a collection.
  // If **n** is not specified, returns a single random element.
  // The internal `guard` argument allows it to work with `map`.
  _.sample = function(obj, n, guard) {
    if (n == null || guard) {
      if (!isArrayLike(obj)) obj = _.values(obj);
      return obj[_.random(obj.length - 1)];
    }
    return _.shuffle(obj).slice(0, Math.max(0, n));
  };

  // Sort the object's values by a criterion produced by an iteratee.
  _.sortBy = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value: value,
        index: index,
        criteria: iteratee(value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index - right.index;
    }), 'value');
  };

  // An internal function used for aggregate "group by" operations.
  var group = function(behavior) {
    return function(obj, iteratee, context) {
      var result = {};
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index) {
        var key = iteratee(value, index, obj);
        behavior(result, value, key);
      });
      return result;
    };
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = group(function(result, value, key) {
    if (_.has(result, key)) result[key].push(value); else result[key] = [value];
  });

  // Indexes the object's values by a criterion, similar to `groupBy`, but for
  // when you know that your index values will be unique.
  _.indexBy = group(function(result, value, key) {
    result[key] = value;
  });

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = group(function(result, value, key) {
    if (_.has(result, key)) result[key]++; else result[key] = 1;
  });

  // Safely create a real, live array from anything iterable.
  _.toArray = function(obj) {
    if (!obj) return [];
    if (_.isArray(obj)) return slice.call(obj);
    if (isArrayLike(obj)) return _.map(obj, _.identity);
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    if (obj == null) return 0;
    return isArrayLike(obj) ? obj.length : _.keys(obj).length;
  };

  // Split a collection into two arrays: one whose elements all satisfy the given
  // predicate, and one whose elements all do not satisfy the predicate.
  _.partition = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var pass = [], fail = [];
    _.each(obj, function(value, key, obj) {
      (predicate(value, key, obj) ? pass : fail).push(value);
    });
    return [pass, fail];
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    if (array == null) return void 0;
    if (n == null || guard) return array[0];
    return _.initial(array, array.length - n);
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array.
  _.last = function(array, n, guard) {
    if (array == null) return void 0;
    if (n == null || guard) return array[array.length - 1];
    return _.rest(array, Math.max(0, array.length - n));
  };

  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
  // Especially useful on the arguments object. Passing an **n** will return
  // the rest N values in the array.
  _.rest = _.tail = _.drop = function(array, n, guard) {
    return slice.call(array, n == null || guard ? 1 : n);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, _.identity);
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = function(input, shallow, strict, startIndex) {
    var output = [], idx = 0;
    for (var i = startIndex || 0, length = getLength(input); i < length; i++) {
      var value = input[i];
      if (isArrayLike(value) && (_.isArray(value) || _.isArguments(value))) {
        //flatten current level of array or arguments object
        if (!shallow) value = flatten(value, shallow, strict);
        var j = 0, len = value.length;
        output.length += len;
        while (j < len) {
          output[idx++] = value[j++];
        }
      } else if (!strict) {
        output[idx++] = value;
      }
    }
    return output;
  };

  // Flatten out an array, either recursively (by default), or just one level.
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, false);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iteratee, context) {
    if (!_.isBoolean(isSorted)) {
      context = iteratee;
      iteratee = isSorted;
      isSorted = false;
    }
    if (iteratee != null) iteratee = cb(iteratee, context);
    var result = [];
    var seen = [];
    for (var i = 0, length = getLength(array); i < length; i++) {
      var value = array[i],
          computed = iteratee ? iteratee(value, i, array) : value;
      if (isSorted) {
        if (!i || seen !== computed) result.push(value);
        seen = computed;
      } else if (iteratee) {
        if (!_.contains(seen, computed)) {
          seen.push(computed);
          result.push(value);
        }
      } else if (!_.contains(result, value)) {
        result.push(value);
      }
    }
    return result;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(flatten(arguments, true, true));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function(array) {
    var result = [];
    var argsLength = arguments.length;
    for (var i = 0, length = getLength(array); i < length; i++) {
      var item = array[i];
      if (_.contains(result, item)) continue;
      for (var j = 1; j < argsLength; j++) {
        if (!_.contains(arguments[j], item)) break;
      }
      if (j === argsLength) result.push(item);
    }
    return result;
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = flatten(arguments, true, true, 1);
    return _.filter(array, function(value){
      return !_.contains(rest, value);
    });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    return _.unzip(arguments);
  };

  // Complement of _.zip. Unzip accepts an array of arrays and groups
  // each array's elements on shared indices
  _.unzip = function(array) {
    var length = array && _.max(array, getLength).length || 0;
    var result = Array(length);

    for (var index = 0; index < length; index++) {
      result[index] = _.pluck(array, index);
    }
    return result;
  };

  // Converts lists into objects. Pass either a single array of `[key, value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values.
  _.object = function(list, values) {
    var result = {};
    for (var i = 0, length = getLength(list); i < length; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  };

  // Generator function to create the findIndex and findLastIndex functions
  function createPredicateIndexFinder(dir) {
    return function(array, predicate, context) {
      predicate = cb(predicate, context);
      var length = getLength(array);
      var index = dir > 0 ? 0 : length - 1;
      for (; index >= 0 && index < length; index += dir) {
        if (predicate(array[index], index, array)) return index;
      }
      return -1;
    };
  }

  // Returns the first index on an array-like that passes a predicate test
  _.findIndex = createPredicateIndexFinder(1);
  _.findLastIndex = createPredicateIndexFinder(-1);

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iteratee, context) {
    iteratee = cb(iteratee, context, 1);
    var value = iteratee(obj);
    var low = 0, high = getLength(array);
    while (low < high) {
      var mid = Math.floor((low + high) / 2);
      if (iteratee(array[mid]) < value) low = mid + 1; else high = mid;
    }
    return low;
  };

  // Generator function to create the indexOf and lastIndexOf functions
  function createIndexFinder(dir, predicateFind, sortedIndex) {
    return function(array, item, idx) {
      var i = 0, length = getLength(array);
      if (typeof idx == 'number') {
        if (dir > 0) {
            i = idx >= 0 ? idx : Math.max(idx + length, i);
        } else {
            length = idx >= 0 ? Math.min(idx + 1, length) : idx + length + 1;
        }
      } else if (sortedIndex && idx && length) {
        idx = sortedIndex(array, item);
        return array[idx] === item ? idx : -1;
      }
      if (item !== item) {
        idx = predicateFind(slice.call(array, i, length), _.isNaN);
        return idx >= 0 ? idx + i : -1;
      }
      for (idx = dir > 0 ? i : length - 1; idx >= 0 && idx < length; idx += dir) {
        if (array[idx] === item) return idx;
      }
      return -1;
    };
  }

  // Return the position of the first occurrence of an item in an array,
  // or -1 if the item is not included in the array.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = createIndexFinder(1, _.findIndex, _.sortedIndex);
  _.lastIndexOf = createIndexFinder(-1, _.findLastIndex);

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (stop == null) {
      stop = start || 0;
      start = 0;
    }
    step = step || 1;

    var length = Math.max(Math.ceil((stop - start) / step), 0);
    var range = Array(length);

    for (var idx = 0; idx < length; idx++, start += step) {
      range[idx] = start;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Determines whether to execute a function as a constructor
  // or a normal function with the provided arguments
  var executeBound = function(sourceFunc, boundFunc, context, callingContext, args) {
    if (!(callingContext instanceof boundFunc)) return sourceFunc.apply(context, args);
    var self = baseCreate(sourceFunc.prototype);
    var result = sourceFunc.apply(self, args);
    if (_.isObject(result)) return result;
    return self;
  };

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
  // available.
  _.bind = function(func, context) {
    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError('Bind must be called on a function');
    var args = slice.call(arguments, 2);
    var bound = function() {
      return executeBound(func, bound, context, this, args.concat(slice.call(arguments)));
    };
    return bound;
  };

  // Partially apply a function by creating a version that has had some of its
  // arguments pre-filled, without changing its dynamic `this` context. _ acts
  // as a placeholder, allowing any combination of arguments to be pre-filled.
  _.partial = function(func) {
    var boundArgs = slice.call(arguments, 1);
    var bound = function() {
      var position = 0, length = boundArgs.length;
      var args = Array(length);
      for (var i = 0; i < length; i++) {
        args[i] = boundArgs[i] === _ ? arguments[position++] : boundArgs[i];
      }
      while (position < arguments.length) args.push(arguments[position++]);
      return executeBound(func, bound, this, this, args);
    };
    return bound;
  };

  // Bind a number of an object's methods to that object. Remaining arguments
  // are the method names to be bound. Useful for ensuring that all callbacks
  // defined on an object belong to it.
  _.bindAll = function(obj) {
    var i, length = arguments.length, key;
    if (length <= 1) throw new Error('bindAll must be passed function names');
    for (i = 1; i < length; i++) {
      key = arguments[i];
      obj[key] = _.bind(obj[key], obj);
    }
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memoize = function(key) {
      var cache = memoize.cache;
      var address = '' + (hasher ? hasher.apply(this, arguments) : key);
      if (!_.has(cache, address)) cache[address] = func.apply(this, arguments);
      return cache[address];
    };
    memoize.cache = {};
    return memoize;
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){
      return func.apply(null, args);
    }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = _.partial(_.delay, _, 1);

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time. Normally, the throttled function will run
  // as much as it can, without ever going more than once per `wait` duration;
  // but if you'd like to disable the execution on the leading edge, pass
  // `{leading: false}`. To disable execution on the trailing edge, ditto.
  _.throttle = function(func, wait, options) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    if (!options) options = {};
    var later = function() {
      previous = options.leading === false ? 0 : _.now();
      timeout = null;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    };
    return function() {
      var now = _.now();
      if (!previous && options.leading === false) previous = now;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0 || remaining > wait) {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
        previous = now;
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout, args, context, timestamp, result;

    var later = function() {
      var last = _.now() - timestamp;

      if (last < wait && last >= 0) {
        timeout = setTimeout(later, wait - last);
      } else {
        timeout = null;
        if (!immediate) {
          result = func.apply(context, args);
          if (!timeout) context = args = null;
        }
      }
    };

    return function() {
      context = this;
      args = arguments;
      timestamp = _.now();
      var callNow = immediate && !timeout;
      if (!timeout) timeout = setTimeout(later, wait);
      if (callNow) {
        result = func.apply(context, args);
        context = args = null;
      }

      return result;
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return _.partial(wrapper, func);
  };

  // Returns a negated version of the passed-in predicate.
  _.negate = function(predicate) {
    return function() {
      return !predicate.apply(this, arguments);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var args = arguments;
    var start = args.length - 1;
    return function() {
      var i = start;
      var result = args[start].apply(this, arguments);
      while (i--) result = args[i].call(this, result);
      return result;
    };
  };

  // Returns a function that will only be executed on and after the Nth call.
  _.after = function(times, func) {
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Returns a function that will only be executed up to (but not including) the Nth call.
  _.before = function(times, func) {
    var memo;
    return function() {
      if (--times > 0) {
        memo = func.apply(this, arguments);
      }
      if (times <= 1) func = null;
      return memo;
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = _.partial(_.before, 2);

  // Object Functions
  // ----------------

  // Keys in IE < 9 that won't be iterated by `for key in ...` and thus missed.
  var hasEnumBug = !{toString: null}.propertyIsEnumerable('toString');
  var nonEnumerableProps = ['valueOf', 'isPrototypeOf', 'toString',
                      'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'];

  function collectNonEnumProps(obj, keys) {
    var nonEnumIdx = nonEnumerableProps.length;
    var constructor = obj.constructor;
    var proto = (_.isFunction(constructor) && constructor.prototype) || ObjProto;

    // Constructor is a special case.
    var prop = 'constructor';
    if (_.has(obj, prop) && !_.contains(keys, prop)) keys.push(prop);

    while (nonEnumIdx--) {
      prop = nonEnumerableProps[nonEnumIdx];
      if (prop in obj && obj[prop] !== proto[prop] && !_.contains(keys, prop)) {
        keys.push(prop);
      }
    }
  }

  // Retrieve the names of an object's own properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = function(obj) {
    if (!_.isObject(obj)) return [];
    if (nativeKeys) return nativeKeys(obj);
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys.push(key);
    // Ahem, IE < 9.
    if (hasEnumBug) collectNonEnumProps(obj, keys);
    return keys;
  };

  // Retrieve all the property names of an object.
  _.allKeys = function(obj) {
    if (!_.isObject(obj)) return [];
    var keys = [];
    for (var key in obj) keys.push(key);
    // Ahem, IE < 9.
    if (hasEnumBug) collectNonEnumProps(obj, keys);
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var values = Array(length);
    for (var i = 0; i < length; i++) {
      values[i] = obj[keys[i]];
    }
    return values;
  };

  // Returns the results of applying the iteratee to each element of the object
  // In contrast to _.map it returns an object
  _.mapObject = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    var keys =  _.keys(obj),
          length = keys.length,
          results = {},
          currentKey;
      for (var index = 0; index < length; index++) {
        currentKey = keys[index];
        results[currentKey] = iteratee(obj[currentKey], currentKey, obj);
      }
      return results;
  };

  // Convert an object into a list of `[key, value]` pairs.
  _.pairs = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var pairs = Array(length);
    for (var i = 0; i < length; i++) {
      pairs[i] = [keys[i], obj[keys[i]]];
    }
    return pairs;
  };

  // Invert the keys and values of an object. The values must be serializable.
  _.invert = function(obj) {
    var result = {};
    var keys = _.keys(obj);
    for (var i = 0, length = keys.length; i < length; i++) {
      result[obj[keys[i]]] = keys[i];
    }
    return result;
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = createAssigner(_.allKeys);

  // Assigns a given object with all the own properties in the passed-in object(s)
  // (https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
  _.extendOwn = _.assign = createAssigner(_.keys);

  // Returns the first key on an object that passes a predicate test
  _.findKey = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = _.keys(obj), key;
    for (var i = 0, length = keys.length; i < length; i++) {
      key = keys[i];
      if (predicate(obj[key], key, obj)) return key;
    }
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function(object, oiteratee, context) {
    var result = {}, obj = object, iteratee, keys;
    if (obj == null) return result;
    if (_.isFunction(oiteratee)) {
      keys = _.allKeys(obj);
      iteratee = optimizeCb(oiteratee, context);
    } else {
      keys = flatten(arguments, false, false, 1);
      iteratee = function(value, key, obj) { return key in obj; };
      obj = Object(obj);
    }
    for (var i = 0, length = keys.length; i < length; i++) {
      var key = keys[i];
      var value = obj[key];
      if (iteratee(value, key, obj)) result[key] = value;
    }
    return result;
  };

   // Return a copy of the object without the blacklisted properties.
  _.omit = function(obj, iteratee, context) {
    if (_.isFunction(iteratee)) {
      iteratee = _.negate(iteratee);
    } else {
      var keys = _.map(flatten(arguments, false, false, 1), String);
      iteratee = function(value, key) {
        return !_.contains(keys, key);
      };
    }
    return _.pick(obj, iteratee, context);
  };

  // Fill in a given object with default properties.
  _.defaults = createAssigner(_.allKeys, true);

  // Creates an object that inherits from the given prototype object.
  // If additional properties are provided then they will be added to the
  // created object.
  _.create = function(prototype, props) {
    var result = baseCreate(prototype);
    if (props) _.extendOwn(result, props);
    return result;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Returns whether an object has a given set of `key:value` pairs.
  _.isMatch = function(object, attrs) {
    var keys = _.keys(attrs), length = keys.length;
    if (object == null) return !length;
    var obj = Object(object);
    for (var i = 0; i < length; i++) {
      var key = keys[i];
      if (attrs[key] !== obj[key] || !(key in obj)) return false;
    }
    return true;
  };


  // Internal recursive comparison function for `isEqual`.
  var eq = function(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) return a !== 0 || 1 / a === 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className !== toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, regular expressions, dates, and booleans are compared by value.
      case '[object RegExp]':
      // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return '' + a === '' + b;
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive.
        // Object(NaN) is equivalent to NaN
        if (+a !== +a) return +b !== +b;
        // An `egal` comparison is performed for other numeric values.
        return +a === 0 ? 1 / +a === 1 / b : +a === +b;
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a === +b;
    }

    var areArrays = className === '[object Array]';
    if (!areArrays) {
      if (typeof a != 'object' || typeof b != 'object') return false;

      // Objects with different constructors are not equivalent, but `Object`s or `Array`s
      // from different frames are.
      var aCtor = a.constructor, bCtor = b.constructor;
      if (aCtor !== bCtor && !(_.isFunction(aCtor) && aCtor instanceof aCtor &&
                               _.isFunction(bCtor) && bCtor instanceof bCtor)
                          && ('constructor' in a && 'constructor' in b)) {
        return false;
      }
    }
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.

    // Initializing stack of traversed objects.
    // It's done here since we only need them for objects and arrays comparison.
    aStack = aStack || [];
    bStack = bStack || [];
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] === a) return bStack[length] === b;
    }

    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);

    // Recursively compare objects and arrays.
    if (areArrays) {
      // Compare array lengths to determine if a deep comparison is necessary.
      length = a.length;
      if (length !== b.length) return false;
      // Deep compare the contents, ignoring non-numeric properties.
      while (length--) {
        if (!eq(a[length], b[length], aStack, bStack)) return false;
      }
    } else {
      // Deep compare objects.
      var keys = _.keys(a), key;
      length = keys.length;
      // Ensure that both objects contain the same number of properties before comparing deep equality.
      if (_.keys(b).length !== length) return false;
      while (length--) {
        // Deep compare each member
        key = keys[length];
        if (!(_.has(b, key) && eq(a[key], b[key], aStack, bStack))) return false;
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return true;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (isArrayLike(obj) && (_.isArray(obj) || _.isString(obj) || _.isArguments(obj))) return obj.length === 0;
    return _.keys(obj).length === 0;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType === 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) === '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    var type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp, isError.
  _.each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Error'], function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) === '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE < 9), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return _.has(obj, 'callee');
    };
  }

  // Optimize `isFunction` if appropriate. Work around some typeof bugs in old v8,
  // IE 11 (#1621), and in Safari 8 (#1929).
  if (typeof /./ != 'function' && typeof Int8Array != 'object') {
    _.isFunction = function(obj) {
      return typeof obj == 'function' || false;
    };
  }

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return isFinite(obj) && !isNaN(parseFloat(obj));
  };

  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
  _.isNaN = function(obj) {
    return _.isNumber(obj) && obj !== +obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function(obj, key) {
    return obj != null && hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iteratees.
  _.identity = function(value) {
    return value;
  };

  // Predicate-generating functions. Often useful outside of Underscore.
  _.constant = function(value) {
    return function() {
      return value;
    };
  };

  _.noop = function(){};

  _.property = property;

  // Generates a function for a given object that returns a given property.
  _.propertyOf = function(obj) {
    return obj == null ? function(){} : function(key) {
      return obj[key];
    };
  };

  // Returns a predicate for checking whether an object has a given set of
  // `key:value` pairs.
  _.matcher = _.matches = function(attrs) {
    attrs = _.extendOwn({}, attrs);
    return function(obj) {
      return _.isMatch(obj, attrs);
    };
  };

  // Run a function **n** times.
  _.times = function(n, iteratee, context) {
    var accum = Array(Math.max(0, n));
    iteratee = optimizeCb(iteratee, context, 1);
    for (var i = 0; i < n; i++) accum[i] = iteratee(i);
    return accum;
  };

  // Return a random integer between min and max (inclusive).
  _.random = function(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  };

  // A (possibly faster) way to get the current timestamp as an integer.
  _.now = Date.now || function() {
    return new Date().getTime();
  };

   // List of HTML entities for escaping.
  var escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '`': '&#x60;'
  };
  var unescapeMap = _.invert(escapeMap);

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  var createEscaper = function(map) {
    var escaper = function(match) {
      return map[match];
    };
    // Regexes for identifying a key that needs to be escaped
    var source = '(?:' + _.keys(map).join('|') + ')';
    var testRegexp = RegExp(source);
    var replaceRegexp = RegExp(source, 'g');
    return function(string) {
      string = string == null ? '' : '' + string;
      return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
    };
  };
  _.escape = createEscaper(escapeMap);
  _.unescape = createEscaper(unescapeMap);

  // If the value of the named `property` is a function then invoke it with the
  // `object` as context; otherwise, return it.
  _.result = function(object, property, fallback) {
    var value = object == null ? void 0 : object[property];
    if (value === void 0) {
      value = fallback;
    }
    return _.isFunction(value) ? value.call(object) : value;
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /(.)^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    "'":      "'",
    '\\':     '\\',
    '\r':     'r',
    '\n':     'n',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  var escaper = /\\|'|\r|\n|\u2028|\u2029/g;

  var escapeChar = function(match) {
    return '\\' + escapes[match];
  };

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  // NB: `oldSettings` only exists for backwards compatibility.
  _.template = function(text, settings, oldSettings) {
    if (!settings && oldSettings) settings = oldSettings;
    settings = _.defaults({}, settings, _.templateSettings);

    // Combine delimiters into one regular expression via alternation.
    var matcher = RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset).replace(escaper, escapeChar);
      index = offset + match.length;

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      } else if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      } else if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }

      // Adobe VMs need the match returned to produce the correct offest.
      return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + 'return __p;\n';

    try {
      var render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled source as a convenience for precompilation.
    var argument = settings.variable || 'obj';
    template.source = 'function(' + argument + '){\n' + source + '}';

    return template;
  };

  // Add a "chain" function. Start chaining a wrapped Underscore object.
  _.chain = function(obj) {
    var instance = _(obj);
    instance._chain = true;
    return instance;
  };

  // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.

  // Helper function to continue chaining intermediate results.
  var result = function(instance, obj) {
    return instance._chain ? _(obj).chain() : obj;
  };

  // Add your own custom functions to the Underscore object.
  _.mixin = function(obj) {
    _.each(_.functions(obj), function(name) {
      var func = _[name] = obj[name];
      _.prototype[name] = function() {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return result(this, func.apply(_, args));
      };
    });
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  _.each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name === 'shift' || name === 'splice') && obj.length === 0) delete obj[0];
      return result(this, obj);
    };
  });

  // Add all accessor Array functions to the wrapper.
  _.each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      return result(this, method.apply(this._wrapped, arguments));
    };
  });

  // Extracts the result from a wrapped and chained object.
  _.prototype.value = function() {
    return this._wrapped;
  };

  // Provide unwrapping proxy for some methods used in engine operations
  // such as arithmetic and JSON stringification.
  _.prototype.valueOf = _.prototype.toJSON = _.prototype.value;

  _.prototype.toString = function() {
    return '' + this._wrapped;
  };

  // AMD registration happens at the end for compatibility with AMD loaders
  // that may not enforce next-turn semantics on modules. Even though general
  // practice for AMD registration is to be anonymous, underscore registers
  // as a named module because, like jQuery, it is a base library that is
  // popular enough to be bundled in a third party lib, but not be part of
  // an AMD load request. Those cases could generate an error when an
  // anonymous define() is called outside of a loader request.
  if (typeof define === 'function' && define.amd) {
    define('underscore', [], function() {
      return _;
    });
  }
}.call(this));

},{}],143:[function(require,module,exports){
'use strict';

var famous = require('famous');
var _ = require('underscore');

/*jshint -W079 */
var Node = famous.core.Node; /*jshint +W079 */
var FamousEngine = famous.core.FamousEngine;
var Position = famous.components.Position;
var Curves = famous.transitions.Curves;
var DOMElement = famous.domRenderables.DOMElement;

var COLOR = 'rgb(122,199,79)';
var COLOR__ACTIVE = 'rgb(232,116,97)';
var DOT_SIZE = 35;
var DOT_MARGIN = 1;
var DOT_SIDE = DOT_SIZE + DOT_MARGIN;
var DIMENSION = 12;
var ROWS = DIMENSION;
var COLUMNS = DIMENSION;
var DURATION = 600;
var CURVE = 'outBounce'; //outQuint outElastic inElastic inOutEase inBounce outBounce

var FIGURES = [[{ //             ╔══════╗ ╔══════╗                      //
	x: 0, //    ║      ║ ║      ║                      //
	y: 0 //     ║      ║ ║      ║                      //
}, //           ╚══════╝ ╚══════╝                      //
{ //            ╔══════╗ ╔══════╗                      //
	x: 0, //    ║      ║ ║      ║                      //
	y: 1 //     ║      ║ ║      ║                      //
}, //           ╚══════╝ ╚══════╝                      //
{ //                                                   //
	x: 1, //                                           //
	y: 0 //                                            //
}, //                                                  //
{ //                                                   //
	x: 1, //                                           //
	y: 1 //                                            //
} //                                                   //
], [{ //             ╔══════╗                               //
	x: 0, //    ║      ║                               //
	y: 0 //     ║      ║                               //
}, //           ╚══════╝                               //
{ //            ╔══════╗                               //
	x: 0, //    ║      ║                               //
	y: 1 //     ║      ║                               //
}, //           ╚══════╝                               //
{ //            ╔══════╗                               //
	x: 0, //    ║      ║                               //
	y: 2 //     ║      ║                               //
}, //           ╚══════╝                               //
{ //            ╔══════╗                               //
	x: 0, //    ║      ║                               //
	y: 3 //     ║      ║                               //
} //            ╚══════╝                               //
], [{ //             ╔══════╗ ╔══════╗ ╔══════╗ ╔══════╗    //
	x: 0, //    ║      ║ ║      ║ ║      ║ ║      ║    //
	y: 0 //     ║      ║ ║      ║ ║      ║ ║      ║    //
}, //           ╚══════╝ ╚══════╝ ╚══════╝ ╚══════╝    //
{ //                                                   //
	x: 1, //                                           //
	y: 0 //                                            //
}, //                                                  //
{ //                                                   //
	x: 2, //                                           //
	y: 0 //                                            //
}, //                                                  //
{ //                                                   //
	x: 3, //                                           //
	y: 0 //                                            //
} //                                                   //
], [{ //                      ╔══════╗ ╔══════╗             //
	x: 0, //             ║      ║ ║      ║             //
	y: 1 //              ║      ║ ║      ║             //
}, //                    ╚══════╝ ╚══════╝             //
{ //            ╔══════╗ ╔══════╗                      //
	x: 1, //    ║      ║ ║      ║                      //
	y: 0 //     ║      ║ ║      ║                      //
}, //           ╚══════╝ ╚══════╝                      //
{ //                                                   //
	x: 1, //                                           //
	y: 1 //                                            //
}, //                                                  //
{ //                                                   //
	x: 2, //                                           //
	y: 0 //                                            //
} //                                                   //
], [{ //             ╔══════╗                               //
	x: 0, //    ║      ║                               //
	y: 0 //     ║      ║                               //
}, //           ╚══════╝                               //
{ //            ╔══════╗ ╔══════╗                      //
	x: 0, //    ║      ║ ║      ║                      //
	y: 1 //     ║      ║ ║      ║                      //
}, //           ╚══════╝ ╚══════╝                      //
{ //                     ╔══════╗                      //
	x: 1, //             ║      ║                      //
	y: 1 //              ║      ║                      //
}, //                    ╚══════╝                      //
{ //                                                   //
	x: 1, //                                           //
	y: 2 //                                            //
} //                                                   //
], [{ //             ╔══════╗ ╔══════╗                      //
	x: 0, //    ║      ║ ║      ║                      //
	y: 0 //     ║      ║ ║      ║                      //
}, //           ╚══════╝ ╚══════╝                      //
{ //                     ╔══════╗ ╔══════╗             //
	x: 1, //             ║      ║ ║      ║             //
	y: 0 //              ║      ║ ║      ║             //
}, //                    ╚══════╝ ╚══════╝             //
{ //                                                   //
	x: 1, //                                           //
	y: 1 //                                            //
}, //                                                  //
{ //                                                   //
	x: 2, //                                           //
	y: 1 //                                            //
} //                                                   //
], [{ //                      ╔══════╗                      //
	x: 0, //             ║      ║                      //
	y: 1 //              ║      ║                      //
}, //                    ╚══════╝                      //
{ //            ╔══════╗ ╔══════╗                      //
	x: 0, //    ║      ║ ║      ║                      //
	y: 2 //     ║      ║ ║      ║                      //
}, //           ╚══════╝ ╚══════╝                      //
{ //            ╔══════╗                               //
	x: 1, //    ║      ║                               //
	y: 0 //     ║      ║                               //
}, //           ╚══════╝                               //
{ //                                                   //
	x: 1, //                                           //
	y: 1 //                                            //
} //                                                   //
], [{ //                      ╔══════╗                      //
	x: 0, //             ║      ║                      //
	y: 1 //              ║      ║                      //
}, //                    ╚══════╝                      //
{ //            ╔══════╗ ╔══════╗ ╔══════╗             //
	x: 1, //    ║      ║ ║      ║ ║      ║             //
	y: 0 //     ║      ║ ║      ║ ║      ║             //
}, //           ╚══════╝ ╚══════╝ ╚══════╝             //
{ //                                                   //
	x: 1, //                                           //
	y: 1 //                                            //
}, //                                                  //
{ //                                                   //
	x: 2, //                                           //
	y: 1 //                                            //
} //                                                   //
], [{ //             ╔══════╗                               //
	x: 0, //    ║      ║                               //
	y: 0 //     ║      ║                               //
}, //           ╚══════╝                               //
{ //            ╔══════╗ ╔══════╗                      //
	x: 0, //    ║      ║ ║      ║                      //
	y: 1 //     ║      ║ ║      ║                      //
}, //           ╚══════╝ ╚══════╝                      //
{ //            ╔══════╗                               //
	x: 0, //    ║      ║                               //
	y: 2 //     ║      ║                               //
}, //           ╚══════╝                               //
{ //                                                   //
	x: 1, //                                           //
	y: 1 //                                            //
} //                                                   //
], [{ //             ╔══════╗ ╔══════╗ ╔══════╗             //
	x: 0, //    ║      ║ ║      ║ ║      ║             //
	y: 0 //     ║      ║ ║      ║ ║      ║             //
}, //           ╚══════╝ ╚══════╝ ╚══════╝             //
{ //                     ╔══════╗                      //
	x: 1, //             ║      ║                      //
	y: 0 //              ║      ║                      //
}, //                    ╚══════╝                      //
{ //                                                   //
	x: 1, //                                           //
	y: 1 //                                            //
}, //                                                  //
{ //                                                   //
	x: 2, //                                           //
	y: 0 //                                            //
} //                                                   //
], [{ //                      ╔══════╗                      //
	x: 0, //             ║      ║                      //
	y: 1 //              ║      ║                      //
}, //                    ╚══════╝                      //
{ //            ╔══════╗ ╔══════╗                      //
	x: 1, //    ║      ║ ║      ║                      //
	y: 0 //     ║      ║ ║      ║                      //
}, //           ╚══════╝ ╚══════╝                      //
{ //                     ╔══════╗                      //
	x: 1, //             ║      ║                      //
	y: 1 //              ║      ║                      //
}, //                    ╚══════╝                      //
{ //                                                   //
	x: 1, //                                           //
	y: 2 //                                            //
} //                                                   //
], [{ //             ╔══════╗                               //
	x: 0, //    ║      ║                               //
	y: 0 //     ║      ║                               //
}, //           ╚══════╝                               //
{ //            ╔══════╗ ╔══════╗ ╔══════╗             //
	x: 0, //    ║      ║ ║      ║ ║      ║             //
	y: 1 //     ║      ║ ║      ║ ║      ║             //
}, //           ╚══════╝ ╚══════╝ ╚══════╝             //
{ //                                                   //
	x: 1, //                                           //
	y: 1 //                                            //
}, //                                                  //
{ //                                                   //
	x: 2, //                                           //
	y: 1 //                                            //
} //                                                   //
], [{ //             ╔══════╗ ╔══════╗                      //
	x: 0, //    ║      ║ ║      ║                      //
	y: 0 //     ║      ║ ║      ║                      //
}, //           ╚══════╝ ╚══════╝                      //
{ //            ╔══════╗                               //
	x: 0, //    ║      ║                               //
	y: 1 //     ║      ║                               //
}, //           ╚══════╝                               //
{ //            ╔══════╗                               //
	x: 0, //    ║      ║                               //
	y: 2 //     ║      ║                               //
}, //           ╚══════╝                               //
{ //                                                   //
	x: 1, //                                           //
	y: 0 //                                            //
} //                                                   //
], [{ //             ╔══════╗ ╔══════╗ ╔══════╗             //
	x: 0, //    ║      ║ ║      ║ ║      ║             //
	y: 0 //     ║      ║ ║      ║ ║      ║             //
}, //           ╚══════╝ ╚══════╝ ╚══════╝             //
{ //                              ╔══════╗             //
	x: 1, //                      ║      ║             //
	y: 0 //                       ║      ║             //
}, //                             ╚══════╝             //
{ //                                                   //
	x: 2, //                                           //
	y: 0 //                                            //
}, //                                                  //
{ //                                                   //
	x: 2, //                                           //
	y: 1 //                                            //
} //                                                   //
], [{ //                      ╔══════╗                      //
	x: 0, //             ║      ║                      //
	y: 2 //              ║      ║                      //
}, //                    ╚══════╝                      //
{ //                     ╔══════╗                      //
	x: 1, //             ║      ║                      //
	y: 0 //              ║      ║                      //
}, //                    ╚══════╝                      //
{ //            ╔══════╗ ╔══════╗                      //
	x: 1, //    ║      ║ ║      ║                      //
	y: 1 //     ║      ║ ║      ║                      //
}, //           ╚══════╝ ╚══════╝                      //
{ //                                                   //
	x: 1, //                                           //
	y: 2 //                                            //
} //                                                   //
], [{ //             ╔══════╗ ╔══════╗ ╔══════╗             //
	x: 0, //    ║      ║ ║      ║ ║      ║             //
	y: 0 //     ║      ║ ║      ║ ║      ║             //
}, //           ╚══════╝ ╚══════╝ ╚══════╝             //
{ //            ╔══════╗                               //
	x: 0, //    ║      ║                               //
	y: 1 //     ║      ║                               //
}, //           ╚══════╝                               //
{ //                                                   //
	x: 1, //                                           //
	y: 0 //                                            //
}, //                                                  //
{ //                                                   //
	x: 2, //                                           //
	y: 0 //                                            //
} //                                                   //
], [{ //             ╔══════╗ ╔══════╗                      //
	x: 0, //    ║      ║ ║      ║                      //
	y: 0 //     ║      ║ ║      ║                      //
}, //           ╚══════╝ ╚══════╝                      //
{ //                     ╔══════╗                      //
	x: 1, //             ║      ║                      //
	y: 0 //              ║      ║                      //
}, //                    ╚══════╝                      //
{ //                     ╔══════╗                      //
	x: 1, //             ║      ║                      //
	y: 1 //              ║      ║                      //
}, //                    ╚══════╝                      //
{ //                                                   //
	x: 1, //                                           //
	y: 2 //                                            //
} //                                                   //
], [{ //                               ╔══════╗             //
	x: 0, //                      ║      ║             //
	y: 1 //                       ║      ║             //
}, //                             ╚══════╝             //
{ //            ╔══════╗ ╔══════╗ ╔══════╗             //
	x: 1, //    ║      ║ ║      ║ ║      ║             //
	y: 1 //     ║      ║ ║      ║ ║      ║             //
}, //           ╚══════╝ ╚══════╝ ╚══════╝             //
{ //                                                   //
	x: 2, //                                           //
	y: 0 //                                            //
}, //                                                  //
{ //                                                   //
	x: 2, //                                           //
	y: 1 //                                            //
} //                                                   //
], [{ //             ╔══════╗                               //
	x: 0, //    ║      ║                               //
	y: 0 //     ║      ║                               //
}, //           ╚══════╝                               //
{ //            ╔══════╗                               //
	x: 0, //    ║      ║                               //
	y: 1 //     ║      ║                               //
}, //           ╚══════╝                               //
{ //            ╔══════╗ ╔══════╗                      //
	x: 0, //    ║      ║ ║      ║                      //
	y: 2 //     ║      ║ ║      ║                      //
}, //           ╚══════╝ ╚══════╝                      //
{ //                                                   //
	x: 1, //                                           //
	y: 2 //                                            //
} //                                                   //
]];

var FIGURESCOUNT = 2;

function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min)) + min;
}

/**
 * Initialize fixed-sized array with incremented values
 * @param {number} length - Length of array
 */
/*jshint -W121 */
if (!Array.prototype.initialize) {
	Array.prototype.initialize = function (length) {
		var arr = [];
		for (var i = 0; i < length; i++) {
			arr.push(i);
		}
		return arr;
	};
} /*jshint -W121 */

function Game(rows, cols) {
	Node.call(this);
	this.domElement = new DOMElement(this, {});

	var count = 0;
	this.dots = [];
	for (var row = 0; row < rows; row++) {
		for (var col = 0; col < cols; col++) {
			var dot = new Dot(count++);
			this.addChild(dot);
			this.dots.push(dot);
		}
	}

	this.figures = [];

	this.generateFigure = function generateFigure(figureId) {
		var figures = this.figures || [];
		var rand = getRandomInt(0, FIGURES.length);;

		if (figures.length < 1) {
			figures.push(FIGURES[rand]);
		} else {
			(function () {
				var figuresCount = FIGURESCOUNT;
				var figuresIndexes = [];
				var isFiguresEqual = function isFiguresEqual(f1, f2) {
					return f1.every(function (element, index) {
						return _.isEqual(element, f2[index]);
					});
				};
				var findIndex = function findIndex(figure) {
					return FIGURES.findIndex(function (element) {
						return isFiguresEqual(element, figure);
					});
				};
				var isHashUnique = function isHashUnique(array, hash) {
					if (hash !== figureId) {
						return array.every(function (element) {
							return element !== hash;
						});
					} else {
						return false;
					}
				};
				for (var i = 0; i < Math.min(figuresCount, figures.length); i++) {
					if (figureId !== i) {
						figuresIndexes.push(figures[i]);
					}
				}
				var figuresHash = [];
				for (var i = 0; i < figuresIndexes.length; i++) {
					figuresHash[i] = findIndex(figuresIndexes[i]);
				}

				while (!isHashUnique(figuresHash, rand)) {
					rand = getRandomInt(0, FIGURES.length);
				}
				figures[figureId] = FIGURES[rand];
			})();
		}
	};

	for (var figure = 0; figure < 2; figure++) {
		this.generateFigure(figure);
	}

	this.mousing = 0;

	/**
  * Allow selecting dots by mousemoving
  * @param {number} id - Id of dot
  */
	this.mousingDown = function (id) {
		this.mousing = this.dots[id].fill ? -1 : +1;
	};
	this.mousingUp = function (id) {
		this.mousing = 0;
	};

	this.hoverDots = [];

	/**
  * Check dot for selectability
  * @param {number} id - Id of dot
  */
	this.hoverDot = function (id) {
		if (id !== undefined) {
			if (!this.hoverDots.includes(id)) {
				if (this.hoverDots.length < 12) {
					this.hoverDots.push(id);
					return true;
				} else {
					this.dots[this.hoverDots[0]].toggleFill();
					this.hoverDots.shift();
					this.hoverDots.push(id);
					return true;
				}
			}
		}
	};

	this.orderRows = [].initialize(ROWS);
	this.orderColumns = [].initialize(COLUMNS);

	/**
  * Check lines if dots are filled
  */
	/*jshint -W074 */
	this.checkLines = function checkLines() {
		var dots = this.dots;
		var filledRows = [];
		var filledColumns = [];

		var _loop = function (line) {
			var row = dots.filter(function (element) {
				return Number.parseInt(element.id / ROWS) === line && element.fill === true;
			});
			var column = dots.filter(function (element) {
				return element.id % COLUMNS === line && element.fill === true;
			});
			if (row.length === ROWS) {
				console.log('Filled row: ', line);
				filledRows.push(line);
			}
			if (column.length === COLUMNS) {
				filledColumns.push(line);
				console.log('Filled column: ', line);
			}
		};

		for (var line = 0; line < DIMENSION; line++) {
			_loop(line);
		}
		filledRows.sort(function (x, y) {
			if (x < ROWS / 2) {
				return y - x;
			} else {
				return x - y;
			}
		});
		filledColumns.sort(function (x, y) {
			if (x < COLUMNS / 2) {
				return y - x;
			} else {
				return x - y;
			}
		});
		for (var row = 0; row < filledRows.length; row++) {
			this.moveLine(filledRows[row], 'y');
		}
		for (var column = 0; column < filledColumns.length; column++) {
			this.moveLine(filledColumns[column], 'x');
		}
	}; /*jshint +W074 */

	/**
  * Move filled line
  * @param {number} id - Id of filled line
  */
	/*jshint -W071, -W074 */
	this.moveLine = function moveLine(line, direction) {
		console.log('moveLine', line, direction);
		var orderRows = this.orderRows;
		var orderColumns = this.orderColumns;
		var order = [];
		var lineHash = 0;

		switch (direction) {
			case 'x':
				order = orderColumns;
				lineHash = order.indexOf(line);
				if (line < COLUMNS / 2) {
					for (var row = 0; row < ROWS; row++) {
						var dot = this.dots[row * ROWS + order[lineHash]];
						var position = dot.position;
						var x = position.getX();
						position.setX(x - DOT_SIDE * lineHash, {
							duration: DURATION,
							curve: CURVE
						});
						dot.deselect();
					}
					for (var column = lineHash - 1; column >= 0; column--) {
						for (var row = 0; row < ROWS; row++) {
							var dot = this.dots[row * ROWS + order[column]];
							var position = dot.position;
							var x = position.getX();
							position.setX(x + DOT_SIDE, {
								duration: DURATION,
								curve: CURVE
							});
						}
					}
					orderColumns.splice(lineHash, 1);
					orderColumns.unshift(line);
				} else {
					for (var row = 0; row < ROWS; row++) {
						var dot = this.dots[row * ROWS + order[lineHash]];
						var position = dot.position;
						var x = position.getX();
						position.setX(x + DOT_SIDE * (ROWS - 1 - lineHash), {
							duration: DURATION,
							curve: CURVE
						});
						dot.deselect();
					}
					for (var column = COLUMNS - 1; column > lineHash; column--) {
						for (var row = 0; row < ROWS; row++) {
							var dot = this.dots[row * ROWS + order[column]];
							var position = dot.position;
							var x = position.getX();
							position.setX(x - DOT_SIDE, {
								duration: DURATION,
								curve: CURVE
							});
						}
					}
					orderColumns.splice(lineHash, 1);
					orderColumns.push(line);
				}
				break;
			case 'y':
				order = orderRows;
				lineHash = order.indexOf(line);
				if (line < ROWS / 2) {
					for (var column = 0; column < COLUMNS; column++) {
						var dot = this.dots[order[lineHash] * COLUMNS + column];
						var position = dot.position;
						var y = position.getY();
						position.setY(y - DOT_SIDE * lineHash, {
							duration: DURATION,
							curve: CURVE
						});
						dot.deselect();
					}
					for (var row = lineHash - 1; row >= 0; row--) {
						for (var column = 0; column < COLUMNS; column++) {
							var dot = this.dots[order[row] * COLUMNS + column];
							var position = dot.position;
							var y = position.getY();
							position.setY(y + DOT_SIDE, {
								duration: DURATION,
								curve: CURVE
							});
						}
					}
					orderRows.splice(lineHash, 1);
					orderRows.unshift(line);
				} else {
					for (var column = 0; column < COLUMNS; column++) {
						var dot = this.dots[order[lineHash] * COLUMNS + column];
						var position = dot.position;
						var y = position.getY();
						position.setY(y + DOT_SIDE * (COLUMNS - 1 - lineHash), {
							duration: DURATION,
							curve: CURVE
						});
						dot.deselect();
					}
					for (var row = ROWS - 1; row > lineHash; row--) {
						for (var column = 0; column < COLUMNS; column++) {
							var dot = this.dots[order[row] * COLUMNS + column];
							var position = dot.position;
							var y = position.getY();
							position.setY(y - DOT_SIDE, {
								duration: DURATION,
								curve: CURVE
							});
						}
					}
					orderRows.splice(lineHash, 1);
					orderRows.push(line);
				}
				break;
			default:
				return false;
		}
	}; /*jshint +W071, +W074 */

	var hoverId;

	/**
  * Fill dot
  * @param {number} id - Id of dot
  */
	this.fillDot = function (id) {
		if (id !== undefined) {
			if (id !== hoverId) {
				this.dots[id].toggleFill();
				this.checkLines();
				hoverId = id;
			}
		}
	};

	// Centering
	this.setMountPoint(0.5, 0.5, 0).setAlign(0.5, 0.5, 0).setOrigin(0.5, 0.5, 0).setPosition(0, 0, 0);
	this.layout = new Layout(this);

	this.addUIEvent('mousedown');
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
	this.duration = [0.5 * DURATION, 3 * DURATION, 3 * DURATION, DURATION, 0.5 * DURATION];

	this.next();
}

Layout.prototype.next = function next() {
	if (this.current++ === ROWS) {
		this.current = 0;
	}
	var duration = this.duration[this.current];
	var curve = this.curve[this.current];
	var row = 0;
	var col = 0;
	var dimension = DOT_SIDE;
	var bounds = [-(dimension * ROWS / 2 - dimension / 2), -(dimension * COLUMNS / 2 - dimension / 2)];
	for (var i = 0; i < this.node.getChildren().length; i++) {
		var x = bounds[0] + dimension * col++;
		var y = bounds[1] + dimension * row;
		var z = 0;
		this.node.dots[i].position.set(x, y, z, {
			duration: i * ROWS + duration,
			curve: curve
		});
		if (col >= COLUMNS) {
			col = 0;
			row++;
		}
	}
};

function Dot(id) {
	Node.call(this);

	// Center dot.
	this.setMountPoint(0.5, 0.5, 0).setAlign(0.5, 0.5, 0).setSizeMode('absolute', 'absolute', 'absolute').setAbsoluteSize(DOT_SIZE, DOT_SIZE, DOT_SIZE);

	this.domElement = new DOMElement(this, {
		properties: {
			background: COLOR
		}
	});

	this.id = id;
	this.fill = false;

	this.select = function select() {
		if (!this.fill) {
			this.fill = true;
			this.domElement.setProperty('background-color', COLOR__ACTIVE);
		}
	};

	this.deselect = function deselect() {
		if (this.fill) {
			this.fill = false;
			this.domElement.setProperty('background-color', COLOR);
		}
	};

	this.toggleFill = function toggleFill() {
		this.fill = !this.fill;
		this.domElement.setProperty('background-color', this.fill ? COLOR__ACTIVE : COLOR);
	};

	this.position = new Position(this);

	this.addUIEvent('mousedown');
	this.addUIEvent('mousemove');
	this.addUIEvent('click');
	this.addUIEvent('mouseup');
}

Dot.prototype = Object.create(Node.prototype);
Dot.prototype.constructor = Dot;

/*jshint -W074 */
Dot.prototype.onReceive = function onReceive(type, ev) {
	switch (type) {
		case 'mousedown':
			this._parent.mousingDown(this.id);
			break;
		case 'mousemove':
			if (this._parent.mousing === true) {
				this._parent.fillDot(this.id);
				this.emit('id', this.domElement.id).emit('fill', this.domElement.fill);
			}
			break;
		case 'click':
			this._parent.fillDot(this.id);
			this.emit('id', this.domElement.id).emit('fill', this.domElement.fill);
			break;
		case 'mouseup':
			this._parent.mousingUp(this.id);
			break;
		default:
			return false;
	}
}; /*jshint +W074 */

FamousEngine.init();
var scene = FamousEngine.createScene();
var game = new Game(ROWS, COLUMNS);
scene.addChild(game);

},{"famous":46,"underscore":142}]},{},[143]);
