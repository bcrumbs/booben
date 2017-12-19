import styled from 'styled-components';

import {
  baseModule,
  textColorMedium,
  textColorLight,
  fontWeightSemibold,
  colorBorderDark,
} from '../../../styles/themeSelectors';

export const PropsAccordionStyled = styled.div`
  .accordion-item {
    border-top: 1px solid ${colorBorderDark};
    
    &:first-child {
      border-top-width: 0;
    }
  }
  
  .accordion-title-box {
    background-color: transparent;
  }
  
  .accordion-title {
    text-transform: uppercase;
    color: ${textColorMedium};
    font-size: 11px;
    font-weight: ${fontWeightSemibold};
    padding-left: ${baseModule(1.5)}px;
  }
    
  .accordion-item-is-expanded .accordion-title {
    color: ${textColorLight};
  }
  
  .accordion-item-is-collapsed .accordion-title-box {
    opacity: 1;
  }
  
  .accordion-title-icon-wrapper > * {
    color: ${textColorMedium};
  }
  
  .accordion-item-content-box {
    padding: 0;
  }
`;

PropsAccordionStyled.displayName = 'PropsGroupStyled';
