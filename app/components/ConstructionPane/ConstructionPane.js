import React, { PropTypes } from 'react';
import './ConstructionPane.scss';

const ARTBOARD_PADDING = '150px';
const DIMENSION_DEFAULT = '300px';
const DIMENSION_TOLERANCE = '50px';

/*
    PANE RULERS
    (we'll postpone it till better times)
*/
const PaneRuler = props => {
  const rulerPoints = false;

  return (
    <div className={`construction-pane_ruler ruler_position-${props.position}`}>
      {rulerPoints}
    </div>
  );
};

PaneRuler.propTypes = {
  position: PropTypes.oneOf(['horizontal', 'vertical']),
};

PaneRuler.defaultProps = {
  position: 'horizontal',
};

/*
    ARTBOARD EXPANDER
*/
const ArtboardExpander = props => (
  <div className={`construction-pane_artboard-expander artboard-expander_position-${props.position}`}>
    <div className="construction-pane_artboard-expander_icon" />
  </div>
    );

ArtboardExpander.propTypes = {
  position: PropTypes.oneOf(['horizontal', 'vertical', 'entire']),
};

ArtboardExpander.defaultProps = {
  position: 'horizontal',
};

/*
    CONSTRUCTION PANE
*/
export const ConstructionPane = props => {
  let className = 'construction-pane';

  let rulerX = null,
    rulerY = null;
  if (props.rulers) {
    className += ' has-rulers';

    rulerX = <PaneRuler position="horizontal" />;
    rulerY = <PaneRuler position="vertical" />;
  }

  const WIDTH = props.width ? props.width : DIMENSION_DEFAULT;
  const HEIGHT = props.height ? props.height : DIMENSION_DEFAULT;

  const ARTBOARD_BOX_STYLE = {
    minWidth: `calc(${WIDTH} + ${ARTBOARD_PADDING})`,
    minHeight: `calc(${HEIGHT} + ${ARTBOARD_PADDING})`,
  };

    /*
         1. Container's sizes are fixed (container's width &/or height are determined in css): changing corresponding artboard's dimension is disabled
         2. One of container's dimensions (height or width) isn't set directly: take current <ParentComponent>'s size from main canvas.
         - if it's less than DIMENSION_TOLERANCE replace empty size with DIMENSION_DEFAULT
         - changing of corresponding artboard's dimension is allowed within min/max boundaries
         3. Nothing is set: use <dimension>=DIMENSION_DEFAULT
         - changing of corresponding artboard's dimension is allowed within min/max boundaries
     */
  const ARTBOARD_STYLE = {
    height: HEIGHT,
    minHeight: props.maxHeight,
    maxHeight: props.minHeight,

    width: WIDTH,
    minWidth: props.minWidth,
    maxWidth: props.maxWidth,
  };

  let expanderX = null,
    expanderY = null,
    expanderEntire = null;

  if (!props.height)
    expanderY = <ArtboardExpander position="vertical" />;


  if (!props.width)
    expanderX = <ArtboardExpander position="horizontal" />;


  if (!props.width && !props.height)
    expanderEntire = <ArtboardExpander position="entire" />;


    /*
            ToDo: Strip units for artboardData and place there current artboard's size  (ex. 300 x 300)
     */
  const artboardData =
        (<div className="artboard-data">
          <div className="artboard-data-content">
            <div className="artboard-data_title">
                    ParentComponent
                </div>
            <div className="artboard-data_size">
              {WIDTH} x {HEIGHT}
            </div>
          </div>
        </div>);

  let isolation = false;
  if (props.isolated) {
    isolation =
            (<div className="construction-pane_canvas">
              <div className="construction-pane_artboard-box" style={ARTBOARD_BOX_STYLE}>
                <div className="construction-pane_artboard" style={ARTBOARD_STYLE}>
                  { artboardData }

                  <div className="construction-pane_artboard-content">
                    {props.children}
                  </div>

                  { expanderEntire }
                  { expanderX }
                  { expanderY }
                </div>
              </div>
            </div>);

    className += 'is-isolated';
  }

  return (
    <div className={className}>

      { rulerX }
      { rulerY }

      {props.children}

      {isolation}
    </div>
  );
};

ConstructionPane.propTypes = {
  isolated: PropTypes.bool,
  rulers: PropTypes.bool,
  adaptive: PropTypes.bool,

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

ConstructionPane.defaultProps = {
  isolated: false,
  rulers: false,
  adaptive: true,

  width: '',
  height: '',

  minWidth: '',
  maxWidth: '',
  minHeight: '',
  maxHeight: '',
};

ConstructionPane.displayName = 'ConstructionPane';

export * from './ConstructionTool/ConstructionTool';

