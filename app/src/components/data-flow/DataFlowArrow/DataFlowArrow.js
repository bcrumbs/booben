import React from 'react';
import PropTypes from 'prop-types';
import { WrapperStyled } from './styles/WrapperStyled';
import { DataFlowArrowStyled } from './styles/DataFlowArrowStyled';
import { ArrowStyled } from './styles/ArrowStyled';
import { PathStyled } from './styles/PathStyled';
import constants from '../styles/constants';

const propTypes = {
  start: PropTypes.arrayOf({
    x: PropTypes.number,
    y: PropTypes.number,
  }),
  end: PropTypes.arrayOf({
    x: PropTypes.number,
    y: PropTypes.number,
  }),
  colorScheme: PropTypes.oneOf([
    'default',
    'string',
    'bool',
    'number',
    'array',
    'object',
  ]),
  focused: PropTypes.bool,
};

const defaultProps = {
  start: { x: 0, y: 0 },
  end: { x: 200, y: 150 },
  colorScheme: 'default',
  focused: false,
};

// TODO Сейчаc не предусмотрен случай, когда width < arWidth
export const DataFlowArrow = props => {
  /*
   * Arrow params
   */
  const arHeight = 12;
  const arWidth = 14;
  const arGroove = 3;
  const arNarrow = arWidth - arGroove;

  /*
   * Path params
   */
  const nodeSize = constants.nodeSize;
  const offsetX = nodeSize / 2;
  const width = Math.abs(props.end.x - props.start.x);
  const height = Math.abs(props.end.y - props.start.y) + arHeight / 2;
  const color = constants.color[props.colorScheme];
  const strokeWidth = props.focused ? 3 : 2;
  const xPositive = props.start.x < props.end.x;
  const yPositive = props.start.y < props.end.y;
  const xMin = xPositive ? props.start.x : props.end.x;
  const yMin = yPositive ? props.start.y : props.end.y;
  const transformX = !xPositive ? 'scaleX(-1)' : '';
  const transformY = !yPositive ? 'scaleY(-1)' : '';
  
  const pathStyles = {
    width: `${width}px`,
    height: `${height}px`,
    top: `${yMin}px`,
    left: `${xMin}px`,
    transform: `${transformX} ${transformY}`,
  };

  const arrow = (
    <ArrowStyled
      fill={color}
      points={`
        ${width - offsetX} ${height - arHeight / 2},
        ${width - arWidth - offsetX} ${height - arHeight},
        ${width - arNarrow - offsetX} ${height - arHeight / 2},
        ${width - arWidth - offsetX} ${height}
      `}
    />
  );
  
  const curveShoulder = width / 5;
  const pathXStart = offsetX + curveShoulder;
  const pathYStart = strokeWidth / 2;
  const pathXEnd = width - arNarrow - nodeSize / 2;
  const pathYEnd = height - arHeight / 2;
  const startCurve = `${pathXStart} ${pathYStart}`;
  const endCurve = `${pathXEnd - curveShoulder} ${pathYEnd} ${pathXEnd} ${pathYEnd}`;

  return (
    <DataFlowArrowStyled style={pathStyles}>
      <WrapperStyled
        xmlns="http://www.w3.org/2000/svg"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <g>
          ${arrow}
          <PathStyled
            strokeWidth={strokeWidth}
            stroke={color}
            d={`M${offsetX} ${strokeWidth / 2} ${startCurve} ${endCurve}`}
          />
        </g>
      </WrapperStyled>
    </DataFlowArrowStyled>
  );
};

DataFlowArrow.displayName = 'DataFlowArrow';
DataFlowArrow.propTypes = propTypes;
DataFlowArrow.defaultProps = defaultProps;
