/**
 * @author Dmitriy Bizyaev
 */

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Button, Tabs } from '@reactackle/reactackle';

import {
  BlockContent,
  BlockContentTitle,
  BlockContentActions,
  BlockContentActionsRegion,
  BlockContentNavigation,
} from '../../../../components/BlockContent';

import { PageDrawerContentArea } from '../../../../components/PageDrawer';
import ToolType from '../../../../models/Tool';
import ToolStateType from '../../../../models/ToolState';
import { noop } from '../../../../utils/misc';

import {
  IconArrowChevronRight,
  IconExpand,
} from '../../../../components/icons';

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

    const titleButtons = [{
      icon: <IconArrowChevronRight />,
      colorScheme: 'flatLight',
      onPress: onCollapse,
    }];

    if (tool.undockable) {
      titleButtons.unshift({
        icon: <IconExpand />,
        colorScheme: 'flatLight',
        onPress: onUndock,
      });
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
        const buttons = mainButtons.map((button, idx) => (
          <Button
            key={String(idx)}
            icon={button.icon}
            text={button.text}
            disabled={button.disabled}
            colorScheme="flatLight"
            onPress={button.onPress} // eslint-disable-line react/jsx-handler-names
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
        const buttons = secondaryButtons.map((button, idx) => (
          <Button
            key={String(idx)}
            icon={button.icon}
            text={button.text}
            disabled={button.disabled}
            colorScheme="flatLight"
            size="small"
            onPress={button.onPress} // eslint-disable-line react/jsx-handler-names
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
