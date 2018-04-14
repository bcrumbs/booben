import styled from 'styled-components';
import { baseModule } from '../../../../styles/themeSelectors';

const my = 2;
const mx = 2;

const selected = ({ selected }) => selected
  ? `
    opacity: 1;
    pointer-events: initial;
    position: relative;
  `
  : '';

export const ButtonsStyled = styled.div`
  opacity: 0;
  pointer-events: none;
  position: fixed;
  margin: -6px -${baseModule(1)}px;
  margin-left: 0;
  width: calc(100% + ${baseModule(1)}px);
  text-align: right;
  ${selected}

  & > * {
      margin: ${my}px ${mx}px;
  }
  
  button > div {
    padding-top: 6px;
    padding-bottom: 6px;
  }
`;

ButtonsStyled.displayName = 'ButtonsStyled';
