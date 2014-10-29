var StyleKeys = require('../lib/StyleKeys');

var Transforms = {};
var WINDOW_WIDTH = window.innerWidth;
var WINDOW_HEIGHT = window.innerHeight;

Transforms.Mixin = {
  componentDidMount() {
    var node = this.getDOMNode();
    if (!node) return;

    this._totalTransforms = (
      node.querySelectorAll('[data-transform]').length +
      Number(node.hasAttribute('data-transform'))
    );

    this._getElementsWithTransforms([], node, this.props.index, nodes => {
      this._transforms = nodes;
      this._doTransforms(0);
    });
  },

  componentWillReceiveProps(nextProps) {
    if (nextProps.step)
      this._doTransforms(nextProps.step);
  },

  _getElementsWithTransforms(nodes, node, index, cb) {
    if (node.hasAttribute('data-transform')) {
      this._totalTransforms = this._totalTransforms - 1;
      nodes.push({
        el: node,
        name: node.getAttribute('data-transform'),
        index: node.getAttribute('data-transform-index') || index
      });
    }

    if (this._totalTransforms === 0)
      cb(nodes);
    else {
      var children = Array.prototype.slice.call(node.children);
      children.forEach(child => {
        this._getElementsWithTransforms(nodes, child, node.getAttribute('data-transform-index') || index, cb);
      });
    }
  },

  _doTransforms(step) {
    if (!this._transforms) return;
    this._transforms.forEach(transform => transformElement(transform, step));
  }
};

function transformElement(transform, step) {
  var transforms = '';
  var { el, index, name } = transform;
  var { scale, rotate, translate, opacity, ...styles } = Transforms[name](index, step, el);

  if (defined(scale))
    transforms += `scale(${scale}) `;

  if (defined(rotate))
    transforms += `rotate3d(${rotate.x || 0},${rotate.y || 0},${rotate.z || 0}) `;

  if (defined(translate))
    transforms += `translate3d(${translate.x || 0}px, ${translate.y || 0}px, ${translate.z || 0}px)`;

  if (defined(opacity))
    el.style.opacity = opacity;

  if (styles)
    Object.keys(styles).map(style => { el.style[style] = styles[style]; });

  el.style[StyleKeys.TRANSFORM] = transforms;
}

function defined(variable) {
  return typeof variable !== 'undefined';
}

// Linear increasing strength
//  0 -> 1 (in) -> 2
function linear(step, index) {
  return step - index + 1;
}

// Linear increasing then decreasing strength
//  0 -> 1 (in) -> 0
function symmetrical(step, index) {
  var strength = linear(step, index);
  if (strength == 2) return 0;
  return (strength > 1) ? (1 - strength % 1) : strength;
}

Transforms.PARALLAX_VIEW = function(index, step, el) {
  var width = el.getAttribute('data-width');
  var translateX = (index - step) * width;
  if (index < step) translateX = translateX / 2;

  return {
    translate: { x: translateX },
    'box-shadow': `0 0 15px rgba(0,0,0,${linear(step,index) / 2})`
  };
};

Transforms.FADE_LEFT = function(index, step) {
  return {
    translate: { x: - (step - index) * (WINDOW_WIDTH/2.5) },
    opacity: symmetrical(step, index)
  };
};

Transforms.MOVE_TO_RIGHT = function(index, step) {
  return {
    translate: { x: (step - index) * (WINDOW_WIDTH/2.5) }
  };
};

module.exports = Transforms;