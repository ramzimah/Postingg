import { atom } from "recoil";

const usersAtom = atom({
  key: "users",
  default: null,
});

const userAtom = atom({
  key: "user",
  default: null,
});
const tokenAtom = atom({
  key: "token",
  default: null,
});

export { usersAtom, userAtom, tokenAtom };
