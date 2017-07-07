'use strict';

import styled from 'styled-components';
import PropTypes from 'prop-types';
import { transition } from '@reactackle/reactackle';

import {
  baseModule,
  colorMain,
  textColorBody,
  fontSizeSmall,
} from '../../../styles/themeSelectors';

const propTypes = {
  focused: PropTypes.bool,
};

const defaultProps = {
  focused: false,
};

const focused = ({
  focused,
}) => `color: ${focused ? colorMain : textColorBody};`;

export const TitleStyled = styled.div`
  font-size: ${fontSizeSmall}px;
  line-height: 1.25;
  padding: ${baseModule(0.5)}px;
  ${transition('color')};
  ${focused}
`;

TitleStyled.displayName = 'TitleStyled';
TitleStyled.propTypes = propTypes;
TitleStyled.defaultProps = defaultProps;
