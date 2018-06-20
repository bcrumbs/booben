import React from 'react';
import PropTypes from 'prop-types';
import { Form, FormItem } from 'reactackle-form';
import { TextField } from 'reactackle-text-field';

import {
  BlockContentBox,
  BlockContentBoxItem,
  BlockContentBoxHeading,
} from '../../../components/BlockContent/index';

import { objectToArray } from '../../../utils/misc';

const propTypes = {
  params: PropTypes.object.isRequired,
  invalidParams: PropTypes.arrayOf(PropTypes.string).isRequired,
  getLocalizedText: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
};

export const RouteParams = ({
  params,
  invalidParams,
  getLocalizedText,
  onChange,
}) => {
  const errorMessage =
    getLocalizedText('structure.routeParamIsRequiredMessage');

  let routeParamsBoxHeading = null;
  let routeParamsBoxItem = null;

  const routeParamInputs = objectToArray(
    params,
    (paramValue, paramName) => {
      const isInvalid = invalidParams.indexOf(paramName) !== -1;

      return (
        <FormItem key={paramName}>
          <TextField
            dense
            label={paramName}
            value={params[paramName]}
            colorScheme={isInvalid ? 'error' : 'neutral'}
            message={isInvalid ? errorMessage : ''}
            onChange={({ value }) => onChange({
              params: { ...params, [paramName]: value },
            })}
          />
        </FormItem>
      );
    },
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
