const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const [versionName, versionCodeInput] = process.argv.slice(2);
const versionCode = Number.parseInt(versionCodeInput, 10);

function fail(message) {
  console.error(message);
  console.error("Usage: npm run version:android -- 1.0.9 11");
  process.exit(1);
}

if (!versionName || !/^\d+\.\d+\.\d+$/.test(versionName)) {
  fail("Version name must use major.minor.patch format, for example 1.0.9.");
}

if (!Number.isInteger(versionCode) || versionCode <= 0) {
  fail("Version code must be a positive whole number.");
}

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

function write(file, content) {
  fs.writeFileSync(path.join(root, file), content);
}

function replaceOrFail(content, pattern, replacement, file) {
  if (!pattern.test(content)) {
    fail(`Could not update ${file}. Expected pattern was not found.`);
  }
  return content.replace(pattern, replacement);
}

const appJsonFile = "app.json";
const appJson = JSON.parse(read(appJsonFile));
appJson.expo.version = versionName;
appJson.expo.android = appJson.expo.android || {};
appJson.expo.android.versionCode = versionCode;
write(appJsonFile, `${JSON.stringify(appJson, null, 2)}\n`);

const appConfigFile = "src/constants/app.js";
let appConfig = read(appConfigFile);
appConfig = replaceOrFail(appConfig, /version: "\d+\.\d+\.\d+"/, `version: "${versionName}"`, appConfigFile);
appConfig = replaceOrFail(appConfig, /androidVersionCode: \d+/, `androidVersionCode: ${versionCode}`, appConfigFile);
write(appConfigFile, appConfig);

const buildGradleFile = "android/app/build.gradle";
let buildGradle = read(buildGradleFile);
buildGradle = replaceOrFail(buildGradle, /versionCode \d+/, `versionCode ${versionCode}`, buildGradleFile);
buildGradle = replaceOrFail(buildGradle, /versionName "\d+\.\d+\.\d+"/, `versionName "${versionName}"`, buildGradleFile);
write(buildGradleFile, buildGradle);

console.log(`HerSaathi Android version updated to ${versionName} (${versionCode}).`);
