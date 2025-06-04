import type {
  DrivePickerDocsViewElement,
  DrivePickerDocsViewElementProps,
  DrivePickerElement,
  DrivePickerElementProps,
} from "@googleworkspace/drive-picker-element";

// Google Drive Picker API response types
export interface DocumentObject {
  id: string;
  name: string;
  url: string;
  iconUrl?: string;
  mimeType: string;
  lastEditedUtc?: number;
  thumbnails?: Array<{
    url: string;
    width: number;
    height: number;
  }>;
  sizeBytes?: number;
  type?: string;
  description?: string;
  embedUrl?: string;
  serviceId?: string;
  isShared?: boolean;
  parentId?: string;
}

export interface PickerResponseObject {
  action: string;
  docs: DocumentObject[];
}

export interface PickerEvent extends Event {
  type: string;
  detail: PickerResponseObject;
  timeStamp: number;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "drive-picker": React.DetailedHTMLProps<
        React.HTMLAttributes<DrivePickerElement> & DrivePickerElementProps,
        DrivePickerElement
      >;
      "drive-picker-docs-view": React.DetailedHTMLProps<
        React.HTMLAttributes<DrivePickerDocsViewElement> &
          DrivePickerDocsViewElementProps,
        DrivePickerDocsViewElement
      >;
    }
  }
}
