import { FileMetadataDisplay } from "@/components/file-metadata-display";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  extractFileIdFromUrl,
  getManualDownloadInstructions,
  isDatabaseFile,
} from "@/lib/google-drive-api";
import type { DocumentObject, PickerEvent } from "@/types/google-drive";
import type {
  DrivePickerElement,
  DrivePickerElementProps,
} from "@googleworkspace/drive-picker-element";
import {
  AlertCircle,
  CheckCircle,
  CloudDownload,
  Database,
  Download,
  ExternalLink,
  FileText,
  XCircle,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

declare module "react" {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      "drive-picker": React.DetailedHTMLProps<
        React.HTMLAttributes<DrivePickerElement> & DrivePickerElementProps,
        DrivePickerElement
      >;
    }
  }
}

interface GoogleDriveDatabaseSelectorProps {
  onCancel: () => void;
}

export function GoogleDriveDatabaseSelector({
  onCancel,
}: GoogleDriveDatabaseSelectorProps) {
  const ref = useRef<DrivePickerElement>(null);
  const [selectedFile, setSelectedFile] = useState<DocumentObject | null>(null);
  const [pickerStatus, setPickerStatus] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [showManualDownloadInstructions, setShowManualDownloadInstructions] =
    useState(false);

  useEffect(() => {
    const currentRef = ref.current;
    if (!currentRef) {
      return;
    }

    const handler = (e: PickerEvent) => {
      if (e.type === "picker:picked") {
        setPickerStatus("File selected successfully");
        setShowManualDownloadInstructions(false);
        if (
          e.detail &&
          Array.isArray(e.detail.docs) &&
          e.detail.docs.length > 0
        ) {
          const file = e.detail.docs[0] as DocumentObject;

          // Validate if it's a database file
          if (!isDatabaseFile(file.name || "", file.mimeType)) {
            toast.error(
              "Please select a database file (.db, .sqlite, .sqlite3, or .enc)"
            );
            setPickerStatus("Invalid file type selected");
            return;
          }

          setSelectedFile(file);
        }
      } else if (e.type === "picker:canceled") {
        setPickerStatus("File selection canceled");
        setSelectedFile(null);
        setShowManualDownloadInstructions(false);
      } else if (e.type === "picker:oauth:error") {
        setPickerStatus("Authentication error occurred");
        setSelectedFile(null);
        setShowManualDownloadInstructions(false);
        toast.error("Failed to authenticate with Google Drive");
      } else if (e.type === "picker:oauth:response") {
        setPickerStatus("Authentication successful");
      }
    };

    currentRef.addEventListener("picker:oauth:error", handler);
    currentRef.addEventListener("picker:oauth:response", handler);
    currentRef.addEventListener("picker:picked", handler);
    currentRef.addEventListener("picker:canceled", handler);

    return () => {
      if (currentRef) {
        currentRef.removeEventListener("picker:oauth:error", handler);
        currentRef.removeEventListener("picker:oauth:response", handler);
        currentRef.removeEventListener("picker:picked", handler);
        currentRef.removeEventListener("picker:canceled", handler);
      }
    };
  }, []);

  const getStatusIcon = (status: string) => {
    if (status.includes("success"))
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    if (status.includes("error"))
      return <XCircle className="w-4 h-4 text-red-600" />;
    if (status.includes("cancel"))
      return <AlertCircle className="w-4 h-4 text-yellow-600" />;
    return <FileText className="w-4 h-4 text-blue-600" />;
  };

  const isValidDatabaseFile = (file: DocumentObject): boolean => {
    const validExtensions = [".db", ".enc", ".sqlite", ".sqlite3"];
    const fileName = file.name.toLowerCase();
    return validExtensions.some((ext) => fileName.endsWith(ext));
  };

  const downloadAndLoadDatabase = async () => {
    if (!selectedFile) return;

    if (!isValidDatabaseFile(selectedFile)) {
      toast.error(
        "Please select a valid database file (.db, .enc, .sqlite, .sqlite3)"
      );
      return;
    }

    setIsLoading(true);
    try {
      // Check for Google Workspace files that can't be used as databases
      if (selectedFile.mimeType.startsWith("application/vnd.google-apps.")) {
        toast.error(
          "Google Workspace files cannot be used as database files. Please select a .db, .enc, or .sqlite file."
        );
        return;
      }

      // Extract file ID from the URL
      const fileId = extractFileIdFromUrl(selectedFile.url) || selectedFile.id;

      if (!fileId) {
        throw new Error("Unable to extract file ID from Google Drive URL");
      }

      // Show manual download instructions instead of trying to use API
      setShowManualDownloadInstructions(true);
      toast.info("Please follow the manual download instructions below");
    } catch (error) {
      console.error("Error preparing download:", error);
      toast.error(
        `Failed to prepare download: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold flex items-center justify-center gap-2">
          <CloudDownload className="w-5 h-5" />
          Select Database from Google Drive
        </h2>
        <p className="text-sm text-muted-foreground">
          Choose your database file (.db, .enc, .sqlite) from Google Drive
        </p>
      </div>

      {/* Google Drive Picker */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="w-5 h-5" />
            <span>Google Drive File Picker</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <drive-picker
            ref={ref}
            client-id="1037830710904-op7o1het86n8o111t7dnm48ad4v5r34o.apps.googleusercontent.com"
            app-id="1037830710904"
          />

          {/* Status Display */}
          {pickerStatus && (
            <div className="mt-4 flex items-center space-x-2">
              {getStatusIcon(pickerStatus)}
              <span className="text-sm text-muted-foreground">
                {pickerStatus}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Selected File Display */}
      {selectedFile && (
        <div className="space-y-4">
          <FileMetadataDisplay file={selectedFile} />

          {/* Manual Download Instructions */}
          {showManualDownloadInstructions && (
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="text-orange-800 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Manual Download Required
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-orange-700">
                  <p className="mb-3">
                    Due to browser security restrictions, we cannot
                    automatically download files from Google Drive. Please
                    follow these steps:
                  </p>
                  <ol className="list-decimal list-inside space-y-2 mb-4">
                    <li>
                      Click the download link below to save the file to your
                      computer
                    </li>
                    <li>
                      Once downloaded, go back and use "Choose from File System"
                    </li>
                    <li>Select the downloaded file to load your database</li>
                  </ol>
                </div>

                <div className="flex flex-col space-y-2">
                  <Button
                    onClick={() => {
                      const fileId =
                        extractFileIdFromUrl(selectedFile.url) ||
                        selectedFile.id;
                      if (fileId) {
                        const { downloadUrl } = getManualDownloadInstructions(
                          selectedFile.name,
                          fileId
                        );
                        window.open(downloadUrl, "_blank");
                      } else {
                        window.open(selectedFile.url, "_blank");
                      }
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download File
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => window.open(selectedFile.url, "_blank")}
                    className="w-full"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open in Google Drive
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => {
                      toast.success(
                        "Great! Now use 'Choose from File System' to select your downloaded file."
                      );
                      onCancel(); // This will take them back to the main selection screen
                    }}
                    className="w-full"
                  >
                    Use File System Instead
                  </Button>

                  <Button
                    variant="ghost"
                    onClick={() => setShowManualDownloadInstructions(false)}
                    className="w-full text-sm"
                  >
                    Try Again
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* File Validation */}
          {!showManualDownloadInstructions && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {isValidDatabaseFile(selectedFile) ? (
                    <div className="flex items-center space-x-2 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm">
                        Valid database file detected
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 text-red-600">
                      <XCircle className="w-4 h-4" />
                      <span className="text-sm">
                        This doesn't appear to be a database file. Please select
                        a .db, .enc, or .sqlite file.
                      </span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col space-y-2 pt-2">
                    <Button
                      onClick={downloadAndLoadDatabase}
                      disabled={!isValidDatabaseFile(selectedFile) || isLoading}
                      className="w-full"
                    >
                      {isLoading
                        ? "Downloading..."
                        : "Download & Load Database"}
                    </Button>

                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => window.open(selectedFile.url, "_blank")}
                        className="flex-1"
                      >
                        Open in Google Drive
                      </Button>
                      <Button variant="outline" onClick={onCancel}>
                        Cancel
                      </Button>
                    </div>

                    <p className="text-xs text-muted-foreground text-center">
                      If automatic download fails, you can download the file
                      manually from Google Drive and select it from your file
                      system.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Back button when no file is selected */}
      {!selectedFile && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={onCancel}>
            Back to Options
          </Button>
        </div>
      )}
    </div>
  );
}
