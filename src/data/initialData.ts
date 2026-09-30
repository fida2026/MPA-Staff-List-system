import { StaffRecord, AuditLogEntry, AttachedPdfDocument, StationName, StaffCategory } from '../types/compliance';

export const STATION_PREFIX_MAP: Record<StationName, string> = {
  'Hot FM': 'SSB',
  'Fly FM': 'MAX',
  'Eight Wuxian': 'OFM',
  'Kool FM': 'KFM',
  'Molek FM': 'MFM',
  'Legal & Corp': 'CON',
};

export const STATION_GATEWAYS: Record<string, string> = {
  'Hot FM': 'hod.hotfm@mediaprima.com.my',
  'Fly FM': 'hod.flyfm@mediaprima.com.my',
  'Eight Wuxian': 'hod.eight@mediaprima.com.my',
  'Kool FM': 'hod.kool@mediaprima.com.my',
  'Molek FM': 'hod.molek@mediaprima.com.my',
  'Legal & Corp': 'ceo.office@mediaprima.com.my',
};

export function calculateTenure(joinDateStr?: string): string {
  if (!joinDateStr) return '0.0 yrs';
  const join = new Date(joinDateStr);
  const now = new Date();
  const diffMs = now.getTime() - join.getTime();
  if (diffMs <= 0) return '0.0 yrs';
  const years = (diffMs / (1000 * 60 * 60 * 24 * 365.25)).toFixed(1);
  return `${years} yrs`;
}

export function computeStatus(record: StaffRecord): {
  label: 'Active' | 'Pending Renewal' | 'Expired';
  colorClasses: string;
  dotColor: string;
  isExpired: boolean;
  isPending: boolean;
  daysRemaining?: number;
  overdueDays?: number;
} {
  if (record.category === 'HR Permanent' || !record.expiryDate) {
    return {
      label: 'Active',
      colorClasses: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      dotColor: 'bg-emerald-600',
      isExpired: false,
      isPending: false,
    };
  }

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const expiry = new Date(record.expiryDate);
  expiry.setHours(0, 0, 0, 0);

  const diffMs = expiry.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      label: 'Expired',
      colorClasses: 'bg-rose-50 text-rose-800 border-rose-200',
      dotColor: 'bg-rose-600',
      isExpired: true,
      isPending: false,
      overdueDays: Math.abs(diffDays),
    };
  }

  // Legal Contract: <= 14 days
  if (record.category === 'Legal Contract' && diffDays <= 14) {
    return {
      label: 'Pending Renewal',
      colorClasses: 'bg-amber-50 text-amber-800 border-amber-200',
      dotColor: 'bg-amber-500',
      isExpired: false,
      isPending: true,
      daysRemaining: diffDays,
    };
  }

  // HR Contract: <= 30 days
  if (record.category === 'HR Contract' && diffDays <= 30) {
    return {
      label: 'Pending Renewal',
      colorClasses: 'bg-amber-50 text-amber-800 border-amber-200',
      dotColor: 'bg-amber-500',
      isExpired: false,
      isPending: true,
      daysRemaining: diffDays,
    };
  }

  return {
    label: 'Active',
    colorClasses: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    dotColor: 'bg-emerald-600',
    isExpired: false,
    isPending: false,
    daysRemaining: diffDays,
  };
}

export function generatePseudoSha256(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  const part2 = Math.abs((hash * 31) | 0).toString(16).padStart(8, 'a');
  return `${hex}${part2.slice(0, 4)}...${hex.slice(2, 6)}${part2.slice(4, 6)}`;
}

export function generateNextStaffNumber(
  category: StaffCategory,
  station: StationName,
  existingList: StaffRecord[]
): string {
  let prefix = 'SSB';
  if (category === 'Legal Contract') {
    prefix = 'CON';
  } else {
    prefix = STATION_PREFIX_MAP[station] || 'SSB';
  }

  const existingNums = existingList
    .map(r => r.staffNo)
    .filter(n => n.startsWith(prefix));

  let rand = Math.floor(1000 + Math.random() * 9000);
  let candidate = `${prefix}-${rand}${category === 'HR Contract' ? 'C' : ''}`;
  let attempts = 0;

  while (existingNums.includes(candidate) && attempts < 20) {
    rand = Math.floor(1000 + Math.random() * 9000);
    candidate = `${prefix}-${rand}${category === 'HR Contract' ? 'C' : ''}`;
    attempts++;
  }

  return candidate;
}

export function getOffsetDateString(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().split('T')[0];
}

// Initial 14 comprehensive staff records representing all stations & contract types
export const INITIAL_STAFF_RECORDS: StaffRecord[] = [
  {
    id: 'REC-001',
    staffNo: 'CON-3019',
    name: "Dato' Bryan Wong Seng",
    ic: '781105-08-5433',
    station: 'Eight Wuxian',
    department: 'CEO Office',
    designation: 'Senior Legal & Strategic Advisor',
    category: 'Legal Contract',
    joinDate: '2024-01-10',
    contractStartDate: '2024-05-10',
    expiryDate: getOffsetDateString(10), // 10 days remaining (Legal <= 14d -> Urgent)
    hodEmail: 'hod.ceoffice@company.com',
    hrDeptEmail: 'admin.hr@company.com',
    adminEmail: 'admin.hr@company.com',
    pdfAttached: true,
    pdfFileName: 'Contract_Agreement_BryanWong.pdf',
    pdfSizeMB: 1.8,
    pdfType: 'Legal Agreement',
    operationalStatus: 'Retainer Active',
    notes: 'Urgent Legal Review required'
  },
  {
    id: 'REC-002',
    staffNo: 'CON-7104',
    name: 'Jessica Rachel Gomez',
    ic: '900404-14-6014',
    station: 'Hot FM',
    department: 'Marketing & Integration',
    designation: 'Commercial Legal Consultant',
    category: 'Legal Contract',
    joinDate: '2024-11-01',
    contractStartDate: '2024-11-01',
    expiryDate: getOffsetDateString(12), // 12 days remaining (Legal <= 14d)
    hodEmail: 'hod.marketing@company.com',
    hrDeptEmail: 'admin.hr@company.com',
    adminEmail: 'admin.hr@company.com',
    pdfAttached: true,
    pdfFileName: 'Contract_Agreement_JessicaGomez.pdf',
    pdfSizeMB: 1.6,
    pdfType: 'Legal Agreement',
    operationalStatus: 'Legal Active',
    notes: 'Pending Legal Contract Renewal'
  },
  {
    id: 'REC-003',
    staffNo: 'MAX-2041C',
    name: 'Samantha Tan Shu Ting',
    ic: '940822-14-6102',
    station: 'Fly FM',
    department: 'Marketing & Integration',
    designation: 'Lead Brand & Integration Specialist',
    category: 'HR Contract',
    joinDate: '2023-08-01',
    expiryDate: getOffsetDateString(22), // 22 days remaining (HR <= 30d)
    hodEmail: 'hod.mktg@company.com',
    hrDeptEmail: 'hr.dept@company.com',
    adminEmail: 'admin.hr@company.com',
    pdfAttached: true,
    pdfFileName: 'MRF_SamanthaTan_FlyFM.pdf',
    pdfSizeMB: 0.89,
    pdfType: 'MRF',
    operationalStatus: 'Onboarded',
    notes: 'HOD Appraisal Queued'
  },
  {
    id: 'REC-004',
    staffNo: 'MFM-5539C',
    name: 'Khairul Azwan bin Othman',
    ic: '970912-03-5127',
    station: 'Molek FM',
    department: 'Operation',
    designation: 'Senior Broadcast Operations Coordinator',
    category: 'HR Contract',
    joinDate: '2023-09-01',
    expiryDate: getOffsetDateString(28), // 28 days remaining (HR <= 30d)
    hodEmail: 'hod.operations@company.com',
    hrDeptEmail: 'hr.dept@company.com',
    adminEmail: 'admin.hr@company.com',
    pdfAttached: true,
    pdfFileName: 'MRF_MolekFM_Khairul.pdf',
    pdfSizeMB: 1.1,
    pdfType: 'MRF',
    operationalStatus: 'Active Broadcast Unit',
    notes: 'Regional studio seasonal appraisal'
  },
  {
    id: 'REC-005',
    staffNo: 'CON-6022',
    name: 'Melissa Ann Fernandez',
    ic: '931215-14-6330',
    station: 'Fly FM',
    department: 'Tech & Shared Services',
    designation: 'Broadcast Engineering Counsel',
    category: 'Legal Contract',
    joinDate: '2024-04-12',
    contractStartDate: '2024-04-12',
    expiryDate: getOffsetDateString(-4), // Overdue 4 days (Expired -> Email Suppressed)
    hodEmail: 'hod.tech@company.com',
    hrDeptEmail: 'admin.hr@company.com',
    adminEmail: 'admin.hr@company.com',
    pdfAttached: true,
    pdfFileName: 'Contract_Agreement_MelissaFernandez.pdf',
    pdfSizeMB: 1.7,
    pdfType: 'Legal Agreement',
    operationalStatus: 'Expired - Action Blocked',
    notes: 'Email dispatch suppressed per PRD v2.5'
  },
  {
    id: 'REC-006',
    staffNo: 'KFM-4091C',
    name: 'Mohd Hafizuddin bin Razak',
    ic: '910619-01-5749',
    station: 'Kool FM',
    department: 'Operation',
    designation: 'Senior Audio Producer',
    category: 'HR Contract',
    joinDate: '2022-06-15',
    expiryDate: getOffsetDateString(-15), // Overdue 15 days (Expired -> Blocked)
    hodEmail: 'hod.kool@mediaprima.com.my',
    hrDeptEmail: 'hr.dept@company.com',
    adminEmail: 'admin.hr@company.com',
    pdfAttached: true,
    pdfFileName: 'MRF_KoolFM_Hafizuddin.pdf',
    pdfSizeMB: 1.5,
    pdfType: 'MRF',
    operationalStatus: 'Expired',
    notes: 'Grace period passed. Blocked.'
  },
  {
    id: 'REC-007',
    staffNo: 'SSB-1042',
    name: 'Ahmad Khairul bin Idris',
    ic: '880412-14-5541',
    station: 'Hot FM',
    department: 'Content',
    designation: 'Principal Morning On-Air Host',
    category: 'HR Permanent',
    joinDate: '2019-01-15',
    expiryDate: '',
    hodEmail: 'hod.hotfm@mediaprima.com.my',
    hrDeptEmail: 'hr.dept@company.com',
    adminEmail: 'admin.hr@company.com',
    pdfAttached: true,
    pdfFileName: 'MRF_Ahmad_HotFM.pdf',
    pdfSizeMB: 1.2,
    pdfType: 'MRF',
    operationalStatus: 'Active On-Air',
    notes: 'MRF • Signed PDF'
  },
  {
    id: 'REC-008',
    staffNo: 'SSB-2019',
    name: 'Nurul Farahana binti Kassim',
    ic: '920803-10-6192',
    station: 'Hot FM',
    department: 'Marketing & Integration',
    designation: 'Marketing Director',
    category: 'HR Permanent',
    joinDate: '2021-09-01',
    expiryDate: '',
    hodEmail: 'hod.hotfm@mediaprima.com.my',
    hrDeptEmail: 'hr.dept@company.com',
    adminEmail: 'admin.hr@company.com',
    pdfAttached: true,
    pdfFileName: 'Contract_Vault_Farahana.pdf',
    pdfSizeMB: 1.3,
    pdfType: 'Staff Document',
    operationalStatus: 'Verified Staff',
    notes: 'Verified Vault'
  },
  {
    id: 'REC-009',
    staffNo: 'CON-3088C',
    name: 'David Tan Wei Lun',
    ic: '951120-14-5877',
    station: 'Hot FM',
    department: 'CEO Office',
    designation: 'Legal Special Projects Officer',
    category: 'Legal Contract',
    joinDate: '2023-12-01',
    contractStartDate: '2023-12-01',
    expiryDate: getOffsetDateString(8), // 8 days left (Legal <= 14d)
    hodEmail: 'ceo.office@mediaprima.com.my',
    hrDeptEmail: 'admin.hr@company.com',
    adminEmail: 'admin.hr@company.com',
    pdfAttached: true,
    pdfFileName: 'CON_DavidTan_Agreement.pdf',
    pdfSizeMB: 1.45,
    pdfType: 'Legal Agreement',
    operationalStatus: 'Retainer Active',
    notes: 'Cross-assignment to CEO Office'
  },
  {
    id: 'REC-010',
    staffNo: 'SSB-1082',
    name: 'Ahmad Fikri bin Mansor',
    ic: '890314-10-5231',
    station: 'Hot FM',
    department: 'Content',
    designation: 'Executive Producer',
    category: 'HR Permanent',
    joinDate: '2019-03-15',
    expiryDate: '',
    hodEmail: 'hod.hotfm@mediaprima.com.my',
    hrDeptEmail: 'hr.dept@company.com',
    adminEmail: 'admin.hr@company.com',
    pdfAttached: true,
    pdfFileName: 'MRF_Ahmad_Fikri.pdf',
    pdfSizeMB: 1.2,
    pdfType: 'MRF',
    operationalStatus: 'Active On-Air',
    notes: 'Verified permanent staff'
  },
  {
    id: 'REC-011',
    staffNo: 'MFM-5012',
    name: 'Nurul Aisyah binti Zakaria',
    ic: '960228-03-5918',
    station: 'Molek FM',
    department: 'Content',
    designation: 'East Coast Music Programmer',
    category: 'HR Permanent',
    joinDate: '2021-02-01',
    expiryDate: '',
    hodEmail: 'hod.molek@mediaprima.com.my',
    hrDeptEmail: 'hr.dept@company.com',
    adminEmail: 'admin.hr@company.com',
    pdfAttached: true,
    pdfFileName: 'MRF_NurulAisyah.pdf',
    pdfSizeMB: 1.1,
    pdfType: 'MRF',
    operationalStatus: 'Verified Staff',
    notes: 'Molek regional headquarters'
  },
  {
    id: 'REC-012',
    staffNo: 'SSB-1144',
    name: 'Zulkifli bin Hashim',
    ic: '850704-10-5011',
    station: 'Hot FM',
    department: 'Finance',
    designation: 'Commercial Billing Accountant',
    category: 'HR Permanent',
    joinDate: '2018-07-20',
    expiryDate: '',
    hodEmail: 'hod.hotfm@mediaprima.com.my',
    hrDeptEmail: 'hr.dept@company.com',
    adminEmail: 'admin.hr@company.com',
    pdfAttached: false,
    pdfFileName: '',
    pdfSizeMB: 0,
    operationalStatus: 'Verified Staff',
    notes: 'Central finance team'
  },
  {
    id: 'REC-013',
    staffNo: 'OFM-2210C',
    name: 'Chong Wei Lun',
    ic: '951010-07-5581',
    station: 'Eight Wuxian',
    department: 'Content',
    designation: 'Prime Drive Announcer',
    category: 'HR Contract',
    joinDate: '2023-10-15',
    expiryDate: getOffsetDateString(85), // 85 days left (Active)
    hodEmail: 'hod.eight@mediaprima.com.my',
    hrDeptEmail: 'hr.dept@company.com',
    adminEmail: 'admin.hr@company.com',
    pdfAttached: true,
    pdfFileName: 'MRF_Chong_Wei_Lun.pdf',
    pdfSizeMB: 1.4,
    pdfType: 'MRF',
    operationalStatus: 'Active On-Air',
    notes: 'Talent covenant active'
  },
  {
    id: 'REC-014',
    staffNo: 'MAX-2980',
    name: 'Brandon Lee Ming Hao',
    ic: '881225-10-5309',
    station: 'Fly FM',
    department: 'CEO Office',
    designation: 'Strategic Projects Manager',
    category: 'HR Permanent',
    joinDate: '2017-12-01',
    expiryDate: '',
    hodEmail: 'ceo.office@mediaprima.com.my',
    hrDeptEmail: 'hr.dept@company.com',
    adminEmail: 'admin.hr@company.com',
    pdfAttached: true,
    pdfFileName: 'MRF_Brandon_Lee.pdf',
    pdfSizeMB: 1.1,
    pdfType: 'MRF',
    operationalStatus: 'Verified Staff',
    notes: 'Executive operations'
  }
];

export const INITIAL_ATTACHED_PDFS: AttachedPdfDocument[] = [
  {
    id: 'PDF-01',
    fileName: 'MRF_Ahmad_HotFM.pdf',
    staffId: 'SSB-1082',
    staffName: 'Ahmad Farhan',
    station: 'Hot FM',
    sizeMB: 1.2,
    uploadedDate: '24 Oct 2024',
    checksum: 'e5a14c7d8b9f012a...',
    category: 'HR Contract',
  },
  {
    id: 'PDF-02',
    fileName: 'Contract_Agreement_BryanWong.pdf',
    staffId: 'CON-3019',
    staffName: "Dato' Bryan Wong Seng",
    station: 'Eight Wuxian',
    sizeMB: 1.8,
    uploadedDate: '22 Oct 2024',
    checksum: '9f4d11ca76b2089c...',
    category: 'Legal Contract',
  },
  {
    id: 'PDF-03',
    fileName: 'MRF_SamanthaTan_FlyFM.pdf',
    staffId: 'MAX-2041C',
    staffName: 'Samantha Tan',
    station: 'Fly FM',
    sizeMB: 0.89,
    uploadedDate: '19 Oct 2024',
    checksum: 'b812fcc024e8913d...',
    category: 'HR Contract',
  },
  {
    id: 'PDF-04',
    fileName: 'MRF_KoolFM_Hafizuddin.pdf',
    staffId: 'KFM-4091C',
    staffName: 'Hafizuddin Alwi',
    station: 'Kool FM',
    sizeMB: 1.5,
    uploadedDate: '18 Oct 2024',
    checksum: '4c7310dfa902b9e1...',
    category: 'HR Contract',
  },
  {
    id: 'PDF-05',
    fileName: 'MRF_MolekFM_Khairul.pdf',
    staffId: 'MFM-5539C',
    staffName: 'Khairul Azman',
    station: 'Molek FM',
    sizeMB: 1.1,
    uploadedDate: '15 Oct 2024',
    checksum: '679124beafc01198...',
    category: 'HR Contract',
  },
  {
    id: 'PDF-06',
    fileName: 'Contract_Agreement_JessicaGomez.pdf',
    staffId: 'CON-7104',
    staffName: 'Jessica Gomez',
    station: 'Hot FM',
    sizeMB: 1.6,
    uploadedDate: '11 Oct 2024',
    checksum: '1a82f3c09971bcda...',
    category: 'Legal Contract',
  }
];

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'LOG-001',
    timestamp: '2026-09-29 16:42:19',
    actionType: 'PDF Attached',
    operator: 'Single-User Admin',
    targetRecordCode: 'SSB-1082',
    targetRecordName: 'Ahmad Farhan',
    changeSummary: 'Attached signed MRF document: MRF_Ahmad_HotFM.pdf (1.2 MB)',
    integrityHash: '9b8c04e289a1f734',
    category: 'pdf',
  },
  {
    id: 'LOG-002',
    timestamp: '2026-09-29 14:15:02',
    actionType: 'Contract Updated',
    operator: 'Single-User Admin',
    targetRecordCode: 'CON-3019',
    targetRecordName: "Dato' Bryan Wong Seng",
    changeSummary: 'Renewed term to 2026-10-10; legal compensation bracket adjusted',
    integrityHash: '3f2187dacc108b55',
    category: 'mutation',
  },
  {
    id: 'LOG-003',
    timestamp: '2026-09-28 09:30:11',
    actionType: 'Mailto Triggered',
    operator: 'Single-User Admin',
    targetRecordCode: 'MAX-2041C',
    targetRecordName: 'Samantha Tan',
    changeSummary: '30-day renewal directive dispatch email generated via local protocol client',
    integrityHash: '8109dcb455a29f8c',
    category: 'renewal',
  },
  {
    id: 'LOG-004',
    timestamp: '2026-09-27 17:05:44',
    actionType: 'CSV Exported',
    operator: 'Single-User Admin',
    targetRecordCode: 'SYS-GLOBAL',
    targetRecordName: 'Full Registry',
    changeSummary: 'Full staff directory backup generated (48 records, format ISO-8859-1)',
    integrityHash: '54f199b0309b6a12',
    category: 'system',
  },
  {
    id: 'LOG-005',
    timestamp: '2026-09-26 11:20:00',
    actionType: 'Staff Created',
    operator: 'Single-User Admin',
    targetRecordCode: 'KFM-4091C',
    targetRecordName: 'Hafizuddin Alwi',
    changeSummary: 'Added new broadcast staff to Kool FM roster; role: Senior Audio Producer',
    integrityHash: '6a9921ef8712cd98',
    category: 'mutation',
  },
  {
    id: 'LOG-006',
    timestamp: '2026-09-25 15:45:10',
    actionType: 'PDF Attached',
    operator: 'Single-User Admin',
    targetRecordCode: 'MFM-5539C',
    targetRecordName: 'Khairul Azman',
    changeSummary: 'Attached signed MRF document: MRF_MolekFM_Khairul.pdf (1.1 MB)',
    integrityHash: 'd890a76255b412e0',
    category: 'pdf',
  },
  {
    id: 'LOG-007',
    timestamp: '2026-09-24 10:12:05',
    actionType: 'Staff Deleted',
    operator: 'Single-User Admin',
    targetRecordCode: 'ARC-9011',
    targetRecordName: 'Lee Wei Shen',
    changeSummary: 'Record archived following contract resignation, metadata preserved in vault',
    integrityHash: '11f8b4cd77002e43',
    category: 'mutation',
  },
];
