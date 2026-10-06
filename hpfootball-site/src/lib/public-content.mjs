// Single admission filter for public collections.
//
// A content file marked `draft: true` (editorial exports ship every
// package that way) never reaches a public listing, route, archive, search or
// navigation count. Every getCollection() call in public code passes this.
export const isPublic = (entry) => entry?.data?.draft !== true;
