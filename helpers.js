const getUserObject = (type, value, users) => {
  for (const key in users) {
    if (type === "user") {
      if (key === value) return users[key];
    }
    if (type === "email") {
      if (users[key].email === value) return users[key];
    }
  }
  return null;
}

module.exports = { getUserObject };