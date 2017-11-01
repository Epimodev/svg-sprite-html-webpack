const { getSymbolId } = require('./spriteUtils');

/**
 * WARNING : This loader must be use with SvgSpriteHtmlWebpackPlugin
 * Webpack loader which create an svgItem object and send it to SvgSpriteHtmlWebpackPlugin
 * The information is send to SvgSpriteHtmlWebpackPlugin with this.pushSvg
 * which is injected by SvgSpriteHtmlWebpackPlugin
 */
module.exports = function svgLoader(source) {
  if (!this.pushSvg) {
    throw new Error('pushSvg is not defined in svgLoader.\nMaybe the plugin SvgSpriteHtmlWebpackPlugin is not set in webpack configuration');
  }
  const svgPath = this.resourcePath;
  const symbolId = getSymbolId(svgPath);

  const svgItem = {
    id: symbolId,
    path: svgPath,
    content: source,
  };
  // pushSvg is injected by the plugin SvgSpriteHtmlWebpackPlugin (./plugin)
  this.pushSvg(svgItem);

  return `export default '#${symbolId}'`;
};
