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
import moonshot_client from "./external/moonshot.client.js";
import { zodFunction } from "openai/helpers/zod.mjs";
import { QueryRegeoTool } from "./external/tools.js";
import { QueryRegeoToolParams } from "./external/tools.js";

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
    console.log(
      "/api/v1/shop/valuationByAI recevice reqeust: ",
      req.coordinate
    );

    const location =
      req.coordinate.lng.toString() + "," + req.coordinate.lat.toString();

    const data: shopValuationByAIResp = {
      valuation: "",
    };

    const runner = moonshot_client.chat.completions.runTools({
      model: "kimi-k2-0711-preview",
      stream: true,
      tools: [
        zodFunction({
          name: "QueryRegeoTool",
          function: QueryRegeoTool,
          parameters: QueryRegeoToolParams,
          description: "查询坐标点的具体位置信息",
        }),
      ],
      messages: [
        {
          role: "system",
          content:
            "你是 Kimi，由 Moonshot AI 提供的人工智能助手，你更擅长中文和英文的对话。你会为用户提供安全，有帮助，准确的回答。同时，你会拒绝一切涉及恐怖主义，种族歧视，黄色暴力等问题的回答。Moonshot AI 为专有名词，不可翻译成其他语言。",
        },
        {
          role: "user",
          content: `帮我分析这个坐标点 (${location}) 的地址适合开店吗？`,
        },
      ],
    });

    const result = await runner.finalChatCompletion();
    data.valuation = result.choices[0].message.content;
    res.status(200).json(genNormalResp(data));
  }
);

// /api/v1/shop/valuationByAI/stream
app.get(
  "/api/v1/shop/valuationByAI/stream",
  validateParam("location"),
  validateCoordinate("location"),
  async (req: Request, res: Response, next: NextFunction) => {
    console.log(
      "api/v1/shop/valuationByAI/stream recevice reqeust: ",
      req.coordinate
    );

    const location =
      req.coordinate.lng.toString() + "," + req.coordinate.lat.toString();

    const data: shopValuationByAIResp = {
      valuation: "",
    };

    const stream = await moonshot_client.chat.completions.create({
      model: "kimi-k2-0711-preview",
      stream: true,
      messages: [
        {
          role: "system",
          content:
            "你是 Kimi，由 Moonshot AI 提供的人工智能助手，你更擅长中文和英文的对话。你会为用户提供安全，有帮助，准确的回答。同时，你会拒绝一切涉及恐怖主义，种族歧视，黄色暴力等问题的回答。Moonshot AI 为专有名词，不可翻译成其他语言。",
        },
        {
          role: "user",
          content: `帮我分析这个坐标点 (${location}) 的地址适合开店吗？`,
        },
      ],
    });

    res.setHeader("Content-Type", "text/event-stream");
    res.flushHeaders();

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content || "";

      res.write(`data: ${JSON.stringify({ delta })}\n\n`);
      if (chunk.choices[0]?.finish_reason) {
        res.write("data: [DONE]\n\n");
        res.end();
      }

      // SSE 协议要求
      res.write(`data: ${JSON.stringify({ delta })}\n\n`);
      if (chunk.choices[0]?.finish_reason) {
        res.write("data: [DONE]\n\n");
        res.end();
      }
    }
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
