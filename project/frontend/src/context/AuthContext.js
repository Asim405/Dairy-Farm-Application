import React, { createContext, useEffect, useMemo, useReducer, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../services/apiClient';

export const AuthContext = createContext(null);

const initialState = {
  userToken: null,
  user: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'RESTORE':
      return { ...state, userToken: action.token, user: action.user };
    case 'SIGN_IN':
      return { ...state, userToken: action.token, user: action.user };
    case 'SIGN_OUT':
      return { ...state, userToken: null, user: null };
    default:
      return state;
  }
}

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const userJson = await AsyncStorage.getItem('userData');
        dispatch({ type: 'RESTORE', token: token || null, user: userJson ? JSON.parse(userJson) : null });
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const actions = useMemo(
    () => ({
      signIn: async (email, password) => {
        const { data } = await apiClient.post('/auth/login', { email, password });
        await AsyncStorage.setItem('userToken', data.token);
        await AsyncStorage.setItem('userData', JSON.stringify(data.user));
        dispatch({ type: 'SIGN_IN', token: data.token, user: data.user });
        return data;
      },
      signUp: async ({ fullName, email, phoneNumber, password }) => {
        const { data } = await apiClient.post('/auth/register', { fullName, email, phoneNumber, password });
        return data;
      },
      continueAsGuest: async () => {
        const { data } = await apiClient.post('/auth/guest');
        await AsyncStorage.setItem('userToken', data.token);
        await AsyncStorage.setItem('userData', JSON.stringify(data.user));
        dispatch({ type: 'SIGN_IN', token: data.token, user: data.user });
        return data;
      },
      signOut: async () => {
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('userData');
        dispatch({ type: 'SIGN_OUT' });
      },
    }),
    []
  );

  return (
    <AuthContext.Provider value={{ state, isLoading, ...actions }}>
      {children}
    </AuthContext.Provider>
  );
};
