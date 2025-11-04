import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Sparkles, Trees, UtensilsCrossed, Landmark, Waves, Mountain, MapPin, Users, Zap, CheckCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface OnboardingModalProps {
  open: boolean;
  onComplete: () => void;
  userId: string;
}

interface UserPreferences {
  categories: string[];
  districts: string[];
  travel_style: string;
  travel_pace: string;
}

const OnboardingModal = ({ open, onComplete, userId }: OnboardingModalProps) => {
  const [step, setStep] = useState(1);
  const [preferences, setPreferences] = useState<UserPreferences>({
    categories: [],
    districts: [],
    travel_style: "",
    travel_pace: "",
  });

  const totalSteps = 6;
  const progress = (step / totalSteps) * 100;

  const categories = [
    { id: "Nature", icon: Trees, color: "from-green-500 to-emerald-600", desc: "Waterfalls, mountains, caves, parks" },
    { id: "Food", icon: UtensilsCrossed, color: "from-orange-500 to-red-600", desc: "Bicolano cuisine, cafés, desserts" },
    { id: "Culture", icon: Landmark, color: "from-purple-500 to-pink-600", desc: "Churches, heritage sites, festivals" },
    { id: "Beach", icon: Waves, color: "from-blue-500 to-cyan-600", desc: "Island hopping, seaside resorts" },
    { id: "Adventure", icon: Mountain, color: "from-yellow-500 to-orange-600", desc: "Hiking, ATV rides, zipline, caving" },
  ];

  const districts = [
    { 
      id: "District 1", 
      name: "Coastal Wonders 🐚", 
      municipalities: "Bacacay, Malilipot, Malinao, Santo Domingo, Tiwi, Tabaco City",
      highlights: "Beaches, islands, waterfalls like Busay Falls, Vera Falls, Sogod Beach"
    },
    { 
      id: "District 2", 
      name: "Central Adventure 🌋", 
      municipalities: "Legazpi City, Daraga, Camalig, Manito, Rapu-Rapu",
      highlights: "Mayon Volcano, Cagsawa Ruins, Sumlang Lake, food hubs"
    },
    { 
      id: "District 3", 
      name: "Countryside Escapes 🌾", 
      municipalities: "Ligao City, Guinobatan, Jovellar, Libon, Oas, Pio Duran, Polangui",
      highlights: "Kawa-Kawa Hill, Jovellar Underground River, rural scenic experiences"
    },
  ];

  const travelStyles = [
    { id: "Solo Traveler", icon: "🚶", desc: "Exploring on my own terms" },
    { id: "Couple", icon: "💑", desc: "Romantic getaway" },
    { id: "Family", icon: "👨‍👩‍👧", desc: "Quality time together" },
    { id: "Group", icon: "👥", desc: "Adventures with friends" },
  ];

  const travelPaces = [
    { id: "Relaxing", icon: "🕊️", desc: "Relaxing & Sightseeing", color: "from-blue-400 to-cyan-500" },
    { id: "Thrilling", icon: "⚡", desc: "Thrilling & Active", color: "from-red-500 to-orange-600" },
    { id: "Balanced", icon: "🎒", desc: "Balanced & Flexible", color: "from-green-500 to-teal-600" },
  ];

  const toggleCategory = (category: string) => {
    setPreferences(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const toggleDistrict = (district: string) => {
    setPreferences(prev => ({
      ...prev,
      districts: prev.districts.includes(district)
        ? prev.districts.filter(d => d !== district)
        : [...prev.districts, district]
    }));
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ user_preferences: preferences as any })
        .eq("id", userId);

      if (error) throw error;

      toast.success("🌋 Your Wanderer profile is ready!");
      onComplete();
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast.error("Failed to save preferences. Please try again.");
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1: return true; // Welcome screen
      case 2: return preferences.categories.length > 0;
      case 3: return preferences.districts.length > 0;
      case 4: return preferences.travel_style !== "";
      case 5: return preferences.travel_pace !== "";
      case 6: return true; // Confirmation
      default: return false;
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="text-center space-y-6 py-8">
            <div className="mx-auto p-6 bg-gradient-to-br from-primary to-accent rounded-full w-24 h-24 flex items-center justify-center animate-fade-in">
              <Sparkles className="w-12 h-12 text-primary-foreground" />
            </div>
            <div className="space-y-3">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Welcome to Wanderer 🌋
              </h2>
              <p className="text-xl text-muted-foreground">
                Your Smart Albay Travel Companion!
              </p>
              <p className="text-base text-muted-foreground max-w-md mx-auto">
                Let's personalize your trip experience. We'll ask a few quick questions about what you love to explore.
              </p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-semibold">What kind of traveler are you?</h3>
              <p className="text-muted-foreground">Select all that match your interests</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = preferences.categories.includes(cat.id);
                return (
                  <Card
                    key={cat.id}
                    className={`cursor-pointer transition-all hover:scale-105 ${
                      isSelected ? "border-2 border-primary shadow-lg" : "hover:border-primary/50"
                    }`}
                    onClick={() => toggleCategory(cat.id)}
                  >
                    <CardContent className="p-6">
                      <div className={`p-3 bg-gradient-to-br ${cat.color} rounded-xl w-fit mb-3`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <h4 className="font-semibold text-lg mb-1">{cat.id}</h4>
                      <p className="text-sm text-muted-foreground">{cat.desc}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-semibold">Which part of Albay do you want to explore?</h3>
              <p className="text-muted-foreground">You can select one or more districts</p>
            </div>
            <div className="space-y-4">
              {districts.map((district) => {
                const isSelected = preferences.districts.includes(district.id);
                return (
                  <Card
                    key={district.id}
                    className={`cursor-pointer transition-all hover:scale-102 ${
                      isSelected ? "border-2 border-primary shadow-lg" : "hover:border-primary/50"
                    }`}
                    onClick={() => toggleDistrict(district.id)}
                  >
                    <CardContent className="p-6">
                      <h4 className="font-semibold text-xl mb-2">{district.name}</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        <MapPin className="w-4 h-4 inline mr-1" />
                        {district.municipalities}
                      </p>
                      <p className="text-sm">
                        <Sparkles className="w-4 h-4 inline mr-1 text-primary" />
                        {district.highlights}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-semibold">How do you usually travel?</h3>
              <p className="text-muted-foreground">Choose your travel style</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {travelStyles.map((style) => {
                const isSelected = preferences.travel_style === style.id;
                return (
                  <Card
                    key={style.id}
                    className={`cursor-pointer transition-all hover:scale-105 ${
                      isSelected ? "border-2 border-primary shadow-lg" : "hover:border-primary/50"
                    }`}
                    onClick={() => setPreferences(prev => ({ ...prev, travel_style: style.id }))}
                  >
                    <CardContent className="p-6 text-center">
                      <div className="text-4xl mb-3">{style.icon}</div>
                      <h4 className="font-semibold mb-1">{style.id}</h4>
                      <p className="text-sm text-muted-foreground">{style.desc}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-semibold">What kind of trip pace do you prefer?</h3>
              <p className="text-muted-foreground">Choose your adventure style</p>
            </div>
            <div className="space-y-4">
              {travelPaces.map((pace) => {
                const isSelected = preferences.travel_pace === pace.id;
                return (
                  <Card
                    key={pace.id}
                    className={`cursor-pointer transition-all hover:scale-102 ${
                      isSelected ? "border-2 border-primary shadow-lg" : "hover:border-primary/50"
                    }`}
                    onClick={() => setPreferences(prev => ({ ...prev, travel_pace: pace.id }))}
                  >
                    <CardContent className="p-6 flex items-center gap-4">
                      <div className={`p-4 bg-gradient-to-br ${pace.color} rounded-xl flex-shrink-0`}>
                        <span className="text-3xl">{pace.icon}</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-lg">{pace.desc}</h4>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6 py-4">
            <div className="text-center space-y-3">
              <div className="mx-auto p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full w-20 h-20 flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-semibold">Thanks, Traveler! 🌋</h3>
              <p className="text-muted-foreground">Your Wanderer profile is ready.</p>
              <p className="text-sm text-muted-foreground">
                We'll now recommend the best Albay destinations that match your interests and districts.
              </p>
            </div>

            <div className="space-y-4 bg-muted/50 p-6 rounded-lg">
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  Selected Categories
                </h4>
                <div className="flex flex-wrap gap-2">
                  {preferences.categories.map(cat => (
                    <span key={cat} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                      {cat}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  Chosen Districts
                </h4>
                <div className="flex flex-wrap gap-2">
                  {preferences.districts.map(dist => (
                    <span key={dist} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                      {dist}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  Travel Style
                </h4>
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                  {preferences.travel_style}
                </span>
              </div>

              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" />
                  Travel Pace
                </h4>
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                  {preferences.travel_pace}
                </span>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="space-y-4">
            <DialogTitle className="text-center text-sm text-muted-foreground">
              Step {step} of {totalSteps}
            </DialogTitle>
            <Progress value={progress} className="h-2" />
          </div>
        </DialogHeader>

        <div className="py-4">
          {renderStep()}
        </div>

        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={step === 1}
          >
            Previous
          </Button>
          <Button onClick={handleNext} disabled={!canProceed()}>
            {step === totalSteps ? "Explore Albay" : "Next"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingModal;
