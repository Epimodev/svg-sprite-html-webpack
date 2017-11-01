const path = require('path');
const fse = require('fs-extra');
const SVGSpriter = require('svg-sprite');

/**
 * Get the symbol id of a svg based on his file name
 * In this plugin, the id of each symbol is the svg file name without the extension
 * @param {string} svgPath - absolute path of imported svg file
 * @return {string} the id of svg symbol
 */
function getSymbolId(svgPath) {
  const fileName = path.basename(svgPath);
  const nbChar = fileName.length;
  const nbCharWithoutExt = nbChar - 4;
  const id = fileName.substr(0, nbCharWithoutExt);
  return id;
}

// svg-sprite config to generate symbol ready to be injected in html body
const config = {
  shape: {
    id: {
      generator: (defaultId, file) => getSymbolId(file.path),
    },
  },
  mode: {
    symbol: {
      inline: true,
    },
  },
};

/**
 * Generate a function which add a file in a spriter
 * @param {SVGSpriter} spriter - spriter where to add file
 * @return {addFileInSpriter~addFile}
 */
function addFileInSpriter(spriter) {
  /**
   * Add file
   * @param {object} svgInfo
   * @param {string} svgInfo.id
   * @param {string} svgInfo.path
   * @return {Promise} Promise resolved when svg file is read an added in spriter
   */
  function addFile(svgInfo) {
    return fse.readFile(svgInfo.path, { encoding: 'utf-8' })
      .then((svgContent) => {
        spriter.add(svgInfo.path, null, svgContent);
      });
  }
  return addFile;
}

/**
 * Compile svg files to a string
 * @param {SVGSpriter} spriter - spriter which contain files to compile
 * @return {Promise} promise with result as a string
 */
function compileSprite(spriter) {
  return new Promise((resolve, reject) => {
    spriter.compile((error, result) => {
      if (error) return reject(error);

      const { contents } = result.symbol.sprite;
      return resolve(contents.toString('utf8'));
    });
  });
}

/**
 * Create a svg sprite with <symbol> elements
 * @param {object[]} svgList - list of svg info for sprite creation
 * @param {string} svgList.id
 * @param {string} svgList.path
 * @return {Promise} promise with svg sprite string
 */
function createSprite(svgList) {
  const spritter = new SVGSpriter(config);

  const addSvgsPromises = svgList.map(addFileInSpriter(spritter));

  return Promise.all(addSvgsPromises)
    .then(() => compileSprite(spritter));
}

module.exports = {
  getSymbolId,
  createSprite,
};
