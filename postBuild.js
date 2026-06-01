const {
  withAndroidManifest,
  withAppBuildGradle,
} = require("@expo/config-plugins");

module.exports = (config) => {
  // Modificar el Manifiesto
  config = withAndroidManifest(config, (config) => {
    config.modResults.manifest.$.package = "es.snoker.valkyria";
    return config;
  });

  // Modificar el build.gradle para que coincida
  config = withAppBuildGradle(config, (config) => {
    config.modResults.contents = config.modResults.contents.replace(
      /applicationId "es.snoker.valkyria"/,
      'applicationId "es.snoker.valkyria"',
    );
    return config;
  });

  return config;
};