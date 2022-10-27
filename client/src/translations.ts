import { defaultTranslations, Translations } from "react-querybuilder";
import { Language } from "./types";

const translations: Record<Language, Partial<Translations>> = {
  en: defaultTranslations,
  es: {
    fields: {
      title: "Campos",
    },
    operators: {
      title: "Operadores",
    },
    value: {
      title: "Valor",
    },
    removeRule: {
      label: "x",
      title: "Remover regla",
    },
    removeGroup: {
      label: "x",
      title: "Remover grupo",
    },
    addRule: {
      label: "+Regla",
      title: "Agregar regla",
    },
    addGroup: {
      label: "+Grupo",
      title: "Agregar grupo",
    },
    combinators: {
      title: "Conjunciónes",
    },
    notToggle: {
      title: "Invertir este grupo",
    },
  },
};

export default translations;
