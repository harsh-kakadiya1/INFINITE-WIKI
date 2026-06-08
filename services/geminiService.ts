/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

const GROQ_BASE_URL = 'https://api.groq.com/openai/v1';
const artModelName = 'llama-3.3-70b-versatile';
const textModelName = 'llama-3.3-70b-versatile';

// This check is for development-time feedback.
if (!import.meta.env.VITE_GROQ_API_KEY) {
  console.error(
    'VITE_GROQ_API_KEY environment variable is not set. The application will not be able to connect to the Groq API.',
  );
}

function getHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
  };
}

export interface AsciiArtData {
  art: string;
  text?: string;
}

/**
 * Streams a definition for a given topic from the Groq API.
 * @param topic The word or term to define.
 * @returns An async generator that yields text chunks of the definition.
 */
export async function* streamDefinition(
  topic: string,
): AsyncGenerator<string, void, undefined> {
  if (!import.meta.env.VITE_GROQ_API_KEY) {
    yield 'Error: VITE_GROQ_API_KEY is not configured. Please check your environment variables to continue.';
    return;
  }

  const prompt = `Provide a concise, single-paragraph encyclopedia-style definition for the term: "${topic}". Be informative and neutral. Do not use markdown, titles, or any special formatting. Respond with only the text of the definition itself.`;

  try {
    const response = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        model: textModelName,
        messages: [{ role: 'user', content: prompt }],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Groq API error ${response.status}: ${errText}`);
    }

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const lines = decoder.decode(value, { stream: true }).split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data:')) continue;
        const data = trimmed.slice(5).trim();
        if (data === '[DONE]') return;
        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) yield content;
        } catch {
          // skip malformed chunks
        }
      }
    }
  } catch (error) {
    console.error('Error streaming from Groq:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    yield `Error: Could not generate content for "${topic}". ${errorMessage}`;
    throw new Error(errorMessage);
  }
}

/**
 * Generates a single random word or concept using the Groq API.
 * @returns A promise that resolves to a single random word.
 */
export async function getRandomWord(): Promise<string> {
  if (!import.meta.env.VITE_GROQ_API_KEY) {
    throw new Error('VITE_GROQ_API_KEY is not configured.');
  }

  const prompt = `Generate a single, random, interesting English word or a two-word concept. It can be a noun, verb, adjective, or a proper noun. Respond with only the word or concept itself, with no extra text, punctuation, or formatting.`;

  const response = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      model: textModelName,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Groq API error ${response.status}: ${errText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content.trim();
}

/**
 * Generates ASCII art for a given topic using the Groq API.
 * @param topic The topic to generate art for.
 * @returns A promise that resolves to an object with art.
 */
export async function generateAsciiArt(topic: string): Promise<AsciiArtData> {
  if (!import.meta.env.VITE_GROQ_API_KEY) {
    throw new Error('VITE_GROQ_API_KEY is not configured.');
  }

  const prompt = `Create a meta ASCII visualization for the word "${topic}".
- The shape of the art should mirror the concept of the word. For example, "explosion" might look like lines radiating from a center, and "hierarchy" might be a pyramid.
- Use a palette of ASCII and box-drawing characters like: │─┌┐└┘├┤┬┴┼►◄▲▼○●◐◑░▒▓█▀▄■□▪▫★☆♦♠♣♥⟨⟩/\\_|.
- The art should be a single string with '\\n' for line breaks.
- Respond with only the ASCII art, no other text or formatting.`;

  const maxRetries = 2;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          model: artModelName,
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Groq API error ${response.status}: ${errText}`);
      }

      const data = await response.json();
      const artText = data.choices[0].message.content.trim();

      console.log(`Attempt ${attempt}/${maxRetries} - Raw API response:`, artText);

      if (!artText) throw new Error('Invalid or empty ASCII art in response');

      return { art: artText };
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      console.warn(`Attempt ${attempt}/${maxRetries} failed:`, msg);
      if (attempt === maxRetries) {
        throw new Error(`Could not generate ASCII art after ${maxRetries} attempts: ${msg}`);
      }
    }
  }

  throw new Error('All retry attempts failed');
}
