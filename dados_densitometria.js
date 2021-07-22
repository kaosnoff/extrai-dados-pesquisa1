const fs = require('fs');
const path = require('path');

let fileDensitometria = fs.readFileSync(path.join('dados','densitometria.txt'),{encoding:'utf8'});

fileDensitometria = fileDensitometria.split("\r\n");

let dadosDensitometria = {};

fileDensitometria.forEach((row,index) =>
{
	if (index === 0) return;
	let linha = row.split(';');
	
	let id = linha[0].trim();
	id = Number(id);
	if (dadosDensitometria[id] === undefined)
	{
		dadosDensitometria[id] = {
			nome: linha[1].trim(),
			data_nasc: linha[2].trim(),
			data_exame: [linha[3].trim()],
		};
	}
	else
	{
		dadosDensitometria[id].data_exame.push(linha[3].trim());
	}
});

fs.writeFileSync(path.join('dados','densitometria_processado.json'),JSON.stringify(dadosDensitometria,null,2),{encoding:'utf8'})

console.log(fileDensitometria.length,Object.keys(dadosDensitometria).length);