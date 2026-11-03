import test from 'node:test';
import assert from 'node:assert/strict';
import { FLOOR_THEME_RULES, guessFloorTheme } from '../../web/theme/floor-theme-rules.js';

test('kyoto keyword table: washi names match, everything else is unset', () => {
  assert.equal(FLOOR_THEME_RULES.length, 1);
  assert.equal(FLOOR_THEME_RULES[0].theme, 'kyoto-dusk');
  assert.equal(guessFloorTheme('Kyoto'), 'kyoto-dusk');
  assert.equal(guessFloorTheme('JAPAN desk'), 'kyoto-dusk');
  assert.equal(guessFloorTheme('washi room'), 'kyoto-dusk');
  assert.equal(guessFloorTheme('Zen'), 'kyoto-dusk');
  assert.equal(guessFloorTheme('和室'), 'kyoto-dusk');
  assert.equal(guessFloorTheme('京都暮色'), 'kyoto-dusk');
  assert.equal(guessFloorTheme('Unassigned'), null);
  assert.equal(guessFloorTheme('unassigned'), null);
  assert.equal(guessFloorTheme('Unassigned · 2'), null);
  assert.equal(guessFloorTheme('Office'), null);
  assert.equal(guessFloorTheme('Ranch'), null);
  assert.equal(guessFloorTheme('Mystery Label'), null);
  assert.equal(guessFloorTheme('community'), null);
  assert.equal(guessFloorTheme(''), null);
});
