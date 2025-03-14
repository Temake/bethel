
import { UserData } from "@/lib/types";

export const saveUserData = (userData: UserData) => {
  localStorage.setItem("userData", JSON.stringify(userData));
};

export const loadUserData = (): UserData | null => {
  const savedData = localStorage.getItem("userData");
  if (savedData) {
    return JSON.parse(savedData);
  }
  return null;
};
