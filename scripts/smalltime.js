// Icons by Freepik on flaticon.com

Hooks.on('init', () => {
  game.settings.register('smallTime', 'currentTime', {
    name: 'Current Time',
    scope: 'world',
    config: false,
    type: Number,
    default: 0
  });
  
  game.settings.register('smallTime', 'position', {
    name: 'Position',
    scope: 'world',
    config: false,
    type: Object,
    default: { top: 446, left: 20 }
  });
  
  game.settings.register('smallTime', 'pinned', {
    name: 'Pinned',
    scope: 'world',
    config: false,
    type: Boolean,
    default: true
  });
  
  game.settings.register('smallTime', 'visible', {
    name: 'Visible',
    scope: 'world',
    config: false,
    type: Boolean,
    default: true
  });
});

Hooks.on("getSceneControlButtons", (buttons) => {
  if (!canvas)
    return
  let group = buttons.find(b => b.name == "notes");
  group.tools.push({
    button: true,
    icon: "fas fa-adjust",
    name: "smalltime",
    title: "SmallTime",
    onClick: () => {
      if (false) {
        new SmallTimeApp().render(true);
      } else {
        SmallTimeApp().close();
      }
    },
  });
});

Hooks.on('renderPlayerList', () => {
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
  if (game.settings.get('smallTime', 'visible')) {
    new SmallTimeApp().render(true);
  }
  if (game.settings.get('smallTime', 'pinned')) {
    pinApp();
  }
});

class SmallTimeApp extends FormApplication {
  constructor(currentTime) {
    super();
    this.currentTime = game.settings.get('smallTime','currentTime');
  }

  static get defaultOptions() {
    
    const pinned = game.settings.get('smallTime', 'pinned');
    
    const playerApp = document.getElementById('players');
    const playerAppPos = playerApp.getBoundingClientRect();
    
    this.initialPosition = game.settings.get('smallTime', 'position');
    
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
      left: this.initialPosition.left
    });
  }
  
  getData() {
    return {
      timeValue: this.currentTime,
      timeString: convertTime(this.currentTime)
    };
  }

  activateListeners(html) {
    super.activateListeners(html);
    
    const dragHandle = html.find('#dragHandle')[0];
    const drag = new Draggable(this, html, dragHandle, false);
    
    let pressTimer = null;
    let pinLock = game.settings.get('smallTime', 'pinned');
    let pinZone = false;
    
    drag._onDragMouseDown = function _newOnDragMouseDown(event) {
      event.preventDefault();
      
      // Record initial position
      this.position = duplicate(this.app.position);
      this._initial = {x: event.clientX, y: event.clientY};
      
      pinLock = game.settings.get('smallTime', 'pinned');
      
      if (pinLock) {
        pressTimer = setTimeout(function() {
          $('#smalltime-app').css("animation", "jiggle 0.2s infinite");
          unPinApp();
          pinLock = false;
        },500);
      }
      window.addEventListener(...this.handlers.dragMove);
      window.addEventListener(...this.handlers.dragUp);
    }
    
    drag._onDragMouseMove = function _newOnDragMouseMove(event) {
      event.preventDefault();
      
      const playerApp = document.getElementById('players');
      const playerAppPos = playerApp.getBoundingClientRect();
      
      clearTimeout(pressTimer);
      
      // Limit dragging to 60 updates per second
      const now = Date.now();
      if ( (now - this._moveTime) < (1000/60) ) return;
      this._moveTime = now;
      
      // Update application position, but only if the app is unpinned
      if (pinLock == false) {
        this.app.setPosition({
          left: this.position.left + (event.clientX - this._initial.x),
          top: this.position.top + (event.clientY - this._initial.y)
        });
        
        let playerAppUpperBound = playerAppPos.top - 50;
        let playerAppLowerBound = playerAppPos.top + 50;
        
        if ( ( event.clientX < 215 ) && ( ( event.clientY > playerAppUpperBound ) && ( event.clientY < playerAppLowerBound ) ) ) {
          $('#smalltime-app').css("animation", "jiggle 0.2s infinite");
          pinZone = true;
        } else {
          $('#smalltime-app').css("animation", "");
          pinZone = false;
        }
      }
    }
    
    drag._onDragMouseUp = function _newOnDragMouseUp(event) {
      event.preventDefault();
      
      window.removeEventListener(...this.handlers.dragMove);
      window.removeEventListener(...this.handlers.dragUp);
      
      clearTimeout(pressTimer);
      
      const playerApp = document.getElementById('players');
      const playerAppPos = playerApp.getBoundingClientRect();
      const myOffset = playerAppPos.height + 88;
      
      if (pinZone) {
        pinApp();
        game.settings.set('smallTime', 'pinned', true);
        this.app.setPosition({
          left: 15,
          top: window.innerHeight - myOffset
        });
      } else {
        let windowPos = $('#smalltime-app').position();
        let newPos = { top: windowPos.top, left: windowPos.left };
        game.settings.set('smallTime', 'position', newPos);
        game.settings.set('smallTime', 'pinned', false);
      }
      
      $('#smalltime-app').css("animation", "");
    }
    
    timeTransition(this.currentTime);
  
    $(document).on('input', '#timeSlider', function() {
      $('#timeDisplay').html( convertTime( $(this).val() ) );
      
      timeTransition( $(this).val() );
    });
    
    
  }
    
  async _updateObject(event, formData) {
    // Get the slider value
    const newTime = formData.timeSlider;
    
    const newString = convertTime(newTime);
    
    // Save the new time
    await game.settings.set('smallTime', 'currentTime', newTime);
  }
}

function pinApp() {
  if ( !($("#pin-lock").length) ) {
    const playerApp = document.getElementById('players');
    const playerAppPos = playerApp.getBoundingClientRect();
    const myOffset = playerAppPos.height + 88;
  
    $('body').append(`
      <style id="pin-lock">
        #smalltime-app {
          top: calc(100vh - ${myOffset}px) !important;
          left: 15px !important;
        }
      </style>
    `);
    
    game.settings.set('smallTime', 'pinned', true);
  }
}

function unPinApp() {
  $('#pin-lock').remove();
}

function timeTransition(timeNow) {
  let bgOffset = Math.round(timeNow / 1410 * 450);
      
  if ( timeNow <= 700 ) {
    $('.slidecontainer').css("background-position", "0px -" + bgOffset + "px" );
  } else {
    $('.slidecontainer').css("background-position", "0px " + bgOffset + "px" );
  }
  
  if (( timeNow > 300 ) && ( timeNow < 1050 )) {
    $('#timeSlider').removeClass('moon');
    $('#timeSlider').addClass('sun');
  } else {
    $('#timeSlider').removeClass('sun');
    $('#timeSlider').addClass('moon');
  }
}

function convertTime(timeInteger) {
  // Convert the integer time value to an hours:minutes string
  let theHours = Math.floor(timeInteger / 60);
  let theMinutes = timeInteger - (theHours * 60);

  if (theMinutes == 0) theMinutes = '00';
  
  if (theHours >= 12) {
    if (theHours == 12) {
      theMinutes = theMinutes + " PM";
    }
    else {
      theHours = theHours - 12;
      theMinutes = theMinutes + " PM";
    }
  } else {
    theMinutes = theMinutes + " AM";
  }
  if (theHours == 0) theHours = 12;

  return(theHours + ":" + theMinutes);
}

window.SmallTimeApp = SmallTimeApp;