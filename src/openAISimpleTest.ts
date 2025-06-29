/**
 * 使用openai框架与LLM交互
 */
import OpenAI from "openai";
import 'dotenv/config';

async function main() {
    const openai = new OpenAI({
        baseURL: process.env.OPENROUTER_BASE_URL,
        apiKey: process.env.OPENROUTER_API_KEY,
    });

    const completion = await openai.chat.completions.create({
        messages: [{ role: "user", content: "你是什么模型？" }],
        // messages: [
        //     {
        //         "role": "user",
        //         "content": [
        //             {
        //                 "type": "text",
        //                 "text": "这个图片描述了什么?"
        //             },
        //             {
        //                 "type": "image_url",
        //                 "image_url": {
        //                     "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/2560px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg"
        //                 }
        //             }
        //         ]
        //     }
        // ],
        model: "openai/gpt-4.1",
    });

    console.log(completion.choices[0].message.content);
}

main();