import React, { createContext, useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../services/apiClient';

export const AuthContext = createContext(null);

const DEFAULT_SETTINGS = {
  notifications_enabled: true,
  dark_mode: false,
  language: 'English',
};

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
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

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

  const refreshSettings = useCallback(async () => {
    if (!state.userToken) {
      setSettings(DEFAULT_SETTINGS);
      return;
    }

    try {
      const { data } = await apiClient.get('/settings');
      setSettings(data || DEFAULT_SETTINGS);
    } catch (error) {
      console.log('Error loading settings', error);
      setSettings(DEFAULT_SETTINGS);
    }
  }, [state.userToken]);

  useEffect(() => {
    refreshSettings();
  }, [refreshSettings]);

  const updateSettings = useCallback(async (patch = {}) => {
    const currentSettings = settings || DEFAULT_SETTINGS;
    const nextSettings = { ...currentSettings, ...patch };

    setSettings(nextSettings);

    try {
      await apiClient.put('/settings', {
        notificationsEnabled: patch.notifications_enabled !== undefined ? patch.notifications_enabled : currentSettings.notifications_enabled,
        darkMode: patch.dark_mode !== undefined ? patch.dark_mode : currentSettings.dark_mode,
        language: patch.language !== undefined ? patch.language : currentSettings.language,
      });
    } catch (error) {
      console.log('Error updating settings', error);
      setSettings(currentSettings);
    }
  }, [settings]);

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
        try {
          const { data } = await apiClient.post('/auth/guest');
          await AsyncStorage.setItem('userToken', data.token);
          await AsyncStorage.setItem('userData', JSON.stringify(data.user));
          dispatch({ type: 'SIGN_IN', token: data.token, user: data.user });
          return data;
        } catch (error) {
          console.error('Guest session error:', error);
          throw error;
        }
      },
      signOut: async () => {
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('userData');
        setSettings(DEFAULT_SETTINGS);
        dispatch({ type: 'SIGN_OUT' });
      },
    }),
    []
  );

  return (
    <AuthContext.Provider value={{ state, isLoading, settings, isDarkMode: !!settings.dark_mode, updateSettings, refreshSettings, ...actions }}>
      {children}
    </AuthContext.Provider>
  );
};
