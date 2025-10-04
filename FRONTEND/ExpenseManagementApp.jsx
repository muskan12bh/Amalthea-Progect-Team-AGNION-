import React, { useState, useEffect } from 'react';
import { ChevronRight, Building2, Users, GitBranch, Check, Plus, Trash2, ArrowLeft, LogOut, X } from 'lucide-react';

// Mock database to simulate real-world data storage
const mockDatabase = {
  companies: [],
  users: [],
};

export default function ExpenseManagementApp() {
  const [currentView, setCurrentView] = useState('welcome');
  const [registrationStep, setRegistrationStep] = useState(1);
  const [countries, setCountries] = useState([]);
  const [loggedInUser, setLoggedInUser] = useState(null); // Tracks logged-in user details
  const [loginError, setLoginError] = useState('');
  const [registrationError, setRegistrationError] = useState('');

  const [formData, setFormData] = useState({
    adminName: '',
    companyName: '',
    country: '',
    currency: '',
    email: '',
    password: '',
    roles: [],
    approvalFlow: [],
    approvalRule: 'sequential'
  });

  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
    role: '',
    companyName: '',
  });

  // This effect simulates checking for a logged-in user from a browser session
  useEffect(() => {
    const savedUser = sessionStorage.getItem('loggedInUser');
    if (savedUser) {
      setLoggedInUser(JSON.parse(savedUser));
      setCurrentView('dashboard');
    }
  }, []);

  const handleLogout = () => {
    setLoggedInUser(null);
    sessionStorage.removeItem('loggedInUser');
    setCurrentView('welcome');
    setRegistrationStep(1);
    // Reset all form data
    setFormData({
      adminName: '', companyName: '', country: '', currency: '',
      email: '', password: '', roles: [], approvalFlow: [],
      approvalRule: 'sequential'
    });
    setLoginData({ email: '', password: '', role: '', companyName: '' });
  };
  
  const handleExit = () => {
    setCurrentView('welcome');
    setRegistrationStep(1);
  };

  // Fetch country data on initial load
  useEffect(() => {
    const popularCountries = [
      { name: 'United States', currency: 'USD' },
      { name: 'United Kingdom', currency: 'GBP' },
      { name: 'India', currency: 'INR' },
      // ... (other popular countries)
    ];

    fetch('https://restcountries.com/v3.1/all?fields=name,currencies')
      .then(res => res.json())
      .then(data => {
        const countryList = data.map(c => ({
          name: c.name.common,
          currency: Object.keys(c.currencies || {})[0] || 'USD'
        })).sort((a, b) => a.name.localeCompare(b.name));
        setCountries(countryList);
      })
      .catch(err => {
        console.error('Failed to fetch countries:', err);
        setCountries(popularCountries);
      });
  }, []);

  const handleCountryChange = (countryName) => {
    const selected = countries.find(c => c.name === countryName);
    if (selected) {
      setFormData({ ...formData, country: countryName, currency: selected.currency });
    }
  };

  const addRole = (roleName) => {
    if (roleName && !formData.roles.includes(roleName)) {
      setFormData({ ...formData, roles: [...formData.roles, roleName] });
    }
  };

  const removeRole = (roleName) => {
    setFormData({ ...formData, roles: formData.roles.filter(r => r !== roleName) });
  };
  
  const addApprovalStep = (role) => {
    if (role && formData.roles.includes(role)) {
      setFormData({ ...formData, approvalFlow: [...formData.approvalFlow, { role, order: formData.approvalFlow.length + 1 }] });
    }
  };
  
  const removeApprovalStep = (index) => {
    const newFlow = formData.approvalFlow.filter((_, i) => i !== index);
    const reordered = newFlow.map((step, i) => ({ ...step, order: i + 1 }));
    setFormData({ ...formData, approvalFlow: reordered });
  };
  
  const moveApprovalStep = (index, direction) => {
    const newFlow = [...formData.approvalFlow];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex >= 0 && newIndex < newFlow.length) {
      [newFlow[index], newFlow[newIndex]] = [newFlow[newIndex], newFlow[index]];
      const reordered = newFlow.map((step, i) => ({ ...step, order: i + 1 }));
      setFormData({ ...formData, approvalFlow: reordered });
    }
  };

  const handleRegistrationSubmit = () => {
    setRegistrationError('');
    // Check if company is already registered
    const existingCompany = mockDatabase.companies.find(
      c => c.name.toLowerCase() === formData.companyName.toLowerCase()
    );

    if (existingCompany) {
      setRegistrationError('Company with this name is already registered.');
      return;
    }

    // Save company and admin user to mock database
    const newCompany = {
      name: formData.companyName,
      currency: formData.currency,
      roles: formData.roles,
      approvalFlow: formData.approvalFlow,
      approvalRule: formData.approvalRule,
    };
    mockDatabase.companies.push(newCompany);

    const adminUser = {
      name: formData.adminName,
      email: formData.email,
      password: formData.password,
      role: 'Admin',
      companyName: formData.companyName,
    };
    mockDatabase.users.push(adminUser);
    
    console.log('Updated Mock Database:', mockDatabase);
    setCurrentView('setupComplete');
  };
  
  const handleLoginSubmit = () => {
    setLoginError('');
    
    // In a real app, you would find the user in the database.
    // Here we simulate it with the admin user created during registration.
    const user = mockDatabase.users.find(u => 
        u.email.toLowerCase() === loginData.email.toLowerCase() &&
        u.password === loginData.password &&
        u.role === loginData.role &&
        u.companyName.toLowerCase() === loginData.companyName.toLowerCase()
    );

    if (user) {
      const userToSave = { name: user.name, role: user.role, companyName: user.companyName };
      setLoggedInUser(userToSave);
      sessionStorage.setItem('loggedInUser', JSON.stringify(userToSave));
      setCurrentView('dashboard');
    } else {
      setLoginError('Invalid credentials or role. Please try again.');
    }
  };

  // A global header component for consistent UI
  const GlobalHeader = () => (
    <div className="absolute top-0 left-0 right-0 p-4 flex justify-end items-center">
      {currentView !== 'welcome' && (
        <button
          onClick={handleExit}
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mr-6"
        >
          <X className="w-5 h-5 mr-1" /> Exit
        </button>
      )}
      {loggedInUser && (
        <button
          onClick={handleLogout}
          className="flex items-center bg-red-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-600 transition-colors shadow"
        >
          <LogOut className="w-5 h-5 mr-2" /> Logout
        </button>
      )}
    </div>
  );

  // --- RENDER VIEWS ---
  if (currentView === 'welcome') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mb-6 shadow-lg">
              <Building2 className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-4">ExpenseFlow</h1>
            <p className="text-xl text-gray-600">Streamline your expense management</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <button
              onClick={() => setCurrentView('login')}
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-blue-500 group"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Login</h3>
              <p className="text-gray-600">Access your existing account</p>
            </button>
            <button
              onClick={() => setCurrentView('register')}
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-blue-500 group"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Register Company</h3>
              <p className="text-gray-600">Set up new expense management</p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'login') {
    const company = mockDatabase.companies.find(c => c.name.toLowerCase() === loginData.companyName.toLowerCase());
    const availableRoles = company ? company.roles : [];

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <GlobalHeader />
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
              <p className="text-gray-600 mt-2">Sign in to your account</p>
            </div>

            {loginError && <p className="text-red-500 text-center mb-4">{loginError}</p>}
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Company Name</label>
                <input
                  type="text"
                  placeholder="Your company's name"
                  value={loginData.companyName}
                  onChange={(e) => setLoginData({ ...loginData, companyName: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Your Role</label>
                <select
                  value={loginData.role}
                  onChange={(e) => setLoginData({ ...loginData, role: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl"
                  disabled={!company}
                >
                  <option value="">Select your role</option>
                  {availableRoles.map(role => <option key={role} value={role}>{role}</option>)}
                   {/* Add Admin as a default role option */}
                  <option value="Admin">Admin</option>
                </select>
                {!company && loginData.companyName && <p className="text-xs text-red-500 mt-1">Company not found.</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  placeholder="you@company.com"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl"
                />
              </div>

              <button
                type="button"
                onClick={handleLoginSubmit}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'register') {
    const steps = [
      { number: 1, title: 'Basic Info', icon: Building2 },
      { number: 2, title: 'Set Roles', icon: Users },
      { number: 3, title: 'Approval Flow', icon: GitBranch }
    ];

    const canProceed = () => {
      if (registrationStep === 1) return formData.adminName && formData.companyName && formData.country && formData.email && formData.password;
      if (registrationStep === 2) return formData.roles.length >= 2;
      if (registrationStep === 3) return formData.approvalFlow.length >= 1;
      return false;
    };
    
    const handleNext = () => {
      if (registrationStep < 3) {
        setRegistrationStep(registrationStep + 1);
      } else {
        handleRegistrationSubmit();
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
        <GlobalHeader />
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Register Your Company</h2>
            </div>
            
            {/* Steps Visualizer */}
            <div className="flex items-center justify-between mb-10">
              {/* ... step visualization code remains the same */}
            </div>

            {registrationError && <p className="text-red-500 text-center mb-4">{registrationError}</p>}
            
            <div className="mb-8">
              {registrationStep === 1 && (
                <div className="space-y-6">
                  {/* ... Step 1 form fields remain the same */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Company Name</label>
                    <input type="text" placeholder="Acme Corporation" value={formData.companyName} onChange={(e) => setFormData({ ...formData, companyName: e.target.value })} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl" />
                  </div>
                  {/* other fields */}
                </div>
              )}
              {registrationStep === 2 && (
                <div className="space-y-6">
                  {/* ... Step 2 form fields remain the same */}
                </div>
              )}
              {registrationStep === 3 && (
                <div className="space-y-6">
                  {/* ... Step 3 form fields remain the same */}
                </div>
              )}
            </div>
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold disabled:opacity-50"
            >
              {registrationStep === 3 ? 'Complete Setup' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  if (currentView === 'setupComplete') {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <GlobalHeader />
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Setup Complete!</h1>
            <p className="text-xl text-gray-600 mb-8">
              <span className="font-semibold text-blue-600">{formData.companyName}</span> is ready to go.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                    // Log in the admin automatically after registration
                    const adminUser = { name: formData.adminName, role: 'Admin', companyName: formData.companyName };
                    setLoggedInUser(adminUser);
                    sessionStorage.setItem('loggedInUser', JSON.stringify(adminUser));
                    setCurrentView('dashboard');
                }}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-xl font-semibold"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'dashboard') {
    // This is a placeholder dashboard. You would build different UIs based on loggedInUser.role
    const DashboardUI = () => {
        if (!loggedInUser) return <p>Loading...</p>;

        return (
            <div>
                <h1 className="text-3xl font-bold">Welcome, {loggedInUser.name}!</h1>
                <p className="text-lg text-gray-600">Your Role: <span className="font-semibold text-blue-600">{loggedInUser.role}</span></p>
                <p className="text-lg text-gray-600">Company: <span className="font-semibold text-blue-600">{loggedInUser.companyName}</span></p>
                <div className="mt-8 p-6 bg-gray-100 rounded-lg">
                  <h2 className="text-xl font-bold mb-4">Your Dashboard</h2>
                  {loggedInUser.role === 'Admin' && <p>Here you can manage users, view analytics, and configure settings.</p>}
                  {loggedInUser.role === 'Manager' && <p>Here you can approve expenses and view your team's spending.</p>}
                  {loggedInUser.role === 'Employee' && <p>Here you can submit new expenses and view your history.</p>}
                </div>
            </div>
        );
    };

    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <GlobalHeader />
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <DashboardUI />
          </div>
        </div>
      </div>
    );
  }

  return null; // Fallback
}
