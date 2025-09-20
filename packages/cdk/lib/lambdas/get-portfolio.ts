import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import { getUserSub, json } from "./utils";

export const handler = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  try {
    const userSub = getUserSub(event);
    if (!userSub) return json(401, { message: "Unauthorized" });

    return json(200, { message: "Get portfolio - not implemented" });
    // return json(404, { message: "Not found" });
  } catch (error: any) {
    console.error("Error handling request", error);
    return json(500, { message: "Internal Server Error" });
  }
};
