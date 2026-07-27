import { LB_PER_KG } from './units.js';

// The standard Olympic barbell, which is what the plate calculator assumes.
// There is no setting for this: metric gyms rack a 20 kg bar, imperial gyms a
// 45 lb one, so the default simply follows the user's chosen unit and displays
// as a round number either way (20 kg / 45 lbs) rather than an odd conversion.
export const BAR_KG = 20;
export const BAR_LB = 45;

export function defaultBarKg(unit) {
  return unit === 'lbs' ? BAR_LB / LB_PER_KG : BAR_KG;
}

// The bar as shown in the user's unit — always the round, familiar number.
export function defaultBarDisplay(unit) {
  return unit === 'lbs' ? BAR_LB : BAR_KG;
}
