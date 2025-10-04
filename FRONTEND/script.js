// Application State
let appState = {
    currentView: 'welcome',
    currentStep: 1,
    registeredCompanies: {}, // Store registered companies
    currentUser: null,
    formData: {
        adminName: '',
        companyName: '',
        country: '',
        currency: '',
        email: '',
        password: '',
        roles: [],
        approvalFlow: [],
        approvalRule: 'sequential'
    }
};

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    loadCountries();
    loadStoredData();
});

// Load countries from API
function loadCountries() {
    const popularCountries = [
        { name: 'United States', currency: 'USD' },
        { name: 'United Kingdom', currency: 'GBP' },
        { name: 'India', currency: 'INR' },
        { name: 'Canada', currency: 'CAD' },
        { name: 'Australia', currency: 'AUD' },
        { name: 'Germany', currency: 'EUR' },
        { name: 'France', currency: 'EUR' },
        { name: 'Japan', currency: 'JPY' },
        { name: 'China', currency: 'CNY' },
        { name: 'Singapore', currency: 'SGD' }
    ];

    const countrySelect = document.getElementById('country');
    
    // Add popular countries first
    popularCountries.forEach(country => {
        const option = document.createElement('option');
        option.value = country.name;
        option.textContent = `${country.name} (${country.currency})`;
        option.dataset.currency = country.currency;
        countrySelect.appendChild(option);
    });

    // Fetch all countries
    fetch('https://restcountries.com/v3.1/all?fields=name,currencies')
        .then(res => res.json())
        .then(data => {
            countrySelect.innerHTML = '<option value="">Select your country</option>';
            
            const countryList = data.map(c => ({
                name: c.name.common,
                currency: Object.keys(c.currencies || {})[0] || 'USD'
            })).sort((a, b) => a.name.localeCompare(b.name));

            countryList.forEach(country => {
                const option = document.createElement('option');
                option.value = country.name;
                option.textContent = `${country.name} (${country.currency})`;
                option.dataset.currency = country.currency;
                countrySelect.appendChild(option);
            });
        })
        .catch(err => {
            console.error('Failed to fetch countries:', err);
        });
}

// Load data from memory (simulating persistence)
function loadStoredData() {
    const stored = sessionStorage.getItem('expenseFlowData');
    if (stored) {
        const data = JSON.parse(stored);
        appState.registeredCompanies = data.registeredCompanies || {};
        appState.currentUser = data.currentUser || null;
        
        if (appState.currentUser) {
            showDashboardForUser();
        }
    }
}

// Save data to memory
function saveData() {
    sessionStorage.setItem('expenseFlowData', JSON.stringify({
        registeredCompanies: appState.registeredCompanies,
        currentUser: appState.currentUser
    }));
}

// View Navigation
function showView(viewId) {
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });
    document.getElementById(viewId).classList.add('active');
    appState.currentView = viewId;
    
    // Show logout button if logged in
    const logoutBtn = document.getElementById('logoutBtn');
    if (appState.currentUser && viewId !== 'welcome') {
        logoutBtn.classList.remove('hidden');
    } else {
        logoutBtn.classList.add('hidden');
    }
}

function showWelcome() {
    showView('welcomeView');
    resetForm();
}

function showLogin() {
    showView('loginView');
    populateLoginRoles();
}

function showRegister() {
    showView('registerView');
    appState.currentStep = 1;
    updateStepDisplay();
}

function showDashboard() {
    showView('dashboardView');
    updateDashboardInfo();
}

function showDashboardForUser() {
    showView('dashboardView');
    const company = appState.registeredCompanies[appState.currentUser.companyName];
    if (company) {
        document.getElementById('dashboardCompanyName').textContent = company.companyName;
        const detailsDiv = document.getElementById('dashboardDetails');
        detailsDiv.innerHTML = `
            <div class="dashboard-details">
                <div class="detail-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    <span>Role: ${appState.currentUser.role}</span>
                </div>
                <div class="detail-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    <span>User: ${appState.currentUser.email}</span>
                </div>
                <div class="detail-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    <span>Currency: ${company.currency}</span>
                </div>
            </div>
        `;
    }
}

// Logout
function handleLogout() {
    appState.currentUser = null;
    saveData();
    showWelcome();
}

document.getElementById('logoutBtn').addEventListener('click', handleLogout);

// Login
function populateLoginRoles() {
    const roleSelect = document.getElementById('loginRole');
    roleSelect.innerHTML = '<option value="">Select your role...</option>';
    
    // Get unique roles from all registered companies
    const allRoles = new Set();
    Object.values(appState.registeredCompanies).forEach(company => {
        company.roles.forEach(role => allRoles.add(role));
    });
    
    allRoles.forEach(role => {
        const option = document.createElement('option');
        option.value = role;
        option.textContent = role;
        roleSelect.appendChild(option);
    });
}

function handleLogin(event) {
    event.preventDefault();
    
    const companyName = document.getElementById('loginCompanyName').value.trim();
    const role = document.getElementById('loginRole').value;
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    const company = appState.registeredCompanies[companyName];
    
    if (!company) {
        showMessage('Company not found. Please register first.');
        return;
    }
    
    // Simple authentication (in real app, this would be server-side)
    if (company.email === email && company.password === password && company.roles.includes(role)) {
        appState.currentUser = {
            companyName: companyName,
            email: email,
            role: role,
            isAdmin: role === 'Admin' || email === company.email
        };
        saveData();
        showDashboardForUser();
    } else {
        showMessage('Invalid credentials or role not found.');
    }
}

// Registration
function handleCountryChange() {
    const countrySelect = document.getElementById('country');
    const selectedOption = countrySelect.options[countrySelect.selectedIndex];
    const currency = selectedOption.dataset.currency;
    
    if (currency) {
        document.getElementById('selectedCurrency').textContent = currency;
        document.getElementById('currencyDisplay').classList.remove('hidden');
        appState.formData.country = countrySelect.value;
        appState.formData.currency = currency;
    }
}

function handleRegisterBack() {
    if (appState.currentStep === 1) {
        showWelcome();
    } else {
        appState.currentStep--;
        updateStepDisplay();
    }
}

function updateStepDisplay() {
    // Update step indicators
    document.querySelectorAll('.step-item').forEach((item, index) => {
        const stepNum = index + 1;
        item.classList.remove('active', 'completed');
        
        if (stepNum < appState.currentStep) {
            item.classList.add('completed');
        } else if (stepNum === appState.currentStep) {
            item.classList.add('active');
        }
    });
    
    // Update step lines
    document.querySelectorAll('.step-line').forEach((line, index) => {
        if (index < appState.currentStep - 1) {
            line.classList.add('completed');
        } else {
            line.classList.remove('completed');
        }
    });
    
    // Show correct step content
    document.querySelectorAll('.step-content').forEach((content, index) => {
        if (index + 1 === appState.currentStep) {
            content.classList.add('active');
        } else {
            content.classList.remove('active');
        }
    });
    
    // Update next button
    const nextBtn = document.getElementById('nextBtn');
    const nextBtnText = document.getElementById('nextBtnText');
    
    if (appState.currentStep === 3) {
        nextBtnText.textContent = 'Complete Setup';
    } else {
        nextBtnText.textContent = 'Next';
    }
    
    updateNextButtonState();
}

function canProceed() {
    if (appState.currentStep === 1) {
        const adminName = document.getElementById('adminName').value.trim();
        const companyName = document.getElementById('companyName').value.trim();
        const country = document.getElementById('country').value;
        const email = document.getElementById('adminEmail').value.trim();
        const password = document.getElementById('adminPassword').value;
        
        return adminName && companyName && country && email && password;
    }
    
    if (appState.currentStep === 2) {
        return appState.formData.roles.length >= 2;
    }
    
    if (appState.currentStep === 3) {
        return appState.formData.approvalFlow.length >= 1;
    }
    
    return false;
}

function updateNextButtonState() {
    const nextBtn = document.getElementById('nextBtn');
    nextBtn.disabled = !canProceed();
}

function handleNext() {
    if (!canProceed()) return;
    
    if (appState.currentStep === 1) {
        // Save step 1 data
        appState.formData.adminName = document.getElementById('adminName').value.trim();
        appState.formData.companyName = document.getElementById('companyName').value.trim();
        appState.formData.email = document.getElementById('adminEmail').value.trim();
        appState.formData.password = document.getElementById('adminPassword').value;
        
        // Check if company already registered
        if (appState.registeredCompanies[appState.formData.companyName]) {
            showMessage('Company already registered.');
            return;
        }
        
        appState.currentStep++;
        updateStepDisplay();
    } else if (appState.currentStep === 2) {
        appState.currentStep++;
        updateStepDisplay();
        updateApprovalRoleSelect();
    } else if (appState.currentStep === 3) {
        // Save approval rule
        const selectedRule = document.querySelector('input[name="approvalRule"]:checked');
        appState.formData.approvalRule = selectedRule ? selectedRule.value : 'sequential';
        
        // Register company
        appState.registeredCompanies[appState.formData.companyName] = {
            ...appState.formData,
            registeredAt: new Date().toISOString()
        };
        
        // Set current user as admin
        appState.currentUser = {
            companyName: appState.formData.companyName,
            email: appState.formData.email,
            role: 'Admin',
            isAdmin: true
        };
        
        saveData();
        showDashboard();
    }
}

// Add input listeners for step 1
document.getElementById('adminName').addEventListener('input', updateNextButtonState);
document.getElementById('companyName').addEventListener('input', updateNextButtonState);
document.getElementById('country').addEventListener('change', updateNextButtonState);
document.getElementById('adminEmail').addEventListener('input', updateNextButtonState);
document.getElementById('adminPassword').addEventListener('input', updateNextButtonState);

// Roles Management
function handleAddRole() {
    const roleSelect = document.getElementById('roleSelect');
    const roleName = roleSelect.value;
    
    if (roleName && !appState.formData.roles.includes(roleName)) {
        appState.formData.roles.push(roleName);
        updateRolesList();
        updateNextButtonState();
    }
    
    roleSelect.value = '';
}

function removeRole(roleName) {
    appState.formData.roles = appState.formData.roles.filter(r => r !== roleName);
    updateRolesList();
    updateNextButtonState();
}

function updateRolesList() {
    const rolesList = document.getElementById('rolesList');
    
    if (appState.formData.roles.length === 0) {
        rolesList.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                <p>No roles added yet</p>
            </div>
        `;
    } else {
        rolesList.innerHTML = appState.formData.roles.map(role => `
            <div class="role-item">
                <div class="role-content">
                    <div class="role-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                            <circle cx="9" cy="7" r="4"/>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                        </svg>
                    </div>
                    <span class="role-name">${role}</span>
                </div>
                <div class="role-actions">
                    <button class="icon-btn delete" onclick="removeRole('${role}')">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                    </button>
                </div>
            </div>
        `).join('');
    }
}

// Approval Flow Management
function updateApprovalRoleSelect() {
    const approvalRoleSelect = document.getElementById('approvalRoleSelect');
    approvalRoleSelect.innerHTML = '<option value="">Select role for approval step...</option>';
    
    appState.formData.roles.forEach(role => {
        const option = document.createElement('option');
        option.value = role;
        option.textContent = role;
        approvalRoleSelect.appendChild(option);
    });
}

function handleAddApprovalStep() {
    const approvalRoleSelect = document.getElementById('approvalRoleSelect');
    const roleName = approvalRoleSelect.value;
    
    if (roleName && appState.formData.roles.includes(roleName)) {
        appState.formData.approvalFlow.push({
            role: roleName,
            order: appState.formData.approvalFlow.length + 1
        });
        updateApprovalFlowList();
        updateNextButtonState();
    }
    
    approvalRoleSelect.value = '';
}

function removeApprovalStep(index) {
    appState.formData.approvalFlow.splice(index, 1);
    // Reorder
    appState.formData.approvalFlow = appState.formData.approvalFlow.map((step, i) => ({
        ...step,
        order: i + 1
    }));
    updateApprovalFlowList();
    updateNextButtonState();
}

function moveApprovalStep(index, direction) {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex >= 0 && newIndex < appState.formData.approvalFlow.length) {
        const temp = appState.formData.approvalFlow[index];
        appState.formData.approvalFlow[index] = appState.formData.approvalFlow[newIndex];
        appState.formData.approvalFlow[newIndex] = temp;
        
        // Reorder
        appState.formData.approvalFlow = appState.formData.approvalFlow.map((step, i) => ({
            ...step,
            order: i + 1
        }));
        
        updateApprovalFlowList();
    }
}

function updateApprovalFlowList() {
    const approvalFlowList = document.getElementById('approvalFlowList');
    
    if (appState.formData.approvalFlow.length === 0) {
        approvalFlowList.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M6 3v12"/>
                    <circle cx="18" cy="6" r="3"/>
                    <circle cx="6" cy="18" r="3"/>
                    <path d="M18 9a9 9 0 0 1-9 9"/>
                </svg>
                <p>No approval steps defined yet</p>
            </div>
        `;
    } else {
        approvalFlowList.innerHTML = appState.formData.approvalFlow.map((step, index) => `
            <div class="approval-item">
                <div class="approval-content">
                    <div class="approval-order">${step.order}</div>
                    <span class="role-name">${step.role}</span>
                </div>
                <div class="approval-actions">
                    <button class="icon-btn move" onclick="moveApprovalStep(${index}, 'up')" ${index === 0 ? 'disabled' : ''}>
                        ↑
                    </button>
                    <button class="icon-btn move" onclick="moveApprovalStep(${index}, 'down')" ${index === appState.formData.approvalFlow.length - 1 ? 'disabled' : ''}>
                        ↓
                    </button>
                    <button class="icon-btn delete" onclick="removeApprovalStep(${index})">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                    </button>
                </div>
            </div>
        `).join('');
    }
}

// Dashboard
function updateDashboardInfo() {
    document.getElementById('dashboardCompanyName').textContent = appState.formData.companyName;
    
    const detailsDiv = document.getElementById('dashboardDetails');
    detailsDiv.innerHTML = `
        <div class="dashboard-details">
            <div class="detail-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"/>
                </svg>
                <span>Admin: ${appState.formData.adminName}</span>
            </div>
            <div class="detail-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"/>
                </svg>
                <span>Currency: ${appState.formData.currency}</span>
            </div>
            <div class="detail-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"/>
                </svg>
                <span>Roles: ${appState.formData.roles.length} configured</span>
            </div>
            <div class="detail-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"/>
                </svg>
                <span>Approval Flow: ${appState.formData.approvalFlow.length} steps</span>
            </div>
        </div>
    `;
}

function goToDashboard() {
    // This would navigate to the actual dashboard in a real app
    showMessage('Dashboard functionality will be implemented next!');
}

// Modal
function showMessage(message) {
    document.getElementById('modalMessage').textContent = message;
    document.getElementById('messageModal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('messageModal').classList.add('hidden');
}

// Reset form
function resetForm() {
    appState.currentStep = 1;
    appState.formData = {
        adminName: '',
        companyName: '',
        country: '',
        currency: '',
        email: '',
        password: '',
        roles: [],
        approvalFlow: [],
        approvalRule: 'sequential'
    };
    
    // Clear form inputs
    document.querySelectorAll('input, select').forEach(input => {
        if (input.type === 'radio') {
            input.checked = input.value === 'sequential';
        } else {
            input.value = '';
        }
    });
    
    document.getElementById('currencyDisplay').classList.add('hidden');
    updateRolesList();
    updateApprovalFlowList();
    updateStepDisplay();
}
