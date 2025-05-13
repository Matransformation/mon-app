// pages/api/side-types.js

export default function handler(req, res) {
    if (req.method === "GET") {
      return res.status(200).json([
        { value: "PROTEIN",           label: "Accompagnement protéiné" },
        { value: "BREAKFAST_PROTEIN", label: "Accompagnement protéiné petit-déj" },
        { value: "CARB",              label: "Accompagnement glucidique" },
        { value: "FAT",               label: "Accompagnement lipidique" },
        { value: "DAIRY",             label: "Produit laitier" },
        { value: "CEREAL",            label: "Accompagnement céréales" },
        { value: "FRUIT_SIDE",        label: "Accompagnement fruit" },
        { value: "VEGETABLE_SIDE",    label: "Accompagnement légume" },
      ]);
    }
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
  