import { defaultCombinators, NameLabelPair } from "react-querybuilder";
import { Language } from "./types";

const combinators:Record<Language, NameLabelPair[]> = {
    en: defaultCombinators,
    es: [
        { name: "and", label: "Y" },
        { name: "or", label: "O" },
    ]
}

export default combinators;