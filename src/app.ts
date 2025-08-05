import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from "zod"
import cors  from 'cors'
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js'
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'
import express, { Request, Response } from 'express'
import { genNormalResp, shopValuationResp } from './resp.js'
import { randomUUID } from 'crypto'
import { handleToolCall } from './toolHandler.js'
import validateParam  from './middlewares/validateQuery.js'
import validateCoordinate from './middlewares/validateCoordinate.js'

// Create an MCP server with implementation details
const server = new McpServer({
    name: 'playwright-mcp-http-server',
    version: '1.0.3'
}, {
    capabilities: {
        logging: {}
    }
})

// Register tool
server.tool(
    "playwright_navigate",
    "Navigate to a URL",
    {
        url: z.string().describe('URL to navigate to the website specified'),
        browserType: z.enum(['chromium', 'firefox', 'webkit']).default('chromium').describe("Browser type to use (chromium, firefox, webkit). Defaults to chromium"),
        width: z.number().default(1280).describe("Viewport width in pixels (default: 1280)"),
        height: z.number().default(720).describe("Viewport height in pixels (default: 720)"),
        timeout: z.number().default(30000).describe("Navigation timeout in milliseconds"),
        waitUntil: z.string().default("load").describe("Navigation wait condition"),
        headless: z.boolean().default(false).describe("Run browser in headless mode (default: false)")
    },
    async (args): Promise<CallToolResult> => {
       const name = "playwright_navigate"
       return handleToolCall(name, args, server)
    }
)

server.tool(
    "playwright_screenshot",
    "Take a screenshot of the current page or a specific element",
    {
        name: z.string().describe("Name for the screenshot"),
        selector: z.string().describe("CSS selector for element to screenshot"),
        width: z.number().describe("Width in pixels (default: 800)").default(800),
        height: z.number().describe("Height in pixels (default: 600)").default(600),
        storeBase64: z.boolean().describe("Store screenshot in base64 format (default: true)").default(true),
        fullPage: z.boolean().describe("Store screenshot of the entire page (default: false)").default(false),
        savePng: z.boolean().describe("Save screenshot as PNG file (default: false)").default(false),
        downloadsDir: z.string().describe("Custom downloads directory path (default: user's Downloads folder").default(''),
    },
    async (args): Promise<CallToolResult> => {
        const name = "playwright_screenshot"
        return handleToolCall(name, args, server)
    }
)

server.tool(
    "playwright_click",
    "Click an element on the page",
    {
        selector: z.string().describe("CSS selector for the element to click"),
    },
    async (args): Promise<CallToolResult> => {
        const name = "playwright_click"
        return handleToolCall(name, args, server)
    }
)


server.tool(
    "playwright_video_record",
    "Record an video on the page",
    {
        filename: z.string().describe("Record video filename to saved"),
    },
    async (args): Promise<CallToolResult> => {
        const name = "playwright_video_record"
        return handleToolCall(name, args, server)
    }
)

server.tool(
    "playwright_iframe_click",
    "Click an element in an iframe on the page",
    {
        iframeSelector: z.string().describe("CSS selector for the iframe containing the element to click"),
        selector: z.string().describe("CSS selector for the element to click"),
    },
    async (args): Promise<CallToolResult> => {
        const name = "playwright_iframe_click"
        return handleToolCall(name, args, server)
    }
)

server.tool(
    "playwright_fill",
    "fill out an input field",
    {
        selector: z.string().describe("CSS selector for input field"),
        value: z.string().describe("Value to fill"),
    },
    async (args): Promise<CallToolResult> => {
        const name = "playwright_fill"
        return handleToolCall(name, args, server)
    }
)

server.tool(
    "playwright_select",
    "Select an element on the page with Select tag",
    {
        selector: z.string().describe("CSS Selector for element to select"),
        value: z.string().describe("Value to select"),
    },
    async (args): Promise<CallToolResult> => {
        const name = "playwright_select"
        return handleToolCall(name, args, server)
    }
)

server.tool(
    "playwright_hover",
    "Hover an element on the page",
    {
        selector: z.string().describe("CSS selector for element to hover"),
    },
    async (args): Promise<CallToolResult> => {
        const name = "playwright_hover"
        return handleToolCall(name, args, server)
    }
)

server.tool(
    "playwright_evaluate",
    "Execute JavaScript in the browser console",
    {
        script: z.string().describe("JavaScript code to execute")
    },
    async (args): Promise<CallToolResult> => {
        const name = "playwright_evaluate"
        return handleToolCall(name, args, server)
    }
)

server.tool(
    "playwright_console_logs",
    "Retrieve console logs from the browser with filtering options",
    {
        type: z.enum(["all", "error", "warning", "log", "info", "debug"]).describe("Type of logs to retrieve (all, error, warning, log, info, debug)"),
        search: z.string().describe("Text to search for in logs (handles text with square brackets"),
        limit: z.number().describe("Maximum number of logs to return"),
        clear: z.boolean().default(false).describe("Whether to clear logs after retrieval (default: false)")
    },
    async (args): Promise<CallToolResult> => {
        const name = "playwright_console_logs"
        return handleToolCall(name, args, server)
    }
)

server.tool(
    "playwright_close",
    "Close the browser and release all resources",
    {},
    async (args): Promise<CallToolResult> => {
        const name = "playwright_close"
        return handleToolCall(name, args, server)
    }
)

server.tool(
    "playwright_custom_user_agent",
    "Set a custom User Agent for the Playwright browser instance",
    {
        userAgent: z.string().describe("Custom User Agent for the Playwright browser instance")
    },
    async (args): Promise<CallToolResult> => {
        const name = "playwright_custom_user_agent"
        return handleToolCall(name, args, server)
    }
)

server.tool(
    "playwright_get_visible_text",
    "Get the visible text content of the current page",
    {},
    async (args): Promise<CallToolResult> => {
        const name = "playwright_get_visible_text"
        return handleToolCall(name, args, server)
    }
)

server.tool(
    "playwright_get_visible_html",
    "Get the HTML content of the current page",
    {},
    async (args): Promise<CallToolResult> => {
        const name = "playwright_get_visible_html"
        return handleToolCall(name, args, server)
    }
)

server.tool(
    "playwright_go_back",
    "Navigate back in browser history",
    {},
    async (args): Promise<CallToolResult> => {
        const name = "playwright_go_back"
        return handleToolCall(name, args, server)
    }
)

server.tool(
    "playwright_go_forward",
    "Navigate forward in browser history",
    {},
    async (args): Promise<CallToolResult> => {
        const name = "playwright_go_forward"
        return handleToolCall(name, args, server)
    }
)

server.tool(
    "playwrite_drag",
    "Drag an element to a target location",
    {
        sourceSelector: z.string().describe("CSS selector for the element to drag"),
        targetSelector: z.string().describe("CSS selector for the target location"),
    },
    async (args): Promise<CallToolResult> => {
        const name = "playwrite_drag"
        return handleToolCall(name, args, server)
    }
)

server.tool(
    "playwright_press_key",
    "Press a keyboard key",
    {
        key: z.string().describe("Key to press (e.g. 'Enter', 'ArrowDown', 'a')"),
        selector: z.string().describe("Optional CSS selector to focus before pressing key"),
    },
    async (args): Promise<CallToolResult> => {
        const name = "playwright_press_key"
        return handleToolCall(name, args, server)
    }
)

server.tool(
    "playwright_save_as_pdf",
    "Save the current page as a PDF file",
    {
        outputPath: z.string().describe("Directory path where PDF will be saved"),
        filename: z.string().describe("Name of the PDF file (default: page.pdf)"),
        format: z.string().describe("Page format (e.g. 'A4', 'Letter')"),
        printBackground:z.boolean().describe("Whether to print background graphics"),
        margin: z.object(
            {
                top:z.string(),
                right: z.string(),
                bottom: z.string(),
                left: z.string()
            }
        ).describe("Page margins")
    },
    async (args): Promise<CallToolResult> => {
        const name = "playwright_save_as_pdf"
        return handleToolCall(name, args, server)
    }
)


const app = express()
const corsOptions = {
  origin: "*",
  exposedHeaders: "mcp-session-id",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  preflightContinue: false,
  optionsSuccessStatus: 204
}

// 使用中间件
app.use(express.json()).use(cors(corsOptions))

// Map to store transports by session ID
const transports: { [sessionId: string]: StreamableHTTPServerTransport } = {}

// Handle POST request 
app.post('/mcp', cors(), async (req: Request, res: Response) => {
    console.log('Recevice MCP request', req.body)
    try {
        // Check for existing session ID
        const sessionId = req.headers['mcp-session-id'] as string | undefined
        let transport: StreamableHTTPServerTransport;

        if (sessionId && transports[sessionId]) {
            // Reuse existing transport
            transport = transports[sessionId]
        } else if (!sessionId && isInitializeRequest(req.body)) {
            // New initialization request - use JSON response mode
            transport = new StreamableHTTPServerTransport({
                sessionIdGenerator: () => randomUUID(),
                enableJsonResponse: true,   // Enable JSON response mode
            })

            // Connect the transport to the MCP server BEFORE handing the request 
            await server.connect(transport)

            // After handling the request, if we get a session ID back, store the transport
            await transport.handleRequest(req, res, req.body);

            // Store the transport by session ID for future requests
            if (transport.sessionId) {
                transports[transport.sessionId] = transport
            }

            return // Already handled
        } else {
          // Invalid request - no session ID or not initialization request
          res.status(400).json({
            jsonrpc: '2.0',
            error: {
                code: -32000,
                message: 'Bad Request: No valid session ID provided',
            },
            id: null
          })
          return
        }

        // Handle the request with existing transport - no need to reconnect
        await transport.handleRequest(req, res, req.body)
    } catch (error) {
        console.error('Error handling MCP request:', error)
        if(!res.headersSent) {
            res.status(500).json({
                jsonrpc: '2.0',
                error: {
                    code: -32603,
                    message: 'Internal server error',
                },
                id: null
            })
        }
    }
})

// /api/v1/shop/valuation
app.get('/api/v1/shop/valuation', validateParam('location'), validateCoordinate('location'), async (req: Request, res: Response) => {
    console.log('/api/v1/shop/valuation recevice reqeust: ', req.coordinate)

    const data: shopValuationResp = {
        footTraffic: 1,
        rent: 15000,
        nearbyPeopleDesc: '主要人群为25-40岁白领，职业包括金融、IT、咨询等行业，消费能力较强。',
        trafficDistance: 300,
        commercialZoneDistance: 1500,
        nearbyServices: [0, 1, 2],
        score: 8
    }

    res.status(200).json(genNormalResp(data))
})

// Helper function to detect initialize requests
function isInitializeRequest(body: unknown): boolean {
  if (Array.isArray(body)) {
    return body.some(msg => typeof msg === 'object' && msg !== null && 'method' in msg && msg.method === 'initialize');
  }
  return typeof body === 'object' && body !== null && 'method' in body && body.method === 'initialize';
}

// Start the server
const PORT = 3001
app.listen(PORT, ()=> {
    console.log(`MCP Streamable HTTP Server listening on port ${PORT}`)
})

// Handle server shutdown
process.on('SIGINT', async () =>{
    console.log('Shutting down server...');
    await server.close();
    process.exit(0);
})

