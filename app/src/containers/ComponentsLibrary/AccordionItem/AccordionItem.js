import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import {
  ComponentTag,
  ComponentTagWrapper,
} from '../../../components/ComponentTag/ComponentTag';

import { getComponentNameString } from '../../../lib/library';
import { mapListToArray } from '../../../utils/misc';
import draggable from '../../../hocs/draggable';
import { connectDraggable } from '../../ComponentsDragArea/ComponentsDragArea';

const propTypes = {
  components: PropTypes.object.isRequired,
  language: PropTypes.string.isRequired,
  getLocalizedText: PropTypes.func.isRequired,
  focusedComponentName: PropTypes.string.isRequired,
  dragStartRadius: PropTypes.number.isRequired,
};

const DraggableComponentTag = connectDraggable(draggable(ComponentTag));

export class AccordionItem extends PureComponent {
  render() {
    const {
      components,
      language,
      getLocalizedText,
      focusedComponentName,
      dragStartRadius,
    } = this.props;

    const items = mapListToArray(components, component => (
      <DraggableComponentTag
        key={component.fullName}
        title={getComponentNameString(component, language, getLocalizedText)}
        image={component.iconURL}
        focused={focusedComponentName === component.fullName}
        dragTitle={component.fullName}
        dragData={{ name: component.fullName }}
        dragStartRadius={dragStartRadius}
        onDragStart={this._handleDragStart}
      />
    ));

    return (
      <ComponentTagWrapper>
        {items}
      </ComponentTagWrapper>
    );
  }
}

AccordionItem.propTypes = propTypes;
AccordionItem.displayName = 'AccordionItem';
