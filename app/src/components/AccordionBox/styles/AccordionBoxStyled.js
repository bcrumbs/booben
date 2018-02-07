import styled from 'styled-components';

import {
  textColorMediumDark,
} from '../../../styles/themeSelectors';

export const AccordionBoxStyled = styled.div`
  button {
    color: ${textColorMediumDark};
  }
  
  dt {
    z-index: 2;
    position: relative;
  }
  
  dd {
    z-index: 1;
  }
`;

AccordionBoxStyled.displayName = 'AccordionBoxStyled';
