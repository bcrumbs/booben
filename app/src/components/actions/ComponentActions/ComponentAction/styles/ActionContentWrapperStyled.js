'use strict';

import styled from 'styled-components';
import { PropTypes } from 'prop-types';
import { actionConstants } from './constants';

import {
  baseModule,
} from '../../../../../styles/themeSelectors';

const propTypes = {
  theme: PropTypes.object,
};

const defaultProps = {
  theme: {},
};

const marginLeft =
  actionConstants.iconTextSpacing + actionConstants.iconTextSpacing;

export const ActionContentWrapperStyled = styled.div`
    margin-left: ${marginLeft}px;
    padding-bottom: ${baseModule(1.5)}px;
`;

ActionContentWrapperStyled.propTypes = propTypes;
ActionContentWrapperStyled.defaultProps = defaultProps;
ActionContentWrapperStyled.displayName = 'ActionContentWrapperStyled';
