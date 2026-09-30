export type StationName = 
  | 'Hot FM' 
  | 'Fly FM' 
  | 'Eight Wuxian' 
  | 'Kool FM' 
  | 'Molek FM' 
  | 'Legal & Corp';

export type StationPrefix = 'SSB' | 'MAX' | 'OFM' | 'KFM' | 'MFM' | 'CON';

export type StaffCategory = 'HR Permanent' | 'HR Contract' | 'Legal Contract';

export type DepartmentName = 
  | 'CEO Office'
  | 'Content'
  | 'Finance'
  | 'Group Human Resources'
  | 'Marketing & Integration'
  | 'Operation'
  | 'Tech & Shared Services';

export interface StaffRecord {
  id: string;
  staffNo: string;
  name: string;
  ic: string;
  station: StationName;
  department: DepartmentName;
  designation: string;
  category: StaffCategory;
  joinDate: string; // YYYY-MM-DD
  expiryDate?: string; // YYYY-MM-DD
  contractStartDate?: string; // for Legal Contracts
  hodEmail: string;
  hrDeptEmail?: string;
  adminEmail?: string;
  pdfAttached: boolean;
  pdfFileName?: string;
  pdfSizeMB?: number;
  pdfType?: 'MRF' | 'Legal Agreement' | 'Staff Document';
  operationalStatus?: string;
  notes?: string;
}

export type ComplianceUrgency = 'Legal (<= 14d)' | 'HR (<= 30d)' | 'Expired' | 'Active';

export interface AuditLogEntry {
  id: string;
  timestamp: string; // YYYY-MM-DD HH:mm:ss
  actionType: 'PDF Attached' | 'Contract Updated' | 'Mailto Triggered' | 'CSV Exported' | 'Staff Created' | 'Staff Deleted' | 'Checksum Verified';
  operator: string;
  targetRecordCode: string; // e.g. SSB-1082
  targetRecordName: string;
  changeSummary: string;
  integrityHash: string; // SHA-256
  category: 'pdf' | 'mutation' | 'renewal' | 'system';
}

export interface AttachedPdfDocument {
  id: string;
  fileName: string;
  staffId: string;
  staffName: string;
  station: StationName;
  sizeMB: number;
  uploadedDate: string;
  checksum: string;
  category: StaffCategory;
}
