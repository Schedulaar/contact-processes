

const LAYERS = 10
const FPS = 10
const d = 6
const SPEED = 1
const LAMBDA = 1 / (d-1)
let nNodes = 0
for (let i = 0; i < LAYERS; i++) nNodes += Math.pow(d,i)

const calcTreeAnimation = () => {

  const initialNodes = new Array(nNodes)
  for (let i  = 0; i < nNodes; i++)
    initialNodes[i] = 1;

  const healProp = 1 / FPS
  const infectProp = LAMBDA / FPS

  const startTime = process.hrtime()
  for (let k = 0; k < FPS; k++) {
    for (let i = 0; i < nNodes; i++) {
      if (initialNodes[i] === 1) {
        if (Math.random() < healProp) initialNodes[i] = 0
        if (i > 0 && Math.random() < infectProp) initialNodes[Math.floor((i-1) / d)] = 1
        if (i * d <= nNodes) {
          for (let j = 1; j <= d; j++)
            if (Math.random() < infectProp) initialNodes[i * d + j] = 1
        }
      }
    }
  }
  const diff = process.hrtime(startTime)
  console.log(diff)
}

calcTreeAnimation()
