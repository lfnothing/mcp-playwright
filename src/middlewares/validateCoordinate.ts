import { Request, Response, NextFunction } from 'express';

// 扩展 Express 的 Request 类型，让 coordinate 成为合法字段
declare global {
  namespace Express {
    interface Request {
      coordinate?: { lng: number; lat: number };
    }
  }
}

/**
 * 坐标参数校验中间件
 * @param paramName 查询参数名，默认 location
 */
export default function validateCoordinate(paramName = 'location') {
  return (req: Request, res: Response, next: NextFunction):void => {
    const coordStr = req.query[paramName] as string;

    const match = coordStr.match(/^(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)$/);
    if (!match) {
      res.status(400).json({ code: 400, message: '参数错误：参数格式错误' });
      return
    }

    const lng = Number(match[1]);
    const lat = Number(match[2]);

    if (isNaN(lng) || isNaN(lat) || lng < -180 || lng > 180 || lat < -90 || lat > 90) {
      res.status(400).json({ code: 400, message: '参数错误：经纬度超出合理范围' });
      return
    }

    req.coordinate = { lng, lat };
    next();
  };
}