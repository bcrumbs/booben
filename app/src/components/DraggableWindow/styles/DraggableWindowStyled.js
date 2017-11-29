import styled from 'styled-components';
import { boxShadow } from '../../../styles/mixins';

import {
  paletteBlueGrey600,
  radiusDefault,
  baseModule,
} from '../../../styles/themeSelectors';

const boxShadowDefault = boxShadow(1);
const boxShadowDragged = boxShadow(2);
const sectionMargin = baseModule(0.5);
const doubleMargin = baseModule(1);

const dragged = ({ dragged }) => dragged
  ? `
    cursor: move;
    ${boxShadowDragged}

    * {
        pointer-events: none !important;
        user-select: none;
    }
  `
  : '';

const maxHeight = ({ maxHeight }) => {
  let height = null;

  if (maxHeight) {
    height = typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight;
  } else {
    height = `calc(100vh - ${doubleMargin}px)`;
  }

  return `max-height: ${height};`;
};

const minWidth = ({ minWidth }) => `max-height: ${`${minWidth}px` || '0'};`;

const zIndex = ({ zIndex }) => `z-index: ${zIndex || '0'};`;

export const DraggableWindowStyled = styled.div`
  background-color: ${paletteBlueGrey600};
  border-radius: ${radiusDefault}px;
  display: flex;
  align-items: stretch;
  margin: ${sectionMargin}px;
  max-width: calc(100% - ${doubleMargin}px);
  position: absolute;
  ${zIndex}
  ${minWidth}
  ${maxHeight}
  ${boxShadowDefault}
  ${dragged}
`;

DraggableWindowStyled.displayName = 'DraggableWindowStyled';
