"use client";

import { useState } from "react";
import { Check, Zap, Rocket, Crown, ArrowRight } from "lucide-react";

const SubscriptionPlan = () => {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly",
  );

  const plans = [
    {
      name: "Starter",
      description: "Perfect for students and solo developers.",
      price: billingCycle === "monthly" ? "0" : "0",
      icon: <Zap className="text-user-1" />,
      features: [
        "Up to 2 collaborators",
        "3 active projects",
        "Community support",
        "Basic IDE features",
      ],
      buttonText: "Get Started",
      highlight: false,
    },
    {
      name: "Pro",
      description: "Best for pair programming & small teams.",
      price: billingCycle === "monthly" ? "19" : "15",
      icon: <Rocket className="text-primary" />,
      features: [
        "Unlimited collaborators",
        "Unlimited projects",
        "Priority support",
        "Advanced AI autocomplete",
        "Custom themes",
      ],
      buttonText: "Go Pro",
      highlight: true,
    },
    {
      name: "Enterprise",
      description: "High-level security for large organizations.",
      price: "Custom",
      icon: <Crown className="text-user-3" />,
      features: [
        "Self-hosting options",
        "SSO & SAML",
        "Dedicated account manager",
        "Custom SLA",
        "Audit logs",
      ],
      buttonText: "Contact Sales",
      highlight: false,
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground py-20 px-6 transition-colors duration-500">
      <div className="container mx-auto max-w-6xl">
        {/* HEADER */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4 italic">
            Choose your <span className="text-primary">velocity.</span>
          </h1>
          <p className="text-muted-foreground text-lg mb-10 max-w-xl mx-auto">
            Scale your collaborative workflow with transparent pricing and
            powerful features.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4">
            <span
              className={`text-sm ${billingCycle === "monthly" ? "text-foreground" : "text-muted-foreground"}`}
            >
              Monthly
            </span>
            <button
              onClick={() =>
                setBillingCycle((prev) =>
                  prev === "monthly" ? "yearly" : "monthly",
                )
              }
              className="w-12 h-6 rounded-full bg-muted border border-border p-1 transition-all flex items-center"
            >
              <div
                className={`w-4 h-4 rounded-full bg-primary transition-all ${billingCycle === "yearly" ? "translate-x-6" : "translate-x-0"}`}
              />
            </button>
            <span
              className={`text-sm ${billingCycle === "yearly" ? "text-foreground" : "text-muted-foreground"}`}
            >
              Yearly{" "}
              <span className="text-primary-hover text-[10px] font-bold ml-1">
                SAVE 20%
              </span>
            </span>
          </div>
        </div>

        {/* PRICING GRID */}
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative flex flex-col p-8 rounded-3xl border transition-all duration-300 hover:scale-105 ${
                plan.highlight
                  ? "bg-card border-primary shadow-2xl shadow-primary/10"
                  : "bg-card border-border hover:border-muted-foreground"
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full uppercase tracking-widest">
                  Most Popular
                </div>
              )}

              <div className="mb-8">
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-4">
                  {plan.icon}
                </div>
                <h3 className="text-2xl font-bold">{plan.name}</h3>
                <p className="text-muted-foreground text-sm mt-2">
                  {plan.description}
                </p>
              </div>

              <div className="mb-8">
                <span className="text-5xl font-bold italic">
                  {plan.price !== "Custom" && "$"}
                  {plan.price}
                </span>
                {plan.price !== "Custom" && (
                  <span className="text-muted-foreground ml-1">/mo</span>
                )}
              </div>

              <ul className="space-y-4 mb-10 grow">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm">
                    <Check size={16} className="text-primary shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 ${
                  plan.highlight
                    ? "bg-primary text-primary-foreground hover:bg-primary-hover shadow-lg shadow-primary/20"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary-hover border border-border"
                }`}
              >
                {plan.buttonText}
                <ArrowRight size={18} />
              </button>
            </div>
          ))}
        </div>

        {/* FAQ MINI-FOOTER */}
        <div className="mt-24 text-center">
          <p className="text-muted-foreground text-sm">
            Need a custom plan for 50+ developers?{" "}
            <a href="#" className="text-primary font-semibold hover:underline">
              Talk to our team
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlan;
