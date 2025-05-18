// 导入必要的模块
import 'dotenv/config';
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, AIMessage, ToolMessage } from "@langchain/core/messages";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";

// 定义天气查询工具的参数Schema
const weatherSchema = z.object({
  location: z.string().describe("城市名称，例如北京、上海"),
  unit: z.enum(["celsius", "fahrenheit"]).optional().describe("温度单位，默认为摄氏度")
});

// 定义参数类型
type WeatherParams = z.infer<typeof weatherSchema>;

// 创建天气工具
const getCurrentWeatherTool = new DynamicStructuredTool({
  name: "getCurrentWeather",
  description: "获取指定位置的当前天气信息",
  schema: weatherSchema,
  func: async ({ location, unit = "celsius" }: WeatherParams) => {
    // 这是一个模拟函数，实际应用中会调用天气API
    console.log(`正在为 ${location} 获取天气信息...`);
    if (location.toLowerCase().includes("beijing")) {
      return JSON.stringify({ location: "Beijing", temperature: "10", unit, forecast: "sunny" });
    } else if (location.toLowerCase().includes("shanghai")) {
      return JSON.stringify({ location: "Shanghai", temperature: "12", unit, forecast: "cloudy" });
    } else {
      return JSON.stringify({ location, temperature: "unknown", unit, forecast: "unknown" });
    }
  }
});

async function main() {
  const modelType = process.env.MODEL_TYPE || 'qwen'; // 默认为qwen
  let modelName, openAIApiKey, baseURL;

  // 根据模型类型设置API密钥和基础URL (与index.ts类似)
  if (modelType === 'qwen') {
    modelName = "qwen-plus";
    openAIApiKey = process.env.QWEN_API_KEY;
    baseURL = process.env.QWEN_BASE_URL;
    console.log("使用Qwen模型进行函数调用");
  } else if (modelType === 'deepseek') {
    modelName = "deepseek-chat";
    openAIApiKey = process.env.DEEPSEEK_API_KEY;
    baseURL = process.env.DEEPSEEK_BASE_URL;
    console.log("使用Deepseek模型进行函数调用");
  } else if (modelType === 'doubao') {
    modelName = "doubao-1-5-thinking-pro-250415";
    openAIApiKey = process.env.DOUBAO_API_KEY; 
    baseURL = process.env.DOUBAO_BASE_URL; 
    console.log("使用豆包模型进行函数调用");
  } else {
    console.error("无效的模型类型指定. 请在 .env 文件中设置 MODEL_TYPE 为 'qwen', 'deepseek' 或 'doubao'.");
    return;
  }

  if (!openAIApiKey || !baseURL) {
    console.error(`请确保为模型 ${modelType} 配置了 API_KEY 和 BASE_URL`);
    return;
  }

  // 初始化聊天模型
  const baseModel = new ChatOpenAI({
    modelName: modelName,
    temperature: 0,
    openAIApiKey: openAIApiKey,
    configuration: {
      baseURL: baseURL
    }
  });
  
  // 使用bindTools方法绑定工具
  const model = baseModel.bindTools([getCurrentWeatherTool]);
  // 可选: 指定工具选择策略
  // const model = baseModel.bindTools([getCurrentWeatherTool], { toolChoice: "auto" });

  try {
    const userInput = "What's the weather like in Beijing?";
    console.log(`用户: ${userInput}`);
    
    // 第一次调用，LLM可能会返回一个工具调用请求
    const first_response = await model.invoke([new HumanMessage(userInput)]);
    console.log("LLM 首次响应:", first_response);

    // 检查LLM是否请求调用工具
    if (first_response.tool_calls && first_response.tool_calls.length > 0) {
      const toolCalls = first_response.tool_calls;
      const toolMessages: ToolMessage[] = [];

      for (const toolCall of toolCalls) {
        const functionName = toolCall.name;
        const functionArgs = toolCall.args;
        const toolCallId = toolCall.id;

        // 确保 toolCallId 是一个字符串
        if (typeof toolCallId !== 'string') {
          console.warn(`Tool call for function ${functionName} (args: ${JSON.stringify(functionArgs)}) is missing a valid ID. Skipping this tool call.`);
          continue;
        }

        if (functionName === "getCurrentWeather") {
          console.log(`LLM 请求调用工具: ${functionName} (ID: ${toolCallId}) 参数:`, functionArgs);
          
          // 调用工具函数，使用正确的类型转换
          const weatherData = await getCurrentWeatherTool.invoke(functionArgs as WeatherParams);
          console.log(`模拟函数返回: ${weatherData}`);

          toolMessages.push(new ToolMessage({
            tool_call_id: toolCallId,
            content: weatherData, // weatherData已经是字符串了，因为我们在工具函数中使用了JSON.stringify
          }));
        } else {
          console.log(`LLM请求调用未知工具: ${functionName}`);
          toolMessages.push(new ToolMessage({
            tool_call_id: toolCallId,
            content: `Error: Unknown tool ${functionName}`,
          }));
        }
      }

      // 将工具执行结果返回给LLM
      console.log("向LLM发送工具结果:", toolMessages.map(tm => ({id: tm.tool_call_id, content: tm.content })));
      const final_response = await model.invoke([
        new HumanMessage(userInput),
        first_response,
        ...toolMessages
      ]);
      console.log(`LLM 基于工具结果的最终响应: ${final_response.content}`);

    } else {
      // 如果LLM没有请求工具调用，直接输出其回复
      console.log(`LLM 最终响应: ${first_response.content}`);
    }

  } catch (error) {
    console.error("与LLM交互时发生错误:", error);
  }
}

main();