import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Sparkles, Loader2, Copy, Check, ChevronDown, ChevronUp, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";

const SUMMARY_MODES = [
  { value: "abstract", label: "Academic Abstract", description: "Formal 150–250 word abstract" },
  { value: "tldr", label: "TL;DR Summary", description: "Quick bullet-point summary" },
  { value: "executive", label: "Executive Summary", description: "Professional overview for decision-makers" },
];

export default function ArticleSummarizer({ article }) {
  const [mode, setMode] = useState("abstract");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const generate = async () => {
    setLoading(true);
    setResult("");

    const content = article.content || article.excerpt || "";
    const title = article.title || "";

    let prompt = "";
    if (mode === "abstract") {
      prompt = `Write a concise academic abstract (150–250 words) for the following research article.
Title: "${title}"
Content: ${content.slice(0, 4000)}
The abstract should cover: background/motivation, research question, key findings, and implications. Use formal academic tone.`;
    } else if (mode === "tldr") {
      prompt = `Generate a TL;DR summary for this research article.
Title: "${title}"
Content: ${content.slice(0, 4000)}
Provide:
- **One-liner**: A single sentence capturing the core point
- **Key Points**: 4–6 bullet points of the most important ideas
- **Bottom Line**: One sentence on the main takeaway
Format in markdown.`;
    } else if (mode === "executive") {
      prompt = `Write an executive summary for the following research article, suitable for a business or leadership audience.
Title: "${title}"
Content: ${content.slice(0, 4000)}
Structure it as: Context (1 paragraph), Key Insights (bullet list), Strategic Implications (1 paragraph). Keep it under 300 words. Format in markdown.`;
    }

    const response = await base44.integrations.Core.InvokeLLM({ prompt });
    setResult(typeof response === "string" ? response : JSON.stringify(response));
    setLoading(false);
  };

  const copyResult = async () => {
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-10 border border-indigo-100 rounded-2xl overflow-hidden">
      {/* Header toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 bg-gradient-to-r from-indigo-50 to-slate-50 hover:from-indigo-100 transition-colors"
      >
        <div className="flex items-center gap-2 text-indigo-700 font-semibold text-sm">
          <Sparkles className="w-4 h-4" />
          AI Summarizer
          <span className="text-slate-400 font-normal">— generate an abstract, TL;DR, or executive summary</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>

      {open && (
        <div className="px-6 py-5 space-y-4 bg-white">
          {/* Mode tabs */}
          <div className="flex gap-2 flex-wrap">
            {SUMMARY_MODES.map(m => (
              <button
                key={m.value}
                onClick={() => { setMode(m.value); setResult(""); }}
                className={`px-4 py-2 rounded-full text-xs font-medium border transition-colors ${
                  mode === m.value
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "border-slate-200 text-slate-600 hover:border-indigo-300"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-400">{SUMMARY_MODES.find(m => m.value === mode)?.description}</p>

          <Button
            onClick={generate}
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl gap-2 text-sm"
          >
            {loading
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
              : <><Sparkles className="w-4 h-4" /> Generate {SUMMARY_MODES.find(m => m.value === mode)?.label}</>
            }
          </Button>

          {result && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <FileText className="w-3.5 h-3.5" />
                  {SUMMARY_MODES.find(m => m.value === mode)?.label}
                </div>
                <button onClick={copyResult} className="text-xs text-slate-400 hover:text-indigo-600 flex items-center gap-1">
                  {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 max-h-72 overflow-y-auto">
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