import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface Question {
  id: string;
  question: string;
  type: "multiple_choice" | "true_false" | "short_answer" | "essay";
  options?: string[];
  correctAnswer?: string | number;
  userAnswer?: string | number;
  isCorrect?: boolean;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
  points: number;
}

interface Assessment {
  id: string;
  title: string;
  topic: string;
  totalQuestions: number;
  questions: Question[];
  currentQuestionIndex: number;
  score: number;
  maxScore: number;
  timeLimit: number; // minutes
  timeRemaining: number;
  isCompleted: boolean;
  feedback: AssessmentFeedback;
}

interface AssessmentFeedback {
  overallScore: number;
  performanceLevel: "excellent" | "good" | "average" | "needs_improvement";
  strengths: string[];
  areasForImprovement: string[];
  recommendations: string[];
  nextSteps: string;
}

const COLORS = ["#a78bfa", "#60a5fa", "#34d399", "#fbbf24"];

export default function AssessmentSystem() {
  const { user } = useAuth();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | number>("");
  const [isLoading, setIsLoading] = useState(false);
  const [availableAssessments, setAvailableAssessments] = useState<
    { id: string; title: string; topic: string; questions: number }[]
  >([]);

  // Load available assessments
  useEffect(() => {
    // Mock data - replace with actual tRPC call
    setAvailableAssessments([
      {
        id: "assess_1",
        title: "Algebra Fundamentals",
        topic: "Mathematics",
        questions: 10,
      },
      {
        id: "assess_2",
        title: "Web Development Basics",
        topic: "Programming",
        questions: 15,
      },
      {
        id: "assess_3",
        title: "Physics Motion",
        topic: "Physics",
        questions: 12,
      },
      {
        id: "assess_4",
        title: "Chemistry Reactions",
        topic: "Chemistry",
        questions: 10,
      },
    ]);
  }, []);

  // Start assessment
  const startAssessment = async (assessmentId: string) => {
    setIsLoading(true);

    try {
      // Mock assessment creation - replace with actual tRPC call
      const mockQuestions: Question[] = [
        {
          id: "q1",
          question: "What is 2 + 2?",
          type: "multiple_choice",
          options: ["3", "4", "5", "6"],
          correctAnswer: 1,
          explanation: "2 + 2 equals 4",
          difficulty: "easy",
          points: 1,
        },
        {
          id: "q2",
          question: "Is the sky blue?",
          type: "true_false",
          options: ["True", "False"],
          correctAnswer: 0,
          explanation: "The sky appears blue due to Rayleigh scattering",
          difficulty: "easy",
          points: 1,
        },
        {
          id: "q3",
          question: "Explain the concept of photosynthesis",
          type: "essay",
          explanation: "Photosynthesis is the process by which plants convert light energy into chemical energy",
          difficulty: "hard",
          points: 5,
        },
      ];

      const newAssessment: Assessment = {
        id: assessmentId,
        title: availableAssessments.find((a) => a.id === assessmentId)?.title || "Assessment",
        topic: availableAssessments.find((a) => a.id === assessmentId)?.topic || "",
        totalQuestions: mockQuestions.length,
        questions: mockQuestions,
        currentQuestionIndex: 0,
        score: 0,
        maxScore: mockQuestions.reduce((sum, q) => sum + q.points, 0),
        timeLimit: 30,
        timeRemaining: 30 * 60,
        isCompleted: false,
        feedback: {
          overallScore: 0,
          performanceLevel: "average",
          strengths: [],
          areasForImprovement: [],
          recommendations: [],
          nextSteps: "",
        },
      };

      setAssessment(newAssessment);
      setShowResults(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Submit answer
  const submitAnswer = async () => {
    if (!assessment) return;

    const currentQuestion = assessment.questions[assessment.currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

    const updatedQuestions = [...assessment.questions];
    updatedQuestions[assessment.currentQuestionIndex] = {
      ...currentQuestion,
      userAnswer: selectedAnswer,
      isCorrect,
    };

    const newScore = assessment.score + (isCorrect ? currentQuestion.points : 0);

    if (assessment.currentQuestionIndex < assessment.questions.length - 1) {
      setAssessment({
        ...assessment,
        questions: updatedQuestions,
        score: newScore,
        currentQuestionIndex: assessment.currentQuestionIndex + 1,
      });
      setSelectedAnswer("");
    } else {
      // Assessment completed
      const feedback = generateFeedback(newScore, assessment.maxScore, updatedQuestions);
      setAssessment({
        ...assessment,
        questions: updatedQuestions,
        score: newScore,
        isCompleted: true,
        feedback,
      });
      setShowResults(true);
    }
  };

  const generateFeedback = (score: number, maxScore: number, questions: Question[]): AssessmentFeedback => {
    const percentage = (score / maxScore) * 100;
    let performanceLevel: "excellent" | "good" | "average" | "needs_improvement";

    if (percentage >= 90) performanceLevel = "excellent";
    else if (percentage >= 75) performanceLevel = "good";
    else if (percentage >= 60) performanceLevel = "average";
    else performanceLevel = "needs_improvement";

    const incorrectQuestions = questions.filter((q) => !q.isCorrect);

    return {
      overallScore: Math.round(percentage),
      performanceLevel,
      strengths: ["Strong understanding of basic concepts", "Good problem-solving approach"],
      areasForImprovement: incorrectQuestions.map((q) => q.question),
      recommendations: [
        "Review the topics where you had difficulty",
        "Practice more similar problems",
        "Study the explanations provided",
      ],
      nextSteps:
        performanceLevel === "excellent"
          ? "Move on to advanced topics"
          : "Review and retake the assessment",
    };
  };

  if (!assessment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Assessment System</h1>
            <p className="text-purple-200">Test your knowledge and get instant feedback</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableAssessments.map((assessment) => (
              <Card key={assessment.id} className="bg-slate-800 border-purple-500/20 hover:border-purple-500/40 transition-colors">
                <CardHeader>
                  <CardTitle className="text-white">{assessment.title}</CardTitle>
                  <CardDescription className="text-purple-300">{assessment.topic}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-purple-200">{assessment.questions} Questions</span>
                    <Badge variant="outline" className="border-purple-500 text-purple-300">
                      ~{Math.ceil(assessment.questions * 2)} min
                    </Badge>
                  </div>
                  <Button
                    onClick={() => startAssessment(assessment.id)}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    Start Assessment
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (showResults && assessment.isCompleted) {
    const performanceColors = {
      excellent: "#34d399",
      good: "#60a5fa",
      average: "#fbbf24",
      needs_improvement: "#f87171",
    };

    const performanceEmoji = {
      excellent: "🎉",
      good: "👏",
      average: "📚",
      needs_improvement: "💪",
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
        <div className="max-w-4xl mx-auto">
          {/* Results Header */}
          <Card className="bg-slate-800 border-purple-500/20 mb-8">
            <CardHeader className="text-center">
              <div className="text-6xl mb-4">
                {performanceEmoji[assessment.feedback.performanceLevel]}
              </div>
              <CardTitle className="text-3xl text-white mb-2">
                {assessment.feedback.overallScore}%
              </CardTitle>
              <CardDescription className="text-lg text-purple-300">
                {assessment.feedback.performanceLevel.replace(/_/g, " ").toUpperCase()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <p className="text-white mb-2">
                  You scored {assessment.score} out of {assessment.maxScore} points
                </p>
                <Progress
                  value={assessment.feedback.overallScore}
                  className="h-3"
                />
              </div>
            </CardContent>
          </Card>

          {/* Detailed Feedback */}
          <Tabs defaultValue="feedback" className="space-y-4">
            <TabsList className="bg-slate-800 border-purple-500/20">
              <TabsTrigger value="feedback">Feedback</TabsTrigger>
              <TabsTrigger value="review">Review Answers</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            {/* Feedback Tab */}
            <TabsContent value="feedback" className="space-y-4">
              <Card className="bg-slate-800 border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-white">Strengths</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {assessment.feedback.strengths.map((strength, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-purple-200">
                        <span className="text-green-400 mt-1">✓</span>
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-white">Areas for Improvement</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {assessment.feedback.areasForImprovement.map((area, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-purple-200">
                        <span className="text-yellow-400 mt-1">→</span>
                        <span>{area}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-white">Recommendations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {assessment.feedback.recommendations.map((rec, idx) => (
                    <div key={idx} className="p-3 bg-slate-700 rounded border border-purple-500/20">
                      <p className="text-purple-200">{rec}</p>
                    </div>
                  ))}
                  <p className="text-sm text-purple-300 mt-4">
                    <strong>Next Steps:</strong> {assessment.feedback.nextSteps}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Review Answers Tab */}
            <TabsContent value="review" className="space-y-4">
              {assessment.questions.map((q, idx) => (
                <Card
                  key={q.id}
                  className={`bg-slate-800 border-2 ${
                    q.isCorrect ? "border-green-500/30" : "border-red-500/30"
                  }`}
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-white">Question {idx + 1}</CardTitle>
                        <CardDescription className="text-purple-300">
                          {q.question}
                        </CardDescription>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          q.isCorrect
                            ? "border-green-500 text-green-300"
                            : "border-red-500 text-red-300"
                        }
                      >
                        {q.isCorrect ? "✓ Correct" : "✗ Incorrect"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm text-purple-200 mb-2">Your Answer:</p>
                      <p className="text-white">{q.userAnswer}</p>
                    </div>
                    {!q.isCorrect && (
                      <div>
                        <p className="text-sm text-purple-200 mb-2">Correct Answer:</p>
                        <p className="text-green-400">{q.correctAnswer}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-purple-200 mb-2">Explanation:</p>
                      <p className="text-purple-300">{q.explanation}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics">
              <Card className="bg-slate-800 border-purple-500/20">
                <CardHeader>
                  <CardTitle className="text-white">Performance Analytics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <p className="text-purple-200 mb-4">Difficulty Distribution</p>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart
                        data={[
                          {
                            difficulty: "Easy",
                            correct: assessment.questions.filter(
                              (q) => q.difficulty === "easy" && q.isCorrect
                            ).length,
                            total: assessment.questions.filter(
                              (q) => q.difficulty === "easy"
                            ).length,
                          },
                          {
                            difficulty: "Medium",
                            correct: assessment.questions.filter(
                              (q) => q.difficulty === "medium" && q.isCorrect
                            ).length,
                            total: assessment.questions.filter(
                              (q) => q.difficulty === "medium"
                            ).length,
                          },
                          {
                            difficulty: "Hard",
                            correct: assessment.questions.filter(
                              (q) => q.difficulty === "hard" && q.isCorrect
                            ).length,
                            total: assessment.questions.filter(
                              (q) => q.difficulty === "hard"
                            ).length,
                          },
                        ]}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                        <XAxis stroke="#9ca3af" />
                        <YAxis stroke="#9ca3af" />
                        <Tooltip
                          contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #6d28d9" }}
                        />
                        <Legend />
                        <Bar dataKey="correct" fill="#34d399" name="Correct" />
                        <Bar dataKey="total" fill="#60a5fa" name="Total" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-8">
            <Button
              onClick={() => setAssessment(null)}
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              Take Another Assessment
            </Button>
            <Button
              onClick={() => setAssessment(null)}
              variant="outline"
              className="flex-1 border-purple-500/30 text-purple-200"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Assessment in progress
  const currentQuestion = assessment.questions[assessment.currentQuestionIndex];
  const progress = ((assessment.currentQuestionIndex + 1) / assessment.totalQuestions) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-white">{assessment.title}</h1>
            <Badge variant="outline" className="border-purple-500 text-purple-300">
              Question {assessment.currentQuestionIndex + 1} of {assessment.totalQuestions}
            </Badge>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <Card className="bg-slate-800 border-purple-500/20 mb-6">
          <CardHeader>
            <CardTitle className="text-white text-lg">{currentQuestion.question}</CardTitle>
            <CardDescription className="text-purple-300">
              <Badge variant="outline" className="border-purple-500 text-purple-300">
                {currentQuestion.difficulty}
              </Badge>
              <span className="ml-2">{currentQuestion.points} points</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            {currentQuestion.type === "multiple_choice" && (
              <RadioGroup value={selectedAnswer.toString()} onValueChange={setSelectedAnswer}>
                <div className="space-y-3">
                  {currentQuestion.options?.map((option, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <RadioGroupItem value={idx.toString()} id={`option_${idx}`} />
                      <Label
                        htmlFor={`option_${idx}`}
                        className="text-purple-200 cursor-pointer flex-1"
                      >
                        {option}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            )}

            {currentQuestion.type === "true_false" && (
              <RadioGroup value={selectedAnswer.toString()} onValueChange={setSelectedAnswer}>
                <div className="space-y-3">
                  {["True", "False"].map((option, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <RadioGroupItem value={idx.toString()} id={`option_${idx}`} />
                      <Label
                        htmlFor={`option_${idx}`}
                        className="text-purple-200 cursor-pointer flex-1"
                      >
                        {option}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            )}

            {currentQuestion.type === "short_answer" && (
              <Textarea
                value={selectedAnswer}
                onChange={(e) => setSelectedAnswer(e.target.value)}
                placeholder="Enter your answer..."
                className="bg-slate-700 border-purple-500/20 text-white placeholder-purple-300"
                rows={4}
              />
            )}

            {currentQuestion.type === "essay" && (
              <Textarea
                value={selectedAnswer}
                onChange={(e) => setSelectedAnswer(e.target.value)}
                placeholder="Write your essay answer..."
                className="bg-slate-700 border-purple-500/20 text-white placeholder-purple-300"
                rows={6}
              />
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex gap-4">
          <Button
            onClick={() => {
              if (assessment.currentQuestionIndex > 0) {
                setAssessment({
                  ...assessment,
                  currentQuestionIndex: assessment.currentQuestionIndex - 1,
                });
                setSelectedAnswer("");
              }
            }}
            disabled={assessment.currentQuestionIndex === 0}
            variant="outline"
            className="flex-1 border-purple-500/30 text-purple-200"
          >
            Previous
          </Button>
          <Button
            onClick={submitAnswer}
            disabled={selectedAnswer === ""}
            className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            {assessment.currentQuestionIndex === assessment.totalQuestions - 1
              ? "Submit Assessment"
              : "Next Question"}
          </Button>
        </div>
      </div>
    </div>
  );
}
