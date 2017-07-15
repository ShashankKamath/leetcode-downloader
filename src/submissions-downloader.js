const axios = require('axios');
const fs = require('fs');

const cookie = require('./config.json').cookie;
if (!cookie) {
    console.error('Please provide your cookie in "config.json"!');
    process.exit();
}
const requestParams = {
    method: 'get',
    headers: {
        Cookie: cookie,
    },
};

const dataPath = '../data';

const submissions = require('./submissions.json');
const codeRegex = /submissionCode: '(.*)',\n  editCodeUrl/;
const extensionsMap = {
    cpp: 'cpp',
    java: 'java',
    python: 'py',
    python3: 'py',
    c: 'c',
    csharp: 'cs',
    javascript: 'js',
    ruby: 'rb',
    swift: 'swift',
    golang: 'go',
    scala: 'scala',
    mysql: 'sql',
};

console.log(`Downloading ${submissions.length} submissions`);
if (!fs.existsSync(dataPath)) {
    fs.mkdirSync(dataPath);
}
submissions.forEach(submission => {
    axios.request(Object.assign(requestParams, {
        url: `https://leetcode.com${submission.url}`,
    })).then(response => {
        // Pad ID to 4 digits.
        let idStr = submission.id.toString();
        const num = idStr.length
        for (let i = 0; i < 4 - num; i++) {
            idStr = '0' + idStr;
        }

        const body = response.data;
        const matches = body.match(codeRegex);
        const code = matches[1].replace(/\\u[\dA-F]{4}/gi, (match) => {
            return String.fromCharCode(parseInt(match.replace(/\\u/g, ''), 16));
        }) + '\n';
        const filename = `${idStr}-${submission.slug}.${extensionsMap[submission.language]}`;
        fs.writeFileSync(dataPath + '/' + filename, code);
        console.log('Downloaded', filename);
    });
});

setTimeout(() => {
    console.log('\nLeetCode servers may have failed to give a response. Try killing the process and running the command again.')
}, 15000);
