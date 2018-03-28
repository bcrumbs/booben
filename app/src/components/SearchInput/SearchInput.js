import React from 'react';
import PropTypes from 'prop-types';
import { Theme } from 'reactackle-core';
import { TextField } from 'reactackle-text-field';
import { SearchInputStyled } from './styles/SearchInputStyled';
import { InputWrapperStyled } from './styles/InputWrapperStyled';
import { noop } from '../../utils/misc';
import { IconSearch } from '../icons';
import reactackleThemeMixin from './styles/reactackle-theme-mixin';

const propTypes = {
  placeholder: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
};

const defaultProps = {
  placeholder: '',
  value: '',
  onChange: noop,
};

export const SearchInput = props => (
  <Theme mixin={reactackleThemeMixin}>
    <SearchInputStyled>
      <InputWrapperStyled>
        <TextField
          dense
          fullWidth
          placeholder={props.placeholder}
          value={props.value}
          onChange={props.onChange}
          iconInner={<IconSearch size="custom" color="currentColor" />}
          clearingIcon
        />
      </InputWrapperStyled>
    </SearchInputStyled>
  </Theme>
);

SearchInput.propTypes = propTypes;
SearchInput.defaultProps = defaultProps;
SearchInput.displayName = 'SearchInput';
