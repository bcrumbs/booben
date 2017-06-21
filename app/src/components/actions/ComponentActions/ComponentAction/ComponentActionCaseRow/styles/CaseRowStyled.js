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

export const CaseRowStyled = styled.div`
  margin-top: ${baseModule(1.5)}px;
  
  & + & {
    margin-top: ${baseModule(2)}px;
  }  
`;

CaseRowStyled.propTypes = propTypes;
CaseRowStyled.defaultProps = defaultProps;
CaseRowStyled.displayName = 'CaseRowStyled';
