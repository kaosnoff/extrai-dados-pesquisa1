const fs = require('fs');
const pdfreader = require("pdfreader");
const path = require('path');

let dadosPaciente = async (pdfFile) =>
{
	return new Promise((resolve, reject) =>
	{
		var rows = {};
		
		const getRows = () =>
		{
			let saida = [];
			Object.keys(rows)
			.sort((y1,y2) => parseFloat(y1) - parseFloat(y2))
			.forEach((y) => 
			{
				saida.push(rows[y]);
			});
			return saida;
		}
		
		const pegaDados = (rows) =>
		{
			if (!rows) return;
			let linhaNome = rows[4];
			let linhaDados = rows[5];
			let linhaDados2 = rows[7];
			let dados = {
				nome: '',
				id: '',
				dataNasc: '',
				dataExame: '',
				file: ''
			}
			
			if (linhaNome && linhaNome instanceof Array)
			{
				linhaNome.shift();
				linhaNome = linhaNome.join(' ');
				dados.nome = linhaNome;
			}
			if (linhaDados && linhaDados instanceof Array)
			{
				let ID = linhaDados[0];
				let dataNasc = linhaDados[1];
				dados.id = ID;
				dados.dataNasc = dataNasc;
			}
			if (linhaDados2 && linhaDados2 instanceof Array)
			{
				dados.dataExame = linhaDados2[1];
			}
			
			return dados;
		}
		
		return new pdfreader.PdfReader().parseFileItems(
			"pdf/" + pdfFile,
			(err,item) =>
			{
				if (!item || item.page)
				{
					let dados = pegaDados(getRows());
					// end of file, or page
					if (dados.id)
					{
						dados.file = pdfFile
						resolve(dados);
					}
					rows = {}; //Clear rows for next page
					if (item)
					{
						//console.log('Page:',item.page);
					}
				}
				else if (item.text)
				{
					// accumulate text items into rows object, per line
					(rows[item.y] = rows[item.y] || []).push(item.text);
				}
			}
		)
	});
}

let dir = fs.readdirSync('pdf',{encoding:'utf-8'});
let promises = [];
dir.forEach(file =>
{
	if (file === 'empty') return;
	
	promises.push(dadosPaciente(file));
});

Promise.all(promises).then(valores =>
{
	let saida = "ID;NOME;DATA_NASC;DATA_EXAME\n";
	valores.forEach(linha =>
	{
		saida += linha.id + ";" + linha.nome + ";" + linha.dataNasc + ";" + linha.dataExame + "\n";
	});
	fs.writeFileSync(path.join("saidas","dados.txt"),saida);
	console.log('Dados salvos em "dados.txt"!');
});

/**
 * Campos necessários:
Nome, ID do paciente e Data de Nascimento
 */