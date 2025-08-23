import { dataPipelineAPI } from './api/client';
import { dataMonitoringService } from './dataMonitoringService';
import { Representative } from '../types/representatives.types';

// Data Quality Interfaces
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  confidence: number;
  lastValidated: string;
}

export interface ValidationError {
  type: 'missing_field' | 'invalid_format' | 'expired_term' | 'invalid_contact' | 'cross_reference_mismatch';
  field: string;
  message: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

export interface ValidationWarning {
  type: 'stale_data' | 'unverified_contact' | 'incomplete_info' | 'potential_change';
  field: string;
  message: string;
  daysOld?: number;
}

export interface DiscrepancyReport {
  representativeId: string;
  discrepancies: Discrepancy[];
  confidence: number;
  recommendedAction: 'investigate' | 'auto_fix' | 'manual_review';
}

export interface Discrepancy {
  field: string;
  source1: { name: string; value: any };
  source2: { name: string; value: any };
  type: 'conflict' | 'missing' | 'outdated';
}

export interface StalenessReport {
  totalRecords: number;
  staleRecords: StaleRecord[];
  stalenessThreshold: number; // days
  overallFreshness: number; // percentage
}

export interface StaleRecord {
  representativeId: string;
  lastUpdated: string;
  daysOld: number;
  category: 'federal' | 'state' | 'county' | 'local';
}

export interface ContactValidationReport {
  totalContacts: number;
  validContacts: number;
  invalidContacts: ContactValidationError[];
  verificationRate: number;
}

export interface ContactValidationError {
  representativeId: string;
  contactType: 'phone' | 'email' | 'website' | 'address';
  value: string;
  error: string;
  lastChecked: string;
}

class DataQualityService {
  private readonly STALE_DATA_THRESHOLD = 30; // days
  private readonly CRITICAL_DATA_THRESHOLD = 90; // days
  private readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  private readonly PHONE_REGEX = /^\+?1?[-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/;
  private readonly ZIP_REGEX = /^\d{5}(-\d{4})?$/;

  /**
   * Validates a single representative's data
   */
  async validateRepresentativeData(rep: Representative): Promise<ValidationResult> {
    try {
      const errors: ValidationError[] = [];
      const warnings: ValidationWarning[] = [];
      let confidence = 100;

    // Critical field validation
    if (!rep.id) {
      errors.push({
        type: 'missing_field',
        field: 'id',
        message: 'Representative ID is required',
        severity: 'critical'
      });
      confidence -= 20;
    }

    if (!rep.name?.trim()) {
      errors.push({
        type: 'missing_field',
        field: 'name',
        message: 'Representative name is required',
        severity: 'critical'
      });
      confidence -= 15;
    }

    if (!rep.title?.trim()) {
      errors.push({
        type: 'missing_field',
        field: 'title',
        message: 'Representative title is required',
        severity: 'high'
      });
      confidence -= 10;
    }

    // Term validation
    const termValidation = this.validateTermDates(rep);
    errors.push(...termValidation.errors);
    warnings.push(...termValidation.warnings);
    confidence -= termValidation.confidencePenalty;

    // Contact information validation
    const contactValidation = this.validateContactInfo(rep.contactInfo);
    errors.push(...contactValidation.errors);
    warnings.push(...contactValidation.warnings);
    confidence -= contactValidation.confidencePenalty;

    // Party validation
    if (rep.party && !['Democrat', 'Republican', 'Independent', 'Other'].includes(rep.party)) {
      errors.push({
        type: 'invalid_format',
        field: 'party',
        message: `Invalid party affiliation: ${rep.party}`,
        severity: 'medium'
      });
      confidence -= 5;
    }

    // Chamber validation
    if (rep.chamber && !['House', 'Senate'].includes(rep.chamber)) {
      errors.push({
        type: 'invalid_format',
        field: 'chamber',
        message: `Invalid chamber: ${rep.chamber}`,
        severity: 'medium'
      });
      confidence -= 5;
    }

    // Photo URL validation
    if (rep.photoUrl && !this.isValidUrl(rep.photoUrl)) {
      warnings.push({
        type: 'unverified_contact',
        field: 'photoUrl',
        message: 'Photo URL appears to be invalid'
      });
      confidence -= 2;
    }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        confidence: Math.max(0, confidence),
        lastValidated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error validating representative data:', error);
      return {
        isValid: false,
        errors: [{
          type: 'invalid_format',
          field: 'validation_error',
          message: 'Validation process failed',
          severity: 'critical'
        }],
        warnings: [],
        confidence: 0,
        lastValidated: new Date().toISOString()
      };
    }
  }

  /**
   * Cross-references officials across different data sources
   */
  async crossReferenceOfficials(): Promise<DiscrepancyReport[]> {
    try {
      // Get data from multiple sources
      const [congressData, openStatesData, civicInfoData] = await Promise.all([
        this.fetchCongressData(),
        this.fetchOpenStatesData(),
        this.fetchCivicInfoData()
      ]);

      const discrepancies: DiscrepancyReport[] = [];

      // Cross-reference federal officials
      for (const congressRep of congressData) {
        const civicRep = civicInfoData.find(r => 
          this.fuzzyMatch(r.name, congressRep.name) && r.chamber === congressRep.chamber
        );

        if (civicRep) {
          const repDiscrepancies = this.compareRepresentatives(congressRep, civicRep, 'Congress API', 'Google Civic Info');
          if (repDiscrepancies.length > 0) {
            discrepancies.push({
              representativeId: congressRep.id,
              discrepancies: repDiscrepancies,
              confidence: this.calculateConfidence(repDiscrepancies),
              recommendedAction: this.determineAction(repDiscrepancies)
            });
          }
        }
      }

      // Cross-reference state officials
      for (const stateRep of openStatesData) {
        const civicRep = civicInfoData.find(r => 
          this.fuzzyMatch(r.name, stateRep.name) && r.state === stateRep.state
        );

        if (civicRep) {
          const repDiscrepancies = this.compareRepresentatives(stateRep, civicRep, 'OpenStates API', 'Google Civic Info');
          if (repDiscrepancies.length > 0) {
            discrepancies.push({
              representativeId: stateRep.id,
              discrepancies: repDiscrepancies,
              confidence: this.calculateConfidence(repDiscrepancies),
              recommendedAction: this.determineAction(repDiscrepancies)
            });
          }
        }
      }

      return discrepancies;
    } catch (error) {
      console.error('Error cross-referencing officials:', error);
      throw new Error('Failed to cross-reference officials');
    }
  }

  /**
   * Checks data freshness across all representatives
   */
  async checkDataFreshness(): Promise<StalenessReport> {
    try {
      const response = await dataPipelineAPI.get('/api/representatives/metadata');
      const metadata = await response.json();

      const staleRecords: StaleRecord[] = [];
      const now = new Date();

      for (const record of metadata) {
        const lastUpdated = new Date(record.lastUpdated);
        const daysOld = Math.floor((now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24));

        if (daysOld > this.STALE_DATA_THRESHOLD) {
          staleRecords.push({
            representativeId: record.id,
            lastUpdated: record.lastUpdated,
            daysOld,
            category: this.categorizeRepresentative(record)
          });
        }
      }

      const overallFreshness = ((metadata.length - staleRecords.length) / metadata.length) * 100;

      return {
        totalRecords: metadata.length,
        staleRecords,
        stalenessThreshold: this.STALE_DATA_THRESHOLD,
        overallFreshness: Math.round(overallFreshness * 100) / 100
      };
    } catch (error) {
      console.error('Error checking data freshness:', error);
      throw new Error('Failed to check data freshness');
    }
  }

  /**
   * Verifies contact information accuracy
   */
  async verifyContactInformation(): Promise<ContactValidationReport> {
    try {
      const response = await dataPipelineAPI.get('/api/representatives/contacts');
      const contacts = await response.json();

      const invalidContacts: ContactValidationError[] = [];
      let validCount = 0;

      for (const contact of contacts) {
        // Validate phone numbers
        if (contact.phone && !this.PHONE_REGEX.test(contact.phone)) {
          invalidContacts.push({
            representativeId: contact.representativeId,
            contactType: 'phone',
            value: contact.phone,
            error: 'Invalid phone number format',
            lastChecked: new Date().toISOString()
          });
        } else if (contact.phone) {
          validCount++;
        }

        // Validate email addresses
        if (contact.email && !this.EMAIL_REGEX.test(contact.email)) {
          invalidContacts.push({
            representativeId: contact.representativeId,
            contactType: 'email',
            value: contact.email,
            error: 'Invalid email format',
            lastChecked: new Date().toISOString()
          });
        } else if (contact.email) {
          validCount++;
        }

        // Validate website URLs
        if (contact.website && !this.isValidUrl(contact.website)) {
          invalidContacts.push({
            representativeId: contact.representativeId,
            contactType: 'website',
            value: contact.website,
            error: 'Invalid website URL',
            lastChecked: new Date().toISOString()
          });
        } else if (contact.website) {
          validCount++;
        }

        // Validate addresses
        if (contact.address && !this.validateAddress(contact.address)) {
          invalidContacts.push({
            representativeId: contact.representativeId,
            contactType: 'address',
            value: JSON.stringify(contact.address),
            error: 'Invalid or incomplete address',
            lastChecked: new Date().toISOString()
          });
        } else if (contact.address) {
          validCount++;
        }
      }

      return {
        totalContacts: contacts.length,
        validContacts: validCount,
        invalidContacts,
        verificationRate: Math.round((validCount / contacts.length) * 100 * 100) / 100
      };
    } catch (error) {
      console.error('Error verifying contact information:', error);
      throw new Error('Failed to verify contact information');
    }
  }

  /**
   * Generates a comprehensive data quality report
   */
  async generateQualityReport(): Promise<{
    overallScore: number;
    freshness: StalenessReport;
    contactValidation: ContactValidationReport;
    discrepancies: DiscrepancyReport[];
    summary: string;
  }> {
    try {
      const [freshness, contactValidation, discrepancies] = await Promise.all([
        this.checkDataFreshness(),
        this.verifyContactInformation(),
        this.crossReferenceOfficials()
      ]);

      // Calculate overall quality score
      const freshnessScore = freshness.overallFreshness;
      const contactScore = contactValidation.verificationRate;
      const discrepancyScore = Math.max(0, 100 - (discrepancies.length * 2)); // 2 points per discrepancy
      
      const overallScore = Math.round((freshnessScore + contactScore + discrepancyScore) / 3 * 100) / 100;

      const summary = this.generateSummary(overallScore, freshness, contactValidation, discrepancies);

      return {
        overallScore,
        freshness,
        contactValidation,
        discrepancies,
        summary
      };
    } catch (error) {
      console.error('Error generating quality report:', error);
      throw new Error('Failed to generate quality report');
    }
  }

  // Private helper methods
  private validateTermDates(rep: Representative): {
    errors: ValidationError[];
    warnings: ValidationWarning[];
    confidencePenalty: number;
  } {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    let confidencePenalty = 0;

    const now = new Date();
    const termStart = rep.termStart ? new Date(rep.termStart) : null;
    const termEnd = rep.termEnd ? new Date(rep.termEnd) : null;

    if (!rep.termStart) {
      errors.push({
        type: 'missing_field',
        field: 'termStart',
        message: 'Term start date is required',
        severity: 'high'
      });
      confidencePenalty += 10;
    }

    if (!rep.termEnd) {
      errors.push({
        type: 'missing_field',
        field: 'termEnd',
        message: 'Term end date is required',
        severity: 'high'
      });
      confidencePenalty += 10;
    }

    if (termStart && termEnd && termStart > termEnd) {
      errors.push({
        type: 'invalid_format',
        field: 'termDates',
        message: 'Term start date cannot be after term end date',
        severity: 'critical'
      });
      confidencePenalty += 15;
    }

    if (termEnd && termEnd < now) {
      errors.push({
        type: 'expired_term',
        field: 'termEnd',
        message: 'Representative term has expired',
        severity: 'critical'
      });
      confidencePenalty += 20;
    }

    if (termEnd) {
      const daysUntilExpiration = Math.floor((termEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (daysUntilExpiration < 90 && daysUntilExpiration > 0) {
        warnings.push({
          type: 'potential_change',
          field: 'termEnd',
          message: `Term expires in ${daysUntilExpiration} days`
        });
      }
    }

    return { errors, warnings, confidencePenalty };
  }

  private validateContactInfo(contactInfo: any): {
    errors: ValidationError[];
    warnings: ValidationWarning[];
    confidencePenalty: number;
  } {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    let confidencePenalty = 0;

    if (!contactInfo) {
      errors.push({
        type: 'missing_field',
        field: 'contactInfo',
        message: 'Contact information is required',
        severity: 'critical'
      });
      return { errors, warnings, confidencePenalty: 25 };
    }

    if (!contactInfo.phone) {
      errors.push({
        type: 'missing_field',
        field: 'contactInfo.phone',
        message: 'Phone number is required',
        severity: 'high'
      });
      confidencePenalty += 10;
    } else if (!this.PHONE_REGEX.test(contactInfo.phone)) {
      errors.push({
        type: 'invalid_format',
        field: 'contactInfo.phone',
        message: 'Invalid phone number format',
        severity: 'medium'
      });
      confidencePenalty += 5;
    }

    if (contactInfo.email && !this.EMAIL_REGEX.test(contactInfo.email)) {
      errors.push({
        type: 'invalid_format',
        field: 'contactInfo.email',
        message: 'Invalid email format',
        severity: 'medium'
      });
      confidencePenalty += 5;
    }

    if (contactInfo.website && !this.isValidUrl(contactInfo.website)) {
      warnings.push({
        type: 'unverified_contact',
        field: 'contactInfo.website',
        message: 'Website URL appears invalid'
      });
      confidencePenalty += 2;
    }

    if (contactInfo.mailingAddress && !this.validateAddress(contactInfo.mailingAddress)) {
      warnings.push({
        type: 'incomplete_info',
        field: 'contactInfo.mailingAddress',
        message: 'Mailing address appears incomplete'
      });
      confidencePenalty += 3;
    }

    return { errors, warnings, confidencePenalty };
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  private validateAddress(address: any): boolean {
    return !!(
      address &&
      address.street &&
      address.city &&
      address.state &&
      address.zipCode &&
      this.ZIP_REGEX.test(address.zipCode)
    );
  }

  private async fetchCongressData(): Promise<any[]> {
    try {
      const response = await dataPipelineAPI.get('/api/representatives/federal');
      return await response.json();
    } catch {
      return [];
    }
  }

  private async fetchOpenStatesData(): Promise<any[]> {
    try {
      const response = await dataPipelineAPI.get('/api/representatives/state');
      return await response.json();
    } catch {
      return [];
    }
  }

  private async fetchCivicInfoData(): Promise<any[]> {
    try {
      const response = await dataPipelineAPI.get('/api/representatives/civic');
      return await response.json();
    } catch {
      return [];
    }
  }

  private fuzzyMatch(str1: string, str2: string): boolean {
    if (!str1 || !str2) return false;
    
    const normalize = (str: string) => str.toLowerCase().replace(/[^\w]/g, '');
    const norm1 = normalize(str1);
    const norm2 = normalize(str2);
    
    // Exact match
    if (norm1 === norm2) return true;
    
    // Calculate Levenshtein distance
    const distance = this.levenshteinDistance(norm1, norm2);
    const maxLength = Math.max(norm1.length, norm2.length);
    const similarity = 1 - (distance / maxLength);
    
    return similarity >= 0.8; // 80% similarity threshold
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  private compareRepresentatives(rep1: any, rep2: any, source1: string, source2: string): Discrepancy[] {
    const discrepancies: Discrepancy[] = [];
    const fieldsToCompare = ['name', 'party', 'chamber', 'state', 'district', 'phone', 'email'];

    for (const field of fieldsToCompare) {
      const value1 = this.getFieldValue(rep1, field);
      const value2 = this.getFieldValue(rep2, field);

      if (value1 && value2 && value1 !== value2 && !this.fuzzyMatch(value1, value2)) {
        discrepancies.push({
          field,
          source1: { name: source1, value: value1 },
          source2: { name: source2, value: value2 },
          type: 'conflict'
        });
      } else if (value1 && !value2) {
        discrepancies.push({
          field,
          source1: { name: source1, value: value1 },
          source2: { name: source2, value: null },
          type: 'missing'
        });
      } else if (!value1 && value2) {
        discrepancies.push({
          field,
          source1: { name: source1, value: null },
          source2: { name: source2, value: value2 },
          type: 'missing'
        });
      }
    }

    return discrepancies;
  }

  private getFieldValue(obj: any, field: string): any {
    const parts = field.split('.');
    let value = obj;
    for (const part of parts) {
      value = value?.[part];
    }
    return value;
  }

  private calculateConfidence(discrepancies: Discrepancy[]): number {
    let confidence = 100;
    for (const discrepancy of discrepancies) {
      if (discrepancy.type === 'conflict') confidence -= 20;
      else if (discrepancy.type === 'missing') confidence -= 10;
      else if (discrepancy.type === 'outdated') confidence -= 15;
    }
    return Math.max(0, confidence);
  }

  private determineAction(discrepancies: Discrepancy[]): 'investigate' | 'auto_fix' | 'manual_review' {
    const hasConflicts = discrepancies.some(d => d.type === 'conflict');
    const criticalFields = ['name', 'party', 'chamber'];
    const hasCriticalIssues = discrepancies.some(d => criticalFields.includes(d.field));

    if (hasConflicts || hasCriticalIssues) {
      return 'manual_review';
    } else if (discrepancies.every(d => d.type === 'missing')) {
      return 'auto_fix';
    } else {
      return 'investigate';
    }
  }

  private categorizeRepresentative(record: any): 'federal' | 'state' | 'county' | 'local' {
    if (record.chamber === 'House' || record.chamber === 'Senate') return 'federal';
    if (record.title?.includes('State') || record.title?.includes('Assembly')) return 'state';
    if (record.title?.includes('County') || record.title?.includes('Supervisor')) return 'county';
    return 'local';
  }

  private generateSummary(
    overallScore: number,
    freshness: StalenessReport,
    contactValidation: ContactValidationReport,
    discrepancies: DiscrepancyReport[]
  ): string {
    let summary = `Data quality score: ${overallScore}%\n`;
    
    if (overallScore >= 95) {
      summary += "✅ Excellent data quality - minimal issues detected.\n";
    } else if (overallScore >= 85) {
      summary += "⚠️ Good data quality with some areas for improvement.\n";
    } else if (overallScore >= 70) {
      summary += "⚠️ Moderate data quality issues requiring attention.\n";
    } else {
      summary += "❌ Significant data quality issues requiring immediate action.\n";
    }

    summary += `\n📊 Data Freshness: ${freshness.overallFreshness}% (${freshness.staleRecords.length} stale records)\n`;
    summary += `📞 Contact Validation: ${contactValidation.verificationRate}% (${contactValidation.invalidContacts.length} invalid contacts)\n`;
    summary += `🔍 Cross-Reference: ${discrepancies.length} discrepancies found\n`;

    if (freshness.staleRecords.length > 0) {
      summary += `\n⏰ Oldest records: ${Math.max(...freshness.staleRecords.map(r => r.daysOld))} days old\n`;
    }

    const criticalDiscrepancies = discrepancies.filter(d => d.recommendedAction === 'manual_review').length;
    if (criticalDiscrepancies > 0) {
      summary += `\n🚨 ${criticalDiscrepancies} critical discrepancies require manual review\n`;
    }

    return summary;
  }
}

export const dataQualityService = new DataQualityService();
export default dataQualityService;