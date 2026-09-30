import React from 'react';
import { useCompliance } from '../context/ComplianceContext';

export const DeleteConfirmModal: React.FC = () => {
  const { deleteModalRecord, closeDeleteModal, confirmDeleteStaff } = useCompliance();

  if (!deleteModalRecord) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#0f172a] opacity-50 backdrop-blur-xs" onClick={closeDeleteModal}></div>

      <div className="relative bg-white w-full max-w-md rounded-xl border border-[#c5c5d3] shadow-2xl p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150 z-10">
        <div className="flex items-center space-x-3 text-[#ba1a1a]">
          <div className="w-10 h-10 rounded-full bg-[#ffdad6] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[24px]">warning</span>
          </div>
          <div>
            <h3 className="text-[16px] font-bold text-[#0b1c30]">Delete Staff Record?</h3>
            <p className="text-[11px] text-[#757682]">Permanent Compliance Audit Action</p>
          </div>
        </div>

        <p className="text-[13px] text-[#444651] leading-relaxed">
          Are you sure you want to permanently delete the staff record for{' '}
          <strong className="text-[#0b1c30]">{deleteModalRecord.name}</strong> (
          <span className="font-mono text-[#00236f] font-semibold">{deleteModalRecord.staffNo}</span>)? 
          This action writes a permanent deletion hash into the Audit Vault and removes active renewal reminders.
        </p>

        <div className="flex items-center justify-end space-x-2 pt-3 border-t border-[#c5c5d3]">
          <button
            onClick={closeDeleteModal}
            className="px-4 py-2 rounded-lg border border-[#c5c5d3] bg-white hover:bg-[#eff4ff] text-[#0b1c30] text-[12px] font-semibold transition-all"
          >
            Cancel
          </button>
          <button
            onClick={confirmDeleteStaff}
            className="px-4 py-2 rounded-lg bg-[#ba1a1a] hover:bg-[#93000a] text-white text-[12px] font-bold transition-all shadow-xs flex items-center space-x-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">delete_forever</span>
            <span>Confirm Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
};
