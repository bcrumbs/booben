/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { Shortcuts } from 'react-shortcuts';
import _debounce from 'lodash.debounce';

import {
  InputSpotlight,
  OptionsGroup,
  OptionsGroupTitle,
  OptionsList,
  Option,
} from '../../components/InputSpotlight/InputSpotlight';

import {
  canInsertComponent,
  canInsertRootComponent,
} from '../../lib/components';

import {
  getGroupNameString,
  getComponentNameString,
  filterGroupsAndComponents,
} from '../../lib/library';

import {
  currentComponentsSelector,
  cursorPositionSelector,
  haveNestedConstructorsSelector,
  getLocalizedTextFromState,
} from '../../selectors';

import { libraryGroupsSortedByLanguageSelector } from '../../selectors/library';
import LibraryGroupData from '../../models/LibraryGroupData';
import { combineFiltersAll, mapListToArray, noop } from '../../utils/misc';
import { INVALID_ID } from '../../constants/misc';
import * as JssyPropTypes from '../../constants/common-prop-types';

const propTypes = {
  meta: PropTypes.object.isRequired, // state
  components: JssyPropTypes.components.isRequired, // state
  componentGroups: ImmutablePropTypes.listOf(
    PropTypes.instanceOf(LibraryGroupData),
  ).isRequired, // state
  cursorPosition: JssyPropTypes.componentsTreePosition.isRequired, // state
  haveNestedConstructors: PropTypes.bool.isRequired, // state
  language: PropTypes.string.isRequired, // state
  getLocalizedText: PropTypes.func.isRequired, // state
  onClose: PropTypes.func,
  onCreateComponent: PropTypes.func,
};

const defaultProps = {
  onClose: noop,
  onCreateComponent: noop,
};

const mapStateToProps = state => ({
  meta: state.project.meta,
  components: currentComponentsSelector(state),
  componentGroups: libraryGroupsSortedByLanguageSelector(state),
  cursorPosition: cursorPositionSelector(state),
  haveNestedConstructors: haveNestedConstructorsSelector(state),
  language: state.app.language,
  getLocalizedText: getLocalizedTextFromState(state),
});

const wrap = connect(mapStateToProps);

const SEARCH_DEBOUNCE = 200;

class CreateComponentMenuComponent extends PureComponent {
  constructor(props, context) {
    super(props, context);

    this._input = null;
    this._unmounted = false;

    this.state = {
      searchString: '',
      activeComponentName: '',
      filteredComponentGroups: null,
    };

    this._doSearch = _debounce(this._doSearch.bind(this), SEARCH_DEBOUNCE);
    this._saveInputRef = this._saveInputRef.bind(this);
    this._handleShortcuts = this._handleShortcuts.bind(this);
    this._handleInputChange = this._handleInputChange.bind(this);
    this._handleOptionActivate = this._handleOptionActivate.bind(this);
    this._handleOptionSelect = this._handleOptionSelect.bind(this);
  }

  componentDidMount() {
    if (this._input !== null) {
      this._input.focus();
    }
  }

  componentWillUnmount() {
    this._unmounted = true;
  }

  _saveInputRef(ref) {
    this._input = ref;
  }

  _doSearch() {
    const {
      meta,
      components,
      componentGroups,
      haveNestedConstructors,
      cursorPosition,
      language,
      getLocalizedText,
    } = this.props;

    const { searchString } = this.state;

    if (this._unmounted) return;

    const filterFns = [
      component => !haveNestedConstructors || component.fullName !== 'Outlet',
    ];

    if (cursorPosition.containerId === INVALID_ID) {
      filterFns.push(
        component => canInsertRootComponent(component.fullName, meta),
      );
    } else {
      filterFns.push(
        component => canInsertComponent(
          component.fullName,
          components,
          cursorPosition.containerId,
          cursorPosition.afterIdx,
          meta,
        ),
      );
    }

    if (searchString !== '') {
      filterFns.push(
        component =>
        getComponentNameString(component, language, getLocalizedText)
          .toLowerCase()
          .indexOf(searchString.toLowerCase()) !== -1,
      );
    }

    const nextFilteredComponentGroups = filterGroupsAndComponents(
      componentGroups,
      combineFiltersAll(filterFns),
    );

    const nextActiveComponentName = nextFilteredComponentGroups.size > 0
      ? nextFilteredComponentGroups.first().components.first().fullName
      : '';

    this.setState({
      filteredComponentGroups: nextFilteredComponentGroups,
      activeComponentName: nextActiveComponentName,
    });
  }

  _handleShortcuts(action) {
    switch (action) {
      case 'CREATE': {
        const { onCreateComponent } = this.props;
        const { activeComponentName } = this.state;

        if (activeComponentName !== '') {
          onCreateComponent({ componentName: activeComponentName });
        }

        break;
      }

      case 'CLOSE': this.props.onClose(); break;
      case 'SELECT_NEXT': this._handleSelectNext(); break;
      case 'SELECT_PREVIOUS': this._handleSelectPrevious(); break;
      default:
    }
  }

  _handleSelectNext() {
    const {
      searchString,
      activeComponentName,
      filteredComponentGroups,
    } = this.state;

    if (
      searchString === '' ||
      filteredComponentGroups === null ||
      filteredComponentGroups.size === 0
    ) {
      return;
    }

    let nextActiveComponentName = '';

    /* eslint-disable consistent-return */
    filteredComponentGroups.forEach((group, groupIdx) => {
      group.components.forEach((component, idx) => {
        if (component.fullName === activeComponentName) {
          if (idx < group.components.size - 1) {
            nextActiveComponentName = group.components.get(idx + 1).fullName;
          } else if (groupIdx < filteredComponentGroups.size - 1) {
            const nextGroup = filteredComponentGroups.get(groupIdx + 1);
            nextActiveComponentName = nextGroup.components.first().fullName;
          } else {
            nextActiveComponentName = activeComponentName;
          }

          return false;
        }
      });

      if (nextActiveComponentName !== '') return false;
    });
    /* eslint-enable consistent-return */

    if (nextActiveComponentName === '') {
      nextActiveComponentName =
        filteredComponentGroups.first().components.first().fullName;
    }

    this.setState({
      activeComponentName: nextActiveComponentName,
    });
  }

  _handleSelectPrevious() {
    const {
      searchString,
      activeComponentName,
      filteredComponentGroups,
    } = this.state;
  
    if (
      searchString === '' ||
      filteredComponentGroups === null ||
      filteredComponentGroups.size === 0
    ) {
      return;
    }

    let nextActiveComponentName = '';

    /* eslint-disable consistent-return */
    filteredComponentGroups.forEach((group, groupIdx) => {
      group.components.forEach((component, idx) => {
        if (component.fullName === activeComponentName) {
          if (idx > 0) {
            nextActiveComponentName = group.components.get(idx - 1).fullName;
          } else if (groupIdx > 0) {
            const prevGroup = filteredComponentGroups.get(groupIdx - 1);
            nextActiveComponentName = prevGroup.components.last().fullName;
          } else {
            nextActiveComponentName = activeComponentName;
          }

          return false;
        }
      });

      if (nextActiveComponentName !== '') return false;
    });
    /* eslint-enable consistent-return */

    if (nextActiveComponentName === '') {
      nextActiveComponentName =
        filteredComponentGroups.first().components.first().fullName;
    }

    this.setState({
      activeComponentName: nextActiveComponentName,
    });
  }

  _handleInputChange({ value }) {
    this.setState({
      searchString: value,
    });

    if (value !== '') {
      this._doSearch();
    }
  }

  _handleOptionActivate({ id: componentName }) {
    this.setState({
      activeComponentName: componentName,
    });
  }

  _handleOptionSelect({ id: componentName }) {
    const { onCreateComponent } = this.props;
    onCreateComponent({ componentName });
  }

  _renderMenu() {
    const { language, getLocalizedText } = this.props;

    const {
      searchString,
      activeComponentName,
      filteredComponentGroups,
    } = this.state;

    if (searchString === '' || filteredComponentGroups === null) {
      return null;
    }

    return mapListToArray(filteredComponentGroups, group => {
      const groupName = getGroupNameString(group, language, getLocalizedText);

      const items = mapListToArray(group.components, component => {
        const componentName = getComponentNameString(
          component,
          language,
          getLocalizedText,
        );

        const active = component.fullName === activeComponentName;

        return (
          <Option
            key={component.fullName}
            id={component.fullName}
            active={active}
            onHover={this._handleOptionActivate}
            onSelect={this._handleOptionSelect}
          >
            {componentName}
          </Option>
        );
      });

      return (
        <OptionsGroup key={group.name}>
          <OptionsGroupTitle>{groupName}</OptionsGroupTitle>
          <OptionsList>
            {items}
          </OptionsList>
        </OptionsGroup>
      );
    });
  }

  render() {
    const { getLocalizedText } = this.props;
    const { searchString } = this.state;

    const placeholder =
      getLocalizedText('design.createComponentMenu.inputPlaceholder');

    const menu = this._renderMenu();

    return (
      // eslint-disable-next-line react/jsx-handler-names
      <Shortcuts name="CREATE_COMPONENT_MENU" handler={this._handleShortcuts}>
        <InputSpotlight
          inputRef={this._saveInputRef}
          placeholder={placeholder}
          value={searchString}
          onChange={this._handleInputChange}
        >
          {menu}
        </InputSpotlight>
      </Shortcuts>
    );
  }
}

CreateComponentMenuComponent.propTypes = propTypes;
CreateComponentMenuComponent.defaultProps = defaultProps;
CreateComponentMenuComponent.displayName = 'CreateComponentMenu';

export const CreateComponentMenu = wrap(CreateComponentMenuComponent);
