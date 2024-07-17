const fs = require('fs')

setTimeout(() => {
	console.log('timer 1 finished')
}, 0)

setImmediate(() => {
	console.log('Immediate 1 finished')
})

fs.readFile('test-file.txt', () => {
  console.log('I/O finished')
  console.log('---------')
  
  setTimeout(() => {
		console.log('timer 2 finished')
	}, 0)
  setTimeout(() => {
		console.log('timer 3 finished')
	}, 3000)

	setImmediate(() => {
		console.log('Immediate 2 finished')
	})
})

console.log('hello from the top-level code')
