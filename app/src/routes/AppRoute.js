import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { Route, Switch, Redirect } from 'react-router';
import { Link } from 'react-router-dom';

import {
  Header,
  HeaderRegion,
  HeaderLogoBox,
  Menu,
  MenuGroup,
  MenuList,
  MenuItem,
  AlertArea,
} from '@reactackle/reactackle';

import { App, TopRegion } from 'reactackle-app';

import StructureRoute from './StructureRoute';
import DesignRoute from './DesignRoute';
import { DrawerTopDesign } from '../containers/DrawerTopDesign/DrawerTopDesign';

import {
  ProjectSaveIndicator,
} from '../containers/ProjectSaveIndicator/ProjectSaveIndicator';

import { alertAreaProvider } from '../hocs/alerts';
import ProjectRecord from '../models/Project';
import { getLocalizedTextFromState } from '../selectors';

import {
  PATH_STRUCTURE,
  PATH_DESIGN_ROUTE,
  PATH_DESIGN_ROUTE_INDEX,
  buildStructurePath,
  buildDesignRoutePath,
  buildDesignRouteIndexPath,
} from '../constants/paths';

import { URL_PREVIEW_PREFIX } from '../../../shared/constants';
import { IconPlay, IconUpload } from '../components/icons';

const propTypes = {
  location: PropTypes.object.isRequired, // router
  projectName: PropTypes.string.isRequired, // state
  project: PropTypes.instanceOf(ProjectRecord).isRequired, // state
  getLocalizedText: PropTypes.func.isRequired, // state
  onAlertAreaReady: PropTypes.func.isRequired, // alertAreaProvider
  onAlertAreaRemoved: PropTypes.func.isRequired, // alertAreaProvider
};

const mapStateToProps = state => ({
  projectName: state.project.projectName,
  project: state.project.data,
  getLocalizedText: getLocalizedTextFromState(state),
});

const wrap = compose(
  connect(mapStateToProps),
  alertAreaProvider,
);

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

const TopMenuExternalLink = ({ href, className, children }) => (
  <a
    href={href}
    className={className}
    target="_blank"
    rel="noopener noreferrer"
  >
    {children}
  </a>
);

TopMenuExternalLink.propTypes = {
  href: PropTypes.string,
  className: PropTypes.string,
};

TopMenuExternalLink.defaultProps = {
  href: '',
  className: '',
};

TopMenuExternalLink.displayName = 'TopMenuExternalLink';

class AppRoute extends Component {
  componentWillUnmount() {
    const { onAlertAreaRemoved } = this.props;
    onAlertAreaRemoved();
  }

  render() {
    const {
      projectName,
      project,
      location,
      getLocalizedText,
      onAlertAreaReady,
    } = this.props;

    let routeName = projectName;

    if (process.env.NODE_ENV === 'production') {
      routeName = project._id;
    }

    const routeMenuItems = [];
    const currentPath = location.pathname;

    project.routes.forEach(route => {
      const href = buildDesignRoutePath({
        projectName,
        routeId: route.id,
      });

      routeMenuItems.push(
        <MenuItem
          key={String(route.id)}
          text={route.fullPath}
          linkHref={href}
          linkComponent={TopMenuLink}
          isActive={href === currentPath}
        />,
      );

      if (route.haveIndex) {
        const indexHref = buildDesignRouteIndexPath({
          projectName,
          routeId: route.id,
        });

        routeMenuItems.push(
          <MenuItem
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

    return (
      <App fixed>
        <TopRegion>
          <Header size="blank">
            <HeaderRegion size="blank">
              <HeaderLogoBox title={title} />
            </HeaderRegion>

            <HeaderRegion spread size="blank">
              <Menu inline dense mode="light">
                <MenuGroup>
                  <MenuList>
                    <MenuItem
                      text={getLocalizedText('appHeader.menu.structure')}
                      linkHref={`/${routeName}/structure`}
                      linkComponent={TopMenuLink}
                    />
                  </MenuList>
                </MenuGroup>
              </Menu>
            </HeaderRegion>

            <HeaderRegion size="blank">
              <ProjectSaveIndicator />
            </HeaderRegion>

            <HeaderRegion size="blank">
              <Menu inline dense mode="light">
                <MenuGroup>
                  <MenuList>
                    <MenuItem
                      text={getLocalizedText('appHeader.menu.preview')}
                      linkHref={`${URL_PREVIEW_PREFIX}/${routeName}`}
                      linkComponent={TopMenuExternalLink}
                      iconLeft={<IconPlay border borderWidth={1} rounded />}
                    />
                  </MenuList>
                </MenuGroup>
              </Menu>
            </HeaderRegion>
          </Header>

          <Route
            path={PATH_DESIGN_ROUTE}
            render={() => (
              <DrawerTopDesign />
            )}
          />
        </TopRegion>

        <Switch>
          <Route
            exact
            path={PATH_STRUCTURE}
            component={StructureRoute}
          />

          <Route
            exact
            path={PATH_DESIGN_ROUTE}
            component={DesignRoute}
          />

          <Route
            exact
            path={PATH_DESIGN_ROUTE_INDEX}
            component={DesignRoute}
          />

          <Route
            render={({ match }) => (
              <Redirect to={buildStructurePath(match.params)} />
            )}
          />
        </Switch>

        <AlertArea ref={onAlertAreaReady} />
      </App>
    );
  }
}

AppRoute.propTypes = propTypes;
AppRoute.displayName = 'AppRoute';

export default wrap(AppRoute);
