import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, UtensilsCrossed, Loader2 } from "lucide-react";

interface Restaurant {
  id: string;
  name: string;
  food_type: string | null;
  location: string;
  municipality: string | null;
  description: string | null;
  image_url: string | null;
}

const ManageRestaurants = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    food_type: "",
    location: "",
    municipality: "",
    description: "",
    image_url: "",
  });

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    const { data, error } = await supabase
      .from("restaurants")
      .select("*")
      .order("name");

    if (!error && data) {
      setRestaurants(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const restaurantData = {
      name: formData.name,
      food_type: formData.food_type || null,
      location: formData.location,
      municipality: formData.municipality || null,
      description: formData.description || null,
      image_url: formData.image_url || null,
    };

    if (editingRestaurant) {
      const { error } = await supabase
        .from("restaurants")
        .update(restaurantData)
        .eq("id", editingRestaurant.id);

      if (error) {
        toast.error("Failed to update restaurant");
      } else {
        toast.success("Restaurant updated successfully");
        resetForm();
        fetchRestaurants();
      }
    } else {
      const { error } = await supabase.from("restaurants").insert([restaurantData]);

      if (error) {
        toast.error("Failed to add restaurant");
      } else {
        toast.success("Restaurant added successfully");
        resetForm();
        fetchRestaurants();
      }
    }

    setIsLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this restaurant?")) return;

    const { error } = await supabase.from("restaurants").delete().eq("id", id);

    if (error) {
      toast.error("Failed to delete restaurant");
    } else {
      toast.success("Restaurant deleted successfully");
      fetchRestaurants();
    }
  };

  const handleEdit = (restaurant: Restaurant) => {
    setEditingRestaurant(restaurant);
    setFormData({
      name: restaurant.name,
      food_type: restaurant.food_type || "",
      location: restaurant.location,
      municipality: restaurant.municipality || "",
      description: restaurant.description || "",
      image_url: restaurant.image_url || "",
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      food_type: "",
      location: "",
      municipality: "",
      description: "",
      image_url: "",
    });
    setEditingRestaurant(null);
    setIsDialogOpen(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Restaurants ({restaurants.length})</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="w-4 h-4 mr-2" />
              Add Restaurant
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingRestaurant ? "Edit" : "Add"} Restaurant</DialogTitle>
              <DialogDescription>
                Fill in the restaurant details
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="food_type">Food Type</Label>
                <Input
                  id="food_type"
                  value={formData.food_type}
                  onChange={(e) => setFormData({ ...formData, food_type: e.target.value })}
                  placeholder="e.g., Filipino, Italian, Seafood"
                />
              </div>
              <div>
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="municipality">Municipality</Label>
                <Input
                  id="municipality"
                  value={formData.municipality}
                  onChange={(e) => setFormData({ ...formData, municipality: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="image">Image URL</Label>
                <Input
                  id="image"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>{editingRestaurant ? "Update" : "Add"} Restaurant</>
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {restaurants.map((restaurant) => (
          <Card key={restaurant.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <UtensilsCrossed className="w-5 h-5 text-accent" />
                    <CardTitle>{restaurant.name}</CardTitle>
                  </div>
                  {restaurant.food_type && (
                    <p className="text-sm font-medium text-primary mb-1">
                      {restaurant.food_type}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground mb-2">{restaurant.location}</p>
                  {restaurant.description && (
                    <p className="text-sm text-muted-foreground">{restaurant.description}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(restaurant)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(restaurant.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ManageRestaurants;
