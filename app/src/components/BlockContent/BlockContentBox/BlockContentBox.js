import React from 'react';
import PropTypes from 'prop-types';
import { autoScrollUpDown } from '../../../hocs/autoScrollUpDown';
import { noop } from '../../../utils/misc';
import { BlockContentBoxAreaStyled } from './styles/BlockContentBoxAreaStyled';

const propTypes = {
  isBordered: PropTypes.bool,
  flex: PropTypes.bool,
  notScrollable: PropTypes.bool,
  hidden: PropTypes.bool,
  elementRef: PropTypes.func,
  colorScheme: PropTypes.oneOf(['default', 'alt']),
};

const defaultProps = {
  isBordered: false,
  flex: false,
  notScrollable: false,
  hidden: false,
  elementRef: noop,
  colorScheme: 'default',
};

const BlockContentBoxComponent = props => {
  const style = {};
  if (props.hidden) style.display = 'none';

  return (
    <BlockContentBoxAreaStyled
      bordered={props.isBordered}
      scrollable={!props.notScrollable}
      colorScheme={props.colorScheme}
      flex={props.flex}
      style={style}
      innerRef={props.elementRef}
    >
      {props.children}
    </BlockContentBoxAreaStyled>
  );
};

BlockContentBoxComponent.propTypes = propTypes;
BlockContentBoxComponent.defaultProps = defaultProps;
BlockContentBoxComponent.displayName = 'BlockContentBox';

export const BlockContentBox = autoScrollUpDown(BlockContentBoxComponent);
export * from './BlockContentBoxItem/BlockContentBoxItem';
export * from './BlockContentBoxHeading/BlockContentBoxHeading';
export * from './BlockContentBoxGroup/BlockContentBoxGroup';
