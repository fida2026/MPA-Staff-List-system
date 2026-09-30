import React, { useState } from 'react';
import { useCompliance } from '../context/ComplianceContext';
import { StationName, StaffRecord } from '../types/compliance';
import { calculateTenure, computeStatus, STATION_GATEWAYS } from '../data/initialData';

export const StationDirectoryView: React.FC = () => {
  const { records, showToast, exportToCSV, openPdfModal, addAuditLog } = useCompliance();

  const [selectedStationTab, setSelectedStationTab] = useState<StationName>('Hot FM');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('All Departments');

  // Compute live station statistics
  const getStationStats = (station: StationName) => {
    let list: StaffRecord[] = [];
    if (station === 'Legal & Corp') {
      list = records.filter(r => r.category === 'Legal Contract');
    } else {
      list = records.filter(r => r.station === station);
    }

    const total = list.length;
    const permanent = list.filter(r => r.category === 'HR Permanent').length;
    const contract = list.filter(r => r.category === 'HR Contract').length;
    const legal = list.filter(r => r.category === 'Legal Contract').length;

    let pending = 0;
    let expired = 0;

    list.forEach(r => {
      const st = computeStatus(r);
      if (st.isPending) pending++;
      if (st.isExpired) expired++;
    });

    return { total, permanent, contract, legal, pending, expired, list };
  };

  const hotStats = getStationStats('Hot FM');
  const flyStats = getStationStats('Fly FM');
  const eightStats = getStationStats('Eight Wuxian');
  const koolStats = getStationStats('Kool FM');
  const molekStats = getStationStats('Molek FM');
  const legalStats = getStationStats('Legal & Corp');

  // Active roster
  let activeRoster = records.filter(r => {
    if (selectedStationTab === 'Legal & Corp') {
      return r.category === 'Legal Contract';
    }
    return r.station === selectedStationTab;
  });

  if (selectedDeptFilter !== 'All Departments') {
    activeRoster = activeRoster.filter(r => r.department === selectedDeptFilter);
  }

  // Department Allocation breakdown
  const getDeptCount = (deptName: string) => {
    return records.filter(r => r.department.toLowerCase().includes(deptName.toLowerCase())).length;
  };

  const totalHeadcount = records.length;
  const permTotal = records.filter(r => r.category === 'HR Permanent').length;
  const hrContractTotal = records.filter(r => r.category === 'HR Contract').length;
  const legalContractTotal = records.filter(r => r.category === 'Legal Contract').length;

  const permPct = totalHeadcount > 0 ? Math.round((permTotal / totalHeadcount) * 100) : 50;
  const hrPct = totalHeadcount > 0 ? Math.round((hrContractTotal / totalHeadcount) * 100) : 33;
  const legalPct = totalHeadcount > 0 ? 100 - permPct - hrPct : 17;

  const handleSyncMatrix = () => {
    addAuditLog({
      actionType: 'Checksum Verified',
      operator: 'Single-User Admin',
      targetRecordCode: 'STATION-MATRIX',
      targetRecordName: 'Inter-Station Matrix Synced',
      changeSummary: 'Headcount distribution matrix synced across all 6 broadcasting units.',
      category: 'system',
    });
    showToast('Station Operations Headcount Matrix re-synchronized successfully.', 'success');
  };

  const handleOverride = () => {
    showToast('Allocation Override: Temporary capacity adjustments require Super-Admin elevation.', 'info');
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] w-full mx-auto">
      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#c5c5d3] pb-4 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-[22px] md:text-[24px] font-bold text-[#00236f] tracking-tight">
              Station Operations Directory &amp; Headcount Matrix
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#e5eeff] text-[#00236f] border border-[#c5c5d3]">
              CONFIDENTIAL
            </span>
          </div>
          <p className="text-[13px] text-[#444651] mt-0.5">
            Operational management across separated radio broadcast units: Hot FM, Fly FM, Eight Wuxian, Kool FM, Molek FM, and Corporate Legal Units.
          </p>
        </div>

        <div className="flex items-center space-x-2.5 shrink-0">
          <button
            onClick={handleSyncMatrix}
            className="bg-white border border-[#c5c5d3] px-3 py-1.5 rounded-lg text-[12px] font-semibold text-[#0b1c30] hover:bg-[#eff4ff] transition-colors flex items-center space-x-1 shadow-xs"
          >
            <span className="material-symbols-outlined text-[16px]">refresh</span>
            <span>Sync Matrix</span>
          </button>
        </div>
      </div>

      {/* TOP OVERVIEW GRID (6 Bento Cards) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className="material-symbols-outlined text-[#00236f] text-base">grid_view</span>
            <span className="text-[12px] font-bold text-[#0b1c30] uppercase tracking-wider">
              Broadcast Network Capacity &amp; Headcount Status
            </span>
          </div>
          <span className="text-[11px] text-[#757682] font-mono">LIVE SYNCED &bull; AUDIT LOG ACTIVE</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
          {/* Card 1: Hot FM */}
          <div
            onClick={() => setSelectedStationTab('Hot FM')}
            className={`bg-white border rounded-lg p-3.5 shadow-xs cursor-pointer transition-all flex flex-col justify-between ${
              selectedStationTab === 'Hot FM' ? 'border-[#4e45d5] ring-2 ring-[#4e45d5]/20 bg-[#eff4ff]/20' : 'border-[#c5c5d3] hover:border-[#4e45d5]'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ba1a1a]"></span>
                  <span className="text-[14px] font-bold text-[#0b1c30]">Hot FM</span>
                </div>
                <span className="font-mono text-[10px] bg-[#dce9ff] px-1.5 py-0.5 rounded text-[#00236f] font-bold">
                  SSB
                </span>
              </div>
              <div className="mt-2.5 flex items-baseline justify-between">
                <span className="text-[28px] font-bold text-[#00236f] leading-none">{hotStats.total}</span>
                <span className="text-[11px] text-[#757682]">Total Staff</span>
              </div>
              <div className="mt-2 pt-2 border-t border-[#c5c5d3] space-y-1 text-[11px]">
                <div className="flex justify-between text-[#444651]">
                  <span>Permanent:</span>
                  <span className="font-mono font-bold text-[#0b1c30]">{hotStats.permanent}</span>
                </div>
                <div className="flex justify-between text-[#444651]">
                  <span>Contract:</span>
                  <span className="font-mono font-bold text-[#0b1c30]">{hotStats.contract}</span>
                </div>
                <div className="flex justify-between text-[#444651]">
                  <span>Legal:</span>
                  <span className="font-mono font-bold text-[#0b1c30]">{hotStats.legal}</span>
                </div>
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-[#c5c5d3]">
              <div className="flex justify-between items-center text-[10px] mb-1">
                <span className="text-[#757682]">Bandwidth: 75%</span>
                <span className="inline-flex items-center text-[#047857] bg-[#ecfdf5] px-1.5 py-0.2 rounded font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#047857] mr-1"></span> Optimal
                </span>
              </div>
              <div className="w-full bg-[#e5eeff] rounded-full h-1.5 overflow-hidden">
                <div className="bg-[#4e45d5] h-1.5 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>
          </div>

          {/* Card 2: Fly FM */}
          <div
            onClick={() => setSelectedStationTab('Fly FM')}
            className={`bg-white border rounded-lg p-3.5 shadow-xs cursor-pointer transition-all flex flex-col justify-between ${
              selectedStationTab === 'Fly FM' ? 'border-[#4e45d5] ring-2 ring-[#4e45d5]/20 bg-[#eff4ff]/20' : 'border-[#c5c5d3] hover:border-[#4e45d5]'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#4e45d5]"></span>
                  <span className="text-[14px] font-bold text-[#0b1c30]">Fly FM</span>
                </div>
                <span className="font-mono text-[10px] bg-[#dce9ff] px-1.5 py-0.5 rounded text-[#00236f] font-bold">
                  MAX
                </span>
              </div>
              <div className="mt-2.5 flex items-baseline justify-between">
                <span className="text-[28px] font-bold text-[#00236f] leading-none">{flyStats.total}</span>
                <span className="text-[11px] text-[#757682]">Total Staff</span>
              </div>
              <div className="mt-2 pt-2 border-t border-[#c5c5d3] space-y-1 text-[11px]">
                <div className="flex justify-between text-[#444651]">
                  <span>Permanent:</span>
                  <span className="font-mono font-bold text-[#0b1c30]">{flyStats.permanent}</span>
                </div>
                <div className="flex justify-between text-[#444651]">
                  <span>Contract:</span>
                  <span className="font-mono font-bold text-[#0b1c30]">{flyStats.contract}</span>
                </div>
                <div className="flex justify-between text-[#444651]">
                  <span>Legal:</span>
                  <span className="font-mono font-bold text-[#0b1c30]">{flyStats.legal}</span>
                </div>
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-[#c5c5d3]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[#757682]">Status:</span>
                <span className="inline-flex items-center text-[10px] text-[#b45309] bg-[#fffbeb] px-1.5 py-0.2 rounded font-bold border border-[#fde68a]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#b45309] mr-1"></span>
                  {flyStats.pending > 0 ? `${flyStats.pending} Renewal Pending` : 'Optimal'}
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: Eight Wuxian */}
          <div
            onClick={() => setSelectedStationTab('Eight Wuxian')}
            className={`bg-white border rounded-lg p-3.5 shadow-xs cursor-pointer transition-all flex flex-col justify-between ${
              selectedStationTab === 'Eight Wuxian' ? 'border-[#4e45d5] ring-2 ring-[#4e45d5]/20 bg-[#eff4ff]/20' : 'border-[#c5c5d3] hover:border-[#4e45d5]'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#1e3a8a]"></span>
                  <span className="text-[14px] font-bold text-[#0b1c30]">Eight Wuxian</span>
                </div>
                <span className="font-mono text-[10px] bg-[#dce9ff] px-1.5 py-0.5 rounded text-[#00236f] font-bold">
                  OFM
                </span>
              </div>
              <div className="mt-2.5 flex items-baseline justify-between">
                <span className="text-[28px] font-bold text-[#00236f] leading-none">{eightStats.total}</span>
                <span className="text-[11px] text-[#757682]">Total Staff</span>
              </div>
              <div className="mt-2 pt-2 border-t border-[#c5c5d3] space-y-1 text-[11px]">
                <div className="flex justify-between text-[#444651]">
                  <span>Permanent:</span>
                  <span className="font-mono font-bold text-[#0b1c30]">{eightStats.permanent}</span>
                </div>
                <div className="flex justify-between text-[#444651]">
                  <span>Contract:</span>
                  <span className="font-mono font-bold text-[#0b1c30]">{eightStats.contract}</span>
                </div>
                <div className="flex justify-between text-[#444651]">
                  <span>Legal:</span>
                  <span className="font-mono font-bold text-[#0b1c30]">{eightStats.legal}</span>
                </div>
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-[#c5c5d3]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[#757682]">Status:</span>
                <span className="inline-flex items-center text-[10px] text-[#b45309] bg-[#fffbeb] px-1.5 py-0.2 rounded font-bold border border-[#fde68a]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#b45309] mr-1"></span>
                  {eightStats.pending > 0 ? `${eightStats.pending} Renewal Pending` : 'Compliant'}
                </span>
              </div>
            </div>
          </div>

          {/* Card 4: Kool FM */}
          <div
            onClick={() => setSelectedStationTab('Kool FM')}
            className={`bg-white border rounded-lg p-3.5 shadow-xs cursor-pointer transition-all flex flex-col justify-between ${
              selectedStationTab === 'Kool FM' ? 'border-[#4e45d5] ring-2 ring-[#4e45d5]/20 bg-[#eff4ff]/20' : 'border-[#c5c5d3] hover:border-[#4e45d5]'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#757682]"></span>
                  <span className="text-[14px] font-bold text-[#0b1c30]">Kool FM</span>
                </div>
                <span className="font-mono text-[10px] bg-[#dce9ff] px-1.5 py-0.5 rounded text-[#00236f] font-bold">
                  KFM
                </span>
              </div>
              <p className="text-[10px] text-[#757682] mt-0.5">Separated Station</p>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-[28px] font-bold text-[#00236f] leading-none">{koolStats.total}</span>
                <span className="text-[11px] text-[#757682]">Total Staff</span>
              </div>
              <div className="mt-2 pt-2 border-t border-[#c5c5d3] space-y-1 text-[11px]">
                <div className="flex justify-between text-[#444651]">
                  <span>Permanent:</span>
                  <span className="font-mono font-bold text-[#0b1c30]">{koolStats.permanent}</span>
                </div>
                <div className="flex justify-between text-[#444651]">
                  <span>Contract:</span>
                  <span className="font-mono font-bold text-[#0b1c30]">{koolStats.contract}</span>
                </div>
                <div className="flex justify-between text-[#444651]">
                  <span>Legal:</span>
                  <span className="font-mono font-bold text-[#0b1c30]">{koolStats.legal}</span>
                </div>
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-[#c5c5d3]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[#757682]">Status:</span>
                {koolStats.expired > 0 ? (
                  <span className="inline-flex items-center text-[10px] text-[#be123c] bg-[#fff1f2] px-1.5 py-0.2 rounded font-bold border border-[#fecdd3]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#be123c] mr-1"></span>
                    {koolStats.expired} Expired
                  </span>
                ) : (
                  <span className="text-[10px] text-[#047857] font-bold">Compliant</span>
                )}
              </div>
            </div>
          </div>

          {/* Card 5: Molek FM */}
          <div
            onClick={() => setSelectedStationTab('Molek FM')}
            className={`bg-white border rounded-lg p-3.5 shadow-xs cursor-pointer transition-all flex flex-col justify-between ${
              selectedStationTab === 'Molek FM' ? 'border-[#4e45d5] ring-2 ring-[#4e45d5]/20 bg-[#eff4ff]/20' : 'border-[#c5c5d3] hover:border-[#4e45d5]'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#6860ef]"></span>
                  <span className="text-[14px] font-bold text-[#0b1c30]">Molek FM</span>
                </div>
                <span className="font-mono text-[10px] bg-[#dce9ff] px-1.5 py-0.5 rounded text-[#00236f] font-bold">
                  MFM
                </span>
              </div>
              <p className="text-[10px] text-[#757682] mt-0.5">Separated Station</p>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-[28px] font-bold text-[#00236f] leading-none">{molekStats.total}</span>
                <span className="text-[11px] text-[#757682]">Total Staff</span>
              </div>
              <div className="mt-2 pt-2 border-t border-[#c5c5d3] space-y-1 text-[11px]">
                <div className="flex justify-between text-[#444651]">
                  <span>Permanent:</span>
                  <span className="font-mono font-bold text-[#0b1c30]">{molekStats.permanent}</span>
                </div>
                <div className="flex justify-between text-[#444651]">
                  <span>Contract:</span>
                  <span className="font-mono font-bold text-[#0b1c30]">{molekStats.contract}</span>
                </div>
                <div className="flex justify-between text-[#444651]">
                  <span>Legal:</span>
                  <span className="font-mono font-bold text-[#0b1c30]">{molekStats.legal}</span>
                </div>
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-[#c5c5d3]">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-[#757682]">Status:</span>
                <span className="inline-flex items-center text-[10px] text-[#b45309] bg-[#fffbeb] px-1.5 py-0.2 rounded font-bold border border-[#fde68a]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#b45309] mr-1"></span>
                  {molekStats.pending > 0 ? `${molekStats.pending} Renewal Pending` : 'Optimal'}
                </span>
              </div>
            </div>
          </div>

          {/* Card 6: Legal & Corporate Unit */}
          <div
            onClick={() => setSelectedStationTab('Legal & Corp')}
            className={`bg-white border-2 rounded-lg p-3.5 shadow-xs cursor-pointer transition-all flex flex-col justify-between ${
              selectedStationTab === 'Legal & Corp'
                ? 'border-[#4e45d5] ring-2 ring-[#4e45d5]/20 bg-[#eff4ff]/20'
                : 'border-[#1e3a8a] hover:border-[#4e45d5]'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <span className="material-symbols-outlined text-base text-[#00236f]">gavel</span>
                  <span className="text-[14px] font-bold text-[#0b1c30]">Legal &amp; Corp</span>
                </div>
                <span className="font-mono text-[10px] bg-[#00236f] text-white px-1.5 py-0.5 rounded font-bold">
                  CON
                </span>
              </div>
              <div className="mt-2.5 flex items-baseline justify-between">
                <span className="text-[28px] font-bold text-[#00236f] leading-none">{legalStats.total}</span>
                <span className="text-[11px] text-[#757682]">Total Active</span>
              </div>
              <div className="mt-2 pt-2 border-t border-[#c5c5d3] space-y-1 text-[11px]">
                <div className="flex justify-between text-[#444651]">
                  <span>Unit Type:</span>
                  <span className="font-bold text-[#00236f]">Cross-Station</span>
                </div>
                <div className="flex justify-between text-[#444651]">
                  <span>Fixed Duration:</span>
                  <span className="font-mono text-[#0b1c30]">5 Months</span>
                </div>
                <div className="flex justify-between text-[#444651]">
                  <span>Retainers:</span>
                  <span className="font-mono text-[#0b1c30]">Full SLA</span>
                </div>
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-[#c5c5d3]">
              <span className="inline-flex items-center text-[10px] text-[#047857] bg-[#ecfdf5] px-1.5 py-0.5 rounded w-full justify-center font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#047857] mr-1.5"></span>
                {legalStats.total} Legal Contracts Active
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN SPLIT: Tabs + Table (8 cols) vs Directives & Ratio (4 cols) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left / Center 8 Columns */}
        <div className="xl:col-span-8 space-y-4">
          {/* Station Selection Tabs Bar */}
          <div className="bg-white border border-[#c5c5d3] rounded-lg p-1.5 flex flex-wrap gap-1 shadow-xs">
            <button
              onClick={() => setSelectedStationTab('Hot FM')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-md text-[12px] font-semibold transition-all ${
                selectedStationTab === 'Hot FM'
                  ? 'bg-[#00236f] text-white shadow-xs font-bold'
                  : 'text-[#444651] hover:bg-[#eff4ff]'
              }`}
            >
              <span>Hot FM</span>
              <span className={`font-mono text-[10px] px-1.5 py-0.2 rounded ${selectedStationTab === 'Hot FM' ? 'bg-[#1e3a8a] text-white' : 'bg-[#e5eeff] text-[#00236f]'}`}>SSB</span>
            </button>

            <button
              onClick={() => setSelectedStationTab('Fly FM')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-md text-[12px] font-semibold transition-all ${
                selectedStationTab === 'Fly FM'
                  ? 'bg-[#00236f] text-white shadow-xs font-bold'
                  : 'text-[#444651] hover:bg-[#eff4ff]'
              }`}
            >
              <span>Fly FM</span>
              <span className={`font-mono text-[10px] px-1.5 py-0.2 rounded ${selectedStationTab === 'Fly FM' ? 'bg-[#1e3a8a] text-white' : 'bg-[#e5eeff] text-[#00236f]'}`}>MAX</span>
            </button>

            <button
              onClick={() => setSelectedStationTab('Eight Wuxian')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-md text-[12px] font-semibold transition-all ${
                selectedStationTab === 'Eight Wuxian'
                  ? 'bg-[#00236f] text-white shadow-xs font-bold'
                  : 'text-[#444651] hover:bg-[#eff4ff]'
              }`}
            >
              <span>Eight Wuxian</span>
              <span className={`font-mono text-[10px] px-1.5 py-0.2 rounded ${selectedStationTab === 'Eight Wuxian' ? 'bg-[#1e3a8a] text-white' : 'bg-[#e5eeff] text-[#00236f]'}`}>OFM</span>
            </button>

            <button
              onClick={() => setSelectedStationTab('Kool FM')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-md text-[12px] font-semibold transition-all ${
                selectedStationTab === 'Kool FM'
                  ? 'bg-[#00236f] text-white shadow-xs font-bold'
                  : 'text-[#444651] hover:bg-[#eff4ff]'
              }`}
            >
              <span>Kool FM</span>
              <span className={`font-mono text-[10px] px-1.5 py-0.2 rounded ${selectedStationTab === 'Kool FM' ? 'bg-[#1e3a8a] text-white' : 'bg-[#e5eeff] text-[#00236f]'}`}>KFM</span>
            </button>

            <button
              onClick={() => setSelectedStationTab('Molek FM')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-md text-[12px] font-semibold transition-all ${
                selectedStationTab === 'Molek FM'
                  ? 'bg-[#00236f] text-white shadow-xs font-bold'
                  : 'text-[#444651] hover:bg-[#eff4ff]'
              }`}
            >
              <span>Molek FM</span>
              <span className={`font-mono text-[10px] px-1.5 py-0.2 rounded ${selectedStationTab === 'Molek FM' ? 'bg-[#1e3a8a] text-white' : 'bg-[#e5eeff] text-[#00236f]'}`}>MFM</span>
            </button>

            <button
              onClick={() => setSelectedStationTab('Legal & Corp')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-md text-[12px] font-semibold transition-all ${
                selectedStationTab === 'Legal & Corp'
                  ? 'bg-[#00236f] text-white shadow-xs font-bold'
                  : 'text-[#444651] hover:bg-[#eff4ff]'
              }`}
            >
              <span>Corporate Legal</span>
              <span className={`font-mono text-[10px] px-1.5 py-0.2 rounded ${selectedStationTab === 'Legal & Corp' ? 'bg-[#1e3a8a] text-white' : 'bg-[#e5eeff] text-[#00236f]'}`}>CON</span>
            </button>
          </div>

          {/* Station Table Card */}
          <div className="bg-white border border-[#c5c5d3] rounded-lg shadow-xs overflow-hidden">
            {/* Table Header Bar */}
            <div className="p-3.5 bg-[#eff4ff] border-b border-[#c5c5d3] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center space-x-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00236f]"></span>
                <span className="text-[14px] font-bold text-[#0b1c30]">
                  {selectedStationTab} Broadcast Unit Roster (Prefix: {selectedStationTab === 'Legal & Corp' ? 'CON' : selectedStationTab === 'Hot FM' ? 'SSB' : selectedStationTab === 'Fly FM' ? 'MAX' : selectedStationTab === 'Eight Wuxian' ? 'OFM' : selectedStationTab === 'Kool FM' ? 'KFM' : 'MFM'})
                </span>
                <span className="text-[10px] font-mono bg-white border border-[#c5c5d3] px-2 py-0.5 rounded text-[#757682] font-bold">
                  {activeRoster.length} RECORDS
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-[#757682]">
                    <span className="material-symbols-outlined text-sm">filter_list</span>
                  </span>
                  <select
                    value={selectedDeptFilter}
                    onChange={(e) => setSelectedDeptFilter(e.target.value)}
                    className="pl-7 pr-6 py-1 bg-white border border-[#c5c5d3] rounded text-[11px] font-semibold text-[#0b1c30] outline-none focus:ring-1 focus:ring-[#4e45d5]"
                  >
                    <option value="All Departments">All Departments</option>
                    <option value="CEO Office">CEO Office</option>
                    <option value="Content">Content</option>
                    <option value="Finance">Finance</option>
                    <option value="Group Human Resources">Group HR</option>
                    <option value="Marketing &amp; Integration">Marketing</option>
                    <option value="Operation">Operation</option>
                    <option value="Tech &amp; Shared Services">Tech</option>
                  </select>
                </div>

                <button
                  onClick={exportToCSV}
                  className="p-1 hover:bg-[#eff4ff] rounded border border-[#c5c5d3] text-[#444651]"
                  title="Download Station CSV"
                >
                  <span className="material-symbols-outlined text-base">table_view</span>
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#f8f9ff] border-b border-[#c5c5d3] text-[11px] font-bold text-[#444651] uppercase tracking-wider select-none">
                    <th className="py-2.5 px-3">Staff No</th>
                    <th className="py-2.5 px-3">Name &amp; IC</th>
                    <th className="py-2.5 px-3">Department</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Joined Date</th>
                    <th className="py-2.5 px-3">Tenure</th>
                    <th className="py-2.5 px-3">Contract Expiry</th>
                    <th className="py-2.5 px-3">Document Status</th>
                    <th className="py-2.5 px-3 text-right">Operational Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#c5c5d3] text-[12px]">
                  {activeRoster.map((r) => {
                    const st = computeStatus(r);
                    const tenure = calculateTenure(r.joinDate);

                    return (
                      <tr key={r.id} className="hover:bg-[#eff4ff]/50 transition-colors">
                        <td className="py-2.5 px-3 font-mono font-bold text-[#00236f] whitespace-nowrap">
                          {r.staffNo}
                        </td>

                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <div className="font-semibold text-[#0b1c30]">{r.name}</div>
                          <div className="text-[10px] text-[#757682] font-mono">{r.ic}</div>
                        </td>

                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-[#e5eeff] text-[#00236f]">
                            {r.department}
                          </span>
                        </td>

                        <td className="py-2.5 px-3 whitespace-nowrap font-medium text-[#0b1c30]">
                          {r.category === 'Legal Contract' ? (
                            <span className="inline-flex items-center text-[#00236f] font-bold">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#4e45d5] mr-1.5"></span>
                              Legal Contract
                            </span>
                          ) : (
                            r.category
                          )}
                        </td>

                        <td className="py-2.5 px-3 font-mono text-[11px] text-[#757682] whitespace-nowrap">
                          {r.joinDate || '-'}
                        </td>

                        <td className="py-2.5 px-3 text-[#757682] whitespace-nowrap">
                          {tenure}
                        </td>

                        <td className="py-2.5 px-3 font-mono text-[11px] whitespace-nowrap">
                          {r.expiryDate ? (
                            <span className={st.isExpired ? 'text-[#ba1a1a] font-bold' : st.isPending ? 'text-[#b45309] font-bold' : 'text-[#0b1c30]'}>
                              {r.expiryDate}
                            </span>
                          ) : (
                            <span className="text-[#757682]">Indefinite</span>
                          )}
                        </td>

                        <td className="py-2.5 px-3 whitespace-nowrap">
                          {r.pdfAttached ? (
                            <button
                              onClick={() => openPdfModal({
                                filename: r.pdfFileName || `${r.staffNo}_MRF.pdf`,
                                staffName: r.name,
                                station: r.station,
                                staffNo: r.staffNo,
                                sizeMB: r.pdfSizeMB || 1.2,
                                checksum: 'e5a14c7d8b9f012a...',
                                category: r.category,
                              })}
                              className="flex items-center space-x-1.5 hover:underline text-[#047857]"
                            >
                              <span className="material-symbols-outlined text-[#047857] text-base">task_alt</span>
                              <span className="text-[11px] text-[#757682]">
                                {r.category === 'Legal Contract' ? 'Legal Signed PDF' : 'MRF &bull; Signed PDF'}
                              </span>
                            </button>
                          ) : (
                            <span className="text-[11px] text-[#757682] italic">Pending MRF</span>
                          )}
                        </td>

                        <td className="py-2.5 px-3 text-right whitespace-nowrap">
                          {st.isExpired ? (
                            <span className="inline-flex items-center text-[10px] text-[#be123c] bg-[#fff1f2] px-2 py-0.5 rounded font-bold border border-[#fecdd3]">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#be123c] mr-1.5"></span> Expired
                            </span>
                          ) : st.isPending ? (
                            <span className="inline-flex items-center text-[10px] text-[#b45309] bg-[#fffbeb] px-2 py-0.5 rounded font-bold border border-[#fde68a]">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#b45309] mr-1.5"></span> Retainer / Renewal Due
                            </span>
                          ) : (
                            <span className="inline-flex items-center text-[10px] text-[#047857] bg-[#ecfdf5] px-2 py-0.5 rounded font-bold border border-[#a7f3d0]">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#047857] mr-1.5"></span> Active On-Air
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="px-4 py-2 bg-white border-t border-[#c5c5d3] flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-[#757682] gap-1">
              <div>Displaying {activeRoster.length} active station operators assigned to {selectedStationTab} unit</div>
              <div className="flex items-center space-x-4">
                <span>Directives Enforced: <strong className="text-[#0b1c30]">PRD Section 4.2</strong></span>
                <span>Audit Stamp: <strong className="font-mono text-[#0b1c30]">2026-09-29 UTC</strong></span>
              </div>
            </div>
          </div>

          {/* Secondary Tabular Reference: Inter-Station Department Allocation Matrix */}
          <div className="bg-white border border-[#c5c5d3] rounded-lg p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-[14px] font-bold text-[#0b1c30]">Inter-Station Department Allocation Matrix</h2>
                <p className="text-[11px] text-[#444651]">Breakdown of operational headcounts assigned across all seven statutory departments.</p>
              </div>
              <span className="text-[11px] text-[#757682] font-mono font-bold">TOTAL COMPLIANT: {totalHeadcount}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-center text-[11px]">
              <div className="p-2 rounded bg-[#eff4ff] border border-[#c5c5d3]">
                <span className="text-[#757682] uppercase text-[9px] font-bold block">CEO Office</span>
                <span className="text-[18px] font-bold text-[#00236f]">{getDeptCount('CEO')}</span>
                <span className="text-[9px] text-[#757682] block truncate">Hot FM, Fly, Eight</span>
              </div>
              <div className="p-2 rounded bg-[#eff4ff] border border-[#c5c5d3]">
                <span className="text-[#757682] uppercase text-[9px] font-bold block">Content</span>
                <span className="text-[18px] font-bold text-[#00236f]">{getDeptCount('Content')}</span>
                <span className="text-[9px] text-[#757682] block truncate">SSB, MAX, OFM</span>
              </div>
              <div className="p-2 rounded bg-[#eff4ff] border border-[#c5c5d3]">
                <span className="text-[#757682] uppercase text-[9px] font-bold block">Finance</span>
                <span className="text-[18px] font-bold text-[#00236f]">{getDeptCount('Finance')}</span>
                <span className="text-[9px] text-[#757682] block truncate">Central Ops</span>
              </div>
              <div className="p-2 rounded bg-[#eff4ff] border border-[#c5c5d3]">
                <span className="text-[#757682] uppercase text-[9px] font-bold block">Group HR</span>
                <span className="text-[18px] font-bold text-[#00236f]">{getDeptCount('Human Resources')}</span>
                <span className="text-[9px] text-[#757682] block truncate">Shared Ops</span>
              </div>
              <div className="p-2 rounded bg-[#eff4ff] border border-[#c5c5d3]">
                <span className="text-[#757682] uppercase text-[9px] font-bold block">Marketing</span>
                <span className="text-[18px] font-bold text-[#00236f]">{getDeptCount('Marketing')}</span>
                <span className="text-[9px] text-[#757682] block truncate">SSB, KFM, MAX</span>
              </div>
              <div className="p-2 rounded bg-[#eff4ff] border border-[#c5c5d3]">
                <span className="text-[#757682] uppercase text-[9px] font-bold block">Operation</span>
                <span className="text-[18px] font-bold text-[#00236f]">{getDeptCount('Operation')}</span>
                <span className="text-[9px] text-[#757682] block truncate">MFM, KFM</span>
              </div>
              <div className="p-2 rounded bg-[#eff4ff] border border-[#c5c5d3]">
                <span className="text-[#757682] uppercase text-[9px] font-bold block">Tech</span>
                <span className="text-[18px] font-bold text-[#00236f]">{getDeptCount('Tech')}</span>
                <span className="text-[9px] text-[#757682] block truncate">Engineering</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 4 Columns: Directive Rules Panel & Capacity Ratio Chart */}
        <div className="xl:col-span-4 space-y-4">
          {/* Station Directive Rules Panel */}
          <div className="bg-white border border-[#c5c5d3] rounded-lg p-4 shadow-xs">
            <div className="flex items-center space-x-2 border-b border-[#c5c5d3] pb-2.5 mb-3">
              <span className="material-symbols-outlined text-[#4e45d5] text-xl">rule</span>
              <div>
                <h3 className="text-[14px] font-bold text-[#0b1c30]">Station Directive Rules</h3>
                <p className="text-[10px] text-[#757682]">Enforced under Media Prima Audio PRD v2.5</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-2.5 rounded bg-[#eff4ff] border border-[#c5c5d3]">
                <div className="flex items-center space-x-2">
                  <span className="material-symbols-outlined text-[#00236f] text-base">pin</span>
                  <span className="text-[12px] text-[#0b1c30] font-bold">Strict ID Prefix Assignment</span>
                </div>
                <p className="text-[11px] text-[#444651] mt-1 leading-snug">
                  Every staff identifier must be preceded by station-specific designated prefix strings:
                </p>
                <div className="mt-2 grid grid-cols-2 gap-1.5 font-mono text-[10px]">
                  <span className="bg-white border border-[#c5c5d3] p-1 rounded font-bold">
                    SSB-XXXX <span className="text-[#757682] font-sans font-normal">(Hot)</span>
                  </span>
                  <span className="bg-white border border-[#c5c5d3] p-1 rounded font-bold">
                    MAX-XXXX <span className="text-[#757682] font-sans font-normal">(Fly)</span>
                  </span>
                  <span className="bg-white border border-[#c5c5d3] p-1 rounded font-bold">
                    OFM-XXXX <span className="text-[#757682] font-sans font-normal">(Eight)</span>
                  </span>
                  <span className="bg-white border border-[#c5c5d3] p-1 rounded font-bold">
                    KFM-XXXX <span className="text-[#757682] font-sans font-normal">(Kool)</span>
                  </span>
                  <span className="bg-white border border-[#c5c5d3] p-1 rounded font-bold">
                    MFM-XXXX <span className="text-[#757682] font-sans font-normal">(Molek)</span>
                  </span>
                  <span className="bg-white border border-[#c5c5d3] p-1 rounded font-bold">
                    CON-XXXX <span className="text-[#757682] font-sans font-normal">(Legal)</span>
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded bg-[#eff4ff] border border-[#c5c5d3]">
                <div className="flex items-center space-x-2">
                  <span className="material-symbols-outlined text-[#4e45d5] text-base">subtitles</span>
                  <span className="text-[12px] text-[#0b1c30] font-bold">Contract Suffix Automation ('C')</span>
                </div>
                <p className="text-[11px] text-[#444651] mt-1 leading-relaxed">
                  Fixed-term personnel systematically receive an appended uppercase <strong className="text-[#00236f] font-mono">'C'</strong> suffix (e.g. <span className="font-mono text-[#00236f] font-bold">MAX-2041C</span>). Permanent headcount retains standard numerical format.
                </p>
              </div>

              <div className="p-2.5 rounded bg-[#eff4ff] border border-[#c5c5d3]">
                <div className="flex items-center space-x-2">
                  <span className="material-symbols-outlined text-[#00236f] text-base">forward_to_inbox</span>
                  <span className="text-[12px] text-[#0b1c30] font-bold">Designated Station HOD Gateways</span>
                </div>
                <div className="mt-2 space-y-1 font-mono text-[10px]">
                  <div className="flex justify-between items-center bg-white p-1 rounded border border-[#c5c5d3]">
                    <span className="text-[#757682]">Hot FM</span>
                    <span className="text-[#00236f]">{STATION_GATEWAYS['Hot FM']}</span>
                  </div>
                  <div className="flex justify-between items-center bg-white p-1 rounded border border-[#c5c5d3]">
                    <span className="text-[#757682]">Fly FM</span>
                    <span className="text-[#00236f]">{STATION_GATEWAYS['Fly FM']}</span>
                  </div>
                  <div className="flex justify-between items-center bg-white p-1 rounded border border-[#c5c5d3]">
                    <span className="text-[#757682]">Eight Wuxian</span>
                    <span className="text-[#00236f]">{STATION_GATEWAYS['Eight Wuxian']}</span>
                  </div>
                  <div className="flex justify-between items-center bg-white p-1 rounded border border-[#c5c5d3]">
                    <span className="text-[#757682]">Kool FM</span>
                    <span className="text-[#00236f]">{STATION_GATEWAYS['Kool FM']}</span>
                  </div>
                  <div className="flex justify-between items-center bg-white p-1 rounded border border-[#c5c5d3]">
                    <span className="text-[#757682]">Molek FM</span>
                    <span className="text-[#00236f]">{STATION_GATEWAYS['Molek FM']}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Capacity & Ratio Chart Widget */}
          <div className="bg-white border border-[#c5c5d3] rounded-lg p-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#c5c5d3] pb-2.5 mb-3">
              <div className="flex items-center space-x-2">
                <span className="material-symbols-outlined text-[#00236f] text-xl">pie_chart</span>
                <div>
                  <h3 className="text-[14px] font-bold text-[#0b1c30]">Capacity &amp; Ratio Matrix</h3>
                  <p className="text-[10px] text-[#757682]">Network-Wide Employment Breakdown</p>
                </div>
              </div>
              <span className="font-mono text-[11px] font-bold text-[#00236f]">N={totalHeadcount}</span>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-[11px] mb-1.5">
                  <span className="text-[#0b1c30] font-bold">Headcount Distribution Ratio</span>
                  <span className="text-[#757682]">100% Allocated</span>
                </div>
                <div className="h-3 w-full rounded-full bg-[#e5eeff] flex overflow-hidden">
                  <div className="bg-[#00236f]" style={{ width: `${permPct}%` }} title={`Permanent: ${permPct}%`}></div>
                  <div className="bg-[#4e45d5]" style={{ width: `${hrPct}%` }} title={`HR Contract: ${hrPct}%`}></div>
                  <div className="bg-[#b45309]" style={{ width: `${legalPct}%` }} title={`Legal Contract: ${legalPct}%`}></div>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-[#c5c5d3]">
                <div className="flex items-center justify-between text-[12px]">
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-xs bg-[#00236f]"></span>
                    <span className="text-[#0b1c30] font-medium">Permanent Staff</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-[#0b1c30]">{permTotal}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#e5eeff] font-mono text-[#00236f] font-bold">
                      {permPct}%
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[12px]">
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-xs bg-[#4e45d5]"></span>
                    <span className="text-[#0b1c30] font-medium">HR Contract</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-[#0b1c30]">{hrContractTotal}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#e5eeff] font-mono text-[#4e45d5] font-bold">
                      {hrPct}%
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[12px]">
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-xs bg-[#b45309]"></span>
                    <span className="text-[#0b1c30] font-medium">Legal Contract</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-[#0b1c30]">{legalContractTotal}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#fffbeb] font-mono text-[#b45309] font-bold">
                      {legalPct}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Warning Banner */}
              <div className="mt-3 p-2.5 rounded bg-[#eff4ff] border border-[#c5c5d3] flex items-start space-x-2">
                <span className="material-symbols-outlined text-[#4e45d5] text-base mt-0.5">info</span>
                <p className="text-[10px] text-[#0b1c30] leading-snug">
                  Stations Kool FM (KFM) and Molek FM (MFM) operate with critical 50% non-permanent ratios requiring executive sign-off for seasonal broadcast extensions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
