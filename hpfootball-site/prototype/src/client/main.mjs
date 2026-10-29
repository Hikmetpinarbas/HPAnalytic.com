import {initMenus} from './menu.mjs';
import {initPalette} from './palette.mjs';
import {initCards} from './cards.mjs';
import {initRails} from './rail.mjs';
import {initReading} from './reading.mjs';
initMenus();initPalette();initCards();initRails();initReading();
if(document.body.dataset.page==='archive')import('./filters.mjs').then(m=>m.initFilters());
if(document.body.dataset.page==='analysis')import('./chart.mjs').then(m=>m.initChart());
