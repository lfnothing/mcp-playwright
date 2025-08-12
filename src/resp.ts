export interface Resp {
  /**
   * 返回码
   */
  code: number;
  /**
   * 返回消息
   */
  message: string;
  /**
   * 返回数据
   */
  ret: Ret;
  [property: string]: any;
}

/**
 * 返回数据
 */
export interface Ret {
  data?: any;
  list?: List;
  [property: string]: any;
}

/**
 * 数组返回值类型
 */
export interface List {
  list: any[];
  page: number;
  limit: number;
  offset: number;
}

/**
 * 商铺评估返回值
 */
export interface shopValuationResp {
  /**
   * 地址名称
   */
  address: string;
  /**
   * 最近商圈距离（单位米）
   */
  commercialZoneDistance: number;
  /**
   * 人流量
   */
  footTraffic: number;
  /**
   * 附近人群分布描述
   */
  nearbyPeopleDesc: string;
  /**
   * 周边服务设施
   */
  nearbyServices: number[];
  /**
   * 租金水平（元/月）
   */
  rent: number;
  /**
   * 综合评分
   */
  score: number;
  /**
   * 最近公交/地铁站距离（单位米）
   */
  trafficDistance: number;
  [property: string]: any;
}

/**
 * 商铺地址的AI分析报告返回值
 */
export interface shopValuationByAIResp {
  /**
   * 分析报告
   */
  valuation: string;
  [property: string]: any;
}

export function genNormalResp(data: any) {
  const resp: Resp = {
    code: 0,
    message: "",
    ret: {
      data,
    },
  };

  return resp;
}

export function genNormalRespList(list: List) {
  const resp: Resp = {
    code: 0,
    message: "",
    ret: {
      list,
    },
  };

  return resp;
}
