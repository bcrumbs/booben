'use strict';

// noinspection JSUnresolvedVariable
import React, { PropTypes } from 'react';

import {
    Input,
    Button,
} from '@reactackle/reactackle';

import {
    BlockContentBoxItem,
    BlockContentBoxHeading,
} from '../../BlockContent/BlockContent';

import { returnArg, noop } from '../../../utils/misc';

const propTypes = {
  getLocalizedText: PropTypes.func,
  onAdd: PropTypes.func,
};

const defaultProps = {
  getLocalizedText: returnArg,
  onAdd: noop,
};

// TODO: Convert to class and save inputs' values on this

export const FunctionArgumentNew = ({ getLocalizedText, onAdd }) => (
  <div className="function-arguments_new-wrapper" >
    <BlockContentBoxItem>
      <BlockContentBoxHeading>
        {getLocalizedText('replace_me:New Argument')}
      </BlockContentBoxHeading>

      <div className="inputs-row" >
        <Input label={getLocalizedText('replace_me:Title')} />
        <Input label={getLocalizedText('replace_me:Type')} />
      </div>

      <div className="button-row" >
        <Button
          text={getLocalizedText('replace_me:Add argument')}
          narrow
          onPress={onAdd}
        />
      </div>
    </BlockContentBoxItem>
  </div>
);

FunctionArgumentNew.propTypes = propTypes;
FunctionArgumentNew.defaultProps = defaultProps;
FunctionArgumentNew.displayName = 'FunctionArgumentNew';
