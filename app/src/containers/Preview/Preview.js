/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Router, Switch, Route, Redirect } from 'react-router';
import createHistory from 'history/es/createHashHistory';
import { PreviewBuilder } from '../builders/PreviewBuilder/PreviewBuilder';
import Project from '../../models/Project';

const propTypes = {
  project: PropTypes.instanceOf(Project).isRequired,
  meta: PropTypes.object.isRequired,
  schema: PropTypes.object,
};

const defaultProps = {
  schema: null,
};

export class Preview extends Component {
  constructor(props, context) {
    super(props, context);

    this._history = createHistory();

    this._handleNavigate = this._handleNavigate.bind(this);
    this._handleOpenURL = this._handleOpenURL.bind(this);
  }

  shouldComponentUpdate() {
    return false;
  }

  /**
   *
   * @return {boolean}
   * @private
   */
  _isUserAuthenticated() {
    const { project } = this.props;

    if (!project.auth) return true;

    switch (project.auth.type) {
      case 'jwt': {
        return !!window.localStorage.getItem('jssy_auth_token');
      }

      default: {
        return false;
      }
    }
  }

  /**
   *
   * @param {Object} route - ProjectRoute record
   * @param {boolean} isIndex
   * @param {?ReactElement} [indexRoute = null]
   * @return {Function}
   * @private
   */
  _makeBuilderForRoute(route, isIndex, indexRoute = null) {
    const { project, meta, schema } = this.props;
    
    const rootId = isIndex ? route.indexComponent : route.component;

    const childSwitch = !isIndex
      ? this._renderSwitch(route.children, indexRoute ? [indexRoute] : [])
      : null;

    const ret = ({ match }) => (
      <PreviewBuilder
        project={project}
        meta={meta}
        schema={schema}
        components={route.components}
        rootId={rootId}
        routeParams={match.params}
        onNavigate={this._handleNavigate}
        onOpenURL={this._handleOpenURL}
      >
        {childSwitch}
      </PreviewBuilder>
    );

    ret.displayName = `Builder(route-${route.id}${isIndex ? '-index' : ''})`;
    return ret;
  }

  /**
   *
   * @param {number} routeId
   * @param {Object<string, *>} routeParams
   * @private
   */
  _handleNavigate({ routeId, routeParams }) {
    const { project } = this.props;

    const route = project.routes.get(routeId);
    if (!route) return;

    const path = route.fullPath
      .split('/')
      .map(
        part => part.startsWith(':')
          ? String(routeParams[part.slice(1)])
          : part,
      )
      .join('/');

    this._history.push(path);
  }

  /**
   *
   * @param {string} url
   * @param {boolean} newWindow
   * @private
   */
  _handleOpenURL({ url, newWindow }) {
    const anchor = window.document.createElement('a');

    anchor.setAttribute('href', url);
    if (newWindow) anchor.setAttribute('target', '_blank');
    window.document.body.appendChild(anchor);
    anchor.click();
    window.document.body.removeChild(anchor);
  }

  /**
   *
   * @param {Immutable.List<number>} routeIds
   * @param {?(ReactElement[])} [additionalRoutes=null]
   * @return {?ReactElement}
   * @private
   */
  _renderSwitch(routeIds, additionalRoutes = null) {
    const { project } = this.props;
    const routes = additionalRoutes || [];

    routeIds.forEach(routeId => {
      const route = project.routes.get(routeId);
      let indexRoute = null;

      if (route.haveIndex) {
        const IndexRouteBuilder =
          this._makeBuilderForRoute(route, true);

        indexRoute = (
          <Route
            key={`${routeId}-index`}
            path={route.fullPath}
            exact
            component={IndexRouteBuilder}
          />
        );
      }

      if (route.redirect) {
        routes.push(
          <Route
            key={`${routeId}-index-redirect`}
            path={route.fullPath}
            exact
            render={() => (
              <Redirect to={route.redirectTo} />
            )}
          />,
        );
      }

      const RouteBuilder =
        this._makeBuilderForRoute(route, false, indexRoute);

      if (!route.redirectAuthenticated && !route.redirectAnonymous) {
        routes.push(
          <Route
            key={String(routeId)}
            path={route.fullPath}
            component={RouteBuilder}
          />,
        );
      } else {
        const render = props => {
          let willRedirect = false;
          let redirectTo = '';

          if (this._isUserAuthenticated()) {
            if (route.redirectAuthenticated) {
              willRedirect = true;
              redirectTo = route.redirectAuthenticatedTo;
            }
          } else if (route.redirectAnonymous) {
            willRedirect = true;
            redirectTo = route.redirectAnonymousTo;
          }

          if (willRedirect) {
            return (
              <Redirect to={redirectTo} />
            );
          } else {
            return (
              <RouteBuilder {...props} />
            );
          }
        };

        routes.push(
          <Route
            key={String(routeId)}
            path={route.fullPath}
            render={render}
          />,
        );
      }
    });

    if (routes.length > 0) {
      return (
        <Switch>
          {routes}
        </Switch>
      );
    } else {
      return null;
    }
  }

  render() {
    const { project } = this.props;

    const rootSwitch = this._renderSwitch(project.rootRoutes);

    return (
      <Router history={this._history}>
        {rootSwitch}
      </Router>
    );
  }
}

Preview.propTypes = propTypes;
Preview.defaultProps = defaultProps;
Preview.displayName = 'Preview';
