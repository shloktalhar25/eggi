/* ==========================================================================
   AI Coworker Workflow Engine
   Handles:
   1. Step Grid Progression (Cards 1 through 6)
   2. Coworker Chat & Clarification (Prompt user for 9-digit phone fix)
   3. Continue in Browser trigger & live autofill in the right workspace
   ========================================================================== */

'use strict';

const workflowState = {
  activeStep: 2, // Step 1 is complete, Step 2 is ready
  completedSteps: [1],
  phoneClarified: false,
  isExecuting: false,
  candidateData: {
    name: 'Arjun Mehta',
    dob: '12/03/2002',
    phone: '987654321', // 9 digits initially
    email: 'arjun.mehta@gmail.com',
    course: 'B.Tech Computer Science',
    score: '94.2%',
    contractDates: 'Starts 10 Aug 2026, stops 10 Feb 2027',
    address: '42, Shivaji Nagar, Pune, Maharashtra 411005'
  }
};

// DOM Elements
const ui = {
  // Step Cards
  card1: document.getElementById('card-step-1'),
  card2: document.getElementById('card-step-2'),
  card3: document.getElementById('card-step-3'),
  card4: document.getElementById('card-step-4'),
  card5: document.getElementById('card-step-5'),
  card6: document.getElementById('card-step-6'),
  statusStep2: document.getElementById('status-text-step-2'),
  progressCounter: document.getElementById('progress-counter'),

  // Chat & Buttons
  btnContinueBrowser: document.getElementById('btn-continue-browser'),
  userBubbleText: document.getElementById('user-bubble-text'),
  agentBubbleText: document.getElementById('agent-bubble-text'),
  clarifyBox: document.getElementById('clarify-box'),
  manualPhoneInput: document.getElementById('manual-phone-input'),
  btnApplyClarify: document.getElementById('btn-apply-clarify'),
  chatUserInput: document.getElementById('chat-user-input'),
  btnSendChat: document.getElementById('btn-send-chat'),

  // Right Workspace
  workspaceCard: document.getElementById('workspace-card'),
  workspaceBadge: document.getElementById('workspace-badge'),
  workspaceStandbyView: document.getElementById('workspace-standby-view'),
  liveBrowserFrame: document.getElementById('live-browser-frame'),
  portalCursor: document.getElementById('portal-cursor'),
  btnPortalSubmit: document.getElementById('btn-portal-submit'),
  portalStatusNote: document.getElementById('portal-status-note'),

  // Form Fields
  pName: document.getElementById('p-name'),
  pDob: document.getElementById('p-dob'),
  pPhone: document.getElementById('p-phone'),
  pEmail: document.getElementById('p-email'),
  pCourse: document.getElementById('p-course'),
  pAddress: document.getElementById('p-address'),
  fgName: document.getElementById('f-group-name'),
  fgDob: document.getElementById('f-group-dob'),
  fgPhone: document.getElementById('f-group-phone'),
  fgEmail: document.getElementById('f-group-email'),
  fgCourse: document.getElementById('f-group-course'),
  fgAddress: document.getElementById('f-group-address'),
  tickName: document.getElementById('tick-name'),
  tickDob: document.getElementById('tick-dob'),
  tickPhone: document.getElementById('tick-phone'),
  tickEmail: document.getElementById('tick-email'),
  tickCourse: document.getElementById('tick-course'),
  tickAddress: document.getElementById('tick-address'),

  // Values Review
  revName: document.getElementById('rev-name'),
  revDob: document.getElementById('rev-dob'),
  revPhone: document.getElementById('rev-phone'),
  revEmail: document.getElementById('rev-email'),
  revCourse: document.getElementById('rev-course'),
  revScore: document.getElementById('rev-score'),
  revDates: document.getElementById('rev-dates'),
};

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper: update step card state
function setCardState(cardEl, iconWrap, statusTextEl, state, statusLabel) {
  cardEl.className = `step-card ${state}`;
  if (statusTextEl) statusTextEl.textContent = statusLabel;

  if (state === 'completed') {
    iconWrap.className = 'card-icon-wrap icon-complete';
    iconWrap.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    `;
    if (statusTextEl) statusTextEl.className = 'card-status status-complete';
  } else if (state === 'active') {
    iconWrap.className = 'card-icon-wrap icon-active';
    if (statusTextEl) statusTextEl.className = 'card-status status-ready';
  } else {
    iconWrap.className = 'card-icon-wrap icon-waiting';
    if (statusTextEl) statusTextEl.className = 'card-status status-waiting';
  }
}

// Typing simulator in portal
async function typeField(inputEl, groupEl, tickEl, text) {
  groupEl.classList.add('typing');

  // Reposition pointer
  const inputRect = inputEl.getBoundingClientRect();
  const parentRect = ui.liveBrowserFrame.getBoundingClientRect();
  const targetX = inputRect.left - parentRect.left + 24;
  const targetY = inputRect.top - parentRect.top + 14;

  ui.portalCursor.style.left = `${targetX}px`;
  ui.portalCursor.style.top = `${targetY}px`;

  inputEl.value = '';
  for (let i = 0; i < text.length; i++) {
    inputEl.value += text[i];
    await wait(24 + Math.random() * 20);
  }

  groupEl.classList.remove('typing');
  groupEl.classList.add('filled');
  tickEl.textContent = '✓';
  await wait(140);
}

// Step Selection handler
window.selectStep = function (stepNum) {
  // If user clicks Step 2, highlight clarification if not resolved
  if (stepNum === 2 && !workflowState.phoneClarified) {
    ui.clarifyBox.style.display = 'flex';
  }
};

// --------------------------------------------------------------------------
// CLARIFICATION (STEP 2: Phone missing digit prompt)
// --------------------------------------------------------------------------
ui.btnApplyClarify.addEventListener('click', () => {
  const correctedPhone = ui.manualPhoneInput.value.trim();
  workflowState.candidateData.phone = correctedPhone;
  workflowState.phoneClarified = true;

  // Update UI values
  ui.revPhone.textContent = `+91 ${correctedPhone}`;
  ui.userBubbleText.textContent = `Phone number confirmed: +91 ${correctedPhone}`;
  ui.agentBubbleText.innerHTML = `Great! I've validated the corrected phone number (<strong>+91 ${correctedPhone}</strong>). All fields are verified and ready for browser auto-filling.`;
  ui.clarifyBox.style.display = 'none';

  // Mark step 2 completed
  const iconWrap2 = ui.card2.querySelector('.card-icon-wrap');
  setCardState(ui.card2, iconWrap2, ui.statusStep2, 'completed', 'Complete');

  // Activate step 3
  const iconWrap3 = ui.card3.querySelector('.card-icon-wrap');
  const status3 = ui.card3.querySelector('.card-status');
  setCardState(ui.card3, iconWrap3, status3, 'active', 'Ready');

  ui.progressCounter.textContent = '2 of 6 complete';
});

// User Chat interaction
ui.btnSendChat.addEventListener('click', handleUserChat);
ui.chatUserInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') handleUserChat();
});

function handleUserChat() {
  const msg = ui.chatUserInput.value.trim();
  if (!msg) return;

  ui.userBubbleText.textContent = msg;
  ui.chatUserInput.value = '';

  // Smart response
  if (msg.toLowerCase().includes('end date') || msg.toLowerCase().includes('feb')) {
    ui.revDates.textContent = 'Starts 10 Aug 2026, stops 10 Feb 2027';
    ui.agentBubbleText.innerHTML = `I propose changing the contract stop date to <strong>10 Feb 2027</strong>. Please continue when you're ready for me to fill the portal with this date.`;
  } else if (msg.toLowerCase().includes('phone') || msg.match(/\d{9,10}/)) {
    const digits = msg.replace(/\D/g, '');
    if (digits.length >= 9) {
      ui.candidateData.phone = digits;
      ui.revPhone.textContent = `+91 ${digits}`;
      ui.agentBubbleText.innerHTML = `Updated candidate phone number to <strong>+91 ${digits}</strong>. Validation passed!`;
    }
  } else {
    ui.agentBubbleText.innerHTML = `Got it: "${msg}". I have updated the setup variables accordingly. Ready to continue in the browser.`;
  }
}

// --------------------------------------------------------------------------
// CONTINUE IN BROWSER AUTOMATION (Steps 3, 4, 5, 6)
// --------------------------------------------------------------------------
ui.btnContinueBrowser.addEventListener('click', async () => {
  if (workflowState.isExecuting) return;
  workflowState.isExecuting = true;

  ui.btnContinueBrowser.classList.add('running');
  ui.btnContinueBrowser.textContent = 'Autofilling in browser...';

  // Step 3: Set up new contract in browser
  const iconWrap3 = ui.card3.querySelector('.card-icon-wrap');
  const status3 = ui.card3.querySelector('.card-status');
  setCardState(ui.card3, iconWrap3, status3, 'active', 'Setting up...');

  // Show browser in right workspace
  ui.workspaceStandbyView.style.display = 'none';
  ui.liveBrowserFrame.style.display = 'flex';
  ui.workspaceBadge.textContent = 'Agent Active';
  ui.workspaceBadge.classList.add('active');
  await wait(700);

  setCardState(ui.card3, iconWrap3, status3, 'completed', 'Complete');
  ui.progressCounter.textContent = '3 of 6 complete';

  // Step 4: Autofill portal form
  const iconWrap4 = ui.card4.querySelector('.card-icon-wrap');
  const status4 = ui.card4.querySelector('.card-status');
  setCardState(ui.card4, iconWrap4, status4, 'active', 'Filling...');

  // 1. Name
  ui.portalStatusNote.textContent = 'Filling candidate name...';
  await typeField(ui.pName, ui.fgName, ui.tickName, workflowState.candidateData.name);

  // 2. DOB
  ui.portalStatusNote.textContent = 'Filling date of birth...';
  await typeField(ui.pDob, ui.fgDob, ui.tickDob, workflowState.candidateData.dob);

  // 3. Mobile
  ui.portalStatusNote.textContent = 'Filling validated phone number...';
  await typeField(ui.pPhone, ui.fgPhone, ui.tickPhone, workflowState.candidateData.phone);

  // 4. Email
  ui.portalStatusNote.textContent = 'Filling email address...';
  await typeField(ui.pEmail, ui.fgEmail, ui.tickEmail, workflowState.candidateData.email);

  // 5. Course
  ui.portalStatusNote.textContent = 'Filling program selection...';
  await typeField(ui.pCourse, ui.fgCourse, ui.tickCourse, workflowState.candidateData.course);

  // 6. Address
  ui.portalStatusNote.textContent = 'Filling permanent address...';
  await typeField(ui.pAddress, ui.fgAddress, ui.tickAddress, workflowState.candidateData.address);

  setCardState(ui.card4, iconWrap4, status4, 'completed', 'Complete');
  ui.progressCounter.textContent = '4 of 6 complete';

  // Step 5: Verify after form filling
  const iconWrap5 = ui.card5.querySelector('.card-icon-wrap');
  const status5 = ui.card5.querySelector('.card-status');
  setCardState(ui.card5, iconWrap5, status5, 'active', 'Verifying...');
  ui.portalStatusNote.textContent = 'Auditing filled inputs before saving...';
  await wait(700);

  setCardState(ui.card5, iconWrap5, status5, 'completed', 'Complete');
  ui.progressCounter.textContent = '5 of 6 complete';

  // Step 6: Save and complete
  const iconWrap6 = ui.card6.querySelector('.card-icon-wrap');
  const status6 = ui.card6.querySelector('.card-status');
  setCardState(ui.card6, iconWrap6, status6, 'active', 'Saving...');

  ui.btnPortalSubmit.classList.add('submitted');
  ui.btnPortalSubmit.textContent = '✓ Contract Attached and Saved';
  ui.portalStatusNote.textContent = 'Verified reference: #MU-LCW-2026-9481';
  ui.portalStatusNote.style.color = '#059669';
  ui.portalStatusNote.style.fontWeight = '600';
  await wait(600);

  setCardState(ui.card6, iconWrap6, status6, 'completed', 'Complete');
  ui.progressCounter.textContent = '6 of 6 complete';

  // Wrap up
  ui.btnContinueBrowser.classList.remove('running');
  ui.btnContinueBrowser.textContent = '✓ Completed in browser';
  ui.btnContinueBrowser.style.backgroundColor = '#059669';
  ui.workspaceBadge.textContent = 'Complete';
  ui.agentBubbleText.innerHTML = `All 6 steps are complete! The contract has been attached to <strong>${workflowState.candidateData.name}</strong> and saved in the portal.`;
  workflowState.isExecuting = false;
});
