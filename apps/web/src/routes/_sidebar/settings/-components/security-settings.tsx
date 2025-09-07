import Icon from "@/components/icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SpaceBetween } from "@/components/ui/space-between";
import { useDB } from "@/hooks/db";

export function SecuritySettings() {
  const { isEncrypted, changePassword, addEncryption, exportDB } = useDB();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isEncrypted ? (
            <>
              <Icon variant="shieldCheck" className=" text-green-600" />
              Database Encryption
            </>
          ) : (
            <>
              <Icon variant="shield" className="text-yellow-600" />
              Database Security
            </>
          )}
        </CardTitle>
        <CardDescription>
          Manage encryption and security settings for your database
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <SpaceBetween alignItems="center" size="xs">
            <span className="text-sm font-medium">Encryption Status</span>
            <Badge variant={isEncrypted ? "default" : "secondary"}>
              {isEncrypted ? "Encrypted" : "Unencrypted"}
            </Badge>
          </SpaceBetween>
          <p className="text-sm text-muted-foreground">
            {isEncrypted
              ? "Your database is protected with encryption"
              : "Your database is not encrypted and may be vulnerable"}
          </p>
        </div>

        <SpaceBetween>
          {isEncrypted ? (
            <Button variant="outline" onClick={changePassword}>
              <Icon variant="key" size="sm" />
              Change Password
            </Button>
          ) : (
            <Button onClick={addEncryption}>
              <Icon variant="lock" size="sm" />
              Add Encryption
            </Button>
          )}

          <Button variant="outline" onClick={exportDB}>
            Export Database
          </Button>
        </SpaceBetween>
      </CardContent>
    </Card>
  );
}
