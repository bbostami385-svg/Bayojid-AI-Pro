import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Streamdown } from "streamdown";

interface Message {
  id: string;
  role: "user" | "tutor" | "system";
  content: string;
  timestamp: Date;
  type: "text" | "hint" | "explanation" | "question" | "encouragement";
}

interface TutorSession {
  id: string;
  topic: string;
  currentProblem: string;
  difficulty: "easy" | "medium" | "hard";
  messages: Message[];
  hints: string[];
  hintsUsed: number;
  maxHints: number;
  confidence: number;
  isStreaming: boolean;
}

export default function AITutorChat() {
  const { user } = useAuth();
  const [session, setSession] = useState<TutorSession | null>(null);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");

  const topics = [
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "History",
    "Literature",
    "Programming",
    "Web Development",
  ];

  // Start new tutoring session
  const startSession = async (topic: string) => {
    setIsLoading(true);
    try {
      // Mock session creation - replace with actual tRPC call
      const newSession: TutorSession = {
        id: `session_${Date.now()}`,
        topic,
        currentProblem: `Let's explore ${topic} together! What would you like to learn about?`,
        difficulty,
        messages: [
          {
            id: "msg_0",
            role: "tutor",
            content: `Hello! I'm your AI Tutor. I'm here to help you master ${topic}. Let's start with a problem or concept you'd like to understand better.`,
            timestamp: new Date(),
            type: "text",
          },
        ],
        hints: [],
        hintsUsed: 0,
        maxHints: 3,
        confidence: 0,
        isStreaming: false,
      };
      setSession(newSession);
      setSelectedTopic(topic);
    } finally {
      setIsLoading(false);
    }
  };

  // Send message to tutor
  const sendMessage = async () => {
    if (!userInput.trim() || !session) return;

    setIsLoading(true);

    try {
      // Add user message
      const userMessage: Message = {
        id: `msg_${Date.now()}`,
        role: "user",
        content: userInput,
        timestamp: new Date(),
        type: "text",
      };

      const updatedMessages = [...session.messages, userMessage];

      // Mock tutor response - replace with actual tRPC call
      const tutorResponse: Message = {
        id: `msg_${Date.now() + 1}`,
        role: "tutor",
        content: `Great question about "${userInput}"! Let me break this down for you step by step...

**Step 1:** First, let's understand the concept
- This is the foundational idea you need to know

**Step 2:** Now let's apply it
- Here's how we use this concept in practice

**Step 3:** Let's verify our understanding
- Can you explain this back to me in your own words?

**Key Points to Remember:**
- Point 1: Important concept
- Point 2: Important concept
- Point 3: Important concept

Would you like me to:
1. Explain this further?
2. Give you a practice problem?
3. Show you a real-world example?`,
        timestamp: new Date(),
        type: "explanation",
      };

      setSession({
        ...session,
        messages: [...updatedMessages, tutorResponse],
      });

      setUserInput("");
    } finally {
      setIsLoading(false);
    }
  };

  // Request hint
  const requestHint = async () => {
    if (!session || session.hintsUsed >= session.maxHints) return;

    setIsLoading(true);

    try {
      const hintMessage: Message = {
        id: `msg_${Date.now()}`,
        role: "tutor",
        content: `💡 **Hint ${session.hintsUsed + 1}:**\n\nThink about the fundamental principles we discussed. Try approaching this from a different angle.`,
        timestamp: new Date(),
        type: "hint",
      };

      setSession({
        ...session,
        messages: [...session.messages, hintMessage],
        hintsUsed: session.hintsUsed + 1,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Get encouragement
  const getEncouragement = async () => {
    if (!session) return;

    const encouragementMessage: Message = {
      id: `msg_${Date.now()}`,
      role: "tutor",
      content: `🌟 **You're doing great!**\n\nI can see you're making real progress. Your confidence is growing, and you're asking better questions. Keep up this momentum!\n\n**Your Progress:**\n- Concepts understood: 7/10\n- Confidence level: 72%\n- Time invested: 45 minutes\n\nYou're on track to master this topic!`,
      timestamp: new Date(),
      type: "encouragement",
    };

    setSession({
      ...session,
      messages: [...session.messages, encouragementMessage],
    });
  };

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [session?.messages]);

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">AI Tutor</h1>
            <p className="text-purple-200">Your personal learning companion</p>
          </div>

          <Card className="bg-slate-800 border-purple-500/20 mb-8">
            <CardHeader>
              <CardTitle className="text-white">Select a Topic</CardTitle>
              <CardDescription className="text-purple-300">Choose what you'd like to learn today</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {topics.map((topic) => (
                  <Button
                    key={topic}
                    onClick={() => startSession(topic)}
                    variant="outline"
                    className="border-purple-500/30 text-purple-200 hover:bg-purple-600/20 h-auto py-4"
                  >
                    {topic}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-white">Select Difficulty</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-4">
              {(["easy", "medium", "hard"] as const).map((level) => (
                <Button
                  key={level}
                  onClick={() => setDifficulty(level)}
                  variant={difficulty === level ? "default" : "outline"}
                  className={difficulty === level ? "bg-purple-600" : "border-purple-500/30"}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">{session.topic}</h1>
            <p className="text-purple-200">
              <Badge variant="outline" className="border-purple-500 text-purple-300 mr-2">
                {session.difficulty}
              </Badge>
              Hints Used: {session.hintsUsed}/{session.maxHints}
            </p>
          </div>
          <Button
            onClick={() => setSession(null)}
            variant="outline"
            className="border-purple-500/30 text-purple-200"
          >
            New Session
          </Button>
        </div>

        {/* Chat Area */}
        <Card className="bg-slate-800 border-purple-500/20 h-[500px] flex flex-col mb-4">
          <CardContent className="flex-1 overflow-hidden p-4">
            <ScrollArea className="h-full pr-4">
              <div className="space-y-4">
                {session.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        msg.role === "user"
                          ? "bg-purple-600 text-white"
                          : "bg-slate-700 text-purple-100"
                      }`}
                    >
                      {msg.type === "explanation" || msg.type === "hint" || msg.type === "encouragement" ? (
                        <Streamdown>{msg.content}</Streamdown>
                      ) : (
                        <p className="text-sm">{msg.content}</p>
                      )}
                      <p className="text-xs opacity-70 mt-1">
                        {msg.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={scrollRef} />
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Input Area */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Ask your question or describe your problem..."
              className="bg-slate-700 border-purple-500/20 text-white placeholder-purple-300"
              disabled={isLoading}
            />
            <Button
              onClick={sendMessage}
              disabled={isLoading || !userInput.trim()}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {isLoading ? "..." : "Send"}
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={requestHint}
              disabled={session.hintsUsed >= session.maxHints || isLoading}
              variant="outline"
              className="border-purple-500/30 text-purple-200"
            >
              💡 Get Hint ({session.maxHints - session.hintsUsed} left)
            </Button>
            <Button
              onClick={getEncouragement}
              disabled={isLoading}
              variant="outline"
              className="border-purple-500/30 text-purple-200"
            >
              🌟 Encouragement
            </Button>
            <Button
              onClick={() => setSession(null)}
              variant="outline"
              className="border-purple-500/30 text-purple-200"
            >
              📚 Change Topic
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
