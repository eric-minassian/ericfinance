import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePortfolioStore } from "@/lib/stores/portfolio-store";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function PortfolioSelect() {
  const { portfolios, fetchPortfolios, createPortfolio, selectPortfolio } =
    usePortfolioStore();
  const [name, setName] = useState("");
  const [passwords, setPasswords] = useState<Map<string, string>>(new Map());
  const [createPassword, setCreatePassword] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchPortfolios().catch((error) => toast.error(error.message));
  }, []);

  const handleCreate = async () => {
    try {
      await createPortfolio(name, createPassword);
      setName("");
      setCreatePassword("");
      setIsCreating(false);
    } catch (error) {
      toast.error("Failed to create portfolio");
    }
  };

  const handleSelect = async (portfolioName: string) => {
    try {
      const password = passwords.get(portfolioName) || "";
      await selectPortfolio(portfolioName, password);
      setPasswords(new Map(passwords).set(portfolioName, ""));
    } catch (error) {
      toast.error("Failed to open portfolio");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 gap-4">
      <h1 className="text-2xl font-bold">Welcome to EricFinance</h1>

      {isCreating ? (
        <div className="flex flex-col gap-4 w-full max-w-sm">
          <Input
            placeholder="Portfolio name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Password"
            value={createPassword}
            onChange={(e) => setCreatePassword(e.target.value)}
          />
          <div className="flex gap-2">
            <Button onClick={handleCreate}>Create</Button>
            <Button variant="outline" onClick={() => setIsCreating(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4 w-full max-w-sm">
          {portfolios.map((portfolio) => (
            <div key={portfolio} className="flex gap-2">
              <Input
                type="password"
                placeholder="Password"
                value={passwords.get(portfolio) || ""}
                onChange={(e) =>
                  setPasswords(
                    new Map(passwords).set(portfolio, e.target.value)
                  )
                }
              />
              <Button onClick={() => handleSelect(portfolio)}>
                Open {portfolio}
              </Button>
            </div>
          ))}
          <Button variant="outline" onClick={() => setIsCreating(true)}>
            Create New Portfolio
          </Button>
        </div>
      )}
    </div>
  );
}
