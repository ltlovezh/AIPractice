// 使用LangChain与LLM交互的Hello World示例
import 'dotenv/config';
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage } from "@langchain/core/messages";

async function main() {
  // 定义要使用的模型类型: 'qwen', 'deepseek' 或 'doubao'
  const modelType = process.env.MODEL_TYPE || 'qwen'; // 默认为qwen，可以通过环境变量MODEL_TYPE指定

  let modelName, openAIApiKey, baseURL;

  if (modelType === 'qwen') {
    modelName = "qwen-plus";
    openAIApiKey = process.env.QWEN_API_KEY;
    baseURL = process.env.QWEN_BASE_URL;
    console.log("使用Qwen模型");
  } else if (modelType === 'deepseek') {
    modelName = "deepseek-chat"; // deepseek-chat(DeepSeek-V3) or deepseek-reasoner(DeepSeek-R1)
    openAIApiKey = process.env.DEEPSEEK_API_KEY;
    baseURL = process.env.DEEPSEEK_BASE_URL;
    console.log("使用Deepseek模型");
  } else if (modelType === 'doubao') {
    modelName = "doubao-1-5-thinking-pro-250415"; // 豆包模型
    openAIApiKey = process.env.DOUBAO_API_KEY;
    baseURL = process.env.DOUBAO_BASE_URL;
    console.log("使用豆包模型");
  } else if (modelType === 'OpenRouter') {
    modelName = "google/gemini-2.5-pro"; 
    openAIApiKey = process.env.OPENROUTER_API_KEY;
    baseURL = process.env.OPENROUTER_BASE_URL;
    console.log("使用OpenRouter");
  } else {
    console.error("无效的模型类型指定. 请在 .env 文件中设置 MODEL_TYPE 为 'qwen', 'deepseek','doubao'或'OpenRouter'.");
    return;
  }

  if (!openAIApiKey || !baseURL) {
    console.error(`请确保为模型 ${modelType} 配置了 API_KEY 和 BASE_URL (例如 ${modelType.toUpperCase()}_API_KEY 和 ${modelType.toUpperCase()}_BASE_URL)`);
    return;
  }

  // 初始化OpenAI聊天模型
  const model = new ChatOpenAI({
    modelName: modelName,
    temperature: 0.7,
    openAIApiKey: openAIApiKey,
    configuration: {
      baseURL: baseURL
    }
  });

  try {
    // 定义用户消息
    // const userMessage = new HumanMessage("Hello World!");
    const userMessage = new HumanMessage("你是什么模型？");
    console.log(`User: ${userMessage.content}`);
    
    // 调用模型获取响应
    const response = await model.invoke([userMessage]);
    
    // 处理并输出响应
    console.log(`LLM Response: ${response.content}`);
  } catch (error) {
    console.error("Error in LLM interaction:", error);
  }
}

main();