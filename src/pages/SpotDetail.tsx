import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ReviewForm } from "@/components/reviews/ReviewForm";
import { ReviewList } from "@/components/reviews/ReviewList";
import { MapPin, Phone, Star, ArrowLeft, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TouristSpot {
  id: string;
  name: string;
  description: string | null;
  location: string;
  municipality: string | null;
  category: string[];
  image_url: string | null;
  contact_number: string | null;
  rating: number;
  latitude: number | null;
  longitude: number | null;
}

const SpotDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [spot, setSpot] = useState<TouristSpot | null>(null);
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reviewRefreshTrigger, setReviewRefreshTrigger] = useState(0);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (id) {
      fetchSpot();
    }
  }, [id]);

  const fetchSpot = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("tourist_spots")
      .select("*")
      .eq("id", id)
      .single();

    if (!error && data) {
      setSpot(data);
    }
    setIsLoading(false);
  };

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-12 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!spot) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-12">
          <p className="text-center text-muted-foreground">Spot not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container py-8">
        <Link to="/explore">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Explore
          </Button>
        </Link>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Main Image */}
            {spot.image_url && (
              <div className="rounded-lg overflow-hidden shadow-lg">
                <img
                  src={spot.image_url}
                  alt={spot.name}
                  className="w-full h-96 object-cover"
                />
              </div>
            )}

            {/* Details Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl">{spot.name}</CardTitle>
                <div className="flex items-center gap-2 mt-2">
                  {spot.category.map((cat) => (
                    <Badge key={cat} className={getCategoryColor(cat)}>
                      {cat}
                    </Badge>
                  ))}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {spot.description && (
                  <p className="text-muted-foreground">{spot.description}</p>
                )}

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    <span>{spot.location}</span>
                  </div>
                  {spot.municipality && (
                    <div className="text-sm text-muted-foreground ml-7">
                      {spot.municipality}
                    </div>
                  )}
                  {spot.contact_number && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-5 h-5 text-primary" />
                      <span>{spot.contact_number}</span>
                    </div>
                  )}
                  {spot.rating > 0 && (
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{spot.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Reviews Section */}
            <Card>
              <CardHeader>
                <CardTitle>Reviews & Ratings</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="reviews">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="reviews">All Reviews</TabsTrigger>
                    <TabsTrigger value="write" disabled={!session}>
                      {session ? "Write Review" : "Login to Review"}
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="reviews" className="mt-6">
                    <ReviewList
                      spotId={spot.id}
                      currentUserId={session?.user?.id || null}
                      refreshTrigger={reviewRefreshTrigger}
                    />
                  </TabsContent>
                  <TabsContent value="write" className="mt-6">
                    {session && (
                      <ReviewForm
                        spotId={spot.id}
                        userId={session.user.id}
                        onReviewSubmitted={() => {
                          setReviewRefreshTrigger((prev) => prev + 1);
                        }}
                      />
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {spot.latitude && spot.longitude && (
              <Card>
                <CardHeader>
                  <CardTitle>Location on Map</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                    <p className="text-sm text-muted-foreground">
                      Map view coming soon
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpotDetail;