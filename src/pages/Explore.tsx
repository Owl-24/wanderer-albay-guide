import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Search, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    fetchSpots();
  }, []);

  useEffect(() => {
    filterSpots();
  }, [searchQuery, selectedCategory, spots]);

  const fetchSpots = async () => {
    const { data, error } = await supabase
      .from("tourist_spots")
      .select("*")
      .order("name");

    if (!error && data) {
      setSpots(data);
    }
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

    if (selectedCategory) {
      filtered = filtered.filter((spot) => spot.category.includes(selectedCategory));
    }

    setFilteredSpots(filtered);
  };

  const categories = ["Nature", "Culture", "Adventure", "Food", "Beach", "Heritage"];

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Nature: "bg-secondary text-secondary-foreground",
      Culture: "bg-accent text-accent-foreground",
      Adventure: "bg-primary text-primary-foreground",
      Food: "bg-orange-500 text-white",
      Beach: "bg-blue-500 text-white",
      Heritage: "bg-purple-500 text-white",
    };
    return colors[category] || "bg-muted";
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
            Discover amazing destinations across the province
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
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
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              All
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Spots Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSpots.length > 0 ? (
            filteredSpots.map((spot) => (
              <Card
                key={spot.id}
                className="overflow-hidden hover:shadow-xl transition-all hover:scale-105 cursor-pointer"
                onClick={() => navigate(`/spot/${spot.id}`)}
              >
                {spot.image_url && (
                  <div className="h-48 overflow-hidden bg-muted">
                    <img
                      src={spot.image_url}
                      alt={spot.name}
                      className="w-full h-full object-cover"
                    />
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
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {spot.description}
                    </p>
                  )}
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                    <MapPin className="w-4 h-4" />
                    <span className="line-clamp-1">{spot.location}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {spot.category.map((cat) => (
                      <Badge key={cat} className={getCategoryColor(cat)} variant="secondary">
                        {cat}
                      </Badge>
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
      </div>
    </div>
  );
};

export default Explore;
