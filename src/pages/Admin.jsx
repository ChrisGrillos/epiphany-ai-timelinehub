import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ArticleAdmin from "@/components/admin/ArticleAdmin";
import AppAdmin from "@/components/admin/AppAdmin";
import InquiriesAdmin from "@/components/admin/InquiriesAdmin";
import TimelineAdmin from "@/components/admin/TimelineAdmin";
import { Shield } from "lucide-react";

export default function Admin() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.auth.me().then(setUser).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-400 gap-4">
        <Shield className="w-12 h-12 opacity-30" />
        <p className="text-lg font-medium">Admin access required.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-100 px-6 py-5">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-slate-900">Admin Panel</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage your content, apps, and inquiries</p>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-6 py-8">
        <Tabs defaultValue="articles">
          <TabsList className="mb-8 bg-white border border-slate-100 shadow-sm">
            <TabsTrigger value="articles">Articles & Research</TabsTrigger>
            <TabsTrigger value="apps">Apps</TabsTrigger>
            <TabsTrigger value="inquiries">Inquiries</TabsTrigger>
          </TabsList>
          <TabsContent value="articles"><ArticleAdmin /></TabsContent>
          <TabsContent value="apps"><AppAdmin /></TabsContent>
          <TabsContent value="inquiries"><InquiriesAdmin /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}