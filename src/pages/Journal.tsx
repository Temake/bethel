import { useState, useEffect } from "react";
import { useAuth } from "@/context/auth";
import { useUserData } from "@/context/UserDataContext";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { format } from "date-fns";
import { BookOpen, Calendar, Edit, Plus, Save, Trash } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { JournalEntry } from "@/lib/types";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function Journal() {
  const { isAuthenticated, user } = useAuth();
  const { journalEntries, addJournalEntry, updateJournalEntry, deleteJournalEntry } = useUserData();
  const [activeTab, setActiveTab] = useState<string>("write");
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  // Reset form when switching to write tab
  useEffect(() => {
    if (activeTab === "write" && !isEditing) {
      setTitle("");
      setContent("");
      setSelectedEntry(null);
    }
  }, [activeTab, isEditing]);

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) {
      toast.error("Please provide both a title and content for your journal entry");
      return;
    }

    if (isEditing && selectedEntry) {
      updateJournalEntry({
        ...selectedEntry,
        title,
        content,
        updatedAt: new Date().toISOString(),
      });
      toast.success("Journal entry updated successfully");
      setIsEditing(false);
    } else {
      addJournalEntry({
        id: Date.now().toString(),
        title,
        content,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      toast.success("Journal entry saved successfully");
    }

    setTitle("");
    setContent("");
    setSelectedEntry(null);
    setActiveTab("entries");
  };

  const handleEdit = (entry: JournalEntry) => {
    setTitle(entry.title);
    setContent(entry.content);
    setSelectedEntry(entry);
    setIsEditing(true);
    setActiveTab("write");
  };

  const handleDelete = (entryId: string) => {
    deleteJournalEntry(entryId);
    toast.success("Journal entry deleted successfully");
    
    if (selectedEntry?.id === entryId) {
      setSelectedEntry(null);
    }
  };

  const handleViewEntry = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    setIsDialogOpen(true);
  };

  const handleCancelEdit = () => {
    setTitle("");
    setContent("");
    setSelectedEntry(null);
    setIsEditing(false);
  };

  return (
    <Layout>
      <div className="container max-w-6xl py-8">
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Journal</h1>
            <p className="text-muted-foreground">
              Record your thoughts, prayers, and spiritual insights
            </p>
          </div>
          
          <Separator className="my-4" />
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="write" className="flex items-center gap-2">
                <Edit className="h-4 w-4" />
                {isEditing ? "Edit Entry" : "Write"}
              </TabsTrigger>
              <TabsTrigger value="entries" className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                My Entries
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="write" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>{isEditing ? "Edit Journal Entry" : "New Journal Entry"}</CardTitle>
                  <CardDescription>
                    {isEditing 
                      ? "Update your existing journal entry below" 
                      : "Write down your thoughts, prayers, or reflections"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input 
                      id="title" 
                      placeholder="Enter a title for your entry" 
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="content">Content</Label>
                    <Textarea 
                      id="content" 
                      placeholder="Write your journal entry here..." 
                      className="min-h-[200px]"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  {isEditing ? (
                    <>
                      <Button variant="outline" onClick={handleCancelEdit}>
                        Cancel
                      </Button>
                      <Button onClick={handleSubmit}>
                        <Save className="mr-2 h-4 w-4" />
                        Update Entry
                      </Button>
                    </>
                  ) : (
                    <Button onClick={handleSubmit} className="ml-auto">
                      <Save className="mr-2 h-4 w-4" />
                      Save Entry
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="entries">
              <div className="space-y-6">
                {journalEntries.length === 0 ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>No Journal Entries Yet</CardTitle>
                      <CardDescription>
                        Start writing your first journal entry to see it here
                      </CardDescription>
                    </CardHeader>
                    <CardFooter>
                      <Button onClick={() => setActiveTab("write")}>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Your First Entry
                      </Button>
                    </CardFooter>
                  </Card>
                ) : (
                  <>
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-semibold">Your Journal Entries</h2>
                      <Button onClick={() => setActiveTab("write")}>
                        <Plus className="mr-2 h-4 w-4" />
                        New Entry
                      </Button>
                    </div>
                    
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {[...journalEntries]
                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                        .map((entry) => (
                          <Card key={entry.id} className="overflow-hidden">
                            <CardHeader className="pb-3">
                              <CardTitle className="text-lg font-semibold truncate">
                                {entry.title}
                              </CardTitle>
                              <CardDescription className="flex items-center text-xs">
                                <Calendar className="mr-1 h-3 w-3" />
                                {format(new Date(entry.createdAt), "MMM d, yyyy")}
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="pb-3">
                              <p className="text-sm line-clamp-3">
                                {entry.content}
                              </p>
                            </CardContent>
                            <CardFooter className="flex justify-between pt-0">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleViewEntry(entry)}
                              >
                                Read
                              </Button>
                              <div className="flex gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleEdit(entry)}
                                >
                                  Edit
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      className="text-destructive"
                                    >
                                      Delete
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Journal Entry</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete this journal entry? This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction 
                                        onClick={() => handleDelete(entry.id)}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </CardFooter>
                          </Card>
                        ))}
                    </div>
                  </>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Journal Entry View Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>{selectedEntry?.title}</DialogTitle>
            <DialogDescription className="flex items-center text-xs">
              <Calendar className="mr-1 h-3 w-3" />
              {selectedEntry && format(new Date(selectedEntry.createdAt), "MMMM d, yyyy 'at' h:mm a")}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[50vh]">
            <div className="p-4 whitespace-pre-wrap">
              {selectedEntry?.content}
            </div>
          </ScrollArea>
          <DialogFooter className="flex justify-between sm:justify-between">
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setIsDialogOpen(false);
                  if (selectedEntry) {
                    handleEdit(selectedEntry);
                  }
                }}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-destructive border-destructive"
                  >
                    <Trash className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Journal Entry</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this journal entry? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => {
                        if (selectedEntry) {
                          handleDelete(selectedEntry.id);
                          setIsDialogOpen(false);
                        }
                      }}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
            <Button 
              variant="default" 
              onClick={() => setIsDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
