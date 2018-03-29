import styled from 'styled-components';

export const PropsAccordionStyled = styled.div`
  dt button {
    &,
    &:hover,
    &:focus {
      padding-right: 12px;
    }
  }
  
  dd {
    padding: 0;
  }
`;

PropsAccordionStyled.displayName = 'PropsAccordionStyled';
