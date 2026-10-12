/** Export admission gate. Checks metadata; rasterization/watermarking is a separate renderer responsibility. */
export const EXPORT_TYPES = new Set(['image/png','image/jpeg','image/webp','image/svg+xml','application/pdf','video/mp4']);
export function assessVisualExport(asset = {}) {
  const failures=[];
  if (!EXPORT_TYPES.has(asset.mimeType)) failures.push('UNSUPPORTED_FORMAT');
  if (!asset.assetId || !/^[a-zA-Z0-9_-]{8,100}$/.test(asset.assetId)) failures.push('INVALID_ASSET_ID');
  if (!['OWNED','LICENSED','PUBLIC_DOMAIN','ORIGINAL','EDITORIAL_LICENSED'].includes(asset.rightsStatus)) failures.push('RIGHTS_UNVERIFIED');
  if (!asset.rightsEvidence) failures.push('RIGHTS_EVIDENCE_MISSING');
  if (!asset.visibleSignatureVerified) failures.push('VISIBLE_SIGNATURE_UNVERIFIED');
  if (!asset.integratedBrandVerified) failures.push('BRAND_COMPOSITION_UNVERIFIED');
  if (!asset.sourceHash || !/^[a-f0-9]{64}$/i.test(asset.sourceHash)) failures.push('SOURCE_HASH_MISSING');
  if (!asset.claimsChecked) failures.push('CLAIMS_UNVERIFIED');
  if (asset.containsSyntheticScene && !asset.syntheticDisclosure) failures.push('SYNTHETIC_DISCLOSURE_MISSING');
  return {status:failures.length?'BLOCKED':'READY_FOR_HUMAN_REVIEW',failures};
}
