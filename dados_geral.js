const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

let fileGeral = fs.readFileSync(path.join('dados','geral.txt'),{encoding:'utf8'});

fileGeral = fileGeral.split("\r\n");

let dadosGeral = {};

fileGeral.forEach((row,index) =>
{
	if (index === 0) return;
	let linha = row.split(';');
	
	let nome = linha[1].trim();
	let id = crypto.createHash('sha1').update(nome).digest('hex');
	
	if (dadosGeral[id] === undefined)
	{
		dadosGeral[id] = {
			nome: nome,
			data_nasc: linha[2].trim(),
			data_exame: [linha[0].trim()],
		};
	}
	else
	{
		dadosGeral[id].data_exame.push(linha[0].trim());
	}
});

fs.writeFileSync(path.join('dados','geral_processado.json'),JSON.stringify(dadosGeral,null,2),{encoding:'utf8'})

console.log(fileGeral.length,Object.keys(dadosGeral).length);