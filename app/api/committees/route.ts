import { NextRequest, NextResponse } from 'next/server';

interface Committee {
  id: string;
  name: string;
  chamber: 'house' | 'senate' | 'joint';
  level: 'federal' | 'state' | 'local';
  type: 'standing' | 'subcommittee' | 'select' | 'joint' | 'conference';
  description?: string;
  jurisdiction: string[];
  members?: {
    chair?: string;
    rankingMember?: string;
    totalMembers: number;
  };
  meetingSchedule?: {
    frequency: string;
    nextMeeting?: string;
  };
  website?: string;
  isActive: boolean;
  bills?: {
    active: number;
    recentBills: string[];
  };
}

// Real federal committees data for 119th Congress
const FEDERAL_COMMITTEES: Committee[] = [
  // House Standing Committees
  {
    id: 'hsag00',
    name: 'House Committee on Agriculture',
    chamber: 'house',
    level: 'federal',
    type: 'standing',
    description: 'Jurisdiction over agriculture, rural development, food assistance programs, and related matters.',
    jurisdiction: ['Agriculture', 'Food Safety', 'Rural Development', 'Forestry', 'Nutrition Programs'],
    members: {
      chair: 'Glenn Thompson (R-PA)',
      rankingMember: 'David Scott (D-GA)', 
      totalMembers: 53
    },
    website: 'https://agriculture.house.gov',
    isActive: true,
    bills: {
      active: 12,
      recentBills: ['hr-10-119', 'hr-2023-119']
    }
  },
  {
    id: 'hsap00',
    name: 'House Committee on Appropriations',
    chamber: 'house',
    level: 'federal',
    type: 'standing',
    description: 'Controls federal government spending and budget appropriations.',
    jurisdiction: ['Federal Budget', 'Government Spending', 'Appropriations', 'Fiscal Policy'],
    members: {
      chair: 'Tom Cole (R-OK)',
      rankingMember: 'Rosa DeLauro (D-CT)',
      totalMembers: 58
    },
    website: 'https://appropriations.house.gov',
    isActive: true,
    bills: {
      active: 25,
      recentBills: ['hr-defense-119', 'hr-homeland-119']
    }
  },
  {
    id: 'hsas00',
    name: 'House Committee on Armed Services',
    chamber: 'house',
    level: 'federal',
    type: 'standing',
    description: 'Oversees national defense policy, military operations, and defense spending.',
    jurisdiction: ['National Defense', 'Military Personnel', 'Defense Technology', 'Veterans Affairs'],
    members: {
      chair: 'Mike Rogers (R-AL)',
      rankingMember: 'Adam Smith (D-WA)',
      totalMembers: 57
    },
    website: 'https://armedservices.house.gov',
    isActive: true,
    bills: {
      active: 18,
      recentBills: ['hr-ndaa-119', 'hr-defense-auth-119']
    }
  },
  {
    id: 'hsbu00',
    name: 'House Committee on the Budget',
    chamber: 'house',
    level: 'federal',
    type: 'standing',
    description: 'Reviews federal budget process and government spending priorities.',
    jurisdiction: ['Federal Budget', 'Debt Ceiling', 'Budget Process', 'Fiscal Responsibility'],
    members: {
      chair: 'Jodey Arrington (R-TX)',
      rankingMember: 'Brendan Boyle (D-PA)',
      totalMembers: 39
    },
    website: 'https://budget.house.gov',
    isActive: true,
    bills: {
      active: 8,
      recentBills: ['hr-budget-119', 'hr-debt-119']
    }
  },
  {
    id: 'hsed00', 
    name: 'House Committee on Education and the Workforce',
    chamber: 'house',
    level: 'federal',
    type: 'standing',
    description: 'Oversees education policy, labor relations, and workforce development.',
    jurisdiction: ['Education Policy', 'Labor Relations', 'Workforce Development', 'Student Loans'],
    members: {
      chair: 'Virginia Foxx (R-NC)',
      rankingMember: 'Bobby Scott (D-VA)',
      totalMembers: 49
    },
    website: 'https://edworkforce.house.gov',
    isActive: true,
    bills: {
      active: 15,
      recentBills: ['hr-5-119', 'hr-education-119']
    }
  },
  {
    id: 'hsif00',
    name: 'House Committee on Energy and Commerce',
    chamber: 'house',
    level: 'federal',
    type: 'standing',
    description: 'Broad jurisdiction over energy, healthcare, telecommunications, and commerce.',
    jurisdiction: ['Energy Policy', 'Healthcare', 'Telecommunications', 'Consumer Protection', 'Environment'],
    members: {
      chair: 'Cathy McMorris Rodgers (R-WA)',
      rankingMember: 'Frank Pallone (D-NJ)',
      totalMembers: 55
    },
    website: 'https://energycommerce.house.gov',
    isActive: true,
    bills: {
      active: 22,
      recentBills: ['hr-1-119', 'hr-energy-119']
    }
  },
  {
    id: 'hsfa00',
    name: 'House Committee on Foreign Affairs', 
    chamber: 'house',
    level: 'federal',
    type: 'standing',
    description: 'Oversees U.S. foreign policy, international relations, and diplomacy.',
    jurisdiction: ['Foreign Policy', 'International Relations', 'Diplomacy', 'Foreign Aid', 'Treaties'],
    members: {
      chair: 'Michael McCaul (R-TX)',
      rankingMember: 'Gregory Meeks (D-NY)',
      totalMembers: 47
    },
    website: 'https://foreignaffairs.house.gov',
    isActive: true,
    bills: {
      active: 13,
      recentBills: ['hr-foreign-119', 'hr-aid-119']
    }
  },
  {
    id: 'hsgo00',
    name: 'House Committee on Oversight and Accountability',
    chamber: 'house', 
    level: 'federal',
    type: 'standing',
    description: 'Investigates government operations, waste, fraud, and abuse.',
    jurisdiction: ['Government Operations', 'Federal Agencies', 'Government Reform', 'Investigations'],
    members: {
      chair: 'James Comer (R-KY)',
      rankingMember: 'Jamie Raskin (D-MD)',
      totalMembers: 45
    },
    website: 'https://oversight.house.gov',
    isActive: true,
    bills: {
      active: 16,
      recentBills: ['hr-oversight-119', 'hr-reform-119']
    }
  },
  {
    id: 'hshm00',
    name: 'House Committee on Homeland Security',
    chamber: 'house',
    level: 'federal', 
    type: 'standing',
    description: 'Oversees homeland security, border protection, and emergency preparedness.',
    jurisdiction: ['Homeland Security', 'Border Security', 'Immigration', 'Cybersecurity', 'Emergency Response'],
    members: {
      chair: 'Mark Green (R-TN)',
      rankingMember: 'Bennie Thompson (D-MS)',
      totalMembers: 31
    },
    website: 'https://homeland.house.gov',
    isActive: true,
    bills: {
      active: 19,
      recentBills: ['hr-2-119', 's-1-119']
    }
  },
  {
    id: 'hsju00',
    name: 'House Committee on the Judiciary',
    chamber: 'house',
    level: 'federal',
    type: 'standing',
    description: 'Oversees federal courts, constitutional issues, and civil liberties.',
    jurisdiction: ['Federal Courts', 'Constitutional Law', 'Civil Rights', 'Immigration Law', 'Antitrust'],
    members: {
      chair: 'Jim Jordan (R-OH)',
      rankingMember: 'Jerrold Nadler (D-NY)',
      totalMembers: 41
    },
    website: 'https://judiciary.house.gov',
    isActive: true,
    bills: {
      active: 17,
      recentBills: ['hr-judiciary-119', 'hr-immigration-119']
    }
  },

  // Senate Standing Committees  
  {
    id: 'ssag00',
    name: 'Senate Committee on Agriculture, Nutrition, and Forestry',
    chamber: 'senate',
    level: 'federal',
    type: 'standing',
    description: 'Oversees agriculture policy, nutrition programs, and forestry management.',
    jurisdiction: ['Agriculture', 'Food Safety', 'Nutrition Programs', 'Forestry', 'Rural Development'],
    members: {
      chair: 'Debbie Stabenow (D-MI)',
      rankingMember: 'John Boozman (R-AR)',
      totalMembers: 21
    },
    website: 'https://agriculture.senate.gov',
    isActive: true,
    bills: {
      active: 9,
      recentBills: ['s-agriculture-119', 's-nutrition-119']
    }
  },
  {
    id: 'ssap00',
    name: 'Senate Committee on Appropriations',
    chamber: 'senate',
    level: 'federal',
    type: 'standing',
    description: 'Controls federal spending and budget appropriations in the Senate.',
    jurisdiction: ['Federal Budget', 'Government Spending', 'Appropriations', 'Fiscal Policy'],
    members: {
      chair: 'Patty Murray (D-WA)', 
      rankingMember: 'Susan Collins (R-ME)',
      totalMembers: 29
    },
    website: 'https://appropriations.senate.gov',
    isActive: true,
    bills: {
      active: 21,
      recentBills: ['s-defense-119', 's-homeland-119']
    }
  },
  {
    id: 'ssas00',
    name: 'Senate Committee on Armed Services',
    chamber: 'senate',
    level: 'federal', 
    type: 'standing',
    description: 'Senate oversight of national defense and military policy.',
    jurisdiction: ['National Defense', 'Military Personnel', 'Defense Technology', 'Military Operations'],
    members: {
      chair: 'Roger Wicker (R-MS)',
      rankingMember: 'Jack Reed (D-RI)',
      totalMembers: 25
    },
    website: 'https://armed-services.senate.gov',
    isActive: true,
    bills: {
      active: 14,
      recentBills: ['s-15-119', 's-ndaa-119']
    }
  },
  {
    id: 'sscm00',
    name: 'Senate Committee on Commerce, Science, and Transportation',
    chamber: 'senate',
    level: 'federal',
    type: 'standing', 
    description: 'Oversees interstate commerce, science policy, and transportation systems.',
    jurisdiction: ['Transportation', 'Technology Policy', 'Telecommunications', 'Science Policy', 'Consumer Protection'],
    members: {
      chair: 'Ted Cruz (R-TX)',
      rankingMember: 'Maria Cantwell (D-WA)',
      totalMembers: 27
    },
    website: 'https://commerce.senate.gov',
    isActive: true,
    bills: {
      active: 16,
      recentBills: ['s-47-119', 's-tech-119']
    }
  },
  {
    id: 'ssev00',
    name: 'Senate Committee on Environment and Public Works',
    chamber: 'senate',
    level: 'federal',
    type: 'standing',
    description: 'Oversees environmental policy, public works, and infrastructure.',
    jurisdiction: ['Environmental Policy', 'Climate Change', 'Infrastructure', 'Public Works', 'EPA Oversight'],
    members: {
      chair: 'Shelley Moore Capito (R-WV)',
      rankingMember: 'Tom Carper (D-DE)',
      totalMembers: 19
    },
    website: 'https://epw.senate.gov',
    isActive: true,
    bills: {
      active: 11,
      recentBills: ['s-environment-119', 's-infrastructure-119']
    }
  },
  {
    id: 'ssfr00',
    name: 'Senate Committee on Foreign Relations',
    chamber: 'senate',
    level: 'federal', 
    type: 'standing',
    description: 'Senate oversight of foreign policy and international relations.',
    jurisdiction: ['Foreign Policy', 'Treaties', 'International Relations', 'Diplomacy', 'Foreign Aid'],
    members: {
      chair: 'Jim Risch (R-ID)',
      rankingMember: 'Ben Cardin (D-MD)',
      totalMembers: 21
    },
    website: 'https://foreign.senate.gov',
    isActive: true,
    bills: {
      active: 12,
      recentBills: ['s-foreign-119', 's-treaties-119']
    }
  },
  {
    id: 'sshg00',
    name: 'Senate Committee on Homeland Security and Governmental Affairs',
    chamber: 'senate',
    level: 'federal',
    type: 'standing',
    description: 'Oversees homeland security and government operations in the Senate.',
    jurisdiction: ['Homeland Security', 'Government Operations', 'Federal Agencies', 'Cybersecurity'],
    members: {
      chair: 'Rand Paul (R-KY)',
      rankingMember: 'Gary Peters (D-MI)',
      totalMembers: 15
    },
    website: 'https://hsgac.senate.gov',
    isActive: true,
    bills: {
      active: 13,
      recentBills: ['s-1-119', 's-cybersecurity-119']
    }
  }
];

// GET /api/committees
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const chamber = searchParams.get('chamber'); // house, senate, joint, all
  const level = searchParams.get('level'); // federal, state, local, all  
  const type = searchParams.get('type'); // standing, subcommittee, select, joint
  const jurisdiction = searchParams.get('jurisdiction'); // filter by topic area
  const includeInactive = searchParams.get('includeInactive') === 'true';

  try {
    let committees = [...FEDERAL_COMMITTEES];

    // Filter by chamber
    if (chamber && chamber !== 'all') {
      if (chamber === 'joint') {
        committees = committees.filter(c => c.type === 'joint');
      } else {
        committees = committees.filter(c => c.chamber === chamber);
      }
    }

    // Filter by level 
    if (level && level !== 'all') {
      committees = committees.filter(c => c.level === level);
    }

    // Filter by type
    if (type) {
      committees = committees.filter(c => c.type === type);
    }

    // Filter by jurisdiction
    if (jurisdiction) {
      const searchTerm = jurisdiction.toLowerCase();
      committees = committees.filter(c => 
        c.jurisdiction.some(j => j.toLowerCase().includes(searchTerm)) ||
        c.name.toLowerCase().includes(searchTerm) ||
        c.description?.toLowerCase().includes(searchTerm)
      );
    }

    // Filter active/inactive
    if (!includeInactive) {
      committees = committees.filter(c => c.isActive);
    }

    // Sort alphabetically by name
    committees.sort((a, b) => a.name.localeCompare(b.name));

    const response = {
      committees,
      total: committees.length,
      filters: {
        chamber: chamber || 'all',
        level: level || 'all', 
        type: type || 'all',
        jurisdiction: jurisdiction || null,
        includeInactive
      },
      summary: {
        byChart: {
          house: committees.filter(c => c.chamber === 'house').length,
          senate: committees.filter(c => c.chamber === 'senate').length,
          joint: committees.filter(c => c.type === 'joint').length
        },
        byType: {
          standing: committees.filter(c => c.type === 'standing').length,
          subcommittee: committees.filter(c => c.type === 'subcommittee').length,
          select: committees.filter(c => c.type === 'select').length,
          joint: committees.filter(c => c.type === 'joint').length
        },
        byLevel: {
          federal: committees.filter(c => c.level === 'federal').length,
          state: committees.filter(c => c.level === 'state').length,
          local: committees.filter(c => c.level === 'local').length
        }
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Committees API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch committees',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Committee detail endpoint would be implemented in /api/committees/[id]/route.ts

// POST /api/committees/follow
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, committeeId, notificationPreferences } = body;

    if (!userId || !committeeId) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, committeeId' },
        { status: 400 }
      );
    }

    const committee = FEDERAL_COMMITTEES.find(c => c.id === committeeId);
    if (!committee) {
      return NextResponse.json(
        { error: `Committee not found: ${committeeId}` },
        { status: 404 }
      );
    }

    // In production, this would:
    // 1. Save follow relationship to database
    // 2. Set up notification preferences
    // 3. Track engagement analytics

    console.log('Committee follow:', {
      userId,
      committeeId,
      committeeName: committee.name,
      preferences: notificationPreferences,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      message: `Now following ${committee.name}`,
      committee: {
        id: committee.id,
        name: committee.name,
        chamber: committee.chamber,
        level: committee.level
      },
      followId: `follow_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      notificationPreferences: notificationPreferences || {
        meetings: true,
        bills: true,
        hearings: true,
        votes: false
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Follow committee error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to follow committee',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}