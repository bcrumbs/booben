/**
 * @author Dmitriy Bizyaev
 */

'use strict';

const co = require('co'),
    path = require('path'),
    http = require('http'),
    express = require('express'),
    serveStatic = require('serve-static'),
    config = require('./config');

let httpServer;

const setupWebpackMiddleware = app => {
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

const start = () => co(function* () {
    const app = express();

    app.use('/', serveStatic(path.join(__dirname, '/public')));

    setupWebpackMiddleware(app);

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
