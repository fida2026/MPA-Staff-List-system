import React from 'react';
import { useCompliance } from '../context/ComplianceContext';

export const SideNavRail: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    currentScreen,
    closeFormScreen,
    openAddStaffScreen,
    stats,
    showToast,
    openProtocolDocsModal,
  } = useCompliance();

  const handleNavClick = (tab: 'registry' | 'renewals' | 'stations' | 'audit' | 'settings') => {
    if (currentScreen !== 'main') {
      closeFormScreen();
    }
    setActiveTab(tab);
  };

  return (
    <aside className="w-60 bg-[#f8f9ff] border-r border-[#c5c5d3] flex-shrink-0 flex flex-col justify-between py-4 select-none h-[calc(100vh-53px)] sticky top-[53px]">
      <div>
        {/* Brand / Division Header */}
        <div className="px-5 pb-3 border-b border-[#c5c5d3]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#00236f] text-white flex items-center justify-center font-bold text-[13px] shadow-xs">
              MP
            </div>
            <div>
              <div className="text-[14px] font-bold text-[#00236f] leading-tight">
                Corporate People Ops
              </div>
              <div className="text-[11px] text-[#757682]">Media Prima Audio</div>
            </div>
          </div>
        </div>

        {/* Quick Action Button */}
        <div className="px-3 pt-3.5 pb-2">
          <button
            onClick={openAddStaffScreen}
            className="w-full bg-[#eff4ff] hover:bg-[#e5eeff] text-[#00236f] border border-[#c5c5d3] py-2 px-3 rounded-lg text-[12px] font-bold flex items-center justify-center space-x-1.5 shadow-xs transition-all active:scale-[0.99]"
          >
            <span className="material-symbols-outlined text-[16px]">person_add</span>
            <span>+ Add Staff</span>
          </button>
        </div>

        {/* Navigation Rail List */}
        <div className="mt-2 px-2 space-y-1">
          {/* Staff Registry */}
          <button
            onClick={() => handleNavClick('registry')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[12px] font-semibold transition-all ${
              activeTab === 'registry' && currentScreen === 'main'
                ? 'bg-[#dce9ff] text-[#00236f] font-bold border-l-4 border-[#4e45d5] rounded-r-lg shadow-xs'
                : 'text-[#444651] hover:bg-[#eff4ff] hover:text-[#0b1c30]'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[19px]">badge</span>
              <span>Staff Registry</span>
            </div>
            <span className="text-[11px] text-[#757682] font-mono">{stats.total}</span>
          </button>

          {/* Contract Renewals */}
          <button
            onClick={() => handleNavClick('renewals')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[12px] font-semibold transition-all ${
              activeTab === 'renewals' && currentScreen === 'main'
                ? 'bg-[#dce9ff] text-[#00236f] font-bold border-l-4 border-[#4e45d5] rounded-r-lg shadow-xs'
                : 'text-[#444651] hover:bg-[#eff4ff] hover:text-[#0b1c30]'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[19px]">schedule_send</span>
              <span>Contract Renewals</span>
            </div>
            <span className="bg-[#4e45d5] text-white px-1.5 py-0.2 rounded text-[10px] font-bold">
              {stats.pendingRenewals + stats.expired}
            </span>
          </button>

          {/* Station Directives */}
          <button
            onClick={() => handleNavClick('stations')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[12px] font-semibold transition-all ${
              activeTab === 'stations' && currentScreen === 'main'
                ? 'bg-[#dce9ff] text-[#00236f] font-bold border-l-4 border-[#4e45d5] rounded-r-lg shadow-xs'
                : 'text-[#444651] hover:bg-[#eff4ff] hover:text-[#0b1c30]'
            }`}
          >
            <span className="material-symbols-outlined text-[19px]">radio</span>
            <span>Station Directives</span>
          </button>

          {/* Audit Vault */}
          <button
            onClick={() => handleNavClick('audit')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[12px] font-semibold transition-all ${
              activeTab === 'audit' && currentScreen === 'main'
                ? 'bg-[#dce9ff] text-[#00236f] font-bold border-l-4 border-[#4e45d5] rounded-r-lg shadow-xs'
                : 'text-[#444651] hover:bg-[#eff4ff] hover:text-[#0b1c30]'
            }`}
          >
            <span className="material-symbols-outlined text-[19px]">verified_user</span>
            <span>Audit Vault</span>
          </button>

          {/* Settings */}
          <button
            onClick={() => handleNavClick('settings')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[12px] font-semibold transition-all ${
              activeTab === 'settings' && currentScreen === 'main'
                ? 'bg-[#dce9ff] text-[#00236f] font-bold border-l-4 border-[#4e45d5] rounded-r-lg shadow-xs'
                : 'text-[#444651] hover:bg-[#eff4ff] hover:text-[#0b1c30]'
            }`}
          >
            <span className="material-symbols-outlined text-[19px]">settings</span>
            <span>Settings</span>
          </button>
        </div>
      </div>

      {/* Footer Area */}
      <div className="px-3 pt-3 border-t border-[#c5c5d3] space-y-1.5">
        <div className="flex items-center justify-between px-2 py-1 text-[11px] text-[#757682]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-base">dns</span>
            <span>System Status</span>
          </div>
          <span className="inline-flex items-center gap-1 font-bold text-[#047857]">
            <span className="w-2 h-2 rounded-full bg-[#047857] animate-pulse"></span>
            ONLINE
          </span>
        </div>

        <button
          onClick={openProtocolDocsModal}
          className="w-full flex items-center gap-2 px-2 py-1 text-[11px] text-[#757682] hover:text-[#0b1c30] rounded hover:bg-[#eff4ff] transition-colors"
        >
          <span className="material-symbols-outlined text-base">support</span>
          <span>Help &amp; Protocols</span>
        </button>

        <div className="p-2 bg-[#eff4ff] rounded border border-[#c5c5d3] flex items-center justify-between">
          <div className="overflow-hidden">
            <p className="text-[10px] font-bold text-[#00236f] truncate uppercase tracking-wider">PRD v2.5 ENGINE</p>
            <p className="text-[9px] text-[#757682] font-mono truncate">DB: IndexedDB 50MB</p>
          </div>
          <span className="w-2 h-2 rounded-full bg-[#4e45d5]" title="Local Encrypted Store Active"></span>
        </div>
      </div>
    </aside>
  );
};
