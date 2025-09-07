import { DateString } from "@/lib/date";
import { useListCategories } from "@/lib/services/categories/list-categories";
import { DatePicker } from "./date-picker";
import Icon from "./icon";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface TransactionsTableFilterButtonProps {
  startDate: DateString | undefined;
  setStartDate: (date: DateString | undefined) => void;
  endDate: DateString | undefined;
  setEndDate: (date: DateString | undefined) => void;
  categoryId?: string;
  setCategoryId?: (categoryId: string | undefined) => void;
}

export function TransactionsTableFilterButton({
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  categoryId,
  setCategoryId,
}: TransactionsTableFilterButtonProps) {
  const { data: categories = [] } = useListCategories();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">
          Filter
          <Icon variant="chevronDown" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="mr-1 w-96">
        <div className="grid gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="startDate" className="w-24">
              Start Date
            </Label>
            <div className="flex-1">
              <DatePicker value={startDate} onChange={setStartDate} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="endDate" className="w-24">
              End Date
            </Label>
            <div className="flex-1">
              <DatePicker value={endDate} onChange={setEndDate} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="category" className="w-24">
              Category
            </Label>
            <div className="flex-1">
              <Select
                defaultValue="all"
                value={categoryId}
                onValueChange={(value) =>
                  setCategoryId?.(value === "all" ? undefined : value)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
