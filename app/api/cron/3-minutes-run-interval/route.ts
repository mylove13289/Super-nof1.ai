import { run } from "@/lib/ai/run";
import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

// 设置API路由的最大执行时间为15分钟（900秒）
// 注意：如果部署到Vercel，免费版最多10秒，Pro版最多300秒
export const maxDuration = 900; // 15分钟
export const dynamic = 'force-dynamic'; // 强制动态渲染

export const GET = async (request: NextRequest) => {
  // Extract token from query parameters
  const url = new URL(request.url);
  const token = url.searchParams.get("token");

  if (!token) {
    return new Response("Token is required", { status: 400 });
  }

  try {
    jwt.verify(token, process.env.CRON_SECRET_KEY || "");
  } catch (error) {
    return new Response("Invalid token", { status: 401 });
  }

  console.log("🤖 [Cron Job] Starting 3-minutes trading run...");

  try {
    // Run trading bot (auto-detects initial capital from current balance)
    await run();
    console.log("✅ [Cron Job] 3-minutes trading run executed successfully.");
    return new Response("Trading run executed successfully");
  } catch (error) {
    console.error("❌ [Cron Job] Error during 3-minutes trading run:", error);
    return new Response(`Error during trading run: ${(error as Error).message}`, {
      status: 500,
    });
  }
};
