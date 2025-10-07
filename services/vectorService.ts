import { Vector, NoteWithVector, SearchResult, ChatMessage } from '../types';

// A simple list of common English stop words.
const STOP_WORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', "aren't", 'as', 'at',
  'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'can', "can't", 'cannot',
  'could', "couldn't", 'did', "didn't", 'do', 'does', "doesn't", 'doing', "don't", 'down', 'during', 'each', 'few',
  'for', 'from', 'further', 'had', "hadn't", 'has', "hasn't", 'have', "haven't", 'having', 'he', "he'd", "he'll",
  "he's", 'her', 'here', "here's", 'hers', 'herself', 'him', 'himself', 'his', 'how', "how's", 'i', "i'd", "i'll",
  "i'm", "i've", 'if', 'in', 'into', 'is', "isn't", 'it', "it's", 'its', 'itself', "let's", 'me', 'more', 'most',
  "mustn't", 'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'ought', 'our',
  'ours', 'ourselves', 'out', 'over', 'own', 'same', "shan't", 'she', "she'd", "she'll", "she's", 'should',
  "shouldn't", 'so', 'some', 'such', 'than', 'that', "that's", 'the', 'their', 'theirs', 'them', 'themselves',
  'then', 'there', "there's", 'these', 'they', "they'd", "they'll", "they're", "they've", 'this', 'those',
  'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', "wasn't", 'we', "we'd", "we'll", "we're",
  "we've", 'were', "weren't", 'what', "what's", 'when', "when's", 'where', "where's", 'which', 'while', 'who',
  "who's", 'whom', 'why', "why's", 'with', "won't", 'would', "wouldn't", 'you', "you'd", "you'll", "you're",
  "you've", 'your', 'yours', 'yourself', 'yourselves'
]);

function textToTokens(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .split(/\s+/) // Split by whitespace
    .filter(token => token && !STOP_WORDS.has(token)); // Filter out empty tokens and stop words
}

export function createTextVector(text: string): Vector {
  const tokens = textToTokens(text);
  const vector: Vector = new Map();
  for (const token of tokens) {
    vector.set(token, (vector.get(token) || 0) + 1);
  }
  return vector;
}

function dotProduct(vecA: Vector, vecB: Vector): number {
  let product = 0;
  for (const [key, value] of vecA.entries()) {
    if (vecB.has(key)) {
      product += value * (vecB.get(key) || 0);
    }
  }
  return product;
}

function magnitude(vec: Vector): number {
  let sumOfSquares = 0;
  for (const value of vec.values()) {
    sumOfSquares += value * value;
  }
  return Math.sqrt(sumOfSquares);
}

function cosineSimilarity(vecA: Vector, vecB: Vector): number {
  const magA = magnitude(vecA);
  const magB = magnitude(vecB);
  if (magA === 0 || magB === 0) {
    return 0;
  }
  return dotProduct(vecA, vecB) / (magA * magB);
}

export function searchNotes(query: string, notes: NoteWithVector[]): SearchResult[] {
  const queryVector = createTextVector(query);
  if (queryVector.size === 0) {
    return [];
  }

  const results = notes
    .map(note => ({
      note,
      score: cosineSimilarity(queryVector, note.vector),
    }))
    .filter(result => result.score > 0.01) // Filter out very low scores
    .sort((a, b) => b.score - a.score); // Sort by score descending

  return results;
}

export function searchChatHistory(query: string, history: ChatMessage[]): ChatMessage[] {
  const queryVector = createTextVector(query);
  if (queryVector.size === 0 || history.length === 0) {
      return [];
  }

  const historyWithVectors = history.map(msg => ({
      ...msg,
      vector: createTextVector(`${msg.role}: ${msg.content}`)
  }));

  return historyWithVectors
      .map(msg => ({
          ...msg,
          score: cosineSimilarity(queryVector, msg.vector)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5) // Return top 5 most relevant messages
      .sort((a,b) => history.indexOf(a) - history.indexOf(b)); // Restore chronological order
}