export interface Crop {
  id: string;
  name: string;
  nameId: string;
  growthDurationDays: [number, number];
  waterNeed: "low" | "medium" | "high";
  notes: string;
}

export const CROPS: Crop[] = [
  {
    id: "padi",
    name: "Rice",
    nameId: "Padi",
    growthDurationDays: [100, 130],
    waterNeed: "high",
    notes:
      "Needs standing water or consistent rainfall through the vegetative stage; heavy rain right before harvest risks lodging and grain loss.",
  },
  {
    id: "jagung",
    name: "Corn",
    nameId: "Jagung",
    growthDurationDays: [90, 110],
    waterNeed: "medium",
    notes:
      "Vulnerable to waterlogging in the first two weeks after planting; fairly drought-tolerant once established.",
  },
  {
    id: "cabai",
    name: "Chili",
    nameId: "Cabai",
    growthDurationDays: [75, 90],
    waterNeed: "medium",
    notes:
      "Flowers drop in heavy or prolonged rain; prefers well-drained soil and moderate humidity.",
  },
  {
    id: "kedelai",
    name: "Soybean",
    nameId: "Kedelai",
    growthDurationDays: [80, 100],
    waterNeed: "medium",
    notes:
      "Needs reliable moisture at flowering and pod-fill; excess water during ripening causes pod rot.",
  },
  {
    id: "bawang-merah",
    name: "Shallot",
    nameId: "Bawang Merah",
    growthDurationDays: [55, 70],
    waterNeed: "low",
    notes:
      "Very sensitive to waterlogging; needs a dry spell approaching harvest to avoid bulb rot.",
  },
  {
    id: "tomat",
    name: "Tomato",
    nameId: "Tomat",
    growthDurationDays: [70, 90],
    waterNeed: "medium",
    notes:
      "High humidity and heavy rain promote fungal disease; needs good drainage and airflow.",
  },
];

export function getCropById(id: string): Crop | undefined {
  return CROPS.find((crop) => crop.id === id);
}
