const express = require('express');
const bodyParser = require('body-parser');
const { fromBase64 } = require('pdf2pic');
const fs = require('fs');
const imgToPDF = require('image-to-pdf');
const PDFDocument = require('pdfkit');
const pdftk = require('node-pdftk');

const app = express();
const port = 3000;

app.use(bodyParser.json({ limit: '50mb' }));

app.post('/', async (req, res) => {
  try {
    const { pdf } = req.body;
    const doc = new PDFDocument;

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

    // Exclui as imagens
    pages.forEach(page => {
      fs.unlinkSync(page);
    })

    //Cria um PDF para a nova página
    doc.pipe(fs.createWriteStream('novaPagina.pdf'));
    doc
    .fontSize(27)
    .text('Nova página do PDF', 100, 100);
    doc.end();

    var pdfBuffer1 = fs.readFileSync("./pdfOriginal.pdf");
    var pdfBuffer2 = fs.readFileSync("./novaPagina.pdf");

    pdftk
        .input([pdfBuffer1, pdfBuffer2])
        .output()
        .then(buf => {
            let path = 'pdfFinal.pdf';
            fs.open(path, 'w', function (err, fd) {
                fs.write(fd, buf, 0, buf.length, null, function (err) {
                    fs.close(fd, function () {
                        console.log('Hehehe');
                    });
                });
            });
        });

    res.status(200).json({ success: true, msg: 'PDF gerado com sucesso.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Erro ao gerar PDF.' });
  }
});

// Inicie o servidor
app.listen(port, () => {
  console.log(`Servidor iniciado em http://localhost:${port}`);
});
