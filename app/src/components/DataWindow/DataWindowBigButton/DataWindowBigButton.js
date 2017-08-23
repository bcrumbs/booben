import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@reactackle/reactackle';
import { DataWindowBigButtonStyled } from './styles/DataWindowBigButtonStyled';
import { noop } from '../../../utils/misc';

const propTypes = {
  text: PropTypes.string,
  icon: PropTypes.shape({
    name: PropTypes.string,
    src: PropTypes.string,
    type: PropTypes.oneOf(['font-awesome', 'library']),
  }),
  onPress: PropTypes.func,
};

const defaultProps = {
  text: '',
  icon: null,
  onPress: noop,
};

export const DataWindowBigButton = ({ text, icon, onPress }) => (
  <DataWindowBigButtonStyled>
    <Button
      radius="none"
      colorScheme="primary"
      text={text}
      icon={icon}
      onPress={onPress}
    />
  </DataWindowBigButtonStyled>
);

DataWindowBigButton.propTypes = propTypes;
DataWindowBigButton.defaultProps = defaultProps;
DataWindowBigButton.displayName = 'DataWindowBigButton';
