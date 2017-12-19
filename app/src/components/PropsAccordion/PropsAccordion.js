import React from 'react';
import { Accordion } from '@reactackle/reactackle';
import { PropsAccordionStyled } from './styles/PropsAccordionStyled';

export const PropsAccordion = props => (
  <PropsAccordionStyled>
    <Accordion {...props} />
  </PropsAccordionStyled>
);

PropsAccordion.propTypes = Accordion.propTypes;
PropsAccordion.defaultProps = Accordion.defaultProps;
PropsAccordion.displayName = 'PropsAccordion';
