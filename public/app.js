// Senthilvel Vidyalaya School - Fees Management System Frontend Logic

let allStudents = [];
let allReceipts = [];
let feeStructures = [];
let feeColumns = [];
let transportAreas = [];
let schoolInfo = {};
let currentReceiptData = null;
let waRemindersQueue = [];
let waCurrentQueueIndex = 0;

// DOM Loaded
document.addEventListener('DOMContentLoaded', () => {
  initIcons();
  setupNavigation();
  setupSearchAndFilters();
  setupForms();
  loadAllData();
});

function initIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// Navigation Tabs & Mobile Drawer
function setupNavigation() {
  const sidebar = document.getElementById('appSidebar');
  const backdrop = document.getElementById('sidebarBackdrop');
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const sidebarCloseBtn = document.getElementById('sidebarCloseBtn');

  function openSidebar() {
    if (sidebar) sidebar.classList.add('open');
    if (backdrop) backdrop.classList.add('active');
  }

  function closeSidebar() {
    if (sidebar) sidebar.classList.remove('open');
    if (backdrop) backdrop.classList.remove('active');
  }

  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', openSidebar);
  }
  if (sidebarCloseBtn) {
    sidebarCloseBtn.addEventListener('click', closeSidebar);
  }
  if (backdrop) {
    backdrop.addEventListener('click', closeSidebar);
  }

  // Close sidebar on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sidebar && sidebar.classList.contains('open')) {
      closeSidebar();
    }
  });

  const links = document.querySelectorAll('.sidebar-nav .nav-link');
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const tab = link.getAttribute('data-tab');
      switchTab(tab);
      if (window.innerWidth <= 992) {
        closeSidebar();
      }
    });
  });

  const resetBtn = document.getElementById('resetDemoBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', async () => {
      if (confirm("Reset database to initial demo state? All custom added records will be refreshed.")) {
        try {
          const res = await fetch('/api/reset-data', { method: 'POST' });
          if (res.ok) {
            showToast("Database restored to demo defaults");
            loadAllData();
          }
        } catch (err) {
          showToast("Error resetting data", true);
        }
      }
    });
  }
}

function switchTab(tabId) {
  // Update nav links
  document.querySelectorAll('.sidebar-nav .nav-link').forEach(link => {
    if (link.getAttribute('data-tab') === tabId) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // Update tab panes
  document.querySelectorAll('.tab-pane').forEach(pane => {
    if (pane.id === tabId) {
      pane.classList.add('active');
    } else {
      pane.classList.remove('active');
    }
  });

  // Update header title
  const titles = {
    'dashboard': 'Fees Management Dashboard',
    'vanfees': 'School Van & Transportation Fees Register (11-Month Tracking)',
    'schoolfees': 'School Fees Register — Class-Wise Academic Fee Ledger',
    'students': 'Students & Fees Ledger Directory',
    'collect': 'Collect Student Fees',
    'transactions': 'Fee Payment History & Official Receipts',
    'structure': 'Standardized Fee Structure Setup',
    'reports': 'Reports & Defaulter Tracking'
  };
  const titleElem = document.getElementById('pageTitle');
  if (titleElem && titles[tabId]) {
    titleElem.innerText = titles[tabId];
  }

  if (tabId === 'vanfees') {
    renderVanFeesTab();
  }

  if (tabId === 'schoolfees') {
    renderSchoolFeesTab();
  }

  initIcons();
}

// Data Fetching
async function loadAllData() {
  try {
    await Promise.all([
      fetchStats(),
      fetchStudents(),
      fetchFeeStructure(),
      fetchTransportAreas(),
      fetchPayments()
    ]);
    populateStudentSelect();
    populateStudentModalBoardingAreas();
    renderDefaulters();
    renderVanFeesTab();
    updateDashboardVanStats();
    checkAndMaintainLocalVault();
    initIcons();
  } catch (err) {
    console.error("Error loading application data:", err);
  }
}

// 1. Dashboard Stats & Class breakdown
async function fetchStats() {
  try {
    const res = await fetch('/api/stats');
    const data = await res.json();
    schoolInfo = data.schoolInfo;
    if (schoolInfo) {
      const sub = document.getElementById('schoolSubInfo');
      if (sub) {
        sub.innerText = `${schoolInfo.name} • ${schoolInfo.address} • Ph: ${schoolInfo.phone}`;
      }
      const rcptAddr = document.getElementById('rcptSchoolAddress');
      if (rcptAddr) {
        rcptAddr.innerText = `${schoolInfo.address} | Phone: ${schoolInfo.phone} | Email: ${schoolInfo.email}`;
      }
    }

    // Summary Cards
    document.getElementById('statExpected').innerText = `₹${data.summary.totalExpected.toLocaleString('en-IN')}`;
    document.getElementById('statCollected').innerText = `₹${data.summary.totalCollected.toLocaleString('en-IN')}`;
    document.getElementById('statDue').innerText = `₹${data.summary.totalOutstanding.toLocaleString('en-IN')}`;
    document.getElementById('statTotalStudents').innerText = data.summary.totalStudents;

    const rate = data.summary.totalExpected > 0 
      ? Math.round((data.summary.totalCollected / data.summary.totalExpected) * 100) 
      : 0;
    document.getElementById('statPaidPercent').innerText = `${rate}% collected of annual total`;
    document.getElementById('statUnpaidCount').innerText = `${data.summary.unpaidCount + data.summary.partialCount} students with pending dues`;

    // Reports counts
    document.getElementById('reportPaidCount').innerText = data.summary.paidCount;
    document.getElementById('reportPartialCount').innerText = data.summary.partialCount;
    document.getElementById('reportUnpaidCount').innerText = data.summary.unpaidCount;

    // Grade breakdown table
    const tbody = document.getElementById('gradeStatsBody');
    tbody.innerHTML = '';
    data.gradeBreakdown.forEach(item => {
      const gRate = item.expected > 0 ? Math.round((item.collected / item.expected) * 100) : 0;
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong class="grade-pill">${item.grade}</strong></td>
        <td>${item.studentsCount} Students</td>
        <td>₹${item.expected.toLocaleString('en-IN')}</td>
        <td style="color:#059669; font-weight:600;">₹${item.collected.toLocaleString('en-IN')}</td>
        <td style="color:#ef4444; font-weight:600;">₹${item.due.toLocaleString('en-IN')}</td>
        <td>
          <div style="font-size:0.8rem; font-weight:600; margin-bottom:2px;">${gRate}%</div>
          <div class="progress-bar-bg" style="width: 120px;">
            <div class="progress-bar-fill" style="width: ${gRate}%;"></div>
          </div>
        </td>
        <td>
          <div style="display:flex; gap:5px; flex-wrap:wrap;">
            <button class="btn btn-outline btn-sm" onclick="filterByGradeAndGo('${item.grade}')" style="padding:3px 7px;">View</button>
            <button class="btn btn-sm" style="background:#16a34a; color:#fff; font-weight:700; padding:3px 8px; font-size:0.75rem;" onclick="openClassDuesPrintModal('${item.grade}', 'Both', 'TeacherCopy')" title="Print Class Teacher Follow-up Sheet (No Totals, No Parent Name)">
              <i data-lucide="clipboard-list" style="width:12px; height:12px; display:inline; margin-right:2px;"></i> Teacher Sheet
            </button>
            <button class="btn btn-sm" style="background:#1e3a8a; color:#fff; font-weight:600; padding:3px 8px; font-size:0.75rem;" onclick="openClassDuesPrintModal('${item.grade}', 'Both', 'OfficeCopy')" title="Print Accounts Due Statement">
              <i data-lucide="printer" style="width:12px; height:12px; display:inline; margin-right:2px;"></i> Office
            </button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.error("Failed to fetch statistics:", err);
  }
}

function filterByGradeAndGo(grade) {
  document.getElementById('filterGrade').value = grade;
  switchTab('students');
  filterStudentsList();
}

// 2. Fetch Students
async function fetchStudents() {
  try {
    const res = await fetch('/api/students');
    allStudents = await res.json();
    renderStudentsTable(allStudents);
  } catch (err) {
    console.error("Failed to fetch students:", err);
  }
}

function renderStudentsTable(students) {
  const tbody = document.getElementById('studentsTableBody');
  const tfoot = document.getElementById('studentsTableFoot');
  tbody.innerHTML = '';

  if (students.length === 0) {
    tbody.innerHTML = `<tr><td colspan="11" style="text-align:center; padding:32px; color:#64748b;">No student records found matching the criteria.</td></tr>`;
    if (tfoot) tfoot.innerHTML = '';
    return;
  }

  // Compute totals
  let totalSchoolCollected = 0;
  let totalVanCollected = 0;
  let totalCollected = 0;

  students.forEach(s => {
    const tr = document.createElement('tr');
    let badgeClass = 'badge-unpaid';
    if (s.status === 'Paid') badgeClass = 'badge-paid';
    else if (s.status === 'Partial') badgeClass = 'badge-partial';

    const hasBus = s.transportOpted && Number(s.transportFee) > 0;
    const hasCustomFee = s.hasCustomFee || (s.customSchoolFee !== undefined && s.customSchoolFee !== null && s.customSchoolFee !== '');
    const schoolFeeDisplay = hasCustomFee
      ? `<span style="color:#b45309; font-weight:700;">₹${Number(s.baseTotal || 0).toLocaleString('en-IN')}</span><span style="font-size:0.68rem; color:#92400e; display:block;">(Custom Override)</span>`
      : `₹${(s.baseTotal || 0).toLocaleString('en-IN')}`;

    // Track collected amounts
    const sSchoolPaid = Number(s.schoolPaid || 0);
    const sVanPaid = Number(s.vanPaid || 0);
    totalSchoolCollected += sSchoolPaid;
    totalVanCollected += sVanPaid;
    totalCollected += Number(s.totalPaid || 0);

    tr.innerHTML = `
      <td>
        <div style="font-weight:700; color:#1e3a8a; font-size:0.95rem;">${s.rollNo}</div>
        ${s.cardNo ? `<div style="font-size:0.72rem; color:#64748b;">Card: #${s.cardNo}</div>` : ''}
      </td>
      <td>
        <strong style="color:#0f172a;">${s.name}</strong>
        ${s.nameTamil ? `<div style="font-size:0.75rem; color:#64748b; font-weight:500;">${s.nameTamil}</div>` : ''}
      </td>
      <td><span class="grade-pill">${s.grade}</span> Sec ${s.section || 'A'}</td>
      <td>
        <div>${s.parentName || '-'}</div>
        <div style="font-size:0.78rem; color:#64748b;">${s.contact || '-'}</div>
      </td>
      <td>${schoolFeeDisplay}</td>
      <td>
        ${hasBus 
          ? `<div style="line-height:1.25;">
               <span class="badge" style="background:#fef3c7; color:#92400e; font-weight:700; white-space:nowrap;">
                 <i data-lucide="bus" style="width:12px; height:12px; margin-right:4px; display:inline;"></i>₹${Number(s.transportFee).toLocaleString('en-IN')}
               </span>
               <div style="font-size:0.75rem; color:#1e3a8a; font-weight:600; margin-top:2px;">${s.boardingArea || 'Bus Route'}</div>
               <div style="font-size:0.7rem; color:#64748b;">${s.transportType === 'Monthly' ? `(Monthly: ₹${s.transportMonthlyFee || Math.round(s.transportFee / 10)}/mo)` : '(Yearly Pass)'}</div>
             </div>` 
          : `<span style="color:#94a3b8; font-size:0.8rem;">Self Commute</span>`}
      </td>
      <td><strong>₹${s.netPayable.toLocaleString('en-IN')}</strong></td>
      <td id="dirPaidCell-${s.id}">
        <div id="dirPaidView-${s.id}" onclick="startInlinePaidEdit('${s.id}')" title="Click to edit Paid amount directly" style="display:inline-flex; align-items:center; gap:5px; cursor:pointer; padding:2px 6px; border-radius:4px; border:1px dashed transparent; transition:border-color 0.15s;" onmouseover="this.style.borderColor='#86efac'; this.style.background='#f0fdf4';" onmouseout="this.style.borderColor='transparent'; this.style.background='transparent';">
          <strong style="color:#059669; font-size:0.92rem;">₹${s.totalPaid.toLocaleString('en-IN')}</strong>
          <i data-lucide="edit-3" style="width:12px; height:12px; color:#16a34a;"></i>
        </div>
        <div id="dirPaidEdit-${s.id}" style="display:none; align-items:center; gap:4px;">
          <input type="number" id="dirPaidInput-${s.id}" value="${s.totalPaid}" min="0" style="width:88px; padding:3px 6px; font-size:0.85rem; font-weight:700; color:#15803d; border:1.5px solid #16a34a; border-radius:4px; text-align:right;" onkeydown="if(event.key==='Enter'){event.preventDefault();saveInlinePaidEdit('${s.id}');}else if(event.key==='Escape'){cancelInlinePaidEdit('${s.id}');}">
          <button type="button" class="btn btn-sm" onclick="saveInlinePaidEdit('${s.id}')" title="Save" style="background:#16a34a; color:#fff; padding:3px 7px; font-size:0.75rem; font-weight:700;">✓</button>
          <button type="button" class="btn btn-sm" onclick="cancelInlinePaidEdit('${s.id}')" title="Cancel" style="background:#94a3b8; color:#fff; padding:3px 7px; font-size:0.75rem;">✕</button>
        </div>
        ${s.hasCustomPaid ? `<span style="font-size:0.68rem; color:#b45309; font-weight:600; display:block;">(Adjusted)</span>` : ''}
      </td>
      <td style="color:#ef4444; font-weight:700;">₹${s.balanceDue.toLocaleString('en-IN')}</td>
      <td><span class="badge ${badgeClass}">${s.status}</span></td>
      <td>
        <div style="display:flex; gap:6px;">
          <button class="btn btn-outline btn-sm" onclick="quickCollect('${s.id}')" title="Collect Fee">
            <i data-lucide="credit-card" style="width:14px; height:14px;"></i> Collect
          </button>
          <button class="btn btn-outline btn-sm" style="color:#22c55e; border-color:#86efac;" onclick="sendSingleWhatsAppReminder('${s.id}')" title="Send WhatsApp Fee Status">
            <i data-lucide="message-circle" style="width:14px; height:14px;"></i>
          </button>
          <button class="btn btn-outline btn-sm" onclick="editStudent('${s.id}')" title="Edit Student">
            <i data-lucide="edit-2" style="width:14px; height:14px;"></i>
          </button>
          <button class="btn btn-outline btn-sm" style="color:#ef4444;" onclick="deleteStudent('${s.id}')" title="Delete">
            <i data-lucide="trash-2" style="width:14px; height:14px;"></i>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });

  // Render footer totals
  if (tfoot) {
    tfoot.innerHTML = `
      <tr style="background:#f0fdf4; border-top:2px solid #16a34a;">
        <td colspan="7" style="font-weight:700; color:#15803d; padding:8px 12px; font-size:0.85rem;">
          COLLECTION SUMMARY &nbsp;(${students.length} Students Shown)
        </td>
        <td style="font-weight:800; color:#059669; font-size:0.85rem; padding:8px 6px;">
          ₹${totalCollected.toLocaleString('en-IN')}
        </td>
        <td colspan="3" style="font-size:0.78rem; color:#475569; padding:8px 6px;">
          Total Paid
        </td>
      </tr>
      <tr style="background:#f0fdf4;">
        <td colspan="4" style="padding:4px 12px 8px; font-size:0.78rem; color:#475569;">
          School Fees Collected: <strong style="color:#1e3a8a;">₹${totalSchoolCollected.toLocaleString('en-IN')}</strong>
          &nbsp;&nbsp;|&nbsp;&nbsp;
          Van Fees Collected: <strong style="color:#92400e;">₹${totalVanCollected.toLocaleString('en-IN')}</strong>
          &nbsp;&nbsp;|&nbsp;&nbsp;
          <strong style="color:#059669;">Total: ₹${totalCollected.toLocaleString('en-IN')}</strong>
        </td>
        <td colspan="7"></td>
      </tr>
    `;
  }

  initIcons();
}

// 3. Fee Structure & Dynamic Columns
async function fetchFeeStructure() {
  try {
    const res = await fetch('/api/fees-structure');
    const data = await res.json();
    if (data.columns && data.structures) {
      feeColumns = data.columns;
      feeStructures = data.structures;
    } else if (Array.isArray(data)) {
      feeStructures = data;
      feeColumns = [
        { key: "tuitionFee", name: "Tuition" },
        { key: "termFee", name: "Term" },
        { key: "examFee", name: "Exam" },
        { key: "labFee", name: "Lab" },
        { key: "libraryFee", name: "Library" },
        { key: "sportsFee", name: "Sports" }
      ];
    }
    renderFeeStructureTable();
    renderFeeComponentsCheckboxes();
  } catch (err) {
    console.error("Failed to load fee structure:", err);
  }
}

function renderFeeStructureTable() {
  const thead = document.getElementById('structureTableHead');
  if (thead) {
    thead.innerHTML = `
      <th style="min-width: 90px;">Class</th>
      ${feeColumns.map(col => `
        <th style="min-width: 140px;">
          <div class="col-header-box">
            <i data-lucide="edit-3" style="width: 13px; height: 13px; color: #3b82f6; flex-shrink: 0;"></i>
            <input type="text" class="col-name-input" data-col-key="${col.key}" value="${col.name}" 
              placeholder="Fee Name" title="Click to rename this column">
            <button class="btn-del-col" onclick="deleteFeeColumn('${col.key}')" title="Delete this fee column">&times;</button>
          </div>
          <div style="font-size: 0.72rem; color: #64748b; margin-top: 3px; text-align: center; text-transform: none;">(₹ per year)</div>
        </th>
      `).join('')}
      <th style="font-weight: 800; color: #1e3a8a; min-width: 130px;">Total Annual (₹)</th>
    `;
  }

  const tbody = document.getElementById('structureTableBody');
  tbody.innerHTML = '';

  feeStructures.forEach((item, index) => {
    const tr = document.createElement('tr');
    let cells = `<td><strong>${item.grade}</strong></td>`;
    
    feeColumns.forEach(col => {
      const val = item[col.key] !== undefined ? item[col.key] : 0;
      cells += `
        <td>
          <input type="number" class="form-control struct-input" data-idx="${index}" data-field="${col.key}" value="${val}" style="width: 110px;">
        </td>
      `;
    });

    const total = feeColumns.reduce((sum, c) => sum + Number(item[c.key] || 0), 0);
    cells += `<td id="structTotal_${index}" style="font-weight: 800; color: #1e3a8a; font-size: 1rem;">₹${total.toLocaleString('en-IN')}</td>`;

    tr.innerHTML = cells;
    tbody.appendChild(tr);
  });

  // Attach live calculation to inputs
  document.querySelectorAll('.struct-input').forEach(input => {
    input.addEventListener('input', (e) => {
      const idx = e.target.getAttribute('data-idx');
      const row = document.querySelectorAll('#structureTableBody tr')[idx];
      let rowTotal = 0;
      row.querySelectorAll('.struct-input').forEach(inp => {
        rowTotal += Number(inp.value || 0);
      });
      document.getElementById(`structTotal_${idx}`).innerText = `₹${rowTotal.toLocaleString('en-IN')}`;
    });
  });

  // Listen to column name changes and update checkboxes live
  document.querySelectorAll('.col-name-input').forEach(input => {
    input.addEventListener('input', () => {
      const colKey = input.getAttribute('data-col-key');
      const found = feeColumns.find(c => c.key === colKey);
      if (found) {
        found.name = input.value.trim() || 'Fee';
      }
      renderFeeComponentsCheckboxes();
    });
  });

  initIcons();
}

function addNewFeeColumn() {
  const colName = prompt("Enter new Fee Column name (e.g. Science Lab, Smart Class, Computer Lab, Development Fee):");
  if (!colName || !colName.trim()) return;

  const sanitized = colName.trim();
  const colKey = `fee_${Date.now()}`;
  feeColumns.push({ key: colKey, name: sanitized });

  // Initialize values for all grades
  feeStructures.forEach(item => {
    if (item[colKey] === undefined) {
      item[colKey] = 0;
    }
  });

  renderFeeStructureTable();
  renderFeeComponentsCheckboxes();
  showToast(`Added column: "${sanitized}". Remember to click "Save Changes".`);
}

function deleteFeeColumn(colKey) {
  if (feeColumns.length <= 1) {
    showToast("You must keep at least one fee column.", true);
    return;
  }
  const col = feeColumns.find(c => c.key === colKey);
  const name = col ? col.name : 'this column';
  if (!confirm(`Are you sure you want to remove the column "${name}"?`)) {
    return;
  }

  feeColumns = feeColumns.filter(c => c.key !== colKey);
  renderFeeStructureTable();
  renderFeeComponentsCheckboxes();
  showToast(`Column "${name}" removed. Click "Save Changes" to apply.`);
}

async function saveFeeStructureChanges() {
  // Read latest column names from header inputs
  const colInputs = document.querySelectorAll('.col-name-input');
  const updatedCols = [];
  colInputs.forEach(input => {
    const key = input.getAttribute('data-col-key');
    const name = (input.value || '').trim() || 'Fee Head';
    updatedCols.push({ key, name });
  });
  if (updatedCols.length > 0) {
    feeColumns = updatedCols;
  }

  // Read latest amounts from rows
  const updated = [];
  const rows = document.querySelectorAll('#structureTableBody tr');
  rows.forEach((row, idx) => {
    const grade = feeStructures[idx].grade;
    const item = { grade };
    row.querySelectorAll('.struct-input').forEach(inp => {
      const field = inp.getAttribute('data-field');
      item[field] = Number(inp.value || 0);
    });
    updated.push(item);
  });

  try {
    const res = await fetch('/api/fees-structure', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        columns: feeColumns,
        structures: updated
      })
    });
    if (res.ok) {
      showToast("Fee structures & column names saved successfully!");
      await loadAllData();
    } else {
      showToast("Failed to save changes", true);
    }
  } catch (err) {
    showToast("Error updating fee structures", true);
  }
}

function renderFeeComponentsCheckboxes() {
  const container = document.getElementById('feeComponentsContainer');
  if (!container) return;

  container.innerHTML = feeColumns.map((col, idx) => `
    <label style="display:flex; align-items:center; gap:6px; font-weight:normal; cursor:pointer;">
      <input type="checkbox" name="feeComp" value="${col.name}" ${idx < 2 ? 'checked' : ''}> ${col.name}
    </label>
  `).join('') + `
    <label style="display:flex; align-items:center; gap:6px; font-weight:normal; cursor:pointer;">
      <input type="checkbox" name="feeComp" value="Transport Fee"> Transport Fee
    </label>
  `;
}

// 3.5 Place-Wise Transportation Fee Structure
async function fetchTransportAreas() {
  try {
    const res = await fetch('/api/transport-areas');
    transportAreas = await res.json();
    renderTransportAreasTable();
    populateStudentModalBoardingAreas();
  } catch (err) {
    console.error("Failed to load transport areas:", err);
  }
}

function renderTransportAreasTable() {
  const tbody = document.getElementById('transportAreasTableBody');
  if (!tbody) return;
  tbody.innerHTML = '';

  if (!transportAreas || transportAreas.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding:24px; color:#64748b;">No bus routes configured. Click "+ Add Route Area" above.</td></tr>`;
    return;
  }

  transportAreas.forEach(area => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <input type="text" class="form-control area-name-input" data-id="${area.id}" value="${area.placeName}" style="font-weight:700; color:#1e3a8a;" placeholder="Area / Bus Stop Name">
      </td>
      <td>
        <div style="display:flex; align-items:center; gap:4px;">
          <span style="color:#64748b; font-weight:700;">₹</span>
          <input type="number" class="form-control area-monthly-input" data-id="${area.id}" value="${area.monthlyFee}" min="0" style="font-weight:600;">
        </div>
      </td>
      <td>
        <div style="display:flex; align-items:center; gap:4px;">
          <span style="color:#64748b; font-weight:700;">₹</span>
          <input type="number" class="form-control area-yearly-input" data-id="${area.id}" value="${area.yearlyFee}" min="0" style="font-weight:600;">
        </div>
      </td>
      <td style="text-align:center;">
        <button class="btn btn-outline btn-sm" style="color:#ef4444; padding:6px 10px;" onclick="deleteTransportArea('${area.id}')" title="Delete Area">
          <i data-lucide="trash-2" style="width:14px; height:14px;"></i>
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  initIcons();
}

function addNewTransportArea() {
  const newArea = {
    id: `area-${Date.now()}`,
    placeName: `New Route Area`,
    monthlyFee: 500,
    yearlyFee: 5000
  };
  transportAreas.push(newArea);
  renderTransportAreasTable();
  populateStudentModalBoardingAreas();
  showToast("New route area added. Remember to click 'Save Transport Fees'.");
}

async function deleteTransportArea(areaId) {
  const area = transportAreas.find(a => a.id === areaId);
  const name = area ? area.placeName : 'this area';
  if (!confirm(`Are you sure you want to remove transportation route "${name}"?`)) return;

  try {
    const res = await fetch(`/api/transport-areas/${areaId}`, { method: 'DELETE' });
    if (res.ok) {
      transportAreas = transportAreas.filter(a => a.id !== areaId);
      renderTransportAreasTable();
      populateStudentModalBoardingAreas();
      showToast(`Route area "${name}" removed`);
    } else {
      showToast("Failed to delete route area", true);
    }
  } catch (err) {
    showToast("Network error deleting area", true);
  }
}

async function saveTransportAreas() {
  const rows = document.querySelectorAll('#transportAreasTableBody tr');
  const updated = [];
  rows.forEach(row => {
    const nameInp = row.querySelector('.area-name-input');
    const monthInp = row.querySelector('.area-monthly-input');
    const yearInp = row.querySelector('.area-yearly-input');
    if (nameInp && monthInp && yearInp) {
      updated.push({
        id: nameInp.getAttribute('data-id'),
        placeName: (nameInp.value || '').trim() || 'Bus Stop',
        monthlyFee: Number(monthInp.value || 0),
        yearlyFee: Number(yearInp.value || 0)
      });
    }
  });

  try {
    const res = await fetch('/api/transport-areas', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ areas: updated })
    });

    if (res.ok) {
      const data = await res.json();
      transportAreas = data.transportAreas;
      renderTransportAreasTable();
      populateStudentModalBoardingAreas();
      showToast("Place-wise transport fees saved successfully!");
      await loadAllData();
    } else {
      showToast("Failed to save transport fees", true);
    }
  } catch (err) {
    showToast("Network error saving transport fees", true);
  }
}

function populateStudentModalBoardingAreas() {
  const select = document.getElementById('mStudentBoardingArea');
  if (!select) return;

  const currentVal = select.value;
  select.innerHTML = '<option value="None (Self Commute)">None (Self Commute - No Bus)</option>';

  transportAreas.forEach(a => {
    const opt = document.createElement('option');
    opt.value = a.placeName;
    opt.textContent = `${a.placeName} (Monthly: ₹${a.monthlyFee} | Yearly: ₹${a.yearlyFee})`;
    select.appendChild(opt);
  });

  const customOpt = document.createElement('option');
  customOpt.value = "Other / Custom Stop";
  customOpt.textContent = "Other / Custom Bus Stop";
  select.appendChild(customOpt);

  if (currentVal) {
    select.value = currentVal;
  }
}

// Student Modal Boarding and Transport Auto-Calculation
function onStudentBoardingAreaChange() {
  const select = document.getElementById('mStudentBoardingArea');
  const typeSelect = document.getElementById('mStudentTransportType');
  const monthlyInp = document.getElementById('mStudentTransportMonthlyFee');
  const annualInp = document.getElementById('mStudentTransportFee');
  const hiddenOpted = document.getElementById('mStudentTransport');

  const chosenArea = select.value;
  if (chosenArea === 'None (Self Commute)') {
    typeSelect.value = 'None';
    monthlyInp.value = 0;
    annualInp.value = 0;
    hiddenOpted.value = 'false';
    return;
  }

  // Default to Monthly or Yearly if currently None
  if (typeSelect.value === 'None') {
    typeSelect.value = 'Monthly';
  }

  const found = transportAreas.find(a => a.placeName.toLowerCase() === chosenArea.toLowerCase());
  if (found) {
    monthlyInp.value = found.monthlyFee;
    annualInp.value = typeSelect.value === 'Monthly' ? (found.monthlyFee * 10) : found.yearlyFee;
    hiddenOpted.value = 'true';
  } else {
    if (Number(monthlyInp.value) === 0) monthlyInp.value = 500;
    if (Number(annualInp.value) === 0) annualInp.value = 5000;
    hiddenOpted.value = 'true';
  }
}

function onStudentTransportTypeChange() {
  const select = document.getElementById('mStudentBoardingArea');
  const typeSelect = document.getElementById('mStudentTransportType');
  const monthlyInp = document.getElementById('mStudentTransportMonthlyFee');
  const annualInp = document.getElementById('mStudentTransportFee');
  const hiddenOpted = document.getElementById('mStudentTransport');

  if (typeSelect.value === 'None') {
    monthlyInp.value = 0;
    annualInp.value = 0;
    hiddenOpted.value = 'false';
    select.value = 'None (Self Commute)';
  } else {
    hiddenOpted.value = 'true';
    if (select.value === 'None (Self Commute)') {
      // Pick first area if available
      if (transportAreas.length > 0) {
        select.value = transportAreas[0].placeName;
      }
    }
    const found = transportAreas.find(a => a.placeName.toLowerCase() === select.value.toLowerCase());
    if (found) {
      monthlyInp.value = found.monthlyFee;
      annualInp.value = typeSelect.value === 'Monthly' ? (found.monthlyFee * 10) : found.yearlyFee;
    } else if (Number(monthlyInp.value) === 0) {
      monthlyInp.value = 500;
      annualInp.value = 5000;
    }
  }
}

function onStudentMonthlyFeeInput() {
  const typeSelect = document.getElementById('mStudentTransportType');
  const monthlyInp = document.getElementById('mStudentTransportMonthlyFee');
  const annualInp = document.getElementById('mStudentTransportFee');
  const val = Number(monthlyInp.value || 0);

  if (typeSelect.value === 'Monthly' && val > 0) {
    annualInp.value = val * 10;
  }
}

// Collect Fee Helpers for Transportation
function toggleCollectTransportSection() {
  const cb = document.getElementById('collectIncludeTransport');
  const fields = document.getElementById('collectTransportFields');
  if (!fields) return;
  fields.style.display = cb.checked ? 'block' : 'none';

  if (cb.checked) {
    const studentId = document.getElementById('collectStudentSelect').value;
    const student = allStudents.find(s => s.id === studentId);
    const areaInp = document.getElementById('collectBoardingArea');
    const feeInp = document.getElementById('collectTransportFee');
    const modeSelect = document.getElementById('collectTransportMode');

    if (student && student.transportOpted) {
      if (!areaInp.value) areaInp.value = student.boardingArea || "Pakkudi";
      modeSelect.value = student.transportType === 'Monthly' ? 'Monthly' : 'Yearly';
    } else {
      if (!areaInp.value) areaInp.value = (transportAreas[0] ? transportAreas[0].placeName : "Pakkudi");
      if (!feeInp.value) feeInp.value = modeSelect.value === 'Monthly' ? "500" : "5000";
    }
    onCollectTransportModeChange();
  }
}

function onCollectTransportModeChange() {
  const modeSelect = document.getElementById('collectTransportMode');
  const monthGroup = document.getElementById('collectTransportMonthGroup');
  const feeInp = document.getElementById('collectTransportFee');
  const areaInp = document.getElementById('collectBoardingArea');
  const studentId = document.getElementById('collectStudentSelect').value;
  const student = allStudents.find(s => s.id === studentId);

  if (!modeSelect) return;
  const mode = modeSelect.value;

  if (mode === 'Monthly') {
    if (monthGroup) monthGroup.style.display = 'block';
    if (student && student.transportMonthlyFee > 0) {
      feeInp.value = student.transportMonthlyFee;
    } else {
      const found = transportAreas.find(a => (areaInp.value || '').toLowerCase().includes(a.placeName.toLowerCase()));
      feeInp.value = found ? found.monthlyFee : 500;
    }
  } else {
    if (monthGroup) monthGroup.style.display = 'none';
    if (student && student.transportFee > 0) {
      feeInp.value = student.transportFee;
    } else {
      const found = transportAreas.find(a => (areaInp.value || '').toLowerCase().includes(a.placeName.toLowerCase()));
      feeInp.value = found ? found.yearlyFee : 5000;
    }
  }
}

// 4. Fetch Payments / Receipts
async function fetchPayments() {
  try {
    const res = await fetch('/api/payments');
    allReceipts = await res.json();
    renderTransactionsTable(allReceipts);
    renderRecentDashboardPayments(allReceipts.slice(0, 5));
  } catch (err) {
    console.error("Failed to load payments:", err);
  }
}

function renderTransactionsTable(receipts) {
  const tbody = document.getElementById('transactionsTableBody');
  tbody.innerHTML = '';

  if (receipts.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding:32px; color:#64748b;">No transaction receipts logged yet.</td></tr>`;
    return;
  }

  receipts.forEach(r => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong style="color:#1e3a8a;">${r.receiptNo}</strong></td>
      <td>
        <div><strong>${r.studentName}</strong></div>
        <div style="font-size:0.75rem; color:#64748b;">${r.studentId}</div>
      </td>
      <td><span class="grade-pill">${r.grade}</span></td>
      <td>${r.date}</td>
      <td>${r.term || 'Term Fee'}</td>
      <td><span class="badge" style="background:#f1f5f9; color:#334155;">${r.paymentMethod}</span></td>
      <td style="color:#059669; font-weight:800; font-size:0.95rem;">₹${Number(r.amount).toLocaleString('en-IN')}</td>
      <td style="font-size:0.8rem; color:#64748b;">${r.receivedBy || 'Accounts'}</td>
      <td>
        <button class="btn btn-outline btn-sm" onclick="viewReceipt('${r.receiptNo}')">
          <i data-lucide="printer" style="width:14px; height:14px;"></i> Print
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  initIcons();
}

function renderRecentDashboardPayments(receipts) {
  const tbody = document.getElementById('dashRecentPayments');
  tbody.innerHTML = '';

  if (receipts.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:24px; color:#64748b;">No recent transactions.</td></tr>`;
    return;
  }

  receipts.forEach(r => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong style="color:#1e3a8a;">${r.receiptNo}</strong></td>
      <td><strong>${r.studentName}</strong></td>
      <td><span class="grade-pill">${r.grade}</span></td>
      <td>${r.date}</td>
      <td>${r.paymentMethod}</td>
      <td style="color:#059669; font-weight:700;">₹${Number(r.amount).toLocaleString('en-IN')}</td>
      <td>
        <button class="btn btn-outline btn-sm" onclick="viewReceipt('${r.receiptNo}')">View</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// 5. Defaulters Report
function filterDefaultersTable() {
  const selectedGrade = document.getElementById('defaulterClassFilter')?.value || 'All';
  const selectedStatus = document.getElementById('defaulterStatusFilter')?.value || 'All';
  renderDefaulters(selectedGrade, selectedStatus);
}

function renderDefaulters(gradeFilter = 'All', statusFilter = 'All') {
  const tbody = document.getElementById('defaultersTableBody');
  if (!tbody) return;
  tbody.innerHTML = '';

  const allDefaulters = allStudents.filter(s => s.balanceDue > 0);

  // Update stats on WhatsApp card from all defaulters across school
  const dueCountElem = document.getElementById('waDueStudentCount');
  if (dueCountElem) dueCountElem.innerText = allDefaulters.length;

  const totalSchoolDue = allDefaulters.reduce((acc, s) => acc + (s.schoolDue || 0), 0);
  const totalVanDue = allDefaulters.reduce((acc, s) => acc + (s.vanDue || 0), 0);
  const totalCombinedDue = allDefaulters.reduce((acc, s) => acc + s.balanceDue, 0);

  const schoolDueElem = document.getElementById('waTotalSchoolDue');
  if (schoolDueElem) schoolDueElem.innerText = `₹${totalSchoolDue.toLocaleString('en-IN')}`;

  const vanDueElem = document.getElementById('waTotalVanDue');
  if (vanDueElem) vanDueElem.innerText = `₹${totalVanDue.toLocaleString('en-IN')}`;

  const combinedDueElem = document.getElementById('waTotalCombinedDue');
  if (combinedDueElem) combinedDueElem.innerText = `₹${totalCombinedDue.toLocaleString('en-IN')}`;

  // Apply filters to table display
  let filtered = allDefaulters.slice();

  if (gradeFilter !== 'All') {
    filtered = filtered.filter(s => s.grade.toLowerCase() === gradeFilter.toLowerCase());
  }

  if (statusFilter === 'Unpaid') {
    filtered = filtered.filter(s => (s.totalPaid || 0) === 0);
  } else if (statusFilter === 'Partial') {
    filtered = filtered.filter(s => (s.totalPaid || 0) > 0);
  }

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="10" style="text-align:center; padding:32px; color:#10b981; font-weight:600;">No student records found matching the chosen class &amp; status criteria.</td></tr>`;
    return;
  }

  filtered.forEach(s => {
    const isUnpaid = (s.totalPaid || 0) === 0;
    const statusBadge = isUnpaid 
      ? `<span class="badge badge-unpaid">Unpaid</span>` 
      : `<span class="badge" style="background:#fef3c7; color:#92400e; font-weight:700;">Partially Paid</span>`;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${s.name}</strong></td>
      <td>${s.rollNo || '-'}</td>
      <td><span class="grade-pill">${s.grade}</span> Sec ${s.section || 'A'}</td>
      <td>${s.parentName || '-'}</td>
      <td><a href="tel:${s.contact}" style="color:#1e3a8a; text-decoration:none; font-weight:600;">${s.contact || '-'}</a></td>
      <td>${statusBadge}</td>
      <td style="color:#b91c1c; font-weight:700;">₹${(s.schoolDue || 0).toLocaleString('en-IN')}</td>
      <td style="color:#d97706; font-weight:700;">₹${(s.vanDue || 0).toLocaleString('en-IN')}</td>
      <td style="color:#ef4444; font-weight:800; font-size:1.02rem;">₹${s.balanceDue.toLocaleString('en-IN')}</td>
      <td>
        <div style="display:flex; gap:6px;">
          <button class="btn btn-primary btn-sm" onclick="quickCollect('${s.id}')">Collect</button>
          <button class="btn btn-sm" style="background:#25D366; color:#fff; font-weight:600; padding:6px 10px;" onclick="sendSingleWhatsAppReminder('${s.id}')" title="Send WhatsApp Due Notice">
            <i data-lucide="message-circle" style="width:14px; height:14px; display:inline; margin-right:3px;"></i> WhatsApp
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });

  initIcons();
}

// 6. Collect Fees Logic & Select Dropdown
function populateStudentSelect() {
  const select = document.getElementById('collectStudentSelect');
  select.innerHTML = '<option value="">-- Choose Student (Type or Select) --</option>';

  allStudents.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s.id;
    opt.textContent = `${s.name} (${s.grade} - ${s.rollNo || s.id}) - Due: ₹${s.balanceDue.toLocaleString('en-IN')}`;
    select.appendChild(opt);
  });

  select.addEventListener('change', (e) => {
    updateCollectStudentPreview(e.target.value);
  });
}

function updateCollectStudentPreview(studentId) {
  const preview = document.getElementById('collectStudentPreview');
  const student = allStudents.find(s => s.id === studentId);
  if (!student) {
    preview.style.display = 'none';
    return;
  }

  preview.style.display = 'block';
  document.getElementById('previewStudentName').innerText = `${student.name} (${student.id})`;
  
  const statusBadge = document.getElementById('previewStatusBadge');
  statusBadge.innerText = student.status;
  statusBadge.className = `badge ${student.status === 'Paid' ? 'badge-paid' : (student.status === 'Partial' ? 'badge-partial' : 'badge-unpaid')}`;

  document.getElementById('previewGrade').innerText = `${student.grade} - Section ${student.section}`;
  document.getElementById('previewNetPayable').innerText = `₹${student.netPayable.toLocaleString('en-IN')}`;
  document.getElementById('previewPaid').innerText = `₹${student.totalPaid.toLocaleString('en-IN')}`;
  document.getElementById('previewDue').innerText = `₹${student.balanceDue.toLocaleString('en-IN')}`;
  
  const boardingElem = document.getElementById('previewBoardingArea');
  if (boardingElem) {
    boardingElem.innerText = student.boardingArea || "Campus / Local";
  }

  const hasBus = student.transportOpted && (Number(student.transportFee) > 0 || Number(student.transportMonthlyFee) > 0);
  const planText = hasBus 
    ? `${student.transportType || 'Bus'} (₹${Number(student.transportMonthlyFee || Math.round(student.transportFee / 10))} / mo)` 
    : 'No (Self Commute)';
  document.getElementById('previewTransport').innerText = planText;
  document.getElementById('previewConcession').innerText = student.concession > 0 ? `₹${student.concession}` : 'None';

  // Auto-check or uncheck Transport Fee checkbox
  const transportCb = document.querySelector('input[name="feeComp"][value="Transport Fee"]');
  if (transportCb) {
    transportCb.checked = hasBus;
  }

  // Pre-configure collection transport inputs
  const incTransport = document.getElementById('collectIncludeTransport');
  const transportFields = document.getElementById('collectTransportFields');
  const areaInput = document.getElementById('collectBoardingArea');
  const modeSelect = document.getElementById('collectTransportMode');
  const feeInput = document.getElementById('collectTransportFee');

  if (incTransport && transportFields) {
    if (hasBus) {
      incTransport.checked = true;
      transportFields.style.display = 'block';
      if (areaInput) areaInput.value = student.boardingArea || "Pakkudi";
      if (modeSelect) modeSelect.value = student.transportType === 'Monthly' ? 'Monthly' : 'Yearly';
      onCollectTransportModeChange();
    } else {
      incTransport.checked = false;
      transportFields.style.display = 'none';
      if (areaInput) areaInput.value = "";
      if (feeInput) feeInput.value = "";
    }
  }

  // Prefill amount with balance due if positive
  if (student.balanceDue > 0) {
    document.getElementById('collectAmount').value = student.balanceDue;
  } else {
    document.getElementById('collectAmount').value = '';
  }
}

function quickCollect(studentId) {
  switchTab('collect');
  const select = document.getElementById('collectStudentSelect');
  select.value = studentId;
  updateCollectStudentPreview(studentId);
}

// Form Handlers
function setupForms() {
  // Collect fee submit
  const collectForm = document.getElementById('collectFeeForm');
  collectForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const studentId = document.getElementById('collectStudentSelect').value;
    const amount = Number(document.getElementById('collectAmount').value);
    const term = document.getElementById('collectTerm').value;
    const paymentMethod = document.getElementById('collectMode').value;
    const transactionId = document.getElementById('collectRef').value;
    const remarks = document.getElementById('collectRemarks').value;

    const feeCategories = [];
    document.querySelectorAll('input[name="feeComp"]:checked').forEach(cb => {
      feeCategories.push(cb.value);
    });

    if (!studentId) {
      showToast("Please choose a student first", true);
      return;
    }
    if (!amount || amount <= 0) {
      showToast("Please specify a valid payment amount", true);
      return;
    }

    const incTransport = document.getElementById('collectIncludeTransport')?.checked;
    const tMode = incTransport ? (document.getElementById('collectTransportMode')?.value || "Monthly") : "None";
    const tMonth = (incTransport && tMode === 'Monthly') ? (document.getElementById('collectTransportMonth')?.value || "") : "";
    const tBoarding = incTransport ? (document.getElementById('collectBoardingArea')?.value || "").trim() : "";
    const tAmount = incTransport ? Number(document.getElementById('collectTransportFee')?.value || 0) : 0;

    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          amount,
          term,
          paymentMethod,
          transactionId,
          remarks,
          feeCategories,
          receivedBy: "Accounts Admin",
          boardingArea: tBoarding,
          transportPaymentMode: tMode,
          transportMonth: tMonth,
          transportAmount: tAmount
        })
      });

      if (res.ok) {
        const data = await res.json();
        showToast(`Payment of ₹${amount.toLocaleString('en-IN')} recorded successfully!`);
        collectForm.reset();
        document.getElementById('collectStudentPreview').style.display = 'none';
        await loadAllData();
        // Automatically pop up printable receipt
        viewReceipt(data.payment.receiptNo);
      } else {
        const errData = await res.json();
        showToast(errData.error || "Failed to record payment", true);
      }
    } catch (err) {
      showToast("Network error submitting payment", true);
    }
  });

  // Student Add / Edit submit
  const studentForm = document.getElementById('studentForm');

  studentForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const editId = document.getElementById('studentEditId').value;
    const bArea = document.getElementById('mStudentBoardingArea')?.value || "None (Self Commute)";
    const tType = document.getElementById('mStudentTransportType')?.value || "None";
    const tMonthly = Number(document.getElementById('mStudentTransportMonthlyFee')?.value || 0);
    const tFee = Number(document.getElementById('mStudentTransportFee')?.value || 0);
    const tOpted = (tType !== 'None') && (tFee > 0 || tMonthly > 0);

    const payload = {
      name: document.getElementById('mStudentName').value,
      grade: document.getElementById('mStudentGrade').value,
      section: document.getElementById('mStudentSection').value,
      rollNo: document.getElementById('mStudentRoll').value,
      parentName: document.getElementById('mStudentParent').value,
      contact: document.getElementById('mStudentPhone').value,
      email: document.getElementById('mStudentEmail').value,
      boardingArea: bArea,
      transportType: tType,
      transportMonthlyFee: tMonthly,
      transportOpted: tOpted,
      transportFee: tFee,
      concession: Number(document.getElementById('mStudentConcession').value || 0),
      address: document.getElementById('mStudentAddress').value,
      // Custom fee: empty string means revert to class fee structure
      customSchoolFee: (() => {
        const v = document.getElementById('mStudentCustomFee')?.value;
        return (v === '' || v === null || v === undefined) ? null : Number(v);
      })(),
      // Custom paid amount: empty string means revert to payment ledger sum
      customPaidAmount: (() => {
        const v = document.getElementById('mStudentCustomPaid')?.value;
        return (v === '' || v === null || v === undefined) ? null : Number(v);
      })()
    };

    try {
      let res;
      if (editId) {
        res = await fetch(`/api/students/${editId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch('/api/students', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        showToast(editId ? "Student profile updated" : "New student registered successfully");
        closeStudentModal();
        await loadAllData();
      } else {
        const err = await res.json();
        showToast(err.error || "Error saving student", true);
      }
    } catch (err) {
      showToast("Error processing request", true);
    }
  });
}

// Student Modal Management
function openNewStudentModal() {
  document.getElementById('studentModalTitle').innerText = "Register New Student";
  document.getElementById('studentEditId').value = "";
  document.getElementById('studentForm').reset();
  const bAreaSelect = document.getElementById('mStudentBoardingArea');
  if (bAreaSelect) bAreaSelect.value = "None (Self Commute)";
  const tTypeSelect = document.getElementById('mStudentTransportType');
  if (tTypeSelect) tTypeSelect.value = "None";
  const monthlyInp = document.getElementById('mStudentTransportMonthlyFee');
  if (monthlyInp) monthlyInp.value = "0";
  document.getElementById('mStudentTransportFee').value = "0";
  document.getElementById('mStudentConcession').value = "0";
  const customFeeInp = document.getElementById('mStudentCustomFee');
  if (customFeeInp) customFeeInp.value = '';
  const customFeeNote = document.getElementById('mStudentCustomFeeNote');
  if (customFeeNote) customFeeNote.innerHTML = '';
  const customPaidInp = document.getElementById('mStudentCustomPaid');
  if (customPaidInp) customPaidInp.value = '';
  const customPaidNote = document.getElementById('mStudentCustomPaidNote');
  if (customPaidNote) customPaidNote.innerHTML = '';
  document.getElementById('studentModal').classList.add('open');
}

function editStudent(id) {
  const student = allStudents.find(s => s.id === id);
  if (!student) return;

  document.getElementById('studentModalTitle').innerText = `Edit Student: ${student.name}`;
  document.getElementById('studentEditId').value = student.id;
  document.getElementById('mStudentName').value = student.name;
  document.getElementById('mStudentGrade').value = student.grade;
  document.getElementById('mStudentSection').value = student.section || 'A';
  document.getElementById('mStudentRoll').value = student.rollNo || '';
  document.getElementById('mStudentParent').value = student.parentName || '';
  document.getElementById('mStudentPhone').value = student.contact || '';
  document.getElementById('mStudentEmail').value = student.email || '';

  const bAreaSelect = document.getElementById('mStudentBoardingArea');
  if (bAreaSelect) {
    bAreaSelect.value = student.boardingArea || "None (Self Commute)";
  }

  const tTypeSelect = document.getElementById('mStudentTransportType');
  if (tTypeSelect) {
    tTypeSelect.value = student.transportType || (student.transportOpted ? "Yearly" : "None");
  }

  const monthlyInp = document.getElementById('mStudentTransportMonthlyFee');
  if (monthlyInp) {
    monthlyInp.value = student.transportMonthlyFee || (student.transportOpted ? Math.round(student.transportFee / 10) : 0);
  }

  document.getElementById('mStudentTransport').value = student.transportOpted ? 'true' : 'false';
  document.getElementById('mStudentTransportFee').value = student.transportFee || 0;
  document.getElementById('mStudentConcession').value = student.concession || 0;
  document.getElementById('mStudentAddress').value = student.address || '';

  // Custom fee override
  const customFeeInp = document.getElementById('mStudentCustomFee');
  const customFeeNote = document.getElementById('mStudentCustomFeeNote');
  if (customFeeInp) {
    const hasCustom = student.customSchoolFee !== undefined && student.customSchoolFee !== null && student.customSchoolFee !== '';
    customFeeInp.value = hasCustom ? student.customSchoolFee : '';
    if (customFeeNote) {
      const classFee = student.classBaseTotal || student.baseTotal || 0;
      customFeeNote.innerHTML = hasCustom
        ? `<span style="color:#b45309; font-weight:600;">Custom fee active: ₹${Number(student.customSchoolFee).toLocaleString('en-IN')}</span> <span style="color:#78716c;">(Class standard: ₹${Number(classFee).toLocaleString('en-IN')})</span>`
        : `<span style="color:#64748b;">Class standard fee: ₹${Number(classFee).toLocaleString('en-IN')} — enter amount above to override for this student only</span>`;
    }
  }

  // Custom paid amount override
  const customPaidInp = document.getElementById('mStudentCustomPaid');
  const customPaidNote = document.getElementById('mStudentCustomPaidNote');
  if (customPaidInp) {
    const hasCustomPaid = student.customPaidAmount !== undefined && student.customPaidAmount !== null && student.customPaidAmount !== '';
    customPaidInp.value = hasCustomPaid ? student.customPaidAmount : '';
    if (customPaidNote) {
      const ledgerSum = student.paymentSum !== undefined ? student.paymentSum : (student.totalPaid || 0);
      customPaidNote.innerHTML = hasCustomPaid
        ? `<span style="color:#15803d; font-weight:600;">Directly adjusted: ₹${Number(student.customPaidAmount).toLocaleString('en-IN')}</span> <span style="color:#78716c;">(Ledger sum: ₹${Number(ledgerSum).toLocaleString('en-IN')})</span>`
        : `<span style="color:#64748b;">Ledger history sum: ₹${Number(ledgerSum).toLocaleString('en-IN')} — enter amount above to directly adjust</span>`;
    }
  }

  document.getElementById('studentModal').classList.add('open');
}

function closeStudentModal() {
  document.getElementById('studentModal').classList.remove('open');
}

async function deleteStudent(id) {
  if (confirm(`Are you sure you want to delete student ${id}? This will also delete their payment history.`)) {
    try {
      const res = await fetch(`/api/students/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast("Student deleted successfully");
        loadAllData();
      }
    } catch (err) {
      showToast("Error deleting student", true);
    }
  }
}

// -------------------------------------------------------------
// Direct Inline Paid Amount Edit in Student Directory
// -------------------------------------------------------------
function startInlinePaidEdit(studentId) {
  const viewEl = document.getElementById(`dirPaidView-${studentId}`);
  const editEl = document.getElementById(`dirPaidEdit-${studentId}`);
  const inputEl = document.getElementById(`dirPaidInput-${studentId}`);
  if (!viewEl || !editEl) return;
  viewEl.style.display = 'none';
  editEl.style.display = 'inline-flex';
  if (inputEl) {
    inputEl.focus();
    inputEl.select();
  }
}

function cancelInlinePaidEdit(studentId) {
  const viewEl = document.getElementById(`dirPaidView-${studentId}`);
  const editEl = document.getElementById(`dirPaidEdit-${studentId}`);
  if (viewEl && editEl) {
    viewEl.style.display = 'inline-flex';
    editEl.style.display = 'none';
  }
}

async function saveInlinePaidEdit(studentId) {
  const inputEl = document.getElementById(`dirPaidInput-${studentId}`);
  const student = allStudents.find(s => s.id === studentId);
  if (!inputEl || !student) return;

  const valStr = inputEl.value.trim();
  const val = Number(valStr);
  if (valStr !== '' && (isNaN(val) || val < 0)) {
    showToast("Please enter a valid non-negative amount", true);
    return;
  }

  const ledgerSum = Number(student.paymentSum !== undefined ? student.paymentSum : 0);
  const customPaidAmount = (valStr === '' || val === ledgerSum) ? null : val;

  try {
    const res = await fetch(`/api/students/${studentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customPaidAmount })
    });

    if (res.ok) {
      showToast(`Paid amount for ${student.name} updated to ₹${(customPaidAmount !== null ? customPaidAmount : ledgerSum).toLocaleString('en-IN')}`);
      await loadAllData();
      // Re-apply active filters if any
      if (typeof filterStudents === 'function') {
        filterStudents();
      } else {
        renderStudentsTable(allStudents);
      }
    } else {
      const err = await res.json();
      showToast(err.error || "Failed to update paid amount", true);
    }
  } catch (err) {
    showToast("Network error updating paid amount", true);
  }
}

// -------------------------------------------------------------
// Change / Adjust Paid Amount Modal in Student Directory
// -------------------------------------------------------------
function openChangePaidModal(studentId) {
  const student = allStudents.find(s => s.id === studentId);
  if (!student) return;

  document.getElementById('changePaidStudentId').value = student.id;
  document.getElementById('changePaidStudentName').innerText = student.name;
  document.getElementById('changePaidStudentRoll').innerText = `Roll: ${student.rollNo || '-'}`;
  document.getElementById('changePaidStudentClass').innerText = `${student.grade} - Section ${student.section || 'A'} | Parent: ${student.parentName || '-'}`;

  const netPayable = Number(student.netPayable || 0);
  const currentPaid = Number(student.totalPaid || 0);
  const currentDue = Number(student.balanceDue || 0);
  const ledgerSum = Number(student.paymentSum !== undefined ? student.paymentSum : currentPaid);

  document.getElementById('changePaidNetTotal').innerText = `₹${netPayable.toLocaleString('en-IN')}`;
  document.getElementById('changePaidCurrentAmt').innerText = `₹${currentPaid.toLocaleString('en-IN')}`;
  document.getElementById('changePaidCurrentDue').innerText = `₹${currentDue.toLocaleString('en-IN')}`;
  document.getElementById('changePaidLedgerSum').innerText = `₹${ledgerSum.toLocaleString('en-IN')}`;

  document.getElementById('changePaidInput').value = currentPaid;
  document.getElementById('changePaidModal').classList.add('open');
  initIcons();

  setTimeout(() => {
    const inp = document.getElementById('changePaidInput');
    if (inp) {
      inp.focus();
      inp.select();
    }
  }, 100);
}

function closeChangePaidModal() {
  document.getElementById('changePaidModal').classList.remove('open');
}

function resetPaidToLedgerSum() {
  const studentId = document.getElementById('changePaidStudentId').value;
  const student = allStudents.find(s => s.id === studentId);
  if (!student) return;
  const ledgerSum = Number(student.paymentSum !== undefined ? student.paymentSum : 0);
  document.getElementById('changePaidInput').value = ledgerSum;
  showToast(`Reset to ledger transaction sum: ₹${ledgerSum.toLocaleString('en-IN')}`);
}

async function handleSaveChangePaid(event) {
  event.preventDefault();
  const studentId = document.getElementById('changePaidStudentId').value;
  const student = allStudents.find(s => s.id === studentId);
  if (!student) return;

  const valStr = document.getElementById('changePaidInput').value.trim();
  const val = Number(valStr);

  const ledgerSum = Number(student.paymentSum !== undefined ? student.paymentSum : 0);
  let customPaidAmount = null;

  // If user entered a value different from ledger sum, set customPaidAmount, otherwise revert to null (ledger sum)
  if (valStr !== '' && val >= 0 && val !== ledgerSum) {
    customPaidAmount = val;
  }

  try {
    const res = await fetch(`/api/students/${studentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customPaidAmount })
    });

    if (res.ok) {
      showToast(customPaidAmount !== null ? `Paid amount for ${student.name} updated to ₹${val.toLocaleString('en-IN')}!` : `Paid amount for ${student.name} reset to ledger sum (₹${ledgerSum.toLocaleString('en-IN')})`);
      closeChangePaidModal();
      await loadAllData();
      renderStudentsTable(allStudents);
    } else {
      const err = await res.json();
      showToast(err.error || "Failed to update paid amount", true);
    }
  } catch (err) {
    showToast("Network error updating paid amount", true);
  }
}

// Receipt Modal & Display
async function viewReceipt(receiptNo) {
  try {
    const res = await fetch(`/api/payments/${receiptNo}`);
    if (!res.ok) {
      showToast("Unable to load receipt details", true);
      return;
    }
    const data = await res.json();
    const p = data.payment;
    const s = data.student;
    currentReceiptData = { payment: p, student: s, schoolInfo: data.schoolInfo };

    document.getElementById('rcptNo').innerText = p.receiptNo;
    document.getElementById('rcptDate').innerText = p.date;
    document.getElementById('rcptStudentName').innerText = p.studentName;
    document.getElementById('rcptStudentId').innerText = s?.admissionNo ? `${s.rollNo} (Adm No: ${s.admissionNo})` : (s?.rollNo || p.studentId || '-');
    document.getElementById('rcptGrade').innerText = `${p.grade} (Sec ${s?.section || 'A'})`;
    document.getElementById('rcptParent').innerText = s?.parentName || 'Parent / Guardian';
    document.getElementById('rcptMode').innerText = `${p.paymentMethod} (Txn: ${p.transactionId || 'N/A'})`;
    document.getElementById('rcptTotalAmount').innerText = `₹${Number(p.amount).toLocaleString('en-IN')}`;

    // Transportation details for receipt
    const resolvedBoarding = p.boardingArea || s?.boardingArea || "Campus / Local";
    const transportAmt = (p.transportFee !== undefined && p.transportFee !== null && p.transportFee > 0)
      ? Number(p.transportFee)
      : (s ? Number(s.transportFee || 0) : 0);
    const transportOpted = Boolean(p.transportOpted || (s && s.transportOpted) || transportAmt > 0);

    const bAreaElem = document.getElementById('rcptBoardingArea');
    if (bAreaElem) {
      bAreaElem.innerText = resolvedBoarding;
    }

    let planLabel = "Self Commute (No Bus)";
    if (transportOpted && transportAmt > 0) {
      if (p.transportPaymentMode === 'Monthly') {
        planLabel = `Monthly Fee (${p.transportMonth || 'Current Month'}) - ₹${transportAmt.toLocaleString('en-IN')}`;
      } else if (p.transportPaymentMode === 'Yearly') {
        planLabel = `Yearly / Annual (2026-2027) - ₹${transportAmt.toLocaleString('en-IN')}`;
      } else {
        planLabel = `${s?.transportType || 'Active'} Plan - ₹${transportAmt.toLocaleString('en-IN')}`;
      }
    }
    const tPeriodElem = document.getElementById('rcptTransportPeriod');
    if (tPeriodElem) {
      tPeriodElem.innerText = planLabel;
    }

    if (data.schoolInfo) {
      const info = data.schoolInfo;
      const rcptAddr = document.getElementById('rcptSchoolAddress');
      if (rcptAddr) {
        rcptAddr.innerText = `${info.address} | Phone: ${info.phone} | Email: ${info.email}`;
      }
    }

    // Table rows
    const tbody = document.getElementById('rcptItemsBody');
    tbody.innerHTML = '';
    const categories = p.feeCategories && p.feeCategories.length > 0 ? [...p.feeCategories] : ["Tuition Fee"];

    const isTransportReceipt = (transportOpted && transportAmt > 0) || p.transportPaymentMode === 'Monthly' || p.transportPaymentMode === 'Yearly';
    if (isTransportReceipt && !categories.some(c => c.toLowerCase().includes('transport'))) {
      categories.push("Transportation Fee");
    }

    let slNo = 1;
    categories.forEach((cat) => {
      const isTransport = cat.toLowerCase().includes('transport');
      if (isTransport) {
        const tr = document.createElement('tr');
        const monthPaid = p.transportMonth || p.term || 'Monthly Van Fee';
        const vanDetails = s ? getStudentVanMonthDetails(s) : null;
        const progressNote = vanDetails ? ` (${vanDetails.paidCount} of 11 Months Paid, ${vanDetails.remainingCount} Months Remaining)` : '';
        const desc = `School Van / Transportation Fee — Month: ${monthPaid}`;
        const cycle = p.transportPaymentMode === 'Monthly' 
          ? `Monthly Fee: ${monthPaid}` 
          : `Yearly / Annual (2026-2027)`;
        const lineAmt = `₹${Number(p.amount).toLocaleString('en-IN')}`;

        tr.innerHTML = `
          <td>${slNo++}</td>
          <td>
            <div style="font-weight:700; color:#1e3a8a; font-size:0.95rem;">${desc}</div>
            <div style="margin-top:4px; display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
              <span class="badge" style="background:#dcfce7; color:#15803d; font-weight:700; font-size:0.75rem;">
                Paid Month: ${monthPaid}
              </span>
              <span class="badge" style="background:#fef3c7; color:#92400e; font-size:0.75rem;">Route Stop: ${resolvedBoarding}</span>
              ${progressNote ? `<span style="font-size:0.75rem; color:#64748b; font-weight:600;">${progressNote}</span>` : ''}
            </div>
          </td>
          <td><strong style="color:#2563eb;">${cycle}</strong></td>
          <td style="text-align: right; font-weight:800; color:#10b981; font-size:1.05rem;">${lineAmt}</td>
        `;
        tbody.appendChild(tr);
      } else {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${slNo++}</td>
          <td><strong>${cat}</strong></td>
          <td>${p.term || 'Academic Term'}</td>
          <td style="text-align: right;">${slNo === 2 && !isTransportReceipt ? `₹${Number(p.amount).toLocaleString('en-IN')}` : 'Included'}</td>
        `;
        tbody.appendChild(tr);
      }
    });

    if (tbody.children.length === 1) {
      const lastCell = tbody.children[0].querySelector('td:last-child');
      if (lastCell) lastCell.innerText = `₹${Number(p.amount).toLocaleString('en-IN')}`;
    }

    if (s) {
      const academicBaseElem = document.getElementById('rcptAcademicBase');
      if (academicBaseElem) academicBaseElem.innerText = `₹${(s.baseTotal || 0).toLocaleString('en-IN')}`;

      const rcptTransportAmountElem = document.getElementById('rcptTransportAmount');
      if (rcptTransportAmountElem) {
        rcptTransportAmountElem.innerText = (transportOpted && transportAmt > 0)
          ? `₹${transportAmt.toLocaleString('en-IN')}`
          : `₹0 (None)`;
      }

      document.getElementById('rcptAnnualNet').innerText = `₹${s.netPayable.toLocaleString('en-IN')}`;
      document.getElementById('rcptCumPaid').innerText = `₹${s.totalPaid.toLocaleString('en-IN')}`;
      document.getElementById('rcptRemainingDue').innerText = `₹${s.balanceDue.toLocaleString('en-IN')}`;

      const concessionElem = document.getElementById('rcptConcessionAmt');
      if (concessionElem) concessionElem.innerText = `₹${(s.concession || 0).toLocaleString('en-IN')}`;

      const busStatusElem = document.getElementById('rcptBusStatus');
      if (busStatusElem) {
        busStatusElem.innerText = (transportOpted && transportAmt > 0)
          ? `Route: ${resolvedBoarding} (${p.transportPaymentMode || s.transportType || 'Active'})`
          : `Self Commute`;
      }
    }

    document.getElementById('receiptModal').classList.add('open');
  } catch (err) {
    showToast("Error rendering receipt", true);
  }
}

function closeReceiptModal() {
  document.getElementById('receiptModal').classList.remove('open');
}

// Search and Filter logic
function setupSearchAndFilters() {
  const searchInput = document.getElementById('studentSearchInput');
  const gradeSelect = document.getElementById('filterGrade');
  const statusSelect = document.getElementById('filterStatus');

  const filterHandler = () => {
    filterStudentsList();
  };

  searchInput.addEventListener('input', filterHandler);
  gradeSelect.addEventListener('change', filterHandler);
  statusSelect.addEventListener('change', filterHandler);

  // Receipt filter
  const rGrade = document.getElementById('filterReceiptGrade');
  if (rGrade) {
    rGrade.addEventListener('change', () => {
      const selected = rGrade.value;
      if (selected === 'All') {
        renderTransactionsTable(allReceipts);
      } else {
        const filtered = allReceipts.filter(r => r.grade === selected);
        renderTransactionsTable(filtered);
      }
    });
  }

  // Van Register Filters
  const vanSearch = document.getElementById('vanSearchInput');
  const vanGrade = document.getElementById('vanFilterGrade');
  const vanStatus = document.getElementById('vanFilterStatus');
  if (vanSearch) vanSearch.addEventListener('input', () => filterVanRegister());
  if (vanGrade) vanGrade.addEventListener('change', () => filterVanRegister());
  if (vanStatus) vanStatus.addEventListener('change', () => filterVanRegister());
}

function filterStudentsList() {
  const query = document.getElementById('studentSearchInput').value.toLowerCase().trim();
  const selectedGrade = document.getElementById('filterGrade').value;
  const selectedStatus = document.getElementById('filterStatus').value;

  let filtered = allStudents.filter(s => {
    const matchesGrade = (selectedGrade === 'All') || (s.grade === selectedGrade);
    const matchesStatus = (selectedStatus === 'All') || (s.status === selectedStatus);
    const matchesQuery = !query || (
      (s.name && s.name.toLowerCase().includes(query)) ||
      (s.nameTamil && s.nameTamil.toLowerCase().includes(query)) ||
      (s.id && s.id.toLowerCase().includes(query)) ||
      (s.admissionNo && s.admissionNo.toLowerCase().includes(query)) ||
      (s.rollNo && s.rollNo.toLowerCase().includes(query)) ||
      (s.cardNo && s.cardNo.includes(query)) ||
      (s.parentName && s.parentName.toLowerCase().includes(query)) ||
      (s.contact && s.contact.includes(query)) ||
      (s.address && s.address.toLowerCase().includes(query))
    );
    return matchesGrade && matchesStatus && matchesQuery;
  });

  renderStudentsTable(filtered);
}

// CSV Export
function exportReceiptsCSV() {
  if (allReceipts.length === 0) {
    showToast("No records to export", true);
    return;
  }

  const headers = ["Receipt No", "Date", "Student ID", "Student Name", "Grade", "Amount", "Mode", "Transaction ID", "Term"];
  const rows = allReceipts.map(r => [
    r.receiptNo,
    r.date,
    r.studentId,
    `"${r.studentName}"`,
    r.grade,
    r.amount,
    `"${r.paymentMethod}"`,
    `"${r.transactionId || ''}"`,
    `"${r.term || ''}"`
  ]);

  const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `Senthilvel_Vidyalaya_Fee_Receipts_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast("CSV exported successfully");
}

// Toast helper
function showToast(message, isError = false) {
  const toast = document.getElementById('toastBox');
  const toastMsg = document.getElementById('toastMsg');
  toastMsg.innerText = message;
  toast.style.background = isError ? '#991b1b' : '#0f172a';
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3500);
}

// =========================================================================
// SCHOOL FEES REGISTER — Class-wise academic fee ledger (school fees only)
// =========================================================================

const GRADE_ORDER = ['LKG', 'UKG', '1st Std', '2nd Std', '3rd Std', '4th Std', '5th Std', '6th Std', '7th Std', '8th Std'];

function renderSchoolFeesTab() {
  const container = document.getElementById('sfClassAccordions');
  const summaryBar = document.getElementById('sfSummaryBar');
  if (!container) return;

  const selectedGrade = document.getElementById('sfFilterGrade')?.value || 'All';
  const selectedStatus = document.getElementById('sfFilterStatus')?.value || 'All';
  const searchTerm = (document.getElementById('sfSearchInput')?.value || '').trim().toLowerCase();

  // Filter students
  let students = [...allStudents];
  if (selectedGrade !== 'All') {
    students = students.filter(s => s.grade === selectedGrade);
  }
  if (selectedStatus !== 'All') {
    // Status based on school fees only
    if (selectedStatus === 'Paid') {
      students = students.filter(s => (s.schoolDue || 0) === 0 && (s.netSchoolPayable || 0) > 0);
    } else if (selectedStatus === 'Partial') {
      students = students.filter(s => (s.schoolPaid || 0) > 0 && (s.schoolDue || 0) > 0);
    } else if (selectedStatus === 'Unpaid') {
      students = students.filter(s => (s.schoolPaid || 0) === 0 && (s.netSchoolPayable || 0) > 0);
    }
  }
  if (searchTerm) {
    students = students.filter(s =>
      (s.name || '').toLowerCase().includes(searchTerm) ||
      (s.rollNo || '').toLowerCase().includes(searchTerm) ||
      (s.contact || '').toLowerCase().includes(searchTerm)
    );
  }

  // Group by grade
  const gradeGroups = {};
  GRADE_ORDER.forEach(g => { gradeGroups[g] = []; });
  students.forEach(s => {
    if (!gradeGroups[s.grade]) gradeGroups[s.grade] = [];
    gradeGroups[s.grade].push(s);
  });

  // Overall totals
  let grandTotalFee = 0, grandTotalPaid = 0, grandTotalDue = 0;
  let grandStudentCount = 0, grandPaidCount = 0, grandPartialCount = 0, grandUnpaidCount = 0;

  students.forEach(s => {
    grandTotalFee += Number(s.netSchoolPayable || 0);
    grandTotalPaid += Number(s.schoolPaid || 0);
    grandTotalDue += Number(s.schoolDue || 0);
    grandStudentCount++;
    if ((s.schoolDue || 0) === 0 && (s.netSchoolPayable || 0) > 0) grandPaidCount++;
    else if ((s.schoolPaid || 0) > 0 && (s.schoolDue || 0) > 0) grandPartialCount++;
    else if ((s.schoolPaid || 0) === 0 && (s.netSchoolPayable || 0) > 0) grandUnpaidCount++;
  });

  // Summary bar
  if (summaryBar) {
    summaryBar.innerHTML = `
      <div class="metric-card" style="flex:1; min-width:160px;">
        <div class="metric-value" style="color:#1e3a8a;">${grandStudentCount}</div>
        <div class="metric-label">Total Students</div>
      </div>
      <div class="metric-card" style="flex:1; min-width:160px;">
        <div class="metric-value" style="color:#0f172a;">₹${grandTotalFee.toLocaleString('en-IN')}</div>
        <div class="metric-label">Total School Fees Expected</div>
      </div>
      <div class="metric-card" style="flex:1; min-width:160px;">
        <div class="metric-value" style="color:#059669;">₹${grandTotalPaid.toLocaleString('en-IN')}</div>
        <div class="metric-label">School Fees Collected</div>
      </div>
      <div class="metric-card" style="flex:1; min-width:160px;">
        <div class="metric-value" style="color:#ef4444;">₹${grandTotalDue.toLocaleString('en-IN')}</div>
        <div class="metric-label">School Fees Pending</div>
      </div>
      <div class="metric-card" style="flex:1; min-width:200px;">
        <div class="metric-label" style="margin-bottom:4px;">
          <span style="color:#15803d; font-weight:700;">${grandPaidCount} Paid</span> &nbsp;|&nbsp;
          <span style="color:#b45309; font-weight:700;">${grandPartialCount} Partial</span> &nbsp;|&nbsp;
          <span style="color:#b91c1c; font-weight:700;">${grandUnpaidCount} Unpaid</span>
        </div>
      </div>
    `;
  }

  // Build class-wise accordion cards
  let html = '';
  GRADE_ORDER.forEach(grade => {
    const gradeStudents = gradeGroups[grade] || [];
    if (selectedGrade !== 'All' && grade !== selectedGrade) return;
    if (gradeStudents.length === 0 && selectedGrade === 'All') return;

    let classFee = 0, classPaid = 0, classDue = 0;
    let cPaid = 0, cPartial = 0, cUnpaid = 0;
    gradeStudents.forEach(s => {
      const net = Number(s.netSchoolPayable || 0);
      const paid = Number(s.schoolPaid || 0);
      const due = Number(s.schoolDue || 0);

      classFee += net;
      classPaid += paid;
      classDue += due;
      if (due === 0 && net > 0) cPaid++;
      else if (paid > 0 && due > 0) cPartial++;
      else if (paid === 0 && net > 0) cUnpaid++;
    });

    const collPct = classFee > 0 ? Math.round((classPaid / classFee) * 100) : 0;
    const isOpen = selectedGrade !== 'All' || GRADE_ORDER.indexOf(grade) < 3;

    let rowsHtml = '';
    if (gradeStudents.length === 0) {
      rowsHtml = `<tr><td colspan="10" style="text-align:center; padding:24px; color:#94a3b8;">No students found</td></tr>`;
    } else {
      gradeStudents.forEach((s, idx) => {
        const sFee = Number(s.netSchoolPayable || 0);
        const sPaid = Number(s.schoolPaid || 0);
        const sDue = Number(s.schoolDue || 0);
        let statusBadge = '';
        if (sDue === 0 && sFee > 0) statusBadge = '<span class="badge badge-paid">Paid</span>';
        else if (sPaid > 0 && sDue > 0) statusBadge = '<span class="badge badge-partial">Partial</span>';
        else statusBadge = '<span class="badge badge-unpaid">Unpaid</span>';

        const hasCustom = s.hasCustomFee || (s.customSchoolFee !== undefined && s.customSchoolFee !== null && s.customSchoolFee !== '');
        const classFeeRef = Number(s.classBaseTotal || 0);
        const feeNote = hasCustom
          ? `<span style="font-size:0.68rem;color:#b45309;display:block;">(Custom Override)</span>`
          : '';

        rowsHtml += `
          <!-- Normal View Row -->
          <tr id="sfViewRow-${s.id}">
            <td style="text-align:center; color:#64748b;">${idx + 1}</td>
            <td style="font-weight:700; color:#1e3a8a;">${s.rollNo || '-'}</td>
            <td><strong>${s.name}</strong></td>
            <td style="color:#475569;">${s.parentName || '-'}</td>
            <td style="color:#1e3a8a; font-weight:600; white-space:nowrap;">${s.contact || '-'}</td>
            <td style="text-align:right; font-weight:700;">₹${sFee.toLocaleString('en-IN')}${feeNote}</td>
            <td style="text-align:right; color:#059669; font-weight:600;">₹${sPaid.toLocaleString('en-IN')}</td>
            <td style="text-align:right; color:#ef4444; font-weight:700;">₹${sDue.toLocaleString('en-IN')}</td>
            <td style="text-align:center;">${statusBadge}</td>
            <td style="text-align:center;">
              <div style="display:flex; gap:4px; justify-content:center;">
                <button class="btn btn-sm" onclick="openSchoolFeePayModal('${s.id}')" title="Record Payment for ${s.name}" style="background:#15803d; color:#fff; font-weight:700; padding:3px 8px; font-size:0.75rem;">
                  <i data-lucide="plus-circle" style="width:12px; height:12px; margin-right:3px;"></i>+ Pay
                </button>
                <button class="btn btn-outline btn-sm" onclick="toggleEditStudentRow('${s.id}')" title="Edit All Details & Fee in Table" style="padding:3px 7px; font-size:0.75rem; font-weight:600; color:#2563eb; border-color:#93c5fd;">
                  <i data-lucide="edit-2" style="width:12px; height:12px; margin-right:3px;"></i>Edit
                </button>
                <button class="btn btn-outline btn-sm" onclick="editStudent('${s.id}')" title="Full Profile & Transport Modal" style="padding:3px 6px; font-size:0.75rem;">
                  <i data-lucide="sliders" style="width:12px; height:12px;"></i>
                </button>
              </div>
            </td>
          </tr>

          <!-- Inline Edit Form Row (Hidden until Edit is clicked) -->
          <tr id="sfEditRow-${s.id}" style="display:none; background:#fffbeb; border-left:3px solid #f59e0b;">
            <td style="text-align:center; font-weight:700; color:#b45309;">${idx + 1}</td>
            <td>
              <input type="text" id="sfEditRoll-${s.id}" value="${s.rollNo || ''}" class="form-control" style="padding:3px 6px; font-size:0.8rem; font-weight:700; width:75px;" placeholder="Roll No">
            </td>
            <td>
              <input type="text" id="sfEditName-${s.id}" value="${s.name || ''}" class="form-control" style="padding:3px 6px; font-size:0.8rem; font-weight:700; min-width:130px;" placeholder="Student Name" required>
            </td>
            <td>
              <input type="text" id="sfEditParent-${s.id}" value="${s.parentName || ''}" class="form-control" style="padding:3px 6px; font-size:0.8rem; width:115px;" placeholder="Parent Name">
            </td>
            <td>
              <input type="tel" id="sfEditPhone-${s.id}" value="${s.contact || ''}" class="form-control" style="padding:3px 6px; font-size:0.8rem; width:105px;" placeholder="Phone">
            </td>
            <td>
              <input type="number" id="sfEditFee-${s.id}" value="${hasCustom ? s.customSchoolFee : sFee}" class="form-control" style="padding:3px 6px; font-size:0.8rem; text-align:right; width:95px; border-color:#f59e0b;" placeholder="Fee" title="Leave blank or class fee to reset to standard (₹${classFeeRef})">
              <div style="font-size:0.65rem; color:#78716c; text-align:right;">Std: ₹${classFeeRef.toLocaleString('en-IN')}</div>
            </td>
            <td colspan="3" style="vertical-align:middle; background:#f0fdf4; border:1px dashed #86efac; border-radius:4px; padding:4px 8px;">
              <div style="display:flex; align-items:center; gap:6px;">
                <label style="font-size:0.75rem; font-weight:700; color:#15803d; margin:0; white-space:nowrap;">+ Record Payment (₹):</label>
                <input type="number" id="sfEditAddPayment-${s.id}" min="0" placeholder="Optional amount" class="form-control" style="padding:3px 6px; font-size:0.8rem; width:110px; border-color:#86efac; color:#15803d; font-weight:700;">
              </div>
            </td>
            <td style="text-align:center; white-space:nowrap; vertical-align:middle;">
              <div style="display:flex; gap:4px; justify-content:center;">
                <button class="btn btn-sm" style="background:#16a34a; color:#fff; font-weight:700; padding:4px 8px; font-size:0.75rem;" onclick="saveStudentAllDetails('${s.id}')">
                  <i data-lucide="check" style="width:12px; height:12px; margin-right:2px;"></i>Save
                </button>
                <button class="btn btn-sm" style="background:#64748b; color:#fff; padding:4px 8px; font-size:0.75rem;" onclick="cancelEditStudentRow('${s.id}')">
                  Cancel
                </button>
              </div>
            </td>
          </tr>
        `;
      });
    }

    html += `
      <div class="card" style="margin-bottom:12px;">
        <div class="card-header" style="cursor:pointer; user-select:none;" onclick="this.parentElement.classList.toggle('sf-collapsed')">
          <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
            <span class="grade-pill" style="font-size:0.9rem; padding:4px 12px;">${grade}</span>
            <strong style="font-size:0.9rem;">${gradeStudents.length} Students</strong>
            <span style="font-size:0.78rem; color:#475569;">
              Fee: ₹${classFee.toLocaleString('en-IN')} &nbsp;|&nbsp;
              <span style="color:#059669;">Collected: ₹${classPaid.toLocaleString('en-IN')}</span> &nbsp;|&nbsp;
              <span style="color:#ef4444;">Pending: ₹${classDue.toLocaleString('en-IN')}</span> &nbsp;|&nbsp;
              ${collPct}% collected
            </span>
            <span style="font-size:0.72rem; margin-left:auto;">
              <span style="color:#15803d;">${cPaid} Paid</span> /
              <span style="color:#b45309;">${cPartial} Partial</span> /
              <span style="color:#b91c1c;">${cUnpaid} Unpaid</span>
            </span>
          </div>
        </div>
        <div class="sf-accordion-body" ${!isOpen ? 'style="display:none;"' : ''}>
          <div class="table-responsive">
            <table class="custom-table">
              <thead>
                <tr>
                  <th style="width:30px; text-align:center;">#</th>
                  <th style="width:75px;">Roll No</th>
                  <th style="min-width:130px;">Student Name</th>
                  <th style="min-width:110px;">Parent Name</th>
                  <th style="width:100px;">Phone</th>
                  <th style="width:110px; text-align:right;">School Fee</th>
                  <th style="width:90px; text-align:right;">Paid</th>
                  <th style="width:90px; text-align:right;">Due</th>
                  <th style="width:75px; text-align:center;">Status</th>
                  <th style="width:130px; text-align:center;">Actions</th>
                </tr>
              </thead>
              <tbody>
                ${rowsHtml}
              </tbody>
              <tfoot>
                <tr style="background:#f0fdf4; font-weight:700;">
                  <td colspan="5" style="color:#15803d; padding:6px 10px;">
                    ${grade} — Class Total (${gradeStudents.length} Students)
                  </td>
                  <td style="text-align:right; color:#0f172a;">₹${classFee.toLocaleString('en-IN')}</td>
                  <td style="text-align:right; color:#059669;">₹${classPaid.toLocaleString('en-IN')}</td>
                  <td style="text-align:right; color:#ef4444;">₹${classDue.toLocaleString('en-IN')}</td>
                  <td colspan="2"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    `;
  });

  if (!html) {
    html = '<div class="card" style="padding:40px; text-align:center; color:#94a3b8;">No students found matching the selected filters.</div>';
  }

  container.innerHTML = html;
  initIcons();

  // Toggle accordion on click (only when clicking the header itself, not buttons/inputs inside)
  container.querySelectorAll('.card-header').forEach(header => {
    header.addEventListener('click', (e) => {
      if (e.target.closest('button') || e.target.closest('input')) return;
      const body = header.nextElementSibling;
      if (body && body.classList.contains('sf-accordion-body')) {
        body.style.display = body.style.display === 'none' ? '' : 'none';
      }
    });
  });
}

// Toggle full inline edit row for a student in School Fees Register
function toggleEditStudentRow(studentId) {
  const viewRow = document.getElementById(`sfViewRow-${studentId}`);
  const editRow = document.getElementById(`sfEditRow-${studentId}`);
  if (!viewRow || !editRow) return;

  const isEditing = editRow.style.display !== 'none';
  if (isEditing) {
    cancelEditStudentRow(studentId);
  } else {
    viewRow.style.display = 'none';
    editRow.style.display = '';
    initIcons();
    const nameInput = document.getElementById(`sfEditName-${studentId}`);
    if (nameInput) {
      nameInput.focus();
      nameInput.select();
    }
  }
}

function cancelEditStudentRow(studentId) {
  const viewRow = document.getElementById(`sfViewRow-${studentId}`);
  const editRow = document.getElementById(`sfEditRow-${studentId}`);
  if (viewRow && editRow) {
    viewRow.style.display = '';
    editRow.style.display = 'none';
  }
}

// Save all edited columns for a single student
async function saveStudentAllDetails(studentId) {
  const student = allStudents.find(s => s.id === studentId);
  if (!student) return;

  const rollInput = document.getElementById(`sfEditRoll-${studentId}`);
  const nameInput = document.getElementById(`sfEditName-${studentId}`);
  const parentInput = document.getElementById(`sfEditParent-${studentId}`);
  const phoneInput = document.getElementById(`sfEditPhone-${studentId}`);
  const feeInput = document.getElementById(`sfEditFee-${studentId}`);
  const concInput = document.getElementById(`sfEditConcession-${studentId}`);

  if (!nameInput || !nameInput.value.trim()) {
    showToast("Student Name cannot be empty", true);
    return;
  }

  const name = nameInput.value.trim();
  const rollNo = rollInput ? rollInput.value.trim() : (student.rollNo || '');
  const parentName = parentInput ? parentInput.value.trim() : (student.parentName || '');
  const contact = phoneInput ? phoneInput.value.trim() : (student.contact || '');
  const concession = concInput ? Number(concInput.value || 0) : Number(student.concession || 0);

  const feeValStr = feeInput ? feeInput.value.trim() : '';
  const feeVal = Number(feeValStr);
  const classFee = Number(student.classBaseTotal || student.feeStructure?.totalFee || 0);

  let customSchoolFee = null;
  if (feeValStr !== '' && feeVal > 0 && feeVal !== classFee) {
    customSchoolFee = feeVal;
  }

  const payload = {
    name: name,
    rollNo: rollNo,
    parentName: parentName,
    contact: contact,
    concession: concession,
    customSchoolFee: customSchoolFee
  };

  const addPayInput = document.getElementById(`sfEditAddPayment-${studentId}`);
  const addPayAmount = addPayInput ? Number(addPayInput.value || 0) : 0;

  try {
    const res = await fetch(`/api/students/${studentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      // If user also entered an inline payment amount, record it now!
      if (addPayAmount > 0) {
        const today = new Date().toISOString().split('T')[0];
        const payPayload = {
          studentId: student.id,
          amount: addPayAmount,
          date: today,
          term: 'Term 1',
          paymentMethod: 'Cash',
          transactionId: '',
          remarks: 'Inline Payment Entry via School Fees Register',
          feeCategories: ['School Academic Fees'],
          receivedBy: 'School Accounts Office',
          boardingArea: 'None (Self Commute)',
          transportPaymentMode: 'None',
          transportFee: 0,
          transportAmount: 0
        };

        const payRes = await fetch('/api/payments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payPayload)
        });

        if (payRes.ok) {
          showToast(`Saved details and recorded payment of ₹${addPayAmount.toLocaleString('en-IN')} for ${name}!`);
        } else {
          showToast(`Student updated, but payment entry failed`, true);
        }
      } else {
        showToast(`Student details for ${name} updated successfully!`);
      }

      await loadAllData();
      renderSchoolFeesTab();
    } else {
      const err = await res.json();
      showToast(err.error || "Failed to update student details", true);
    }
  } catch (err) {
    showToast("Network error updating student details", true);
  }
}

// -------------------------------------------------------------
// School Fee Payment Entry Modal (For Individual Students in School Fees Register)
// -------------------------------------------------------------
function openSchoolFeePayModal(studentId) {
  const student = allStudents.find(s => s.id === studentId);
  if (!student) return;

  document.getElementById('sfPayStudentId').value = student.id;
  document.getElementById('sfPayStudentName').innerText = student.name;
  document.getElementById('sfPayStudentGrade').innerText = `${student.grade} - ${student.section || 'A'}`;
  document.getElementById('sfPayStudentRoll').innerText = `Roll: ${student.rollNo || '-'}`;

  const netSchool = Number(student.netSchoolPayable || 0);
  const paidSchool = Number(student.schoolPaid || 0);
  const dueSchool = Number(student.schoolDue || 0);

  document.getElementById('sfPayTotalFee').innerText = `₹${netSchool.toLocaleString('en-IN')}`;
  document.getElementById('sfPayAlreadyPaid').innerText = `₹${paidSchool.toLocaleString('en-IN')}`;
  document.getElementById('sfPayPendingDue').innerText = `₹${dueSchool.toLocaleString('en-IN')}`;

  // Default amount to pending school due if > 0, otherwise empty
  document.getElementById('sfPayAmount').value = dueSchool > 0 ? dueSchool : '';

  // Default date to today (YYYY-MM-DD)
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('sfPayDate').value = today;

  document.getElementById('sfPayMode').value = 'Cash';
  document.getElementById('sfPayTerm').value = 'Term 1';
  document.getElementById('sfPayRef').value = '';
  document.getElementById('sfPayRemarks').value = 'School Fee Payment';

  document.getElementById('schoolFeePayModal').classList.add('open');
  initIcons();

  setTimeout(() => {
    const amtInput = document.getElementById('sfPayAmount');
    if (amtInput) {
      amtInput.focus();
      amtInput.select();
    }
  }, 100);
}

function closeSchoolFeePayModal() {
  document.getElementById('schoolFeePayModal').classList.remove('open');
}

async function handleSchoolFeePaySubmit(event) {
  event.preventDefault();
  const studentId = document.getElementById('sfPayStudentId').value;
  const student = allStudents.find(s => s.id === studentId);
  if (!student) return;

  const amount = Number(document.getElementById('sfPayAmount').value);
  const date = document.getElementById('sfPayDate').value;
  const paymentMethod = document.getElementById('sfPayMode').value;
  const term = document.getElementById('sfPayTerm').value;
  const transactionId = document.getElementById('sfPayRef').value.trim();
  const remarks = document.getElementById('sfPayRemarks').value.trim() || 'School Fee Payment';
  const openReceipt = document.getElementById('sfPayOpenReceipt')?.checked;

  if (!amount || amount <= 0) {
    showToast("Please enter a valid payment amount", true);
    return;
  }

  const payload = {
    studentId: student.id,
    amount: amount,
    date: date,
    term: term,
    paymentMethod: paymentMethod,
    transactionId: transactionId,
    remarks: remarks,
    feeCategories: ['School Academic Fees'],
    receivedBy: 'School Accounts Office',
    boardingArea: 'None (Self Commute)',
    transportPaymentMode: 'None',
    transportFee: 0,
    transportAmount: 0
  };

  try {
    const res = await fetch('/api/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      const data = await res.json();
      showToast(`Payment of ₹${amount.toLocaleString('en-IN')} recorded for ${student.name}!`);
      closeSchoolFeePayModal();
      await loadAllData();
      renderSchoolFeesTab();

      if (openReceipt && data.payment && data.payment.receiptNo) {
        viewReceipt(data.payment.receiptNo);
      }
    } else {
      const err = await res.json();
      showToast(err.error || "Failed to record payment", true);
    }
  } catch (err) {
    showToast("Network error submitting payment", true);
  }
}

// Backward compatibility alias
function toggleEditSchoolFee(studentId) {
  toggleEditStudentRow(studentId);
}

function cancelEditSchoolFee(studentId) {
  cancelEditStudentRow(studentId);
}

async function saveStudentSchoolFee(studentId) {
  await saveStudentAllDetails(studentId);
}

// 7. Automated WhatsApp Due Reminders System
const VAN_MONTHS_LIST = [
  'June', 'July', 'August', 'September', 'October', 'November', 
  'December', 'January', 'February', 'March', 'April'
];

const TAMIL_MONTHS_MAP = {
  'June': 'ஜூன்', 'July': 'ஜூலை', 'August': 'ஆகஸ்ட்', 'September': 'செப்டம்பர்',
  'October': 'அக்டோபர்', 'November': 'நவம்பர்', 'December': 'டிசம்பர்',
  'January': 'ஜனவரி', 'February': 'பிப்ரவரி', 'March': 'மார்ச்', 'April': 'ஏப்ரல்'
};

function getStudentVanMonthDetails(student) {
  const s = student;
  const vanPmts = (s.payments || []).filter(p => 
    p.feeCategories && p.feeCategories.includes('Transport / Van Fees')
  );

  const paidMonths = [];
  const monthPaymentMap = {};

  VAN_MONTHS_LIST.forEach(m => {
    const pmt = vanPmts.find(p => 
      (p.transportMonth && p.transportMonth.toLowerCase().includes(m.toLowerCase())) ||
      (p.term && p.term.toLowerCase().includes(m.toLowerCase()))
    );
    if (pmt) {
      paidMonths.push(m);
      monthPaymentMap[m] = pmt;
    }
  });

  const remainingMonths = s.transportOpted 
    ? VAN_MONTHS_LIST.filter(m => !paidMonths.includes(m))
    : [];

  const monthlyRate = Number(s.transportMonthlyFee || 0);
  const annualVanFee = Number(s.transportFee || (monthlyRate * 11));
  const vanPaid = Number(s.vanPaid !== undefined ? s.vanPaid : vanPmts.reduce((sum, p) => sum + Number(p.amount || 0), 0));
  const vanDue = Math.max(0, annualVanFee - vanPaid);

  return {
    monthlyRate,
    annualVanFee,
    vanPaid,
    vanDue,
    paidMonths,
    remainingMonths,
    paidCount: paidMonths.length,
    remainingCount: remainingMonths.length,
    monthPaymentMap
  };
}

function formatStudentWhatsAppMessages(student) {
  const s = student;
  const schoolName = schoolInfo.name || "Senthilvel Vidyalaya School";
  const schoolAddr = schoolInfo.address || "Pakkudi, Pudukottai";
  const schoolPhone = schoolInfo.phone || "9789277169, 9445987169";

  const van = getStudentVanMonthDetails(s);
  const engPaidMonthsStr = van.paidMonths.length > 0 ? van.paidMonths.join(', ') : 'None yet';
  const engRemMonthsStr = van.remainingMonths.length > 0 ? van.remainingMonths.join(', ') : (s.transportOpted ? 'Nil (Fully Paid)' : 'Not Opted');
  const tamilPaidMonthsStr = van.paidMonths.length > 0 ? van.paidMonths.map(m => TAMIL_MONTHS_MAP[m] || m).join(', ') : 'இதுவரை செலுத்தப்படவில்லை';
  const tamilRemMonthsStr = van.remainingMonths.length > 0 ? van.remainingMonths.map(m => TAMIL_MONTHS_MAP[m] || m).join(', ') : (s.transportOpted ? 'முழுவதும் செலுத்தப்பட்டது' : 'தேர்வு செய்யப்படவில்லை');

  let vanEngSection = '';
  let vanTamSection = '';

  if (s.transportOpted) {
    vanEngSection = 
`*VAN / TRANSPORTATION FEES (11-MONTH ACADEMIC YEAR):*
* Monthly Rate: ₹${van.monthlyRate}/month
* Total Annual Van Fee: ₹${van.annualVanFee.toLocaleString('en-IN')} (11 Months)
* Months Paid (${van.paidCount}/11): ${engPaidMonthsStr}
* Van Paid Amount: ₹${van.vanPaid.toLocaleString('en-IN')}
* Remaining Due Months (${van.remainingCount}/11): ${engRemMonthsStr}
* Pending Van Due: ₹${van.vanDue.toLocaleString('en-IN')}*`;

    vanTamSection = 
`*பள்ளி வேன் கட்டணம் (11 மாதங்கள்):*
* மாத கட்டணம்: ₹${van.monthlyRate}/மாதம்
* மொத்த ஆண்டு வேன் கட்டணம்: ₹${van.annualVanFee.toLocaleString('en-IN')} (11 மாதங்கள்)
* செலுத்தப்பட்ட மாதங்கள் (${van.paidCount}/11): ${tamilPaidMonthsStr}
* செலுத்திய வேன் தொகை: ₹${van.vanPaid.toLocaleString('en-IN')}
* செலுத்த வேண்டிய மீதமுள்ள மாதங்கள் (${van.remainingCount}/11): ${tamilRemMonthsStr}
* செலுத்த வேண்டிய வேன் நிலுவை: ₹${van.vanDue.toLocaleString('en-IN')}*`;
  } else {
    vanEngSection = `*VAN / TRANSPORTATION FEES:* Self Commute (Not Opted)`;
    vanTamSection = `*பள்ளி வேன் கட்டணம்:* சொந்தப் பயணம் (தேர்வு செய்யப்படவில்லை)`;
  }

  // Message 1: Clean English Format (No emojis causing question marks)
  const engMsg = 
`*SENTHILVEL VIDYALAYA SCHOOL*
${schoolAddr} | Contact: ${schoolPhone}
----------------------------------------
Dear Parent of *${s.name}* (Class: *${s.grade} - Sec ${s.section || 'A'}*, Roll No: *${s.rollNo || s.id}*),

Official Fee Status Update for Academic Year 2026-2027:

*SCHOOL ACADEMIC FEES:*
* Total School Fee: ₹${(s.netSchoolPayable || 0).toLocaleString('en-IN')}
* Paid Amount: ₹${(s.schoolPaid || 0).toLocaleString('en-IN')}
* Pending School Due: ₹${(s.schoolDue || 0).toLocaleString('en-IN')}*

${vanEngSection}

----------------------------------------
*TOTAL CONSOLIDATED SUMMARY:*
* Net Annual Payable: ₹${s.netPayable.toLocaleString('en-IN')}
* Total Paid to Date: ₹${s.totalPaid.toLocaleString('en-IN')}
*TOTAL BALANCE DUE: ₹${s.balanceDue.toLocaleString('en-IN')}*
----------------------------------------
Please settle the pending fee dues at the school office by Cash or UPI (GPay/PhonePe) at the earliest.
Contact: 9789277169 / 9445987169.
Thank you!
- Accounts Office, Senthilvel Vidyalaya School`;

  // Message 2: Clean Tamil Format (தமிழ் வடிவம்)
  const tamMsg = 
`*செந்தில்வேல் வித்யாலயா பள்ளி (SENTHILVEL VIDYALAYA SCHOOL)*
பக்குடி, புதுக்கோட்டை | தொடர்பு: 9789277169, 9445987169
----------------------------------------
அன்புள்ள பெற்றோருக்கு வணக்கம்! மாணவர்/மாணவி: *${s.name}* (வகுப்பு: *${s.grade} - பிரிவு ${s.section || 'A'}*, எண்: *${s.rollNo || s.id}*),

2026-2027 கல்வியாண்டிற்கான கட்டண விபரம்:

*பள்ளி கல்விக் கட்டணம்:*
* மொத்த பள்ளி கட்டணம்: ₹${(s.netSchoolPayable || 0).toLocaleString('en-IN')}
* செலுத்திய தொகை: ₹${(s.schoolPaid || 0).toLocaleString('en-IN')}
* செலுத்த வேண்டிய பள்ளி நிலுவை: ₹${(s.schoolDue || 0).toLocaleString('en-IN')}*

${vanTamSection}

----------------------------------------
*ஒட்டுமொத்த கட்டண விபரம்:*
* ஆண்டு மொத்த கட்டணம்: ₹${s.netPayable.toLocaleString('en-IN')}
* இதுவரை செலுத்திய மொத்த தொகை: ₹${s.totalPaid.toLocaleString('en-IN')}
*மொத்த நிலுவைத் தொகை: ₹${s.balanceDue.toLocaleString('en-IN')}*
----------------------------------------
நிலுவையில் உள்ள கட்டணத்தை பள்ளி அலுவலகத்தில் ரொக்கமாகவோ அல்லது UPI (GPay/PhonePe) மூலமாகவோ செலுத்துமாறு கேட்டுக்கொள்கிறோம்.
தொடர்புக்கு: 9789277169 / 9445987169.
நன்றி!
- கணக்கு அலுவலகம், செந்தில்வேல் வித்யாலயா பள்ளி`;

  return { engMsg, tamMsg };
}

function formatStudentWhatsAppMessage(student) {
  const { engMsg } = formatStudentWhatsAppMessages(student);
  return engMsg;
}

let activeDualWaSession = null;
let activeWaPreviewTab = 'eng';
let samplePreviewMessages = null;

function openDualWaModal(student, phone, engMsg, tamMsg) {
  activeDualWaSession = {
    student,
    phone,
    engMsg,
    tamMsg,
    urlEng: `https://wa.me/${phone}?text=${encodeURIComponent(engMsg)}`,
    urlTam: `https://wa.me/${phone}?text=${encodeURIComponent(tamMsg)}`
  };

  const nameEl = document.getElementById('dualWaStudentName');
  if (nameEl) nameEl.innerText = student.name;
  const metaEl = document.getElementById('dualWaStudentMeta');
  if (metaEl) metaEl.innerText = `Class: ${student.grade} (Sec ${student.section || 'A'}) | Roll No: ${student.rollNo || student.id}`;
  const contactEl = document.getElementById('dualWaContact');
  if (contactEl) contactEl.innerText = phone;
  const badgeEl = document.getElementById('dualWaStatusBadge');
  if (badgeEl) {
    badgeEl.innerText = (student.balanceDue || 0) > 0 ? `Due: ₹${Number(student.balanceDue || 0).toLocaleString('en-IN')}` : 'Paid';
    badgeEl.className = (student.balanceDue || 0) > 0 ? 'badge badge-unpaid' : 'badge badge-paid';
  }
  const engTextEl = document.getElementById('dualWaEngText');
  if (engTextEl) engTextEl.innerText = engMsg;
  const tamTextEl = document.getElementById('dualWaTamText');
  if (tamTextEl) tamTextEl.innerText = tamMsg;

  const modal = document.getElementById('waDualSendModal');
  if (modal) {
    modal.classList.add('open');
    initIcons();
  }
}

function closeDualWaModal() {
  const modal = document.getElementById('waDualSendModal');
  if (modal) modal.classList.remove('open');
}

function openDualWaWindow(lang) {
  if (!activeDualWaSession) return;
  const url = lang === 'eng' ? activeDualWaSession.urlEng : activeDualWaSession.urlTam;
  window.open(url, '_blank');
  showToast(`WhatsApp ${lang === 'eng' ? 'English' : 'Tamil'} message opened`);
}

function copyDualWaMsg(lang) {
  if (!activeDualWaSession) return;
  const text = lang === 'eng' ? activeDualWaSession.engMsg : activeDualWaSession.tamMsg;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      showToast(`${lang === 'eng' ? 'English' : 'Tamil'} message copied!`);
    }).catch(() => {
      showToast("Could not copy text", true);
    });
  }
}

function triggerSendBothAtOnce() {
  if (!activeDualWaSession) return;
  window.open(activeDualWaSession.urlEng, '_blank');
  window.open(activeDualWaSession.urlTam, '_blank');
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(activeDualWaSession.tamMsg).catch(() => {});
  }
  showToast("Both English and Tamil messages opened in WhatsApp!");
}

function sendSingleWhatsAppReminder(studentId) {
  const student = allStudents.find(s => s.id === studentId);
  if (!student) {
    showToast("Student not found", true);
    return;
  }

  const rawPhone = String(student.contact || '').replace(/[^0-9]/g, '');
  if (!rawPhone || rawPhone.length < 10) {
    showToast(`Invalid contact number for ${student.name}`, true);
    return;
  }
  const phone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;

  const { engMsg, tamMsg } = formatStudentWhatsAppMessages(student);
  const urlEng = `https://wa.me/${phone}?text=${encodeURIComponent(engMsg)}`;
  const urlTam = `https://wa.me/${phone}?text=${encodeURIComponent(tamMsg)}`;

  // Log in backend
  fetch('/api/whatsapp/log', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      studentId: student.id,
      studentName: student.name,
      parentName: student.parentName,
      contact: student.contact,
      amountDue: student.balanceDue,
      mode: "Bilingual (Eng + Tamil Separately)"
    })
  }).catch(() => {});

  // 1. Open English Message in WhatsApp
  window.open(urlEng, '_blank');

  // 2. Open Tamil Message in second tab
  window.open(urlTam, '_blank');

  // 3. Auto-copy Tamil message so user can instantly paste (Ctrl+V) in WhatsApp
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(tamMsg).catch(() => {});
  }

  // 4. Open Dual Sender Modal on screen
  openDualWaModal(student, phone, engMsg, tamMsg);
  showToast(`WhatsApp reminder opened for ${student.parentName || student.name}`);
}

function sendCurrentReceiptWhatsApp() {
  if (!currentReceiptData || !currentReceiptData.payment) {
    showToast("No active receipt to send", true);
    return;
  }

  const p = currentReceiptData.payment;
  const s = currentReceiptData.student;
  const schoolName = schoolInfo.name || "Senthilvel Vidyalaya School";
  const schoolAddr = schoolInfo.address || "Pakkudi, Pudukottai";
  const schoolPhone = schoolInfo.phone || "9789277169, 9445987169";

  const rawPhone = String(s?.contact || '').replace(/[^0-9]/g, '');
  if (!rawPhone || rawPhone.length < 10) {
    showToast("Parent contact number missing or invalid", true);
    return;
  }
  const phone = rawPhone.length === 10 ? `91${rawPhone}` : rawPhone;

  const monthLine = p.transportMonth ? `\nFee Month: *${p.transportMonth}*` : '';

  const msg = `*OFFICIAL FEE PAYMENT RECEIPT*
*${schoolName.toUpperCase()}*
${schoolAddr} | Contact: ${schoolPhone}
----------------------------------------
Receipt No: *${p.receiptNo}*
Date: *${p.date}*
Student Name: *${p.studentName}* (${p.grade} - ${s?.section || 'A'})
Parent/Guardian: ${s?.parentName || 'Parent'}

*AMOUNT RECEIVED NOW: ₹${Number(p.amount).toLocaleString('en-IN')}*
Payment Mode: ${p.paymentMethod} (Txn: ${p.transactionId || 'N/A'})
Term / Component: ${p.term || 'Fee Payment'}${monthLine}

----------------------------------------
*UPDATED FEE STATUS & DUES:*

*School Academic Fee:*
* Paid to Date: ₹${(s?.schoolPaid || 0).toLocaleString('en-IN')}
* Pending School Due: ₹${(s?.schoolDue || 0).toLocaleString('en-IN')}*

*Van / Transportation Fee:*
* Route / Stop: ${p.boardingArea || s?.boardingArea || 'Campus / Local'}
* Paid to Date: ₹${(s?.vanPaid || 0).toLocaleString('en-IN')}
* Pending Van Due: ₹${(s?.vanDue || 0).toLocaleString('en-IN')}*

*TOTAL REMAINING BALANCE DUE: ₹${(s?.balanceDue || 0).toLocaleString('en-IN')}*
----------------------------------------
Thank you for your payment!
- Accounts Office, Senthilvel Vidyalaya School`;

  const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;

  // Log in backend
  fetch('/api/whatsapp/log', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      studentId: p.studentId,
      studentName: p.studentName,
      parentName: s?.parentName,
      contact: s?.contact,
      amountDue: s?.balanceDue,
      mode: "Receipt & Due Notice"
    })
  }).catch(() => {});

  window.open(url, '_blank');
  showToast("WhatsApp receipt opened for parent");
}

async function openBulkWhatsAppModal() {
  try {
    const res = await fetch('/api/whatsapp/due-reminders');
    const data = await res.json();
    waRemindersQueue = data.reminders || [];
    waCurrentQueueIndex = 0;

    document.getElementById('waModalDueCount').innerText = waRemindersQueue.length;
    renderBulkWhatsAppTable();
    document.getElementById('whatsappModal').classList.add('open');
  } catch (err) {
    showToast("Error loading due reminders", true);
  }
}

function renderBulkWhatsAppTable() {
  const tbody = document.getElementById('waRemindersTableBody');
  tbody.innerHTML = '';

  if (waRemindersQueue.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:32px; color:#10b981; font-weight:600;">No students with pending dues! All fees cleared.</td></tr>`;
    return;
  }

  waRemindersQueue.forEach((item, idx) => {
    const tr = document.createElement('tr');
    tr.id = `waRow_${idx}`;
    tr.innerHTML = `
      <td>
        <strong>${item.studentName}</strong>
        <div style="font-size:0.75rem; color:#64748b;">${item.grade} (Sec ${item.section || 'A'})</div>
      </td>
      <td>
        <div>${item.parentName || 'Parent'}</div>
        <div style="font-size:0.78rem; color:#1e3a8a; font-weight:600;">${item.contact || '-'}</div>
      </td>
      <td style="color:#b91c1c; font-weight:700;">₹${Number(item.schoolDue).toLocaleString('en-IN')}</td>
      <td style="color:#d97706; font-weight:700;">₹${Number(item.vanDue).toLocaleString('en-IN')}</td>
      <td style="color:#ef4444; font-weight:800; font-size:1rem;">₹${Number(item.balanceDue).toLocaleString('en-IN')}</td>
      <td>
        <span class="badge ${item.sent ? 'badge-paid' : 'badge-unpaid'}" id="waBadge_${idx}">
          ${item.sent ? 'Sent' : 'Pending'}
        </span>
      </td>
      <td>
        <button class="btn btn-sm" style="background:#25D366; color:#fff; font-weight:700; padding:6px 12px; font-size:0.8rem;" onclick="openIndividualWaFromModal(${idx})">
          <i data-lucide="message-circle" style="width:14px; height:14px; display:inline; margin-right:4px;"></i> Send Both (Eng + தமிழ்)
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  initIcons();
}

function openIndividualWaFromModal(idx) {
  const item = waRemindersQueue[idx];
  if (!item || !item.phone) {
    showToast("Invalid contact details", true);
    return;
  }

  item.sent = true;
  const badge = document.getElementById(`waBadge_${idx}`);
  if (badge) {
    badge.innerText = 'Sent';
    badge.className = 'badge badge-paid';
  }

  const student = allStudents.find(s => s.id === item.studentId) || {
    id: item.studentId,
    name: item.studentName,
    grade: item.grade,
    section: item.section,
    rollNo: item.studentId,
    parentName: item.parentName,
    contact: item.contact,
    netSchoolPayable: Number(item.schoolPaid || 0) + Number(item.schoolDue || 0),
    schoolPaid: item.schoolPaid,
    schoolDue: item.schoolDue,
    transportOpted: Number(item.vanDue || 0) > 0 || Number(item.vanPaid || 0) > 0,
    transportFee: Number(item.vanPaid || 0) + Number(item.vanDue || 0),
    vanPaid: item.vanPaid,
    vanDue: item.vanDue,
    netPayable: Number(item.totalPaid || 0) + Number(item.balanceDue || 0),
    totalPaid: item.totalPaid,
    balanceDue: item.balanceDue
  };

  const msgs = formatStudentWhatsAppMessages(student);
  const engMsg = item.englishMessage || msgs.engMsg;
  const tamMsg = item.tamilMessage || msgs.tamMsg;
  const phone = item.phone;

  const urlEng = item.whatsappUrlEnglish || `https://wa.me/${phone}?text=${encodeURIComponent(engMsg)}`;
  const urlTam = item.whatsappUrlTamil || `https://wa.me/${phone}?text=${encodeURIComponent(tamMsg)}`;

  // Log in backend
  fetch('/api/whatsapp/log', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      studentId: item.studentId,
      studentName: item.studentName,
      parentName: item.parentName,
      contact: item.contact,
      amountDue: item.balanceDue,
      mode: "Bulk Queue (Eng + Tamil Separately)"
    })
  }).catch(() => {});

  // Open both messages
  window.open(urlEng, '_blank');
  window.open(urlTam, '_blank');

  // Auto-copy Tamil message
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(tamMsg).catch(() => {});
  }

  // Open Dual Sender Modal
  openDualWaModal(student, phone, engMsg, tamMsg);
}

function sendNextWhatsAppInQueue() {
  const nextIdx = waRemindersQueue.findIndex(item => !item.sent);
  if (nextIdx === -1) {
    showToast("All parent WhatsApp chats in queue have been opened!");
    return;
  }
  openIndividualWaFromModal(nextIdx);
}

function closeWhatsAppModal() {
  document.getElementById('whatsappModal').classList.remove('open');
}

function previewWhatsAppMessageTemplate() {
  const sample = allStudents.find(s => s.balanceDue > 0) || allStudents[0] || {
    name: "Karthiga",
    grade: "LKG",
    section: "A",
    rollNo: "LKG-235",
    netSchoolPayable: 19000,
    schoolPaid: 0,
    schoolDue: 19000,
    transportOpted: false,
    boardingArea: "Campus",
    transportType: "Self Commute",
    transportFee: 0,
    vanPaid: 0,
    vanDue: 0,
    netPayable: 19000,
    totalPaid: 0,
    balanceDue: 19000
  };

  samplePreviewMessages = formatStudentWhatsAppMessages(sample);
  activeWaPreviewTab = 'eng';
  renderWaPreviewContent();
  document.getElementById('waTemplateModal').classList.add('open');
}

function switchWaPreviewTab(tab) {
  activeWaPreviewTab = tab;
  renderWaPreviewContent();
}

function renderWaPreviewContent() {
  if (!samplePreviewMessages) return;
  const btnEng = document.getElementById('waTabBtnEng');
  const btnTam = document.getElementById('waTabBtnTam');
  const previewEl = document.getElementById('waTemplatePreviewText');

  if (activeWaPreviewTab === 'eng') {
    if (btnEng) {
      btnEng.className = 'btn btn-sm btn-primary';
    }
    if (btnTam) {
      btnTam.className = 'btn btn-sm btn-secondary';
    }
    if (previewEl) previewEl.innerText = samplePreviewMessages.engMsg;
  } else {
    if (btnEng) {
      btnEng.className = 'btn btn-sm btn-secondary';
    }
    if (btnTam) {
      btnTam.className = 'btn btn-sm btn-primary';
    }
    if (previewEl) previewEl.innerText = samplePreviewMessages.tamMsg;
  }
}

function closeWaTemplateModal() {
  document.getElementById('waTemplateModal').classList.remove('open');
}

function copyWaTemplateText() {
  if (!samplePreviewMessages) return;
  const text = activeWaPreviewTab === 'eng' ? samplePreviewMessages.engMsg : samplePreviewMessages.tamMsg;
  navigator.clipboard.writeText(text).then(() => {
    showToast(`Template (${activeWaPreviewTab === 'eng' ? 'English' : 'Tamil'}) copied!`);
  }).catch(() => {
    showToast("Could not copy text", true);
  });
}

// ==========================================
// 8. DEDICATED VAN / TRANSPORTATION FEES PAGE
// ==========================================

function formatShortDate(dateStr) {
  if (!dateStr) return '';
  const parts = String(dateStr).split('-');
  if (parts.length === 3) {
    const day = parseInt(parts[2], 10);
    const month = parseInt(parts[1], 10);
    return `${day}/${month}`;
  }
  return dateStr;
}

function isStudentTravellingInVan(s) {
  return !!(s.transportOpted || Number(s.transportFee) > 0 || Number(s.transportMonthlyFee) > 0 || Number(s.vanPaid) > 0);
}

function updateDashboardVanStats() {
  const vanStudents = allStudents.filter(isStudentTravellingInVan);
  const totalVanStudents = vanStudents.length;
  const totalVanExpected = vanStudents.reduce((sum, s) => {
    const rate = Number(s.transportMonthlyFee || 0);
    return sum + (s.transportFee || (rate * 11));
  }, 0);
  const totalVanCollected = vanStudents.reduce((sum, s) => sum + Number(s.vanPaid || 0), 0);
  const totalVanDue = Math.max(0, totalVanExpected - totalVanCollected);
  const pct = totalVanExpected > 0 ? ((totalVanCollected / totalVanExpected) * 100).toFixed(1) : 0;

  const elStudents = document.getElementById('dashVanStudents');
  if (elStudents) elStudents.innerText = totalVanStudents;
  const elExpected = document.getElementById('dashVanExpected');
  if (elExpected) elExpected.innerText = `₹${totalVanExpected.toLocaleString('en-IN')}`;
  const elCollected = document.getElementById('dashVanCollected');
  if (elCollected) elCollected.innerText = `₹${totalVanCollected.toLocaleString('en-IN')}`;
  const elDue = document.getElementById('dashVanDue');
  if (elDue) elDue.innerText = `₹${totalVanDue.toLocaleString('en-IN')}`;
  const elPct = document.getElementById('dashVanPercent');
  if (elPct) elPct.innerText = `${pct}% collected (${allReceipts.filter(r => r.feeCategories && r.feeCategories.includes('Transport / Van Fees')).length} receipts)`;
}

function populateVanFilterGradeDropdown() {
  const sel = document.getElementById('vanFilterGrade');
  if (!sel) return;
  const currentVal = sel.value || 'All';

  const grades = ['LKG', 'UKG', '1st Std', '2nd Std', '3rd Std', '4th Std', '5th Std', '6th Std', '7th Std', '8th Std'];
  const vanStudents = allStudents.filter(isStudentTravellingInVan);

  let html = `<option value="All">All Classes (${vanStudents.length} Students)</option>`;
  grades.forEach(g => {
    const count = vanStudents.filter(s => s.grade === g).length;
    html += `<option value="${g}">${g} (${count} Van Students)</option>`;
  });

  sel.innerHTML = html;
  sel.value = currentVal;
}

function renderVanFeesTab() {
  populateVanFilterGradeDropdown();
  const vanStudents = allStudents.filter(isStudentTravellingInVan);
  const totalVanStudents = vanStudents.length;
  const totalVanExpected = vanStudents.reduce((sum, s) => {
    const rate = Number(s.transportMonthlyFee || 0);
    return sum + (s.transportFee || (rate * 11));
  }, 0);
  const totalVanCollected = vanStudents.reduce((sum, s) => sum + Number(s.vanPaid || 0), 0);
  const totalVanDue = Math.max(0, totalVanExpected - totalVanCollected);

  // 1. Update KPI Cards
  const elTotalStudents = document.getElementById('vanTotalStudents');
  if (elTotalStudents) elTotalStudents.innerText = totalVanStudents;
  const elTotalExpected = document.getElementById('vanTotalExpected');
  if (elTotalExpected) elTotalExpected.innerText = `₹${totalVanExpected.toLocaleString('en-IN')}`;
  const elTotalCollected = document.getElementById('vanTotalCollected');
  if (elTotalCollected) elTotalCollected.innerText = `₹${totalVanCollected.toLocaleString('en-IN')}`;
  const elTotalDue = document.getElementById('vanTotalDue');
  if (elTotalDue) elTotalDue.innerText = `₹${totalVanDue.toLocaleString('en-IN')}`;

  const vanReceipts = allReceipts.filter(r => r.feeCategories && r.feeCategories.includes('Transport / Van Fees'));
  const elPaidSub = document.getElementById('vanPaidSubText');
  if (elPaidSub) elPaidSub.innerText = `${vanReceipts.length} receipts recorded`;

  // 2. Render Month-by-Month Register
  renderVanRegisterTable(vanStudents);

  // 3. Render Grade Breakdown
  renderVanGradeStats(vanStudents);

  // 4. Render Recent Van Receipts
  renderVanRecentReceipts(vanReceipts);

  initIcons();
}

function renderVanRegisterTable(students) {
  const tbody = document.getElementById('vanRegisterBody');
  if (!tbody) return;
  tbody.innerHTML = '';

  const elCount = document.getElementById('vanRegisterCount');
  if (elCount) elCount.innerText = students.length;

  if (students.length === 0) {
    tbody.innerHTML = `<tr><td colspan="20" style="text-align:center; padding:32px; color:#64748b;">No van student records found matching the criteria.</td></tr>`;
    return;
  }

  students.forEach(s => {
    const van = getStudentVanMonthDetails(s);
    const tr = document.createElement('tr');

    let monthCellsHtml = '';
    VAN_MONTHS_LIST.forEach(month => {
      const pmt = van.monthPaymentMap[month];
      if (pmt) {
        monthCellsHtml += `
          <td style="text-align:center; padding:6px 4px;">
            <span class="van-paid-pill" title="${month} Paid ₹${pmt.amount} on ${pmt.date} (${pmt.receiptNo})">
              ₹${pmt.amount}
              <span class="van-date-sub">${formatShortDate(pmt.date)}</span>
            </span>
          </td>
        `;
      } else {
        monthCellsHtml += `
          <td style="text-align:center; padding:6px 4px;">
            <span class="van-due-pill" title="${month} Van Fee Pending">-</span>
          </td>
        `;
      }
    });

    tr.innerHTML = `
      <td>
        <strong style="color:#1e3a8a;">${s.rollNo}</strong>
      </td>
      <td>
        <div style="font-weight:700; color:#0f172a;">${s.name}</div>
        <div style="font-size:0.72rem; color:#64748b;">${s.boardingArea || 'School Van Route'}</div>
      </td>
      <td>
        <span class="grade-pill">${s.grade}</span> Sec ${s.section || 'A'}
      </td>
      <td style="font-weight:700; color:#0f172a;">
        ₹${van.monthlyRate}
      </td>
      <td style="font-weight:600; color:#475569;">
        ₹${van.annualVanFee.toLocaleString('en-IN')}
      </td>
      ${monthCellsHtml}
      <td style="text-align:center;">
        <div class="van-status-pill">
          <span class="paid-badge">${van.paidCount} / 11 Paid</span>
          ${van.remainingCount > 0 ? `<span class="due-badge">${van.remainingCount} Due</span>` : `<span style="font-size:0.7rem; color:#16a34a; font-weight:700;">Completed</span>`}
        </div>
      </td>
      <td style="color:#059669; font-weight:700;">
        ₹${van.vanPaid.toLocaleString('en-IN')}
      </td>
      <td style="color:#ef4444; font-weight:800;">
        ₹${van.vanDue.toLocaleString('en-IN')}
      </td>
      <td style="text-align:center;">
        <div style="display:flex; gap:4px; justify-content:center;">
          <button class="btn btn-outline btn-sm" onclick="openVanFeeCollectModal('${s.id}')" title="Collect Next Van Month" style="padding:4px 8px; font-size:0.78rem;">
            <i data-lucide="credit-card" style="width:13px; height:13px; display:inline;"></i> Collect
          </button>
          <button class="btn btn-outline btn-sm" style="color:#22c55e; border-color:#86efac; padding:4px 6px;" onclick="sendSingleWhatsAppReminder('${s.id}')" title="Send WhatsApp Status">
            <i data-lucide="message-circle" style="width:13px; height:13px;"></i>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function filterVanRegister() {
  const query = (document.getElementById('vanSearchInput')?.value || '').toLowerCase().trim();
  const selectedGrade = document.getElementById('vanFilterGrade')?.value || 'All';
  const selectedStatus = document.getElementById('vanFilterStatus')?.value || 'All';

  let filtered = allStudents.filter(isStudentTravellingInVan);

  if (selectedGrade !== 'All') {
    filtered = filtered.filter(s => s.grade.toLowerCase() === selectedGrade.toLowerCase());
  }

  if (selectedStatus !== 'All') {
    filtered = filtered.filter(s => {
      const van = getStudentVanMonthDetails(s);
      if (selectedStatus === 'Paid') return van.remainingCount === 0;
      if (selectedStatus === 'Partial') return van.paidCount > 0 && van.remainingCount > 0;
      if (selectedStatus === 'Unpaid') return van.paidCount === 0;
      return true;
    });
  }

  if (query) {
    filtered = filtered.filter(s => 
      (s.name && s.name.toLowerCase().includes(query)) ||
      (s.rollNo && String(s.rollNo).toLowerCase().includes(query)) ||
      (s.boardingArea && s.boardingArea.toLowerCase().includes(query)) ||
      (s.contact && String(s.contact).includes(query))
    );
  }

  renderVanRegisterTable(filtered);
  initIcons();
}

function filterVanByGrade(grade) {
  const sel = document.getElementById('vanFilterGrade');
  if (sel) sel.value = grade;
  filterVanRegister();
  const table = document.getElementById('vanRegisterTable');
  if (table) table.scrollIntoView({ behavior: 'smooth' });
}

function renderVanGradeStats(vanStudents) {
  const tbody = document.getElementById('vanGradeStatsBody');
  if (!tbody) return;
  tbody.innerHTML = '';

  const grades = ['LKG', 'UKG', '1st Std', '2nd Std', '3rd Std', '4th Std', '5th Std', '6th Std', '7th Std', '8th Std'];

  grades.forEach(g => {
    const totalInGrade = allStudents.filter(s => s.grade === g).length;
    const vanInGrade = vanStudents.filter(s => s.grade === g);
    if (vanInGrade.length === 0) return;

    const rates = vanInGrade.map(s => Number(s.transportMonthlyFee || 0)).filter(r => r > 0);
    const minRate = rates.length > 0 ? Math.min(...rates) : 0;
    const maxRate = rates.length > 0 ? Math.max(...rates) : 0;
    const rateDisplay = minRate === maxRate ? `₹${minRate}/mo` : `₹${minRate} – ₹${maxRate}/mo`;

    const expected = vanInGrade.reduce((sum, s) => {
      const rate = Number(s.transportMonthlyFee || 0);
      return sum + (s.transportFee || (rate * 11));
    }, 0);
    const collected = vanInGrade.reduce((sum, s) => sum + Number(s.vanPaid || 0), 0);
    const due = Math.max(0, expected - collected);
    const ratePct = expected > 0 ? ((collected / expected) * 100).toFixed(1) : 0;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${g}</strong></td>
      <td>${totalInGrade}</td>
      <td><span class="badge" style="background:#dbeafe; color:#1d4ed8; font-weight:700;">${vanInGrade.length} (${((vanInGrade.length/totalInGrade)*100).toFixed(0)}%)</span></td>
      <td style="font-weight:600; color:#475569;">${rateDisplay}</td>
      <td><strong>₹${expected.toLocaleString('en-IN')}</strong></td>
      <td style="color:#059669; font-weight:700;">₹${collected.toLocaleString('en-IN')}</td>
      <td style="color:#ef4444; font-weight:700;">₹${due.toLocaleString('en-IN')}</td>
      <td>
        <div style="display:flex; align-items:center; gap:8px;">
          <div style="flex:1; background:#e2e8f0; border-radius:4px; height:8px; overflow:hidden;">
            <div style="background:#10b981; height:100%; width:${ratePct}%;"></div>
          </div>
          <span style="font-size:0.8rem; font-weight:700; color:#0f172a;">${ratePct}%</span>
        </div>
      </td>
      <td>
        <div style="display:flex; gap:6px;">
          <button class="btn btn-outline btn-sm" onclick="filterVanByGrade('${g}')">View</button>
          <button class="btn btn-sm" style="background:#1e3a8a; color:#fff; font-weight:600; padding:4px 8px; font-size:0.75rem;" onclick="openClassDuesPrintModal('${g}', 'VanOnly')" title="Print Class Van Dues PDF for ${g}">
            <i data-lucide="printer" style="width:12px; height:12px; display:inline; margin-right:2px;"></i> Print Van Dues
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function renderVanRecentReceipts(vanReceipts) {
  const tbody = document.getElementById('vanRecentPayments');
  if (!tbody) return;
  tbody.innerHTML = '';

  const recents = vanReceipts.slice(0, 15);
  if (recents.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:20px; color:#64748b;">No van payments recorded yet.</td></tr>`;
    return;
  }

  recents.forEach(p => {
    const tr = document.createElement('tr');
    const feeMonth = p.transportMonth || p.term || 'Van Fee';
    tr.innerHTML = `
      <td><strong style="color:#1e3a8a;">${p.receiptNo}</strong></td>
      <td><strong>${p.studentName}</strong></td>
      <td><span class="grade-pill">${p.grade}</span></td>
      <td><span class="badge" style="background:#dcfce7; color:#15803d; font-weight:700;">${feeMonth}</span></td>
      <td>${p.date}</td>
      <td style="font-weight:800; color:#10b981;">₹${Number(p.amount).toLocaleString('en-IN')}</td>
      <td>
        <button class="btn btn-outline btn-sm" onclick="viewReceipt('${p.receiptNo}')" style="padding:3px 8px;">
          <i data-lucide="printer" style="width:13px; height:13px; display:inline;"></i> Receipt
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function openVanFeeCollectModal(studentId) {
  switchTab('collect');
  const sel = document.getElementById('collectStudentSelect');
  if (sel && studentId) {
    sel.value = studentId;
    sel.dispatchEvent(new Event('change'));
  }
  const termSel = document.getElementById('collectTerm');
  if (termSel) {
    termSel.value = 'Monthly Transport Fee';
  }
  if (studentId) {
    const s = allStudents.find(st => st.id === studentId);
    if (s && s.transportMonthlyFee) {
      const amtInp = document.getElementById('collectAmount');
      if (amtInp) amtInp.value = s.transportMonthlyFee;
    }
  }
}

function printVanRegister() {
  window.print();
}

// 8. Class-Wise Dues & Defaulter Printable PDF Reports
function openClassDuesPrintModal(grade = 'All', feeType = 'Both', sheetType = 'TeacherCopy') {
  const modal = document.getElementById('classDuesPrintModal');
  if (!modal) return;

  const selGrade = document.getElementById('printModalGradeSelect');
  if (selGrade) selGrade.value = grade || 'All';

  const selFee = document.getElementById('printModalFeeTypeSelect');
  if (selFee) selFee.value = feeType || 'Both';

  const selStatus = document.getElementById('printModalStatusSelect');
  if (selStatus) selStatus.value = 'DuesOnly';

  const selSheet = document.getElementById('printModalSheetType');
  if (selSheet) selSheet.value = sheetType || 'TeacherCopy';

  updateClassDuesPrintReport();
  modal.classList.add('open');
  initIcons();
}

function closeClassDuesPrintModal() {
  const modal = document.getElementById('classDuesPrintModal');
  if (modal) modal.classList.remove('open');
}

function updateClassDuesPrintReport() {
  const container = document.getElementById('printableClassDuesReport');
  if (!container) return;

  const selectedSheetType = document.getElementById('printModalSheetType')?.value || 'TeacherCopy';
  const selectedGrade = document.getElementById('printModalGradeSelect')?.value || 'All';
  const selectedStatus = document.getElementById('printModalStatusSelect')?.value || 'DuesOnly';
  const selectedFeeType = document.getElementById('printModalFeeTypeSelect')?.value || 'Both';

  const schoolName = (schoolInfo && schoolInfo.name) || "Senthilvel Vidyalaya School";
  const schoolAddr = (schoolInfo && schoolInfo.address) || "Pakkudi, Pudukottai";
  const schoolPhone = (schoolInfo && schoolInfo.phone) || "9789277169, 9445987169";

  let students = allStudents.slice();

  // 1. Grade filter
  if (selectedGrade !== 'All') {
    students = students.filter(s => s.grade.toLowerCase() === selectedGrade.toLowerCase());
  }

  // 2. Fee Component filter
  if (selectedFeeType === 'SchoolOnly') {
    if (selectedStatus === 'DuesOnly') {
      students = students.filter(s => (s.schoolDue || 0) > 0);
    }
  } else if (selectedFeeType === 'VanOnly') {
    if (selectedStatus === 'DuesOnly') {
      students = students.filter(s => (s.vanDue || 0) > 0);
    } else {
      students = students.filter(s => s.transportOpted || Number(s.transportFee) > 0);
    }
  } else {
    // Both School & Van
    if (selectedStatus === 'DuesOnly') {
      students = students.filter(s => (s.balanceDue || 0) > 0);
    }
  }

  // 3. Status filter
  if (selectedStatus === 'Unpaid') {
    students = students.filter(s => (s.totalPaid || 0) === 0 && (s.balanceDue || 0) > 0);
  } else if (selectedStatus === 'Partial') {
    students = students.filter(s => (s.totalPaid || 0) > 0 && (s.balanceDue || 0) > 0);
  }

  // Sort students: Grade, then Roll No
  students.sort((a, b) => {
    if (a.grade !== b.grade) return a.grade.localeCompare(b.grade);
    const rA = parseInt(String(a.rollNo).replace(/\D/g, '')) || 0;
    const rB = parseInt(String(b.rollNo).replace(/\D/g, '')) || 0;
    return rA - rB;
  });

  const totalInView = students.length;
  const unpaidCount = students.filter(s => (s.totalPaid || 0) === 0 && (s.balanceDue || 0) > 0).length;
  const partialCount = students.filter(s => (s.totalPaid || 0) > 0 && (s.balanceDue || 0) > 0).length;
  const fullyPaidCount = students.filter(s => (s.balanceDue || 0) === 0).length;

  const totalSchoolDue = students.reduce((sum, s) => sum + Number(s.schoolDue || 0), 0);
  const totalVanDue = students.reduce((sum, s) => sum + Number(s.vanDue || 0), 0);
  const totalConsolidatedDue = students.reduce((sum, s) => sum + Number(s.balanceDue || 0), 0);

  const totalSchoolExpected = students.reduce((sum, s) => sum + Number(s.netSchoolPayable || 0), 0);
  const totalSchoolPaid = students.reduce((sum, s) => sum + Number(s.schoolPaid || 0), 0);
  const totalVanPaid = students.reduce((sum, s) => sum + Number(s.vanPaid || 0), 0);

  const reportDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  });

  const classTitle = selectedGrade === 'All' ? 'ALL CLASSES (LKG - 8TH STD)' : `CLASS: ${selectedGrade.toUpperCase()}`;
  const feeTypeTitle = selectedFeeType === 'Both' ? 'School Academic & Van Fees' : (selectedFeeType === 'SchoolOnly' ? 'School Fees Only' : 'Van Fees Only');
  const statusTitle = selectedStatus === 'DuesOnly' ? 'Unpaid & Partially Paid' : (selectedStatus === 'Unpaid' ? 'Unpaid Only' : (selectedStatus === 'Partial' ? 'Partially Paid Only' : 'All Students'));

  // -------------------------------------------------------------
  // TYPE A: CLASS TEACHER'S FOLLOW-UP SHEET (NO CLASS TOTALS, NO PARENT NAME)
  // -------------------------------------------------------------
  if (selectedSheetType === 'TeacherCopy') {
    let rowsHtml = '';
    if (students.length === 0) {
      rowsHtml = `<tr><td colspan="14" style="text-align:center; padding:30px; font-weight:700; color:#10b981;">No student records with dues found. All fees are cleared!</td></tr>`;
    } else {
      students.forEach((s, idx) => {
        const van = getStudentVanMonthDetails(s);

        let vanMonthlyStr = '-';
        let vanPaidStr = '-';
        let vanRemStr = 'Self Commute';

        if (s.transportOpted || van.annualVanFee > 0) {
          vanMonthlyStr = van.monthlyRate > 0 ? `₹${van.monthlyRate.toLocaleString('en-IN')}` : '-';

          if (van.paidMonths.length > 0) {
            vanPaidStr = `<strong>${van.paidCount} Mos:</strong> ${van.paidMonths.join(', ')}`;
          } else {
            vanPaidStr = '<span style="color:#b91c1c; font-weight:600;">0 Mos Paid</span>';
          }

          if (van.remainingMonths.length > 0) {
            vanRemStr = `<span style="color:#b45309; font-weight:600;">${van.remainingCount} Mos Due:</span> ${van.remainingMonths.join(', ')}`;
          } else {
            vanRemStr = '<span style="color:#15803d; font-weight:700;">Completed (11/11)</span>';
          }
        }

        const isUnpaid = (s.totalPaid || 0) === 0;
        const isPaid = (s.balanceDue || 0) === 0;
        const statusLabel = isPaid 
          ? '<span style="color:#15803d; font-weight:700;">Fully Paid</span>'
          : (isUnpaid 
            ? '<span style="color:#b91c1c; font-weight:700;">Unpaid</span>' 
            : '<span style="color:#b45309; font-weight:700;">Partially Paid</span>');

        rowsHtml += `
          <tr>
            <td style="text-align:center;">${idx + 1}</td>
            <td style="text-align:center; font-weight:700;">${s.rollNo || '-'}</td>
            <td><strong>${s.name}</strong></td>
            <td style="text-align:center;">${s.grade} - ${s.section || 'A'}</td>
            <td style="font-weight:700; color:#1e3a8a; white-space:nowrap;">${s.contact || '-'}</td>
            <td style="text-align:right;">₹${(s.netSchoolPayable || 0).toLocaleString('en-IN')}</td>
            <td style="text-align:right; color:#059669; font-weight:600;">₹${(s.schoolPaid || 0).toLocaleString('en-IN')}</td>
            <td style="text-align:right; font-weight:700; color:#b91c1c;">₹${(s.schoolDue || 0).toLocaleString('en-IN')}</td>
            <td style="text-align:right; font-weight:700; color:#1e40af; white-space:nowrap;">${vanMonthlyStr}</td>
            <td style="font-size:0.71rem; line-height:1.25;">${vanPaidStr}</td>
            <td style="font-size:0.71rem; line-height:1.25;">${vanRemStr}</td>
            <td style="text-align:right; font-weight:700; color:#d97706;">₹${(s.vanDue || 0).toLocaleString('en-IN')}</td>
            <td style="text-align:right; font-weight:800; color:#ef4444; font-size:0.83rem;">₹${(s.balanceDue || 0).toLocaleString('en-IN')}</td>
            <td style="border-right: 1px solid #cbd5e1; min-width:105px;"></td>
          </tr>
        `;
      });
    }

    container.innerHTML = `
      <div class="report-header-print">
        <h2 class="report-school-title">${schoolName}</h2>
        <p class="report-school-sub">${schoolAddr} | Ph: ${schoolPhone}</p>
        <div class="report-doc-title" style="background:#f0fdf4; color:#15803d; border-color:#bbf7d0;">
          ${classTitle} — CLASS TEACHER'S FEE FOLLOW-UP STATEMENT
        </div>
        <div style="font-size:0.78rem; color:#475569; margin-top:4px;">
          <strong>Academic Year:</strong> 2026-2027 &nbsp;|&nbsp; <strong>Date:</strong> ${reportDate} &nbsp;|&nbsp; <strong>Scope:</strong> ${statusTitle} (${feeTypeTitle})
        </div>
      </div>

      <div class="report-meta-grid" style="grid-template-columns: repeat(4, 1fr); background:#f0fdf4; border-color:#bbf7d0;">
        <div class="report-meta-item">
          <strong>Class / Section</strong>
          <span>${selectedGrade === 'All' ? 'All Classes' : selectedGrade}</span>
        </div>
        <div class="report-meta-item">
          <strong>Total Students Listed</strong>
          <span>${totalInView} Students</span>
        </div>
        <div class="report-meta-item">
          <strong>Unpaid Students</strong>
          <span style="color:#b91c1c;">${unpaidCount} Students</span>
        </div>
        <div class="report-meta-item">
          <strong>Partially Paid Students</strong>
          <span style="color:#b45309;">${partialCount} Students</span>
        </div>
      </div>

      <div style="font-size:0.75rem; color:#475569; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center;">
        <div style="font-style:italic;">
          * Note for Class Teacher: Contact parents via phone numbers below to follow up on pending dues. Record call date and remarks in the right column.
        </div>
        <div>
          Date: <strong>${reportDate}</strong>
        </div>
      </div>

      <table class="report-table-print">
        <thead>
          <tr>
            <th style="width:28px; text-align:center;">#</th>
            <th style="width:45px; text-align:center;">Roll</th>
            <th style="min-width:120px;">Student Name</th>
            <th style="width:60px; text-align:center;">Class</th>
            <th style="width:90px;">Parent Phone</th>
            <th style="width:70px; text-align:right;">School Fee</th>
            <th style="width:70px; text-align:right;">School Paid</th>
            <th style="width:75px; text-align:right; color:#b91c1c;">School Due</th>
            <th style="width:85px; text-align:right; color:#1e40af; background:#eff6ff;">Per Month Van Fee</th>
            <th style="min-width:125px;">Van Paid Months (Count)</th>
            <th style="min-width:135px;">Van Remaining Months to Pay</th>
            <th style="width:70px; text-align:right; color:#d97706;">Van Due</th>
            <th style="width:80px; text-align:right; color:#ef4444;">Total Due</th>
            <th style="width:110px; text-align:center;">Teacher Remarks &amp; Notes</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="14" style="text-align:left; font-weight:700; background:#f8fafc; padding:8px 10px; color:#475569;">
              Student Summary: ${totalInView} Students Listed (${unpaidCount} Unpaid, ${partialCount} Partially Paid)
            </td>
          </tr>
        </tfoot>
      </table>

      <div class="report-signatures" style="margin-top:28px;">
        <div class="report-sig-block" style="width:260px; text-align:left; border-top:1px dashed #64748b; padding-top:6px;">
          Class Teacher Name: _______________________<br>
          Class Teacher Signature: ____________________ &nbsp; Date: ________
        </div>
      </div>
    `;
    return;
  }

  // -------------------------------------------------------------
  // TYPE B: OFFICIAL AUDIT / ACCOUNTS STATEMENT (WITH TOTALS & PARENT NAMES)
  // -------------------------------------------------------------
  let rowsHtml = '';
  if (students.length === 0) {
    rowsHtml = `<tr><td colspan="15" style="text-align:center; padding:30px; font-weight:700; color:#10b981;">No student records found matching the chosen criteria. All fees are cleared!</td></tr>`;
  } else {
    students.forEach((s, idx) => {
      const isUnpaid = (s.totalPaid || 0) === 0;
      const isPaid = (s.balanceDue || 0) === 0;
      const statusLabel = isPaid 
        ? '<span style="color:#15803d; font-weight:700;">Fully Paid</span>'
        : (isUnpaid 
          ? '<span style="color:#b91c1c; font-weight:700;">Unpaid</span>' 
          : '<span style="color:#b45309; font-weight:700;">Partially Paid</span>');

      const van = getStudentVanMonthDetails(s);
      let vanRouteStr = 'Self Commute';
      let vanRemStr = '-';
      if (s.transportOpted || van.annualVanFee > 0) {
        vanRouteStr = `₹${van.monthlyRate}/mo (${s.boardingArea || 'Campus'})`;
        if (van.remainingMonths.length > 0) {
          vanRemStr = `${van.remainingMonths.slice(0, 4).join(', ')}${van.remainingMonths.length > 4 ? '... (' + van.remainingMonths.length + ' mos)' : ''}`;
        } else {
          vanRemStr = 'Paid (11/11)';
        }
      }

      rowsHtml += `
        <tr>
          <td style="text-align:center;">${idx + 1}</td>
          <td style="text-align:center; font-weight:700;">${s.rollNo || '-'}</td>
          <td><strong>${s.name}</strong></td>
          <td style="text-align:center;">${s.grade} - ${s.section || 'A'}</td>
          <td>${s.parentName || '-'}</td>
          <td>${s.contact || '-'}</td>
          <td style="text-align:center;">${statusLabel}</td>
          <td style="text-align:right;">₹${(s.netSchoolPayable || 0).toLocaleString('en-IN')}</td>
          <td style="text-align:right; color:#059669;">₹${(s.schoolPaid || 0).toLocaleString('en-IN')}</td>
          <td style="text-align:right; font-weight:700; color:#b91c1c;">₹${(s.schoolDue || 0).toLocaleString('en-IN')}</td>
          <td style="font-size:0.72rem;">${vanRouteStr}</td>
          <td style="font-size:0.72rem; color:#475569;">${vanRemStr}</td>
          <td style="text-align:right; font-weight:700; color:#d97706;">₹${(s.vanDue || 0).toLocaleString('en-IN')}</td>
          <td style="text-align:right; font-weight:800; color:#ef4444; font-size:0.82rem;">₹${(s.balanceDue || 0).toLocaleString('en-IN')}</td>
          <td style="border-right: 1px solid #cbd5e1;"></td>
        </tr>
      `;
    });
  }

  container.innerHTML = `
    <div class="report-header-print">
      <h2 class="report-school-title">${schoolName}</h2>
      <p class="report-school-sub">${schoolAddr} | Ph: ${schoolPhone}</p>
      <div class="report-doc-title">
        ${classTitle} — OFFICIAL FEE DUE &amp; DEFAULTER STATEMENT
      </div>
      <div style="font-size:0.78rem; color:#475569; margin-top:4px;">
        <strong>Component:</strong> ${feeTypeTitle} &nbsp;|&nbsp; <strong>Filter:</strong> ${statusTitle} &nbsp;|&nbsp; <strong>Academic Year:</strong> 2026-2027
      </div>
    </div>

    <div class="report-meta-grid">
      <div class="report-meta-item">
        <strong>Report Scope</strong>
        <span>${selectedGrade === 'All' ? 'Whole School' : selectedGrade}</span>
      </div>
      <div class="report-meta-item">
        <strong>Students Listed</strong>
        <span>${totalInView} Students</span>
      </div>
      <div class="report-meta-item">
        <strong>Pending School Fees</strong>
        <span style="color:#b91c1c;">₹${totalSchoolDue.toLocaleString('en-IN')}</span>
      </div>
      <div class="report-meta-item">
        <strong>Pending Van Fees</strong>
        <span style="color:#d97706;">₹${totalVanDue.toLocaleString('en-IN')}</span>
      </div>
      <div class="report-meta-item" style="background:#fef2f2; border:1px solid #fecaca; padding:4px 8px; border-radius:4px;">
        <strong style="color:#991b1b;">TOTAL BALANCE DUE</strong>
        <span style="color:#ef4444; font-size:1rem;">₹${totalConsolidatedDue.toLocaleString('en-IN')}</span>
      </div>
    </div>

    <div style="font-size:0.76rem; color:#475569; margin-bottom:8px; display:flex; justify-content:space-between;">
      <div>
        Showing: <strong>${unpaidCount} Unpaid</strong> + <strong>${partialCount} Partially Paid</strong> ${fullyPaidCount > 0 ? '+ ' + fullyPaidCount + ' Fully Paid' : ''}
      </div>
      <div>
        Generated On: <strong>${reportDate}</strong>
      </div>
    </div>

    <table class="report-table-print">
      <thead>
        <tr>
          <th style="width:28px; text-align:center;">#</th>
          <th style="width:50px; text-align:center;">Roll</th>
          <th style="min-width:125px;">Student Name</th>
          <th style="width:75px; text-align:center;">Class</th>
          <th style="min-width:105px;">Parent / Guardian</th>
          <th style="width:88px;">Contact No</th>
          <th style="width:80px; text-align:center;">Status</th>
          <th style="width:75px; text-align:right;">School Fee</th>
          <th style="width:75px; text-align:right;">School Paid</th>
          <th style="width:80px; text-align:right; color:#b91c1c;">School Due</th>
          <th style="width:105px;">Van Route</th>
          <th style="min-width:110px;">Van Due Mos</th>
          <th style="width:75px; text-align:right; color:#d97706;">Van Due</th>
          <th style="width:85px; text-align:right; color:#ef4444;">Total Due</th>
          <th style="width:100px; text-align:center;">Parent Sign / Remarks</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
      <tfoot>
        <tr>
          <td colspan="7" style="text-align:right; font-weight:800;">TOTALS (${totalInView} Students):</td>
          <td style="text-align:right;">₹${totalSchoolExpected.toLocaleString('en-IN')}</td>
          <td style="text-align:right; color:#059669;">₹${totalSchoolPaid.toLocaleString('en-IN')}</td>
          <td style="text-align:right; color:#b91c1c; font-weight:800;">₹${totalSchoolDue.toLocaleString('en-IN')}</td>
          <td colspan="2" style="text-align:right; font-weight:700;">Van Due Total:</td>
          <td style="text-align:right; color:#d97706; font-weight:800;">₹${totalVanDue.toLocaleString('en-IN')}</td>
          <td style="text-align:right; color:#ef4444; font-weight:900; font-size:0.88rem;">₹${totalConsolidatedDue.toLocaleString('en-IN')}</td>
          <td></td>
        </tr>
      </tfoot>
    </table>

    <div class="report-signatures">
      <div class="report-sig-block">
        Class Teacher Signature
      </div>
      <div class="report-sig-block">
        Fee / Accounts Incharge
      </div>
      <div class="report-sig-block">
        Principal / Correspondent
      </div>
    </div>
  `;
}

function exportClassDuesReportCSV() {
  const selectedSheetType = document.getElementById('printModalSheetType')?.value || 'TeacherCopy';
  const selectedGrade = document.getElementById('printModalGradeSelect')?.value || 'All';
  const selectedStatus = document.getElementById('printModalStatusSelect')?.value || 'DuesOnly';
  const selectedFeeType = document.getElementById('printModalFeeTypeSelect')?.value || 'Both';

  let students = allStudents.slice();
  if (selectedGrade !== 'All') {
    students = students.filter(s => s.grade.toLowerCase() === selectedGrade.toLowerCase());
  }

  if (selectedFeeType === 'SchoolOnly') {
    if (selectedStatus === 'DuesOnly') students = students.filter(s => (s.schoolDue || 0) > 0);
  } else if (selectedFeeType === 'VanOnly') {
    if (selectedStatus === 'DuesOnly') students = students.filter(s => (s.vanDue || 0) > 0);
    else students = students.filter(s => s.transportOpted || Number(s.transportFee) > 0);
  } else {
    if (selectedStatus === 'DuesOnly') students = students.filter(s => (s.balanceDue || 0) > 0);
  }

  if (selectedStatus === 'Unpaid') {
    students = students.filter(s => (s.totalPaid || 0) === 0 && (s.balanceDue || 0) > 0);
  } else if (selectedStatus === 'Partial') {
    students = students.filter(s => (s.totalPaid || 0) > 0 && (s.balanceDue || 0) > 0);
  }

  const csvRows = [];

  if (selectedSheetType === 'TeacherCopy') {
    csvRows.push([
      "S.No",
      "Roll No",
      "Student Name",
      "Class",
      "Section",
      "Parent Phone Number",
      "School Total Fee",
      "School Fee Paid",
      "School Fee Due",
      "Van Fee Per Month",
      "Van Fees Paid (Count & Months)",
      "Van Remaining Months to Pay",
      "Van Fee Due",
      "Total Balance Due",
      "Teacher Remarks"
    ].map(v => `"${v}"`).join(','));

    students.forEach((s, idx) => {
      const van = getStudentVanMonthDetails(s);
      const vanMonthlyVal = (s.transportOpted || van.annualVanFee > 0) ? (van.monthlyRate || s.transportMonthlyFee || 0) : 0;
      const vanPaidStr = van.paidCount > 0 ? `${van.paidCount} Mos (${van.paidMonths.join('; ')})` : '0 Mos';
      const vanRemStr = s.transportOpted ? (van.remainingCount > 0 ? `${van.remainingCount} Mos Due (${van.remainingMonths.join('; ')})` : 'Nil (Completed)') : 'Self Commute';

      csvRows.push([
        idx + 1,
        s.rollNo || '',
        s.name,
        s.grade,
        s.section || 'A',
        s.contact || '',
        s.netSchoolPayable || 0,
        s.schoolPaid || 0,
        s.schoolDue || 0,
        vanMonthlyVal,
        vanPaidStr,
        vanRemStr,
        s.vanDue || 0,
        s.balanceDue || 0,
        ''
      ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','));
    });
  } else {
    csvRows.push([
      "S.No",
      "Roll No",
      "Student Name",
      "Class",
      "Section",
      "Parent Name",
      "Contact",
      "Status",
      "School Total Fee",
      "School Paid",
      "School Due",
      "Van Opted",
      "Van Monthly Rate",
      "Van Paid Months",
      "Van Remaining Due Months",
      "Van Total Due",
      "Consolidated Total Due"
    ].map(v => `"${v}"`).join(','));

    students.forEach((s, idx) => {
      const isUnpaid = (s.totalPaid || 0) === 0;
      const isPaid = (s.balanceDue || 0) === 0;
      const statusText = isPaid ? 'Fully Paid' : (isUnpaid ? 'Unpaid' : 'Partially Paid');
      const van = getStudentVanMonthDetails(s);

      csvRows.push([
        idx + 1,
        s.rollNo || '',
        s.name,
        s.grade,
        s.section || 'A',
        s.parentName || '',
        s.contact || '',
        statusText,
        s.netSchoolPayable || 0,
        s.schoolPaid || 0,
        s.schoolDue || 0,
        s.transportOpted ? 'Yes' : 'No',
        van.monthlyRate || 0,
        van.paidMonths.join('; '),
        van.remainingMonths.join('; '),
        s.vanDue || 0,
        s.balanceDue || 0
      ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','));
    });
  }

  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const sheetName = selectedSheetType === 'TeacherCopy' ? 'Teacher_Followup_Sheet' : 'Office_Statement';
  const filename = `${selectedGrade === 'All' ? 'All_Classes' : selectedGrade.replace(/\s+/g, '_')}_${sheetName}.csv`;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast(`Exported ${filename} successfully!`);
}

function printClassDuesReport() {
  const reportContent = document.getElementById('printableClassDuesReport');
  if (!reportContent) return;

  // Use a dedicated invisible iframe to print clean, pure A4 landscape multi-page document
  let iframe = document.getElementById('printReportIframe');
  if (iframe) iframe.remove();

  iframe = document.createElement('iframe');
  iframe.id = 'printReportIframe';
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.style.visibility = 'hidden';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow.document;
  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Fee Dues Statement - Senthilvel Vidyalaya</title>
        <style>
          @page {
            size: A4 landscape;
            margin: 10mm 8mm 10mm 8mm;
          }
          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          html, body {
            margin: 0;
            padding: 0;
            background: #ffffff;
            color: #0f172a;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
            font-size: 11px;
            line-height: 1.35;
          }
          .report-header-print {
            text-align: center;
            border-bottom: 2px solid #1e3a8a;
            padding-bottom: 8px;
            margin-bottom: 10px;
          }
          .report-school-title {
            font-size: 19px;
            font-weight: 800;
            color: #1e3a8a;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin: 0 0 2px 0;
          }
          .report-school-sub {
            font-size: 11.5px;
            color: #475569;
            margin: 0 0 4px 0;
          }
          .report-doc-title {
            font-size: 13.5px;
            font-weight: 700;
            color: #b91c1c;
            background-color: #fef2f2 !important;
            border: 1px solid #fecaca;
            display: inline-block;
            padding: 3px 14px;
            border-radius: 4px;
            margin-top: 3px;
          }
          .report-meta-grid {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 8px;
            background-color: #f8fafc !important;
            border: 1px solid #cbd5e1;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 10.5px;
            margin-bottom: 12px;
          }
          .report-meta-item strong {
            display: block;
            font-size: 9.5px;
            color: #64748b;
            text-transform: uppercase;
          }
          .report-meta-item span {
            font-size: 12.5px;
            font-weight: 700;
            color: #0f172a;
          }
          table.report-table-print {
            width: 100%;
            border-collapse: collapse;
            font-size: 10px;
            margin-bottom: 14px;
            page-break-inside: auto;
          }
          table.report-table-print thead {
            display: table-header-group;
          }
          table.report-table-print tfoot {
            display: table-footer-group;
          }
          table.report-table-print tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
          table.report-table-print th {
            background-color: #e2e8f0 !important;
            color: #0f172a;
            font-weight: 700;
            border: 1px solid #94a3b8;
            padding: 5px 4px;
            text-align: left;
          }
          table.report-table-print td {
            border: 1px solid #cbd5e1;
            padding: 4px 4px;
            vertical-align: middle;
          }
          table.report-table-print tr:nth-child(even) td {
            background-color: #f8fafc;
          }
          table.report-table-print tfoot td {
            background-color: #f1f5f9 !important;
            font-weight: 800;
            border-top: 2px solid #0f172a;
            border-bottom: 2px solid #0f172a;
            padding: 6px 4px;
          }
          .report-signatures {
            display: flex;
            justify-content: space-between;
            margin-top: 26px;
            padding: 0 16px;
            page-break-inside: avoid;
          }
          .report-sig-block {
            text-align: center;
            width: 180px;
            border-top: 1px dashed #64748b;
            padding-top: 6px;
            font-size: 11px;
            font-weight: 600;
            color: #334155;
          }
        </style>
      </head>
      <body>
        ${reportContent.innerHTML}
      </body>
    </html>
  `);
  doc.close();

  setTimeout(() => {
    try {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    } catch (e) {
      window.print();
    }
  }, 350);
}

// -------------------------------------------------------------
// Database Backup & Restore Handlers
// -------------------------------------------------------------
function downloadDatabaseBackup() {
  window.location.href = '/api/database/download';
  showToast("Downloading full database backup file...");
}

async function handleDbRestoreFile(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  if (!confirm(`Are you sure you want to restore data from "${file.name}"? This will update the database with the contents of this file.`)) {
    event.target.value = '';
    return;
  }

  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const json = JSON.parse(e.target.result);
      if (!json.students || !Array.isArray(json.students)) {
        showToast("Invalid backup file: Missing students data", true);
        return;
      }

      const res = await fetch('/api/database/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(json)
      });

      if (res.ok) {
        const data = await res.json();
        showToast(`Database restored! ${data.studentCount} students and ${data.paymentCount} payments loaded.`);
        await loadAllData();
        renderSchoolFeesTab();
      } else {
        const err = await res.json();
        showToast(err.error || "Failed to restore database", true);
      }
    } catch (err) {
      showToast("Error parsing JSON backup file: " + err.message, true);
    } finally {
      event.target.value = '';
    }
  };
  reader.readAsText(file);
}

// -------------------------------------------------------------
// Client-side Local Vault Protection (Prevents any data loss on redeploys)
// -------------------------------------------------------------
function checkAndMaintainLocalVault() {
  try {
    const rawVault = localStorage.getItem('sv_db_vault');
    if (rawVault) {
      const vault = JSON.parse(rawVault);
      const vaultPmts = (vault.payments || []).length;
      const currentPmts = (allReceipts || []).length;
      
      // If server has FEWER payments than saved in this browser, offer instant restore!
      if (vaultPmts > currentPmts) {
        showVaultRestoreBanner(vaultPmts, currentPmts);
      } else {
        saveToLocalVault();
      }
    } else {
      saveToLocalVault();
    }
  } catch (e) {
    console.error("Local vault check error:", e);
  }
}

async function saveToLocalVault() {
  try {
    const res = await fetch('/api/database/backup');
    if (res.ok) {
      const db = await res.json();
      localStorage.setItem('sv_db_vault', JSON.stringify({
        timestamp: Date.now(),
        date: new Date().toISOString(),
        ...db
      }));
    }
  } catch(e) {}
}

function showVaultRestoreBanner(vaultCount, serverCount) {
  let banner = document.getElementById('vaultRestoreBanner');
  if (!banner) {
    banner = document.createElement('div');
    banner.id = 'vaultRestoreBanner';
    banner.style.cssText = 'background:#fef3c7; border:1.5px solid #f59e0b; color:#92400e; padding:12px 18px; border-radius:8px; margin:12px 24px; display:flex; justify-content:space-between; align-items:center; box-shadow:0 2px 6px rgba(245,158,11,0.15);';
    const mainWrapper = document.querySelector('.page-container');
    if (mainWrapper) mainWrapper.prepend(banner);
  }

  banner.innerHTML = `
    <div style="display:flex; align-items:center; gap:10px;">
      <i data-lucide="shield-alert" style="width:22px; height:22px; color:#d97706; flex-shrink:0;"></i>
      <div>
        <strong>Saved Session Detected:</strong> Your browser has ${vaultCount} payments stored, while the server currently shows ${serverCount}. Would you like to restore your saved changes?
      </div>
    </div>
    <div style="display:flex; gap:8px;">
      <button class="btn btn-sm" style="background:#15803d; color:#fff; font-weight:700; padding:6px 14px;" onclick="restoreFromLocalVault()">Restore Saved Changes</button>
      <button class="btn btn-sm btn-outline" style="color:#78716c;" onclick="dismissVaultBanner()">Dismiss</button>
    </div>
  `;
  initIcons();
}

async function restoreFromLocalVault() {
  try {
    const rawVault = localStorage.getItem('sv_db_vault');
    if (!rawVault) return;
    const vault = JSON.parse(rawVault);
    delete vault.timestamp;
    delete vault.date;

    const res = await fetch('/api/database/restore', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(vault)
    });

    if (res.ok) {
      showToast("All your saved changes have been restored to the server!");
      dismissVaultBanner();
      await loadAllData();
      renderSchoolFeesTab();
    } else {
      showToast("Failed to restore from vault", true);
    }
  } catch (e) {
    showToast("Error restoring vault: " + e.message, true);
  }
}

function dismissVaultBanner() {
  const banner = document.getElementById('vaultRestoreBanner');
  if (banner) banner.remove();
}

