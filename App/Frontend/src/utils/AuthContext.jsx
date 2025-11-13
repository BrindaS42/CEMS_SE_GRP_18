import { createContext, useContext, useState } from 'react';
import PropTypes from 'prop-types';

const AuthContext = createContext(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user] = useState({
    username: 'john_doe',
    role: 'student',
    profile: {
      name: 'John Doe',
      profilePic: undefined,
    },
  });

  const logout = () => {
    console.log('User logged out');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        logout,
        isAuthenticated: true,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};