import Image from "next/image";
import { Toaster } from "sonner";
import LeadForm from "@/components/LeadForm";
import { Sparkles, Shield } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#060610] relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[10%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px]" />
        <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[400px] h-[400px] bg-violet-600/5 rounded-full blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(99,102,241,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.5) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-16">
        {/* Nav */}
        <div className="flex items-center justify-between mb-16">
          <Image
            src="/logo.png"
            alt="Devs Aura Agency"
            width={120}
            height={40}
            className="h-10 w-auto object-contain"
            priority
          />
          <a
            href="/admin"
            className="text-slate-400 hover:text-indigo-400 text-sm transition-colors"
          >
            Admin Dashboard →
          </a>
        </div>

        {/* Hero + Form */}
        <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
          {/* Left - Hero */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-2">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-indigo-300 text-xs font-medium">Trusted by 200+ businesses</span>
            </div>

            <div>
              <h1 className="text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight">
                Build Your
                <span className="block bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Digital Future
                </span>
              </h1>
              <p className="mt-6 text-slate-400 text-lg leading-relaxed max-w-md">
                We craft premium web experiences, powerful SaaS products, and
                high-converting e-commerce stores that drive real growth.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {[
                { icon: "⚡", text: "24hr Response" },
                { icon: "🎨", text: "Premium Design" },
                { icon: "🚀", text: "Fast Delivery" },
                { icon: "🔒", text: "Secure & Scalable" },
              ].map(({ icon, text }) => (
                <div
                  key={text}
                  className="flex items-center gap-2 bg-slate-800/60 border border-white/5 rounded-lg px-3 py-2"
                >
                  <span>{icon}</span>
                  <span className="text-slate-300 text-sm font-medium">{text}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-6 pt-4 border-t border-white/5">
              {[
                { value: "200+", label: "Projects Done" },
                { value: "98%", label: "Client Satisfaction" },
                { value: "5★", label: "Average Rating" },
              ].map(({ value, label }) => (
                <div key={label}>
                  <div className="text-2xl font-bold text-white">{value}</div>
                  <div className="text-slate-500 text-sm">{label}</div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <Shield className="w-4 h-4 text-green-500" />
              <span>Your information is secure and never shared</span>
            </div>
          </div>

          {/* Right - Form */}
          <LeadForm />
        </div>
      </div>

      <Toaster
        theme="dark"
        position="top-right"
        toastOptions={{
          style: {
            background: "#1e1e2e",
            border: "1px solid rgba(99,102,241,0.2)",
            color: "#e2e8f0",
          },
        }}
      />
    </main>
  );
}
