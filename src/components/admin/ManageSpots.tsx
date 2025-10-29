import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, MapPin, Loader2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface TouristSpot {
  id: string;
  name: string;
  description: string | null;
  location: string;
  municipality: string | null;
  category: string[];
  contact_number: string | null;
  image_url: string | null;
}

const ManageSpots = () => {
  const [spots, setSpots] = useState<TouristSpot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSpot, setEditingSpot] = useState<TouristSpot | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    municipality: "",
    contact_number: "",
    image_url: "",
    categories: [] as string[],
  });

  const availableCategories = ["Nature", "Culture", "Adventure", "Food", "Beach", "Heritage"];

  useEffect(() => {
    fetchSpots();
  }, []);

  const fetchSpots = async () => {
    const { data, error } = await supabase
      .from("tourist_spots")
      .select("*")
      .order("name");

    if (!error && data) {
      setSpots(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const spotData = {
      name: formData.name,
      description: formData.description || null,
      location: formData.location,
      municipality: formData.municipality || null,
      contact_number: formData.contact_number || null,
      image_url: formData.image_url || null,
      category: formData.categories,
    };

    if (editingSpot) {
      const { error } = await supabase
        .from("tourist_spots")
        .update(spotData)
        .eq("id", editingSpot.id);

      if (error) {
        toast.error("Failed to update spot");
      } else {
        toast.success("Spot updated successfully");
        resetForm();
        fetchSpots();
      }
    } else {
      const { error } = await supabase.from("tourist_spots").insert([spotData]);

      if (error) {
        toast.error("Failed to add spot");
      } else {
        toast.success("Spot added successfully");
        resetForm();
        fetchSpots();
      }
    }

    setIsLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this tourist spot?")) return;

    const { error } = await supabase.from("tourist_spots").delete().eq("id", id);

    if (error) {
      toast.error("Failed to delete spot");
    } else {
      toast.success("Spot deleted successfully");
      fetchSpots();
    }
  };

  const handleEdit = (spot: TouristSpot) => {
    setEditingSpot(spot);
    setFormData({
      name: spot.name,
      description: spot.description || "",
      location: spot.location,
      municipality: spot.municipality || "",
      contact_number: spot.contact_number || "",
      image_url: spot.image_url || "",
      categories: spot.category,
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      location: "",
      municipality: "",
      contact_number: "",
      image_url: "",
      categories: [],
    });
    setEditingSpot(null);
    setIsDialogOpen(false);
  };

  const toggleCategory = (category: string) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Tourist Spots ({spots.length})</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="w-4 h-4 mr-2" />
              Add Spot
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingSpot ? "Edit" : "Add"} Tourist Spot</DialogTitle>
              <DialogDescription>
                Fill in the details for the tourist spot
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
                <Label htmlFor="contact">Contact Number</Label>
                <Input
                  id="contact"
                  value={formData.contact_number}
                  onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
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
              <div>
                <Label className="mb-3 block">Categories *</Label>
                <div className="grid grid-cols-2 gap-3">
                  {availableCategories.map((category) => (
                    <div
                      key={category}
                      className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted"
                    >
                      <Checkbox
                        checked={formData.categories.includes(category)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFormData((prev) => ({
                              ...prev,
                              categories: [...prev.categories, category],
                            }));
                          } else {
                            setFormData((prev) => ({
                              ...prev,
                              categories: prev.categories.filter((c) => c !== category),
                            }));
                          }
                        }}
                      />
                      <label className="cursor-pointer select-none">{category}</label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={isLoading || formData.categories.length === 0}>
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>{editingSpot ? "Update" : "Add"} Spot</>
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
        {spots.map((spot) => (
          <Card key={spot.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="mb-2">{spot.name}</CardTitle>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <MapPin className="w-4 h-4" />
                    {spot.location}
                  </div>
                  {spot.description && (
                    <p className="text-sm text-muted-foreground mb-2">{spot.description}</p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {spot.category.map((cat) => (
                      <Badge key={cat} variant="secondary">
                        {cat}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(spot)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(spot.id)}
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

export default ManageSpots;
