
import { useState, useEffect } from "react";
import { JournalEntry, Streak } from "@/lib/types";
import { toast } from "sonner";

export function useCheckIn(
  journalEntries: JournalEntry[],
  setJournalEntries: React.Dispatch<React.SetStateAction<JournalEntry[]>>,
  streak: Streak,
  incrementStreak: () => boolean,
  userId: string | undefined
) {
  const [isCheckedInToday, setIsCheckedInToday] = useState(false);

  // Check if already checked in today
  const checkIsCheckedInToday = () => {
    const today = new Date().toISOString().split('T')[0];
    const checkedInToday = journalEntries.some(
      entry => entry.date === today && entry.isCheckedIn
    );
    setIsCheckedInToday(checkedInToday);
  };

  // Monitor journal entries for check-in status
  useEffect(() => {
    checkIsCheckedInToday();
  }, [journalEntries]);

  const checkIn = () => {
    const today = new Date().toISOString().split('T')[0];
    
    // Prevent multiple check-ins on the same day
    if (isCheckedInToday) {
      toast.info("You've already checked in today!");
      return;
    }

    // Check if the last check-in was today
    if (streak.lastCheckIn === today) {
      setIsCheckedInToday(true);
      toast.info("You've already checked in today!");
      return;
    }

    // Update streak
    const streakUpdated = incrementStreak();
    setIsCheckedInToday(true);
    
    // Create a checked-in entry for today if it doesn't exist
    const todayEntry = journalEntries.find(entry => entry.date === today);
    
    if (!todayEntry) {
      const newEntry: JournalEntry = {
        id: `${Date.now()}`,
        userId: userId || "",
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
    
    if (streakUpdated) {
      toast.success(`Checked in! Current streak: ${streak.current + 1} day${streak.current + 1 !== 1 ? 's' : ''}`);
    } else {
      toast.success("Checked in for today!");
    }
  };

  return {
    isCheckedInToday,
    checkIsCheckedInToday,
    checkIn
  };
}
