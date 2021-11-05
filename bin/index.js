const yargs = require('yargs');
const fs = require('fs');
const path = require('path');
const md5File = require('md5-file');

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
	let saida = {};
	
	let files = fs.readdirSync(myPath,{encoding: 'utf8'});
	for (let f of files)
	{
		let fPath = path.join(myPath,f);
		
		let stat = fs.statSync(fPath);
		
		let item = {
			path: myPath,
			name: f,
			isDir: stat.isDirectory(),
			size: stat.size
		}
		//console.log(stat);
		
		let subdir = undefined;
		if (item.isDir)
		{
			subdir = getFilesFromPath(fPath,recursivo);
		}
		else
		{
			item.hash = md5File.sync(fPath);
		}
		
		saida[fPath] = item;
		if (subdir)
		{
			saida = Object.assign({}, saida, subdir);
		}
	}
	
	return saida;
}
function sortFilesMd5(files)
{
	let saida = {};
	const keys = Object.keys(files);
	for (let f of keys)
	{
		let file = files[f];
		if (file.hash == undefined) continue;
		
		saida[file.hash] = file;
	}
	return saida;
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
	
	let filesOrig = getFilesFromPath(pathOrig, recursivo);
	let filesDest = getFilesFromPath(pathDest, recursivo);
	console.log(Object.keys(filesOrig).length, Object.keys(filesDest).length);
	
	let saida = {
		iguais: [],
		difOrig: [],
		difDest: []
	};
	
	let md5Orig = sortFilesMd5(filesOrig);
	let md5Dest = sortFilesMd5(filesDest);
	
	const keysOrig = Object.keys(md5Orig);
	const keysDest = Object.keys(md5Dest);
	
	for (let hash of keysOrig)
	{
		if (md5Dest[hash] !== undefined)
		{
			md5Orig[hash].path2 = md5Dest[hash].path;
			saida.iguais.push(md5Orig[hash]);
		}
		else
		{
			saida.difOrig.push(md5Orig[hash]);
		}
	}
	for (let hash of keysDest)
	{
		if (md5Orig[hash] === undefined)
		{
			saida.difDest.push(md5Dest[hash]);
		}
	}
	
	fs.writeFileSync(fLog, JSON.stringify(saida,null,2),{encoding: 'utf8'});
	
	console.log(`Comparados: ${Object.keys(md5Orig).length} objeto(s) com ${Object.keys(md5Dest).length} objeto(s).`);
	//console.log(md5Dest);
}
