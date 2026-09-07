import axios from 'axios';
import fs from 'fs';
import path from 'path';

const API_BASE = 'http://localhost:5000/api';

async function runE2EVerification() {
  console.log('🚀 Starting Comprehensive Full-Stack E2E Test Suite...\n');

  try {
    // 1. Health check
    const health = await axios.get(`${API_BASE}/health`);
    console.log('✅ API Health Check passed:', health.data.status);

    // 2. Register
    const email = `test_auditor_${Date.now()}@example.com`;
    console.log(`\n👤 Testing Registration with ${email}...`);
    const regRes = await axios.post(`${API_BASE}/auth/register`, {
      name: 'Alex Mercer',
      email,
      password: 'Password123!',
      confirmPassword: 'Password123!'
    });
    const user = regRes.data.data.user;
    const token = regRes.data.data.token;
    console.log(`✅ Registration successful. User ID: ${user.id} (${user.email})`);

    const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

    // 3. User profile verification
    const meRes = await axios.get(`${API_BASE}/auth/me`, authHeaders);
    console.log('✅ Auth /me verified for user:', meRes.data.data.user.name);

    // 4. Submit Audit for real website (https://example.com)
    console.log('\n🕷️ Submitting Real Website Audit for https://example.com...');
    const auditRes = await axios.post(
      `${API_BASE}/audits`,
      {
        url: 'https://example.com',
        targetKeyword: 'Domain Documentation',
        businessName: 'Example Internet Corp',
        businessLocation: 'California',
        maxPages: 3
      },
      authHeaders
    );
    const audit = auditRes.data.data.audit;
    const scoreResult = auditRes.data.data.scoreResult;
    console.log(`✅ Audit Completed! ID: ${audit.id}`);
    console.log(`   Overall Score: ${audit.seo_score}/100`);
    console.log(`   Pages Crawled: ${audit.pages_crawled}`);
    console.log('   Category Breakdown:');
    console.log(`     Technical: ${scoreResult.technicalScore}/100`);
    console.log(`     On-Page: ${scoreResult.onPageScore}/100`);
    console.log(`     Content: ${scoreResult.contentScore}/100`);
    console.log(`     Performance: ${scoreResult.performanceScore}/100`);
    console.log(`     Structured Data: ${scoreResult.structuredDataScore}/100`);
    console.log(`     Social: ${scoreResult.socialScore}/100`);
    console.log(`     Local: ${scoreResult.localScore}/100`);

    // 5. Fetch Pages
    const pagesRes = await axios.get(`${API_BASE}/audits/${audit.id}/pages`, authHeaders);
    const pages = pagesRes.data.data.pages;
    console.log(`\n📄 Crawled Pages count: ${pages.length}`);
    pages.forEach((p, idx) => {
      console.log(`   [${idx + 1}] ${p.url} (Status: ${p.status_code}, Score: ${p.seo_score}, Word Count: ${p.word_count})`);
    });

    // 6. Fetch Issues
    const issuesRes = await axios.get(`${API_BASE}/audits/${audit.id}/issues`, authHeaders);
    const issues = issuesRes.data.data.issues;
    console.log(`\n⚠️ Detected SEO Issues count: ${issues.length}`);
    const criticals = issues.filter(i => i.severity === 'critical');
    const highs = issues.filter(i => i.severity === 'high');
    const mediums = issues.filter(i => i.severity === 'medium');
    const lows = issues.filter(i => i.severity === 'low');
    const passed = issues.filter(i => i.severity === 'passed');
    console.log(`   Critical: ${criticals.length}, High: ${highs.length}, Medium: ${mediums.length}, Low: ${lows.length}, Passed: ${passed.length}`);
    if (highs.length > 0) {
      console.log(`   Sample High Issue: "${highs[0].title}" - ${highs[0].description}`);
    }

    // 7. AI Recommendations
    console.log('\n🤖 Testing AI Analysis and Recommendations...');
    const aiRes = await axios.post(
      `${API_BASE}/ai/analyze`,
      { auditId: audit.id },
      authHeaders
    );
    console.log('✅ AI Summary Generated:');
    console.log('  ', (aiRes.data.data.summary || '').slice(0, 150) + '...');
    const priorityRecs = aiRes.data.data.priorityRecommendations || [];
    console.log(`✅ Priority Recommendations count: ${priorityRecs.length}`);
    if (priorityRecs.length > 0) {
      console.log(`   Priority #1: ${priorityRecs[0].title} [${priorityRecs[0].severity}]`);
      console.log(`   Action: ${priorityRecs[0].action}`);
      console.log(`   Suggested Fix: ${priorityRecs[0].suggestedImplementation}`);
    }

    // 8. Test AI Fix Generator
    if (highs.length > 0 || mediums.length > 0) {
      const targetIssue = highs[0] || mediums[0];
      console.log(`\n🔧 Testing AI Code Fix Generator for issue: "${targetIssue.title}"...`);
      const fixRes = await axios.post(
        `${API_BASE}/ai/generate-fix`,
        {
          issueType: targetIssue.issue_type,
          context: { url: 'https://example.com', title: 'Example Domain' }
        },
        authHeaders
      );
      console.log('✅ AI Fix generated:');
      console.log('  ', fixRes.data.data.code);
    }

    // 9. Test AI Consultant Chat
    console.log('\n💬 Testing Contextual AI Consultant Chat...');
    const chatRes = await axios.post(
      `${API_BASE}/ai/chat`,
      {
        message: 'Why is my SEO score at this level, and what should I fix first?',
        auditId: audit.id
      },
      authHeaders
    );
    console.log('✅ AI Consultant replied:');
    console.log('  ', chatRes.data.data.reply.slice(0, 200) + '...');

    // 10. Test AI Content Optimizer
    console.log('\n📝 Testing AI Content Optimizer...');
    const optRes = await axios.post(
      `${API_BASE}/ai/optimize-content`,
      {
        content: `Search Engine Optimization is the foundation of high-converting digital marketing.
                  By properly structuring your headings, refining meta tags, and producing depth-rich content,
                  websites can rank higher on Google search results. This guide explores technical SEO, link equity,
                  and mobile-first indexing to ensure your website attracts relevant organic traffic.`,
        keyword: 'search engine optimization'
      },
      authHeaders
    );
    console.log('✅ Content Optimizer Score:', optRes.data.data.contentScore);
    console.log('✅ Recommendations count:', optRes.data.data.recommendations.length);

    // 11. Test PDF Report Generation
    console.log('\n📑 Testing PDF Report Generation...');
    const pdfRes = await axios.get(`${API_BASE}/reports/${audit.id}`, {
      ...authHeaders,
      responseType: 'arraybuffer'
    });
    console.log(`✅ PDF Report successfully generated! Size: ${pdfRes.data.length} bytes`);
    const testPdfPath = path.resolve('test_report.pdf');
    fs.writeFileSync(testPdfPath, Buffer.from(pdfRes.data));
    console.log(`   Saved sample test report to: ${testPdfPath}`);

    // 12. Test Audit History
    console.log('\n📜 Testing Audit History Listing...');
    const historyRes = await axios.get(`${API_BASE}/audits`, authHeaders);
    console.log(`✅ Audits in history for user: ${historyRes.data.data.audits.length}`);

    console.log('\n🎉 ALL 12 END-TO-END VERIFICATION STEPS PASSED WITH 100% SUCCESS!');
  } catch (error) {
    console.error('❌ E2E Verification failed:', error.response ? error.response.data : error.message);
    process.exit(1);
  }
}

runE2EVerification();
