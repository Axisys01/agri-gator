import "server-only";
import artifacts from "./model-artifacts.json";
import { score } from "./yield-model.js";

export interface YieldPredictionInput {
  crop: string;
  yearPlanted: number;
  rainfallMmPerYear: number;
  pesticidesTonnes: number;
  avgTempC: number;
}

export interface YieldPrediction {
  yieldHgHa: number;
  yieldTonnesPerHa: number;
}

export interface CropOption {
  id: string;
  label: string;
}

// The dataset's crop coverage (global FAO staples) only partially overlaps
// Agri-Gator's crop list (lib/crops.ts) — Padi/Jagung/Kedelai map onto
// Rice/Maize/Soybeans, the rest (chili, shallot, tomato) aren't in the
// training data, so this feature has its own crop list rather than reusing
// lib/crops.ts.
const CROP_LABELS: Record<string, string> = {
  Cassava: "Cassava",
  Maize: "Maize (Jagung)",
  Potatoes: "Potatoes",
  "Rice, paddy": "Rice, paddy (Padi)",
  Sorghum: "Sorghum",
  Soybeans: "Soybeans (Kedelai)",
  "Sweet potatoes": "Sweet potatoes",
  Wheat: "Wheat",
  Yams: "Yams",
};

export const CROP_OPTIONS: CropOption[] = (artifacts.crop_categories as string[]).map(
  (id) => ({ id, label: CROP_LABELS[id] ?? id })
);

export const TRAINING_YEAR_RANGE = { min: 1990, max: 2013 };

function buildFeatureVector(input: YieldPredictionInput): number[] {
  const [pesticidesMean, rainfallMean, tempMean] = artifacts.scaler_mean;
  const [pesticidesScale, rainfallScale, tempScale] = artifacts.scaler_scale;

  const pesticidesCube = Math.cbrt(input.pesticidesTonnes);
  const pesticidesCapped = Math.min(pesticidesCube, artifacts.pesticide_upper_whisker);
  const tempSquared = input.avgTempC ** 2;

  const scaledPesticides = (pesticidesCapped - pesticidesMean) / pesticidesScale;
  const scaledRainfall = (input.rainfallMmPerYear - rainfallMean) / rainfallScale;
  const scaledTemp = (tempSquared - tempMean) / tempScale;

  // feature_columns is ['Pesticides','Rainfall','Temperature','Year_Planted', ...one-hot crop columns]
  const cropColumns = artifacts.feature_columns.slice(4);
  const cropOneHot = cropColumns.map((col) => (col === `Crop_${input.crop}` ? 1 : 0));

  return [scaledPesticides, scaledRainfall, scaledTemp, input.yearPlanted, ...cropOneHot];
}

export function predictYield(input: YieldPredictionInput): YieldPrediction {
  const vector = buildFeatureVector(input);
  const yieldHgHa = score(vector) as number;
  return {
    yieldHgHa,
    yieldTonnesPerHa: yieldHgHa / 10000,
  };
}
