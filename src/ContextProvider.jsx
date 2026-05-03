// src/context/UserContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [context, setContext] = useState({
    name: "",
    location: { city: "Nipani", district: "Belgaum", state: "Karnataka" }, // Default to local
    preferences: { language: "en", isRegistered: false },
    behavior: { stepsCompleted: [], readinessScore: 0 }
  });

  // Load from LocalStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("nagarik_context");
    if (saved) setContext(JSON.parse(saved));
  }, []);

  // Save to LocalStorage whenever context changes
  useEffect(() => {
    localStorage.setItem("nagarik_context", JSON.stringify(context));
  }, [context]);

  const updateProgress = (step) => {
    if (!context.behavior.stepsCompleted.includes(step)) {
      const newSteps = [...context.behavior.stepsCompleted, step];
      const newScore = Math.floor((newSteps.length / 4) * 100);
      setContext(prev => ({
        ...prev,
        behavior: { stepsCompleted: newSteps, readinessScore: newScore }
      }));
    }
  };

  return (
    <UserContext.Provider value={{ context, setContext, updateProgress }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);