// Google Drive utilities for file handling
// Due to CORS and CSP restrictions in development, we'll focus on file picker and manual download

/**
 * Extract file ID from various Google Drive URL formats
 */
export function extractFileIdFromUrl(url: string): string | null {
  const patterns = [
    /\/file\/d\/([a-zA-Z0-9-_]+)/,
    /id=([a-zA-Z0-9-_]+)/,
    /\/([a-zA-Z0-9-_]+)\/view/,
    /\/([a-zA-Z0-9-_]+)$/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
}

/**
 * Generate a direct download URL for a Google Drive file
 */
export function generateGoogleDriveDownloadUrl(fileId: string): string {
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
}

/**
 * Validate if a file is a supported database format
 */
export function isDatabaseFile(fileName: string, mimeType?: string): boolean {
  const supportedExtensions = [".db", ".sqlite", ".sqlite3", ".enc"];
  const supportedMimeTypes = [
    "application/x-sqlite3",
    "application/vnd.sqlite3",
    "application/octet-stream",
    "application/x-db",
  ];

  // Check file extension
  const hasValidExtension = supportedExtensions.some((ext) =>
    fileName.toLowerCase().endsWith(ext)
  );

  // Check MIME type if provided
  const hasValidMimeType = mimeType
    ? supportedMimeTypes.includes(mimeType)
    : true;

  return hasValidExtension || hasValidMimeType;
}

/**
 * Generate instructions for manually downloading a file from Google Drive
 */
export function getManualDownloadInstructions(
  fileName: string,
  fileId: string
): {
  steps: string[];
  downloadUrl: string;
} {
  const downloadUrl = generateGoogleDriveDownloadUrl(fileId);

  return {
    steps: [
      `Right-click on this download link: ${downloadUrl}`,
      'Select "Save link as..." or "Download linked file"',
      `Save the file as "${fileName}" to your computer`,
      'Use the "Choose from file system" option to select the downloaded file',
    ],
    downloadUrl,
  };
}
