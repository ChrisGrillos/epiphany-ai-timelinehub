import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Upload, Link, FileText, FlaskConical } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import MediumBulkImporter from "./MediumBulkImporter";

const EMPTY = { title: "", author: "", excerpt: "", content: "", category: "Research", source: "written", medium_url: "", zenodo_url: "", file_url: "", cover_image: "", published: false, featured: false, read_time: 5, tags: [] };

export default function ArticleAdmin() {
  const [articles, setArticles] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = () => base44.entities.Article.list("-created_date", 100).then(setArticles);
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (editing.id) {
      await base44.entities.Article.update(editing.id, editing);
    } else {
      await base44.entities.Article.create(editing);
    }
    setShowForm(false); setEditing(null); load();
  };

  const del = async (id) => {
    if (confirm("Delete this article?")) { await base44.entities.Article.delete(id); load(); }
  };

  const handleFileUpload = async (e, field) => {
    const file = e.target.files[0]; if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setEditing(prev => ({ ...prev, [field]: file_url }));
    setUploading(false);
  };

  const openNew = () => { setEditing({...EMPTY}); setShowForm(true); };
  const openEdit = (a) => { setEditing({...a}); setShowForm(true); };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-slate-900">Articles & Research ({articles.length})</h2>
        <Button onClick={openNew} className="bg-indigo-600 hover:bg-indigo-500 rounded-full gap-2">
          <Plus className="w-4 h-4" /> Add Article
        </Button>
      </div>

      {/* Medium RSS Bulk Importer */}
      <MediumBulkImporter onImported={load} />

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        {articles.length === 0 ? (
          <div className="text-center py-12 text-slate-400">No articles yet.</div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left px-5 py-3 text-sm font-medium text-slate-600">Title</th>
                <th className="text-left px-5 py-3 text-sm font-medium text-slate-600">Source</th>
                <th className="text-left px-5 py-3 text-sm font-medium text-slate-600">Category</th>
                <th className="text-left px-5 py-3 text-sm font-medium text-slate-600">Status</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {articles.map(a => (
                <tr key={a.id} className="hover:bg-slate-50/50">
                  <td className="px-5 py-3">
                    <p className="font-medium text-slate-900 text-sm line-clamp-1">{a.title}</p>
                    {a.featured && <Badge className="text-xs bg-amber-50 text-amber-600 border-0 mt-0.5">Featured</Badge>}
                  </td>
                  <td className="px-5 py-3"><Badge variant="outline" className="text-xs capitalize">{a.source}</Badge></td>
                  <td className="px-5 py-3 text-sm text-slate-500">{a.category}</td>
                  <td className="px-5 py-3">
                    <Badge className={a.published ? "bg-green-50 text-green-600 border-0" : "bg-slate-100 text-slate-500 border-0"}>
                      {a.published ? "Live" : "Draft"}
                    </Badge>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-2 justify-end">
                      <Button size="sm" variant="ghost" onClick={() => openEdit(a)}><Pencil className="w-4 h-4" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => del(a.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={v => { if (!v) { setShowForm(false); setEditing(null); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit Article" : "Add Article"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4 mt-2">
              <div>
                <Label className="mb-1.5 block">Title *</Label>
                <Input value={editing.title} onChange={e => setEditing({...editing, title: e.target.value})} />
              </div>
              <div>
                <Label className="mb-1.5 block">Author</Label>
                <Input value={editing.author || ""} onChange={e => setEditing({...editing, author: e.target.value})} placeholder="Author name(s)" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="mb-1.5 block">Source</Label>
                  <Select value={editing.source} onValueChange={v => setEditing({...editing, source: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="written">Written (markdown)</SelectItem>
                      <SelectItem value="medium">Medium Article</SelectItem>
                      <SelectItem value="upload">Uploaded Document</SelectItem>
                      <SelectItem value="zenodo">Zenodo Record</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="mb-1.5 block">Category</Label>
                  <Select value={editing.category} onValueChange={v => setEditing({...editing, category: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["Research","AI","Strategy","Think Tank","Case Study","Other"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {editing.source === "medium" && (
                <div>
                  <Label className="mb-1.5 block flex items-center gap-1"><Link className="w-3.5 h-3.5" /> Medium URL</Label>
                  <Input value={editing.medium_url} onChange={e => setEditing({...editing, medium_url: e.target.value})} placeholder="https://medium.com/..." />
                </div>
              )}

              {editing.source === "zenodo" && (
                <div>
                  <Label className="mb-1.5 block flex items-center gap-1"><FlaskConical className="w-3.5 h-3.5" /> Zenodo Record URL</Label>
                  <Input value={editing.zenodo_url || ""} onChange={e => setEditing({...editing, zenodo_url: e.target.value})} placeholder="https://zenodo.org/records/..." />
                  <p className="text-xs text-slate-400 mt-1">Paste the full Zenodo record URL. Users will be linked directly to Zenodo to view/download the paper.</p>
                </div>
              )}

              {editing.source === "upload" && (
                <div>
                  <Label className="mb-1.5 block flex items-center gap-1"><Upload className="w-3.5 h-3.5" /> Upload Document</Label>
                  <input type="file" accept=".pdf,.docx,.doc,.txt,.md" onChange={e => handleFileUpload(e, "file_url")} className="text-sm text-slate-600" />
                  {editing.file_url && <p className="text-xs text-green-600 mt-1">✓ File uploaded</p>}
                </div>
              )}

              <div>
                <Label className="mb-1.5 block">Excerpt</Label>
                <Textarea rows={2} value={editing.excerpt} onChange={e => setEditing({...editing, excerpt: e.target.value})} placeholder="Short summary..." />
              </div>

              {editing.source === "written" && (
                <div>
                  <Label className="mb-1.5 block flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> Content (Markdown)</Label>
                  <Textarea rows={10} value={editing.content} onChange={e => setEditing({...editing, content: e.target.value})} placeholder="Write your article in markdown..." className="font-mono text-sm" />
                </div>
              )}

              <div>
                <Label className="mb-1.5 block">Cover Image</Label>
                <div className="flex gap-2 items-center">
                  <Input value={editing.cover_image} onChange={e => setEditing({...editing, cover_image: e.target.value})} placeholder="Image URL or upload below" />
                  <label className="cursor-pointer">
                    <input type="file" accept="image/*" onChange={e => handleFileUpload(e, "cover_image")} className="hidden" />
                    <Button type="button" variant="outline" size="sm" asChild><span><Upload className="w-4 h-4" /></span></Button>
                  </label>
                </div>
                {uploading && <p className="text-xs text-indigo-600 mt-1">Uploading...</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="mb-1.5 block">Read Time (min)</Label>
                  <Input type="number" value={editing.read_time} onChange={e => setEditing({...editing, read_time: parseInt(e.target.value)})} />
                </div>
                <div>
                  <Label className="mb-1.5 block">Tags (comma separated)</Label>
                  <Input value={editing.tags?.join(", ") || ""} onChange={e => setEditing({...editing, tags: e.target.value.split(",").map(t => t.trim()).filter(Boolean)})} placeholder="AI, research, strategy" />
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
                <Button onClick={save} className="bg-indigo-600 hover:bg-indigo-500 text-white">Save Article</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}