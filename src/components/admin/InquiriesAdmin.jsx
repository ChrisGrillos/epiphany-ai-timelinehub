import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Building2 } from "lucide-react";
import { format } from "date-fns";

const STATUS_COLORS = {
  new: "bg-blue-50 text-blue-600",
  reviewed: "bg-yellow-50 text-yellow-600",
  responded: "bg-green-50 text-green-600"
};

export default function InquiriesAdmin() {
  const [inquiries, setInquiries] = useState([]);
  const [expanded, setExpanded] = useState(null);

  const load = () => base44.entities.ContactInquiry.list("-created_date", 100).then(setInquiries);
  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    await base44.entities.ContactInquiry.update(id, { status });
    load();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-slate-900">Contact Inquiries ({inquiries.length})</h2>
        <Badge className="bg-blue-50 text-blue-600 border-0">
          {inquiries.filter(i => i.status === "new").length} new
        </Badge>
      </div>

      <div className="space-y-3">
        {inquiries.length === 0 ? (
          <div className="text-center py-12 text-slate-400 bg-white rounded-2xl border border-slate-100">No inquiries yet.</div>
        ) : inquiries.map(inq => (
          <div key={inq.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div
              className="px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-slate-50/50"
              onClick={() => setExpanded(expanded === inq.id ? null : inq.id)}
            >
              <div className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-semibold text-sm">
                  {inq.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-slate-900 text-sm">{inq.name}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-slate-400 text-xs flex items-center gap-1"><Mail className="w-3 h-3" />{inq.email}</span>
                    {inq.company && <span className="text-slate-400 text-xs flex items-center gap-1"><Building2 className="w-3 h-3" />{inq.company}</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {inq.service_interest && <Badge variant="outline" className="text-xs hidden sm:flex">{inq.service_interest}</Badge>}
                <Badge className={`${STATUS_COLORS[inq.status || "new"]} border-0 text-xs capitalize`}>{inq.status || "new"}</Badge>
                {inq.created_date && <span className="text-slate-400 text-xs hidden md:block">{format(new Date(inq.created_date), "MMM d, yyyy")}</span>}
              </div>
            </div>

            {expanded === inq.id && (
              <div className="px-5 pb-5 border-t border-slate-50">
                <p className="text-slate-700 mt-4 leading-relaxed">{inq.message}</p>
                <div className="flex items-center gap-3 mt-4">
                  <span className="text-sm text-slate-500">Update status:</span>
                  <Select value={inq.status || "new"} onValueChange={v => updateStatus(inq.id, v)}>
                    <SelectTrigger className="w-36 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="reviewed">Reviewed</SelectItem>
                      <SelectItem value="responded">Responded</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button size="sm" variant="outline" asChild className="rounded-full gap-1.5">
                    <a href={`mailto:${inq.email}`}><Mail className="w-3.5 h-3.5" /> Reply</a>
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}