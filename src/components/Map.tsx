import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { X, Navigation } from "lucide-react";

interface MapProps {
  mapboxToken?: string;
}

interface TouristSpot {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  category: string[];
  image_url: string;
  municipality: string;
}

const Map = ({ mapboxToken }: MapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [selectedSpot, setSelectedSpot] = useState<TouristSpot | null>(null);
  const [spots, setSpots] = useState<TouristSpot[]>([]);

  useEffect(() => {
    fetchTouristSpots();
  }, []);

  const fetchTouristSpots = async () => {
    const { data, error } = await supabase
      .from("tourist_spots")
      .select("*")
      .not("latitude", "is", null)
      .not("longitude", "is", null);

    if (error) {
      console.error("Error fetching spots:", error);
      toast.error("Failed to load tourist spots");
      return;
    }

    setSpots(data || []);
  };

  useEffect(() => {
    if (!mapContainer.current || !mapboxToken || map.current) return;

    mapboxgl.accessToken = mapboxToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [123.7454, 13.1391], // Albay, Philippines
      zoom: 10,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    map.current.on("load", () => {
      if (!map.current) return;

      // Add markers for each tourist spot
      spots.forEach((spot) => {
        const el = document.createElement("div");
        el.className = "custom-marker";
        el.style.width = "30px";
        el.style.height = "30px";
        el.style.borderRadius = "50%";
        el.style.backgroundColor = "#ef4444";
        el.style.border = "3px solid white";
        el.style.cursor = "pointer";
        el.style.boxShadow = "0 2px 8px rgba(0,0,0,0.3)";

        new mapboxgl.Marker(el)
          .setLngLat([spot.longitude, spot.latitude])
          .addTo(map.current!)
          .getElement()
          .addEventListener("click", () => {
            setSelectedSpot(spot);
          });
      });
    });

    return () => {
      map.current?.remove();
    };
  }, [mapboxToken, spots]);

  if (!mapboxToken) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground mb-4">
          Mapbox token is required to display the interactive map.
        </p>
        <p className="text-sm text-muted-foreground">
          Add your Mapbox public token to view the map.
        </p>
      </Card>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[600px]">
      <div ref={mapContainer} className="absolute inset-0 rounded-lg" />

      {selectedSpot && (
        <Card className="absolute bottom-6 left-6 right-6 md:left-6 md:right-auto md:max-w-sm p-4 shadow-2xl z-10">
          <button
            onClick={() => setSelectedSpot(null)}
            className="absolute top-2 right-2 p-1 hover:bg-muted rounded-full"
          >
            <X className="w-4 h-4" />
          </button>

          <img
            src={selectedSpot.image_url || "/placeholder.svg"}
            alt={selectedSpot.name}
            className="w-full h-40 object-cover rounded-lg mb-3"
          />

          <h3 className="font-bold text-lg mb-2">{selectedSpot.name}</h3>
          
          <div className="flex gap-2 mb-2">
            {selectedSpot.category.slice(0, 2).map((cat) => (
              <Badge key={cat} variant="secondary">
                {cat}
              </Badge>
            ))}
          </div>

          <p className="text-sm text-muted-foreground mb-2">
            {selectedSpot.municipality}
          </p>

          <p className="text-sm line-clamp-3 mb-3">{selectedSpot.description}</p>

          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => {
              window.open(
                `https://www.google.com/maps/dir/?api=1&destination=${selectedSpot.latitude},${selectedSpot.longitude}`,
                "_blank"
              );
            }}
          >
            <Navigation className="w-4 h-4 mr-2" />
            Get Directions
          </Button>
        </Card>
      )}
    </div>
  );
};

export default Map;
