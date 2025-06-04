import { FileMetadataDisplay } from "@/components/file-metadata-display";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ContentLayout } from "@/components/ui/content-layout";
import { Header } from "@/components/ui/header";
import type { DocumentObject, PickerEvent } from "@/types/google-drive";
import type {
  DrivePickerElement,
  DrivePickerElementProps,
} from "@googleworkspace/drive-picker-element";
import { AlertCircle, CheckCircle, FileText, XCircle } from "lucide-react";
import React, { useState } from "react";

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

export default function DashboardPage() {
  const ref = React.useRef<DrivePickerElement>(null);
  const [events, setEvents] = React.useState<PickerEvent[]>([]);
  const [selectedFile, setSelectedFile] = useState<DocumentObject | null>(null);
  const [pickerStatus, setPickerStatus] = useState<string>("");

  React.useEffect(() => {
    const currentRef = ref.current;
    if (!currentRef) {
      return;
    }

    const handler = (e: PickerEvent) => {
      setEvents((events) => [e, ...events]);

      // Handle specific event types
      if (e.type === "picker:picked") {
        setPickerStatus("File selected successfully");
        // Extract file metadata from the picker response
        if (
          e.detail &&
          Array.isArray(e.detail.docs) &&
          e.detail.docs.length > 0
        ) {
          const file = e.detail.docs[0] as DocumentObject; // Get the first selected file
          setSelectedFile(file);
        }
      } else if (e.type === "picker:canceled") {
        setPickerStatus("File selection canceled");
        setSelectedFile(null);
      } else if (e.type === "picker:oauth:error") {
        setPickerStatus("Authentication error occurred");
        setSelectedFile(null);
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

  return (
    <ContentLayout header={<Header>Welcome back!</Header>}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">EricFinance Dashboard</h1>
          <Badge variant="outline">Google Drive Integration</Badge>
        </div>

        {/* Google Drive Picker */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Select File from Google Drive</span>
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

        {/* Selected File Metadata */}
        {selectedFile && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Selected File</h2>
            <FileMetadataDisplay file={selectedFile} />
          </div>
        )}

        {/* Debug Events (can be hidden in production) */}
        {events.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Debug: Recent Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {events.slice(0, 3).map((e) => (
                  <div
                    key={e.timeStamp}
                    className="text-xs bg-muted p-2 rounded"
                  >
                    <div className="font-medium">{e.type}</div>
                    <div className="text-muted-foreground">
                      {new Date(e.timeStamp).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ContentLayout>
  );
}
