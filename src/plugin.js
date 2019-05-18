const path = require('path');
const fs = require('fs');
const glob = require('glob');
const XXHash = require('xxhashjs');
const { createSprite } = require('./spriteUtils');

const loaderPath = require.resolve('./loader.js');

const BODY_TAG_BEGIN = '<body';
const BODY_TAG_END = '>';
const BODY_TAG_CLOSE = '</body';

/**
 * Compute svg hash with XXHash
 * @param {string} svgContent - svg file content
 * @return {number} hash of the svg
 */
function computeSvgHash(svgContent) {
  const buffer = Buffer.from(svgContent, 'utf8');
  const hash = XXHash.h32(buffer, 0xCAFEBABE);
  return hash.toNumber();
}

/* eslint-disable no-param-reassign */
module.exports = class SvgSpriteHtmlWebpackPlugin {
  /**
   * @constructor
   * @param {object} options - plugin options
   * @param {function(string, number, string):string} options.generateSymbolId function which compute id of each symbol.
   *        arg0 is the svgFilePath.
   *        arg1 is the svgHash.
   *        arg2 is the svgContent.
   * @param {string[]} options.includeFiles - list of file path to include without javascript import
   * @param {boolean} options.append - adds the generated svg string before or after the body content
   */
  constructor(options = {}) {
    this.nextSymbolId = 0; // use only by this.generateId
    this.generateSymbolId = options.generateSymbolId || this.generateSymbolId;
    this.generateSymbolIdOverwritted = !!options.generateSymbolId;
    this.append = options.append || false;
    this.svgList = [];
    this.lastCompiledList = this.svgList;
    this.svgSprite = '';

    if (options.includeFiles) {
      this.importFiles(options.includeFiles);
    }

    this.handleFile = this.handleFile.bind(this);
    this.processSvg = this.processSvg.bind(this);
  }

  /**
   * Include files in svg sprite without javascript import
   * @param {string[]} includePaths - list of paths to include
   */
  importFiles(includePaths) {
    const filesToInclude = includePaths
      .reduce((acc, includePath) => {
        const matchPaths = glob.sync(includePath);
        if (matchPaths.length === 0) {
          console.warn(`WARNING : No file match with regex path "${includePath}"`);
        }
        return acc.concat(matchPaths);
      }, [])
      .map((filePath) => {
        const absolutePath = path.resolve(filePath);
        const content = fs.readFileSync(absolutePath, { encoding: 'utf-8' });
        return {
          content,
          filePath: absolutePath,
        };
      });

    filesToInclude.forEach(({ content, filePath }) => {
      const symbolId = path.basename(filePath, '.svg');
      this.handleFile(content, filePath, symbolId);
    });
  }

  /**
   * Generate symbol id of a svg in the sprite
   * this function is not use if options.generateSymbolId is set in constructor
   * @return {string} the id of generated symbol
   */
  generateSymbolId() {
    const id = this.nextSymbolId.toString();
    this.nextSymbolId += 1;
    return id;
  }

  /**
   * Get symbol id to export in javascript
   * @param {object} maybeSvgItem - not null if svg is already imported
   * @param {string} maybeSvgItem.id
   * @param {string} defaultSymbolId - symbol id to use instead of generate an integer id
   * @param {string} filePath - svg file path
   * @param {number} svgHash - svg hash
   * @param {string} content - svg content
   * @return {string} symbolId to return in javascript export
   */
  getSymbolId(maybeSvgItem, defaultSymbolId, filePath, svgHash, content) {
    if (maybeSvgItem) return maybeSvgItem.id;
    if (defaultSymbolId) {
      if (this.generateSymbolIdOverwritted) {
        return this.generateSymbolId(filePath, svgHash, content);
      }
      return defaultSymbolId;
    }
    return this.generateSymbolId(filePath, svgHash, content);
  }

  /**
   * Handle file imported by loader
   * @param {string} content - svg file content
   * @param {string} path - svg file path
   * @param {string} defaultSymbolId - symbol id to use instead of generate an integer id
   * @return {string} javascript export string with svg symbol id
   */
  handleFile(content, filePath, defaultSymbolId = null) {
    const svgHash = computeSvgHash(content);
    // search an svg already loaded with the same hash
    const maybeSvgItem = this.svgList.find(item => item.hash === svgHash);
    const isAlreadyLoaded = !!maybeSvgItem;

    const symbolId = this.getSymbolId(maybeSvgItem, defaultSymbolId, filePath, svgHash, content);

    if (!isAlreadyLoaded) {
      const svgItem = {
        id: symbolId,
        hash: svgHash,
        path: filePath,
        content,
      };
      this.pushSvg(svgItem);
    }

    return `export default '#${symbolId}'`;
  }

  /**
   * Add or replace a svg to compile in this.svgList
   * @param {object} svgItem - svg to push in list of svg to compile
   * @param {string} svgItem.id
   * @param {number} svgItem.hash
   * @param {string} svgItem.path
   * @param {string} svgItem.content
   */
  pushSvg(svgItem) {
    // avoid to have 2 svg in the list for the same path
    const listWithoutPreviousItemVersion = this.svgList
      .filter(item => item.path !== svgItem.path);
    this.svgList = [...listWithoutPreviousItemVersion, svgItem];
  }

  /**
   * Function called by webpack during compilation, if hooks are missing (old webpack)
   * @param {object} compiler - webpack compiler
   */
  applyWebpackDeprecated(compiler) {
    compiler.plugin('compilation', (compilation) => {
      compilation.plugin('normal-module-loader', (loaderContext) => {
        // Give to loader access to handleFile function
        if (!loaderContext.handleFile) {
          loaderContext.handleFile = this.handleFile;
        }
      });

      compilation.plugin('html-webpack-plugin-before-html-processing', this.processSvg);
    });
  }

  /**
   * Function called by webpack during compilation, if hooks are present (webpack 4+)
   * @param {object} compiler - webpack compiler
   */
  applyWebpack4(compiler) {
    compiler.hooks.compilation.tap('SvgPlugin', (compilation) => {
      compilation.hooks.normalModuleLoader.tap('SvgPluginLoader', (loaderContext) => {
        // Give to loader access to handleFile function
        if (!loaderContext.handleFile) {
          loaderContext.handleFile = this.handleFile;
        }
      });

      if (compilation.hooks.htmlWebpackPluginBeforeHtmlProcessing) {
        compilation.hooks.htmlWebpackPluginBeforeHtmlProcessing.tapAsync('svg-sprite-html-webpack', this.processSvg);
      } else {
        console.warn('WARNING : `compilation.hooks.htmlWebpackPluginBeforeHtmlProcessing` is undefined');
        console.info('SvgSpriteHtmlWebpackPlugin must be declare after HtmlWebpackPlugin to works');
      }
    });
  }

  /**
   * Function called by webpack during compilation
   * @param {object} compiler - webpack compiler
   */
  apply(compiler) {
    if (compiler.hooks) {
      this.applyWebpack4(compiler);
    } else {
      this.applyWebpackDeprecated(compiler);
    }
  }

  /**
   * Inject svg sprite in the body of HTML string
   * @param {string} html - HTML string generated by HtmlWebpackPlugin
   * @return {string} html with svg sprite
   */
  insertSpriteInHtml(html) {
    let spriteIndex = -1;

    if (this.append) {
      spriteIndex = html.indexOf(BODY_TAG_CLOSE);
    } else {
      const startIndex = html.indexOf(BODY_TAG_BEGIN);
      if (startIndex !== -1) {
        spriteIndex = html.indexOf(BODY_TAG_END, startIndex) + 1;
      }
    }

    if (spriteIndex === -1) return html;

    const start = html.slice(0, spriteIndex);
    const end = html.slice(spriteIndex);

    return start + this.svgSprite + end;
  }

  /**
   * Function called when HTML string is generated by HtmlWebpackPlugin
   * This function generate svg sprite with the list of svg collected by the svgLoader (./loader.js)
   * When the sprite is generated, it's injected in the HTML string
   * @param {object} htmlPluginData - object created by HtmlWebpackPlugin
   * @param {function} callback function to call when sprite creation and injection is finished
   */
  processSvg(htmlPluginData, callback) {
    const svgListChanged = this.svgList !== this.lastCompiledList;

    if (svgListChanged) {
      createSprite(this.svgList)
        .then((svgSprite) => {
          this.lastCompiledList = this.svgList;
          this.svgSprite = svgSprite;

          htmlPluginData.html = this.insertSpriteInHtml(htmlPluginData.html);
          callback(null, htmlPluginData);
        })
        .catch(console.error);
    } else {
      htmlPluginData.html = this.insertSpriteInHtml(htmlPluginData.html);
      callback(null, htmlPluginData);
    }
  }

  /**
   * Resolve the path of webpack loader to add in webpack configuration
   * @return {string} - the path of the svg loader
   */
  static getLoader() {
    return loaderPath;
  }
};
