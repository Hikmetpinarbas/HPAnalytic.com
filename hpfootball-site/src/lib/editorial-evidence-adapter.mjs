const UNKNOWN='UNKNOWN';
const text=(v)=>typeof v==='string'&&v.trim()?v.trim():UNKNOWN;
const list=(v)=>Array.isArray(v)?v.filter(Boolean):[];

export function adaptPresentationViewModel(view={}){
  return {
    context:text(view.match_context||view.context),
    mechanism:text(view.observed_mechanism||view.mechanism),
    evidence:list(view.evidence),
    counterevidence:list(view.counterevidence),
    confidence:text(view.confidence_level||view.confidence),
    claim_ceiling:text(view.claim_ceiling),
    visual_explanation:view.visual_explanation||null,
    provenance:text(view.provenance),
    source_contract:'PRESENTATION_VIEW_MODEL'
  };
}

export function adaptMechanismCard(card={}){
  return {
    mechanism:text(card.mechanism),
    evidence:list(card.evidence),
    counterevidence:list(card.counterevidence),
    context:text(card.context),
    confidence:text(card.confidence_level||card.confidence),
    claim_ceiling:text(card.claim_ceiling),
    alternative_explanations:list(card.alternative_explanations),
    visual_explanation:card.visual_explanation||null,
    provenance:text(card.provenance),
    source_contract:'SAFE_MECHANISM_CARD'
  };
}

export function canRenderEditorialEvidence(model={}){
  return model.mechanism!==UNKNOWN
    && model.claim_ceiling!==UNKNOWN
    && model.provenance!==UNKNOWN
    && model.evidence.length>0;
}
