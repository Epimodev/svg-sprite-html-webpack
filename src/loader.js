/**
 * WARNING : This loader must be use with SvgSpriteHtmlWebpackPlugin
 * Webpack loader which create an svgItem object and send it to SvgSpriteHtmlWebpackPlugin
 * The information is send to SvgSpriteHtmlWebpackPlugin with this.pushSvg
 * which is injected by SvgSpriteHtmlWebpackPlugin
 */
module.exports = function svgLoader(source) {
  if (!this.pushSVGIncomingFile) {
    throw new Error('pushSVGIncomingFile is not defined in svgLoader.\nMaybe the plugin SvgSpriteHtmlWebpackPlugin is not set in webpack configuration');
  }

  return this.pushSVGIncomingFile(this.resourcePath, Buffer.from(source, 'utf8'), source);
};
