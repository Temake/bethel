
export type User = {
  id: string;
  name: string;
  email: string;
};

export type JournalEntry = {
  id: string;
  userId: string;
  date: string;
  prayedFor: string;
  receivedInsight: string;
  createdAt: string;
  isCheckedIn: boolean;
};

export type Streak = {
  current: number;
  longest: number;
  lastCheckIn: string | null;
  freezesAvailable: number;
};

export type UserData = {
  user: User | null;
  journalEntries: JournalEntry[];
  streak: Streak;
};
