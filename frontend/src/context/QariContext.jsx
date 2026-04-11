/**
 * context/QariContext.jsx — Global Qari (reciter) selection
 * Provides reciter state persisted in localStorage
 */

import React, { createContext, useContext, useState } from 'react';

const QariContext = createContext();

export const useQari = () => useContext(QariContext);

export const RECITERS = [
  {
    id: 'abdulsamad',
    name: 'Abdul Samad',
    nameAr: 'عبد الصمد',
    image: 'https://upload.wikimedia.org/wikipedia/commons/7/75/%D8%B9%D8%A8%D8%AF%D8%A7%D9%84%D8%A8%D8%A7%D8%B3%D8%B7_%D8%B9%D8%A8%D8%AF_%D8%A7%D9%84%D8%B5%D9%85%D8%AF_%D8%B1%D8%AD%D9%85%D9%87_%D8%A7%D9%84%D9%84%D9%87.jpg'
  },
  {
    id: 'alafasy',
    name: 'Mishary Al-Afasy',
    nameAr: 'مشاري العفاسي',
    image: 'https://cdn.alfaqr.com/images/reciters/mishary-rashid-alafasy-profile.jpeg'
  },
];

export const QariProvider = ({ children }) => {
  const [reciter, setReciter] = useState(() => {
    return localStorage.getItem('selectedReciter') || 'abdulsamad';
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
