/**
 * @author Dmitriy Bizyaev
 */

'use strict';

//noinspection JSUnresolvedVariable
import React, { PureComponent, PropTypes } from 'react';
import { FunctionShape } from '../common';

const propTypes = {
  functionDef: FunctionShape.isRequired,
};

const defaultProps = {

};

export class FunctionWindow extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {

    };
  }

  render() {

  }
}

FunctionWindow.propTypes = propTypes;
FunctionWindow.defaultProps = defaultProps;
FunctionWindow.displayName = 'FunctionWindow';
