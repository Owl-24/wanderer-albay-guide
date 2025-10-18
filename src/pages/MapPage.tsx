import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { MapPin } from "lucide-react";

const MapPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container py-12">
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Interactive <span className="text-primary">Map</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore all tourist destinations across Albay on an interactive map
          </p>
        </div>

        <Card className="p-8 bg-muted/30">
          <div className="flex flex-col items-center justify-center min-h-[500px] text-center">
            <MapPin className="w-20 h-20 text-primary mb-6" />
            <h2 className="text-2xl font-bold mb-4">Map Integration Coming Soon</h2>
            <p className="text-muted-foreground max-w-md mb-6">
              We're working on integrating an interactive map with all tourist spots in Albay.
              This feature will include directions, nearby amenities, and real-time location tracking.
            </p>
            <div className="flex flex-wrap gap-3 justify-center text-sm text-muted-foreground">
              <div className="flex items-center gap-2 bg-background px-4 py-2 rounded-full">
                <MapPin className="w-4 h-4 text-primary" />
                <span>Tourist Spots</span>
              </div>
              <div className="flex items-center gap-2 bg-background px-4 py-2 rounded-full">
                <MapPin className="w-4 h-4 text-accent" />
                <span>Restaurants</span>
              </div>
              <div className="flex items-center gap-2 bg-background px-4 py-2 rounded-full">
                <MapPin className="w-4 h-4 text-secondary" />
                <span>Hotels</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MapPage;
