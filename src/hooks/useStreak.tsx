
import { useState } from "react";
import { Streak } from "@/lib/types";
import { toast } from "sonner";

export const DEFAULT_STREAK: Streak = {
  current: 0,
  longest: 0,
  lastCheckIn: null,
  freezesAvailable: 3
};

export function useStreak(initialStreak: Streak = DEFAULT_STREAK) {
  const [streak, setStreak] = useState<Streak>(initialStreak);

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

  const incrementStreak = () => {
    const today = new Date().toISOString().split('T')[0];
    
    // Only increment if not already checked in today
    if (streak.lastCheckIn === today) {
      return false;
    }
    
    setStreak(prev => {
      const newCurrent = prev.current + 1;
      return {
        ...prev,
        current: newCurrent,
        longest: Math.max(prev.longest, newCurrent),
        lastCheckIn: today
      };
    });
    
    return true;
  };

  const useFreeze = () => {
    if (streak.freezesAvailable <= 0) {
      toast.error("No freezes available!");
      return false;
    }
    
    // Use a freeze to maintain streak despite missing a day
    const today = new Date().toISOString().split('T')[0];
    
    setStreak(prev => ({
      ...prev,
      freezesAvailable: prev.freezesAvailable - 1,
      lastCheckIn: today
    }));
    
    toast.success(`Freeze used! Streak preserved. ${streak.freezesAvailable - 1} freeze${streak.freezesAvailable - 1 !== 1 ? 's' : ''} remaining.`);
    return true;
  };

  return {
    streak,
    setStreak,
    checkStreakContinuity,
    incrementStreak,
    useFreeze
  };
}
