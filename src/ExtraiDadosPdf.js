const path = require('path');
const fs = require('fs');
const pdfreader = require("pdfreader");

module.exports = class ExtraiDadosPdf
{
	raiz = path.join(__dirname,'..');
	
	constructor()
	{
		//console.log('Classe instanciada', this);
		console.log('PROCESSAMENTO INICIADO');
	}
	
	// Extrai um único arquivo, de forma assíncrona, retornando os dados como um Array[pagina][posY]
	extraiArquivo(pathArquivo)
	{
		return new Promise((resolve, reject) =>
		{
			let filePath = path.join(this.raiz,...pathArquivo.split('/'));
			
			let fileSaida = [];
			let page = 0;
			
			try
			{
				new pdfreader.PdfReader().parseFileItems(
					filePath,
					(err,item) =>
					{
						if (err)
						{
							console.log(err);
							reject(err);
						}
						else if (!item)
						{
							console.log('PROCESSADO - '+filePath);
							let newSaida = [];
							
							fileSaida.forEach((dados,page) =>
							{
								let indices = Object.keys(dados);
								indices = indices.sort((a,b) => Number(a) > Number(b) ? 1 : -1);
								//console.log(page,indices)
								newSaida[page] = {};
								for (let i of indices)
								{
									newSaida[page][Number(i).toFixed(3).toString()] = dados[i];
								}
								//console.log(page, indices);
							})
							
							resolve(newSaida);
						}
						else if (item.page)
						{
							page = item.page - 1;
							fileSaida[page] = {};
						}
						else if (item.text)
						{
							//console.log(item.y,item.text);
							let y = item.y;
							if (fileSaida[page][y] === undefined) fileSaida[page][y] = [];
							fileSaida[page][y].push(item.text);
						}
					}
				);
			}
			catch(e)
			{
				reject({msg: "Arquivo não encontrado",e});
			}
		});
		
	}
	
	// Processa um diretório inteiro, executando para cada arquivo a função 'funcao', que toma como parâmetro um Array[pagina][posY]
	processaDiretorio(pathDir, funcao)
	{
		return new Promise((resolve, reject) =>
		{
			let dir;
			let fullPath = path.join(this.raiz,...pathDir.split('/'));
			let promises = [];
			try
			{
				dir = fs.readdirSync(fullPath);
			}
			catch(e)
			{
				reject({msg: "Diretório não encontrado",e});
			}
			dir.forEach((fileName) =>
			{
				let ext = fileName.split('.').length > 1 ? fileName.split('.').pop() : undefined;
				if (ext != 'pdf') return;
				
				let retorno = new Promise((resolve1,reject1) =>
				{
					this.extraiArquivo(path.join(...pathDir.split('/'),fileName))
					.then(paginas =>
					{
						resolve1(funcao(paginas));
					})
					.catch(e => reject1(e));
				})
				promises.push(retorno);
			});
			Promise.all(promises)
			.then(multidados =>
			{
				resolve(multidados);
			})
			.catch(e => reject(e));
		});
	}
}