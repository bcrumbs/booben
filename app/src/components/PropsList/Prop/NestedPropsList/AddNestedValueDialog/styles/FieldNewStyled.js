'use strict';

import PropTypes from 'prop-types';
import styled from 'styled-components';
import { colorActiveBg } from '../../../../../../styles/themeSelectors';
import constants from '../../../../styles/constants';

const propTypes = {
  nested: PropTypes.bool,
};

const defaultProps = {
  nested: false,
};

export const FieldNewStyled = styled.div`
  margin: ${constants.list.marginBottom}px 0 0;
  padding: ${constants.list.paddingY}px ${constants.list.paddingX}px;
  background-color: ${colorActiveBg};
`;

FieldNewStyled.displayName = 'FieldNewStyled';
FieldNewStyled.propTypes = propTypes;
FieldNewStyled.defaultProps = defaultProps;
