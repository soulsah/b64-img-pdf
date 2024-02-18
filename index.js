const express = require('express');
const bodyParser = require('body-parser');
const { fromBase64 } = require('pdf2pic');
const fs = require('fs');
const imgToPDF = require('image-to-pdf');

const app = express();
const port = 3000;

app.use(bodyParser.json({ limit: '50mb' }));

app.post('/', async (req, res) => {
  try {
    const { pdf } = req.body;

    const pdf2picOptions = {
      quality: 200,
      width: 1458,
      height: 1770,
      density: 300,
      savename: 'converted-image',
      savedir: './',
      format: 'png',
    };

    // Converte PDF em imagem
    const images = await fromBase64(pdf, pdf2picOptions).bulk(-1);

    // Cria objeto do PDF
    const pdfConfig = {
      output: './pdfOriginal.pdf',
    };

    // Array das imagens do PDF original
    const pages = images.map((image, index) => `./untitled.${index + 1}.png`);

    // Converte as imagens do PDF original em PDF
    imgToPDF(pages, imgToPDF.sizes.A4)
      .pipe(fs.createWriteStream(pdfConfig.output));

    res.status(200).json({ success: true, msg: 'PDF convertido com sucesso.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Erro ao converter o PDF para imagem ou criar o PDF.' });
  }
});

// Inicie o servidor
app.listen(port, () => {
  console.log(`Servidor iniciado em http://localhost:${port}`);
});
