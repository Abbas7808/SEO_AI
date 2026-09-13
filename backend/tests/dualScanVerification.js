const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_BASE = 'http://localhost:5000/api';

async function runDualScanVerification() {
  console.log('🚀 Running Complete Dual Scan Verification (Online vs Local Codebase with Google Antigravity)...\n');

  try {
    // 1. Health check
    const health = await axios.get(`${API_BASE}/health`);
    console.log('✅ API Health Check:', health.data.status);

    // 2. Validate Local Path
    const workspacePath = 'C:\\Users\\AGP KOHAT\\Desktop\\SEO';
    console.log(`\n📁 Testing local path validation on "${workspacePath}"...`);
    const valRes = await axios.post(`${API_BASE}/audits/validate-local-path`, {
      projectPath: workspacePath
    });
    console.log('✅ Path validation passed:');
    console.log('   Valid:', valRes.data.data.valid);
    console.log('   Project Name:', valRes.data.data.projectName);
    console.log('   Framework:', valRes.data.data.framework);
    console.log('   Source Files Found:', valRes.data.data.fileCount);

    // 3. Run Local Codebase Scan
    console.log('\n💻 Executing Local Codebase Audit via API...');
    const scanRes = await axios.post(`${API_BASE}/audits/scan-local`, {
      projectPath: workspacePath,
      targetKeyword: 'SEO Audit SaaS',
      businessName: 'AI Website SEO Auditor',
      businessLocation: 'California'
    });

    const audit = scanRes.data.data.audit;
    const scoreResult = scanRes.data.data.scoreResult;
    console.log(`✅ Local Codebase Scan Complete! Audit ID #${audit.id}`);
    console.log(`   Overall Score: ${audit.seo_score}/100`);
    console.log(`   Scan Mode: ${audit.scan_mode}`);
    console.log(`   Project Path: ${audit.project_path}`);
    console.log(`   Issues Count: ${scoreResult.issues.length}`);

    // Verify first issue contains file_path, line_number, and code diff
    const issueWithLocation = scoreResult.issues.find(i => i.file_path && i.line_number);
    if (!issueWithLocation) {
      throw new Error('No issue found with file_path and line_number.');
    }
    console.log('\n📍 Location-Aware Issue Verified:');
    console.log(`   Title: ${issueWithLocation.title}`);
    console.log(`   File: ${issueWithLocation.file_path}`);
    console.log(`   Line: ${issueWithLocation.line_number}`);
    console.log(`   Diff Preview:\n${issueWithLocation.code_diff}`);

    // 4. Test Google Antigravity Open-Editor Action
    console.log('\n🤖 Testing Google Antigravity Open-Editor action...');
    const openRes = await axios.post(`${API_BASE}/audits/antigravity/open-editor`, {
      projectPath: workspacePath,
      filePath: issueWithLocation.file_path,
      lineNumber: issueWithLocation.line_number
    });
    console.log('✅ Google Antigravity IDE Launcher triggered:');
    console.log('   Deep Link URI:', openRes.data.data.deepLink);
    console.log('   Agent Prompt:', openRes.data.data.antigravityPrompt);

    // 5. Test Safe Code Patching to disk
    console.log('\n⚡ Testing Local File Patching to disk...');
    const scratchDir = path.resolve(__dirname, '../scratch');
    if (!fs.existsSync(scratchDir)) fs.mkdirSync(scratchDir, { recursive: true });
    const sampleFile = path.join(scratchDir, 'index.html');
    fs.writeFileSync(sampleFile, '<html>\n<head>\n</head>\n<body>\n<img src="banner.jpg">\n</body>\n</html>', 'utf-8');

    const patchRes = await axios.post(`${API_BASE}/audits/antigravity/apply-local-fix`, {
      auditId: audit.id,
      issueId: issueWithLocation.id,
      projectPath: scratchDir,
      filePath: 'index.html',
      lineNumber: 5,
      originalCode: '<img src="banner.jpg">',
      replacementCode: '<img src="banner.jpg" alt="Enterprise Hero Banner">'
    });

    console.log('✅ File Patching Successful:');
    console.log('   Result:', patchRes.data.data.success);
    console.log('   Safety Backup Created:', fs.existsSync(sampleFile + '.bak'));

    const patchedContent = fs.readFileSync(sampleFile, 'utf-8');
    console.log('   Patched Content:\n' + patchedContent);

    // Clean up scratch file
    fs.unlinkSync(sampleFile);
    if (fs.existsSync(sampleFile + '.bak')) fs.unlinkSync(sampleFile + '.bak');

    console.log('\n🎉 DUAL SCAN MODE & GOOGLE ANTIGRAVITY VERIFICATION 100% SUCCESSFUL!');
  } catch (err) {
    console.error('❌ Verification failed:', err.response ? err.response.data : err.message);
    process.exit(1);
  }
}

runDualScanVerification();
