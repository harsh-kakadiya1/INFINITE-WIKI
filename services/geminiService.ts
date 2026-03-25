/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import OpenAI from 'openai';

// This check is for development-time feedback.
if (!import.meta.env.VITE_ZAI_API_KEY) {
  console.error(
    'VITE_ZAI_API_KEY environment variable is not set. The application will not be able to connect to the Z.ai API.',
  );
}

// Initialize OpenAI client with Z.ai endpoint
const client = new OpenAI({
  apiKey: import.meta.env.VITE_ZAI_API_KEY || 'dummy-key',
  baseURL: 'https://api.z.ai/api/paas/v4',
  dangerouslyAllowBrowser: true, // Required for browser usage
  defaultHeaders: {
    'Authorization': `Bearer ${import.meta.env.VITE_ZAI_API_KEY}`
  }
});
const artModelName = 'glm-4-flash';
const textModelName = 'glm-4-flash';
/**
 * Art-direction toggle for ASCII art generation.
 * `true`: Slower, higher-quality results (allows the model to "think").
 * `false`: Faster, potentially lower-quality results (skips thinking).
 */
const ENABLE_THINKING_FOR_ASCII_ART = false;

export interface AsciiArtData {
  art: string;
  text?: string; // Text is now optional
}

/**
 * Streams a definition for a given topic from the Gemini API.
 * @param topic The word or term to define.
 * @returns An async generator that yields text chunks of the definition.
 */
export async function* streamDefinition(
  topic: string,
): AsyncGenerator<string, void, undefined> {
  if (!import.meta.env.VITE_ZAI_API_KEY) {
    yield 'Error: VITE_ZAI_API_KEY is not configured. Please check your environment variables to continue.';
    return;
  }

  const prompt = `Provide a concise, single-paragraph encyclopedia-style definition for the term: "${topic}". Be informative and neutral. Do not use markdown, titles, or any special formatting. Respond with only the text of the definition itself.`;

  try {
    const stream = await client.chat.completions.create({
      model: textModelName,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      stream: true
    });

    for await (const chunk of stream) {
      if (chunk.choices && chunk.choices[0]?.delta?.content) {
        yield chunk.choices[0].delta.content;
      }
    }
  } catch (error) {
    console.error('Error streaming from Z.ai:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred.';
    yield `Error: Could not generate content for "${topic}". ${errorMessage}`;
    throw new Error(errorMessage);
  }
}

/**
 * Generates a single random word or concept using the Gemini API.
 * @returns A promise that resolves to a single random word.
 */
export async function getRandomWord(): Promise<string> {
  if (!import.meta.env.VITE_ZAI_API_KEY) {
    throw new Error('VITE_ZAI_API_KEY is not configured.');
  }

  const prompt = `Generate a single, random, interesting English word or a two-word concept. It can be a noun, verb, adjective, or a proper noun. Respond with only the word or concept itself, with no extra text, punctuation, or formatting.`;

  try {
    const response = await client.chat.completions.create({
      model: textModelName,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });
    
    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error getting random word from Z.ai:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred.';
    throw new Error(`Could not get random word: ${errorMessage}`);
  }
}

/**
 * Generates ASCII art and optionally text for a given topic.
 * @param topic The topic to generate art for.
 * @returns A promise that resolves to an object with art and optional text.
 */
export async function generateAsciiArt(topic: string): Promise<AsciiArtData> {
  if (!import.meta.env.VITE_ZAI_API_KEY) {
    throw new Error('VITE_ZAI_API_KEY is not configured.');
  }

  const prompt = `Create a meta ASCII visualization for the word "${topic}".
- The shape of the art should mirror the concept of the word. For example, "explosion" might look like lines radiating from a center, and "hierarchy" might be a pyramid.
- Use a palette of ASCII and box-drawing characters like: │─┌┐└┘├┤┬┴┼►◄▲▼○●◐◑░▒▓█▀▄■□▪▫★☆♦♠♣♥⟨⟩/\\_|.
- The art should be a single string with '\\n' for line breaks.
- Respond with only the ASCII art, no other text or formatting.`;

  const maxRetries = 2;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await client.chat.completions.create({
        model: artModelName,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      const artText = response.choices[0].message.content.trim();

      console.log(`Attempt ${attempt}/${maxRetries} - Raw API response:`, artText);

      // Validate the response
      if (typeof artText !== 'string' || artText.trim().length === 0) {
        throw new Error('Invalid or empty ASCII art in response');
      }

      return { art: artText };

    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error occurred');
      console.warn(`Attempt ${attempt}/${maxRetries} failed:`, lastError.message);

      if (attempt === maxRetries) {
        console.error('All retry attempts failed for ASCII art generation');
        throw new Error(`Could not generate ASCII art after ${maxRetries} attempts: ${lastError.message}`);
      }
    }
  }

  throw lastError || new Error('All retry attempts failed');
}
