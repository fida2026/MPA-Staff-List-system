import React, { useState, useEffect } from 'react';
import { useCompliance } from '../context/ComplianceContext';
import { StationName, StaffCategory, DepartmentName } from '../types/compliance';
import {
  STATION_GATEWAYS,
  calculateTenure,
  generateNextStaffNumber
} from '../data/initialData';

export const StaffFormView: React.FC = () => {
  const {
    records,
    editingStaffId,
    closeFormScreen,
    saveStaffRecord,
    showToast
  } = useCompliance();

  const isEditing = Boolean(editingStaffId);
  const editingRecord = isEditing ? records.find(r => r.id === editingStaffId) : null;

  // Form State
  const [category, setCategory] = useState<StaffCategory>('HR Permanent');
  const [station, setStation] = useState<StationName>('Hot FM');
  const [staffNo, setStaffNo] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [icNumber, setIcNumber] = useState<string>('');
  const [designation, setDesignation] = useState<string>('');
  const [department, setDepartment] = useState<DepartmentName>('Content');
  const [joinDate, setJoinDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [hodEmail, setHodEmail] = useState<string>('hod.hotfm@mediaprima.com.my');
  const [hrDeptEmail, setHrDeptEmail] = useState<string>('hr.dept@mediaprima.com.my');
  const [adminEmail, setAdminEmail] = useState<string>('admin.hr@mediaprima.com.my');
  const [contractStartDate, setContractStartDate] = useState<string>('');
  const [contractEndDate, setContractEndDate] = useState<string>('');
  
  // File state
  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    sizeMB: number;
    error?: string;
  } | null>(null);

  // Initialize or populate
  useEffect(() => {
    if (editingRecord) {
      setCategory(editingRecord.category);
      setStation(editingRecord.station);
      setStaffNo(editingRecord.staffNo);
      setFullName(editingRecord.name);
      setIcNumber(editingRecord.ic);
      setDesignation(editingRecord.designation || '');
      setDepartment(editingRecord.department);
      setJoinDate(editingRecord.joinDate);
      setHodEmail(editingRecord.hodEmail);
      setHrDeptEmail(editingRecord.hrDeptEmail || 'hr.dept@mediaprima.com.my');
      setAdminEmail(editingRecord.adminEmail || 'admin.hr@mediaprima.com.my');
      setContractStartDate(editingRecord.contractStartDate || '');
      setContractEndDate(editingRecord.expiryDate || '');
      if (editingRecord.pdfAttached) {
        setSelectedFile({
          name: editingRecord.pdfFileName || `${editingRecord.staffNo}_Document.pdf`,
          sizeMB: editingRecord.pdfSizeMB || 1.2,
        });
      }
    } else {
      // New record defaults
      const initialNo = generateNextStaffNumber('HR Permanent', 'Hot FM', records);
      setStaffNo(initialNo);
      setHodEmail(STATION_GATEWAYS['Hot FM'] || 'hod.hotfm@mediaprima.com.my');
    }
  }, [editingRecord]);

  // When category or station changes on a new record, auto-regenerate staff number
  const handleCategoryChange = (newCat: StaffCategory) => {
    setCategory(newCat);
    if (!isEditing) {
      const generated = generateNextStaffNumber(newCat, station, records);
      setStaffNo(generated);
    }
  };

  const handleStationChange = (newStation: StationName) => {
    setStation(newStation);
    if (!isEditing) {
      const generated = generateNextStaffNumber(category, newStation, records);
      setStaffNo(generated);
      if (STATION_GATEWAYS[newStation]) {
        setHodEmail(STATION_GATEWAYS[newStation]);
      }
    }
  };

  // Rule TC09: Legal contract auto +5 months calculation
  const handleLegalStartDateChange = (val: string) => {
    setContractStartDate(val);
    if (val) {
      const start = new Date(val);
      start.setMonth(start.getMonth() + 5);
      const computedExpiry = start.toISOString().split('T')[0];
      setContractEndDate(computedExpiry);
      showToast("Legal Contract: +5 Months Expiry auto-computed!", "info");
    }
  };

  // Rule TC10: PDF validation strictly <= 2.0 MB
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxBytes = 2 * 1024 * 1024; // 2MB
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      setSelectedFile({
        name: file.name,
        sizeMB: parseFloat((file.size / (1024 * 1024)).toFixed(2)),
        error: "Invalid File Type: Only Adobe .pdf documents are permitted by ComplianceCore.",
      });
      showToast("Invalid File Type: Only .pdf files allowed", "error");
      return;
    }

    if (file.size > maxBytes) {
      const actualMB = parseFloat((file.size / (1024 * 1024)).toFixed(2));
      setSelectedFile({
        name: file.name,
        sizeMB: actualMB,
        error: `File Size Exceeded: Selected file is ${actualMB} MB (Maximum allowed is 2.00 MB).`,
      });
      showToast(`File Size Exceeded: ${actualMB} MB exceeds 2.0 MB cap`, "error");
      return;
    }

    setSelectedFile({
      name: file.name,
      sizeMB: parseFloat((file.size / (1024 * 1024)).toFixed(2)),
    });
    showToast("PDF document attached and verified (&le; 2.0 MB)", "success");
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim() || !icNumber.trim() || !joinDate || !hodEmail.trim()) {
      showToast("Please fill in all mandatory fields denoted with *", "error");
      return;
    }

    if (category !== 'HR Permanent' && !contractEndDate) {
      showToast("Contract expiry date is required for contract personnel.", "error");
      return;
    }

    if (selectedFile?.error) {
      showToast("Please remove or replace the invalid attachment before saving.", "error");
      return;
    }

    const payload = {
      staffNo,
      name: fullName.trim(),
      ic: icNumber.trim(),
      station,
      department,
      designation: designation.trim() || 'Staff Specialist',
      category,
      joinDate,
      expiryDate: category === 'HR Permanent' ? '' : contractEndDate,
      contractStartDate: category === 'Legal Contract' ? contractStartDate : undefined,
      hodEmail: hodEmail.trim(),
      hrDeptEmail: hrDeptEmail.trim(),
      adminEmail: adminEmail.trim(),
      pdfAttached: Boolean(selectedFile && !selectedFile.error),
      pdfFileName: selectedFile && !selectedFile.error ? selectedFile.name : undefined,
      pdfSizeMB: selectedFile && !selectedFile.error ? selectedFile.sizeMB : undefined,
      pdfType: (category === 'Legal Contract' ? 'Legal Agreement' : 'MRF') as 'Legal Agreement' | 'MRF',
    };

    saveStaffRecord(payload, !isEditing);
  };

  const tenureDisplay = calculateTenure(joinDate);

  return (
    <div className="p-6 max-w-4xl w-full mx-auto space-y-6">
      {/* Header & Breadcrumbs */}
      <div className="flex items-center justify-between border-b border-[#c5c5d3] pb-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={closeFormScreen}
            className="p-2 rounded-lg hover:bg-[#eff4ff] text-[#00236f] border border-[#c5c5d3] transition-colors"
            title="Back to Dashboard"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <div className="flex items-center space-x-2 text-[11px] text-[#757682]">
              <span className="cursor-pointer hover:underline" onClick={closeFormScreen}>
                Staff Registry
              </span>
              <span>/</span>
              <span className="text-[#00236f] font-bold">
                {isEditing ? `Edit: ${editingRecord?.staffNo}` : 'New Registration'}
              </span>
            </div>
            <h1 className="text-[20px] font-bold text-[#00236f] tracking-tight">
              {isEditing ? `Edit Staff Record - ${editingRecord?.staffNo}` : 'Staff Registration & Contract Rule Enforcer'}
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={closeFormScreen}
            className="px-4 py-2 rounded-lg border border-[#c5c5d3] bg-white hover:bg-[#eff4ff] text-[#0b1c30] text-[12px] font-semibold transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-5 py-2 rounded-lg bg-[#00236f] text-white hover:bg-[#1e3a8a] text-[12px] font-bold transition-all shadow-xs flex items-center space-x-1.5"
          >
            <span className="material-symbols-outlined text-base">save</span>
            <span>{isEditing ? 'Update Record' : 'Save Staff Record'}</span>
          </button>
        </div>
      </div>

      {/* Form Body Canvas */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SECTION 1: Staff Category & Station Selection */}
        <div className="bg-white p-5 rounded-xl border border-[#c5c5d3] shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#c5c5d3] pb-2">
            <div className="flex items-center space-x-2">
              <span className="material-symbols-outlined text-[#4e45d5]">category</span>
              <h2 className="text-[14px] font-bold text-[#0b1c30]">
                1. Staff Category &amp; Station Prefix Enforcer
              </h2>
            </div>
            <span className="text-[11px] text-[#757682]">
              Rules: HR Contract adds 'C'; Legal Contract locks 'CON'
            </span>
          </div>

          {/* Radio Segmented Category Cards */}
          <div className="space-y-2">
            <label className="text-[12px] text-[#444651] font-semibold block">Select Category *</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Category 1: HR Permanent */}
              <label
                className={`cursor-pointer border rounded-xl p-3.5 flex flex-col justify-between transition-all ${
                  category === 'HR Permanent'
                    ? 'border-[#4e45d5] bg-[#eff4ff]/60 shadow-xs'
                    : 'border-[#c5c5d3] hover:border-[#4e45d5]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-bold text-[#00236f]">HR Permanent</span>
                  <input
                    type="radio"
                    name="staff_category"
                    value="HR Permanent"
                    checked={category === 'HR Permanent'}
                    onChange={() => handleCategoryChange('HR Permanent')}
                    className="text-[#4e45d5] focus:ring-[#4e45d5]"
                  />
                </div>
                <p className="text-[11px] text-[#757682] mt-2">
                  Indefinite duration. Standard station prefix code.
                </p>
              </label>

              {/* Category 2: HR Contract */}
              <label
                className={`cursor-pointer border rounded-xl p-3.5 flex flex-col justify-between transition-all ${
                  category === 'HR Contract'
                    ? 'border-[#4e45d5] bg-[#eff4ff]/60 shadow-xs'
                    : 'border-[#c5c5d3] hover:border-[#4e45d5]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-bold text-[#00236f]">HR Contract</span>
                  <input
                    type="radio"
                    name="staff_category"
                    value="HR Contract"
                    checked={category === 'HR Contract'}
                    onChange={() => handleCategoryChange('HR Contract')}
                    className="text-[#4e45d5] focus:ring-[#4e45d5]"
                  />
                </div>
                <p className="text-[11px] text-[#757682] mt-2">
                  Station prefix + appends 'C' suffix. MRF PDF &amp; 30-day window.
                </p>
              </label>

              {/* Category 3: Legal Contract */}
              <label
                className={`cursor-pointer border rounded-xl p-3.5 flex flex-col justify-between transition-all ${
                  category === 'Legal Contract'
                    ? 'border-[#4e45d5] bg-[#eff4ff]/60 shadow-xs'
                    : 'border-[#c5c5d3] hover:border-[#4e45d5]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-bold text-[#00236f]">Legal Contract</span>
                  <input
                    type="radio"
                    name="staff_category"
                    value="Legal Contract"
                    checked={category === 'Legal Contract'}
                    onChange={() => handleCategoryChange('Legal Contract')}
                    className="text-[#4e45d5] focus:ring-[#4e45d5]"
                  />
                </div>
                <p className="text-[11px] text-[#757682] mt-2">
                  Locks prefix to 'CON'. Auto +5 months calculation &amp; 14-day window.
                </p>
              </label>
            </div>
          </div>

          {/* Station and Auto-Enforced Staff Number Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="text-[12px] text-[#444651] font-semibold block mb-1">Station *</label>
              <select
                value={station}
                onChange={(e) => handleStationChange(e.target.value as StationName)}
                className="w-full h-9 rounded-lg border border-[#c5c5d3] text-[12px] focus:border-[#4e45d5] focus:ring-2 focus:ring-[#4e45d5]/20 outline-none bg-white px-2.5"
                required
              >
                <option value="Hot FM">Hot FM (Prefix: SSB)</option>
                <option value="Fly FM">Fly FM (Prefix: MAX)</option>
                <option value="Eight Wuxian">Eight Wuxian (Prefix: OFM)</option>
                <option value="Kool FM">Kool FM (Prefix: KFM)</option>
                <option value="Molek FM">Molek FM (Prefix: MFM)</option>
              </select>
              <p className="text-[11px] text-[#757682] mt-1">
                {category === 'Legal Contract'
                  ? 'Notice: Legal Contracts automatically enforce the CON prefix code.'
                  : 'Select broadcast brand. Note: Kool FM and Molek FM are independent regional stations.'}
              </p>
            </div>

            <div>
              <label className="text-[12px] text-[#444651] font-semibold block mb-1">
                Enforced Staff Number Preview
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={staffNo}
                  readOnly
                  className="w-full h-9 rounded-lg border border-[#c5c5d3] bg-[#eff4ff] font-mono text-[13px] font-bold text-[#00236f] px-3 outline-none select-all"
                />
                <span className="material-symbols-outlined text-[#4e45d5]" title="Auto-generated using PRD schema">
                  lock
                </span>
              </div>
              <p className="text-[11px] text-[#757682] mt-1">
                Format: [Prefix]-[Random4Digit]{category === 'HR Contract' ? '[C]' : ''}
              </p>
            </div>
          </div>
        </div>

        {/* SECTION 2: Personal & Assignment Details */}
        <div className="bg-white p-5 rounded-xl border border-[#c5c5d3] shadow-xs space-y-4">
          <div className="flex items-center space-x-2 border-b border-[#c5c5d3] pb-2">
            <span className="material-symbols-outlined text-[#4e45d5]">badge</span>
            <h2 className="text-[14px] font-bold text-[#0b1c30]">2. Personal &amp; Assignment Details</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[12px] text-[#444651] font-semibold block mb-1">Full Legal Name *</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Nurul Syahirah Binti Azman"
                className="w-full h-9 rounded-lg border border-[#c5c5d3] text-[12px] focus:border-[#4e45d5] focus:ring-2 focus:ring-[#4e45d5]/20 px-3 outline-none"
                required
              />
            </div>

            <div>
              <label className="text-[12px] text-[#444651] font-semibold block mb-1">
                IC Number (Malaysian National ID) *
              </label>
              <input
                type="text"
                value={icNumber}
                onChange={(e) => setIcNumber(e.target.value)}
                placeholder="YYMMDD-PB-###G (e.g. 940512-10-5892)"
                className="w-full h-9 rounded-lg border border-[#c5c5d3] font-mono text-[12px] focus:border-[#4e45d5] focus:ring-2 focus:ring-[#4e45d5]/20 px-3 outline-none"
                required
              />
            </div>

            <div>
              <label className="text-[12px] text-[#444651] font-semibold block mb-1">
                Designation / Role Title *
              </label>
              <input
                type="text"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder="e.g. Senior Content Producer"
                className="w-full h-9 rounded-lg border border-[#c5c5d3] text-[12px] focus:border-[#4e45d5] focus:ring-2 focus:ring-[#4e45d5]/20 px-3 outline-none"
                required
              />
            </div>

            <div>
              <label className="text-[12px] text-[#444651] font-semibold block mb-1">Department *</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value as DepartmentName)}
                className="w-full h-9 rounded-lg border border-[#c5c5d3] text-[12px] focus:border-[#4e45d5] focus:ring-2 focus:ring-[#4e45d5]/20 outline-none bg-white px-2.5"
                required
              >
                <option value="CEO Office">CEO Office</option>
                <option value="Content">Content</option>
                <option value="Finance">Finance</option>
                <option value="Group Human Resources">Group Human Resources</option>
                <option value="Marketing &amp; Integration">Marketing &amp; Integration</option>
                <option value="Operation">Operation</option>
                <option value="Tech &amp; Shared Services">Tech &amp; Shared Services</option>
              </select>
            </div>

            <div>
              <label className="text-[12px] text-[#444651] font-semibold block mb-1">Join Date *</label>
              <input
                type="date"
                value={joinDate}
                onChange={(e) => setJoinDate(e.target.value)}
                className="w-full h-9 rounded-lg border border-[#c5c5d3] text-[12px] focus:border-[#4e45d5] focus:ring-2 focus:ring-[#4e45d5]/20 px-3 outline-none"
                required
              />
            </div>

            <div>
              <label className="text-[12px] text-[#444651] font-semibold block mb-1">
                Tenure Service Record
              </label>
              <div className="flex items-center space-x-3 h-9">
                <span className="px-3 py-1.5 rounded-lg bg-[#eff4ff] text-[#00236f] font-mono text-[12px] font-bold border border-[#c5c5d3]">
                  {tenureDisplay}
                </span>
                <span className="text-[11px] text-[#757682]">Auto-calculated from Join Date to today</span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: Contact & Escalation Notification Routing */}
        <div className="bg-white p-5 rounded-xl border border-[#c5c5d3] shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#c5c5d3] pb-2">
            <div className="flex items-center space-x-2">
              <span className="material-symbols-outlined text-[#4e45d5]">forward_to_inbox</span>
              <h2 className="text-[14px] font-bold text-[#0b1c30]">
                3. Contact &amp; Escalation Notification Routing
              </h2>
            </div>
            <span className="text-[11px] text-[#757682]">
              Required for TC13/TC14 reminder mailto: dispatch
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-[12px] text-[#444651] font-semibold block mb-1">HOD Email *</label>
              <input
                type="email"
                value={hodEmail}
                onChange={(e) => setHodEmail(e.target.value)}
                placeholder="hod.content@mediaprima.com.my"
                className="w-full h-9 rounded-lg border border-[#c5c5d3] text-[12px] focus:border-[#4e45d5] focus:ring-2 focus:ring-[#4e45d5]/20 px-3 outline-none"
                required
              />
            </div>

            <div>
              <label className="text-[12px] text-[#444651] font-semibold block mb-1">HR Dept Email</label>
              <input
                type="email"
                value={hrDeptEmail}
                onChange={(e) => setHrDeptEmail(e.target.value)}
                className="w-full h-9 rounded-lg border border-[#c5c5d3] text-[12px] focus:border-[#4e45d5] focus:ring-2 focus:ring-[#4e45d5]/20 px-3 outline-none"
              />
              <p className="text-[10px] text-[#757682] mt-1">Default for HR Contract (&le; 30d)</p>
            </div>

            <div>
              <label className="text-[12px] text-[#444651] font-semibold block mb-1">Admin Email (Legal)</label>
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full h-9 rounded-lg border border-[#c5c5d3] text-[12px] focus:border-[#4e45d5] focus:ring-2 focus:ring-[#4e45d5]/20 px-3 outline-none"
              />
              <p className="text-[10px] text-[#757682] mt-1">Default for Legal Contract (&le; 14d)</p>
            </div>
          </div>
        </div>

        {/* SECTION 4: Contract Timing & Dates */}
        {category !== 'HR Permanent' && (
          <div className="bg-white p-5 rounded-xl border border-[#c5c5d3] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#c5c5d3] pb-2">
              <div className="flex items-center space-x-2">
                <span className="material-symbols-outlined text-[#4e45d5]">date_range</span>
                <h2 className="text-[14px] font-bold text-[#0b1c30]">
                  4. Contract Timing &amp; Automated Expiry Calculation
                </h2>
              </div>
              <span className="text-[11px] text-[#757682]">
                {category === 'Legal Contract'
                  ? 'Legal Contract enforces exact +5 Months term'
                  : 'HR Contract requires contract expiry date'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {category === 'Legal Contract' && (
                <div>
                  <label className="text-[12px] text-[#444651] font-semibold block mb-1">
                    Contract Start Date *
                  </label>
                  <input
                    type="date"
                    value={contractStartDate}
                    onChange={(e) => handleLegalStartDateChange(e.target.value)}
                    className="w-full h-9 rounded-lg border border-[#c5c5d3] text-[12px] focus:border-[#4e45d5] focus:ring-2 focus:ring-[#4e45d5]/20 px-3 outline-none"
                  />
                  <p className="text-[11px] text-[#4e45d5] font-semibold mt-1">
                    Entering start date auto-computes +5 Months End Date
                  </p>
                </div>
              )}

              <div>
                <label className="text-[12px] text-[#444651] font-semibold block mb-1">
                  Contract Expiry Date *
                </label>
                <input
                  type="date"
                  value={contractEndDate}
                  onChange={(e) => setContractEndDate(e.target.value)}
                  className="w-full h-9 rounded-lg border border-[#c5c5d3] text-[12px] focus:border-[#4e45d5] focus:ring-2 focus:ring-[#4e45d5]/20 px-3 outline-none"
                  required
                />
                <p className="text-[10px] text-[#757682] mt-1">
                  {category === 'Legal Contract'
                    ? '14-day alert window applies'
                    : '30-day renewal appraisal window applies'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 5: PDF Attachment Zone */}
        <div className="bg-white p-5 rounded-xl border border-[#c5c5d3] shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#c5c5d3] pb-2">
            <div className="flex items-center space-x-2">
              <span className="material-symbols-outlined text-[#4e45d5]">picture_as_pdf</span>
              <h2 className="text-[14px] font-bold text-[#0b1c30]">
                5. Mandatory PDF Attachment Zone
              </h2>
            </div>
            <span className="text-[11px] text-[#757682]">
              Rule TC10: .pdf strictly enforced &le; 2.0 MB
            </span>
          </div>

          <div className="space-y-3">
            {/* Upload Drop Zone */}
            <div className="border-2 border-dashed border-[#c5c5d3] rounded-xl p-6 text-center hover:border-[#4e45d5] transition-all bg-[#f8f9ff] cursor-pointer relative">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
                <div className="w-12 h-12 rounded-full bg-[#eff4ff] flex items-center justify-center text-[#4e45d5]">
                  <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>
                    upload_file
                  </span>
                </div>
                <div>
                  <span className="text-[13px] font-bold text-[#00236f]">
                    Click to select PDF or drag and drop
                  </span>
                  <p className="text-[11px] text-[#757682] mt-0.5">
                    {category === 'Legal Contract'
                      ? 'Upload Front Page Contract Agreement PDF (.pdf strictly, \u2264 2.0 MB)'
                      : 'Upload MRF (Manpower Requisition Form) PDF (.pdf strictly, \u2264 2.0 MB)'}
                  </p>
                </div>
              </div>
            </div>

            {/* Validation Feedback */}
            {selectedFile && (
              <div
                className={`p-3.5 rounded-lg border text-[12px] flex items-center justify-between ${
                  selectedFile.error
                    ? 'bg-[#fff1f2] border-[#ba1a1a] text-[#93000a]'
                    : 'bg-[#ecfdf5] border-[#047857] text-[#065f46]'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <span className="material-symbols-outlined text-lg">
                    {selectedFile.error ? 'error' : 'task_alt'}
                  </span>
                  <div>
                    <p className="font-bold">{selectedFile.name}</p>
                    <p className="text-[11px] opacity-80">
                      {selectedFile.error
                        ? selectedFile.error
                        : `Verified PDF \u2022 ${selectedFile.sizeMB} MB \u2022 Ready for cryptographic audit submission`}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="p-1 rounded text-[#757682] hover:text-[#ba1a1a] transition-colors"
                >
                  <span className="material-symbols-outlined text-base">delete</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* SECTION 6: Form Actions Bar */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-[#c5c5d3]">
          <button
            type="button"
            onClick={closeFormScreen}
            className="px-5 py-2.5 rounded-lg border border-[#c5c5d3] bg-white hover:bg-[#eff4ff] text-[#0b1c30] text-[12px] font-semibold transition-all"
          >
            Cancel &amp; Exit
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-lg bg-[#00236f] text-white hover:bg-[#1e3a8a] text-[12px] font-bold transition-all shadow-xs flex items-center space-x-2 active:scale-[0.99]"
          >
            <span className="material-symbols-outlined text-base">check_circle</span>
            <span>{isEditing ? 'Update Record' : 'Save Staff Record'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
