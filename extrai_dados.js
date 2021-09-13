const ExtraiDadosPdf = require('./src/ExtraiDadosPdf');
const path = require('path');
const fs = require('fs');
const Helpers = require('./src/Helpers');

const extrator = new ExtraiDadosPdf();

// Função que irá extrair os dados de hormônios e hemograma a partir de uma pasta de entrada
const extraiPastaHormonios = function(subdiretorio)
{
	console.log("Extraindo pasta '"+subdiretorio+"'");
	extrator.processaDiretorio(`${subdiretorio}`,
	// Monta a lógica para filtrar somente os dados necessários
	(paginas) =>
	{
		let dados = {};
		
		for (let i in paginas[0])
		{
			let campo = paginas[0][i];
			if (campo[0].indexOf('Paciente.') === 0)
			{
				dados['nome'] = campo[1].trim();
			}
			else if (campo[0].indexOf('DN.') === 0)
			{
				dados['data_nasc'] = campo[1].trim();
				dados['data_nasc'] = Helpers.str2date(dados['data_nasc']);
			}
			else if (campo[0].indexOf('Sexo.') === 0)
			{
				dados['sexo'] = campo[1].trim();
			}
			else if (campo[2] !== undefined && campo[2].indexOf('CPF') === 0)
			{
				dados['cpf'] = campo[1].trim();
			}
			else if (campo[0].indexOf('Data/Hora Cadastro.') === 0)
			{
				dados['data_cadastro'] = campo[1].trim();
				dados['data_cadastro'] = dados['data_cadastro'].replace(' - ',' ');
				dados['data_cadastro'] = Helpers.str2date(dados['data_cadastro']);
			}
		}
		
		const filtros = {
			//	TSH (HORMÔNIO ESTIMULANTE DA TIREOIDE)
			'TSH': {
				reg: /:([^μUI]+)/,
				query: "TSH",
			},
			//	T3 (TRIIODOTIRONINA)
			'T3': {
				reg: /:([^ng\/]+)/,
				query: "T3 ",
			},
			//	T3L (TRIIODOTIRONINA LIVRE)
			'T3L': {
				reg: /:([^pg\/mL]+)/,
				query: "T3L ",
			},
			//	T4 (TIROXINA)
			'T4': {
				reg: /:([^μg\/dL]+)/,
				query: "T4 ",
			},
			//	T4L (TIROXINA LIVRE)
			'T4L': {
				reg: /:([^ng\/dL]+)/,
				query: "T4L ",
			},
			//	CÁLCIO SÉRICO
			'calcio_serico': {
				reg: /:([^mg\/dL]+)/,
				query: "CÁLCIO SÉRICO.",
			},
			//	VITAMINA D (25 HIDROXI-VIT D)
			'vitamina_d': {
				reg: /:([^ng\/mL]+)/,
				query: "VITAMINA D ",
			},
			//	CÁLCIO IONIZADO
			'calcio_ionizado': {
				reg: /:([^mmol\/L]+)/,
				query: "CÁLCIO IONIZADO.",
			},
			//	FÓSFORO
			'fosforo': {
				reg: /:([^mg\/dL]+)/,
				query: "FÓSFORO",
			},
			//	PARATORMÔNIO MOLÉCULA INTACTA (PTH)
			'fosforo': {
				reg: /:([^mg\/dL]+)/,
				query: "FÓSFORO",
			},
			//	FOSFATASE ALCALINA
			'fosfatase': {
				reg: /:([^U\/L]+)/,
				query: "FOSFATASE ALCALINA",
				exception: "FOSFATASE ALCALINA FRAÇÃO ÓSSEA",
			},
			//	ALT - ALANINA AMINOTRANSFERASE (TGP)
			'alt_tgp': {
				reg: /:([^U\/L]+)/,
				query: "ALT - ALANINA",
			},
			//	AST- ASPARTATO AMINOTRANSFERASE(TGO)
			'ast_tgo': {
				reg: /:([^U\/L]+)/,
				query: "AST- ASPARTATO",
			},
			//	ALBUMINA
			'albumina': {
				reg: /:([^g\/dL]+)/,
				query: "ALBUMINA",
			},
			//	CREATININA
			'creatinina': {
				reg: /:([^mg\/dL]+)/,
				query: "CREATININA.",
			},
		}
		
		paginas.forEach((pagina,i) =>
		{
			for (let j in pagina)
			{
				let bloco = pagina[j].join('');
				
				for (let index in filtros)
				{
					let filtro = filtros[index];
					if (bloco.indexOf(filtro.query) === 0)
					{
						if (filtro.exception !== undefined)
						{
							if (bloco.indexOf(filtro.exception) === 0) continue;
						}
						let str = filtro.reg.exec(bloco);
						if (str === null || str == undefined || str[1] === undefined)
						{
							console.error("Erro no processamento",dados.nome, bloco, str);
							break;
						}
						/*
						if(index == 'T4')
						{
							console.log(dados.nome,str);
						}
						// */
						str = str[1].trim();
						dados[index] = str;
					}
				}
			}

		})
		
		return dados;
	}).then(dados =>
	{
		console.log('Salvando arquivos...');
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
					
					if (linhaDados1[0].indexOf('RESULTADOS') === 0 || linhaDados1[0].indexOf('AVALIAÇÃO') === 0)
					{
						return;
					} 
					if (linhaDados2[0].indexOf('RESULTADOS') === 0 || linhaDados2[0].indexOf('AVALIAÇÃO') === 0) linhaDados2 = undefined;
					
					let regioes = {};
					regioes[linhaDados1[0]] = linhaDados1;
					if (linhaDados2 !== undefined) regioes[linhaDados2[0]] = linhaDados2;
					
					if (dados['OSSOS'] === undefined) dados['OSSOS'] = {};
					
					dados['OSSOS'][local] = {};
					
					for (let i in regioes)
					{
						let regiao = regioes[i];
						if (regiao.length < 6)
						{
							console.log(dados.id,dados.nome,regiao, linhaDados1, linhaDados2);
							console.log(bloco);
							//throw new Error('Fechou');
							return;
						}
						dados['OSSOS'][local][regiao[0]] = {
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
		let saida = "";
		
		// CABEÇALHO
		saida += `Data do Exame;ID;Nome;Data de Nascimento;Altura;Peso;`;
		for (let i = 0; i < 5; i++)
		{
			saida += `Osso;Região;BMC;Adulto Jovem;Adulto Jovem T-score;Comp. Idade;Comp. Idade Z-score;BMD;`;
		}
		saida += "\n";
		
		for (let i in dados)
		{
			let linha = dados[i];
			saida += (linha['data_exame']).toLocaleDateString()+";";
			saida += linha['id']+";";
			saida += linha['nome']+";";
			saida += (linha['data_nasc']).toLocaleDateString()+";";
			saida += linha['altura']+";";
			saida += linha['peso']+";";
			
			for (let osso in linha['OSSOS'])
			{
				let detalhes = linha['OSSOS'][osso];
				for (let regiao in detalhes)
				{
					saida += osso+";";
					saida += regiao+";";
					saida += detalhes[regiao]['bmc']+";";
					saida += detalhes[regiao]['adulto_jovem_p']+";";
					saida += detalhes[regiao]['adulto_jovem_tscore']+";";
					saida += detalhes[regiao]['comp_idade_p']+";";
					saida += detalhes[regiao]['comp_idade_zscore']+";";
					saida += detalhes[regiao]['bmd']+";";
				}
			}
			
			saida += "\n";
		}
		
		let filenameSaida = subdiretorio.split(/(\\|\/)/g).pop();
		
		console.log("Tamanho da saída:", saida.length);
		console.log('Arquivo de saída: ',path.join(__dirname,'saidas',`${filenameSaida}.csv`))
		
		fs.writeFileSync(path.join(__dirname,'saidas',`${filenameSaida}.csv`),saida,{encoding:'latin1'})
		fs.writeFileSync(path.join(__dirname,'saidas',`${filenameSaida}.json`),JSON.stringify(dados,null,2),{encoding:'utf-8'})
	})
	.catch(e => console.error(e));
}

// Processa as pastas necessárias
//extraiPastaHormonios('entradas/teste');
extraiPastaHormonios('entradas/hormonios');
//extraiPastaDensitometria('entradas/densitometria');
