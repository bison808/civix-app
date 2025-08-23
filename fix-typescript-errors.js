#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Files that need error.message fixes
const files = [
  'services/dataRecoveryService.ts',
  'services/dataUpdateScheduler.ts', 
  'services/congressApi.ts'
];

// Patterns to fix
const patterns = [
  { 
    find: /console\.warn\([^,]+,\s*error\.message\)/g,
    replace: (match) => match.replace('error.message', 'error instanceof Error ? error.message : String(error)')
  },
  {
    find: /console\.error\([^,]+,\s*error\.message\)/g, 
    replace: (match) => match.replace('error.message', 'error instanceof Error ? error.message : String(error)')
  },
  {
    find: /message:\s*error\.message/g,
    replace: 'message: error instanceof Error ? error.message : String(error)'
  },
  {
    find: /\`[^`]*\$\{error\.message\}[^`]*\`/g,
    replace: (match) => match.replace('error.message', 'error instanceof Error ? error.message : String(error)')
  }
];

files.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    patterns.forEach(pattern => {
      const newContent = content.replace(pattern.find, pattern.replace);
      if (newContent !== content) {
        content = newContent;
        modified = true;
      }
    });
    
    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`Fixed TypeScript errors in ${filePath}`);
    }
  }
});

console.log('TypeScript error fixing complete!');