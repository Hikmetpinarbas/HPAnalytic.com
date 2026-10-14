/** Resolve editorial navigation only against admitted public article IDs. */
export function resolvePublicNextQuestion(nextQuestion, publicArticleIds) {
  if (!nextQuestion || typeof nextQuestion.href !== 'string') return null;
  const match = /^\/articles\/([a-z0-9-]+)$/.exec(nextQuestion.href);
  return match && publicArticleIds.has(match[1]) ? nextQuestion : null;
}
