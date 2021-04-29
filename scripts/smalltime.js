// Icons by Freepik on flaticon.com

Hooks.on('init', () => {
  game.settings.register('smalltime', 'currentTime', {
    name: 'Current Time',
    scope: 'world',
    config: false,
    type: Number,
    default: 0,
  });

  game.settings.register('smalltime', 'position', {
    name: 'Position',
    scope: 'client',
    config: false,
    type: Object,
    default: { top: 446, left: 20 },
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
  
  game.settings.register('smalltime', 'small-step', {
    name: 'Small Step Amount',
    hint: 'Number of minutes to add/remove from the time with the < and > buttons.',
    scope: 'world',
    config: true,
    type: Number,
    choices: {
      1: "1",
      5: "5",
      10: "10",
      15: "15",
      20: "20",
      30: "30"
    },
    default: 30
  });
  
  game.settings.register('smalltime', 'large-step', {
    name: 'Large Step Amount',
    hint: 'Number of minutes to add/remove from the time with the << and >> buttons.',
    scope: 'world',
    config: true,
    type: Number,
    choices: {
      20: "20",
      30: "30",
      60: "60",
      99: "Dawn > Midday > Dusk"
    },
    default: 60
  });
});

Hooks.on('getSceneControlButtons', (buttons) => {
  if (!canvas) return;
  let group = buttons.find((b) => b.name === 'notes');
  group.tools.push({
    button: true,
    icon: 'fas fa-adjust',
    name: 'smalltime',
    title: 'SmallTime',
    onClick: () => {
      toggleAppVis('toggle');
    },
  });
});

Hooks.on('renderPlayerList', () => {
  // Hooking in here to adjust the position of the window when the size of the PlayerList changes

  const element = document.getElementById('players');
  const playerAppPos = element.getBoundingClientRect();
  const myOffset = playerAppPos.height + 88;
  $('#pin-lock').text(`
      #smalltime-app {
        top: calc(100vh - ${myOffset}px) !important;
        left: 15px !important;
      }
  `);
});

Hooks.on('ready', () => {
  toggleAppVis('initial');
  if (game.settings.get('smalltime', 'pinned') === true) {
    pinApp();
  }
});

class SmallTimeApp extends FormApplication {
  constructor() {
    super();
    this.currentTime = game.settings.get('smalltime', 'currentTime');
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
      template: 'modules/smalltime/templates/floater.html',
      id: 'smalltime-app',
      title: 'SmallTime',
      top: this.initialPosition.top,
      left: this.initialPosition.left,
    });
  }

  getData() {
    // Sending values to the HTML template

    return {
      timeValue: this.currentTime,
      timeString: convertTime(this.currentTime),
    };
  }

  activateListeners(html) {
    super.activateListeners(html);

    const dragHandle = html.find('#dragHandle')[0];
    const drag = new Draggable(this, html, dragHandle, false);

    // Pin zone is the "wiggle area" in which the app will be locked
    // to a pinned position if dropped. pinZone stores whether or not
    // we're currently in that area.
    let pinZone = false;

    // Disable controls for non-GMs
    if (!game.user.isGM) {
      $('#timeSlider').css('pointer-events', 'none');
      $('.arrow').css('visibility', 'hidden');
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

      unPinApp();
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

      // We've already set up this block in two other places already, can
      // probably be optimized better.
      const playerApp = document.getElementById('players');
      const playerAppPos = playerApp.getBoundingClientRect();
      const myOffset = playerAppPos.height + 88;

      if (pinZone) {
        pinApp();
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

      // Kill any animation on mouseUp.
      $('#smalltime-app').css('animation', '');
    };

    // An initial set of the sun/moon/bg/time display in case it hasn't been
    // updated since a settings change for some reason.
    timeTransition(this.currentTime);

    // Socket to send any GM changes dynamically to clients.
    game.socket.on(`module.smalltime`, (data) => {
      if (data.operation ==== 'timeChange') handleTimeChange(data);
    });

    $(document).on('input', '#timeSlider', function () {
      $('#timeDisplay').html(convertTime($(this).val()));

      timeTransition($(this).val());

      game.socket.emit('module.smalltime', {
        operation: 'timeChange',
        content: $(this).val(),
      });
    });

    // Handle the increment/decrement buttons.
    $(document).on('click', '#decrease', function () {
      timeRatchet('decrease');
    });

    $(document).on('click', '#increase', function () {
      timeRatchet('increase');
    });
  }

  async _updateObject(event, formData) {
    // Get the slider value.
    const newTime = formData.timeSlider;

    // Save the new time.
    await game.settings.set('smalltime', 'currentTime', newTime);
  }
}

// Helper function for the socket updates.
function handleTimeChange(data) {
  timeTransition(data.content);
  $('#timeDisplay').html(convertTime(data.content));
  $('#timeSlider').val(data.content);
}

// Functionality for increment/decrement buttons.
function timeRatchet(direction) {
  let currentTime = game.settings.get('smalltime', 'currentTime');
  let newTime = currentTime;

  // Buttons currently do 30 minute steps.
  let delta = 30;

  if (direction === 'decrease') {
    delta = -30;

    // Handle being at the end of the range; cycle around to other end.
    if (currentTime === 0) {
      currentTime = 1440;
    }
  }

  if (direction === 'increase') {
    if (currentTime === 1410) {
      currentTime = -30;
    }
  }

  newTime = currentTime + delta;
  game.settings.set('smalltime', 'currentTime', newTime);

  $('#timeDisplay').html(convertTime(newTime));

  timeTransition(newTime);

  // Socket for player sync.
  game.socket.emit('module.smalltime', {
    operation: 'timeChange',
    content: newTime,
  });

  // Also move the slider to match.
  $('#timeSlider').val(newTime);
}

function pinApp() {
  // Only do this if a pin lock isn't already in place.
  if (!$('#pin-lock').length) {
    const playerApp = document.getElementById('players');
    const playerAppPos = playerApp.getBoundingClientRect();
    const myOffset = playerAppPos.height + 88;

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

function unPinApp() {
  $('#pin-lock').remove();
}

function toggleAppVis(mode) {
  if (mode === 'toggle') {
    if (game.settings.get('smalltime', 'visible') === true) {
      // Stop any currently-running animations, and then animate the app
      // away before close(), to avoid the stock close() animation.
      $('#smalltime-app').css('animation', 'none');
      $('#smalltime-app').animate({ opacity: 0 });
      game.modules.get('smalltime').myApp.close();
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
}

// Handles the range slider's sun/moon icons, and the BG color changes.
function timeTransition(timeNow) {
  let bgOffset = Math.round((timeNow / 1410) * 450);

  if (timeNow <= 700) {
    $('.slidecontainer').css('background-position', '0px -' + bgOffset + 'px');
  } else {
    $('.slidecontainer').css('background-position', '0px ' + bgOffset + 'px');
  }

  if (timeNow > 300 && timeNow < 1050) {
    $('#timeSlider').removeClass('moon');
    $('#timeSlider').addClass('sun');
  } else {
    $('#timeSlider').removeClass('sun');
    $('#timeSlider').addClass('moon');
  }
}

// Convert the integer time value to an hours:minutes string.
function convertTime(timeInteger) {
  let theHours = Math.floor(timeInteger / 60);
  let theMinutes = timeInteger - theHours * 60;

  if (theMinutes === 0) theMinutes = '00';

  if (theHours >= 12) {
    if (theHours === 12) {
      theMinutes = theMinutes + ' PM';
    } else {
      theHours = theHours - 12;
      theMinutes = theMinutes + ' PM';
    }
  } else {
    theMinutes = theMinutes + ' AM';
  }
  if (theHours === 0) theHours = 12;

  return theHours + ':' + theMinutes;
}

window.SmallTimeApp = SmallTimeApp;
