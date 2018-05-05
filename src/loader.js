/**
 * WARNING : This loader must be use with SvgSpriteHtmlWebpackPlugin
 * Webpack loader which only send imported svg files to SvgSpriteHtmlWebpackPlugin
 *
 * SvgSpriteHtmlWebpackPlugin generate the list of all imported files
 * to create svg sprite and insert it in html output
 */
module.exports = function svgLoader(content) {
  if (!this.handleFile) {
    throw new Error('handleFile is not defined in svgLoader.\nMaybe the plugin SvgSpriteHtmlWebpackPlugin is not set in webpack configuration');
  }
  // handleFile is injected by the plugin SvgSpriteHtmlWebpackPlugin (./plugin)
  return this.handleFile(content, this.resourcePath);
};
