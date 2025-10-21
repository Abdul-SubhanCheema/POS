import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import UserDashboard from './components/UserDashboard';
import CashierDashboard from './components/CashierDashboard';
import theme from './theme';
import './App.css'

const AppContent = () => {
  const { isAuthenticated, user, login } = useAuth();

  if (!isAuthenticated) {
    return <Login onLogin={login} />;
  }

  // Render different dashboards based on user role
  if (user.role === 'admin') {
    return <AdminDashboard />;
  } else if (user.role === 'cashier') {
    return <CashierDashboard />;
  } else {
    return <UserDashboard />;
  }
};

function App() {
  return (
    <ChakraProvider theme={theme}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ChakraProvider>
  );
}

export default App
