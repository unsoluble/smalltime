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
    default: { top: 100, left: 100 },
 });
});

Hooks.on('ready', () => {
  new SmallTimeApp().render(true);
});

class SmallTimeApp extends FormApplication {
  constructor(currentTime) {
    super();
    this.currentTime = game.settings.get('smallTime','currentTime');
  }

  static get defaultOptions() {
    this.initialPosition = game.settings.get('smallTime', 'position');
    
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
    return {
      timeValue: this.currentTime,
      timeString: convertTime(this.currentTime)
    };
  }

  activateListeners(html) {
    super.activateListeners(html);
    
    const dragHandle = html.find('#dragHandle')[0];
    new Draggable(this, html, dragHandle, false);
    
    $(document).on('input', '#timeSlider', function() {
      $('#timeDisplay').html( convertTime( $(this).val() ) );
      
      if (( $(this).val() > 300 ) && ( $(this).val() < 1020 )) {
        $('#timeSlider').removeClass('moonSlider');
        $('#timeSlider').addClass('sunSlider');
      } else {
        $('#timeSlider').removeClass('sunSlider');
        $('#timeSlider').addClass('moonSlider');
      }
    });
  }
  
  async _updateObject(event, formData) {
    // Get the slider value
    const newTime = formData.timeSlider;
    
    const newString = convertTime(newTime);
    
    // Save the new time
    await game.settings.set('smallTime', 'currentTime', newTime);
    
    // Save the new window position
    let windowPos = $('#smalltime-app').position();
    let newPos = { top: windowPos.top, left: windowPos.left };
    await game.settings.set('smallTime', 'position', newPos);
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