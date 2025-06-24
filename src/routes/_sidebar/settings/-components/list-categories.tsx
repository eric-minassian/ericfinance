import Icon from "@/components/icon";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDeleteCategory } from "@/lib/services/categories/use-delete-category";
import { useListCategories } from "@/lib/services/categories/list-categories";
import { CreateCategoryButton } from "./create-category-button";

export function ListCategories() {
  const { data } = useListCategories();
  const deleteCategoryMutation = useDeleteCategory();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Categories</CardTitle>
          <CreateCategoryButton />
        </div>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col gap-4">
          {data?.map((category) => (
            <li key={category.id}>
              <Card className="py-4">
                <CardContent className="flex items-center justify-between">
                  <span>{category.name}</span>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => {
                      deleteCategoryMutation.mutate(category.id);
                    }}
                  >
                    <Icon variant="trash" />
                  </Button>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
