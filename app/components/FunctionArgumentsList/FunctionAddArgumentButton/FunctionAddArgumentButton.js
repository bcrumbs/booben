/**
 * @author Dmitriy Bizyaev
 */

'use strict';

// noinspection JSUnresolvedVariable
import React, { PropTypes } from 'react';
import { Button } from '@reactackle/reactackle';
import { BlockContentBoxItem } from '../../BlockContent/BlockContent';
import { returnArg, noop } from '../../../utils/misc';

const propTypes = {
  getLocalizedText: PropTypes.func,
  onPress: PropTypes.func,
};

const defaultProps = {
  getLocalizedText: returnArg,
  onPress: noop,
};

export const FunctionAddArgumentButton = ({ getLocalizedText, onPress }) => (
  <div className="function-arguments_list-button">
    <BlockContentBoxItem>
      <Button
        icon="plus"
        text={getLocalizedText('replace_me:New argument')}
        narrow
        onPress={onPress}
      />
    </BlockContentBoxItem>;
  </div>
);

FunctionAddArgumentButton.propTypes = propTypes;
FunctionAddArgumentButton.defaultProps = defaultProps;
FunctionAddArgumentButton.displayName = 'FunctionAddArgumentButton';
