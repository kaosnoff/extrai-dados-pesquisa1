const ExtraiDadosPdf = require('./src/ExtraiDadosPdf');
const path = require('path');
const fs = require('fs');
const Helpers = require('./src/Helpers');

const extrator = new ExtraiDadosPdf();

/*
let dir = fs.readdirSync(path.join('entradas','teste'));
dir.forEach(filename =>
{
	let file = extrator.extraiArquivo('entradas/teste/'+filename);
	file.then(dados =>
	{
		fs.writeFileSync(path.join(__dirname,'saidas',filename.replace('.pdf','.txt')),JSON.stringify(dados,null,2),{encoding: 'utf-8'});
	})
	.catch(e => console.error(e));
});
// */

const extraiPastaHormonios = function(subdiretorio)
{
	extrator.processaDiretorio(`entradas/${subdiretorio}`,(paginas) =>
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
					dados['TSH'] = str;
				}
				//	T3 (TRIIODOTIRONINA)
				if (bloco[0].indexOf('T3 ') === 0)
				{
					let str = bloco[0];
					str = str.split(' ');
					str = str[2].trim();
					dados['T3'] = str;
				}
				//	T3L (TRIIODOTIRONINA LIVRE)
				if (bloco[0].indexOf('T3L ') === 0)
				{
					let str = bloco[2];
					str = str.split(' ');
					str = str[1].trim();
					dados['T3L'] = str;
				}
				//	TODO: T4 (TIROXINA)
				//	T4L (TIROXINA LIVRE)
				if (bloco[0].indexOf('T4L ') === 0)
				{
					let str = bloco[2];
					str = str.split(' ');
					str = str[1].trim();
					dados['T4L'] = str;
				}
				//	CÁLCIO SÉRICO
				if (bloco[0].indexOf('CÁLCIO SÉRICO.') === 0)
				{
					let str = bloco[0];
					str = str.split(/[:(mg)]+/);
					str = str[1].trim();
					dados['calcio_serico'] = str;
				}
				//	VITAMINA D (25 HIDROXI-VIT D)
				if (bloco[0].indexOf('VITAMINA D ') === 0)
				{
					let str = bloco[2];
					str = str.split(/[\s]+/);
					str = str[1].trim();
					dados['vitamina_d'] = str;
				}
				//	CÁLCIO IONIZADO
				if (bloco[0].indexOf('CÁLCIO IONIZADO.') === 0)
				{
					let str = bloco[0];
					str = str.split(/[:]+/);
					str = str[1].trim();
					dados['calcio_ionizado'] = str;
				}
				//	FÓSFORO
				if (bloco[0].indexOf('FÓSFORO') === 0)
				{
					let str = bloco[0];
					str = str.split(/[:(mg)]+/);
					str = str[1].trim();
					dados['fosforo'] = str;
				}
				//	PARATORMÔNIO MOLÉCULA INTACTA (PTH)
				if (bloco[0].indexOf('PARATORMÔNIO MOLÉCULA INTACTA') === 0)
				{
					let str = bloco[2];
					str = str.split(/[:(pg)]+/);
					str = str[1].trim();
					dados['paratormonio'] = str;
				}
				//	FOSFATASE ALCALINA
				if (bloco[0].indexOf('FOSFATASE ALCALINA') === 0 && bloco[0].indexOf('FOSFATASE ALCALINA ') !== 0)
				{
					let str = bloco.length > 2 ? bloco[2] : bloco[0];
					str = str.split(/[:(U)]+/);
					str = bloco.length > 2 ? str[0].trim() : str[1].trim();
					dados['fosfatase'] = str;
				}
				//	ALT - ALANINA AMINOTRANSFERASE (TGP)
				if (bloco[0].indexOf('ALT - ALANINA') === 0)
				{
					let str = bloco[0];
					str = str.split(/[:\s]+/);
					str = str[5].trim();
					dados['alt_tgp'] = str;
				}
				//	AST- ASPARTATO AMINOTRANSFERASE(TGO)
				if (bloco[0].indexOf('AST- ASPARTATO') === 0)
				{
					let str = bloco[0];
					str = str.split(/[:U]+/);
					str = str[1].trim();
					dados['ast_tgo'] = str;
				}
				//	ALBUMINA
				if (bloco[0].indexOf('ALBUMINA') === 0)
				{
					let str = bloco[0];
					str = str.split(/[:g]+/);
					str = str[1].trim();
					dados['albumina'] = str;
				}
				//	CREATININA
				if (bloco[0].indexOf('CREATININA.') === 0)
				{
					let str = bloco[0];
					str = str.split(/[:(mg)]+/);
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
		
		fs.writeFileSync(path.join(__dirname,'saidas',`${subdiretorio}.csv`),saida,{encoding:'utf-8'})
	}).catch(e => console.error(e));
}

extraiPastaHormonios('hormonios');
//extraiPastaHormonios('hemograma');
// */