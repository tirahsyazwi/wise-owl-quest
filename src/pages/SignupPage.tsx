import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const SignupPage = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password || !displayName.trim()) return;
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    const { error } = await signUp(email.trim(), password, displayName.trim());
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Account created! Check your email to confirm.");
      navigate("/dashboard");
    }
  };

  return (
    <div className="star-field flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <Link to="/" className="mb-8 flex items-center justify-center gap-2">
          <Star className="h-7 w-7 text-accent" />
          <span className="font-display text-2xl text-foreground">SparkMind</span>
        </Link>

        <div className="rounded-2xl border border-border bg-card p-6 shadow-xl">
          <h2 className="mb-1 text-center font-display text-xl text-foreground">Create Account</h2>
          <p className="mb-6 text-center font-body text-sm text-muted-foreground">Start your child's space adventure</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="mb-1 block font-body text-xs font-semibold text-muted-foreground">Your Name</label>
              <div className="flex items-center gap-2 rounded-xl border border-border bg-muted px-3 py-2.5 focus-within:border-primary">
                <User className="h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Parent name"
                  className="flex-1 bg-transparent font-body text-sm text-foreground outline-none placeholder:text-muted-foreground"
                  required
                  maxLength={100}
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block font-body text-xs font-semibold text-muted-foreground">Email</label>
              <div className="flex items-center gap-2 rounded-xl border border-border bg-muted px-3 py-2.5 focus-within:border-primary">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="parent@example.com"
                  className="flex-1 bg-transparent font-body text-sm text-foreground outline-none placeholder:text-muted-foreground"
                  required
                  maxLength={255}
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block font-body text-xs font-semibold text-muted-foreground">Password</label>
              <div className="flex items-center gap-2 rounded-xl border border-border bg-muted px-3 py-2.5 focus-within:border-primary">
                <Lock className="h-4 w-4 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="flex-1 bg-transparent font-body text-sm text-foreground outline-none placeholder:text-muted-foreground"
                  required
                  minLength={6}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 rounded-xl bg-primary py-3 font-display text-base text-primary-foreground shadow-lg transition-transform hover:scale-[1.02] disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="mt-4 text-center font-body text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-bold text-primary hover:underline">Log In</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default SignupPage;
