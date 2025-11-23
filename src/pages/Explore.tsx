import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Search, Star, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Session } from "@supabase/supabase-js";
import AccommodationsSection from "@/components/AccommodationsSection";

interface TouristSpot {
  id: string;
  name: string;
  description: string | null;
  location: string;
  municipality: string | null;
  category: string[];
  image_url: string | null;
  rating: number;
}

const Explore = () => {
  const navigate = useNavigate();
  const [spots, setSpots] = useState<TouristSpot[]>([]);
  const [filteredSpots, setFilteredSpots] = useState<TouristSpot[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    fetchSpots();
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    filterSpots();
  }, [searchQuery, selectedCategories, spots]);

  const fetchSpots = async () => {
    const { data, error } = await supabase.from("tourist_spots").select("*").order("name");
    if (!error && data) setSpots(data);
  };

  const filterSpots = () => {
    let filtered = spots;
    if (searchQuery) {
      filtered = filtered.filter(
        (spot) =>
          spot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          spot.municipality?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((spot) => selectedCategories.every((cat) => spot.category.includes(cat)));
    }
    setFilteredSpots(filtered);
  };

  const categories = [
    "Nature", "Culture", "Adventure", "Food", "Beach", "Heritage",
    "Religious Sites", "Waterfalls", "Mountains", "Museums", "Parks",
    "Festivals", "Shopping", "Eco-tourism",
  ];

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Nature: "bg-green-500 text-white",
      Culture: "bg-yellow-500 text-white",
      Adventure: "bg-red-500 text-white",
      Food: "bg-orange-500 text-white",
      Beach: "bg-blue-500 text-white",
      Heritage: "bg-purple-500 text-white",
      "Religious Sites": "bg-indigo-500 text-white",
      Waterfalls: "bg-cyan-500 text-white",
      Mountains: "bg-emerald-600 text-white",
      Museums: "bg-pink-500 text-white",
      Parks: "bg-lime-500 text-white",
      Festivals: "bg-fuchsia-500 text-white",
      Shopping: "bg-rose-500 text-white",
      "Eco-tourism": "bg-teal-500 text-white",
    };
    return colors[category] || "bg-muted text-muted-foreground";
  };

  const addToItinerary = async (spot: TouristSpot, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!session?.user) {
      toast.error("Please sign in to add to itinerary");
      navigate("/auth");
      return;
    }
    const { error } = await supabase.from("itineraries").insert([{
      user_id: session.user.id,
      name: `Quick Trip - ${spot.name}`,
      selected_categories: spot.category,
      spots: [spot] as any,
    }]);
    if (error) toast.error("Failed to add to itinerary");
    else toast.success("Added to your itinerary!");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-12">
        <div className="mb-12 text-center animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Explore <span className="text-primary">Albay</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover amazing destinations and places to stay across the province
          </p>
        </div>

        <Tabs defaultValue="destinations" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="destinations">
              <MapPin className="w-4 h-4 mr-2" /> Tourist Destinations
            </TabsTrigger>
            <TabsTrigger value="accommodations">
              <Building2 className="w-4 h-4 mr-2" /> Hotels & Accommodations
            </TabsTrigger>
          </TabsList>

          {/* DESTINATIONS TAB */}
          <TabsContent value="destinations" className="space-y-8">
            {/* Search and Filters */}
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search destinations or municipalities..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedCategories.length === 0 ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategories([])}
                >
                  All
                </Button>
                {categories.map((category) => {
                  const isSelected = selectedCategories.includes(category);
                  return (
                    <Button
                      key={category}
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      onClick={() =>
                        setSelectedCategories((prev) =>
                          isSelected ? prev.filter((c) => c !== category) : [...prev, category]
                        )
                      }
                    >
                      {category}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Spots Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSpots.length > 0 ? (
                filteredSpots.map((spot) => (
                  <Card
                    key={spot.id}
                    className="overflow-hidden hover:shadow-xl transition-all hover:scale-105 cursor-pointer relative group"
                    onClick={() => navigate(`/spot/${spot.id}`)}
                  >
                    {spot.image_url && (
                      <div className="h-48 overflow-hidden bg-muted">
                        <img src={spot.image_url} alt={spot.name} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <CardHeader>
                      <CardTitle className="flex items-start justify-between gap-2">
                        <span className="line-clamp-2">{spot.name}</span>
                        {spot.rating > 0 && (
                          <div className="flex items-center gap-1 text-yellow-500 text-sm">
                            <Star className="w-4 h-4 fill-current" />
                            {spot.rating}
                          </div>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {spot.description && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{spot.description}</p>
                      )}
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                        <MapPin className="w-4 h-4" />
                        <span className="line-clamp-1">{spot.location}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {spot.category.map((cat) => (
                          <Badge key={cat} className={getCategoryColor(cat)} variant="secondary">{cat}</Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-lg text-muted-foreground">No destinations found</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* ACCOMMODATIONS TAB */}
          <TabsContent value="accommodations">
            <AccommodationsSection userId={session?.user?.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Explore;
