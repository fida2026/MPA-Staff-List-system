import React, { useState } from 'react';
import { useCompliance } from '../context/ComplianceContext';

export const TopNavBar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    stats,
    openAddStaffScreen,
    exportToCSV,
    globalSearchQuery,
    setGlobalSearchQuery,
    openProtocolDocsModal,
    showToast,
  } = useCompliance();

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <header className="bg-white border-b border-[#c5c5d3] shadow-xs sticky top-0 z-40 w-full select-none">
      <div className="flex justify-between items-center w-full px-6 py-2.5 max-w-full">
        {/* Left: Brand & Search */}
        <div className="flex items-center gap-6">
          <div 
            className="flex items-center gap-2.5 cursor-pointer"
            onClick={() => setActiveTab('registry')}
          >
            <div className="w-8 h-8 rounded-lg bg-[#00236f] flex items-center justify-center text-white shadow-xs">
              <span className="material-symbols-outlined text-white" style={{ fontSize: '20px' }}>policy</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[15px] font-bold text-[#00236f] tracking-tight leading-tight hidden sm:inline">
                ComplianceCore Staff &amp; Renewal Registry
              </span>
              <span className="text-[15px] font-bold text-[#00236f] tracking-tight leading-tight sm:hidden">
                ComplianceCore
              </span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative w-72 md:w-80 hidden lg:block">
            <span className="material-symbols-outlined absolute left-3 top-2 text-[#757682] text-lg pointer-events-none">
              search
            </span>
            <input
              type="text"
              value={globalSearchQuery}
              onChange={(e) => setGlobalSearchQuery(e.target.value)}
              placeholder="Search CON ID, staff, or station..."
              className="w-full bg-[#eff4ff] border border-[#c5c5d3] rounded-lg pl-9 pr-8 py-1.5 text-[13px] text-[#0b1c30] focus:outline-none focus:border-[#4e45d5] focus:ring-2 focus:ring-[#4e45d5]/15 transition-all placeholder:text-[#757682]"
            />
            {globalSearchQuery && (
              <button
                onClick={() => setGlobalSearchQuery('')}
                className="absolute right-2.5 top-2 text-[#757682] hover:text-[#0b1c30]"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            )}
          </div>
        </div>

        {/* Right: Actions, Badges, Help, Profile */}
        <div className="flex items-center gap-3">
          <button
            onClick={exportToCSV}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#f8f9ff] border border-[#c5c5d3] text-[#0b1c30] rounded-lg text-[12px] font-semibold hover:bg-[#eff4ff] transition-colors shadow-xs active:scale-[0.99]"
            title="Export CSV data"
          >
            <span className="material-symbols-outlined text-[16px]">file_download</span>
            <span>Export Data</span>
          </button>

          <button
            onClick={openAddStaffScreen}
            className="flex items-center gap-1 px-3.5 py-1.5 bg-[#00236f] hover:bg-[#1e3a8a] text-white rounded-lg text-[12px] font-bold transition-all shadow-xs active:scale-[0.99]"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>+ Add Staff</span>
          </button>

          <div className="h-5 w-px bg-[#c5c5d3] mx-0.5 hidden sm:block"></div>

          {/* Notifications Trigger */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="p-1.5 text-[#444651] hover:text-[#00236f] hover:bg-[#eff4ff] rounded-lg transition-colors relative"
              title="Compliance Notifications"
            >
              <span className="material-symbols-outlined text-xl">notifications</span>
              {stats.pendingRenewals > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#ba1a1a] rounded-full ring-2 ring-white animate-pulse"></span>
              )}
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-[#c5c5d3] rounded-lg shadow-xl p-3 z-50 text-[12px]">
                <div className="flex items-center justify-between border-b border-[#c5c5d3] pb-2 mb-2 font-bold text-[#00236f]">
                  <span>Urgent Compliance Notifications</span>
                  <span className="bg-[#ffdad6] text-[#93000a] text-[10px] px-1.5 py-0.5 rounded">
                    {stats.pendingRenewals + stats.expired} queued
                  </span>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                  <div 
                    onClick={() => { setActiveTab('renewals'); setNotificationsOpen(false); }}
                    className="p-2 bg-[#fff1f2] border border-[#fecdd3] rounded cursor-pointer hover:bg-[#ffe4e6] text-[#93000a]"
                  >
                    <div className="font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">error</span>
                      {stats.expired} Expired Contracts
                    </div>
                    <p className="text-[11px] text-[#444651] mt-0.5">Automated mailto dispatch blocked per PRD v2.5.</p>
                  </div>
                  <div 
                    onClick={() => { setActiveTab('renewals'); setNotificationsOpen(false); }}
                    className="p-2 bg-[#fffbeb] border border-[#fde68a] rounded cursor-pointer hover:bg-[#fef3c7] text-[#b45309]"
                  >
                    <div className="font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">schedule</span>
                      {stats.pendingRenewals} Pending Renewals Due
                    </div>
                    <p className="text-[11px] text-[#444651] mt-0.5">Thresholds: Legal &le; 14 days, HR &le; 30 days.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Help Button */}
          <button
            onClick={openProtocolDocsModal}
            className="p-1.5 text-[#444651] hover:text-[#00236f] hover:bg-[#eff4ff] rounded-lg transition-colors"
            title="PRD Protocol Documentation"
          >
            <span className="material-symbols-outlined text-xl">help</span>
          </button>

          {/* Profile Badge */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 pl-1 pr-1.5 py-1 rounded-lg hover:bg-[#eff4ff] transition-colors"
            >
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB3n8mwo8GdTdPqkjTbrQitRsrFXipvJ1AdEvL3tlMtC6UvknCgeA_-xrb4pXsOWbzUpoUlU84VaN3j33ggwXKRea0ROH36DFlhc4oo4HigHq1ZEbf9DN5Amlu0HshVj3Gaf9MmTnc1Jc1lPFqiGc23GVJHcpCEaFY2agLKkWtyCiCkGPKWjAEXaLh1O68dvcwDks61guFP4rq07s8OViJ3Z5HC0nwAQ5DYoNYwKi5hihVe4lEnkL-I"
                alt="E. Zulkifli"
                className="w-7 h-7 rounded-full border border-[#c5c5d3] object-cover"
              />
              <div className="hidden xl:flex flex-col text-left">
                <span className="text-[12px] font-bold leading-tight text-[#0b1c30]">E. Zulkifli</span>
                <span className="text-[10px] text-[#757682]">Lead Legal Auditor</span>
              </div>
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-[#c5c5d3] rounded-lg shadow-xl p-3 z-50 text-[12px]">
                <div className="flex items-center gap-2.5 pb-2 mb-2 border-b border-[#c5c5d3]">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuB3n8mwo8GdTdPqkjTbrQitRsrFXipvJ1AdEvL3tlMtC6UvknCgeA_-xrb4pXsOWbzUpoUlU84VaN3j33ggwXKRea0ROH36DFlhc4oo4HigHq1ZEbf9DN5Amlu0HshVj3Gaf9MmTnc1Jc1lPFqiGc23GVJHcpCEaFY2agLKkWtyCiCkGPKWjAEXaLh1O68dvcwDks61guFP4rq07s8OViJ3Z5HC0nwAQ5DYoNYwKi5hihVe4lEnkL-I"
                    alt="E. Zulkifli"
                    className="w-10 h-10 rounded-full border border-[#c5c5d3] object-cover"
                  />
                  <div>
                    <div className="font-bold text-[#00236f]">E. Zulkifli</div>
                    <div className="text-[11px] text-[#757682]">Lead Legal Auditor</div>
                    <div className="text-[10px] text-[#4e45d5]">rafedah@mediaprima.audio</div>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="p-1.5 rounded bg-[#eff4ff] text-[11px] text-[#00236f] font-mono">
                    Role: Single-Operator Admin
                  </div>
                  <button
                    onClick={() => {
                      showToast("Session validated with local single-operator key.", "info");
                      setProfileOpen(false);
                    }}
                    className="w-full text-left py-1 px-2 rounded hover:bg-[#eff4ff] text-[#444651]"
                  >
                    Operator Security Token
                  </button>
                  <button
                    onClick={() => {
                      exportToCSV();
                      setProfileOpen(false);
                    }}
                    className="w-full text-left py-1 px-2 rounded hover:bg-[#eff4ff] text-[#444651]"
                  >
                    Quick Export All Records
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
