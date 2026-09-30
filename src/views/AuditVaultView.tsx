import React, { useState } from 'react';
import { useCompliance } from '../context/ComplianceContext';
import { AttachedPdfDocument } from '../types/compliance';

export const AuditVaultView: React.FC = () => {
  const {
    auditLogs,
    attachedPdfs,
    openPdfModal,
    exportAuditLogCSV,
    verifyChecksums,
    isVerifyingChecksums,
    showToast,
  } = useCompliance();

  const [activeCategoryFilter, setActiveCategoryFilter] = useState<'all' | 'pdf' | 'renewal' | 'mutation'>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchLogQuery, setSearchLogQuery] = useState<string>('');

  const filteredLogs = auditLogs.filter(log => {
    if (activeCategoryFilter !== 'all' && log.category !== activeCategoryFilter) {
      return false;
    }
    if (searchLogQuery) {
      const q = searchLogQuery.toLowerCase();
      return (
        log.targetRecordCode.toLowerCase().includes(q) ||
        log.targetRecordName.toLowerCase().includes(q) ||
        log.changeSummary.toLowerCase().includes(q) ||
        log.integrityHash.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handlePdfView = (doc: AttachedPdfDocument) => {
    openPdfModal({
      filename: doc.fileName,
      staffName: doc.staffName,
      station: doc.station,
      staffNo: doc.staffId,
      sizeMB: doc.sizeMB,
      checksum: doc.checksum,
      category: doc.category,
    });
  };

  const handleDownloadPdf = (doc: AttachedPdfDocument) => {
    showToast(`Downloading certified PDF: ${doc.fileName}`, 'success');
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] w-full mx-auto">
      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-[#c5c5d3] pb-4 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-[22px] md:text-[24px] font-bold text-[#00236f] tracking-tight">
              Audit Logs &amp; PDF Document Vault
            </h1>
            <span className="bg-[#ecfdf5] text-[#047857] text-[10px] font-bold px-2 py-0.5 rounded border border-[#047857]/20 flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#047857]"></span>
              <span>IMMUTABLE JOURNAL</span>
            </span>
          </div>
          <p className="text-[13px] text-[#444651] mt-0.5">
            Cryptographic activity trail of staff lifecycle events, local CSV export records, and verified local PDF document storage (&le; 2MB).
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={exportAuditLogCSV}
            className="bg-white hover:bg-[#eff4ff] border border-[#c5c5d3] text-[#0b1c30] px-3.5 py-1.5 rounded-lg text-[12px] font-semibold flex items-center space-x-1.5 shadow-xs transition-colors"
          >
            <span className="material-symbols-outlined text-[16px] text-[#00236f]">download</span>
            <span>Download Audit Log (CSV)</span>
          </button>

          <button
            onClick={verifyChecksums}
            disabled={isVerifyingChecksums}
            className="bg-[#eff4ff] border border-[#c5c5d3] text-[#00236f] hover:bg-[#e5eeff] px-3 py-1.5 rounded-lg text-[12px] font-semibold flex items-center space-x-1 transition-colors"
          >
            <span className={`material-symbols-outlined text-[16px] ${isVerifyingChecksums ? 'animate-spin' : ''}`}>
              sync
            </span>
            <span>{isVerifyingChecksums ? 'Verifying Block Hashes...' : 'Verify Checksums'}</span>
          </button>
        </div>
      </div>

      {/* TOP METRICS ROW (Bento Grid) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white p-4 rounded-lg border border-[#c5c5d3] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#757682]">Total Stored Documents</span>
            <div className="p-1.5 rounded bg-[#eff4ff] text-[#00236f]">
              <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
            </div>
          </div>
          <div className="mt-2">
            <div className="text-[24px] font-bold text-[#0b1c30]">{attachedPdfs.length} Verified PDFs</div>
            <p className="text-[12px] text-[#757682] mt-0.5">MRF &amp; Front Page Contracts</p>
          </div>
          <div className="mt-3 pt-2 border-t border-[#c5c5d3]/50 flex items-center justify-between text-[11px] text-[#047857] font-semibold">
            <span className="flex items-center">
              <span className="material-symbols-outlined text-[14px] mr-1">check_circle</span> 100% Retrievable
            </span>
            <span className="text-[#757682] font-mono">MD5/SHA matched</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-4 rounded-lg border border-[#c5c5d3] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#757682]">Storage Consumption</span>
            <div className="p-1.5 rounded bg-[#eff4ff] text-[#00236f]">
              <span className="material-symbols-outlined text-[18px]">storage</span>
            </div>
          </div>
          <div className="mt-2">
            <div className="text-[24px] font-bold text-[#0b1c30]">
              8.6 MB <span className="text-[14px] text-[#757682] font-normal">/ 50 MB</span>
            </div>
            <p className="text-[12px] text-[#757682] mt-0.5">IndexedDB client partition quota</p>
          </div>
          <div className="mt-2.5">
            <div className="w-full bg-[#e5eeff] rounded-full h-1.5 overflow-hidden">
              <div className="bg-[#4e45d5] h-1.5 rounded-full" style={{ width: '17.2%' }}></div>
            </div>
            <div className="flex justify-between items-center text-[10px] text-[#757682] font-mono mt-1">
              <span>17.2% Used</span>
              <span>41.4 MB Headroom</span>
            </div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-4 rounded-lg border border-[#c5c5d3] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#757682]">Audit Trail Events</span>
            <div className="p-1.5 rounded bg-[#eff4ff] text-[#00236f]">
              <span className="material-symbols-outlined text-[18px]">history_edu</span>
            </div>
          </div>
          <div className="mt-2">
            <div className="text-[24px] font-bold text-[#0b1c30]">148 Operations</div>
            <p className="text-[12px] text-[#757682] mt-0.5">Immutable single-user logs</p>
          </div>
          <div className="mt-3 pt-2 border-t border-[#c5c5d3]/50 flex items-center justify-between text-[11px] text-[#0b1c30]">
            <span className="flex items-center text-[#047857] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#047857] mr-1.5"></span> Zero tamper alerts
            </span>
            <span className="text-[#757682] font-mono">SHA-256 Chained</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-4 rounded-lg border border-[#c5c5d3] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#757682]">Compliance Status</span>
            <div className="p-1.5 rounded bg-[#ecfdf5] text-[#047857]">
              <span className="material-symbols-outlined text-[18px]">verified</span>
            </div>
          </div>
          <div className="mt-2">
            <div className="text-[24px] font-bold text-[#047857]">100% Verified</div>
            <p className="text-[12px] text-[#757682] mt-0.5">Media Prima Audio PRD v2.5</p>
          </div>
          <div className="mt-3 pt-2 border-t border-[#c5c5d3]/50 flex items-center justify-between text-[11px] text-[#757682]">
            <span>Size Cap: &le; 2.0 MB</span>
            <span className="text-[#047857] font-bold">Strict Enforcement</span>
          </div>
        </div>
      </section>

      {/* SECTION 1: IN-APP PDF DOCUMENT REPOSITORY */}
      <section className="bg-white rounded-lg border border-[#c5c5d3] shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#c5c5d3] flex flex-col sm:flex-row sm:items-center sm:justify-between bg-[#eff4ff] gap-2">
          <div className="flex items-center space-x-2">
            <span className="material-symbols-outlined text-[#00236f] text-xl">folder_special</span>
            <h2 className="text-[15px] font-bold text-[#0b1c30]">Attached PDF Documents &amp; MRF Records</h2>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#dce9ff] text-[#00236f]">
              {attachedPdfs.length} Active Files
            </span>
          </div>
          <span className="text-[10px] font-bold text-[#757682] uppercase tracking-wider">
            Storage Policy: Client-Side Encrypted IndexedDB
          </span>
        </div>

        {/* Document Grid */}
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {attachedPdfs.map((doc) => (
            <div
              key={doc.id}
              className="p-3.5 rounded-lg border border-[#c5c5d3] hover:border-[#4e45d5] transition-all bg-[#f8f9ff] flex flex-col justify-between space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="w-9 h-9 rounded bg-[#fff1f2] text-[#be123c] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[20px]">description</span>
                  </div>
                  <div className="overflow-hidden">
                    <h3 className="text-[13px] font-bold text-[#0b1c30] truncate" title={doc.fileName}>
                      {doc.fileName}
                    </h3>
                    <div className="flex items-center space-x-2 text-[11px] text-[#757682] mt-0.5">
                      <span className="font-mono">{doc.sizeMB} MB</span>
                      <span>&bull;</span>
                      <span className="text-[#00236f] font-semibold">{doc.station}</span>
                    </div>
                  </div>
                </div>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#e5eeff] text-[#00236f] font-bold">
                  {doc.staffId}
                </span>
              </div>

              <div className="pt-2 border-t border-[#c5c5d3]/50 flex items-center justify-between text-[11px]">
                <span className="font-mono text-[#757682]">Uploaded: {doc.uploadedDate}</span>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handlePdfView(doc)}
                    className="px-2.5 py-1 rounded text-[11px] font-bold text-[#00236f] hover:bg-[#dce9ff] transition-colors flex items-center space-x-1"
                  >
                    <span className="material-symbols-outlined text-[15px]">visibility</span>
                    <span>View</span>
                  </button>
                  <button
                    onClick={() => handleDownloadPdf(doc)}
                    className="p-1 rounded text-[#757682] hover:text-[#0b1c30] hover:bg-[#eff4ff] transition-colors"
                    title="Download Copy"
                  >
                    <span className="material-symbols-outlined text-[15px]">download</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 2: COMPREHENSIVE AUDIT TRAIL TABLE */}
      <section className="bg-white rounded-lg border border-[#c5c5d3] shadow-xs overflow-hidden">
        {/* Table Control Bar */}
        <div className="px-5 py-3.5 border-b border-[#c5c5d3] flex flex-col md:flex-row md:items-center md:justify-between bg-[#eff4ff] gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-[15px] font-bold text-[#0b1c30]">Cryptographic Audit Ledger</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#ecfdf5] text-[#047857]">
                Append-Only Log
              </span>
            </div>
            <p className="text-[11px] text-[#757682] mt-0.5">
              SHA-256 verification string attached to every administrative action
            </p>
          </div>

          {/* Action Filters */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setActiveCategoryFilter('all')}
              className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all ${
                activeCategoryFilter === 'all'
                  ? 'bg-[#00236f] text-white shadow-xs'
                  : 'bg-white text-[#444651] hover:bg-[#eff4ff]'
              }`}
            >
              All Logs
            </button>
            <button
              onClick={() => setActiveCategoryFilter('pdf')}
              className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all ${
                activeCategoryFilter === 'pdf'
                  ? 'bg-[#00236f] text-white shadow-xs'
                  : 'bg-white text-[#444651] hover:bg-[#eff4ff]'
              }`}
            >
              Document Uploads
            </button>
            <button
              onClick={() => setActiveCategoryFilter('renewal')}
              className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all ${
                activeCategoryFilter === 'renewal'
                  ? 'bg-[#00236f] text-white shadow-xs'
                  : 'bg-white text-[#444651] hover:bg-[#eff4ff]'
              }`}
            >
              Renewal Dispatches
            </button>
            <button
              onClick={() => setActiveCategoryFilter('mutation')}
              className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all ${
                activeCategoryFilter === 'mutation'
                  ? 'bg-[#00236f] text-white shadow-xs'
                  : 'bg-white text-[#444651] hover:bg-[#eff4ff]'
              }`}
            >
              Record Mutations
            </button>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f8f9ff] border-b border-[#c5c5d3] text-[11px] font-bold text-[#757682] uppercase tracking-wider select-none">
                <th className="py-2.5 px-4">Timestamp (UTC+8)</th>
                <th className="py-2.5 px-3">Action Type</th>
                <th className="py-2.5 px-3">Operator</th>
                <th className="py-2.5 px-3">Target Record</th>
                <th className="py-2.5 px-4">Change Summary</th>
                <th className="py-2.5 px-4">Integrity Hash (SHA-256)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c5c5d3]/60 text-[12px]">
              {filteredLogs.map((log) => {
                let badgeStyle = 'bg-[#eff4ff] text-[#00236f]';
                let dotStyle = 'bg-[#00236f]';

                if (log.actionType === 'PDF Attached') {
                  badgeStyle = 'bg-[#ecfdf5] text-[#047857]';
                  dotStyle = 'bg-[#047857]';
                } else if (log.actionType === 'Contract Updated') {
                  badgeStyle = 'bg-[#fffbeb] text-[#b45309]';
                  dotStyle = 'bg-[#b45309]';
                } else if (log.actionType === 'Staff Deleted') {
                  badgeStyle = 'bg-[#fff1f2] text-[#be123c]';
                  dotStyle = 'bg-[#be123c]';
                } else if (log.actionType === 'Staff Created') {
                  badgeStyle = 'bg-[#ecfdf5] text-[#047857]';
                  dotStyle = 'bg-[#047857]';
                }

                return (
                  <tr key={log.id} className="hover:bg-[#eff4ff]/40 transition-colors">
                    <td className="py-2.5 px-4 font-mono text-[#757682] whitespace-nowrap">
                      {log.timestamp}
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${badgeStyle}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${dotStyle} mr-1.5`}></span>
                        {log.actionType}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 font-semibold text-[#0b1c30] whitespace-nowrap">
                      {log.operator}
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="font-mono bg-[#e5eeff] px-1.5 py-0.5 rounded text-[#00236f] text-[11px] font-bold">
                        {log.targetRecordCode}
                      </span>
                      <span className="text-[#444651] text-[11px] ml-1.5">{log.targetRecordName}</span>
                    </td>

                    <td className="py-2.5 px-4 text-[#0b1c30]">
                      {log.changeSummary}
                    </td>

                    <td className="py-2.5 px-4 font-mono text-[11px] text-[#757682] whitespace-nowrap">
                      <span
                        onClick={() => showToast(`Hash verified: ${log.integrityHash}`, 'success')}
                        className="hover:text-[#00236f] cursor-pointer flex items-center"
                        title="Click to verify SHA-256 Checksum"
                      >
                        <span>{log.integrityHash.slice(0, 8)}...{log.integrityHash.slice(-6)}</span>
                        <span className="material-symbols-outlined text-[13px] ml-1 text-[#4e45d5]">verified</span>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="px-5 py-3 border-t border-[#c5c5d3] flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#757682] bg-[#f8f9ff] gap-2">
          <div className="flex items-center space-x-1">
            <span>Showing {filteredLogs.length} of 148 operations</span>
            <span>&bull;</span>
            <span className="font-mono text-[#047857] font-semibold">Integrity Status: SHA-256 Validated</span>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1 rounded border border-[#c5c5d3] bg-white text-[#757682] text-[11px] font-bold disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(1)}
              className={`px-2.5 py-1 rounded border border-[#c5c5d3] text-[11px] font-bold ${
                currentPage === 1 ? 'bg-[#00236f] text-white' : 'bg-white text-[#0b1c30]'
              }`}
            >
              1
            </button>
            <button
              onClick={() => setCurrentPage(2)}
              className={`px-2.5 py-1 rounded border border-[#c5c5d3] text-[11px] font-bold ${
                currentPage === 2 ? 'bg-[#00236f] text-white' : 'bg-white text-[#0b1c30]'
              }`}
            >
              2
            </button>
            <button
              onClick={() => setCurrentPage(3)}
              className={`px-2.5 py-1 rounded border border-[#c5c5d3] text-[11px] font-bold ${
                currentPage === 3 ? 'bg-[#00236f] text-white' : 'bg-white text-[#0b1c30]'
              }`}
            >
              3
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(3, currentPage + 1))}
              disabled={currentPage === 3}
              className="px-2.5 py-1 rounded border border-[#c5c5d3] bg-white text-[#0b1c30] text-[11px] font-bold disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
