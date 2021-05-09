const SmallTimeMoonPhases = [
  'new',
  'waxing-crescent',
  'first-quarter',
  'waxing-gibbous',
  'full',
  'waning-gibbous',
  'last-quarter',
  'waning-crescent',
];

Hooks.on('init', () => {
  // CONFIG.debug.hooks = true;

  game.settings.register('smalltime', 'current-time', {
    name: 'Current Time',
    scope: 'world',
    config: false,
    type: Number,
    default: 0,
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

  game.settings.register('smalltime', 'hide-from-players', {
    name: game.i18n.format('SMLTME.Hide_From_Players'),
    hint: game.i18n.format('SMLTME.Hide_From_Players_Hint'),
    scope: 'world',
    config: true,
    type: Boolean,
    default: false,
  });

  game.settings.register('smalltime', 'time-format', {
    name: game.i18n.format('SMLTME.Time_Format'),
    scope: 'world',
    config: true,
    type: Number,
    default: 12,
    choices: {
      12: game.i18n.format('SMLTME.12hr'),
      24: game.i18n.format('SMLTME.24hr'),
    },
    default: 12,
  });

  game.settings.register('smalltime', 'small-step', {
    name: game.i18n.format('SMLTME.Small_Step'),
    hint: game.i18n.format('SMLTME.Small_Step_Hint'),
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
    name: game.i18n.format('SMLTME.Large_Step'),
    hint: game.i18n.format('SMLTME.Large_Step_Hint'),
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
    name: game.i18n.format('SMLTME.Resting_Opacity'),
    hint: game.i18n.format('SMLTME.Resting_Opacity_Hint'),
    scope: 'client',
    config: true,
    type: Number,
    range: {
      min: 0,
      max: 1,
      step: 0.1,
    },
    default: 0.8,
    onChange: (value) => {
      document.documentElement.style.setProperty('--SMLTME-opacity', value);
    },
  });

  game.settings.register('smalltime', 'darkness-default', {
    name: game.i18n.format('SMLTME.Darkness_Default'),
    hint: game.i18n.format('SMLTME.Darkness_Default_Hint'),
    scope: 'world',
    config: true,
    type: Boolean,
    default: false,
  });

  game.settings.register('smalltime', 'allow-trusted', {
    name: game.i18n.format('SMLTME.Allow_Trusted'),
    hint: game.i18n.format('SMLTME.Allow_Trusted_Hint'),
    scope: 'world',
    config: true,
    type: Boolean,
    default: false,
  });

  game.settings.register('smalltime', 'sunrise-start', {
    name: 'Sunrise Start',
    scope: 'world',
    config: false,
    type: Number,
    default: 180,
  });

  game.settings.register('smalltime', 'sunrise-end', {
    name: 'Sunrise End',
    scope: 'world',
    config: false,
    type: Number,
    default: 420,
  });

  game.settings.register('smalltime', 'sunset-start', {
    name: 'Sunset Start',
    scope: 'world',
    config: false,
    type: Number,
    default: 1050,
  });

  game.settings.register('smalltime', 'sunset-end', {
    name: 'Sunset End',
    scope: 'world',
    config: false,
    type: Number,
    default: 1320,
  });

  game.settings.register('smalltime', 'moon-phase', {
    name: 'Moon Phase',
    scope: 'world',
    config: false,
    type: Number,
    default: 4,
  });

  game.settings.register('smalltime', 'about-time', {
    name: game.i18n.format('SMLTME.AboutTime'),
    hint: game.i18n.format('SMLTME.AboutTime_Hint'),
    scope: 'world',
    // Only show this toggle if About Time is enabled.
    config: game.modules.get('about-time')?.active,
    type: Boolean,
    default: false,
    onChange: () => {
      location.reload();
    },
  });
});

Hooks.on('ready', () => {
  // Check and set the correct level of authorization for the current user.
  game.modules.get('smalltime').viewAuth = false;
  game.modules.get('smalltime').controlAuth = false;

  if (game.user.role >= CONST.USER_ROLES.ASSISTANT) {
    game.modules.get('smalltime').viewAuth = true;
    game.modules.get('smalltime').controlAuth = true;
  }

  if (game.settings.get('smalltime', 'hide-from-players') === false) {
    game.modules.get('smalltime').viewAuth = true;
  }

  if (
    game.settings.get('smalltime', 'allow-trusted') &&
    game.user.role === CONST.USER_ROLES.TRUSTED
  ) {
    game.modules.get('smalltime').controlAuth = true;
  }

  if (game.modules.get('smalltime').viewAuth) {
    SmallTimeApp.toggleAppVis('initial');
  }
  if (game.settings.get('smalltime', 'pinned') === true) {
    SmallTimeApp.pinApp();
  }

  const userOpacity = game.settings.get('smalltime', 'opacity');
  document.documentElement.style.setProperty('--SMLTME-opacity', userOpacity);

  // Even if the current toggle state for the date display is on shown,
  // make it hidden to start, to simplify the initial placement.
  if (game.settings.get('smalltime', 'date-showing')) {
    game.settings.set('smalltime', 'date-showing', false);
  }

  // Handle incoming socket emissions in various ways.
  game.socket.on(`module.smalltime`, (data) => {
    if (data.type === 'changeTime') {
      game.modules.get('smalltime').myApp.handleTimeChange(data);
    }
    if (data.type === 'changeSetting') {
      if (game.user.isGM)
        game.settings.set(data.payload.scope, data.payload.key, data.payload.value);
    }
    if (data.type === 'changeDarkness') {
      if (game.user.isGM) {
        const currentScene = game.scenes.get(data.payload.sceneID);
        currentScene.update({ darkness: data.payload.darkness });
      }
    }
    if (data.type === 'ATadvance') {
      if (game.user.isGM) {
        game.Gametime.advanceTime({
          days: 0,
          hours: data.payload.hours,
          minutes: data.payload.minutes,
          seconds: 0,
        });
      }
    }
    if (data.type === 'ATset') {
      if (game.user.isGM) {
        game.Gametime.setTime({
          hours: data.payload.hours,
          minutes: data.payload.minutes,
          seconds: 0,
        });
      }
    }
  });
});

Hooks.on('canvasReady', () => {
  if (game.modules.get('smalltime').controlAuth) {
    // Get currently viewed scene.
    const thisScene = game.scenes.entities.find((s) => s._view);
    const darknessDefault = game.settings.get('smalltime', 'darkness-default');

    // Set the Darkness link state to the default choice.
    if (!hasProperty(thisScene, 'data.flags.smalltime.darkness-link')) {
      thisScene.setFlag('smalltime', 'darkness-link', darknessDefault);
    }

    // Refresh the current scene's Darkness level if it should be linked.
    if (thisScene.getFlag('smalltime', 'darkness-link')) {
      SmallTimeApp.timeTransition(game.settings.get('smalltime', 'current-time'));
    }
  }
});

Hooks.on('renderSceneConfig', async (obj) => {
  const darknessDefault = game.settings.get('smalltime', 'darkness-default');

  // If the Darkness link flag hasn't been set yet, set it to the default choice.
  if (!hasProperty(obj.object, 'data.flags.smalltime.darkness-link')) {
    obj.object.setFlag('smalltime', 'darkness-link', darknessDefault);
  }

  // Set the option's checkbox as appropriate.
  const checkStatus = obj.object.getFlag('smalltime', 'darkness-link') ? 'checked' : '';

  // Inject our new option into the config screen.
  const controlLabel = game.i18n.format('SMLTME.Darkness_Control');
  const controlHint = game.i18n.format('SMLTME.Darkness_Control_Hint');
  const injection = `
    <div class="form-group">
      <img id="smalltime-config-icon" src="modules/smalltime/images/smalltime-icon.webp">
      <label>${controlLabel}</label>
      <input id="smalltime-darkness" type="checkbox" name="flags.smalltime.darkness-link" ${checkStatus}>
      <p class="notes">${controlHint}</p>
    </div>
    `;
  $('p:contains("dim conditions")').parent().after(injection);
});

Hooks.on('renderSettingsConfig', () => {
  // Live render the opacity changes as a preview.
  $('input[name="smalltime.opacity"]').on('input', () => {
    $('#smalltime-app').css({
      opacity: $('input[name="smalltime.opacity"]').val(),
      'transition-delay': 'none',
      transition: 'none',
    });
  });
});

Hooks.on('closeSettingsConfig', () => {
  // Undo the opacity preview settings.
  $('#smalltime-app').css({
    opacity: '',
    'transition-delay': '',
    transition: '',
  });
});

Hooks.on('getSceneControlButtons', (buttons) => {
  // Add a toggle button inside the Notes tool layer.
  // (Was Lighting originally, but Players don't have that layer,
  // and we want them to be able to toggle the app.)
  if (!canvas) return;
  if (game.modules.get('smalltime').viewAuth) {
    let group = buttons.find((b) => b.name === 'notes');
    group.tools.push({
      button: true,
      icon: 'fas fa-adjust',
      name: 'smalltime',
      title: 'SmallTime',
      onClick: () => {
        SmallTimeApp.toggleAppVis('toggle');
      },
    });
  }
});

Hooks.on('renderPlayerList', () => {
  // Hooking in here to adjust the position of the window
  // when the size of the PlayerList changes.
  const element = document.getElementById('players');
  const playerAppPos = element.getBoundingClientRect();

  // The 88 here is the ideal distance between the top of the
  // Players list and the top of SmallTime. The +21 accounts
  // for the date dropdown if enabled.
  let myOffset = playerAppPos.height + 88;
  if (game.settings.get('smalltime', 'date-showing')) {
    myOffset += 21;
  }
  $('#pin-lock').text(`
      #smalltime-app {
        top: calc(100vh - ${myOffset}px) !important;
        left: 15px !important;
      }
  `);
});

// Grab updates from About Time on two different hooks.
Hooks.on('updateWorldTime', () => {
  if (game.settings.get('smalltime', 'about-time')) {
    SmallTimeApp.syncFromAboutTime();
    if (!game.Gametime.isRunning()) {
      $('#timeSeparator').removeClass('blink');
    } else if (game.Gametime.isRunning()) {
      $('#timeSeparator').addClass('blink');
    }
  }
});

Hooks.on('about-time.pseudoclockMaster', () => {
  if (game.settings.get('smalltime', 'about-time') && game.user.isGM) {
    SmallTimeApp.syncFromAboutTime();
  }
});

class SmallTimeApp extends FormApplication {
  constructor() {
    super();
    this.currentTime = game.settings.get('smalltime', 'current-time');
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
      game.settings.set('smalltime', 'current-time', newTime);
    } else {
      SmallTimeApp.handleSocket('changeTime', newTime);
    }
  }

  getData() {
    // Send values to the HTML template.
    return {
      timeValue: this.currentTime,
      hourString: SmallTimeApp.convertTime(this.currentTime).hours,
      minuteString: SmallTimeApp.convertTime(this.currentTime).minutes,
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

    // Disable controls for non-GMs.
    if (!game.modules.get('smalltime').controlAuth) {
      $('#timeSlider').addClass('disable-for-players');
      $('#decrease-large').addClass('hide-for-players');
      $('#decrease-small').addClass('hide-for-players');
      $('#increase-large').addClass('hide-for-players');
      $('#increase-small').addClass('hide-for-players');
    }

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

      this.app.setPosition({
        left: this.position.left + (event.clientX - this._initial.x),
        top: this.position.top + (event.clientY - this._initial.y),
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

    drag._onDragMouseUp = function _newOnDragMouseUp(event) {
      event.preventDefault();

      window.removeEventListener(...this.handlers.dragMove);
      window.removeEventListener(...this.handlers.dragUp);

      const playerApp = document.getElementById('players');
      const playerAppPos = playerApp.getBoundingClientRect();
      const myOffset = playerAppPos.height + 88;

      // If the mouseup happens inside the Pin zone, pin the app.
      if (pinZone) {
        SmallTimeApp.pinApp(game.settings.get('smalltime', 'date-showing'));
        game.settings.set('smalltime', 'pinned', true);
        this.app.setPosition({
          left: 15,
          top: window.innerHeight - myOffset,
        });
      } else {
        let windowPos = $('#smalltime-app').position();
        let newPos = { top: windowPos.top, left: windowPos.left };
        game.settings.set('smalltime', 'position', newPos);
        game.settings.set('smalltime', 'pinned', false);
      }

      // Kill the jiggle animation on mouseUp.
      $('#smalltime-app').css('animation', '');
    };

    // An initial set of the sun/moon/bg/time display in case it hasn't been
    // updated since a settings change for some reason.
    SmallTimeApp.timeTransition(this.currentTime);

    // Handle changes to the moon phase.
    $('#timeSlider').on('click', async function () {
      if (event.shiftKey && game.modules.get('smalltime').controlAuth) {
        const startingPhase = game.settings.get('smalltime', 'moon-phase');
        const newPhase = (startingPhase + 1) % SmallTimeMoonPhases.length;

        document.documentElement.style.setProperty(
          '--SMLTME-phaseURL',
          `url('../images/moon-phases/${SmallTimeMoonPhases[newPhase]}.webp')`
        );

        if (game.user.isGM) {
          game.settings.set('smalltime', 'moon-phase', newPhase);
        } else {
          SmallTimeApp.handleSocket('changeSetting', {
            scope: 'smalltime',
            key: 'moon-phase',
            value: newPhase,
          });
        }
        SmallTimeApp.handleSocket('changeTime', $(this).val());

        if (game.user.isGM) {
          game.settings.set('smalltime', 'current-time', $(this).val());
        } else {
          SmallTimeApp.handleSocket('changeTime', $(this).val());
        }
      }
    });

    // WIP ------------------------------------------------------------------
    // drag-select experiment
    /*
    $('#timeSlider')
      .mousedown(function () {
        if (event.shiftKey) {
          $('.darkness-select').css('visibility', 'visible');

          const root = document.documentElement;
          root.style.setProperty('--SMLTME-ds-width', '0px');

          const dragStart = $(this).val();

          let maxDrag = 720;

          const offsetStart = Math.round((dragStart / 1440) * 180) + 10;

          root.style.setProperty('--SMLTME-ds-left', offsetStart + 'px');

          $(this).on('mousemove', function () {
            const dragWidth = Math.round(
              ((Math.min($(this).val(), maxDrag) - dragStart) / 1440) * 180
            );
            if ($(this).val() < dragStart) {
              console.log($(this).val(), dragStart);
              $('.darkness-select').css('visibility', 'hidden');
            } else {
              $('.darkness-select').css('visibility', 'visble');
            }
            root.style.setProperty('--SMLTME-ds-width', dragWidth + 'px');
          });
        }
      })
      .mouseup(function () {
        $(this).off('mousemove');
        //$('.darkness-select').css('visibility', 'hidden');
      });
    */
    // WIP ------------------------------------------------------------------

    $(document).on('input', '#timeSlider', function () {
      $('#hourString').html(SmallTimeApp.convertTime($(this).val()).hours);
      $('#minuteString').html(SmallTimeApp.convertTime($(this).val()).minutes);

      SmallTimeApp.timeTransition($(this).val());

      if (game.user.isGM) {
        game.settings.set('smalltime', 'current-time', $(this).val());
      } else {
        SmallTimeApp.handleSocket('changeSetting', {
          scope: 'smalltime',
          key: 'current-time',
          value: $(this).val(),
        });
      }
      SmallTimeApp.handleSocket('changeTime', $(this).val());
    });

    // Send slider time changes to About Time on mouseUp, not live.
    $(document).on('change', '#timeSlider', function () {
      if (
        game.modules.get('about-time')?.active &&
        game.settings.get('smalltime', 'about-time')
      ) {
        let hours = $(this).val() / 60;
        let rhours = Math.floor(hours);
        let minutes = (hours - rhours) * 60;
        let rminutes = Math.round(minutes);

        if (game.user.isGM) {
          game.Gametime.setTime({
            hours: rhours,
            minutes: rminutes,
            seconds: 0,
          });
        } else {
          SmallTimeApp.handleSocket('ATset', {
            hours: rhours,
            minutes: rminutes,
          });
        }
      }
    });

    // Toggle the date display div, if About Time sync is enabled.
    // The inline CSS overrides are a bit hacky, but were the
    // only way I could get the desired behaviour.
    html.find('#timeDisplay').on('click', async function () {
      if (
        game.modules.get('about-time')?.active &&
        game.settings.get('smalltime', 'about-time')
      ) {
        if (event.shiftKey && game.modules.get('smalltime').controlAuth) {
          if (game.Gametime.isRunning()) {
            game.Gametime.stopRunning();
            $('#timeSeparator').removeClass('blink');
          } else {
            game.Gametime.startRunning();
            if (game.Gametime.isRunning()) {
              $('#timeSeparator').addClass('blink');
            }
          }
          SmallTimeApp.handleSocket(
            'changeTime',
            game.settings.get('smalltime', 'current-time')
          );
        } else {
          if (!game.settings.get('smalltime', 'date-showing')) {
            $('#dateDisplay').addClass('active');
            $('#smalltime-app').animate({ height: '79px' }, 80);
            if (game.settings.get('smalltime', 'pinned')) {
              SmallTimeApp.unPinApp();
              SmallTimeApp.pinApp(true);
            }
            await game.settings.set('smalltime', 'date-showing', true);
          } else {
            $('#dateDisplay').removeClass('active');
            $('#smalltime-app').animate({ height: '58px' }, 80);
            if (game.settings.get('smalltime', 'pinned')) {
              SmallTimeApp.unPinApp();
              SmallTimeApp.pinApp(false);
            }
            await game.settings.set('smalltime', 'date-showing', false);
          }
        }
      }
    });

    // Handle the increment/decrement buttons.
    let smallStep = game.settings.get('smalltime', 'small-step');
    let largeStep = game.settings.get('smalltime', 'large-step');

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
    if (game.modules.get('foundryvtt-simple-calendar')?.active) {
      Hooks.on(SimpleCalendar.Hooks.DateTimeChange, async function (data) {
        const newPhase = SmallTimeMoonPhases.findIndex(function (phase) {
          return phase === data.moons[0].currentPhase.icon;
        });
        await game.settings.set('smalltime', 'moon-phase', newPhase);
        let currentTime = game.settings.get('smalltime', 'current-time');
        SmallTimeApp.timeTransition(currentTime);
        SmallTimeApp.handleSocket('changeTime', currentTime);
      });
    }
  }

  // Helper function for handling sockets.
  static handleSocket(type, payload) {
    game.socket.emit('module.smalltime', {
      type: type,
      payload: payload,
    });
  }

  // Helper function for time-changing socket updates.
  handleTimeChange(data) {
    SmallTimeApp.timeTransition(data.payload);
    $('#hourString').html(SmallTimeApp.convertTime(data.payload).hours);
    $('#minuteString').html(SmallTimeApp.convertTime(data.payload).minutes);
    $('#timeSlider').val(data.payload);
    if (game.Gametime.isRunning()) {
      $('#timeSeparator').addClass('blink');
    } else {
      $('#timeSeparator').removeClass('blink');
    }
  }

  // Functionality for increment/decrement buttons.
  timeRatchet(delta) {
    let AboutTimeSync = false;

    if (
      game.modules.get('about-time')?.active &&
      game.settings.get('smalltime', 'about-time')
    ) {
      AboutTimeSync = true;
    }

    let currentTime = game.settings.get('smalltime', 'current-time');
    let newTime = currentTime + delta;

    if (newTime < 0) {
      // 1440 is the value for 24:00 at the end of the slider.
      newTime = 1440 + newTime;
    }
    if (newTime > 1440) {
      newTime = newTime - 1440;
    }

    if (game.user.isGM) {
      game.settings.set('smalltime', 'current-time', newTime);
    } else {
      SmallTimeApp.handleSocket('changeSetting', {
        scope: 'smalltime',
        key: 'current-time',
        value: newTime,
      });
    }

    $('#hourString').html(SmallTimeApp.convertTime(newTime).hours);
    $('#minuteString').html(SmallTimeApp.convertTime(newTime).minutes);

    SmallTimeApp.handleSocket('changeTime', newTime);

    SmallTimeApp.timeTransition(newTime);

    // Send the new time to About Time.
    if (AboutTimeSync) {
      let hours = delta / 60;
      let rhours = Math.floor(hours);
      let minutes = (hours - rhours) * 60;
      let rminutes = Math.round(minutes);

      if (game.user.isGM) {
        game.Gametime.advanceTime({
          days: 0,
          hours: rhours,
          minutes: rminutes,
          seconds: 0,
        });
      } else {
        SmallTimeApp.handleSocket('ATadvance', {
          hours: rhours,
          minutes: rminutes,
        });
      }
    }
    // Also move the slider to match.
    $('#timeSlider').val(newTime);
  }

  // Render changes to the sun/moon slider, and handle Darkness link.
  static async timeTransition(timeNow) {
    // These values are arbitrary choices; could be settings eventually.
    const sunriseStart = game.settings.get('smalltime', 'sunrise-start');
    const sunriseEnd = game.settings.get('smalltime', 'sunrise-end');
    const sunsetStart = game.settings.get('smalltime', 'sunset-start');
    const sunsetEnd = game.settings.get('smalltime', 'sunset-end');
    const midnight = 1440;

    // Handles the range slider's sun/moon icons, and the BG color changes.
    // The 450 here is just a multiplier that works out nicely for the CSS move.
    let bgOffset = Math.round((timeNow / midnight) * 450);

    // Reverse the offset direction for the BG color shift for each
    // half of the day.
    if (timeNow <= midnight / 2) {
      $('#slideContainer').css('background-position', `0px -${bgOffset}px`);
    } else {
      $('#slideContainer').css('background-position', `0px ${bgOffset}px`);
    }

    // Swap out the moon for the sun during daytime,
    // changing phase as appropriate.
    const currentPhase = game.settings.get('smalltime', 'moon-phase');

    if (timeNow > sunriseEnd && timeNow < sunsetStart) {
      $('#timeSlider').removeClass('moon');
      $('#timeSlider').addClass('sun');
    } else {
      $('#timeSlider').removeClass('sun');
      $('#timeSlider').addClass('moon');
      document.documentElement.style.setProperty(
        '--SMLTME-phaseURL',
        `url('../images/moon-phases/${SmallTimeMoonPhases[currentPhase]}.webp')`
      );
    }

    // If requested, adjust the scene's Darkness level.
    const currentScene = canvas.scene;

    if (currentScene.getFlag('smalltime', 'darkness-link')) {
      let darknessValue = canvas.lighting.darknessLevel;

      if (timeNow > sunriseEnd && timeNow < sunsetStart) {
        darknessValue = 0;
      } else if (timeNow < sunriseStart) {
        darknessValue = 1;
      } else if (timeNow > sunsetEnd) {
        darknessValue = 1;
      } else if (timeNow >= sunriseStart && timeNow <= sunriseEnd) {
        darknessValue = 1 - (timeNow - sunriseStart) / (sunriseEnd - sunriseStart);
      } else if (timeNow >= sunsetStart && timeNow <= sunsetEnd) {
        darknessValue = (timeNow - sunsetStart) / (sunsetEnd - sunsetStart);
      }
      // Truncate long decimals.
      darknessValue = Math.round(darknessValue * 10) / 10;

      if (game.user.isGM) {
        currentScene.update({ darkness: darknessValue });
      } else {
        SmallTimeApp.handleSocket('changeDarkness', {
          darkness: darknessValue,
          sceneID: currentScene.id,
        });
      }
    }
  }

  // Convert the integer time value to an hours:minutes string.
  static convertTime(timeInteger) {
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
  static pinApp(expanded) {
    // Only do this if a pin lock isn't already in place.
    if (!$('#pin-lock').length) {
      const playerApp = document.getElementById('players');
      const playerAppPos = playerApp.getBoundingClientRect();
      let myOffset = playerAppPos.height + 88;

      if (expanded) myOffset += 21;

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
      game.settings.set('smalltime', 'pinned', true);
    }
  }

  // Un-pin the app.
  static unPinApp() {
    // Remove the style tag that's pinning the window.
    $('#pin-lock').remove();
  }

  // Toggle visibility of the main window.
  static toggleAppVis(mode) {
    if (mode === 'toggle') {
      if (game.settings.get('smalltime', 'visible') === true) {
        // Stop any currently-running animations, and then animate the app
        // away before close(), to avoid the stock close() animation.
        $('#smalltime-app').stop();
        $('#smalltime-app').css({ animation: 'close 0.2s', opacity: '0' });
        setTimeout(function () {
          game.modules.get('smalltime').myApp.close();
        }, 200);
        game.settings.set('smalltime', 'visible', false);
      } else {
        const myApp = new SmallTimeApp().render(true);
        game.modules.get('smalltime').myApp = myApp;
        game.settings.set('smalltime', 'visible', true);
      }
    } else if (game.settings.get('smalltime', 'visible') === true) {
      const myApp = new SmallTimeApp().render(true);
      game.modules.get('smalltime').myApp = myApp;
    }
  }

  static syncFromAboutTime() {
    const ATobject = game.Gametime.DTNow().longDateExtended();
    const newTime = ATobject.hour * 60 + ATobject.minute;

    const newDay = ATobject.dowString;
    const newMonth = ATobject.monthString;
    const newDate = ATobject.day;
    const newYear = ATobject.year;

    const timePackage = {
      type: 'changeTime',
      payload: newTime,
    };

    game.modules.get('smalltime').myApp.handleTimeChange(timePackage);

    if (game.user.isGM) game.settings.set('smalltime', 'current-time', newTime);

    const displayDate = newDay + ', ' + newMonth + ' ' + newDate + ', ' + newYear;
    $('#dateDisplay').html(displayDate);
    // Save this string so we can display it on initial load-in,
    // before About Time is ready.
    if (game.user.isGM) game.settings.set('smalltime', 'current-date', displayDate);
  }
}

// Icons by Freepik on flaticon.com
