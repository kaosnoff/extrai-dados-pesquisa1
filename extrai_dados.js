const ExtraiDadosPdf = require('./src/ExtraiDadosPdf');
const path = require('path');
const fs = require('fs');
const Helpers = require('./src/Helpers');

const extrator = new ExtraiDadosPdf();

// Função que irá extrair os dados de hormônios e hemograma a partir de uma pasta de entrada
const extraiPastaHormonios = function(subdiretorio)
{
	extrator.processaDiretorio(`${subdiretorio}`,
	// Monta a lógica para filtrar somente os dados necessários
	(paginas) =>
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
				let bloco = pagina[j].join('');
				//	TSH (HORMÔNIO ESTIMULANTE DA TIREOIDE)
				if (bloco.indexOf('TSH') === 0)
				{
					let reg = /:([^μUI]+)/;
					let str = reg.exec(bloco);
					str = str[1].trim();
					dados['TSH'] = str;
				}
				//	T3 (TRIIODOTIRONINA)
				if (bloco.indexOf('T3 ') === 0)
				{
					let reg = /:([^ng\/]+)/;
					let str = reg.exec(bloco);
					str = str[1].trim();
					dados['T3'] = str;
				}
				//	T3L (TRIIODOTIRONINA LIVRE)
				if (bloco.indexOf('T3L ') === 0)
				{
					let reg = /:([^pg\/]+)/;
					let str = reg.exec(bloco);
					str = str[1].trim();
					dados['T3L'] = str;
				}
				//	T4 (TIROXINA)
				if (bloco.indexOf('T4 ') === 0)
				{
					let reg = /:([^ng\/dL]+)/;
					let str = reg.exec(bloco);
					str = str[1].trim();
					dados['T4'] = str;
				}
				//	T4L (TIROXINA LIVRE)
				if (bloco.indexOf('T4L ') === 0)
				{
					let reg = /:([^ng\/dL]+)/;
					let str = reg.exec(bloco);
					str = str[1].trim();
					dados['T4L'] = str;
				}
				//	CÁLCIO SÉRICO
				if (bloco.indexOf('CÁLCIO SÉRICO.') === 0)
				{
					let reg = /:([^mg\/dL]+)/;
					let str = reg.exec(bloco);
					str = str[1].trim();
					dados['calcio_serico'] = str;
				}
				//	VITAMINA D (25 HIDROXI-VIT D)
				if (bloco.indexOf('VITAMINA D ') === 0)
				{
					let reg = /:([^ng\/mL]+)/;
					let str = reg.exec(bloco);
					str = str[1].trim();
					dados['vitamina_d'] = str;
				}
				//	CÁLCIO IONIZADO
				if (bloco.indexOf('CÁLCIO IONIZADO.') === 0)
				{
					let reg = /:([^mmol\/L]+)/;
					let str = reg.exec(bloco);
					str = str[1].trim();
					dados['calcio_ionizado'] = str;
				}
				//	FÓSFORO
				if (bloco.indexOf('FÓSFORO') === 0)
				{
					let reg = /:([^mg\/dL]+)/;
					let str = reg.exec(bloco);
					str = str[1].trim();
					dados['fosforo'] = str;
				}
				//	PARATORMÔNIO MOLÉCULA INTACTA (PTH)
				if (bloco.indexOf('PARATORMÔNIO MOLÉCULA INTACTA') === 0)
				{
					let reg = /:([^pg\/mL]+)/;
					let str = reg.exec(bloco);
					str = str[1].trim();
					dados['paratormonio'] = str;
				}
				//	FOSFATASE ALCALINA
				if (bloco.indexOf('FOSFATASE ALCALINA') === 0)
				{
					if (bloco.indexOf('FOSFATASE ALCALINA FRAÇÃO ÓSSEA') === 0) return;
					let reg = /:([^U\/L]+)/;
					let str = reg.exec(bloco);
					str = str[1].trim();
					dados['fosfatase'] = str;
				}
				//	ALT - ALANINA AMINOTRANSFERASE (TGP)
				if (bloco.indexOf('ALT - ALANINA') === 0)
				{
					let reg = /:([^U\/L]+)/;
					let str = reg.exec(bloco);
					str = str[1].trim();
					dados['alt_tgp'] = str;
				}
				//	AST- ASPARTATO AMINOTRANSFERASE(TGO)
				if (bloco.indexOf('AST- ASPARTATO') === 0)
				{
					let reg = /:([^U\/L]+)/;
					let str = reg.exec(bloco);
					str = str[1].trim();
					dados['ast_tgo'] = str;
				}
				//	ALBUMINA
				if (bloco.indexOf('ALBUMINA') === 0)
				{
					let reg = /:([^g\/dL]+)/;
					let str = reg.exec(bloco);
					str = str[1].trim();
					dados['albumina'] = str;
				}
				//	CREATININA
				if (bloco[0].indexOf('CREATININA.') === 0)
				{
					let reg = /:([^mg\/dL]+)/;
					let str = reg.exec(bloco);
					str = str[1].trim();
					dados['creatinina'] = str;
				}
			}

		})
		
		return dados;
	}).then(dados =>
	{
		//console.log(dados);
		let locale = 'pt-BR';
		let saida = "";
		
		// CABEÇALHO
		saida += `Data/Hora Cadastro;Nome;DN;TSH (HORMÔNIO ESTIMULANTE DA TIREOIDE);T3 (TRIIODOTIRONINA);T3L (TRIIODOTIRONINA LIVRE);T4 (TIROXINA);T4L (TIROXINA LIVRE);CÁLCIO SÉRICO;VITAMINA D (25 HIDROXI-VIT D);CÁLCIO IONIZADO;FÓSFORO;PARATORMÔNIO MOLÉCULA INTACTA (PTH);FOSFATASE ALCALINA;ALT - ALANINA AMINOTRANSFERASE (TGP);AST- ASPARTATO AMINOTRANSFERASE(TGO);ALBUMINA;CREATININA;\n`;
		
		// Linha a linha
		dados.forEach((entrada,i) =>
		{
			let dtCadastro = new Date(entrada['data_cadastro']);
			let dtNascimento = new Date(entrada['data_nasc']);
			saida += dtCadastro.toLocaleDateString(locale)+' '+dtCadastro.toLocaleTimeString(locale)+';';
			saida += entrada['nome']+';';
			saida += dtNascimento.toLocaleDateString(locale)+';';
			let indices = [
				'TSH',
				'T3',
				'T3L',
				'T4',
				'T4L',
				'calcio_serico',
				'vitamina_d',
				'calcio_ionizado',
				'fosforo',
				'paratormonio',
				'fosfatase',
				'alt_tgp',
				'ast_tgo',
				'albumina',
				'creatinina',
			];
			indices.forEach(indice =>
			{
				saida += (entrada[indice] ? entrada[indice] : '')+';';
			})
			saida += "\n";
		});
		
		let filenameSaida = subdiretorio.split(/(\\|\/)/g).pop();
		
		fs.writeFileSync(path.join(__dirname,'saidas',`${filenameSaida}.csv`),saida,{encoding:'latin1'})
		fs.writeFileSync(path.join(__dirname,'saidas',`${filenameSaida}.json`),JSON.stringify(dados,null,2),{encoding:'utf-8'})
	}).catch(e => console.error(e));
}

const extraiPastaDensitometria = function(subdiretorio)
{
	extrator.processaDiretorio(subdiretorio,
	(paginas) =>
	{
		let dados = {};
		
		let indicesP0 = Object.keys(paginas[0]);
		
		for (let j in indicesP0)
		{
			let i = indicesP0[j];
			let campo = paginas[0][i].join(' ');
			
			if (campo.indexOf('Nome:') === 0)
			{
				dados['nome'] = campo.replace(/Nome:/,'').trim();
				
				let outros = paginas[0][indicesP0[Number(j)+1]];
				dados['id'] = outros[0];
				dados['altura'] = outros[2].split(' ')[0];
				dados['data_nasc'] = Helpers.str2date(outros[1]);
			}
			else if(campo.indexOf('Sexo:') === 0)
			{
				let outros = paginas[0][indicesP0[(Number(j)-1)]];
				dados['sexo'] = outros[0];
				dados['data_exame'] = Helpers.str2date(outros[1]);
				dados['peso'] = outros[2].split(' ')[0];
				//console.log(campo);
			}
			//let reg = /:([^ng\/dL]+)/;
			//console.log(campo);
		}
		
		paginas.forEach((pagina,p) =>
		{
			let indices = Object.keys(pagina);
			indices.forEach((y,i) =>
			{
				let bloco = pagina[y];
				if (bloco[0].indexOf('RESULTADOS D') === 0)
				{
					let local = (/(RESULTADOS D[OA])([^:]+)/g).exec(bloco[0])[2].trim();
					
					let linhaDados1 = pagina[indices[Number(i)+3]];
					let linhaDados2 = pagina[indices[Number(i)+4]];
					
					if (linhaDados2[0].indexOf('RESULTADOS ') === 0 || linhaDados2[0].indexOf('AVALIAÇÃO') === 0) linhaDados2 = undefined;
					
					let regioes = {};
					regioes[linhaDados1[0]] = linhaDados1;
					if (linhaDados2 !== undefined) regioes[linhaDados2[0]] = linhaDados2;
					
					dados[local] = {};
					
					for (let i in regioes)
					{
						let regiao = regioes[i];
						dados[local][regiao[0]] = {
							"bmc": 									regiao[1].split(' ')[0].trim(),
							"adulto_jovem_p": 			regiao[2].split('%')[0].trim(),
							"adulto_jovem_tscore": 	regiao[3].split(' ')[0].trim(),
							"comp_idade_p": 				regiao[4].split('%')[0].trim(),
							"comp_idade_zscore": 		regiao[5].split(' ')[0].trim(),
							"bmd": 									regiao[6].split(' ')[0].trim(),
						}
						if (regiao[1] === undefined)
						{
							console.log(regiao);
						}
					}
					
					//console.log(local, regioes);
					
				}
			});
		});
		
		return dados;
	})
	.then(dados =>
	{
		//console.log(dados);
		
		let filenameSaida = subdiretorio.split(/(\\|\/)/g).pop();
		
		fs.writeFileSync(path.join(__dirname,'saidas',`${filenameSaida}.json`),JSON.stringify(dados,null,2),{encoding:'utf-8'})
	})
	.catch(e => console.error(e));
}

// Processa as pastas necessárias
//extraiPastaHormonios('entradas/hormonios');
//extraiPastaHormonios('entradas/hemograma');
extraiPastaDensitometria('entradas/teste');
