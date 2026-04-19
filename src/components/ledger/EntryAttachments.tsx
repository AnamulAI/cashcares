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
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);

  const processFiles = useCallback((files: FileList | File[]) => {
    if (!entryId) return;
    let rejected = 0;
    Array.from(files).forEach(file => {
      if (!ALLOWED_TYPES.includes(file.type)) { rejected++; return; }
      if (file.size > 10 * 1024 * 1024) { rejected++; return; }
      uploadMut.mutate({ file, entryId, entryType });
    });
    if (rejected > 0) toast.error(`${rejected} file(s) skipped (unsupported type or >10MB)`);
  }, [entryId, entryType, uploadMut]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) processFiles(e.target.files);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (readOnly) return;
    dragCounter.current++;
    if (e.dataTransfer.types.includes("Files")) setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current <= 0) { setIsDragging(false); dragCounter.current = 0; }
  };
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    dragCounter.current = 0;
    setIsDragging(false);
    if (readOnly) return;
    const files = e.dataTransfer.files;
    if (files && files.length > 0) processFiles(files);
  };

  if (!entryId) return null;

  return (
    <div
      className={cn(
        "space-y-2 rounded-md transition-colors relative",
        !readOnly && "p-2 -m-2 border border-transparent",
        isDragging && "border-primary border-dashed bg-primary/5"
      )}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
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
        <p className="text-xs text-muted-foreground">
          {readOnly ? "No attachments" : "No attachments — drag & drop files here or click Attach"}
        </p>
      ) : (
        <div className="space-y-1.5">
          {attachments.map(att => (
            <AttachmentRow key={att.id} att={att} readOnly={readOnly} onDelete={() => deleteMut.mutate(att)} deleting={deleteMut.isPending} />
          ))}
        </div>
      )}

      {isDragging && !readOnly && (
        <div className="absolute inset-0 rounded-md bg-primary/10 backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
          <div className="flex flex-col items-center gap-1.5 text-primary">
            <UploadCloud className="h-6 w-6" />
            <span className="text-xs font-semibold">Drop files to upload</span>
          </div>
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
