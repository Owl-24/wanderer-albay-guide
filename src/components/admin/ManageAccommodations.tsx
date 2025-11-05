import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Building2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Accommodation {
  id: string;
  name: string;
  description: string;
  location: string;
  municipality: string;
  category: string[];
  image_url: string;
  contact_number: string;
  email: string;
  price_range: string;
  amenities: string[];
  rating: number;
}

const ManageAccommodations = () => {
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    municipality: "",
    category: "",
    image_url: "",
    contact_number: "",
    email: "",
    price_range: "",
    amenities: "",
    rating: 0,
  });

  useEffect(() => {
    fetchAccommodations();
  }, []);

  const fetchAccommodations = async () => {
    const { data, error } = await supabase
      .from("accommodations")
      .select("*")
      .order("name");

    if (!error && data) {
      setAccommodations(data);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      location: "",
      municipality: "",
      category: "",
      image_url: "",
      contact_number: "",
      email: "",
      price_range: "",
      amenities: "",
      rating: 0,
    });
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const accommodationData = {
      ...formData,
      category: formData.category.split(",").map((c) => c.trim()),
      amenities: formData.amenities.split(",").map((a) => a.trim()),
    };

    if (editingId) {
      const { error } = await supabase
        .from("accommodations")
        .update(accommodationData)
        .eq("id", editingId);

      if (error) {
        toast.error("Failed to update accommodation");
      } else {
        toast.success("Accommodation updated successfully");
        setIsOpen(false);
        resetForm();
        fetchAccommodations();
      }
    } else {
      const { error } = await supabase
        .from("accommodations")
        .insert([accommodationData]);

      if (error) {
        toast.error("Failed to add accommodation");
      } else {
        toast.success("Accommodation added successfully");
        setIsOpen(false);
        resetForm();
        fetchAccommodations();
      }
    }
  };

  const handleEdit = (accommodation: Accommodation) => {
    setFormData({
      name: accommodation.name,
      description: accommodation.description || "",
      location: accommodation.location,
      municipality: accommodation.municipality || "",
      category: accommodation.category?.join(", ") || "",
      image_url: accommodation.image_url || "",
      contact_number: accommodation.contact_number || "",
      email: accommodation.email || "",
      price_range: accommodation.price_range || "",
      amenities: accommodation.amenities?.join(", ") || "",
      rating: accommodation.rating || 0,
    });
    setEditingId(accommodation.id);
    setIsOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this accommodation?")) return;

    const { error } = await supabase.from("accommodations").delete().eq("id", id);

    if (error) {
      toast.error("Failed to delete accommodation");
    } else {
      toast.success("Accommodation deleted successfully");
      fetchAccommodations();
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Manage Accommodations</h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Add Accommodation
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Edit Accommodation" : "Add New Accommodation"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="municipality">Municipality</Label>
                  <Input
                    id="municipality"
                    value={formData.municipality}
                    onChange={(e) =>
                      setFormData({ ...formData, municipality: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="category">Categories (comma-separated)</Label>
                <Input
                  id="category"
                  placeholder="Luxury, Beach Resort, All-Inclusive"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="amenities">Amenities (comma-separated)</Label>
                <Input
                  id="amenities"
                  placeholder="WiFi, Pool, Restaurant, Spa"
                  value={formData.amenities}
                  onChange={(e) =>
                    setFormData({ ...formData, amenities: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price_range">Price Range</Label>
                  <Input
                    id="price_range"
                    placeholder="₱1,500 - ₱3,000"
                    value={formData.price_range}
                    onChange={(e) =>
                      setFormData({ ...formData, price_range: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="rating">Rating (0-5)</Label>
                  <Input
                    id="rating"
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={formData.rating}
                    onChange={(e) =>
                      setFormData({ ...formData, rating: parseFloat(e.target.value) })
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="image_url">Image URL</Label>
                <Input
                  id="image_url"
                  type="url"
                  value={formData.image_url}
                  onChange={(e) =>
                    setFormData({ ...formData, image_url: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contact_number">Contact Number</Label>
                  <Input
                    id="contact_number"
                    value={formData.contact_number}
                    onChange={(e) =>
                      setFormData({ ...formData, contact_number: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsOpen(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingId ? "Update" : "Add"} Accommodation
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accommodations.map((accommodation) => (
          <Card key={accommodation.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{accommodation.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {accommodation.municipality || accommodation.location}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => handleEdit(accommodation)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="destructive"
                    onClick={() => handleDelete(accommodation.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {accommodation.image_url ? (
                <img
                  src={accommodation.image_url}
                  alt={accommodation.name}
                  className="w-full h-32 object-cover rounded mb-3"
                />
              ) : (
                <div className="w-full h-32 bg-muted rounded mb-3 flex items-center justify-center">
                  <Building2 className="w-12 h-12 text-muted-foreground" />
                </div>
              )}
              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                {accommodation.description}
              </p>
              {accommodation.price_range && (
                <p className="text-sm font-semibold mb-2">
                  {accommodation.price_range}
                </p>
              )}
              {accommodation.category && accommodation.category.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {accommodation.category.join(", ")}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ManageAccommodations;
