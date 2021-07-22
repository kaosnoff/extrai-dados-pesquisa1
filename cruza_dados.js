const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
var stringSimilarity = require("string-similarity");

let fileTireoide = fs.readFileSync(path.join('dados','geral_processado.json'),{encoding:'utf8'});
let fileDensitometria = fs.readFileSync(path.join('dados','densitometria_processado.json'),{encoding:'utf8'});

let dadosTireoide = JSON.parse(fileTireoide);
let dadosDensitometria = JSON.parse(fileDensitometria);

const getHash = (str) =>
{
	return crypto.createHash('sha1').update(str).digest('hex');
}

const pegaDataArray = (arrDatas,tipo) =>
{
	let final = undefined;
	if (!(arrDatas instanceof Array))
	{
		arrDatas = [];
		console.log('erro',arrDatas);
	}
	//console.log(arrDatas);
	for (let data of arrDatas)
	{
		try
		{
			data = data.replace(' ','/');
			let d = data.split('/');
			let dt = new Date(d[2],d[1]-1,d[0]);
			
			if (d.length < 3) continue;
			
			if (final === undefined) final = dt;
			if (tipo == 'max')
			{
				if (final.getTime() < dt.getTime()) final = dt;
			}
			else
			{
				if (final.getTime() > dt.getTime()) final = dt;
			}
		}
		catch(error)
		{
			console.log(data,typeof(data),error);
		}
	}
	
	if (final === undefined) final = (tipo == 'max') ? (new Date(0)) : (new Date());
	
	return final;
}

let dados = {};
let dadosSobrando = [];
let habilitados = [];
let naoHabilitados = [];
let nomes = {};

let maxNumeroDatasTireoide = 0;
for (let id in dadosTireoide)
{
	let paciente = dadosTireoide[id];
	//nomesTireoide.push(paciente.nome);
	
	maxNumeroDatasTireoide = Math.max(maxNumeroDatasTireoide, paciente.data_exame.length);
}

let nomesDensitometria = [];
let maxNumberoDatasDensitometria = 0;
for (let id in dadosDensitometria)
{
	let paciente = dadosDensitometria[id];
	nomesDensitometria.push(paciente.nome);
	let hash = getHash(paciente.nome);
	
	dados[hash] = {
		id: id,
		nome: paciente.nome,
		data_nasc: paciente.data_nasc,
		datas_exame_densitometria: paciente.data_exame,
		datas_exame_tireoide: [],
		habilitado: false
	}
	
	maxNumberoDatasDensitometria = Math.max(maxNumberoDatasDensitometria,paciente.data_exame.length);
	
	if (dadosTireoide[hash] !== undefined)
	{
		dados[hash].datas_exame_tireoide = dadosTireoide[hash].data_exame;
		
		delete(dadosTireoide[hash])
	}
}

let conta = 0;
let total = Object.keys(dadosTireoide).length
for (let id in dadosTireoide)
{
	conta++;
	if ((conta % 10) === 0) console.log(Math.round(((conta)/total)*10000)/100 + '%');
	//if ((conta/total) > 0.01) break;
	let pacienteT = dadosTireoide[id];
	
	if (dados[id] !== undefined) continue;
	
	let bestMatch = stringSimilarity.findBestMatch(pacienteT.nome,nomesDensitometria);
	let onlyMatch = bestMatch.ratings[bestMatch.bestMatchIndex];
	if (onlyMatch.rating > 0.7)
	{
		let hash = getHash(onlyMatch.target);
		if (pacienteT.data_nasc != dados[hash].data_nasc) continue;
		
		dados[hash].datas_exame_tireoide.push(...pacienteT.data_exame);
		nomes[pacienteT.nome] = onlyMatch;
		delete(dadosTireoide[hash]);
		//console.log(pacienteT.nome, pacienteT.data_nasc, onlyMatch.target, dados[hash].data_nasc);
	}
	
}
// */

for (let id in dados)
{
	let paciente = dados[id];
	
	let dataMaxDensitometria = pegaDataArray(paciente.datas_exame_densitometria,'max');
	let dataMinTireoide = pegaDataArray(paciente.datas_exame_tireoide,'min');
	
	if (dataMaxDensitometria.getTime() >= dataMinTireoide.getTime())
	{
		dados[id].habilitado = true;
		habilitados.push(dados[id]);
	}
	else
	{
		naoHabilitados.push(dados[id]);
	}
}

for (let id in dadosTireoide)
{
	let pacienteT = dadosTireoide[id];
	dados[id] = {
		id: null,
		nome: pacienteT.nome,
		data_nasc: pacienteT.data_nasc,
		datas_exame_densitometria: [],
		datas_exame_tireoide: pacienteT.data_exame,
		habilitado: false
	}
}

let tempNomes = Object.keys(nomes);
tempNomes.sort((a,b) =>
{
	return a.localeCompare(b);
});

let newNomes = {};
for (let nome of tempNomes)
{
	newNomes[nome] = nomes[nome];
}

let saidaOrganizada = "";

let numerosDensitometria = [];
for (let i = 0; i < maxNumberoDatasDensitometria; i++)
{
	numerosDensitometria.push('DT Dens '+i);
}
let numerosTireoide = [];
for (let i = 0; i < maxNumeroDatasTireoide; i++)
{
	numerosTireoide.push('DT Tir '+i);
}
saidaOrganizada += "ID;Habilitado;Nome Densitometria;Data Nasc;"+numerosDensitometria.join(';');
saidaOrganizada += ";Nome Tireóide;Data Nasc;"+numerosTireoide.join(';');
saidaOrganizada += "\n";

for (let id in dados)
{
	let dado = dados[id];
	
	saidaOrganizada += dado.id + ";";
	saidaOrganizada += dado.habilitado + ";";
	saidaOrganizada += (dado.datas_exame_densitometria.length > 0 ? dado.nome : "") + ";";
	saidaOrganizada += (dado.datas_exame_densitometria.length > 0 ? dado.data_nasc : "") + ";";
	for (let i = 0; i < maxNumberoDatasDensitometria; i++)
	{
		saidaOrganizada += (dado.datas_exame_densitometria[i] !== undefined ? dado.datas_exame_densitometria[i] : "") + ";";
	}
	
	saidaOrganizada += (dado.datas_exame_tireoide.length > 0 ? dado.nome : "") + ";";
	saidaOrganizada += (dado.datas_exame_tireoide.length > 0 ? dado.data_nasc : "") + ";";
	
	for (let i = 0; i < maxNumeroDatasTireoide; i++)
	{
		saidaOrganizada += (dado.datas_exame_tireoide[i] !== undefined ? dado.datas_exame_tireoide[i] : "");
		saidaOrganizada += (i < (maxNumeroDatasTireoide - 1)) ? ";" : "";
	}
	
	saidaOrganizada += "\n";
}

fs.writeFileSync(path.join('dados','dados.json'),JSON.stringify(dados,null,2),{encoding:'utf8'});
fs.writeFileSync(path.join('dados','nomes.json'),JSON.stringify(newNomes,null,2),{encoding:'utf8'});
fs.writeFileSync(path.join('dados','saida.txt'),saidaOrganizada,{encoding:'utf8'});


//console.log(maxDatasDensitometria, maxDatasTireoide, dadosSobrando.length);
console.log(
	'Habilitados: ' + habilitados.length + "\n" + 
	"Não habilitados: " + naoHabilitados.length + "\n" + 
	"Dados sobrando:" + Object.keys(dadosTireoide).length + "\n" + 
	"Dados Densitometria:" + Object.keys(dadosDensitometria).length + "\n" + 
	"Dados Total:" + Object.keys(dados).length + "\n"
);

// Data de densitometria posterior à data de tireóide