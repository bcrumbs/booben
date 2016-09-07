/**
 * @author Dmitriy Bizyaev
 */

'use strict';

const co = require('co'),
    path = require('path'),
    http = require('http'),
    express = require('express'),
    config = require('./config');

let httpServer;

const setupWebpackDevMiddleware = app => {
    const webpack = require('webpack'),
        webpackDevMiddleware = require('webpack-dev-middleware'),
        webpackHotMiddleware = require('webpack-hot-middleware'),
        webpackConfig = require('./webpack.dev.config');

    const compiler = webpack(webpackConfig);

    app.use(webpackDevMiddleware(compiler, {
        publicPath: '/dev/',
        stats: {
            colors: true
        }
    }));

    app.use(webpackHotMiddleware(compiler, {
        log: console.log
    }));
};

const setupEndpoint = (app, endpoint) => {
    app[endpoint.method](endpoint.url, ...endpoint.handlers);
};

const start = () => co(function* () {
    const app = express();

    setupEndpoint(app, require('./endpoints/serve-designer-app'));
    setupEndpoint(app, require('./endpoints/get-project'));
    setupEndpoint(app, require('./endpoints/create-project'));
    setupEndpoint(app, require('./endpoints/update-project'));

    if (config.get('env') === 'development') {
        setupWebpackDevMiddleware(app);
    }

    httpServer = http.createServer(app);

    const port = config.get('port');

    yield new Promise((resolve, reject) =>
        void httpServer.listen(port, err => void (err ? reject(err) : resolve())));

    console.log(`Server is listening on port ${port}`);
});


co(function* () {
    try {
        yield start();
    }
    catch (err) {
        console.error(err);
        process.exit(1);
    }
});
