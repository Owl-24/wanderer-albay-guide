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
  // Step 2
  name: string;
  traveling_from: string;
  traveling_with: string;
  age_range: string;
  
  // Step 3
  trip_intent: string[];
  trip_duration: string;
  
  // Step 4
  interests: string[];
  
  // Step 5
  districts: string[];
  
  // Step 6
  traveler_type: string;
  budget: string;
  
  // Step 7
  tour_preference: string;
  want_itineraries: boolean;
  want_restaurants: boolean;
  want_hidden_spots: boolean;
}

const OnboardingModal = ({ open, onComplete, userId }: OnboardingModalProps) => {
  const [step, setStep] = useState(1);
  const [preferences, setPreferences] = useState<UserPreferences>({
    name: "",
    traveling_from: "",
    traveling_with: "",
    age_range: "",
    trip_intent: [],
    trip_duration: "",
    interests: [],
    districts: [],
    traveler_type: "",
    budget: "",
    tour_preference: "",
    want_itineraries: true,
    want_restaurants: true,
    want_hidden_spots: true,
  });

  const totalSteps = 8;
  const progress = (step / totalSteps) * 100;

  const tripIntents = [
    { id: "Vacation", icon: "🌋", desc: "Relaxation and fun" },
    { id: "Business", icon: "💼", desc: "Work and networking" },
    { id: "Culture & Heritage", icon: "🗿", desc: "Historical exploration" },
    { id: "Food & Local Experience", icon: "🍽️", desc: "Culinary adventure" },
    { id: "Adventure / Nature", icon: "🧗", desc: "Outdoor activities" },
  ];

  const interests = [
    { id: "Beaches & Nature", icon: Waves, color: "from-blue-500 to-cyan-600", emoji: "" },
    { id: "Culture & Heritage", icon: Landmark, color: "from-purple-500 to-pink-600", emoji: "" },
    { id: "Food & Cuisine", icon: UtensilsCrossed, color: "from-orange-500 to-red-600", emoji: "" },
    { id: "Adventure & Outdoor", icon: Mountain, color: "from-yellow-500 to-orange-600", emoji: "" },
    { id: "Shopping & Local Finds", icon: null, color: "from-green-500 to-emerald-600", emoji: "🛍️" },
    { id: "Photography & Sightseeing", icon: null, color: "from-pink-500 to-rose-600", emoji: "📸" },
  ];

  const districts = [
    { 
      id: "District 1", 
      name: "Tiwi, Malinao, Tabaco 🏝️", 
      desc: "Beaches & Hot Springs",
      municipalities: "Bacacay, Malilipot, Malinao, Santo Domingo, Tiwi, Tabaco City",
      highlights: "Beaches, islands, waterfalls, hot springs"
    },
    { 
      id: "District 2", 
      name: "Camalig, Guinobatan, Ligao 🌳", 
      desc: "Caves & Nature",
      municipalities: "Camalig, Guinobatan, Ligao City, Jovellar",
      highlights: "Hoyop-Hoyopan Cave, waterfalls, nature trails"
    },
    { 
      id: "District 3", 
      name: "Daraga, Legazpi, Manito 🏰", 
      desc: "Mayon & Culture",
      municipalities: "Legazpi City, Daraga, Manito, Rapu-Rapu",
      highlights: "Mayon Volcano, Cagsawa Ruins, churches, museums"
    },
  ];

  const travelerTypes = [
    { id: "Relaxed", icon: "😌", desc: "Taking it slow and easy" },
    { id: "Explorer", icon: "🧭", desc: "Always seeking new places" },
    { id: "Foodie", icon: "🍜", desc: "Food is the highlight" },
    { id: "Culture Lover", icon: "🎭", desc: "Immersed in local culture" },
    { id: "Adventurer", icon: "🧗", desc: "Thrill-seeking activities" },
  ];

  const budgets = [
    { id: "Budget", icon: "💰", desc: "Cost-conscious travel" },
    { id: "Mid-range", icon: "💸", desc: "Balanced spending" },
    { id: "Luxury", icon: "💎", desc: "Premium experiences" },
  ];

  const travelingWithOptions = [
    { id: "Solo", icon: "🚶", desc: "Exploring on my own" },
    { id: "Family", icon: "👨‍👩‍👧", desc: "Quality family time" },
    { id: "Friends", icon: "👥", desc: "Group adventure" },
    { id: "Couple", icon: "💑", desc: "Romantic getaway" },
  ];

  const ageRanges = [
    { id: "<18", label: "Under 18" },
    { id: "18-25", label: "18-25 years" },
    { id: "26-40", label: "26-40 years" },
    { id: "41-60", label: "41-60 years" },
    { id: "60+", label: "60+ years" },
  ];

  const durations = [
    { id: "1 day", icon: "☀️" },
    { id: "2-3 days", icon: "🌙" },
    { id: "4-7 days", icon: "🗓️" },
    { id: "More than a week", icon: "📅" },
  ];

  const toggleArrayItem = (key: keyof UserPreferences, value: string) => {
    setPreferences(prev => {
      const array = prev[key] as string[];
      return {
        ...prev,
        [key]: array.includes(value)
          ? array.filter(item => item !== value)
          : [...array, value]
      };
    });
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
      case 1: return true;
      case 2: return preferences.name && preferences.traveling_from && preferences.traveling_with && preferences.age_range;
      case 3: return preferences.trip_intent.length > 0 && preferences.trip_duration;
      case 4: return preferences.interests.length > 0;
      case 5: return preferences.districts.length > 0;
      case 6: return preferences.traveler_type && preferences.budget;
      case 7: return preferences.tour_preference;
      case 8: return true;
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
              <h3 className="text-2xl font-semibold">Tell us about yourself</h3>
              <p className="text-muted-foreground">Help us personalize your experience</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">What's your name or nickname?</label>
                <input
                  type="text"
                  placeholder="Enter your name..."
                  value={preferences.name}
                  onChange={(e) => setPreferences(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-3 border rounded-lg bg-background"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Where are you traveling from?</label>
                <input
                  type="text"
                  placeholder="City, Country"
                  value={preferences.traveling_from}
                  onChange={(e) => setPreferences(prev => ({ ...prev, traveling_from: e.target.value }))}
                  className="w-full p-3 border rounded-lg bg-background"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Who are you traveling with?</label>
                <div className="grid grid-cols-2 gap-3">
                  {travelingWithOptions.map((opt) => {
                    const isSelected = preferences.traveling_with === opt.id;
                    return (
                      <Card
                        key={opt.id}
                        className={`cursor-pointer transition-all ${
                          isSelected ? "border-2 border-primary shadow-lg" : "hover:border-primary/50"
                        }`}
                        onClick={() => setPreferences(prev => ({ ...prev, traveling_with: opt.id }))}
                      >
                        <CardContent className="p-4 text-center">
                          <div className="text-3xl mb-2">{opt.icon}</div>
                          <h4 className="font-semibold text-sm">{opt.id}</h4>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Age range</label>
                <div className="grid grid-cols-3 gap-2">
                  {ageRanges.map((age) => {
                    const isSelected = preferences.age_range === age.id;
                    return (
                      <button
                        key={age.id}
                        className={`p-2 rounded-lg border transition-all ${
                          isSelected ? "border-primary bg-primary/10 font-semibold" : "hover:border-primary/50"
                        }`}
                        onClick={() => setPreferences(prev => ({ ...prev, age_range: age.id }))}
                      >
                        {age.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-semibold">Trip Intent & Duration</h3>
              <p className="text-muted-foreground">What brings you to Albay?</p>
            </div>
            <div>
              <label className="text-sm font-medium mb-3 block">Select all that apply</label>
              <div className="grid grid-cols-2 gap-3">
                {tripIntents.map((intent) => {
                  const isSelected = preferences.trip_intent.includes(intent.id);
                  return (
                    <Card
                      key={intent.id}
                      className={`cursor-pointer transition-all ${
                        isSelected ? "border-2 border-primary shadow-lg" : "hover:border-primary/50"
                      }`}
                      onClick={() => toggleArrayItem('trip_intent', intent.id)}
                    >
                      <CardContent className="p-4 text-center">
                        <div className="text-3xl mb-2">{intent.icon}</div>
                        <h4 className="font-semibold text-sm mb-1">{intent.id}</h4>
                        <p className="text-xs text-muted-foreground">{intent.desc}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-3 block">How long will you stay?</label>
              <div className="grid grid-cols-2 gap-3">
                {durations.map((dur) => {
                  const isSelected = preferences.trip_duration === dur.id;
                  return (
                    <Card
                      key={dur.id}
                      className={`cursor-pointer transition-all ${
                        isSelected ? "border-2 border-primary shadow-lg" : "hover:border-primary/50"
                      }`}
                      onClick={() => setPreferences(prev => ({ ...prev, trip_duration: dur.id }))}
                    >
                      <CardContent className="p-4 text-center">
                        <div className="text-3xl mb-2">{dur.icon}</div>
                        <h4 className="font-semibold text-sm">{dur.id}</h4>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-semibold">What experiences do you enjoy most?</h3>
              <p className="text-muted-foreground">Select all that apply</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {interests.map((interest) => {
                const isSelected = preferences.interests.includes(interest.id);
                const Icon = interest.icon;
                return (
                  <Card
                    key={interest.id}
                    className={`cursor-pointer transition-all hover:scale-105 ${
                      isSelected ? "border-2 border-primary shadow-lg" : "hover:border-primary/50"
                    }`}
                    onClick={() => toggleArrayItem('interests', interest.id)}
                  >
                    <CardContent className="p-6 text-center">
                      {Icon ? (
                        <div className={`p-3 bg-gradient-to-br ${interest.color} rounded-xl w-fit mx-auto mb-3`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                      ) : (
                        <div className="text-4xl mb-3">{interest.emoji}</div>
                      )}
                      <h4 className="font-semibold text-sm">{interest.id}</h4>
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
              <h3 className="text-2xl font-semibold">Which part of Albay would you like to explore?</h3>
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
                    onClick={() => toggleArrayItem('districts', district.id)}
                  >
                    <CardContent className="p-6">
                      <h4 className="font-semibold text-xl mb-2">{district.name}</h4>
                      <p className="text-sm font-medium text-primary mb-3">{district.desc}</p>
                      <p className="text-sm text-muted-foreground mb-2">
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

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-semibold">Travel Preferences</h3>
              <p className="text-muted-foreground">Customize your experience</p>
            </div>
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium mb-3 block">What type of traveler are you?</label>
                <div className="grid grid-cols-2 gap-3">
                  {travelerTypes.map((type) => {
                    const isSelected = preferences.traveler_type === type.id;
                    return (
                      <Card
                        key={type.id}
                        className={`cursor-pointer transition-all ${
                          isSelected ? "border-2 border-primary shadow-lg" : "hover:border-primary/50"
                        }`}
                        onClick={() => setPreferences(prev => ({ ...prev, traveler_type: type.id }))}
                      >
                        <CardContent className="p-4 text-center">
                          <div className="text-3xl mb-2">{type.icon}</div>
                          <h4 className="font-semibold text-sm mb-1">{type.id}</h4>
                          <p className="text-xs text-muted-foreground">{type.desc}</p>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-3 block">What's your budget range?</label>
                <div className="grid grid-cols-3 gap-3">
                  {budgets.map((budget) => {
                    const isSelected = preferences.budget === budget.id;
                    return (
                      <Card
                        key={budget.id}
                        className={`cursor-pointer transition-all ${
                          isSelected ? "border-2 border-primary shadow-lg" : "hover:border-primary/50"
                        }`}
                        onClick={() => setPreferences(prev => ({ ...prev, budget: budget.id }))}
                      >
                        <CardContent className="p-4 text-center">
                          <div className="text-3xl mb-2">{budget.icon}</div>
                          <h4 className="font-semibold text-sm mb-1">{budget.id}</h4>
                          <p className="text-xs text-muted-foreground">{budget.desc}</p>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-semibold">Personalization Options</h3>
              <p className="text-muted-foreground">How can Wanderer help you?</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-3 block">Do you prefer guided or self-guided tours?</label>
                <div className="grid grid-cols-2 gap-3">
                  {["Guided Tours", "Self-Guided"].map((pref) => {
                    const isSelected = preferences.tour_preference === pref;
                    return (
                      <Card
                        key={pref}
                        className={`cursor-pointer transition-all ${
                          isSelected ? "border-2 border-primary shadow-lg" : "hover:border-primary/50"
                        }`}
                        onClick={() => setPreferences(prev => ({ ...prev, tour_preference: pref }))}
                      >
                        <CardContent className="p-4 text-center">
                          <h4 className="font-semibold">{pref}</h4>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-3 block">Would you like Wanderer to suggest:</label>
                <div className="space-y-3">
                  <Card className={`border-2 transition-all ${preferences.want_itineraries ? 'border-primary' : ''}`}>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">📅</span>
                        <span className="font-medium">Itineraries</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={preferences.want_itineraries}
                        onChange={(e) => setPreferences(prev => ({ ...prev, want_itineraries: e.target.checked }))}
                        className="w-5 h-5"
                      />
                    </CardContent>
                  </Card>
                  <Card className={`border-2 transition-all ${preferences.want_restaurants ? 'border-primary' : ''}`}>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🍴</span>
                        <span className="font-medium">Nearby Restaurants</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={preferences.want_restaurants}
                        onChange={(e) => setPreferences(prev => ({ ...prev, want_restaurants: e.target.checked }))}
                        className="w-5 h-5"
                      />
                    </CardContent>
                  </Card>
                  <Card className={`border-2 transition-all ${preferences.want_hidden_spots ? 'border-primary' : ''}`}>
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🏞️</span>
                        <span className="font-medium">Hidden Spots</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={preferences.want_hidden_spots}
                        onChange={(e) => setPreferences(prev => ({ ...prev, want_hidden_spots: e.target.checked }))}
                        className="w-5 h-5"
                      />
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        );

      case 8:
        return (
          <div className="space-y-6 py-4">
            <div className="text-center space-y-3">
              <div className="mx-auto p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full w-20 h-20 flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-semibold">Thank you, {preferences.name}! 🎉</h3>
              <p className="text-muted-foreground">Your Wanderer travel profile is ready.</p>
              <p className="text-sm text-muted-foreground">
                Based on your answers, we've curated the best destinations for you.
              </p>
            </div>

            <div className="space-y-4 bg-muted/50 p-6 rounded-lg max-h-96 overflow-y-auto">
              <div>
                <h4 className="font-semibold mb-2">Traveler Profile</h4>
                <p className="text-sm text-muted-foreground">From {preferences.traveling_from} • {preferences.traveling_with} • {preferences.age_range}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Trip Details</h4>
                <div className="flex flex-wrap gap-2 mb-2">
                  {preferences.trip_intent.map(intent => (
                    <span key={intent} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                      {intent}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">Duration: {preferences.trip_duration}</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  Interests
                </h4>
                <div className="flex flex-wrap gap-2">
                  {preferences.interests.map(interest => (
                    <span key={interest} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  Districts
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
                <h4 className="font-semibold mb-2">Travel Style</h4>
                <p className="text-sm">
                  {preferences.traveler_type} • {preferences.budget} • {preferences.tour_preference}
                </p>
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
