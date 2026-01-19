#!/usr/bin/env node
/**
 * Set version across all packages in the monorepo
 * Usage: node scripts/set-version.js <version>
 */

const fs = require('fs');
const path = require('path');

const version = process.argv[2];

if (!version) {
  console.error('Usage: node scripts/set-version.js <version>');
  console.error('Example: node scripts/set-version.js 1.0.0');
  process.exit(1);
}

// Validate semver format
if (!/^\d+\.\d+\.\d+(-[a-z0-9.]+)?$/.test(version)) {
  console.error(`Invalid version format: ${version}`);
  console.error('Expected format: X.Y.Z or X.Y.Z-alpha.1');
  process.exit(1);
}

let updated = 0;
let errors = 0;

// Update all package.json files in packages/
const packagesDir = path.join(__dirname, '../packages');
const packages = fs.readdirSync(packagesDir).filter(dir => {
  const pkgPath = path.join(packagesDir, dir, 'package.json');
  return fs.existsSync(pkgPath);
});

console.log(`Setting version to ${version} for ${packages.length} packages...\n`);

packages.forEach(dir => {
  const pkgPath = path.join(packagesDir, dir, 'package.json');
  try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    const oldVersion = pkg.version;
    pkg.version = version;
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
    console.log(`✅ ${pkg.name}: ${oldVersion} → ${version}`);
    updated++;
  } catch (err) {
    console.error(`❌ ${dir}: ${err.message}`);
    errors++;
  }
});

// Update root package.json
const rootPkgPath = path.join(__dirname, '../package.json');
try {
  const rootPkg = JSON.parse(fs.readFileSync(rootPkgPath, 'utf8'));
  const oldVersion = rootPkg.version;
  rootPkg.version = version;
  fs.writeFileSync(rootPkgPath, JSON.stringify(rootPkg, null, 2) + '\n');
  console.log(`✅ root package.json: ${oldVersion} → ${version}`);
  updated++;
} catch (err) {
  console.error(`❌ root package.json: ${err.message}`);
  errors++;
}

console.log(`\n📊 Summary:`);
console.log(`   Updated: ${updated} files`);
console.log(`   Errors: ${errors} files`);

if (errors > 0) {
  process.exit(1);
}
