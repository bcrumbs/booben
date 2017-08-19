import React from 'react';
import PropTypes from 'prop-types';
import { PickViewStyled } from './styles/PickViewStyled';

const propTypes = {
  title: PropTypes.string,
};

const defaultProps = {
  title: '',
};

export const PickView = props => (
  <PickViewStyled>
    {props.title}
  </PickViewStyled>
);

PickView.displayName = 'PickView';
PickView.propTypes = propTypes;
PickView.defaultProps = defaultProps;
