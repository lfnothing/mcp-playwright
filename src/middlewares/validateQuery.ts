import { Request, Response, NextFunction } from 'express';

/**
 * query 参数校验中间件
 * @param paramName 查询参数名
 */

// Express 中间件的类型签名要求返回 void
export default function validateParam(paramName: string) {
  return (req: Request, res: Response, next: NextFunction): void => { // 👈 指定 void
    const paramValue = req.query[paramName];

    if(paramValue === '') {
        res.status(400).json({code: 400,message: '参数错误：参数为空'})
        return; // 仅终止函数，不返回任何值
    }

    next();
  };
}
