const fs = require('fs')

//* Blocking, synchronous
// const textIn = fs.readFileSync('./src/libs/input.txt', 'utf-8')
// console.log(textIn)

// const textOut = `This is allahu ${textIn} \n Create on ${Date.now()}`
// fs.writeFileSync('./src/output.txt', textOut)
// console.log('File written!')

//* Non-blocking, asynchronous
fs.readFile('./src/libs/start.txt', 'utf-8', (err, data1) => {
	fs.readFile(`./src/libs/${data1}.txt`, 'utf-8', (err, data2) => {
		console.log(data2)
	})
})
console.log('will read file')
