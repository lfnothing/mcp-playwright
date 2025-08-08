import amap_client from "./amap.client.js";

/*
  逆地址编码

  参数        值                          备注          必须
  location    116.481488,39.990464       中心点坐标     是

  示例：//restapi.amap.com/v3/geocode/regeo?key=您的key&location=116.481488,39.990464&poitype=商务写字楼&radius=1000&extensions=all&roadlevel=0
*/
export interface RegeoParam {
  location: string;
  poitype?: string;
  radius?: string;
  extensions?: "all" | "base";
  roadlevel?: string;
}

export function queryRegeo(data: RegeoParam): Promise<any> {
  return amap_client.get("/v3/geocode/regeo", { params: data });
}

/*
  周边搜索

  参数        值                          备注          必须
  location    116.481488,39.990464       中心点坐标     是
  keywords    肯德基                      查询关键词     否
  types       050301                     查询POI类型    否
  offset      20                         每页记录数据   否
  page        1                          当前页数       否
  extensions  all                        返回结果控制   否

  示例：//restapi.amap.com/v3/place/around?key=您的key&location=116.481488,39.990464&keywords=肯德基&types=050301&offset=20&page=1&extensions=all
*/
export interface PlaceAroundParam {
  location: string;
  keywords?: string;
  type?: string;
  offset?: string;
  page?: string;
  extensions?: "all" | "base";
}

export function queryPlaceAround(data: PlaceAroundParam): Promise<any> {
  return amap_client.get("/v5/place/around", { params: data });
}
