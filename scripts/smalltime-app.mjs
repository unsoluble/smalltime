import { Helpers, ST_Config } from './helpers.mjs';

Hooks.on('init', () => {
  game.keybindings.register('smalltime', 'toggle-hotkey', {
    name: game.i18n.localize('SMLTME.Toggle_Hotkey'),
    hint: game.i18n.localize('SMLTME.Toggle_Hotkey_Hint'),
    editable: [{ key: 'KeyS', modifiers: ['SHIFT'] }],
    precedence: CONST.KEYBINDING_PRECEDENCE.PRIORITY,
    restricted: false,
    onDown: () => {
      SmallTimeApp.toggleAppVis('toggle');
      return true;
    },
  });

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
  const calendarProviders = Helpers.getCalendarProviders();
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
    default: 'cd',
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
      120: '120',
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
    default: ST_Config.MaxDarknessDefault,
  });

  game.settings.register('smalltime', 'min-darkness', {
    scope: 'world',
    config: true,
    type: Number,
    default: ST_Config.MinDarknessDefault,
  });

  game.settings.register('smalltime', 'sunrise-start', {
    scope: 'world',
    config: true,
    type: Number,
    default: ST_Config.SunriseStartDefault,
  });

  game.settings.register('smalltime', 'sunrise-end', {
    scope: 'world',
    config: true,
    type: Number,
    default: ST_Config.SunriseEndDefault,
  });

  game.settings.register('smalltime', 'sunset-start', {
    scope: 'world',
    config: true,
    type: Number,
    default: ST_Config.SunsetStartDefault,
  });

  game.settings.register('smalltime', 'sunset-end', {
    name: game.i18n.localize('SMLTME.Darkness_Config'),
    hint: game.i18n.localize('SMLTME.Darkness_Config_Hint'),
    scope: 'world',
    config: true,
    type: Number,
    default: ST_Config.SunsetEndDefault,
  });

  game.settings.register('smalltime', 'sun-sync', {
    name: game.i18n.localize('SMLTME.Sun_Sync'),
    hint: game.i18n.localize('SMLTME.Sun_Sync_Hint'),
    scope: 'world',
    config: game.modules.get('calendaria')?.active,
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

  game.settings.register('smalltime', 'moon-tint', {
    name: game.i18n.localize('SMLTME.Moon_Tint'),
    hint: game.i18n.localize('SMLTME.Moon_Tint_Hint'),
    scope: 'world',
    config: game.modules.get('calendaria')?.active,
    type: Boolean,
    default: false,
  });

  game.settings.register('smalltime', 'phase-impact', {
    name: game.i18n.localize('SMLTME.Phase_Impact'),
    hint: game.i18n.localize('SMLTME.Phase_Impact_Hint'),
    scope: 'world',
    config: true,
    type: Number,
    range: {
      min: 0,
      max: 1,
      step: 0.1,
    },
    default: 0.4,
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

Hooks.on('setup', () => {
  // Only allow the date display to show if there's a calendar provider available.
  game.modules.get('smalltime').dateAvailable = false;
  if (game.modules.get('calendaria')?.active) {
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
  let visLevel = thisScene?.getFlag?.('smalltime', 'player-vis');
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
  if (game.settings.get('smalltime', 'allow-trusted') && game.user.role === CONST.USER_ROLES.TRUSTED) {
    game.modules.get('smalltime').viewAuth = true;
    game.modules.get('smalltime').clockAuth = true;
    game.modules.get('smalltime').controlAuth = true;
  }
});

Hooks.on('canvasInit', () => {
  // Start by resetting the Darkness color to the core value.
  CONFIG.Canvas.darknessColor = ST_Config.coreDarknessColor;

  if (game.modules.get('foundryvtt-simple-calendar')?.active && game.settings.get('smalltime', 'moon-tint')) {
    if (game.scenes.viewed.getFlag('smalltime', 'darkness-link')) {
      // Set the global Darkness color to the color of the first moon in Simple Calendar, if configured.
      // The pSBC function drops the brightness to an appropriate level.
      // Ignore if the moon is set to its default color of white.
      if (SimpleCalendar.api.getAllMoons()[0].color != '#ffffff') {
        const darknessColorFromMoon = Helpers.pSBC(-0.9, SimpleCalendar.api.getAllMoons()[0].color);
        CONFIG.Canvas.darknessColor = darknessColorFromMoon;
      }
    }
  }
  // Re-draw the canvas with the new Darkness color.
  if (game.release.generation < 12) {
    canvas.colorManager.initialize();
  }
});

// Set the initial state for newly rendered scenes.
Hooks.on('canvasReady', () => {
  if (game.modules.get('smalltime').viewAuth) {
    SmallTimeApp.toggleAppVis('initial');
    if (game.settings.get('smalltime', 'pinned')) {
      SmallTimeApp.pinApp();
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
    const thisScene = game.scenes.viewed;

    // Set the Darkness link state to the default choice.
    if (!foundry.utils.hasProperty(thisScene, 'flags.smalltime.darkness-link')) {
      thisScene.setFlag('smalltime', 'darkness-link', darknessDefault);
    }
    // Set the Player Vis state to the default choice.
    if (!foundry.utils.hasProperty(thisScene, 'flags.smalltime.player-vis')) {
      thisScene.setFlag('smalltime', 'player-vis', visDefault);
    }

    // Refresh the current scene's Darkness level if it should be linked.
    if (thisScene.getFlag('smalltime', 'darkness-link')) {
      SmallTimeApp.timeTransition(Helpers.getWorldTimeAsDayTime());
    }
    // Refresh the current scene BG for the settings dialog.
    Helpers.grabSceneSlice();
  }
});

// Wait for Calendaria to have its seasons set up before checking rise/set times.
Hooks.on('calendaria.ready', async () => {
  await Helpers.updateSunriseSunsetTimes();
});

Hooks.on('ready', () => {
  // Send incoming socket emissions through the async function.
  game.socket.on(`module.smalltime`, (data) => {
    doSocket(data);
  });

  async function doSocket(data) {
    const canApplySocketSetting = (payload) => {
      if (!payload || payload.scope !== 'smalltime') return false;

      const sender = payload.userId ? game.users.get(payload.userId) : null;
      if (!sender) return false;

      const isAssistantOrGM = sender.role >= CONST.USER_ROLES.ASSISTANT;
      const isTrustedAllowed = game.settings.get('smalltime', 'allow-trusted') && sender.role === CONST.USER_ROLES.TRUSTED;
      if (!(isAssistantOrGM || isTrustedAllowed)) return false;

      if (payload.key !== 'moon-phase') return false;
      if (!Number.isInteger(payload.value)) return false;
      return payload.value >= 0 && payload.value < ST_Config.MoonPhases.length;
    };

    if (data.type === 'changeTime') {
      if (game.user.isGM) {
        await Helpers.setWorldTime(data.payload);
      }
      Helpers.handleTimeChange(data.payload);
    }
    if (data.type === 'changeSetting') {
      if (game.user.isGM && canApplySocketSetting(data.payload)) {
        await game.settings.set(data.payload.scope, data.payload.key, data.payload.value);
      }
    }
    if (data.type === 'changeDarkness') {
      if (game.user.isGM) {
        const currentScene = game.scenes.get(data.payload.sceneID);
        await currentScene.update({ darkness: data.payload.darkness });
      }
    }
    if (data.type === 'handleRealtime') {
      if (!game.user.isGM) Helpers.handleRealtimeState();
    }
  }
  // Update the stops on the sunrise/sunset gradient, in case
  // there's been changes to the positions.
  Helpers.updateGradientStops();
  Helpers.setCalendarFallback();
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
  if (game.settings.get('smalltime', 'date-showing') && game.modules.get('smalltime').dateAvailable) {
    $('#smalltime-app').addClass('show-date');
    $('#smalltime-app').css({ height: '79px' });
  }
  Helpers.handleTimeChange(Helpers.getWorldTimeAsDayTime());
});

// Handle our changes to the Scene Config screen.
Hooks.on('renderSceneConfig', async (obj) => {
  const root = obj.form ?? obj.element?.[0];
  if (!root) return;

  // Set defaults here (duplicate of what we did on canvasReady, in case the
  // scene config is being accessed for a non-rendered scene.
  const darknessDefault = game.settings.get('smalltime', 'darkness-default');
  const visDefault = game.settings.get('smalltime', 'player-visibility-default');
  // Set the Darkness link state to the default choice.
  if (!foundry.utils.hasProperty(obj.document, 'flags.smalltime.darkness-link')) {
    await obj.document.setFlag('smalltime', 'darkness-link', darknessDefault);
  }
  // Set the Player Vis state to the default choice.
  if (!foundry.utils.hasProperty(obj.document, 'flags.smalltime.player-vis')) {
    await obj.document.setFlag('smalltime', 'player-vis', visDefault);
  }

  // Set the Player Vis dropdown as appropriate.
  const visChoice = Number(obj.document.getFlag('smalltime', 'player-vis'));
  // Set the Darkness and Moonlight checkboxes as appropriate.
  const darknessChecked = !!obj.document.getFlag('smalltime', 'darkness-link');
  const moonlightChecked = !!obj.document.getFlag('smalltime', 'moonlight');

  // Build our new options.
  const visibilityLabel = game.i18n.localize('SMLTME.Player_Visibility');
  const visibilityHint = game.i18n.localize('SMLTME.Player_Visibility_Hint');
  const vis0text = game.i18n.localize('SMLTME.Player_Vis_0');
  const vis1text = game.i18n.localize('SMLTME.Player_Vis_1');
  const vis2text = game.i18n.localize('SMLTME.Player_Vis_2');

  const controlLabel = game.i18n.localize('SMLTME.Darkness_Control');
  const controlHint = game.i18n.localize('SMLTME.Darkness_Control_Hint');
  const moonlightLabel = game.i18n.localize('SMLTME.Moonlight_Adjust');
  const moonlightHint = game.i18n.localize('SMLTME.Moonlight_Adjust_Hint');
  const moonlightDisabledPF2e = game.system.id === 'pf2e' && game.settings.get('pf2e', 'automation.rulesBasedVision');

  const buildSceneConfigGroup = (labelText, controlElement, hintText) => {
    const group = document.createElement('div');
    group.classList.add('form-group');

    const label = document.createElement('label');
    label.textContent = labelText;
    group.append(label);

    group.append(controlElement);

    const hint = document.createElement('p');
    hint.classList.add('hint');
    hint.textContent = hintText;
    group.append(hint);
    return group;
  };

  const injection = document.createElement('fieldset');
  injection.classList.add('st-scene-config');

  const legend = document.createElement('legend');
  const legendIcon = document.createElement('img');
  legendIcon.id = 'smalltime-config-icon';
  legendIcon.src = 'modules/smalltime/images/smalltime-icon.webp';
  legend.append(legendIcon);
  const legendText = document.createElement('span');
  legendText.textContent = 'SmallTime';
  legend.append(legendText);
  injection.append(legend);

  const visSelect = document.createElement('select');
  visSelect.name = 'flags.smalltime.player-vis';
  visSelect.dataset.dtype = 'number';
  [
    { value: 2, label: vis2text },
    { value: 1, label: vis1text },
    { value: 0, label: vis0text },
  ].forEach(({ value, label }) => {
    const option = document.createElement('option');
    option.value = String(value);
    option.textContent = label;
    option.selected = visChoice === value;
    visSelect.append(option);
  });
  injection.append(buildSceneConfigGroup(visibilityLabel, visSelect, visibilityHint));

  const darknessInput = document.createElement('input');
  darknessInput.type = 'checkbox';
  darknessInput.name = 'flags.smalltime.darkness-link';
  darknessInput.checked = darknessChecked;
  injection.append(buildSceneConfigGroup(controlLabel, darknessInput, controlHint));

  const moonlightInput = document.createElement('input');
  moonlightInput.type = 'checkbox';
  moonlightInput.name = 'flags.smalltime.moonlight';
  moonlightInput.checked = moonlightChecked;
  moonlightInput.disabled = moonlightDisabledPF2e;
  injection.append(buildSceneConfigGroup(moonlightLabel, moonlightInput, moonlightHint));

  // Inject the SmallTime controls into the config window for the current scene,
  // but only if they haven't already been inserted.
  if (!root.querySelector('.st-scene-config')) {
    const anchorSelectors = [
      '[name="environment.darknessLock"]',
      '[name="darknessLock"]',
      '[name="environment.darknessLevel"]',
      '[name="darkness"]',
      '[name="environment.globalLight.enabled"]',
      '[name="globalLight"]',
    ];
    const anchorGroup =
      anchorSelectors.map((selector) => root.querySelector(selector)?.closest('.form-group')).find((group) => !!group) ||
      (() => {
        const environmentTab = root.querySelector('[data-tab="environment"]') || root.querySelector('[data-application-part="environment"]');
        if (!environmentTab) return null;
        const groups = environmentTab.querySelectorAll('.form-group');
        return groups.length ? groups[groups.length - 1] : null;
      })() ||
      root.querySelector('.tab.active .form-group:last-of-type') ||
      root.querySelector('.form-group:last-of-type');

    if (anchorGroup) anchorGroup.insertAdjacentElement('afterend', injection);
    else console.warn("SmallTime: Couldn't find a place to insert scene config settings.");
  }
  // Re-auto-size the app window.
  obj.setPosition();

  if (obj.document?.getFlag('smalltime', 'moonlight')) {
    const currentThreshold = foundry.utils.getProperty(obj.document, 'environment.globalLight.darkness.max') ?? obj.document.globalLightThreshold ?? 1;
    const coreThresholdCheckbox = root.querySelector('input[name="hasGlobalThreshold"]');
    if (coreThresholdCheckbox) coreThresholdCheckbox.checked = true;

    const coreThresholdSlider = root.querySelector('input[name="globalLightThreshold"]');
    if (coreThresholdSlider) {
      if (coreThresholdSlider.dataset.stMoonlightOverride !== '1') {
        coreThresholdSlider.classList.add('smalltime-threshold-override');
        coreThresholdSlider.setAttribute('aria-label', game.i18n.localize('SMLTME.Threshold_Override_Tooltip'));
        coreThresholdSlider.setAttribute('data-balloon-pos', 'up');
        coreThresholdSlider.disabled = true;
        coreThresholdSlider.dataset.stMoonlightOverride = '1';
      }
      coreThresholdSlider.value = String(currentThreshold);

      const coreThresholdField = coreThresholdSlider.parentElement?.querySelector('span');
      if (coreThresholdField) {
        coreThresholdField.textContent = String(currentThreshold);
      }
    }
  }
});

Hooks.on('renderSettingsConfig', (obj) => {
  if (!game.user.isGM) return;

  const root = obj.form ?? obj.element?.[0];
  if (!root) return;

  const findSettingInput = (name) => root.querySelector(`[name="${name}"]`);
  const findSettingGroup = (name) => findSettingInput(name)?.closest('.form-group');
  const bindOnce = (element, key, eventName, handler) => {
    if (!element) return;
    const flag = `stBound${key}`;
    if (element.dataset[flag] === '1') return;
    element.addEventListener(eventName, handler);
    element.dataset[flag] = '1';
  };

  const ensureTooltipAnchor = (labelElement) => {
    if (!labelElement) return null;
    let anchor = labelElement.querySelector('.st-tooltip-anchor');
    if (anchor) return anchor;

    anchor = document.createElement('span');
    anchor.classList.add('st-tooltip-anchor');
    while (labelElement.firstChild) {
      anchor.append(labelElement.firstChild);
    }
    labelElement.append(anchor);
    return anchor;
  };

  if (game.system.id === 'wfrp4e') {
    const clientSettings = document.getElementById('client-settings');
    if (clientSettings) clientSettings.style.width = '990px';
  }
  if (game.system.id === 'dsa5') {
    const clientSettings = document.getElementById('client-settings');
    if (clientSettings) clientSettings.style.width = '800px';
  }

  const showSecondsGroup = findSettingGroup('smalltime.show-seconds');
  const setShowSecondsVisibility = (timeFormatValue) => {
    if (!showSecondsGroup) return;
    showSecondsGroup.style.display = Number(timeFormatValue) === 24 ? 'flex' : 'none';
  };
  setShowSecondsVisibility(game.settings.get('smalltime', 'time-format'));

  const timeFormatSelect = findSettingInput('smalltime.time-format');
  bindOnce(timeFormatSelect, 'TimeFormatChange', 'change', (event) => {
    setShowSecondsVisibility(event.currentTarget.value);
  });

  const showSecondsInput = findSettingInput('smalltime.show-seconds');
  bindOnce(showSecondsInput, 'ShowSecondsChange', 'change', (event) => {
    const secondsSpan = document.getElementById('secondsSpan');
    if (!secondsSpan) return;
    secondsSpan.style.display = event.currentTarget.checked ? 'inline' : 'none';
  });

  const dateFormatSelect = findSettingInput('smalltime.date-format');
  if (dateFormatSelect) {
    for (const option of dateFormatSelect.querySelectorAll('option')) {
      option.text = Helpers.getDate(game.settings.get('smalltime', 'calendar-provider'), option.value);
    }
  }

  const hiddenSettingNames = Helpers.getDarknessBackingFieldNames().filter((name) => name !== 'smalltime.sunset-end');
  for (const settingName of hiddenSettingNames) {
    const settingGroup = findSettingGroup(settingName);
    if (settingGroup) settingGroup.style.display = 'none';
  }

  const opacityTitleElement = findSettingGroup('smalltime.opacity')?.querySelector('label');
  let popupDirection = 'right';
  if (game.modules.get('tidy-ui_game-settings')?.active) popupDirection = 'up';
  const opacityTooltipAnchor = ensureTooltipAnchor(opacityTitleElement);
  if (opacityTooltipAnchor) {
    opacityTooltipAnchor.setAttribute('aria-label', game.i18n.localize('SMLTME.Position_Reset'));
    opacityTooltipAnchor.setAttribute('data-balloon-pos', popupDirection);
    bindOnce(opacityTitleElement, 'OpacityResetClick', 'click', async (event) => {
      if (!event.shiftKey) return;
      await game.settings.set('smalltime', 'pinned', true);
      window.location.reload(false);
    });
  }

  const darknessTitleElement = findSettingGroup('smalltime.sunset-end')?.querySelector('label');
  popupDirection = 'right';
  if (game.modules.get('tidy-ui_game-settings')?.active) popupDirection = 'up';
  const darknessTooltipAnchor = ensureTooltipAnchor(darknessTitleElement);
  if (darknessTooltipAnchor) {
    darknessTooltipAnchor.setAttribute('aria-label', game.i18n.localize('SMLTME.Darkness_Reset'));
    darknessTooltipAnchor.setAttribute('data-balloon-pos', popupDirection);
    bindOnce(darknessTitleElement, 'DarknessResetClick', 'click', async (event) => {
      if (!event.shiftKey) return;
      await Promise.all([
        game.settings.set('smalltime', 'sunrise-start', ST_Config.SunriseStartDefault),
        game.settings.set('smalltime', 'sunrise-end', ST_Config.SunriseEndDefault),
        game.settings.set('smalltime', 'sunset-start', ST_Config.SunsetStartDefault),
        game.settings.set('smalltime', 'sunset-end', ST_Config.SunsetEndDefault),
        game.settings.set('smalltime', 'max-darkness', ST_Config.MaxDarknessDefault),
        game.settings.set('smalltime', 'min-darkness', ST_Config.MinDarknessDefault),
      ]);

      if (typeof obj.render === 'function') {
        try {
          await obj.render({ force: true });
        } catch (error) {
          await obj.render(true);
        }
      }
    });
  }

  const insertionElement = findSettingInput('smalltime.sunset-end');
  if (insertionElement) insertionElement.style.display = 'none';

  const buildDarknessConfigElement = () => {
    const wrapper = document.createElement('div');
    wrapper.id = 'smalltime-darkness-config';
    wrapper.classList.add('notes');

    const handles = document.createElement('div');
    handles.classList.add('handles');

    ['sunrise-start', 'sunrise-end', 'sunset-start', 'sunset-end'].forEach((cls) => {
      const handle = document.createElement('div');
      handle.classList.add('handle', cls);
      handle.dataset.balloonPos = 'up';
      handles.append(handle);
    });
    wrapper.append(handles);

    ['sunrise-start-bounds', 'sunrise-end-bounds', 'sunset-start-bounds', 'sunset-end-bounds'].forEach((cls) => {
      const bounds = document.createElement('div');
      bounds.classList.add(cls);
      wrapper.append(bounds);
    });

    return wrapper;
  };

  if (!root.querySelector('#smalltime-darkness-config')) {
    const injection = buildDarknessConfigElement();
    const sunsetEndGroup = findSettingGroup('smalltime.sunset-end');
    const insertionAnchor = insertionElement?.parentElement?.nextElementSibling || sunsetEndGroup?.querySelector(':scope > p.notes, :scope > p.hint');

    if (insertionAnchor && insertionAnchor.parentElement) {
      insertionAnchor.insertAdjacentElement('afterend', injection);
    } else if (sunsetEndGroup) {
      sunsetEndGroup.insertAdjacentElement('beforeend', injection);
    } else {
      console.warn("SmallTime: Couldn't find a place to inject Darkness config.");
    }
  }

  obj.setPosition();

  const currentDarknessColor = Helpers.convertHexToRGB(CONFIG.Canvas.darknessColor.toString(16));
  document.documentElement.style.setProperty('--SMLTME-darkness-r', currentDarknessColor.r);
  document.documentElement.style.setProperty('--SMLTME-darkness-g', currentDarknessColor.g);
  document.documentElement.style.setProperty('--SMLTME-darkness-b', currentDarknessColor.b);

  Helpers.grabSceneSlice();
  Helpers.setupDragHandles(root);

  const opacityInput = findSettingInput('smalltime.opacity');
  bindOnce(opacityInput, 'OpacityInput', 'input', (event) => {
    const smallTimeElement = document.getElementById('smalltime-app');
    if (!smallTimeElement) return;
    smallTimeElement.style.opacity = event.currentTarget.value;
    smallTimeElement.style.transitionDelay = 'none';
    smallTimeElement.style.transition = 'none';
  });
});

// Undo the opacity preview settings.
Hooks.on('closeSettingsConfig', async () => {
  const smallTimeElement = document.getElementById('smalltime-app');
  if (smallTimeElement) {
    smallTimeElement.style.opacity = '';
    smallTimeElement.style.transitionDelay = '';
    smallTimeElement.style.transition = '';
  }

  // Update the stops on the sunrise/sunset gradient, in case
  // there's been changes to the positions. Also update the
  // rise/set times in case of a change to sync toggle.
  await Helpers.updateSunriseSunsetTimes();
});

// Add a toggle button inside the Jounral Notes tool layer.
Hooks.on('getSceneControlButtons', (controls) => {
  if (game.modules.get('smalltime').viewAuth) {
    controls.notes.tools.smalltime = {
      name: 'smalltime',
      title: 'Toggle SmallTime',
      icon: 'fas fa-adjust',
      onChange: (event, active) => {
        SmallTimeApp.toggleAppVis('toggle');
      },
      button: true,
    };
  }
});

// Re-assert pinning whenever the Players UI re-renders.
const handlePlayersRender = () => {
  if (!game.settings.get('smalltime', 'pinned')) return;
  SmallTimeApp.pinApp();
};

Hooks.on('renderPlayers', handlePlayersRender);
Hooks.on('renderPlayerList', handlePlayersRender);

// Listen for changes to the worldTime from elsewhere.
Hooks.on('updateWorldTime', () => {
  Helpers.handleTimeChange(Helpers.getWorldTimeAsDayTime());
});

// Handle toggling of time separator flash when game is paused/unpaused.
Hooks.on('pauseGame', () => {
  Helpers.handleRealtimeState();
});

// Listen for changes to the realtime clock state.
Hooks.on('calendaria.clockStartStop', () => {
  SmallTimeApp.emitSocket('handleRealtime');
});

Hooks.on('calendaria.dateTimeChange', async (data) => {
  await Helpers.updateSunriseSunsetTimes();
  Helpers.updateGradientStops();
});

class SmallTimeApp extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2) {
  static _isOpen = false;

  static DEFAULT_OPTIONS = {
    id: 'smalltime-app',
    classes: ['form'],
    window: {
      title: 'SmallTime',
      minimizable: false,
      resizable: false,
    },
    position: {
      width: 200,
      height: 'auto',
    },
  };

  static PARTS = {
    app: {
      template: 'modules/smalltime/templates/smalltime.html',
    },
  };

  async _onRender(context, options) {
    await super._onRender(context, options);

    if (game.settings.get('smalltime', 'pinned')) {
      const pinned = SmallTimeApp.pinApp(this);
      if (!pinned) {
        setTimeout(() => SmallTimeApp.pinApp(this), 50);
      }
    }
    SmallTimeApp._isOpen = true;

    this.activateListeners();
  }

  async close(options = {}) {
    // Don't close on Escape.
    if (options.closeKey) return this;

    // Record visibility to keep internal state in sync.
    SmallTimeApp._isOpen = false;
    if (game.settings.get('smalltime', 'visible')) {
      game.settings.set('smalltime', 'visible', false);
    }
    return super.close(options);
  }

  constructor() {
    super();
    this.currentTime = Helpers.getWorldTimeAsDayTime();
  }

  _initializeApplicationOptions(options = {}) {
    const initialPosition = game.settings.get('smalltime', 'position');
    options.position = options.position || {};
    options.position.top = initialPosition.top;
    options.position.left = initialPosition.left;
    return super._initializeApplicationOptions(options);
  }

  async _prepareContext() {
    // Send values to the HTML template.
    return {
      timeValue: this.currentTime,
      hourString: SmallTimeApp.convertTimeIntegerToDisplay(this.currentTime).hours,
      minuteString: SmallTimeApp.convertTimeIntegerToDisplay(this.currentTime).minutes,
      dateString: game.settings.get('smalltime', 'current-date'),
    };
  }

  bindDragHandle() {
    const dragHandle = this.element.querySelector('#dragHandle');
    if (!dragHandle) {
      console.warn('SmallTime: drag handle element was not found.');
      return;
    }

    this._boundOnDragStart ??= this.onDragStart.bind(this);
    this._boundOnDragMove ??= this.onDragMove.bind(this);
    this._boundOnDragEnd ??= this.onDragEnd.bind(this);

    if (this._dragHandle) {
      this._dragHandle.removeEventListener('pointerdown', this._boundOnDragStart);
    }

    this._dragHandle = dragHandle;
    this._dragHandle.addEventListener('pointerdown', this._boundOnDragStart);
  }

  computePinZone(clientX, clientY) {
    const playerApp = document.getElementById('players-inactive') || document.getElementById('players');
    if (!playerApp) return false;

    const playerAppPos = playerApp.getBoundingClientRect();
    const playerAppUpperBound = playerAppPos.top - 50;
    const playerAppLowerBound = playerAppPos.top + 50;

    return clientX > playerAppPos.left && clientX < playerAppPos.left + playerAppPos.width && clientY > playerAppUpperBound && clientY < playerAppLowerBound;
  }

  onDragStart(event) {
    if (event.button !== 0) return;
    event.preventDefault();

    const dragHandle = event.currentTarget;
    dragHandle.setPointerCapture(event.pointerId);

    const appRect = this.element.getBoundingClientRect();

    this._dragState = {
      pointerId: event.pointerId,
      startPointer: { x: event.clientX, y: event.clientY },
      startAppPos: {
        left: appRect.left,
        top: appRect.top,
      },
      wasPinnedAtStart: this.element.classList.contains('pinned'),
      hasUnpinnedOnThisDrag: false,
      pinZone: false,
      dragHandle,
    };

    window.addEventListener('pointermove', this._boundOnDragMove);
    window.addEventListener('pointerup', this._boundOnDragEnd);
    window.addEventListener('pointercancel', this._boundOnDragEnd);
  }

  onDragMove(event) {
    const dragState = this._dragState;
    if (!dragState || event.pointerId !== dragState.pointerId) return;
    event.preventDefault();

    if (dragState.wasPinnedAtStart && !dragState.hasUnpinnedOnThisDrag) {
      const deltaX = event.clientX - dragState.startPointer.x;
      const deltaY = event.clientY - dragState.startPointer.y;
      if (Math.abs(deltaX) + Math.abs(deltaY) > 0) {
        const { left, top } = this.element.getBoundingClientRect();
        if (!SmallTimeApp.unPinApp()) return;
        dragState.hasUnpinnedOnThisDrag = true;
        this.setPosition({ left, top });
        dragState.startAppPos = { left, top };
        dragState.startPointer = { x: event.clientX, y: event.clientY };
      }
    }

    const moveX = event.clientX - dragState.startPointer.x;
    const moveY = event.clientY - dragState.startPointer.y;

    this.setPosition({
      left: dragState.startAppPos.left + moveX,
      top: dragState.startAppPos.top + moveY,
    });

    dragState.pinZone = this.computePinZone(event.clientX, event.clientY);
    this.element.style.animation = dragState.pinZone ? 'jiggle 0.2s infinite' : '';
  }

  async onDragEnd(event) {
    const dragState = this._dragState;
    if (!dragState || event.pointerId !== dragState.pointerId) return;
    event.preventDefault();

    const dragHandle = dragState.dragHandle;
    if (dragHandle.hasPointerCapture(event.pointerId)) {
      dragHandle.releasePointerCapture(event.pointerId);
    }

    window.removeEventListener('pointermove', this._boundOnDragMove);
    window.removeEventListener('pointerup', this._boundOnDragEnd);
    window.removeEventListener('pointercancel', this._boundOnDragEnd);

    const droppedInPinZone = this.computePinZone(event.clientX, event.clientY) || dragState.pinZone;

    if (droppedInPinZone) {
      SmallTimeApp.pinApp(this);
      await game.settings.set('smalltime', 'pinned', true);
    } else {
      const newPos = { top: this.position.top, left: this.position.left };
      await game.settings.set('smalltime', 'position', newPos);
      await game.settings.set('smalltime', 'pinned', false);
    }

    this.element.style.animation = '';
    this._dragState = null;
  }

  activateListeners() {
    const appElement = this.element;

    this.bindDragHandle();

    // An initial set of the sun/moon/bg/time/date display in case it hasn't been
    // updated since a settings change for some reason.
    SmallTimeApp.timeTransition(this.currentTime);
    SmallTimeApp.updateDate();

    const timeSliderEl = appElement.querySelector('#timeSlider');
    const hourStringEl = appElement.querySelector('#hourString');
    const minuteStringEl = appElement.querySelector('#minuteString');
    const timeDisplayEl = appElement.querySelector('#timeDisplay');
    const dateDisplayEl = appElement.querySelector('#dateDisplay');
    const decreaseSmallEl = appElement.querySelector('#decrease-small');
    const decreaseLargeEl = appElement.querySelector('#decrease-large');
    const increaseSmallEl = appElement.querySelector('#increase-small');
    const increaseLargeEl = appElement.querySelector('#increase-large');

    // Handle cycling through the moon phases on Shift-clicks.
    timeSliderEl?.addEventListener('click', async (ev) => {
      if (ev.shiftKey && game.modules.get('smalltime').controlAuth) {
        const startingPhase = game.settings.get('smalltime', 'moon-phase');
        const newPhase = (startingPhase + 1) % ST_Config.MoonPhases.length;

        document.documentElement.style.setProperty('--SMLTME-phaseURL', `url('../images/moon-phases/${ST_Config.MoonPhases[newPhase]}.webp')`);

        // Set and broadcast the change.
        if (game.user.isGM) {
          await game.settings.set('smalltime', 'moon-phase', newPhase);
          Helpers.adjustMoonlight([newPhase]);
        } else {
          SmallTimeApp.emitSocket('changeSetting', {
            scope: 'smalltime',
            key: 'moon-phase',
            value: newPhase,
          });
        }
        const sliderValue = Number(timeSliderEl.value);
        if (game.user.isGM) {
          await Helpers.setWorldTime(sliderValue);
        }
        SmallTimeApp.emitSocket('changeTime', sliderValue);
      }
    });

    // Handle live feedback while dragging the sun/moon slider.
    const sliderInputHandler = foundry.utils.debounce(async (sliderValue) => {
      if (hourStringEl) hourStringEl.textContent = SmallTimeApp.convertTimeIntegerToDisplay(sliderValue).hours;
      if (minuteStringEl) minuteStringEl.textContent = SmallTimeApp.convertTimeIntegerToDisplay(sliderValue).minutes;
      // Preview while dragging: update local visuals without persisting scene Darkness/world time yet.
      SmallTimeApp.timeTransition(sliderValue, { persistDarkness: false });
    }, 100);

    timeSliderEl?.addEventListener('input', (ev) => {
      sliderInputHandler(Number(ev.currentTarget.value));
    });

    // Wait for the actual change event to do the time set.
    timeSliderEl?.addEventListener('change', async (ev) => {
      const sliderValue = Number(ev.currentTarget.value);
      if (game.user.isGM) {
        Helpers.setWorldTime(sliderValue);
      } else {
        SmallTimeApp.emitSocket('changeTime', sliderValue);
      }
    });

    // Toggle the date display div, if a calendar provider is enabled.
    // The inline CSS overrides are a bit hacky, but were the
    // only way I could get the desired behaviour.
    timeDisplayEl?.addEventListener('click', async (ev) => {
      if (ev.shiftKey && game.modules.get('smalltime').controlAuth && !game.paused && game.modules.get('foundryvtt-simple-calendar')?.active) {
        if (SimpleCalendar.api.clockStatus().started) {
          SimpleCalendar.api.stopClock();
        } else {
          SimpleCalendar.api.startClock();
        }
        if (game.user.isGM) {
          Helpers.handleRealtimeState();
        }
        SmallTimeApp.emitSocket('handleRealtime');
      } else {
        if (!game.settings.get('smalltime', 'date-showing') && game.modules.get('smalltime').dateAvailable) {
          appElement.classList.add('show-date');
          appElement.style.height = '79px';
          if (game.settings.get('smalltime', 'pinned')) {
            SmallTimeApp.unPinApp();
            SmallTimeApp.pinApp(this);
          }
          await game.settings.set('smalltime', 'date-showing', true);
        } else {
          appElement.classList.remove('show-date');
          appElement.style.height = '59px';
          if (game.settings.get('smalltime', 'pinned')) {
            SmallTimeApp.unPinApp();
            SmallTimeApp.pinApp(this);
          }
          await game.settings.set('smalltime', 'date-showing', false);
        }
      }
    });

    // Open the Simple Calendar interface on date clicks.
    dateDisplayEl?.addEventListener('click', async () => {
      if (game.settings.get('smalltime', 'calendar-provider') === 'sc' && game.modules.get('foundryvtt-simple-calendar')?.active)
        SimpleCalendar.api.showCalendar();
    });

    // Handle the increment/decrement buttons.
    let smallStep = game.settings.get('smalltime', 'small-step');
    let largeStep = game.settings.get('smalltime', 'large-step');
    let stepAmount;

    decreaseSmallEl?.addEventListener('click', (ev) => {
      if (ev.shiftKey) {
        stepAmount = -Math.abs(smallStep * 2);
      } else if (ev.altKey) {
        stepAmount = Math.floor(-Math.abs(smallStep / 2));
      } else {
        stepAmount = -Math.abs(smallStep);
      }
      this.timeRatchet(stepAmount);
    });

    decreaseLargeEl?.addEventListener('click', (ev) => {
      if (ev.shiftKey) {
        stepAmount = -Math.abs(largeStep * 2);
      } else if (ev.altKey) {
        stepAmount = Math.floor(-Math.abs(largeStep / 2));
      } else {
        stepAmount = -Math.abs(largeStep);
      }
      this.timeRatchet(stepAmount);
    });

    increaseSmallEl?.addEventListener('click', (ev) => {
      if (ev.shiftKey) {
        stepAmount = smallStep * 2;
      } else if (ev.altKey) {
        stepAmount = Math.floor(smallStep / 2);
      } else {
        stepAmount = smallStep;
      }
      this.timeRatchet(stepAmount);
    });

    increaseLargeEl?.addEventListener('click', (ev) => {
      if (ev.shiftKey) {
        stepAmount = largeStep * 2;
      } else if (ev.altKey) {
        stepAmount = Math.floor(largeStep / 2);
      } else {
        stepAmount = largeStep;
      }
      this.timeRatchet(stepAmount);
    });

    // Listen for moon phase changes from Simple Calendar.
    if (game.modules.get('foundryvtt-simple-calendar')?.active && game.user.isGM) {
      Hooks.on(SimpleCalendar.Hooks.DateTimeChange, async function (data) {
        if (typeof data.moons[0] === 'undefined') {
          return;
        }
        const newPhases = [];
        data.moons.forEach((m) => {
          const newPhase = ST_Config.MoonPhases.findIndex(function (phase) {
            return phase === m.currentPhase.icon;
          });
          newPhases.push(newPhase);
        });

        await game.settings.set('smalltime', 'moon-phase', newPhases[0]);
        SmallTimeApp.timeTransition(Helpers.getWorldTimeAsDayTime());
        Helpers.adjustMoonlight(newPhases);
      });
    }
  }

  // Helper function for handling sockets.
  static emitSocket(type, payload) {
    const enrichedPayload = payload && typeof payload === 'object' ? { ...payload, userId: game.user.id } : payload;
    game.socket.emit('module.smalltime', {
      type: type,
      payload: enrichedPayload,
    });
  }

  // Functionality for increment/decrement buttons.
  async timeRatchet(delta) {
    let currentTime = Helpers.getWorldTimeAsDayTime();
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
  static async timeTransition(timeNow, { persistDarkness = true } = {}) {
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
      document.documentElement.style.setProperty('--SMLTME-phaseURL', `url('../images/moon-phases/${ST_Config.MoonPhases[currentPhase]}.webp')`);
    }

    // If requested, adjust the scene's Darkness level.
    const currentScene = canvas.scene;
    if (currentScene.getFlag('smalltime', 'darkness-link') && game.modules.get('smalltime').controlAuth) {
      let darknessValue = canvas.environment.darknessLevel;
      const maxD = game.settings.get('smalltime', 'max-darkness');
      const minD = game.settings.get('smalltime', 'min-darkness');

      // Clamp the values between 0 and 1 just in case they're out of bounds.
      let maxDarkness = Math.min(Math.max(maxD, 0), 1);
      let minDarkness = Math.min(Math.max(minD, 0), 1);

      // If requested, adjust max Darkness based on moon phase.
      if (game.settings.get('smalltime', 'moon-darkness')) {
        const moonlightFactor = game.settings.get('smalltime', 'phase-impact'); // Percentage by which available moonlight reduces max Darkness.
        const moonlightMultiplier = moonlightFactor * ST_Config.PhaseValues[currentPhase];
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
          darknessValue = maxDarkness + ((timeNow - sunriseStart) / (sunriseEnd - sunriseStart)) * multiplier;
        } else if (timeNow >= sunsetStart && timeNow <= sunsetEnd) {
          darknessValue = maxDarkness + (1 - (timeNow - sunsetStart) / (sunsetEnd - sunsetStart)) * multiplier;
        }
      } else {
        if (timeNow >= sunriseStart && timeNow <= sunriseEnd) {
          darknessValue = minDarkness + (1 - (timeNow - sunriseStart) / (sunriseEnd - sunriseStart)) * multiplier;
        } else if (timeNow >= sunsetStart && timeNow <= sunsetEnd) {
          darknessValue = minDarkness + ((timeNow - sunsetStart) / (sunsetEnd - sunsetStart)) * multiplier;
        }
      }
      // Truncate long decimals.
      darknessValue = Math.round(darknessValue * 10) / 10;

      if (persistDarkness) {
        // Perform the Darkness update, and send it out to other clients.
        if (game.user.isGM) {
          await currentScene.update({ darkness: darknessValue });
        } else {
          SmallTimeApp.emitSocket('changeDarkness', {
            darkness: darknessValue,
            sceneID: currentScene.id,
          });
        }
      } else if (game.user.isGM) {
        // Drag preview only: render darkness locally without persisting scene data yet.
        canvas.environment.initialize({ environment: { darknessLevel: darknessValue } });
      }
    }
  }

  // Convert the integer time value to hours and minutes.
  static convertTimeIntegerToDisplay(timeInteger) {
    let theHours = Math.floor(timeInteger / 60);
    let theMinutes = Math.trunc(timeInteger - theHours * 60);

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

  // Pin the app above the Players list inside the ui-left container.
  static async pinApp(appInstance = null) {
    const app = appInstance || game.modules.get('smalltime').myApp;
    if (!app) return false;

    const playersAnchor = SmallTimeApp.getPlayersPinAnchor();
    if (!playersAnchor) return false;

    if (app.element.nextElementSibling !== playersAnchor) {
      playersAnchor.insertAdjacentElement('beforebegin', app.element);
    }
    app.element.classList.add('pinned');
    return true;
  }

  static getPlayersPinAnchor() {
    return document.getElementById('players-active') || document.getElementById('players') || document.getElementById('players-inactive');
  }

  // Un-pin the app.
  static unPinApp() {
    const app = game.modules.get('smalltime').myApp;
    if (app && app.element.classList.contains('pinned')) {
      const element = app.element;
      document.body.append(element);
      element.classList.remove('pinned');

      return true;
    }
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
        const app = new SmallTimeApp();
        await app.render({ force: true });
        game.modules.get('smalltime').myApp = app;
        if (game.settings.get('smalltime', 'pinned')) {
          SmallTimeApp.pinApp(app);
        }
        game.settings.set('smalltime', 'visible', true);
      }
    } else if (game.settings.get('smalltime', 'visible') === true) {
      const app = new SmallTimeApp();
      await app.render({ force: true });
      game.modules.get('smalltime').myApp = app;
      if (game.settings.get('smalltime', 'pinned')) {
        SmallTimeApp.pinApp(app);
      }
    }
  }

  // Get the date from various calendar providers.
  static async updateDate() {
    let displayDate = Helpers.getDate(game.settings.get('smalltime', 'calendar-provider'), game.settings.get('smalltime', 'date-format'));

    $('#dateDisplay').html(displayDate);

    // Save this string so we can display it on initial load-in,
    // before the calendar provider is ready.
    if (game.user.isGM) await game.settings.set('smalltime', 'current-date', displayDate);
  }
}

globalThis.SmallTimeApp = SmallTimeApp;
