import React from 'react';
import PropTypes from 'prop-types';
import { TextField } from '@reactackle/reactackle';
import { SearchInputStyled } from './styles/SearchInputStyled';
import { InputWrapperStyled } from './styles/InputWrapperStyled';
import { noop } from '../../utils/misc';

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

export class SearchInput extends React.Component {
  shouldComponentUpdate(nextProps) {
    if (this.props.placeholder === nextProps.placeholder) {
      return false;
    } else {
      return true;
    }
  }
  
  render() {
    return (
      <SearchInputStyled>
        <InputWrapperStyled>
          <TextField
            fullWidth
            placeholder={this.props.placeholder}
            value={this.props.value}
            onChange={this.props.onChange}
            iconInner={{ name: 'search' }}
            clearingIcon
            dense
          />
        </InputWrapperStyled>
      </SearchInputStyled>
    );
  }
  }

SearchInput.propTypes = propTypes;
SearchInput.defaultProps = defaultProps;
SearchInput.displayName = 'SearchInput';
