import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { noop } from '../../../utils/misc';
import { RouteCardStyled } from '../RouteCard/styles/RouteCardStyled';
import { CardWrapperStyled } from '../RouteCard/styles/CardWrapperStyled';
import { CardStyled } from '../RouteCard/styles/CardStyled';
import { CardContentStyled } from '../RouteCard/styles/CardContentStyled';
import { TextBoxStyled } from '../RouteCard/styles/TextBoxStyled';
import { TitleBoxStyled } from '../RouteCard/styles/TitleBoxStyled';
import { TitleStyled } from '../RouteCard/styles/TitleStyled';

const propTypes = {
  routeId: PropTypes.number.isRequired,
  title: PropTypes.string,
  focused: PropTypes.bool,
  onFocus: PropTypes.func,
  onGo: PropTypes.func,
};

const defaultProps = {
  title: '',
  focused: false,
  onFocus: noop,
  onGo: noop,
};

export class IndexRouteCard extends PureComponent {
  constructor(props, context) {
    super(props, context);

    this._element = null;

    this._handleDoubleClick = this._handleDoubleClick.bind(this);
    this._handleCardClick = this._handleCardClick.bind(this);
    this._saveRef = this._saveRef.bind(this);
  }

  componentDidMount() {
    this._element.addEventListener('dblclick', this._handleDoubleClick);
  }

  componentWillUpdate(nextProps) {
    const { onGo } = this.props;

    if (nextProps.onGo !== onGo) {
      this._element.removeEventListener('dblclick', this._handleDoubleClick);
    }
  }

  componentDidUpdate(prevProps) {
    const { onGo } = this.props;

    if (prevProps.onGo !== onGo) {
      this._element.addEventListener('dblclick', this._handleDoubleClick);
    }
  }

  componentWillUnmount() {
    this._element.removeEventListener('dblclick', this._handleDoubleClick);
  }

  _handleDoubleClick() {
    const { routeId, onGo } = this.props;
    onGo({ routeId, isIndexRoute: true });
  }

  _handleCardClick() {
    const { routeId, onFocus } = this.props;
    onFocus({ routeId, isIndexRoute: true });
  }

  _saveRef(el) {
    this._element = el;
  }

  render() {
    const { title, focused } = this.props;

    return (
      <RouteCardStyled>
        <CardWrapperStyled index>
          <CardStyled
            index
            focused={focused}
            tabIndex="0"
            onClick={this._handleCardClick}
            innerRef={this._saveRef}
          >
            <CardContentStyled>
              <TextBoxStyled>
                <TitleBoxStyled>
                  <TitleStyled index>{title}</TitleStyled>
                </TitleBoxStyled>
              </TextBoxStyled>
            </CardContentStyled>
          </CardStyled>
        </CardWrapperStyled>
      </RouteCardStyled>
    );
  }
}

IndexRouteCard.propTypes = propTypes;
IndexRouteCard.defaultProps = defaultProps;
IndexRouteCard.displayName = 'IndexRouteCard';
