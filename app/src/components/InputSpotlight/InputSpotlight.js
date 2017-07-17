/**
 * @author Ekaterina Marova
 */

'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { TextField, Theme } from '@reactackle/reactackle';
import { InputSpotlightStyled } from './styles/InputSpotlightStyled';
import { ContentStyled } from './styles/ContentStyled';
import { InputWrapperStyled } from './styles/InputWrapperStyled';
import { OptionsWrapperStyled } from './styles/OptionsWrapperStyled';
import reactackleThemeMixin from './styles/reactackle-theme-mixin';
import { noop } from '../../utils/misc';

const propTypes = {
  placeholder: PropTypes.string,
  value: PropTypes.string,
  inputRef: PropTypes.func,
  onChange: PropTypes.func,
};

const defaultProps = {
  placeholder: '',
  value: '',
  inputRef: noop,
  onChange: noop,
};

export const InputSpotlight = props => (
  <Theme mixin={reactackleThemeMixin}>
    <InputSpotlightStyled>
      <ContentStyled>
        <InputWrapperStyled>
          <TextField
            ref={props.inputRef}
            fullWidth
            placeholder={props.placeholder}
            value={props.value}
            onChange={props.onChange}
          />
        </InputWrapperStyled>

        {
          props.children && (
            <OptionsWrapperStyled>
              {props.children}
            </OptionsWrapperStyled>
          )
        }
      </ContentStyled>
    </InputSpotlightStyled>
  </Theme>
);

InputSpotlight.propTypes = propTypes;
InputSpotlight.defaultProps = defaultProps;
InputSpotlight.displayName = 'InputSpotlight';

export * from './OptionsGroup/OptionsGroup';
export * from './OptionsGroupTitle/OptionsGroupTitle';
export * from './OptionsList/OptionsList';
export * from './Option/Option';
