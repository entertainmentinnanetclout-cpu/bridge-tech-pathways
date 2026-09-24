import { useMemo, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { useStaff } from "@/components/admin/StaffContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { errorMessage, hasRole, logAudit, supabase } from "@/lib/supabase";

export type FieldType = "text" | "textarea" | "url" | "date" | "datetime" | "number" | "select" | "boolean" | "json";

export interface FieldDef {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: readonly string[];
  inList?: boolean;
  help?: string;
}

type Row = Record<string, unknown> & { id: string };

interface Props {
  table: string;
  title: string;
  description: string;
  fields: FieldDef[];
  statusField?: string;
  orderBy: { column: string; ascending: boolean };
  slugFrom?: string;
}

const toInput = (type: FieldType, v: unknown): string | boolean => {
  if (type === "boolean") return Boolean(v);
  if (v === null || v === undefined) return "";
  if (type === "datetime") {
    const d = new Date(String(v));
    if (Number.isNaN(d.getTime())) return "";
    const off = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - off).toISOString().slice(0, 16);
  }
  if (type === "date") return String(v).slice(0, 10);
  if (type === "json") return JSON.stringify(v, null, 2);
  return String(v);
};

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);

export function CrudManager({ table, title, description, fields, statusField, orderBy, slugFrom }: Props) {
  const { role } = useStaff();
  const canEdit = hasRole(role, "editor");
  const canDelete = hasRole(role, "admin");
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [editing, setEditing] = useState<Row | "new" | null>(null);
  const [form, setForm] = useState<Record<string, string | boolean>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<Row | null>(null);

  const query = useQuery({
    queryKey: ["admin", table],
    queryFn: async () => {
      const { data, error } = await supabase.from(table).select("*").order(orderBy.column, { ascending: orderBy.ascending });
      if (error) throw error;
      return (data ?? []) as Row[];
    },
  });

  const statusOptions = fields.find((f) => f.name === statusField)?.options ?? [];
  const listFields = fields.filter((f) => f.inList);
  const titleField = fields[0]?.name ?? "id";

  const rows = useMemo(() => {
    const q = search.toLowerCase();
    return (query.data ?? []).filter(
      (r) =>
        (status === "all" || r[statusField ?? ""] === status) &&
        (!q || String(r[titleField] ?? "").toLowerCase().includes(q)),
    );
  }, [query.data, search, status, statusField, titleField]);

  function openEditor(row: Row | "new") {
    const next: Record<string, string | boolean> = {};
    for (const f of fields) {
      const src = row === "new" ? undefined : row[f.name];
      next[f.name] = toInput(f.type, src ?? (f.type === "select" ? f.options?.[0] : f.type === "number" ? 0 : undefined));
    }
    setForm(next);
    setFormError(null);
    setEditing(row);
  }

  const save = useMutation({
    mutationFn: async () => {
      const payload: Record<string, unknown> = {};
      for (const f of fields) {
        const v = form[f.name];
        if (f.type === "boolean") payload[f.name] = Boolean(v);
        else {
          const s = String(v ?? "").trim();
          if (f.required && !s) throw new Error(`${f.label} is required`);
          if (f.type === "url" && s && !/^https?:\/\//i.test(s)) throw new Error(`${f.label} must start with http:// or https://`);
          if (f.type === "number") payload[f.name] = s ? Number(s) : 0;
          else if (f.type === "datetime") payload[f.name] = s ? new Date(s).toISOString() : null;
          else if (f.type === "json") {
            try {
              payload[f.name] = s ? JSON.parse(s) : {};
            } catch {
              throw new Error(`${f.label} must be valid JSON`);
            }
          } else payload[f.name] = s || (f.required ? s : null);
        }
      }
      if (slugFrom && !payload["slug"]) payload["slug"] = slugify(String(payload[slugFrom] ?? ""));
      if (editing === "new") {
        const { data, error } = await supabase.from(table).insert(payload).select("id").single<{ id: string }>();
        if (error) throw error;
        await logAudit("create", table, data.id);
      } else if (editing) {
        const { error } = await supabase.from(table).update({ ...payload, updated_at: new Date().toISOString() }).eq("id", editing.id);
        if (error) throw error;
        await logAudit("update", table, editing.id);
      }
    },
    onSuccess: () => {
      toast.success("Saved");
      setEditing(null);
      void qc.invalidateQueries({ queryKey: ["admin"] });
    },
    onError: (e) => setFormError(errorMessage(e)),
  });

  const remove = useMutation({
    mutationFn: async (row: Row) => {
      const { error } = await supabase.from(table).delete().eq("id", row.id);
      if (error) throw error;
      await logAudit("delete", table, row.id);
    },
    onSuccess: () => {
      toast.success("Deleted");
      void qc.invalidateQueries({ queryKey: ["admin"] });
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    save.mutate();
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        {canEdit && (
          <Button onClick={() => openEditor("new")}>
            <Plus className="size-4" aria-hidden="true" /> New
          </Button>
        )}
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Input placeholder="Search by title…" aria-label="Search" value={search} onChange={(e) => setSearch(e.target.value)} className="sm:max-w-xs" />
        {statusField && (
          <select aria-label="Filter by status" value={status} onChange={(e) => setStatus(e.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
            <option value="all">All statuses</option>
            {statusOptions.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-border bg-card">
        {query.isLoading ? (
          <div className="flex items-center gap-2 p-6 text-sm text-muted-foreground" role="status">
            <Loader2 className="size-4 animate-spin" aria-hidden="true" /> Loading…
          </div>
        ) : query.isError ? (
          <div className="p-6 text-sm text-destructive" role="alert">
            Could not load records: {errorMessage(query.error)}{" "}
            <Button variant="link" size="sm" onClick={() => void query.refetch()}>
              Retry
            </Button>
          </div>
        ) : rows.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">No records yet{canEdit ? " — create the first one." : "."}</p>
        ) : (
          <ul className="divide-y divide-border">
            {rows.map((row) => (
              <li key={row.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">{String(row[titleField] ?? "Untitled")}</p>
                  <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                    {listFields.map((f) => {
                      const v = row[f.name];
                      if (v === null || v === undefined || v === "") return null;
                      if (f.name === statusField) return <Badge key={f.name} variant={v === "published" ? "default" : "secondary"}>{String(v)}</Badge>;
                      const text = f.type === "datetime" ? new Date(String(v)).toLocaleString("en-ZA") : f.type === "boolean" ? (v ? "Published" : "Hidden") : String(v);
                      return <span key={f.name}>{text}</span>;
                    })}
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  {canEdit && (
                    <Button variant="outline" size="sm" onClick={() => openEditor(row)}>
                      <Pencil className="size-4" aria-hidden="true" /> Edit
                    </Button>
                  )}
                  {canDelete && (
                    <Button variant="outline" size="sm" onClick={() => setDeleting(row)} aria-label={`Delete ${String(row[titleField] ?? "")}`}>
                      <Trash2 className="size-4 text-destructive" aria-hidden="true" />
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Dialog open={editing !== null} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{editing === "new" ? `New ${title.toLowerCase().replace(/s$/, "")}` : "Edit record"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            {fields.map((f) => {
              const id = `f-${f.name}`;
              const v = form[f.name];
              if (f.type === "boolean")
                return (
                  <div key={f.name} className="flex items-center gap-2">
                    <Checkbox id={id} checked={Boolean(v)} onCheckedChange={(c) => setForm((s) => ({ ...s, [f.name]: c === true }))} />
                    <Label htmlFor={id}>{f.label}</Label>
                  </div>
                );
              const common = { id, value: String(v ?? ""), required: f.required ?? false };
              const set = (val: string) => setForm((s) => ({ ...s, [f.name]: val }));
              return (
                <div key={f.name} className="space-y-1.5">
                  <Label htmlFor={id}>
                    {f.label}
                    {f.required && <span className="text-destructive"> *</span>}
                  </Label>
                  {f.type === "textarea" || f.type === "json" ? (
                    <Textarea {...common} rows={f.type === "json" ? 6 : 4} className={f.type === "json" ? "font-mono text-xs" : ""} onChange={(e) => set(e.target.value)} />
                  ) : f.type === "select" ? (
                    <select {...common} onChange={(e) => set(e.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                      {f.options?.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <Input
                      {...common}
                      type={f.type === "datetime" ? "datetime-local" : f.type === "url" ? "url" : f.type === "number" ? "number" : f.type === "date" ? "date" : "text"}
                      onChange={(e) => set(e.target.value)}
                    />
                  )}
                  {f.help && <p className="text-xs text-muted-foreground">{f.help}</p>}
                </div>
              );
            })}
            {formError && (
              <p role="alert" className="text-sm text-destructive">
                {formError}
              </p>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={save.isPending}>
                {save.isPending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />} Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleting !== null} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this record?</AlertDialogTitle>
            <AlertDialogDescription>
              “{String(deleting?.[titleField] ?? "")}” will be permanently removed. Consider archiving instead.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleting) remove.mutate(deleting);
                setDeleting(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
