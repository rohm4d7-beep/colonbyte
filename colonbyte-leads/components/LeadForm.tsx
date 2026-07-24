"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Loader2, Send, CheckCircle2, User, Mail, Phone, Briefcase, MessageSquare } from "lucide-react";
import { leadFormSchema, LeadFormData } from "@/lib/schema";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const SERVICES = ["Web Development", "SaaS", "E-commerce", "Other"] as const;

export default function LeadForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadFormSchema),
  });

  const onSubmit = async (data: LeadFormData) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/submit-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Submission failed");
      }

      setWhatsappUrl(result.whatsappUrl ?? null);
      reset();
      toast.success("Request submitted!", {
        description: "Check your email! You can also reach us instantly on WhatsApp.",
        duration: 5000,
      });
    } catch (err) {
      toast.error("Something went wrong", {
        description: err instanceof Error ? err.message : "Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full max-w-lg mx-auto"
    >
      <div className="relative bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl shadow-black/50">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5 pointer-events-none" />

        {/* Header */}
        <div className="mb-8 text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1.5 mb-4"
          >
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-indigo-300 text-xs font-medium uppercase tracking-wider">Available for Projects</span>
          </motion.div>
          <h2 className="text-2xl font-bold text-white mb-2">Get in Touch</h2>
          <p className="text-slate-400 text-sm">Tell us about your project and we&apos;ll respond within 24 hours</p>
        </div>

        <AnimatePresence mode="wait">
          {whatsappUrl ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center justify-center py-8 text-center gap-5"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
              >
                <CheckCircle2 className="w-14 h-14 text-green-400" />
              </motion.div>

              <div>
                <h3 className="text-xl font-bold text-white mb-1">You&apos;re all set!</h3>
                <p className="text-slate-400 text-sm">
                  A confirmation email is on its way. Want a faster reply?
                </p>
              </div>

              {/* WhatsApp CTA */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 w-full justify-center bg-[#25D366] hover:bg-[#20bd5a] transition-colors text-white font-semibold rounded-xl px-6 py-3.5 shadow-lg shadow-green-500/20"
              >
                <WhatsAppIcon />
                Continue on WhatsApp
              </a>

              <button
                onClick={() => setWhatsappUrl(null)}
                className="text-slate-500 hover:text-slate-300 text-xs transition-colors"
              >
                Submit another request
              </button>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-5"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <FormField label="Full Name" icon={<User className="w-4 h-4" />} error={errors.fullName?.message}>
                <Input {...register("fullName")} placeholder="John Doe" className={inputClass(!!errors.fullName)} />
              </FormField>

              <FormField label="Email Address" icon={<Mail className="w-4 h-4" />} error={errors.email?.message}>
                <Input {...register("email")} type="email" placeholder="john@example.com" className={inputClass(!!errors.email)} />
              </FormField>

              <FormField label="WhatsApp Number" icon={<Phone className="w-4 h-4" />} error={errors.whatsapp?.message}>
                <Input {...register("whatsapp")} placeholder="+1234567890" className={inputClass(!!errors.whatsapp)} />
                <p className="text-xs text-slate-500 mt-1">Include country code (e.g. +92 or +1)</p>
              </FormField>

              <FormField label="Service Needed" icon={<Briefcase className="w-4 h-4" />} error={errors.service?.message}>
                <Select onValueChange={(val) => setValue("service", val as LeadFormData["service"], { shouldValidate: true })}>
                  <SelectTrigger className={inputClass(!!errors.service)}>
                    <SelectValue placeholder="Select a service..." />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-white/10 text-slate-200">
                    {SERVICES.map((s) => (
                      <SelectItem key={s} value={s} className="focus:bg-indigo-500/20 focus:text-white cursor-pointer">
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              <FormField label="Message" icon={<MessageSquare className="w-4 h-4" />} error={errors.message?.message}>
                <Textarea
                  {...register("message")}
                  placeholder="Tell us about your project, goals, and timeline..."
                  rows={4}
                  className={cn(inputClass(!!errors.message), "resize-none")}
                />
              </FormField>

              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                className={cn(
                  "relative w-full h-12 rounded-xl font-semibold text-white text-sm overflow-hidden",
                  "bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600",
                  "shadow-lg shadow-indigo-500/25 transition-opacity duration-200",
                  "disabled:opacity-60 disabled:cursor-not-allowed",
                  "focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                )}
              >
                <span className="relative flex items-center justify-center gap-2">
                  {isSubmitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" />Sending your request...</>
                  ) : (
                    <><Send className="w-4 h-4" />Send Message</>
                  )}
                </span>
              </motion.button>

              <p className="text-center text-xs text-slate-500">
                By submitting, you agree to be contacted via email and WhatsApp.
              </p>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}

function FormField({ label, icon, error, children }: {
  label: string;
  icon: React.ReactNode;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="flex items-center gap-1.5 text-slate-300 text-sm font-medium">
        <span className="text-indigo-400">{icon}</span>
        {label}
      </Label>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="text-xs text-red-400"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

function inputClass(hasError: boolean) {
  return cn(
    "bg-slate-800/50 border-white/10 text-slate-100 placeholder:text-slate-500",
    "focus:border-indigo-500/50 focus:ring-indigo-500/20 focus-visible:ring-indigo-500/30",
    "transition-colors duration-200",
    hasError && "border-red-500/50 focus:border-red-500/50"
  );
}
