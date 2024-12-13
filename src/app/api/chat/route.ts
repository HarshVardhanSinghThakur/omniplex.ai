import Groq from "groq-sdk";
import { StreamingTextResponse } from "ai"; 

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export const runtime = "edge";

export async function POST(req: Request) {
  const {
    messages,
    model = "llama3-8b-8192",  
    temperature,
    max_tokens,
    top_p,
    frequency_penalty,
    presence_penalty,
  } = await req.json();

  try {
    const response = await groq.chat.completions.create({
      model: model,  
      temperature: temperature,
      max_tokens: max_tokens,
      top_p: top_p,
      frequency_penalty: frequency_penalty,
      presence_penalty: presence_penalty,
      messages: messages,
      stream: true, // Enable streaming
    });

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of response) {
            if (chunk.choices[0]?.delta?.content) {
              controller.enqueue(
                new TextEncoder().encode(chunk.choices[0].delta.content)
              );
            }
          }
          controller.close();
        } catch (error) {
          console.error("Error during streaming:", error);
          controller.error(error);
        }
      },
    });

    return new StreamingTextResponse(stream);

  } catch (error) {
    console.error("Error during Groq API call:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process the input", details: error }),
      { status: 500 }
    );
  }
}