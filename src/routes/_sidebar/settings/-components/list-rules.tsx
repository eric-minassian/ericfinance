import Icon from "@/components/icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDeleteRule } from "@/lib/services/rules/use-delete-rule";
import { useListRules } from "@/lib/services/rules/use-list-rules";
import { CreateRuleButton } from "./create-rule-button";

export function ListRules() {
  const { data } = useListRules();
  const deleteRuleMutation = useDeleteRule();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Rules</CardTitle>
          <CreateRuleButton />
        </div>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col gap-4">
          {data?.map((rule) => (
            <li key={rule.id}>
              <Card className="py-4">
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Update:</span>
                        <Badge variant="secondary">{rule.updateField}</Badge>
                        <span className="text-muted-foreground">→</span>
                        <Badge variant="outline">{rule.updateValue}</Badge>
                      </div>
                      <div className="space-y-1">
                        <span className="text-sm text-muted-foreground">
                          Conditions:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {rule.statements.map((statement, index) => (
                            <div
                              key={statement.id}
                              className="flex items-center gap-1"
                            >
                              {index > 0 && (
                                <span className="text-xs text-muted-foreground">
                                  AND
                                </span>
                              )}
                              <Badge variant="secondary" className="text-xs">
                                {statement.field} {statement.operator} "
                                {statement.value}"
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => {
                        deleteRuleMutation.mutate(rule.id);
                      }}
                    >
                      <Icon variant="trash" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
