'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { Input, Button } from '@reactackle/reactackle';
import { SearchInputStyled } from './styles/SearchInputStyled';
import { InputWrapperStyled } from './styles/InputWrapperStyled';
import { noop } from '../../utils/misc';

const propTypes = {
  placeholder: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  onButtonPress: PropTypes.func,
};

const defaultProps = {
  placeholder: '',
  value: '',
  onChange: noop,
  onButtonPress: noop,
};

export const SearchInput = props => (
  <SearchInputStyled>
    <InputWrapperStyled>
      <Input
        fullWidth
        placeholder={props.placeholder}
        value={props.value}
        onChange={props.onChange}
      />
    </InputWrapperStyled>
    
    <Button
      icon={{ name: 'search' }}
      onPress={props.onButtonPress}
    />
  </SearchInputStyled>
);

SearchInput.propTypes = propTypes;
SearchInput.defaultProps = defaultProps;
SearchInput.displayName = 'SearchInput';
