#!/usr/bin/env node
/**
 * Validation harness for tree-sitter-sysml grammar.
 * 
 * Parses all official SysML v2 files from the Systems-Modeling/SysML-v2-Release
 * repository and reports coverage. This validates that our grammar correctly
 * handles real-world SysML v2 code.
 * 
 * Test corpus:
 *   - Training modules (42 modules, 100 files): Graduated curriculum covering all constructs
 *   - Examples (95 files): Real-world usage scenarios
 *   
 * Source: https://github.com/Systems-Modeling/SysML-v2-Release
 * 
 * Usage:
 *   node scripts/validate-training.js [path-to-sysml-dir]
 * 
 * Exit codes:
 *   0 - All files parsed without errors
 *   1 - Some files had parse errors (expected during development)
 */

const fs = require('fs');
const path = require('path');
const Parser = require('tree-sitter');
const SysML = require('..');

const parser = new Parser();
parser.setLanguage(SysML);

function findSysmlFiles(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...findSysmlFiles(fullPath));
    } else if (entry.name.endsWith('.sysml')) {
      files.push(fullPath);
    }
  }
  return files;
}

function hasErrors(node) {
  if (node.type === 'ERROR' || node.isMissing) {
    return true;
  }
  for (let i = 0; i < node.childCount; i++) {
    if (hasErrors(node.child(i))) {
      return true;
    }
  }
  return false;
}

function getErrors(node, source, errors = []) {
  if (node.type === 'ERROR') {
    const startPos = node.startPosition;
    const text = source.slice(node.startIndex, Math.min(node.endIndex, node.startIndex + 30));
    errors.push({
      line: startPos.row + 1,
      column: startPos.column + 1,
      text: text.replace(/\n/g, '\\n'),
    });
  }
  for (let i = 0; i < node.childCount; i++) {
    getErrors(node.child(i), source, errors);
  }
  return errors;
}

function parseFile(filePath) {
  const source = fs.readFileSync(filePath, 'utf8');
  const tree = parser.parse(source);
  const errors = getErrors(tree.rootNode, source);
  return {
    path: filePath,
    success: errors.length === 0,
    errors,
    nodeCount: countNodes(tree.rootNode),
  };
}

function countNodes(node) {
  let count = 1;
  for (let i = 0; i < node.childCount; i++) {
    count += countNodes(node.child(i));
  }
  return count;
}

function getModuleName(filePath) {
  const parts = filePath.split(path.sep);
  const trainingIdx = parts.findIndex(p => p === 'training');
  if (trainingIdx >= 0 && trainingIdx + 1 < parts.length) {
    return parts[trainingIdx + 1];
  }
  return 'unknown';
}

function main() {
  const trainingDir = process.argv[2] || './examples/training';
  
  if (!fs.existsSync(trainingDir)) {
    console.error(`Training directory not found: ${trainingDir}`);
    console.error('Please provide path to SysML v2 training modules.');
    process.exit(1);
  }

  const files = findSysmlFiles(trainingDir);
  console.log(`\n# SysML v2 Grammar Validation Report\n`);
  console.log(`- **Date**: ${new Date().toISOString().split('T')[0]}`);
  console.log(`- **Files tested**: ${files.length}`);
  console.log(`- **Training directory**: ${trainingDir}\n`);

  const results = files.map(parseFile);
  const byModule = new Map();
  
  for (const result of results) {
    const module = getModuleName(result.path);
    if (!byModule.has(module)) {
      byModule.set(module, { total: 0, passed: 0, failed: 0, files: [] });
    }
    const m = byModule.get(module);
    m.total++;
    if (result.success) {
      m.passed++;
    } else {
      m.failed++;
    }
    m.files.push(result);
  }

  // Sort modules by name (they're numbered 01-42)
  const sortedModules = [...byModule.entries()].sort((a, b) => a[0].localeCompare(b[0]));

  // Summary table
  console.log('## Summary by Module\n');
  console.log('| Module | Files | Passed | Failed | Coverage |');
  console.log('|--------|-------|--------|--------|----------|');
  
  let totalFiles = 0;
  let totalPassed = 0;
  
  for (const [module, data] of sortedModules) {
    const coverage = ((data.passed / data.total) * 100).toFixed(0);
    const status = data.failed === 0 ? '✅' : (data.passed > 0 ? '🟡' : '❌');
    console.log(`| ${status} ${module} | ${data.total} | ${data.passed} | ${data.failed} | ${coverage}% |`);
    totalFiles += data.total;
    totalPassed += data.passed;
  }
  
  const totalCoverage = ((totalPassed / totalFiles) * 100).toFixed(1);
  console.log(`| **TOTAL** | **${totalFiles}** | **${totalPassed}** | **${totalFiles - totalPassed}** | **${totalCoverage}%** |`);

  // Detailed errors for failed files
  const failedResults = results.filter(r => !r.success);
  if (failedResults.length > 0) {
    console.log('\n## Parse Errors\n');
    console.log('<details>');
    console.log('<summary>Click to expand error details</summary>\n');
    
    for (const result of failedResults.slice(0, 50)) { // Limit to first 50
      const relPath = path.relative(trainingDir, result.path);
      console.log(`### ${relPath}\n`);
      for (const err of result.errors.slice(0, 3)) { // First 3 errors per file
        console.log(`- Line ${err.line}, Col ${err.column}: \`${err.text}\``);
      }
      if (result.errors.length > 3) {
        console.log(`- ... and ${result.errors.length - 3} more errors`);
      }
      console.log('');
    }
    
    if (failedResults.length > 50) {
      console.log(`\n... and ${failedResults.length - 50} more files with errors\n`);
    }
    console.log('</details>\n');
  }

  // Coverage badge data
  console.log('## Coverage Badge\n');
  console.log('```');
  console.log(JSON.stringify({
    schemaVersion: 1,
    label: 'SysML v2 coverage',
    message: `${totalCoverage}%`,
    color: totalCoverage >= 80 ? 'green' : totalCoverage >= 50 ? 'yellow' : 'red',
  }, null, 2));
  console.log('```\n');

  // Exit with error if not all files pass (useful for CI)
  process.exit(failedResults.length > 0 ? 1 : 0);
}

main();
