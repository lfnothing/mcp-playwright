import { z } from "zod";
import { queryRegeo } from "./amap.api.js";

export const QueryRegeoToolParams = z.object({
  longitude: z.string().describe("经度"),
  latitude: z.string().describe("纬度"),
});

export type QueryRegeoToolParamsType = z.infer<typeof QueryRegeoToolParams>;

export async function QueryRegeoTool({
  longitude,
  latitude,
}: QueryRegeoToolParamsType) {
  const location = `${longitude},${latitude}`;
  const regeo = await queryRegeo({ location: location });
  return regeo.regeocode.formatted_address;
}
