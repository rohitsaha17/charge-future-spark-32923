import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { ArrowLeft, Plus, Trash2, Save, ChevronUp, ChevronDown, Eye, EyeOff, Sparkles, AlertTriangle, Edit2 } from 'lucide-react';
import { SEED_ROWS, PARTNER_FALLBACKS, TEAM_FALLBACKS, SERVICE_FALLBACKS, DEFAULT_TESTIMONIALS } from '@/lib/siteDefaults';

// Map testimonial name → fallback avatar URL for the list view preview
const TESTIMONIAL_FALLBACKS: Record<string, string> = Object.fromEntries(
  DEFAULT_TESTIMONIALS.map((t) => [t.name, t.fallbackImage])
);
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
import { ImageUploadField } from '@/components/admin/ImageUploadField';

type AnyRow = Record<string, any>;

const ALL_TABLES = [
  'partners',
  'statistics',
  'testimonials',
  'team_members',
  'faqs',
  'services_catalog',
  'journey_milestones',
] as const;
type TableName = (typeof ALL_TABLES)[number];

// Per-table fallback image lookup for the CMS list view. Uses the
// same bundled defaults the public site falls back to, so what the
// admin sees matches what visitors see.
const FALLBACK_LOOKUPS: Partial<Record<TableName, Record<string, string>>> = {
  partners: PARTNER_FALLBACKS,
  team_members: TEAM_FALLBACKS,
  testimonials: TESTIMONIAL_FALLBACKS,
};

const servicesFallbackBySlug = (row: AnyRow) =>
  row.slug ? SERVICE_FALLBACKS[row.slug] : undefined;

const getRowFallbackImage = (table: TableName, row: AnyRow): string | undefined => {
  if (table === 'services_catalog') return servicesFallbackBySlug(row);
  const lookup = FALLBACK_LOOKUPS[table];
  if (!lookup || !row.name) return undefined;
  return lookup[row.name];
};

const csvToArray = (val: string): string[] =>
  val.split(',').map((t) => t.trim()).filter(Boolean);

const AdminContent = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Record<TableName, AnyRow[]>>({
    partners: [],
    statistics: [],
    testimonials: [],
    team_members: [],
    faqs: [],
    services_catalog: [],
    journey_milestones: [],
  });
  const [pendingDelete, setPendingDelete] = useState<{ table: TableName; id: string } | null>(null);
  const [errors, setErrors] = useState<Record<TableName, string | null>>({
    partners: null,
    statistics: null,
    testimonials: null,
    team_members: null,
    faqs: null,
    services_catalog: null,
    journey_milestones: null,
  });
  const [seeding, setSeeding] = useState<TableName | 'all' | null>(null);

  useEffect(() => {
    checkAuthAndFetch();
  }, []);

  const checkAuthAndFetch = async () => {
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
    await fetchAll();
    setLoading(false);
  };

  const fetchAll = async () => {
    await Promise.all(ALL_TABLES.map(refreshOne));
  };

  async function refreshOne(table: TableName) {
    const { data: rows, error } = await (supabase as any)
      .from(table)
      .select('*')
      .order('sort_order', { ascending: true });
    if (error) {
      setErrors((prev) => ({ ...prev, [table]: error.message }));
      setData((prev) => ({ ...prev, [table]: [] }));
    } else {
      setErrors((prev) => ({ ...prev, [table]: null }));
      setData((prev) => ({ ...prev, [table]: rows || [] }));
    }
  }

  const seedTable = async (table: TableName) => {
    const rows = (SEED_ROWS as any)[table];
    if (!rows || !rows.length) return;
    setSeeding(table);
    try {
      const { error } = await (supabase as any).from(table).insert(rows);
      if (error) {
        toast.error(`Seed failed: ${error.message}`);
      } else {
        toast.success(`Populated ${rows.length} default ${table.replace('_', ' ')} entries`);
        await refreshOne(table);
      }
    } finally {
      setSeeding(null);
    }
  };

  const seedAllEmpty = async () => {
    setSeeding('all');
    try {
      const emptyTables = ALL_TABLES.filter((t) => data[t].length === 0 && !errors[t]);
      for (const t of emptyTables) {
        const rows = (SEED_ROWS as any)[t];
        if (!rows || !rows.length) continue;
        await (supabase as any).from(t).insert(rows);
      }
      toast.success(`Populated defaults for ${emptyTables.length} section(s)`);
      await fetchAll();
    } finally {
      setSeeding(null);
    }
  };

  const saveRow = async (table: TableName, row: AnyRow) => {
    const { id, ...rest } = row;
    // created_at/updated_at handled by DB
    delete rest.created_at;
    delete rest.updated_at;
    const { error } = id
      ? await (supabase as any).from(table).update(rest).eq('id', id)
      : await (supabase as any).from(table).insert([rest]);
    if (error) {
      toast.error(error.message || 'Save failed');
      return false;
    }
    toast.success('Saved');
    await refreshOne(table);
    return true;
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    const { error } = await (supabase as any)
      .from(pendingDelete.table)
      .delete()
      .eq('id', pendingDelete.id);
    if (error) {
      toast.error('Delete failed');
    } else {
      toast.success('Deleted');
      await refreshOne(pendingDelete.table);
    }
    setPendingDelete(null);
  };

  const moveRow = async (table: TableName, row: AnyRow, direction: -1 | 1) => {
    const list = [...data[table]];
    const idx = list.findIndex((r) => r.id === row.id);
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= list.length) return;
    const a = list[idx];
    const b = list[targetIdx];
    await (supabase as any).from(table).update({ sort_order: b.sort_order }).eq('id', a.id);
    await (supabase as any).from(table).update({ sort_order: a.sort_order }).eq('id', b.id);
    refreshOne(table);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading…</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-green-50 p-4 md:p-8 pt-24">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
          <div>
            <Link to="/admin/dashboard">
              <Button variant="outline" size="sm" className="mb-3">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Site Content
            </h1>
            <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
              Edit the live content of your website. Changes save directly to the database and reflect on the public site immediately — no rebuild required.
            </p>
          </div>
        </div>

        {/* Status banner: show which sections are empty or erroring */}
        {(() => {
          const missingTables = ALL_TABLES.filter((t) => errors[t]);
          const emptyTables = ALL_TABLES.filter((t) => !errors[t] && data[t].length === 0);
          if (missingTables.length > 0) {
            return (
              <Card className="p-4 mb-6 border-destructive/40 bg-destructive/5">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-destructive mt-0.5" />
                  <div className="flex-1 text-sm">
                    <p className="font-semibold text-destructive">Database setup needed</p>
                    <p className="text-foreground/80 mt-1">
                      Some content tables don't exist yet. Apply the latest Supabase migration
                      (<code className="bg-muted px-1 rounded text-xs">supabase/migrations/20260417120000_content_management.sql</code>)
                      via your Supabase dashboard, then reload this page.
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Missing: {missingTables.join(', ')}
                    </p>
                  </div>
                </div>
              </Card>
            );
          }
          if (emptyTables.length > 0) {
            return (
              <Card className="p-5 mb-6 border-primary/30 bg-gradient-to-r from-primary/5 to-cyan-500/5">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-primary mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold">
                      {emptyTables.length === ALL_TABLES.length
                        ? 'Start by populating your site with its current content'
                        : 'Some sections are empty'}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      One click copies what's currently on your live site into the database, so you can edit it here. You can upload new images, change text, or remove items anytime.
                    </p>
                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                      <Button
                        size="sm"
                        onClick={seedAllEmpty}
                        disabled={seeding !== null}
                        className="bg-gradient-to-r from-primary to-cyan-500"
                      >
                        {seeding === 'all' ? 'Populating…' : `Populate ${emptyTables.length} section${emptyTables.length > 1 ? 's' : ''}`}
                      </Button>
                      <span className="text-xs text-muted-foreground">
                        Empty: {emptyTables.map((t) => t.replace('_', ' ')).join(', ')}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            );
          }
          return null;
        })()}

        <Tabs defaultValue="partners" className="w-full">
          <TabsList className="grid w-full grid-cols-4 md:grid-cols-7 mb-6">
            <TabsTrigger value="partners">Clients &amp; Partners</TabsTrigger>
            <TabsTrigger value="statistics">Statistics</TabsTrigger>
            <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
            <TabsTrigger value="team_members">Team</TabsTrigger>
            <TabsTrigger value="faqs">FAQs</TabsTrigger>
            <TabsTrigger value="services_catalog">Services</TabsTrigger>
            <TabsTrigger value="journey_milestones">Timeline</TabsTrigger>
          </TabsList>

          <TabsContent value="partners">
            <SectionEditor
              title="Clients &amp; Partners"
              description="Two groups in one list. Set each row's Type to 'Client' for paying customers or 'Partner' for strategic allies (or 'Both'). The About page renders them as two separate sections — 'Our Clients' and 'Strategic Partners'."
              tableName="partners"
              rows={data.partners}
              error={errors.partners}
              onSeed={() => seedTable('partners')}
              seeding={seeding === 'partners' || seeding === 'all'}
              onMove={(row, dir) => moveRow('partners', row, dir)}
              onDelete={(id) => setPendingDelete({ table: 'partners', id })}
              blank={{ name: '', logo_url: '', website_url: '', type: 'partner', sort_order: nextOrder(data.partners), visible: true }}
              renderForm={(row, setRow) => (
                <>
                  <Field label="Name" value={row.name} onChange={(v) => setRow({ ...row, name: v })} />
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <select
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                      value={row.type || 'partner'}
                      onChange={(e) => setRow({ ...row, type: e.target.value })}
                    >
                      <option value="client">Client — customer using our services</option>
                      <option value="partner">Partner — strategic ally / OEM</option>
                      <option value="both">Both — appears in both sections</option>
                    </select>
                  </div>
                  <Field label="Website URL" value={row.website_url || ''} onChange={(v) => setRow({ ...row, website_url: v })} />
                  <ImageUploadField
                    label="Logo"
                    value={row.logo_url || ''}
                    onChange={(v) => setRow({ ...row, logo_url: v })}
                    folder="partners"
                    previewClassName="h-16"
                    fallback={row.name ? PARTNER_FALLBACKS[row.name] : undefined}
                  />
                </>
              )}
              onSave={(r) => saveRow('partners', r)}
            />
          </TabsContent>

          <TabsContent value="statistics">
            <SectionEditor
              title="Statistics / Counters"
              description="Animated counters on the About page ('Our Network at a Glance'). Value is the number, suffix is optional ('+', '%')."
              tableName="statistics"
              rows={data.statistics}
              error={errors.statistics}
              onSeed={() => seedTable('statistics')}
              seeding={seeding === 'statistics' || seeding === 'all'}
              onMove={(row, dir) => moveRow('statistics', row, dir)}
              onDelete={(id) => setPendingDelete({ table: 'statistics', id })}
              blank={{ label: '', value: '', suffix: '', sort_order: nextOrder(data.statistics), visible: true }}
              renderForm={(row, setRow) => (
                <>
                  <Field label="Label" value={row.label} onChange={(v) => setRow({ ...row, label: v })} />
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Value" value={row.value} onChange={(v) => setRow({ ...row, value: v })} />
                    <Field label="Suffix" value={row.suffix || ''} onChange={(v) => setRow({ ...row, suffix: v })} />
                  </div>
                </>
              )}
              onSave={(r) => saveRow('statistics', r)}
            />
          </TabsContent>

          <TabsContent value="testimonials">
            <SectionEditor
              title="Testimonials"
              description="Customer reviews shown in the carousel on the About page. Leave the photo blank to auto-generate an avatar."
              tableName="testimonials"
              rows={data.testimonials}
              error={errors.testimonials}
              onSeed={() => seedTable('testimonials')}
              seeding={seeding === 'testimonials' || seeding === 'all'}
              onMove={(row, dir) => moveRow('testimonials', row, dir)}
              onDelete={(id) => setPendingDelete({ table: 'testimonials', id })}
              blank={{ name: '', role: '', location: '', image_url: '', rating: 5, review: '', sort_order: nextOrder(data.testimonials), visible: true }}
              renderForm={(row, setRow) => (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Name" value={row.name} onChange={(v) => setRow({ ...row, name: v })} />
                    <Field label="Role" value={row.role || ''} onChange={(v) => setRow({ ...row, role: v })} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Location" value={row.location || ''} onChange={(v) => setRow({ ...row, location: v })} />
                    <div className="space-y-2">
                      <Label>Rating (1-5)</Label>
                      <Input
                        type="number"
                        min={1}
                        max={5}
                        value={row.rating}
                        onChange={(e) => setRow({ ...row, rating: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                  <TextField label="Review" value={row.review} onChange={(v) => setRow({ ...row, review: v })} />
                  <ImageUploadField
                    label="Photo"
                    value={row.image_url || ''}
                    onChange={(v) => setRow({ ...row, image_url: v })}
                    folder="testimonials"
                    fallback={row.name ? TESTIMONIAL_FALLBACKS[row.name] : undefined}
                  />
                </>
              )}
              onSave={(r) => saveRow('testimonials', r)}
            />
          </TabsContent>

          <TabsContent value="team_members">
            <SectionEditor
              title="Team"
              description="Team members shown on the About page. The first member is highlighted as Founder with a larger spotlight card."
              tableName="team_members"
              rows={data.team_members}
              error={errors.team_members}
              onSeed={() => seedTable('team_members')}
              seeding={seeding === 'team_members' || seeding === 'all'}
              onMove={(row, dir) => moveRow('team_members', row, dir)}
              onDelete={(id) => setPendingDelete({ table: 'team_members', id })}
              blank={{ name: '', role: '', image_url: '', bio: '', highlight: '', linkedin_url: '', youtube_url: '', sort_order: nextOrder(data.team_members), visible: true }}
              renderForm={(row, setRow) => (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Name" value={row.name} onChange={(v) => setRow({ ...row, name: v })} />
                    <Field label="Role" value={row.role} onChange={(v) => setRow({ ...row, role: v })} />
                  </div>
                  <TextField label="Bio" value={row.bio || ''} onChange={(v) => setRow({ ...row, bio: v })} />
                  <Field label="Highlight" value={row.highlight || ''} onChange={(v) => setRow({ ...row, highlight: v })} />
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="LinkedIn URL" value={row.linkedin_url || ''} onChange={(v) => setRow({ ...row, linkedin_url: v })} />
                    <Field label="YouTube URL" value={row.youtube_url || ''} onChange={(v) => setRow({ ...row, youtube_url: v })} />
                  </div>
                  <ImageUploadField
                    label="Portrait"
                    value={row.image_url || ''}
                    onChange={(v) => setRow({ ...row, image_url: v })}
                    folder="team"
                    fallback={row.name ? TEAM_FALLBACKS[row.name] : undefined}
                  />
                </>
              )}
              onSave={(r) => saveRow('team_members', r)}
            />
          </TabsContent>

          <TabsContent value="faqs">
            <SectionEditor
              title="Frequently Asked Questions"
              description="FAQ accordion on the About page. Category is optional and lets you group related questions together in future."
              tableName="faqs"
              rows={data.faqs}
              error={errors.faqs}
              onSeed={() => seedTable('faqs')}
              seeding={seeding === 'faqs' || seeding === 'all'}
              onMove={(row, dir) => moveRow('faqs', row, dir)}
              onDelete={(id) => setPendingDelete({ table: 'faqs', id })}
              blank={{ question: '', answer: '', category: '', sort_order: nextOrder(data.faqs), visible: true }}
              renderForm={(row, setRow) => (
                <>
                  <Field label="Question" value={row.question} onChange={(v) => setRow({ ...row, question: v })} />
                  <TextField label="Answer" value={row.answer} onChange={(v) => setRow({ ...row, answer: v })} />
                  <Field label="Category (optional)" value={row.category || ''} onChange={(v) => setRow({ ...row, category: v })} />
                </>
              )}
              onSave={(r) => saveRow('faqs', r)}
            />
          </TabsContent>

          <TabsContent value="services_catalog">
            <SectionEditor
              title="Services / Charger Catalog"
              description="Charger products shown on the Services page grid and comparison table. Features are displayed as bullet points."
              tableName="services_catalog"
              rows={data.services_catalog}
              error={errors.services_catalog}
              onSeed={() => seedTable('services_catalog')}
              seeding={seeding === 'services_catalog' || seeding === 'all'}
              onMove={(row, dir) => moveRow('services_catalog', row, dir)}
              onDelete={(id) => setPendingDelete({ table: 'services_catalog', id })}
              blank={{
                slug: '',
                name: '',
                charger_type: 'AC',
                power: '',
                price: '',
                warranty: '',
                description: '',
                features: [],
                features_csv: '',
                ideal_for: '',
                image_url: '',
                sort_order: nextOrder(data.services_catalog),
                visible: true,
              }}
              hydrate={(r) => ({ ...r, features_csv: Array.isArray(r.features) ? r.features.join(', ') : '' })}
              beforeSave={(r) => {
                const { features_csv, ...rest } = r;
                return { ...rest, features: features_csv ? csvToArray(features_csv) : [] };
              }}
              renderForm={(row, setRow) => (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Name" value={row.name} onChange={(v) => setRow({ ...row, name: v })} />
                    <Field label="Slug" value={row.slug || ''} onChange={(v) => setRow({ ...row, slug: v })} />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <select
                        className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                        value={row.charger_type || 'AC'}
                        onChange={(e) => setRow({ ...row, charger_type: e.target.value })}
                      >
                        <option value="AC">AC</option>
                        <option value="DC">DC</option>
                      </select>
                    </div>
                    <Field label="Power" value={row.power || ''} onChange={(v) => setRow({ ...row, power: v })} />
                    <Field label="Price" value={row.price || ''} onChange={(v) => setRow({ ...row, price: v })} />
                  </div>
                  <Field label="Warranty" value={row.warranty || ''} onChange={(v) => setRow({ ...row, warranty: v })} />
                  <TextField label="Description" value={row.description || ''} onChange={(v) => setRow({ ...row, description: v })} />
                  <Field
                    label="Features (comma-separated)"
                    value={row.features_csv || ''}
                    onChange={(v) => setRow({ ...row, features_csv: v })}
                  />
                  <Field label="Ideal For" value={row.ideal_for || ''} onChange={(v) => setRow({ ...row, ideal_for: v })} />
                  <ImageUploadField
                    label="Product Image"
                    value={row.image_url || ''}
                    onChange={(v) => setRow({ ...row, image_url: v })}
                    folder="services"
                    fallback={row.slug ? SERVICE_FALLBACKS[row.slug] : undefined}
                  />
                </>
              )}
              onSave={(r) => saveRow('services_catalog', r)}
            />
          </TabsContent>

          <TabsContent value="journey_milestones">
            <SectionEditor
              title="Journey Timeline"
              description="The 'A Plus Charge's Journey to EV Charging Leadership' timeline on the About page. Icon must be a lucide icon name (e.g. Rocket, Trophy, Zap). Color is a Tailwind gradient (e.g. from-blue-500 to-cyan-500)."
              tableName="journey_milestones"
              rows={data.journey_milestones}
              error={errors.journey_milestones}
              onSeed={() => seedTable('journey_milestones')}
              seeding={seeding === 'journey_milestones' || seeding === 'all'}
              onMove={(row, dir) => moveRow('journey_milestones', row, dir)}
              onDelete={(id) => setPendingDelete({ table: 'journey_milestones', id })}
              blank={{
                year: String(new Date().getFullYear()),
                title: '',
                description: '',
                icon: 'Rocket',
                color: 'from-blue-500 to-cyan-500',
                sort_order: nextOrder(data.journey_milestones),
                visible: true,
              }}
              renderForm={(row, setRow) => (
                <>
                  <div className="grid grid-cols-[100px_1fr] gap-3">
                    <Field label="Year" value={row.year} onChange={(v) => setRow({ ...row, year: v })} />
                    <Field label="Title" value={row.title} onChange={(v) => setRow({ ...row, title: v })} />
                  </div>
                  <TextField label="Description" value={row.description} onChange={(v) => setRow({ ...row, description: v })} />
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Icon (lucide name)" value={row.icon || ''} onChange={(v) => setRow({ ...row, icon: v })} />
                    <Field label="Color (Tailwind gradient)" value={row.color || ''} onChange={(v) => setRow({ ...row, color: v })} />
                  </div>
                </>
              )}
              onSave={(r) => saveRow('journey_milestones', r)}
            />
          </TabsContent>
        </Tabs>
      </div>

      <AlertDialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this item?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

/* ---------- helpers ---------- */

const nextOrder = (rows: AnyRow[]) =>
  rows.length ? Math.max(...rows.map((r) => Number(r.sort_order) || 0)) + 10 : 10;

const Field = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) => (
  <div className="space-y-2">
    <Label>{label}</Label>
    <Input value={value} onChange={(e) => onChange(e.target.value)} />
  </div>
);

const TextField = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) => (
  <div className="space-y-2">
    <Label>{label}</Label>
    <Textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} />
  </div>
);

interface SectionEditorProps {
  title: string;
  description?: string;
  tableName?: TableName;
  rows: AnyRow[];
  blank: AnyRow;
  hydrate?: (row: AnyRow) => AnyRow;
  beforeSave?: (row: AnyRow) => AnyRow;
  renderForm: (row: AnyRow, setRow: (r: AnyRow) => void) => React.ReactNode;
  onSave: (row: AnyRow) => Promise<boolean>;
  onDelete: (id: string) => void;
  onMove: (row: AnyRow, dir: -1 | 1) => void;
  onSeed?: () => Promise<void> | void;
  seeding?: boolean;
  error?: string | null;
}

const SectionEditor = ({
  title,
  description,
  tableName,
  rows,
  blank,
  hydrate,
  beforeSave,
  renderForm,
  onSave,
  onDelete,
  onMove,
  onSeed,
  seeding,
  error,
}: SectionEditorProps) => {
  const [draft, setDraft] = useState<AnyRow>(blank);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const startEdit = (row: AnyRow) => {
    const hydrated = hydrate ? hydrate(row) : row;
    setDraft(hydrated);
    setEditingId(row.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetDraft = () => {
    setDraft(blank);
    setEditingId(null);
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = beforeSave ? beforeSave(draft) : draft;
    const ok = await onSave(payload);
    if (ok) resetDraft();
    setSaving(false);
  };

  const toggleVisible = async (row: AnyRow) => {
    const hydrated = hydrate ? hydrate(row) : row;
    const payload = beforeSave ? beforeSave({ ...hydrated, visible: !row.visible }) : { ...hydrated, visible: !row.visible };
    await onSave(payload);
  };

  return (
    <div className="space-y-4">
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      {error && (
        <Card className="p-3 border-destructive/40 bg-destructive/5 text-sm">
          <span className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-4 h-4" />
            {error}
          </span>
        </Card>
      )}
    <div className="grid lg:grid-cols-2 gap-6">
      <Card className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            {editingId ? `Edit ${title}` : `Add ${title}`}
          </h2>
          {editingId && (
            <Button type="button" variant="ghost" size="sm" onClick={resetDraft}>
              Cancel edit
            </Button>
          )}
        </div>

        {renderForm(draft, setDraft)}

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Sort order</Label>
            <Input
              type="number"
              value={draft.sort_order ?? 0}
              onChange={(e) => setDraft({ ...draft, sort_order: Number(e.target.value) })}
            />
          </div>
          <div className="flex items-end gap-2">
            <Label className="mb-3">Visible</Label>
            <Switch
              checked={!!draft.visible}
              onCheckedChange={(v) => setDraft({ ...draft, visible: v })}
            />
          </div>
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full">
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving…' : editingId ? 'Save Changes' : `Add ${title}`}
        </Button>
      </Card>

      <Card className="p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">{title} ({rows.length})</h2>
          <Button size="sm" variant="outline" onClick={resetDraft} disabled={!editingId}>
            <Plus className="w-4 h-4 mr-1" /> New
          </Button>
        </div>
        <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
          {rows.length === 0 && (
            <div className="text-center py-8 space-y-3">
              <p className="text-sm text-muted-foreground">No items yet</p>
              {onSeed && (
                <Button size="sm" variant="outline" onClick={() => onSeed()} disabled={seeding}>
                  <Sparkles className="w-4 h-4 mr-1.5" />
                  {seeding ? 'Populating…' : 'Populate from current site'}
                </Button>
              )}
            </div>
          )}
          {rows.map((row, idx) => {
            const uploadedImg = row.image_url || row.logo_url;
            const fallbackImg = tableName ? getRowFallbackImage(tableName, row) : undefined;
            const displayImg = uploadedImg || fallbackImg;
            const usingFallback = !uploadedImg && !!fallbackImg;
            return (
            <div
              key={row.id}
              className="p-3 border rounded-md bg-card flex items-center gap-3"
            >
              {displayImg ? (
                <img
                  src={displayImg}
                  alt=""
                  title={usingFallback ? 'Using bundled default image' : undefined}
                  className={`w-12 h-12 rounded object-cover flex-shrink-0 border bg-white ${
                    usingFallback ? 'opacity-70 ring-1 ring-dashed ring-muted-foreground/40' : ''
                  }`}
                />
              ) : tableName === 'journey_milestones' && row.year ? (
                <div className="w-12 h-12 rounded bg-gradient-to-br from-primary to-cyan-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {row.year}
                </div>
              ) : (
                <div className="w-12 h-12 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground flex-shrink-0">
                  —
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">
                  {row.name || row.title || row.label || row.question || row.review?.slice(0, 50) || '(unnamed)'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {row.type ? (
                    <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold mr-1.5 uppercase tracking-wider ${
                      row.type === 'client' ? 'bg-emerald-100 text-emerald-700' :
                      row.type === 'partner' ? 'bg-blue-100 text-blue-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>{row.type}</span>
                  ) : null}
                  {row.role || row.value || row.charger_type || row.category || row.year || ''}
                  {row.value && row.suffix ? row.suffix : ''}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <Button size="icon" variant="ghost" onClick={() => onMove(row, -1)} disabled={idx === 0}>
                  <ChevronUp className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => onMove(row, 1)} disabled={idx === rows.length - 1}>
                  <ChevronDown className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => toggleVisible(row)} title={row.visible ? 'Hide' : 'Show'}>
                  {row.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4 text-muted-foreground" />}
                </Button>
                <Button size="icon" variant="outline" onClick={() => startEdit(row)}>
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="destructive" onClick={() => onDelete(row.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            );
          })}
        </div>
      </Card>
    </div>
    </div>
  );
};

export default AdminContent;
