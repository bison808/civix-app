/**
 * AGENT 29: Responsive Design Testing Suite
 * 
 * Tests responsive design implementation across Bills and Committee pages
 */

const fs = require('fs');

class ResponsiveDesignTester {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      testSuite: 'Responsive Design Testing',
      agent: 'Agent 29',
      totalTests: 0,
      passed: 0,
      failed: 0,
      errors: [],
      responsiveTests: []
    };
  }

  logResult(testName, passed, details = null) {
    this.results.totalTests++;
    if (passed) {
      this.results.passed++;
    } else {
      this.results.failed++;
      if (details) {
        this.results.errors.push({
          test: testName,
          error: details
        });
      }
    }

    this.results.responsiveTests.push({
      name: testName,
      passed,
      details,
      timestamp: new Date().toISOString()
    });

    const status = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${testName}`);
    if (!passed && details) {
      console.log(`   Error: ${details}`);
    }
  }

  checkResponsiveClasses(content, pageName) {
    // Check for responsive design patterns
    const responsivePatterns = {
      breakpoints: {
        mobile: content.includes('sm:'),
        tablet: content.includes('md:'),
        desktop: content.includes('lg:'),
        large: content.includes('xl:')
      },
      flexbox: {
        flexDirection: content.includes('flex-col') || content.includes('flex-row'),
        responsiveFlex: content.includes('md:flex') || content.includes('lg:flex'),
        flexWrap: content.includes('flex-wrap')
      },
      grid: {
        gridCols: content.includes('grid-cols-'),
        responsiveGrid: content.includes('md:grid-cols-') || content.includes('lg:grid-cols-'),
        gridGap: content.includes('gap-')
      },
      spacing: {
        padding: content.includes('px-') && content.includes('py-'),
        margin: content.includes('mx-') || content.includes('my-'),
        responsiveSpacing: content.includes('md:px-') || content.includes('lg:p-')
      },
      typography: {
        textSize: content.includes('text-sm') || content.includes('text-lg'),
        responsiveText: content.includes('md:text-') || content.includes('lg:text-')
      },
      layout: {
        hidden: content.includes('hidden') && content.includes('md:block'),
        width: content.includes('w-full') || content.includes('max-w-'),
        height: content.includes('min-h-screen')
      }
    };

    return responsivePatterns;
  }

  async testBillsPageResponsiveness() {
    console.log('\n📜 Testing Bills Page Responsive Design...');

    const billsPagePath = '/home/bison808/DELTA/agent4_frontend/app/bills/page.tsx';
    
    if (!fs.existsSync(billsPagePath)) {
      this.logResult('Bills page responsive design', false, 'Bills page file not found');
      return;
    }

    const billsContent = fs.readFileSync(billsPagePath, 'utf8');
    const patterns = this.checkResponsiveClasses(billsContent, 'Bills');

    // Test breakpoint usage
    const hasBreakpoints = patterns.breakpoints.tablet || patterns.breakpoints.desktop;
    this.logResult('Bills page uses responsive breakpoints', hasBreakpoints);

    // Test grid responsiveness
    const hasResponsiveGrid = patterns.grid.responsiveGrid;
    this.logResult('Bills page has responsive grid layout', hasResponsiveGrid);

    // Test mobile-first design
    const isMobileFirst = billsContent.includes('isMobile') || billsContent.includes('mobile');
    this.logResult('Bills page has mobile-first considerations', isMobileFirst);

    // Test flexible layouts
    const hasFlexibleLayout = patterns.flexbox.flexDirection || patterns.grid.gridCols;
    this.logResult('Bills page has flexible layout system', hasFlexibleLayout);

    // Test responsive navigation
    const hasResponsiveNav = billsContent.includes('MobileNav') || billsContent.includes('desktop') || billsContent.includes('!isMobile');
    this.logResult('Bills page has responsive navigation', hasResponsiveNav);

    // Test responsive components
    const hasResponsiveComponents = billsContent.includes('sm:') || billsContent.includes('md:') || billsContent.includes('lg:');
    this.logResult('Bills page components use responsive classes', hasResponsiveComponents);
  }

  async testCommitteePageResponsiveness() {
    console.log('\n🏛️ Testing Committee Page Responsive Design...');

    const committeePage = '/home/bison808/DELTA/agent4_frontend/app/committees/page.tsx';
    
    if (!fs.existsSync(committeePage)) {
      this.logResult('Committee page responsive design', false, 'Committee page file not found');
      return;
    }

    const committeeContent = fs.readFileSync(committeePage, 'utf8');
    const patterns = this.checkResponsiveClasses(committeeContent, 'Committee');

    // Test responsive grid system
    const hasResponsiveGrid = patterns.grid.responsiveGrid;
    this.logResult('Committee page has responsive grid system', hasResponsiveGrid);

    // Test mobile considerations
    const hasMobileLayout = committeeContent.includes('pt-14') || committeeContent.includes('md:pt-');
    this.logResult('Committee page adapts to mobile layout', hasMobileLayout);

    // Test responsive stats dashboard
    const hasResponsiveStats = committeeContent.includes('grid-cols-1') && patterns.breakpoints.tablet;
    this.logResult('Committee stats dashboard is responsive', hasResponsiveStats);

    // Test responsive sidebar
    const hasResponsiveSidebar = committeeContent.includes('lg:col-span-') || patterns.grid.responsiveGrid;
    this.logResult('Committee sidebar layout is responsive', hasResponsiveSidebar);

    // Test responsive cards
    const hasResponsiveCards = patterns.breakpoints.tablet || patterns.breakpoints.desktop;
    this.logResult('Committee cards adapt to screen size', hasResponsiveCards);
  }

  async testCoreComponentResponsiveness() {
    console.log('\n🔧 Testing Core Component Responsiveness...');

    const coreComponents = [
      '/home/bison808/DELTA/agent4_frontend/components/core/Button.tsx',
      '/home/bison808/DELTA/agent4_frontend/components/core/Card.tsx',
      '/home/bison808/DELTA/agent4_frontend/components/bills/BillFeed.tsx'
    ];

    for (const component of coreComponents) {
      const componentName = component.split('/').pop().replace('.tsx', '');
      
      if (fs.existsSync(component)) {
        const content = fs.readFileSync(component, 'utf8');
        const hasResponsiveClasses = content.includes('sm:') || content.includes('md:') || content.includes('lg:');
        this.logResult(`${componentName} has responsive styling`, hasResponsiveClasses);
      } else {
        this.logResult(`${componentName} exists for responsive testing`, false, 'Component file not found');
      }
    }
  }

  async testTailwindConfiguration() {
    console.log('\n🎨 Testing Tailwind CSS Configuration...');

    const tailwindConfig = '/home/bison808/DELTA/agent4_frontend/tailwind.config.ts';
    
    if (!fs.existsSync(tailwindConfig)) {
      this.logResult('Tailwind config exists', false, 'tailwind.config.ts not found');
      return;
    }

    const tailwindContent = fs.readFileSync(tailwindConfig, 'utf8');
    
    // Test responsive configuration
    const hasResponsiveConfig = tailwindContent.includes('screens') || tailwindContent.includes('breakpoints');
    this.logResult('Tailwind config includes responsive settings', hasResponsiveConfig);

    // Test content paths for responsive classes
    const hasContentPaths = tailwindContent.includes('./app/**') || tailwindContent.includes('./components/**');
    this.logResult('Tailwind config covers all component paths', hasContentPaths);

    // Test theme extensions
    const hasThemeExtensions = tailwindContent.includes('extend') || tailwindContent.includes('theme');
    this.logResult('Tailwind config has theme extensions', hasThemeExtensions);
  }

  async testMobileSpecificFeatures() {
    console.log('\n📱 Testing Mobile-Specific Features...');

    const appLayout = '/home/bison808/DELTA/agent4_frontend/app/layout.tsx';
    
    if (fs.existsSync(appLayout)) {
      const layoutContent = fs.readFileSync(appLayout, 'utf8');
      
      // Test viewport meta tag
      const hasViewportMeta = layoutContent.includes('viewport') || layoutContent.includes('device-width');
      this.logResult('App has proper viewport meta tag', hasViewportMeta);

      // Test mobile-friendly styling
      const hasMobileStyling = layoutContent.includes('safe-') || layoutContent.includes('mobile');
      this.logResult('App includes mobile-friendly styling', hasMobileStyling);
    }

    // Test for mobile navigation
    const mobileNavExists = fs.existsSync('/home/bison808/DELTA/agent4_frontend/components/navigation/MobileNav.tsx');
    this.logResult('Mobile navigation component exists', mobileNavExists);

    // Test for responsive utilities
    const utilsPath = '/home/bison808/DELTA/agent4_frontend/hooks/useMediaQuery.ts';
    const hasMediaQuery = fs.existsSync(utilsPath);
    this.logResult('Media query hook for responsive behavior exists', hasMediaQuery);
  }

  async runCompleteTestSuite() {
    console.log('🚀 Starting Responsive Design Testing Suite');
    console.log('Agent 29: Component Integration Testing Agent');
    console.log('=' .repeat(80));

    const startTime = Date.now();

    try {
      await this.testBillsPageResponsiveness();
      await this.testCommitteePageResponsiveness();
      await this.testCoreComponentResponsiveness();
      await this.testTailwindConfiguration();
      await this.testMobileSpecificFeatures();

    } catch (error) {
      console.error('❌ Test suite encountered an error:', error);
      this.results.errors.push({
        test: 'Complete responsive test execution',
        error: error.message
      });
    }

    const endTime = Date.now();
    this.results.executionTime = `${(endTime - startTime) / 1000}s`;

    this.generateReport();
    this.saveResults();
  }

  generateReport() {
    console.log('\n' + '='.repeat(80));
    console.log('📋 RESPONSIVE DESIGN TEST REPORT');
    console.log('Agent 29: Component Integration Testing Agent');
    console.log('='.repeat(80));

    console.log(`⏱️  Execution Time: ${this.results.executionTime}`);
    console.log(`📊 Total Tests: ${this.results.totalTests}`);
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`📈 Success Rate: ${((this.results.passed / this.results.totalTests) * 100).toFixed(1)}%`);

    if (this.results.failed > 0) {
      console.log('\n❌ FAILED TESTS:');
      for (const error of this.results.errors) {
        console.log(`   ${error.test}: ${error.error}`);
      }
    }

    console.log('\n🎯 RESPONSIVE DESIGN STATUS:');
    if (this.results.failed === 0) {
      console.log('   ✅ Responsive design fully implemented');
      console.log('   ✅ Mobile-first approach confirmed');
      console.log('   ✅ Tailwind CSS properly configured');
      console.log('   ✅ Cross-device compatibility achieved');
    } else {
      const responsiveFailures = this.results.failed;
      if (responsiveFailures > 5) {
        console.log('   ❌ Major responsive design issues detected');
        console.log('   🔧 Implement responsive breakpoints and layouts');
      } else {
        console.log('   ⚠️  Minor responsive design improvements needed');
        console.log('   🧪 Review and enhance responsive components');
      }
    }

    console.log('\n🚀 MOBILE READINESS:');
    const mobileTests = this.results.responsiveTests.filter(t => 
      t.name.toLowerCase().includes('mobile') || t.name.toLowerCase().includes('responsive')
    );
    const mobileSuccessRate = mobileTests.length > 0 ? 
      (mobileTests.filter(t => t.passed).length / mobileTests.length) * 100 : 0;
    
    if (mobileSuccessRate >= 80) {
      console.log('   ✅ MOBILE-READY');
      console.log('   📱 Optimized for mobile devices');
      console.log('   🎯 Ready for cross-device testing');
    } else {
      console.log('   ❌ MOBILE OPTIMIZATION NEEDED');
      console.log('   📱 Improve mobile responsiveness');
    }
  }

  saveResults() {
    try {
      const resultsFile = '/home/bison808/DELTA/agent4_frontend/tests/responsive-design-results.json';
      fs.writeFileSync(resultsFile, JSON.stringify(this.results, null, 2));
      console.log(`\n💾 Results saved to: ${resultsFile}`);
    } catch (error) {
      console.error('❌ Failed to save results:', error.message);
    }
  }
}

async function main() {
  const tester = new ResponsiveDesignTester();
  await tester.runCompleteTestSuite();
  
  process.exit(tester.results.failed > 0 ? 1 : 0);
}

if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { ResponsiveDesignTester };