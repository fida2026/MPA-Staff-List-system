import React from 'react';
import { useCompliance } from '../context/ComplianceContext';

export const ProtocolDocsModal: React.FC = () => {
  const { protocolDocsModalOpen, closeProtocolDocsModal } = useCompliance();

  if (!protocolDocsModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#0f172a] opacity-50 backdrop-blur-xs" onClick={closeProtocolDocsModal}></div>

      <div className="relative bg-white w-full max-w-2xl rounded-xl border border-[#c5c5d3] shadow-2xl flex flex-col max-h-[88vh] overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-[#f8f9ff] px-6 py-4 border-b border-[#c5c5d3] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <span className="material-symbols-outlined text-[#00236f] text-2xl">verified</span>
            <div>
              <h3 className="text-[16px] font-bold text-[#00236f]">
                Media Prima Audio PRD v2.5 Protocol Specifications
              </h3>
              <p className="text-[11px] text-[#757682]">
                Statutory Governance &bull; Notification Routing &bull; ID Formats
              </p>
            </div>
          </div>
          <button
            onClick={closeProtocolDocsModal}
            className="p-1 rounded text-[#757682] hover:text-[#0b1c30] hover:bg-[#eff4ff]"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-[13px] text-[#444651] custom-scrollbar">
          <div className="p-3.5 bg-[#eff4ff] border border-[#c5c5d3] rounded-lg">
            <h4 className="font-bold text-[#00236f] text-[14px] mb-1">
              1. Dual Threshold Expiration Architecture
            </h4>
            <ul className="list-disc list-inside space-y-1 text-[12px] leading-relaxed">
              <li>
                <strong className="text-[#0b1c30]">Tier 1 (Legal Contracts):</strong> Enforces a strict <strong>&le; 14-day threshold</strong> window. Mailto triggers route directly to <code className="bg-white px-1 py-0.5 rounded font-mono text-[#00236f]">admin.hr@company.com</code> with HOD in Carbon Copy (CC).
              </li>
              <li>
                <strong className="text-[#0b1c30]">Tier 2 (HR Contracts):</strong> Enforces a standard <strong>&le; 30-day threshold</strong> evaluation window. Mailto triggers route to <code className="bg-white px-1 py-0.5 rounded font-mono text-[#00236f]">hr.dept@company.com</code> with HOD in Carbon Copy (CC).
              </li>
              <li>
                <strong className="text-[#ba1a1a]">Expired Suppression Rule:</strong> Once contract passes expiry, mailto dispatch is systematically suppressed to avoid duplicate or unauthorized legal renewals.
              </li>
            </ul>
          </div>

          <div className="p-3.5 bg-[#f8f9ff] border border-[#c5c5d3] rounded-lg">
            <h4 className="font-bold text-[#00236f] text-[14px] mb-1">
              2. Strict ID Prefix &amp; Suffix Encoding
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2 font-mono text-[11px]">
              <div className="p-2 bg-white rounded border border-[#c5c5d3]">
                <strong className="text-[#00236f]">SSB-XXXX</strong>
                <p className="text-[10px] text-[#757682] font-sans">Hot FM (97.6 MHz)</p>
              </div>
              <div className="p-2 bg-white rounded border border-[#c5c5d3]">
                <strong className="text-[#00236f]">MAX-XXXX</strong>
                <p className="text-[10px] text-[#757682] font-sans">Fly FM (95.8 MHz)</p>
              </div>
              <div className="p-2 bg-white rounded border border-[#c5c5d3]">
                <strong className="text-[#00236f]">OFM-XXXX</strong>
                <p className="text-[10px] text-[#757682] font-sans">Eight Wuxian</p>
              </div>
              <div className="p-2 bg-white rounded border border-[#c5c5d3]">
                <strong className="text-[#00236f]">KFM-XXXX</strong>
                <p className="text-[10px] text-[#757682] font-sans">Kool FM (Separated)</p>
              </div>
              <div className="p-2 bg-white rounded border border-[#c5c5d3]">
                <strong className="text-[#00236f]">MFM-XXXX</strong>
                <p className="text-[10px] text-[#757682] font-sans">Molek FM (Separated)</p>
              </div>
              <div className="p-2 bg-white rounded border border-[#c5c5d3]">
                <strong className="text-[#00236f]">CON-XXXX</strong>
                <p className="text-[10px] text-[#757682] font-sans">Legal / Corporate Unit</p>
              </div>
            </div>
            <p className="text-[12px] mt-2 leading-relaxed">
              <strong>Contract Suffix Rule:</strong> All fixed-term personnel automatically receive an appended uppercase <strong>'C'</strong> suffix (e.g. <span className="font-mono text-[#00236f]">MAX-2041C</span>). Permanent staff retain clean numeric codes.
            </p>
          </div>

          <div className="p-3.5 bg-[#f8f9ff] border border-[#c5c5d3] rounded-lg">
            <h4 className="font-bold text-[#00236f] text-[14px] mb-1">
              3. Document Vault &amp; Cryptographic Standards
            </h4>
            <ul className="list-disc list-inside space-y-1 text-[12px] leading-relaxed">
              <li>PDF Format strictly mandated with maximum size cap of <strong>&le; 2.0 MB</strong>.</li>
              <li>Every mutation generates a SHA-256 chained hash into the client IndexedDB immutable log.</li>
              <li>Client-side mailto generation guarantees compliance officers review CC lists before dispatch.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#f8f9ff] px-6 py-3 border-t border-[#c5c5d3] flex items-center justify-between">
          <span className="text-[11px] text-[#757682] font-mono">
            Compliance Engine: Active v2.5 &bull; Media Prima Audio
          </span>
          <button
            onClick={closeProtocolDocsModal}
            className="px-4 py-1.5 rounded-lg bg-[#00236f] text-white text-[12px] font-bold hover:bg-[#1e3a8a] transition-colors"
          >
            Acknowledge &amp; Close
          </button>
        </div>
      </div>
    </div>
  );
};
