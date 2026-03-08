import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Rocket, Star, Brain, Puzzle, Target, Shield, ChevronRight } from "lucide-react";
import NovaOwl from "@/components/NovaOwl";
import spaceBg from "@/assets/space-bg.jpg";

const features = [
  { icon: Brain, title: "Strategic Thinking", desc: "Plan ahead and make smart choices" },
  { icon: Puzzle, title: "Pattern Recognition", desc: "Spot hidden patterns in puzzles" },
  { icon: Target, title: "Problem Solving", desc: "Tackle challenges step by step" },
  { icon: Shield, title: "Safe & Fun", desc: "No ads, no chat — just learning" },
];

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="star-field min-h-screen bg-background">
      {/* Hero */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <Star className="h-6 w-6 text-accent" />
          <span className="font-display text-xl text-foreground">SparkMind</span>
        </div>
        <button
          onClick={() => navigate("/login")}
          className="rounded-xl bg-muted px-5 py-2 font-body text-sm font-bold text-foreground transition-colors hover:bg-muted/80"
        >
          Log In
        </button>
      </header>

      <main className="relative z-10 mx-auto max-w-5xl px-6">
        {/* Hero Section */}
        <section className="flex flex-col items-center py-16 text-center lg:py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <NovaOwl size="lg" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8 font-display text-4xl leading-tight text-foreground sm:text-5xl lg:text-6xl"
          >
            Think. Solve.{" "}
            <span className="bg-gradient-to-r from-primary to-cosmic-purple bg-clip-text text-transparent">
              Explore.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-4 max-w-md font-body text-lg text-muted-foreground"
          >
            Fun space missions that train your child's thinking skills — not just memorization.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-8 flex flex-col items-center gap-4 sm:flex-row"
          >
            <button
              onClick={() => navigate("/signup")}
              className="flex items-center gap-2 rounded-2xl bg-primary px-8 py-4 font-display text-lg text-primary-foreground shadow-lg transition-transform hover:scale-105"
              style={{ boxShadow: "var(--shadow-glow-teal)" }}
            >
              <Rocket className="h-5 w-5" />
              Start Free Trial
            </button>
            <button
              onClick={() => navigate("/login")}
              className="flex items-center gap-2 rounded-2xl border-2 border-border px-8 py-4 font-body text-sm font-bold text-foreground transition-colors hover:border-primary"
            >
              I have an account
              <ChevronRight className="h-4 w-4" />
            </button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-3 font-body text-xs text-muted-foreground"
          >
            Ages 6–8 • No credit card required
          </motion.p>
        </section>

        {/* Space banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mx-auto mb-16 max-w-3xl overflow-hidden rounded-3xl border border-border shadow-2xl"
        >
          <img src={spaceBg} alt="Space adventure missions" className="h-48 w-full object-cover sm:h-64" />
        </motion.div>

        {/* Features */}
        <section className="mb-20">
          <h2 className="mb-10 text-center font-display text-2xl text-foreground sm:text-3xl">
            Missions that build{" "}
            <span className="text-accent">real thinking skills</span>
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl border border-border bg-card p-6 text-center transition-all hover:border-primary/50"
              >
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-1 font-display text-base text-foreground">{feature.title}</h3>
                <p className="font-body text-sm text-muted-foreground">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mb-20 rounded-3xl border border-border bg-card p-10 text-center">
          <NovaOwl size="md" message="Ready to start your space adventure?" />
          <div className="mt-6">
            <button
              onClick={() => navigate("/signup")}
              className="rounded-2xl bg-accent px-8 py-4 font-display text-lg text-accent-foreground shadow-lg transition-transform hover:scale-105"
              style={{ boxShadow: "var(--shadow-glow-gold)" }}
            >
              Get Started Free
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border py-8 text-center">
          <p className="font-body text-xs text-muted-foreground">
            © 2026 SparkMind. Made with ❤️ for curious kids.
          </p>
        </footer>
      </main>
    </div>
  );
};

export default LandingPage;
