import React from 'react';
import { ComplianceProvider, useCompliance } from './context/ComplianceContext';
import { TopNavBar } from './components/TopNavBar';
import { SideNavRail } from './components/SideNavRail';
import { ToastContainer } from './components/ToastContainer';
import { PdfViewerModal } from './components/PdfViewerModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { ProtocolDocsModal } from './components/ProtocolDocsModal';
import { BulkDispatchModal } from './components/BulkDispatchModal';

import { ContractRenewalsView } from './views/ContractRenewalsView';
import { StationDirectoryView } from './views/StationDirectoryView';
import { AuditVaultView } from './views/AuditVaultView';
import { StaffRegistryView } from './views/StaffRegistryView';
import { StaffFormView } from './views/StaffFormView';
import { SettingsView } from './views/SettingsView';

const MainLayout: React.FC = () => {
  const { activeTab, currentScreen } = useCompliance();

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] flex flex-col font-sans">
      {/* Top Application Bar */}
      <TopNavBar />

      <div className="flex-1 flex overflow-hidden">
        {/* Collapsible / Fixed Side Navigation Rail */}
        <SideNavRail />

        {/* Scrollable Main Viewport Canvas */}
        <main className="flex-1 overflow-y-auto bg-[#f8f9ff] custom-scrollbar">
          {currentScreen === 'add-staff' || currentScreen === 'edit-staff' ? (
            <StaffFormView />
          ) : activeTab === 'renewals' ? (
            <ContractRenewalsView />
          ) : activeTab === 'stations' ? (
            <StationDirectoryView />
          ) : activeTab === 'audit' ? (
            <AuditVaultView />
          ) : activeTab === 'settings' ? (
            <SettingsView />
          ) : (
            <StaffRegistryView />
          )}
        </main>
      </div>

      {/* Global Modals & Overlays */}
      <PdfViewerModal />
      <DeleteConfirmModal />
      <ProtocolDocsModal />
      <BulkDispatchModal />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <ComplianceProvider>
      <MainLayout />
    </ComplianceProvider>
  );
}
