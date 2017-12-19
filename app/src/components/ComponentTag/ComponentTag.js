import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ComponentTagStyled } from './styles/ComponentTagStyled';
import { TagStyled } from './styles/TagStyled';
import { ImageStyled } from './styles/ImageStyled';
import { TitleStyled } from './styles/TitleStyled';

const propTypes = {
  image: PropTypes.string,
  title: PropTypes.string,
  focused: PropTypes.bool,
  colorScheme: PropTypes.oneOf(['dark', 'light']),
};

const defaultProps = {
  image: '',
  title: '',
  focused: false,
  colorScheme: 'dark',
};

export class ComponentTag extends Component {
  shouldComponentUpdate(nextProps) {
    if (this.props.title === nextProps.title) {
      return false;
    } else {
      return true;
    }
  }

  render() {
    const { focused, colorScheme, image, title } = this.props;
    return (
      <ComponentTagStyled
        focused={focused}
        colorScheme={colorScheme}
      >
        <TagStyled>
          <ImageStyled>
            <img src={image} alt="" role="presentation" />
          </ImageStyled>

          <TitleStyled
            focused={focused}
            colorScheme={colorScheme}
          >
            {title}
          </TitleStyled>
        </TagStyled>
      </ComponentTagStyled>
    );
  }
}

ComponentTag.propTypes = propTypes;
ComponentTag.defaultProps = defaultProps;
ComponentTag.displayName = 'ComponentTag';

export * from './ComponentTagWrapper/ComponentTagWrapper';
