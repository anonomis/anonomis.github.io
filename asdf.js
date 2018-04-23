
const init = (state) => {

  home = state => {
    
    const isSimon = _.has(localStorage, 'simon')
    const buttons = isSimon ? 
          `<button class="btnJa" style="width: 30%; height: 40%; flex-shrink: 0;">Haka</button>
           <button class="btnNej" style="width: 30%; height: 40%; flex-shrink: 0;">Inte haka</button>` 
    :  
          `<button class="btnPlan" style="width: 30%; height: 40%; flex-shrink: 0;">Planera resa</button>`
    
    let info = 'Ingen resa bokad'
    
    if(state.depTime > new Date().getTime()) {
      const pos = ['på jobbet', 'hemma'][state.ch]
      const date = new Date(state.depTime);
      const today = new Date().getDay() === date.getDay() ? 'idag' : 'imorgon'
      const hour = date.getHours()
      const minute = date.getMinutes()
      const color = ['cornflowerblue', 'red', 'green'][state.acc ||0]
      let hasConfirmed = ['Simon har inte bekräftat', 'Simon bangar', 'Simon hakar på'][state.acc || 0]
      if(isSimon) {
        hasConfirmed = hasConfirmed.replace('Simon', 'Du')
      }
      info = `<div>Blixten är <span>${pos}</span></div>
              <div>Blixten går <span>${today}</span> kl <span>${hour}:${minute}</span></div>
              <div style="color:${color};">${hasConfirmed}</div>`
    }
    $('body').
    html(`
      <div style="position: fixed; height: 100%; width: 100%; display: flex; flex-direction: column;">
        <div style="display: flex; height: 90%; padding-top: 2%;">
          <div style="width: 45%;height: 80%;justify-content: space-between;display: flex; flex-wrap: wrap; flex-flow: column; ">
            ${info}
          </div>
          <div style="width: 55%;height: 60%; align-content: flex-end; display: flex; flex-direction: row-reverse;">
            ${buttons}
            <div style="flex-grow: 1"></div>
            <button class="btnSwitch" style="font-size: 20px; width: 10%; height: 20%; flex-shrink: 0;">Byt användare</button>
          </div>
        </div>
      </div>
    `)
    $('.btnPlan').click(function () { 
      wizardStep1(state)
    })  
    $('.btnSwitch').click(function () { 
      if(_.has(localStorage, 'simon')) {
        delete localStorage.simon
      } else {
        localStorage.simon = 'jo du de e de'
      }
      home(state)
    })  
    $('.btnJa').click(function () {
      state.acc = 2
      $.ajax({
        url: 'https://cors-anywhere.herokuapp.com/api.keyvalue.xyz:443/41b2dbf9/myKey',
        type: 'POST',
        data: JSON.stringify(state),
        success: (result) => {
          home(state)
        }
      });
    })  
    $('.btnNej').click(function () {
      state.acc = 1
      $.ajax({
        url: 'https://cors-anywhere.herokuapp.com/api.keyvalue.xyz:443/41b2dbf9/myKey',
        type: 'POST',
        data: JSON.stringify(state),
        success: (result) => {
          home(state)
        }
      });
    })  
  }

  home(state)
   
  wizardStep1 = state => {
    
    $('body').
    html(`
      <div style="position: fixed; height: 100%; width: 100%;">
      <div>Blixten är:</div>
      <div style="display: flex; height: 90%; justify-content: space-around; margin-top: 2%;">
      <button id="btnHemma" style="width: 40%; height: 80%;">hemma</button>
      <button id="btnJobbet" style="width: 40%; height: 80%;">på jobbet</button>
      </div>
      </div>
    `)
    $('#btnHemma').click(function () {
      state.ch = 1
      wizardStep2(state)
    })  
    $('#btnJobbet').click(function () {
      state.ch = 0
      wizardStep2(state) 
    })   
  }
  
  wizardStep2 = state => {
    let hr, min;
    setState = state => {
      var newDate = new Date()
      if(state.ch < newDate.getHours()) {
        newDate.setDate(newDate.getDate() + 1) 
      }
      newDate.setHours(hr)
      newDate.setMinutes(min)
      state.depTime = newDate.getTime()
      state.acc = 0
      $.ajax({
        url: 'https://cors-anywhere.herokuapp.com/api.keyvalue.xyz:443/41b2dbf9/myKey',
        type: 'POST',
        data: JSON.stringify(state),
        success: (result) => {
          home(state)
        }
      });
    }
    render = () => {
      makeHourButtons = (from) => {
        return _.map(_.range(from, from + 4), (hour) => {
          return `<button class="btnHour" style="width: 45%; height: 40%; flex-shrink: 0;">${hour}</button>`
        }).join('')
      }
      let hourButtons
      if(state.ch === 1) {
        hourButtons = makeHourButtons(7)
      } else {
        hourButtons = makeHourButtons(17)
      }
      $('body').
      html(`
        <div style="position: fixed; height: 100%; width: 100%; display: flex; flex-direction: column;">
        <div>Bilen går:</div>
        <div style="display: flex; height: 90%; padding-top: 2%;">
        <div style="width: 45%;height: 80%;justify-content: space-between;display: flex; flex-wrap: wrap; ">
          ${hourButtons}
        </div>
        <div style="flex-grow: 1; text-align: center;">${hr || ''}:${min|| ''}</div>
        <div style="width: 45%;height: 80%;justify-content: space-between;display: flex; flex-wrap: wrap; ">
          <button class="btnMinute" style="width: 30%; height: 40%; flex-shrink: 0;">00</button>
          <button class="btnMinute" style="width: 30%; height: 40%; flex-shrink: 0;">10</button>
          <button class="btnMinute" style="width: 30%; height: 40%; flex-shrink: 0;">20</button>
          <button class="btnMinute" style="width: 30%; height: 40%; flex-shrink: 0;">30</button>
          <button class="btnMinute" style="width: 30%; height: 40%; flex-shrink: 0;">40</button>
          <button class="btnMinute" style="width: 30%; height: 40%; flex-shrink: 0;">50</button>
        </div>
        </div>
        </div>
      `)
      $('.btnHour').click((ev)  => {
        hr = $(ev.currentTarget).text();
        render()
        if(!!hr && !!min) {
          setState(state)
        }
      })  
      $('.btnMinute').click((ev) => {
        min = $(ev.currentTarget).text();
        render()
        if(!!hr && !!min) {
          setState(state)
        }
      })  
    }
    render()
  }
  
  //wizardStep2()
  
}

$.ajax({
  url: 'https://cors-anywhere.herokuapp.com/api.keyvalue.xyz:443/41b2dbf9/myKey',
  type: 'GET',
  success: function(result) {
	  init(JSON.parse(result))
  }
});
