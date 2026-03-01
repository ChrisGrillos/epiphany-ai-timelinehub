import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { query, entityTypes = ["Article", "CaseStudy", "App", "TimelineEntry"], searchType = "semantic" } = body;

    if (!query) {
      return Response.json({ error: "Query required" }, { status: 400 });
    }

    // Fetch all documents from requested entities
    let allDocuments = [];
    
    if (entityTypes.includes("Article")) {
      const articles = await base44.entities.Article.filter({ published: true }, "-created_date", 100);
      allDocuments.push(...articles.map(a => ({
        type: "Article",
        id: a.id,
        title: a.title,
        excerpt: a.excerpt,
        content: a.content,
        category: a.category,
        created_date: a.created_date,
        tags: a.tags,
        cover_image: a.cover_image
      })));
    }

    if (entityTypes.includes("CaseStudy")) {
      const cases = await base44.entities.CaseStudy.filter({ published: true }, "-created_date", 100);
      allDocuments.push(...cases.map(c => ({
        type: "CaseStudy",
        id: c.id,
        title: c.title,
        excerpt: c.excerpt,
        problem: c.problem,
        solution: c.solution,
        results: c.results,
        created_date: c.created_date,
        tags: c.tags,
        cover_image: c.cover_image,
        client: c.client
      })));
    }

    if (entityTypes.includes("App")) {
      const apps = await base44.entities.App.filter({ published: true }, "-created_date", 100);
      allDocuments.push(...apps.map(a => ({
        type: "App",
        id: a.id,
        title: a.name,
        excerpt: a.description,
        tagline: a.tagline,
        category: a.category,
        created_date: a.created_date,
        tags: a.tags,
        cover_image: a.screenshot_urls?.[0]
      })));
    }

    if (entityTypes.includes("TimelineEntry")) {
      const entries = await base44.entities.TimelineEntry.filter({ published: true }, "-created_date", 100);
      allDocuments.push(...entries.map(e => ({
        type: "TimelineEntry",
        id: e.id,
        title: e.title,
        excerpt: e.description,
        category: e.category,
        entry_date: e.entry_date,
        created_date: e.created_date,
        tags: e.tags,
        cover_image: e.screenshot_urls?.[0]
      })));
    }

    if (searchType === "semantic") {
      // Use LLM for semantic search to find relevant documents
      const catalogText = allDocuments.map((doc, idx) => 
        `[${idx}] ${doc.type}: "${doc.title}" (Date: ${doc.created_date?.slice(0,10) || doc.entry_date || 'N/A'}) - ${doc.excerpt || doc.tagline || ''}`
      ).join('\n');

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a document search assistant. Given a user query, return the indices of the most relevant documents from this catalog that match the user's intent. Return as JSON with "indices" array and "reason" string.

User Query: "${query}"

Document Catalog:
${catalogText}

Return JSON with indices of matching documents (max 10) and a brief reason.`,
        response_json_schema: {
          type: "object",
          properties: {
            indices: {
              type: "array",
              items: { type: "number" }
            },
            reason: { type: "string" }
          }
        }
      });

      const matchedDocs = result.indices
        .filter(idx => idx >= 0 && idx < allDocuments.length)
        .map(idx => allDocuments[idx]);

      return Response.json({
        success: true,
        query,
        results: matchedDocs,
        count: matchedDocs.length,
        reason: result.reason
      });
    } else {
      // Keyword search
      const lowerQuery = query.toLowerCase();
      const matchedDocs = allDocuments.filter(doc => {
        const titleMatch = doc.title?.toLowerCase().includes(lowerQuery);
        const excerptMatch = doc.excerpt?.toLowerCase().includes(lowerQuery);
        const tagMatch = doc.tags?.some(t => t.toLowerCase().includes(lowerQuery));
        const categoryMatch = doc.category?.toLowerCase().includes(lowerQuery);
        return titleMatch || excerptMatch || tagMatch || categoryMatch;
      });

      return Response.json({
        success: true,
        query,
        results: matchedDocs,
        count: matchedDocs.length
      });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});