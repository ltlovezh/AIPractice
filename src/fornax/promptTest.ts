import 'dotenv/config';
import { fornaxPromptHub, DRAFT_VERSION, ptaas } from '@next-ai/fornax-sdk/components';


const promptKey = 'leon.ai.engineer';
const promptVersion = '0.0.2';

async function testPrompt() {
    const hub = fornaxPromptHub({
        ak: process.env.FORNAX_AK || '',
        sk: process.env.FORNAX_SK || '',
        region: 'CN',
        serviceMeta: {
            ztiToken: process.env.FORNAX_SEC_TOKEN_STRING
        }
    });
    // 预加载 Prompt（可选，不影响后续直接获取）
    await hub.preload({ key: promptKey, version: promptVersion });

    // 获取 Prompt & 插值
    const prompt = await hub.get({
        key: promptKey,
        // version: DRAFT_VERSION,
        version: promptVersion,
    });

    console.log(prompt?.system);
}

async function testPTaaS() {
    const model = ptaas(promptKey, {
        // Fornax 鉴权配置，⚠️ 需要与 Prompt Key 对应
        ak: process.env.FORNAX_AK || '',
        sk: process.env.FORNAX_SK || '',
        region: 'CN',
        serviceMeta: {
            ztiToken: process.env.FORNAX_SEC_TOKEN_STRING
        }
    });

    // 非流式调用
    const { choices } = await model.invoke({
        // 消息上下文
        messages: [{ role: 'user', content: '请介绍下自己' }],
        // 运行时模型配置
        modelConfigs: {
            version: promptVersion,
        },
    });
    console.log(choices[0]?.message?.content);

    // 流式调用
    // const { fullStream } = await model.stream({
    //     // 消息上下文
    //     messages: [{ role: 'user', content: '你是干啥的' }],
    //     // 运行时模型配置
    //     modelConfigs: {
    //         version: promptVersion,
    //     },
    // });

    // // for-await 遍历流
    // for await (const chunk of fullStream) {
    //     console.info(chunk.choices[0]?.message?.content);
    // }
}

// testPrompt();

testPTaaS();