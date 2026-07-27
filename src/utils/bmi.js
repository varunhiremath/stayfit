// Body-mass index from the two figures onboarding already collects (kg + cm),
// plus the imperial height conversions the form needs when you enter feet and
// inches instead. Pure — nothing here touches the DB or the store.

export const CM_PER_INCH = 2.54;
export const INCHES_PER_FOOT = 12;

const num = (v) => {
  if (v === '' || v == null) return NaN;
  const n = Number(v);
  return Number.isFinite(n) ? n : NaN;
};

// feet + inches -> cm. Either part may be blank (5 ft on its own is fine).
export function toCm(feet, inches) {
  const f = num(feet);
  const i = num(inches);
  if (isNaN(f) && isNaN(i)) return null;
  const totalIn = (isNaN(f) ? 0 : f) * INCHES_PER_FOOT + (isNaN(i) ? 0 : i);
  if (!(totalIn > 0)) return null;
  return Math.round(totalIn * CM_PER_INCH * 10) / 10;
}

// cm -> whole feet + inches, rounded to the nearest inch. 12" rolls over into
// the next foot so you never see 5'12".
export function toFeetInches(cm) {
  const c = num(cm);
  if (isNaN(c) || c <= 0) return null;
  let inches = Math.round(c / CM_PER_INCH);
  const feet = Math.floor(inches / INCHES_PER_FOOT);
  inches -= feet * INCHES_PER_FOOT;
  return { feet, inches };
}

// Height for display, in whichever unit the user chose.
export function fmtHeight(cm, heightUnit = 'cm') {
  const c = num(cm);
  if (isNaN(c) || c <= 0) return null;
  if (heightUnit !== 'ftin') return `${Math.round(c)} cm`;
  const ft = toFeetInches(c);
  return `${ft.feet}′ ${ft.inches}″`;
}

// The index itself, to one decimal. Null unless both figures are usable.
export function calcBmi(weightKg, heightCm) {
  const w = num(weightKg);
  const h = num(heightCm);
  if (isNaN(w) || isNaN(h) || w <= 0 || h <= 0) return null;
  const m = h / 100;
  const v = w / (m * m);
  if (!Number.isFinite(v)) return null;
  return Math.round(v * 10) / 10;
}

// WHO bands. `key` drives the colour, `label` is what we show.
export function bmiCategory(bmi) {
  const v = num(bmi);
  if (isNaN(v) || v <= 0) return null;
  if (v < 18.5) return { key: 'under', label: 'Underweight' };
  if (v < 25) return { key: 'healthy', label: 'Healthy' };
  if (v < 30) return { key: 'over', label: 'Overweight' };
  return { key: 'obese', label: 'Obese' };
}
