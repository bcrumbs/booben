import React from 'react';
import PropTypes from 'prop-types';
import { TreeListStyled } from './styles/TreeListStyled';

const propTypes = {
  level: PropTypes.number,
};

const defaultProps = {
  level: 0,
};

export const TreeList = ({ children, level }) => (
  <TreeListStyled level={level}>
    {children}
  </TreeListStyled>
);

TreeList.propTypes = propTypes;
TreeList.defaultProps = defaultProps;
