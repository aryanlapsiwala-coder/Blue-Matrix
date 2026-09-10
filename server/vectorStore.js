/**
 * KnowPass Vector Store & Semantic Similarity Engine
 */

export class VectorStore {
  constructor() {
    this.documents = [];
    this.vocabulary = new Set();
    this.idfMap = new Map();
  }

  /**
   * Tokenize text into normalized word tokens
   */
  tokenize(text) {
    if (!text) return [];
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s_-]/g, ' ')
      .split(/\s+/)
      .filter((t) => t.length > 1);
  }

  /**
   * Ingest and index knowledge documents
   */
  indexDocuments(docs) {
    this.documents = docs.map((doc) => {
      const fullText = `${doc.title} ${doc.category} ${doc.department} ${doc.tags.join(' ')} ${doc.summary} ${doc.content}`;
      const tokens = this.tokenize(fullText);
      
      tokens.forEach((t) => this.vocabulary.add(t));
      
      // Calculate Term Frequency (TF)
      const tf = new Map();
      tokens.forEach((t) => tf.set(t, (tf.get(t) || 0) + 1));
      for (const [k, v] of tf.entries()) {
        tf.set(k, v / tokens.length);
      }

      return {
        ...doc,
        tokens,
        tf,
        vector: null,
      };
    });

    // Calculate Inverse Document Frequency (IDF)
    const totalDocs = this.documents.length;
    for (const word of this.vocabulary) {
      const docCount = this.documents.filter((d) => d.tf.has(word)).length;
      this.idfMap.set(word, Math.log((totalDocs + 1) / (docCount + 1)) + 1);
    }

    // Build TF-IDF dense vectors for each document
    this.documents.forEach((doc) => {
      doc.vector = this.createVector(doc.tokens);
    });

    console.log(`[VectorStore] Indexed ${this.documents.length} campus knowledge documents with vocabulary size ${this.vocabulary.size}`);
  }

  /**
   * Convert tokens into TF-IDF Vector
   */
  createVector(tokens) {
    const vector = new Map();
    const tf = new Map();
    tokens.forEach((t) => tf.set(t, (tf.get(t) || 0) + 1));

    for (const [t, count] of tf.entries()) {
      if (this.idfMap.has(t)) {
        const idf = this.idfMap.get(t);
        vector.set(t, (count / tokens.length) * idf);
      }
    }
    return vector;
  }

  /**
   * Calculate Cosine Similarity between two sparse/dense vector maps
   */
  cosineSimilarity(vecA, vecB) {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (const [key, valA] of vecA.entries()) {
      normA += valA * valA;
      if (vecB.has(key)) {
        dotProduct += valA * vecB.get(key);
      }
    }

    for (const valB of vecB.values()) {
      normB += valB * valB;
    }

    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Perform Semantic Similarity Search for query vector
   */
  search(query, topK = 3) {
    const queryTokens = this.tokenize(query);
    const queryVec = this.createVector(queryTokens);

    const scores = this.documents.map((doc) => {
      let similarity = this.cosineSimilarity(queryVec, doc.vector);

      // Boost score if title or tag matches query tokens directly
      const titleLower = doc.title.toLowerCase();
      const tagsLower = doc.tags.map((t) => t.toLowerCase());

      queryTokens.forEach((qt) => {
        if (titleLower.includes(qt)) similarity += 0.25;
        if (tagsLower.some((t) => t.includes(qt))) similarity += 0.20;
      });

      // Normalize similarity between 0 and 1
      const normalizedScore = Math.min(0.99, Math.max(0.35, similarity));

      return {
        document: {
          id: doc.id,
          title: doc.title,
          category: doc.category || doc.knowledgeType,
          department: doc.department,
          author: doc.author,
          authorRole: doc.authorRole,
          summary: doc.summary,
          tags: doc.tags,
          content: doc.content,
          rating: doc.rating || 5.0,
          upvotes: doc.upvotes || 0,
          resources: doc.resources || {},
        },
        similarity: parseFloat(normalizedScore.toFixed(3)),
        matchPercentage: Math.round(normalizedScore * 100),
      };
    });

    // Sort descending by similarity
    scores.sort((a, b) => b.similarity - a.similarity);

    return scores.slice(0, topK);
  }

  /**
   * Build grounded prompt with retrieved top matches and general intelligence
   */
  buildGroundedPrompt(query, matches) {
    const contextText = matches
      .map(
        (m, idx) => `[Campus Document ${idx + 1}]: "${m.document.title}" (Author: ${m.document.author} - ${m.document.authorRole}, Dept: ${m.document.department})
Summary: ${m.document.summary}
Content Extract:
${m.document.content.slice(0, 800)}`
      )
      .join('\n\n---\n\n');

    const systemPrompt = `You are an intelligent, versatile, and natural AI assistant for the campus Knowledge Management portal "KnowPass".

Guidelines:
1. Answer ANY question (coding, math, science, general advice, explanations) naturally, directly, and accurately like Google Gemini.
2. DO NOT start your response with robotic introductions or repetitive greetings (e.g. NEVER say "Hello! I am KnowBot..." or "I'd be happy to help with that!"). Jump directly into the solution, explanation, or code. Only greet if the user's message is simply a greeting like "hi" or "hello".
3. When the question relates to university courses, laboratory SOPs, campus equipment (like HPC cluster, Wi-Fi), placement drives, or campus guidelines, seamlessly integrate the relevant verified campus sources provided below.
4. Format code with proper markdown backticks (\`\`\`python, \`\`\`javascript, etc.) and use clean bullet points where helpful.

CAMPUS KNOWLEDGE BASE CONTEXT (Use when relevant):
${contextText}

USER QUERY: "${query}"

Answer directly:`;

    return systemPrompt;
  }
}
