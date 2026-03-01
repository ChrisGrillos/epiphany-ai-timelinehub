import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Sparkles, X, Upload, Loader2, Copy, Check, ChevronDown, ChevronUp, BookOpen, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ReactMarkdown from "react-markdown";

const MODES = [
  { value: "outline", label: "Generate Outline" },
  { value: "draft", label: "Draft Article" },
  { value: "abstract", label: "Generate Abstract" },
  { value: "summary", label: "Summarize Content" },
  { value: "seo", label: "SEO Optimize" },
  { value: "related", label: "Related Topics & Papers" },
  { value: "upload_analyze", label: "Analyze Uploaded Doc" },
];

const PROMPTS = {
  outline: (topic, ctx) => `Generate a detailed, structured research article outline for the topic: "${topic}".
${ctx ? `Additional context: ${ctx}` : ""}
Include: executive summary, key sections with subsections, key arguments, data points to include, and conclusion.
Format as clean markdown with ## headers.`,

  draft: (topic, ctx) => `Write a professional research article about: "${topic}".
${ctx ? `Context/notes: ${ctx}` : ""}
Write in an authoritative, thought-leadership style appropriate for an AI research thinktank. Include an introduction, main body with insights, and conclusion. Format in markdown.`,

  abstract: (topic, ctx) => `Write a concise academic abstract (150–250 words) for a research article titled: "${topic}".
${ctx ? `Article content or notes: ${ctx}` : ""}
The abstract should include: background/motivation, research question or objective, methodology (if applicable), key findings or arguments, and implications. Write in formal academic style.`,

  summary: (topic, ctx) => `Provide a comprehensive summary of the following content.
${topic ? `Title: "${topic}"` : ""}
${ctx ? `Content: ${ctx}` : ""}
Include: a 2-3 sentence TL;DR, key points (bullet list), main arguments, and takeaways. Format in markdown.`,

  seo: (topic, ctx) => `Provide SEO optimization recommendations for a research article titled: "${topic}".
${ctx ? `Article excerpt/content: ${ctx}` : ""}
Include: target keywords, meta description (under 160 chars), title tag suggestions, header structure, internal linking suggestions, and readability improvements.`,

  related: (topic, ctx) => `You are a research assistant. Based on the following topic or article content, suggest related research areas and notable papers.
Topic/Title: "${topic}"
${ctx ? `Context: ${ctx}` : ""}
Provide:
1. **Related Research Topics** (5–8 suggestions with brief explanation of relevance)
2. **Key Papers & References** (suggest 5–8 real, well-known papers or authors in this space with a one-line description)
3. **Emerging Trends** in this research area
4. **Cross-disciplinary Connections** to adjacent fields
Format in markdown with clear sections.`,

  upload_analyze: (topic, _ctx) => `Analyze this research document. Provide:
1. A concise summary (2-3 paragraphs)
2. Key findings and claims
3. Suggested title and excerpt for publishing
4. Recommended tags and category
5. SEO keywords
6. Related research topics to explore
${topic ? `Additional focus areas: ${topic}` : ""}`,
};

export default function AIAssistantPanel({ onClose }) {
  const [mode, setMode] = useState("outline");
  const [topic, setTopic] = useState("");
  const [context, setContext] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(true);

  const run = async () => {
    if (!topic && mode !== "upload_analyze") return;
    setLoading(true);
    setResult("");

    let fileUrl = null;
    if (mode === "upload_analyze" && file) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      fileUrl = file_url;
    }

    const prompt = PROMPTS[mode](topic, context);

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

  const currentMode = MODES.find(m => m.value === mode);

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

          {/* Mode hint */}
          {mode === "related" && (
            <div className="flex items-start gap-2 bg-indigo-50 rounded-xl px-3 py-2 text-xs text-indigo-700">
              <BookOpen className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
              <span>Enter a topic or paste article content to discover related papers and research directions.</span>
            </div>
          )}
          {(mode === "abstract" || mode === "summary") && (
            <div className="flex items-start gap-2 bg-slate-50 rounded-xl px-3 py-2 text-xs text-slate-600">
              <FileText className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
              <span>{mode === "abstract" ? "Generates a formal academic abstract." : "Paste article content below for a structured summary."}</span>
            </div>
          )}

          {/* Input */}
          {mode !== "upload_analyze" ? (
            <>
              <Input
                placeholder={
                  mode === "seo" ? "Article title..." :
                  mode === "related" ? "Topic, article title, or research area..." :
                  mode === "abstract" ? "Article title..." :
                  mode === "summary" ? "Article title (optional)..." :
                  "Topic or title..."
                }
                value={topic}
                onChange={e => setTopic(e.target.value)}
                className="rounded-xl"
              />
              <Textarea
                placeholder={
                  mode === "seo" ? "Paste article excerpt for analysis..." :
                  mode === "related" ? "Paste abstract or key content for more precise suggestions..." :
                  mode === "summary" ? "Paste the full article content here..." :
                  mode === "abstract" ? "Paste article content or key points..." :
                  "Additional context, notes, or key points..."
                }
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
                  <input type="file" accept=".pdf,.docx,.doc,.txt,.md" onChange={e => setFile(e.target.files[0])} className="hidden" />
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
            disabled={loading || (!topic && mode !== "upload_analyze" && mode !== "summary") || (mode === "upload_analyze" && !file)}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl gap-2"
          >
            {loading
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
              : <><Sparkles className="w-4 h-4" /> {currentMode?.label || "Generate"}</>
            }
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