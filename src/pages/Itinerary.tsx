import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Sparkles, Save, MapPin, Loader2 } from "lucide-react";
import { Session } from "@supabase/supabase-js";

interface TouristSpot {
  id: string;
  name: string;
  description: string | null;
  location: string;
  municipality: string | null;
  category: string[];
  image_url: string | null;
}

const Itinerary = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [recommendedSpots, setRecommendedSpots] = useState<TouristSpot[]>([]);
  const [selectedSpots, setSelectedSpots] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        navigate("/auth");
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const categories = [
    { name: "Nature", icon: "🌳", description: "Mountains, lakes, and natural wonders" },
    { name: "Culture", icon: "🏯", description: "Churches, museums, and heritage sites" },
    { name: "Adventure", icon: "🧗", description: "Thrilling outdoor activities" },
    { name: "Food", icon: "🍜", description: "Local cuisine and restaurants" },
  ];

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const generateItinerary = async () => {
    if (selectedCategories.length === 0) {
      toast.error("Please select at least one interest");
      return;
    }

    setIsGenerating(true);

    const { data, error } = await supabase
      .from("tourist_spots")
      .select("*")
      .overlaps("category", selectedCategories);

    setIsGenerating(false);

    if (error) {
      toast.error("Failed to generate recommendations");
      return;
    }

    setRecommendedSpots(data || []);
    setSelectedSpots(data?.map((spot) => spot.id) || []);
    toast.success(`Found ${data?.length || 0} amazing spots for you!`);
  };

  const toggleSpot = (spotId: string) => {
    setSelectedSpots((prev) =>
      prev.includes(spotId) ? prev.filter((id) => id !== spotId) : [...prev, spotId]
    );
  };

  const saveItinerary = async () => {
    if (!session?.user) {
      toast.error("Please sign in to save your itinerary");
      return;
    }

    if (selectedSpots.length === 0) {
      toast.error("Please select at least one destination");
      return;
    }

    setIsSaving(true);

    const selectedSpotsData = recommendedSpots.filter((spot) =>
      selectedSpots.includes(spot.id)
    );

    const { error } = await supabase.from("itineraries").insert([{
      user_id: session.user.id,
      name: `${selectedCategories.join(" & ")} Adventure`,
      selected_categories: selectedCategories,
      spots: selectedSpotsData as any,
    }]);

    setIsSaving(false);

    if (error) {
      toast.error("Failed to save itinerary");
    } else {
      toast.success("Itinerary saved successfully!");
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center gap-2 mb-4">
              <Sparkles className="w-8 h-8 text-accent" />
              <h1 className="text-4xl md:text-5xl font-bold">
                Build Your <span className="text-primary">Itinerary</span>
              </h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Select your interests and we'll recommend the perfect spots for your adventure
            </p>
          </div>

          {/* Interest Selection */}
          <Card className="mb-8 shadow-lg">
            <CardHeader>
              <CardTitle>Choose Your Interests</CardTitle>
              <CardDescription>
                Select one or more categories that match your travel style
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4">
                {categories.map((category) => (
                  <div
                    key={category.name}
                    onClick={() => toggleCategory(category.name)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                      selectedCategories.includes(category.name)
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selectedCategories.includes(category.name)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-2xl">{category.icon}</span>
                          <h3 className="font-semibold text-lg">{category.name}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {category.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                onClick={generateItinerary}
                className="w-full mt-6 gap-2"
                size="lg"
                disabled={isGenerating || selectedCategories.length === 0}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate Recommendations
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Recommended Spots */}
          {recommendedSpots.length > 0 && (
            <Card className="shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Your Personalized Itinerary</CardTitle>
                    <CardDescription>
                      {selectedSpots.length} of {recommendedSpots.length} destinations selected
                    </CardDescription>
                  </div>
                  <Button
                    onClick={saveItinerary}
                    disabled={isSaving || selectedSpots.length === 0}
                    className="gap-2"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Itinerary
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {recommendedSpots.map((spot) => (
                  <div
                    key={spot.id}
                    onClick={() => toggleSpot(spot.id)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                      selectedSpots.includes(spot.id)
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox checked={selectedSpots.includes(spot.id)} className="mt-1" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">{spot.name}</h3>
                        {spot.description && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {spot.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <MapPin className="w-4 h-4" />
                          {spot.location}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {spot.category.map((cat) => (
                            <Badge key={cat} variant="secondary">
                              {cat}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Itinerary;
