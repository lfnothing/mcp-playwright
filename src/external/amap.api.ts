import amap_request from './amap.client'

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
  location: string
  keywords?: string
  type?: string
  offset?: string
  page?: string
  extensions?: 'all' | 'base'
}

export function queryPlaceAround(data: PlaceAroundParam): Promise<any> {
  return amap_request.get('/v3/place/around', { params: data })
}
