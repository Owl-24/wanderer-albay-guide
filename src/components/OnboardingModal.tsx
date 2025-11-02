import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Compass, UtensilsCrossed, MapPin, Sparkles } from "lucide-react";

interface OnboardingModalProps {
  open: boolean;
  onComplete: () => void;
  userId: string;
}

const OnboardingModal = ({ open, onComplete, userId }: OnboardingModalProps) => {
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const questions = {
    1: {
      icon: Compass,
      title: "Exploring & Activities",
      questions: [
        {
          id: "exploring",
          question: "What do you always look for in a new city?",
          options: ["Tourist maps", "Hidden gems", "Both"],
        },
        {
          id: "weekend",
          question: "Ideal weekend activity?",
          options: ["Hiking", "Beach relaxing", "Food tours", "Cultural sites"],
        },
        {
          id: "preference",
          question: "Do you prefer history or modern art?",
          options: ["History", "Modern art", "Both equally"],
        },
      ],
    },
    2: {
      icon: UtensilsCrossed,
      title: "Food & Drink",
      questions: [
        {
          id: "food",
          question: "What food excites you most when traveling?",
          options: ["Street food", "Fine dining", "Local specialties", "Cafes & desserts"],
        },
        {
          id: "restaurant",
          question: "Cozy or trendy restaurants?",
          options: ["Cozy", "Trendy", "No preference"],
        },
        {
          id: "unusual_food",
          question: "Do you try unusual local foods?",
          options: ["Always", "Sometimes", "Rarely", "Never"],
        },
      ],
    },
    3: {
      icon: MapPin,
      title: "Logistics & Vibe",
      questions: [
        {
          id: "transport",
          question: "Preferred way to get around?",
          options: ["Walk", "Public transport", "Taxi/Grab", "Rent a vehicle"],
        },
        {
          id: "location",
          question: "Stay in city center or quiet area?",
          options: ["City center", "Quiet area", "Depends on the trip"],
        },
        {
          id: "planning",
          question: "Plan ahead or go with the flow?",
          options: ["Detailed planning", "Flexible itinerary", "Complete spontaneity"],
        },
      ],
    },
  };

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ onboarding_answers: answers })
        .eq("id", userId);

      if (error) throw error;

      toast.success("Welcome to Wanderer! Your preferences have been saved.");
      onComplete();
    } catch (error) {
      console.error("Error saving onboarding answers:", error);
      toast.error("Failed to save preferences. Please try again.");
    }
  };

  const currentStep = questions[step as keyof typeof questions];
  const Icon = currentStep.icon;

  const isStepComplete = currentStep.questions.every((q) => answers[q.id]);

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-primary to-accent rounded-xl">
              <Icon className="w-6 h-6 text-primary-foreground" />
            </div>
            <DialogTitle className="text-2xl">{currentStep.title}</DialogTitle>
          </div>
          <div className="flex gap-2 mt-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`h-2 flex-1 rounded-full ${
                  i <= step ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {currentStep.questions.map((q) => (
            <div key={q.id} className="space-y-3">
              <h3 className="font-medium text-lg flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                {q.question}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {q.options.map((option) => (
                  <Card
                    key={option}
                    className={`cursor-pointer transition-all hover:scale-105 ${
                      answers[q.id] === option
                        ? "border-2 border-primary shadow-lg"
                        : "hover:border-primary/50"
                    }`}
                    onClick={() => handleAnswer(q.id, option)}
                  >
                    <CardContent className="p-4 text-center">
                      <p className="font-medium">{option}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
          >
            Previous
          </Button>
          <Button onClick={handleNext} disabled={!isStepComplete}>
            {step === 3 ? "Complete" : "Next"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingModal;
