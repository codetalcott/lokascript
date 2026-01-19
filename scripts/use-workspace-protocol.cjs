#!/usr/bin/env node
/**
 * Convert all internal @lokascript/* dependencies to workspace protocol
 * This enables automatic version resolution during development
 */

const fs = require('fs');
const path = require('path');

const packagesDir = path.join(__dirname, '../packages');
const packages = fs.readdirSync(packagesDir).filter(dir => {
  const pkgPath = path.join(packagesDir, dir, 'package.json');
  return fs.existsSync(pkgPath);
});

let updated = 0;
let total = 0;

console.log('Converting internal dependencies to workspace protocol...\n');

packages.forEach(dir => {
  const pkgPath = path.join(packagesDir, dir, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  let changed = false;

  // Update dependencies
  ['dependencies', 'devDependencies', 'peerDependencies'].forEach(depType => {
    if (pkg[depType]) {
      Object.keys(pkg[depType]).forEach(depName => {
        if (depName.startsWith('@lokascript/')) {
          const currentValue = pkg[depType][depName];
          // Only update if not already using workspace protocol
          if (!currentValue.startsWith('workspace:') && !currentValue.startsWith('file:')) {
            pkg[depType][depName] = 'workspace:*';
            console.log(`  ${pkg.name}`);
            console.log(`    ${depName}: ${currentValue} → workspace:*`);
            changed = true;
            total++;
          }
        }
      });
    }
  });

  if (changed) {
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
    updated++;
  }
});

console.log(`\n📊 Summary:`);
console.log(`   Packages updated: ${updated}`);
console.log(`   Dependencies converted: ${total}`);

if (total > 0) {
  console.log('\n💡 Next steps:');
  console.log('   1. Run: npm install');
  console.log('   2. Commit changes');
  console.log('\n⚠️  Note: workspace:* will be converted to exact versions during publish');
}
