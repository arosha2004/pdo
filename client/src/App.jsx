import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import EmployeeDashboard from './pages/employee/Dashboard';
import ManagerDashboard from './pages/manager/Dashboard';
import AdminDashboard from './pages/admin/Dashboard';
import IncidentForm from './pages/incidents/IncidentForm';
import PoliciesLibrary from './pages/policies/index';
import AUP from './pages/policies/AUP';
import PrivacyNotice from './pages/privacy/PrivacyNotice';
import TrainingLibrary from './pages/training/index';
import Lesson from './pages/training/Lesson';
import QuizAttempt from './pages/training/QuizAttempt';
import PolicyForm from './pages/policies/PolicyForm';
import Login from './pages/Login'; // Assuming it's moved or I'll recreate it here if not exist

import Notifications from './pages/notifications/index';
import UserManagement from './pages/admin/UserManagement';
import PlaceholderForm from './pages/admin/PlaceholderForm';

const App = () => {
  const [auth, setAuth] = useState(null);

  if (!auth) return <Login onLogin={(user, token) => setAuth({ user, token })} />;

  const { user, token } = auth;
  // Make token available globally for quick fetch if needed
  localStorage.setItem('token', token);

  const renderDashboard = () => {
    switch (user.appRole) {
      case 'admin': return <AdminDashboard user={user} token={token} />;
      case 'manager': return <ManagerDashboard user={user} token={token} />;
      default: return <EmployeeDashboard user={user} token={token} />;
    }
  };

  return (
    <Routes>
      <Route path="/" element={<AppLayout user={user} onLogout={() => setAuth(null)} />}>
        <Route index element={renderDashboard()} />
        <Route path="incidents/new" element={<IncidentForm token={token} />} />
        <Route path="policies" element={<PoliciesLibrary user={user} />} />
        <Route path="policies/new" element={<PolicyForm />} />
        <Route path="policies/aup" element={<AUP user={user} />} />
        <Route path="privacy" element={<PrivacyNotice user={user} />} />
        
        {/* Training & Quizzes */}
        <Route path="training" element={<TrainingLibrary user={user} />} />
        <Route path="training/lesson/:id" element={<Lesson user={user} />} />
        <Route path="training/quiz/:id/:versionId" element={<QuizAttempt />} />
        <Route path="training/lessons/new" element={<PlaceholderForm title="Lesson Authoring" />} />
        <Route path="training/quizzes/new" element={<PlaceholderForm title="Quiz Authoring" />} />
        
        {/* System & Management */}
        <Route path="notifications" element={<Notifications user={user} />} />
        <Route path="users" element={<UserManagement token={token} />} />
        <Route path="reports" element={<PlaceholderForm title="Compliance Reporting" />} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default App;
