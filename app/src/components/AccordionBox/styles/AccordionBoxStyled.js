import styled from 'styled-components';

import {
  baseModule,
  textColorMediumDark,
} from '../../../styles/themeSelectors';

export const AccordionBoxStyled = styled.div`
  button {
    color: ${textColorMediumDark};
    
    &,
    &:hover,
    &:focus {
      padding-right: 12px !important;
    }
  }
  
  dl {
    box-sizing: border-box;
    margin: 0;
    padding: ${baseModule(1)}px 0;
  }
  
  dt {
    z-index: 2;
    position: relative;
  }
  
  dd {
    z-index: 1;
    transition-property: none;
  }
`;

AccordionBoxStyled.displayName = 'AccordionBoxStyled';
