import React, { useState } from "react";
import { Share2, Twitter, Mail, Link2, Check, Linkedin, Facebook, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

export default function ShareAppButton({ app }) {
  const [copied, setCopied] = useState(false);
  const shareUrl = app.web_url || window.location.href;
  const text = `Check out ${app.name} by Epiphany.AI — ${app.tagline || ""}`;
  const encodedText = encodeURIComponent(text);
  const encodedUrl = encodeURIComponent(shareUrl);

  const stop = fn => e => { e.stopPropagation(); fn(); };

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const platforms = [
    {
      label: "Twitter / X",
      icon: <Twitter className="w-4 h-4 text-sky-500" />,
      action: () => window.open(`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`, "_blank"),
    },
    {
      label: "LinkedIn",
      icon: <Linkedin className="w-4 h-4 text-blue-700" />,
      action: () => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`, "_blank"),
    },
    {
      label: "Facebook",
      icon: <Facebook className="w-4 h-4 text-blue-600" />,
      action: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, "_blank"),
    },
    {
      label: "WhatsApp",
      icon: <MessageCircle className="w-4 h-4 text-green-500" />,
      action: () => window.open(`https://wa.me/?text=${encodeURIComponent(text + "\n" + shareUrl)}`, "_blank"),
    },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="outline" className="rounded-full gap-1.5" onClick={e => e.stopPropagation()}>
          <Share2 className="w-3.5 h-3.5" /> Share
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {platforms.map(p => (
          <DropdownMenuItem key={p.label} onClick={stop(p.action)} className="gap-2 cursor-pointer">
            {p.icon} {p.label}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={stop(() => window.open(`mailto:?subject=${encodeURIComponent(app.name)}&body=${encodeURIComponent(text + "\n\n" + shareUrl)}`, "_blank"))}
          className="gap-2 cursor-pointer"
        >
          <Mail className="w-4 h-4 text-slate-500" /> Email
        </DropdownMenuItem>
        <DropdownMenuItem onClick={stop(copyLink)} className="gap-2 cursor-pointer">
          {copied ? <Check className="w-4 h-4 text-green-500" /> : <Link2 className="w-4 h-4 text-slate-500" />}
          {copied ? "Copied!" : "Copy Link"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}