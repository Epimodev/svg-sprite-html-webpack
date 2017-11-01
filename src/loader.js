const path = require('path');

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

/**
 * WARNING : This loader must be use with SvgSpriteHtmlWebpackPlugin
 * Webpack loader which create an svgItem object and send it to SvgSpriteHtmlWebpackPlugin
 * The information is send to SvgSpriteHtmlWebpackPlugin with this.pushSvg
 * which is injected by SvgSpriteHtmlWebpackPlugin
 */
module.exports = function svgLoader() {
  if (!this.pushSvg) {
    throw new Error('pushSvg is not defined in svgLoader.\nMaybe the plugin SvgSpriteHtmlWebpackPlugin is not set in webpack configuration');
  }
  const svgPath = this.resourcePath;
  const symbolId = getSymbolId(svgPath);

  const svgItem = {
    id: symbolId,
    path: svgPath,
  };
  // pushSvg is injected by the plugin SvgSpriteHtmlWebpackPlugin (./plugin)
  this.pushSvg(svgItem);

  return `export default '#${symbolId}'`;
};
