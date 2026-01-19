#!/usr/bin/env node
/**
 * List public and private packages
 * Usage: node scripts/list-packages.cjs [--public|--private]
 */

const fs = require('fs');
const path = require('path');

const arg = process.argv[2];
const showPublic = !arg || arg === '--public';
const showPrivate = !arg || arg === '--private';

const packagesDir = path.join(__dirname, '../packages');
const packages = fs.readdirSync(packagesDir);

const publicPackages = [];
const privatePackages = [];

packages.forEach(dir => {
  const pkgPath = path.join(packagesDir, dir, 'package.json');
  if (!fs.existsSync(pkgPath)) return;

  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  if (pkg.private === true) {
    privatePackages.push(pkg.name);
  } else {
    publicPackages.push(pkg.name);
  }
});

console.log('');

if (showPublic) {
  console.log(`📦 Public Packages (${publicPackages.length}):`);
  console.log('   These SHOULD be mentioned in CHANGELOG.md');
  console.log('');
  publicPackages.sort().forEach(name => {
    console.log(`   ✅ ${name}`);
  });
  console.log('');
}

if (showPrivate) {
  console.log(`🔒 Private Packages (${privatePackages.length}):`);
  console.log('   These SHOULD NOT be mentioned in CHANGELOG.md');
  console.log('');
  privatePackages.sort().forEach(name => {
    console.log(`   ❌ ${name}`);
  });
  console.log('');
}
