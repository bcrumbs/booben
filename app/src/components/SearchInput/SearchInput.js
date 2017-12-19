import React from 'react';
import PropTypes from 'prop-types';
import { TextField } from '@reactackle/reactackle';
import { SearchInputStyled } from './styles/SearchInputStyled';
import { InputWrapperStyled } from './styles/InputWrapperStyled';
import { noop } from '../../utils/misc';
import { IconSearch } from '../icons';

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
  <SearchInputStyled>
    <InputWrapperStyled>
      <TextField
        fullWidth
        placeholder={props.placeholder}
        value={props.value}
        onChange={props.onChange}
        iconInner={<IconSearch />}
        clearingIcon
        dense
      />
    </InputWrapperStyled>
  </SearchInputStyled>
);

SearchInput.propTypes = propTypes;
SearchInput.defaultProps = defaultProps;
SearchInput.displayName = 'SearchInput';
