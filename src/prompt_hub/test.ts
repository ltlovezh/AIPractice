import 'dotenv/config';
const userQuestion = "目前最流行的Web开发框架是什么？";

async function getPrompt() {
    fetch('https://app.prompthub.us/api/v1/projects/17974/head?branch=master', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${process.env.PROMPTHUB_API_KEY}`
        }
    }).then(res => res.json())
        .then(res => console.log(res));
}


async function runPrompt() {
    fetch('https://app.prompthub.us/api/v1/projects/17974/run', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${process.env.PROMPTHUB_API_KEY}`
        },
        body: JSON.stringify({
            variables: {
                'user_question': userQuestion
            }
        })
    })
        .then(res => res.json())
        .then(res => console.log(res));
}

getPrompt()
// runPrompt()