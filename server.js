const express = require("express");
var app = express();
const bodyParser = require("body-parser");
const User = require("./models/entities");
const md5 = require("md5");
const { Op } = require("sequelize");
const PORT = 8080;
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
dotenv.config();

function gerarTokenAcesso(cpf) {
  return jwt.sign({ cpf }, process.env.TOKEN_SECRET, { expiresIn: 300 });
}

function verficarJwtToken(req, res, next) {
  const token = req.headers["x-access-token"];
  if (!token)
    return res
      .status(401)
      .json({ autenticado: false, message: "Token inválido ou não fornecido" });

  jwt.verify(token, process.env.TOKEN_SECRET, (err, decoded) => {
    if (err)
      return res
        .status(500)
        .json({ autenticado: false, message: "Falha ao autenticar o token" });

    req.cpf = decoded.cpf;
    next();
  });
}

app.post("/finalizar-abertura-conta", (req, res) => {
  const cpfSemMask = req.body.cpf.split(".").join("").split("-").join("");
  const passwordEncrypted = md5(req.body.senha);
  User.create({
    name: req.body.nome,
    cpf: cpfSemMask,
    email: req.body.email,
    birthday: req.body.nascimento,
    password: passwordEncrypted,
  })
    .then(() => {
      res.redirect("/");
    })
    .catch((err) => {
      res.json({ message: `Erro ao cadastrar usuário: ${err}` });
    });
});

app.post("/autenticar", (req, res) => {
  const cpfSemMask = req.body.cpf.split(".").join("").split("-").join("");
  User.findOne({
    where: {
      [Op.and]: [{ cpf: cpfSemMask }, { password: md5(req.body.senha) }],
    },
  })
    .then((retorno) => {
      if (retorno) {
        const token = gerarTokenAcesso(cpfSemMask);
        return res.json({
          autenticado: true,
          token: token,
        });
      }
      return res.json({
        message: "Usuário ou senha inválidos",
      });
    })
    .catch((err) => {
      return res.json({ message: "Ocorreu um erro ao autenticar", erro: err });
    });
});

app.post("/logout", (req, res) => {
  res.json({ auth: false, token: null }).redirect("/");
});

app.get("/usuarios", verficarJwtToken, (req, res, next) => {
  User.findAll()
    .then((users) => {
      res.json(users);
    })
    .catch((err) => {
      res.status(500).json({ message: `Falha ao consultar usuários: ${err}` });
    });
});

app.listen(PORT, () => {
  console.log(`Servidor levantado com sucesso na porta ${PORT}`);
});
