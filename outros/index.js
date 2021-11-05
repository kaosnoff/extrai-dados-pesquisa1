const yargs = require('yargs');
const fs = require('fs');
const path = require('path');

const argv = yargs
	.command('compara', 'Caminho da pasta de origem para comparar',
		{
			origem: {
				description: 'Caminho da pasta de origem a ser comparada',
				alias: 'o',
				type: 'string'
			},
			destino: {
				description: 'Caminho da pasta final a ser comparada',
				alias: 'd',
				type: 'string'
			},
			saida: {
				description: 'Arquivo de saída para o log.',
				alias: 'out',
				type: 'string'
			},
			recursivo: {
				description: 'Comparação recursiva',
				alias: 'r',
				type: 'boolean'
			}
		}
	)
	/*
	.option('time', {
		alias: 't',
		description: 'Tell the present Time',
		type: 'boolean',
	})
	// */
	.help()
	.alias('help','h')
	.argv;

/*
if (argv.time) {
	console.log('The current time is: ', new Date().toLocaleTimeString());
}
// */

function getFilesFromPath(myPath, recursivo)
{
	return [];
}

if (argv._.includes('compara'))
{
	const pathOrig = path.join(...(argv.origem).split(/[\/,\\]/));
	const pathDest = path.join(...(argv.destino).split(/[\/,\\]/));
	let fLog = argv.saida;
	const recursivo = !!argv.recursivo;
	
	if (pathOrig == '' || pathOrig == undefined)
	{
		return console.error("Não foi especificada uma origem!");
	}
	if (pathDest == '' || pathDest == undefined)
	{
		return console.error("Não foi especificado um destino!");
	}
	if (fLog == '' || fLog == undefined)
	{
		fLog = path.join(__dirname,'compara.log');
	}
	//let filesOrig = fs.readdirSync(pathOrig,{encoding: 'utf8'});
	//let filesDest = fs.readdirSync(pathDest,{encoding: 'utf8'});
	
	let filesOrig = getFilesFromPath(pathOrig, recursivo);
	let filesDest = getFilesFromPath(pathDest, recursivo);
	
	console.log(filesOrig, filesDest, recursivo);
}
