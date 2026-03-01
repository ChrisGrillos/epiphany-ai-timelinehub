import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Sparkles, X, Upload, Loader2, Copy, Check, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from "react-markdown";

const MODES = [
  { value: "outline", label: "Generate Outline" },
  { value: "draft", label: "Draft Article" },
  { value: "seo", label: "SEO Optimize" },
  { value: "upload_analyze", label: "Analyze Uploaded Doc" },
];

export default function AIAssistantPanel({ onClose }) {
  const [mode, setMode] = useState("outline");
  const [topic, setTopic] = useState("");
  const [context, setContext] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(true);

  const handleFileUpload = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
  };

  const run = async () => {
    if (!topic && mode !== "upload_analyze") return;
    setLoading(true);
    setResult("");

    let prompt = "";
    let fileUrl = null;

    if (mode === "upload_analyze" && file) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      fileUrl = file_url;
    }

    if (mode === "outline") {
      prompt = `Generate a detailed, structured research article outline for the topic: "${topic}".
${context ? `Additional context: ${context}` : ""}
Include: executive summary, key sections with subsections, key arguments, data points to include, and conclusion.
Format as clean markdown with ## headers.`;
    } else if (mode === "draft") {
      prompt = `Write a professional research article about: "${topic}".
${context ? `Context/notes: ${context}` : ""}
Write in an authoritative, thought-leadership style appropriate for an AI research thinktank. Include an introduction, main body with insights, and conclusion. Format in markdown.`;
    } else if (mode === "seo") {
      prompt = `Provide SEO optimization recommendations for a research article titled: "${topic}".
${context ? `Article excerpt/content: ${context}` : ""}
Include: target keywords, meta description (under 160 chars), title tag suggestions, header structure, internal linking suggestions, and readability improvements.`;
    } else if (mode === "upload_analyze") {
      prompt = `Analyze this research document. Provide:
1. A concise summary (2-3 paragraphs)
2. Key findings and claims
3. Suggested title and excerpt for publishing
4. Recommended tags and category
5. SEO keywords
${topic ? `Additional focus areas: ${topic}` : ""}`;
    }

    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      file_urls: fileUrl ? [fileUrl] : undefined,
    });

    setResult(typeof response === "string" ? response : JSON.stringify(response));
    setLoading(false);
  };

  const copyResult = async () => {
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white border border-indigo-200 rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          <span className="font-semibold text-sm">AI Research Assistant</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setExpanded(!expanded)} className="text-white/80 hover:text-white">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="p-5 space-y-4">
          {/* Mode selector */}
          <Select value={mode} onValueChange={v => { setMode(v); setResult(""); }}>
            <SelectTrigger className="rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MODES.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
            </SelectContent>
          </Select>

          {/* Input */}
          {mode !== "upload_analyze" ? (
            <>
              <Input
                placeholder={mode === "seo" ? "Article title..." : "Topic or title..."}
                value={topic}
                onChange={e => setTopic(e.target.value)}
                className="rounded-xl"
              />
              <Textarea
                placeholder={mode === "seo" ? "Paste article excerpt for analysis..." : "Additional context, notes, or key points..."}
                value={context}
                onChange={e => setContext(e.target.value)}
                rows={3}
                className="rounded-xl text-sm"
              />
            </>
          ) : (
            <>
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-indigo-300 transition-colors">
                <label className="cursor-pointer block">
                  <input type="file" accept=".pdf,.docx,.doc,.txt,.md" onChange={handleFileUpload} className="hidden" />
                  <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">{file ? file.name : "Click to upload document (PDF, DOCX, MD)"}</p>
                </label>
              </div>
              <Input
                placeholder="Optional: specific focus areas..."
                value={topic}
                onChange={e => setTopic(e.target.value)}
                className="rounded-xl"
              />
            </>
          )}

          <Button
            onClick={run}
            disabled={loading || (!topic && mode !== "upload_analyze") || (mode === "upload_analyze" && !file)}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl gap-2"
          >
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><Sparkles className="w-4 h-4" /> Generate</>}
          </Button>

          {/* Result */}
          {result && (
            <div className="mt-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Result</span>
                <button onClick={copyResult} className="text-xs text-slate-400 hover:text-indigo-600 flex items-center gap-1">
                  {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 max-h-80 overflow-y-auto">
                <div className="prose prose-sm prose-slate max-w-none text-sm">
                  <ReactMarkdown>{result}</ReactMarkdown>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}