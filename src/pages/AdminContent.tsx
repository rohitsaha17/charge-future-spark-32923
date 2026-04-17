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
import { ArrowLeft, Plus, Trash2, Save, ChevronUp, ChevronDown, Eye, EyeOff } from 'lucide-react';
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
] as const;
type TableName = (typeof ALL_TABLES)[number];

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
  });
  const [pendingDelete, setPendingDelete] = useState<{ table: TableName; id: string } | null>(null);

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
    await Promise.all(
      ALL_TABLES.map(async (t) => {
        const { data: rows } = await (supabase as any)
          .from(t)
          .select('*')
          .order('sort_order', { ascending: true });
        setData((prev) => ({ ...prev, [t]: rows || [] }));
      })
    );
  };

  const refreshOne = async (table: TableName) => {
    const { data: rows } = await (supabase as any)
      .from(table)
      .select('*')
      .order('sort_order', { ascending: true });
    setData((prev) => ({ ...prev, [table]: rows || [] }));
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
        <div className="flex items-center gap-4 mb-8">
          <Link to="/admin/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Site Content
          </h1>
        </div>

        <Tabs defaultValue="partners" className="w-full">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 mb-6">
            <TabsTrigger value="partners">Partners</TabsTrigger>
            <TabsTrigger value="statistics">Statistics</TabsTrigger>
            <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
            <TabsTrigger value="team_members">Team</TabsTrigger>
            <TabsTrigger value="faqs">FAQs</TabsTrigger>
            <TabsTrigger value="services_catalog">Services</TabsTrigger>
          </TabsList>

          <TabsContent value="partners">
            <SectionEditor
              title="Clientele / Partners"
              rows={data.partners}
              onMove={(row, dir) => moveRow('partners', row, dir)}
              onDelete={(id) => setPendingDelete({ table: 'partners', id })}
              blank={{ name: '', logo_url: '', website_url: '', sort_order: nextOrder(data.partners), visible: true }}
              renderForm={(row, setRow) => (
                <>
                  <Field label="Name" value={row.name} onChange={(v) => setRow({ ...row, name: v })} />
                  <Field label="Website URL" value={row.website_url || ''} onChange={(v) => setRow({ ...row, website_url: v })} />
                  <ImageUploadField
                    label="Logo"
                    value={row.logo_url || ''}
                    onChange={(v) => setRow({ ...row, logo_url: v })}
                    folder="partners"
                    previewClassName="h-16"
                  />
                </>
              )}
              onSave={(r) => saveRow('partners', r)}
            />
          </TabsContent>

          <TabsContent value="statistics">
            <SectionEditor
              title="Statistics / Counters"
              rows={data.statistics}
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
              rows={data.testimonials}
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
                  />
                </>
              )}
              onSave={(r) => saveRow('testimonials', r)}
            />
          </TabsContent>

          <TabsContent value="team_members">
            <SectionEditor
              title="Team"
              rows={data.team_members}
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
                  />
                </>
              )}
              onSave={(r) => saveRow('team_members', r)}
            />
          </TabsContent>

          <TabsContent value="faqs">
            <SectionEditor
              title="Frequently Asked Questions"
              rows={data.faqs}
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
              rows={data.services_catalog}
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
                  />
                </>
              )}
              onSave={(r) => saveRow('services_catalog', r)}
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
  rows: AnyRow[];
  blank: AnyRow;
  hydrate?: (row: AnyRow) => AnyRow;
  beforeSave?: (row: AnyRow) => AnyRow;
  renderForm: (row: AnyRow, setRow: (r: AnyRow) => void) => React.ReactNode;
  onSave: (row: AnyRow) => Promise<boolean>;
  onDelete: (id: string) => void;
  onMove: (row: AnyRow, dir: -1 | 1) => void;
}

const SectionEditor = ({
  title,
  rows,
  blank,
  hydrate,
  beforeSave,
  renderForm,
  onSave,
  onDelete,
  onMove,
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
            <p className="text-sm text-muted-foreground text-center py-8">No items yet</p>
          )}
          {rows.map((row, idx) => (
            <div
              key={row.id}
              className="p-3 border rounded-md bg-card flex items-center gap-3"
            >
              {row.image_url || row.logo_url ? (
                <img
                  src={row.image_url || row.logo_url}
                  alt=""
                  className="w-12 h-12 rounded object-cover flex-shrink-0 border"
                />
              ) : (
                <div className="w-12 h-12 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground flex-shrink-0">
                  —
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">
                  {row.name || row.label || row.question || row.review?.slice(0, 50) || '(unnamed)'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {row.role || row.value || row.charger_type || row.category || ''}
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
                  ✏️
                </Button>
                <Button size="icon" variant="destructive" onClick={() => onDelete(row.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default AdminContent;
