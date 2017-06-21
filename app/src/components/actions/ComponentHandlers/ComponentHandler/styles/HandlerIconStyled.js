'use strict';

import styled from 'styled-components';
import { PropTypes } from 'prop-types';
import { transition } from '@reactackle/reactackle';

const propTypes = {
  theme: PropTypes.object,
};

const defaultProps = {
  theme: {},
};

const expanded = ({ expanded }) => expanded
  ? '> * { transform: rotate(90deg); }'
  : '';

export const HandlerIconStyled = styled.div`
  display: flex;
  
  ${expanded}
  
  ${transition('transform')}
`;

HandlerIconStyled.propTypes = propTypes;
HandlerIconStyled.defaultProps = defaultProps;
HandlerIconStyled.displayName = 'HandlerIconStyled';
