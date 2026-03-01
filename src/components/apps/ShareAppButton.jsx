import React, { useState } from "react";
import { Share2, Twitter, Mail, Link2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

export default function ShareAppButton({ app }) {
  const [copied, setCopied] = useState(false);
  const shareUrl = app.web_url || window.location.href;
  const text = `Check out ${app.name} by Epiphany.AI — ${app.tagline || ""}`;

  const copyLink = async (e) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareTwitter = (e) => {
    e.stopPropagation();
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`, "_blank");
  };

  const shareEmail = (e) => {
    e.stopPropagation();
    window.open(`mailto:?subject=${encodeURIComponent(app.name)}&body=${encodeURIComponent(text + "\n\n" + shareUrl)}`, "_blank");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="outline" className="rounded-full gap-1.5" onClick={e => e.stopPropagation()}>
          <Share2 className="w-3.5 h-3.5" /> Share
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem onClick={shareTwitter} className="gap-2 cursor-pointer">
          <Twitter className="w-4 h-4 text-sky-500" /> Twitter / X
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareEmail} className="gap-2 cursor-pointer">
          <Mail className="w-4 h-4 text-slate-500" /> Email
        </DropdownMenuItem>
        <DropdownMenuItem onClick={copyLink} className="gap-2 cursor-pointer">
          {copied ? <Check className="w-4 h-4 text-green-500" /> : <Link2 className="w-4 h-4 text-slate-500" />}
          {copied ? "Copied!" : "Copy Link"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}