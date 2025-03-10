
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useUserData } from "@/context/UserDataContext";
import { Flame, Check, Calendar } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";

export default function CheckInButton() {
  const { checkIn, isCheckedInToday, streak } = useUserData();
  const [showDialog, setShowDialog] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleCheckIn = () => {
    if (isCheckedInToday) return;
    
    // Trigger animation
    setIsAnimating(true);
    setTimeout(() => {
      checkIn();
      setIsAnimating(false);
    }, 1000);
  };

  return (
    <>
      <Button
        onClick={() => isCheckedInToday ? setShowDialog(true) : handleCheckIn()}
        className={`relative overflow-hidden transition-all duration-500 ${
          isCheckedInToday ? "bg-secondary text-muted-foreground" : "bg-primary"
        } ${isAnimating ? "scale-110" : ""}`}
        size="lg"
      >
        {isAnimating && (
          <div className="absolute inset-0 bg-primary animate-pulse-gentle" />
        )}
        <div className="relative z-10 flex items-center space-x-2">
          {isCheckedInToday ? (
            <>
              <Check className="h-5 w-5" />
              <span>Checked In Today</span>
            </>
          ) : (
            <>
              <Flame className="h-5 w-5" />
              <span>Mark Presence</span>
            </>
          )}
        </div>
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Already Checked In</DialogTitle>
            <DialogDescription>
              You've already marked your presence for today. Come back tomorrow to continue your streak!
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-4 space-y-2">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-secondary">
              <Check className="h-8 w-8 text-primary" />
            </div>
            <p className="text-lg font-medium">
              Current Streak: {streak.current} day{streak.current !== 1 ? 's' : ''}
            </p>
            <p className="text-sm text-muted-foreground">
              Keep going! Your longest streak is {streak.longest} day{streak.longest !== 1 ? 's' : ''}.
            </p>
          </div>
          <DialogFooter className="sm:justify-center">
            <Button variant="secondary" onClick={() => setShowDialog(false)}>
              <Calendar className="h-4 w-4 mr-2" />
              See you tomorrow
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
