// Icons by Freepik on flaticon.com

Hooks.on('init', () => {
  game.settings.register('smallTime', 'currentTime', {
    name: 'Current Time',
    scope: 'world',
    config: false,
    type: Number,
    default: 0,
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
    return mergeObject(super.defaultOptions, {
      classes: ['form'],
      popOut: true,
      submitOnChange: true,
      closeOnSubmit: false,
      template: `modules/smalltime/templates/floater.html`,
      id: 'smalltime-app',
      title: 'SmallTime',
    });
  }
  
  getData() {
    return {
      msg: this.currentTime
    };
  }

  activateListeners(html) {
    super.activateListeners(html);
  }

  async _updateObject(event, formData) {
    // Get the slider value
    const newTime = formData.timeSlider;
    
    // Convert the integer time value to an hours:minutes string
    let theHours = Math.floor(newTime / 60);
    let theMinutes = newTime - (theHours * 60);

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

    console.log(theHours + ":" + theMinutes);
    
    // Save the new time
    game.settings.set('smallTime', 'currentTime', newTime);
  }
}

window.SmallTimeApp = SmallTimeApp;