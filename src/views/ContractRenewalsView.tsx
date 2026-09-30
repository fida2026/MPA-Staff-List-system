import React, { useState } from 'react';
import { useCompliance } from '../context/ComplianceContext';
import { computeStatus, STATION_PREFIX_MAP } from '../data/initialData';
import { StaffRecord, StationName } from '../types/compliance';

export const ContractRenewalsView: React.FC = () => {
  const {
    records,
    selectedRenewalRecordId,
    setSelectedRenewalRecordId,
    openProtocolDocsModal,
    openBulkDispatchModal,
    showToast,
    addAuditLog,
  } = useCompliance();

  const [urgencyFilter, setUrgencyFilter] = useState<'all' | 'legal' | 'hr' | 'expired'>('all');
  const [stationFilter, setStationFilter] = useState<string>('all');

  // Filter records that belong in renewals queue (contract records or expired or pending)
  const queueRecords = records.filter(r => {
    if (r.category === 'HR Permanent') return false; // permanent staff don't have contract renewals
    return true;
  });

  // Apply urgency & station filters
  const filteredRecords = queueRecords.filter(r => {
    const st = computeStatus(r);

    if (stationFilter !== 'all' && r.station !== stationFilter) {
      return false;
    }

    if (urgencyFilter === 'legal') {
      return r.category === 'Legal Contract' && !st.isExpired;
    }
    if (urgencyFilter === 'hr') {
      return r.category === 'HR Contract' && !st.isExpired;
    }
    if (urgencyFilter === 'expired') {
      return st.isExpired;
    }

    return true;
  });

  // Get active inspector record
  const inspectedRecord = records.find(r => r.id === selectedRenewalRecordId) || filteredRecords[0] || queueRecords[0];
  const inspectedStatus = inspectedRecord ? computeStatus(inspectedRecord) : null;

  // Counts for cards
  const legalUnder14 = queueRecords.filter(r => r.category === 'Legal Contract' && computeStatus(r).isPending).length;
  const hrUnder30 = queueRecords.filter(r => r.category === 'HR Contract' && computeStatus(r).isPending).length;
  const expiredCount = queueRecords.filter(r => computeStatus(r).isExpired).length;
  const totalQueue = queueRecords.length;

  // Generate Mailto parameters for inspected record
  const getMailtoDetails = (record: StaffRecord) => {
    const st = computeStatus(record);
    if (st.isExpired) {
      return {
        to: 'SUPPRESSED',
        cc: 'BLOCKED',
        subject: 'DISPATCH_BLOCKED',
        uri: 'DISPATCH_BLOCKED: Email trigger disabled once contract passes expiry date per PRD v2.5.',
        isSuppressed: true,
      };
    }

    const to = record.category === 'Legal Contract' 
      ? (record.adminEmail || 'admin.hr@company.com')
      : (record.hrDeptEmail || 'hr.dept@company.com');
    const cc = record.hodEmail || 'hod.operations@company.com';
    const subject = record.category === 'Legal Contract'
      ? `REMINDER: Legal Contract Expiring Soon - ${record.name} / ${record.staffNo}`
      : `REMINDER: HR Staff Contract Renewal Evaluation - ${record.name} / ${record.staffNo}`;
    
    const body = `Attention Admin & HOD,\n\nThis is an automated compliance notice from ComplianceCore (Media Prima Audio).\n\nContract ${record.staffNo} for ${record.name} (${record.station} - ${record.department}) is due to expire on ${record.expiryDate || 'N/A'} (${st.daysRemaining || 0} days remaining).\n\nPlease initiate ${record.category === 'Legal Contract' ? 'legal renewal or severance' : 'HR appraisal'} protocols immediately.\n\nStation Gateway: ${record.hodEmail}\nCompliance Engine: Active PRD v2.5`;
    const uri = `mailto:${to}?cc=${encodeURIComponent(cc)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    return { to, cc, subject, uri, isSuppressed: false };
  };

  const currentMailto = inspectedRecord ? getMailtoDetails(inspectedRecord) : null;

  const handleCopyUri = () => {
    if (!currentMailto || currentMailto.isSuppressed) {
      showToast("Cannot copy URI: Dispatch suppressed for expired records", "error");
      return;
    }
    navigator.clipboard.writeText(currentMailto.uri);
    showToast("Mailto URI string copied to clipboard", "success");
  };

  const handleDispatch = () => {
    if (!currentMailto || currentMailto.isSuppressed || !inspectedRecord) {
      showToast("Dispatch blocked per PRD v2.5", "error");
      return;
    }
    
    addAuditLog({
      actionType: 'Mailto Triggered',
      operator: 'Single-User Admin',
      targetRecordCode: inspectedRecord.staffNo,
      targetRecordName: inspectedRecord.name,
      changeSummary: `Launched renewal directive dispatch email (${inspectedRecord.category}) via local client`,
      category: 'renewal',
    });

    window.location.href = currentMailto.uri;
    showToast(`Dispatch client launched for ${inspectedRecord.name}`, 'success');
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] w-full mx-auto">
      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-[#c5c5d3]">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-[#e3dfff] text-[#100069] px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase">
              PRD v2.5 Engine
            </span>
            <span className="font-mono text-[#757682] text-[12px]">REGISTRY_REV_2026.10</span>
          </div>
          <h1 className="text-[22px] md:text-[24px] font-bold text-[#0b1c30] mt-1 tracking-tight">
            Contract Renewals &amp; Automated Notification Center
          </h1>
          <p className="text-[13px] text-[#444651] max-w-4xl mt-0.5">
            Differentiated renewal tracking: 14-day threshold for Legal Contracts (Admin + HOD) and 30-day threshold for HR Contracts (HR Dept + HOD) with direct mailto: dispatch.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-[#c5c5d3] rounded-lg text-[12px] text-[#0b1c30] shadow-xs">
            <span className="material-symbols-outlined text-[#4e45d5] text-base">schedule</span>
            <span>Audit Cycle: <strong>Q4 FY2026</strong></span>
          </div>
        </div>
      </div>

      {/* TOP KPI METRIC CARDS (Bento Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Immediate Action Required */}
        <div className="bg-white border border-[#c5c5d3] rounded-lg p-4 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 left-0 bottom-0 w-1 bg-[#ba1a1a]"></div>
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#757682]">Tier 1 Threshold</span>
              <h3 className="text-[15px] font-bold text-[#0b1c30] mt-0.5">Immediate Action Required</h3>
              <p className="text-[12px] text-[#757682]">&le; 14 Days Remaining</p>
            </div>
            <span className="px-2 py-0.5 bg-[#ffdad6] text-[#93000a] rounded text-[10px] font-bold">
              Legal Contract
            </span>
          </div>
          <div className="flex items-baseline justify-between mt-4">
            <div className="text-[32px] font-bold text-[#ba1a1a] leading-none">{legalUnder14}</div>
            <div className="flex items-center gap-1.5 text-[12px] font-semibold text-[#ba1a1a]">
              <span className="w-2 h-2 rounded-full bg-[#ba1a1a] animate-pulse"></span>
              <span>Urgent Legal Review</span>
            </div>
          </div>
        </div>

        {/* Card 2: Upcoming HR Evaluation */}
        <div className="bg-white border border-[#c5c5d3] rounded-lg p-4 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 left-0 bottom-0 w-1 bg-[#4e45d5]"></div>
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#757682]">Tier 2 Threshold</span>
              <h3 className="text-[15px] font-bold text-[#0b1c30] mt-0.5">Upcoming HR Evaluation</h3>
              <p className="text-[12px] text-[#757682]">&le; 30 Days Remaining</p>
            </div>
            <span className="px-2 py-0.5 bg-[#e5eeff] text-[#00236f] rounded text-[10px] font-bold">
              HR Contract
            </span>
          </div>
          <div className="flex items-baseline justify-between mt-4">
            <div className="text-[32px] font-bold text-[#00236f] leading-none">{hrUnder30}</div>
            <div className="flex items-center gap-1.5 text-[12px] font-semibold text-[#444651]">
              <span className="w-2 h-2 rounded-full bg-[#4e45d5]"></span>
              <span>HOD Appraisals Queued</span>
            </div>
          </div>
        </div>

        {/* Card 3: Expired / Action Blocked */}
        <div className="bg-white border border-[#c5c5d3] rounded-lg p-4 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 left-0 bottom-0 w-1 bg-[#757682]"></div>
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#757682]">Compliance Lock</span>
              <h3 className="text-[15px] font-bold text-[#0b1c30] mt-0.5">Expired / Action Blocked</h3>
              <p className="text-[12px] text-[#757682]">Grace Period Passed</p>
            </div>
            <span className="px-2 py-0.5 bg-[#dce9ff] text-[#444651] rounded text-[10px] font-bold">
              Locked
            </span>
          </div>
          <div className="mt-4">
            <div className="text-[32px] font-bold text-[#757682] leading-none">{expiredCount}</div>
            <p className="text-[12px] text-[#ba1a1a] mt-1 leading-tight font-medium">
              Email dispatch suppressed per PRD v2.5
            </p>
          </div>
        </div>

        {/* Card 4: Total Under Review */}
        <div className="bg-white border border-[#c5c5d3] rounded-lg p-4 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 left-0 bottom-0 w-1 bg-[#00236f]"></div>
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#757682]">Consolidated Active Queue</span>
              <h3 className="text-[15px] font-bold text-[#0b1c30] mt-0.5">Total Under Review</h3>
              <p className="text-[12px] text-[#757682]">Across all Media Prima stations</p>
            </div>
            <span className="p-1 rounded bg-[#eff4ff] text-[#00236f]">
              <span className="material-symbols-outlined text-lg">dashboard</span>
            </span>
          </div>
          <div className="flex items-baseline justify-between mt-4">
            <div className="text-[32px] font-bold text-[#00236f] leading-none">{totalQueue}</div>
            <span className="text-[12px] text-[#757682] font-semibold">5 Stations Active</span>
          </div>
        </div>
      </div>

      {/* FILTER & CONTROL TOOLBAR */}
      <div className="bg-white border border-[#c5c5d3] rounded-lg p-3 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-3">
        {/* Urgency Tabs */}
        <div className="flex items-center bg-[#eff4ff] p-1 rounded-lg border border-[#c5c5d3] text-[12px] w-full lg:w-auto overflow-x-auto">
          <button
            onClick={() => setUrgencyFilter('all')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all whitespace-nowrap ${
              urgencyFilter === 'all'
                ? 'bg-white text-[#00236f] shadow-xs'
                : 'text-[#444651] hover:text-[#0b1c30]'
            }`}
          >
            All Urgencies
          </button>

          <button
            onClick={() => setUrgencyFilter('legal')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              urgencyFilter === 'legal'
                ? 'bg-white text-[#00236f] shadow-xs'
                : 'text-[#444651] hover:text-[#0b1c30]'
            }`}
          >
            <span>Legal Contracts (&le; 14d)</span>
            <span className="px-1.5 py-0.2 rounded-full bg-[#ffdad6] text-[#93000a] text-[10px] font-bold">
              {legalUnder14}
            </span>
          </button>

          <button
            onClick={() => setUrgencyFilter('hr')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              urgencyFilter === 'hr'
                ? 'bg-white text-[#00236f] shadow-xs'
                : 'text-[#444651] hover:text-[#0b1c30]'
            }`}
          >
            <span>HR Contracts (&le; 30d)</span>
            <span className="px-1.5 py-0.2 rounded-full bg-[#dce9ff] text-[#00236f] text-[10px] font-bold">
              {hrUnder30}
            </span>
          </button>

          <button
            onClick={() => setUrgencyFilter('expired')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all whitespace-nowrap ${
              urgencyFilter === 'expired'
                ? 'bg-white text-[#00236f] shadow-xs'
                : 'text-[#444651] hover:text-[#0b1c30]'
            }`}
          >
            Expired Contracts ({expiredCount})
          </button>
        </div>

        {/* Station Filter & Bulk Action */}
        <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
          <div className="flex items-center gap-2">
            <label className="text-[12px] font-semibold text-[#757682] whitespace-nowrap">Station Filter:</label>
            <select
              value={stationFilter}
              onChange={(e) => setStationFilter(e.target.value)}
              className="h-[34px] bg-white border border-[#c5c5d3] rounded-lg text-[12px] text-[#0b1c30] px-2.5 focus:border-[#4e45d5] focus:ring-2 focus:ring-[#4e45d5]/15 outline-none"
            >
              <option value="all">All Stations (Hot, Fly, Eight, Kool, Molek)</option>
              <option value="Hot FM">Hot FM</option>
              <option value="Fly FM">Fly FM</option>
              <option value="Eight Wuxian">Eight Wuxian</option>
              <option value="Kool FM">Kool FM</option>
              <option value="Molek FM">Molek FM</option>
            </select>
          </div>

          <button
            onClick={openBulkDispatchModal}
            className="flex items-center gap-1.5 h-[34px] px-3 bg-[#f8f9ff] border border-[#c5c5d3] text-[#444651] hover:text-[#00236f] hover:bg-[#eff4ff] rounded-lg text-[12px] font-semibold transition-colors"
            title="Single-operator browser protocol mandates individual client verification."
          >
            <span className="material-symbols-outlined text-base">forward_to_inbox</span>
            <span className="hidden sm:inline">Bulk Dispatch Mailto Summary</span>
            <span className="sm:hidden">Bulk</span>
          </button>
        </div>
      </div>

      {/* DUAL PANE: MAIN TABLE (60%) + INSPECTOR DRAWER (40%) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* CONTRACTS TABULAR RECORD (7-8 cols ~ 60%) */}
        <div className="xl:col-span-8 bg-white border border-[#c5c5d3] rounded-lg shadow-xs overflow-hidden flex flex-col">
          <div className="px-4 py-3 bg-[#eff4ff] border-b border-[#c5c5d3] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#00236f] text-lg">table_chart</span>
              <span className="text-[14px] font-bold text-[#0b1c30]">Queue Registry (PRD Compliant Thresholds)</span>
            </div>
            <span className="text-[12px] text-[#757682]">
              Showing {filteredRecords.length} High-Priority Records
            </span>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f8f9ff] border-b border-[#c5c5d3] text-[11px] font-bold text-[#444651] uppercase tracking-wider select-none">
                  <th className="py-2.5 px-3">Contract / Name</th>
                  <th className="py-2.5 px-3">Station &amp; Dept</th>
                  <th className="py-2.5 px-3">Expiry Date</th>
                  <th className="py-2.5 px-3">Recipient Route</th>
                  <th className="py-2.5 px-3">Compliance Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c5c5d3] text-[12px]">
                {filteredRecords.map((r) => {
                  const st = computeStatus(r);
                  const isSelected = inspectedRecord?.id === r.id;

                  let rowBg = 'hover:bg-[#eff4ff]/60 cursor-pointer transition-colors';
                  if (isSelected) {
                    rowBg = 'bg-[#e5eeff]/50 border-l-4 border-[#4e45d5] cursor-pointer';
                  } else if (st.isExpired) {
                    rowBg = 'bg-[#fff1f2]/40 hover:bg-[#fff1f2]/80 cursor-pointer transition-colors';
                  }

                  let routeLabel = 'Admin + HOD';
                  let routeSub = 'admin.hr + hod';
                  if (r.category === 'HR Contract') {
                    routeLabel = 'HR Dept + HOD';
                    routeSub = 'hr.dept + hod';
                  }
                  if (st.isExpired) {
                    routeLabel = 'Blocked';
                    routeSub = 'suppressed';
                  }

                  return (
                    <tr
                      key={r.id}
                      onClick={() => setSelectedRenewalRecordId(r.id)}
                      className={rowBg}
                    >
                      <td className="py-2.5 px-3">
                        <div className={`font-mono font-bold ${st.isExpired ? 'text-[#ba1a1a]' : 'text-[#00236f]'}`}>
                          {r.staffNo}
                        </div>
                        <div className="font-semibold text-[#0b1c30]">{r.name}</div>
                      </td>

                      <td className="py-2.5 px-3">
                        <span className="inline-block px-1.5 py-0.5 rounded bg-[#e5eeff] text-[#0b1c30] text-[10px] font-bold">
                          {r.station}
                        </span>
                        <div className="text-[#757682] text-[11px] truncate max-w-[130px]">{r.department}</div>
                      </td>

                      <td className="py-2.5 px-3">
                        <div className={`font-mono font-bold ${st.isExpired ? 'text-[#ba1a1a]' : 'text-[#0b1c30]'}`}>
                          {r.expiryDate || 'N/A'}
                        </div>
                        {st.isExpired ? (
                          <div className="text-[10px] text-[#ba1a1a] font-bold">Overdue {st.overdueDays}d</div>
                        ) : st.isPending ? (
                          <div className={`text-[10px] font-bold ${r.category === 'Legal Contract' ? 'text-[#ba1a1a]' : 'text-[#b45309]'}`}>
                            {st.daysRemaining} days remaining
                          </div>
                        ) : (
                          <div className="text-[10px] text-[#757682]">{st.daysRemaining} days remaining</div>
                        )}
                      </td>

                      <td className="py-2.5 px-3">
                        <div className="text-[10px] uppercase font-bold text-[#757682]">{routeLabel}</div>
                        <div className="font-mono text-[11px] text-[#757682] truncate max-w-[120px]">{routeSub}</div>
                      </td>

                      <td className="py-2.5 px-3 whitespace-nowrap">
                        {st.isExpired ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#ffdad6] text-[#93000a] text-[10px] font-bold border border-[#fecdd3]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a]"></span>
                            Expired ({st.overdueDays}d)
                          </span>
                        ) : (
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${st.colorClasses}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${st.dotColor}`}></span>
                            Pending Renewal ({st.daysRemaining}d)
                          </span>
                        )}
                      </td>

                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        {st.isExpired ? (
                          <span className="inline-block px-2.5 py-1 bg-[#e5eeff] border border-[#c5c5d3] text-[#757682] rounded text-[10px] font-bold cursor-not-allowed">
                            Expired - Email Suppressed
                          </span>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedRenewalRecordId(r.id);
                              const details = getMailtoDetails(r);
                              if (details && !details.isSuppressed) {
                                window.location.href = details.uri;
                                showToast(`Launched mailto for ${r.name}`, 'success');
                              }
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#00236f] hover:bg-[#1e3a8a] text-white rounded text-[10px] font-bold transition-all shadow-xs active:scale-[0.98]"
                          >
                            <span className="material-symbols-outlined text-xs">outgoing_mail</span>
                            <span>Launch mailto: Alert</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="px-4 py-2.5 bg-[#f8f9ff] border-t border-[#c5c5d3] flex flex-col sm:flex-row items-start sm:items-center justify-between text-[11px] text-[#757682] gap-2">
            <div>
              Threshold Rules: <strong>Legal &le; 14 Days</strong> &bull; <strong>HR &le; 30 Days</strong>
            </div>
            <div className="flex items-center gap-2">
              <span>Compliance Engine: Active v2.5</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#4e45d5]"></span>
            </div>
          </div>
        </div>

        {/* SIDE DRAWER: DIRECT EMAIL DISPATCH INSPECTOR (4-5 cols ~ 40%) */}
        <div className="xl:col-span-4 bg-white border border-[#c5c5d3] rounded-lg shadow-xs flex flex-col sticky top-20">
          <div className="px-4 py-3 bg-[#eff4ff] border-b border-[#c5c5d3] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#00236f] text-lg">mark_email_read</span>
              <h2 className="text-[14px] font-bold text-[#0b1c30]">Direct Email Dispatch Inspector</h2>
            </div>
            <span className="px-2 py-0.5 bg-[#dce9ff] text-[#00236f] rounded text-[10px] font-bold">
              Single-Operator
            </span>
          </div>

          {inspectedRecord && currentMailto ? (
            <div className="p-4 space-y-4">
              {/* Protocol Banner */}
              <div className="p-2.5 bg-[#eff4ff] border border-[#c5c5d3] rounded-lg flex items-start gap-2.5">
                <span className="material-symbols-outlined text-[#4e45d5] text-base mt-0.5">security</span>
                <div className="text-[11px] text-[#0b1c30] leading-snug">
                  <strong className="text-[#00236f]">Standard Mailto Routing:</strong> Notifications are generated client-side to ensure compliance officers review CC lists prior to dispatch.
                </div>
              </div>

              {/* Inspector Details */}
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#757682] block mb-1">
                    Target Entity &amp; ID
                  </label>
                  <div className="flex items-center justify-between p-2 bg-[#f8f9ff] rounded border border-[#c5c5d3]">
                    <span className="font-bold text-[#0b1c30] text-[13px]">{inspectedRecord.name}</span>
                    <span className="font-mono px-1.5 py-0.5 bg-[#e5eeff] text-[#00236f] rounded text-[11px] font-bold">
                      {inspectedRecord.staffNo}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#757682] block mb-1">
                      Station / Category
                    </label>
                    <div className="p-2 bg-[#f8f9ff] rounded border border-[#c5c5d3] text-[11px] text-[#0b1c30] font-semibold truncate">
                      {inspectedRecord.station} ({inspectedRecord.category === 'Legal Contract' ? 'Legal' : 'HR'})
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#757682] block mb-1">
                      Expiration Status
                    </label>
                    <div className={`p-2 bg-[#f8f9ff] rounded border border-[#c5c5d3] text-[11px] font-bold truncate ${
                      inspectedStatus?.isExpired ? 'text-[#ba1a1a]' : 'text-[#b45309]'
                    }`}>
                      {inspectedRecord.expiryDate} {inspectedStatus?.isExpired ? `(Overdue ${inspectedStatus.overdueDays}d)` : `(${inspectedStatus?.daysRemaining}d)`}
                    </div>
                  </div>
                </div>

                {/* Mailto Headers */}
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#757682] block mb-1">
                    Recipient Header (To)
                  </label>
                  <div className={`p-2 rounded border font-mono text-[12px] truncate ${
                    currentMailto.isSuppressed 
                      ? 'bg-[#ffdad6]/40 border-[#ba1a1a] text-[#ba1a1a] font-bold'
                      : 'bg-[#f8f9ff] border-[#c5c5d3] text-[#0b1c30]'
                  }`}>
                    {currentMailto.to}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#757682] block mb-1">
                    Carbon Copy (CC) Header
                  </label>
                  <div className={`p-2 rounded border font-mono text-[12px] truncate ${
                    currentMailto.isSuppressed 
                      ? 'bg-[#ffdad6]/40 border-[#ba1a1a] text-[#ba1a1a] font-bold'
                      : 'bg-[#f8f9ff] border-[#c5c5d3] text-[#0b1c30]'
                  }`}>
                    {currentMailto.cc}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#757682] block mb-1">
                    Subject Header Template
                  </label>
                  <div className="p-2 bg-[#f8f9ff] rounded border border-[#c5c5d3] text-[12px] text-[#0b1c30] font-semibold leading-tight line-clamp-2">
                    {currentMailto.subject}
                  </div>
                </div>

                {/* Pre-composed Raw Mailto URI */}
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#757682] block mb-1">
                    Raw mailto: URI String
                  </label>
                  <div className="p-2 bg-[#eff4ff] rounded border border-[#c5c5d3] font-mono text-[10px] text-[#444651] break-all select-all max-h-20 overflow-y-auto custom-scrollbar">
                    {currentMailto.uri}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-[#c5c5d3] flex items-center gap-2">
                <button
                  onClick={handleCopyUri}
                  disabled={currentMailto.isSuppressed}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 border border-[#c5c5d3] rounded-lg text-[12px] font-semibold transition-colors ${
                    currentMailto.isSuppressed
                      ? 'bg-[#eff4ff] text-[#757682] cursor-not-allowed opacity-60'
                      : 'bg-white hover:bg-[#eff4ff] text-[#0b1c30]'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">content_copy</span>
                  <span>Copy URI</span>
                </button>

                <button
                  onClick={handleDispatch}
                  disabled={currentMailto.isSuppressed}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-[12px] font-bold transition-all shadow-xs ${
                    currentMailto.isSuppressed
                      ? 'bg-[#e5eeff] text-[#757682] border border-[#c5c5d3] cursor-not-allowed opacity-60'
                      : 'bg-[#00236f] hover:bg-[#1e3a8a] text-white'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">
                    {currentMailto.isSuppressed ? 'block' : 'send'}
                  </span>
                  <span>{currentMailto.isSuppressed ? 'Dispatch Blocked' : 'Dispatch Client'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-[#757682]">
              <span className="material-symbols-outlined text-3xl">inbox</span>
              <p className="text-[13px] mt-2 font-semibold">Select a contract from the queue to inspect</p>
            </div>
          )}
        </div>
      </div>

      {/* AUDIT NOTES & GOVERNANCE COMPLIANCE BANNER */}
      <div className="bg-[#eff4ff] border border-[#c5c5d3] rounded-lg p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-[#00236f] text-2xl mt-0.5">verified</span>
          <div>
            <h4 className="text-[14px] font-bold text-[#0b1c30]">PRD v2.5 Mailto Engine Rules Enforced</h4>
            <p className="text-[12px] text-[#444651] mt-0.5">
              Contracts with status ‘Expired’ automatically revoke automated mailto triggers to avoid duplicate or unauthorized legal renewals. Manual executive escalation required through the Audit Vault.
            </p>
          </div>
        </div>
        <button
          onClick={openProtocolDocsModal}
          className="px-3.5 py-1.5 bg-white border border-[#c5c5d3] hover:bg-[#e5eeff] rounded-lg text-[12px] font-bold text-[#00236f] transition-colors whitespace-nowrap shrink-0"
        >
          View Protocol Docs
        </button>
      </div>
    </div>
  );
};
