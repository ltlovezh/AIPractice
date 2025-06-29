import 'dotenv/config';

const userQuestion = "目前最流行的Web开发框架是什么？";

async function getPrompt() {
    const options = {
        method: 'POST',
        headers: {
            'X-API-KEY': `${process.env.PROMPTLAYER_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: `{"input_variables":{"question":"${userQuestion}"}}`
    };

    fetch('https://api.promptlayer.com/prompt-templates/Full%20Stack%20Engineer', options)
        .then(response => response.json())
        .then(response => console.log(response))
        .catch(err => console.error(err));
}

getPrompt()