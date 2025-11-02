import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Map from "@/components/Map";
import { MapPin } from "lucide-react";

const MapPage = () => {
  const [mapboxToken, setMapboxToken] = useState("");
  const [showTokenInput, setShowTokenInput] = useState(true);

  const handleSubmitToken = () => {
    if (mapboxToken.trim()) {
      setShowTokenInput(false);
    }
  };

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

        {showTokenInput ? (
          <Card className="p-8 max-w-md mx-auto">
            <div className="space-y-4">
              <div className="text-center mb-4">
                <MapPin className="w-12 h-12 text-primary mx-auto mb-3" />
                <h2 className="text-xl font-bold">Enter Mapbox Token</h2>
                <p className="text-sm text-muted-foreground mt-2">
                  Get your free public token from{" "}
                  <a
                    href="https://mapbox.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    mapbox.com
                  </a>
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="mapbox-token">Mapbox Public Token</Label>
                <Input
                  id="mapbox-token"
                  type="text"
                  placeholder="pk.eyJ1..."
                  value={mapboxToken}
                  onChange={(e) => setMapboxToken(e.target.value)}
                />
              </div>
              <Button onClick={handleSubmitToken} className="w-full">
                Load Map
              </Button>
            </div>
          </Card>
        ) : (
          <div className="h-[600px]">
            <Map mapboxToken={mapboxToken} />
          </div>
        )}
      </div>
    </div>
  );
};

export default MapPage;
