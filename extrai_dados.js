const ExtraiDadosPdf = require('./src/ExtraiDadosPdf');
const path = require('path');
const fs = require('fs');
const Helpers = require('./src/Helpers');

const extrator = new ExtraiDadosPdf();

let dir = fs.readdirSync(path.join('entradas','teste'));
console.log(dir);
/*
let file = extrator.extraiArquivo('entradas/hormonios/ALDENORA ROCHA DOS SANTOS CAMPOS8.pdf');
file.then(dados =>
{
	//console.log(dados);
	fs.writeFileSync(path.join(__dirname,'saidas','temp.txt'),JSON.stringify(dados,null,2),{encoding:'utf-8'});
})
.catch(e =>
{
	console.error(e);
});
// */
/*
extrator.processaDiretorio('entradas/teste',(paginas) =>
{
	let dados = {};
	
	for (let i in paginas[0])
	{
		let campo = paginas[0][i];
		if (campo[0].indexOf('Paciente') === 0)
		{
			dados['nome'] = campo[1].trim();
		}
		else if (campo[0].indexOf('DN.') === 0)
		{
			dados['data_nasc'] = campo[1].trim();
			dados['data_nasc'] = Helpers.str2date(dados['data_nasc']);
		}
		else if (campo[0].indexOf('Sexo') === 0)
		{
			dados['sexo'] = campo[1].trim();
		}
		else if (campo[2] !== undefined && campo[2].indexOf('CPF') === 0)
		{
			dados['cpf'] = campo[1].trim();
		}
		else if (campo[0].indexOf('Data/Hora Cadastro') === 0)
		{
			dados['data_cadastro'] = campo[1].trim();
			dados['data_cadastro'] = dados['data_cadastro'].replace(' - ',' ');
			dados['data_cadastro'] = Helpers.str2date(dados['data_cadastro']);
		}
	}
	
	paginas.forEach((pagina,i) =>
	{
		for (let j in pagina)
		{
			let bloco = pagina[j];
			//	TSH (HORMÔNIO ESTIMULANTE DA TIREOIDE)
			if (bloco[0].indexOf('TSH') === 0)
			{
				let str = bloco[2];
				str = str.split(' ');
				str = str[1].trim();
				//str = str.replace(',','.');
				//str = Number(str);
				dados['TSH'] = str;
			}
			//	T3 (TRIIODOTIRONINA)
			if (bloco[0].indexOf('T3 ') === 0)
			{
				console.log(bloco)
				//let str = bloco[2];
				//str = str.split(' ');
				//str = str[1].trim();
				//str = str.replace(',','.');
				//str = Number(str);
				//dados['T3'] = str;
			}
			//	T3L (TRIIODOTIRONINA LIVRE)
			//	T4 (TIROXINA)
			//	T4L (TIROXINA LIVRE)
			//	CÁLCIO SÉRICO
			//	VITAMINA D (25 HIDROXI-VIT D)
			//	CÁLCIO IONIZADO
			//	FÓSFORO
			//	PARATORMÔNIO MOLÉCULA INTACTA (PTH)
			//	FOSFATASE ALCALINA
			//	ALT - ALANINA AMINOTRANSFERASE (TGP)
			//	AST- ASPARTATO AMINOTRANSFERASE(TGO)
			//	ALBUMINA
			//	CREATININA
		}

	})
	
	return dados;
	//console.log(paginas);
}).then(dados =>
{
	//console.log(dados);
}).catch(e => console.error(e));
// */