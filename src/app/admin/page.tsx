"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, CheckCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Session, RunningSession, RunningSessionResponse, SessionsResponse } from "@/types/Admin";



export default function AdminPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [runningSession, setRunningSession] = useState<RunningSession | null>(null);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSessions();
    fetchRunningSession();
  }, []);

  const fetchSessions = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        "https://cim.baliyoventures.com/api/sessions/",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch sessions");
      }
      const data: SessionsResponse = await response.json();
      setSessions(data.results);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to fetch sessions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRunningSession = async () => {
    try {
      const response = await fetch('https://cim.baliyoventures.com/api/running-sessions/');
      const data: RunningSessionResponse = await response.json();
      if (data.results.length > 0) {
        setRunningSession(data.results[0]);
      }
    } catch (error) {
      console.error('Error fetching running session:', error);
      toast({
        title: "Error",
        description: "Failed to fetch running session",
        variant: "destructive",
      });
    }
  };

  const handleSessionChange = (value: string) => {
    setSelectedSession(value);
  };

  const toggleSession = async () => {
    if (!selectedSession) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        "https://cim.baliyoventures.com/api/running-session/toggle-questions/",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            session_id: selectedSession,
            is_active: !isSessionActive,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to toggle session state");
      }

      await response.json();
      setIsSessionActive(!isSessionActive);
      toast({
        title: "Success",
        description: `Session ${
          isSessionActive ? "deactivated" : "activated"
        } successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to toggle session state. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const refreshSession = async () => {
    if (!selectedSession) {
      toast({
        title: "Error",
        description: "Please select a session first",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://cim.baliyoventures.com/api/running-session/${selectedSession}/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to refresh session");
      }

      await response.json();
      toast({
        title: "Success",
        description: "Session refreshed successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to refresh session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mx-auto"
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">
              Admin Dashboard
            </CardTitle>
            <CardDescription className="text-center">
              Manage your sessions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {runningSession && (
              <h2 className="text-2xl font-bold mb-6">{runningSession.session.title}</h2>
            )}
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label
                  htmlFor="session-select"
                  className="block text-sm font-medium text-gray-700"
                >
                  Select Session
                </label>
                <Select
                  onValueChange={handleSessionChange}
                  disabled={isLoading}
                >
                  <SelectTrigger id="session-select">
                    <SelectValue placeholder="Choose a session" />
                  </SelectTrigger>
                  <SelectContent >
                    {sessions.map((session) => (
                      <SelectItem key={session.id} value={session.id}>
                        {session.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Session Status
                </span>
                <Switch
                  checked={isSessionActive}
                  onCheckedChange={toggleSession}
                  disabled={!selectedSession || isLoading}
                />
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-500">
                  Currently Selected Session:{" "}
                  <span className="font-semibold">
                    {selectedSession
                      ? sessions.find(
                          (session) => session.id === selectedSession
                        )?.title
                      : "None"}
                  </span>
                </p>
              </div>

              <div className="flex justify-center gap-4">
                <Button onClick={fetchSessions} disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Refresh Sessions
                    </motion.div>
                  )}
                </Button>
                <Button
                  onClick={refreshSession}
                  disabled={isLoading || !selectedSession}
                  variant="outline"
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Refresh Current Session
                    </motion.div>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
