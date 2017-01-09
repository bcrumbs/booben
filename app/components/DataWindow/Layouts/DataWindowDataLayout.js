'use strict';

import React, { PureComponent, PropTypes } from 'react';

import {
    Dialog,
} from '@reactackle/reactackle';

import {
    BlockContent,
    BlockContentBox,
    BlockContentNavigation,
    BlockBreadcrumbs,
} from '../../BlockContent/BlockContent';

import {
    DataWindowContent,
} from '../DataWindowContent/DataWindowContent';

import {
    getString,
    getComponentMeta,
    getNestedTypedef,
    getPropTypedef,
} from '../../../utils/meta';

export class DataWindowDataLayout extends PureComponent {
  get CONTENT_TYPE() {
    return ({
      content: {
        list: [
          {
            title: this.props.getLocalizedText('query'),
            actionType: 'jump',
            connection: true,
            onSelect: () => this.props.setSelectedPath('Query'),
          },
          {
            title: this.props.getLocalizedText('functions'),
            actionType: 'jump',
            connection: true,
          },
          {
            title: this.props.getLocalizedText('state'),
            actionType: 'jump',
            connection: true,
          },
        ].concat(
            this.props.rootComponentWithQueryArgs
            ? [
              {
                title: this.props.getLocalizedText('ownerComponent'),
                actionType: 'jump',
                connection: true,
                onSelect: () => this.props.setSelectedPath('OwnerComponent'),
              },
                
              ...this.props.contexts.map(({
                context,
                contextFieldType,
                contextQueryPath,
              }) => ({
                title: this.props.getLocalizedText(
                  'dataWindowContextField',
                  {
                    fieldName: contextFieldType.name,
                    fieldPath: contextQueryPath.join('->'),
                  },
                ),
                actionType: 'jump',
                connection: true,
                onSelect: () => this.props.setSelectedPath(
                  'Context', {
                    contextFieldType,
                    context,
                  },
                ),
              })),
            ]
            : [],
        ),
      },
    });
  }

  render() {
    const { CONTENT_TYPE } = this;

    const linkTargetComponent =
            this.props.components.get(this.props.linkingPropOfComponentId);

    const linkTargetComponentMeta = getComponentMeta(
            linkTargetComponent.name,
            this.props.meta,
        );

    const linkTargetPropTypedef = getNestedTypedef(
            getPropTypedef(
                linkTargetComponentMeta,
                this.props.linkingPropName,
            ),
            this.props.linkingPropPath,
        );

    const propName =
            getString(
                linkTargetComponentMeta,
                linkTargetPropTypedef.textKey,
                this.props.language,
            ) || this.props.linkingPropName;

    return (
      <div className="data-window">
        <Dialog
          backdrop
          visible={this.props.linkingProp}
          onClose={this.props.onLinkPropCancel}
          haveCloseButton
          closeOnEscape
          closeOnBackdropClick
          scrollable
          buttonsLeft={CONTENT_TYPE.buttonsLeft}
          buttons={CONTENT_TYPE.buttons}
          paddingSize="none"
          title={
            this.props.getLocalizedText(
              'dataWindowTitle',
              { propName },
            )
          }
          dialogContentFlex
        >
          <div className="data-window_content">
            <BlockContent>
              <BlockContentNavigation isBordered>
                {
                    !!CONTENT_TYPE.breadcrumbs
                    &&
                    <BlockBreadcrumbs
                      items={CONTENT_TYPE.breadcrumbs}
                      mode="dark"
                      onItemClick={
                                CONTENT_TYPE.onBreadcrumbsClick
                            }
                      overflow
                    />
                }
              </BlockContentNavigation>

              <BlockContentBox isBordered>
                <DataWindowContent
                  title={CONTENT_TYPE.content.title}
                  type={CONTENT_TYPE.content.type}
                  subtitle={CONTENT_TYPE.content.subtitle}
                  description={CONTENT_TYPE.content.description}
                  contentHeading={CONTENT_TYPE.content.contentHeading}
                  argsButton={CONTENT_TYPE.content.argsButton}
                  argsButtonText={CONTENT_TYPE.content.argsButtonText}
                  onSetArgumentsClick={
                      CONTENT_TYPE.content.onSetArgumentsClick
                  }
                  list={CONTENT_TYPE.content.list}
                  children={CONTENT_TYPE.content.children}
                />
              </BlockContentBox>
            </BlockContent>
          </div>
        </Dialog>
      </div>
    );
  }
}

/* eslint-disable */
DataWindowDataLayout.propTypes = {
  contexts: PropTypes.array,
  components: PropTypes.any,
  schema: PropTypes.object,
  meta: PropTypes.object,
  linkingProp: PropTypes.bool,
  linkingPropOfComponentId: PropTypes.number,
  linkingPropName: PropTypes.string,
  linkingPropPath: PropTypes.array,
  language: PropTypes.string,
  currentComponentWithQueryArgs: PropTypes.any,
  rootComponentWithQueryArgs: PropTypes.any,
  topNestedConstructor: PropTypes.any,
  topNestedConstructorComponent: PropTypes.any,
  getLocalizedText: PropTypes.func,

  onLinkPropCancel: PropTypes.func,
  onUpdateComponentPropValue: PropTypes.func,
  onLinkWithOwnerProp: PropTypes.func,

  backToMainLayout: PropTypes.func,
  setSelectedPath: PropTypes.func,
};

DataWindowDataLayout.displayName = 'DataWindowDataLayout';
