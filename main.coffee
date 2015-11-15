###
window.au = function() {
  document.getElementById("run").click();
  return setTimeout(window.au, 3000);
};
au()
###

window.requestAnimFrame = (->
    window.requestAnimationFrame or window.webkitRequestAnimationFrame or window.mozRequestAnimationFrame or window.oRequestAnimationFrame or window.msRequestAnimationFrame or (callback, element) -> # function
        # DOMElement
        window.setTimeout callback, 1000 / 60
        return
)()
cvs = document.getElementById("cvs")
ctx = cvs.getContext("2d")
frameHeight = 480
frameWidth = 640
fps = 0
fps_now = undefined
fps_last = (new Date)
fps_el = document.getElementById("fps")
cvs.setAttribute "height", frameHeight
cvs.setAttribute "width", frameWidth


s = 30
hs = Math.floor(s / 2)
ts = Math.floor(s / 4)

spin = (modX, modY, step) ->
      ul: [ modX , modY ]
      ur: [ modX + step , modY ]
      lr: [ modX + step , modY + step ]
      ll: [ modX , modY + step ]

cords =
      ul: spin(0    ,0    , ts)
      ur: spin(s-ts ,0    , ts)
      lr: spin(s-ts , s-ts, ts)
      ll: spin(0    , s-ts, ts)

clockwise = ["ul","ur","lr","ll"]
rot = (s) -> clockwise[((clockwise.indexOf(s)+1)%4)]


pal =
      fill: "0.5"
      ur: "0.3"
      ul: "0.55"
      ll: "0.7"
      lr: "0.55"
      n: "0.4"
      e: "0.4"
      w: "0.6"
      s: "0.6"

dirs =
 n:
   idx: 0
   ul:cords.ul.ur
   lr:cords.ur.ll
 e:
   idx: 1
   ul:cords.ur.ll
   lr:cords.lr.ur
 w:
   idx: 2
   ul:cords.ul.ll
   lr:cords.ll.ur
 s:
   idx: 3
   ul:cords.ll.ur
   lr:cords.lr.ll

shapes =
  rect: (ctx, ul, lr) ->
      width = lr[0] - ul[0]
      height = lr[1] - ul[1]
      ctx.rect ul[0], ul[1], width, height
  tri: (ctx, corners, start) ->
      ctx.moveTo corners[start][0], corners[start][1]
      next = rot start
      ctx.lineTo corners[next][0], corners[next][1]
      next = rot rot next
      ctx.lineTo corners[next][0], corners[next][1]

drawShape = (ctx, shape, corners, dir, opa, color) ->
      ctx.beginPath()
      shapes[shape] ctx, corners, dir
      ctx.closePath()
      ctx.globalAlpha = opa
      ctx.fill()

cornerGenerator =
  ul:
    dirs: [0,2]
    falsefalse: (ctx) -> drawShape ctx, "tri",cords.ul, "lr", pal.ul
    falsetrue: (ctx) -> drawShape ctx, "rect",cords.ul.ul,cords.ul.lr, pal.n
    truefalse: (ctx) -> drawShape ctx, "rect",cords.ul.ul,cords.ul.lr, pal.w
    truetrue: (ctx) ->
      drawShape ctx, "tri",cords.ul, "ul", pal.ul
      drawShape ctx, "tri",cords.ul, "lr", pal.fill
  ur:
    dirs: [0,1]
    falsefalse: (ctx) -> drawShape ctx, "tri",cords.ur, "ll", pal.ur
    falsetrue: (ctx) -> drawShape ctx, "rect",cords.ur.ul,cords.ur.lr, pal.n
    truefalse: (ctx) -> drawShape ctx, "rect",cords.ur.ul,cords.ur.lr, pal.e
    truetrue: (ctx) -> drawShape ctx, "tri",cords.ur, "ur", pal.ur
    truetrue: (ctx) ->
      drawShape ctx, "tri",cords.ur, "ur", pal.ur
      drawShape ctx, "tri",cords.ur, "ll", pal.fill
  lr:
    dirs: [1,3]
    falsefalse: (ctx) -> drawShape ctx, "tri",cords.lr, "ul", pal.lr
    falsetrue: (ctx) -> drawShape ctx, "rect",cords.lr.ul,cords.lr.lr, pal.e
    truefalse: (ctx) -> drawShape ctx, "rect",cords.lr.ul,cords.lr.lr, pal.s
    truetrue: (ctx) ->
      drawShape ctx, "tri",cords.lr, "ul", pal.fill
      drawShape ctx, "tri",cords.lr, "lr", pal.lr
  ll:
    dirs: [2,3]
    falsefalse: (ctx) -> drawShape ctx, "tri",cords.ll, "ur", pal.ll
    falsetrue: (ctx) -> drawShape ctx, "rect",cords.ll.ul,cords.ll.lr, pal.w
    truefalse: (ctx) -> drawShape ctx, "rect",cords.ll.ul,cords.ll.lr, pal.s
    truetrue: (ctx) ->
      drawShape ctx, "tri",cords.ll, "ll", pal.ll
      drawShape ctx, "tri",cords.ll, "ur", pal.fill

drawGem = (ctx, x, y, news, gem, zoom) ->
  #ctx.setTransform 1, x*s, 0, 1, y*s, 0
  zoom = zoom / 2
  xTrans = x*s #- zoom * hs
  yTrans = y*s #- zoom * hs
  #ctx.setTransform 1+zoom, 0, 0, 1+zoom, xTrans, yTrans
  ctx.save()
  ctx.translate xTrans, yTrans
  ctx.fillStyle = "rgb(#{gem.color})"

  #news
  for dir,dinfo of dirs
    opa = pal.fill
    unless news[dinfo.idx]
      opa = pal[dir]
    drawShape ctx, "rect", dinfo.ul, dinfo.lr, opa

  #mid
  drawShape ctx, "rect",cords.ul.lr,cords.lr.ul, pal.fill

  #corners
  for k,v of cornerGenerator
      v["#{news[v.dirs[0]]}#{news[v.dirs[1]]}"](ctx)
  ctx.restore()

makeGem = (color) ->
  id: _.uniqueId("gem-")
  color: color

colors =
  kendra: "255,15,100"
  starlight: "0,15,255"
  blazeballs: "0,22,0"
  nordicmist: "220,17,150"

gems = {}
grid = []
for x in [0..10]
  grid.push []
  for y in [0..10]
    vals = []
    vals.push v for k,v of colors
    gem = makeGem vals[(x % 4)]
    # gem = makeGem vals[Math.floor(Math.random() * vals.length)]
    grid[x].push gem
    gems[gem.id] = gem

cursor =
  x: 0
  y: 0

actions =
  "37": -> cursor.x--
  "38": -> cursor.y--
  "39": -> cursor.x++
  "40": -> cursor.y++
  "32": -> window.doSwap()


$(document).keydown (e) ->
  console.log e.keyCode
  actions[e.keyCode]?()
  e.preventDefault() if actions[e.keyCode]?

getCell = (x, y) ->
  unless grid[y]?[x]?
      return null
  grid[y][x]

renderGridAt = (x, y) ->
  row = grid[y]
  news = [
      getCell(x, y)?.color is getCell(x, y - 1)?.color,
      getCell(x, y)?.color is getCell(x + 1, y)?.color,
      getCell(x, y)?.color is getCell(x - 1,  y)?.color,
      getCell(x, y)?.color is getCell(x, y + 1)?.color
  ]

  ctx.save()
  zoom = 0
  if row[x] is 1
    zoom = Math.sin fps_now/1000
  else
    zoom = Math.sin -fps_now/1000
  drawGem ctx, x, y, news, row[x], zoom
  ctx.restore()

swap =
  x: 0
  y: 0
  prog: 0

isSwap = (x, y) ->
  if swap?
    if x is swap.x or x is swap.x + 1
      if y is swap.y or y is swap.y + 1
        return true
  return false

window.doSwap = ->
  swap =
    x: cursor.x
    y: cursor.y
    prog: 0

renderSwap = (ctx, dt) ->
  ctx.save()
  ctx.translate s * (swap.x + 1), s * (swap.y + 1)
  angle = swap.prog * (Math.PI / 2)
  scale = 1 - ( 0.4 * Math.sin(swap.prog*Math.PI) )
  ctx.scale scale, scale
  ctx.rotate angle
  ctx.translate -s * (swap.x + 1), -s * (swap.y + 1)
  swapCords = spin(swap.x, swap.y, 1)
  for k,pos of swapCords
    renderGridAt pos[0], pos[1]
  ctx.restore()
  swap.prog += dt / 1000 * 3
  if swap.prog >= 1
    values = [
      getCell(swap.x, swap.y),
      getCell(swap.x + 1, swap.y),
      getCell(swap.x, swap.y + 1),
      getCell(swap.x + 1, swap.y + 1)
    ]
    grid[swap.y][swap.x] = values[2]
    grid[swap.y][swap.x + 1] = values[0]
    grid[swap.y + 1][swap.x] = values[3]
    grid[swap.y + 1][swap.x + 1] = values[1]
    swap = null

mergeCheck = ->
  for y in [0...grid.length]
    row = grid[y]
    for x in [0...row.length]
      gem = getCell x, y


render = ->
  fps_now = new Date
  dt = fps_now - fps_last
  fps = 1000 / dt

  fps_last = fps_now

  ctx.save()
  ctx.fillStyle = "lightgray"
  ctx.fillRect(0, 0, frameWidth, frameHeight)
  ctx.translate 10,10

  ctx.fillStyle="white"
  xTrans = cursor.x*s
  yTrans = cursor.y*s
  ctx.fillRect xTrans, yTrans, 2*s, 2*s

  cursorSlots = []
  for y in [0...grid.length]
      row = grid[y]
      for x in [0...row.length]
          unless isSwap x, y
            renderGridAt x, y
          else
            cursorSlots.push
              x: x
              y: y
  if swap?
    renderSwap ctx, dt


  console.log xTrans, yTrans
  ctx.restore()

  fps_el.innerHTML = Math.round(fps) + " fps"
  requestAnimFrame ->
    render()
    return

  return

render.call()

window.gems = gems
