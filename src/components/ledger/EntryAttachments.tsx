import { useRef, useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Paperclip, X, FileText, Image as ImageIcon, Download, Loader2, UploadCloud } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useEntryAttachments, useUploadAttachment, useDeleteAttachment, getAttachmentUrl, EntryAttachment, type EntryType } from "@/hooks/use-entry-attachments";

const ALLOWED_TYPES = [
  "image/jpeg", "image/png", "image/webp", "image/gif",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

interface Props {
  entryId: string | undefined;
  entryType: EntryType;
  readOnly?: boolean;
}

function FileIcon({ mime }: { mime: string }) {
  if (mime.startsWith("image/")) return <ImageIcon className="h-3.5 w-3.5 text-primary" />;
  return <FileText className="h-3.5 w-3.5 text-muted-foreground" />;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

export function EntryAttachments({ entryId, entryType, readOnly }: Props) {
  const { data: attachments = [], isLoading } = useEntryAttachments(entryId, entryType);
  const uploadMut = useUploadAttachment();
  const deleteMut = useDeleteAttachment();
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !entryId) return;
    Array.from(files).forEach(file => {
      if (!ALLOWED_TYPES.includes(file.type)) return;
      if (file.size > 10 * 1024 * 1024) return;
      uploadMut.mutate({ file, entryId, entryType });
    });
    if (fileRef.current) fileRef.current.value = "";
  };

  if (!entryId) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold flex items-center gap-1.5">
          <Paperclip className="h-4 w-4 text-muted-foreground" /> Attachments
          {attachments.length > 0 && <span className="text-xs text-muted-foreground">({attachments.length})</span>}
        </h4>
        {!readOnly && (
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 text-xs gap-1"
              onClick={() => fileRef.current?.click()}
              disabled={uploadMut.isPending}
            >
              {uploadMut.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Paperclip className="h-3 w-3" />}
              Attach
            </Button>
            <input
              ref={fileRef}
              type="file"
              className="hidden"
              accept={ALLOWED_TYPES.join(",")}
              multiple
              onChange={handleUpload}
            />
          </>
        )}
      </div>

      {isLoading ? (
        <p className="text-xs text-muted-foreground">Loading...</p>
      ) : attachments.length === 0 ? (
        <p className="text-xs text-muted-foreground">No attachments</p>
      ) : (
        <div className="space-y-1.5">
          {attachments.map(att => (
            <AttachmentRow key={att.id} att={att} readOnly={readOnly} onDelete={() => deleteMut.mutate(att)} deleting={deleteMut.isPending} />
          ))}
        </div>
      )}
    </div>
  );
}

function AttachmentRow({ att, readOnly, onDelete, deleting }: { att: EntryAttachment; readOnly?: boolean; onDelete: () => void; deleting: boolean }) {
  const [url, setUrl] = useState<string>("");
  const [preview, setPreview] = useState(false);
  const isImage = att.mime_type.startsWith("image/");
  useEffect(() => {
    let mounted = true;
    getAttachmentUrl(att.file_path).then(u => { if (mounted) setUrl(u); });
    return () => { mounted = false; };
  }, [att.file_path]);
  return (
    <>
      <div className="flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-xs bg-muted/30">
        {isImage && url ? (
          <button
            type="button"
            onClick={() => setPreview(true)}
            className="shrink-0 h-10 w-10 rounded overflow-hidden border bg-background hover:ring-2 hover:ring-primary/40 transition"
            aria-label={`Preview ${att.file_name}`}
          >
            <img src={url} alt={att.file_name} className="h-full w-full object-cover" loading="lazy" />
          </button>
        ) : (
          <div className="shrink-0 h-10 w-10 rounded border bg-background flex items-center justify-center">
            <FileIcon mime={att.mime_type} />
          </div>
        )}
        <span className="truncate flex-1 font-medium">{att.file_name}</span>
        <span className="text-muted-foreground shrink-0">{formatSize(att.file_size)}</span>
        <a href={url || "#"} target="_blank" rel="noopener noreferrer" className="shrink-0" onClick={(e) => { if (!url) e.preventDefault(); }}>
          <Button type="button" variant="ghost" size="icon" className="h-6 w-6" disabled={!url}><Download className="h-3 w-3" /></Button>
        </a>
        {!readOnly && (
          <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={onDelete} disabled={deleting}>
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
      {isImage && (
        <Dialog open={preview} onOpenChange={setPreview}>
          <DialogContent className="max-w-3xl p-2 bg-background">
            <img src={url} alt={att.file_name} className="w-full h-auto max-h-[80vh] object-contain rounded" />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
