
const init = (state) => {

  home = state => {
    const pos = ['hemma', 'på jobbet'][state.ch]

    $('body').
    html(`
      <div style="position: fixed; height: 100%; width: 100%; display: flex; flex-direction: column;">
        <div style="display: flex; height: 90%; padding-top: 2%;">
          <div style="width: 45%;height: 80%;justify-content: space-between;display: flex; flex-wrap: wrap;  ">
              <p>Bilen är <span>hemma/på jobbet</span></p>
              <p>Bilen går <span>imorgon/idag</span> kl <span>0859</span></p>
              <p>Simon har <span>bekräftat/inte bekräftat<span></span></span></p>
              <p>Simon hänger <span>på/inte på<span></span></span></p>
          </div>
          <div style="width: 55%;height: 60%; align-content: flex-end; display: flex; flex-direction: row-reverse;">
            <button class="btnPlan" style="width: 30%; height: 40%; flex-shrink: 0;">Planera bil</button>
            <button class="btnMinute" style="width: 30%; height: 40%; flex-shrink: 0;">Ja</button>
            <button class="btnMinute" style="width: 30%; height: 40%; flex-shrink: 0;">Nej</button>
          </div>
        </div>
      </div>
    `)
    $('.btnPlan').click(function () {
      wizardStep1(state)
    })  
  }

  home(state)
   
  wizardStep1 = state => {
    
    $('body').
    html(`
      <div style="position: fixed; height: 100%; width: 100%;">
      <div>Bilen är:</div>
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
      
      $.ajax({
        url: 'https://cors-anywhere.herokuapp.com/api.keyvalue.xyz:443/41b2dbf9/myKey',
        type: 'POST',
        data: JSON.stringify(state),
        success: function(result) {
          home(state)
        }
      });
    }
    render = () => {
      $('body').
      html(`
        <div style="position: fixed; height: 100%; width: 100%; display: flex; flex-direction: column;">
        <div>Bilen går:</div>
        <div style="display: flex; height: 90%; padding-top: 2%;">
        <div style="width: 45%;height: 80%;justify-content: space-between;display: flex; flex-wrap: wrap; ">
          <button class="btnHour" style="width: 45%; height: 40%; flex-shrink: 0;">7</button>
          <button class="btnHour" style="width: 45%; height: 40%; flex-shrink: 0;">8</button>
          <button class="btnHour" style="width: 45%; height: 40%; flex-shrink: 0;">9</button>
          <button class="btnHour" style="width: 45%; height: 40%; flex-shrink: 0;">10</button>
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
