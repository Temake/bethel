
import { useState } from "react";
import { JournalEntry, User } from "@/lib/types";
import { toast } from "sonner";

export function useJournalEntries(initialEntries: JournalEntry[] = [], user: User | null) {
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(initialEntries);

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
    
    toast.success("Journal entry saved!");
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

  return {
    journalEntries,
    setJournalEntries,
    addJournalEntry,
    updateJournalEntry,
    getTodayEntry
  };
}
