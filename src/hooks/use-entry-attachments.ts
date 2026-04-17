import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface EntryAttachment {
  id: string;
  user_id: string;
  entry_id: string;
  entry_type: "payable" | "receivable";
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  created_at: string;
}

export function useEntryAttachments(entryId: string | undefined, entryType: "payable" | "receivable") {
  return useQuery({
    queryKey: ["entry_attachments", entryId, entryType],
    enabled: !!entryId,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("entry_attachments")
        .select("*")
        .eq("entry_id", entryId)
        .eq("entry_type", entryType)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as EntryAttachment[];
    },
  });
}

export function useUploadAttachment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ file, entryId, entryType }: { file: File; entryId: string; entryType: "payable" | "receivable" }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const ext = file.name.split(".").pop();
      const path = `${user.id}/${entryId}/${Date.now()}.${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from("ledger-attachments")
        .upload(path, file);
      if (uploadErr) throw uploadErr;

      const { data, error } = await (supabase as any)
        .from("entry_attachments")
        .insert({
          entry_id: entryId,
          entry_type: entryType,
          file_name: file.name,
          file_path: path,
          file_size: file.size,
          mime_type: file.type,
        })
        .select()
        .single();
      if (error) throw error;
      return data as EntryAttachment;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["entry_attachments", data.entry_id] });
      toast.success("File uploaded");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteAttachment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (attachment: EntryAttachment) => {
      await supabase.storage.from("ledger-attachments").remove([attachment.file_path]);
      const { error } = await (supabase as any)
        .from("entry_attachments")
        .delete()
        .eq("id", attachment.id);
      if (error) throw error;
      return attachment;
    },
    onSuccess: (att) => {
      qc.invalidateQueries({ queryKey: ["entry_attachments", att.entry_id] });
      toast.success("Attachment removed");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export async function getAttachmentUrl(filePath: string): Promise<string> {
  const { data, error } = await supabase.storage
    .from("ledger-attachments")
    .createSignedUrl(filePath, 3600);
  if (error || !data) return "";
  return data.signedUrl;
}
