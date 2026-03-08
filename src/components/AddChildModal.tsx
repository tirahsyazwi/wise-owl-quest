import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface AddChildModalProps {
  open: boolean;
  onClose: () => void;
  onAdded: () => void;
}

const avatars = ["astronaut", "alien", "robot", "star", "rocket"];

const AddChildModal = ({ open, onClose, onAdded }: AddChildModalProps) => {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [age, setAge] = useState(7);
  const [avatar, setAvatar] = useState("astronaut");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !user) return;
    setLoading(true);
    const { error } = await supabase.from("children").insert({
      parent_id: user.id,
      name: name.trim(),
      age,
      avatar,
    });
    setLoading(false);
    if (error) {
      toast.error("Failed to add child");
    } else {
      toast.success(`${name} is ready to explore!`);
      setName("");
      setAge(7);
      setAvatar("astronaut");
      onAdded();
      onClose();
    }
  };

  const emojiMap: Record<string, string> = {
    astronaut: "👨‍🚀",
    alien: "👽",
    robot: "🤖",
    star: "⭐",
    rocket: "🚀",
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm px-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-lg text-foreground">Add Explorer</h3>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="mb-1 block font-body text-xs font-semibold text-muted-foreground">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Child's name"
                  className="w-full rounded-xl border border-border bg-muted px-3 py-2.5 font-body text-sm text-foreground outline-none focus:border-primary placeholder:text-muted-foreground"
                  required
                  maxLength={50}
                />
              </div>

              <div>
                <label className="mb-1 block font-body text-xs font-semibold text-muted-foreground">Age</label>
                <div className="flex gap-2">
                  {[6, 7, 8].map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => setAge(a)}
                      className={`flex-1 rounded-xl border-2 py-2 font-display text-lg transition-all ${
                        age === a ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"
                      }`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1 block font-body text-xs font-semibold text-muted-foreground">Avatar</label>
                <div className="flex gap-2">
                  {avatars.map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => setAvatar(a)}
                      className={`flex-1 rounded-xl border-2 py-2 text-2xl transition-all ${
                        avatar === a ? "border-accent bg-accent/10" : "border-border"
                      }`}
                    >
                      {emojiMap[a]}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 rounded-xl bg-primary py-3 font-display text-base text-primary-foreground shadow-lg disabled:opacity-50"
              >
                {loading ? "Adding..." : "Add Explorer"}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddChildModal;
