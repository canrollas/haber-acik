const fs = require('fs');
const path = require('path');

// apns.credentials.properties holds the Apple Team ID (and APNs key metadata).
// It lives at the project root and is gitignored, same as
// release.keystore.properties for Android signing — see plugins/withReleaseSigning.js.
// Expo's built-in withDevelopmentTeam mod picks up ios.appleTeamId and writes
// DEVELOPMENT_TEAM into the pbxproj on every prebuild, so Xcode signing survives
// `prebuild --clean` without the Team ID ever landing in a committed file.
// If the file is missing (fresh clone without secrets) this no-ops and you pick
// the team manually in Xcode.
function readAppleTeamId(projectRoot) {
  const propsPath = path.join(projectRoot, 'apns.credentials.properties');
  if (!fs.existsSync(propsPath)) {
    return null;
  }
  for (const line of fs.readFileSync(propsPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    if (trimmed.slice(0, idx) === 'APPLE_TEAM_ID') {
      return trimmed.slice(idx + 1) || null;
    }
  }
  return null;
}

module.exports = ({ config }) => {
  const appleTeamId = readAppleTeamId(__dirname);
  if (appleTeamId) {
    config.ios = { ...config.ios, appleTeamId };
  }
  return config;
};
