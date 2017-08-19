import React from 'react';
import PropTypes from 'prop-types';
import { PanelItemStyled } from './styles/PanelItemStyled';

const propTypes = {
  bordered: PropTypes.bool,
  hasPaddings: PropTypes.bool,
};

const defaultProps = {
  bordered: false,
  hasPaddings: false,
};

export const PanelCollapsibleItem = props => (
  <PanelItemStyled
    bordered={props.bordered}
    hasPaddings={props.hasPaddings}
  >
    {props.children}
  </PanelItemStyled>
);

PanelCollapsibleItem.displayName = 'PanelCollapsibleItem';
PanelCollapsibleItem.propTypes = propTypes;
PanelCollapsibleItem.defaultProps = defaultProps;
