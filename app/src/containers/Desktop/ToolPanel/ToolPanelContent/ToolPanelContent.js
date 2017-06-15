/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { List } from 'immutable';
import { Button, Tabs } from '@reactackle/reactackle';

import {
  PageDrawerContentArea,
} from '../../../../components/PageDrawer/PageDrawer';

import {
  BlockContent,
  BlockContentTitle,
  BlockContentActions,
  BlockContentActionsRegion,
  BlockContentNavigation,
} from '../../../../components/BlockContent/BlockContent';

import ButtonType from '../../../../models/Button';
import ToolType from '../../../../models/Tool';
import ToolStateType from '../../../../models/ToolState';
import { noop } from '../../../../utils/misc';

//noinspection JSUnresolvedVariable
const propTypes = {
  tool: PropTypes.instanceOf(ToolType).isRequired,
  toolState: PropTypes.instanceOf(ToolStateType).isRequired,
  shadowed: PropTypes.bool,
  onTitleChange: PropTypes.func,
  onUndock: PropTypes.func,
  onCollapse: PropTypes.func,
  onActiveSectionChange: PropTypes.func,
};

const defaultProps = {
  shadowed: false,
  onTitleChange: noop,
  onUndock: noop,
  onCollapse: noop,
  onActiveSectionChange: noop,
};

export class ToolPanelContent extends PureComponent {
  constructor(props, context) {
    super(props, context);
    this._handleTabChange = this._handleTabChange.bind(this);
  }
  
  _handleTabChange({ value }) {
    const { onActiveSectionChange } = this.props;
    onActiveSectionChange({ newActiveSection: value });
  }
  
  render() {
    const {
      tool,
      toolState,
      shadowed,
      onCollapse,
      onUndock,
      onTitleChange,
    } = this.props;
    
    const collapseButton = new ButtonType({
      icon: 'chevron-right',
      onPress: onCollapse,
    });
  
    let titleButtons = List([collapseButton]);
  
    if (tool.undockable) {
      const undockButton = new ButtonType({
        icon: 'arrows-alt',
        onPress: onUndock,
      });
    
      titleButtons = titleButtons.unshift(undockButton);
    }
  
    const sections = tool.sections;
    const sectionsNum = sections.size;
    let navArea = null;
  
    if (sectionsNum > 1) {
      const tabs = Array.from(
        sections.map(section => ({ text: section.name })),
      );
    
      navArea = (
        <BlockContentNavigation>
          <Tabs
            tabs={tabs}
            colorScheme="dark"
            selected={toolState.activeSection}
            onChange={this._handleTabChange}
          />
        </BlockContentNavigation>
      );
    }
  
    const activeSection = sections.get(toolState.activeSection) || null;
    const ContentComponent = activeSection !== null
      ? activeSection.component
      : null;
  
    const content = ContentComponent
      ? <ContentComponent {...activeSection.componentProps} />
      : null;
  
    let actionsArea = null;
    const mainButtons = tool.mainButtons;
    const secondaryButtons = tool.secondaryButtons;
    const mainButtonsNum = mainButtons.size;
    const secondaryButtonsNum = secondaryButtons.size;
  
    if (mainButtonsNum > 0 || secondaryButtonsNum > 0) {
      let mainActionsRegion = null;
      if (mainButtonsNum > 0) {
        const buttons = mainButtons.map(({ icon, text, onPress }, idx) => (
          <Button
            key={String(idx)}
            icon={{ name: icon }}
            text={text}
            onPress={onPress}
          />
        ));
      
        mainActionsRegion = (
          <BlockContentActionsRegion type="main">
            {buttons}
          </BlockContentActionsRegion>
        );
      }
    
      let secondaryButtonsRegion = null;
      if (secondaryButtonsNum > 0) {
        const buttons = secondaryButtons.map(({ icon, text, onPress }, idx) => (
          <Button
            key={String(idx)}
            icon={{ name: icon }}
            text={text}
            onPress={onPress}
          />
        ));
      
        secondaryButtonsRegion = (
          <BlockContentActionsRegion type="secondary">
            {buttons}
          </BlockContentActionsRegion>
        );
      }
    
      actionsArea = (
        <BlockContentActions>
          {secondaryButtonsRegion}
          {mainActionsRegion}
        </BlockContentActions>
      );
    }
  
    return (
      <PageDrawerContentArea hidden={shadowed}>
        <BlockContent>
          <BlockContentTitle
            title={tool.title}
            isEditable={tool.titleEditable}
            titlePlaceHolder={tool.titlePlaceholder}
            buttons={titleButtons}
            onTitleChange={onTitleChange}
          />
        
          {navArea}
          {content}
          {actionsArea}
        </BlockContent>
      </PageDrawerContentArea>
    );
  }
}

ToolPanelContent.propTypes = propTypes;
ToolPanelContent.defaultProps = defaultProps;
ToolPanelContent.displayName = 'ToolPanelContent';
