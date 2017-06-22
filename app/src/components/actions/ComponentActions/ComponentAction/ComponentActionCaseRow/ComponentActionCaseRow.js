/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { CaseRowStyled } from './styles/CaseRowStyled';
import { CaseHeaderStyled } from './styles/CaseHeaderStyled';
import { CaseTitleStyled } from './styles/CaseTitleStyled';
import { CaseBodyStyled } from './styles/CaseBodyStyled';
import { CaseMarkerStyled } from './styles/CaseMarkerStyled';

const propTypes = {
  type: PropTypes.oneOf(['success', 'error', 'neutral']),
  title: PropTypes.string,
};

const defaultProps = {
  type: 'success',
  title: '',
};

export const ComponentActionCaseRow = ({ type, title, children }) => (
  <CaseRowStyled>
    <CaseHeaderStyled>
      <CaseMarkerStyled type={type} />
      
      <CaseTitleStyled>
        {title}
      </CaseTitleStyled>
    </CaseHeaderStyled>
    
    <CaseBodyStyled>
      {children}
    </CaseBodyStyled>
  </CaseRowStyled>
);

ComponentActionCaseRow.propTypes = propTypes;
ComponentActionCaseRow.defaultProps = defaultProps;
ComponentActionCaseRow.displayName = 'ComponentActionCaseRow';
