'use strict';

import styled from 'styled-components';
import { PropTypes } from 'prop-types';
import { baseModule } from '../../../../../styles/themeSelectors';

const propTypes = {
  theme: PropTypes.object,
};

const defaultProps = {
  theme: {},
};

export const HandlerBodyStyled = styled.div`
  padding-left: ${baseModule(0.5)}px;
  padding-bottom: ${baseModule(1)}px;
`;

HandlerBodyStyled.propTypes = propTypes;
HandlerBodyStyled.defaultProps = defaultProps;
HandlerBodyStyled.displayName = 'HandlerBodyStyled';
