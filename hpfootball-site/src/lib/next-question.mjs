// A next question may point at an article that is not (yet) admitted to the
// public site. Linking it would ship a 404 from a published page, so an
// article target resolves only when that article is itself public.
const ARTICLE_ROUTE = /^\/articles\/([^/?#]+)\/?(?:[?#].*)?$/;

export function resolveNextQuestion(nextQuestion, publicArticleIds) {
  if (!nextQuestion?.question) return null;
  const href = nextQuestion.href;
  const article = typeof href === 'string' ? href.match(ARTICLE_ROUTE) : null;
  const linkable = typeof href === 'string' && href.startsWith('/') && (!article || new Set(publicArticleIds).has(article[1]));
  return { question: nextQuestion.question, href: linkable ? href : null };
}
