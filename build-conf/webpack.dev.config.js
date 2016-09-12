'use strict';

const webpack = require('webpack'),
    path = require('path'),
    HtmlWebpackPlugin = require('html-webpack-plugin');


const APP_SRC_DIR = '../app';
const REACTACKLE_THEME_FILE = '../app/_reactackle_theme.scss';


const rewriteThemePathResolverPlugin = {
    apply(resolver) {
        resolver.plugin("resolve", (context, request) => {
            const isReactackleThemeFile =
                /@reactackle\/reactackle/.test(context) &&
                request.path === '../_theme.scss';

            if (isReactackleThemeFile)
                request.path = path.resolve(__dirname, REACTACKLE_THEME_FILE);
        });
    }
};

module.exports = {
    context: path.resolve(path.join(__dirname, APP_SRC_DIR)),

    entry: [
        'webpack-hot-middleware/client?reload=true',
        './index'
    ],

    output: {
        path: '/',
        filename: '[name].js',
        library: '[name]'
    },

    resolve: {
        modulesDirectories: ['node_modules'],
        extensions: ['', '.js', '.jsx']
    },

    plugins: [
        {
            apply(compiler) {
                compiler.resolvers.normal.apply(rewriteThemePathResolverPlugin)
            }
        },

        new webpack.optimize.OccurenceOrderPlugin(),
        new webpack.HotModuleReplacementPlugin(),

        new HtmlWebpackPlugin({
            title: 'JSSY',
            template: 'index.ejs',
            inject: 'body',
            hash: true
        })
    ],

    resolveLoader: {
        modulesDirectories: ['node_modules'],
        moduleTemplates: ['*-loader'],
        extensions: ['', '.js']
    },

    module: {
        loaders: [
            {
                test: /\.jsx?$/,
	            include: path => {
		            if (/reactackle\/node_modules/.test(path)) return false;
		            return /reactackle/.test(path);
	            },
                loaders: [
                    'babel?presets[]=es2015&presets[]=react'
                ]
            },
            {
                test: /\.jsx?$/,
                exclude: path => /node_modules/.test(path),
                loaders: [
                    'react-hot',
                    'babel?presets[]=es2015&presets[]=react'
                ]
            },
            {
                test: /\.scss$/,
                loaders: [
                    'style',
                    'css',
                    'sass'
                ]
            },
            {
                test: /\.(jpe?g|png|gif|svg)$/i,
                loaders: [
                    'file?hash=sha512&digest=hex&name=[hash].[ext]',
                    'image-webpack?bypassOnDebug&optimizationLevel=7&interlaced=false'
                ]
            },
            {
                test: /\.woff2?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                loader: 'url?limit=10000&mimetype=application/font-woff'
            },
            {
                test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                loader: 'file'
            }
        ]
    }
};
