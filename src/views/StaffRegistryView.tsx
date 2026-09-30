import React, { useState } from 'react';
import { useCompliance } from '../context/ComplianceContext';
import { computeStatus, calculateTenure } from '../data/initialData';
import { StaffCategory, StaffRecord } from '../types/compliance';

export const StaffRegistryView: React.FC = () => {
  const {
    records,
    openAddStaffScreen,
    openEditStaffScreen,
    deleteStaffRecord,
    openPdfModal,
    exportToCSV,
    globalSearchQuery,
    setGlobalSearchQuery,
    stats,
    showToast,
    addAuditLog,
    setSelectedRenewalRecordId,
    setActiveTab,
  } = useCompliance();

  const [currentMonthFilter, setCurrentMonthFilter] = useState<string>('ALL');
  const [currentCategoryFilter, setCurrentCategoryFilter] = useState<string>('ALL');
  const [currentStatusFilter, setCurrentStatusFilter] = useState<string>('ALL');

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  // Filter records
  const filteredRecords = records.filter(r => {
    // Search query
    if (globalSearchQuery) {
      const q = globalSearchQuery.toLowerCase();
      const match =
        r.name.toLowerCase().includes(q) ||
        r.ic.toLowerCase().includes(q) ||
        r.staffNo.toLowerCase().includes(q) ||
        r.station.toLowerCase().includes(q) ||
        r.department.toLowerCase().includes(q);
      if (!match) return false;
    }

    // Month filter
    if (currentMonthFilter !== 'ALL') {
      if (!r.joinDate) return false;
      const d = new Date(r.joinDate);
      const mIdx = d.getMonth();
      if (months[mIdx] !== currentMonthFilter) return false;
    }

    // Category filter
    if (currentCategoryFilter !== 'ALL' && r.category !== currentCategoryFilter) {
      return false;
    }

    // Status filter
    if (currentStatusFilter !== 'ALL') {
      const st = computeStatus(r);
      if (currentStatusFilter === 'Pending Renewal' && !st.isPending) return false;
      if (currentStatusFilter === 'Expired' && !st.isExpired) return false;
      if (currentStatusFilter === 'Active' && (st.isPending || st.isExpired)) return false;
    }

    return true;
  });

  const resetAllFilters = () => {
    setCurrentMonthFilter('ALL');
    setCurrentCategoryFilter('ALL');
    setCurrentStatusFilter('ALL');
    setGlobalSearchQuery('');
  };

  const hasActiveFilters =
    currentMonthFilter !== 'ALL' ||
    currentCategoryFilter !== 'ALL' ||
    currentStatusFilter !== 'ALL' ||
    Boolean(globalSearchQuery);

  const handleLaunchMailto = (record: StaffRecord) => {
    setSelectedRenewalRecordId(record.id);
    setActiveTab('renewals');
    showToast(`Opening Renewal Notification Center for ${record.name}`, 'info');
  };

  return (
    <div className="p-6 space-y-5 max-w-[1600px] w-full mx-auto">
      {/* TOP CONTROL HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-[#c5c5d3] shadow-xs">
        <div>
          <h1 className="text-[20px] md:text-[22px] font-bold text-[#00236f] tracking-tight">
            Staff Registry &amp; Compliance Console
          </h1>
          <p className="text-[12px] text-[#757682] mt-0.5">
            Corporate media multi-station operational records, contract lifecycles and compliance audits.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Global Search */}
          <div className="relative min-w-[240px] md:min-w-[300px]">
            <span className="material-symbols-outlined absolute left-3 top-2 text-[#757682] text-lg pointer-events-none">
              search
            </span>
            <input
              type="text"
              value={globalSearchQuery}
              onChange={(e) => setGlobalSearchQuery(e.target.value)}
              placeholder="Search Name or IC Number (All Months)..."
              className="w-full pl-9 pr-8 h-9 text-[12px] rounded-lg border border-[#c5c5d3] focus:border-[#4e45d5] focus:ring-2 focus:ring-[#4e45d5]/20 outline-none transition-all placeholder:text-[#757682]"
            />
            {globalSearchQuery && (
              <button
                onClick={() => setGlobalSearchQuery('')}
                className="absolute right-2.5 top-2 text-[#757682] hover:text-[#0b1c30]"
              >
                <span className="material-symbols-outlined text-sm">cancel</span>
              </button>
            )}
          </div>

          {/* Export to CSV */}
          <button
            onClick={exportToCSV}
            className="h-9 px-3.5 rounded-lg border border-[#c5c5d3] bg-white hover:bg-[#eff4ff] text-[#0b1c30] text-[12px] font-semibold flex items-center space-x-1.5 transition-all shadow-xs"
          >
            <span className="material-symbols-outlined text-[16px]">file_download</span>
            <span>Export to CSV</span>
          </button>
        </div>
      </div>

      {/* SUMMARY KPI METRICS CARDS (Bento Grid) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Staff */}
        <div
          onClick={() => { setCurrentCategoryFilter('ALL'); setCurrentStatusFilter('ALL'); }}
          className={`bg-white p-3.5 rounded-xl border shadow-xs cursor-pointer transition-all ${
            currentCategoryFilter === 'ALL' && currentStatusFilter === 'ALL' ? 'border-[#00236f] ring-2 ring-[#00236f]/15' : 'border-[#c5c5d3] hover:border-[#4e45d5]'
          }`}
        >
          <div className="flex items-center justify-between text-[#757682] text-[10px] font-bold uppercase tracking-wider">
            <span>Total Staff</span>
            <span className="material-symbols-outlined text-[#00236f]">groups</span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-[26px] font-bold text-[#00236f]">{stats.total}</span>
            <span className="text-[10px] text-[#757682] font-semibold">Media Prima</span>
          </div>
        </div>

        {/* HR Permanent */}
        <div
          onClick={() => { setCurrentCategoryFilter('HR Permanent'); setCurrentStatusFilter('ALL'); }}
          className={`bg-white p-3.5 rounded-xl border shadow-xs cursor-pointer transition-all ${
            currentCategoryFilter === 'HR Permanent' ? 'border-[#4e45d5] ring-2 ring-[#4e45d5]/15' : 'border-[#c5c5d3] hover:border-[#4e45d5]'
          }`}
        >
          <div className="flex items-center justify-between text-[#757682] text-[10px] font-bold uppercase tracking-wider">
            <span>HR Permanent</span>
            <span className="material-symbols-outlined text-[#4e45d5]">verified</span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-[26px] font-bold text-[#0b1c30]">{stats.hrPermanent}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#e5eeff] text-[#00236f] font-bold">
              Permanent
            </span>
          </div>
        </div>

        {/* HR Contract */}
        <div
          onClick={() => { setCurrentCategoryFilter('HR Contract'); setCurrentStatusFilter('ALL'); }}
          className={`bg-white p-3.5 rounded-xl border shadow-xs cursor-pointer transition-all ${
            currentCategoryFilter === 'HR Contract' ? 'border-[#4e45d5] ring-2 ring-[#4e45d5]/15' : 'border-[#c5c5d3] hover:border-[#4e45d5]'
          }`}
        >
          <div className="flex items-center justify-between text-[#757682] text-[10px] font-bold uppercase tracking-wider">
            <span>HR Contract</span>
            <span className="material-symbols-outlined text-[#4e45d5]">assignment_ind</span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-[26px] font-bold text-[#0b1c30]">{stats.hrContract}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-800 font-bold border border-blue-200">
              MRF Bound
            </span>
          </div>
        </div>

        {/* Legal Contract */}
        <div
          onClick={() => { setCurrentCategoryFilter('Legal Contract'); setCurrentStatusFilter('ALL'); }}
          className={`bg-white p-3.5 rounded-xl border shadow-xs cursor-pointer transition-all ${
            currentCategoryFilter === 'Legal Contract' ? 'border-[#00236f] ring-2 ring-[#00236f]/15' : 'border-[#c5c5d3] hover:border-[#4e45d5]'
          }`}
        >
          <div className="flex items-center justify-between text-[#757682] text-[10px] font-bold uppercase tracking-wider">
            <span>Legal Contract</span>
            <span className="material-symbols-outlined text-[#00236f]">gavel</span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-[26px] font-bold text-[#0b1c30]">{stats.legalContract}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-800 font-bold border border-indigo-200">
              CON Rule
            </span>
          </div>
        </div>

        {/* Pending Renewal (Warning) */}
        <div
          onClick={() => { setCurrentStatusFilter('Pending Renewal'); setCurrentCategoryFilter('ALL'); }}
          className={`p-3.5 rounded-xl border shadow-xs cursor-pointer transition-all ${
            currentStatusFilter === 'Pending Renewal'
              ? 'bg-[#fffbeb] border-[#b45309] ring-2 ring-[#b45309]/20'
              : 'bg-[#fffbeb]/60 border-[#fde68a] hover:border-[#b45309]'
          }`}
        >
          <div className="flex items-center justify-between text-[#b45309] text-[10px] font-bold uppercase tracking-wider">
            <span>Pending Renewal</span>
            <span className="material-symbols-outlined text-[#b45309]">warning</span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-[26px] font-bold text-[#b45309]">{stats.pendingRenewals}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#fef3c7] text-[#92400e] font-bold border border-[#fde68a]">
              &le; 30d / 14d
            </span>
          </div>
        </div>

        {/* Expired (Critical) */}
        <div
          onClick={() => { setCurrentStatusFilter('Expired'); setCurrentCategoryFilter('ALL'); }}
          className={`p-3.5 rounded-xl border shadow-xs cursor-pointer transition-all ${
            currentStatusFilter === 'Expired'
              ? 'bg-[#fff1f2] border-[#ba1a1a] ring-2 ring-[#ba1a1a]/20'
              : 'bg-[#fff1f2]/70 border-[#fecdd3] hover:border-[#ba1a1a]'
          }`}
        >
          <div className="flex items-center justify-between text-[#ba1a1a] text-[10px] font-bold uppercase tracking-wider">
            <span>Expired</span>
            <span className="material-symbols-outlined text-[#ba1a1a]">error</span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-[26px] font-bold text-[#ba1a1a]">{stats.expired}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#fee2e2] text-[#991b1b] font-bold border border-[#fecdd3]">
              Overdue
            </span>
          </div>
        </div>
      </div>

      {/* MONTH-TABBED NAVIGATION BAR */}
      <div className="bg-white rounded-xl border border-[#c5c5d3] shadow-xs overflow-hidden">
        <div className="px-4 py-2 border-b border-[#c5c5d3] flex items-center justify-between bg-[#f8f9ff]">
          <div className="flex items-center space-x-2">
            <span className="material-symbols-outlined text-[#757682] text-base">calendar_month</span>
            <span className="text-[12px] font-bold text-[#0b1c30]">Filter by Join Date Cohort Month:</span>
          </div>
          <div className="text-[11px] text-[#757682]">
            Showing:{' '}
            <span className="font-bold text-[#00236f]">
              {currentMonthFilter === 'ALL' ? 'All Months' : `${currentMonthFilter} Cohort`}
            </span>
          </div>
        </div>

        <div className="px-3 py-2 flex items-center space-x-1.5 overflow-x-auto custom-scrollbar">
          <button
            onClick={() => setCurrentMonthFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold flex items-center space-x-1.5 whitespace-nowrap transition-all ${
              currentMonthFilter === 'ALL'
                ? 'bg-[#00236f] text-white font-bold shadow-xs'
                : 'bg-white hover:bg-[#eff4ff] text-[#444651]'
            }`}
          >
            <span>All Months</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              currentMonthFilter === 'ALL' ? 'bg-white/20 text-white' : 'bg-[#e5eeff] text-[#00236f]'
            }`}>
              {records.length}
            </span>
          </button>

          {months.map((m, idx) => {
            const count = records.filter(r => {
              if (!r.joinDate) return false;
              const d = new Date(r.joinDate);
              return d.getMonth() === idx;
            }).length;

            const isActive = currentMonthFilter === m;

            return (
              <button
                key={m}
                onClick={() => setCurrentMonthFilter(m)}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold flex items-center space-x-1.5 whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#00236f] text-white font-bold shadow-xs'
                    : 'bg-white hover:bg-[#eff4ff] text-[#444651]'
                }`}
              >
                <span>{m}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-[#e5eeff] text-[#00236f]'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* STAFF RECORDS TABLE PANE */}
      <div className="bg-white rounded-xl border border-[#c5c5d3] shadow-xs overflow-hidden">
        <div className="px-5 py-3 border-b border-[#c5c5d3] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-3">
            <span className="text-[15px] font-bold text-[#0b1c30]">Staff Master Registry</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#dce9ff] text-[#00236f]">
              {filteredRecords.length} Records
            </span>
            {hasActiveFilters && (
              <button
                onClick={resetAllFilters}
                className="text-[11px] font-bold text-[#4e45d5] hover:underline flex items-center space-x-1"
              >
                <span className="material-symbols-outlined text-xs">restart_alt</span>
                <span>Reset Filters</span>
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono">
            <span className="text-[#757682] font-sans font-medium">Station Legend:</span>
            <span className="px-1.5 py-0.5 rounded bg-[#eff4ff] text-[#00236f] font-bold">SSB: Hot FM</span>
            <span className="px-1.5 py-0.5 rounded bg-[#eff4ff] text-[#00236f] font-bold">MAX: Fly FM</span>
            <span className="px-1.5 py-0.5 rounded bg-[#eff4ff] text-[#00236f] font-bold">OFM: Eight</span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">KFM: Kool FM</span>
            <span className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-800 font-bold border border-purple-200">MFM: Molek FM</span>
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f8f9ff] border-b border-[#c5c5d3] text-[11px] font-bold text-[#757682] uppercase select-none">
                <th className="py-2.5 px-3 w-10 text-center">#</th>
                <th className="py-2.5 px-3">Staff No</th>
                <th className="py-2.5 px-3">Staff Name &amp; IC</th>
                <th className="py-2.5 px-3">Station</th>
                <th className="py-2.5 px-3">Department</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Join Date (Tenure)</th>
                <th className="py-2.5 px-3">Contract Expiry</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-center">PDF Doc</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c5c5d3]/60 text-[12px]">
              {filteredRecords.map((r, index) => {
                const st = computeStatus(r);
                const tenure = calculateTenure(r.joinDate);

                let stationBadge = 'bg-[#eff4ff] text-[#00236f]';
                if (r.station === 'Kool FM') stationBadge = 'bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold';
                if (r.station === 'Molek FM') stationBadge = 'bg-purple-50 text-purple-800 border border-purple-200 font-bold';

                return (
                  <tr key={r.id} className="hover:bg-[#eff4ff]/40 transition-colors">
                    <td className="py-2.5 px-3 text-center text-[#757682] font-mono text-[11px]">
                      {index + 1}
                    </td>

                    <td className="py-2.5 px-3 font-mono font-bold text-[#00236f] whitespace-nowrap">
                      {r.staffNo}
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-[#0b1c30]">{r.name}</div>
                      <div className="text-[10px] text-[#757682] font-mono">{r.ic}</div>
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${stationBadge}`}>
                        {r.station}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-[#444651] whitespace-nowrap">
                      {r.department}
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap">
                      {r.category === 'HR Permanent' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#e5eeff] text-[#00236f] border border-[#c5c5d3]">
                          HR Permanent
                        </span>
                      ) : r.category === 'HR Contract' ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                          HR Contract
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-200">
                          Legal Contract
                        </span>
                      )}
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <div className="font-mono text-[11px] text-[#0b1c30]">{r.joinDate}</div>
                      <div className="text-[10px] text-[#757682]">Tenure: {tenure}</div>
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap font-mono text-[11px]">
                      {r.expiryDate ? (
                        <span className={st.isExpired ? 'text-[#ba1a1a] font-bold' : st.isPending ? 'text-[#b45309] font-bold' : 'text-[#0b1c30]'}>
                          {r.expiryDate}
                        </span>
                      ) : (
                        <span className="text-[#757682] italic">Permanent</span>
                      )}
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${st.colorClasses}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${st.dotColor} mr-1.5`}></span>
                        {st.label}
                        {st.isExpired && st.overdueDays !== undefined && (
                          <span className="ml-1 opacity-80">({st.overdueDays}d)</span>
                        )}
                        {st.isPending && st.daysRemaining !== undefined && (
                          <span className="ml-1 opacity-80">({st.daysRemaining}d)</span>
                        )}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
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
                            department: r.department,
                            expiryDate: r.expiryDate,
                            joinDate: r.joinDate,
                          })}
                          className="inline-flex items-center px-2 py-1 rounded border border-[#c5c5d3] bg-white hover:bg-[#eff4ff] text-[#00236f] text-[11px] font-bold transition-all shadow-2xs"
                        >
                          <span className="material-symbols-outlined text-[#be123c] mr-1 text-sm">picture_as_pdf</span>
                          <span>View PDF</span>
                        </button>
                      ) : (
                        <span className="text-[10px] text-[#757682] italic">No PDF</span>
                      )}
                    </td>

                    <td className="py-2.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-1">
                        {st.isExpired ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#ffdad6] text-[#93000a] border border-[#fecdd3]" title="Expired: Email dispatch suppressed">
                            <span className="material-symbols-outlined mr-0.5 text-xs">block</span>
                            Expired
                          </span>
                        ) : st.isPending ? (
                          <button
                            onClick={() => handleLaunchMailto(r)}
                            className="p-1 text-[#b45309] hover:bg-[#fffbeb] rounded transition-colors"
                            title="Launch Mailto Renewal Inspector"
                          >
                            <span className="material-symbols-outlined text-base">forward_to_inbox</span>
                          </button>
                        ) : null}

                        <button
                          onClick={() => openEditStaffScreen(r.id)}
                          className="p-1 text-[#444651] hover:text-[#00236f] hover:bg-[#eff4ff] rounded transition-colors"
                          title="Edit Staff Record"
                        >
                          <span className="material-symbols-outlined text-base">edit</span>
                        </button>

                        <button
                          onClick={() => deleteStaffRecord(r.id)}
                          className="p-1 text-[#444651] hover:text-[#ba1a1a] hover:bg-[#fff1f2] rounded transition-colors"
                          title="Delete Staff Record"
                        >
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Empty Search State */}
        {filteredRecords.length === 0 && (
          <div className="py-16 text-center">
            <span className="material-symbols-outlined text-[#757682] text-5xl">person_search</span>
            <p className="text-[15px] font-bold text-[#0b1c30] mt-2">No matching staff records found</p>
            <p className="text-[12px] text-[#757682] mt-0.5">Try clearing your search query or switching to 'All Months'.</p>
            <button
              onClick={resetAllFilters}
              className="mt-4 px-4 py-2 rounded-lg bg-[#00236f] text-white text-[12px] font-bold hover:bg-[#1e3a8a] transition-all"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
