const SmallTime_MoonPhases = [
  'new',
  'waxing-crescent',
  'first-quarter',
  'waxing-gibbous',
  'full',
  'waning-gibbous',
  'last-quarter',
  'waning-crescent',
];

const SmallTime_PhaseValues = {
  0: 0,
  1: 0.25,
  2: 0.5,
  3: 0.75,
  4: 1,
  5: 0.75,
  6: 0.5,
  7: 0.25,
};

// Default offset from the Player List window when pinned,
// an Epoch offset for game systems that don't start at midnight,
// plus custom offsets for game systems that draw extra borders
// around their windows. Also default values for sunrise/set.
let SmallTime_PinOffset = 83;
let SmallTime_EpochOffset = 0;
const SmallTime_WFRP4eOffset = 30;
const SmallTime_DasSchwarzeAugeOffset = 16;
const SmallTime_TaskbarOffset = 50;

const SmallTime_SunriseStartDefault = 180;
const SmallTime_SunriseEndDefault = 420;
const SmallTime_SunsetStartDefault = 1050;
const SmallTime_SunsetEndDefault = 1320;
const SmallTime_DawnDuskSpread = 120;

const SmallTime_MaxDarknessDefault = 1;
const SmallTime_MinDarknessDefault = 0;

Hooks.on('init', () => {
  // Exclude module from deprecation warnings, as we're relying on shims for now.
  if (game.release.generation === 10) {
    const excludeRgx = new RegExp('/modules/smalltime/');
    CONFIG.compatibility.excludePatterns.push(excludeRgx);
  }

  game.settings.register('smalltime', 'current-date', {
    name: 'Current Date',
    scope: 'world',
    config: false,
    type: String,
    default: '',
  });

  game.settings.register('smalltime', 'position', {
    name: 'Position',
    scope: 'client',
    config: false,
    type: Object,
    default: { top: 446, left: 15 },
  });

  game.settings.register('smalltime', 'pinned', {
    name: 'Pinned',
    scope: 'client',
    config: false,
    type: Boolean,
    default: true,
  });

  game.settings.register('smalltime', 'visible', {
    name: 'Visible',
    scope: 'client',
    config: false,
    type: Boolean,
    default: true,
  });

  game.settings.register('smalltime', 'date-showing', {
    name: 'Date Showing',
    scope: 'client',
    config: false,
    type: Boolean,
    default: false,
  });

  game.settings.register('smalltime', 'player-visibility-default', {
    name: game.i18n.localize('SMLTME.Player_Visibility_Default'),
    hint: game.i18n.localize('SMLTME.Player_Visibility_Default_Hint'),
    scope: 'world',
    config: true,
    type: String,
    choices: {
      2: game.i18n.localize('SMLTME.Player_Vis_2'),
      1: game.i18n.localize('SMLTME.Player_Vis_1'),
      0: game.i18n.localize('SMLTME.Player_Vis_0'),
    },
    default: 2,
  });

  game.settings.register('smalltime', 'time-format', {
    name: game.i18n.localize('SMLTME.Time_Format'),
    scope: 'world',
    config: true,
    type: Number,
    choices: {
      12: game.i18n.localize('SMLTME.12hr'),
      24: game.i18n.localize('SMLTME.24hr'),
    },
    default: 12,
  });

  game.settings.register('smalltime', 'show-seconds', {
    name: game.i18n.localize('SMLTME.Show_Seconds'),
    scope: 'world',
    config: true,
    type: Boolean,
    default: false,
  });

  // If there is one or more available source of calendar information,
  // add them to the list of providers to choose from in Settings.
  const calendarProviders = getCalendarProviders();
  const calendarAvailable = Object.keys(calendarProviders).length > 0 ? true : false;

  game.settings.register('smalltime', 'date-format', {
    name: game.i18n.localize('SMLTME.Date_Format'),
    scope: 'world',
    config: calendarAvailable,
    type: Number,
    // These strings are replaced dynamically later.
    choices: {
      0: '0',
      1: '1',
      2: '2',
      3: '3',
      4: '4',
      5: '5',
      6: '6',
      7: '7',
      8: '8',
      9: '9',
      10: '10',
      11: '11',
    },
    default: 0,
  });

  game.settings.register('smalltime', 'calendar-provider', {
    name: game.i18n.localize('SMLTME.Calendar_Provider'),
    hint: game.i18n.localize('SMLTME.Calendar_Provider_Hint'),
    scope: 'world',
    config: calendarAvailable,
    type: String,
    choices: calendarProviders,
    default: 'sc',
  });

  game.settings.register('smalltime', 'small-step', {
    name: game.i18n.localize('SMLTME.Small_Step'),
    hint: game.i18n.localize('SMLTME.Small_Step_Hint'),
    scope: 'world',
    config: true,
    type: Number,
    choices: {
      1: '1',
      5: '5',
      10: '10',
      15: '15',
      20: '20',
      30: '30',
    },
    default: 10,
  });

  game.settings.register('smalltime', 'large-step', {
    name: game.i18n.localize('SMLTME.Large_Step'),
    hint: game.i18n.localize('SMLTME.Large_Step_Hint'),
    scope: 'world',
    config: true,
    type: Number,
    choices: {
      20: '20',
      30: '30',
      60: '60',
      240: '120',
    },
    default: 60,
  });

  game.settings.register('smalltime', 'opacity', {
    name: game.i18n.localize('SMLTME.Resting_Opacity'),
    hint: game.i18n.localize('SMLTME.Resting_Opacity_Hint'),
    scope: 'client',
    config: true,
    type: Number,
    range: {
      min: 0,
      max: 1,
      step: 0.1,
    },
    default: 0.8,
    // Realtime preview of the opacity setting.
    onChange: (value) => {
      document.documentElement.style.setProperty('--SMLTME-opacity', value);
    },
  });

  game.settings.register('smalltime', 'max-darkness', {
    scope: 'world',
    config: true,
    type: Number,
    default: SmallTime_MaxDarknessDefault,
  });

  game.settings.register('smalltime', 'min-darkness', {
    scope: 'world',
    config: true,
    type: Number,
    default: SmallTime_MinDarknessDefault,
  });

  game.settings.register('smalltime', 'sunrise-start', {
    scope: 'world',
    config: true,
    type: Number,
    default: SmallTime_SunriseStartDefault,
  });

  game.settings.register('smalltime', 'sunrise-end', {
    scope: 'world',
    config: true,
    type: Number,
    default: SmallTime_SunriseEndDefault,
  });

  game.settings.register('smalltime', 'sunset-start', {
    scope: 'world',
    config: true,
    type: Number,
    default: SmallTime_SunsetStartDefault,
  });

  game.settings.register('smalltime', 'sunset-end', {
    name: game.i18n.localize('SMLTME.Darkness_Config'),
    hint: game.i18n.localize('SMLTME.Darkness_Config_Hint'),
    scope: 'world',
    config: true,
    type: Number,
    default: SmallTime_SunsetEndDefault,
  });

  game.settings.register('smalltime', 'sun-sync', {
    name: game.i18n.localize('SMLTME.Sun_Sync'),
    hint: game.i18n.localize('SMLTME.Sun_Sync_Hint'),
    scope: 'world',
    config: game.modules.get('foundryvtt-simple-calendar')?.active,
    type: Boolean,
    default: false,
  });

  game.settings.register('smalltime', 'darkness-default', {
    name: game.i18n.localize('SMLTME.Darkness_Default'),
    hint: game.i18n.localize('SMLTME.Darkness_Default_Hint'),
    scope: 'world',
    config: true,
    type: Boolean,
    default: false,
  });

  game.settings.register('smalltime', 'moon-darkness', {
    name: game.i18n.localize('SMLTME.Moon_Darkness'),
    hint: game.i18n.localize('SMLTME.Moon_Darkness_Hint'),
    scope: 'world',
    config: true,
    type: Boolean,
    default: false,
  });

  game.settings.register('smalltime', 'allow-trusted', {
    name: game.i18n.localize('SMLTME.Allow_Trusted'),
    hint: game.i18n.localize('SMLTME.Allow_Trusted_Hint'),
    scope: 'world',
    config: true,
    type: Boolean,
    default: false,
  });

  game.settings.register('smalltime', 'moon-phase', {
    name: 'Moon Phase',
    scope: 'world',
    config: false,
    type: Number,
    // Default is full moon.
    default: 4,
  });
});

// Set the initial state for newly rendered scenes.
Hooks.on('canvasReady', () => {
  // Account for the extra border art in certain game systems.
  if (game.system.id === 'wfrp4e') {
    SmallTime_PinOffset += SmallTime_WFRP4eOffset;
  }
  if (game.system.id === 'dsa5') {
    SmallTime_PinOffset += SmallTime_DasSchwarzeAugeOffset;
  }
  if (
    game.modules.get('foundry-taskbar')?.active &&
    game.settings.get('foundry-taskbar', 'moveplayersmacro')
  ) {
    SmallTime_PinOffset += SmallTime_TaskbarOffset;
  }

  // Only allow the date display to show if there's a calendar provider available.
  game.modules.get('smalltime').dateAvailable = false;
  if (
    game.system.id === 'pf2e' ||
    game.modules.get('foundryvtt-simple-calendar')?.active ||
    game.modules.get('calendar-weather')?.active
  ) {
    game.modules.get('smalltime').dateAvailable = true;
  }

  // Check and set the correct level of authorization for the current user.
  game.modules.get('smalltime').viewAuth = false;
  game.modules.get('smalltime').clockAuth = false;
  game.modules.get('smalltime').controlAuth = false;
  // First give view & control to Assistants and GMs.
  if (game.user.role >= CONST.USER_ROLES.ASSISTANT) {
    game.modules.get('smalltime').viewAuth = true;
    game.modules.get('smalltime').clockAuth = true;
    game.modules.get('smalltime').controlAuth = true;
  }

  // If the scene is set to use Default vis level, use it here.
  const thisScene = game.scenes.viewed;
  let visLevel = thisScene.getFlag('smalltime', 'player-vis');
  // visLevel of 3 is "use default".
  if (visLevel == 3 || visLevel == undefined) {
    visLevel = game.settings.get('smalltime', 'player-visibility-default');
  }
  // Give basic view auth to players if they're allowed in this scene.
  if (visLevel > 0) {
    game.modules.get('smalltime').viewAuth = true;
  }
  // Also give them the clock if the permission level allows.
  if (visLevel > 1) {
    game.modules.get('smalltime').clockAuth = true;
  }
  // If the Allow Trusted Player Control setting is on, give Trusted
  // Players control privs as well.
  if (
    game.settings.get('smalltime', 'allow-trusted') &&
    game.user.role === CONST.USER_ROLES.TRUSTED
  ) {
    game.modules.get('smalltime').viewAuth = true;
    game.modules.get('smalltime').clockAuth = true;
    game.modules.get('smalltime').controlAuth = true;
  }

  if (game.modules.get('smalltime').viewAuth) {
    SmallTimeApp.toggleAppVis('initial');
    if (game.settings.get('smalltime', 'pinned')) {
      if (
        game.settings.get('smalltime', 'date-showing') &&
        game.modules.get('smalltime').dateAvailable
      ) {
        // Sending true here tells the pin to offset to
        // accommodate the date display.
        SmallTimeApp.pinApp(true);
      } else {
        SmallTimeApp.pinApp();
      }
    }
  } else if (SmallTimeApp._isOpen && !game.modules.get('smalltime').controlAuth) {
    // If the SmallTime app was visible, but we're now in a scene where
    // the player doesn't have permission to view it, close the app.
    game.modules.get('smalltime').myApp.close({ smallTime: true });
  }
  // Collapse the display if the user isn't allowed to see the clock.
  if (!game.modules.get('smalltime').clockAuth) {
    game.settings.set('smalltime', 'date-showing', false);
    document.documentElement.style.setProperty('--SMLTME-display-vis', 'none');
  } else {
    document.documentElement.style.setProperty('--SMLTME-display-vis', 'flex');
  }
  // Render at opacity per user prefs.
  const userOpacity = game.settings.get('smalltime', 'opacity');
  document.documentElement.style.setProperty('--SMLTME-opacity', userOpacity);

  if (game.modules.get('smalltime').controlAuth) {
    const darknessDefault = game.settings.get('smalltime', 'darkness-default');
    const visDefault = game.settings.get('smalltime', 'player-visibility-default');

    // Set the Darkness link state to the default choice.
    if (!hasProperty(thisScene, 'data.flags.smalltime.darkness-link')) {
      thisScene.setFlag('smalltime', 'darkness-link', darknessDefault);
    }
    // Set the Player Vis state to the default choice.
    if (!hasProperty(thisScene, 'data.flags.smalltime.player-vis')) {
      thisScene.setFlag('smalltime', 'player-vis', visDefault);
    }
    // Refresh the current scene's Darkness level if it should be linked.
    if (thisScene.getFlag('smalltime', 'darkness-link')) {
      SmallTimeApp.timeTransition(getWorldTimeAsDayTime());
    }
    // Refresh the current scene BG for the settings dialog.
    grabSceneSlice();
  }
});

Hooks.on('ready', () => {
  // Send incoming socket emissions through the async function.
  game.socket.on(`module.smalltime`, (data) => {
    doSocket(data);
  });

  async function doSocket(data) {
    if (data.type === 'changeTime') {
      if (game.user.isGM) {
        await setWorldTime(data.payload);
      }
      handleTimeChange(data.payload);
    }
    if (data.type === 'changeSetting') {
      if (game.user.isGM)
        await game.settings.set(data.payload.scope, data.payload.key, data.payload.value);
    }
    if (data.type === 'changeDarkness') {
      if (game.user.isGM) {
        const currentScene = game.scenes.get(data.payload.sceneID);
        await currentScene.update({ darkness: data.payload.darkness });
      }
    }
    if (data.type === 'handleRealtime') {
      if (!game.user.isGM) handleRealtimeState();
    }
  }
  // Update the stops on the sunrise/sunset gradient, in case
  // there's been changes to the positions.
  updateSunriseSunsetTimes();
  updateGradientStops();

  setCalendarFallback();

  // Obtain the custom worldTime epoch offset for the current PF2E world.
  if (game.system.id === 'pf2e') {
    const localEpoch = game.pf2e.worldClock.worldCreatedOn.c;
    const deltaInSeconds =
      localEpoch.hour * 3600 +
      localEpoch.minute * 60 +
      localEpoch.second +
      localEpoch.millisecond * 0.001;
    SmallTime_EpochOffset = deltaInSeconds;
  }
});

// Wait for the app to be rendered, then adjust the CSS to
// account for the date display, if showing.
Hooks.on('renderSmallTimeApp', () => {
  // Disable controls for non-GMs.
  if (!game.modules.get('smalltime').controlAuth) {
    document.documentElement.style.setProperty('--SMLTME-pointer-events', 'none');
    $('#decrease-large').addClass('hide-for-players');
    $('#decrease-small').addClass('hide-for-players');
    $('#increase-large').addClass('hide-for-players');
    $('#increase-small').addClass('hide-for-players');
  }
  // Also manage the height of the app window to match the contents.
  if (!game.modules.get('smalltime').clockAuth) {
    $('#timeDisplay').addClass('hide-for-players');
    $('#smalltime-app').css({ height: '35px' });
  } else {
    $('#timeDisplay').removeClass('hide-for-players');
    $('#smalltime-app').css({ height: '58px' });
  }
  if (
    game.settings.get('smalltime', 'date-showing') &&
    game.modules.get('smalltime').dateAvailable
  ) {
    $('#smalltime-app').addClass('show-date');
    $('#smalltime-app').css({ height: '79px' });
  }
  handleTimeChange(getWorldTimeAsDayTime());
});

// Handle our changes to the Scene Config screen.
Hooks.on('renderSceneConfig', async (obj) => {
  // Set defaults here (duplicate of what we did on canvasReady, in case the
  // scene config is being accessed for a non-rendered scene.
  const darknessDefault = game.settings.get('smalltime', 'darkness-default');
  const visDefault = game.settings.get('smalltime', 'player-visibility-default');
  // Set the Darkness link state to the default choice.
  if (!hasProperty(obj.object, 'data.flags.smalltime.darkness-link')) {
    await obj.object.setFlag('smalltime', 'darkness-link', darknessDefault);
  }
  // Set the Player Vis state to the default choice.
  if (!hasProperty(obj.object, 'data.flags.smalltime.player-vis')) {
    await obj.object.setFlag('smalltime', 'player-vis', visDefault);
  }

  // Set the Player Vis dropdown as appropriate.
  const visChoice = obj.object.getFlag('smalltime', 'player-vis');
  // Set the Darkness and Moonlight checkboxes as appropriate.
  const darknessCheckStatus = obj.object.getFlag('smalltime', 'darkness-link') ? 'checked' : '';
  const moonlightCheckStatus = obj.object.getFlag('smalltime', 'moonlight') ? 'checked' : '';

  // Build our new options.
  const visibilityLabel = game.i18n.localize('SMLTME.Player_Visibility');
  const visibilityHint = game.i18n.localize('SMLTME.Player_Visibility_Hint');
  const vis0text = game.i18n.localize('SMLTME.Player_Vis_0');
  const vis1text = game.i18n.localize('SMLTME.Player_Vis_1');
  const vis2text = game.i18n.localize('SMLTME.Player_Vis_2');

  let vis0 = '';
  let vis1 = '';
  let vis2 = '';
  if (visChoice === '0') vis0 = 'selected';
  if (visChoice === '1') vis1 = 'selected';
  if (visChoice === '2') vis2 = 'selected';

  const controlLabel = game.i18n.localize('SMLTME.Darkness_Control');
  const controlHint = game.i18n.localize('SMLTME.Darkness_Control_Hint');
  const moonlightLabel = game.i18n.localize('SMLTME.Moonlight_Adjust');
  const moonlightHint = game.i18n.localize('SMLTME.Moonlight_Adjust_Hint');
  const injection = `
    <fieldset class="st-scene-config">
      <legend>
        <img id="smalltime-config-icon" src="modules/smalltime/images/smalltime-icon.webp">
        <span>SmallTime</span>
      </legend>
      <div class="form-group">
        <label>${visibilityLabel}</label>
        <select name="flags.smalltime.player-vis" data-dtype="number">
          <option value="2" ${vis2}>${vis2text}</option>
          <option value="1" ${vis1}>${vis1text}</option>
          <option value="0" ${vis0}>${vis0text}</option>
        </select>
        <p class="notes">${visibilityHint}</p>
      </div>
      <div class="form-group">
        <label>${controlLabel}</label>
        <input
          type="checkbox"
          name="flags.smalltime.darkness-link"
          ${darknessCheckStatus}>
        <p class="notes">${controlHint}</p>
      </div>
      <div class="form-group">
        <label>${moonlightLabel}</label>
        <input
          type="checkbox"
          name="flags.smalltime.moonlight"
          ${moonlightCheckStatus}>
        <p class="notes">${moonlightHint}</p>
      </div>
      </fieldset>`;

  // Inject the SmallTime controls, but only into the config window
  // for the current scene, and only if it hasn't already been inserted.
  // Different DOM ID between v9 and v10.
  let sceneConfigID = '#scene-config-' + obj.object.data._id;
  if (game.release.generation === 10) {
    sceneConfigID = '#SceneConfig-Scene-' + obj.object.data._id;
    if (game.system.id == 'pf2e') {
      sceneConfigID = '#SceneConfigPF2e-Scene-' + obj.object.data._id;
    }
  }
  if ($(sceneConfigID).find('.st-scene-config').length === 0) {
    $(sceneConfigID)
      .find('p:contains("' + game.i18n.localize('SCENES.GlobalLightThresholdHint') + '")')
      .parent()
      .after(injection);
  }

  if (obj.object.getFlag('smalltime', 'moonlight')) {
    const currentThreshold = obj.object.data.globalLightThreshold;
    const coreThresholdCheckbox = $('input[name="hasGlobalThreshold"]');
    coreThresholdCheckbox.attr({
      checked: '',
    });
    const coreThresholdSlider = $('input[name="globalLightThreshold"]');
    coreThresholdSlider.attr({
      class: 'smalltime-threshold-override',
      'aria-label': game.i18n.localize('SMLTME.Threshold_Override_Tooltip'),
      'data-balloon-pos': 'up',
      disabled: '',
      value: currentThreshold,
    });
    const coreThresholdField = $('input[name="globalLightThreshold"]').nextAll('span:first');
    coreThresholdField.text(currentThreshold);
  }
});

Hooks.on('renderSettingsConfig', () => {
  // Everything here is GM-only.
  if (!game.user.isGM) return;

  // Tweak the Client Settings window's size to account for specific
  // styling in some systems.
  if (game.system.id === 'wfrp4e') {
    $('#client-settings').css('width', '990px');
  }
  if (game.system.id === 'dsa5') {
    $('#client-settings').css('width', '800px');
  }

  // Hide the Show Seconds setting if we're not using 24hr time.
  if (game.settings.get('smalltime', 'time-format') == 12) {
    $('input[name="smalltime.show-seconds"]').parent().parent().css('display', 'none');
  }

  // Toggle the Show Seconds setting with changes to the time format.
  $('select[name="smalltime.time-format"]').on('change', function () {
    if (this.value == 24) {
      $('input[name="smalltime.show-seconds"]').parent().parent().css('display', 'flex');
    } else {
      $('input[name="smalltime.show-seconds"]').parent().parent().css('display', 'none');
    }
  });

  // Live toggle the seconds display.
  $('input[name="smalltime.show-seconds"]').on('change', function () {
    if (this.checked) {
      $('#secondsSpan').css('display', 'inline');
    } else {
      $('#secondsSpan').css('display', 'none');
    }
  });

  // Pull the current date and format it in various ways for the selection.
  $('select[name="smalltime.date-format"]')
    .children('option')
    .each(function () {
      this.text = getDate(game.settings.get('smalltime', 'calendar-provider'), this.value);
    });

  // Hide the elements for the threshold settings; we'll be changing
  // these elsewhere, but still want them here for the save workflow.
  $('input[name="smalltime.max-darkness"]').parent().parent().css('display', 'none');
  $('input[name="smalltime.min-darkness"]').parent().parent().css('display', 'none');
  $('input[name="smalltime.sunrise-start"]').parent().parent().css('display', 'none');
  $('input[name="smalltime.sunrise-end"]').parent().parent().css('display', 'none');
  $('input[name="smalltime.sunset-start"]').parent().parent().css('display', 'none');

  // Add a reset-position popup to the setting title.
  const opacityTitleElement = $(
    'label:contains(' + game.i18n.localize('SMLTME.Resting_Opacity') + ')'
  );
  let popupDirection = 'right';
  if (game.modules.get('tidy-ui_game-settings')?.active) popupDirection = 'up';
  opacityTitleElement.attr({
    'aria-label': game.i18n.localize('SMLTME.Position_Reset'),
    'data-balloon-pos': popupDirection,
  });

  // Reset to pinned position on Shift-click, and refresh the page.
  $(opacityTitleElement).on('click', function () {
    if (event.shiftKey) {
      game.settings.set('smalltime', 'pinned', true);
      window.location.reload(false);
    }
  });

  // Add a reset-to-defaults popup to the setting title.
  const darknessTitleElement = $(
    'label:contains(' + game.i18n.localize('SMLTME.Darkness_Config') + ')'
  );
  popupDirection = 'right';
  if (game.modules.get('tidy-ui_game-settings')?.active) popupDirection = 'up';
  darknessTitleElement.attr({
    'aria-label': game.i18n.localize('SMLTME.Darkness_Reset'),
    'data-balloon-pos': popupDirection,
  });

  // Reset to defaults on Shift-click, and close the window.
  $(darknessTitleElement).on('click', function () {
    if (event.shiftKey) {
      game.settings.set('smalltime', 'sunrise-start', SmallTime_SunriseStartDefault);
      game.settings.set('smalltime', 'sunrise-end', SmallTime_SunriseEndDefault);
      game.settings.set('smalltime', 'sunset-start', SmallTime_SunsetStartDefault);
      game.settings.set('smalltime', 'sunset-end', SmallTime_SunsetEndDefault);
      game.settings.set('smalltime', 'max-darkness', SmallTime_MaxDarknessDefault);
      game.settings.set('smalltime', 'min-darkness', SmallTime_MinDarknessDefault);

      Object.values(ui.windows).forEach((app) => {
        if (app.options.id === 'client-settings') app.close();
      });
    }
  });

  if (game.release.generation === 10) {
    document.documentElement.style.setProperty('--SMLTME-darkness-container-width', '512px');
  }

  // Create and insert a div for the Darkness Configuration tool.
  const insertionElement = $('input[name="smalltime.sunset-end"]');
  insertionElement.css('display', 'none');

  const notesElement = insertionElement.parent().next();

  const injection = `
    <div id="smalltime-darkness-config" class="notes">
        <div class="handles">
          <div data-balloon-pos="up" class="handle sunrise-start"></div>
          <div data-balloon-pos="up" class="handle sunrise-end"></div>
          <div data-balloon-pos="up" class="handle sunset-start"></div>
          <div data-balloon-pos="up" class="handle sunset-end"></div>
        </div>
        <div class="sunrise-start-bounds"></div>
        <div class="sunrise-end-bounds"></div>
        <div class="sunset-start-bounds"></div>
        <div class="sunset-end-bounds"></div>
    </div>`;

  // Only inject if it isn't already there.
  if (!$('#smalltime-darkness-config').length) {
    notesElement.after(injection);
  }

  // Tweak to accommodate TidyUI's smaller available space.
  if (game.modules.get('tidy-ui_game-settings')?.active && game.release.generation === 9) {
    $('#smalltime-darkness-config').css('transform', 'scale(0.9, 0.9) translate(-30px, 0px)');
  }

  // Get the current Darkness overlay color.
  const coreDarknessColor = convertHexToRGB(CONFIG.Canvas.darknessColor.toString(16));
  document.documentElement.style.setProperty('--SMLTME-darkness-r', coreDarknessColor.r);
  document.documentElement.style.setProperty('--SMLTME-darkness-g', coreDarknessColor.g);
  document.documentElement.style.setProperty('--SMLTME-darkness-b', coreDarknessColor.b);

  // Refresh the current scene BG for the settings dialog.
  grabSceneSlice();

  // Build the Darkness Config interface.
  setupDragHandles();

  // Live render the opacity changes as a preview.
  $('input[name="smalltime.opacity"]').on('input', () => {
    $('#smalltime-app').css({
      opacity: $('input[name="smalltime.opacity"]').val(),
      'transition-delay': 'none',
      transition: 'none',
    });
  });
});

// Undo the opacity preview settings.
Hooks.on('closeSettingsConfig', () => {
  $('#smalltime-app').css({
    opacity: '',
    'transition-delay': '',
    transition: '',
  });

  // Update the stops on the sunrise/sunset gradient, in case
  // there's been changes to the positions. Also update the
  // rise/set times in case of a change to sync toggle.
  updateSunriseSunsetTimes();
});

// Add a toggle button inside the Jounral Notes tool layer.
Hooks.on('getSceneControlButtons', (buttons) => {
  if (!canvas) return;
  if (game.modules.get('smalltime').viewAuth) {
    let group = buttons.find((b) => b.name === 'notes');
    group.tools.push({
      button: true,
      icon: 'fas fa-adjust',
      name: 'smalltime',
      title: 'Toggle SmallTime',
      onClick: () => {
        SmallTimeApp.toggleAppVis('toggle');
      },
    });
  }
});

// Adjust the position of the window when the size of the PlayerList changes.
Hooks.on('renderPlayerList', () => {
  const element = document.getElementById('players');
  const playerAppPos = element.getBoundingClientRect();

  // The SmallTime_PinOffset here is the ideal distance between the top of the
  // Players list and the top of SmallTime. The +21 accounts
  // for the date dropdown if enabled; the -23 accounts for the clock row
  // being disabled in some cases.
  let myOffset = playerAppPos.height + SmallTime_PinOffset;

  if (game.settings.get('smalltime', 'date-showing')) {
    myOffset += 21;
  }
  if (!game.modules.get('smalltime').clockAuth) {
    myOffset -= 23;
  }

  // Custom offset for Item Piles, which adds a button into the Players app.
  if (game.modules.get('item-piles')?.active) {
    myOffset += 30;
  }

  // This would be better done with a class add, but injecting
  // it here was the only way I could get it to enforce the
  // absolute positioning.
  $('#pin-lock').text(`
      #smalltime-app {
        top: calc(100vh - ${myOffset}px) !important;
        left: 15px !important;
      }
  `);
});

// Listen for changes to the worldTime from elsewhere.
Hooks.on('updateWorldTime', () => {
  handleTimeChange(getWorldTimeAsDayTime());
});

// Handle toggling of time separator flash when game is paused/unpaused.
Hooks.on('pauseGame', () => {
  handleRealtimeState();
});

// Listen for changes to the realtime clock state.
Hooks.on('simple-calendar-clock-start-stop', () => {
  SmallTimeApp.emitSocket('handleRealtime');
});

Hooks.on('simple-calendar-date-time-change', () => {
  updateSunriseSunsetTimes();
  updateGradientStops();
});

function updateSunriseSunsetTimes() {
  if (
    game.settings.get('smalltime', 'sun-sync') &&
    game.modules.get('foundryvtt-simple-calendar')?.active
  ) {
    // Use defaults if no seasons have been set up.
    if (SimpleCalendar.api.getAllSeasons().length == 0) {
      game.settings.set('smalltime', 'sunrise-start', SmallTime_SunriseStartDefault);
      game.settings.set('smalltime', 'sunrise-end', SmallTime_SunriseEndDefault);
      game.settings.set('smalltime', 'sunset-start', SmallTime_SunsetStartDefault);
      game.settings.set('smalltime', 'sunset-end', SmallTime_SunsetEndDefault);
    } else {
      const riseEnd = SimpleCalendar.api.getCurrentSeason().sunriseTime / 60;
      const riseStart = riseEnd - SmallTime_DawnDuskSpread;
      const setStart = SimpleCalendar.api.getCurrentSeason().sunsetTime / 60;
      const setEnd = setStart + SmallTime_DawnDuskSpread;

      game.settings.set('smalltime', 'sunrise-start', riseStart);
      game.settings.set('smalltime', 'sunrise-end', riseEnd);
      game.settings.set('smalltime', 'sunset-start', setStart);
      game.settings.set('smalltime', 'sunset-end', setEnd);
    }
  }
}

function handleRealtimeState() {
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

function updateGradientStops() {
  // Make the CSS linear gradient stops proportionally match the custom sunrise/sunset times.
  // Also used to build the gradient stops in the Settings screen.
  const initialPositions = {
    sunriseStart: convertTimeIntegerToPosition(game.settings.get('smalltime', 'sunrise-start')),
    sunriseEnd: convertTimeIntegerToPosition(game.settings.get('smalltime', 'sunrise-end')),
    sunsetStart: convertTimeIntegerToPosition(game.settings.get('smalltime', 'sunset-start')),
    sunsetEnd: convertTimeIntegerToPosition(game.settings.get('smalltime', 'sunset-end')),
  };

  const sunriseMiddle1 = Math.round(
    (initialPositions.sunriseStart * 2) / 3 + (initialPositions.sunriseEnd * 1) / 3
  );
  const sunriseMiddle2 = Math.round(
    (initialPositions.sunriseStart * 1) / 3 + (initialPositions.sunriseEnd * 2) / 3
  );
  const sunsetMiddle1 = Math.round(
    (initialPositions.sunsetStart * 2) / 3 + (initialPositions.sunsetEnd * 1) / 3
  );
  const sunsetMiddle2 = Math.round(
    (initialPositions.sunsetStart * 1) / 3 + (initialPositions.sunsetEnd * 2) / 3
  );

  // Set the initial gradient transition points.
  document.documentElement.style.setProperty(
    '--SMLTME-sunrise-start',
    convertTimeIntegerToPercentage(game.settings.get('smalltime', 'sunrise-start'))
  );
  document.documentElement.style.setProperty(
    '--SMLTME-sunrise-middle-1',
    convertTimeIntegerToPercentage(convertPositionToTimeInteger(sunriseMiddle1))
  );
  document.documentElement.style.setProperty(
    '--SMLTME-sunrise-middle-2',
    convertTimeIntegerToPercentage(convertPositionToTimeInteger(sunriseMiddle2))
  );
  document.documentElement.style.setProperty(
    '--SMLTME-sunrise-end',
    convertTimeIntegerToPercentage(game.settings.get('smalltime', 'sunrise-end'))
  );
  document.documentElement.style.setProperty(
    '--SMLTME-sunset-start',
    convertTimeIntegerToPercentage(game.settings.get('smalltime', 'sunset-start'))
  );
  document.documentElement.style.setProperty(
    '--SMLTME-sunset-middle-1',
    convertTimeIntegerToPercentage(convertPositionToTimeInteger(sunsetMiddle1))
  );
  document.documentElement.style.setProperty(
    '--SMLTME-sunset-middle-2',
    convertTimeIntegerToPercentage(convertPositionToTimeInteger(sunsetMiddle2))
  );
  document.documentElement.style.setProperty(
    '--SMLTME-sunset-end',
    convertTimeIntegerToPercentage(game.settings.get('smalltime', 'sunset-end'))
  );
}

async function saveNewDarknessConfig(positions, max, min) {
  // Set the hidden inputs for these settings to the new values,
  // so that the form-saving workflow takes care of saving them.
  $('input[name="smalltime.sunrise-start"]').val(
    convertPositionToTimeInteger(positions.sunriseStart)
  );
  $('input[name="smalltime.sunrise-end"]').val(convertPositionToTimeInteger(positions.sunriseEnd));
  $('input[name="smalltime.sunset-start"]').val(
    convertPositionToTimeInteger(positions.sunsetStart)
  );
  $('input[name="smalltime.sunset-end"]').val(convertPositionToTimeInteger(positions.sunsetEnd));

  // Set the max or min Darkness, depending on which was passed.
  if (min === false) $('input[name="smalltime.max-darkness"]').val(max);
  if (max === false) $('input[name="smalltime.min-darkness"]').val(min);
}

function setupDragHandles() {
  // If sunrise/sunset are being synced from Simple Calendar, we'll lock
  // the drag handles on the X axis.
  const sunSync =
    game.settings.get('smalltime', 'sun-sync') &&
    game.modules.get('foundryvtt-simple-calendar')?.active;

  // Build the sun/moon drag handles for the darkness config UI.
  const maxDarkness = game.settings.get('smalltime', 'max-darkness');
  const minDarkness = game.settings.get('smalltime', 'min-darkness');

  document.documentElement.style.setProperty('--SMLTME-darkness-max', maxDarkness);
  document.documentElement.style.setProperty('--SMLTME-darkness-min', minDarkness);

  const initialPositions = {
    sunriseStart: convertTimeIntegerToPosition(game.settings.get('smalltime', 'sunrise-start')),
    sunriseEnd: convertTimeIntegerToPosition(game.settings.get('smalltime', 'sunrise-end')),
    sunsetStart: convertTimeIntegerToPosition(game.settings.get('smalltime', 'sunset-start')),
    sunsetEnd: convertTimeIntegerToPosition(game.settings.get('smalltime', 'sunset-end')),
  };

  const initialTimes = {
    sunriseStart: convertPositionToDisplayTime(initialPositions.sunriseStart),
    sunriseEnd: convertPositionToDisplayTime(initialPositions.sunriseEnd),
    sunsetStart: convertPositionToDisplayTime(initialPositions.sunsetStart),
    sunsetEnd: convertPositionToDisplayTime(initialPositions.sunsetEnd),
  };

  // If syncing, append a note to the tooltips.
  const syncString = ' (Simple Calendar)';
  if (sunSync) {
    Object.keys(initialTimes).forEach((key) => (initialTimes[key] += syncString));
  }

  const snapX = 10;
  const snapY = 4;

  const offsetBetween = 20;

  $('.sunrise-start').css('top', convertDarknessToPostion(maxDarkness));
  $('.sunrise-start').css('left', initialPositions.sunriseStart);
  $('.sunrise-start').attr('aria-label', initialTimes.sunriseStart);

  $('.sunrise-end').css('top', convertDarknessToPostion(minDarkness));
  $('.sunrise-end').css('left', initialPositions.sunriseEnd);
  $('.sunrise-end').attr('aria-label', initialTimes.sunriseEnd);

  $('.sunset-start').css('top', convertDarknessToPostion(minDarkness));
  $('.sunset-start').css('left', initialPositions.sunsetStart);
  $('.sunset-start').attr('aria-label', initialTimes.sunsetStart);

  $('.sunset-end').css('top', convertDarknessToPostion(maxDarkness));
  $('.sunset-end').css('left', initialPositions.sunsetEnd);
  $('.sunset-end').attr('aria-label', initialTimes.sunsetEnd);

  updateGradientStops();

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
    let displayTime = convertPositionToDisplayTime(this.position.x);
    sunSync ? (displayTime += syncString) : null;
    $('.sunrise-start').attr('aria-label', displayTime);

    // Live update the darkness maximum.
    document.documentElement.style.setProperty(
      '--SMLTME-darkness-max',
      convertPositionToDarkness(this.position.y)
    );

    // Live update the gradient transition point.
    newTransition = convertTimeIntegerToPercentage(convertPositionToTimeInteger(this.position.x));
    document.documentElement.style.setProperty('--SMLTME-sunrise-start', newTransition);

    // Shove other handle on collisions.
    if (this.position.x >= sunriseEndDrag.position.x - offsetBetween) {
      shovedPos = this.position.x + offsetBetween;
      $('.sunrise-end').css('left', shovedPos);
      $('.sunrise-end').attr('aria-label', convertPositionToDisplayTime(shovedPos));
      sunriseEndDrag.setPosition(shovedPos);
      newTransition = convertTimeIntegerToPercentage(convertPositionToTimeInteger(shovedPos));
      document.documentElement.style.setProperty('--SMLTME-sunrise-end', newTransition);
    }
  });

  sunriseEndDrag.on('dragMove', function () {
    // Match the paired handle.
    $('.sunset-start').css('top', this.position.y + 'px');
    // Update the tooltip. Append sync note if syncing.
    let displayTime = convertPositionToDisplayTime(this.position.x);
    sunSync ? (displayTime += syncString) : null;
    $('.sunrise-end').attr('aria-label', displayTime);

    // Live update the darkness minimum.
    document.documentElement.style.setProperty(
      '--SMLTME-darkness-min',
      convertPositionToDarkness(this.position.y)
    );

    // Live update the gradient transition point.
    newTransition = convertTimeIntegerToPercentage(convertPositionToTimeInteger(this.position.x));
    document.documentElement.style.setProperty('--SMLTME-sunrise-end', newTransition);

    // Shove other handle on collisions.
    if (this.position.x <= sunriseStartDrag.position.x + offsetBetween) {
      shovedPos = this.position.x - offsetBetween;
      $('.sunrise-start').css('left', shovedPos);
      $('.sunrise-start').attr('aria-label', convertPositionToDisplayTime(shovedPos));
      sunriseStartDrag.setPosition(shovedPos);
      newTransition = convertTimeIntegerToPercentage(convertPositionToTimeInteger(shovedPos));
      document.documentElement.style.setProperty('--SMLTME-sunrise-start', newTransition);
    }
  });

  sunsetStartDrag.on('dragMove', function () {
    // Match the paired handle.
    $('.sunrise-end').css('top', this.position.y + 'px');
    // Update the tooltip. Append sync note if syncing.
    let displayTime = convertPositionToDisplayTime(this.position.x);
    sunSync ? (displayTime += syncString) : null;
    $('.sunset-start').attr('aria-label', displayTime);

    // Live update the darkness minimum.
    document.documentElement.style.setProperty(
      '--SMLTME-darkness-min',
      convertPositionToDarkness(this.position.y)
    );

    // Live update the gradient transition point.
    newTransition = convertTimeIntegerToPercentage(convertPositionToTimeInteger(this.position.x));
    document.documentElement.style.setProperty('--SMLTME-sunset-start', newTransition);

    // Shove other handle on collisions.
    if (this.position.x >= sunsetEndDrag.position.x - offsetBetween) {
      shovedPos = this.position.x + offsetBetween;
      $('.sunset-end').css('left', shovedPos);
      $('.sunset-end').attr('aria-label', convertPositionToDisplayTime(shovedPos));
      sunsetEndDrag.setPosition(shovedPos);
      newTransition = convertTimeIntegerToPercentage(convertPositionToTimeInteger(shovedPos));
      document.documentElement.style.setProperty('--SMLTME-sunset-end', newTransition);
    }
  });

  sunsetEndDrag.on('dragMove', function () {
    // Match the paired handle.
    $('.sunrise-start').css('top', this.position.y + 'px');
    // Update the tooltip. Append sync note if syncing.
    let displayTime = convertPositionToDisplayTime(this.position.x);
    sunSync ? (displayTime += syncString) : null;
    $('.sunset-end').attr('aria-label', displayTime);

    // Live update the darkness maximum.
    document.documentElement.style.setProperty(
      '--SMLTME-darkness-max',
      convertPositionToDarkness(this.position.y)
    );

    // Live update the gradient transition point.
    newTransition = convertTimeIntegerToPercentage(convertPositionToTimeInteger(this.position.x));
    document.documentElement.style.setProperty('--SMLTME-sunset-end', newTransition);

    // Shove other handle on collisions.
    if (this.position.x <= sunsetStartDrag.position.x + offsetBetween) {
      shovedPos = this.position.x - offsetBetween;
      $('.sunset-start').css('left', shovedPos);
      $('.sunset-start').attr('aria-label', convertPositionToDisplayTime(shovedPos));
      sunsetStartDrag.setPosition(shovedPos);
      newTransition = convertTimeIntegerToPercentage(convertPositionToTimeInteger(shovedPos));
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
    let newMaxDarkness = convertPositionToDarkness(this.position.y);
    if (newMaxDarkness > 1) newMaxDarkness = 1;
    saveNewDarknessConfig(newPositions, newMaxDarkness, false);
  });

  sunriseEndDrag.on('dragEnd', async function () {
    const newPositions = {
      sunriseStart: sunriseStartDrag.position.x,
      sunriseEnd: sunriseEndDrag.position.x,
      sunsetStart: sunsetStartDrag.position.x,
      sunsetEnd: sunsetEndDrag.position.x,
    };
    let newMinDarkness = convertPositionToDarkness(this.position.y);
    if (newMinDarkness < 0) newMinDarkness = 0;
    saveNewDarknessConfig(newPositions, false, newMinDarkness);
  });

  sunsetStartDrag.on('dragEnd', async function () {
    const newPositions = {
      sunriseStart: sunriseStartDrag.position.x,
      sunriseEnd: sunriseEndDrag.position.x,
      sunsetStart: sunsetStartDrag.position.x,
      sunsetEnd: sunsetEndDrag.position.x,
    };
    let newMinDarkness = convertPositionToDarkness(this.position.y);
    if (newMinDarkness < 0) newMinDarkness = 0;
    saveNewDarknessConfig(newPositions, false, newMinDarkness);
  });

  sunsetEndDrag.on('dragEnd', async function () {
    const newPositions = {
      sunriseStart: sunriseStartDrag.position.x,
      sunriseEnd: sunriseEndDrag.position.x,
      sunsetStart: sunsetStartDrag.position.x,
      sunsetEnd: sunsetEndDrag.position.x,
    };
    let newMaxDarkness = convertPositionToDarkness(this.position.y);
    if (newMaxDarkness > 1) newMaxDarkness = 1;
    saveNewDarknessConfig(newPositions, newMaxDarkness, false);
  });
}

function convertTimeIntegerToPercentage(time) {
  // Percentage is a proportion of the current time out of the 1440-minute day.
  return Math.round((time / 1440) * 100) + '%';
}

function convertPositionToTimeInteger(position) {
  return (position - 30) * 3;
}

function convertTimeIntegerToPosition(timeInteger) {
  return timeInteger / 3 + 30;
}

function convertDarknessToPostion(darkness) {
  return darkness * 45 + 2;
}

function convertPositionToDarkness(position) {
  let darkCalc = Math.round((1 - (position - 45) / -40) * 10) / 10;
  return Math.min(Math.max(darkCalc, 0), 1);
}

function convertPositionToDisplayTime(position) {
  const displayTimeObj = SmallTimeApp.convertTimeIntegerToDisplay(
    convertPositionToTimeInteger(position)
  );
  return displayTimeObj.hours + ':' + displayTimeObj.minutes;
}

function convertDisplayObjToString(displayObj) {
  return displayObj.hours + ':' + displayObj.minutes;
}

// Convert worldTime (seconds elapsed) into an integer time of day.
function getWorldTimeAsDayTime() {
  const currentWorldTime = game.time.worldTime + SmallTime_EpochOffset;
  const dayTime = Math.abs(Math.trunc((currentWorldTime % 86400) / 60));
  if (currentWorldTime < 0) {
    return 1440 - dayTime;
  } else return dayTime;
}

// Advance/retreat the elapsed worldTime based on changes made.
async function setWorldTime(newTime) {
  const currentWorldTime = game.time.worldTime + SmallTime_EpochOffset;
  const dayTime = getWorldTimeAsDayTime(currentWorldTime);
  const delta = newTime - dayTime;
  game.time.advance(delta * 60);
}

function getCalendarProviders() {
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
function setCalendarFallback() {
  const providerSetting = game.settings.get('smalltime', 'calendar-provider');

  if (!game.user.isGM) return;

  // If the provider is set to a module or system that isn't available, use the
  // first available provider by default.
  if (
    (providerSetting === 'sc' && !game.modules.get('foundryvtt-simple-calendar')?.active) ||
    (providerSetting === 'cw' && !game.modules.get('calendar-weather')?.active) ||
    (providerSetting === 'pf2e' && !(game.system.id === 'pf2e'))
  ) {
    game.settings.set('smalltime', 'calendar-provider', getCalendarProviders()[0]);
  }
}

// Helper function for time-changing socket updates.
function handleTimeChange(timeInteger) {
  SmallTimeApp.timeTransition(timeInteger);
  $('#hourString').html(SmallTimeApp.convertTimeIntegerToDisplay(timeInteger).hours);
  $('#minuteString').html(SmallTimeApp.convertTimeIntegerToDisplay(timeInteger).minutes);

  // Calculate and show the current seconds if required.
  if (
    game.settings.get('smalltime', 'time-format') == 24 &&
    game.settings.get('smalltime', 'show-seconds') == true
  ) {
    const currentWorldTime = game.time.worldTime + SmallTime_EpochOffset;
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
  handleRealtimeState();
  SmallTimeApp.updateDate();
}

function getDate(provider, variant) {
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
    day = SimpleCalendar.api.timestampToDate(game.time.worldTime).showWeekdayHeadings
      ? SCobject.weekday
      : undefined;
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
    stringAfter(day, ', ') +
      stringAfter(monthName) +
      stringAfter(date + (ordinalSuffix ? ordinalSuffix : ''), ', ') +
      stringAfter(yearPrefix) +
      year +
      stringBefore(yearPostfix)
  );

  // Thursday, August 12th
  displayDate.push(
    stringAfter(day, ', ') +
      stringAfter(monthName) +
      stringAfter(date + (ordinalSuffix ? ordinalSuffix : ''))
  );

  // Thursday August, 2021
  displayDate.push(stringAfter(day, ' ') + stringAfter(monthName, ', ') + year);

  // August 12th, 2021
  displayDate.push(
    stringAfter(monthName) +
      stringAfter(date + (ordinalSuffix ? ordinalSuffix : ''), ', ') +
      stringAfter(yearPrefix) +
      year
  );

  // August 12th
  displayDate.push(
    stringAfter(monthName) + stringAfter(date + (ordinalSuffix ? ordinalSuffix : ''))
  );

  // Thursday, 12 August, 2021 C.E.
  displayDate.push(
    stringAfter(day, ', ') +
      stringAfter(date) +
      stringAfter(monthName, ', ') +
      stringAfter(yearPrefix) +
      year +
      stringBefore(yearPostfix)
  );

  // Thursday, 12 August
  displayDate.push(stringAfter(day, ', ') + stringAfter(date) + stringAfter(monthName));

  // 12 August, 2021
  displayDate.push(stringAfter(date) + stringAfter(monthName, ', ') + year);

  // 12 August
  displayDate.push(stringAfter(date) + stringAfter(monthName));

  // 12 / 8 / 2021
  displayDate.push(stringAfter(date, ' / ') + stringAfter(month, ' / ') + year);

  // 8 / 12 / 2021
  displayDate.push(stringAfter(month, ' / ') + stringAfter(date, ' / ') + year);

  // 2021 / 8 / 12
  displayDate.push(stringAfter(year, ' / ') + stringAfter(month, ' / ') + date);

  return displayDate[variant];
}

function stringAfter(stringText, afterString = ' ') {
  return stringText ? stringText + afterString : '';
}

function stringBefore(stringText, beforeString = ' ') {
  return stringText ? beforeString + stringText : '';
}

function grabSceneSlice() {
  // Prefer the full image, but fall back to the thumbnail in the case
  // of tile BGs or animations. Use a generic image for empty scenes.
  let sceneBG = canvas.scene.data.img;
  if (!sceneBG || sceneBG.endsWith('.m4v') || sceneBG.endsWith('.webp')) {
    sceneBG = canvas.scene.data.thumb;
  }
  if (!sceneBG || sceneBG.startsWith('data')) {
    // Generic scene slice provided by MADCartographer -- thanks! :)
    sceneBG = 'modules/smalltime/images/generic-bg.webp';
  }
  document.documentElement.style.setProperty('--SMLTME-scene-bg', 'url(/' + sceneBG + ')');
}

function convertHexToRGB(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

// Overriding the Vision Limitation Threshold value for the scene if requested.
// Values span from 0.0 to 1.0 to mimic brightness levels of the various phases.
async function adjustMoonlight(phase) {
  let newThreshold;
  switch (phase) {
    case 0: // new
      newThreshold = 0;
      break;
    case 1: // waxing crescent
    case 7: // waning crescent
      newThreshold = 0.25;
      break;
    case 2: // first quarter
    case 6: // last quarter
      newThreshold = 0.5;
      break;
    case 3: // waxing gibbous
    case 5: // waning gibbous
      newThreshold = 0.75;
      break;
    case 4: // full
      newThreshold = 1;
      break;
  }
  if (newThreshold === game.scenes.viewed.data.globalLightThreshold) {
    return true;
  }
  await canvas.scene.update({ globalLightThreshold: newThreshold });
}

class SmallTimeApp extends FormApplication {
  static _isOpen = false;

  async _render(force = false, options = {}) {
    await super._render(force, options);
    SmallTimeApp._isOpen = true;
    // Remove the window from candidates for closing via Escape.
    delete ui.windows[this.appId];
  }

  // Override original #close method inherited from parent class.
  async close(options = {}) {
    // If called by SmallTime, record that it is not longer visible.
    if (options.smallTime) {
      SmallTimeApp._isOpen = false;
      game.settings.set('smalltime', 'visible', false);
    }
    return super.close(options);
  }

  constructor() {
    super();
    this.currentTime = getWorldTimeAsDayTime();
  }

  static get defaultOptions() {
    const pinned = game.settings.get('smalltime', 'pinned');

    const playerApp = document.getElementById('players');
    const playerAppPos = playerApp.getBoundingClientRect();

    this.initialPosition = game.settings.get('smalltime', 'position');

    // The actual pin location is set elsewhere, but we need to insert something
    // manually here to feed it values for the initial render.
    if (pinned) {
      this.initialPosition.top = playerAppPos.top - 70;
      this.initialPosition.left = playerAppPos.left;
    }

    return mergeObject(super.defaultOptions, {
      classes: ['form'],
      popOut: true,
      submitOnChange: true,
      closeOnSubmit: false,
      minimizable: false,
      template: 'modules/smalltime/templates/smalltime.html',
      id: 'smalltime-app',
      title: 'SmallTime',
      top: this.initialPosition.top,
      left: this.initialPosition.left,
    });
  }

  async _updateObject(event, formData) {
    // Get the slider value.
    const newTime = formData.timeSlider;
    // Save the new time.
    if (game.user.isGM) {
      await setWorldTime(newTime);
    } else {
      SmallTimeApp.emitSocket('changeTime', newTime);
    }
  }

  getData() {
    // Send values to the HTML template.
    return {
      timeValue: this.currentTime,
      hourString: SmallTimeApp.convertTimeIntegerToDisplay(this.currentTime).hours,
      minuteString: SmallTimeApp.convertTimeIntegerToDisplay(this.currentTime).minutes,
      dateString: game.settings.get('smalltime', 'current-date'),
    };
  }

  activateListeners(html) {
    super.activateListeners(html);

    const dragHandle = html.find('#dragHandle')[0];
    const drag = new Draggable(this, html, dragHandle, false);

    // Pin zone is the "jiggle area" in which the app will be locked
    // to a pinned position if dropped. pinZone stores whether or not
    // we're currently in that area.
    let pinZone = false;

    // Have to override this because of the non-standard drag handle, and
    // also to manage the pin lock zone and animation effects.
    drag._onDragMouseMove = function _newOnDragMouseMove(event) {
      event.preventDefault();

      const playerApp = document.getElementById('players');
      const playerAppPos = playerApp.getBoundingClientRect();

      // Limit dragging to 60 updates per second.
      const now = Date.now();
      if (now - this._moveTime < 1000 / 60) return;
      this._moveTime = now;

      SmallTimeApp.unPinApp();

      // Follow the mouse.
      // TODO: Figure out how to account for changes to the viewport size
      // between drags.
      let conditionalOffset = 0;
      if (
        game.settings.get('smalltime', 'date-showing') &&
        game.settings.get('smalltime', 'pinned') &&
        game.modules.get('smalltime').dateAvailable
      ) {
        conditionalOffset = 20;
      }
      if (!game.modules.get('smalltime').clockAuth && game.settings.get('smalltime', 'pinned')) {
        conditionalOffset = -23;
      }

      this.app.setPosition({
        left: this.position.left + (event.clientX - this._initial.x),
        top: this.position.top + (event.clientY - this._initial.y - conditionalOffset),
      });

      // Defining a region above the PlayerList that will trigger the jiggle.
      let playerAppUpperBound = playerAppPos.top - 50;
      let playerAppLowerBound = playerAppPos.top + 50;

      if (
        event.clientX < 215 &&
        event.clientY > playerAppUpperBound &&
        event.clientY < playerAppLowerBound
      ) {
        $('#smalltime-app').css('animation', 'jiggle 0.2s infinite');
        pinZone = true;
      } else {
        $('#smalltime-app').css('animation', '');
        pinZone = false;
      }
    };

    drag._onDragMouseUp = async function _newOnDragMouseUp(event) {
      event.preventDefault();

      window.removeEventListener(...this.handlers.dragMove);
      window.removeEventListener(...this.handlers.dragUp);

      const playerApp = document.getElementById('players');
      const playerAppPos = playerApp.getBoundingClientRect();
      let myOffset = playerAppPos.height + SmallTime_PinOffset;

      // If the mouseup happens inside the Pin zone, pin the app.
      if (pinZone) {
        SmallTimeApp.pinApp(
          game.settings.get('smalltime', 'date-showing') &&
            game.modules.get('smalltime').dateAvailable
        );
        await game.settings.set('smalltime', 'pinned', true);
        this.app.setPosition({
          left: 15,
          top: window.innerHeight - myOffset,
        });
      } else {
        let windowPos = $('#smalltime-app').position();
        let newPos = { top: windowPos.top, left: windowPos.left };
        await game.settings.set('smalltime', 'position', newPos);
        await game.settings.set('smalltime', 'pinned', false);
      }

      // Kill the jiggle animation on mouseUp.
      $('#smalltime-app').css('animation', '');
    };

    // An initial set of the sun/moon/bg/time/date display in case it hasn't been
    // updated since a settings change for some reason.
    SmallTimeApp.timeTransition(this.currentTime);
    SmallTimeApp.updateDate();

    // Handle cycling through the moon phases on Shift-clicks.
    $('#timeSlider').on('click', async function () {
      if (event.shiftKey && game.modules.get('smalltime').controlAuth) {
        const startingPhase = game.settings.get('smalltime', 'moon-phase');
        const newPhase = (startingPhase + 1) % SmallTime_MoonPhases.length;

        document.documentElement.style.setProperty(
          '--SMLTME-phaseURL',
          `url('../images/moon-phases/${SmallTime_MoonPhases[newPhase]}.webp')`
        );

        // Set and broadcast the change.
        if (game.user.isGM) {
          await game.settings.set('smalltime', 'moon-phase', newPhase);
          adjustMoonlight(newPhase);
        } else {
          SmallTimeApp.emitSocket('changeSetting', {
            scope: 'smalltime',
            key: 'moon-phase',
            value: newPhase,
          });
        }
        if (game.user.isGM) {
          await setWorldTime($(this).val());
        }
        SmallTimeApp.emitSocket('changeTime', $(this).val());
      }
    });

    // Handle live feedback while dragging the sun/moon slider.
    $(document).on(
      'input',
      '#timeSlider',
      debounce(async function () {
        $('#hourString').html(SmallTimeApp.convertTimeIntegerToDisplay($(this).val()).hours);
        $('#minuteString').html(SmallTimeApp.convertTimeIntegerToDisplay($(this).val()).minutes);
        SmallTimeApp.timeTransition($(this).val());
        if (game.user.isGM) {
          SmallTimeApp.emitSocket('changeTime', $(this).val());
        }
      }, 100)
    );

    // Wait for the actual change event to do the time set.
    $(document).on('change', '#timeSlider', async function () {
      if (game.user.isGM) {
        setWorldTime($(this).val());
      } else {
        SmallTimeApp.emitSocket('changeTime', $(this).val());
      }
    });

    // Toggle the date display div, if a calendar provider is enabled.
    // The inline CSS overrides are a bit hacky, but were the
    // only way I could get the desired behaviour.
    html.find('#timeDisplay').on('click', async function () {
      if (
        event.shiftKey &&
        game.modules.get('smalltime').controlAuth &&
        !game.paused &&
        game.modules.get('foundryvtt-simple-calendar')?.active
      ) {
        if (SimpleCalendar.api.clockStatus().started) {
          SimpleCalendar.api.stopClock();
        } else {
          SimpleCalendar.api.startClock();
        }
        if (game.user.isGM) {
          handleRealtimeState();
        }
        SmallTimeApp.emitSocket('handleRealtime');
      } else {
        if (
          !game.settings.get('smalltime', 'date-showing') &&
          game.modules.get('smalltime').dateAvailable
        ) {
          $('#smalltime-app').addClass('show-date');
          $('#smalltime-app').animate({ height: '79px' }, 80);
          if (game.settings.get('smalltime', 'pinned')) {
            SmallTimeApp.unPinApp();
            SmallTimeApp.pinApp(true);
          }
          await game.settings.set('smalltime', 'date-showing', true);
        } else {
          $('#smalltime-app').removeClass('show-date');
          $('#smalltime-app').animate({ height: '59px' }, 80);
          if (game.settings.get('smalltime', 'pinned')) {
            SmallTimeApp.unPinApp();
            SmallTimeApp.pinApp(false);
          }
          await game.settings.set('smalltime', 'date-showing', false);
        }
      }
    });

    // Open the Simple Calendar interface on date clicks.
    html.find('#dateDisplay').on('click', async function () {
      if (
        game.settings.get('smalltime', 'calendar-provider') === 'sc' &&
        game.modules.get('foundryvtt-simple-calendar')?.active
      )
        SimpleCalendar.api.showCalendar();
    });

    // Handle the increment/decrement buttons.
    let smallStep;
    let largeStep;

    html.find('#decrease-small').on('click', () => {
      smallStep = game.settings.get('smalltime', 'small-step');
      if (event.shiftKey) {
        this.timeRatchet(-Math.abs(smallStep * 2));
      } else {
        this.timeRatchet(-Math.abs(smallStep));
      }
    });

    html.find('#decrease-large').on('click', () => {
      largeStep = game.settings.get('smalltime', 'large-step');
      if (event.shiftKey) {
        this.timeRatchet(-Math.abs(largeStep * 2));
      } else {
        this.timeRatchet(-Math.abs(largeStep));
      }
    });

    html.find('#increase-small').on('click', () => {
      smallStep = game.settings.get('smalltime', 'small-step');
      if (event.shiftKey) {
        this.timeRatchet(smallStep * 2);
      } else {
        this.timeRatchet(smallStep);
      }
    });

    html.find('#increase-large').on('click', () => {
      largeStep = game.settings.get('smalltime', 'large-step');
      if (event.shiftKey) {
        this.timeRatchet(largeStep * 2);
      } else {
        this.timeRatchet(largeStep);
      }
    });

    // Listen for moon phase changes from Simple Calendar.
    if (game.modules.get('foundryvtt-simple-calendar')?.active && game.user.isGM) {
      Hooks.on(SimpleCalendar.Hooks.DateTimeChange, async function (data) {
        if (typeof data.moons[0] === 'undefined') {
          return;
        }
        const newPhase = SmallTime_MoonPhases.findIndex(function (phase) {
          return phase === data.moons[0].currentPhase.icon;
        });
        await game.settings.set('smalltime', 'moon-phase', newPhase);
        SmallTimeApp.timeTransition(getWorldTimeAsDayTime());
      });
    }
  }

  // Helper function for handling sockets.
  static emitSocket(type, payload) {
    game.socket.emit('module.smalltime', {
      type: type,
      payload: payload,
    });
  }

  // Functionality for increment/decrement buttons.
  async timeRatchet(delta) {
    let currentTime = getWorldTimeAsDayTime();
    let newTime = currentTime + delta;

    if (newTime < 0) {
      // 1440 is the value for 24:00 at the end of the slider.
      newTime = 1440 + newTime;
    }
    if (newTime > 1440) {
      newTime = newTime - 1440;
    }

    if (game.user.isGM) {
      game.time.advance(delta * 60);
    } else {
      SmallTimeApp.emitSocket('changeTime', newTime);
    }
    SmallTimeApp.timeTransition(newTime);
  }

  // Render changes to the sun/moon slider, and handle Darkness link.
  static async timeTransition(timeNow) {
    let sunriseStart = game.settings.get('smalltime', 'sunrise-start');
    let sunriseEnd = game.settings.get('smalltime', 'sunrise-end');
    let sunsetStart = game.settings.get('smalltime', 'sunset-start');
    let sunsetEnd = game.settings.get('smalltime', 'sunset-end');

    const midnight = 1440;

    // Handles the range slider's sun/moon icons, and the BG color changes.
    // The 2000 here is the height of the CSS gradient.
    let bgOffset = Math.round((timeNow / midnight) * 2000);

    // Set the offset accordingly.
    $('#slideContainer').css('background-position', `0px -${bgOffset}px`);

    // Swap out the moon for the sun during daytime,
    // changing phase as appropriate.
    const currentPhase = game.settings.get('smalltime', 'moon-phase');

    if (timeNow >= sunriseEnd && timeNow < sunsetStart) {
      $('#timeSlider').removeClass('moon');
      $('#timeSlider').addClass('sun');
    } else {
      $('#timeSlider').removeClass('sun');
      $('#timeSlider').addClass('moon');
      document.documentElement.style.setProperty(
        '--SMLTME-phaseURL',
        `url('../images/moon-phases/${SmallTime_MoonPhases[currentPhase]}.webp')`
      );
    }

    // If requested, adjust the scene's Darkness level.
    const currentScene = canvas.scene;
    if (
      currentScene.getFlag('smalltime', 'darkness-link') &&
      game.modules.get('smalltime').controlAuth
    ) {
      let darknessValue = canvas.lighting.darknessLevel;
      const maxD = game.settings.get('smalltime', 'max-darkness');
      const minD = game.settings.get('smalltime', 'min-darkness');

      // Clamp the values between 0 and 1 just in case they're out of bounds.
      let maxDarkness = Math.min(Math.max(maxD, 0), 1);
      let minDarkness = Math.min(Math.max(minD, 0), 1);

      // If requested, adjust max Darkness based on moon phase.
      if (game.settings.get('smalltime', 'moon-darkness')) {
        const moonlightFactor = 0.4; // Percentage by which available moonlight reduces max Darkness.
        const moonlightMultiplier = moonlightFactor * SmallTime_PhaseValues[currentPhase];
        maxDarkness = Math.round((1 - maxDarkness * moonlightMultiplier) * 100) / 100;
      }

      let multiplier = maxDarkness - minDarkness;
      if (multiplier < 0) multiplier = minDarkness - maxDarkness;

      if (timeNow > sunriseEnd && timeNow < sunsetStart) {
        darknessValue = minDarkness;
      } else if (timeNow < sunriseStart) {
        darknessValue = maxDarkness;
      } else if (timeNow > sunsetEnd) {
        darknessValue = maxDarkness;
      }

      if (minDarkness > maxDarkness) {
        if (timeNow >= sunriseStart && timeNow <= sunriseEnd) {
          darknessValue =
            maxDarkness + ((timeNow - sunriseStart) / (sunriseEnd - sunriseStart)) * multiplier;
        } else if (timeNow >= sunsetStart && timeNow <= sunsetEnd) {
          darknessValue =
            maxDarkness + (1 - (timeNow - sunsetStart) / (sunsetEnd - sunsetStart)) * multiplier;
        }
      } else {
        if (timeNow >= sunriseStart && timeNow <= sunriseEnd) {
          darknessValue =
            minDarkness + (1 - (timeNow - sunriseStart) / (sunriseEnd - sunriseStart)) * multiplier;
        } else if (timeNow >= sunsetStart && timeNow <= sunsetEnd) {
          darknessValue =
            minDarkness + ((timeNow - sunsetStart) / (sunsetEnd - sunsetStart)) * multiplier;
        }
      }
      // Truncate long decimals.
      darknessValue = Math.round(darknessValue * 10) / 10;

      // Perform the Darkness update, and send it out to other clients.
      if (game.user.isGM) {
        await currentScene.update({ darkness: darknessValue });
      } else {
        SmallTimeApp.emitSocket('changeDarkness', {
          darkness: darknessValue,
          sceneID: currentScene.id,
        });
      }
    }
  }

  // Convert the integer time value to hours and minutes.
  static convertTimeIntegerToDisplay(timeInteger) {
    let theHours = Math.floor(timeInteger / 60);
    let theMinutes = timeInteger - theHours * 60;

    if (theMinutes < 10) theMinutes = `0${theMinutes}`;
    if (theMinutes === 0) theMinutes = '00';

    if (game.settings.get('smalltime', 'time-format') === 12) {
      if (theHours >= 12) {
        if (theHours === 12) {
          theMinutes = `${theMinutes} PM`;
        } else if (theHours === 24) {
          theHours = 12;
          theMinutes = `${theMinutes} AM`;
        } else {
          theHours = theHours - 12;
          theMinutes = `${theMinutes} PM`;
        }
      } else {
        theMinutes = `${theMinutes} AM`;
      }
      if (theHours === 0) theHours = 12;
    }

    const timeObj = { hours: theHours, minutes: theMinutes };

    return timeObj;
  }

  // Pin the app above the Players list.
  static async pinApp(expanded) {
    // Only do this if a pin lock isn't already in place.
    if (!$('#pin-lock').length) {
      const playerApp = document.getElementById('players');
      const playerAppPos = playerApp.getBoundingClientRect();
      let myOffset = playerAppPos.height + SmallTime_PinOffset;

      if (expanded) {
        myOffset += 21;
      }
      if (!game.modules.get('smalltime').clockAuth) {
        myOffset -= 23;
      }

      // Dropping this into the DOM with an !important was the only way
      // I could get it to enable the locking behaviour.
      $('body').append(`
        <style id="pin-lock">
          #smalltime-app {
            top: calc(100vh - ${myOffset}px) !important;
            left: 15px !important;
          }
        </style>
      `);
      await game.settings.set('smalltime', 'pinned', true);
    }
  }

  // Un-pin the app.
  static unPinApp() {
    // Remove the style tag that's pinning the window.
    $('#pin-lock').remove();
  }

  // Toggle visibility of the main window.
  static async toggleAppVis(mode) {
    if (!game.modules.get('smalltime').viewAuth) return;
    if (mode === 'toggle') {
      if (game.settings.get('smalltime', 'visible') === true) {
        // Stop any currently-running animations, and then animate the app
        // away before close(), to avoid the stock close() animation.
        $('#smalltime-app').stop();
        $('#smalltime-app').css({ animation: 'close 0.2s', opacity: '0' });
        setTimeout(function () {
          // Pass an object to .close() to indicate that it came from SmallTime,
          // and not from an Escape keypress.
          game.modules.get('smalltime').myApp.close({ smallTime: true });
        }, 200);
      } else {
        // Make sure there isn't already an instance of the app rendered.
        // Fire off a close() just in case, clears up some stuck states.
        if (SmallTimeApp._isOpen) {
          game.modules.get('smalltime').myApp.close({ smallTime: true });
        }
        game.modules.get('smalltime').myApp = await new SmallTimeApp().render(true);
        game.settings.set('smalltime', 'visible', true);
      }
    } else if (game.settings.get('smalltime', 'visible') === true) {
      game.modules.get('smalltime').myApp = await new SmallTimeApp().render(true);
    }
  }

  // Get the date from various calendar providers.
  static async updateDate() {
    let displayDate = getDate(
      game.settings.get('smalltime', 'calendar-provider'),
      game.settings.get('smalltime', 'date-format')
    );

    $('#dateDisplay').html(displayDate);

    // Save this string so we can display it on initial load-in,
    // before the calendar provider is ready.
    if (game.user.isGM) await game.settings.set('smalltime', 'current-date', displayDate);
  }
}

// Sun & moon icons by Freepik on flaticon.com
