'use strict';

import PropTypes from 'prop-types';
import styled from 'styled-components';
import constants from './constants';
import { baseModule, paletteBlueGrey200 } from '../../../styles/themeSelectors';

const propTypes = {
  nested: PropTypes.bool,
};

const defaultProps = {
  nested: false,
};

const itemOffsetX = constants.item.paddingX;

const nested = ({ nested }) => nested
  ? `
    margin-left: -${itemOffsetX}px;
    margin-right: -${itemOffsetX}px;
    padding-left: calc(${baseModule(2.5)}px + $${itemOffsetX}px) !important;
    opacity: 0;
    pointer-events: none;
    position: fixed;
    margin-bottom: ${constants.list.marginBottom}px;
    border-bottom: 2px solid ${paletteBlueGrey200};
  `
  : '';

export const PropsListStyled = styled.div`
  border-left: 0 solid transparent;
  ${nested}
`;

PropsListStyled.displayName = 'PropsListStyled';
PropsListStyled.propTypes = propTypes;
PropsListStyled.defaultProps = defaultProps;
