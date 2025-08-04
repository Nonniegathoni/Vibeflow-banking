import User from "./User"
import Transaction from "./Transaction"

// Define associations
User.hasMany(Transaction, {
  foreignKey: "userId",
  as: "transactions",
})

Transaction.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
})

export { User, Transaction } 