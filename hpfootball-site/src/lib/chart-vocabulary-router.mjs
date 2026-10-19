/**
 * HPAnalytic M03: question → evidence-aware LOZA recipe.
 * Produces a decision manifest, never a rendered claim or inferred event data.
 * Fail-closed defaults are intentional.
 */
const deny = (reason) => Object.freeze({status:'BLOCKED',recipe:null,evidenceClass:'UNAVAILABLE',reason});
const allow = (recipe,evidenceClass='OBSERVED') => Object.freeze({status:'READY',recipe,evidenceClass,reason:null});
export function selectChartRecipe(input={}) {
  if (!input || typeof input!=='object') return deny('INVALID_INPUT');
  const {question,sourceMode,eventIds,coordinatesVerified,attackDirectionVerified,recipientsVerified,
    possessionVerified,populationVerified,denominator,sampleSize}=input;
  if (question==='comparison') {
    if (!['PREMATCH_TABULAR','POSTMATCH_TABULAR'].includes(sourceMode)) return deny('COMPARISON_SOURCE_MODE');
    if (populationVerified!==true || typeof denominator!=='string' || !denominator.trim()
      || !Number.isSafeInteger(sampleSize) || sampleSize<=0) return deny('COMPARISON_PROVENANCE_REQUIRED');
    return allow('G12','DERIVED');
  }
  if (sourceMode!=='POSTMATCH_EVENT' && sourceMode!=='PREMATCH_EVENT') return deny('EVENT_SOURCE_REQUIRED');
  if (!Array.isArray(eventIds) || !eventIds.length || !eventIds.every(id=>typeof id==='string' && id.trim())) return deny('VERIFIED_EVENT_IDS_REQUIRED');
  if (coordinatesVerified!==true) return deny('VERIFIED_COORDINATES_REQUIRED');
  if (question==='spatial') {
    if (attackDirectionVerified!==true) return deny('ATTACK_DIRECTION_UNKNOWN');
    return allow('G01');
  }
  if (question==='relationships') {
    if (recipientsVerified!==true) return deny('PASS_RECIPIENT_UNKNOWN');
    return allow('G03');
  }
  if (question==='risk') {
    if (attackDirectionVerified!==true || possessionVerified!==true) return deny('OPPONENT_POSSESSION_UNKNOWN');
    return allow('G06','DERIVED');
  }
  return deny('UNSUPPORTED_ANALYTICAL_QUESTION');
}
