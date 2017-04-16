'use strict';

/* eslint-disable import/no-extraneous-dependencies */

const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const sharedConstants = require('../shared/constants');

const prod = process.argv.includes('-p');

const DIST_DIR = '../public';

class RewriteThemePathResolverPlugin {
  apply(resolver) {
    resolver.plugin('before-resolve', (request, callback) => {
      if (!request.request) return callback();

      const isReactackleThemeFile =
        /@reactackle[/\\]reactackle/.test(request.path) &&
        request.request === '../_theme.scss';

      if (isReactackleThemeFile) {
        request.request = path.resolve(
          __dirname,
          '..',
          'app',
          '_reactackle_theme.scss'
        );

        return callback();
      }

      return callback();
    });
  }
}

class RewriteThemePathPlugin {
  apply(compiler) {
    compiler.plugin('after-resolvers', compiler => {
      compiler.resolvers.normal.apply(new RewriteThemePathResolverPlugin());
    });
  }
}

module.exports = {
  context: path.resolve(path.join(__dirname, '..')),

  entry: {
    index: './app/index',
    preview: './preview/index',
  },

  output: {
    path: path.resolve(path.join(__dirname, DIST_DIR)),
    filename: '[name].js',
  },

  resolve: {
    modules: ['node_modules'],
    extensions: ['.js', '.jsx'],
  },

  resolveLoader: {
    modules: ['node_modules'],
    extensions: ['.js'],
  },

  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: path => {
          if (/reactackle[/\\]node_modules/.test(path)) return true;
          if (/reactackle/.test(path)) return false;
          return /node_modules/.test(path);
        },
        loader: 'babel-loader',
      },
      {
        test: /\.scss$/,
        use: [
          'style-loader',
          'css-loader',
          'sass-loader',
        ],
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
        ],
      },
      {
        test: /\.(jpe?g|png|gif)$/i,
        use: [
          {
            loader: 'file-loader',
            options: {
              hash: 'sha512',
              digest: 'hex',
              name: '[hash].[ext]',
            },
          },
          {
            loader: 'image-webpack-loader',
            options: {
              bypassOnDebug: true,
              optimizationLevel: '7',
              interlaced: 'false',
            },
          },
        ],
      },
      {
        test: /\.woff2?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: 'url-loader',
        options: {
          limit: '10000',
          mimetype: 'application/font-woff',
        },
      },
      {
        test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: 'file-loader',
      },
    ],
  },

  plugins: [
    new RewriteThemePathPlugin(),

    new webpack.optimize.CommonsChunkPlugin({
      name: 'common',
      filename: '[name].js',
      minChunks: 2,
    }),

    new HtmlWebpackPlugin({
      title: 'JSSY',
      template: './app/index.ejs',
      filename: 'index.html',
      chunks: ['common', 'index'],
      inject: 'body',
      favicon: path.resolve(__dirname, '..', 'app', 'favicon.png'),
      hash: true,
    }),

    new HtmlWebpackPlugin({
      template: './preview/index.ejs',
      filename: 'preview.html',
      chunks: ['common', 'preview'],
      inject: 'body',
      favicon: path.resolve(__dirname, '..', 'app', 'favicon.png'),
      hash: true,

      // Our custom variables
      jssyContainerId: sharedConstants.PREVIEW_DOM_CONTAINER_ID,
      jssyOverlayId: sharedConstants.PREVIEW_DOM_OVERLAY_ID,
    }),

    new ScriptExtHtmlWebpackPlugin({
      defaultAttribute: 'defer',
    }),

    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: prod ? '"production"' : '"development"',
      },
    }),

    new CopyWebpackPlugin([
      { from: 'app/localization', to: 'localization' },
    ]),
  ],
};
