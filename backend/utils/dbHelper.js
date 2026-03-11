import fs from "fs";

export const getDB = () =>
  JSON.parse(fs.readFileSync("./db.json", "utf-8"));

export const saveDB = (data) =>
  fs.writeFileSync("./db.json", JSON.stringify(data, null, 2));