import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { ArrowLeft, Plus, Trash2, Pencil, X } from 'lucide-react';
import { z } from 'zod';

const csvToArray = (val: string): string[] =>
  val.split(',').map((t) => t.trim()).filter(Boolean);

const stationSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  address: z.string().min(1, 'Address is required').max(200),
  city: z.string().min(1, 'City is required').max(50),
  state: z.string().min(1, 'State is required').max(50),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  charger_type: z.string().min(1, 'Charger type is required'),
  connector_type: z.string().min(1, 'Connector type is required'),
  power_output: z.string().min(1, 'Power output is required'),
  total_chargers: z.number().int().positive(),
  price_per_unit: z.number().positive().optional(),
});

type Station = Database['public']['Tables']['charging_stations']['Row'];

const AdminChargingStations = () => {
  const navigate = useNavigate();
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingStation, setEditingStation] = useState<Station | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    latitude: '',
    longitude: '',
    charger_type: 'DC Fast Charger',
    connector_type: 'CCS2',
    power_output: '60kW',
    total_chargers: '2',
    price_per_unit: '',
    amenities: '',
  });

  const [editFormData, setEditFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    latitude: '',
    longitude: '',
    charger_type: '',
    connector_type: '',
    power_output: '',
    total_chargers: '',
    price_per_unit: '',
    amenities: '',
    status: 'active',
  });

  useEffect(() => {
    checkAuthAndFetchStations();
  }, []);

  const checkAuthAndFetchStations = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate('/admin/login');
      return;
    }

    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id)
      .eq('role', 'admin')
      .single();

    if (!roleData) {
      toast.error('You do not have admin access');
      navigate('/');
      return;
    }

    fetchStations();
  };

  const fetchStations = async () => {
    const { data, error } = await supabase
      .from('charging_stations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Failed to load charging stations');
    } else {
      setStations(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validatedData = stationSchema.parse({
        ...formData,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        total_chargers: parseInt(formData.total_chargers),
        price_per_unit: formData.price_per_unit ? parseFloat(formData.price_per_unit) : undefined,
      });

      const { data: { session } } = await supabase.auth.getSession();

      const stationData: Database['public']['Tables']['charging_stations']['Insert'] = {
        name: validatedData.name,
        address: validatedData.address,
        city: validatedData.city,
        state: validatedData.state,
        latitude: validatedData.latitude,
        longitude: validatedData.longitude,
        charger_type: validatedData.charger_type,
        connector_type: validatedData.connector_type,
        power_output: validatedData.power_output,
        total_chargers: validatedData.total_chargers,
        available_chargers: validatedData.total_chargers,
        price_per_unit: validatedData.price_per_unit,
        amenities: formData.amenities ? csvToArray(formData.amenities) : null,
        created_by: session?.user.id,
      };

      const { error } = await supabase
        .from('charging_stations')
        .insert([stationData]);

      if (error) throw error;

      toast.success('Charging station added successfully!');
      setFormData({
        name: '',
        address: '',
        city: '',
        state: '',
        latitude: '',
        longitude: '',
        charger_type: 'DC Fast Charger',
        connector_type: 'CCS2',
        power_output: '60kW',
        total_chargers: '2',
        price_per_unit: '',
        amenities: '',
      });
      fetchStations();
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error(error.message || 'Failed to add charging station');
      }
    }
  };

  const handleEdit = (station: Station) => {
    setEditingStation(station);
    setEditFormData({
      name: station.name,
      address: station.address,
      city: station.city,
      state: station.state,
      latitude: station.latitude.toString(),
      longitude: station.longitude.toString(),
      charger_type: station.charger_type,
      connector_type: station.connector_type,
      power_output: station.power_output,
      total_chargers: station.total_chargers.toString(),
      price_per_unit: station.price_per_unit?.toString() || '',
      amenities: Array.isArray(station.amenities) ? station.amenities.join(', ') : '',
      status: station.status,
    });
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStation) return;

    try {
      const validatedData = stationSchema.parse({
        ...editFormData,
        latitude: parseFloat(editFormData.latitude),
        longitude: parseFloat(editFormData.longitude),
        total_chargers: parseInt(editFormData.total_chargers),
        price_per_unit: editFormData.price_per_unit ? parseFloat(editFormData.price_per_unit) : undefined,
      });

      const { error } = await supabase
        .from('charging_stations')
        .update({
          name: validatedData.name,
          address: validatedData.address,
          city: validatedData.city,
          state: validatedData.state,
          latitude: validatedData.latitude,
          longitude: validatedData.longitude,
          charger_type: validatedData.charger_type,
          connector_type: validatedData.connector_type,
          power_output: validatedData.power_output,
          total_chargers: validatedData.total_chargers,
          price_per_unit: validatedData.price_per_unit,
          amenities: editFormData.amenities ? csvToArray(editFormData.amenities) : null,
          status: editFormData.status,
        })
        .eq('id', editingStation.id);

      if (error) throw error;

      toast.success('Charging station updated successfully!');
      setIsEditDialogOpen(false);
      setEditingStation(null);
      fetchStations();
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error(error.message || 'Failed to update charging station');
      }
    }
  };

  const confirmDelete = async () => {
    if (!pendingDeleteId) return;
    const { error } = await supabase
      .from('charging_stations')
      .delete()
      .eq('id', pendingDeleteId);

    if (error) {
      toast.error('Failed to delete charging station');
    } else {
      toast.success('Charging station deleted successfully');
      fetchStations();
    }
    setPendingDeleteId(null);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-green-50 p-8">
      <div className="max-w-6xl mx-auto">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => navigate('/admin/dashboard')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-blue-600 via-cyan-600 to-green-600 bg-clip-text text-transparent">
          Manage Charging Stations
        </h1>

        <div className="grid lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Add New Station
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Station Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="charger_type">Charger Type</Label>
                    <Input
                      id="charger_type"
                      value={formData.charger_type}
                      onChange={(e) => setFormData({ ...formData, charger_type: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="latitude">Latitude</Label>
                    <Input
                      id="latitude"
                      type="number"
                      step="any"
                      value={formData.latitude}
                      onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="longitude">Longitude</Label>
                    <Input
                      id="longitude"
                      type="number"
                      step="any"
                      value={formData.longitude}
                      onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="connector_type">Connector</Label>
                    <Input
                      id="connector_type"
                      value={formData.connector_type}
                      onChange={(e) => setFormData({ ...formData, connector_type: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="power_output">Power</Label>
                    <Input
                      id="power_output"
                      value={formData.power_output}
                      onChange={(e) => setFormData({ ...formData, power_output: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="total_chargers">Chargers</Label>
                    <Input
                      id="total_chargers"
                      type="number"
                      value={formData.total_chargers}
                      onChange={(e) => setFormData({ ...formData, total_chargers: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price_per_unit">Price per kWh (optional)</Label>
                  <Input
                    id="price_per_unit"
                    type="number"
                    step="0.01"
                    value={formData.price_per_unit}
                    onChange={(e) => setFormData({ ...formData, price_per_unit: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amenities">Amenities (comma-separated)</Label>
                  <Input
                    id="amenities"
                    placeholder="Restroom, Cafe, Wi-Fi, Parking"
                    value={formData.amenities}
                    onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                  />
                </div>

                <Button type="submit" className="w-full">
                  Add Station
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Existing Stations ({stations.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {stations.map((station) => (
                  <div key={station.id} className="p-4 border rounded-lg bg-card">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{station.name}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            station.status === 'active' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {station.status}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{station.city}, {station.state}</p>
                        <p className="text-sm">{station.charger_type} • {station.power_output}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEdit(station)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => setPendingDeleteId(station.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Charging Station</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Station Name</Label>
                  <Input
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input
                    value={editFormData.city}
                    onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Address</Label>
                <Input
                  value={editFormData.address}
                  onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>State</Label>
                  <Input
                    value={editFormData.state}
                    onChange={(e) => setEditFormData({ ...editFormData, state: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Charger Type</Label>
                  <Input
                    value={editFormData.charger_type}
                    onChange={(e) => setEditFormData({ ...editFormData, charger_type: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Latitude</Label>
                  <Input
                    type="number"
                    step="any"
                    value={editFormData.latitude}
                    onChange={(e) => setEditFormData({ ...editFormData, latitude: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Longitude</Label>
                  <Input
                    type="number"
                    step="any"
                    value={editFormData.longitude}
                    onChange={(e) => setEditFormData({ ...editFormData, longitude: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Connector</Label>
                  <Input
                    value={editFormData.connector_type}
                    onChange={(e) => setEditFormData({ ...editFormData, connector_type: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Power</Label>
                  <Input
                    value={editFormData.power_output}
                    onChange={(e) => setEditFormData({ ...editFormData, power_output: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Chargers</Label>
                  <Input
                    type="number"
                    value={editFormData.total_chargers}
                    onChange={(e) => setEditFormData({ ...editFormData, total_chargers: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Price per kWh</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editFormData.price_per_unit}
                    onChange={(e) => setEditFormData({ ...editFormData, price_per_unit: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <select
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                    value={editFormData.status}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Amenities (comma-separated)</Label>
                <Input
                  placeholder="Restroom, Cafe, Wi-Fi, Parking"
                  value={editFormData.amenities}
                  onChange={(e) => setEditFormData({ ...editFormData, amenities: e.target.value })}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  Save Changes
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <AlertDialog open={!!pendingDeleteId} onOpenChange={(open) => !open && setPendingDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this charging station?</AlertDialogTitle>
              <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default AdminChargingStations;
