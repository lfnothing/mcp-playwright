import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import cors from "cors";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import express, { NextFunction, Request, Response } from "express";
import {
  genNormalResp,
  shopValuationResp,
  shopValuationByAIResp,
} from "./resp.js";
import { randomUUID } from "crypto";
import { handleToolCall } from "./toolHandler.js";
import validateParam from "./middlewares/validateQuery.js";
import validateCoordinate from "./middlewares/validateCoordinate.js";
import { env } from "./config/env.js";
import { queryPlaceAround, queryRegeo } from "./external/amap.api.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { randomInt } from "crypto";

// Create an MCP server with implementation details
const server = new McpServer(
  {
    name: "playwright-mcp-http-server",
    version: "1.0.3",
  },
  {
    capabilities: {
      logging: {},
    },
  }
);

// Register tool
server.tool(
  "playwright_navigate",
  "Navigate to a URL",
  {
    url: z.string().describe("URL to navigate to the website specified"),
    browserType: z
      .enum(["chromium", "firefox", "webkit"])
      .default("chromium")
      .describe(
        "Browser type to use (chromium, firefox, webkit). Defaults to chromium"
      ),
    width: z
      .number()
      .default(1280)
      .describe("Viewport width in pixels (default: 1280)"),
    height: z
      .number()
      .default(720)
      .describe("Viewport height in pixels (default: 720)"),
    timeout: z
      .number()
      .default(30000)
      .describe("Navigation timeout in milliseconds"),
    waitUntil: z.string().default("load").describe("Navigation wait condition"),
    headless: z
      .boolean()
      .default(false)
      .describe("Run browser in headless mode (default: false)"),
  },
  async (args): Promise<CallToolResult> => {
    const name = "playwright_navigate";
    return handleToolCall(name, args, server);
  }
);

server.tool(
  "playwright_screenshot",
  "Take a screenshot of the current page or a specific element",
  {
    name: z.string().describe("Name for the screenshot"),
    selector: z.string().describe("CSS selector for element to screenshot"),
    width: z.number().describe("Width in pixels (default: 800)").default(800),
    height: z.number().describe("Height in pixels (default: 600)").default(600),
    storeBase64: z
      .boolean()
      .describe("Store screenshot in base64 format (default: true)")
      .default(true),
    fullPage: z
      .boolean()
      .describe("Store screenshot of the entire page (default: false)")
      .default(false),
    savePng: z
      .boolean()
      .describe("Save screenshot as PNG file (default: false)")
      .default(false),
    downloadsDir: z
      .string()
      .describe(
        "Custom downloads directory path (default: user's Downloads folder"
      )
      .default(""),
  },
  async (args): Promise<CallToolResult> => {
    const name = "playwright_screenshot";
    return handleToolCall(name, args, server);
  }
);

server.tool(
  "playwright_click",
  "Click an element on the page",
  {
    selector: z.string().describe("CSS selector for the element to click"),
  },
  async (args): Promise<CallToolResult> => {
    const name = "playwright_click";
    return handleToolCall(name, args, server);
  }
);

server.tool(
  "playwright_video_record",
  "Record an video on the page",
  {
    filename: z.string().describe("Record video filename to saved"),
  },
  async (args): Promise<CallToolResult> => {
    const name = "playwright_video_record";
    return handleToolCall(name, args, server);
  }
);

server.tool(
  "playwright_iframe_click",
  "Click an element in an iframe on the page",
  {
    iframeSelector: z
      .string()
      .describe("CSS selector for the iframe containing the element to click"),
    selector: z.string().describe("CSS selector for the element to click"),
  },
  async (args): Promise<CallToolResult> => {
    const name = "playwright_iframe_click";
    return handleToolCall(name, args, server);
  }
);

server.tool(
  "playwright_fill",
  "fill out an input field",
  {
    selector: z.string().describe("CSS selector for input field"),
    value: z.string().describe("Value to fill"),
  },
  async (args): Promise<CallToolResult> => {
    const name = "playwright_fill";
    return handleToolCall(name, args, server);
  }
);

server.tool(
  "playwright_select",
  "Select an element on the page with Select tag",
  {
    selector: z.string().describe("CSS Selector for element to select"),
    value: z.string().describe("Value to select"),
  },
  async (args): Promise<CallToolResult> => {
    const name = "playwright_select";
    return handleToolCall(name, args, server);
  }
);

server.tool(
  "playwright_hover",
  "Hover an element on the page",
  {
    selector: z.string().describe("CSS selector for element to hover"),
  },
  async (args): Promise<CallToolResult> => {
    const name = "playwright_hover";
    return handleToolCall(name, args, server);
  }
);

server.tool(
  "playwright_evaluate",
  "Execute JavaScript in the browser console",
  {
    script: z.string().describe("JavaScript code to execute"),
  },
  async (args): Promise<CallToolResult> => {
    const name = "playwright_evaluate";
    return handleToolCall(name, args, server);
  }
);

server.tool(
  "playwright_console_logs",
  "Retrieve console logs from the browser with filtering options",
  {
    type: z
      .enum(["all", "error", "warning", "log", "info", "debug"])
      .describe(
        "Type of logs to retrieve (all, error, warning, log, info, debug)"
      ),
    search: z
      .string()
      .describe(
        "Text to search for in logs (handles text with square brackets"
      ),
    limit: z.number().describe("Maximum number of logs to return"),
    clear: z
      .boolean()
      .default(false)
      .describe("Whether to clear logs after retrieval (default: false)"),
  },
  async (args): Promise<CallToolResult> => {
    const name = "playwright_console_logs";
    return handleToolCall(name, args, server);
  }
);

server.tool(
  "playwright_close",
  "Close the browser and release all resources",
  {},
  async (args): Promise<CallToolResult> => {
    const name = "playwright_close";
    return handleToolCall(name, args, server);
  }
);

server.tool(
  "playwright_custom_user_agent",
  "Set a custom User Agent for the Playwright browser instance",
  {
    userAgent: z
      .string()
      .describe("Custom User Agent for the Playwright browser instance"),
  },
  async (args): Promise<CallToolResult> => {
    const name = "playwright_custom_user_agent";
    return handleToolCall(name, args, server);
  }
);

server.tool(
  "playwright_get_visible_text",
  "Get the visible text content of the current page",
  {},
  async (args): Promise<CallToolResult> => {
    const name = "playwright_get_visible_text";
    return handleToolCall(name, args, server);
  }
);

server.tool(
  "playwright_get_visible_html",
  "Get the HTML content of the current page",
  {},
  async (args): Promise<CallToolResult> => {
    const name = "playwright_get_visible_html";
    return handleToolCall(name, args, server);
  }
);

server.tool(
  "playwright_go_back",
  "Navigate back in browser history",
  {},
  async (args): Promise<CallToolResult> => {
    const name = "playwright_go_back";
    return handleToolCall(name, args, server);
  }
);

server.tool(
  "playwright_go_forward",
  "Navigate forward in browser history",
  {},
  async (args): Promise<CallToolResult> => {
    const name = "playwright_go_forward";
    return handleToolCall(name, args, server);
  }
);

server.tool(
  "playwrite_drag",
  "Drag an element to a target location",
  {
    sourceSelector: z.string().describe("CSS selector for the element to drag"),
    targetSelector: z.string().describe("CSS selector for the target location"),
  },
  async (args): Promise<CallToolResult> => {
    const name = "playwrite_drag";
    return handleToolCall(name, args, server);
  }
);

server.tool(
  "playwright_press_key",
  "Press a keyboard key",
  {
    key: z.string().describe("Key to press (e.g. 'Enter', 'ArrowDown', 'a')"),
    selector: z
      .string()
      .describe("Optional CSS selector to focus before pressing key"),
  },
  async (args): Promise<CallToolResult> => {
    const name = "playwright_press_key";
    return handleToolCall(name, args, server);
  }
);

server.tool(
  "playwright_save_as_pdf",
  "Save the current page as a PDF file",
  {
    outputPath: z.string().describe("Directory path where PDF will be saved"),
    filename: z.string().describe("Name of the PDF file (default: page.pdf)"),
    format: z.string().describe("Page format (e.g. 'A4', 'Letter')"),
    printBackground: z
      .boolean()
      .describe("Whether to print background graphics"),
    margin: z
      .object({
        top: z.string(),
        right: z.string(),
        bottom: z.string(),
        left: z.string(),
      })
      .describe("Page margins"),
  },
  async (args): Promise<CallToolResult> => {
    const name = "playwright_save_as_pdf";
    return handleToolCall(name, args, server);
  }
);

const app = express();
const corsOptions = {
  origin: "*",
  exposedHeaders: "mcp-session-id",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

// 使用中间件
app.use(express.json()).use(cors(corsOptions));

// Map to store transports by session ID
const transports: { [sessionId: string]: StreamableHTTPServerTransport } = {};

// Handle POST request
app.post("/mcp", cors(), async (req: Request, res: Response) => {
  console.log("Recevice MCP request", req.body);
  try {
    // Check for existing session ID
    const sessionId = req.headers["mcp-session-id"] as string | undefined;
    let transport: StreamableHTTPServerTransport;

    if (sessionId && transports[sessionId]) {
      // Reuse existing transport
      transport = transports[sessionId];
    } else if (!sessionId && isInitializeRequest(req.body)) {
      // New initialization request - use JSON response mode
      transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        enableJsonResponse: true, // Enable JSON response mode
      });

      // Connect the transport to the MCP server BEFORE handing the request
      await server.connect(transport);

      // After handling the request, if we get a session ID back, store the transport
      await transport.handleRequest(req, res, req.body);

      // Store the transport by session ID for future requests
      if (transport.sessionId) {
        transports[transport.sessionId] = transport;
      }

      return; // Already handled
    } else {
      // Invalid request - no session ID or not initialization request
      res.status(400).json({
        jsonrpc: "2.0",
        error: {
          code: -32000,
          message: "Bad Request: No valid session ID provided",
        },
        id: null,
      });
      return;
    }

    // Handle the request with existing transport - no need to reconnect
    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error("Error handling MCP request:", error);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: "2.0",
        error: {
          code: -32603,
          message: "Internal server error",
        },
        id: null,
      });
    }
  }
});

// const data: shopValuationResp = {
//     footTraffic: 1,
//     rent: 15000,
//     nearbyPeopleDesc: '主要人群为25-40岁白领，职业包括金融、IT、咨询等行业，消费能力较强。',
//     trafficDistance: 300,
//     commercialZoneDistance: 1500,
//     nearbyServices: [0, 1, 2],
//     score: 8
// }

// /api/v1/shop/valuation
app.get(
  "/api/v1/shop/valuation",
  validateParam("location"),
  validateCoordinate("location"),
  async (req: Request, res: Response, next: NextFunction) => {
    console.log("/api/v1/shop/valuation recevice reqeust: ", req.coordinate);

    const data: shopValuationResp = {
      address: "",
      footTraffic: 0,
      rent: 0,
      nearbyPeopleDesc: "",
      trafficDistance: 0,
      commercialZoneDistance: 0,
      nearbyServices: [],
      score: 0,
    };

    // 附近人流量列表
    const footTrafficList = [1, 10, 100];

    // 附近人群描述列表
    const nearbyPeopleDescList = [
      `早高峰通勤白领
        核心特征：25-38 岁，写字楼密集区，7:30-9:30 地铁/公交集中出站
        主要需求：高单价咖啡、便携早餐、30 秒快速支付
        高频触点：地铁闸机口、共享单车停放点、电梯厅屏幕`,

      `社区宝妈&学龄儿童
        核心特征：28-35 岁宝妈 + 3-8 岁孩子，下午 15:00-17:00 接送时段出现
        主要需求：健康轻食、儿童体验课、母婴快消
        高频触点：幼儿园门口、社区滑梯区、妈妈微信群`,

      `高校夜猫学生
        核心特征：18-24 岁，夜间 20:00-01:00 活跃，月均可支配 1500-2500 元
        主要需求：低价夜宵、奶茶甜品、桌游/电竞
        高频触点：校门口小吃街、宿舍楼下自动售货机、B 站/小红书`,

      `银发晨练族
        核心特征：55-70 岁，6:00-8:00 公园或小区广场聚集
        主要需求：平价早点、养生茶歇、健康检测
        高频触点：公园门口、社区宣传栏、广场舞音响广告`,

      `景区短途游客
        核心特征：20-45 岁，周末/节假日集中，客单价敏感度低
        主要需求：城市伴手礼、拍照打卡场景、快速简餐
        高频触点：景区出口、打卡墙、官方导览小程序`,

      `24h 夜班医护/安保
        核心特征：22:00-6:00 在岗，医院/工业园周边
        主要需求：热食便当、功能饮料、可休息 20 分钟的座位
        高频触点：医院急诊门口、园区侧门、员工微信群`,

      `高端车主&代驾司机
        核心特征：30-50 岁，夜间 21:00-02:00 餐饮街附近找代驾
        主要需求：醒酒饮品、代驾等候区、快速充电
        高频触点：餐厅门口、代驾司机聚集点、车载语音广告`,

      `新晋养宠白领
        核心特征：25-35 岁，一人户或情侣，晚 19:00-21:00 遛狗
        主要需求：宠物零食、宠物洗护、社交拍照
        高频触点：宠物公厕、社区草坪、小红书“遛狗打卡”话题`,

      `会展/赛事瞬时人流
        核心特征：18-45 岁，展会/演唱会前后 2-3 小时爆发
        主要需求：快速餐饮、应援周边、充电宝租借
        高频触点：场馆出入口、地铁加密班次、活动官方 APP 弹窗`,

      `工业园区蓝领
        核心特征：20-40 岁，三班倒，11:30-13:00、17:30-19:00 集中就餐
        主要需求：15 元以内快餐、大份量、扫码秒付
        高频触点：厂区门口、员工班车、食堂排队区广告屏`,

      `外籍常驻人员
        核心特征：25-45 岁，国际学校/外企公寓周边，英语为主
        主要需求：异国简餐、进口超市、双语服务
        高频触点：国际学校门口、英文地图 APP、Facebook 社群`,

      `夜生活潮人
        核心特征：22-35 岁，周五-周日 22:00-03:00 出没酒吧街
        主要需求：特调鸡尾酒、拍照灯光、深夜食堂
        高频触点：酒吧排队区、DJ 台、抖音同城热搜榜`,
    ];

    data.footTraffic = footTrafficList[randomInt(0, footTrafficList.length)];
    data.rent = randomInt(1000, 20001);
    data.nearbyPeopleDesc =
      nearbyPeopleDescList[randomInt(0, nearbyPeopleDescList.length)];
    data.commercialZoneDistance = randomInt(10, 2001);
    data.score = randomInt(1, 11);

    for (let i = 0; i <= 6; i++) {
      if (randomInt(0, 10) % 2 === 0) {
        data.nearbyServices.push(i);
      }
    }

    const location =
      req.coordinate.lng.toLocaleString() +
      "," +
      req.coordinate.lat.toLocaleString();
    try {
      const bus = await queryPlaceAround({
        location: location,
        keywords: "公交站",
      });
      const metro = await queryPlaceAround({
        location: location,
        keywords: "地铁站",
      });

      for (let i = 0; i < bus.pois.length; i++) {
        const distance = Number(bus.pois[i].distance);

        if (data.trafficDistance === 0 || data.trafficDistance > distance) {
          data.trafficDistance = distance;
        }
      }

      for (let i = 0; i < metro.pois.length; i++) {
        const distance = Number(metro.pois[i].distance);

        if (data.trafficDistance > distance) {
          data.trafficDistance = distance;
        }
      }

      const regeo = await queryRegeo({
        location: location,
      });
      data.address = regeo.regeocode.formatted_address;

      //   // 写字楼 -> 0
      //   const officeBuilding = await queryPlaceAround({
      //     location: location,
      //     type: "120201",
      //   });
      //   for (let i = 0; i < officeBuilding.pois.length; i++) {
      //     const distance = Number(officeBuilding.pois[i].distance);

      //     if (distance < 1000) {
      //       data.nearbyServices.push(0);
      //       break;
      //     }
      //   }

      //   // 学校 -> 1
      //   const school = await queryPlaceAround({
      //     location: location,
      //     type: "141200",
      //   });
      //   for (let i = 0; i < school.pois.length; i++) {
      //     const distance = Number(school.pois[i].distance);

      //     if (distance < 1000) {
      //       data.nearbyServices.push(1);
      //       break;
      //     }
      //   }

      //   // 医院 -> 2
      //   const hospital = await queryPlaceAround({
      //     location: location,
      //     type: "090100",
      //   });
      //   for (let i = 0; i < hospital.pois.length; i++) {
      //     const distance = Number(hospital.pois[i].distance);

      //     if (distance < 1000) {
      //       data.nearbyServices.push(2);
      //       break;
      //     }
      //   }

      //   // 购物中心 -> 3
      //   const shopping = await queryPlaceAround({
      //     location: location,
      //     type: "060101",
      //   });
      //   for (let i = 0; i < shopping.pois.length; i++) {
      //     const distance = Number(shopping.pois[i].distance);

      //     if (distance < 1000) {
      //       data.nearbyServices.push(3);
      //       break;
      //     }
      //   }

      //   // 住宅区 -> 4
      //   const residentialArea = await queryPlaceAround({
      //     location: location,
      //     type: "120300",
      //   });
      //   for (let i = 0; i < residentialArea.pois.length; i++) {
      //     const distance = Number(residentialArea.pois[i].distance);

      //     if (distance < 1000) {
      //       data.nearbyServices.push(4);
      //       break;
      //     }
      //   }

      //   // 公园 -> 5
      //   const park = await queryPlaceAround({
      //     location: location,
      //     type: "110100",
      //   });
      //   for (let i = 0; i < park.pois.length; i++) {
      //     const distance = Number(park.pois[i].distance);

      //     if (distance < 1000) {
      //       data.nearbyServices.push(5);
      //       break;
      //     }
      //   }

      //   // 停车场 -> 6
      //   const parking = await queryPlaceAround({
      //     location: location,
      //     type: "150900",
      //   });
      //   for (let i = 0; i < parking.pois.length; i++) {
      //     const distance = Number(parking.pois[i].distance);

      //     if (distance < 1000) {
      //       data.nearbyServices.push(6);
      //       break;
      //     }
      //   }
    } catch (err) {
      next(err); // 全局错误中间件统一处理
      return;
    }

    res.status(200).json(genNormalResp(data));
  }
);

// /api/v1/shop/valuationByAI
app.get(
  "/api/v1/shop/valuationByAI",
  validateParam("location"),
  validateCoordinate("location"),
  async (req: Request, res: Response, next: NextFunction) => {
    console.log("/api/v1/shop/valuation recevice reqeust: ", req.coordinate);

    const data: shopValuationByAIResp = {
      valuation:
        "## 示例 (Example - 模拟分析一家便利店)**项目名称：** XX品牌便利店**位置:** `[XX省XX市XX区人民路步行街1号口，靠近市中心商圈]`*   靠近大型购物中心和写字楼集中区域。*   人流量非常大，高峰时段（下午2-5点、晚上7-9点）人流密集。## 市场环境分析1.  **目标区域消费群体：**    *   主要为周边写字楼白领（年龄25-40岁）、附近居民家庭和游客。    *   对方便食品、饮料、日用品需求高，对价格有一定敏感度。2.  **区域竞争格局:**    *   **主要竞争对手分析 (列出前3名):**        | 竞争对手名称       | 距离/位置关系         | 规模           | 主要优势               | 可能的劣势             |        |--------------------|-------------------------|-----------------|-----------------------|-----------------------|        | XX购物中心超市      | `[步行街同一区域，距离约50米]` | 大型超市        | 品类齐全、一站式购物   | 位置相对次要、价格偏高 |        | 另一家XX便利店品牌  | `[人流量稍次处，距离约100米]` | 中小型           | 环境舒适、促销活动多   | 品牌知名度略低         |        | 民族品牌杂货店      | `[街对面，距离约5米]`    | 小型            | 本地人熟悉、价格低廉   | 品类单一、环境一般     |    *   竞争对手数量较多且密集（步行街内多家便利店），但民族品牌杂货店作为近距离替代竞争激烈。3.  **人流量与交通便利性分析：**    *   日均人流量估计在 `[500-1000人次]` 左右，高峰时段数倍增长。    *   主要客源是 `[居民、上班族、游客]` 混合。    *   附近有大型免费停车场（购物中心），交通便利。## 店铺自身分析1.  **业态与定位：**    *   XX品牌便利店，定位为中高端便利零售，在目标区域内有一定知名度。2.  **产品/服务分析:**    *   主要销售饮料、零食、烟草、日用品等。    *   品类相对齐全（包括关东煮热食），有部分非食品品类如简单包装食品、常用药品等，形成一定差异化。    *   店面货架整洁，标价清晰，收银台现代化，商品陈列有序且有一定吸引力。3.  **空间利用与陈列：**    *   空间利用率较高，顾客动线设计合理。有不错的视觉营销（灯光、品牌标识）。4.  **设施设备状况:**    *   设备良好，空调恒温系统正常运行，收银POS机工作正常。5.  **卫生与安全：**    *   店内干净整洁，无明显垃圾或灰尘。安全出口指示清晰。## 财务表现分析1.  **收入状况:** 近一年平均月销售额约 `[8-10万元]` (此数据为估计/需核实)。2.  **利润状况:** 毛利率约为 `[45%-55%]` (假设，需具体数据)，估算净亏损可能在每月 `[租金+人工成本超出部分]` 约 `[1.5-2万元]` (此分析基于现有信息和行业常识)。3.  **成本结构分析:**    *   租金：月租约 `800元/m²`，是当前经营最大的压力之一（该商圈租金普遍偏高）。    *   物业费：已包含在租金内/另有每月 `[XX]` 元物业费。    *   人工成本：有固定员工数 `[X人]` 和小时工，人工成本占比较高。## 团队与管理评估1.  **经营者背景:** 经营者 `[张三]` 在本地零售行业有十年以上经验，曾成功运营多家类似店面。2.  **日常运营管理情况:**    *   营业时间为8：00-22：00。    *   员工服务态度友好专业。## 风险评估1.  **经营风险:** 对客流依赖性高，节假日与平日差异大；受天气影响可能减小顾客到访频率（尤其热食区）。2.  **财务风险:** 租金偏高，在当前销售额下压力较大。如果租金调整或成本上升，盈利空间会迅速压缩。3.  **外部风险:** 步行街人流和商业环境受整体经济状况、线上购物冲击等影响可能波动；面临来自大型连锁超市及电商平台的潜在挤压。## 总结与建议*   **优势：** 地理位置优越（靠近核心商圈），人流量大，品牌有一定认知度。*   **劣势/挑战:** 租金成本高，与大型竞争对手和近距离替代者竞争激烈，经营压力较大。*   **机遇：** 通过优化商品结构、增加非食品品类或开展促销活动，可能提升销售额。利用步行街优势发展线上配送是潜在机会。*   **威胁：** 商圈整体商业氛围变化风险；线上零售的分流效应持续存在。*   **综合评价:** 店铺有潜力成为高坪效店铺（基于其业态和位置），但需要有效的经营策略来应对当前租金压力与竞争。在特定时间段内人流量优势明显，但在平日或非高峰时段可能面临冷清风险。*   **后续建议/行动计划:**    *   进一步收集过去12个月的精确销售数据。    *   详细考察内部库存周转情况及损耗率。    *   就租金构成、支付方式与业主进行深入沟通，了解是否有调整空间或合作可能性。    *   评估该店是否具备加盟/特许经营的基础条件。",
    };
    res.status(200).json(genNormalResp(data));
  }
);

app.use(errorHandler);

// Helper function to detect initialize requests
function isInitializeRequest(body: unknown): boolean {
  if (Array.isArray(body)) {
    return body.some(
      (msg) =>
        typeof msg === "object" &&
        msg !== null &&
        "method" in msg &&
        msg.method === "initialize"
    );
  }
  return (
    typeof body === "object" &&
    body !== null &&
    "method" in body &&
    body.method === "initialize"
  );
}

// Start the server
app.listen(env.PORT, () => {
  console.log(`MCP Streamable HTTP Server listening on port ${env.PORT}`);
});

// Handle server shutdown
process.on("SIGINT", async () => {
  console.log("Shutting down server...");
  await server.close();
  process.exit(0);
});
