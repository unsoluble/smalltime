export const ST_Config = {};

ST_Config.MoonPhases = ['new', 'waxing-crescent', 'first-quarter', 'waxing-gibbous', 'full', 'waning-gibbous', 'last-quarter', 'waning-crescent'];

ST_Config.PhaseValues = {
  0: 0,
  1: 0.25,
  2: 0.5,
  3: 0.75,
  4: 1,
  5: 0.75,
  6: 0.5,
  7: 0.25,
};

// Saving the default core Darkness color for reference.
ST_Config.coreDarknessColor = 2368584;
ST_Config.activeDarknessColor = ST_Config.coreDarknessColor;

// Default offset from the Player List window when pinned,
// an Epoch offset for game systems that don't start at midnight,
// plus custom offsets for game systems that draw extra borders
// around their windows. Also default values for sunrise/set.
ST_Config.PinOffset = 83;
ST_Config.EpochOffset = 0;

ST_Config.SunriseStartDefault = 180;
ST_Config.SunriseEndDefault = 420;
ST_Config.SunsetStartDefault = 1050;
ST_Config.SunsetEndDefault = 1320;
ST_Config.DawnDuskSpread = 240;

ST_Config.MaxDarknessDefault = 1;
ST_Config.MinDarknessDefault = 0;

export class Helpers {
  static #cachedSystemDateFormats = null;
  static #cachedSystemDateFormatsKey = '';

  static getDarknessBackingFieldNames() {
    return [
      'smalltime.max-darkness',
      'smalltime.min-darkness',
      'smalltime.sunrise-start',
      'smalltime.sunrise-end',
      'smalltime.sunset-start',
      'smalltime.sunset-end',
    ];
  }

  static getDarknessBackingInputs(root = document) {
    return {
      maxDarkness: root.querySelector('input[name="smalltime.max-darkness"]'),
      minDarkness: root.querySelector('input[name="smalltime.min-darkness"]'),
      sunriseStart: root.querySelector('input[name="smalltime.sunrise-start"]'),
      sunriseEnd: root.querySelector('input[name="smalltime.sunrise-end"]'),
      sunsetStart: root.querySelector('input[name="smalltime.sunset-start"]'),
      sunsetEnd: root.querySelector('input[name="smalltime.sunset-end"]'),
    };
  }

  static syncDarknessBackingInputs(positions, max, min, root = document) {
    const inputs = Helpers.getDarknessBackingInputs(root);

    if (positions) {
      if (inputs.sunriseStart) inputs.sunriseStart.value = Helpers.convertPositionToTimeInteger(positions.sunriseStart);
      if (inputs.sunriseEnd) inputs.sunriseEnd.value = Helpers.convertPositionToTimeInteger(positions.sunriseEnd);
      if (inputs.sunsetStart) inputs.sunsetStart.value = Helpers.convertPositionToTimeInteger(positions.sunsetStart);
      if (inputs.sunsetEnd) inputs.sunsetEnd.value = Helpers.convertPositionToTimeInteger(positions.sunsetEnd);
    }

    // Set the max or min Darkness, depending on which was passed.
    if (min === false && inputs.maxDarkness) inputs.maxDarkness.value = max;
    if (max === false && inputs.minDarkness) inputs.minDarkness.value = min;
  }

  static async updateSunriseSunsetTimes() {
    // Intentionally no-op: sunrise/sunset sync from third-party calendar modules was removed.
  }

  static handleRealtimeState() {
    // Reserved for future realtime state integration.
  }

  static updateGradientStops() {
    // Make the CSS linear gradient stops proportionally match the custom sunrise/sunset times.
    // Also used to build the gradient stops in the Settings screen.
    const initialPositions = {
      sunriseStart: Helpers.convertTimeIntegerToPosition(game.settings.get('smalltime', 'sunrise-start')),
      sunriseEnd: Helpers.convertTimeIntegerToPosition(game.settings.get('smalltime', 'sunrise-end')),
      sunsetStart: Helpers.convertTimeIntegerToPosition(game.settings.get('smalltime', 'sunset-start')),
      sunsetEnd: Helpers.convertTimeIntegerToPosition(game.settings.get('smalltime', 'sunset-end')),
    };

    const sunriseMiddle1 = Math.round((initialPositions.sunriseStart * 2) / 3 + (initialPositions.sunriseEnd * 1) / 3);
    const sunriseMiddle2 = Math.round((initialPositions.sunriseStart * 1) / 3 + (initialPositions.sunriseEnd * 2) / 3);
    const sunsetMiddle1 = Math.round((initialPositions.sunsetStart * 2) / 3 + (initialPositions.sunsetEnd * 1) / 3);
    const sunsetMiddle2 = Math.round((initialPositions.sunsetStart * 1) / 3 + (initialPositions.sunsetEnd * 2) / 3);

    // Set the initial gradient transition points.
    document.documentElement.style.setProperty(
      '--SMLTME-sunrise-start',
      Helpers.convertTimeIntegerToPercentage(game.settings.get('smalltime', 'sunrise-start')),
    );
    document.documentElement.style.setProperty(
      '--SMLTME-sunrise-middle-1',
      Helpers.convertTimeIntegerToPercentage(Helpers.convertPositionToTimeInteger(sunriseMiddle1)),
    );
    document.documentElement.style.setProperty(
      '--SMLTME-sunrise-middle-2',
      Helpers.convertTimeIntegerToPercentage(Helpers.convertPositionToTimeInteger(sunriseMiddle2)),
    );
    document.documentElement.style.setProperty('--SMLTME-sunrise-end', Helpers.convertTimeIntegerToPercentage(game.settings.get('smalltime', 'sunrise-end')));
    document.documentElement.style.setProperty('--SMLTME-sunset-start', Helpers.convertTimeIntegerToPercentage(game.settings.get('smalltime', 'sunset-start')));
    document.documentElement.style.setProperty(
      '--SMLTME-sunset-middle-1',
      Helpers.convertTimeIntegerToPercentage(Helpers.convertPositionToTimeInteger(sunsetMiddle1)),
    );
    document.documentElement.style.setProperty(
      '--SMLTME-sunset-middle-2',
      Helpers.convertTimeIntegerToPercentage(Helpers.convertPositionToTimeInteger(sunsetMiddle2)),
    );
    document.documentElement.style.setProperty('--SMLTME-sunset-end', Helpers.convertTimeIntegerToPercentage(game.settings.get('smalltime', 'sunset-end')));
  }

  static async saveNewDarknessConfig(positions, max, min, root = document) {
    Helpers.syncDarknessBackingInputs(positions, max, min, root);
  }

  static setupDragHandles(root = document) {
    // Build the sun/moon drag handles for the darkness config UI.
    const maxDarkness = game.settings.get('smalltime', 'max-darkness');
    const minDarkness = game.settings.get('smalltime', 'min-darkness');

    document.documentElement.style.setProperty('--SMLTME-darkness-max', maxDarkness);
    document.documentElement.style.setProperty('--SMLTME-darkness-min', minDarkness);

    const initialPositions = {
      sunriseStart: Helpers.convertTimeIntegerToPosition(game.settings.get('smalltime', 'sunrise-start')),
      sunriseEnd: Helpers.convertTimeIntegerToPosition(game.settings.get('smalltime', 'sunrise-end')),
      sunsetStart: Helpers.convertTimeIntegerToPosition(game.settings.get('smalltime', 'sunset-start')),
      sunsetEnd: Helpers.convertTimeIntegerToPosition(game.settings.get('smalltime', 'sunset-end')),
    };

    const initialTimes = {
      sunriseStart: Helpers.convertPositionToDisplayTime(initialPositions.sunriseStart),
      sunriseEnd: Helpers.convertPositionToDisplayTime(initialPositions.sunriseEnd),
      sunsetStart: Helpers.convertPositionToDisplayTime(initialPositions.sunsetStart),
      sunsetEnd: Helpers.convertPositionToDisplayTime(initialPositions.sunsetEnd),
    };

    const snapX = 10;
    const snapY = 4;

    const offsetBetween = 20;

    const sunriseStartElement = root.querySelector('.sunrise-start');
    const sunriseEndElement = root.querySelector('.sunrise-end');
    const sunsetStartElement = root.querySelector('.sunset-start');
    const sunsetEndElement = root.querySelector('.sunset-end');

    if (!sunriseStartElement || !sunriseEndElement || !sunsetStartElement || !sunsetEndElement) return;

    const setHandleTop = (element, top) => {
      element.style.top = `${top}px`;
    };
    const setHandleLeft = (element, left) => {
      element.style.left = `${left}px`;
    };
    const setHandleLabel = (element, label) => {
      element.setAttribute('aria-label', label);
    };

    setHandleTop(sunriseStartElement, Helpers.convertDarknessToPostion(maxDarkness));
    setHandleLeft(sunriseStartElement, initialPositions.sunriseStart);
    setHandleLabel(sunriseStartElement, initialTimes.sunriseStart);

    setHandleTop(sunriseEndElement, Helpers.convertDarknessToPostion(minDarkness) + 1);
    setHandleLeft(sunriseEndElement, initialPositions.sunriseEnd);
    setHandleLabel(sunriseEndElement, initialTimes.sunriseEnd);

    setHandleTop(sunsetStartElement, Helpers.convertDarknessToPostion(minDarkness) + 1);
    setHandleLeft(sunsetStartElement, initialPositions.sunsetStart);
    setHandleLabel(sunsetStartElement, initialTimes.sunsetStart);

    setHandleTop(sunsetEndElement, Helpers.convertDarknessToPostion(maxDarkness));
    setHandleLeft(sunsetEndElement, initialPositions.sunsetEnd);
    setHandleLabel(sunsetEndElement, initialTimes.sunsetEnd);

    Helpers.updateGradientStops();

    // Create the drag handles.
    const sunriseStartDrag = new Draggabilly(sunriseStartElement, {
      containment: '.sunrise-start-bounds',
      grid: [snapX, snapY],
    });
    const sunriseEndDrag = new Draggabilly(sunriseEndElement, {
      containment: '.sunrise-end-bounds',
      grid: [snapX, snapY],
    });
    const sunsetStartDrag = new Draggabilly(sunsetStartElement, {
      containment: '.sunset-start-bounds',
      grid: [snapX, snapY],
    });
    const sunsetEndDrag = new Draggabilly(sunsetEndElement, {
      containment: '.sunset-end-bounds',
      grid: [snapX, snapY],
    });

    let shovedPos = '';
    let newTransition = '';

    sunriseStartDrag.on('dragMove', function () {
      // Match the paired handle.
      setHandleTop(sunsetEndElement, this.position.y);
      // Update the tooltip.
      let displayTime = Helpers.convertPositionToDisplayTime(this.position.x);
      setHandleLabel(sunriseStartElement, displayTime);

      // Live update the darkness maximum.
      document.documentElement.style.setProperty('--SMLTME-darkness-max', Helpers.convertPositionToDarkness(this.position.y));

      // Live update the gradient transition point.
      newTransition = Helpers.convertTimeIntegerToPercentage(Helpers.convertPositionToTimeInteger(this.position.x));
      document.documentElement.style.setProperty('--SMLTME-sunrise-start', newTransition);

      // Shove other handle on collisions.
      if (this.position.x >= sunriseEndDrag.position.x - offsetBetween) {
        shovedPos = this.position.x + offsetBetween;
        setHandleLeft(sunriseEndElement, shovedPos);
        setHandleLabel(sunriseEndElement, Helpers.convertPositionToDisplayTime(shovedPos));
        sunriseEndDrag.setPosition(shovedPos);
        newTransition = Helpers.convertTimeIntegerToPercentage(Helpers.convertPositionToTimeInteger(shovedPos));
        document.documentElement.style.setProperty('--SMLTME-sunrise-end', newTransition);
      }
    });

    sunriseEndDrag.on('dragMove', function () {
      // Match the paired handle.
      setHandleTop(sunsetStartElement, this.position.y);
      // Update the tooltip.
      let displayTime = Helpers.convertPositionToDisplayTime(this.position.x);
      setHandleLabel(sunriseEndElement, displayTime);

      // Live update the darkness minimum.
      document.documentElement.style.setProperty('--SMLTME-darkness-min', Helpers.convertPositionToDarkness(this.position.y));

      // Live update the gradient transition point.
      newTransition = Helpers.convertTimeIntegerToPercentage(Helpers.convertPositionToTimeInteger(this.position.x));
      document.documentElement.style.setProperty('--SMLTME-sunrise-end', newTransition);

      // Shove other handle on collisions.
      if (this.position.x <= sunriseStartDrag.position.x + offsetBetween) {
        shovedPos = this.position.x - offsetBetween;
        setHandleLeft(sunriseStartElement, shovedPos);
        setHandleLabel(sunriseStartElement, Helpers.convertPositionToDisplayTime(shovedPos));
        sunriseStartDrag.setPosition(shovedPos);
        newTransition = Helpers.convertTimeIntegerToPercentage(Helpers.convertPositionToTimeInteger(shovedPos));
        document.documentElement.style.setProperty('--SMLTME-sunrise-start', newTransition);
      }
    });

    sunsetStartDrag.on('dragMove', function () {
      // Match the paired handle.
      setHandleTop(sunriseEndElement, this.position.y);
      // Update the tooltip.
      let displayTime = Helpers.convertPositionToDisplayTime(this.position.x);
      setHandleLabel(sunsetStartElement, displayTime);

      // Live update the darkness minimum.
      document.documentElement.style.setProperty('--SMLTME-darkness-min', Helpers.convertPositionToDarkness(this.position.y));

      // Live update the gradient transition point.
      newTransition = Helpers.convertTimeIntegerToPercentage(Helpers.convertPositionToTimeInteger(this.position.x));
      document.documentElement.style.setProperty('--SMLTME-sunset-start', newTransition);

      // Shove other handle on collisions.
      if (this.position.x >= sunsetEndDrag.position.x - offsetBetween) {
        shovedPos = this.position.x + offsetBetween;
        setHandleLeft(sunsetEndElement, shovedPos);
        setHandleLabel(sunsetEndElement, Helpers.convertPositionToDisplayTime(shovedPos));
        sunsetEndDrag.setPosition(shovedPos);
        newTransition = Helpers.convertTimeIntegerToPercentage(Helpers.convertPositionToTimeInteger(shovedPos));
        document.documentElement.style.setProperty('--SMLTME-sunset-end', newTransition);
      }
    });

    sunsetEndDrag.on('dragMove', function () {
      // Match the paired handle.
      setHandleTop(sunriseStartElement, this.position.y);
      // Update the tooltip.
      let displayTime = Helpers.convertPositionToDisplayTime(this.position.x);
      setHandleLabel(sunsetEndElement, displayTime);

      // Live update the darkness maximum.
      document.documentElement.style.setProperty('--SMLTME-darkness-max', Helpers.convertPositionToDarkness(this.position.y));

      // Live update the gradient transition point.
      newTransition = Helpers.convertTimeIntegerToPercentage(Helpers.convertPositionToTimeInteger(this.position.x));
      document.documentElement.style.setProperty('--SMLTME-sunset-end', newTransition);

      // Shove other handle on collisions.
      if (this.position.x <= sunsetStartDrag.position.x + offsetBetween) {
        shovedPos = this.position.x - offsetBetween;
        setHandleLeft(sunsetStartElement, shovedPos);
        setHandleLabel(sunsetStartElement, Helpers.convertPositionToDisplayTime(shovedPos));
        sunsetStartDrag.setPosition(shovedPos);
        newTransition = Helpers.convertTimeIntegerToPercentage(Helpers.convertPositionToTimeInteger(shovedPos));
        document.documentElement.style.setProperty('--SMLTME-sunset-start', newTransition);
      }
    });

    sunriseStartDrag.on('dragEnd', async function () {
      const newPositions = {
        sunriseStart: sunriseStartDrag.position.x,
        sunriseEnd: sunriseEndDrag.position.x,
        sunsetStart: sunsetStartDrag.position.x,
        sunsetEnd: sunsetEndDrag.position.x,
      };
      let newMaxDarkness = Helpers.convertPositionToDarkness(this.position.y);
      if (newMaxDarkness > 1) newMaxDarkness = 1;
      Helpers.saveNewDarknessConfig(newPositions, newMaxDarkness, false, root);
    });

    sunriseEndDrag.on('dragEnd', async function () {
      const newPositions = {
        sunriseStart: sunriseStartDrag.position.x,
        sunriseEnd: sunriseEndDrag.position.x,
        sunsetStart: sunsetStartDrag.position.x,
        sunsetEnd: sunsetEndDrag.position.x,
      };
      let newMinDarkness = Helpers.convertPositionToDarkness(this.position.y);
      if (newMinDarkness < 0) newMinDarkness = 0;
      Helpers.saveNewDarknessConfig(newPositions, false, newMinDarkness, root);
    });

    sunsetStartDrag.on('dragEnd', async function () {
      const newPositions = {
        sunriseStart: sunriseStartDrag.position.x,
        sunriseEnd: sunriseEndDrag.position.x,
        sunsetStart: sunsetStartDrag.position.x,
        sunsetEnd: sunsetEndDrag.position.x,
      };
      let newMinDarkness = Helpers.convertPositionToDarkness(this.position.y);
      if (newMinDarkness < 0) newMinDarkness = 0;
      Helpers.saveNewDarknessConfig(newPositions, false, newMinDarkness, root);
    });

    sunsetEndDrag.on('dragEnd', async function () {
      const newPositions = {
        sunriseStart: sunriseStartDrag.position.x,
        sunriseEnd: sunriseEndDrag.position.x,
        sunsetStart: sunsetStartDrag.position.x,
        sunsetEnd: sunsetEndDrag.position.x,
      };
      let newMaxDarkness = Helpers.convertPositionToDarkness(this.position.y);
      if (newMaxDarkness > 1) newMaxDarkness = 1;
      Helpers.saveNewDarknessConfig(newPositions, newMaxDarkness, false, root);
    });
  }

  static convertTimeIntegerToPercentage(time) {
    // Percentage is a proportion of the current time out of the 1440-minute day.
    return Math.round((time / 1440) * 100) + '%';
  }

  static convertPositionToTimeInteger(position) {
    return position * 3;
  }

  static convertTimeIntegerToPosition(timeInteger) {
    return timeInteger / 3;
  }

  static convertDarknessToPostion(darkness) {
    return darkness * 45 + 2;
  }

  static convertPositionToDarkness(position) {
    let darkCalc = Math.round((1 - (position - 45) / -40) * 10) / 10;
    return Math.min(Math.max(darkCalc, 0), 1);
  }

  static convertPositionToDisplayTime(position) {
    const displayTimeObj = SmallTimeApp.convertTimeIntegerToDisplay(Helpers.convertPositionToTimeInteger(position));
    return displayTimeObj.hours + ':' + displayTimeObj.minutes;
  }

  static convertDisplayObjToString(displayObj) {
    return displayObj.hours + ':' + displayObj.minutes;
  }

  static getPF2eWorldClockSecondsOfDay() {
    if (game.system?.id !== 'pf2e') return null;

    const worldTime = game.pf2e?.worldClock?.worldTime;
    if (!worldTime) return null;

    const hour = typeof worldTime.hour === 'number' ? worldTime.hour : null;
    const minute = typeof worldTime.minute === 'number' ? worldTime.minute : null;
    const second = typeof worldTime.second === 'number' ? worldTime.second : 0;
    if (hour === null || minute === null) return null;

    return hour * 3600 + minute * 60 + second;
  }

  static getWorldTimeSecondsOfDay() {
    const pf2eSeconds = Helpers.getPF2eWorldClockSecondsOfDay();
    if (pf2eSeconds !== null) return pf2eSeconds;

    const currentWorldTime = game.time.worldTime + ST_Config.EpochOffset;
    const normalized = ((currentWorldTime % 86400) + 86400) % 86400;
    return Math.trunc(normalized);
  }

  static getProvidedMoonPhaseIndex() {
    const calendariaApi = Helpers.getCalendariaApi();
    const moonPhase = calendariaApi?.getMoonPhase?.(0);
    if (!moonPhase) return null;

    if (Number.isInteger(moonPhase.phaseIndex)) {
      const normalized = ((moonPhase.phaseIndex % ST_Config.MoonPhases.length) + ST_Config.MoonPhases.length) % ST_Config.MoonPhases.length;
      return normalized;
    }

    if (typeof moonPhase.position === 'number' && Number.isFinite(moonPhase.position)) {
      const normalizedPosition = ((moonPhase.position % 1) + 1) % 1;
      return Math.min(ST_Config.MoonPhases.length - 1, Math.floor(normalizedPosition * ST_Config.MoonPhases.length));
    }

    return null;
  }

  static getCurrentMoonPhaseIndex() {
    const providedPhase = Helpers.getProvidedMoonPhaseIndex();
    if (providedPhase !== null) return providedPhase;
    return game.settings.get('smalltime', 'moon-phase');
  }

  static normalizeHexColor(color) {
    if (typeof color !== 'string') return null;
    const trimmed = color.trim();
    const withHash = trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
    return /^#[0-9a-fA-F]{6}$/.test(withHash) ? withHash.toLowerCase() : null;
  }

  static mixHexColors(baseHex, tintHex, amount) {
    const base = Helpers.normalizeHexColor(baseHex);
    const tint = Helpers.normalizeHexColor(tintHex);
    if (!base || !tint) return baseHex;

    const clampedAmount = Math.min(Math.max(Number(amount) || 0, 0), 1);
    const parse = (hex, offset) => parseInt(hex.slice(offset, offset + 2), 16);
    const lerp = (a, b, t) => Math.round(a + (b - a) * t);

    const r = lerp(parse(base, 1), parse(tint, 1), clampedAmount);
    const g = lerp(parse(base, 3), parse(tint, 3), clampedAmount);
    const b = lerp(parse(base, 5), parse(tint, 5), clampedAmount);
    return `#${[r, g, b]
      .map((value) => value.toString(16).padStart(2, '0'))
      .join('')}`;
  }

  static getProviderMoonColor() {
    const calendariaApi = Helpers.getCalendariaApi();
    const calendar = calendariaApi?.getActiveCalendar?.();
    const firstMoon = calendar?.moonsArray?.[0] ?? Object.values(calendar?.moons ?? {})[0];
    return Helpers.normalizeHexColor(firstMoon?.color ?? null);
  }

  static getMoonIlluminationFromPosition(position) {
    if (typeof position !== 'number' || !Number.isFinite(position)) return 0;
    const normalized = ((position % 1) + 1) % 1;
    // New moon ~= 0.0, full moon ~= 0.5
    return (1 - Math.cos(normalized * Math.PI * 2)) / 2;
  }

  static getCalendariaMoonTintData() {
    const calendariaApi = Helpers.getCalendariaApi();
    if (!calendariaApi) return null;

    const calendar = calendariaApi.getActiveCalendar?.();
    const moons = calendar?.moonsArray ?? Object.values(calendar?.moons ?? {});
    if (!moons?.length) return null;

    let weightedR = 0;
    let weightedG = 0;
    let weightedB = 0;
    let totalWeight = 0;

    for (let index = 0; index < moons.length; index++) {
      const moonColor = Helpers.normalizeHexColor(moons[index]?.color ?? null);
      if (!moonColor) continue;

      const phaseData = calendariaApi.getMoonPhase?.(index);
      const illumination = Helpers.getMoonIlluminationFromPosition(phaseData?.position);
      if (illumination <= 0) continue;

      const r = parseInt(moonColor.slice(1, 3), 16);
      const g = parseInt(moonColor.slice(3, 5), 16);
      const b = parseInt(moonColor.slice(5, 7), 16);

      weightedR += r * illumination;
      weightedG += g * illumination;
      weightedB += b * illumination;
      totalWeight += illumination;
    }

    if (totalWeight <= 0) return null;

    const blendedHex = `#${[weightedR / totalWeight, weightedG / totalWeight, weightedB / totalWeight]
      .map((value) => Math.round(value).toString(16).padStart(2, '0'))
      .join('')}`;

    const averageIllumination = totalWeight / moons.length;
    return {
      color: blendedHex,
      illumination: Math.min(Math.max(averageIllumination, 0), 1),
    };
  }

  static async applyMoonTint(currentPhase, timeNow) {
    const scene = canvas.scene ?? game.scenes.viewed;
    if (!scene) return;

    const isNight = !(timeNow >= game.settings.get('smalltime', 'sunrise-end') && timeNow < game.settings.get('smalltime', 'sunset-start'));
    const hasMoonTintSetting = game.settings.get('smalltime', 'moon-tint');
    const hasDarknessLink = !!scene.getFlag('smalltime', 'darkness-link');
    const calendariaMoonTint = Helpers.getCalendariaMoonTintData();
    const moonColor = calendariaMoonTint?.color ?? Helpers.getProviderMoonColor();

    let nextDarknessColor = ST_Config.coreDarknessColor;
    if (hasMoonTintSetting && hasDarknessLink && isNight && moonColor) {
      const baseHex = `#${ST_Config.coreDarknessColor.toString(16).padStart(6, '0')}`;
      const phaseWeight = calendariaMoonTint?.illumination ?? ST_Config.PhaseValues[currentPhase] ?? 0;
      const impactWeight = Math.min(Math.max(game.settings.get('smalltime', 'phase-impact') ?? 0, 0), 1);
      const tintAmount = Math.min(0.6, phaseWeight * impactWeight);
      const mixedHex = Helpers.mixHexColors(baseHex, moonColor, tintAmount);
      nextDarknessColor = parseInt(mixedHex.slice(1), 16);
    }

    if (nextDarknessColor === ST_Config.activeDarknessColor) return;
    ST_Config.activeDarknessColor = nextDarknessColor;
    CONFIG.Canvas.darknessColor = nextDarknessColor;

    if (canvas?.environment?.initialize) {
      canvas.environment.initialize({ environment: { darknessLevel: canvas.environment.darknessLevel } });
    }
  }

  // Convert worldTime (seconds elapsed) into an integer time of day.
  static getWorldTimeAsDayTime() {
    const secondsOfDay = Helpers.getWorldTimeSecondsOfDay();
    return Math.trunc(secondsOfDay / 60);
  }

  // Advance/retreat the elapsed worldTime based on changes made.
  static async setWorldTime(newTime) {
    const dayTime = Helpers.getWorldTimeAsDayTime();
    const delta = newTime - dayTime;
    game.time.advance(delta * 60);
  }

  // Helper function for time-changing socket updates.
  static handleTimeChange(timeInteger) {
    SmallTimeApp.timeTransition(timeInteger);
    const hourStringElement = document.getElementById('hourString');
    const minuteStringElement = document.getElementById('minuteString');
    if (hourStringElement) hourStringElement.textContent = SmallTimeApp.convertTimeIntegerToDisplay(timeInteger).hours;
    if (minuteStringElement) minuteStringElement.textContent = SmallTimeApp.convertTimeIntegerToDisplay(timeInteger).minutes;

    // Calculate and show the current seconds if required.
    if (game.settings.get('smalltime', 'time-format') == 24 && game.settings.get('smalltime', 'show-seconds') == true) {
      let seconds = Helpers.getWorldTimeSecondsOfDay() % 60;
      if (seconds < 10) seconds = '0' + seconds;
      if (seconds == 60) seconds = '00';
      const secondStringElement = document.getElementById('secondString');
      const secondsSpanElement = document.getElementById('secondsSpan');
      if (secondStringElement) secondStringElement.textContent = seconds;
      if (secondsSpanElement) secondsSpanElement.style.display = 'inline';
    } else {
      const secondsSpanElement = document.getElementById('secondsSpan');
      if (secondsSpanElement) secondsSpanElement.style.display = 'none';
    }

    const timeSliderElement = document.getElementById('timeSlider');
    if (timeSliderElement) timeSliderElement.value = String(timeInteger);
    Helpers.handleRealtimeState();
    SmallTimeApp.updateDate();
  }

  static getDate(variant) {
    const numericVariant = Number(variant);
    const customVariant = Number.isFinite(numericVariant) ? numericVariant - 12 : -1;
    if (customVariant >= 0) {
      const customDate = Helpers.getSystemDateByVariant(customVariant) ?? Helpers.getAdditionalSystemDateByVariant(customVariant);
      if (customDate) return customDate;
    }

    let day;
    let monthName;
    let month;
    let date;
    let year;
    let yearPostfix;
    let yearPrefix;
    let ordinalSuffix;
    let displayDate = [];

    const pf2eDateParts = Helpers.getPF2eDateParts();
    if (pf2eDateParts) {
      day = pf2eDateParts.day;
      monthName = pf2eDateParts.monthName;
      month = pf2eDateParts.month;
      date = pf2eDateParts.date;
      year = pf2eDateParts.year;
      ordinalSuffix = '';
      yearPrefix = undefined;
      yearPostfix = pf2eDateParts.era;
    } else {
      const calendar = game.time?.calendar;
      if (calendar) {
      const components = calendar.timeToComponents(game.time.worldTime);
      const weekdayData = calendar.days?.values?.[components.dayOfWeek];
      const monthData = calendar.months?.values?.[components.month];
      day = weekdayData ? game.i18n.localize(weekdayData.name) : undefined;
      monthName = monthData ? game.i18n.localize(monthData.name) : undefined;
      month = monthData?.ordinal ?? components.month + 1;
      date = components.dayOfMonth + 1;
      year = components.year + (calendar.years?.yearZero ?? 0);
      ordinalSuffix = '';
      yearPrefix = undefined;
      yearPostfix = undefined;
      } else {
        year = '';
      }
    }

    // Thursday, August 12th, 2021 C.E.
    displayDate.push(
      Helpers.stringAfter(day, ', ') +
        Helpers.stringAfter(monthName) +
        Helpers.stringAfter(date + (ordinalSuffix ? ordinalSuffix : ''), ', ') +
        Helpers.stringAfter(yearPrefix) +
        year +
        Helpers.stringBefore(yearPostfix),
    );

    // Thursday, August 12th
    displayDate.push(Helpers.stringAfter(day, ', ') + Helpers.stringAfter(monthName) + Helpers.stringAfter(date + (ordinalSuffix ? ordinalSuffix : '')));

    // Thursday August, 2021
    displayDate.push(Helpers.stringAfter(day, ' ') + Helpers.stringAfter(monthName, ', ') + year);

    // August 12th, 2021
    displayDate.push(
      Helpers.stringAfter(monthName) + Helpers.stringAfter(date + (ordinalSuffix ? ordinalSuffix : ''), ', ') + Helpers.stringAfter(yearPrefix) + year,
    );

    // August 12th
    displayDate.push(Helpers.stringAfter(monthName) + Helpers.stringAfter(date + (ordinalSuffix ? ordinalSuffix : '')));

    // Thursday, 12 August, 2021 C.E.
    displayDate.push(
      Helpers.stringAfter(day, ', ') +
        Helpers.stringAfter(date) +
        Helpers.stringAfter(monthName, ', ') +
        Helpers.stringAfter(yearPrefix) +
        year +
        Helpers.stringBefore(yearPostfix),
    );

    // Thursday, 12 August
    displayDate.push(Helpers.stringAfter(day, ', ') + Helpers.stringAfter(date) + Helpers.stringAfter(monthName));

    // 12 August, 2021
    displayDate.push(Helpers.stringAfter(date) + Helpers.stringAfter(monthName, ', ') + year);

    // 12 August
    displayDate.push(Helpers.stringAfter(date) + Helpers.stringAfter(monthName));

    // 12 / 8 / 2021
    displayDate.push(Helpers.stringAfter(date, ' / ') + Helpers.stringAfter(month, ' / ') + year);

    // 8 / 12 / 2021
    displayDate.push(Helpers.stringAfter(month, ' / ') + Helpers.stringAfter(date, ' / ') + year);

    // 2021 / 8 / 12
    displayDate.push(Helpers.stringAfter(year, ' / ') + Helpers.stringAfter(month, ' / ') + date);

    return displayDate[numericVariant] ?? displayDate[0];
  }

  static getPF2eDateParts() {
    if (game.system?.id !== 'pf2e') return null;

    const worldClock = game.pf2e?.worldClock;
    const worldTime = worldClock?.worldTime;
    if (!worldClock || !worldTime) return null;

    const monthNumber = typeof worldTime.month === 'number' ? worldTime.month : undefined;
    const dayOfMonth = typeof worldTime.day === 'number' ? worldTime.day : undefined;
    const displayYear = typeof worldClock.year === 'number' ? worldClock.year : undefined;
    if (monthNumber === undefined || dayOfMonth === undefined || displayYear === undefined) return null;

    return {
      day: typeof worldClock.weekday === 'string' ? worldClock.weekday : undefined,
      monthName: typeof worldClock.month === 'string' ? worldClock.month : undefined,
      month: monthNumber,
      date: dayOfMonth,
      year: displayYear,
      era: typeof worldClock.era === 'string' ? worldClock.era : undefined,
    };
  }

  static getDateFormatOptions() {
    const options = [];
    for (let i = 0; i <= 11; i++) {
      options.push({
        value: i,
        label: Helpers.getDate(i),
        source: 'smalltime',
      });
    }

    const systemDateFormats = Helpers.getSystemDateFormatters();
    systemDateFormats.forEach((format, index) => {
      const preview = Helpers.getSystemDateByVariant(index) ?? Helpers.getDate(0);
      options.push({
        value: 12 + index,
        label: `${preview} (${game.i18n.localize(format.label)})`,
        source: 'system',
      });
    });

    const extraSystemFormats = Helpers.getAdditionalSystemDateFormats();
    extraSystemFormats.forEach((format, index) => {
      const preview = Helpers.getAdditionalSystemDateByVariant(systemDateFormats.length + index) ?? Helpers.getDate(0);
      options.push({
        value: 12 + systemDateFormats.length + index,
        label: `${preview} (${format.label})`,
        source: format.source ?? 'system',
      });
    });

    return options;
  }

  static getSystemDateByVariant(variant) {
    const calendar = game.time?.calendar;
    if (!calendar) return null;
    const format = Helpers.getSystemDateFormatters()[variant];
    if (!format?.formatter) return null;

    try {
      const components = calendar.timeToComponents(game.time.worldTime);
      return calendar.format(components, format.formatter);
    } catch (_error) {
      return null;
    }
  }

  static getAdditionalSystemDateFormats() {
    const formats = [];

    const calendariaApi = Helpers.getCalendariaApi();
    if (calendariaApi) {
      const calendariaDatePresets = [
        ['approxDate', 'CALENDARIA.Format.Preset.ApproxDate'],
        ['dateShort', 'CALENDARIA.Format.Preset.DateShort'],
        ['dateMedium', 'CALENDARIA.Format.Preset.DateMedium'],
        ['dateLong', 'CALENDARIA.Format.Preset.DateLong'],
        ['dateFull', 'CALENDARIA.Format.Preset.DateFull'],
        ['dateUS', 'CALENDARIA.Format.Preset.DateUS'],
        ['dateUSFull', 'CALENDARIA.Format.Preset.DateUSFull'],
        ['dateISO', 'CALENDARIA.Format.Preset.DateISO'],
        ['dateNumericUS', 'CALENDARIA.Format.Preset.DateNumericUS'],
        ['dateNumericEU', 'CALENDARIA.Format.Preset.DateNumericEU'],
        ['ordinal', 'CALENDARIA.Format.Preset.Ordinal'],
        ['ordinalLong', 'CALENDARIA.Format.Preset.OrdinalLong'],
        ['ordinalEra', 'CALENDARIA.Format.Preset.OrdinalEra'],
        ['ordinalFull', 'CALENDARIA.Format.Preset.OrdinalFull'],
        ['seasonDate', 'CALENDARIA.Format.Preset.SeasonDate'],
        ['weekHeader', 'CALENDARIA.Format.Preset.WeekHeader'],
        ['yearOnly', 'CALENDARIA.Format.Preset.YearOnly'],
        ['yearEra', 'CALENDARIA.Format.Preset.YearEra'],
      ];

      for (const [preset, key] of calendariaDatePresets) {
        formats.push({
          id: `calendaria:${preset}`,
          label: game.i18n.has(key) ? game.i18n.localize(key) : preset,
          source: 'module',
        });
      }
    }

    if (game.system?.id === 'pf2e' && game.pf2e?.worldClock) {
      const localizedWorldClockLabel =
        game.i18n.has('PF2E.WorldClock.Title') ? game.i18n.localize('PF2E.WorldClock.Title') : game.i18n.localize('PF2E.SETTINGS.WorldClock.Name');
      formats.push({
        id: 'pf2e-world-clock',
        label: localizedWorldClockLabel,
        source: 'system',
      });
    }

    return formats;
  }

  static getAdditionalSystemDateByVariant(variant) {
    const systemDateFormatterCount = Helpers.getSystemDateFormatters().length;
    const offset = variant - systemDateFormatterCount;
    if (offset < 0) return null;

    const format = Helpers.getAdditionalSystemDateFormats()[offset];
    if (!format) return null;

    if (format.id.startsWith('calendaria:')) {
      const calendariaApi = Helpers.getCalendariaApi();
      if (!calendariaApi?.formatDate) return null;
      const preset = format.id.slice('calendaria:'.length);
      try {
        return calendariaApi.formatDate(null, preset);
      } catch (_error) {
        return null;
      }
    }

    if (format.id === 'pf2e-world-clock') {
      return Helpers.getPF2eWorldClockFormattedDate();
    }

    return null;
  }

  static getCalendariaApi() {
    const module = game.modules?.get('calendaria');
    if (!module?.active) return null;
    return globalThis.CALENDARIA?.api ?? null;
  }

  static getPF2eOrdinalDay(dayNumber) {
    const day = Number(dayNumber);
    if (!Number.isFinite(day)) return String(dayNumber ?? '');

    try {
      const ordinalCategory = new Intl.PluralRules(game.i18n.lang, { type: 'ordinal' }).select(day);
      const suffixKey = `PF2E.OrdinalSuffixes.${ordinalCategory}`;
      if (game.i18n.has(suffixKey) && game.i18n.has('PF2E.OrdinalNumber')) {
        const suffix = game.i18n.localize(suffixKey);
        return game.i18n.format('PF2E.OrdinalNumber', { value: day, suffix });
      }
    } catch (_error) {
      // Fall through to plain number output below.
    }

    return String(day);
  }

  static getPF2eWorldClockFormattedDate() {
    if (game.system?.id !== 'pf2e') return null;

    const worldClock = game.pf2e?.worldClock;
    const worldTime = worldClock?.worldTime;
    if (!worldClock || !worldTime) return null;

    if (worldClock.dateTheme === 'CE' && typeof worldTime.toLocaleString === 'function') {
      const luxonDateTime = globalThis.DateTime;
      if (luxonDateTime?.DATE_HUGE) {
        return worldTime.toLocaleString(luxonDateTime.DATE_HUGE);
      }
    }

    const templateKey = CONFIG?.PF2E?.worldClock?.Date;
    const day = Helpers.getPF2eOrdinalDay(worldTime.day);
    const month = typeof worldClock.month === 'string' ? worldClock.month : '';
    const weekday = typeof worldClock.weekday === 'string' ? worldClock.weekday : '';
    const year = typeof worldClock.year === 'number' ? worldClock.year : worldTime.year;
    const era = typeof worldClock.era === 'string' ? worldClock.era : '';

    if (templateKey) {
      return game.i18n.format(templateKey, { era, year, month, day, weekday });
    }

    return `${weekday}, ${day} of ${month}, ${year}${era ? ` ${era}` : ''}`.trim();
  }

  static getSystemDateFormatters() {
    const calendar = game.time?.calendar;
    const cacheKey = `${game.system?.id ?? ''}::${calendar?.constructor?.name ?? ''}`;
    if (Helpers.#cachedSystemDateFormats && Helpers.#cachedSystemDateFormatsKey === cacheKey) {
      return Helpers.#cachedSystemDateFormats;
    }

    const systemConfig = Helpers.getSystemCalendarConfig();
    const formatters = Array.isArray(systemConfig?.formatters) ? systemConfig.formatters : [];
    const dateFormatters = formatters.filter((entry) => {
      if (!entry?.formatter || !entry?.label) return false;

      const group = String(entry.group ?? '').toLowerCase();
      const value = String(entry.value ?? '').toLowerCase();
      const formatter = String(entry.formatter ?? '').toLowerCase();
      return group.includes('date') || value.includes('date') || value.includes('day') || formatter.includes('date') || formatter.includes('day');
    });

    Helpers.#cachedSystemDateFormats = dateFormatters;
    Helpers.#cachedSystemDateFormatsKey = cacheKey;
    return dateFormatters;
  }

  static getSystemCalendarConfig() {
    const systemId = String(game.system?.id ?? '');
    if (!systemId) return null;

    const normalizedSystemId = systemId.replace(/[^a-z0-9]/gi, '').toUpperCase();
    for (const [key, configValue] of Object.entries(CONFIG)) {
      const normalizedKey = key.replace(/[^a-z0-9]/gi, '').toUpperCase();
      if (normalizedKey !== normalizedSystemId) continue;
      if (configValue?.calendar) return configValue.calendar;
    }

    for (const configValue of Object.values(CONFIG)) {
      if (configValue?.calendar?.formatters) return configValue.calendar;
    }

    return null;
  }

  static stringAfter(stringText, afterString = ' ') {
    return stringText ? stringText + afterString : '';
  }

  static stringBefore(stringText, beforeString = ' ') {
    return stringText ? beforeString + stringText : '';
  }

  static grabSceneSlice() {
    // Prefer the full image, but fall back to the thumbnail in the case
    // of tile BGs or animations. Use a generic image for empty scenes.
    let sceneBG = canvas.scene.background.src;
    if (!sceneBG || sceneBG.endsWith('.m4v') || sceneBG.endsWith('.webp')) {
      sceneBG = canvas.scene.thumb;
    }
    if (!sceneBG || sceneBG.startsWith('data')) {
      // Generic scene slice provided by MADCartographer -- thanks! :)
      sceneBG = 'modules/smalltime/images/generic-bg.webp';
    }
    // Check for absolute path here, to account for assets on Forge or other buckets.
    if (sceneBG.startsWith('http')) {
      document.documentElement.style.setProperty('--SMLTME-scene-bg', 'url(' + sceneBG + ')');
    } else {
      document.documentElement.style.setProperty('--SMLTME-scene-bg', 'url(/' + sceneBG + ')');
    }
  }

  static convertHexToRGB(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  }

  static pSBC(p, c0, c1, l) {
    let r,
      g,
      b,
      P,
      f,
      t,
      h,
      i = parseInt,
      m = Math.round,
      a = typeof c1 == 'string';
    if (typeof p != 'number' || p < -1 || p > 1 || typeof c0 != 'string' || (c0[0] != 'r' && c0[0] != '#') || (c1 && !a)) return null;
    if (!this.pSBCr)
      this.pSBCr = (d) => {
        let n = d.length,
          x = {};
        if (n > 9) {
          (([r, g, b, a] = d = d.split(',')), (n = d.length));
          if (n < 3 || n > 4) return null;
          ((x.r = i(r[3] == 'a' ? r.slice(5) : r.slice(4))), (x.g = i(g)), (x.b = i(b)), (x.a = a ? parseFloat(a) : -1));
        } else {
          if (n == 8 || n == 6 || n < 4) return null;
          if (n < 6) d = '#' + d[1] + d[1] + d[2] + d[2] + d[3] + d[3] + (n > 4 ? d[4] + d[4] : '');
          d = i(d.slice(1), 16);
          if (n == 9 || n == 5) ((x.r = (d >> 24) & 255), (x.g = (d >> 16) & 255), (x.b = (d >> 8) & 255), (x.a = m((d & 255) / 0.255) / 1000));
          else ((x.r = d >> 16), (x.g = (d >> 8) & 255), (x.b = d & 255), (x.a = -1));
        }
        return x;
      };
    ((h = c0.length > 9),
      (h = a ? (c1.length > 9 ? true : c1 == 'c' ? !h : false) : h),
      (f = this.pSBCr(c0)),
      (P = p < 0),
      (t = c1 && c1 != 'c' ? this.pSBCr(c1) : P ? { r: 0, g: 0, b: 0, a: -1 } : { r: 255, g: 255, b: 255, a: -1 }),
      (p = P ? p * -1 : p),
      (P = 1 - p));
    if (!f || !t) return null;
    if (l) ((r = m(P * f.r + p * t.r)), (g = m(P * f.g + p * t.g)), (b = m(P * f.b + p * t.b)));
    else ((r = m((P * f.r ** 2 + p * t.r ** 2) ** 0.5)), (g = m((P * f.g ** 2 + p * t.g ** 2) ** 0.5)), (b = m((P * f.b ** 2 + p * t.b ** 2) ** 0.5)));
    ((a = f.a), (t = t.a), (f = a >= 0 || t >= 0), (a = f ? (a < 0 ? t : t < 0 ? a : a * P + t * p) : 0));
    if (h) return 'rgb' + (f ? 'a(' : '(') + r + ',' + g + ',' + b + (f ? ',' + m(a * 1000) / 1000 : '') + ')';
    else return '#' + (4294967296 + r * 16777216 + g * 65536 + b * 256 + (f ? m(a * 255) : 0)).toString(16).slice(1, f ? undefined : -2);
  }

  static applySaturationToHexColor(hex, saturationPercent) {
    if (!/^#([0-9a-f]{6})$/i.test(hex)) {
      throw 'Unexpected color format';
    }

    if (saturationPercent < 0 || saturationPercent > 100) {
      throw 'Unexpected color format';
    }

    let saturationFloat = saturationPercent / 100,
      rgbIntensityFloat = [parseInt(hex.substr(1, 2), 16) / 255, parseInt(hex.substr(3, 2), 16) / 255, parseInt(hex.substr(5, 2), 16) / 255];

    let rgbIntensityFloatSorted = rgbIntensityFloat.slice(0).sort(function (a, b) {
        return a - b;
      }),
      maxIntensityFloat = rgbIntensityFloatSorted[2],
      mediumIntensityFloat = rgbIntensityFloatSorted[1],
      minIntensityFloat = rgbIntensityFloatSorted[0];

    if (maxIntensityFloat == minIntensityFloat) {
      // All colors have same intensity, which means
      // the original color is gray, so we can't change saturation.
      return hex;
    }

    // New color max intensity wont change. Lets find medium and weak intensities.
    let newMediumIntensityFloat,
      newMinIntensityFloat = maxIntensityFloat * (1 - saturationFloat);

    if (mediumIntensityFloat == minIntensityFloat) {
      // Weak colors have equal intensity.
      newMediumIntensityFloat = newMinIntensityFloat;
    } else {
      // Calculate medium intensity with respect to original intensity proportion.
      let intensityProportion = (maxIntensityFloat - mediumIntensityFloat) / (mediumIntensityFloat - minIntensityFloat);
      newMediumIntensityFloat = (intensityProportion * newMinIntensityFloat + maxIntensityFloat) / (intensityProportion + 1);
    }

    let newRgbIntensityFloat = [],
      newRgbIntensityFloatSorted = [newMinIntensityFloat, newMediumIntensityFloat, maxIntensityFloat];

    // We've found new intensities, but we have then sorted from min to max.
    // Now we have to restore original order.
    rgbIntensityFloat.forEach(function (originalRgb) {
      let rgbSortedIndex = rgbIntensityFloatSorted.indexOf(originalRgb);
      newRgbIntensityFloat.push(newRgbIntensityFloatSorted[rgbSortedIndex]);
    });

    let floatToHex = function (val) {
        return ('0' + Math.round(val * 255).toString(16)).substr(-2);
      },
      rgb2hex = function (rgb) {
        return '#' + floatToHex(rgb[0]) + floatToHex(rgb[1]) + floatToHex(rgb[2]);
      };

    let newHex = rgb2hex(newRgbIntensityFloat);

    return newHex;
  }

  // Sun & moon icons by Freepik on flaticon.com
}
