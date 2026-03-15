/**
 * context/QariContext.jsx — Global Qari (reciter) selection
 * Provides reciter state persisted in localStorage
 */

import React, { createContext, useContext, useState } from 'react';

const QariContext = createContext();

export const useQari = () => useContext(QariContext);

export const RECITERS = [
  { id: 'abdulsamad', name: 'Abdul Samad', nameAr: 'عبد الصمد' },
  { id: 'alafasy', name: 'Mishary Al-Afasy', nameAr: 'مشاري العفاسي' },
];

export const QariProvider = ({ children }) => {
  const [reciter, setReciter] = useState(() => {
    return localStorage.getItem('selectedReciter') || 'abdulsamad';
  });

  const changeReciter = (id) => {
    setReciter(id);
    localStorage.setItem('selectedReciter', id);
  };

  return (
    <QariContext.Provider value={{ reciter, changeReciter, reciters: RECITERS }}>
      {children}
    </QariContext.Provider>
  );
};
