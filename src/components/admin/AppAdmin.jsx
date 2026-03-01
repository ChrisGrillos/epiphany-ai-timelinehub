import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Upload } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const EMPTY = { name: "", tagline: "", description: "", icon_url: "", screenshot_urls: [], category: "AI Tool", web_url: "", embed_url: "", app_store_url: "", play_store_url: "", windows_store_url: "", featured: false, published: true, tags: [] };

export default function AppAdmin() {
  const [apps, setApps] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = () => base44.entities.App.list("-created_date", 100).then(setApps);
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (editing.id) { await base44.entities.App.update(editing.id, editing); }
    else { await base44.entities.App.create(editing); }
    setShowForm(false); setEditing(null); load();
  };

  const del = async (id) => {
    if (confirm("Delete this app?")) { await base44.entities.App.delete(id); load(); }
  };

  const handleUpload = async (e, field) => {
    const file = e.target.files[0]; if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    if (field === "screenshot_urls") {
      setEditing(prev => ({ ...prev, screenshot_urls: [...(prev.screenshot_urls || []), file_url] }));
    } else {
      setEditing(prev => ({ ...prev, [field]: file_url }));
    }
    setUploading(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-slate-900">Apps ({apps.length})</h2>
        <Button onClick={() => { setEditing({...EMPTY}); setShowForm(true); }} className="bg-indigo-600 hover:bg-indigo-500 rounded-full gap-2">
          <Plus className="w-4 h-4" /> Add App
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        {apps.length === 0 ? (
          <div className="text-center py-12 text-slate-400">No apps yet.</div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left px-5 py-3 text-sm font-medium text-slate-600">App</th>
                <th className="text-left px-5 py-3 text-sm font-medium text-slate-600">Category</th>
                <th className="text-left px-5 py-3 text-sm font-medium text-slate-600">Store Links</th>
                <th className="text-left px-5 py-3 text-sm font-medium text-slate-600">Status</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {apps.map(app => (
                <tr key={app.id} className="hover:bg-slate-50/50">
                  <td className="px-5 py-3 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center overflow-hidden shrink-0">
                      {app.icon_url ? <img src={app.icon_url} alt="" className="w-full h-full object-cover" /> : <span className="text-indigo-400 text-xs font-bold">{app.name[0]}</span>}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 text-sm">{app.name}</p>
                      <p className="text-slate-400 text-xs line-clamp-1">{app.tagline}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm text-slate-500">{app.category}</td>
                  <td className="px-5 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {app.app_store_url && <Badge className="text-xs bg-slate-100 text-slate-600 border-0">iOS</Badge>}
                      {app.play_store_url && <Badge className="text-xs bg-slate-100 text-slate-600 border-0">Android</Badge>}
                      {app.windows_store_url && <Badge className="text-xs bg-slate-100 text-slate-600 border-0">Windows</Badge>}
                      {app.web_url && <Badge className="text-xs bg-slate-100 text-slate-600 border-0">Web</Badge>}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <Badge className={app.published ? "bg-green-50 text-green-600 border-0" : "bg-slate-100 text-slate-500 border-0"}>
                      {app.published ? "Live" : "Hidden"}
                    </Badge>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-2 justify-end">
                      <Button size="sm" variant="ghost" onClick={() => { setEditing({...app}); setShowForm(true); }}><Pencil className="w-4 h-4" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => del(app.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Dialog open={showForm} onOpenChange={v => { if (!v) { setShowForm(false); setEditing(null); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing?.id ? "Edit App" : "Add App"}</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="mb-1.5 block">App Name *</Label>
                  <Input value={editing.name} onChange={e => setEditing({...editing, name: e.target.value})} />
                </div>
                <div>
                  <Label className="mb-1.5 block">Category</Label>
                  <Select value={editing.category} onValueChange={v => setEditing({...editing, category: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["AI Tool","Research Tool","Strategy","Productivity","Other"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label className="mb-1.5 block">Tagline</Label>
                <Input value={editing.tagline} onChange={e => setEditing({...editing, tagline: e.target.value})} placeholder="One-line description" />
              </div>
              <div>
                <Label className="mb-1.5 block">Description</Label>
                <Textarea rows={3} value={editing.description} onChange={e => setEditing({...editing, description: e.target.value})} />
              </div>

              <div>
                <Label className="mb-1.5 block">App Icon</Label>
                <div className="flex gap-2 items-center">
                  <Input value={editing.icon_url} onChange={e => setEditing({...editing, icon_url: e.target.value})} placeholder="URL or upload" />
                  <label className="cursor-pointer">
                    <input type="file" accept="image/*" onChange={e => handleUpload(e, "icon_url")} className="hidden" />
                    <Button type="button" variant="outline" size="sm" asChild><span><Upload className="w-4 h-4" /></span></Button>
                  </label>
                </div>
                {uploading && <p className="text-xs text-indigo-600 mt-1">Uploading...</p>}
              </div>

              <div>
                <Label className="mb-1.5 block">Screenshot</Label>
                <div className="flex gap-2 items-center">
                  <label className="cursor-pointer">
                    <input type="file" accept="image/*" onChange={e => handleUpload(e, "screenshot_urls")} className="hidden" />
                    <Button type="button" variant="outline" size="sm" asChild><span><Upload className="w-4 h-4 mr-2" />Upload Screenshot</span></Button>
                  </label>
                </div>
                {editing.screenshot_urls?.length > 0 && (
                  <p className="text-xs text-green-600 mt-1">✓ {editing.screenshot_urls.length} screenshot(s)</p>
                )}
              </div>

              <hr className="border-slate-100" />
              <p className="text-sm font-medium text-slate-700">Store & Web Links</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="mb-1.5 block text-xs">Web URL</Label>
                  <Input value={editing.web_url} onChange={e => setEditing({...editing, web_url: e.target.value})} placeholder="https://..." />
                </div>
                <div>
                  <Label className="mb-1.5 block text-xs">Embed URL (for in-site launcher)</Label>
                  <Input value={editing.embed_url} onChange={e => setEditing({...editing, embed_url: e.target.value})} placeholder="https://..." />
                </div>
                <div>
                  <Label className="mb-1.5 block text-xs">App Store (iOS)</Label>
                  <Input value={editing.app_store_url} onChange={e => setEditing({...editing, app_store_url: e.target.value})} placeholder="https://apps.apple.com/..." />
                </div>
                <div>
                  <Label className="mb-1.5 block text-xs">Google Play</Label>
                  <Input value={editing.play_store_url} onChange={e => setEditing({...editing, play_store_url: e.target.value})} placeholder="https://play.google.com/..." />
                </div>
                <div>
                  <Label className="mb-1.5 block text-xs">Windows Store</Label>
                  <Input value={editing.windows_store_url} onChange={e => setEditing({...editing, windows_store_url: e.target.value})} placeholder="https://apps.microsoft.com/..." />
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Switch checked={editing.published} onCheckedChange={v => setEditing({...editing, published: v})} />
                  <Label>Published</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={editing.featured} onCheckedChange={v => setEditing({...editing, featured: v})} />
                  <Label>Featured on Home</Label>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <Button variant="outline" onClick={() => { setShowForm(false); setEditing(null); }}>Cancel</Button>
                <Button onClick={save} className="bg-indigo-600 hover:bg-indigo-500 text-white">Save App</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}