import { Bill, Representative, User } from '@/types';

export const mockBills: Bill[] = [
  {
    id: 'hr-82-2025',
    billNumber: 'H.R. 82',
    title: 'Social Security Fairness Act',
    shortTitle: 'Social Security Fairness Act',
    summary: 'This bill repeals provisions that reduce Social Security benefits for individuals who receive other benefits, such as a pension from a state or local government.',
    fullText: undefined,
    status: {
      stage: 'Committee',
      detail: 'In committee review - Ways and Means',
      date: '2025-01-15'
    },
    chamber: 'House' as const,
    introducedDate: '2025-01-03',
    lastActionDate: '2025-01-15',
    lastAction: 'Referred to House Committee on Ways and Means',
    sponsor: {
      id: 'sponsor-1',
      name: 'Rep. Garret Graves',
      party: 'Republican',
      state: 'LA',
      district: '6'
    },
    cosponsors: [],
    committees: [],
    subjects: ['social security', 'government pensions', 'retirement'],
    policyArea: 'Social Welfare',
    legislativeHistory: [{
      date: '2025-01-03',
      action: 'Introduced in House',
      chamber: 'House',
      actionType: 'introduction'
    }],
    votes: undefined,
    relatedBills: undefined,
    amendments: undefined,
    estimatedImpact: {
      economicImpact: {
        estimatedCost: 196000000000,
        budgetImpact: 'Increases federal spending significantly',
        jobsImpact: 'Positive impact on retiree spending',
        taxImplications: 'No direct tax changes'
      },
      socialImpact: ['Increased retirement security', 'Higher monthly benefits for affected retirees'],
      affectedGroups: ['Public sector retirees', 'Teachers', 'Police officers', 'Firefighters'],
      geographicScope: 'National',
      implementationTimeline: '12 months'
    },
    aiSummary: {
      id: 'summary-hr-82-2025',
      billId: 'hr-82-2025',
      title: 'Social Security Fairness Act',
      simpleSummary: 'Allows teachers, police officers, and other public workers to receive their full Social Security benefits even if they also get a government pension.',
      keyPoints: ['Eliminates benefit reduction penalties', 'Affects teachers and public safety workers', 'Increases monthly Social Security payments'],
      pros: ['Fair treatment for public workers', 'Increased retirement income', 'Recognizes dual contributions'],
      cons: ['Expensive - costs $196 billion over 10 years', 'May affect Social Security solvency'],
      whoItAffects: ['2.8 million public sector retirees', 'Teachers', 'Police', 'Firefighters', 'Government workers'],
      whatItMeans: 'Public workers who paid into Social Security would get their full benefits, not reduced ones.',
      timeline: 'Would take effect 12 months after passage',
      readingLevel: 'middle' as const,
      generatedAt: '2025-01-15T00:00:00Z'
    }
  },
  {
    id: 'hr-1-2025',
    billNumber: 'H.R. 1',
    title: 'Lower Energy Costs Act',
    shortTitle: 'Lower Energy Costs Act',
    summary: 'This bill seeks to increase American energy production, reduce energy costs for consumers, and enhance energy security through expanded domestic oil and gas production.',
    fullText: undefined,
    status: {
      stage: 'House',
      detail: 'Passed House, sent to Senate',
      date: '2025-01-09'
    },
    chamber: 'House' as const,
    introducedDate: '2025-01-03',
    lastActionDate: '2025-01-09',
    lastAction: 'Passed House by vote of 220-212',
    sponsor: {
      id: 'sponsor-2',
      name: 'Rep. Bruce Westerman',
      party: 'Republican',
      state: 'AR',
      district: '4'
    },
    cosponsors: [],
    committees: [],
    subjects: ['energy', 'oil and gas', 'environmental regulation'],
    policyArea: 'Energy',
    legislativeHistory: [
      {
        date: '2025-01-03',
        action: 'Introduced in House',
        chamber: 'House',
        actionType: 'introduction'
      },
      {
        date: '2025-01-09',
        action: 'Passed House 220-212',
        chamber: 'House',
        actionType: 'vote'
      }
    ],
    votes: undefined,
    relatedBills: undefined,
    amendments: undefined,
    estimatedImpact: {
      economicImpact: {
        estimatedCost: -25000000000,
        budgetImpact: 'Potentially reduces federal costs through increased revenue',
        jobsImpact: 'Positive impact on energy sector jobs',
        taxImplications: 'Increased tax revenue from energy production'
      },
      socialImpact: ['Lower energy costs for consumers', 'Potential environmental concerns'],
      affectedGroups: ['Energy consumers', 'Energy workers', 'Environmental advocates'],
      geographicScope: 'National',
      implementationTimeline: '6 months'
    },
    aiSummary: {
      id: 'summary-hr-1-2025',
      billId: 'hr-1-2025',
      title: 'Lower Energy Costs Act',
      simpleSummary: 'Increases domestic oil and gas production to lower energy costs, but may reduce environmental protections.',
      keyPoints: ['Expand oil and gas drilling', 'Reduce energy regulations', 'Lower gas and electricity bills'],
      pros: ['Lower energy costs for families', 'More American energy jobs', 'Reduced dependence on foreign oil'],
      cons: ['Potential environmental impact', 'May increase carbon emissions', 'Reduces clean energy focus'],
      whoItAffects: ['All energy consumers', 'Energy industry workers', 'Environmental communities'],
      whatItMeans: 'Your gas and electricity bills could be lower, but there may be more drilling and fewer environmental rules.',
      timeline: 'Changes would begin within 6 months of passage',
      readingLevel: 'middle' as const,
      generatedAt: '2025-01-15T00:00:00Z'
    }
  },
  {
    id: 's-47-2025',
    billNumber: 'S. 47',
    title: 'Laken Riley Act',
    shortTitle: 'Laken Riley Act',
    summary: 'This bill requires the detention of certain noncitizens who have been arrested for theft-related offenses and gives state attorneys general authority to bring civil actions against federal officials for immigration violations.',
    fullText: undefined,
    status: {
      stage: 'Senate',
      detail: 'Passed Senate, sent to House',
      date: '2025-01-20'
    },
    chamber: 'Senate' as const,
    introducedDate: '2025-01-09',
    lastActionDate: '2025-01-20',
    lastAction: 'Passed Senate by vote of 64-35',
    sponsor: {
      id: 'sponsor-3',
      name: 'Sen. Katie Britt',
      party: 'Republican',
      state: 'AL',
      district: undefined
    },
    cosponsors: [],
    committees: [],
    subjects: ['immigration', 'law enforcement', 'detention'],
    policyArea: 'Immigration',
    legislativeHistory: [
      {
        date: '2025-01-09',
        action: 'Introduced in Senate',
        chamber: 'Senate',
        actionType: 'introduction'
      },
      {
        date: '2025-01-20',
        action: 'Passed Senate 64-35',
        chamber: 'Senate',
        actionType: 'vote'
      }
    ],
    votes: undefined,
    relatedBills: undefined,
    amendments: undefined,
    estimatedImpact: {
      economicImpact: {
        estimatedCost: 7000000000,
        budgetImpact: 'Increases detention and enforcement costs',
        jobsImpact: 'Increase in immigration enforcement jobs',
        taxImplications: 'Requires additional federal funding'
      },
      socialImpact: ['Increased immigration enforcement', 'Changes in community safety perceptions'],
      affectedGroups: ['Undocumented immigrants', 'Local communities', 'Law enforcement'],
      geographicScope: 'National',
      implementationTimeline: '3 months'
    },
    aiSummary: {
      id: 'summary-s-47-2025',
      billId: 's-47-2025',
      title: 'Laken Riley Act',
      simpleSummary: 'Requires holding certain immigrants in detention if arrested for theft and lets states sue federal immigration officials.',
      keyPoints: ['Mandatory detention for theft arrests', 'State attorneys general can sue feds', 'Stricter immigration enforcement'],
      pros: ['Enhanced public safety measures', 'State oversight of federal policy', 'Stricter enforcement'],
      cons: ['High detention costs ($7B)', 'Potential civil rights concerns', 'Family separation risks'],
      whoItAffects: ['Undocumented immigrants', 'State governments', 'Local communities', 'Taxpayers'],
      whatItMeans: 'People without legal status arrested for theft would be detained, and states could challenge federal immigration decisions in court.',
      timeline: 'Would take effect 3 months after becoming law',
      readingLevel: 'middle' as const,
      generatedAt: '2025-01-20T00:00:00Z'
    }
  }
];

export const mockUser: User = {
  id: '1',
  email: 'user@example.com',
  name: 'John Doe',
  zipCode: '90210',
  district: 'CA-30',
  state: 'CA',
  preferences: {
    notifications: true,
    emailUpdates: true,
    smsUpdates: false,
    topicInterests: ['healthcare', 'education', 'environment']
  },
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-10T10:30:00Z'
};

// California representatives (90210, 90024, etc.)
export const mockCARepresentatives: Representative[] = [
  {
    id: 'rep-1',
    name: 'Alex Padilla',
    title: 'Senator',
    party: 'Democrat',
    state: 'CA',
    district: undefined,
    chamber: 'Senate',
    contactInfo: {
      email: 'senator@padilla.senate.gov',
      phone: '202-224-3553',
      website: 'https://padilla.senate.gov'
    },
    socialMedia: {
      twitter: '@SenAlexPadilla',
      facebook: 'SenatorAlexPadilla'
    },
    committees: [
      { id: 'c1', name: 'Environment and Public Works', role: 'Member' },
      { id: 'c2', name: 'Judiciary', role: 'Member' },
      { id: 'c3', name: 'Homeland Security', role: 'Member' }
    ],
    biography: undefined,
    termStart: '2021-01-20',
    termEnd: '2027-01-01',
    officeLocations: undefined,
    level: 'federal',
    jurisdiction: 'California',
    governmentType: 'federal',
    jurisdictionScope: 'statewide'
  },
  {
    id: 'rep-2',
    name: 'Laphonza Butler',
    title: 'Senator',
    party: 'Democrat',
    state: 'CA',
    district: undefined,
    chamber: 'Senate',
    contactInfo: {
      email: 'senator@butler.senate.gov',
      phone: '202-224-3841',
      website: 'https://butler.senate.gov'
    },
    socialMedia: {
      twitter: '@SenLaphonzaButler',
      facebook: 'SenatorButler'
    },
    committees: [],
    biography: undefined,
    termStart: '2023-10-03',
    termEnd: '2025-01-01',
    officeLocations: undefined,
    level: 'federal',
    jurisdiction: 'California',
    governmentType: 'federal',
    jurisdictionScope: 'statewide'
  },
  {
    id: 'rep-3',
    name: 'Brad Sherman',
    title: 'Representative',
    party: 'Democrat',
    state: 'CA',
    district: '32',
    chamber: 'House',
    contactInfo: {
      email: 'brad.sherman@mail.house.gov',
      phone: '202-225-5911',
      website: 'https://sherman.house.gov'
    },
    socialMedia: {
      twitter: '@BradSherman',
      facebook: 'CongressmanBradSherman'
    },
    committees: [],
    biography: undefined,
    termStart: '2023-01-03',
    termEnd: '2025-01-03',
    officeLocations: undefined,
    level: 'federal',
    jurisdiction: 'California',
    governmentType: 'federal',
    jurisdictionScope: 'district'
  }
];

// Texas representatives (75001, 77001, etc.)
export const mockTXRepresentatives: Representative[] = [
  {
    id: 'rep-tx-1',
    name: 'John Cornyn',
    title: 'Senator',
    party: 'Republican',
    state: 'TX',
    district: undefined,
    chamber: 'Senate',
    contactInfo: {
      email: 'senator@cornyn.senate.gov',
      phone: '202-224-2934',
      website: 'https://cornyn.senate.gov'
    },
    socialMedia: {
      twitter: '@JohnCornyn',
      facebook: 'SenatorJohnCornyn'
    },
    committees: [],
    biography: undefined,
    termStart: '2020-01-03',
    termEnd: '2027-01-03',
    officeLocations: undefined,
    level: 'federal',
    jurisdiction: 'Texas',
    governmentType: 'federal',
    jurisdictionScope: 'statewide'
  },
  {
    id: 'rep-tx-2',
    name: 'Ted Cruz',
    title: 'Senator',
    party: 'Republican',
    state: 'TX',
    district: undefined,
    chamber: 'Senate',
    contactInfo: {
      email: 'senator@cruz.senate.gov',
      phone: '202-224-5922',
      website: 'https://cruz.senate.gov'
    },
    socialMedia: {
      twitter: '@SenTedCruz',
      facebook: 'SenatorTedCruz'
    },
    committees: [],
    biography: undefined,
    termStart: '2024-01-03',
    termEnd: '2031-01-03',
    officeLocations: undefined,
    level: 'federal',
    jurisdiction: 'Texas',
    governmentType: 'federal',
    jurisdictionScope: 'statewide'
  }
];

// New York representatives (10001, 10002, etc.)
export const mockNYRepresentatives: Representative[] = [
  {
    id: 'rep-ny-1',
    name: 'Chuck Schumer',
    title: 'Senator',
    party: 'Democrat',
    state: 'NY',
    district: undefined,
    chamber: 'Senate',
    contactInfo: {
      email: 'senator@schumer.senate.gov',
      phone: '202-224-6542',
      website: 'https://schumer.senate.gov'
    },
    socialMedia: {
      twitter: '@SenSchumer',
      facebook: 'SenatorSchumer'
    },
    committees: [],
    biography: undefined,
    termStart: '2022-01-03',
    termEnd: '2029-01-03',
    officeLocations: undefined,
    level: 'federal',
    jurisdiction: 'New York',
    governmentType: 'federal',
    jurisdictionScope: 'statewide'
  },
  {
    id: 'rep-ny-2',
    name: 'Kirsten Gillibrand',
    title: 'Senator',
    party: 'Democrat',
    state: 'NY',
    district: undefined,
    chamber: 'Senate',
    contactInfo: {
      email: 'senator@gillibrand.senate.gov',
      phone: '202-224-4451',
      website: 'https://gillibrand.senate.gov'
    },
    socialMedia: {
      twitter: '@SenGillibrand',
      facebook: 'SenatorGillibrand'
    },
    committees: [],
    biography: undefined,
    termStart: '2024-01-03',
    termEnd: '2031-01-03',
    officeLocations: undefined,
    level: 'federal',
    jurisdiction: 'New York',
    governmentType: 'federal',
    jurisdictionScope: 'statewide'
  }
];

// Keep the original for backwards compatibility
export const mockRepresentatives: Representative[] = mockCARepresentatives;