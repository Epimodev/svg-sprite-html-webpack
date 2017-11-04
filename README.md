# SVG sprite html webpack loader and plugin
Webpack loader and plugin to generate a SVG sprite with \<symbol> elements and inject it in html built by html-webpack-plugin

## Advantages :
- sprite injected at compilation time instead of browser run time
- svg automaticaly optimize without other loader

## Why inject SVG sprite in HTML instead of using an external file ?
Each time we inject an element \<use xlink:href="file.svg#icon" /> in the DOM, a request is launch to get "file.svg". So the icon appear with a delay depending on http response time. If you have an animation when svg symbol is injected in DOM, the icon will appear in the middle of animation.

The goal of this plugin + loader is to avoid those http requests when injecting symbol reference in the DOM.

## How to use
This plugin works only with html-webpack-plugin.

#### Webpack configuration :
```javascript
const HtmlWebpackPlugin = require('html-webpack-plugin');
const SvgSpriteHtmlWebpackPlugin = require('../../../open-source/svg-sprite-html-webpack');

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
    new SvgSpriteHtmlWebpackPlugin(),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'index.html',
    }),
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

## SvgSpriteHtmlWebpackPlugin options

### (optional) generateSymbolId(svgFilePath: string, svgHash: number, svgContent: string): string
function which generate the symbol id of each svg imported.

example :
```javascript
const HtmlWebpackPlugin = require('html-webpack-plugin');
const SvgSpriteHtmlWebpackPlugin = require('../../../open-source/svg-sprite-html-webpack');

const webpackConfig = {
  ...
  plugins: [
    new SvgSpriteHtmlWebpackPlugin({
      generateSymbolId: function(svgFilePath, svgHash, svgContent) {
        return svgHash.toString();
      },
    }),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'index.html',
    }),
    ...
  ]
}
```
