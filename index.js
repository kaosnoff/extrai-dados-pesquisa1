const fs = require('fs');
const pdfreader = require("pdfreader");

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
				//console.log(y);
				//console.log((rows[y] || []).join(" "))
				//texto += (rows[y] || []).join(" ") + "\n";
			});
			return saida;
		}
		
		const pegaDados = (rows) =>
		{
			if (!rows) return;
			let linhaNome = rows[4];
			linhaDados = rows[5];
			let dados = {
				nome: '',
				id: '',
				dataNasc: '',
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
			
			//console.log(dados);
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
	promises.push(dadosPaciente(file));
});

Promise.all(promises).then(valores =>
{
	let saida = "ID;DATA_NASC;NOME\n";
	//console.log(valores);
	valores.forEach(linha =>
	{
		saida += linha.id + ";" + linha.dataNasc + ";" + linha.nome + "\n";
	});
	fs.writeFileSync("dados.txt",saida);
	console.log('Dados salvos em "dados.txt"!');
});

//dadosPaciente("2839.pdf").then(dados => console.log(dados));
//dadosPaciente("2848.pdf");

/**
 * Campos necessários:
Nome, ID do paciente e Data de Nascimento
 */