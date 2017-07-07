'use strict';

import styled from 'styled-components';

import {
  baseModule,
  paletteBlueGrey200,
  textColorMedium,
} from '../../../styles/themeSelectors';

const codeMirrorOffset = 30; // CodeMirror ruler width + border

export const HeadingStyled = styled.div`
  background-color: ${paletteBlueGrey200};
  color: ${textColorMedium};
  padding: ${baseModule}px ${codeMirrorOffset}px;
  user-select: none;

  pre {
      padding: 0;
      margin: 0;
  }
`;

HeadingStyled.displayName = 'HeadingStyled';
