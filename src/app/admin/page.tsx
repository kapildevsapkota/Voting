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
import {
  Session,
  RunningSessionResponse,
  SessionsResponse,
} from "@/types/Admin";

export default function AdminPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const selectedSession = sessions.find(
    (session) => session.id.toString() === selectedSessionId
  );

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      const [sessionsResponse, runningSessionResponse] = await Promise.all([
        fetch("https://cim.baliyoventures.com/api/sessions/"),
        fetch("https://cim.baliyoventures.com/api/running-sessions/"),
      ]);

      if (!sessionsResponse.ok || !runningSessionResponse.ok) {
        throw new Error("Failed to fetch data");
      }

      const sessionsData: SessionsResponse = await sessionsResponse.json();
      const runningSessionData: RunningSessionResponse =
        await runningSessionResponse.json();

      setSessions(sessionsData.results);

      if (runningSessionData.results.length > 0) {
        setSelectedSessionId(
          runningSessionData.results[0].session.id.toString()
        );
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to fetch session data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const toggleSession = async () => {
    if (!selectedSessionId) {
      toast({
        title: "Error",
        description: "Please select a session before toggling.",
        variant: "destructive",
      });
      return;
    }

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
            session_id: selectedSessionId,
            is_active: !selectedSession?.is_acepting_questions,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to toggle session state");
      }

      await fetchInitialData();

      toast({
        title: "Success",
        description: `Session ${
          selectedSession?.is_acepting_questions ? "activated" : "deactivated"
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
    if (!selectedSessionId) {
      toast({
        title: "Error",
        description: "Please select a session first.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://cim.baliyoventures.com/api/running-session/${selectedSessionId}/`,
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

      await fetchInitialData();

      toast({
        title: "Success",
        description: "Session refreshed successfully.",
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
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mx-auto"
      >
        <Card className="shadow-lg rounded-lg bg-white">
          <CardHeader>
            <CardTitle className="text-4xl font-bold text-center text-gray-800">
              Admin Dashboard
            </CardTitle>
            <CardDescription className="text-center text-gray-600">
              Manage your sessions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedSession && (
              <h2 className="text-3xl font-bold mb-6 text-gray-800">
                {selectedSession.title}
              </h2>
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
                  onValueChange={setSelectedSessionId}
                  disabled={isLoading}
                  value={selectedSessionId || undefined}
                >
                  <SelectTrigger id="session-select">
                    <SelectValue placeholder="Choose a session" />
                  </SelectTrigger>
                  <SelectContent>
                    {sessions.map((session) => (
                      <SelectItem
                        key={session.id}
                        value={session.id.toString()}
                      >
                        {session.title}
                        {` (${
                          session.is_acepting_questions ? "Active" : "Inactive"
                        })`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between space-x-4">
                <span className="text-sm font-medium text-gray-700">
                  Is Accepting Questions:{" "}
                  {selectedSession?.is_acepting_questions ? "Yes" : "No"}
                </span>
                <Switch
                  checked={selectedSession?.is_acepting_questions || false}
                  onCheckedChange={toggleSession}
                  disabled={!selectedSessionId || isLoading}
                  className="h-6 w-12"
                />
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">
                  Currently Selected Session:{" "}
                  <span className="font-semibold">
                    {selectedSession?.title || "None"}
                  </span>
                </p>
              </div>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button
                  onClick={fetchInitialData}
                  disabled={isLoading}
                  className="w-full sm:w-auto p-4 transition-transform duration-200 hover:scale-105"
                >
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
                  disabled={isLoading || !selectedSessionId}
                  variant="outline"
                  className="w-full sm:w-auto p-4 transition-transform duration-200 hover:scale-105"
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
