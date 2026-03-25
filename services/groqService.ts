/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import Groq from 'groq-sdk';

// This check is for development-time feedback.
if (!import.meta.env.VITE_GROQ_API_KEY) {
  console.error(
    'VITE_GROQ_API_KEY environment variable is not set. The application will not be able to connect to the Groq API.',
  );
}

// Initialize Groq client
const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY || 'dummy-key',
  dangerouslyAllowBrowser: true, // Required for browser usage
});

const artModelName = 'llama-3.3-70b-versatile';
const textModelName = 'llama-3.3-70b-versatile';

// Development mode flag - set to true to use mock data instead of API
const USE_MOCK_DATA = import.meta.env.DEV;

// Rate limiting: global request queue to prevent concurrent requests
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 2000; // 2 seconds between requests to prevent rate limiting
let isRequestInProgress = false;
const requestQueue: Array<() => Promise<any>> = [];

async function processQueue() {
  if (isRequestInProgress || requestQueue.length === 0) {
    return;
  }
  
  isRequestInProgress = true;
  const request = requestQueue.shift();
  
  try {
    await request?.();
  } finally {
    isRequestInProgress = false;
    // Process next request after a delay
    setTimeout(() => processQueue(), 500);
  }
}

async function queueRequest<T>(requestFn: () => Promise<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    requestQueue.push(async () => {
      try {
        const result = await requestFn();
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
    processQueue();
  });
}

async function rateLimitDelay() {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    const delayTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
    await new Promise(resolve => setTimeout(resolve, delayTime));
  }
  lastRequestTime = Date.now();
}

// Mock data functions for development
const mockDefinitions: Record<string, string> = {
  "hypertext": "Hypertext is text displayed on a computer or other electronic device with references (hyperlinks) to other text that the reader can immediately access.",
  "algorithm": "An algorithm is a finite sequence of well-defined, computer-implementable instructions, typically to solve a specific class of problems or to perform a computation.",
  "database": "A database is an organized collection of structured information, or data, typically stored electronically in a computer system.",
  "default": "A comprehensive encyclopedia entry covering the definition, history, applications, and significance of this concept in modern technology and society."
};

const mockAsciiArt: Record<string, string> = {
  "hypertext": "╔════════════════════════╗\n║   ⟹ HYPERTEXT ⟹      ║\n║  ╔═════════════════╗  ║\n║  ║ Link → Link →   ║  ║\n║  ╚═════════════════╝  ║\n║    ↓ Click ↓ Navigate   ║\n╚════════════════════════╝",
  "algorithm": "╔══════════════════════╗\n║   ◄ ALGORITHM ►    ║\n║  ┌─┐  ┌─┐  ┌─┐     ║\n║  │1│→│2│→│3│→...  ║\n║  └─┘  └─┘  └─┘     ║\n║    Step → Step →     ║\n╚══════════════════════╝",
  "database": "╔══════════════════════╗\n║  ◄ DATABASE ►       ║\n║  ┌─────┬─────┬─────┐ ║\n║  │ Row │ Row │ Row │ ║\n║  ├─────┼─────┼─────┤ ║\n║  │Data │Data │Data │ ║\n║  └─────┴─────┴─────┘ ║\n╚══════════════════════╝",
  "default": "╔══════════════════════╗\n║   ◄ CONCEPT ►       ║\n║  ╔═══════════════╗  ║\n║  ║   Definition   ║  ║\n║  ╚═══════════════╝  ║\n║     ╔═════════╗     ║\n║     ║ Context ║     ║\n║     ╚═════════╝     ║\n╚══════════════════════╝"
};

const mockWords = [
  "Quantum Computing", "Machine Learning", "Blockchain", "Neural Network",
  "Artificial Intelligence", "Cloud Computing", "Cybersecurity", "Data Science",
  "Internet of Things", "Virtual Reality", "Augmented Reality", "Big Data"
];

async function* mockStreamDefinition(topic: string): AsyncGenerator<string, void, undefined> {
  const definition = mockDefinitions[topic.toLowerCase()] || mockDefinitions.default;
  const words = definition.split(' ');
  
  for (let i = 0; i < words.length; i++) {
    yield words[i] + (i < words.length - 1 ? ' ' : '');
    await new Promise(resolve => setTimeout(resolve, 50)); // Simulate streaming delay
  }
}

async function mockGenerateAsciiArt(topic: string): Promise<AsciiArtData> {
  await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay
  const art = mockAsciiArt[topic.toLowerCase()] || mockAsciiArt.default;
  return { art };
}

async function mockGetRandomWord(): Promise<string> {
  await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay
  return mockWords[Math.floor(Math.random() * mockWords.length)];
}

export interface AsciiArtData {
  art: string;
  text?: string; // Text is now optional
}

/**
 * Streams a definition for a given topic from the Groq API.
 * @param topic The word or term to define.
 * @returns An async generator that yields text chunks of the definition.
 */
export async function* streamDefinition(
  topic: string,
): AsyncGenerator<string, void, undefined> {
  // Use mock data in development mode
  if (USE_MOCK_DATA) {
    yield* mockStreamDefinition(topic);
    return;
  }

  if (!import.meta.env.VITE_GROQ_API_KEY) {
    yield 'Error: VITE_GROQ_API_KEY is not configured. Please check your environment variables to continue.';
    return;
  }

  const prompt = `Provide a concise, single-paragraph encyclopedia-style definition for the term: "${topic}". Be informative and neutral. Do not use markdown, titles, or any special formatting. Respond with only the text of the definition itself.`;

  const maxRetries = 3;
  const baseDelay = 5000; // Start with 5 second delay for rate limits
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Use the request queue to prevent concurrent requests
      const stream = await queueRequest(async () => {
        await rateLimitDelay();
        
        const stream = await groq.chat.completions.create({
          model: textModelName,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          stream: true,
          max_tokens: 500,
          temperature: 0.7
        });

        return stream;
      });

      for await (const chunk of stream) {
        if (chunk.choices && chunk.choices[0]?.delta?.content) {
          yield chunk.choices[0].delta.content;
        }
      }
      return; // Success, exit the retry loop

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.warn(`Attempt ${attempt}/${maxRetries} failed in streamDefinition:`, errorMessage);

      if (attempt === maxRetries) {
        console.error('All retry attempts failed for stream definition');
        yield `Error: Could not generate content for "${topic}". ${errorMessage}`;
        throw new Error(errorMessage);
      }
      
      // Check for rate limit errors
      if (errorMessage.includes('rate_limit') || errorMessage.includes('429')) {
        const delay = baseDelay * attempt; // Exponential backoff
        console.warn(`Rate limit hit in streamDefinition, waiting ${delay}ms before retry ${attempt}/${maxRetries}`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        // For non-rate limit errors, wait a bit before retrying
        await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
      }
    }
  }
}

/**
 * Generates a single random word or concept using the Groq API.
 * @returns A promise that resolves to a single random word.
 */
export async function getRandomWord(): Promise<string> {
  // Use mock data in development mode
  if (USE_MOCK_DATA) {
    return mockGetRandomWord();
  }

  if (!import.meta.env.VITE_GROQ_API_KEY) {
    throw new Error('VITE_GROQ_API_KEY is not configured.');
  }

  const prompt = `Generate a single, random, interesting English word or a two-word concept. It can be a noun, verb, adjective, or a proper noun. Respond with only the word or concept itself, with no extra text, punctuation, or formatting.`;

  const maxRetries = 3;
  const baseDelay = 5000; // Start with 5 second delay for rate limits
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Use the request queue to prevent concurrent requests
      const response = await queueRequest(async () => {
        await rateLimitDelay();

        const response = await groq.chat.completions.create({
          model: textModelName,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 50,
          temperature: 0.9
        });

        return response;
      });

      return response.choices[0].message.content?.trim() || '';

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.warn(`Attempt ${attempt}/${maxRetries} failed in getRandomWord:`, errorMessage);

      if (attempt === maxRetries) {
        console.error('All retry attempts failed for random word generation');
        throw new Error(`Could not get random word: ${errorMessage}`);
      }
      
      // Check for rate limit errors
      if (errorMessage.includes('rate_limit') || errorMessage.includes('429')) {
        const delay = baseDelay * attempt; // Exponential backoff
        console.warn(`Rate limit hit in getRandomWord, waiting ${delay}ms before retry ${attempt}/${maxRetries}`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        // For non-rate limit errors, wait a bit before retrying
        await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
      }
    }
  }

  throw new Error('All retry attempts failed');
}

/**
 * Generates ASCII art and optionally text for a given topic.
 * @param topic The topic to generate art for.
 * @returns A promise that resolves to an object with art and optional text.
 */
export async function generateAsciiArt(topic: string): Promise<AsciiArtData> {
  // Use mock data in development mode
  if (USE_MOCK_DATA) {
    return mockGenerateAsciiArt(topic);
  }

  if (!import.meta.env.VITE_GROQ_API_KEY) {
    throw new Error('VITE_GROQ_API_KEY is not configured.');
  }

  const prompt = `Create a meta ASCII visualization for the word "${topic}".
- The shape of the art should mirror the concept of the word. For example, "explosion" might look like lines radiating from a center, and "hierarchy" might be a pyramid.
- Use a palette of ASCII and box-drawing characters like: │─┌┐└┘├┤┬┴┼►◄▲▼○●◐◑░▒▓█▀▄■□▪▫★☆♦♠♣♥⟨⟩/\\_|.
- The art should be a single string with '\\n' for line breaks.
- Respond with only the ASCII art, no other text or formatting.`;

  const maxRetries = 3;
  const baseDelay = 5000; // Start with 5 second delay for rate limits
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Use the request queue to prevent concurrent requests
      const response = await queueRequest(async () => {
        await rateLimitDelay();

        const response = await groq.chat.completions.create({
          model: artModelName,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 800,
          temperature: 0.8
        });

        return response;
      });

      const artText = response.choices[0].message.content?.trim() || '';

      console.log(`Attempt ${attempt}/${maxRetries} - Raw API response:`, artText);

      // Validate the response
      if (typeof artText !== 'string' || artText.trim().length === 0) {
        throw new Error('Invalid or empty ASCII art in response');
      }

      return { art: artText };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.warn(`Attempt ${attempt}/${maxRetries} failed in generateAsciiArt:`, errorMessage);

      if (attempt === maxRetries) {
        console.error('All retry attempts failed for ASCII art generation');
        throw new Error(`Could not generate ASCII art after ${maxRetries} attempts: ${errorMessage}`);
      }
      
      // Check for rate limit errors
      if (errorMessage.includes('rate_limit') || errorMessage.includes('429')) {
        const delay = baseDelay * attempt; // Exponential backoff
        console.warn(`Rate limit hit in generateAsciiArt, waiting ${delay}ms before retry ${attempt}/${maxRetries}`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        // For non-rate limit errors, wait a bit before retrying
        await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
      }
    }
  }

  throw new Error('All retry attempts failed');
}
