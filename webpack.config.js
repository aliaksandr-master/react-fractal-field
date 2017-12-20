'use strict';

const path = require('path');
const webpack = require('webpack');


const DIR_SRC = 'lib';
const NODE_ENV = process.env.NODE_ENV || 'development'; // eslint-disable-line


const config = {};


config.output = {
  path: path.join(__dirname, '.tmp/release'),
  pathinfo: true,
  filename: '[name].js'
};


config.entry = {
  'react-fractal-field': [
    path.join(__dirname, DIR_SRC, 'index.js')
  ],
  'react-fractal-field-demo-1-old': [
    path.join(__dirname, 'example-1-old', 'index.js')
  ],
  'react-fractal-field-demo-2': [
    path.join(__dirname, 'example-2', 'index.js')
  ]
};


config.externals = {};


config.module = {};


config.module.rules = [
  {
    test: /\.(?:jsx?)(?:\?.*)?$/i,
    use: {
      loader: 'babel-loader'
    }
  }
];


config.plugins = [];


config.plugins.push(new webpack.LoaderOptionsPlugin({
  debug: true
}));


config.plugins.push(new webpack.DefinePlugin({
  'process.env.NODE_ENV': JSON.stringify(NODE_ENV)
}));


config.resolve = {
  root: DIR_SRC,
  extensions: [ '', '.js' ],
  alias: {}
};


config.resolve = {
  modules: [
    path.join(__dirname, 'lib'),
    'node_modules'
  ],
  extensions: [ '.js' ]
};


config.devtool = 'source-map';
config.bail = true;
config.cache = false;
config.watch = false;
config.context = __dirname;
config.node = {
  __filename: true
};


module.exports = config;
