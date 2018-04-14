import React from 'react';
import { AccordionBoxStyled } from './styles/AccordionBoxStyled';

export const AccordionBox = ({ children }) => (
  <AccordionBoxStyled>
    {children}
  </AccordionBoxStyled>
);

AccordionBox.displayName = 'AccordionBox';
