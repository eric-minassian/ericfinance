import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronsUpDown, Plus, Wallet } from "lucide-react";
import { z } from "zod";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  sidebarMenuButtonVariants,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  createPortfolioSchema,
  selectPortfolioSchema,
} from "@/lib/schemas/portfolio";
import { cn } from "@/lib/utils";
import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";

export function PortfolioSwitcher({}) {
  const [portfolios, setPortfolios] = useState<string[]>([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState<string | null>(
    null
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [createPortfolio, setCreatePortfolio] = useState(false);

  useEffect(() => {
    invoke("list_portfolios")
      .then((newPortfolios) => {
        setPortfolios(newPortfolios as string[]);
      })
      .catch((error) => {
        console.error(error);
        toast.error(error);
      });
  }, []);

  const createPortfolioForm = useForm<z.infer<typeof createPortfolioSchema>>({
    resolver: zodResolver(createPortfolioSchema),
    defaultValues: {
      name: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onCreatePortfolioSubmit(
    values: z.infer<typeof createPortfolioSchema>
  ) {
    try {
      await invoke("create_portfolio", {
        name: values.name,
        password: values.password,
      });

      const newPortfolios = (await invoke("list_portfolios")) as string[];

      setPortfolios(newPortfolios);
      setSelectedPortfolio(values.name);
      toast.success("Portfolio created");

      createPortfolioForm.reset();
    } catch (error) {
      console.error(error);
      toast.error(error as string);
    }

    setDialogOpen(false);
  }

  function onCreatePortfolio() {
    setCreatePortfolio(true);
    setDialogOpen(true);
  }

  const selectPortfolioForm = useForm<z.infer<typeof selectPortfolioSchema>>({
    resolver: zodResolver(selectPortfolioSchema),
    defaultValues: {
      name: "",
      password: "",
    },
  });

  async function onSelectPortfolioSubmit(
    values: z.infer<typeof selectPortfolioSchema>
  ) {
    try {
      await invoke("select_portfolio", {
        name: values.name,
        password: values.password,
      });

      setSelectedPortfolio(values.name);
      toast.success("Portfolio selected");
    } catch (error) {
      console.error(error);
      toast.error(error as string);
    }

    selectPortfolioForm.reset();
    setDialogOpen(false);
  }

  function onSelectPortfolio(portfolio: string) {
    setCreatePortfolio(false);
    selectPortfolioForm.setValue("name", portfolio);

    setDialogOpen(true);
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                className={cn(
                  sidebarMenuButtonVariants({ size: "lg" }),
                  "data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                )}
              >
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Wallet className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">Portfolio</span>
                  {selectedPortfolio && <span>{selectedPortfolio}</span>}
                </div>
                <ChevronsUpDown className="ml-auto" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width]"
              align="start"
            >
              {portfolios.length ? (
                portfolios.map((portfolio) => (
                  <DropdownMenuItem
                    key={portfolio}
                    onSelect={() => onSelectPortfolio(portfolio)}
                  >
                    {portfolio}
                    {portfolio === selectedPortfolio && (
                      <Check className="ml-auto" />
                    )}
                  </DropdownMenuItem>
                ))
              ) : (
                <DropdownMenuItem>No portfolios found</DropdownMenuItem>
              )}

              <DropdownMenuSeparator />
              <button onClick={onCreatePortfolio}>
                <DropdownMenuItem className="gap-2 p-2">
                  <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                    <Plus className="size-4" />
                  </div>
                  <div className="font-medium text-muted-foreground">
                    Add portfolio
                  </div>
                </DropdownMenuItem>
              </button>
            </DropdownMenuContent>
          </DropdownMenu>
          {createPortfolio
            ? AddPortfolioDialog({
                form: createPortfolioForm,
                onSubmit: onCreatePortfolioSubmit,
              })
            : SelectPortfolioDialog({
                form: selectPortfolioForm,
                onSubmit: onSelectPortfolioSubmit,
              })}
        </Dialog>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

interface AddPortfolioDialogProps {
  form: UseFormReturn<z.infer<typeof createPortfolioSchema>>;
  onSubmit: (values: z.infer<typeof createPortfolioSchema>) => void;
}

function AddPortfolioDialog({ form, onSubmit }: AddPortfolioDialogProps) {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Add portfolio</DialogTitle>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="my-portfolio" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="********" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="********" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <DialogFooter>
            <Button type="submit">Create</Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
}

interface SelectPortfolioDialogProps {
  form: UseFormReturn<z.infer<typeof selectPortfolioSchema>>;
  onSubmit: (values: z.infer<typeof selectPortfolioSchema>) => void;
}

function SelectPortfolioDialog({ form, onSubmit }: SelectPortfolioDialogProps) {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Select portfolio</DialogTitle>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="********" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <DialogFooter>
            <Button type="submit">Select</Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
}
