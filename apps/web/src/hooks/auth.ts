import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "aws-amplify/auth";

export function useAuth() {
  const authQuery = useQuery({
    queryKey: ["auth", "currentUser"],
    queryFn: async () => {
      const user = await getCurrentUser();
      return user;
    },
  });

  return authQuery;
}
