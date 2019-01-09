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
    
    * {
      box-sizing: border-box;
    }

    .rctckl__app-container {
      overflow-x: auto;
      height: 100vh;
      
      > * {
        min-width: 1265px;
        height: 100%;
        min-height: 100%;
      }
    }
  `;
};
