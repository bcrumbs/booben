/**
 * @author Ekaterina Marova
 */

'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { Input, Theme } from '@reactackle/reactackle';
import { InputSpotlightStyled } from './styles/InputSpotlightStyled';
import { ContentStyled } from './styles/ContentStyled';
import { InputWrapperStyled } from './styles/InputWrapperStyled';
import { OptionsWrapperStyled } from './styles/OptionsWrapperStyled';
import reactackleThemeMixin from './styles/reactackle-theme-mixin';
import { noop } from '../../utils/misc';

const propTypes = {
  placeholder: PropTypes.string,
  inputRef: PropTypes.func,
  onChange: PropTypes.func,
};

const defaultProps = {
  placeholder: '',
  inputRef: noop,
  onChange: noop,
};

export const InputSpotlight = props => (
  <Theme mixin={reactackleThemeMixin}>
    <InputSpotlightStyled>
      <ContentStyled>
        <InputWrapperStyled>
          <Input
            ref={props.inputRef}
            fullWidth
            placeholder={props.placeholder}
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
