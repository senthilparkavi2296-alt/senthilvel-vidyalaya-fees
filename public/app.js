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

// Navigation Tabs
function setupNavigation() {
  const links = document.querySelectorAll('.sidebar-nav .nav-link');
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const tab = link.getAttribute('data-tab');
      switchTab(tab);
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
          <button class="btn btn-outline btn-sm" onclick="filterByGradeAndGo('${item.grade}')">View Class</button>
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
  tbody.innerHTML = '';

  if (students.length === 0) {
    tbody.innerHTML = `<tr><td colspan="11" style="text-align:center; padding:32px; color:#64748b;">No student records found matching the criteria.</td></tr>`;
    return;
  }

  students.forEach(s => {
    const tr = document.createElement('tr');
    let badgeClass = 'badge-unpaid';
    if (s.status === 'Paid') badgeClass = 'badge-paid';
    else if (s.status === 'Partial') badgeClass = 'badge-partial';

    const hasBus = s.transportOpted && Number(s.transportFee) > 0;

    tr.innerHTML = `
      <td>
        <div style="font-weight:700; color:#1e3a8a;">${s.id}</div>
        <div style="font-size:0.75rem; color:#64748b;">Roll: ${s.rollNo || '-'}</div>
      </td>
      <td>
        <strong style="color:#0f172a;">${s.name}</strong>
      </td>
      <td><span class="grade-pill">${s.grade}</span> Sec ${s.section || 'A'}</td>
      <td>
        <div>${s.parentName || '-'}</div>
        <div style="font-size:0.78rem; color:#64748b;">${s.contact || '-'}</div>
      </td>
      <td>₹${(s.baseTotal || 0).toLocaleString('en-IN')}</td>
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
      <td style="color:#059669; font-weight:600;">₹${s.totalPaid.toLocaleString('en-IN')}</td>
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
function renderDefaulters() {
  const tbody = document.getElementById('defaultersTableBody');
  if (!tbody) return;
  tbody.innerHTML = '';

  const defaulters = allStudents.filter(s => s.balanceDue > 0);

  // Update stats on WhatsApp card
  const dueCountElem = document.getElementById('waDueStudentCount');
  if (dueCountElem) dueCountElem.innerText = defaulters.length;

  const totalSchoolDue = defaulters.reduce((acc, s) => acc + (s.schoolDue || 0), 0);
  const totalVanDue = defaulters.reduce((acc, s) => acc + (s.vanDue || 0), 0);
  const totalCombinedDue = defaulters.reduce((acc, s) => acc + s.balanceDue, 0);

  const schoolDueElem = document.getElementById('waTotalSchoolDue');
  if (schoolDueElem) schoolDueElem.innerText = `₹${totalSchoolDue.toLocaleString('en-IN')}`;

  const vanDueElem = document.getElementById('waTotalVanDue');
  if (vanDueElem) vanDueElem.innerText = `₹${totalVanDue.toLocaleString('en-IN')}`;

  const combinedDueElem = document.getElementById('waTotalCombinedDue');
  if (combinedDueElem) combinedDueElem.innerText = `₹${totalCombinedDue.toLocaleString('en-IN')}`;

  if (defaulters.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center; padding:32px; color:#10b981; font-weight:600;">All students have cleared their fees! No dues pending.</td></tr>`;
    return;
  }

  defaulters.forEach(s => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${s.name}</strong></td>
      <td>${s.rollNo || '-'}</td>
      <td><span class="grade-pill">${s.grade}</span> Sec ${s.section || 'A'}</td>
      <td>${s.parentName || '-'}</td>
      <td><a href="tel:${s.contact}" style="color:#1e3a8a; text-decoration:none; font-weight:600;">${s.contact || '-'}</a></td>
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
      address: document.getElementById('mStudentAddress').value
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
    document.getElementById('rcptStudentId').innerText = `${p.studentId} / Roll: ${s?.rollNo || '-'}`;
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
        const desc = `Transportation Fee - Route: ${resolvedBoarding}`;
        const cycle = p.transportPaymentMode === 'Monthly' 
          ? `Monthly Plan (${p.transportMonth || 'Month'})` 
          : `Yearly / Annual (2026-2027)`;
        const lineAmt = transportAmt > 0 ? `₹${transportAmt.toLocaleString('en-IN')}` : 'Included';

        tr.innerHTML = `
          <td>${slNo++}</td>
          <td>
            <strong>${desc}</strong>
            <span class="badge" style="background:#fef3c7; color:#92400e; margin-left:6px; font-size:0.75rem;">Stop: ${resolvedBoarding}</span>
          </td>
          <td>${cycle}</td>
          <td style="text-align: right; font-weight:700; color:#d97706;">${lineAmt}</td>
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

function filterStudentsList() {
  const query = document.getElementById('studentSearchInput').value.toLowerCase().trim();
  const selectedGrade = document.getElementById('filterGrade').value;
  const selectedStatus = document.getElementById('filterStatus').value;

  let filtered = allStudents.filter(s => {
    const matchesGrade = (selectedGrade === 'All') || (s.grade === selectedGrade);
    const matchesStatus = (selectedStatus === 'All') || (s.status === selectedStatus);
    const matchesQuery = !query || (
      s.name.toLowerCase().includes(query) ||
      s.id.toLowerCase().includes(query) ||
      (s.rollNo && s.rollNo.toLowerCase().includes(query)) ||
      (s.parentName && s.parentName.toLowerCase().includes(query)) ||
      (s.contact && s.contact.includes(query))
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

// 7. Automated WhatsApp Due Reminders System
function formatStudentWhatsAppMessage(student) {
  const s = student;
  const schoolName = schoolInfo.name || "Senthilvel Vidyalaya School";
  const schoolAddr = schoolInfo.address || "Pakkudi, Pudukottai";
  const schoolPhone = schoolInfo.phone || "9789277169, 9445987169";

  return `🏫 *${schoolName.toUpperCase()}*
📍 ${schoolAddr} | 📞 ${schoolPhone}
----------------------------------------
Dear Parent of *${s.name}* (Class: *${s.grade} - Sec ${s.section || 'A'}*, Roll: *${s.rollNo || s.id}*),

Official Fee Status Update for Academic Year 2026-2027:

📚 *SCHOOL ACADEMIC FEES:*
• Total School Fee: ₹${(s.netSchoolPayable || 0).toLocaleString('en-IN')}
• Paid Amount: ₹${(s.schoolPaid || 0).toLocaleString('en-IN')}
• *Pending School Due: ₹${(s.schoolDue || 0).toLocaleString('en-IN')}*

🚌 *VAN / TRANSPORTATION FEES:*
• Route / Boarding Stop: ${s.boardingArea || 'Campus / Local'} (${s.transportType || (s.transportOpted ? 'Bus' : 'None')})
• Total Van Fee: ₹${(s.transportFee || 0).toLocaleString('en-IN')}
• Paid Amount: ₹${(s.vanPaid || 0).toLocaleString('en-IN')}
• *Pending Van Due: ₹${(s.vanDue || 0).toLocaleString('en-IN')}*

----------------------------------------
💰 *TOTAL CONSOLIDATED SUMMARY:*
• Net Annual Payable: ₹${s.netPayable.toLocaleString('en-IN')}
• Total Paid to Date: ₹${s.totalPaid.toLocaleString('en-IN')}
⚠️ *TOTAL BALANCE DUE: ₹${s.balanceDue.toLocaleString('en-IN')}*
----------------------------------------
Kindly clear the pending fees at the school accounts counter or via UPI (GPay/PhonePe).
For payment assistance, please call: 9789277169 / 9445987169.
Thank you!
- Accounts Office, Senthilvel Vidyalaya School`;
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

  const msg = formatStudentWhatsAppMessage(student);
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;

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
      mode: "Single Reminder"
    })
  }).catch(() => {});

  window.open(url, '_blank');
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

  const msg = `🧾 *OFFICIAL FEE PAYMENT RECEIPT*
🏫 *${schoolName.toUpperCase()}*
📍 ${schoolAddr} | 📞 ${schoolPhone}
----------------------------------------
Receipt No: *${p.receiptNo}*
Date: *${p.date}*
Student Name: *${p.studentName}* (${p.grade} - ${s?.section || 'A'})
Parent/Guardian: ${s?.parentName || 'Parent'}

✅ *AMOUNT RECEIVED NOW: ₹${Number(p.amount).toLocaleString('en-IN')}*
Payment Mode: ${p.paymentMethod} (Txn: ${p.transactionId || 'N/A'})
Term / Component: ${p.term || 'Fee Payment'}

----------------------------------------
📊 *UPDATED FEE STATUS & DUES:*

📚 *School Academic Fee:*
• Paid to Date: ₹${(s?.schoolPaid || 0).toLocaleString('en-IN')}
• *Pending School Due: ₹${(s?.schoolDue || 0).toLocaleString('en-IN')}*

🚌 *Van / Transportation Fee:*
• Route / Stop: ${p.boardingArea || s?.boardingArea || 'Campus / Local'}
• Paid to Date: ₹${(s?.vanPaid || 0).toLocaleString('en-IN')}
• *Pending Van Due: ₹${(s?.vanDue || 0).toLocaleString('en-IN')}*

💰 *Remaining Due Balance: ₹${(s?.balanceDue || 0).toLocaleString('en-IN')}*
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
        <button class="btn btn-sm" style="background:#25D366; color:#fff; font-weight:600; padding:6px 12px;" onclick="openIndividualWaFromModal(${idx})">
          <i data-lucide="message-circle" style="width:14px; height:14px; display:inline; margin-right:4px;"></i> Open WhatsApp
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  initIcons();
}

function openIndividualWaFromModal(idx) {
  const item = waRemindersQueue[idx];
  if (!item || !item.whatsappUrl) {
    showToast("Invalid contact details", true);
    return;
  }

  item.sent = true;
  const badge = document.getElementById(`waBadge_${idx}`);
  if (badge) {
    badge.innerText = 'Sent';
    badge.className = 'badge badge-paid';
  }

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
      mode: "Bulk Queue"
    })
  }).catch(() => {});

  window.open(item.whatsappUrl, '_blank');
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
    name: "Aarav Sharma",
    grade: "2nd Std",
    section: "A",
    rollNo: "2STD-01",
    netSchoolPayable: 26000,
    schoolPaid: 15000,
    schoolDue: 11000,
    boardingArea: "Alangudi",
    transportType: "Monthly",
    transportFee: 6000,
    vanPaid: 2400,
    vanDue: 3600,
    netPayable: 32000,
    totalPaid: 17400,
    balanceDue: 14600
  };

  const previewText = formatStudentWhatsAppMessage(sample);
  document.getElementById('waTemplatePreviewText').innerText = previewText;
  document.getElementById('waTemplateModal').classList.add('open');
}

function closeWaTemplateModal() {
  document.getElementById('waTemplateModal').classList.remove('open');
}

function copyWaTemplateText() {
  const text = document.getElementById('waTemplatePreviewText').innerText;
  navigator.clipboard.writeText(text).then(() => {
    showToast("Template text copied to clipboard!");
  }).catch(() => {
    showToast("Could not copy text", true);
  });
}
