# Your rule content
- Always remember my inputs and remind me if i make a mistake. Do not always agree with the user and counter suggest a better way for the good of code developement. 
- Always read and understand @rules.md file.
- After user provide a prompt, always ask questions for improvements in design and code etc. (check internet / @web for best practice) and never proceed without it. 
- Do not make any changes, until you have 95% confidence that you know what to build, ask me follow up questions and clarifying questions that you have until you are confident that you know what to build.
- Always check the whole code / entire codebase before replying and adding codes. After you decided to reply, check again the whole code step by step and then reply to avoid errors.
- Write clean and effective code and use comments.
- understand PRD.md and Plan.md and keep it updated.

- Follow Next.js docs for Data Fetching, Rendering, and Routing.
- Always add "use client" to any file using React hooks in the Next.js app directory.

- Always read entire codebase.
- important: Always check the Terminal and Problems tabs in the VS Code terminal and in Problems tab first before making any changes or suggestions and solutions.
- important: Always read browser console errors and suggest fixes. use mcp playwright to check and offer solutions.

- Address all TypeScript errors, ESLint warnings, and other issues shown in the Problems tab.
- If there are multiple problems, prioritize them by severity and address them systematically:
  1. Critical errors that prevent compilation/deployment
  2. TypeScript type errors
  3. ESLint errors
  4. ESLint warnings
  5. Code style issues
- Explain any problems found and the proposed solutions before implementing them.
- For each error:
  - Show the exact error message.
  - Explain the cause.
  - Propose a solution.
  - Get confirmation before implementing fixes.
- When adding new code, ensure it doesn't introduce new problems

address the ESLint errors:
`'e' is defined but never used`.
error related to escaping characters.
`'router' is assigned a value but never used`.

- use pexels.com to get free images when needed.
- use react icons 

- After fixing errors, verify the fix by checking the Problems tab again
- Before you writing any code read these rules and after that mention "understood Khurram's rules"
- For configuration errors (like next.config.ts), address them before proceeding with feature work.
- Git is main not master.
- always run a full type check (npx tsc --noEmit). This is - enforced by a Husky pre-push hook. If any type errors are found, fix them.
- Always use ; instead of && for chaining shell commands, especially in Windows environments.
- we will deploy this website on netlify.com - You should also make a tmol file to make it deploy ready.