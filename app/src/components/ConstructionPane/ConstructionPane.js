'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { PaneRuler } from './PaneRuler/PaneRuler';
import { ArtboardExpander } from './ArtboardExpander/ArtboardExpander';
import { ConstructionPaneStyled } from './styles/ConstructionPaneStyled';
import { CanvasStyled } from './styles/CanvasStyled';
import { ArtboardDataStyled } from './styles/ArtboardDataStyled';
import { ArtboardDataContentStyled } from './styles/ArtboardDataContentStyled';
import { ArtboardDataTitleStyled } from './styles/ArtboardDataTitleStyled';
import { ArtboardDataSizeStyled } from './styles/ArtboardDataSizeStyled';
import { ArtboardBoxStyled } from './styles/ArtboardBoxStyled';
import { ArtboardStyled } from './styles/ArtboardStyled';

const propTypes = {
  isolated: PropTypes.bool,
  rulers: PropTypes.bool,
  // adaptive: PropTypes.bool,

  /*
   width/height - current component's (and artboard's) size
   if set in css, artboard's expanding is forbidden
   if it's not set in css, place here current <ParentComponent> dimensions. artboard's expanding is allowed within min/max boundaries
   */
  width: PropTypes.string,
  height: PropTypes.string,

  /*
   scan css for min/max dimensions
   */
  minWidth: PropTypes.string,
  maxWidth: PropTypes.string,
  minHeight: PropTypes.string,
  maxHeight: PropTypes.string,
};

const defaultProps = {
  isolated: false,
  rulers: false,
  // adaptive: true,
  width: '',
  height: '',
  minWidth: '',
  maxWidth: '',
  minHeight: '',
  maxHeight: '',
};

const ARTBOARD_PADDING = '150px';
const DIMENSION_DEFAULT = '300px';
// const DIMENSION_TOLERANCE = '50px';

/*
    CONSTRUCTION PANE
*/
export const ConstructionPane = props => {
  let rulerX = null;
  let rulerY = null;
  
  if (props.rulers) {
    rulerX = <PaneRuler position="horizontal" />;
    rulerY = <PaneRuler position="vertical" />;
  }

  const width = props.width ? props.width : DIMENSION_DEFAULT;
  const height = props.height ? props.height : DIMENSION_DEFAULT;

  const artboardBoxStyle = {
    minWidth: `calc(${width} + ${ARTBOARD_PADDING})`,
    minHeight: `calc(${height} + ${ARTBOARD_PADDING})`,
  };

  /*
    1. Container's sizes are fixed (container's width &/or height are determined in css): changing corresponding artboard's dimension is disabled
    2. One of container's dimensions (height or width) isn't set directly: take current <ParentComponent>'s size from main canvas.
    - if it's less than DIMENSION_TOLERANCE replace empty size with DIMENSION_DEFAULT
    - changing of corresponding artboard's dimension is allowed within min/max boundaries
    3. Nothing is set: use <dimension>=DIMENSION_DEFAULT
    - changing of corresponding artboard's dimension is allowed within min/max boundaries
   */
  const artboardStyle = {
    height,
    minHeight: props.maxHeight,
    maxHeight: props.minHeight,
    width,
    minWidth: props.minWidth,
    maxWidth: props.maxWidth,
  };

  let expanderX = null;
  let expanderY = null;
  let expanderEntire = null;

  if (!props.height) {
    expanderY = <ArtboardExpander position="vertical" />;
  }

  if (!props.width) {
    expanderX = <ArtboardExpander position="horizontal" />;
  }

  if (!props.width && !props.height) {
    expanderEntire = <ArtboardExpander position="entire" />;
  }
    
  // TODO: Strip units for artboardData and place there current artboard's size  (ex. 300 x 300)
  const artboardData = (
    <ArtboardDataStyled>
      <ArtboardDataContentStyled>
        <ArtboardDataTitleStyled>
          ParentComponent
        </ArtboardDataTitleStyled>
        <ArtboardDataSizeStyled>
          {width} x {height}
        </ArtboardDataSizeStyled>
      </ArtboardDataContentStyled>
    </ArtboardDataStyled>
  );

  let isolation = false;
  if (props.isolated) {
    isolation = (
      <CanvasStyled rulers={props.rulers}>
        <ArtboardBoxStyled style={artboardBoxStyle}>
          <ArtboardStyled style={artboardStyle}>
            {artboardData}

            <div>{props.children}</div>

            {expanderEntire}
            {expanderX}
            {expanderY}
          </ArtboardStyled>
        </ArtboardBoxStyled>
      </CanvasStyled>
    );
  }

  return (
    <ConstructionPaneStyled>
      {rulerX}
      {rulerY}
      {props.children}
      {isolation}
    </ConstructionPaneStyled>
  );
};

ConstructionPane.propTypes = propTypes;
ConstructionPane.defaultProps = defaultProps;
ConstructionPane.displayName = 'ConstructionPane';

export * from './ConstructionTool/ConstructionTool';
