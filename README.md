# SVG sprite html webpack loader and plugin
Webpack loader and plugin to generate a SVG sprite with \<symbol> elements and inject it in html built by html-webpack-plugin

## Advantages :
- sprite injected at compilation time instead of browser run time
- svg automaticaly optimize without other loader

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
        test: /\.svg$/,
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

## SvgSpriteHtmlWebpackPlugin options

### (optional) append: boolean
Determines whether the svg string should be inserted before or after the content in the body tag.

example (default behaviour):
```javascript
const webpackConfig = {
  ...
  new SvgSpriteHtmlWebpackPlugin({
    append: false
  }),
  ...
```
Code in your html file :
```html
<body>
<svg>...</svg>
...
</body>
```

reverse example:
```javascript
const webpackConfig = {
  ...
  new SvgSpriteHtmlWebpackPlugin({
    append: true
  }),
  ...
```
Code in your html file :
```html
<body>
...
<svg>...</svg>
</body>
```

### (optional) includeFiles: string[]
List of file path to include without javacript import.
You can use "glob" pattern to include a list of files in a folder (more details here: https://github.com/isaacs/node-glob).
Files path is relative from the path where webpack is launched.

By default symbol id generated will be the name of svg file without extension.
If you include several folder which includes files with the same name, you can use `generateSymbolId` option to generate symbol id depending of file path or content hash.

> Note: you can import with javascript a file already included with this option. It will use the id of the included file without inject svg in sprite twice.

> Warning: if you include 2 files with different name but with exactly the same content, only one file will be injected in svg sprite.

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
      includeFiles: [
        'src/icons/*.svg',
      ],
    }),
    ...
  ]
}
```
Code in your html file :
```html
<svg>
  <!-- if there is a file named `checkmark.svg` in includePaths -->
   <use xlink:href="#checkmark"></use>
</svg>
```

### (optional) generateSymbolId: (svgFilePath: string, svgHash: number, svgContent: string) => string
function which generate the symbol id of each svg imported.

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
