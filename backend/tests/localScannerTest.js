const path = require('path');
const fs = require('fs');
const LocalScannerService = require('../src/services/localScanner');
const LocalFilePatcher = require('../src/services/localScanner/patcher');

async function testLocalScanner() {
  console.log('🧪 Starting LocalScannerService & LocalFilePatcher Tests...\n');

  // Test 1: Validate path
  const currentWorkspace = path.resolve(__dirname, '../../');
  console.log(`Checking path validation on ${currentWorkspace}...`);
  const val = LocalScannerService.validatePath(currentWorkspace);
  console.log('✅ Path Validation Result:', {
    valid: val.valid,
    framework: val.framework,
    fileCount: val.fileCount,
    sampleFiles: val.sampleFiles.slice(0, 3)
  });

  if (!val.valid || val.fileCount === 0) {
    throw new Error('Path validation failed or found 0 files.');
  }

  // Test 2: Scan project
  console.log('\nRunning scanProject on workspace...');
  const scanResult = await LocalScannerService.scanProject(currentWorkspace, {
    targetKeyword: 'SEO Analyzer SaaS',
    businessName: 'AI SEO Auditor Suite'
  });

  console.log('✅ Scan Completed Successfully!');
  console.log(`   Overall Score: ${scanResult.overallScore}/100`);
  console.log(`   Files Scanned: ${scanResult.filesScanned}`);
  console.log(`   Issues Found: ${scanResult.issues.length}`);
  console.log('   Summary:', scanResult.summary);

  if (scanResult.issues.length > 0) {
    const sample = scanResult.issues[0];
    console.log('\n   Sample Issue:');
    console.log(`     Title: ${sample.title} [${sample.severity}]`);
    console.log(`     Location: ${sample.file_path}:${sample.line_number}`);
    console.log(`     Suggested Fix: ${sample.suggested_fix}`);
    console.log(`     Antigravity Command: ${sample.antigravity_command}`);
  }

  // Test 3: Test LocalFilePatcher on temporary test file
  console.log('\nTesting LocalFilePatcher safety and execution...');
  const testDir = path.resolve(__dirname, '../scratch');
  if (!fs.existsSync(testDir)) fs.mkdirSync(testDir, { recursive: true });
  const testFile = path.join(testDir, 'test_page.html');
  fs.writeFileSync(testFile, '<html>\n<head>\n</head>\n<body>\n<img src="logo.png">\n</body>\n</html>', 'utf-8');

  const patchRes = LocalFilePatcher.applyFix({
    projectPath: testDir,
    filePath: 'test_page.html',
    lineNumber: 5,
    originalCode: '<img src="logo.png">',
    replacementCode: '<img src="logo.png" alt="Company Brand Logo">'
  });

  console.log('✅ Patch Result:', patchRes.success);
  const updatedContent = fs.readFileSync(testFile, 'utf-8');
  console.log('   Updated Content:\n' + updatedContent);
  if (!updatedContent.includes('alt="Company Brand Logo"')) {
    throw new Error('Patch was not applied correctly.');
  }

  // Clean up test file
  fs.unlinkSync(testFile);
  if (fs.existsSync(`${testFile}.bak`)) fs.unlinkSync(`${testFile}.bak`);

  console.log('\n🎉 ALL LOCAL SCANNER & PATCHER TESTS PASSED SUCCESSFULLY!');
}

testLocalScanner().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
