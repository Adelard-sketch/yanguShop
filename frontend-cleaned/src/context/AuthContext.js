import React, { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/auth.service';
import { setAuthToken } from '../services/api';
import { CartContext } from './CartContext';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  });
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const cart = useContext(CartContext);

  useEffect(() => {
    if (token) setAuthToken(token);
  }, [token]);

  const login = async (creds) => {
    const res = await authService.login(creds);
    // If backend responded that a login code was sent, do not set token yet
    if (res && res.needCode) {
      return res;
    }
    setToken(res.token);
    setUser(res.user);
    localStorage.setItem('token', res.token);
    localStorage.setItem('user', JSON.stringify(res.user));
    setAuthToken(res.token);
    return res;
  };

  const verifyLogin = async (data) => {
    const res = await authService.verifyLogin(data);
    if (res && res.token) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));
      setAuthToken(res.token);
    }
    return res;
  };

  const register = async (data) => {
    const res = await authService.register(data);
    if (res && res.token) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));
      setAuthToken(res.token);
    }
    return res;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // remove persisted cart from localStorage
    try { localStorage.removeItem('cart'); } catch (e) { }
    setAuthToken(null);
    // clear cart when user logs out
    try { if (cart && typeof cart.clear === 'function') cart.clear(); } catch (e) { }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, verifyLogin, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}
