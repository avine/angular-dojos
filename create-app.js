#! /usr/bin/env node

const fs = require('fs-extra');

const DEMO_MODE = false;

// Invoke this script using `node create-app [APP_NAME]` (same as invoking directly `./create-app.js [APP_NAME]`)
let appName = process.argv[2];
appName = appName.toLowerCase();

// argument mandatory
if (!appName) {
  console.error('Error: argument appName is missing.');
  process.exit(1);
}

const appsList = fs.readdirSync('src/app/');

// template app mandatory
if (!appsList.includes('_tmpl')) {
  console.error(`Error: template app "_tmpl" is missing.`);
  process.exit(1);
}

// new argument mandatory
if (appsList.includes(appName)) {
  console.error(`Error: app "${appName}" already exists.`);
  process.exit(1);
}

try {
  DEMO_MODE || fs.copySync('src/app/_tmpl', `src/app/${appName}`);
  console.log(`Created folder: src/app/${appName}`);
} catch (e) {
  console.error(e.message);
  process.exit(1);
}

try {
  // Get "_tmpl" app configuration
  const config = JSON.parse(fs.readFileSync('.angular-cli.json', 'utf8'));
  const tmplConfig = config.apps.filter(app => app.name === '_tmpl')[0];

  // Clean configuration (when `app.name` has been removed from `src/app` folder)
  config.apps = config.apps.filter(app => appsList.includes(app.name));

  // Set appName configuration
  const appConfig = Object.assign({}, tmplConfig);
  appConfig.name = appName;
  appConfig.main = `app/${appName}/main.ts`;

  // Add appName configuration
  config.apps.push(appConfig);

  // Order apps by name
  config.apps = config.apps.sort((a, b) => a.name > b.name);

  // Update configuration
  const configString = JSON.stringify(config, undefined, 2);
  DEMO_MODE ? console.log(`\n${configString}\n`) : fs.writeFileSync('.angular-cli.json', configString, 'utf8');

  console.log('Updated file: .angular-cli.json');
} catch (e) {
  console.error(e.message);
  process.exit(1);
}

console.log(DEMO_MODE ? '** IN DEMO_MODE (nothing done) **' : 'Operation completed!');
