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

// Default offset from the Player List window when pinned,
// an Epoch offset for game systems that don't start at midnight,
// plus custom offsets for game systems that draw extra borders
// around their windows. Also default values for sunrise/set.
ST_Config.PinOffset = 83;
ST_Config.EpochOffset = 0;
ST_Config.WFRP4eOffset = 30;
ST_Config.DasSchwarzeAugeOffset = 16;
ST_Config.TaskbarOffset = 50;

ST_Config.SunriseStartDefault = 180;
ST_Config.SunriseEndDefault = 420;
ST_Config.SunsetStartDefault = 1050;
ST_Config.SunsetEndDefault = 1320;
ST_Config.DawnDuskSpread = 120;

ST_Config.MaxDarknessDefault = 1;
ST_Config.MinDarknessDefault = 0;

export class Helpers {
  static updateSunriseSunsetTimes(data) {
    if (game.settings.get('smalltime', 'sun-sync') && game.modules.get('foundryvtt-simple-calendar')?.active) {
      // Use defaults if no seasons have been set up.
      if (SimpleCalendar.api.getAllSeasons().length == 0) {
        game.settings.set('smalltime', 'sunrise-start', ST_Config.SunriseStartDefault);
        game.settings.set('smalltime', 'sunrise-end', ST_Config.SunriseEndDefault);
        game.settings.set('smalltime', 'sunset-start', ST_Config.SunsetStartDefault);
        game.settings.set('smalltime', 'sunset-end', ST_Config.SunsetEndDefault);
      } else {
        if (typeof data !== 'undefined') {
          const riseEnd = SimpleCalendar.api.timestampToDate(data.date.sunrise).hour * 60 + SimpleCalendar.api.timestampToDate(data.date.sunrise).minute;
          const riseStart = riseEnd - ST_Config.DawnDuskSpread;
          const setStart = SimpleCalendar.api.timestampToDate(data.date.sunset).hour * 60 + SimpleCalendar.api.timestampToDate(data.date.sunset).minute;
          const setEnd = setStart + ST_Config.DawnDuskSpread;
          game.settings.set('smalltime', 'sunrise-start', riseStart);
          game.settings.set('smalltime', 'sunrise-end', riseEnd);
          game.settings.set('smalltime', 'sunset-start', setStart);
          game.settings.set('smalltime', 'sunset-end', setEnd);
        }
      }
    }
  }

  static configureReleaseSpecificStuff() {
    ST_Config.GlobalThresholdPath = game.release.generation < 12 ? 'globalLightThreshold' : 'environment.globalLight.darkness.max';
  }

  static handleRealtimeState() {
    if (game.modules.get('foundryvtt-simple-calendar')?.active) {
      // Need to insert a small delay here, to wait for Simple Calendar to finish
      // setting its clockStatus.
      setTimeout(function () {
        if (game.paused || !SimpleCalendar.api.clockStatus().started) {
          $('.timeSeparator').removeClass('blink');
        } else if (!game.paused && SimpleCalendar.api.clockStatus().started) {
          $('.timeSeparator').addClass('blink');
        }
      }, 500);
    }
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
      Helpers.convertTimeIntegerToPercentage(game.settings.get('smalltime', 'sunrise-start'))
    );
    document.documentElement.style.setProperty(
      '--SMLTME-sunrise-middle-1',
      Helpers.convertTimeIntegerToPercentage(Helpers.convertPositionToTimeInteger(sunriseMiddle1))
    );
    document.documentElement.style.setProperty(
      '--SMLTME-sunrise-middle-2',
      Helpers.convertTimeIntegerToPercentage(Helpers.convertPositionToTimeInteger(sunriseMiddle2))
    );
    document.documentElement.style.setProperty('--SMLTME-sunrise-end', Helpers.convertTimeIntegerToPercentage(game.settings.get('smalltime', 'sunrise-end')));
    document.documentElement.style.setProperty('--SMLTME-sunset-start', Helpers.convertTimeIntegerToPercentage(game.settings.get('smalltime', 'sunset-start')));
    document.documentElement.style.setProperty(
      '--SMLTME-sunset-middle-1',
      Helpers.convertTimeIntegerToPercentage(Helpers.convertPositionToTimeInteger(sunsetMiddle1))
    );
    document.documentElement.style.setProperty(
      '--SMLTME-sunset-middle-2',
      Helpers.convertTimeIntegerToPercentage(Helpers.convertPositionToTimeInteger(sunsetMiddle2))
    );
    document.documentElement.style.setProperty('--SMLTME-sunset-end', Helpers.convertTimeIntegerToPercentage(game.settings.get('smalltime', 'sunset-end')));
  }

  static async saveNewDarknessConfig(positions, max, min) {
    // Set the hidden inputs for these settings to the new values,
    // so that the form-saving workflow takes care of saving them.
    $('input[name="smalltime.sunrise-start"]').val(Helpers.convertPositionToTimeInteger(positions.sunriseStart));
    $('input[name="smalltime.sunrise-end"]').val(Helpers.convertPositionToTimeInteger(positions.sunriseEnd));
    $('input[name="smalltime.sunset-start"]').val(Helpers.convertPositionToTimeInteger(positions.sunsetStart));
    $('input[name="smalltime.sunset-end"]').val(Helpers.convertPositionToTimeInteger(positions.sunsetEnd));

    // Set the max or min Darkness, depending on which was passed.
    if (min === false) $('input[name="smalltime.max-darkness"]').val(max);
    if (max === false) $('input[name="smalltime.min-darkness"]').val(min);
  }

  static setupDragHandles() {
    // If sunrise/sunset are being synced from Simple Calendar, we'll lock
    // the drag handles on the X axis.
    const sunSync = game.settings.get('smalltime', 'sun-sync') && game.modules.get('foundryvtt-simple-calendar')?.active;

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

    // If syncing, append a note to the tooltips.
    const syncString = ' (Simple Calendar)';
    if (sunSync) {
      Object.keys(initialTimes).forEach((key) => (initialTimes[key] += syncString));
    }

    const snapX = 10;
    const snapY = 4;

    const offsetBetween = 20;

    $('.sunrise-start').css('top', Helpers.convertDarknessToPostion(maxDarkness));
    $('.sunrise-start').css('left', initialPositions.sunriseStart);
    $('.sunrise-start').attr('aria-label', initialTimes.sunriseStart);

    $('.sunrise-end').css('top', Helpers.convertDarknessToPostion(minDarkness) + 1);
    $('.sunrise-end').css('left', initialPositions.sunriseEnd);
    $('.sunrise-end').attr('aria-label', initialTimes.sunriseEnd);

    $('.sunset-start').css('top', Helpers.convertDarknessToPostion(minDarkness) + 1);
    $('.sunset-start').css('left', initialPositions.sunsetStart);
    $('.sunset-start').attr('aria-label', initialTimes.sunsetStart);

    $('.sunset-end').css('top', Helpers.convertDarknessToPostion(maxDarkness));
    $('.sunset-end').css('left', initialPositions.sunsetEnd);
    $('.sunset-end').attr('aria-label', initialTimes.sunsetEnd);

    Helpers.updateGradientStops();

    // Create the drag handles.
    const sunriseStartDrag = new Draggabilly('.sunrise-start', {
      containment: '.sunrise-start-bounds',
      grid: [snapX, snapY],
      // Lock off the X axis if we're syncing the sunrise/sunset times.
      axis: sunSync ? 'y' : null,
    });
    const sunriseEndDrag = new Draggabilly('.sunrise-end', {
      containment: '.sunrise-end-bounds',
      grid: [snapX, snapY],
      axis: sunSync ? 'y' : null,
    });
    const sunsetStartDrag = new Draggabilly('.sunset-start', {
      containment: '.sunset-start-bounds',
      grid: [snapX, snapY],
      axis: sunSync ? 'y' : null,
    });
    const sunsetEndDrag = new Draggabilly('.sunset-end', {
      containment: '.sunset-end-bounds',
      grid: [snapX, snapY],
      axis: sunSync ? 'y' : null,
    });

    let shovedPos = '';
    let newTransition = '';

    sunriseStartDrag.on('dragMove', function () {
      // Match the paired handle.
      $('.sunset-end').css('top', this.position.y + 'px');
      // Update the tooltip. Append sync note if syncing.
      let displayTime = Helpers.convertPositionToDisplayTime(this.position.x);
      sunSync ? (displayTime += syncString) : null;
      $('.sunrise-start').attr('aria-label', displayTime);

      // Live update the darkness maximum.
      document.documentElement.style.setProperty('--SMLTME-darkness-max', Helpers.convertPositionToDarkness(this.position.y));

      // Live update the gradient transition point.
      newTransition = Helpers.convertTimeIntegerToPercentage(Helpers.convertPositionToTimeInteger(this.position.x));
      document.documentElement.style.setProperty('--SMLTME-sunrise-start', newTransition);

      // Shove other handle on collisions.
      if (this.position.x >= sunriseEndDrag.position.x - offsetBetween) {
        shovedPos = this.position.x + offsetBetween;
        $('.sunrise-end').css('left', shovedPos);
        $('.sunrise-end').attr('aria-label', Helpers.convertPositionToDisplayTime(shovedPos));
        sunriseEndDrag.setPosition(shovedPos);
        newTransition = Helpers.convertTimeIntegerToPercentage(Helpers.convertPositionToTimeInteger(shovedPos));
        document.documentElement.style.setProperty('--SMLTME-sunrise-end', newTransition);
      }
    });

    sunriseEndDrag.on('dragMove', function () {
      // Match the paired handle.
      $('.sunset-start').css('top', this.position.y + 'px');
      // Update the tooltip. Append sync note if syncing.
      let displayTime = Helpers.convertPositionToDisplayTime(this.position.x);
      sunSync ? (displayTime += syncString) : null;
      $('.sunrise-end').attr('aria-label', displayTime);

      // Live update the darkness minimum.
      document.documentElement.style.setProperty('--SMLTME-darkness-min', Helpers.convertPositionToDarkness(this.position.y));

      // Live update the gradient transition point.
      newTransition = Helpers.convertTimeIntegerToPercentage(Helpers.convertPositionToTimeInteger(this.position.x));
      document.documentElement.style.setProperty('--SMLTME-sunrise-end', newTransition);

      // Shove other handle on collisions.
      if (this.position.x <= sunriseStartDrag.position.x + offsetBetween) {
        shovedPos = this.position.x - offsetBetween;
        $('.sunrise-start').css('left', shovedPos);
        $('.sunrise-start').attr('aria-label', Helpers.convertPositionToDisplayTime(shovedPos));
        sunriseStartDrag.setPosition(shovedPos);
        newTransition = Helpers.convertTimeIntegerToPercentage(Helpers.convertPositionToTimeInteger(shovedPos));
        document.documentElement.style.setProperty('--SMLTME-sunrise-start', newTransition);
      }
    });

    sunsetStartDrag.on('dragMove', function () {
      // Match the paired handle.
      $('.sunrise-end').css('top', this.position.y + 'px');
      // Update the tooltip. Append sync note if syncing.
      let displayTime = Helpers.convertPositionToDisplayTime(this.position.x);
      sunSync ? (displayTime += syncString) : null;
      $('.sunset-start').attr('aria-label', displayTime);

      // Live update the darkness minimum.
      document.documentElement.style.setProperty('--SMLTME-darkness-min', Helpers.convertPositionToDarkness(this.position.y));

      // Live update the gradient transition point.
      newTransition = Helpers.convertTimeIntegerToPercentage(Helpers.convertPositionToTimeInteger(this.position.x));
      document.documentElement.style.setProperty('--SMLTME-sunset-start', newTransition);

      // Shove other handle on collisions.
      if (this.position.x >= sunsetEndDrag.position.x - offsetBetween) {
        shovedPos = this.position.x + offsetBetween;
        $('.sunset-end').css('left', shovedPos);
        $('.sunset-end').attr('aria-label', Helpers.convertPositionToDisplayTime(shovedPos));
        sunsetEndDrag.setPosition(shovedPos);
        newTransition = Helpers.convertTimeIntegerToPercentage(Helpers.convertPositionToTimeInteger(shovedPos));
        document.documentElement.style.setProperty('--SMLTME-sunset-end', newTransition);
      }
    });

    sunsetEndDrag.on('dragMove', function () {
      // Match the paired handle.
      $('.sunrise-start').css('top', this.position.y + 'px');
      // Update the tooltip. Append sync note if syncing.
      let displayTime = Helpers.convertPositionToDisplayTime(this.position.x);
      sunSync ? (displayTime += syncString) : null;
      $('.sunset-end').attr('aria-label', displayTime);

      // Live update the darkness maximum.
      document.documentElement.style.setProperty('--SMLTME-darkness-max', Helpers.convertPositionToDarkness(this.position.y));

      // Live update the gradient transition point.
      newTransition = Helpers.convertTimeIntegerToPercentage(Helpers.convertPositionToTimeInteger(this.position.x));
      document.documentElement.style.setProperty('--SMLTME-sunset-end', newTransition);

      // Shove other handle on collisions.
      if (this.position.x <= sunsetStartDrag.position.x + offsetBetween) {
        shovedPos = this.position.x - offsetBetween;
        $('.sunset-start').css('left', shovedPos);
        $('.sunset-start').attr('aria-label', Helpers.convertPositionToDisplayTime(shovedPos));
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
      Helpers.saveNewDarknessConfig(newPositions, newMaxDarkness, false);
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
      Helpers.saveNewDarknessConfig(newPositions, false, newMinDarkness);
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
      Helpers.saveNewDarknessConfig(newPositions, false, newMinDarkness);
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
      Helpers.saveNewDarknessConfig(newPositions, newMaxDarkness, false);
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

  // Convert worldTime (seconds elapsed) into an integer time of day.
  static getWorldTimeAsDayTime() {
    const currentWorldTime = game.time.worldTime + ST_Config.EpochOffset;
    const dayTime = Math.abs(Math.trunc((currentWorldTime % 86400) / 60));
    if (currentWorldTime < 0) {
      return 1440 - dayTime;
    } else return dayTime;
  }

  // Advance/retreat the elapsed worldTime based on changes made.
  static async setWorldTime(newTime) {
    const currentWorldTime = game.time.worldTime + ST_Config.EpochOffset;
    const dayTime = Helpers.getWorldTimeAsDayTime(currentWorldTime);
    const delta = newTime - dayTime;
    game.time.advance(delta * 60);
  }

  static getCalendarProviders() {
    let calendarProviders = new Object();

    if (game.modules.get('foundryvtt-simple-calendar')?.active) {
      Object.assign(calendarProviders, { sc: 'Simple Calendar' });
    }
    if (game.modules.get('calendar-weather')?.active) {
      Object.assign(calendarProviders, { cw: 'Calendar/Weather' });
    }
    if (game.system.id === 'pf2e') {
      Object.assign(calendarProviders, { pf2e: 'PF2E ' });
    }

    return calendarProviders;
  }

  // If the calendar provider is set to a module that isn't currently enabled,
  // fall back to using PF2E's calendar, if in PF2E.
  static setCalendarFallback() {
    const providerSetting = game.settings.get('smalltime', 'calendar-provider');

    if (!game.user.isGM) return;

    // If the provider is set to a module or system that isn't available, use the
    // first available provider by default.
    if (
      (providerSetting === 'sc' && !game.modules.get('foundryvtt-simple-calendar')?.active) ||
      (providerSetting === 'cw' && !game.modules.get('calendar-weather')?.active) ||
      (providerSetting === 'pf2e' && !(game.system.id === 'pf2e'))
    ) {
      game.settings.set('smalltime', 'calendar-provider', Helpers.getCalendarProviders()[0]);
    }
  }

  // Helper function for time-changing socket updates.
  static handleTimeChange(timeInteger) {
    SmallTimeApp.timeTransition(timeInteger);
    $('#hourString').html(SmallTimeApp.convertTimeIntegerToDisplay(timeInteger).hours);
    $('#minuteString').html(SmallTimeApp.convertTimeIntegerToDisplay(timeInteger).minutes);

    // Calculate and show the current seconds if required.
    if (game.settings.get('smalltime', 'time-format') == 24 && game.settings.get('smalltime', 'show-seconds') == true) {
      const currentWorldTime = game.time.worldTime + ST_Config.EpochOffset;
      let seconds;
      if (currentWorldTime < 0) {
        seconds = 60 - Math.abs(Math.trunc(((currentWorldTime % 86400) % 3600) % 60));
      } else {
        seconds = Math.abs(Math.trunc(((currentWorldTime % 86400) % 3600) % 60));
      }
      if (seconds < 10) seconds = '0' + seconds;
      if (seconds == 60) seconds = '00';
      $('#secondString').html(seconds);
      $('#secondsSpan').css('display', 'inline');
    } else {
      $('#secondsSpan').css('display', 'none');
    }

    $('#timeSlider').val(timeInteger);
    Helpers.handleRealtimeState();
    SmallTimeApp.updateDate();
  }

  static getDate(provider, variant) {
    let day;
    let monthName;
    let month;
    let date;
    let year;
    let yearPostfix;
    let yearPrefix;
    let ordinalSuffix;
    let displayDate = [];

    if (game.modules.get('foundryvtt-simple-calendar')?.active && provider === 'sc') {
      let SCobject = SimpleCalendar.api.timestampToDate(game.time.worldTime).display;
      day = SimpleCalendar.api.timestampToDate(game.time.worldTime).showWeekdayHeadings ? SCobject.weekday : undefined;
      monthName = SCobject.monthName;
      month = SCobject.month;
      date = SCobject.day;
      ordinalSuffix = SCobject.daySuffix;
      year = SCobject.year;
      yearPrefix = SCobject.yearPrefix || undefined;
      yearPostfix = SCobject.yearPostfix || undefined;
    }

    if (game.system.id === 'pf2e' && provider === 'pf2e') {
      let PFobject = game.pf2e.worldClock;
      day = PFobject.weekday;
      monthName = PFobject.month;
      month = PFobject.worldTime.c.month;
      date = PFobject.worldTime.c.day;
      year = PFobject.year;
      ordinalSuffix = PFobject.ordinalSuffix || undefined;
      yearPostfix = PFobject.era;
    }

    // Support for C/W and AT calendars will be dropped soon, but
    // leaving these in for now.

    if (game.modules.get('calendar-weather')?.active && provider === 'cw') {
      let CWobject = game.settings.get('calendar-weather', 'dateTime');
      day = CWobject.daysOfTheWeek[CWobject.numDayOfTheWeek];
      monthName = CWobject.months[CWobject.currentMonth].name;
      // CW .currentMonth and .day are zero-indexed, so add one to get the display date.
      month = CWobject.currentMonth + 1;
      date = CWobject.day + 1;
      year = CWobject.year;
    }

    // Thursday, August 12th, 2021 C.E.
    displayDate.push(
      Helpers.stringAfter(day, ', ') +
        Helpers.stringAfter(monthName) +
        Helpers.stringAfter(date + (ordinalSuffix ? ordinalSuffix : ''), ', ') +
        Helpers.stringAfter(yearPrefix) +
        year +
        Helpers.stringBefore(yearPostfix)
    );

    // Thursday, August 12th
    displayDate.push(Helpers.stringAfter(day, ', ') + Helpers.stringAfter(monthName) + Helpers.stringAfter(date + (ordinalSuffix ? ordinalSuffix : '')));

    // Thursday August, 2021
    displayDate.push(Helpers.stringAfter(day, ' ') + Helpers.stringAfter(monthName, ', ') + year);

    // August 12th, 2021
    displayDate.push(
      Helpers.stringAfter(monthName) + Helpers.stringAfter(date + (ordinalSuffix ? ordinalSuffix : ''), ', ') + Helpers.stringAfter(yearPrefix) + year
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
        Helpers.stringBefore(yearPostfix)
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

    return displayDate[variant];
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
          ([r, g, b, a] = d = d.split(',')), (n = d.length);
          if (n < 3 || n > 4) return null;
          (x.r = i(r[3] == 'a' ? r.slice(5) : r.slice(4))), (x.g = i(g)), (x.b = i(b)), (x.a = a ? parseFloat(a) : -1);
        } else {
          if (n == 8 || n == 6 || n < 4) return null;
          if (n < 6) d = '#' + d[1] + d[1] + d[2] + d[2] + d[3] + d[3] + (n > 4 ? d[4] + d[4] : '');
          d = i(d.slice(1), 16);
          if (n == 9 || n == 5) (x.r = (d >> 24) & 255), (x.g = (d >> 16) & 255), (x.b = (d >> 8) & 255), (x.a = m((d & 255) / 0.255) / 1000);
          else (x.r = d >> 16), (x.g = (d >> 8) & 255), (x.b = d & 255), (x.a = -1);
        }
        return x;
      };
    (h = c0.length > 9),
      (h = a ? (c1.length > 9 ? true : c1 == 'c' ? !h : false) : h),
      (f = this.pSBCr(c0)),
      (P = p < 0),
      (t = c1 && c1 != 'c' ? this.pSBCr(c1) : P ? { r: 0, g: 0, b: 0, a: -1 } : { r: 255, g: 255, b: 255, a: -1 }),
      (p = P ? p * -1 : p),
      (P = 1 - p);
    if (!f || !t) return null;
    if (l) (r = m(P * f.r + p * t.r)), (g = m(P * f.g + p * t.g)), (b = m(P * f.b + p * t.b));
    else (r = m((P * f.r ** 2 + p * t.r ** 2) ** 0.5)), (g = m((P * f.g ** 2 + p * t.g ** 2) ** 0.5)), (b = m((P * f.b ** 2 + p * t.b ** 2) ** 0.5));
    (a = f.a), (t = t.a), (f = a >= 0 || t >= 0), (a = f ? (a < 0 ? t : t < 0 ? a : a * P + t * p) : 0);
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

  // Overriding the Global Illumination Threshold value for the scene if requested.
  // Values span from 0.0 to 1.0 to mimic brightness levels of the various phases.
  static async adjustMoonlight(phases) {
    // Only perform this adjustment if the setting is enabled.
    if (!game.scenes.viewed.getFlag('smalltime', 'moonlight') || !phases.length) return;
    let newThreshold = 0;
    phases.forEach((phase) => {
      switch (phase) {
        case 0: // new
          newThreshold += 0;
          break;
        case 1: // waxing crescent
        case 7: // waning crescent
          newThreshold += 0.25;
          break;
        case 2: // first quarter
        case 6: // last quarter
          newThreshold += 0.5;
          break;
        case 3: // waxing gibbous
        case 5: // waning gibbous
          newThreshold += 0.75;
          break;
        case 4: // full
          newThreshold += 1;
          break;
      }
    });

    newThreshold = Math.round((newThreshold / phases.length) * 100) / 100;
    const currentThreshold = `game.scenes.viewed.${ST_Config.GlobalThresholdPath}`;
    if (newThreshold === currentThreshold) {
      return true;
    }
    await canvas.scene.update({ [ST_Config.GlobalThresholdPath]: newThreshold });
  }

  // Sun & moon icons by Freepik on flaticon.com
}
