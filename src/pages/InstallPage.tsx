import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Download, ArrowLeft, Smartphone, Check, Share } from "lucide-react";
import NovaOwl from "@/components/NovaOwl";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const InstallPage = () => {
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    setIsIOS(/iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setInstalled(true));
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setInstalled(true);
    setDeferredPrompt(null);
  };

  return (
    <div className="star-field flex min-h-screen flex-col items-center bg-background px-4 py-8">
      <header className="flex w-full max-w-md items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <Smartphone className="h-5 w-5 text-primary" />
        <h1 className="font-display text-lg text-foreground">Install SparkMind</h1>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-10 flex w-full max-w-md flex-col items-center gap-6"
      >
        <NovaOwl
          size="lg"
          message={installed ? "SparkMind is installed! 🎉" : "Install me on your home screen for the best experience!"}
        />

        {installed ? (
          <div className="flex items-center gap-2 rounded-xl bg-primary/20 px-6 py-3 font-display text-sm text-primary">
            <Check className="h-5 w-5" /> App installed successfully!
          </div>
        ) : deferredPrompt ? (
          <button
            onClick={handleInstall}
            className="flex items-center gap-2 rounded-xl bg-primary px-8 py-4 font-display text-sm text-primary-foreground transition-all hover:brightness-110"
          >
            <Download className="h-5 w-5" /> Install SparkMind
          </button>
        ) : isIOS ? (
          <div className="rounded-2xl border border-border bg-card p-6 text-center">
            <p className="font-display text-sm text-foreground">To install on iPhone/iPad:</p>
            <ol className="mt-3 space-y-2 text-left font-body text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="font-display text-primary">1.</span>
                Tap the <Share className="inline h-4 w-4 text-primary" /> Share button in Safari
              </li>
              <li className="flex items-start gap-2">
                <span className="font-display text-primary">2.</span>
                Scroll down and tap <strong className="text-foreground">"Add to Home Screen"</strong>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-display text-primary">3.</span>
                Tap <strong className="text-foreground">"Add"</strong> to confirm
              </li>
            </ol>
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card p-6 text-center">
            <p className="font-body text-sm text-muted-foreground">
              Open this page in Chrome or Edge on your phone to install SparkMind as an app.
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default InstallPage;
