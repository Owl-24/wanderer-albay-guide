import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import { Sparkles, Mountain, UtensilsCrossed, Church, Waves, MapPin, ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-mayon.jpg";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const categories = [
    { icon: Mountain, label: "Nature", color: "from-secondary to-secondary/70" },
    { icon: Church, label: "Culture", color: "from-accent to-accent/70" },
    { icon: Waves, label: "Adventure", color: "from-primary to-primary/70" },
    { icon: UtensilsCrossed, label: "Food", color: "from-orange-500 to-orange-400" },
  ];

  const features = [
    {
      title: "Smart Recommendations",
      description: "AI-powered itinerary suggestions based on your interests",
      icon: Sparkles,
    },
    {
      title: "Interactive Maps",
      description: "Explore Albay's tourist spots with detailed location guides",
      icon: MapPin,
    },
    {
      title: "Local Insights",
      description: "Discover hidden gems and authentic experiences",
      icon: Mountain,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Mayon Volcano at sunset"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/50 to-background" />
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto animate-fade-in">
          <Badge variant="secondary" className="mb-4 bg-primary/20 text-primary-foreground backdrop-blur-sm">
            Powered by AI
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-foreground drop-shadow-lg">
            Explore Albay <br />
            <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              Smarter with Wanderer
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-foreground/90 mb-8 drop-shadow-md">
            Your intelligent travel companion for discovering the beauty of Bicol
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="text-lg gap-2 shadow-xl hover:shadow-2xl transition-all"
              onClick={() => navigate(isAuthenticated ? "/itinerary" : "/auth")}
            >
              <Sparkles className="w-5 h-5" />
              Build Your Itinerary
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg gap-2 bg-background/80 backdrop-blur-sm hover:bg-background"
              onClick={() => navigate("/explore")}
            >
              Explore Destinations
            </Button>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Choose Your <span className="text-primary">Adventure</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Select your interests and let us create the perfect itinerary for your journey
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Card
                  key={category.label}
                  className="cursor-pointer transition-all hover:scale-105 hover:shadow-lg border-2 hover:border-primary/50"
                >
                  <CardContent className="p-6 text-center">
                    <div className={`mx-auto w-16 h-16 rounded-full bg-gradient-to-br ${category.color} flex items-center justify-center mb-4 shadow-lg`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-semibold text-lg">{category.label}</h3>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose <span className="text-accent">Wanderer?</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="border-2 hover:border-primary/50 transition-all">
                  <CardContent className="p-8 text-center">
                    <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-6 shadow-xl">
                      <Icon className="w-10 h-10 text-primary-foreground" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary via-accent to-secondary">
        <div className="container text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-primary-foreground mb-6">
            Ready to Start Your Adventure?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Join thousands of travelers who have discovered Albay's wonders
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="text-lg gap-2 shadow-2xl hover:shadow-3xl transition-all"
            onClick={() => navigate(isAuthenticated ? "/itinerary" : "/auth")}
          >
            Get Started Now
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border/40">
        <div className="container text-center text-muted-foreground">
          <p>© 2025 Wanderer. Optimizing tourist journeys around Albay.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
