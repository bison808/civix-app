#!/usr/bin/env node

/**
 * CITZN Phase 1 Beta - Comprehensive Data Validation
 * Agent 38: User Experience & Integration Validation Specialist
 * 
 * Deep validation of real data usage across all user interactions
 */

const fs = require('fs').promises;
const path = require('path');

class DataValidationSuite {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      realDataValidation: {},
      serviceIntegration: {},
      placeholderDetection: {},
      dataConsistency: {},
      crossReferenceValidation: {},
      overallScore: 0,
      issues: [],
      recommendations: []
    };
  }

  async validateServiceFiles() {
    console.log('🔍 Validating Service Files for Real Data Integration...');
    
    const serviceValidation = {
      servicesAnalyzed: 0,
      realDataServices: 0,
      mockDataServices: 0,
      placeholderServices: 0,
      serviceDetails: {},
      errors: []
    };

    try {
      // Get all service files
      const servicesDir = path.join(process.cwd(), 'services');
      const serviceFiles = await fs.readdir(servicesDir);
      
      for (const file of serviceFiles) {
        if (file.endsWith('.ts') && !file.includes('.test.') && !file.includes('.spec.')) {
          console.log(`  📄 Analyzing: ${file}`);
          
          try {
            const filePath = path.join(servicesDir, file);
            const content = await fs.readFile(filePath, 'utf8');
            
            const analysis = this.analyzeServiceFile(file, content);
            serviceValidation.serviceDetails[file] = analysis;
            serviceValidation.servicesAnalyzed++;
            
            if (analysis.hasRealData) serviceValidation.realDataServices++;
            if (analysis.hasMockData) serviceValidation.mockDataServices++;
            if (analysis.hasPlaceholders) serviceValidation.placeholderServices++;
            
          } catch (error) {
            serviceValidation.errors.push(`Error analyzing ${file}: ${error.message}`);
          }
        }
      }

    } catch (error) {
      serviceValidation.errors.push(`Error accessing services directory: ${error.message}`);
    }

    this.results.serviceIntegration = serviceValidation;
  }

  analyzeServiceFile(filename, content) {
    const analysis = {
      filename,
      hasRealData: false,
      hasMockData: false,
      hasPlaceholders: false,
      realDataIndicators: [],
      mockDataIndicators: [],
      placeholderIndicators: [],
      apiEndpoints: [],
      dataStructures: []
    };

    // Convert to lowercase for case-insensitive analysis
    const lowerContent = content.toLowerCase();

    // Check for real data indicators
    const realDataPatterns = [
      'congress.gov',
      'openstates.org',
      'propublica.org',
      'house.gov',
      'senate.gov',
      'ca.gov',
      'api.congress.gov',
      'googleapis.com/civicinfo',
      'real representatives',
      'real bills',
      'real committees',
      'federal api',
      'state api',
      'congressional api'
    ];

    realDataPatterns.forEach(pattern => {
      if (lowerContent.includes(pattern)) {
        analysis.hasRealData = true;
        analysis.realDataIndicators.push(pattern);
      }
    });

    // Check for mock/test data indicators
    const mockDataPatterns = [
      'mock',
      'test data',
      'sample',
      'fake',
      'dummy',
      'placeholder',
      'lorem ipsum',
      'example.com',
      'test.com',
      'mockapi',
      'jsonplaceholder'
    ];

    mockDataPatterns.forEach(pattern => {
      if (lowerContent.includes(pattern)) {
        analysis.hasMockData = true;
        analysis.mockDataIndicators.push(pattern);
      }
    });

    // Check for placeholder content
    const placeholderPatterns = [
      'todo',
      'fixme',
      'coming soon',
      '[name]',
      '[title]',
      'john doe',
      'jane smith',
      'sample representative',
      'sample bill',
      'test user',
      'example data'
    ];

    placeholderPatterns.forEach(pattern => {
      if (lowerContent.includes(pattern)) {
        analysis.hasPlaceholders = true;
        analysis.placeholderIndicators.push(pattern);
      }
    });

    // Extract API endpoints
    const apiEndpointRegex = /['"`](https?:\/\/[^'"`\s]+)['"`]/g;
    let match;
    while ((match = apiEndpointRegex.exec(content)) !== null) {
      analysis.apiEndpoints.push(match[1]);
    }

    // Extract data structures (interfaces, types)
    const interfaceRegex = /interface\s+(\w+)/g;
    while ((match = interfaceRegex.exec(content)) !== null) {
      analysis.dataStructures.push(match[1]);
    }

    return analysis;
  }

  async validateAppPages() {
    console.log('\n📱 Validating App Pages for Real Data Usage...');
    
    const pageValidation = {
      pagesAnalyzed: 0,
      realDataPages: 0,
      placeholderPages: 0,
      pageDetails: {},
      errors: []
    };

    try {
      const appDir = path.join(process.cwd(), 'app');
      const pageFiles = await this.findPageFiles(appDir);
      
      for (const file of pageFiles) {
        console.log(`  📄 Analyzing page: ${path.relative(appDir, file)}`);
        
        try {
          const content = await fs.readFile(file, 'utf8');
          const analysis = this.analyzePageFile(file, content);
          
          const relativePath = path.relative(appDir, file);
          pageValidation.pageDetails[relativePath] = analysis;
          pageValidation.pagesAnalyzed++;
          
          if (analysis.hasRealDataUsage) pageValidation.realDataPages++;
          if (analysis.hasPlaceholders) pageValidation.placeholderPages++;
          
        } catch (error) {
          pageValidation.errors.push(`Error analyzing ${file}: ${error.message}`);
        }
      }

    } catch (error) {
      pageValidation.errors.push(`Error accessing app directory: ${error.message}`);
    }

    this.results.realDataValidation = pageValidation;
  }

  async findPageFiles(dir) {
    const files = [];
    
    try {
      const items = await fs.readdir(dir, { withFileTypes: true });
      
      for (const item of items) {
        const fullPath = path.join(dir, item.name);
        
        if (item.isDirectory()) {
          const subFiles = await this.findPageFiles(fullPath);
          files.push(...subFiles);
        } else if (item.name.endsWith('.tsx') || item.name.endsWith('.ts')) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Directory might not exist or be accessible
    }

    return files;
  }

  analyzePageFile(filepath, content) {
    const analysis = {
      filepath,
      hasRealDataUsage: false,
      hasPlaceholders: false,
      hasServiceCalls: false,
      realDataIndicators: [],
      placeholderIndicators: [],
      serviceCalls: [],
      hardcodedData: []
    };

    const lowerContent = content.toLowerCase();

    // Check for service usage (real data)
    const serviceCallPatterns = [
      'userepresentatives',
      'usebills',
      'usecommittees',
      'representatives.service',
      'bills.service',
      'committee.service',
      'api.get',
      'fetch(',
      'axios.',
      'representativesservice',
      'billsservice'
    ];

    serviceCallPatterns.forEach(pattern => {
      if (lowerContent.includes(pattern)) {
        analysis.hasServiceCalls = true;
        analysis.hasRealDataUsage = true;
        analysis.serviceCalls.push(pattern);
      }
    });

    // Check for placeholder content in UI
    const placeholderUIPatterns = [
      'placeholder=',
      'lorem ipsum',
      'sample data',
      'coming soon',
      'todo:',
      'fixme:',
      'test content',
      'example text',
      'john doe',
      'jane smith',
      'sample representative',
      'sample bill'
    ];

    placeholderUIPatterns.forEach(pattern => {
      if (lowerContent.includes(pattern)) {
        analysis.hasPlaceholders = true;
        analysis.placeholderIndicators.push(pattern);
      }
    });

    // Check for hardcoded data that should be dynamic
    const hardcodedPatterns = [
      /'[A-Z][a-z]+ [A-Z][a-z]+'/g, // Potential names
      /'HR \d+'/g, // Bill numbers
      /'District \d+'/g // District numbers
    ];

    hardcodedPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        analysis.hardcodedData.push(match[0]);
      }
    });

    // Real data usage indicators
    const realDataUIPatterns = [
      'representative?.name',
      'bill?.title',
      'committee?.name',
      '{representative.name}',
      '{bill.title}',
      '{committee.name}',
      'data.representatives',
      'data.bills',
      'data.committees'
    ];

    realDataUIPatterns.forEach(pattern => {
      if (lowerContent.includes(pattern.toLowerCase())) {
        analysis.hasRealDataUsage = true;
        analysis.realDataIndicators.push(pattern);
      }
    });

    return analysis;
  }

  async validateComponentFiles() {
    console.log('\n🧩 Validating Component Files...');
    
    const componentValidation = {
      componentsAnalyzed: 0,
      realDataComponents: 0,
      placeholderComponents: 0,
      componentDetails: {},
      errors: []
    };

    try {
      const componentsDir = path.join(process.cwd(), 'components');
      
      try {
        const componentFiles = await this.findPageFiles(componentsDir);
        
        for (const file of componentFiles) {
          console.log(`  🧩 Analyzing component: ${path.basename(file)}`);
          
          try {
            const content = await fs.readFile(file, 'utf8');
            const analysis = this.analyzePageFile(file, content);
            
            const filename = path.basename(file);
            componentValidation.componentDetails[filename] = analysis;
            componentValidation.componentsAnalyzed++;
            
            if (analysis.hasRealDataUsage) componentValidation.realDataComponents++;
            if (analysis.hasPlaceholders) componentValidation.placeholderComponents++;
            
          } catch (error) {
            componentValidation.errors.push(`Error analyzing ${file}: ${error.message}`);
          }
        }
      } catch (error) {
        // Components directory might not exist
        componentValidation.errors.push('Components directory not found');
      }

    } catch (error) {
      componentValidation.errors.push(`Error accessing components: ${error.message}`);
    }

    this.results.placeholderDetection = componentValidation;
  }

  async validateDataConsistency() {
    console.log('\n🔄 Validating Data Consistency Across Services...');
    
    const consistency = {
      crossServiceConsistency: true,
      dataTypeConsistency: true,
      apiEndpointConsistency: true,
      inconsistencies: [],
      recommendations: []
    };

    // Analyze service integration consistency
    const serviceDetails = this.results.serviceIntegration.serviceDetails || {};
    
    // Check for conflicting data sources
    const realDataServices = Object.entries(serviceDetails)
      .filter(([name, details]) => details.hasRealData && !details.hasMockData);
    
    const mockDataServices = Object.entries(serviceDetails)
      .filter(([name, details]) => details.hasMockData);

    const placeholderServices = Object.entries(serviceDetails)
      .filter(([name, details]) => details.hasPlaceholders);

    if (mockDataServices.length > 0 && realDataServices.length > 0) {
      consistency.crossServiceConsistency = false;
      consistency.inconsistencies.push({
        type: 'mixed_data_sources',
        description: `Found ${mockDataServices.length} services using mock data alongside ${realDataServices.length} using real data`,
        mockServices: mockDataServices.map(([name]) => name),
        realServices: realDataServices.map(([name]) => name)
      });
    }

    if (placeholderServices.length > 0) {
      consistency.dataTypeConsistency = false;
      consistency.inconsistencies.push({
        type: 'placeholder_content',
        description: `Found ${placeholderServices.length} services with placeholder content`,
        services: placeholderServices.map(([name, details]) => ({
          name,
          placeholders: details.placeholderIndicators
        }))
      });
    }

    // Check API endpoint consistency
    const allEndpoints = [];
    Object.values(serviceDetails).forEach(details => {
      allEndpoints.push(...details.apiEndpoints);
    });

    const uniqueEndpoints = [...new Set(allEndpoints)];
    const testEndpoints = uniqueEndpoints.filter(endpoint => 
      endpoint.includes('test') || 
      endpoint.includes('mock') || 
      endpoint.includes('example') ||
      endpoint.includes('jsonplaceholder')
    );

    if (testEndpoints.length > 0) {
      consistency.apiEndpointConsistency = false;
      consistency.inconsistencies.push({
        type: 'test_endpoints',
        description: `Found ${testEndpoints.length} test/mock endpoints in production code`,
        endpoints: testEndpoints
      });
    }

    // Generate recommendations
    if (!consistency.crossServiceConsistency) {
      consistency.recommendations.push('Replace all mock data services with real data integrations');
    }

    if (!consistency.dataTypeConsistency) {
      consistency.recommendations.push('Remove all placeholder content and replace with real data');
    }

    if (!consistency.apiEndpointConsistency) {
      consistency.recommendations.push('Replace test/mock API endpoints with production endpoints');
    }

    this.results.dataConsistency = consistency;
  }

  calculateOverallDataScore() {
    console.log('\n📊 Calculating Overall Data Validation Score...');
    
    let totalScore = 0;
    let maxScore = 100;

    // Service Integration Score (40 points)
    const serviceStats = this.results.serviceIntegration;
    if (serviceStats.servicesAnalyzed > 0) {
      const realDataRatio = serviceStats.realDataServices / serviceStats.servicesAnalyzed;
      const mockDataPenalty = (serviceStats.mockDataServices / serviceStats.servicesAnalyzed) * 20;
      const placeholderPenalty = (serviceStats.placeholderServices / serviceStats.servicesAnalyzed) * 15;
      
      totalScore += Math.max(0, (realDataRatio * 40) - mockDataPenalty - placeholderPenalty);
    }

    // Page/Component Real Data Usage (30 points)
    const pageStats = this.results.realDataValidation;
    if (pageStats.pagesAnalyzed > 0) {
      const realDataPageRatio = pageStats.realDataPages / pageStats.pagesAnalyzed;
      const placeholderPagePenalty = (pageStats.placeholderPages / pageStats.pagesAnalyzed) * 10;
      
      totalScore += Math.max(0, (realDataPageRatio * 30) - placeholderPagePenalty);
    }

    // Data Consistency (30 points)
    const consistencyStats = this.results.dataConsistency;
    let consistencyScore = 30;
    
    if (!consistencyStats.crossServiceConsistency) consistencyScore -= 10;
    if (!consistencyStats.dataTypeConsistency) consistencyScore -= 10;
    if (!consistencyStats.apiEndpointConsistency) consistencyScore -= 10;
    
    totalScore += Math.max(0, consistencyScore);

    this.results.overallScore = Math.min(Math.round(totalScore), maxScore);
    
    console.log(`📈 Overall Data Validation Score: ${this.results.overallScore}/100`);
  }

  async generateIssuesAndRecommendations() {
    console.log('\n📋 Generating Issues and Recommendations...');
    
    // Critical Issues
    if (this.results.serviceIntegration.mockDataServices > 0) {
      this.results.issues.push({
        severity: 'critical',
        category: 'mock_data',
        description: `${this.results.serviceIntegration.mockDataServices} services still using mock data`,
        services: Object.entries(this.results.serviceIntegration.serviceDetails)
          .filter(([name, details]) => details.hasMockData)
          .map(([name]) => name)
      });
    }

    if (this.results.serviceIntegration.placeholderServices > 0) {
      this.results.issues.push({
        severity: 'critical',
        category: 'placeholder_content',
        description: `${this.results.serviceIntegration.placeholderServices} services contain placeholder content`,
        services: Object.entries(this.results.serviceIntegration.serviceDetails)
          .filter(([name, details]) => details.hasPlaceholders)
          .map(([name, details]) => ({ name, placeholders: details.placeholderIndicators }))
      });
    }

    if (this.results.realDataValidation.placeholderPages > 0) {
      this.results.issues.push({
        severity: 'high',
        category: 'ui_placeholders',
        description: `${this.results.realDataValidation.placeholderPages} pages contain placeholder content`,
        pages: Object.entries(this.results.realDataValidation.pageDetails)
          .filter(([name, details]) => details.hasPlaceholders)
          .map(([name]) => name)
      });
    }

    // Recommendations
    this.results.recommendations.push(...(this.results.dataConsistency.recommendations || []));

    if (this.results.overallScore < 80) {
      this.results.recommendations.push('Comprehensive data integration audit required before production release');
    }

    if (this.results.serviceIntegration.realDataServices < this.results.serviceIntegration.servicesAnalyzed) {
      this.results.recommendations.push('Complete migration from mock to real data sources for all services');
    }

    if (this.results.realDataValidation.realDataPages < this.results.realDataValidation.pagesAnalyzed) {
      this.results.recommendations.push('Ensure all UI components display real government data');
    }
  }

  async generateComprehensiveReport() {
    console.log('\n📄 Generating Comprehensive Data Validation Report...');
    
    const report = {
      ...this.results,
      summary: {
        testDate: this.results.timestamp,
        overallScore: this.results.overallScore,
        dataIntegrityLevel: this.getDataIntegrityLevel(),
        productionReadiness: this.results.overallScore >= 85,
        servicesAnalyzed: this.results.serviceIntegration.servicesAnalyzed,
        pagesAnalyzed: this.results.realDataValidation.pagesAnalyzed,
        criticalIssues: this.results.issues.filter(issue => issue.severity === 'critical').length,
        totalIssues: this.results.issues.length,
        totalRecommendations: this.results.recommendations.length
      }
    };

    // Save comprehensive report
    const reportPath = path.join(__dirname, `data-validation-report-${Date.now()}.json`);
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`📁 Report saved to: ${reportPath}`);
    
    this.printDataValidationSummary(report);
    
    return report;
  }

  getDataIntegrityLevel() {
    if (this.results.overallScore >= 90) return 'EXCELLENT';
    if (this.results.overallScore >= 80) return 'GOOD';
    if (this.results.overallScore >= 70) return 'ACCEPTABLE';
    if (this.results.overallScore >= 60) return 'NEEDS_IMPROVEMENT';
    return 'CRITICAL';
  }

  printDataValidationSummary(report) {
    console.log('\n' + '='.repeat(80));
    console.log('📊 CITZN PHASE 1 BETA - DATA VALIDATION SUMMARY');
    console.log('='.repeat(80));
    console.log(`📅 Test Date: ${new Date(report.timestamp).toLocaleString()}`);
    console.log(`🏆 Overall Data Score: ${report.overallScore}/100`);
    console.log(`📈 Data Integrity Level: ${report.summary.dataIntegrityLevel}`);
    console.log(`🚀 Production Ready: ${report.summary.productionReadiness ? '✅ YES' : '❌ NO'}`);
    
    console.log('\n📊 ANALYSIS BREAKDOWN:');
    console.log('─'.repeat(50));
    console.log(`🔧 Services Analyzed: ${report.summary.servicesAnalyzed}`);
    console.log(`📱 Pages Analyzed: ${report.summary.pagesAnalyzed}`);
    console.log(`✅ Real Data Services: ${this.results.serviceIntegration.realDataServices}/${this.results.serviceIntegration.servicesAnalyzed}`);
    console.log(`❌ Mock Data Services: ${this.results.serviceIntegration.mockDataServices}`);
    console.log(`⚠️ Placeholder Services: ${this.results.serviceIntegration.placeholderServices}`);
    console.log(`📄 Real Data Pages: ${this.results.realDataValidation.realDataPages}/${this.results.realDataValidation.pagesAnalyzed}`);

    if (report.summary.criticalIssues > 0) {
      console.log('\n🚨 CRITICAL ISSUES:');
      console.log('─'.repeat(50));
      this.results.issues
        .filter(issue => issue.severity === 'critical')
        .forEach(issue => {
          console.log(`❌ ${issue.description}`);
          if (issue.services) {
            console.log(`   Services: ${Array.isArray(issue.services) ? issue.services.join(', ') : issue.services}`);
          }
        });
    }

    if (this.results.recommendations.length > 0) {
      console.log('\n💡 RECOMMENDATIONS:');
      console.log('─'.repeat(50));
      this.results.recommendations.forEach(rec => console.log(`🔧 ${rec}`));
    }

    console.log('\n' + '='.repeat(80));
  }

  async runComprehensiveDataValidation() {
    try {
      console.log('🚀 Starting CITZN Comprehensive Data Validation Suite...');
      console.log('Agent 38: Deep Real Data Integration Analysis\n');

      await this.validateServiceFiles();
      await this.validateAppPages();
      await this.validateComponentFiles();
      await this.validateDataConsistency();
      
      this.calculateOverallDataScore();
      await this.generateIssuesAndRecommendations();
      
      const report = await this.generateComprehensiveReport();
      
      return report;
      
    } catch (error) {
      console.error('❌ Data validation suite failed:', error);
      throw error;
    }
  }
}

// Run validation suite
async function main() {
  const validator = new DataValidationSuite();
  
  try {
    const report = await validator.runComprehensiveDataValidation();
    
    console.log('\n✅ Data validation suite completed successfully!');
    
    // Return exit code based on data integrity
    process.exit(report.summary.productionReadiness ? 0 : 1);
    
  } catch (error) {
    console.error('\n❌ Data validation suite failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = DataValidationSuite;