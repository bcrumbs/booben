'use strict';

import { Component, Children } from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  window: PropTypes.object.isRequired,
  document: PropTypes.object.isRequired,
};

const childContextTypes = {
  window: PropTypes.object.isRequired,
  document: PropTypes.object.isRequired,
};

export class DocumentContext extends Component {
  getChildContext() {
    const { window, document } = this.props;
    return { window, document };
  }
  
  render() {
    const { children } = this.props;
    return Children.only(children);
  }
}

DocumentContext.propTypes = propTypes;
DocumentContext.childContextTypes = childContextTypes;
DocumentContext.displayName = 'DocumentContext';
