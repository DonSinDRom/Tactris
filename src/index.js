'use strict';

const famous = require('famous');

const Node         = famous.core.Node;
const FamousEngine = famous.core.FamousEngine;
const Align        = famous.components.Align;
const Position     = famous.components.Position;
const Size         = famous.components.Size;
const Rotation     = famous.components.Rotation;
const Curves       = famous.transitions.Curves;
const DOMElement   = famous.domRenderables.DOMElement;

const COLOR = 'rgb(122,199,79)';
const COLOR__ACTIVE = 'rgb(232,116,97)';
const DOT_SIZE = 48;
const DOT_MARGIN = 1;
const DOT_SIDE = DOT_SIZE + DOT_MARGIN;
const ROWS = 10;
const COLUMNS = 10;
const DURATION = 600;
const CURVE = 'outBounce'; //outQuint outElastic inElastic inOutEase inBounce outBounce

/**
 * Initialize fixed-sized array with determinated value
 * @param {*} value - Determinated value
 * @param {number} length - Length of array
 */
if (!Array.prototype.initialize) {
  Array.prototype.initialize = function (value, length) {
    var arr = [];
    while (length--) {
      arr.push(value);
    }
    return arr;
  };
}


function Background(rows, cols) {
  Node.call(this);
  this._domElement = new DOMElement(this, {
    properties: {
      backgroundColor: '#333'
    }
  });

  var count = 0;
  this.dots = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      let dot = new Dot(count++);
      this.addChild(dot);
      this.dots.push(dot);
    }
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

  this.filledRows = [].initialize(false, ROWS);
  this.filledColumns = [].initialize(false, COLUMNS);

  /**
   * Get filled rows and columns
   * @param {number} id - Id of selected dot
   */
  this.defineFilledLine = function defineFilledLine(id) {
    let dots = this.dots;
    let offsetLine = this.offsetLine;
    let filledRows = this.filledRows;
    let filledColumns = this.filledColumns;

    let column = id % COLUMNS;
    let columns = this.filledColumns.length;
    let row = (id - column) / COLUMNS;
    let rows = this.filledRows.length;
    while (rows--) {
      if (!this.dots[row * ROWS + rows].fill) {
        rows = false;
      }
      if (rows === 0) {
        this.filledRows[row] = row;
        console.log('Fill Row: ' + row);
      }
    }

    while (columns--) {
      if (!this.dots[columns * COLUMNS + column].fill) {
        columns = false;
      }
      if (columns === 0) {
        this.filledColumns[column] = column;
        console.log('Fill Column: ' + column);
      }
    }
    var _rowsAnimation = this.filledRows.filter(value => {
      return value !== false;
    });
    var _columnsAnimation = this.filledColumns.filter(value => {
      return value !== false;
    });
    this.offsetLines(_rowsAnimation, _columnsAnimation);
  };

  /**
   * Move lines (rows and columns)
   * @param {string} type - Type - 'row' or 'column'
   */
  this.offsetLines = function offsetLines(rows, columns) {
    for (let row = 0; row < rows.length; row++) {
      this.offsetLine(rows[row], 'row');
    }
    for (let column = 0; column < columns.length; column++) {
      this.offsetLine(columns[column], 'column');
    }
  };

  /**
   * Move line (row or column)
   * @param {number} line - Which line we should move.
   * @param {boolean} offsetX - Moving line along the X-axis
   * @param {boolean} offsetY - Moving line along the Y-axis
   */
  this.offsetLine = function offsetLine(line, type) {
    if (type === 'row') {
      if (line < COLUMNS / 2) {
        for (let row = line; row >= 0; row--) {
          for (let column = 0; column < COLUMNS; column++) {
            let dot = this.dots[row * ROWS + column];
            let position = dot.position;
            let y = position.getY();
            position.setY(y + DOT_SIDE, {
              duration: DURATION,
              curve: CURVE
            });
          }
        }
        for (let column = 0; column < COLUMNS; column++) {
          let dot = this.dots[line * COLUMNS + column];
          let position = dot.position;
          let y = position.getY();
          position.setY(y - (line * DOT_SIDE), {
            duration: DURATION,
            curve: CURVE
          });
          dot.deselect();
          this.filledRows[line] = false;
        }
      } else {
        for (let row = line + 1; row < ROWS; row++) {
          for (let column = 0; column < COLUMNS; column++) {
            let dot = this.dots[row * ROWS + column];
            let position = dot.position;
            let y = position.getY();
            position.setY(y - DOT_SIDE, {
              duration: DURATION,
              curve: CURVE
            });
          }
        }
        for (let column = 0; column < COLUMNS; column++) {
          let dot = this.dots[line * ROWS + column];
          let position = dot.position;
          let y = position.getY();
          position.setY(y + ((ROWS - 1 - line) * DOT_SIDE), {
            duration: DURATION,
            curve: CURVE
          });
          dot.deselect();
          this.filledRows[line] = false;
        }
      }
    } else if (type === 'column') {
      if (line < ROWS / 2) {
        for (let column = 0; column < COLUMNS; column++) {
          for (let row = line; row >= 0; row--) {
            let dot = this.dots[column * COLUMNS + row];
            let position = dot.position;
            let x = position.getX();
            position.setX(x + DOT_SIDE, {
              duration: DURATION,
              curve: CURVE
            });
          }
        }
        for (let column = 0; column < COLUMNS; column++) {
          let dot = this.dots[column * COLUMNS + line];
          let position = dot.position;
          let x = position.getX();
          position.setX(x - (line * DOT_SIDE), {
            duration: DURATION,
            curve: CURVE
          });
          dot.deselect();
          this.filledColumns[line] = false;
        }
      } else {
        for (let row = line + 1; row < ROWS; row++) {
          for (let column = 0; column < COLUMNS; column++) {
            let dot = this.dots[column * COLUMNS + row];
            let position = dot.position;
            let x = position.getX();
            position.setX(x - DOT_SIDE, {
              duration: DURATION,
              curve: CURVE
            });
          }
        }
        for (let column = 0; column < COLUMNS; column++) {
          let dot = this.dots[column * COLUMNS + line];
          let position = dot.position;
          let x = position.getX();
          position.setX(x + ((ROWS - 1 - line) * DOT_SIDE), {
            duration: DURATION,
            curve: CURVE
          });
          dot.deselect();
          this.filledColumns[line] = false;
        }
      }
    } else {
      throw new Error('Can\'t animate - please, check type of line in function\'s parameters.');
    }
  };

  var hoverId;
  this.fillDot = function (id) {
    if (id !== undefined) {
      if (id !== hoverId) {
        this.dots[id].toggleFill();
        this.defineFilledLine(id);
        hoverId = id;
      }
    }
  };

  // Centering
  this
    .setMountPoint(0.5, 0.5, 0)
    .setAlign(0.5, 0.5, 0)
    .setOrigin(0.5, 0.5, 0)
    .setPosition(0, 0, 0);
  this.layout = new Layout(this);

  // addUIEvent is being used in order to instruct the node's DOMElement
  // to add the appropriate event listener through the DOMRenderer.
  // DOM events are being emitted as UI Events and routed accordingly.
//  this.addUIEvent('mousedown');
//  this.addUIEvent('touchstart');
//  // this.addUIEvent('mousemove');
//  // this.addUIEvent('touchmove');
//  this.addUIEvent('mouseup');
//  this.addUIEvent('touchend');
}

Background.prototype = Object.create(Node.prototype);
Background.prototype.constructor = Node;

/*Background.prototype.onReceive = function onReceive(type, ev) {
  if (type === 'mousedown') {
    // dispatch globally
    this.emit('x', ev.x).emit('y', ev.y);
    this.mousing = true;
  }
  if (type === 'touchstart') {
    console.log('touchstart');
    // dispatch globally
    this.emit('x', ev.x).emit('y', ev.y);
    this.mousing = true;
  }
  // if (type === 'mousemove') {
  //   // dispatch globally
  //   this.emit('x', ev.x).emit('y', ev.y);
  // }
  // if (type === 'touchmove') {
  //   // dispatch globally
  //   this.emit('x', ev.x).emit('y', ev.y);
  // }
  if (type === 'mouseup') {
    // dispatch globally
    this.emit('x', ev.x).emit('y', ev.y);
    this.mousing = false;
  }
  if (type === 'touchend') {
    console.log('touchend');
    // dispatch globally
    this.emit('x', ev.x).emit('y', ev.y);
    this.mousing = false;
  }
  this.receive(type, ev);
};*/

// The Layout component is a state machine. Each layout can is a state.
// The state is defined by
// 1. spacing: The dot spacing.
// 2. randomizePositionZ: Whether the x position should be randomized.
// 3. curve: The easing curve used to enter the state.
// 4. duration: The duration of the animation used for transitioning to the
//      state.
function Layout(node) {
  this.node = node;
  this.id = this.node.addComponent(this);
  this.current = 0;
  // Dot layout -> Square layout -> Square layout with random Z
  // -> Expanded square -> Square layout
  this.curve = [Curves.outQuint, Curves.outElastic, Curves.inElastic, Curves.inOutEase, Curves.inBounce];
  this.duration = [0.5 * DURATION, 3 * DURATION, 3 * DURATION, DURATION, 0.5 * DURATION];

  // Transitions to initial state.
  this.next();
}

// Transitions to the next state.
// Called by node.
Layout.prototype.next = function next() {
  if (this.current++ === ROWS) {
    this.current = 0;
  }
  let duration = this.duration[this.current];
  let curve = this.curve[this.current];
  let row = 0;
  let col = 0;
  let dimension = DOT_SIDE;
  let bounds = [-(((dimension) * ROWS / 2) - (dimension / 2)), -(((dimension) * COLUMNS / 2) - (dimension / 2))];
  for (let i = 0; i < this.node.getChildren().length; i++) {
    let x = bounds[0] + ((dimension) * col++);
    let y = bounds[1] + ((dimension) * row);
    let z = 0;
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




// Dots are nodes.
// They have a DOMElement attached to them by default.
function Dot(id) {
  Node.call(this);

  // Center dot.
  this
    .setMountPoint(0.5, 0.5, 0)
    .setAlign(0.5, 0.5, 0)
    .setSizeMode('absolute', 'absolute', 'absolute')
    .setAbsoluteSize(DOT_SIZE, DOT_SIZE, DOT_SIZE);

  // Add the DOMElement (DOMElements are components).
  this._domElement = new DOMElement(this, {
    properties: {
      background: COLOR
    }
  });
  this.id = id;
  this.fill = false;

  this.select = function select() {
    if (!this.fill) {
      this.fill = true;
      this._domElement.setProperty('background-color', COLOR__ACTIVE);
    }
  };

  this.deselect = function deselect() {
    if (this.fill) {
      this.fill = false;
      this._domElement.setProperty('background-color', COLOR);
    }
  };

  this.toggleFill = function toggleFill() {
    this.fill = !this.fill;
    this._domElement.setProperty('background-color', this.fill ? COLOR__ACTIVE : COLOR);
  };
  // Add the Position component.
  // The position component allows us to transition between different states
  // instead of instantly setting the final translation.
  this.position = new Position(this);
  // addUIEvent is being used in order to instruct the node's DOMElement
  // to add the appropriate event listener through the DOMRenderer.
  // DOM events are being emitted as UI Events and routed accordingly.
//  this.addUIEvent('mousedown');
  this.addUIEvent('touchstart');
//  this.addUIEvent('mousemove');
  this.addUIEvent('touchmove');
//  this.addUIEvent('click');
//  this.addUIEvent('mouseup');
  this.addUIEvent('touchend');
}

Dot.prototype = Object.create(Node.prototype);
Dot.prototype.constructor = Dot;

Dot.prototype.onReceive = function onReceive(type, ev) {
  if (type === 'mousedown') {
    this._parent.mousingDown(this.id);
  }
  if (type === 'touchstart') {
    console.log('touchstart');
    this._parent.mousingUp(this.id);
  }
  if (type === 'mousemove') {
    console.log('mousemove', this.id);
    if (this._parent.mousing === true) {
      this._parent.fillDot(this.id);
      this.emit('id', this._domElement.id).emit('fill', this._domElement.fill);
    }
  }
  if (type === 'touchmove') {
    console.log('touchmove', this.id);
    if (this._parent.mousing === true) {
      this._parent.fillDot(this.id);
      this.emit('id', this._domElement.id).emit('fill', this._domElement.fill);
    }
  }
  if (type === 'click') {
    this._parent.fillDot(this.id);
    this.emit('id', this._domElement.id).emit('fill', this._domElement.fill);
  }
  if (type === 'mouseup') {
    this._parent.mousingUp(this.id);
  }
  if (type === 'touchend') {
    console.log('touchend');
    this._parent.mousingDown(this.id);
  }
  this.receive(type, ev);
};

FamousEngine.init();
var scene = FamousEngine.createScene();
scene.addChild(new Background(ROWS, COLUMNS));
