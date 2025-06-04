import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DocumentObject } from "@/types/google-drive";
import {
  Calendar,
  Download,
  ExternalLink,
  FileType,
  HardDrive,
} from "lucide-react";

interface FileMetadataDisplayProps {
  file: DocumentObject;
}

export function FileMetadataDisplay({ file }: FileMetadataDisplayProps) {
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "Unknown size";
    const units = ["B", "KB", "MB", "GB"];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return "Unknown";
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getMimeTypeLabel = (mimeType: string) => {
    const typeMap: Record<string, string> = {
      "application/pdf": "PDF Document",
      "application/vnd.google-apps.document": "Google Doc",
      "application/vnd.google-apps.spreadsheet": "Google Sheet",
      "application/vnd.google-apps.presentation": "Google Slides",
      "application/vnd.google-apps.folder": "Folder",
      "image/jpeg": "JPEG Image",
      "image/png": "PNG Image",
      "text/plain": "Text File",
      "application/msword": "Word Document",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        "Word Document",
    };

    return typeMap[mimeType] || mimeType;
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="flex flex-row items-center space-y-0 pb-4">
        <div className="flex items-center space-x-3 flex-1">
          {file.iconUrl && (
            <img src={file.iconUrl} alt="File icon" className="w-8 h-8" />
          )}
          <div>
            <CardTitle className="text-lg">{file.name}</CardTitle>
            <Badge variant="secondary" className="mt-1">
              <FileType className="w-3 h-3 mr-1" />
              {getMimeTypeLabel(file.mimeType)}
            </Badge>
          </div>
        </div>
        {file.thumbnails && file.thumbnails[0] && (
          <img
            src={file.thumbnails[0].url}
            alt="File thumbnail"
            className="w-16 h-16 object-cover rounded-md border"
          />
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center text-sm text-muted-foreground">
              <HardDrive className="w-4 h-4 mr-2" />
              <span className="font-medium">File ID:</span>
            </div>
            <p className="text-sm font-mono bg-muted p-2 rounded break-all">
              {file.id}
            </p>
          </div>

          {file.sizeBytes && (
            <div className="space-y-2">
              <div className="flex items-center text-sm text-muted-foreground">
                <HardDrive className="w-4 h-4 mr-2" />
                <span className="font-medium">File Size:</span>
              </div>
              <p className="text-sm">{formatFileSize(file.sizeBytes)}</p>
            </div>
          )}

          {file.lastEditedUtc && (
            <div className="space-y-2">
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="w-4 h-4 mr-2" />
                <span className="font-medium">Last Modified:</span>
              </div>
              <p className="text-sm">{formatDate(file.lastEditedUtc)}</p>
            </div>
          )}

          {file.description && (
            <div className="space-y-2">
              <div className="flex items-center text-sm text-muted-foreground">
                <span className="font-medium">Description:</span>
              </div>
              <p className="text-sm">{file.description}</p>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 pt-4">
          <Button
            variant="default"
            size="sm"
            onClick={() => window.open(file.url, "_blank")}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Open in Google Drive
          </Button>

          {file.embedUrl && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(file.embedUrl, "_blank")}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Preview
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // For downloading, we'll need to implement Google Drive API call
              // This is a placeholder for now
              console.log("Download functionality would be implemented here");
            }}
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>

        {file.isShared && (
          <div className="mt-4">
            <Badge
              variant="outline"
              className="bg-blue-50 text-blue-700 border-blue-200"
            >
              Shared File
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
