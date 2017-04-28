/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React from 'react';
import PropTypes from 'prop-types';
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
import ProjectRecord from '../models/Project';

import {
  toggleContentPlaceholders,
  toggleComponentTitles,
} from '../actions/app';

import { getLocalizedTextFromState } from '../selectors';

const propTypes = {
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

const defaultProps = {
};

const mapStateToProps = state => ({
  projectName: state.project.projectName,
  project: state.project.data,
  showFooterToggles: state.app.showFooterToggles,
  showContentPlaceholders: state.app.showContentPlaceholders,
  showComponentTitles: state.app.showComponentTitles,
  getLocalizedText: getLocalizedTextFromState(state),
});

const mapDispatchToProps = dispatch => ({
  onToggleContentPlaceholders: ({ value }) =>
    void dispatch(toggleContentPlaceholders(value)),

  onToggleComponentTitles: ({ value }) =>
    void dispatch(toggleComponentTitles(value)),
});

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
  const document = window.document;

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

const AppRoute = props => {
  const {
    projectName,
    project,
    location,
    showFooterToggles,
    showComponentTitles,
    showContentPlaceholders,
    getLocalizedText,
    onToggleComponentTitles,
    onToggleContentPlaceholders,
    children,
  } = props;

  const routeMenuItems = [];
  const currentPath = location.pathname;

  project.routes.forEach(route => {
    const href = `/${projectName}/design/${route.id}`;

    routeMenuItems.push(
      <HeaderMenuItem
        key={String(route.id)}
        text={route.fullPath}
        linkHref={href}
        linkComponent={TopMenuLink}
        isActive={href === currentPath}
      />,
    );

    if (route.haveIndex) {
      const indexHref = `/${projectName}/design/${route.id}/index`;

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

  const title = getLocalizedText('appHeader.projectTitle', {
    projectName,
  });
  
  let showComponentsTitleItem = null,
    showPlaceholdersItem = null;
  
  if (showFooterToggles) {
    const titlesToggle = (
      <ToggleButton
        checked={showComponentTitles}
        onChange={onToggleComponentTitles}
      />
    );

    showComponentsTitleItem = (
      <FooterMenuItem
        text={getLocalizedText('appFooter.showComponentsTitle')}
        subcomponentRight={titlesToggle}
      />
    );

    const placeholdersToggle = (
      <ToggleButton
        checked={showContentPlaceholders}
        onChange={onToggleContentPlaceholders}
      />
    );
    
    showPlaceholdersItem = (
      <FooterMenuItem
        text={getLocalizedText('appFooter.showPlaceholders')}
        subcomponentRight={placeholdersToggle}
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
                    text={getLocalizedText('appHeader.menu.structure')}
                    linkHref={`/${projectName}/structure`}
                    linkComponent={TopMenuLink}
                  />

                  <HeaderMenuItem
                    text={getLocalizedText('appHeader.menu.design')}
                  >
                    <HeaderMenuGroup mode="dark">
                      <HeaderMenuList>
                        {routeMenuItems}
                      </HeaderMenuList>
                    </HeaderMenuGroup>
                  </HeaderMenuItem>

                  <HeaderMenuItem
                    text={getLocalizedText('appHeader.menu.data')}
                  />

                  <HeaderMenuItem
                    text={getLocalizedText('appHeader.menu.settings')}
                  />
                </HeaderMenuList>
              </HeaderMenuGroup>
            </HeaderMenu>
          </HeaderRegion>

          <HeaderRegion size="blank">
            <HeaderMenu inline dense mode="light">
              <HeaderMenuGroup>
                <HeaderMenuList>
                  <HeaderMenuItem
                    text={getLocalizedText('appHeader.menu.preview')}
                    linkHref={`/${projectName}/preview`}
                    linkComponent={TopMenuLink}
                  />

                  <HeaderMenuItem
                    text={getLocalizedText('appHeader.menu.publish')}
                  />
                </HeaderMenuList>
              </HeaderMenuGroup>
            </HeaderMenu>
          </HeaderRegion>
  
          <HeaderRegion size="blank">
            <ProjectSave />
          </HeaderRegion>
        </Header>
      </TopRegion>

      {children}

      <BottomRegion>
        <Footer>
          <FooterRegion
            spread
            size="blank"
          >
            <FooterMenu inline dense mode="light">
              <FooterMenuGroup>
                <FooterMenuList>
                  <FooterMenuItem text={getLocalizedText('appFooter.faq')} />
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
                    text={getLocalizedText('appFooter.toggleFullScreen')}
                    onClick={toggleFullscreen}
                  />
                </FooterMenuList>
              </FooterMenuGroup>
            </FooterMenu>
          </FooterRegion>
        </Footer>
      </BottomRegion>
    </App>
  );
};

AppRoute.propTypes = propTypes;
AppRoute.defaultProps = defaultProps;
AppRoute.displayName = 'AppRoute';

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(AppRoute);
