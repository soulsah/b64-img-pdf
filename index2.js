const express = require('express');
const bodyParser = require('body-parser');
const { fromBase64 } = require('pdf2pic');
const fs = require('fs');

const app = express();
const port = 3000;

// Configurar o body-parser para lidar com JSON
app.use(bodyParser.json({ limit: '50mb' }));

// Rota para converter o PDF para imagem
app.post('/', async (req, res) => {
  try {
    const { pdf } = req.body;

    // Crie um diretório temporário para armazenar as imagens
    const outputDir = './';
    const pdf2picOptions = {
      quality: 100,
      width: 729,
      height: 885,
      density: 300,
      savename: 'converted-image',
      savedir: outputDir,
      format: 'png',
    };

    const images = await fromBase64(pdf, pdf2picOptions).bulk(-1);

    // Envie o caminho da imagem convertida como resposta
    res.json({ success: true, imagePath: images[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Erro ao converter o PDF para imagem.' });
  }
});

// Inicie o servidor
app.listen(port, () => {
  console.log(`Servidor iniciado em http://localhost:${port}`);
});