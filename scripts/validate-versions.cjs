#!/usr/bin/env node
/**
 * Validate that all packages have the same version
 * Used in CI/CD before publishing
 */

const fs = require('fs');
const path = require('path');

const packagesDir = path.join(__dirname, '../packages');
const packages = fs.readdirSync(packagesDir).filter(dir => {
  const pkgPath = path.join(packagesDir, dir, 'package.json');
  return fs.existsSync(pkgPath);
});

const versions = new Map();

// Collect all versions
packages.forEach(dir => {
  const pkgPath = path.join(packagesDir, dir, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  versions.set(pkg.name, pkg.version);
});

// Check root package.json
const rootPkg = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8')
);
versions.set('root', rootPkg.version);

// Get unique versions
const uniqueVersions = [...new Set(versions.values())];

if (uniqueVersions.length === 1) {
  console.log(`✅ All packages at version ${uniqueVersions[0]}`);
  console.log(`   Validated ${versions.size} packages`);
  process.exit(0);
} else {
  console.error('❌ Version mismatch detected!\n');
  console.error('Packages by version:');
  uniqueVersions.forEach(version => {
    console.error(`\n  ${version}:`);
    versions.forEach((v, name) => {
      if (v === version) {
        console.error(`    - ${name}`);
      }
    });
  });
  console.error('\n💡 Run: node scripts/set-version.cjs <version>');
  process.exit(1);
}
