import Groq from "groq-sdk";
import { StreamingTextResponse } from "ai"; // Assuming this can handle your response correctly

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export const runtime = "edge";

export async function POST(req: Request) {
  const {
    messages,
    model = "llama3-8b-8192",  // Default model if not provided
    temperature,
    max_tokens,
    top_p,
    frequency_penalty,
    presence_penalty,
  } = await req.json();

  try {
    const response = await groq.chat.completions.create({
      model: model,  // Ensure this model name is available in Groq
      temperature: temperature,
      max_tokens: max_tokens,
      top_p: top_p,
      frequency_penalty: frequency_penalty,
      presence_penalty: presence_penalty,
      messages: messages,
    });

    // Assuming the response is a single completion, we can directly access the content.
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Extracting the content from the response
          const text = response.choices[0]?.message?.content || '';
          console.log("Received response text:", text);

          // Enqueueing the text into the stream
          controller.enqueue(new TextEncoder().encode(text));
          controller.close();  // Close the stream after the content is enqueued
        } catch (error) {
          console.error("Error during streaming:", error);
          controller.error(error);  // Propagate the error if it occurs
        }
      },
    });

    // Returning the stream wrapped in a StreamingTextResponse
    return new StreamingTextResponse(stream);

  } catch (error) {
    console.error("Error during Groq API call:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process the input", details: error }),
      { status: 500 }
    );
  }
}
