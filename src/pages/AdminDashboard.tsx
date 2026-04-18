import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { MapPin, FileText, LogOut, MessageSquare, Settings, Eye, EyeOff, Save, Loader2, LayoutGrid } from 'lucide-react';
import { VisibilitySettings, DEFAULT_VISIBILITY } from '@/hooks/useSiteSettings';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [visibility, setVisibility] = useState<VisibilitySettings>(DEFAULT_VISIBILITY);
  const [originalVisibility, setOriginalVisibility] = useState<VisibilitySettings>(DEFAULT_VISIBILITY);
  const [showVisibilitySettings, setShowVisibilitySettings] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

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

      // Load visibility settings from database
      await fetchVisibilitySettings();

      setIsAdmin(true);
      setLoading(false);
    };

    checkAdmin();
  }, [navigate]);

  const fetchVisibilitySettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('setting_value')
        .eq('setting_key', 'visibility')
        .single();

      if (error) {
        if (import.meta.env.DEV) {
          console.error('Error fetching visibility settings:', error);
        }
        return;
      }

      if (data?.setting_value) {
        const settings = data.setting_value as unknown as VisibilitySettings;
        setVisibility(settings);
        setOriginalVisibility(settings);
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error fetching visibility settings:', error);
      }
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // Clear any cached app state (visibility settings, CMS drafts, anti-spam
    // throttle timers, etc.) so the next user on this machine doesn't
    // inherit anything belonging to the previous session.
    try {
      sessionStorage.clear();
      // Preserve only the permanent "I've seen the intro video" flag.
      const introSeen = localStorage.getItem('introSeen');
      localStorage.clear();
      if (introSeen) localStorage.setItem('introSeen', introSeen);
    } catch {
      // Storage APIs can throw in private mode; safe to ignore.
    }
    navigate('/admin/login');
    toast.success('Logged out successfully');
  };

  const updatePageVisibility = (page: string, visible: boolean) => {
    const newVisibility = {
      ...visibility,
      pages: { ...visibility.pages, [page]: visible }
    };
    setVisibility(newVisibility);
    setHasChanges(JSON.stringify(newVisibility) !== JSON.stringify(originalVisibility));
  };

  const updateSectionVisibility = (section: string, visible: boolean) => {
    const newVisibility = {
      ...visibility,
      sections: { ...visibility.sections, [section]: visible }
    };
    setVisibility(newVisibility);
    setHasChanges(JSON.stringify(newVisibility) !== JSON.stringify(originalVisibility));
  };

  const saveVisibilitySettings = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('site_settings')
        .update({ setting_value: visibility as any })
        .eq('setting_key', 'visibility');

      if (error) throw error;

      setOriginalVisibility(visibility);
      setHasChanges(false);
      toast.success('Visibility settings saved successfully! Changes are now live.');
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error saving visibility settings:', error);
      }
      toast.error('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const discardChanges = () => {
    setVisibility(originalVisibility);
    setHasChanges(false);
    toast.info('Changes discarded');
  };

  // Render nothing until we've resolved auth AND confirmed admin role.
  // Stops a brief visual flash of the dashboard UI if the session exists
  // but the role check hasn't resolved (or fails).
  if (loading || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
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
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    Page & Section Visibility Controls
                  </CardTitle>
                  <CardDescription>
                    Control which pages and sections are visible on the website. Changes require saving.
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  {hasChanges && (
                    <Button variant="outline" onClick={discardChanges} size="sm">
                      Discard
                    </Button>
                  )}
                  <Button 
                    onClick={saveVisibilitySettings} 
                    disabled={!hasChanges || isSaving}
                    className="gap-2"
                  >
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Save Changes
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {hasChanges && (
                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-800 font-medium">
                    ⚠️ You have unsaved changes. Click "Save Changes" to apply them to the live site.
                  </p>
                </div>
              )}
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

              {/* Navigation Preview */}
              <div className="mt-6 p-4 bg-slate-800 rounded-lg border border-slate-700">
                <h5 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Navigation Preview
                </h5>
                <div className="flex flex-wrap gap-2">
                  {['Home', 'About Us', 'Services', 'Blogs', 'Find a Charger', 'Become Our Partner', 'Invest in APlus'].map((pageName) => {
                    const pageKey = pageName === 'Home' || pageName === 'Find a Charger' 
                      ? null 
                      : pageName === 'About Us' ? 'about'
                      : pageName === 'Blogs' ? 'blog'
                      : pageName === 'Become Our Partner' ? 'partner'
                      : pageName === 'Invest in APlus' ? 'invest'
                      : 'services';
                    const isVisible = pageKey === null || visibility.pages[pageKey as keyof typeof visibility.pages];
                    
                    return (
                      <span
                        key={pageName}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                          isVisible 
                            ? 'bg-primary/20 text-primary-foreground border border-primary/30' 
                            : 'bg-slate-700/50 text-slate-500 line-through border border-slate-600/30'
                        }`}
                      >
                        {pageName}
                        {(pageName === 'Home' || pageName === 'Find a Charger') && (
                          <span className="ml-1 text-[10px] opacity-60">(always visible)</span>
                        )}
                      </span>
                    );
                  })}
                </div>
                <p className="text-xs text-slate-400 mt-3">
                  This shows how the navigation will appear after saving. Crossed-out items are hidden from visitors.
                </p>
              </div>

              <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-green-800">
                  ✓ Settings are stored in the database and persist permanently. Changes will be reflected site-wide once saved.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link to="/admin/charging-stations">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full hover:-translate-y-1 duration-300">
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
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full hover:-translate-y-1 duration-300">
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
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full hover:-translate-y-1 duration-300">
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

          <Link to="/admin/content">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full hover:-translate-y-1 duration-300">
              <CardHeader>
                <LayoutGrid className="w-12 h-12 text-amber-600 mb-4" />
                <CardTitle>Site Content</CardTitle>
                <CardDescription>
                  Edit partners, statistics, testimonials, team, FAQs &amp; services
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">Manage Content</Button>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
