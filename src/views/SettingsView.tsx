import React from 'react';
import { useCompliance } from '../context/ComplianceContext';

export const SettingsView: React.FC = () => {
  const { showToast, exportToCSV, exportAuditLogCSV, verifyChecksums, isVerifyingChecksums, stats } = useCompliance();

  return (
    <div className="p-6 space-y-6 max-w-[1200px] w-full mx-auto">
      <div className="border-b border-[#c5c5d3] pb-4">
        <h1 className="text-[22px] font-bold text-[#00236f] tracking-tight">ComplianceCore System Settings</h1>
        <p className="text-[12px] text-[#757682] mt-0.5">
          Enterprise governance parameters, cryptographic storage configuration, and automated mailto threshold controls.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Renewal Thresholds */}
        <div className="bg-white p-5 rounded-xl border border-[#c5c5d3] shadow-xs space-y-4">
          <div className="flex items-center space-x-2 border-b border-[#c5c5d3] pb-2.5">
            <span className="material-symbols-outlined text-[#00236f]">tune</span>
            <h2 className="text-[14px] font-bold text-[#0b1c30]">Renewal Threshold Rules (PRD v2.5)</h2>
          </div>
          <div className="space-y-3 text-[12px]">
            <div className="flex items-center justify-between p-2.5 bg-[#f8f9ff] rounded border border-[#c5c5d3]">
              <div>
                <span className="font-bold text-[#00236f] block">Legal Contract Window</span>
                <span className="text-[#757682] text-[11px]">Routes to Admin HR with HOD in CC</span>
              </div>
              <span className="font-mono font-bold bg-[#ffdad6] text-[#93000a] px-2 py-0.5 rounded text-[11px]">
                &le; 14 Days
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-[#f8f9ff] rounded border border-[#c5c5d3]">
              <div>
                <span className="font-bold text-[#00236f] block">HR Staff Contract Window</span>
                <span className="text-[#757682] text-[11px]">Routes to HR Dept with HOD in CC</span>
              </div>
              <span className="font-mono font-bold bg-[#dce9ff] text-[#00236f] px-2 py-0.5 rounded text-[11px]">
                &le; 30 Days
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-[#f8f9ff] rounded border border-[#c5c5d3]">
              <div>
                <span className="font-bold text-[#00236f] block">Expired Contract Protocol</span>
                <span className="text-[#757682] text-[11px]">Suppresses automatic mailto triggers</span>
              </div>
              <span className="font-bold bg-[#ecfdf5] text-[#047857] px-2 py-0.5 rounded text-[11px]">
                Active Lock
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Cryptographic Storage */}
        <div className="bg-white p-5 rounded-xl border border-[#c5c5d3] shadow-xs space-y-4">
          <div className="flex items-center space-x-2 border-b border-[#c5c5d3] pb-2.5">
            <span className="material-symbols-outlined text-[#4e45d5]">lock</span>
            <h2 className="text-[14px] font-bold text-[#0b1c30]">Client Storage &amp; Hash Vault</h2>
          </div>
          <div className="space-y-3 text-[12px]">
            <div className="p-3 bg-[#eff4ff] rounded border border-[#c5c5d3] space-y-1">
              <div className="flex justify-between font-bold">
                <span className="text-[#00236f]">IndexedDB Quota</span>
                <span className="font-mono text-[#757682]">8.6 MB / 50 MB</span>
              </div>
              <p className="text-[11px] text-[#444651]">
                Stores active contracts, MRF PDF attachments, and audit ledger records in local client sandbox.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={verifyChecksums}
                disabled={isVerifyingChecksums}
                className="flex-1 py-2 px-3 bg-[#00236f] text-white hover:bg-[#1e3a8a] text-[12px] font-bold rounded-lg transition-colors flex items-center justify-center space-x-1"
              >
                <span className={`material-symbols-outlined text-sm ${isVerifyingChecksums ? 'animate-spin' : ''}`}>
                  sync
                </span>
                <span>{isVerifyingChecksums ? 'Verifying...' : 'Verify Vault Checksums'}</span>
              </button>

              <button
                onClick={exportAuditLogCSV}
                className="py-2 px-3 border border-[#c5c5d3] hover:bg-[#eff4ff] text-[#0b1c30] text-[12px] font-semibold rounded-lg transition-colors flex items-center space-x-1"
              >
                <span className="material-symbols-outlined text-sm">download</span>
                <span>Audit CSV</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
