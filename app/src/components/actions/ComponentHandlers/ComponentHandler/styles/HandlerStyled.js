'use strict';

import styled from 'styled-components';
import { PropTypes } from 'prop-types';

const propTypes = {
  theme: PropTypes.object,
};

const defaultProps = {
  theme: {},
};

export const HandlerStyled = styled.button`
  &,
  &:hover,
  &:focus {
    box-shadow: none;
    outline: none;
    background-color: transparent;
    padding: 0;
    margin: 0;
    width: 100%;
    border: 0;
    text-align: left;
    cursor: pointer;
  }
`;

HandlerStyled.propTypes = propTypes;
HandlerStyled.defaultProps = defaultProps;
HandlerStyled.displayName = 'HandlerStyled';
