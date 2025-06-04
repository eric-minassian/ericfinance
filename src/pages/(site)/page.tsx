import { GoogleDriveDatabaseSelector } from "@/components/google-drive-database-selector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDB } from "@/hooks/db";
import { CloudDownload, Lock, Plus } from "lucide-react";
import { useState } from "react";
import { Redirect } from "wouter";

export default function IndexPage() {
  const { db, setFile, createEmptyDB, showCreateEncryptedDialog } = useDB();
  const [showGoogleDriveSelector, setShowGoogleDriveSelector] = useState(false);

  if (db) {
    return <Redirect to="/dashboard" />;
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFile(file);
    }
  };

  if (showGoogleDriveSelector) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-4xl">
          <GoogleDriveDatabaseSelector
            onCancel={() => setShowGoogleDriveSelector(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="space-y-4 text-center mb-6">
          <h1 className="text-2xl font-bold">Welcome to EricFinance</h1>
          <p className="text-sm text-muted-foreground">
            Choose how to get started with your portfolio database
          </p>
        </div>
        <div className="space-y-4">
          {/* File System Option */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Choose from file system
            </label>
            <Input
              type="file"
              accept=".db,.enc,.sqlite,.sqlite3"
              onChange={handleFileChange}
              className="cursor-pointer"
            />
          </div>

          <div className="text-center my-4">
            <p className="text-sm text-muted-foreground">or</p>
          </div>

          {/* Google Drive Option */}
          <Button
            variant="outline"
            onClick={() => setShowGoogleDriveSelector(true)}
            className="w-full flex items-center gap-2"
          >
            <CloudDownload className="w-4 h-4" />
            Select from Google Drive
          </Button>

          <div className="text-center my-4">
            <p className="text-sm text-muted-foreground">or create new</p>
          </div>

          {/* Create New Options */}
          <div className="space-y-2">
            <Button
              variant="outline"
              onClick={createEmptyDB}
              className="w-full flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create New Database
            </Button>
            <Button
              variant="outline"
              onClick={showCreateEncryptedDialog}
              className="w-full flex items-center gap-2"
            >
              <Lock className="w-4 h-4" />
              Create Encrypted Database
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
