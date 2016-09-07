'use strict';

const path = require('path'),
    HtmlWebpackPlugin = require('html-webpack-plugin');


const APP_SRC_DIR = '../app';
const APP_DIST_DIR = '../public';


module.exports = {
    context: path.join(__dirname, APP_SRC_DIR),

    entry: {
        index: './index'
    },

    output: {
        path: path.join(__dirname, APP_DIST_DIR),
        filename: '[name].js',
        library: '[name]'
    },

    resolve: {
        modulesDirectories: ['node_modules'],
        extensions: ['', '.js', '.jsx']
    },

    plugins: [
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
	            exclude: path => {
		            if (/reactackle\/node_modules/.test(path)) return true;
		            if (/reactackle/.test(path)) return false;
		            return /node_modules/.test(path);
	            },
                loader: 'babel?presets[]=es2015&presets[]=react'
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
