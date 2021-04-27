// Icons by Freepik on flaticon.com

Hooks.on('init', () => {
  game.settings.register('smallTime', 'currentTime', {
    name: 'Current Time',
    scope: 'world',
    config: false,
    type: Number,
    default: 0,
 });
 game.settings.register('smallTime', 'position', {
    name: 'Position',
    scope: 'world',
    config: false,
    type: Object,
    default: { top: 446, left: 20 },
 });
});

Hooks.on('renderPlayerList', () => {
  const element = document.getElementById('players');
  const playerAppPos = element.getBoundingClientRect();
  const myOffset = playerAppPos.height + 88;
  $('#my-pin-lock').text(`
      #smalltime-app {
        top: calc(100vh - ${myOffset}px) !important;
        left: 15px !important;
      }
  `);
});

Hooks.on('ready', () => {
  new SmallTimeApp().render(true);
  
  const element = document.getElementById('players');
  const playerAppPos = element.getBoundingClientRect();
  const myOffset = playerAppPos.height + 88;
  
  $('body').append(`
    <style id="my-pin-lock">
      #smalltime-app {
        top: calc(100vh - ${myOffset}px) !important;
        left: 15px !important;
      }
    </style>
  `);
});

class SmallTimeApp extends FormApplication {
  constructor(currentTime) {
    super();
    this.currentTime = game.settings.get('smallTime','currentTime');
  }

  static get defaultOptions() {
    this.initialPosition = game.settings.get('smallTime', 'position');
    
    const element = document.getElementById('players');
    const playerAppPos = element.getBoundingClientRect();
    
    return mergeObject(super.defaultOptions, {
      classes: ['form'],
      popOut: true,
      submitOnChange: true,
      closeOnSubmit: false,
      template: 'modules/smalltime/templates/floater.html',
      id: 'smalltime-app',
      title: 'SmallTime',
      top: playerAppPos.top - 70, // this.initialPosition.top,
      left: playerAppPos.left, // this.initialPosition.left,
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
    
    drag._onDragMouseUp = function _newOnDragMouseUp(event) {
      event.preventDefault();
      window.removeEventListener(...this.handlers.dragMove);
      window.removeEventListener(...this.handlers.dragUp);
      let windowPos = $('#smalltime-app').position();
      let newPos = { top: windowPos.top, left: windowPos.left };
      game.settings.set('smallTime', 'position', newPos);
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