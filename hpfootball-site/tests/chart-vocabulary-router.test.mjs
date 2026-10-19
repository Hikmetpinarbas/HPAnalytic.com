import test from 'node:test';
import assert from 'node:assert/strict';
import {selectChartRecipe} from '../src/lib/chart-vocabulary-router.mjs';
test('LOZA spatial question chooses event atlas from verified coordinates',()=>{
 const out=selectChartRecipe({question:'spatial',sourceMode:'POSTMATCH_EVENT',eventIds:['e1'],coordinatesVerified:true,attackDirectionVerified:true});
 assert.equal(out.status,'READY');assert.equal(out.recipe,'G01');assert.equal(out.evidenceClass,'OBSERVED');
});
test('LOZA blocks pass networks unless recipients are verified',()=>{
 const out=selectChartRecipe({question:'relationships',sourceMode:'POSTMATCH_EVENT',eventIds:['e1'],coordinatesVerified:true,recipientsVerified:false});
 assert.equal(out.status,'BLOCKED');assert.equal(out.recipe,null);
});
test('LOZA prevents event-location pitch charts from XLSX-only datasets',()=>{
 const out=selectChartRecipe({question:'spatial',sourceMode:'PREMATCH_TABULAR',eventIds:[],coordinatesVerified:false});
 assert.equal(out.status,'BLOCKED');
});
test('LOZA denies direction-dependent zonal claims if attack direction is unknown',()=>{
 const out=selectChartRecipe({question:'spatial',sourceMode:'POSTMATCH_EVENT',eventIds:['e1'],coordinatesVerified:true,attackDirectionVerified:false});
 assert.equal(out.status,'BLOCKED');
});
test('LOZA requires possession certainty to connect loss to opponent threat',()=>{
 const out=selectChartRecipe({question:'risk',sourceMode:'POSTMATCH_EVENT',eventIds:['e1'],coordinatesVerified:true,attackDirectionVerified:true,possessionVerified:false});
 assert.equal(out.status,'BLOCKED');
});
test('distribution of comparable XLSX measurements uses scouting comparison recipe',()=>{
 const out=selectChartRecipe({question:'comparison',sourceMode:'PREMATCH_TABULAR',sampleSize:28,denominator:'per90',populationVerified:true});
 assert.equal(out.status,'READY');assert.equal(out.recipe,'G12');
});
test('missing provenance fails closed',()=>{
 const out=selectChartRecipe({question:'comparison',sourceMode:'PREMATCH_TABULAR',sampleSize:28,populationVerified:true});
 assert.equal(out.status,'BLOCKED');
});
