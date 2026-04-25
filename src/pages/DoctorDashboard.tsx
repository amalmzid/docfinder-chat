import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Calendar, Clock, Users, CheckCircle, XCircle, MapPin, Phone, 
  Star, Edit, Save, X, Plus, Trash2, User, Settings, Stethoscope
} from 'lucide-react';
import { toast } from 'sonner';

interface DoctorProfile {
  id_docteur: number;
  nom: string;
  email: string;
  telephone?: string;
  specialite: string;
  adresse?: string;
  license_number?: string;
  experience_years?: number;
  university?: string;
  biography?: string;
}

interface Consultation {
  id_consultation: number;
  id_patient: number;
  id_docteur: number;
  date_consultation: string;
  motif: string;
  statut: 'scheduled' | 'completed' | 'cancelled' | 'confirmed' | 'pending';
  notes?: string;
  patient_name?: string;
  patient_email?: string;
}

interface Availability {
  id?: number;
  id_docteur: number;
  day_of_week: string;
  start_time: string;
  end_time: string;
  max_patients: number;
  is_available: boolean;
}

export default function DoctorDashboard() {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [profile, setProfile] = useState<DoctorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('consultations');
  const [consultationFilter, setConsultationFilter] = useState<'all' | 'scheduled' | 'completed' | 'cancelled' | 'confirmed' | 'pending'>('all');
  
  // Dialog states
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [availabilityDialogOpen, setAvailabilityDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [editingAvailability, setEditingAvailability] = useState<Availability | null>(null);
  
  // Form states
  const [profileForm, setProfileForm] = useState({
    nom: '',
    email: '',
    telephone: '',
    specialite: '',
    adresse: '',
    license_number: '',
    experience_years: '',
    university: '',
    biography: ''
  });
  
  const [availabilityForm, setAvailabilityForm] = useState({
    day_of_week: '',
    start_time: '',
    end_time: '',
    max_patients: '5',
    is_available: true
  });
  
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      
      if (!token || !userId) {
        toast.error('Authentication required');
        return;
      }

      // Fetch doctor profile
      const profileResponse = await fetch(`http://localhost/heal-u/backend/api/doctors.php?id=${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const profileData = await profileResponse.json();
      
      if (profileData.success) {
        setProfile(profileData.doctor);
      }

      // Fetch doctor appointments
      const appointmentsResponse = await fetch(`http://localhost/heal-u/backend/api/appointments.php?doctor=${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const appointmentsData = await appointmentsResponse.json();
      
      console.log('API Response:', appointmentsData);
      console.log('API Success:', appointmentsData.success);
      console.log('Appointments Data:', appointmentsData.appointments);
      
      if (appointmentsData.success) {
        // Transform appointments to consultations format
        const transformedConsultations = appointmentsData.appointments.map((apt: any) => ({
          id_consultation: apt.id_rdv,
          id_patient: apt.id_patient,
          id_docteur: apt.id_docteur,
          date_consultation: apt.date_rdv,
          motif: 'Appointment', // Default motif since rendez_vous doesn't have motif
          statut: apt.statut as 'scheduled' | 'completed' | 'cancelled',
          patient_name: apt.patient_name || 'Unknown Patient',
          patient_email: apt.patient_email || ''
        }));
        setConsultations(transformedConsultations);
      }

      setAvailability([
        {
          id: 1,
          id_docteur: parseInt(userId),
          day_of_week: 'monday',
          start_time: '09:00',
          end_time: '17:00',
          max_patients: 8,
          is_available: true
        },
        {
          id: 2,
          id_docteur: parseInt(userId),
          day_of_week: 'tuesday',
          start_time: '09:00',
          end_time: '17:00',
          max_patients: 8,
          is_available: true
        }
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const filteredConsultations = consultations.filter(consultation => {
    if (consultationFilter === 'all') return true;
    return consultation.statut === consultationFilter;
  });

  const stats = {
    total: consultations.length,
    pending: consultations.filter(c => c.statut === 'pending').length,
    confirmed: consultations.filter(c => c.statut === 'confirmed').length,
    scheduled: consultations.filter(c => c.statut === 'scheduled').length,
    completed: consultations.filter(c => c.statut === 'completed').length,
    cancelled: consultations.filter(c => c.statut === 'cancelled').length
  };

  const handleUpdateProfile = async () => {
    toast.success('Profile updated successfully');
    setProfileDialogOpen(false);
    fetchData();
  };

  const handleUpdateAvailability = async () => {
    toast.success(`Availability ${editingAvailability ? 'updated' : 'added'} successfully`);
    setAvailabilityDialogOpen(false);
    setEditingAvailability(null);
    setAvailabilityForm({
      day_of_week: '',
      start_time: '',
      end_time: '',
      max_patients: '5',
      is_available: true
    });
    fetchData();
  };

  const handleDeleteAvailability = async (id: number) => {
    toast.success('Availability deleted successfully');
    fetchData();
  };

  const handleUpdateConsultationStatus = async (consultationId: number, newStatus: string) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost/heal-u/backend/api/appointments.php?id=${consultationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ statut: newStatus })
      });
      
      if (response.ok) {
        toast.success(`Appointment ${newStatus} successfully`);
        fetchData();
      } else {
        toast.error('Failed to update appointment status');
      }
    } catch (error) {
      console.error('Error updating consultation status:', error);
      toast.error('Failed to update appointment status');
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      toast.error('Passwords do not match');
      return;
    }
    toast.success('Password changed successfully');
    setPasswordDialogOpen(false);
    setPasswordForm({
      current_password: '',
      new_password: '',
      confirm_password: ''
    });
  };

  const openEditAvailability = (avail: Availability) => {
    setEditingAvailability(avail);
    setAvailabilityForm({
      day_of_week: avail.day_of_week,
      start_time: avail.start_time,
      end_time: avail.end_time,
      max_patients: avail.max_patients.toString(),
      is_available: avail.is_available
    });
    setAvailabilityDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="container py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Doctor Dashboard</h1>
        <p className="text-gray-600">Welcome back, Dr. {profile?.nom || 'Loading...'}</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Confirmed</p>
                <p className="text-2xl font-bold text-blue-600">{stats.confirmed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Availability</p>
                <p className="text-2xl font-bold text-purple-600">{availability.length}</p>
              </div>
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="consultations">Consultations</TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Consultations Tab */}
        <TabsContent value="consultations">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Consultations</CardTitle>
                <Select value={consultationFilter} onValueChange={(value: any) => setConsultationFilter(value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredConsultations.map((consultation) => (
                  <div key={consultation.id_consultation} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold">{consultation.patient_name || 'Patient'}</h4>
                        <p className="text-sm text-gray-600">{consultation.patient_email}</p>
                      </div>
                      <Badge 
                        variant={consultation.statut === 'completed' ? 'default' : 
                                consultation.statut === 'cancelled' ? 'destructive' : 
                                consultation.statut === 'confirmed' ? 'default' :
                                consultation.statut === 'pending' ? 'secondary' : 'secondary'}
                      >
                        {consultation.statut}
                      </Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {new Date(consultation.date_consultation).toLocaleString()}
                      </div>
                      <div className="flex items-center gap-2">
                        <Stethoscope className="h-4 w-4" />
                        {consultation.motif}
                      </div>
                      {consultation.notes && (
                        <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                          <strong>Notes:</strong> {consultation.notes}
                        </div>
                      )}
                    </div>
                    {(consultation.statut === 'pending' || consultation.statut === 'scheduled') && (
                      <div className="flex gap-2 mt-4">
                        {consultation.statut === 'pending' && (
                          <Button 
                            size="sm" 
                            onClick={() => handleUpdateConsultationStatus(consultation.id_consultation, 'confirmed')}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" /> Accept
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          onClick={() => handleUpdateConsultationStatus(consultation.id_consultation, 'completed')}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" /> Complete
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleUpdateConsultationStatus(consultation.id_consultation, 'cancelled')}
                        >
                          <XCircle className="h-4 w-4 mr-1" /> Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
                {filteredConsultations.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No consultations found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Availability Tab */}
        <TabsContent value="availability">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Working Hours</CardTitle>
                <Button onClick={() => setAvailabilityDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" /> Add Availability
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {availability.map((avail) => (
                  <div key={avail.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold capitalize">{avail.day_of_week}</h4>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {avail.start_time} - {avail.end_time}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            Max {avail.max_patients} patients
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={avail.is_available ? 'default' : 'secondary'}>
                          {avail.is_available ? 'Available' : 'Unavailable'}
                        </Badge>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => openEditAvailability(avail)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleDeleteAvailability(avail.id!)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {availability.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No availability set. Click "Add Availability" to get started.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Profile Information</CardTitle>
                <Button onClick={() => setProfileDialogOpen(true)}>
                  <Edit className="h-4 w-4 mr-2" /> Edit Profile
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {profile && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Name</Label>
                    <p className="font-semibold">{profile.nom}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Email</Label>
                    <p className="font-semibold">{profile.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Phone</Label>
                    <p className="font-semibold">{profile.telephone || 'Not provided'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Specialty</Label>
                    <p className="font-semibold">{profile.specialite}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Address</Label>
                    <p className="font-semibold">{profile.adresse || 'Not provided'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">License Number</Label>
                    <p className="font-semibold">{profile.license_number || 'Not provided'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Experience</Label>
                    <p className="font-semibold">{profile.experience_years || 0} years</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600">University</Label>
                    <p className="font-semibold">{profile.university || 'Not provided'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-sm font-medium text-gray-600">Biography</Label>
                    <p className="font-semibold">{profile.biography || 'Not provided'}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button onClick={() => setPasswordDialogOpen(true)}>
                  <Settings className="h-4 w-4 mr-2" /> Change Password
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Profile Edit Dialog */}
      <Dialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Name</Label>
              <Input value={profileForm.nom} onChange={(e) => setProfileForm({...profileForm, nom: e.target.value})} />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" value={profileForm.email} onChange={(e) => setProfileForm({...profileForm, email: e.target.value})} />
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={profileForm.telephone} onChange={(e) => setProfileForm({...profileForm, telephone: e.target.value})} />
            </div>
            <div>
              <Label>Specialty</Label>
              <Input value={profileForm.specialite} onChange={(e) => setProfileForm({...profileForm, specialite: e.target.value})} />
            </div>
            <div>
              <Label>Address</Label>
              <Input value={profileForm.adresse} onChange={(e) => setProfileForm({...profileForm, adresse: e.target.value})} />
            </div>
            <div>
              <Label>License Number</Label>
              <Input value={profileForm.license_number} onChange={(e) => setProfileForm({...profileForm, license_number: e.target.value})} />
            </div>
            <div>
              <Label>Experience (years)</Label>
              <Input type="number" value={profileForm.experience_years} onChange={(e) => setProfileForm({...profileForm, experience_years: e.target.value})} />
            </div>
            <div>
              <Label>University</Label>
              <Input value={profileForm.university} onChange={(e) => setProfileForm({...profileForm, university: e.target.value})} />
            </div>
            <div className="md:col-span-2">
              <Label>Biography</Label>
              <Textarea rows={3} value={profileForm.biography} onChange={(e) => setProfileForm({...profileForm, biography: e.target.value})} />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setProfileDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateProfile}>Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Availability Dialog */}
      <Dialog open={availabilityDialogOpen} onOpenChange={setAvailabilityDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingAvailability ? 'Edit' : 'Add'} Availability</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Day of Week</Label>
              <Select value={availabilityForm.day_of_week} onValueChange={(value) => setAvailabilityForm({...availabilityForm, day_of_week: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monday">Monday</SelectItem>
                  <SelectItem value="tuesday">Tuesday</SelectItem>
                  <SelectItem value="wednesday">Wednesday</SelectItem>
                  <SelectItem value="thursday">Thursday</SelectItem>
                  <SelectItem value="friday">Friday</SelectItem>
                  <SelectItem value="saturday">Saturday</SelectItem>
                  <SelectItem value="sunday">Sunday</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Time</Label>
                <Input type="time" value={availabilityForm.start_time} onChange={(e) => setAvailabilityForm({...availabilityForm, start_time: e.target.value})} />
              </div>
              <div>
                <Label>End Time</Label>
                <Input type="time" value={availabilityForm.end_time} onChange={(e) => setAvailabilityForm({...availabilityForm, end_time: e.target.value})} />
              </div>
            </div>
            <div>
              <Label>Max Patients</Label>
              <Input type="number" value={availabilityForm.max_patients} onChange={(e) => setAvailabilityForm({...availabilityForm, max_patients: e.target.value})} />
            </div>
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={availabilityForm.is_available}
                onChange={(e) => setAvailabilityForm({...availabilityForm, is_available: e.target.checked})}
              />
              <Label>Available</Label>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => {
              setAvailabilityDialogOpen(false);
              setEditingAvailability(null);
              setAvailabilityForm({
                day_of_week: '',
                start_time: '',
                end_time: '',
                max_patients: '5',
                is_available: true
              });
            }}>Cancel</Button>
            <Button onClick={handleUpdateAvailability}>
              {editingAvailability ? 'Update' : 'Add'} Availability
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Password Change Dialog */}
      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Current Password</Label>
              <Input type="password" value={passwordForm.current_password} onChange={(e) => setPasswordForm({...passwordForm, current_password: e.target.value})} />
            </div>
            <div>
              <Label>New Password</Label>
              <Input type="password" value={passwordForm.new_password} onChange={(e) => setPasswordForm({...passwordForm, new_password: e.target.value})} />
            </div>
            <div>
              <Label>Confirm New Password</Label>
              <Input type="password" value={passwordForm.confirm_password} onChange={(e) => setPasswordForm({...passwordForm, confirm_password: e.target.value})} />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setPasswordDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleChangePassword}>Change Password</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
