import styled from 'styled-components';

import {
  paletteBlueGrey50,
  paletteBlueGrey100,
} from '../../../styles/themeSelectors';

// TODO remove this after moving Accordion to SC
export const AccordionBoxStyled = styled.div`
  .accordion-item-content-box {
    padding: 0;
  }
  
  .accordion-item-is-collapsed .accordion-title {
    color: ${paletteBlueGrey50};
  }
  
  .accordion-title-icon-wrapper * {
    color: ${paletteBlueGrey100};
  }
  
  .accordion-title-box {
    position: relative;
    z-index: 2;
  }
`;

AccordionBoxStyled.displayName = 'AccordionBoxStyled';
