import React from 'react';
import { useCompliance } from '../context/ComplianceContext';

export const PdfViewerModal: React.FC = () => {
  const { pdfModalData, closePdfModal, showToast } = useCompliance();

  if (!pdfModalData) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    showToast(`Downloading certified copy: ${pdfModalData.filename}`, 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Scrim */}
      <div
        className="absolute inset-0 bg-[#0f172a] opacity-50 backdrop-blur-xs"
        onClick={closePdfModal}
      ></div>

      {/* Window */}
      <div className="relative bg-white w-full max-w-3xl rounded-lg border border-[#c5c5d3] shadow-2xl flex flex-col max-h-[92vh] overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-[#f8f9ff] px-5 py-3 border-b border-[#c5c5d3] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded bg-[#fff1f2] text-[#be123c] flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">picture_as_pdf</span>
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-[#0b1c30] leading-tight">
                {pdfModalData.filename}
              </h3>
              <p className="text-[11px] text-[#757682]">
                Media Prima Audio &bull; {pdfModalData.station} &bull; Staff {pdfModalData.staffNo} &bull; {pdfModalData.sizeMB} MB
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-2.5 py-1 rounded border border-[#c5c5d3] text-[12px] font-semibold hover:bg-[#eff4ff] flex items-center space-x-1 text-[#0b1c30] transition-colors"
            >
              <span className="material-symbols-outlined text-[15px]">print</span>
              <span>Print</span>
            </button>
            <button
              onClick={handleDownload}
              className="px-2.5 py-1 rounded bg-[#00236f] text-white text-[12px] font-bold hover:bg-[#1e3a8a] flex items-center space-x-1 transition-colors"
            >
              <span className="material-symbols-outlined text-[15px]">download</span>
              <span>Save Copy</span>
            </button>
            <button
              onClick={closePdfModal}
              className="p-1 rounded text-[#757682] hover:text-[#0b1c30] hover:bg-[#eff4ff] transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        {/* PDF Canvas Simulated Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#f1f5f9] flex justify-center custom-scrollbar">
          {/* A4 Sheet */}
          <div className="bg-white w-full max-w-xl min-h-[580px] p-8 md:p-10 shadow-md border border-[#cbd5e1] relative flex flex-col justify-between">
            {/* Watermark Stamp */}
            <div className="absolute right-8 top-12 border-2 border-[#be123c]/70 rounded p-2 text-center rotate-[-12deg] pointer-events-none select-none">
              <div className="text-[9px] font-bold tracking-widest text-[#be123c]">MEDIA PRIMA AUDIO</div>
              <div className="text-[12px] font-extrabold text-[#be123c] my-0.5">COMPLIANCE VERIFIED</div>
              <div className="text-[8px] font-mono text-[#be123c]">PRD v2.5 / LEGAL DEPT</div>
            </div>

            <div>
              {/* Document Header */}
              <div className="border-b-2 border-[#00236f] pb-4 mb-5">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-[16px] font-bold text-[#00236f] tracking-tight">
                      MEDIA PRIMA AUDIO BERHAD
                    </h2>
                    <p className="text-[10px] text-[#757682]">
                      Balai Berita, 31 Jalan Riong, 59100 Kuala Lumpur, Malaysia
                    </p>
                    <p className="text-[10px] font-bold text-[#0b1c30] mt-1 uppercase tracking-wide">
                      HUMAN RESOURCES &amp; TALENT OPERATIONS DIVISION
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-[#757682] block">FORM ID: MPA-MRF-2026</span>
                    <span className="text-[12px] font-bold text-[#00236f] block mt-0.5 font-mono">
                      REF: {pdfModalData.staffNo}
                    </span>
                  </div>
                </div>
              </div>

              {/* Document Details Grid */}
              <div className="space-y-4">
                <div className="bg-[#f8f9ff] p-3 rounded border border-[#c5c5d3]/60">
                  <h4 className="text-[10px] uppercase font-bold text-[#757682] tracking-wider mb-2">
                    Talent &amp; Station Directives Metadata
                  </h4>
                  <div className="grid grid-cols-2 gap-y-2 text-[12px]">
                    <div>
                      <span className="text-[#757682]">Full Name:</span>{' '}
                      <span className="font-bold text-[#0b1c30]">{pdfModalData.staffName}</span>
                    </div>
                    <div>
                      <span className="text-[#757682]">Station Entity:</span>{' '}
                      <span className="font-bold text-[#0b1c30]">{pdfModalData.station}</span>
                    </div>
                    <div>
                      <span className="text-[#757682]">Contract Type:</span>{' '}
                      <span className="font-semibold text-[#00236f]">
                        {pdfModalData.category || 'Statutory Broadcast Talent'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#757682]">Audit Checksum:</span>{' '}
                      <span className="font-mono text-[11px] text-[#00236f] ml-1">
                        {pdfModalData.checksum}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Legal Body Clauses */}
                <div className="text-[11px] leading-relaxed text-[#444651] space-y-2.5 mt-3">
                  <p>
                    This instrument certifies that the talent/employee referenced above has satisfied all mandatory compliance verifications as stipulated in the Media Prima Audio Standard Employment Charter (PRD v2.5).
                  </p>
                  <p>
                    All radio broadcasting frequencies, on-air syndications, digital likenesses, and voice-over covenants remain strictly governed by Media Prima Audio Berhad under designated statutory jurisdiction.
                  </p>
                  <p>
                    The authenticated digital copy is mirrored in the local cryptographic vault. File size conforms strictly to &le; 2.0MB compliance limits.
                  </p>
                </div>
              </div>
            </div>

            {/* Document Signatures */}
            <div className="pt-6 border-t border-dashed border-[#c5c5d3] mt-8">
              <div className="grid grid-cols-2 gap-8 text-[11px]">
                <div>
                  <div className="h-8 border-b border-[#757682] flex items-end pb-1 font-mono text-[#757682] italic text-[10px]">
                    /s/ {pdfModalData.staffName} (Digital Token)
                  </div>
                  <p className="font-bold text-[#0b1c30] mt-1">Talent / Staff Signature</p>
                  <p className="text-[#757682] text-[10px]">Audit Log Timestamp Attached</p>
                </div>
                <div>
                  <div className="h-8 border-b border-[#757682] flex items-end pb-1 font-mono text-[#757682] italic text-[10px]">
                    /s/ Legal &amp; People Ops Lead
                  </div>
                  <p className="font-bold text-[#0b1c30] mt-1">Head of Legal &amp; Compliance</p>
                  <p className="text-[#757682] text-[10px]">Media Prima Audio Berhad</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#f8f9ff] px-5 py-2.5 border-t border-[#c5c5d3] flex items-center justify-between">
          <div className="flex items-center space-x-2 text-[11px] text-[#757682] font-mono">
            <span className="material-symbols-outlined text-[14px] text-[#047857]">lock</span>
            <span>IndexedDB Client Store &bull; Verified Decryption Key</span>
          </div>
          <button
            onClick={closePdfModal}
            className="px-3.5 py-1.5 rounded border border-[#c5c5d3] text-[12px] font-semibold text-[#0b1c30] hover:bg-[#eff4ff] transition-colors"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
};
