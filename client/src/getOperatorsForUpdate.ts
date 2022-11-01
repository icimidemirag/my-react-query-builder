import { NameLabelPair } from "react-querybuilder";

const getOperatorsForUpdate = (field: string): NameLabelPair[] => {
  switch (field) {
    case "order_date":
    case "ship_date":
    case "date":
      return [
        { name: "=", label: "set to" },
        { name: "extendBy", label: "extend by (# days)" },
      ];

    case "id":
    case "latitude":
    case "longitude":
    case "order_id":
    case "units_sold":
    case "unit_price":
    case "unit_cost":
    case "total_revenue":
    case "total_cost":
    case "total_profit":
      return [
        { name: "=", label: "set to" },
        { name: "+", label: "increase by" },
        { name: "-", label: "decrease by" },
      ];

    default:
      return [{ name: "=", label: "set to" }];
  }
};

export default getOperatorsForUpdate;