import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Mail, Twitter, Phone, BookOpen, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", company: "", service_interest: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await base44.entities.ContactInquiry.create(form);
    setSubmitted(true);
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="bg-gradient-to-br from-slate-950 to-indigo-950 py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-indigo-400 font-semibold tracking-widest text-sm uppercase mb-3">Get In Touch</p>
          <h1 className="text-5xl font-bold text-white mb-4">Let's Talk</h1>
          <p className="text-slate-400 text-lg">Consulting inquiries, research partnerships, speaking engagements, or just a good conversation about the future of AI.</p>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16">
          {/* Left: Info */}
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Work with Epiphany.AI</h2>
            <p className="text-slate-500 mb-8 leading-relaxed">
              Whether you're looking to integrate AI into your business, explore emerging research, or need a strategic partner for the next frontier — we're here.
            </p>
            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">Email</p>
                  <a href="mailto:Epiphany.AI529@outlook.com" className="text-indigo-600 hover:underline block">Epiphany.AI529@outlook.com</a>
                  <a href="mailto:Cmgrillos529@gmail.com" className="text-indigo-600 hover:underline block">Cmgrillos529@gmail.com</a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">Phone</p>
                  <a href="tel:9296274950" className="text-indigo-600 hover:underline">929-627-4950</a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
                  <Twitter className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">Twitter / X</p>
                  <a href="https://x.com/cmgdank" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">@cmgdank</a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">Medium</p>
                  <a href="https://medium.com/@cmgrillos529" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">@cmgrillos529</a>
                </div>
              </div>
            </div>

            <div className="mt-10 p-6 bg-slate-50 rounded-2xl">
              <p className="text-sm font-semibold text-slate-700 mb-2">What we're looking for:</p>
              <ul className="text-slate-500 text-sm space-y-1.5">
                <li>✦ Organizations serious about AI strategy</li>
                <li>✦ Research collaborations & partnerships</li>
                <li>✦ Speaking & advisory opportunities</li>
                <li>✦ Bold ideas worth exploring</li>
              </ul>
            </div>
          </div>

          {/* Right: Form */}
          <div>
            {submitted ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Message Received</h3>
                <p className="text-slate-500">Thanks for reaching out. We'll be in touch soon.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-700 mb-1.5 block">Name *</Label>
                    <Input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Your name" />
                  </div>
                  <div>
                    <Label className="text-slate-700 mb-1.5 block">Email *</Label>
                    <Input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="you@company.com" />
                  </div>
                </div>
                <div>
                  <Label className="text-slate-700 mb-1.5 block">Company</Label>
                  <Input value={form.company} onChange={e => setForm({...form, company: e.target.value})} placeholder="Your organization" />
                </div>
                <div>
                  <Label className="text-slate-700 mb-1.5 block">Service Interest</Label>
                  <Select value={form.service_interest} onValueChange={v => setForm({...form, service_interest: v})}>
                    <SelectTrigger>
                      <SelectValue placeholder="What can we help with?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AI Strategy">AI Strategy</SelectItem>
                      <SelectItem value="Research Partnership">Research Partnership</SelectItem>
                      <SelectItem value="Consulting">Consulting</SelectItem>
                      <SelectItem value="Speaking">Speaking</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-slate-700 mb-1.5 block">Message *</Label>
                  <Textarea required rows={5} value={form.message} onChange={e => setForm({...form, message: e.target.value})} placeholder="Tell us about your project or question..." />
                </div>
                <Button type="submit" disabled={submitting} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-5 text-base rounded-full">
                  {submitting ? "Sending..." : "Send Message"}
                </Button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}