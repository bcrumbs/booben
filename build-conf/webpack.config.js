'use strict';

const path = require('path'),
  HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const prod = process.argv.includes('-p');


const APP_SRC_DIR = '../app';
const APP_DIST_DIR = '../public';
const REACTACKLE_THEME_FILE = '../app/_reactackle_theme.scss';


const rewriteThemePathResolverPlugin = {
  apply(resolver) {
    resolver.plugin('resolve', (context, request) => {
      const isReactackleThemeFile =
                /@reactackle(\/|\\)reactackle/.test(context) &&
                request.path === '../_theme.scss';

      if (isReactackleThemeFile)
        request.path = path.resolve(__dirname, REACTACKLE_THEME_FILE);
    });
  },
};

module.exports = {
  context: path.resolve(path.join(__dirname, APP_SRC_DIR)),

  entry: {
    index: './index',
  },

  output: {
    path: path.resolve(path.join(__dirname, APP_DIST_DIR)),
    filename: '[name].js',
  },

  resolve: {
    modulesDirectories: ['node_modules'],
    extensions: ['', '.js', '.jsx'],
  },

  plugins: [
    {
      apply(compiler) {
        compiler.resolvers.normal.apply(rewriteThemePathResolverPlugin);
      },
    },

    new HtmlWebpackPlugin({
      title: 'JSSY',
      template: 'index.ejs',
      inject: 'body',
      favicon: path.resolve(__dirname, '..', 'app', 'favicon.png'),
      hash: true,
    }),

    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: prod ? '"production"' : '"development"',
      },
    }),

    new CopyWebpackPlugin([
          { from: 'localization', to: 'localization' },
    ]),
  ],

  resolveLoader: {
    modulesDirectories: ['node_modules'],
    moduleTemplates: ['*-loader'],
    extensions: ['', '.js'],
  },

  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: path => {
          if (/reactackle\/node_modules/.test(path)) return true;
          if (/reactackle/.test(path)) return false;
          return /node_modules/.test(path);
        },
        loader: 'babel?presets[]=es2015&presets[]=react',
      },
      {
        test: /\.scss$/,
        loaders: [
          'style',
          'css',
          'sass',
        ],
      },
      {
        test: /\.(jpe?g|png|gif)$/i,
        loaders: [
          'file?hash=sha512&digest=hex&name=[hash].[ext]',
          'image-webpack?bypassOnDebug&optimizationLevel=7&interlaced=false',
        ],
      },
      {
        test: /\.woff2?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: 'url?limit=10000&mimetype=application/font-woff',
      },
      {
        test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: 'file',
      },
    ],
  },
};
