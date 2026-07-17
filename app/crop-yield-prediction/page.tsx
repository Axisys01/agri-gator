import { Sprout } from "lucide-react";
import { DashboardHeader } from "@/components/dashboard-header";
import { CropYieldPredictionForm } from "@/components/crop-yield-prediction-form";
import { CROP_OPTIONS, TRAINING_YEAR_RANGE } from "@/lib/yield-model/predict";

export default function CropYieldPredictionPage() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />

      <main className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-12">
        <div className="mx-auto max-w-2xl text-center">
          <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Sprout className="size-7" aria-hidden="true" />
          </span>
          <h1 className="mt-6 font-serif text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            Crop Yield Prediction
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Estimate expected yield (hg/ha) from rainfall, pesticide use, planting year, and crop
            type — trained on historical FAO yield data with a Random Forest model.
          </p>
        </div>

        <div className="mt-8">
          <CropYieldPredictionForm cropOptions={CROP_OPTIONS} trainingYearRange={TRAINING_YEAR_RANGE} />
        </div>
      </main>
    </div>
  );
}
