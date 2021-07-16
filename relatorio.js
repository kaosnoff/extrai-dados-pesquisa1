const fs = require('fs');
const pdfreader = require("pdfreader");
const path = require('path');

// Ano
const ano = '2018';

// Arquivo de entrada
const arqEntrada = path.join('single',`Relatório ${ano}.pdf`);

// Arquivo de saida
const arqSaida = path.join('saidas',`relatorio${ano}.csv`);

// Transforma o arquivo em um objeto
const PDF2Object = async (fileName) =>
{
	return new Promise((resolve, reject) =>
	{
		let rows = [];
		console.log('#### Início do processamento ###');
		let page = -1;
		return (new pdfreader.PdfReader()).parseFileItems(
			fileName,
			(err,item) =>
			{
				if (!item)
				{
					//console.log(rows);
					console.log('#### FINAL DO ARQUIVO ###');
					resolve(rows);
					return;
				}
				else if (item.page)
				{
					console.log('Processada página '+item.page);
					rows[++page] = [];
				}
				if (item.text)
				{
					//saida.push(item.text);
					if (!rows[page][item.y]) rows[page][item.y] = [];
					rows[page][item.y].push(item.text);
				}
			}
		);
	})
}

// Transforma o arquivo em um array de linhas
const PDF2Array = async (fileName) =>
{
	return new Promise(async (resolve, reject) =>
	{
		let pdfObj = await PDF2Object(fileName);
		let pdfArray = [];
		for (let p in pdfObj)
		{
			pdfArray[p] = [];
			let page = pdfObj[p];
			let keys = Object.keys(page);
			
			// Ordena as linhas
			keys.sort((a,b) =>
			{
				a = Number(a);
				b = Number(b);
				if (a > b) return 1;
				if (a < b) return -1;
				return 0;
			});
			
			for (let i of keys)
			{
				let row = page[i];
				pdfArray[p].push(row);
			}
			// */
		}
		resolve(pdfArray);
	})
}

// Processa o arquivo
PDF2Array(arqEntrada).then(pdfArray =>
{
	// Monta o cabeçalho
	let saida = "Data cadastro; Nome; Data nascimento\n";
	let rows = [];
	
	// Ignora as linhas de cabeçalho e rodapé
	pdfArray.forEach((page,p) =>
	{
		for (let i = 4; i < page.length; i++)
		{
			let row = page[i];
			if (row[0].indexOf('Página ') !== 0)
			{
				rows.push(row);
			}
		}
	});
	
	// Monta os dados linha a linha
	rows.forEach((row,i) =>
	{
		// Verifica se o primeiro dado da linha é uma data
		if ((row[0].match(/\//g) || []).length !== 2) return;
		saida += `${row[1]}; ${row[2]}; ${row[0]}\n`;
	})
	
	fs.writeFileSync(arqSaida,saida,{encoding: 'latin1'});
});