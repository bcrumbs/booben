/* eslint-disable import/no-extraneous-dependencies */

const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const DIST_DIR = '../../public';

class RewriteThemePathResolverPlugin {
  constructor(options) {
    this._themePath = options.themePath;
  }

  apply(resolver) {
    resolver.plugin('before-resolve', (request, callback) => {
      if (!request.request) return callback();

      const isReactackleThemeFile =
        /@reactackle[/\\]reactackle/.test(request.path) &&
        request.request === '../_theme.scss';

      if (isReactackleThemeFile) {
        request.request = this._themePath;
      }

      return callback();
    });
  }
}

class ReactackleThemePlugin {
  constructor(options) {
    this._options = options;
  }

  apply(compiler) {
    compiler.plugin('after-resolvers', compiler => {
      const resolverPlugin = new RewriteThemePathResolverPlugin(this._options);
      compiler.resolvers.normal.apply(resolverPlugin);
    });
  }
}

module.exports = {
  context: path.resolve(path.join(__dirname, '..')),

  entry: {
    index: './src/index',
    preview: './src/preview',
  },

  output: {
    path: path.resolve(path.join(__dirname, DIST_DIR)),
    filename: '[name].js',
    publicPath: '/',
  },

  resolve: {
    modules: ['node_modules'],
    extensions: ['.js', '.jsx'],
  },

  resolveLoader: {
    modules: ['node_modules'],
    extensions: ['.js'],
  },

  devtool: 'source-map',

  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: path => {
          if (/reactackle[/\\]node_modules/.test(path)) return true;
          if (/common-ui[/\\]node_modules/.test(path)) return true;
          if (/reactackle/.test(path)) return false;
          if (/common-ui/.test(path)) return false;
          return /node_modules/.test(path);
        },
        loader: 'babel-loader',
      },
      {
        test: /\.ejs$/,
        loader: 'ejs-compiled-loader',
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
              gifsicle: {
                interlaced: false,
              },
              optipng: {
                optimizationLevel: 7,
              },
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
    new ReactackleThemePlugin({
      themePath: path.resolve(__dirname, '..', 'src', '_reactackle_theme.scss'),
    }),

    new webpack.optimize.CommonsChunkPlugin({
      name: 'common',
      filename: '[name].js',
    }),

    new HtmlWebpackPlugin({
      title: 'BOOBEN',
      template: './src/index.ejs',
      filename: 'index.html',
      chunks: ['common', 'index'],
      inject: 'body',
      favicon: './assets/favicon.png',
      hash: true,
    }),

    new HtmlWebpackPlugin({
      title: 'BOOBEN',
      template: './src/preview.ejs',
      filename: 'preview.html',
      chunks: ['common', 'preview'],
      inject: 'body',
      favicon: './assets/favicon.png',
      hash: true,
    }),

    new ScriptExtHtmlWebpackPlugin({
      defaultAttribute: 'defer',
    }),

    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"demo"',
      },
    }),

    new CopyWebpackPlugin([
      { from: 'strings', to: 'strings' },
    ]),

    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
        screw_ie8: true,
        conditionals: true,
        unused: true,
        comparisons: true,
        sequences: true,
        dead_code: true,
        evaluate: true,
        if_return: true,
        join_vars: true
      },
      output: {
        comments: false
      }
    }),
    
    new webpack.HashedModuleIdsPlugin(),
  ],
};
