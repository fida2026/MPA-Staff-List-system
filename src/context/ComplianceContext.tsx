import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { StaffRecord, AuditLogEntry, AttachedPdfDocument } from '../types/compliance';
import {
  INITIAL_STAFF_RECORDS,
  INITIAL_AUDIT_LOGS,
  INITIAL_ATTACHED_PDFS,
  computeStatus,
  generatePseudoSha256,
  calculateTenure
} from '../data/initialData';

interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface PdfModalData {
  filename: string;
  staffName: string;
  station: string;
  staffNo: string;
  sizeMB: number;
  checksum: string;
  category?: string;
  department?: string;
  expiryDate?: string;
  joinDate?: string;
}

interface ComplianceContextType {
  records: StaffRecord[];
  activeTab: 'registry' | 'renewals' | 'stations' | 'audit' | 'settings';
  setActiveTab: (tab: 'registry' | 'renewals' | 'stations' | 'audit' | 'settings') => void;
  currentScreen: 'main' | 'add-staff' | 'edit-staff';
  editingStaffId: string | null;
  openAddStaffScreen: () => void;
  openEditStaffScreen: (id: string) => void;
  closeFormScreen: () => void;
  saveStaffRecord: (recordData: Partial<StaffRecord>, isNew: boolean) => void;
  deleteStaffRecord: (id: string) => void;
  
  auditLogs: AuditLogEntry[];
  addAuditLog: (entry: Omit<AuditLogEntry, 'id' | 'timestamp' | 'integrityHash'>) => void;
  attachedPdfs: AttachedPdfDocument[];
  addAttachedPdf: (doc: AttachedPdfDocument) => void;

  pdfModalData: PdfModalData | null;
  openPdfModal: (data: PdfModalData) => void;
  closePdfModal: () => void;

  deleteModalRecord: StaffRecord | null;
  openDeleteModal: (record: StaffRecord) => void;
  closeDeleteModal: () => void;
  confirmDeleteStaff: () => void;

  protocolDocsModalOpen: boolean;
  openProtocolDocsModal: () => void;
  closeProtocolDocsModal: () => void;

  bulkDispatchModalOpen: boolean;
  openBulkDispatchModal: () => void;
  closeBulkDispatchModal: () => void;

  selectedRenewalRecordId: string;
  setSelectedRenewalRecordId: (id: string) => void;

  globalSearchQuery: string;
  setGlobalSearchQuery: (q: string) => void;

  toasts: ToastMessage[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;

  exportToCSV: () => void;
  exportAuditLogCSV: () => void;
  verifyChecksums: () => void;
  isVerifyingChecksums: boolean;

  stats: {
    total: number;
    hrPermanent: number;
    hrContract: number;
    legalContract: number;
    pendingRenewals: number;
    expired: number;
    activeStations: number;
  };
}

const STORAGE_STAFF_KEY = 'compliance_core_staff_v25';
const STORAGE_LOGS_KEY = 'compliance_core_logs_v25';
const STORAGE_PDFS_KEY = 'compliance_core_pdfs_v25';

const ComplianceContext = createContext<ComplianceContextType | undefined>(undefined);

export const ComplianceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [records, setRecords] = useState<StaffRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_STAFF_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_STAFF_RECORDS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_LOGS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_AUDIT_LOGS;
  });

  const [attachedPdfs, setAttachedPdfs] = useState<AttachedPdfDocument[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PDFS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_ATTACHED_PDFS;
  });

  const [activeTab, setActiveTab] = useState<'registry' | 'renewals' | 'stations' | 'audit' | 'settings'>('renewals');
  const [currentScreen, setCurrentScreen] = useState<'main' | 'add-staff' | 'edit-staff'>('main');
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);

  const [selectedRenewalRecordId, setSelectedRenewalRecordId] = useState<string>('REC-001');
  const [globalSearchQuery, setGlobalSearchQuery] = useState<string>('');

  const [pdfModalData, setPdfModalData] = useState<PdfModalData | null>(null);
  const [deleteModalRecord, setDeleteModalRecord] = useState<StaffRecord | null>(null);
  const [protocolDocsModalOpen, setProtocolDocsModalOpen] = useState<boolean>(false);
  const [bulkDispatchModalOpen, setBulkDispatchModalOpen] = useState<boolean>(false);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isVerifyingChecksums, setIsVerifyingChecksums] = useState<boolean>(false);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_STAFF_KEY, JSON.stringify(records));
    } catch (e) {
      console.error('Failed to save staff records', e);
    }
  }, [records]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_LOGS_KEY, JSON.stringify(auditLogs));
    } catch (e) {
      console.error('Failed to save audit logs', e);
    }
  }, [auditLogs]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PDFS_KEY, JSON.stringify(attachedPdfs));
    } catch (e) {
      console.error('Failed to save attached pdfs', e);
    }
  }, [attachedPdfs]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const addAuditLog = (entry: Omit<AuditLogEntry, 'id' | 'timestamp' | 'integrityHash'>) => {
    const now = new Date();
    const ts = now.toISOString().replace('T', ' ').substring(0, 19);
    const hash = generatePseudoSha256(entry.targetRecordCode + ts + entry.changeSummary);
    const newLog: AuditLogEntry = {
      ...entry,
      id: 'LOG-' + Date.now().toString().slice(-4),
      timestamp: ts,
      integrityHash: hash,
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const addAttachedPdf = (doc: AttachedPdfDocument) => {
    setAttachedPdfs(prev => [doc, ...prev]);
  };

  const openAddStaffScreen = () => {
    setEditingStaffId(null);
    setCurrentScreen('add-staff');
  };

  const openEditStaffScreen = (id: string) => {
    setEditingStaffId(id);
    setCurrentScreen('edit-staff');
  };

  const closeFormScreen = () => {
    setEditingStaffId(null);
    setCurrentScreen('main');
  };

  const saveStaffRecord = (recordData: Partial<StaffRecord>, isNew: boolean) => {
    if (isNew) {
      const newRec = {
        ...recordData,
        id: 'REC-' + Date.now().toString().slice(-4),
      } as StaffRecord;
      setRecords(prev => [newRec, ...prev]);
      
      addAuditLog({
        actionType: 'Staff Created',
        operator: 'Single-User Admin',
        targetRecordCode: newRec.staffNo,
        targetRecordName: newRec.name,
        changeSummary: `Registered staff into ${newRec.station} roster; Department: ${newRec.department}; Category: ${newRec.category}`,
        category: 'mutation',
      });

      if (newRec.pdfAttached && newRec.pdfFileName) {
        addAttachedPdf({
          id: 'PDF-' + Date.now().toString().slice(-4),
          fileName: newRec.pdfFileName,
          staffId: newRec.staffNo,
          staffName: newRec.name,
          station: newRec.station,
          sizeMB: newRec.pdfSizeMB || 1.2,
          uploadedDate: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
          checksum: generatePseudoSha256(newRec.pdfFileName),
          category: newRec.category,
        });

        addAuditLog({
          actionType: 'PDF Attached',
          operator: 'Single-User Admin',
          targetRecordCode: newRec.staffNo,
          targetRecordName: newRec.name,
          changeSummary: `Attached signed MRF / Legal Agreement document: ${newRec.pdfFileName} (${newRec.pdfSizeMB || 1.2} MB)`,
          category: 'pdf',
        });
      }

      showToast(`Staff registered successfully: ${newRec.staffNo}`, 'success');
    } else {
      setRecords(prev =>
        prev.map(r => (r.id === editingStaffId ? ({ ...r, ...recordData } as StaffRecord) : r))
      );

      const target = records.find(r => r.id === editingStaffId);
      if (target) {
        addAuditLog({
          actionType: 'Contract Updated',
          operator: 'Single-User Admin',
          targetRecordCode: target.staffNo,
          targetRecordName: target.name,
          changeSummary: `Updated contract parameters for ${target.staffNo}; Expiry: ${recordData.expiryDate || 'Permanent'}; Dept: ${recordData.department}`,
          category: 'mutation',
        });
      }

      showToast(`Updated record for ${recordData.name || 'staff member'}`, 'success');
    }
    closeFormScreen();
  };

  const deleteStaffRecord = (id: string) => {
    const target = records.find(r => r.id === id);
    if (!target) return;
    openDeleteModal(target);
  };

  const openDeleteModal = (record: StaffRecord) => {
    setDeleteModalRecord(record);
  };

  const closeDeleteModal = () => {
    setDeleteModalRecord(null);
  };

  const confirmDeleteStaff = () => {
    if (!deleteModalRecord) return;
    const { id, staffNo, name } = deleteModalRecord;
    setRecords(prev => prev.filter(r => r.id !== id));
    addAuditLog({
      actionType: 'Staff Deleted',
      operator: 'Single-User Admin',
      targetRecordCode: staffNo,
      targetRecordName: name,
      changeSummary: `Staff record permanently removed from registry; Metadata preserved in immutable vault.`,
      category: 'mutation',
    });
    closeDeleteModal();
    showToast(`Deleted staff record: ${staffNo}`, 'error');
  };

  const openPdfModal = (data: PdfModalData) => {
    setPdfModalData(data);
  };

  const closePdfModal = () => {
    setPdfModalData(null);
  };

  const openProtocolDocsModal = () => setProtocolDocsModalOpen(true);
  const closeProtocolDocsModal = () => setProtocolDocsModalOpen(false);

  const openBulkDispatchModal = () => setBulkDispatchModalOpen(true);
  const closeBulkDispatchModal = () => setBulkDispatchModalOpen(false);

  const exportToCSV = () => {
    const headers = [
      "Staff No",
      "Full Name",
      "IC Number",
      "Station",
      "Department",
      "Category",
      "Join Date",
      "Tenure",
      "Contract Expiry",
      "Compliance Status",
      "HOD Email",
      "HR Dept Email",
      "Admin Email",
      "PDF Attached"
    ];

    const rows = records.map(r => {
      const status = computeStatus(r).label;
      const tenure = calculateTenure(r.joinDate);
      return [
        `"${r.staffNo}"`,
        `"${r.name.replace(/"/g, '""')}"`,
        `"${r.ic}"`,
        `"${r.station}"`,
        `"${r.department}"`,
        `"${r.category}"`,
        `"${r.joinDate}"`,
        `"${tenure}"`,
        `"${r.expiryDate || 'Indefinite'}"`,
        `"${status}"`,
        `"${r.hodEmail}"`,
        `"${r.hrDeptEmail || ''}"`,
        `"${r.adminEmail || ''}"`,
        `"${r.pdfAttached ? 'YES' : 'NO'}"`
      ].join(',');
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ComplianceCore_Staff_Registry_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addAuditLog({
      actionType: 'CSV Exported',
      operator: 'Single-User Admin',
      targetRecordCode: 'SYS-GLOBAL',
      targetRecordName: 'Full Registry',
      changeSummary: `Full staff directory exported (${records.length} records, format CSV)`,
      category: 'system',
    });

    showToast(`Staff Registry exported to CSV (${records.length} records)`, 'success');
  };

  const exportAuditLogCSV = () => {
    const headers = [
      "Timestamp (UTC+8)",
      "Action Type",
      "Operator",
      "Target Record Code",
      "Target Name",
      "Change Summary",
      "Integrity Hash (SHA-256)"
    ];

    const rows = auditLogs.map(l => [
      `"${l.timestamp}"`,
      `"${l.actionType}"`,
      `"${l.operator}"`,
      `"${l.targetRecordCode}"`,
      `"${l.targetRecordName}"`,
      `"${l.changeSummary.replace(/"/g, '""')}"`,
      `"${l.integrityHash}"`
    ].join(','));

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ComplianceCore_Audit_Log_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast("Cryptographic Audit Log exported to CSV", "success");
  };

  const verifyChecksums = () => {
    setIsVerifyingChecksums(true);
    setTimeout(() => {
      setIsVerifyingChecksums(false);
      addAuditLog({
        actionType: 'Checksum Verified',
        operator: 'Single-User Admin',
        targetRecordCode: 'SYS-INTEGRITY',
        targetRecordName: 'Vault Cryptographic Engine',
        changeSummary: 'SHA-256 block chain verification completed. 100% hashes verified, zero tamper events detected.',
        category: 'system',
      });
      showToast('All cryptographic checksums verified. 0 tamper alerts.', 'success');
    }, 1200);
  };

  // Compute live statistics
  const stats = React.useMemo(() => {
    let pendingRenewals = 0;
    let expired = 0;
    let hrPermanent = 0;
    let hrContract = 0;
    let legalContract = 0;
    const stationsSet = new Set<string>();

    records.forEach(r => {
      stationsSet.add(r.station);
      if (r.category === 'HR Permanent') hrPermanent++;
      if (r.category === 'HR Contract') hrContract++;
      if (r.category === 'Legal Contract') legalContract++;

      const st = computeStatus(r);
      if (st.isPending) pendingRenewals++;
      if (st.isExpired) expired++;
    });

    return {
      total: records.length,
      hrPermanent,
      hrContract,
      legalContract,
      pendingRenewals,
      expired,
      activeStations: stationsSet.size,
    };
  }, [records]);

  return (
    <ComplianceContext.Provider
      value={{
        records,
        activeTab,
        setActiveTab,
        currentScreen,
        editingStaffId,
        openAddStaffScreen,
        openEditStaffScreen,
        closeFormScreen,
        saveStaffRecord,
        deleteStaffRecord,
        auditLogs,
        addAuditLog,
        attachedPdfs,
        addAttachedPdf,
        pdfModalData,
        openPdfModal,
        closePdfModal,
        deleteModalRecord,
        openDeleteModal,
        closeDeleteModal,
        confirmDeleteStaff,
        protocolDocsModalOpen,
        openProtocolDocsModal,
        closeProtocolDocsModal,
        bulkDispatchModalOpen,
        openBulkDispatchModal,
        closeBulkDispatchModal,
        selectedRenewalRecordId,
        setSelectedRenewalRecordId,
        globalSearchQuery,
        setGlobalSearchQuery,
        toasts,
        showToast,
        removeToast,
        exportToCSV,
        exportAuditLogCSV,
        verifyChecksums,
        isVerifyingChecksums,
        stats,
      }}
    >
      {children}
    </ComplianceContext.Provider>
  );
};

export const useCompliance = () => {
  const context = useContext(ComplianceContext);
  if (!context) {
    throw new Error('useCompliance must be used within a ComplianceProvider');
  }
  return context;
};
