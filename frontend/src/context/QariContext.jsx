/**
 * context/QariContext.jsx — Global Qari (reciter) selection
 * Provides reciter state persisted in localStorage
 */

import React, { createContext, useContext, useState } from 'react';

const QariContext = createContext();

export const useQari = () => useContext(QariContext);

// Photos are self-hosted in public/reciters/ (160×160, served from Vercel’s CDN)
// so they load reliably instead of depending on third-party sites.
export const RECITERS = [
  {
    id: 'abdulsamad',
    name: 'Abdul Samad',
    nameAr: 'عبد الصمد',
    image: '/reciters/abdulsamad.jpg'
  },
  {
    id: 'sudais',
    name: 'Abdul Rahman Al-Sudais',
    image: '/reciters/sudais.jpg'
  },
  {
    id: 'ghamidi',
    name: 'Saad Al-Ghamdi',
    image: '/reciters/ghamidi.jpg'
  },
  {
    id: 'yasser',
    name: 'Yasser Al-Dosari',
    nameAr: 'ياسر الدوسري',
    image: '/reciters/yasser.jpg'
  },
  {
    id: 'alafasy',
    name: 'Mishary Al-Afasy',
    nameAr: 'مشاري العفاسي',
    image: '/reciters/alafasy.jpg'
  },
];

export const QariProvider = ({ children }) => {
  const [reciter, setReciter] = useState(() => {
    return localStorage.getItem('selectedReciter') || 'alafasy';
  });

  const changeReciter = (id) => {
    setReciter(id);
    localStorage.setItem('selectedReciter', id);
  };

  const selectedReciter = RECITERS.find(r => r.id === reciter) || RECITERS[0];

  return (
    <QariContext.Provider value={{ reciter, changeReciter, reciters: RECITERS, selectedReciter }}>
      {children}
    </QariContext.Provider>
  );
};
