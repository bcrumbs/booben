'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { Input, Button } from '@reactackle/reactackle';
import { SearchInputStyled } from './styles/SearchInputStyled';
import { InputWrapperStyled } from './styles/InputWrapperStyled';

const propTypes = {
  placeholder: PropTypes.string,
};

const defaultProps = {
  placeholder: '',
};

export const SearchInput = props => (
  <SearchInputStyled>
    <InputWrapperStyled>
      <Input fullWidth placeholder={props.placeholder} />
    </InputWrapperStyled>
    
    <Button icon={{ name: 'search' }} />
  </SearchInputStyled>
);

SearchInput.propTypes = propTypes;
SearchInput.defaultProps = defaultProps;
SearchInput.displayName = 'SearchInput';
