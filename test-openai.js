import fs from "fs";

async function test() {
  const envFile = fs.readFileSync(".env", "utf8");
  const apiKeyLine = envFile.split("\n").find(line => line.startsWith("OPENAI_API_KEY="));
  const apiKey = apiKeyLine ? apiKeyLine.split("=")[1].trim() : null;

  if (!apiKey) {
    console.error("No OPENAI_API_KEY found");
    return;
  }
  
  const payload = {
    model: "gpt-image-2.5-sunburst",
    prompt: "A red apple",
    n: 1,
    size: "1024x1024",
    response_format: "url"
  };

  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify(payload)
  });

  const text = await response.text();
  console.log("Status:", response.status);
  console.log("Response:", text);
}
test();
