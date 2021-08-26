const ExtraiDadosPdf = require("./src/ExtraiDadosPdf");
const fs = require("fs");
const path = require("path");

// Indica a pasta do sistema que será a fonte dos arquivos
const pathEntrada = 'entradas/teste';

const extrator = new ExtraiDadosPdf();

let dir = fs.readdirSync(path.join(...pathEntrada.split('/')));
dir.forEach(filename =>
{
	let file = extrator.extraiArquivo(pathEntrada+'/'+filename);
	file.then(dados =>
	{
		// Salva os dados como arquivos individuais na pasta "saidas"
		fs.writeFileSync(path.join(__dirname,'saidas',filename.replace('.pdf','.txt')),JSON.stringify(dados,null,2),{encoding: 'utf-8'});
	})
	.catch(e => console.error(e));
});