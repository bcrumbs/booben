'use strict';

import styled from 'styled-components';
import { PropTypes } from 'prop-types';
import { transition } from '@reactackle/reactackle';
import {
  radiusDefault,
  colorActiveBg,
} from '../../../../../styles/themeSelectors';

const propTypes = {
  theme: PropTypes.object,
};

const defaultProps = {
  theme: {},
};

export const ActionLinkWrapperStyled = styled.a`
  display: flex;
  flex-grow: 1;
  border-radius: ${radiusDefault}px;
  cursor: pointer;

  &:hover {
      background-color: ${colorActiveBg};
  }
  
  ${transition('background-color')}
`;

ActionLinkWrapperStyled.propTypes = propTypes;
ActionLinkWrapperStyled.defaultProps = defaultProps;
ActionLinkWrapperStyled.displayName = 'ActionLinkWrapperStyled';
