import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Fetch all interactions from the past 90 days
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const interactions = await base44.asServiceRole.entities.UserInteraction.filter({}, '-created_date', 10000);
    const recentInteractions = interactions.filter(i => new Date(i.created_date) >= ninetyDaysAgo);

    // Analyze interactions
    const analysis = {
      total_interactions: recentInteractions.length,
      total_unique_sessions: new Set(recentInteractions.map(i => i.session_id)).size,
      total_authenticated_users: new Set(recentInteractions.filter(i => i.is_authenticated).map(i => i.user_email)).size,
      
      // Content performance
      most_viewed_content: getMostViewed(recentInteractions),
      most_engaged_content: getMostEngaged(recentInteractions),
      
      // Category insights
      category_distribution: getCategoryDistribution(recentInteractions),
      category_engagement: getCategoryEngagement(recentInteractions),
      
      // Tag insights
      trending_tags: getTrendingTags(recentInteractions),
      tag_performance: getTagPerformance(recentInteractions),
      
      // Search insights
      popular_searches: getPopularSearches(recentInteractions),
      search_to_click_rate: getSearchClickRate(recentInteractions),
      
      // User behavior
      avg_time_on_page: getAverageTimeOnPage(recentInteractions),
      avg_scroll_depth: getAverageScrollDepth(recentInteractions),
      content_format_performance: getContentFormatPerformance(recentInteractions),
      
      // Trend analysis and recommendations
      recommendations: generateRecommendations(recentInteractions)
    };

    return Response.json(analysis);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function getMostViewed(interactions) {
  const views = {};
  interactions
    .filter(i => i.event_type === 'page_view' && i.entity_id)
    .forEach(i => {
      if (!views[i.entity_id]) {
        views[i.entity_id] = { title: i.entity_title, type: i.entity_type, count: 0 };
      }
      views[i.entity_id].count++;
    });
  return Object.entries(views)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 10)
    .map(([id, data]) => ({ id, ...data }));
}

function getMostEngaged(interactions) {
  const engagement = {};
  interactions
    .filter(i => i.entity_id)
    .forEach(i => {
      if (!engagement[i.entity_id]) {
        engagement[i.entity_id] = { title: i.entity_title, type: i.entity_type, score: 0, interactions: 0 };
      }
      engagement[i.entity_id].interactions++;
      if (i.event_type === 'page_view') engagement[i.entity_id].score += 1;
      if (i.event_type === 'article_click') engagement[i.entity_id].score += 2;
      if (i.event_type === 'search_result_click') engagement[i.entity_id].score += 2;
      if (i.event_type === 'share') engagement[i.entity_id].score += 5;
      if (i.time_on_page) engagement[i.entity_id].score += Math.min(i.time_on_page / 60, 5);
    });
  return Object.entries(engagement)
    .sort((a, b) => b[1].score - a[1].score)
    .slice(0, 10)
    .map(([id, data]) => ({ id, ...data, engagement_score: Math.round(data.score) }));
}

function getCategoryDistribution(interactions) {
  const dist = {};
  interactions
    .filter(i => i.category)
    .forEach(i => {
      dist[i.category] = (dist[i.category] || 0) + 1;
    });
  return Object.entries(dist).map(([category, count]) => ({ category, count }));
}

function getCategoryEngagement(interactions) {
  const engagement = {};
  interactions.forEach(i => {
    if (!i.category) return;
    if (!engagement[i.category]) {
      engagement[i.category] = { views: 0, clicks: 0, time: 0, shares: 0, interactions: 0 };
    }
    engagement[i.category].interactions++;
    if (i.event_type === 'page_view') engagement[i.category].views++;
    if (['article_click', 'search_result_click'].includes(i.event_type)) engagement[i.category].clicks++;
    if (i.time_on_page) engagement[i.category].time += i.time_on_page;
    if (i.event_type === 'share') engagement[i.category].shares++;
  });
  return Object.entries(engagement).map(([category, data]) => ({
    category,
    ...data,
    avg_time_on_page: Math.round(data.time / Math.max(data.views, 1)),
    click_through_rate: data.views > 0 ? Math.round((data.clicks / data.views) * 100) : 0
  }));
}

function getTrendingTags(interactions) {
  const tags = {};
  interactions
    .filter(i => i.tags?.length)
    .forEach(i => {
      i.tags.forEach(tag => {
        tags[tag] = (tags[tag] || 0) + 1;
      });
    });
  return Object.entries(tags)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([tag, count]) => ({ tag, count }));
}

function getTagPerformance(interactions) {
  const performance = {};
  interactions.forEach(i => {
    if (!i.tags?.length) return;
    i.tags.forEach(tag => {
      if (!performance[tag]) {
        performance[tag] = { views: 0, clicks: 0, time: 0, shares: 0 };
      }
      if (i.event_type === 'page_view') performance[tag].views++;
      if (['article_click', 'search_result_click'].includes(i.event_type)) performance[tag].clicks++;
      if (i.time_on_page) performance[tag].time += i.time_on_page;
      if (i.event_type === 'share') performance[tag].shares++;
    });
  });
  return Object.entries(performance)
    .map(([tag, data]) => ({
      tag,
      ...data,
      engagement_score: data.views > 0 ? Math.round((data.clicks + data.shares * 2) / data.views) : 0
    }))
    .sort((a, b) => b.engagement_score - a.engagement_score)
    .slice(0, 10);
}

function getPopularSearches(interactions) {
  const searches = {};
  interactions
    .filter(i => i.event_type === 'search_query' && i.search_query)
    .forEach(i => {
      searches[i.search_query] = (searches[i.search_query] || 0) + 1;
    });
  return Object.entries(searches)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([query, count]) => ({ query, count }));
}

function getSearchClickRate(interactions) {
  const searches = new Set(interactions.filter(i => i.event_type === 'search_query').map(i => i.session_id));
  const clicksAfterSearch = interactions.filter(i => {
    return i.event_type === 'search_result_click' && searches.has(i.session_id);
  }).length;
  return {
    total_searches: searches.size,
    clicks_after_search: clicksAfterSearch,
    click_rate: searches.size > 0 ? Math.round((clicksAfterSearch / searches.size) * 100) : 0
  };
}

function getAverageTimeOnPage(interactions) {
  const times = interactions.filter(i => i.time_on_page).map(i => i.time_on_page);
  return times.length > 0 ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;
}

function getAverageScrollDepth(interactions) {
  const depths = interactions.filter(i => i.scroll_depth).map(i => i.scroll_depth);
  return depths.length > 0 ? Math.round(depths.reduce((a, b) => a + b, 0) / depths.length) : 0;
}

function getContentFormatPerformance(interactions) {
  const byType = {};
  interactions.forEach(i => {
    if (!i.entity_type) return;
    if (!byType[i.entity_type]) {
      byType[i.entity_type] = { views: 0, clicks: 0, time: 0, shares: 0, sessions: new Set() };
    }
    byType[i.entity_type].sessions.add(i.session_id);
    if (i.event_type === 'page_view') byType[i.entity_type].views++;
    if (['article_click', 'search_result_click'].includes(i.event_type)) byType[i.entity_type].clicks++;
    if (i.time_on_page) byType[i.entity_type].time += i.time_on_page;
    if (i.event_type === 'share') byType[i.entity_type].shares++;
  });
  return Object.entries(byType).map(([type, data]) => ({
    type,
    views: data.views,
    clicks: data.clicks,
    shares: data.shares,
    avg_time: data.views > 0 ? Math.round(data.time / data.views) : 0,
    click_through_rate: data.views > 0 ? Math.round((data.clicks / data.views) * 100) : 0,
    unique_sessions: data.sessions.size
  }));
}

function generateRecommendations(interactions) {
  const recommendations = [];
  
  // Analyze category performance
  const categoryEngagement = {};
  interactions.forEach(i => {
    if (!i.category) return;
    if (!categoryEngagement[i.category]) categoryEngagement[i.category] = 0;
    categoryEngagement[i.category]++;
  });
  
  const categories = Object.entries(categoryEngagement).sort((a, b) => b[1] - a[1]);
  if (categories.length > 0) {
    const topCategory = categories[0][0];
    const bottomCategory = categories[categories.length - 1][0];
    recommendations.push({
      type: "content_expansion",
      priority: "high",
      insight: `"${topCategory}" is the most engaged category. Consider creating more content in this area.`,
      action: `Develop additional ${topCategory} resources and case studies`
    });
    recommendations.push({
      type: "content_strategy",
      priority: "medium",
      insight: `"${bottomCategory}" has lower engagement. Review and update existing content or explore new angles.`,
      action: `Refresh ${bottomCategory} content with new research or perspectives`
    });
  }

  // Analyze search gaps
  const searches = interactions.filter(i => i.event_type === 'search_query');
  if (searches.length > 10) {
    recommendations.push({
      type: "seo_opportunity",
      priority: "medium",
      insight: "Users are actively searching for content. Monitor search queries to identify gaps.",
      action: "Review search logs for frequently searched but not found topics"
    });
  }

  // Analyze engagement depth
  const avgTime = getAverageTimeOnPage(interactions);
  if (avgTime > 180) {
    recommendations.push({
      type: "content_quality",
      priority: "high",
      insight: `Users spend an average of ${Math.round(avgTime / 60)} minutes on content. Quality is strong.`,
      action: "Continue producing in-depth, detailed content"
    });
  }

  // Tag-based recommendations
  const tags = getTrendingTags(interactions);
  if (tags.length > 0) {
    recommendations.push({
      type: "topic_trends",
      priority: "medium",
      insight: `Top trending tags: ${tags.slice(0, 3).map(t => t.tag).join(", ")}. These topics have strong user interest.`,
      action: "Create content targeting these trending topics and keywords"
    });
  }

  // Content format recommendations
  const formats = getContentFormatPerformance(interactions);
  if (formats.length > 0) {
    const best = formats.sort((a, b) => b.click_through_rate - a.click_through_rate)[0];
    recommendations.push({
      type: "format_optimization",
      priority: "medium",
      insight: `${best.type} has the highest engagement (${best.click_through_rate}% CTR). Prioritize this format.`,
      action: `Increase production of ${best.type} content`
    });
  }

  return recommendations;
}