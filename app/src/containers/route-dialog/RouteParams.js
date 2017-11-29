/**
 * @author Nick Maltsev
 */

import React from 'react';
import PropTypes from 'prop-types';

import {
  Form,
  FormItem,
  TextField,
} from '@reactackle/reactackle';

import {
  BlockContentBox,
  BlockContentBoxItem,
  BlockContentBoxHeading,
} from '@jssy/common-ui';

import { objectToArray } from '../../utils/misc';

const propTypes = {
  getLocalizedText: PropTypes.func.isRequired,
  handleChange: PropTypes.func.isRequired,
  params: PropTypes.object.isRequired,
};

const RouteParams = ({
  getLocalizedText,
  handleChange,
  params,
}) => {
  let routeParamsBoxHeading = null;
  let routeParamsBoxItem = null;
  
  const routeParamInputs = objectToArray(
    params,
    (paramValue, paramName) => (
      <FormItem key={paramName}>
        <TextField
          dense
          label={paramName}
          value={params[paramName]}
          onChange={({ value }) => handleChange({
            params: {
              ...params,
              [paramName]: value,
            },
          })}
        />
      </FormItem>
    ),
  );
  
  if (routeParamInputs.length) {
    routeParamsBoxHeading = (
      <BlockContentBoxHeading removePaddingX>
        {getLocalizedText('structure.routeParamValuesHeading')}
      </BlockContentBoxHeading>
    );
  
    routeParamsBoxItem = (
      <BlockContentBoxItem blank>
        <Form>
          {routeParamInputs}
        </Form>
      </BlockContentBoxItem>
    );
  }

  return (
    <BlockContentBox>
      {routeParamsBoxHeading}
      {routeParamsBoxItem}
    </BlockContentBox>
  );
};

RouteParams.propTypes = propTypes;
RouteParams.displayName = 'RouteParams';

export default RouteParams;
