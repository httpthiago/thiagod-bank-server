const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize("thiagodbank", "root", "1234", {
  host: "localhost",
  dialect: "mysql",
});

const User = sequelize.define("user", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  cpf: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  money: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  }
  ,
  birthday: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

const Transaction = sequelize.define("transactions", {
  fromUser: {
    type: DataTypes.INTEGER,
  },
  toUser: {
    type: DataTypes.INTEGER
  },
  moneyTransfered: {
    type: DataTypes.DECIMAL(10, 2),
  },
  transferDate: {
    type: DataTypes.DATEONLY,
  }
})

sequelize.sync({alter: true}).then( () => {
  console.log("sincronizado");
}).catch(err => {
  console.log("erro ao sincronizar");
})

module.exports = {User, Transaction, sequelize};
