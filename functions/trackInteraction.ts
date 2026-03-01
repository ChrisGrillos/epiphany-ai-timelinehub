import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    const user = await base44.auth.me().catch(() => null);
    const sessionId = body.session_id || `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    const interaction = {
      event_type: body.event_type,
      entity_type: body.entity_type,
      entity_id: body.entity_id,
      entity_title: body.entity_title,
      category: body.category,
      tags: body.tags,
      search_query: body.search_query,
      time_on_page: body.time_on_page,
      scroll_depth: body.scroll_depth,
      session_id: sessionId,
      user_email: user?.email,
      is_authenticated: !!user
    };

    await base44.asServiceRole.entities.UserInteraction.create(interaction);

    return Response.json({ success: true, session_id: sessionId });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});