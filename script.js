const API_BASE = 'http://localhost:5000/api';

const setMessage = (elementId, text, type) => {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.textContent = text;
  el.classList.remove('success', 'error');
  if (type) el.classList.add(type);
};

const handleEnrollmentSubmit = async (event) => {
  event.preventDefault();

  const form = event.currentTarget;
  const formData = new FormData(form);
  const payload = Object.fromEntries(formData.entries());

  try {
    const response = await fetch(`${API_BASE}/enrollments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      const messages = result.errors?.map((error) => `${error.field}: ${error.message}`).join(' • ') || result.message;
      setMessage('enrollmentMessage', messages, 'error');
      return;
    }

    setMessage('enrollmentMessage', result.message, 'success');
    form.reset();
  } catch (error) {
    setMessage('enrollmentMessage', 'Unable to submit enrollment. Please try again later.', 'error');
  }
};

const handleContactSubmit = async (event) => {
  event.preventDefault();

  const form = event.currentTarget;
  const formData = new FormData(form);
  const payload = Object.fromEntries(formData.entries());

  if (!payload.name || !payload.name.trim()) {
    setMessage('contactMessage', 'Name is required.', 'error');
    return;
  }

  if (!payload.phone || !payload.phone.trim()) {
    setMessage('contactMessage', 'Phone number is required.', 'error');
    return;
  }

  if (!payload.message || !payload.message.trim()) {
    setMessage('contactMessage', 'Message cannot be empty.', 'error');
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      const messages = result.errors?.map((error) => `${error.field}: ${error.message}`).join(' • ') || result.message;
      setMessage('contactMessage', messages, 'error');
      return;
    }

    setMessage('contactMessage', result.message, 'success');
    form.reset();
  } catch (error) {
    setMessage('contactMessage', 'Unable to send your message. Please try again later.', 'error');
  }
};

const COLUMN_LABELS = {
  childName: "Child's Name",
  parentName: "Parent's Name",
  program: "Course / Program",
  name: "Customer Name",
  phone: "Phone Number",
  email: "Email",
  subject: "Subject",
  message: "Enquiry Message",
  actions: "WhatsApp Reply"
};

const formatWhatsAppNumber = (phone) => {
  if (!phone) return null;
  let digits = String(phone).replace(/\D/g, '');
  if (!digits) return null;
  if (digits.length === 10) {
    digits = '91' + digits;
  } else if (digits.length === 11 && digits.startsWith('0')) {
    digits = '91' + digits.slice(1);
  }
  return digits;
};

let currentWaTarget = null;

const getWaTemplates = (target) => {
  if (!target) return {};
  const isContact = target.type === 'contact';
  const name = target.name || 'Friend';
  const snippet = target.originalMessage ? target.originalMessage.slice(0, 100) : '';

  if (isContact) {
    return {
      followup: `Hello ${name}! Greetings from MG ACADEMY 🌟\n\nThank you for reaching out to us regarding: "${snippet}".\n\nWe are happy to assist you! How can we help you today?`,
      courses: `Hello ${name}! Thank you for your enquiry with MG ACADEMY 🎨\n\nWe offer specialized creative courses:\n✦ Beginner Art (Age 4–8: Basic Shapes, Colouring & Drawing)\n✦ Intermediate Art (Age 8–12: Shading, Scenery & Watercolours)\n✦ Advanced Art (Age 10+: Canvas Painting & Portraits)\n✦ Dance, Mental Abacus & Performing Arts\n\nWould you like us to share our batch schedule and fee structure?`,
      timings: `Hello ${name}! Greetings from MG ACADEMY ⏰\n\nWe have flexible batches available:\n• Weekday Evening Batches (4:30 PM – 6:30 PM)\n• Weekend Morning Batches (10:00 AM – 1:00 PM)\n\nWould you like to book a complimentary free demo class for your child this week?`,
      visit: `Hello ${name}! You are warmly welcome to visit MG ACADEMY 📍\n\nAddress: 22 Creative Lane, Bengaluru, India\nCall / WhatsApp: +91 98765 43210\nHours: Monday to Saturday (9:30 AM – 7:00 PM)\n\nWe'd love to show you around our creative studio and meet your child!`
    };
  } else {
    const parentName = target.item?.parentName || name;
    const childName = target.item?.childName || 'your child';
    const course = target.item?.program || 'Art Program';

    return {
      followup: `Hello ${parentName}! Greetings from MG ACADEMY 🌟\n\nThank you for submitting the admission form for ${childName} in our "${course}"! We are thrilled to welcome ${childName} to our creative family.\n\nCould we confirm your preferred batch timing (Weekday / Weekend)?`,
      courses: `Hello ${parentName}! Thank you for enrolling ${childName} in "${course}" at MG ACADEMY 🎨\n\nOur instructors provide individual attention, all drawing & painting materials, and structured milestone certificates.\n\nWould you like us to send the starter kit checklist and fee payment details?`,
      timings: `Hello ${parentName}! Regarding ${childName}'s enrollment in "${course}":\n\nUpcoming batch starts this Saturday!\n• Timing: 10:30 AM – 12:30 PM\n\nPlease let us know if this slot works well for you.`,
      visit: `Hello ${parentName}! We invite you and ${childName} for an orientation visit to MG ACADEMY at 22 Creative Lane, Bengaluru 📍\n\nLooking forward to meeting you both!`
    };
  }
};

const setWaTemplate = (templateKey) => {
  if (!currentWaTarget) return;
  const templates = getWaTemplates(currentWaTarget);
  const text = templates[templateKey] || templates.followup || '';
  const textarea = document.getElementById('waMessageText');
  if (textarea) textarea.value = text;

  document.querySelectorAll('#waTemplateChips .chip').forEach((chip) => {
    chip.classList.toggle('active', chip.getAttribute('data-template') === templateKey);
  });
};

const openWhatsAppModal = (type, index) => {
  const modal = document.getElementById('whatsappModal');
  if (!modal) return;

  const dataset = type === 'contact' ? window.adminData?.contacts : window.adminData?.enrollments;
  if (!dataset || !dataset[index]) return;

  const item = dataset[index];
  const isContact = type === 'contact';
  const name = isContact ? item.name : `${item.parentName} (${item.childName}'s Parent)`;
  const rawPhone = item.phone || '';
  const cleanPhone = formatWhatsAppNumber(rawPhone);
  const originalMessage = isContact ? (item.message || item.subject || 'Enquiry') : `Course Enrollment: ${item.program}`;

  currentWaTarget = {
    type,
    name,
    rawPhone,
    cleanPhone,
    originalMessage,
    item
  };

  const nameEl = document.getElementById('waModalRecipient');
  const phoneEl = document.getElementById('waModalPhone');
  const origEl = document.getElementById('waModalOriginalMessage');
  const phoneStatus = document.getElementById('waPhoneStatus');

  if (nameEl) nameEl.textContent = name;
  if (phoneEl) phoneEl.textContent = rawPhone || 'N/A';
  if (origEl) origEl.textContent = `"${originalMessage}"`;

  if (phoneStatus) {
    if (cleanPhone) {
      phoneStatus.textContent = `✓ WhatsApp: +${cleanPhone}`;
      phoneStatus.style.background = '#dcfce7';
      phoneStatus.style.color = '#15803d';
    } else {
      phoneStatus.textContent = `⚠ Missing / Invalid Phone`;
      phoneStatus.style.background = '#fee2e2';
      phoneStatus.style.color = '#b91c1c';
    }
  }

  setWaTemplate('followup');
  modal.classList.remove('hidden');
};

const closeWhatsAppModal = () => {
  const modal = document.getElementById('whatsappModal');
  if (modal) modal.classList.add('hidden');
  currentWaTarget = null;
};

window.openWhatsAppModal = openWhatsAppModal;
window.closeWhatsAppModal = closeWhatsAppModal;

const escapeHtml = (str) => {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
};

const renderTable = (rows, columns, type) => {
  if (!rows || !rows.length) {
    return `
      <div class="empty-table-state">
        <span style="font-size: 2rem;">📭</span>
        <p style="margin: 6px 0 0; color: #64748b; font-weight: 700;">No records found.</p>
      </div>
    `;
  }

  const header = `<th>#</th>` + columns.map((column) => `<th>${COLUMN_LABELS[column] || column}</th>`).join('') + '<th style="text-align: right;">WhatsApp Action</th>';
  const body = rows.map((row, index) => {
    const cells = columns.map((column) => {
      const value = row[column] ?? '';
      if (column === 'program') {
        let badgeClass = 'badge-program';
        if (String(value).includes('Beginner')) badgeClass += ' badge-beg';
        else if (String(value).includes('Intermediate')) badgeClass += ' badge-int';
        else if (String(value).includes('Advanced')) badgeClass += ' badge-adv';
        return `<td><span class="${badgeClass}">${escapeHtml(value)}</span></td>`;
      }
      if (column === 'phone') {
        return `<td><strong style="color: #0f172a; font-family: monospace; font-size: 0.95em;">${escapeHtml(value) || '—'}</strong></td>`;
      }
      if (column === 'message') {
        const text = String(value);
        return `<td><span class="cell-message" title="${escapeHtml(text)}">${escapeHtml(text)}</span></td>`;
      }
      return `<td>${escapeHtml(String(value)) || '—'}</td>`;
    });

    const rawPhone = row.phone || '';
    const cleanPhone = formatWhatsAppNumber(rawPhone);
    let actionHtml = '';

    if (cleanPhone) {
      const defaultGreeting = encodeURIComponent(
        `Hello ${row.name || row.parentName || 'there'}! Greetings from MG ACADEMY 🌟\n\nThank you for reaching out to us. We are happy to assist you!`
      );
      const directUrl = `https://wa.me/${cleanPhone}?text=${defaultGreeting}`;

      actionHtml = `
        <div class="action-btn-group" style="justify-content: flex-end;">
          <button type="button" class="btn-wa-reply" onclick="openWhatsAppModal('${type}', ${index})" title="Custom Reply on WhatsApp">
            💬 Reply
          </button>
          <a href="${directUrl}" target="_blank" rel="noopener noreferrer" class="btn-wa-direct" title="Quick 1-Click WhatsApp Chat">
            ⚡ Quick
          </a>
        </div>
      `;
    } else {
      actionHtml = '<span class="no-phone-badge">No phone</span>';
    }

    return `<tr><td style="color:#94a3b8; font-weight:700; width:36px;">${index + 1}</td>${cells.join('')}<td>${actionHtml}</td></tr>`;
  }).join('');

  return `<table><thead><tr>${header}</tr></thead><tbody>${body}</tbody></table>`;
};

const filterAndRenderContacts = (query = '') => {
  const contactTable = document.getElementById('contactTable');
  if (!window.adminData || !contactTable) return;
  const q = query.trim().toLowerCase();
  let contacts = window.adminData.contacts || [];
  if (q) {
    contacts = contacts.filter((c) =>
      (c.name && c.name.toLowerCase().includes(q)) ||
      (c.phone && c.phone.includes(q)) ||
      (c.email && c.email.toLowerCase().includes(q)) ||
      (c.subject && c.subject.toLowerCase().includes(q)) ||
      (c.message && c.message.toLowerCase().includes(q))
    );
  }
  contactTable.innerHTML = renderTable(contacts, ['name', 'phone', 'email', 'subject', 'message'], 'contact');
};

const filterAndRenderEnrollments = (query = '') => {
  const enrollmentTable = document.getElementById('enrollmentTable');
  if (!window.adminData || !enrollmentTable) return;
  const q = query.trim().toLowerCase();
  let enrollments = window.adminData.enrollments || [];
  if (q) {
    enrollments = enrollments.filter((e) =>
      (e.childName && e.childName.toLowerCase().includes(q)) ||
      (e.parentName && e.parentName.toLowerCase().includes(q)) ||
      (e.program && e.program.toLowerCase().includes(q)) ||
      (e.phone && e.phone.includes(q)) ||
      (e.email && e.email.toLowerCase().includes(q))
    );
  }
  enrollmentTable.innerHTML = renderTable(enrollments, ['childName', 'parentName', 'program', 'phone', 'email'], 'enrollment');
};

const renderDashboard = (data) => {
  window.adminData = data;
  const statsGrid = document.getElementById('statsGrid');
  const enrollmentTable = document.getElementById('enrollmentTable');
  const contactTable = document.getElementById('contactTable');

  if (!statsGrid || !enrollmentTable || !contactTable) return;

  statsGrid.innerHTML = `
    <div class="stat-card stat-card-messages">
      <div class="stat-icon-wrap">💬</div>
      <div>
        <h4>Enquiry Messages</h4>
        <p>${data.stats.contacts}</p>
        <small style="color:#059669; font-weight:800;">✓ WhatsApp Active</small>
      </div>
    </div>
    <div class="stat-card stat-card-enrollments">
      <div class="stat-icon-wrap">📝</div>
      <div>
        <h4>Student Enrollments</h4>
        <p>${data.stats.enrollments}</p>
        <small style="color:#2563eb; font-weight:800;">Admission Applications</small>
      </div>
    </div>
    <div class="stat-card stat-card-programs">
      <div class="stat-icon-wrap">🎨</div>
      <div>
        <h4>Active Programs</h4>
        <p>7</p>
        <small style="color:#d97706; font-weight:800;">Age 4 to 18+</small>
      </div>
    </div>
  `;

  const msgBadge = document.getElementById('messagesTabCount');
  const enrBadge = document.getElementById('enrollmentsTabCount');
  if (msgBadge) msgBadge.textContent = data.stats.contacts || data.contacts?.length || 0;
  if (enrBadge) enrBadge.textContent = data.stats.enrollments || data.enrollments?.length || 0;

  filterAndRenderContacts();
  filterAndRenderEnrollments();
};

const adminLogin = async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const payload = Object.fromEntries(new FormData(form).entries());
  const loginStatus = document.getElementById('loginStatus');

  try {
    const response = await fetch(`${API_BASE}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      setMessage('loginStatus', result.message || 'Login failed', 'error');
      return;
    }

    localStorage.setItem('littleCreatorsToken', result.token);
    document.getElementById('loginPanel').classList.add('hidden');
    document.getElementById('dashboardPanel').classList.remove('hidden');
    await loadDashboard();
  } catch (error) {
    setMessage('loginStatus', 'Unable to login. Please try again.', 'error');
  }
};

const loadDashboard = async () => {
  const token = localStorage.getItem('littleCreatorsToken');
  if (!token) return;

  try {
    const response = await fetch(`${API_BASE}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Failed to load dashboard');
    }

    renderDashboard(result);
  } catch (error) {
    localStorage.removeItem('littleCreatorsToken');
    document.getElementById('loginPanel').classList.remove('hidden');
    document.getElementById('dashboardPanel').classList.add('hidden');
  }
};

const logoutAdmin = () => {
  localStorage.removeItem('littleCreatorsToken');
  document.getElementById('loginPanel').classList.remove('hidden');
  document.getElementById('dashboardPanel').classList.add('hidden');
};

document.addEventListener('DOMContentLoaded', () => {
  const enrollmentForm = document.getElementById('enrollmentForm');
  const contactForm = document.getElementById('contactForm');
  const adminForm = document.getElementById('adminLoginForm');
  const logoutBtn = document.getElementById('logoutBtn');
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (enrollmentForm) enrollmentForm.addEventListener('submit', handleEnrollmentSubmit);
  if (contactForm) contactForm.addEventListener('submit', handleContactSubmit);
  if (adminForm) adminForm.addEventListener('submit', adminLogin);
  if (logoutBtn) logoutBtn.addEventListener('click', logoutAdmin);

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
  }

  const courseButtons = document.querySelectorAll('.select-course-btn');
  courseButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const courseName = button.getAttribute('data-course');
      const programSelect = document.getElementById('program');
      if (programSelect && courseName) {
        programSelect.value = courseName;
        programSelect.focus();
      }
    });
  });

  if (adminForm) {
    const token = localStorage.getItem('littleCreatorsToken');
    if (token) {
      document.getElementById('loginPanel').classList.add('hidden');
      document.getElementById('dashboardPanel').classList.remove('hidden');
      loadDashboard();
    }
  }

  // WhatsApp Reply Modal event wiring
  const closeWaBtn = document.getElementById('closeWhatsAppModal');
  const cancelWaBtn = document.getElementById('waCancelBtn');
  const copyWaBtn = document.getElementById('waCopyBtn');
  const sendWaBtn = document.getElementById('waSendBtn');
  const waModal = document.getElementById('whatsappModal');
  const templateChips = document.getElementById('waTemplateChips');

  if (closeWaBtn) closeWaBtn.addEventListener('click', closeWhatsAppModal);
  if (cancelWaBtn) cancelWaBtn.addEventListener('click', closeWhatsAppModal);

  if (waModal) {
    waModal.addEventListener('click', (e) => {
      if (e.target === waModal) closeWhatsAppModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeWhatsAppModal();
  });

  if (templateChips) {
    templateChips.addEventListener('click', (e) => {
      const chip = e.target.closest('.chip');
      if (chip) {
        const key = chip.getAttribute('data-template');
        if (key) setWaTemplate(key);
      }
    });
  }

  if (copyWaBtn) {
    copyWaBtn.addEventListener('click', async () => {
      const textarea = document.getElementById('waMessageText');
      if (!textarea) return;
      try {
        await navigator.clipboard.writeText(textarea.value);
        const originalText = copyWaBtn.textContent;
        copyWaBtn.textContent = '✓ Copied!';
        copyWaBtn.style.color = '#15803d';
        setTimeout(() => {
          copyWaBtn.textContent = originalText;
          copyWaBtn.style.color = '';
        }, 1800);
      } catch (err) {
        textarea.select();
        document.execCommand('copy');
      }
    });
  }

  if (sendWaBtn) {
    sendWaBtn.addEventListener('click', () => {
      if (!currentWaTarget || !currentWaTarget.cleanPhone) {
        alert('This recipient does not have a valid phone number for WhatsApp.');
        return;
      }
      const textarea = document.getElementById('waMessageText');
      const text = textarea ? textarea.value : '';
      const url = `https://wa.me/${currentWaTarget.cleanPhone}?text=${encodeURIComponent(text)}`;
      window.open(url, '_blank', 'noopener,noreferrer');
      closeWhatsAppModal();
    });
  }

  // Admin Dashboard Tabs
  const adminTabs = document.querySelectorAll('.admin-tab');
  const sectionsContainer = document.getElementById('adminSectionsContainer');
  if (adminTabs.length && sectionsContainer) {
    adminTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const mode = tab.getAttribute('data-tab');
        adminTabs.forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');

        sectionsContainer.classList.remove('view-messages', 'view-enrollments', 'view-both');
        if (mode === 'messages') sectionsContainer.classList.add('view-messages');
        else if (mode === 'enrollments') sectionsContainer.classList.add('view-enrollments');
        else if (mode === 'both') sectionsContainer.classList.add('view-both');
      });
    });
  }

  // Admin Search Filters
  const contactSearch = document.getElementById('contactSearchInput');
  if (contactSearch) {
    contactSearch.addEventListener('input', (e) => filterAndRenderContacts(e.target.value));
  }
  const enrollmentSearch = document.getElementById('enrollmentSearchInput');
  if (enrollmentSearch) {
    enrollmentSearch.addEventListener('input', (e) => filterAndRenderEnrollments(e.target.value));
  }
});
