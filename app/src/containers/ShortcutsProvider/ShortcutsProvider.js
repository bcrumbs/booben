import { PureComponent, Children } from 'react';
import PropTypes from 'prop-types';
import { ShortcutManager } from 'react-shortcuts';

const propTypes = {
  keymap: PropTypes.object.isRequired,
};

const childContextTypes = {
  shortcuts: PropTypes.object.isRequired,
};

export class ShortcutsProvider extends PureComponent {
  constructor(props, context) {
    super(props, context);
    
    this._shortcutsManager = new ShortcutManager(props.keymap);
  }
  
  getChildContext() {
    return {
      shortcuts: this._shortcutsManager,
    };
  }
  
  componentWillReceiveProps(nextProps) {
    const { keymap } = this.props;
    
    if (nextProps.keymap !== keymap) {
      throw new Error('ShortcutsProvider: keymap prop should not change');
    }
  }
  
  render() {
    const { children } = this.props;
    return Children.only(children);
  }
}

ShortcutsProvider.propTypes = propTypes;
ShortcutsProvider.childContextTypes = childContextTypes;
ShortcutsProvider.displayName = 'ShortcutsProvider';
