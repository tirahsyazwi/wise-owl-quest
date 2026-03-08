
-- Store purchased cosmetic items
CREATE TABLE public.purchased_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid NOT NULL REFERENCES public.children(id) ON DELETE CASCADE,
  item_id text NOT NULL,
  equipped boolean NOT NULL DEFAULT false,
  purchased_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (child_id, item_id)
);

ALTER TABLE public.purchased_items ENABLE ROW LEVEL SECURITY;

-- Parents can view their children's purchases
CREATE POLICY "Parents can view purchased items"
ON public.purchased_items
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.children c WHERE c.id = purchased_items.child_id AND c.parent_id = auth.uid()
  )
);

-- Parents can insert purchases for their children
CREATE POLICY "Parents can insert purchased items"
ON public.purchased_items
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.children c WHERE c.id = purchased_items.child_id AND c.parent_id = auth.uid()
  )
);

-- Parents can update (equip/unequip) their children's items
CREATE POLICY "Parents can update purchased items"
ON public.purchased_items
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.children c WHERE c.id = purchased_items.child_id AND c.parent_id = auth.uid()
  )
);
