const fs = require('fs');
const path = require('path');
const { withAppBuildGradle, withDangerousMod } = require('expo/config-plugins');

// release.jks + release.keystore.properties live at the project root so they
// survive `expo prebuild --clean` (everything under android/ is gitignored
// and regenerated from scratch on every prebuild). If they're missing (e.g. a
// fresh clone without the signing secrets), this plugin no-ops and release
// builds fall back to the default debug-signed config.
function readKeystoreProps(projectRoot) {
  const propsPath = path.join(projectRoot, 'release.keystore.properties');
  if (!fs.existsSync(propsPath)) {
    return null;
  }
  const props = {};
  for (const line of fs.readFileSync(propsPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    props[trimmed.slice(0, idx)] = trimmed.slice(idx + 1);
  }
  return props;
}

function withReleaseSigningKeystoreCopy(config) {
  return withDangerousMod(config, [
    'android',
    async config => {
      const props = readKeystoreProps(config.modRequest.projectRoot);
      if (!props) return config;
      const src = path.join(config.modRequest.projectRoot, props.MYAPP_RELEASE_STORE_FILE);
      const dest = path.join(config.modRequest.platformProjectRoot, 'app', props.MYAPP_RELEASE_STORE_FILE);
      if (fs.existsSync(src)) {
        fs.copyFileSync(src, dest);
      }
      return config;
    },
  ]);
}

function withReleaseSigningGradle(config) {
  return withAppBuildGradle(config, config => {
    const props = readKeystoreProps(config.modRequest.projectRoot);
    if (!props) return config;

    let contents = config.modResults.contents;

    contents = contents.replace(
      '    signingConfigs {\n        debug {',
      `    signingConfigs {\n        release {\n            storeFile file('${props.MYAPP_RELEASE_STORE_FILE}')\n            storePassword '${props.MYAPP_RELEASE_STORE_PASSWORD}'\n            keyAlias '${props.MYAPP_RELEASE_KEY_ALIAS}'\n            keyPassword '${props.MYAPP_RELEASE_KEY_PASSWORD}'\n        }\n        debug {`
    );

    contents = contents.replace(
      '        release {\n            // Caution! In production, you need to generate your own keystore file.\n            // see https://reactnative.dev/docs/signed-apk-android.\n            signingConfig signingConfigs.debug',
      '        release {\n            // Caution! In production, you need to generate your own keystore file.\n            // see https://reactnative.dev/docs/signed-apk-android.\n            signingConfig signingConfigs.release'
    );

    config.modResults.contents = contents;
    return config;
  });
}

module.exports = function withReleaseSigning(config) {
  config = withReleaseSigningKeystoreCopy(config);
  config = withReleaseSigningGradle(config);
  return config;
};
