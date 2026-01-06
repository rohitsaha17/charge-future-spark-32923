import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { MapPin, FileText, LogOut, MessageSquare, Settings, Eye, EyeOff } from 'lucide-react';

// Page visibility settings stored in localStorage for demo
// In production, this would be stored in database
const DEFAULT_VISIBILITY = {
  pages: {
    services: true,
    blog: true,
    partner: true,
    invest: true,
    about: true,
  },
  sections: {
    home_map: true,
    home_benefits: true,
    home_testimonials: true,
    home_faq: true,
    home_app_download: true,
    about_team: true,
    about_timeline: true,
  }
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [visibility, setVisibility] = useState(DEFAULT_VISIBILITY);
  const [showVisibilitySettings, setShowVisibilitySettings] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/admin/login');
        return;
      }

      // Check if user has admin role
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

      // Load visibility settings from localStorage
      const savedVisibility = localStorage.getItem('site_visibility');
      if (savedVisibility) {
        setVisibility(JSON.parse(savedVisibility));
      }

      setIsAdmin(true);
      setLoading(false);
    };

    checkAdmin();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
    toast.success('Logged out successfully');
  };

  const updatePageVisibility = (page: string, visible: boolean) => {
    const newVisibility = {
      ...visibility,
      pages: { ...visibility.pages, [page]: visible }
    };
    setVisibility(newVisibility);
    localStorage.setItem('site_visibility', JSON.stringify(newVisibility));
    toast.success(`${page} page ${visible ? 'shown' : 'hidden'}`);
  };

  const updateSectionVisibility = (section: string, visible: boolean) => {
    const newVisibility = {
      ...visibility,
      sections: { ...visibility.sections, [section]: visible }
    };
    setVisibility(newVisibility);
    localStorage.setItem('site_visibility', JSON.stringify(newVisibility));
    toast.success(`Section ${visible ? 'shown' : 'hidden'}`);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-green-50 p-8 pt-24">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-cyan-600 to-green-600 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <div className="flex gap-2">
            <Button 
              onClick={() => setShowVisibilitySettings(!showVisibilitySettings)} 
              variant="outline"
            >
              <Settings className="mr-2 h-4 w-4" />
              Page Settings
            </Button>
            <Button onClick={handleLogout} variant="outline">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        {/* Page/Section Visibility Controls */}
        {showVisibilitySettings && (
          <Card className="mb-8 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Page & Section Visibility Controls
              </CardTitle>
              <CardDescription>
                Control which pages and sections are visible on the website
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8">
                {/* Page Controls */}
                <div>
                  <h4 className="font-semibold mb-4 text-lg">Pages</h4>
                  <div className="space-y-4">
                    {Object.entries(visibility.pages).map(([page, isVisible]) => (
                      <div key={page} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2">
                          {isVisible ? <Eye className="w-4 h-4 text-green-600" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
                          <Label htmlFor={page} className="capitalize">{page} Page</Label>
                        </div>
                        <Switch
                          id={page}
                          checked={isVisible}
                          onCheckedChange={(checked) => updatePageVisibility(page, checked)}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section Controls */}
                <div>
                  <h4 className="font-semibold mb-4 text-lg">Sections</h4>
                  <div className="space-y-4">
                    {Object.entries(visibility.sections).map(([section, isVisible]) => (
                      <div key={section} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2">
                          {isVisible ? <Eye className="w-4 h-4 text-green-600" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
                          <Label htmlFor={section} className="capitalize">{section.replace(/_/g, ' ')}</Label>
                        </div>
                        <Switch
                          id={section}
                          checked={isVisible}
                          onCheckedChange={(checked) => updateSectionVisibility(section, checked)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                ⚠️ Note: Visibility changes are stored locally. For production use, these settings should be stored in the database.
              </p>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          <Link to="/admin/charging-stations">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <MapPin className="w-12 h-12 text-blue-600 mb-4" />
                <CardTitle>Charging Stations</CardTitle>
                <CardDescription>
                  Add, edit, and manage EV charging station locations on the map
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Manage Stations</Button>
              </CardContent>
            </Card>
          </Link>

          <Link to="/admin/blogs">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <FileText className="w-12 h-12 text-green-600 mb-4" />
                <CardTitle>Blog Posts</CardTitle>
                <CardDescription>
                  Create and manage blog posts for your website
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Manage Blogs</Button>
              </CardContent>
            </Card>
          </Link>

          <Link to="/admin/enquiries">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <MessageSquare className="w-12 h-12 text-purple-600 mb-4" />
                <CardTitle>Enquiries</CardTitle>
                <CardDescription>
                  View and manage partner & investor enquiries
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Manage Enquiries</Button>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
