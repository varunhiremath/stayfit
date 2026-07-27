# StayFit — Architecture & codebase map

The efficiency reference: what exists and where. Check here before grepping. Keep updated when adding a table, field, util, hook, route, store, or localStorage key.

> **v4.0.0 — StayFit.** The app was formerly OPUS, a gamified gym tracker. The entire RPG layer (XP, levels, titles, prestige, quests, achievements, Iron economy, daily dungeon, boss gates, decay, streak shield, crit sets, the 3D companion and all share cards but one) was **removed**. What remains is a focused health-and-fitness app: plan → train → recover.
>
> **Deliberately unchanged for data safety:** the Dexie DB is still named `OpusDB` — renaming it would orphan existing users' workout history. It is internal and never shown. (The repo and the Vite `base` are both `stayfit`/`/stayfit/`.)

## Stack
Vite 5 · React 18 · Tailwind v3 · Dexie.js (IndexedDB) · Zustand · React Router v6 · Recharts · react-body-highlighter · lucide-react · vite-plugin-pwa. Vitest (node env) for unit tests. Deploy: GitHub Pages via `.github/workflows/deploy.yml` (test job gates build-and-deploy).

## Routes (`src/router.jsx`)
`/` Loading · **`/home`** · **`/plan`** · **`/workout`** · **`/library`** · **`/progress`** · `/history` · `/records` · `/exercises/:id` · `/profile` · `/settings`. All under `AppLayout` (BottomNav + Onboarding/Tour/CoachMark/UiHost gates).
The five bold routes are the bottom-nav tabs (`components/layout/BottomNav.jsx`); Workout is the raised centre FAB, drawn with the custom `components/icons/LifterIcon.jsx` (a figure pressing a barbell) rather than a lucide glyph.
`/library` accepts `?tab=exercises|stretches` and `?phase=pre|post` — the warm-up/cool-down prompts on Workout and Home deep-link into it.

## DB (`src/db/db.js`) — Dexie, name `OpusDB`, current **v10**
- v1–2: `exercises`(++id,name,muscleGroup,equipment,isCustom,difficulty; +favorite,color unindexed)
- v2: `workouts`(++id,date,templateId,status,duration; +name,notes,energy,totalVolume,totalCalories,totalSets,bodyweightKg,color,tags,createdAt), `sets`(++id,workoutId,exerciseId,setNumber,reps,weight,completedAt; +isWarmup,rpe,note + cardio fields isCardio/durationSec/speedKmh/incline/distanceKm/calories), `templates`(++id,name,dayOfWeek,createdAt; +color,autoKey,progression unindexed), `templateExercises`(++id,templateId,exerciseId,orderIndex; +targetSets/Reps/Weight/Rest,misses), `prs`(++id,exerciseId,type,value,achievedAt,workoutId), `bodyStats`, `sleepLogs`, `energyLogs`, `userProfile`(++id; name,height,sex,birthYear,streak,lastWorkoutDate,joinDate), `notifications`(unused)
- v3–v9: workouts.createdAt index · templateExercises targets · `exerciseNotes` · `achievements` *(legacy, unused)* · `dailyLogs` · `questClaims` *(legacy, unused)* · `photos`
- **v10 (StayFit):** `stretches`(++id,name,type,bodyArea,isCustom; +durationSec,description,difficulty), `stretchRoutines`(++id,name,phase,createdAt; +items[{stretchId,durationSec}],bodyArea,isCustom), `stretchLogs`(++id,date,phase,completedAt,workoutId; +routineId,routineName,durationSec)
- Migrations are **append-only**. `achievements`/`questClaims` are left declared but unused — dropping them would be a destructive migration.
- Recovery: `versionchange` handler closes+reloads; `db.open()` gated in main.jsx; `DbRecovery` screen.

## localStorage keys
- **`stayfit_prefs`** (settingsStore; falls back through the legacy `ludi_prefs` then `opus_prefs` on load so installs predating a rename keep units/equipment/onboarding): barWeight, unit, onboarded, effects, sound, theme, tourSeen, restDuration, stepGoal, waterGoal, recapDismissedWeek, coachMarksSeen, inventory{active,gym/home:{barKg,plates,unit}}, **reminderEnabled, reminderHour, lastRemindedDate, stretchPrompts, lastBriefedDate**
- `opus_notif_settings`, `opus_notif_prompted` (notification types + quiet hours)
- `opus_active_workout` (in-progress session — resume)
- `opus_reminder_markers` (on-open reminder dedupe)
- `wger_cache_time`

## Stores (`src/store/`)
- **workoutStore** — `activeWorkout` (+localStorage write-through/hydrate, `resumed`/`dismissResumed`), start/startFromTemplate/repeatWorkout, addExercise/removeExercise/swapExercise/moveExercise, logSet/removeSet/setSetNote/toggleWarmup, toggleSuperset, setEnergy/Name/Notes, **completeWorkout** (writes workout+sets+energy, volume, calories, PR detection, plain streak; returns `{workoutId,prCount,totalVolume,totalCalories,totalSets,duration}`), discardWorkout.
- **userStore** — profile init/update (identity + streak only; no XP/level).
- **uiStore** — toasts + promise-based `confirm`/`prompt`; `showToast(message,opts)`.
- **settingsStore** — prefs (see localStorage) + setters; `applyTheme` on setTheme; explicit `PERSISTED` key list.

## Utils (`src/utils/`) — pure unless noted
units · setDiff · calendar · **week** (weekKeyOf/weekStartMs/weekStartMsFromKey/weekIndex — Monday-aligned; replaces the week math that lived in the removed quests module) · progression (decideProgression) · **programs** (PROGRAMS/programById/resolveProgram — 5×5/GZCLP/PPL/Upper-Lower/5-3-1) · **weekPlanner** (SPLITS/planWeek/restFor) · **routineGenerator** (generateRoutine/reshuffleRoutine/makeRng) · routineName · staleRoutine · **nextSession** (scheduleByDay/nextSession/reminderText/shouldRemind/relativeDayLabel — the weekday→routine schedule engine) · **dailyBriefing** (focusLabels/joinFocus/gapPhrase/lastWorkoutLine/shouldBrief/buildBriefing/rankSwaps + FOCUS_GROUPS/SWAP_TARGETS — the once-a-day open summary) · **barbell** (BAR_KG/BAR_LB/defaultBarKg/defaultBarDisplay — the bar is fixed at 20 kg / 45 lb by unit, not a setting) · **stretchSession** (totalDuration/buildSequence/stepAt/seekToStep/formatClock/buildLog — guided-runner sequencing) · **seedStretches** (~30 stretches + 8 bundled routines; stretchSeed/STRETCH_ROUTINES/resolveRoutine/BODY_AREAS) · **stretchActions** (DB: seedStretchDatabase/addCustomStretch/deleteStretch/createStretchRoutine/deleteStretchRoutine/logStretchSession/deleteStretchLog) · imageResize · photoActions · dateKey · volume · plateCalc · inventory · overload · restStats · oneRepMax · calories · supersets · reorder · workoutSession · reminders (pickReminders — now schedule-aware via `hasSchedule`/`scheduledToday`) · csv · **workoutActions** (deleteWorkout, recomputePRs, **recomputeStreak**) · healthActions · noteActions · exerciseActions · templateActions · dataActions (export/import/wipe/CSV/PDF — backup `app: 'STAYFIT'`, still imports legacy LUDI/OPUS backups) · notifications · sound · theme · seedExercises (~70) · wger · share.
Tested utils: units, plateCalc, overload, volume, restStats, oneRepMax, supersets, snapshots-free calendar, workoutSession, reminders, reorder, csv, inventory, dateKey, routineName, programs, progression, weekPlanner, routineGenerator, staleRoutine, calories, setDiff, imageResize, **nextSession**, **stretchSession**, **seedStretches** + uiStore. **232 tests.**

## Hooks (`src/hooks/`)
**useProfile** (replaces useRPG) · useWorkout(useWorkouts/useLastSets/useWorkoutSets/useShareData/useWorkoutDetail) · useExercises · **useStretches** (useStretches/useStretch/useStretchRoutines/useStretchRoutine/useStretchLogs/useStretchStats) · **useNextSession** (useNextSession + **useSessionReminder** — fires the best-effort local reminder) · **useDailyBriefing** (useDailyBriefing + useLastWorkoutFocus) · useProgress (usePRs, useBodyStats, useLifetimeStats, useDailyActivity, useCurrentBodyweight, useExerciseVolume, useExerciseOneRepMax, useWeeklyVolume, useMuscleFrequency, useWorkoutDays, useSleepLogs, useAllPRs, useTopExercises) · useRecovery · useOverload · useWeeklyRecap · useTemplates · useNotifications · useOnOpenReminders · useHaptics.

## Key components
- layout: AppLayout, BottomNav (5 tabs), PageWrapper, TopBar
- workout: WorkoutPage, ExerciseSection, SetLogger, CardioLogger, RestTimer, PlateCalculator, ExercisePicker, EndWorkoutModal (+ cool-down prompt), WorkoutCard, ExerciseInfoModal
- **home**: DailyBriefing (once-a-day modal: last session + today's plan + swap focus / just stretch)
- **plan**: ReminderSettings (on/off, hour, permission + offline caveat)
- **stretch**: StretchRunner (full-screen guided player, portal, countdown ring), StretchRoutineModal (routine move-list + start), StretchDetailModal (single stretch: tags, how-to, video)
- **icons**: LifterIcon (custom stroke SVG for the centre FAB)
- template: TemplateCard, TemplateBuilder, WeeklyPlanner, RoutineGeneratorModal, WeekPlannerModal, ProgramsModal
- library: LibraryPage hosts both halves — Exercises (search + BodyPicker muscle map + favourites + add-custom, reusing `exercise/*`) and Stretches (routines by phase, then all stretches filtered by type/body-area/search, plus the stretch log)
- progress: VolumeChart, TrendChart, MuscleFrequency, Heatmap, MonthCalendar, RecoveryMap, ActivityRings, WeeklyRecap, ActivityForm, BodyStatsForm, SleepForm, PRBadge, ProgressPhotos
- fx: Particles, CountUp · logo: **BrandMark** ("Pulse" — a weight-plate ring with a movement wave; matches the installed app icon exactly), LoadingScreen · ui: Modal, UiHost · coach: CoachMark · tour: Tour

## Design system
`src/styles/tokens.css` is the single source of truth (mirrored by `tailwind.config.js`). Semantic CSS vars, so the whole app re-skins from one file.
- Surfaces `--color-canvas` #F4F6F9 (page) · `--color-chalk` #FFF (cards) · `--color-ivory` #EEF2F7 (chips/inner) · `--color-obsidian` #0F172A (dark chrome)
- Text `--color-text-primary` #0F172A · `--color-text-secondary` #64748B · `--color-text-inverse` #FFF
- Accents **`--color-gold` #10B981 (primary emerald)** · `--color-ember` #FB7185 (energy/stretch) · `--color-sage` #0D9488 · `--color-ash` #94A3B8
- Type: `font-display` Plus Jakarta Sans (bold headings) · `font-sans` DM Sans · `font-mono` DM Mono. The old Cormorant serif is gone.
- **Contrast rule:** text on a `--color-gold`/`ember`/`sage` background must be `--color-text-inverse`, never `--color-obsidian`.

## App icons (`public/`)
All generated from the same "Pulse" artwork as `BrandMark`: `icon-192.png`, `icon-512.png`,
`icon-maskable-512.png` (full-bleed, artwork inset to Android's safe zone), `apple-touch-icon.png`
(180), `favicon-32.png` and a scalable `icon.svg`. Wired in `index.html` + the `vite.config.js`
manifest; `notifications.js` uses `icon-192.png`. Regenerate by re-rendering the SVG in
`BrandMark.jsx` at each size — the old 1 MB `lifter.png` photo is gone.

## Deliberately absent
Kept out to stay focused on training — do not re-add without being asked:
label/tag **colour pickers** (exercise, routine, workout), manual **workout tags**, a configurable **barbell weight** (fixed at 20 kg / 45 lb — see `utils/barbell.js`),
**share cards** (and the html2canvas dependency), per-type **notification toggles**
(one master switch + quiet hours only; the Plan tab owns session reminders),
and sound/tips preview buttons.

## Reusable patterns
- **Sound/haptics/fx**: `playChime(kind)`, `useHaptics()(kind)`, `<Particles/>`, `<CountUp/>` — gated by effects/sound + reduced-motion. Surviving cues: tick, tap, start, rest, delete, success, pr, goal.
- **Week math**: `weekKeyOf`/`weekStartMs` in `utils/week.js` (Monday-aligned).
- **Schedule**: `templates.dayOfWeek` (0=Sun..6=Sat) is the schedule; `nextSession()` reads it for "today / next / rest day".
- **Delete-revert**: deleteWorkout → recomputePRs + unlink stretchLogs + recomputeStreak.
- **Persisted prefs**: settingsStore `load()`/`persist()` over an explicit `PERSISTED` list.
- **Guided timers**: pure sequencing (`stretchSession`) + a component that owns the clock (`StretchRunner`) — reuse for any follow-along flow.
