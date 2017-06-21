'use strict';

import styled from 'styled-components';
import PropTypes from 'prop-types';
import { baseModule } from '../../../../../../styles/themeSelectors';

const propTypes = {
  theme: PropTypes.object,
};

const defaultProps = {
  theme: {},
};

export const CaseHeaderStyled = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: ${baseModule(1)}px;
`;

CaseHeaderStyled.propTypes = propTypes;
CaseHeaderStyled.defaultProps = defaultProps;
CaseHeaderStyled.displayName = 'CaseHeaderStyled';
