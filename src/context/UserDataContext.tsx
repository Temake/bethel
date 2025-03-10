
import React, { createContext, useContext, useState, useEffect } from "react";
import { JournalEntry, Streak, UserData } from "@/lib/types";
import { useAuth } from "./AuthContext";
import { Toast } from "@/components/ui/sonner";

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

const DEFAULT_STREAK: Streak = {
  current: 0,
  longest: 0,
  lastCheckIn: null,
  freezesAvailable: 3
};

export const UserDataProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const { user } = useAuth();
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [streak, setStreak] = useState<Streak>(DEFAULT_STREAK);
  const [isCheckedInToday, setIsCheckedInToday] = useState(false);

  // Load user data from localStorage
  useEffect(() => {
    if (user) {
      const savedData = localStorage.getItem("userData");
      if (savedData) {
        const parsedData: UserData = JSON.parse(savedData);
        setJournalEntries(parsedData.journalEntries || []);
        setStreak(parsedData.streak || DEFAULT_STREAK);
      }
      
      // Check if the user has already checked in today
      const today = new Date().toISOString().split('T')[0];
      const checkedInToday = journalEntries.some(
        entry => entry.date === today && entry.isCheckedIn
      );
      setIsCheckedInToday(checkedInToday);
      
      // Check if streak should be reset (missed a day without freeze)
      checkStreakContinuity();
    }
  }, [user, journalEntries.length]);

  // Save user data to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      const userData: UserData = {
        user,
        journalEntries,
        streak
      };
      localStorage.setItem("userData", JSON.stringify(userData));
    }
  }, [user, journalEntries, streak]);

  const checkStreakContinuity = () => {
    if (!streak.lastCheckIn) return;

    const lastCheckInDate = new Date(streak.lastCheckIn);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Format as YYYY-MM-DD
    const formattedYesterday = yesterday.toISOString().split('T')[0];
    const formattedLastCheckIn = lastCheckInDate.toISOString().split('T')[0];
    
    // If last check-in was before yesterday and no freeze was used
    if (formattedLastCheckIn < formattedYesterday) {
      setStreak(prev => ({
        ...prev,
        current: 0, // Reset current streak
        lastCheckIn: null
      }));
      toast.error("Your streak was reset because you missed a day.");
    }
  };

  const checkIn = () => {
    const today = new Date().toISOString().split('T')[0];
    
    // Prevent multiple check-ins on the same day
    if (isCheckedInToday) {
      toast.info("You've already checked in today!");
      return;
    }

    // Update streak
    const newStreak = { ...streak };
    newStreak.current += 1;
    newStreak.longest = Math.max(newStreak.longest, newStreak.current);
    newStreak.lastCheckIn = today;
    
    setStreak(newStreak);
    setIsCheckedInToday(true);
    
    // Create a checked-in entry for today if it doesn't exist
    const todayEntry = journalEntries.find(entry => entry.date === today);
    
    if (!todayEntry) {
      const newEntry: JournalEntry = {
        id: `${Date.now()}`,
        userId: user?.id || "",
        date: today,
        prayedFor: "",
        receivedInsight: "",
        createdAt: new Date().toISOString(),
        isCheckedIn: true
      };
      
      setJournalEntries(prev => [...prev, newEntry]);
    } else {
      // Update the existing entry to mark as checked in
      setJournalEntries(prev => 
        prev.map(entry => 
          entry.date === today ? { ...entry, isCheckedIn: true } : entry
        )
      );
    }
    
    toast.success(`Checked in! Current streak: ${newStreak.current} day${newStreak.current !== 1 ? 's' : ''}`);
  };

  const useFreeze = () => {
    if (streak.freezesAvailable <= 0) {
      toast.error("No freezes available!");
      return;
    }
    
    // Use a freeze to maintain streak despite missing a day
    const today = new Date().toISOString().split('T')[0];
    
    setStreak(prev => ({
      ...prev,
      freezesAvailable: prev.freezesAvailable - 1,
      lastCheckIn: today
    }));
    
    toast.success(`Freeze used! Streak preserved. ${streak.freezesAvailable - 1} freeze${streak.freezesAvailable - 1 !== 1 ? 's' : ''} remaining.`);
  };

  const addJournalEntry = (prayedFor: string, receivedInsight: string) => {
    const today = new Date().toISOString().split('T')[0];
    const existingEntry = journalEntries.find(entry => entry.date === today);
    
    if (existingEntry) {
      // Update existing entry
      setJournalEntries(prev => 
        prev.map(entry => 
          entry.date === today 
            ? { 
                ...entry, 
                prayedFor, 
                receivedInsight,
                isCheckedIn: true // Ensure check-in with journal entry
              } 
            : entry
        )
      );
    } else {
      // Create new entry
      const newEntry: JournalEntry = {
        id: `${Date.now()}`,
        userId: user?.id || "",
        date: today,
        prayedFor,
        receivedInsight,
        createdAt: new Date().toISOString(),
        isCheckedIn: true // Ensure check-in with journal entry
      };
      
      setJournalEntries(prev => [...prev, newEntry]);
    }
    
    // Make sure streaks are updated
    if (!isCheckedInToday) {
      checkIn();
    } else {
      toast.success("Journal entry saved!");
    }
  };

  const updateJournalEntry = (id: string, prayedFor: string, receivedInsight: string) => {
    setJournalEntries(prev => 
      prev.map(entry => 
        entry.id === id 
          ? { ...entry, prayedFor, receivedInsight } 
          : entry
      )
    );
    
    toast.success("Journal entry updated!");
  };

  const getTodayEntry = () => {
    const today = new Date().toISOString().split('T')[0];
    return journalEntries.find(entry => entry.date === today);
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
