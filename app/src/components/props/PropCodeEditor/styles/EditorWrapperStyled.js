import styled from 'styled-components';
import blockContentConstants from '../../../BlockContent/styles/constants';
import {
  baseModule,
  paletteBlueGrey800,
} from '../../../../styles/themeSelectors';

const marginOffset = blockContentConstants.basePaddingX;

export const EditorWrapperStyled = styled.div`
  margin-top: ${baseModule(1)}px;
  margin-left: -${marginOffset}px;
  margin-right: -${marginOffset}px;
  width: calc(100% + ${marginOffset}px * 2);
  
  .CodeMirror {
    background-color: ${paletteBlueGrey800} !important;
  }
`;

EditorWrapperStyled.displayName = 'EditorWrapperStyled';
