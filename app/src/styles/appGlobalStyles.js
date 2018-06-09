import { injectGlobal } from 'styled-components';

export const injectAppStyle = () => {
  // eslint-disable-next-line no-unused-expressions
  injectGlobal` 
    .rct-shortcuts-wrapper {
      &,
      &:hover,
      &:focus {
        outline: none;
      }
    }
  `;
};
