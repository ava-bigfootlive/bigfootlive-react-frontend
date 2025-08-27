#!/usr/bin/env node

// Simple test to verify demo mode is working
const fs = require('fs');
const path = require('path');

console.log('Testing Demo Mode Configuration...\n');

// Check if demo mode is enabled in key files
const filesToCheck = [
  { file: 'src/services/api.ts', pattern: /const DEMO_MODE = true/ },
  { file: 'src/services/websocket.ts', pattern: /const DEMO_MODE = true/ },
  { file: 'src/utils/errorHandler.ts', pattern: /const DEMO_MODE = true/ }
];

let allPassed = true;

filesToCheck.forEach(({ file, pattern }) => {
  const fullPath = path.join(__dirname, file);
  try {
    const content = fs.readFileSync(fullPath, 'utf8');
    if (pattern.test(content)) {
      console.log(`✅ ${file}: Demo mode ENABLED`);
    } else {
      console.log(`❌ ${file}: Demo mode NOT enabled`);
      allPassed = false;
    }
  } catch (err) {
    console.log(`❌ ${file}: Could not read file`);
    allPassed = false;
  }
});

console.log('\nDemo Data Generators:');
// Check for demo data generators
const apiContent = fs.readFileSync(path.join(__dirname, 'src/services/api.ts'), 'utf8');
const generators = [
  'generateDemoEvents',
  'generateDemoUsers',
  'generateDemoTenants',
  'generateDemoMediaAssets',
  'generateDemoChatHistory',
  'generateDemoAnalytics',
  'getDemoData'
];

generators.forEach(gen => {
  if (apiContent.includes(gen)) {
    console.log(`✅ ${gen} function exists`);
  } else {
    console.log(`❌ ${gen} function missing`);
    allPassed = false;
  }
});

console.log('\n' + '='.repeat(50));
if (allPassed) {
  console.log('✅ All demo mode checks PASSED!');
  console.log('The app should work without backend errors.');
} else {
  console.log('❌ Some demo mode checks FAILED.');
  console.log('The app may still show errors.');
}
console.log('='.repeat(50));

process.exit(allPassed ? 0 : 1);