import React from 'react';
import { useCompliance } from '../context/ComplianceContext';
import { computeStatus } from '../data/initialData';

export const BulkDispatchModal: React.FC = () => {
  const { bulkDispatchModalOpen, closeBulkDispatchModal, records, setSelectedRenewalRecordId, setActiveTab } = useCompliance();

  if (!bulkDispatchModalOpen) return null;

  const pendingRecords = records.filter(r => computeStatus(r).isPending);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#0f172a] opacity-50 backdrop-blur-xs" onClick={closeBulkDispatchModal}></div>

      <div className="relative bg-white w-full max-w-xl rounded-xl border border-[#c5c5d3] shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150 z-10">
        <div className="flex items-center justify-between border-b border-[#c5c5d3] pb-3">
          <div className="flex items-center space-x-2">
            <span className="material-symbols-outlined text-[#00236f] text-2xl">forward_to_inbox</span>
            <div>
              <h3 className="text-[16px] font-bold text-[#00236f]">Bulk Dispatch Mailto Summary</h3>
              <p className="text-[11px] text-[#757682]">Single-Operator Browser Protocol</p>
            </div>
          </div>
          <button onClick={closeBulkDispatchModal} className="p-1 rounded text-[#757682] hover:text-[#0b1c30]">
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        <div className="p-3 bg-[#eff4ff] border border-[#c5c5d3] rounded-lg text-[12px] text-[#444651]">
          <p className="font-semibold text-[#00236f] mb-1">Single-Operator Security Safeguard:</p>
          <p>
            Per PRD Section 5.3, automated multi-batch background transmission without review is disallowed. Compliance officers must inspect individual CC recipients to safeguard corporate radio talent confidentiality.
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between text-[12px] font-bold text-[#0b1c30] mb-2">
            <span>Pending Renewal Queue ({pendingRecords.length})</span>
            <span className="text-[#757682] text-[11px]">Select record to inspect</span>
          </div>

          <div className="space-y-1.5 max-h-56 overflow-y-auto custom-scrollbar">
            {pendingRecords.map((r) => {
              const st = computeStatus(r);
              return (
                <div
                  key={r.id}
                  onClick={() => {
                    setSelectedRenewalRecordId(r.id);
                    setActiveTab('renewals');
                    closeBulkDispatchModal();
                  }}
                  className="p-2.5 rounded border border-[#c5c5d3] hover:border-[#4e45d5] hover:bg-[#eff4ff] cursor-pointer flex items-center justify-between transition-colors text-[12px]"
                >
                  <div>
                    <div className="font-bold text-[#00236f] flex items-center gap-2">
                      <span className="font-mono text-[11px] px-1 bg-[#e5eeff] text-[#00236f] rounded">{r.staffNo}</span>
                      <span>{r.name}</span>
                    </div>
                    <div className="text-[11px] text-[#757682] mt-0.5">
                      {r.station} &bull; {r.department} &bull; Expiry: {r.expiryDate} ({st.daysRemaining}d left)
                    </div>
                  </div>
                  <span className="px-2 py-0.5 bg-[#fffbeb] text-[#b45309] border border-[#fde68a] text-[11px] rounded font-bold">
                    Inspect Mailto
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="pt-3 border-t border-[#c5c5d3] flex justify-end">
          <button
            onClick={closeBulkDispatchModal}
            className="px-4 py-2 rounded-lg bg-[#00236f] text-white text-[12px] font-bold hover:bg-[#1e3a8a] transition-colors"
          >
            Close Summary
          </button>
        </div>
      </div>
    </div>
  );
};
