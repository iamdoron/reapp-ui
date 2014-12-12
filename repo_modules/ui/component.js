var Component = require('reapp-component')();
var React = require('react');
var Styled = require('./lib/mixins/Styled');
var Classed = require('./lib/mixins/Classed');
var Animated = require('./lib/mixins/Animated');
var Identified = require('./lib/mixins/Identified');
var merge = require('lodash-node/modern/objects/merge');

// clone
Component.addStatics('clone', function(children, props, keepOriginalProps) {
  if (!children) return;

  return React.Children.map(children, child => {
    return React.isValidElement(child) ?
      React.addons.cloneWithProps(child, keepOriginalProps ?
        merge(child.props, props) :
        props) :
      child;
  });
});

Component.addDecorator(spec => {
  spec.mixins = [].concat(
    Identified,
    Animated,
    Styled(spec.name),
    Classed(spec.name),
    spec.mixins || [],
    {
      componentProps(componentName) {
        return {
          id: this._uniqueID,
          ref: componentName || spec.name,
          className: this.getClasses(componentName),
          styles: this.getStyles(componentName)
        };
      }
    }
  );

  spec.displayName = 'UI-' + spec.name;

  // allow checking for "isName" on all components
  spec.statics = spec.statics || {};
  spec.statics[`is${spec.name}`] = true;

  return React.createClass(spec);
});

module.exports = Component;