/**
 * @author Dmitriy Bizyaev
 */

'use strict';

//noinspection JSUnresolvedVariable
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';

import {
  App,
  TopRegion,
  BottomRegion,
  Header,
  HeaderRegion,
  HeaderLogoBox,
  HeaderMenu,
  HeaderMenuGroup,
  HeaderMenuList,
  HeaderMenuItem,
  Footer,
  FooterRegion,
  FooterMenu,
  FooterMenuGroup,
  FooterMenuList,
  FooterMenuItem,
  ToggleButton,
} from '@reactackle/reactackle';

import { ProjectSave } from '../components/ProjectSave/ProjectSave';

import {
  ComponentsDragArea,
} from '../containers/ComponentsDragArea/ComponentsDragArea';

import ProjectRecord from '../models/Project';

import {
  toggleContentPlaceholders,
  toggleComponentTitles,
} from '../actions/app';

import { getLocalizedTextFromState } from '../utils';

const TopMenuLink = ({ href, className, children }) => (
  <Link to={href} className={className}>
    {children}
  </Link>
);

TopMenuLink.propTypes = {
  href: PropTypes.string,
  className: PropTypes.string,
};

TopMenuLink.defaultProps = {
  href: '',
  className: '',
};

TopMenuLink.displayName = 'TopMenuLink';

const toggleFullscreen = () => {
  if (
    !document.fullscreenElement &&
    !document.mozFullScreenElement &&
    !document.webkitFullscreenElement
  ) {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    } else if (document.documentElement.mozRequestFullScreen) {
      document.documentElement.mozRequestFullScreen();
    } else if (document.documentElement.webkitRequestFullscreen) {
      document.documentElement.webkitRequestFullscreen(
        Element.ALLOW_KEYBOARD_INPUT,
      );
    }
  } else if (document.cancelFullScreen) {
    document.cancelFullScreen();
  } else if (document.mozCancelFullScreen) {
    document.mozCancelFullScreen();
  } else if (document.webkitCancelFullScreen) {
    document.webkitCancelFullScreen();
  }
};

const RootRoute = props => {
  const { getLocalizedText } = props,
    routeMenuItems = [],
    currentPath = props.location.pathname;

  props.project.routes.forEach(route => {
    const href = `/${props.projectName}/design/${route.id}`;

    routeMenuItems.push(
      <HeaderMenuItem
        key={route.id}
        text={route.fullPath}
        linkHref={href}
        linkComponent={TopMenuLink}
        isActive={href === currentPath}
      />,
    );

    if (route.haveIndex) {
      const indexHref = `/${props.projectName}/design/${route.id}/index`;

      routeMenuItems.push(
        <HeaderMenuItem
          key={`${route.id}-index`}
          text={`${route.fullPath} - index`}
          linkHref={indexHref}
          linkComponent={TopMenuLink}
          isActive={indexHref === currentPath}
        />,
      );
    }
  });

  const title = getLocalizedText('projectTitle', {
    projectName: props.projectName,
  });
  
  let showComponentsTitleItem = null,
    showPlaceholdersItem = null;
  
  if (props.showFooterToggles) {
    showComponentsTitleItem = (
      <FooterMenuItem
        text={getLocalizedText('showComponentsTitle')}
        subcomponentRight={
          <ToggleButton
            checked={props.showComponentTitles}
            onChange={props.onToggleComponentTitles}
          />
        }
      />
    );
    
    showPlaceholdersItem = (
      <FooterMenuItem
        text={getLocalizedText('showPlaceholders')}
        subcomponentRight={
          <ToggleButton
            checked={props.showContentPlaceholders}
            onChange={props.onToggleContentPlaceholders}
          />
        }
      />
    );
  }

  return (
    <App fixed>
      <TopRegion fixed={false}>
        <Header size="blank">
          <HeaderRegion
            size="blank"
          >
            <HeaderLogoBox title={title} />
          </HeaderRegion>

          <HeaderRegion
            spread
            size="blank"
          >
            <HeaderMenu inline dense mode="light">
              <HeaderMenuGroup>
                <HeaderMenuList>
                  <HeaderMenuItem
                    text={getLocalizedText('structure')}
                    linkHref={`/${props.projectName}/structure`}
                    linkComponent={TopMenuLink}
                  />

                  <HeaderMenuItem text={getLocalizedText('design')}>
                    <HeaderMenuGroup mode="dark">
                      <HeaderMenuList>
                        {routeMenuItems}
                      </HeaderMenuList>
                    </HeaderMenuGroup>
                  </HeaderMenuItem>

                  <HeaderMenuItem text={getLocalizedText('data')} />
                  <HeaderMenuItem text={getLocalizedText('settings')} />
                </HeaderMenuList>
              </HeaderMenuGroup>
            </HeaderMenu>
          </HeaderRegion>
  
          <HeaderRegion size="blank">
            <ProjectSave />
          </HeaderRegion>

          <HeaderRegion size="blank">
            <HeaderMenu inline dense mode="light">
              <HeaderMenuGroup>
                <HeaderMenuList>
                  <HeaderMenuItem
                    text={getLocalizedText('preview')}
                    linkHref={`/${props.projectName}/preview`}
                    linkComponent={TopMenuLink}
                  />
                  <HeaderMenuItem text={getLocalizedText('publish')} />
                </HeaderMenuList>
              </HeaderMenuGroup>
            </HeaderMenu>
          </HeaderRegion>
        </Header>
      </TopRegion>

      {props.children}

      <BottomRegion>
        <Footer>
          <FooterRegion
            spread
            size="blank"
          >
            <FooterMenu inline dense mode="light">
              <FooterMenuGroup>
                <FooterMenuList>
                  <FooterMenuItem text={getLocalizedText('faq')} />
                </FooterMenuList>
              </FooterMenuGroup>
            </FooterMenu>
          </FooterRegion>

          <FooterRegion size="blank">
            <FooterMenu inline dense mode="light">
              <FooterMenuGroup>
                <FooterMenuList>
                  {showComponentsTitleItem}
                  {showPlaceholdersItem}
                  
                  <FooterMenuItem
                    text={getLocalizedText('toggleFullScreen')}
                    onClick={toggleFullscreen}
                  />
                </FooterMenuList>
              </FooterMenuGroup>
            </FooterMenu>
          </FooterRegion>
        </Footer>
      </BottomRegion>

      <ComponentsDragArea />
    </App>
  );
};

//noinspection JSUnresolvedVariable
RootRoute.propTypes = {
  location: PropTypes.object.isRequired,
  projectName: PropTypes.string.isRequired,
  project: PropTypes.instanceOf(ProjectRecord).isRequired,
  showFooterToggles: PropTypes.bool.isRequired,
  showContentPlaceholders: PropTypes.bool.isRequired,
  showComponentTitles: PropTypes.bool.isRequired,
  getLocalizedText: PropTypes.func.isRequired,
  onToggleContentPlaceholders: PropTypes.func.isRequired,
  onToggleComponentTitles: PropTypes.func.isRequired,
};

RootRoute.displayName = 'RootRoute';

const mapStateToProps = ({ project, app }) => ({
  projectName: project.projectName,
  project: project.data,
  showFooterToggles: app.showFooterToggles,
  showContentPlaceholders: app.showContentPlaceholders,
  showComponentTitles: app.showComponentTitles,
  getLocalizedText: getLocalizedTextFromState({ app }),
});

const mapDispatchToProps = dispatch => ({
  onToggleContentPlaceholders: ({ value }) =>
    void dispatch(toggleContentPlaceholders(value)),
  onToggleComponentTitles: ({ value }) =>
    void dispatch(toggleComponentTitles(value)),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(RootRoute);
