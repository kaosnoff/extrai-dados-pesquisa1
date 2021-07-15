const fs = require('fs');
const pdfreader = require("pdfreader");
const path = require('path');

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

PDF2Array(path.join('single','Relatorio2014.pdf')).then(pdfArray =>
{
	let saida = "Data cadastro; Nome; Data nascimento\n";
	let rows = [];
	pdfArray.forEach((page,p) =>
	{
		for (let i = 4; i < page.length; i++)
		{
			let row = page[i];
			if (row[0].indexOf('Página ') !== 0)
			{
				rows.push(row);
			}
			//saida += `${row[1]}; ${row[2]}; ${row[0]}\n`;
		}
	});
	
	rows.forEach((row,i) =>
	{
		if (i % 2 !== 0) return;
		saida += `${row[1]}; ${row[2]}; ${row[0]}\n`;
	})
	//console.log(JSON.stringify(pdfArray,null,2));
	/*
	for (let p in obj)
	{
		let page = obj[p];
		console.log(i, row);
	}
	// */
	//console.log(Object.keys(rows));
	//console.log(rows);
	//fs.writeFileSync("teste.txt",JSON.stringify(rows,null,2));
	fs.writeFileSync(path.join("saidas","relatorio2014.csv"),saida,{encoding: 'latin1'});
});