import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Star, ThumbsUp, ThumbsDown, Flag } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface ConversationRatingProps {
  conversationId: number;
}

export function ConversationRating({ conversationId }: ConversationRatingProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const rateConversationMutation = trpc.rating.rateConversation.useMutation();
  const submitFeedbackMutation = trpc.rating.submitFeedback.useMutation();
  const getRatingMutation = trpc.rating.getConversationRating.useQuery({ conversationId });

  const handleSubmitRating = async () => {
    try {
      await rateConversationMutation.mutateAsync({
        conversationId,
        rating,
        feedback,
      });
      setSubmitted(true);
      setTimeout(() => {
        setRating(0);
        setFeedback("");
        setSubmitted(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to submit rating:", error);
    }
  };

  const handleSubmitFeedback = async () => {
    try {
      await submitFeedbackMutation.mutateAsync({
        conversationId,
        feedbackType: rating < 3 ? "concern" : "suggestion",
        title: "কথোপকথন প্রতিক্রিয়া / Conversation Feedback",
        description: feedback,
      });
      setSubmitted(true);
    } catch (error) {
      console.error("Failed to submit feedback:", error);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Star className="w-4 h-4" />
          রেট করুন / Rate
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>এই কথোপকথন রেট করুন / Rate This Conversation</DialogTitle>
          <DialogDescription>আপনার মতামত আমাদের উন্নতি করতে সাহায্য করে</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Star Rating */}
          <div className="space-y-3">
            <h3 className="font-semibold">কথোপকথন মূল্যায়ন / Overall Rating</h3>
            <div className="flex gap-2 justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hoverRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <div className="text-center text-sm text-gray-600">
                {rating === 5 && "অসাধারণ! / Excellent!"}
                {rating === 4 && "ভালো / Good"}
                {rating === 3 && "গড় / Average"}
                {rating === 2 && "খারাপ / Poor"}
                {rating === 1 && "অত্যন্ত খারাপ / Very Poor"}
              </div>
            )}
          </div>

          {/* Category Ratings */}
          {rating > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold">বিভাগ মূল্যায়ন / Category Ratings</h3>
              <div className="space-y-2">
                {[
                  { label: "নির্ভুলতা / Accuracy", key: "accuracy" },
                  { label: "সহায়কতা / Helpfulness", key: "helpfulness" },
                  { label: "স্পষ্টতা / Clarity", key: "clarity" },
                  { label: "প্রাসঙ্গিকতা / Relevance", key: "relevance" },
                ].map((category) => (
                  <div key={category.key} className="flex items-center justify-between">
                    <span className="text-sm">{category.label}</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className="w-4 h-4 text-gray-300 cursor-pointer hover:text-yellow-400"
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Feedback */}
          <div className="space-y-3">
            <h3 className="font-semibold">আপনার মতামত / Your Feedback</h3>
            <Textarea
              placeholder="আপনার অভিজ্ঞতা সম্পর্কে বলুন... / Tell us about your experience..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={4}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={handleSubmitRating}
              disabled={rating === 0 || submitted}
              className="flex-1"
            >
              {submitted ? "✓ জমা দেওয়া হয়েছে" : "রেটিং জমা দিন / Submit Rating"}
            </Button>
            <Button variant="outline" className="gap-2">
              <Flag className="w-4 h-4" />
              রিপোর্ট / Report
            </Button>
          </div>

          {/* Current Rating Display */}
          {getRatingMutation.data?.rating && (
            <Card className="bg-blue-50">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">আপনার রেটিং / Your Rating</span>
                  <div className="flex items-center gap-2">
                    {[...Array(getRatingMutation.data.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
