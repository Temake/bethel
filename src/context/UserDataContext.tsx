
import React, { createContext, useContext, useEffect } from "react";
import { JournalEntry, Streak, UserData } from "@/lib/types";
import { useAuth } from "./AuthContext";
import { useJournalEntries } from "@/hooks/useJournalEntries";
import { useStreak, DEFAULT_STREAK } from "@/hooks/useStreak";
import { useCheckIn } from "@/hooks/useCheckIn";
import { loadUserData, saveUserData } from "@/utils/localStorage";

type UserDataContextType = {
  journalEntries: JournalEntry[];
  streak: Streak;
  isCheckedInToday: boolean;
  checkIn: () => void;
  useFreeze: () => void;
  addJournalEntry: (prayedFor: string, receivedInsight: string) => void;
  updateJournalEntry: (id: string, prayedFor: string, receivedInsight: string) => void;
  getTodayEntry: () => JournalEntry | undefined;
};

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

export const UserDataProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const { user } = useAuth();
  
  // Initialize hooks with empty values - we'll populate from localStorage in useEffect
  const { 
    journalEntries, 
    setJournalEntries, 
    addJournalEntry: addEntry, 
    updateJournalEntry, 
    getTodayEntry 
  } = useJournalEntries([], user);
  
  const { 
    streak, 
    setStreak, 
    checkStreakContinuity, 
    incrementStreak, 
    useFreeze 
  } = useStreak(DEFAULT_STREAK);
  
  const { 
    isCheckedInToday, 
    checkIsCheckedInToday, 
    checkIn 
  } = useCheckIn(journalEntries, setJournalEntries, streak, incrementStreak, user?.id);

  // Load user data from localStorage
  useEffect(() => {
    if (user) {
      const userData = loadUserData();
      if (userData) {
        setJournalEntries(userData.journalEntries || []);
        setStreak(userData.streak || DEFAULT_STREAK);
      }
      
      checkIsCheckedInToday();
      checkStreakContinuity();
    }
  }, [user]);

  // Save user data to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      const userData: UserData = {
        user,
        journalEntries,
        streak
      };
      saveUserData(userData);
    }
  }, [user, journalEntries, streak]);

  // Wrapper for add journal entry that handles check-in
  const addJournalEntry = (prayedFor: string, receivedInsight: string) => {
    addEntry(prayedFor, receivedInsight);
    
    // Make sure streaks are updated
    if (!isCheckedInToday) {
      checkIn();
    }
  };

  return (
    <UserDataContext.Provider
      value={{
        journalEntries,
        streak,
        isCheckedInToday,
        checkIn,
        useFreeze,
        addJournalEntry,
        updateJournalEntry,
        getTodayEntry
      }}
    >
      {children}
    </UserDataContext.Provider>
  );
};

export const useUserData = () => {
  const context = useContext(UserDataContext);
  if (context === undefined) {
    throw new Error("useUserData must be used within a UserDataProvider");
  }
  return context;
};
