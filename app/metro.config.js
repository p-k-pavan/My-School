const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

// Normalize __dirname drive letter to uppercase on Windows to avoid path casing conflicts with Metro
let projectRoot = __dirname;
if (process.platform === "win32" && projectRoot.match(/^[a-z]:/)) {
  projectRoot = projectRoot.charAt(0).toUpperCase() + projectRoot.slice(1);
}

const config = getDefaultConfig(projectRoot);

module.exports = withNativeWind(config, { input: "./src/global.css" });
