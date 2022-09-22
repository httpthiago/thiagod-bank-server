const express = require("express");
const bodyParser = require("body-parser");
const User = require("./models/entities");
const md5 = require("md5");
const { Op } = require("sequelize");
var app = express();
const PORT = 8080;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post("/finalizar-abertura-conta", (req, res) => {
  const cpfSemMask = req.body.cpf.split(".").join("").split("-").join("");
  const passwordEncrypted = md5(req.body.senha);
  User.create({
    name: req.body.nome,
    cpf: cpfSemMask,
    email: req.body.email,
    birthday: req.body.nascimento,
    password: passwordEncrypted,
  }).then(() => res.redirect("/"));
});

app.post("/autenticar", (req, res) => {
  const cpfSemMask = req.body.cpf.split(".").join("").split("-").join("");
  User.findOne({
    where: {
      [Op.and]: [{ cpf: cpfSemMask }, { password: md5(req.body.senha) }],
    },
  })
    .then((retorno) => {
      if (retorno)
        return res.json({
          message: "autenticacao feita com sucesso",
        });

      return res.json({
        message: "Usuário ou senha inválidos",
      });
    })
    .catch((err) => {
      return res.json({ message: "Ocorreu um erro ao autenticar", erro: err });
    });
});

app.listen(PORT, () => {
  console.log(`Servidor levantado com sucesso na porta ${PORT}`);
});
