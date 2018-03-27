# SVG sprite html webpack loader and plugin
Webpack loader and plugin to generate a SVG sprite with \<symbol> elements and inject it in html built by html-webpack-plugin

## Advantages :
- sprite injected at compilation time instead of browser run time
- svg automaticaly optimize without other loader
- adds the ability to include svg folder 

## Why inject SVG sprite in HTML instead of using an external file ?
Each time we inject an element \<use xlink:href="file.svg#icon" /> in the DOM, a request is launch to get "file.svg". So the icon appear with a delay depending on http response time. If you have an animation when svg symbol is injected in DOM, the icon will appear in the middle of animation.

The goal of this plugin + loader is to avoid those http requests when injecting symbol reference in the DOM.

## Installation
```bash
yarn add -D svg-sprite-html-webpack

# or with npm

npm install -D svg-sprite-html-webpack
```

## Compatibility
- This plugin works with Webpack v3 or Webpack v4
- This plugin works only with html-webpack-plugin (v2 or v3).

## How to use

#### Webpack configuration :
#### Warning: Since Webpack 4, SvgSpriteHtmlWebpackPlugin must be declare after HtmlWebpackPlugin
```javascript
const HtmlWebpackPlugin = require('html-webpack-plugin');
const SvgSpriteHtmlWebpackPlugin = require('svg-sprite-html-webpack');

const webpackConfig = {
  ...
  module: {
    rules: [
      ...
      {
        test: /\.svg?$/,
        exclude: /node_modules/,
        use: SvgSpriteHtmlWebpackPlugin.getLoader(),
      },
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'index.html',
    }),
    new SvgSpriteHtmlWebpackPlugin(),
    ...
  ]
}
```

#### Code in your browser app
```javascript
import checkmark from './icons/checkmark.svg';

const rendered = `
<svg>
  <use xlink:href="${checkmark}" />
</svg>`;
```

#### In JSX
```javascript
import React from 'react';
import checkmark from './icons/checkmark.svg';

const icon = (
  <svg>
    <use xlinkHref={checkmark} />
  </svg>
);
```

#### Generate plain svg spritesheet without any JS/ JSX imports
```javascript
// In webpack.config file
  ...
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'index.html',
    }),
    new SvgSpriteHtmlWebpackPlugin({
      includeFiles: [
        'path/to/file1.svg', // include as many files as you want
      ]
    })
    ...
```

In html you can declare it anywhere as so:
```html
  <svg>
    <use xlinkHref='#0' />
  </svg>
```


> Note: By default the plugin generates numeric IDs for the SVG sprites. This may be quite hard to use in the real world, so it's better to use generateSymbolId() function to rewrite the svg id.


## SvgSpriteHtmlWebpackPlugin options

### (optional) includeFiles: ['file.svg']
Property that expects an array object of strings that reflect the path to the svgs, which will be appened in the stylesheet.
Usefull when you do not directly want to include svgs in JS but want to use them in your markup

### (optional) generateSymbolId(svgFilePath: string, svgHash: number, svgContent: string): string
function which generate the symbol id of each svg imported.

example
```javascript
const HtmlWebpackPlugin = require('html-webpack-plugin');
const SvgSpriteHtmlWebpackPlugin = require('svg-sprite-html-webpack');

const webpackConfig = {
  ...
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'index.html',
    }),
    new SvgSpriteHtmlWebpackPlugin({
      includeFiles: [
        'path/to/file1.svg',
        'path/to/file2.svg',
        'path/to/file3.svg',
      ],
    }),
    ...
  ]
}
```

example :
```javascript
const HtmlWebpackPlugin = require('html-webpack-plugin');
const SvgSpriteHtmlWebpackPlugin = require('svg-sprite-html-webpack');

const webpackConfig = {
  ...
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'index.html',
    }),
    new SvgSpriteHtmlWebpackPlugin({
      generateSymbolId: function(svgFilePath, svgHash, svgContent) {
        return svgHash.toString();
      },
    }),
    ...
  ]
}
```
