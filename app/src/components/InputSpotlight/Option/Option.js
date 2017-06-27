/**
 * @author Ekaterina Marova
 */

'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { OptionStyled } from './styles/OptionStyled';

const propTypes = {
  active: PropTypes.bool,
};

const defaultProps = {
  active: false,
};

export const Option = ({ active, children }) => (
  <OptionStyled active={active} tabIndex={0}>
    {children}
  </OptionStyled>
);

Option.propTypes = propTypes;
Option.defaultProps = defaultProps;
Option.displayName = 'Option';
