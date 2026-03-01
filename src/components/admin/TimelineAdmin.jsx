import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Upload, X, Image } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format, parseISO } from "date-fns";

const EMPTY = { title: "", description: "", entry_date: "", category: "Framework Release", screenshot_urls: [], tags: [], published: true };
const CAT_COLORS = {
  "Framework Release": "bg-indigo-100 text-indigo-700",
  "Business Idea": "bg-emerald-100 text-emerald-700",
  "Research Milestone": "bg-violet-100 text-violet-700",
  "Product Launch": "bg-amber-100 text-amber-700",
  "Other": "bg-slate-100 text-slate-600",
};

export default function TimelineAdmin() {
  const [entries, setEntries] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = () => base44.entities.TimelineEntry.list("-entry_date", 200).then(setEntries);
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (editing.id) {
      await base44.entities.TimelineEntry.update(editing.id, editing);
    } else {
      await base44.entities.TimelineEntry.create(editing);
    }
    setShowForm(false); setEditing(null); load();
  };

  const del = async (id) => {
    if (confirm("Delete this entry?")) { await base44.entities.TimelineEntry.delete(id); load(); }
  };

  const handleScreenshotUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    const uploaded = await Promise.all(files.map(f => base44.integrations.Core.UploadFile({ file: f })));
    const urls = uploaded.map(r => r.file_url);
    setEditing(prev => ({ ...prev, screenshot_urls: [...(prev.screenshot_urls || []), ...urls] }));
    setUploading(false);
  };

  const removeScreenshot = (idx) => {
    setEditing(prev => ({ ...prev, screenshot_urls: prev.screenshot_urls.filter((_, i) => i !== idx) }));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-slate-900">Timeline Entries ({entries.length})</h2>
        <Button onClick={() => { setEditing({...EMPTY}); setShowForm(true); }} className="bg-indigo-600 hover:bg-indigo-500 rounded-full gap-2">
          <Plus className="w-4 h-4" /> Add Entry
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        {entries.length === 0 ? (
          <div className="text-center py-12 text-slate-400">No timeline entries yet.</div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left px-5 py-3 text-sm font-medium text-slate-600">Title</th>
                <th className="text-left px-5 py-3 text-sm font-medium text-slate-600">Date</th>
                <th className="text-left px-5 py-3 text-sm font-medium text-slate-600">Category</th>
                <th className="text-left px-5 py-3 text-sm font-medium text-slate-600">Screenshots</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {entries.map(e => (
                <tr key={e.id} className="hover:bg-slate-50/50">
                  <td className="px-5 py-3">
                    <p className="font-medium text-slate-900 text-sm line-clamp-1">{e.title}</p>
                    {e.tags?.length > 0 && <div className="flex gap-1 mt-0.5 flex-wrap">{e.tags.map(t => <span key={t} className="text-xs text-slate-400">{t}</span>)}</div>}
                  </td>
                  <td className="px-5 py-3 text-sm text-slate-500">
                    {e.entry_date ? format(parseISO(e.entry_date), "MMM d, yyyy") : "—"}
                  </td>
                  <td className="px-5 py-3">
                    {e.category && <Badge className={`text-xs border-0 ${CAT_COLORS[e.category] || "bg-slate-100 text-slate-600"}`}>{e.category}</Badge>}
                  </td>
                  <td className="px-5 py-3">
                    <span className="flex items-center gap-1 text-slate-400 text-sm">
                      <Image className="w-3.5 h-3.5" /> {e.screenshot_urls?.length || 0}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-2 justify-end">
                      <Button size="sm" variant="ghost" onClick={() => { setEditing({...e}); setShowForm(true); }}><Pencil className="w-4 h-4" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => del(e.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
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
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit Entry" : "Add Timeline Entry"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4 mt-2">
              <div>
                <Label className="mb-1.5 block">Title *</Label>
                <Input value={editing.title} onChange={e => setEditing({...editing, title: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="mb-1.5 block">Date *</Label>
                  <Input type="date" value={editing.entry_date} onChange={e => setEditing({...editing, entry_date: e.target.value})} />
                </div>
                <div>
                  <Label className="mb-1.5 block">Category</Label>
                  <Select value={editing.category} onValueChange={v => setEditing({...editing, category: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["Framework Release","Business Idea","Research Milestone","Product Launch","Other"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label className="mb-1.5 block">Description</Label>
                <Textarea rows={3} value={editing.description} onChange={e => setEditing({...editing, description: e.target.value})} />
              </div>
              <div>
                <Label className="mb-1.5 block">Tags (comma separated)</Label>
                <Input value={editing.tags?.join(", ") || ""} onChange={e => setEditing({...editing, tags: e.target.value.split(",").map(t => t.trim()).filter(Boolean)})} placeholder="AI, framework, strategy" />
              </div>
              <div>
                <Label className="mb-1.5 block">Screenshots</Label>
                <label className="cursor-pointer block border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-indigo-300 transition-colors">
                  <input type="file" accept="image/*" multiple onChange={handleScreenshotUpload} className="hidden" />
                  <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                  <p className="text-sm text-slate-500">Upload screenshots (multiple allowed)</p>
                </label>
                {uploading && <p className="text-xs text-indigo-600 mt-1">Uploading...</p>}
                {editing.screenshot_urls?.length > 0 && (
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {editing.screenshot_urls.map((url, idx) => (
                      <div key={idx} className="relative group w-20 h-20">
                        <img src={url} alt="" className="w-full h-full object-cover rounded-xl border border-slate-200" />
                        <button
                          onClick={() => removeScreenshot(idx)}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={editing.published} onCheckedChange={v => setEditing({...editing, published: v})} />
                <Label>Published</Label>
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <Button variant="outline" onClick={() => { setShowForm(false); setEditing(null); }}>Cancel</Button>
                <Button onClick={save} className="bg-indigo-600 hover:bg-indigo-500 text-white">Save Entry</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}